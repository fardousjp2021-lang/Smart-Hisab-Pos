# Communication Center — Secure Multi-Tenant SMS Gateway Architecture

Companion to `docs/communication-center-sms-integration-audit.md`.
This document is **design only**. No code is changed.

Stack context (already in the project):
- Frontend: React + TanStack Router (`/sms`).
- Backend: **Firebase** (Firestore + Auth + App Check + Cloud Functions).
- Multi-tenancy: `workspaceId` custom claim on the auth token; every write
  scoped via `scopedQuery()` and Phase-2 Firestore rules.
- Offline sync: `salesSyncQueue` pattern with workspace-scoped keys.

Business model constraints (non-negotiable):
1. Each workspace owns its own SMS provider account (BYO — Bring Your Own).
2. Each workspace stores its own credentials.
3. SaaS operator **never** sees, holds, or is billed for customer SMS balance.
4. No shared "platform" SMS account, no aggregated billing, no proxy account.

---

## 1. Recommended architecture (high level)

```
Browser (SmsCenter.tsx)
  │  1. compose / retry / test  →  callable Fn
  │  2. save credentials         →  callable Fn (write-only path)
  │  3. read history / status    →  Firestore listener (scoped)
  ▼
Cloud Functions (region-pinned, App-Check-required)
  ├── sms.saveProviderCredentials   ← encrypts + writes to /secure
  ├── sms.sendMessage               ← enqueue → provider adapter
  ├── sms.sendTest                  ← same path, flagged test
  ├── sms.retryMessage              ← rehydrate row, re-enqueue
  ├── sms.checkBalance              ← provider adapter .getBalance()
  ├── sms.processQueue (scheduled)  ← pulls queued rows, honors quiet hours
  └── sms.dlrWebhook (HTTPS)        ← public route; verifies signature
        │
        ▼
Provider Adapter Layer  (send / getBalance / verifyCredentials / parseDLR)
   ├── GatewayApiAdapter
   ├── TwilioAdapter
   ├── VonageAdapter
   ├── MobireachAdapter          (BD local)
   ├── SslWirelessAdapter        (BD local)
   └── GenericHttpAdapter        (user-defined URL + template)
        │
        ▼
External SMS provider (per workspace credentials)
```

Key principles:
- **Zero secrets in the browser.** The API key never travels to the
  client after it is saved; the UI displays only a masked hint
  (`gw_live_****abcd`) sourced from a non-secret metadata doc.
- **Adapter pattern** so a workspace picks a provider and swaps later
  without app changes.
- **Provider-agnostic queue** so quiet hours, retries, rate limits and
  daily-limit accounting run identically regardless of provider.
- **DLR-driven status.** Message status is authoritative from the
  provider webhook, not from a client timer.
- **Per-workspace isolation at every layer**: Firestore path, Cloud
  Function claim check, encryption AAD, DLR routing token.

---

## 2. Where SMS API keys live (and where they do NOT)

**Rejected locations**
- ❌ `localStorage` — exfiltrated by any XSS, shared devices, non-synced.
  Current v1.1 uses this; it must be removed.
- ❌ Regular Firestore document readable by the workspace owner.
  Admins seeing the raw key still enables key theft when an admin
  device is compromised, and screenshots/support tickets leak it.
- ❌ Firebase Remote Config or environment variable — those are global,
  not per-workspace.

**Chosen location: encrypted at rest in a locked-down Firestore path**

```
/workspaces/{workspaceId}/secure/sms
   provider:        "gatewayapi" | "twilio" | ...
   senderId:        "RONI-SMS"
   ciphertext:      base64(iv | tag | AES-256-GCM(apiKey, key=KMS_DEK))
   keyVersion:      1
   maskedHint:      "gw_live_****abcd"     ← safe to mirror to UI
   updatedAt, updatedBy, updatedByRole
```

- Firestore rules on `/workspaces/{ws}/secure/**`:
  `allow read: if false; allow write: if false;` — **no client access, ever.**
  All reads and writes go through Cloud Functions running as the service
  account.
- Encryption key: **Google Cloud KMS** (`projects/.../keyRings/sms/cryptoKeys/dek`).
  Data-encryption-key wrap: the Cloud Function calls
  `kms.encrypt(plaintext, additionalAuthenticatedData=workspaceId)` so a
  ciphertext for workspace A cannot be decrypted while claiming
  workspace B (AAD binding prevents cross-tenant swap attacks).
