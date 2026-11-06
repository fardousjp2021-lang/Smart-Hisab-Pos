# Communication Center — Phase 1 SMS Gateway Staging Report

Status: **Design only. No code changes in this turn.**
Scope: Wire a real SMS transport behind the existing Communication Center UI
without touching Firestore business collections, accounting, offline-sync,
PWA behavior, security-rule surface for business data, or the UI theme.
Target providers (pick one at cutover, adapter supports both):

- **SSL Wireless** — preferred for Bangladesh (masking, Bangla Unicode, DLR push).
- **BulkSMSBD** — fallback / secondary route.

Phase 1 goal: staging-ready plumbing (vault, callable send, DLR intake, queue
worker skeleton, monitoring). Real cutover of the UI from the localStorage
simulation to the callable happens in Phase 2 behind `settings/sms.mode`.

---

## 1. Architecture at a glance

```
Browser (SmsCenter.tsx)
   │  (no API key ever leaves the server)
   ├── callable: sms.saveCredentials      ──► KMS encrypt ──► sms_credentials/{ws}
   ├── callable: sms.sendMessage          ──► enqueue ─────► sms_outbox/{ws}/{id}
   ├── callable: sms.testMessage          ──► direct send (no queue), audit only
   ├── callable: sms.checkBalance         ──► adapter.balance()  ──► sms_state/{ws}
   └── callable: sms.retryMessage         ──► re-enqueue with retryOf link

Cloud Scheduler (every 30 s)
   └── worker: sms.drainQueue             ──► lease N rows ──► adapter.send() ──► update row + emit audit

HTTPS webhook (public, per-workspace token)
   └── /api/public/sms/dlr/:routeToken    ──► verify sig ──► update sms_outbox row + sms_dlr_events
```

Adapter is the only surface that speaks HTTP to a provider. Everything else
speaks to the adapter through a stable interface, so swapping SSL Wireless
↔ BulkSMSBD is a one-line factory change per workspace.

---

## 2. `SmsProviderAdapter` design (API contract)

TypeScript-shaped contract (no implementation shipped this turn).

```ts
export type SmsSendInput = {
  to: string;                 // E.164, normalized upstream
  body: string;               // UTF-8; adapter decides GSM-7 vs UCS-2
  senderId: string;           // masked/registered sender
  messageId: string;          // our sms_outbox doc id (idempotency key)
  workspaceId: string;
  meta?: Record<string, string | number | boolean>;
};

export type SmsSendResult =
  | { ok: true;  providerMessageId: string; parts: number; cost?: number; acceptedAt: string }
  | { ok: false; retriable: boolean; errorCode: string; errorMessage: string; providerRaw?: unknown };

export type SmsBalanceResult =
  | { ok: true;  balance: number; currency?: string; asOf: string }
  | { ok: false; errorCode: string; errorMessage: string };

export type SmsDlrNormalized = {
  providerMessageId: string;
  status: 'delivered' | 'failed' | 'expired' | 'rejected' | 'unknown';
  deliveredAt?: string;
  reasonCode?: string;
  reasonText?: string;
  raw: unknown;                // stored verbatim in sms_dlr_events
};

export interface SmsProviderAdapter {
  readonly id: 'ssl_wireless' | 'bulksmsbd';
  send(input: SmsSendInput): Promise<SmsSendResult>;
  balance(): Promise<SmsBalanceResult>;
  parseDlr(req: { headers: Record<string,string>; body: unknown; rawBody: string }): SmsDlrNormalized | null;
  verifyDlrSignature(req: { headers: Record<string,string>; rawBody: string }, secret: string): boolean;
}

export interface SmsProviderFactory {
  create(cfg: { provider: 'ssl_wireless' | 'bulksmsbd'; apiKey: string; apiSecret?: string; senderId: string; sandbox?: boolean; }): SmsProviderAdapter;
}
```

### Provider notes

