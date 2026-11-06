# Communication Center — SMS Provider Integration Audit

Scope: `src/pos-app/components/SmsCenter.tsx` (1,719 lines) and the `/sms` route.
Method: static read of the component, its storage keys, and a repo-wide grep for
`fetch(`, `http`, `gatewayapi`, `sendSms`, provider SDKs, edge/server functions,
and API-key usage. **No code was modified.**

## TL;DR

The Communication Center is a **fully simulated** messaging surface. There is
**no real SMS API integration anywhere in the codebase** — no HTTP call, no
provider SDK, no server function, no webhook, no delivery-status callback.
Every "send", "retry", "test", and "balance check" mutates `localStorage`
only. It is **not production-ready** for real SMS sending.

---

## 1. Feature status matrix

| # | Feature                       | Status                | Evidence |
|---|-------------------------------|-----------------------|----------|
| 1 | SMS API integration           | ❌ **UI-only**        | Zero `fetch(`/`http` calls in `SmsCenter.tsx`; no `sendSms` server function; no edge/API route under `src/routes/api/`. |
| 2 | HTTP endpoints for sending    | ❌ **None**           | `sendMessage()` uses `setTimeout(..., 800)` to flip status `pending → sending → delivered`. Lines 654–662. |
| 3 | API key storage               | ⚠️ **Insecure, client-only** | Stored plaintext in `localStorage` under `comm.v2.<ws>.provider.apiKey` (line 409). Never transmitted anywhere. Not in Lovable Cloud secrets, not in Firestore, not in an edge function env var. |
| 4 | Sender ID support             | ⚠️ **UI-only field**  | `provider.senderId` (≤11 chars) captured in settings (lines 1385–1388) but never included in any outbound request — because there is no outbound request. |
| 5 | Balance check                 | ❌ **Fake counter**   | `checkBalance()` just toasts the local `provider.balance` value (line 752). Balance decrements are purely local: `balance - parts` on each simulated send (lines 649, 700). No provider API call. |
| 6 | Test SMS                      | ❌ **Toast only**     | `sendTestMessage()` shows "Test message queued" and returns (line 760). No network activity. |
| 7 | Delivery status handling      | ❌ **Hard-coded**     | Status always transitions to `delivered` on a timer. No `failed` path in the send flow, no DLR/webhook handler, no provider callback route. |
| 8 | Retry implementation          | ✅ **Logic present, but simulated** | `retryMessage()` has real guards — permission check, duplicate-retry guard (`retryOf`), daily-limit check, `retryCount` bookkeeping, audit entry (lines 667–712) — but the actual "resend" is the same `setTimeout → delivered` simulation. Logic is production-shaped; transport is not. |
| 9 | Provider abstraction layer    | ⚠️ **Partial (channel registry only)** | `CHANNELS` registry abstracts channel metadata (SMS/WhatsApp/Email/Push, cost, tone, active flag) and `ProviderSettings` holds a single provider name string. There is **no** `Provider` interface, no `sendSms(row)` / `sendWhatsapp(row)` dispatcher, no adapter modules. The roadmap doc (`docs/communication-center-architecture.md` §v1.1) proposes `sendSms(row)` / `sendWhatsapp(row)` but they do not exist. |

Cross-check: `rg` over `src/` for `fetch(`, `gatewayapi`, `sendSms`, `/sms` HTTP
endpoints, and any Cloud Function / server function under `src/routes/api/`
returns **zero** SMS-sending code paths.

---

## 2. Fully implemented (works today)

- Channel registry (`CHANNELS`) with SMS active, WhatsApp/Email/Push disabled.
- Message composer with GSM-7 vs UCS-2 (Bangla) detection, parts + cost math.
- Template CRUD with variable substitution (8 tokens + legacy aliases).
- Workspace-scoped `localStorage` persistence (`comm.v2.<ws>.*`) with v1 migration.
- Message history table with filters, search, status pills, CSV-friendly rows.
- Role-based permissions (admin / manager / cashier / other) enforced on send, templates, automation, settings.
- Retry bookkeeping (dedupe via `retryOf`, `retryCount`).
- Daily per-role limits (100/500/unlimited) with warning + blocking banner.
- Quiet-hours window with a 30 s scanner that promotes locally queued rows.
- Audit log (append-only, capped 1,000 rows, filters + CSV export).
- Message Queue Monitor and Activity Widget derived from local history.