- Public metadata (provider name, sender id, masked hint, balance
  snapshot, last-verified-at) lives in a **separate** doc
  `/workspaces/{workspaceId}/settings/sms` that clients CAN read under
  normal `workspaceId`-claim rules. This is what the Settings tab renders.

Why this beats "just use a Cloud Secret Manager entry per workspace":
Secret Manager is fine but caps at ~10k secrets/project and adds latency
per invocation. Firestore + envelope encryption via KMS scales linearly
per workspace, keeps the audit trail with the tenant, and lets DR/backups
use the same tooling as the rest of the app.

---

## 3. Required Firestore collections

New collections (all workspace-scoped, all guarded by `workspaceId` claim):

| Path | Purpose | Client read | Client write |
|------|---------|:-----------:|:------------:|
| `/workspaces/{ws}/secure/sms` | Encrypted credentials + KMS envelope | ❌ | ❌ |
| `/workspaces/{ws}/settings/sms` | Provider name, sender id, masked hint, balance snapshot, quiet hours, daily limits | ✅ | via Fn only |
| `/workspaces/{ws}/messages/{msgId}` | One row per outbound message; status lifecycle | ✅ | via Fn only |
| `/workspaces/{ws}/messages/{msgId}/events/{eventId}` | Immutable status events (queued/sent/delivered/failed) with provider payload | ✅ | ❌ (Fn only) |
| `/workspaces/{ws}/smsQueue/{jobId}` | Server-side pending jobs (queued, sending, retrying) | ❌ | ❌ (Fn only) |
| `/workspaces/{ws}/templates/{tplId}` | Templates (already exist client-side; promote to Firestore for cross-device) | ✅ | ✅ (role-gated) |
| `/workspaces/{ws}/automation/sms` | Toggles for auto-invoice, auto-due, etc. | ✅ | ✅ (admin) |
| `/workspaces/{ws}/auditLog/{id}` | Send/retry/settings/template events | ✅ (admin) | ❌ (Fn only) |
| `/dlrRoutes/{routeToken}` | Maps a per-workspace opaque webhook token → `workspaceId` | ❌ | ❌ |

`/messages/{msgId}` document shape:

```
id, ts, workspaceId, channel: "sms",
recipientName, recipientPhone (E.164),
templateId?, templateCategory?, body, parts, encoding: "gsm7"|"ucs2",
providerId (adapter key), providerMessageId (set after send),
status: "queued"|"sending"|"sent"|"delivered"|"failed"|"expired",
statusReason?,           // provider error code + human string
cost, currency,
sentByUid, sentByName, sentByRole,
retryOf?, retryCount, maxRetries,
scheduledFor?, quietHoldUntil?,
automated: boolean, sourceEvent?: "invoice.created" | ...
createdAt, updatedAt
```

`/settings/sms` public mirror:

```
provider, senderId, maskedApiKey,
balance: { value, currency, checkedAt, source: "provider"|"unknown" },
lastTestAt, lastTestStatus,
quietHours: { enabled, start, end, tz },
dailyLimits: { cashier, manager, admin },
credentialsUpdatedAt, credentialsHealthy: boolean
```

Firestore rules (sketch, not code):
- `secure/**`: deny all client reads/writes.
- `settings/**`, `messages/**`, `templates/**`, `automation/**`,
  `auditLog/**`: `request.auth.token.workspaceId == wsId` **and**
  Phase-2 role check. Writes to `settings/**` / `messages/**` /
  `auditLog/**` denied for all clients — Cloud Functions perform them
  with the service account.

---

## 4. Required Cloud Functions (server functions)

All are **callable functions** (Firebase `onCall`) except the DLR webhook.
All require **Firebase Auth** + **App Check**. All verify the caller's
`workspaceId` claim matches the target workspace before doing anything.
The `workspaceId` used for reads/writes is taken from the **verified
claim**, never from client-supplied input — this is the SMS analog of the
`authenticated-owner-rls` rule.