| Concern             | SSL Wireless                                     | BulkSMSBD                                        |
|---------------------|--------------------------------------------------|--------------------------------------------------|
| Send endpoint       | `POST https://smsplus.sslwireless.com/api/v3/send-sms` | `GET/POST https://bulksmsbd.net/api/smsapi`      |
| Auth                | `api_token` + `sid` in body                      | `api_key` + `senderid` in query/body             |
| Unicode             | `sms_type: TEXT | UNICODE` (explicit)            | Auto by content; force UTF-8                     |
| Cost/parts          | Returned per message                             | Not returned; compute locally                     |
| Balance             | `POST /api/v3/balance`                           | `GET /api/getBalanceApi`                          |
| DLR                 | Push webhook (JSON) with HMAC option             | Push webhook (form-encoded) + signature via shared token |
| Idempotency         | We send our `messageId` as `csms_id`             | Use our `messageId` in custom param              |
| Sandbox             | Provided                                         | Not provided; use test sender                     |

All differences are contained inside adapter implementations. The Cloud
Function layer never branches on provider id.

---

## 3. Cloud Function interfaces (callables + HTTP)

All callables require App Check + Firebase Auth + workspace-membership check
+ role check via existing `has_role`-equivalent (custom-claim `roles`).

### 3.1 `sms.saveCredentials` (callable, admin/owner only)

Request:
```json
{ "provider": "ssl_wireless", "apiKey": "…", "apiSecret": "…", "senderId": "GLIT", "sandbox": false }
```
Behavior:
- Validate shape (`provider ∈ {ssl_wireless, bulksmsbd}`, senderId ≤ 11, apiKey length).
- Encrypt `apiKey` + `apiSecret` with Cloud KMS (`projects/…/keyRings/sms/cryptoKeys/creds`).
- Write to `sms_credentials/{workspaceId}` (see schema §4).
- Emit `settings_updated` audit row.
Response: `{ ok: true, updatedAt }`. **Never** returns the ciphertext or plaintext.

### 3.2 `sms.sendMessage` (callable, role ≥ cashier subject to daily limit)

Request:
```json
{
  "recipient": { "name": "…", "phone": "+8801…", "kind": "customer|supplier|manual" },
  "body": "…",                 // pre-substituted upstream OR use templateId+vars
  "templateId": "tpl-invoice", // optional
  "variables": { "invoice_no": "…", "invoice_amount": "…" },
  "channel": "sms",
  "clientDedupKey": "uuid-v4"  // browser-generated, replay guard
}
```
Behavior:
1. Resolve credentials for `workspaceId` (must exist and be `active`).
2. Enforce quiet-hours (queue with `status: 'queued'` and `notBefore`).
3. Enforce role daily limit against `sms_outbox` counted by `sentByUid + day`.
4. Substitute variables server-side (single source of truth).
5. Compute parts + encoding; estimate cost from `sms_state.pricing`.
6. Insert `sms_outbox/{ws}/{autoId}` with `status: 'pending'`, `attempts: 0`.
7. Return `{ ok: true, messageId }`. Actual send happens in worker.

### 3.3 `sms.testMessage` (callable, admin/owner)

Skips the queue, sends via adapter synchronously, does **not** count against
daily limits, always audited as `action: 'test'`. Returns adapter result.

### 3.4 `sms.checkBalance` (callable, admin/owner/manager)

Calls `adapter.balance()`, writes `sms_state/{ws}.balance` + `asOf`, returns it.
Rate-limited to 1 call / 30 s / workspace to protect provider quota.

### 3.5 `sms.retryMessage` (callable, role ≥ manager)

Input: `{ messageId }`. Requires source row `status === 'failed'` and no
existing retry with non-failed status (server-side duplicate guard mirrors
the current UI guard). Creates a new outbox row with `retryOf` + `retryCount+1`.

### 3.6 `sms.drainQueue` (scheduled, every 30 s)

- Query `sms_outbox` collectionGroup where `status in ['pending','queued']`
  and `notBefore <= now`, ordered by `createdAt`, `limit(50)`.
- Lease each row via transaction (see §7).
- Call `adapter.send()`; update row to `sending → delivered|failed`.
- On `retriable === true`, reschedule with backoff (§8).