## 3. UI-only placeholders (no backing transport)

- **Send** (`sendMessage`) — mutates local state; no network.
- **Retry** (`retryMessage`) — logic complete; transport simulated.
- **Test message** (`sendTestMessage`) — toast only.
- **Balance check** (`checkBalance`) — reads local counter.
- **Balance value itself** — never fetched from a provider; decrements locally.
- **Sender ID** — captured but never sent.
- **API key** — captured but never used to authenticate a request.
- **Delivery status** — always `delivered` via `setTimeout`; no DLR intake.
- **Automation rules** (auto-invoice / auto-due / auto-payment / auto-warranty)
  — toggles persist; there is no dispatcher wired to domain events.
- **WhatsApp / Email / Push** cards — explicitly marked "coming soon" and
  disabled in the registry.

## 4. Providers currently supported

**None operationally.** The `provider.provider` field defaults to the string
`"GatewayAPI"` (line 257) and is a free-text input (line 1377). It's a label,
not an adapter — no code branches on it, no request is ever built for
GatewayAPI or any other provider.

Note: The Lovable workspace has a **GatewayAPI connector available**
(see `<gatewayapi>` in the environment knowledge — `LOVABLE_API_KEY` +
`GATEWAYAPI_API_KEY` via `https://connector-gateway.lovable.dev/gatewayapi`).
It is **not wired into this app**. Bringing it online would require a server
function that reads those env vars and posts to `/mobile/single`.

## 5. Per-workspace / per-store API key

Technically **yes for storage, no for use**:

- Storage is workspace-scoped: `comm.v2.<workspaceId>.provider.apiKey`, so each
  store has its own slot and stores are isolated.
- But the key is only in browser `localStorage` on that operator's device — it
  is not synced across devices in the same workspace, not encrypted, and not
  read by any sending code. So the per-workspace-key capability exists as a
  data shape but has no runtime effect.

If real sending is added later, the current shape supports per-workspace keys,
but the key must move server-side (Lovable Cloud secret or a Firestore
document readable only by an authenticated server function) before it can be
used safely. Plaintext `localStorage` is not an acceptable production store
for a paid-SMS credential.

## 6. Production-readiness verdict

**Not production-ready for real SMS sending.** Blockers:

1. No transport — no HTTP call reaches any SMS provider.
2. No server-side send path — an SMS credential in the browser is exfiltratable
   by any XSS or shared-device access; sending must happen from a server
   function that holds the key.
3. No delivery-receipt intake — status is fabricated, so reporting, retry
   triggers, and cost accounting cannot be trusted for real traffic.
4. No provider abstraction — swapping providers or supporting a second one
   would require inventing the interface first.
5. No rate-limit / anti-abuse controls on the wire (Lovable does not ship a
   generic backend rate limiter; the client-side daily limit is bypassable).
6. Balance is a locally-decremented number, disconnected from any real ledger.

### Minimum work to make it real (informational, not implemented)

- Add a server function `sendSms(row)` (TanStack `createServerFn`) that calls
  the GatewayAPI connector at `/mobile/single` using `LOVABLE_API_KEY` +
  `GATEWAYAPI_API_KEY`.
- Move per-workspace overrides (custom sender ID, custom API key) into a
  Firestore doc read by that server function; never in `localStorage`.
- Add a public server route under `src/routes/api/public/sms-dlr.ts` to
  receive delivery receipts and update history `status`.
- Introduce a `Provider` interface (`send`, `getBalance`, `verifyCredentials`)
  and register per-channel adapters so WhatsApp/Email/Push can plug in later.
- Replace the local balance counter with a real balance fetched from the
  provider (GatewayAPI exposes a credit endpoint).
- Wire the automation toggles to a dispatcher listening to domain events
  (invoice created, payment received, etc.).

---

_No source files were modified during this audit._