| Function | Trigger | Purpose | Auth |
|----------|---------|---------|------|
| `sms.saveProviderCredentials` | `onCall` | Validate + KMS-encrypt + write `/secure/sms`; call `verifyCredentials()` before saving | admin only |
| `sms.rotateCredentials` | `onCall` | Same, but requires re-auth (recent login) | admin only |
| `sms.deleteCredentials` | `onCall` | Wipe `/secure/sms`, mark settings unhealthy | admin only |
| `sms.sendMessage` | `onCall` | Validate → enforce daily limit → check quiet hours → write `messages/*` (`queued`) + `smsQueue/*` | send permission |
| `sms.sendTest` | `onCall` | Same path, `test: true`, does not consume workspace daily limit but does consume provider balance | admin only |
| `sms.retryMessage` | `onCall` | Rehydrate failed row, dedupe by `retryOf`, re-enqueue | send permission |
| `sms.checkBalance` | `onCall` | Adapter `getBalance()`, cache to `settings/sms.balance` | manager+ |
| `sms.processQueue` | `onSchedule` every 1 min | Pull `queued` jobs whose `scheduledFor <= now` and not quiet-held; send via adapter; write DLR-pending state | service |
| `sms.dlrWebhook` | HTTPS (`/api/public/sms/dlr/:routeToken`) | Look up workspace via `dlrRoutes/{routeToken}`, verify provider signature, update `messages/*.status` + append `events/*` | signature |
| `sms.onAutomationEvent` | Firestore triggers on invoices/payments/warranty | Consult `automation/sms`; enqueue templated message | service |
| `sms.exportAudit` | `onCall` | Filter + return CSV of `auditLog` (short-lived signed URL) | admin |

Why callables and not TanStack server functions: this project already
runs on Firebase; DLR webhooks, scheduled queue processing, and Firestore
triggers all live naturally in Cloud Functions and share the App Check
enforcement path. Do **not** move only some of these to another runtime.

The DLR endpoint is the only public HTTP surface. It uses an opaque
per-workspace `routeToken` in the URL so the workspace ID isn't
guessable, and it verifies the provider's HMAC signature (raw body,
timing-safe compare) before touching Firestore.

---

## 5. Provider adapter architecture

A single TypeScript interface implemented once per provider, loaded by
the callable functions based on `secure/sms.provider`:

```
interface SmsProviderAdapter {
  id: "gatewayapi" | "twilio" | "vonage" | "mobireach" | "sslwireless" | "generic_http";
  send(input: { to, from, body, encoding, parts, workspaceId, msgId, dlrCallback }):
    Promise<{ providerMessageId, acceptedAt } | ProviderError>;
  getBalance(): Promise<{ value, currency } | ProviderError>;
  verifyCredentials(): Promise<{ ok: true } | ProviderError>;
  parseDlr(request: { headers, rawBody }):
    { providerMessageId, status, reason?, deliveredAt? };
  verifyDlrSignature(request): boolean;
}
```

- Adapters live in `functions/src/sms/adapters/*.ts`; the callable
  imports them lazily so cold-start cost is only paid for the active
  provider.
- Errors normalize to `{ code, retryable, providerRaw }` so the queue
  processor knows whether to retry (5xx, network) or fail permanently
  (invalid number, insufficient credit, blocked sender).
- `dlrCallback` in `send()` is
  `https://<region>-<project>.cloudfunctions.net/smsDlrWebhook/<routeToken>`
  — the adapter maps it to whatever field the provider expects
  (`callback_url`, `StatusCallback`, etc.).

Adding a new provider is a one-file change plus a registry entry; no UI
plumbing changes because the Settings tab renders provider-declared
config fields from a small manifest each adapter exports.

---

## 6. Delivery report (DLR) handling

Flow:
1. Provider POSTs to `https://.../smsDlrWebhook/{routeToken}` with a
   signed body.
2. Handler reads raw body **before** any middleware parses it (needed
   for signature verification).
3. Handler looks up `dlrRoutes/{routeToken}` → `workspaceId`,
   `providerId`.
4. Adapter `verifyDlrSignature(req)` — reject 401 on mismatch.
5. Adapter `parseDlr(req)` → `{ providerMessageId, status, reason }`.
6. Transactional Firestore update:
   - `messages/{msgId}.status = <mapped>` (only forward transitions;
     never regress `delivered → sent`).
   - Append `messages/{msgId}/events/{eventId}` with the raw payload.
   - If `failed` and `retryCount < maxRetries` and error is retryable,
     re-enqueue with exponential backoff.
7. Emit audit log entry (`action: "dlr"`).