### 3.7 `/api/public/sms/dlr/:routeToken` (HTTPS route, unauthenticated)

Per-workspace opaque `routeToken` maps to a workspaceId server-side (never
guessable). Handler:
1. Look up workspace by token; 404 if unknown.
2. Fetch provider secret; call `adapter.verifyDlrSignature()`.
3. Call `adapter.parseDlr()`; reject 400 on null.
4. Update matching `sms_outbox` row by `providerMessageId`.
5. Append raw payload to `sms_dlr_events` (append-only) for audit.
6. Respond `200 OK` fast (< 500 ms) — providers retry on non-2xx.

---

## 4. Firestore schema

All new collections. **Zero changes to existing business collections.**

### 4.1 `sms_credentials/{workspaceId}` (server-only)

```
{
  workspaceId: string,
  provider: 'ssl_wireless' | 'bulksmsbd',
  senderId: string,
  sandbox: boolean,
  apiKeyCiphertext: bytes,       // KMS-encrypted
  apiSecretCiphertext: bytes|null,
  kmsKeyName: string,
  routeToken: string,            // random 32-byte hex, for DLR URL
  status: 'active' | 'disabled',
  createdAt, updatedAt, updatedBy
}
```
Rules: `allow read, write: if false;` — accessed only by Cloud Functions
with service-account identity. No client path ever reads plaintext.

### 4.2 `sms_outbox/{workspaceId}/messages/{messageId}`

```
{
  workspaceId, channel: 'sms',
  recipient: { name, phone, kind },
  body, parts, encoding: 'gsm7'|'ucs2',
  templateId?, templateCategory?, variables?,
  status: 'pending'|'queued'|'sending'|'delivered'|'failed'|'expired',
  notBefore: Timestamp,
  attempts: number, maxAttempts: number,
  lease: { workerId: string|null, until: Timestamp|null },
  providerMessageId?: string,
  providerErrorCode?: string, providerErrorMessage?: string,
  cost?: number,
  sentByUid, sentByName, sentByRole,
  automated: boolean, retryOf?: string, retryCount?: number,
  clientDedupKey?: string,
  createdAt, updatedAt, deliveredAt?
}
```
Rules: client `read` allowed to workspace members; client `write` denied —
all writes flow through callables.

### 4.3 `sms_dlr_events/{eventId}` (append-only audit of raw callbacks)

```
{ workspaceId, providerMessageId, receivedAt, headers, rawBody, parsed, ok, ipHash }
```
Rules: `read: workspace admin; write: false` (server-only).

### 4.4 `sms_state/{workspaceId}`

```
{ balance, balanceAsOf, pricing: { unicodePartCost, gsmPartCost, currency }, circuit: { open: bool, until: Timestamp|null, consecutiveFailures: number } }
```

### 4.5 `sms_audit/{workspaceId}/entries/{id}`

Server-authored mirror of the client audit log for the events that now
originate server-side (`send`, `retry`, `queue`, `flush`, `limit_block`,
`test`, `settings_updated`, `circuit_open`, `circuit_close`). Client log
remains for UI immediacy; server log is the source of truth.

### 4.6 Required composite indexes (`firestore.indexes.json` additions)

| Collection group           | Fields                                                                 | Purpose                              |
|----------------------------|------------------------------------------------------------------------|--------------------------------------|
| `messages` (collGroup)     | `status ASC, notBefore ASC, createdAt ASC`                             | Queue drain                          |
| `messages` (collGroup)     | `workspaceId ASC, providerMessageId ASC`                               | DLR lookup                           |
| `messages` (subcoll)       | `workspaceId ASC, sentByUid ASC, createdAt DESC`                       | Daily-limit count                    |
| `messages` (subcoll)       | `workspaceId ASC, status ASC, createdAt DESC`                          | History filters                      |
| `sms_dlr_events`           | `workspaceId ASC, receivedAt DESC`                                     | Admin DLR viewer                     |
| `sms_audit` entries        | `workspaceId ASC, ts DESC`                                             | Audit tab                            |