Idempotency: DLRs are deduplicated by
`(providerMessageId, status, providerTimestamp)`; duplicates are
acknowledged with 200 but skip the write. Providers often retry DLRs.

---

## 7. Balance check flow

- User clicks "Check balance" (manager+).
- Callable `sms.checkBalance` verifies claim, loads secure creds,
  calls adapter `getBalance()`.
- Result written to `settings/sms.balance = { value, currency, checkedAt, source: "provider" }`.
- UI listens to `settings/sms` and renders live.
- If adapter returns `ProviderError`, mark
  `balance.source = "unknown"` and surface the error string; do not
  overwrite the last known good value.
- Rate-limited to 1 call per 30 s per workspace (Firestore counter or
  in-memory token bucket per instance + Firestore fallback).

The SaaS owner never sees balance: it lives under `/workspaces/{ws}/...`
which is scoped by claim, and admin dashboards for the SaaS operator
must exclude `settings/sms.balance` from any aggregate view.

---

## 8. Test SMS flow

- Admin enters test phone → callable `sms.sendTest`.
- Server enforces admin role, App Check, workspace match.
- Writes a `messages/*` row with `test: true` and pushes through the
  same queue + adapter path as production sends.
- `test: true` bypasses per-role daily limits but **does** consume
  provider balance (the provider will bill regardless — this is
  transparent to the operator).
- Result mirrored to `settings/sms.lastTest{At,Status}` for the UI.
- Audit log entry `action: "test"` includes truncated recipient and
  provider response code.

---

## 9. Retry flow

- Client calls `sms.retryMessage({ msgId })`.
- Server:
  1. Load original `messages/{msgId}`; must be `failed`, must belong to
     the caller's workspace.
  2. Dedup: reject if any `messages/*` where
     `retryOf == msgId AND status != failed` exists.
  3. Enforce daily limit for `sentByRole` of the retrying user (not the
     original sender).
  4. Write new `messages/*` with `retryOf`, `retryCount+1`, status
     `queued`.
  5. Enqueue in `smsQueue/*`, honoring quiet hours (may set
     `quietHoldUntil`).
- The queue processor is also the natural place for **automatic**
  retries on retryable provider errors, using exponential backoff
  (`30s, 2m, 10m, 1h`, cap `maxRetries=4`). Manual retry from the UI
  resets the backoff.

---

## 10. Queue processing

- `smsQueue/{jobId}` rows: `{ msgId, workspaceId, providerId, attempts,
  nextRunAt, leaseUntil, status: "ready"|"leased"|"done"|"dead" }`.
- Scheduled function every 60 s (Cloud Scheduler → Pub/Sub → Fn):
  - `where status == "ready" and nextRunAt <= now` limit N.
  - Atomically claim each job: transaction sets `leased`,
    `leaseUntil = now + 2min`, so parallel invocations don't
    double-send.
  - For each job: load `messages/{msgId}`, load secure creds, check
    quiet-hours window for that workspace, then call `adapter.send()`.
  - Success: `messages.status = "sent"`, `providerMessageId` recorded,
    job `done`. DLR will later flip to `delivered` / `failed`.
  - Retryable error: `attempts+=1`, `nextRunAt = backoff(attempts)`,
    `status = "ready"`.
  - Non-retryable or attempts exhausted: `messages.status = "failed"`,
    job `dead`.
- Fair scheduling: pull round-robin per workspace so one noisy tenant
  doesn't starve others.
- Circuit breaker per (workspace, provider): after N consecutive
  provider-side failures, pause that workspace's queue for 5 min and
  flag `settings/sms.credentialsHealthy = false` so the UI can prompt
  re-verification.

---

## 11. Security & permission model

Layered controls:

1. **Transport** — every callable requires Firebase Auth + Firebase
   App Check (already enabled in the project per
   `docs/app-check-setup.md`). DLR webhook requires HMAC.
2. **Identity** — `workspaceId` comes from the verified custom claim,
   **never** from function input. Same rule as
   `authenticated-owner-rls`: ownership is derived server-side.
3. **Authorization** — role gate:
   - `admin` / `owner` / `super_admin`: full (credentials, settings,
     send, retry, templates, automation, audit export).
   - `manager`: send, retry, templates, checkBalance.
   - `cashier`: send (invoice-category templates only), no settings.
   - Others: read-only.
4. **Rate limiting** — per (workspace, user) counters:
   - `sms.sendMessage`: cashier 100/day, manager 500/day,
     admin unlimited (mirrors current v1.1 client-side limits, now
     server-authoritative).
   - `sms.checkBalance`: 1 / 30s.
   - `sms.saveProviderCredentials`: 5 / hour.
5. **Encryption** — KMS-wrapped ciphertext with workspaceId as AAD.
   Rotate KMS key annually; `keyVersion` on each doc supports
   re-encryption without service disruption.
6. **Secret hygiene** —
   - Plaintext key only lives in Cloud Function memory during a
     `send()` call.
   - Never logged. Adapter error handlers strip `authorization` and
     `apikey` headers before writing to structured logs.
   - Support tools never render the raw key; only `maskedHint`.
7. **App Check + reCAPTCHA Enterprise** on the credential-save call
   blocks scripted brute-force save attempts from stolen sessions.
8. **DLR trust** — signature verification is mandatory; also
   allow-list source IPs where the provider publishes them.
9. **Audit log** for every credential save, delete, rotate, test send,
   automation toggle, and manual send/retry, including actor UID, IP
   hash, and user agent hash.
10. **SaaS owner separation** —
    - The SaaS operator has **no read access** to any
      `/workspaces/{ws}/secure/**`, `/settings/sms.balance`, or
      `/messages/**` document. This is enforced by rules AND by the
      fact that internal admin tooling should query only the
      `/system/**` and `/billing/**` namespaces.
    - There is no code path that lists customer API keys, plaintext or
      otherwise. Auditors can be shown the rules + Cloud Function
      source to prove this.
    - Because keys never leave the tenant boundary, the SaaS operator
      is not billed for and cannot be held liable for a tenant's SMS
      spend.

---

## 12. Multi-tenant isolation

- **Storage**: every collection above is nested under
  `/workspaces/{workspaceId}/...`. No shared collection.
- **Compute**: every Cloud Function derives `workspaceId` from the
  verified auth token; input `workspaceId` is ignored if it doesn't
  match.
- **Crypto**: KMS AAD = workspaceId prevents cross-tenant ciphertext
  reuse even if a Firestore row is copied.
- **Webhook**: `routeToken` is opaque and workspace-specific; a leaked
  token for tenant A cannot mutate tenant B.
- **Cache/CDN**: Cloud Function responses set
  `Cache-Control: private, no-store`.
- **Backups**: exports partition by `workspaceId`; per-tenant purge
  supported for GDPR/right-to-erasure.
- **Region pinning**: keep functions + KMS + Firestore in the same
  region (e.g., `asia-south1`) to avoid inter-region key access
  latency and to satisfy data-residency needs of BD/IN customers.

---