---

## 5. Encrypted credential flow

```
Admin UI ──(callable saveCredentials, App Check + Auth)──►
   CF: validate → KMS.encrypt(apiKey, apiSecret) → Firestore write (ciphertext only) → audit
                                                                    │
                                                                    ▼
                                                       sms_credentials/{ws}
```

Decrypt path (send / balance / DLR verify):

```
CF: fetch sms_credentials/{ws} → KMS.decrypt → build adapter in-memory →
    use for this invocation only → drop plaintext (never logged, never returned)
```

Rules:
- Plaintext exists **only in function memory**, per invocation.
- Function logs redact `apiKey`, `apiSecret`, `Authorization`, `csms_id`.
- Rotation: `saveCredentials` overwrites ciphertext + bumps `updatedAt`; old
  in-flight sends complete on the previous key because the adapter is built
  per-invocation.
- Deletion: setting `status: 'disabled'` blocks future sends without losing
  history; hard-delete only via a separate `sms.purgeCredentials` admin call.

---

## 6. DLR webhook payload structure

Public URL shape (stable, per-workspace opaque token):

```
POST https://project--{project-id}.lovable.app/api/public/sms/dlr/{routeToken}
```

Normalized internal shape (`SmsDlrNormalized`, §2) is what the handler writes;
the raw provider body is preserved in `sms_dlr_events`.

### SSL Wireless (JSON)

```
{
  "api_response_code": "200",
  "csms_id": "<our messageId>",
  "sms_status": "DELIVRD" | "FAILED" | "EXPIRED" | "REJECTED",
  "reason_code": "000",
  "sent_time": "2026-07-21T09:15:00Z",
  "recipient": "8801XXXXXXXXX"
}
```
Signature: `X-SSL-Signature: hex(hmacSha256(rawBody, sharedSecret))`.

### BulkSMSBD (form-encoded)

```
messageid=<ours>&status=Delivered|Failed|Pending&reason=…&msisdn=8801…&sent_at=…
```
Signature: shared token in `X-BSMS-Token` header, timing-safe compared.

Handler responsibilities:
- Verify signature **before** parsing.
- Enforce max body 16 KB.
- Idempotent update: only advance status forward (`sending → delivered/failed`);
  never regress `delivered → pending`.
- Always 200 on well-formed rows to prevent provider retry storms; 4xx only
  for signature/parse failure.

---

## 7. Queue leasing rules

Every queue row carries a `lease { workerId, until }`. `drainQueue` runs
every 30 s; each execution:

1. Query candidates (`status in [pending, queued]`, `notBefore <= now`,
   `lease.until == null OR lease.until < now`), limit 50.
2. For each candidate, run a Firestore transaction:
   - Re-read row; abort if lease still valid or status changed.
   - Set `status: 'sending'`, `lease: { workerId: <invocationId>, until: now + 60s }`,
     `attempts: attempts + 1`.
3. Send via adapter.
4. Transactionally clear lease and set terminal status (`delivered` / `failed`)
   or reschedule (`pending` + `notBefore = now + backoff`).

Guarantees:
- **At-least-once send.** Providers must dedupe on `csms_id` / our `messageId`.
- **No concurrent double-send.** Lease transaction is the single mutex.
- **Stuck row recovery.** A crashed worker's lease expires in ≤ 60 s and the
  next drain re-picks the row.

Fairness: query is ordered by `createdAt ASC`; a per-workspace soft cap
(`min(rowsThisRun, 20)`) prevents a noisy tenant from starving others.

---

## 8. Retry and backoff policy

- **Retriable errors** (network, 5xx, provider "temporary", rate-limit):
  exponential backoff with jitter — `delay = min(2^attempts × 5s, 15min) ± 20%`.
  `maxAttempts = 5`. On exhaustion → `status: 'failed'`, `providerErrorCode`
  preserved, UI "Retry" available (creates a fresh row with `retryOf`).
- **Non-retriable errors** (invalid number, blacklisted sender, auth error,
  4xx other than 429): immediate `status: 'failed'`, no auto-retry.