## 13. Security risks & mitigations

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | Key exfiltration via XSS in Settings tab | Tenant SMS bill hijack | Never send plaintext key to client; UI only sees `maskedHint`. CSP + Trusted Types. |
| R2 | Admin device compromise leaks key | Same as R1 | Require re-auth for `rotateCredentials`; KMS + audit log detects unusual saves; support flow can rotate without exposing plaintext. |
| R3 | DLR webhook spoofing marks messages "delivered" fraudulently | Reporting & billing lies | Mandatory adapter signature verification + IP allow-list + `providerMessageId` must exist in that workspace. |
| R4 | Cross-tenant ciphertext swap | Read another tenant's key | KMS AAD binds ciphertext to `workspaceId`; decrypt fails on mismatch. |
| R5 | Runaway retry loop bills tenant | Financial damage | Server-side `maxRetries=4`, per-workspace circuit breaker, alert on retry rate. |
| R6 | SMS pumping / traffic pumping | Fraud | Recipient-country allow-list per workspace, velocity limits (msgs/min/recipient), block premium ranges by default. See Twilio SMS-pumping guidance. |
| R7 | Insider (SaaS operator) reads customer key | Trust violation | Rules deny secure/**; Cloud Function code review; KMS key IAM restricts decrypt to the SMS function's service account only. |
| R8 | Stale claim after workspace switch | Send billed to wrong tenant | Force-refresh token on workspace switch (already handled in Phase 3); server re-verifies claim on every call. |
| R9 | Provider outage cascades to app | Users blocked from sending | Circuit breaker + `credentialsHealthy=false` surfaces a banner; queue holds jobs, doesn't drop them. |
| R10 | Log leakage of message body (PII) | Privacy | Structured logs redact body beyond first 20 chars; full body lives only in Firestore under tenant rules. |
| R11 | Test-message endpoint used to fingerprint numbers | Abuse | Admin-only, rate-limited, logged. |
| R12 | Automation storm on data import | Bill spike | Automation triggers debounce and check "bulk import in progress" flag; hard cap per hour. |

---

## 14. Migration plan (from current v1.1 localStorage simulation)

Six phases, each independently shippable and reversible. **No accounting
logic, UI theme, sidebar routes, or Firestore collections outside the
new SMS namespace are touched.**

### Phase A — Backend scaffolding (no user impact)
1. Provision KMS key ring `sms` + key `dek`.
2. Add Firestore rules for the new paths above; deploy in **audit mode**
   (log-only) first, promote to enforce after 24 h clean logs.
3. Deploy Cloud Functions as no-op stubs returning "not implemented".
4. Add `dlrRoutes` collection and a mint-token helper.

### Phase B — Credentials vault
1. Ship `sms.saveProviderCredentials`, `rotate`, `delete`.
2. Add a Settings sub-panel that writes via the callable and reads
   `settings/sms` (masked). Leave the legacy localStorage inputs in
   place but disabled with a "Move to secure storage" banner.
3. On first admin save, migrate the workspace's local
   `provider.apiKey` into the vault, then wipe it from localStorage.
4. Ship `verifyCredentials()` per adapter; block save if verification
   fails.

### Phase C — Real send path (one provider)
1. Implement `GatewayApiAdapter.send` (already the app's default
   default provider label; the workspace-level Lovable connector doc
   confirms the endpoint shape).
2. Ship `sms.sendMessage` + `smsQueue` + `sms.processQueue`.
3. Flag `settings/sms.mode = "live" | "simulated"`; default new saves
   to `live` after successful `verifyCredentials`, keep existing
   workspaces on `simulated` until an admin toggles.
4. UI `sendMessage()` calls callable when `mode==="live"`, keeps the
   local simulation when `simulated`. This preserves offline demo
   behavior for workspaces that haven't onboarded a provider.

### Phase D — DLR + real status
1. Deploy `sms.dlrWebhook`; provision per-workspace `routeToken` on
   first successful save.
2. Register the DLR URL with each adapter's `send()` call.
3. Retire the `setTimeout → delivered` simulator once `mode==="live"`.
4. Retry logic switches to server-side; UI "Retry" button calls
   `sms.retryMessage`.

### Phase E — Balance, test, automation
1. Ship `sms.checkBalance`; replace local counter for `live` mode.
2. Ship `sms.sendTest`.
3. Wire `sms.onAutomationEvent` to invoice/payment/warranty triggers;
   automation toggles in `automation/sms` become authoritative.
4. Add per-role daily-limit enforcement server-side (settings mirrored
   from `settings/sms.dailyLimits`); client keeps its warning UI.

### Phase F — Cleanup
1. Remove local `provider.apiKey` field from `MessageHistoryRow` /
   `ProviderSettings`; keep `provider`, `senderId`, `maskedHint`,
   `balance` as read-only mirrors.
2. Delete legacy `comm.v2.<ws>.provider.apiKey` key on next app boot.
3. Migrate `history` and `auditLog` from localStorage to Firestore
   collections above (write-behind for offline, mirroring the existing
   `salesSyncQueue` pattern; **no change** to that queue's mechanics).
4. Update `docs/communication-center-architecture.md` and
   `communication-center-v1.1-enhancements.md` to point at the
   Firestore-backed model.
5. Run `scripts/audit-workspace-claims.mjs`-style verifier against the
   new SMS collections.

Roll-back: each phase is behind `settings/sms.mode`. Flipping any
workspace back to `simulated` restores exact current behavior without a
redeploy.

---

## 15. What deliberately stays unchanged

- No new routes, sidebar entries, or menus (the report requested none).
- No changes to `salesSyncQueue`, `workspaceCache`, accounting, or
  Firestore rules for existing collections.
- No changes to the automation-rule toggle UI or role matrix already
  shipped in v1.1.
- No introduction of a "platform" SMS account; BYO stays the only
  supported model.
- No plaintext credential is ever transmitted to or displayed in the
  browser after initial entry.

---

_No source files were modified. This is an architecture proposal only._