- **Quiet hours**: row stays `queued` with `notBefore = quietEnd`. `drainQueue`
  naturally picks it up when the window closes; emits `flush` audit.
- **Circuit breaker** (per workspace): 10 consecutive non-network provider
  failures → `sms_state.circuit.open = true` for 5 min, drain skips this
  workspace, emits `circuit_open` audit; first success after cool-down
  closes it.

Manual retry (from UI) is a distinct code path — always creates a **new**
row so the audit trail preserves the original failure.

---

## 9. Monitoring and audit requirements

Structured logs (JSON, workspaceId + messageId + provider on every line):

- `sms.send.accepted` / `.rejected`
- `sms.queue.leased` / `.released`
- `sms.provider.request` / `.response` (redacted; latency ms)
- `sms.dlr.received` / `.verified` / `.rejected`
- `sms.circuit.open` / `.close`

Metrics (Cloud Monitoring):

- `sms_send_latency_ms` (histogram, provider + workspace label)
- `sms_send_success_ratio` (rolling 5 min)
- `sms_queue_depth` (per workspace)
- `sms_dlr_lag_seconds` (accepted → delivered)
- `sms_credential_decrypt_failures`

Alerts (staging thresholds):

| Alert                         | Condition                                    | Severity |
|-------------------------------|----------------------------------------------|----------|
| Queue backlog                 | depth > 500 for 10 min                       | P2       |
| Send success dip              | success ratio < 90 % over 15 min             | P1       |
| DLR pipeline stalled          | 0 DLRs in 30 min while sends > 0             | P1       |
| KMS decrypt failure           | any occurrence                               | P0       |
| DLR signature failures spike  | > 20 in 5 min                                | P1       |
| Circuit breaker open          | any                                          | P2       |

Audit surface (`sms_audit` + admin UI panel, read-only): full server-authored
mirror of the client audit log, plus DLR lifecycle. CSV export via existing
UI mechanism, filtered server-side.

---

## 10. Sequence diagrams

### 10.1 Save credentials

```
Admin UI          Callable saveCredentials      KMS         Firestore
   │  {apiKey,…}         │                        │             │
   │───────────────────► │                        │             │
   │                     │ encrypt(apiKey)        │             │
   │                     │───────────────────────►│             │
   │                     │◄───ciphertext──────────│             │
   │                     │ write sms_credentials/{ws}           │
   │                     │───────────────────────────────────► │
   │◄──── ok ───────────│                                       │
```

### 10.2 Send (happy path)

```
User      sendMessage       Firestore(outbox)   Scheduler(30s)   drainQueue     Provider     DLR handler
 │  body    │                     │                   │              │             │              │
 │────────► │                     │                   │              │             │              │
 │          │ insert pending      │                   │              │             │              │
 │          │────────────────────►│                   │              │             │              │
 │◄─ msgId ─│                     │                   │              │             │              │
 │                                │◄─ tick ───────────│              │             │              │
 │                                │   lease + send    │──────────────►             │              │
 │                                │◄─ status sending ─│              │───► HTTPS ──►             │
 │                                │◄─ providerMsgId ──│◄──────ack────│             │              │
 │                                │                   │              │             │              │
 │                                │◄──────── DLR (async, minutes) ─────────────────│──────────────│
 │                                │  update status=delivered, deliveredAt          │              │
```

### 10.3 Retry (manual)

```
User          retryMessage        Firestore
 │  msgId=X       │                    │
 │──────────────► │ read X (status=failed, no active retry)
 │                │ insert Y {retryOf: X, retryCount: X.retryCount+1, status:pending}
 │◄──── ok ──────│
     (worker picks up Y as in 10.2)
```

### 10.4 DLR intake

```
Provider  ──POST /api/public/sms/dlr/:token──►  handler
                                                  │
                                                  │ lookup ws by token
                                                  │ fetch credentials → verifySig(rawBody)
                                                  │ parseDlr → normalized
                                                  │ tx: update sms_outbox by providerMessageId
                                                  │ append sms_dlr_events
                                                  ▼
                                                200 OK  (< 500 ms)
```

---

## 11. Deployment checklist (staging)

Pre-flight
- [ ] Cloud KMS keyring `sms` + key `creds` provisioned; CF service account has `roles/cloudkms.cryptoKeyEncrypterDecrypter`.
- [ ] Provider sandbox account for SSL Wireless (and BulkSMSBD test sender) available.
- [ ] `sms_credentials` rules deny all client reads/writes; verified by rules test.
- [ ] `sms_outbox` client rules allow read-only to workspace members; writes denied.
- [ ] Composite indexes from §4.6 added to `firestore.indexes.json` and deployed.
- [ ] Route token generator uses 32 bytes CSPRNG; stored only in `sms_credentials`.

Callables & routes
- [ ] `sms.saveCredentials`, `sms.sendMessage`, `sms.testMessage`, `sms.checkBalance`, `sms.retryMessage` deployed with App Check + Auth + role checks.
- [ ] Scheduled `sms.drainQueue` set to every 30 s (staging: every 60 s until soak passes).
- [ ] `/api/public/sms/dlr/:routeToken` deployed; body-size limit 16 KB; timeout 3 s.

Observability
- [ ] Structured logging fields verified; redaction test for `apiKey`/`apiSecret`.
- [ ] Metrics dashboards created; alert policies from §9 wired to staging channel.
- [ ] Synthetic canary: hourly `sms.testMessage` to a test MSISDN in sandbox.

UI wiring (Phase 2 — do NOT flip yet)
- [ ] `settings/sms.mode = 'simulation'` in every workspace on deploy.
- [ ] Admin UI shows "Live mode disabled" chip until mode flipped.
- [ ] Provider dropdown limited to `ssl_wireless | bulksmsbd`.

Cutover gate
- [ ] 48 h staging soak with ≥ 500 test sends, success ratio ≥ 98 %, no P0/P1 alerts.
- [ ] DLR round-trip median < 60 s on sandbox.
- [ ] Rules test suite green (`e2e/firestore-rules.spec.ts` extended for new collections).

---

## 12. Rollback plan

Rollback is per-workspace and instant; no schema drop required.

1. **Flip mode flag.** Set `settings/sms.mode = 'simulation'` for the affected
   workspace(s). UI immediately reverts to the current localStorage simulator;
   no queued rows are lost — they stay in `sms_outbox` with `status: 'queued'`.
2. **Pause worker.** Disable the `sms.drainQueue` Cloud Scheduler job. In-flight
   leases expire in ≤ 60 s; no rows are lost, none double-sent.
3. **Freeze credentials.** Set `sms_credentials/{ws}.status = 'disabled'` to
   block any callable that bypasses the mode flag.
4. **Stop DLR intake (optional).** If provider webhook is misbehaving, rotate
   the workspace `routeToken` — the old URL 404s within one call; no data loss
   because DLRs are advisory (status advances forward only).
5. **Data preservation.** `sms_outbox`, `sms_dlr_events`, and `sms_audit` are
   append-only from the client's perspective; nothing is deleted on rollback.
   Re-enabling is the reverse sequence.
6. **Full teardown (last resort).** Undeploy callables + scheduled job +
   webhook route; delete indexes from §4.6. Collections may remain (empty
   or historical) with no runtime cost. UI is unaffected because it still
   reads/writes its own `comm.v2.*` localStorage keys under simulation mode.

Rollback SLO: **< 5 minutes** from decision to simulation-only for a single
workspace; **< 15 minutes** globally.

---

## 13. Non-goals for Phase 1

- No WhatsApp / Email / Push activation.
- No changes to accounting, offline sync, PWA behavior, or existing business
  Firestore collections.
- No UI flip to live mode (that is Phase 2, gated by `settings/sms.mode`).
- No multi-provider fallback within a single workspace (Phase 4 dispatcher).
- No end-user-visible pricing/billing surface for SMS credits — balances remain
  informational and provider-owned.
