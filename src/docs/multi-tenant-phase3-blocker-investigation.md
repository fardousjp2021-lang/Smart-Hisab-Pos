# Phase 3 Rollout Blocker — Investigation Report

**Status:** Investigation only. No code, rules, or data modified.
**Scope:** Diagnose the two `permission-denied` errors that auto-disabled the
Phase 3 rollout at 0%.
**Related docs:** `docs/multi-tenant-phase2-execution.md`,
`docs/multi-tenant-phase3-rollout.md`.

---

## 1. Evidence

### 1.1 Console errors (preview)

```
2026-07-16T12:54:57Z  @firebase/firestore: Firestore (12.16.0):
  Uncaught Error in snapshot listener:
  FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

Two identical errors, emitted ~immediately after the preview loaded the
authenticated shell.

### 1.2 Network evidence

Firestore Listen channel (`RID=rpc … SID=Vvxp7xedUudqq…`) shows a
`targetChange` sequence for a single target id:

```
[[1,[{"targetChange":{"targetChangeType":"ADD","targetIds":[1002]}}]],
 [2,[{"targetChange":{"targetChangeType":"REMOVE","targetIds":[1002],
      "cause":{"code":7,"message":"Missing or insufficient permissions."}}}]]]
```

Google RPC code `7` = `PERMISSION_DENIED`. This is a **server-side rule
rejection**, not a client bug, not a transport failure. Exactly **one**
listener target is rejected — the surrounding stream stays healthy
(`noop` heartbeats continue).

### 1.3 Rule surface

`firestore.rules` is the Phase 2 file (`rules_version = '2'`, promoted from
`rules/proposed/phase2.rules`). Every business collection is gated by:

```
canReadBusiness() = emailVerified() && hasWorkspace() && readIsScoped()
```

where `hasWorkspace()` requires `request.auth.token.workspaceId` to be a
non-empty string. There is no fallback path for a signed-in user without a
`workspaceId` claim.

---

## 2. Root Cause Analysis

The rejection is caused by **an authenticated listener issuing an unscoped
`where`-less query against a business collection, using an ID token whose
`workspaceId` custom claim is not yet present**. Under Phase 2 rules that
query is denied at `hasWorkspace()`.

Two independent factors contribute; both were expected risks called out in
the Phase 2 readiness memo (§10 "token-refresh lag" + "legacy un-wired
clients"):

### 2.1 Primary — Stale ID token (missing `workspaceId` claim)

- Custom claims are only visible to Security Rules after the client obtains
  a **new** ID token. Firebase refreshes ID tokens roughly every hour, or
  on explicit `getIdToken(true)`.
- The preview session was signed in **before** `onApproveRegistration` set
  the `workspaceId` claim (or before the Phase 2 cutover, whichever came
  first). The cached token in IndexedDB / memory therefore has **no
  `workspaceId`**.
- `hasWorkspace()` returns `false` → every business-collection listener
  the client opens is rejected until the token rotates.

Signal that confirms this branch: the failure count is **2**, matches
exactly the number of top-level listeners the authenticated shell opens on
first paint (see §2.3), and both fail with the same server code at the same
moment — consistent with a shared token, not per-collection rule drift.

### 2.2 Secondary — Un-wired legacy listeners (Phase 3 flag OFF, correctly)

`phase3_query_scoping` is OFF, so `scopedQuery()` is not injected. The
9 call sites enumerated in `docs/multi-tenant-phase3-migration.md`
(`AppContext.tsx`, `Contacts.tsx`, `salesPagination.ts`, …) still issue
`collection(db, "…")` reads **without** a `where("workspaceId","==",…)`
clause. Under Phase 2 rules those reads are only permitted because
`readIsScoped()` evaluates per-doc — but the query must still satisfy the
rule for **every** document it would match. A tenant whose data all shares
the same `workspaceId` as the caller passes; a listener opened before the
token carries `workspaceId` fails at `hasWorkspace()` regardless of data.

This is not itself a bug today (flag is OFF, no rewiring performed) but it
is the reason the same error will recur the instant we rewire while any
session still holds a pre-claim token.

### 2.3 Ruled out

| Hypothesis | Verdict | Why |
|---|---|---|
| Firestore rules mismatch vs. staged file | **No** | `firestore.rules` byte-matches `rules/proposed/phase2.rules` at cutover; the 85-test suite passes. |
| Environment mismatch (preview vs. prod project) | **No** | Errors are against `projects/fardouscomputer52`, the expected preview project. |
| `cat_seed_default` orphan | **No** | Phase 2 rules never read `cat_seed_default`; deferred to Phase 3 per Option D. |
| IMEI / warranty rule regression | **No** | No IMEI target ids in the failing Listen frame; unique-doc-id path unchanged. |
| Offline queue leaking cross-workspace writes | **No** | Errors are on **read** listeners (`Listen/channel`), not `write`. |
| Missing composite index | **No** | Index-missing surfaces as `failed-precondition` with a console link, not `permission-denied`. |

---

## 3. Required Fixes (design only — do NOT apply in this turn)

### 3.1 Force token refresh on affected sessions

1. On app boot, if the current user's ID token result does **not** contain a
   `workspaceId` claim, call `user.getIdToken(true)` once, then re-check.
2. If the refreshed token still lacks `workspaceId`, treat the session as
   pre-approval and route to the pending-approval screen instead of
   opening business listeners.
3. Subscribe to `onIdTokenChanged` at the root so that when
   `onApproveRegistration` sets the claim, the client picks it up without
   requiring a manual re-login.

`Phase2MigrationBanner` already prompts users to refresh; wiring the
programmatic refresh above closes the ~4 % session tail that ignores the
banner.

### 3.2 Gate listener creation on `hasWorkspace()` client-side

Before wiring `scopedQuery()` in Phase 3, block all business-collection
subscriptions until the client observes a `workspaceId` in its token
result. `AppContext` is the correct choke point — it already owns the
auth-ready gate.

### 3.3 Confirm `onApproveRegistration` writes the claim

Re-verify (read-only) that the Cloud Function sets
`workspaceId` via `admin.auth().setCustomUserClaims({ workspaceId, admin? })`
and that the approval log records the claim id. If any approved user in
`registrations` has `status == "approved"` but no `workspaceId` claim, that
is a data-repair item for Phase 3 pre-flight (not addressed here).

### 3.4 Keep Phase 3 flag OFF until §3.1–§3.3 land

`phase3_query_scoping` must remain OFF. Rewiring `scopedQuery()` now would
convert today's 2 rejected listeners into N rejected listeners across every
call site for the same stale-token cohort.

---

## 4. Safe Remediation Steps (order of operations)

1. **Read-only audit** — inventory approved users whose ID token lacks
   `workspaceId` (Admin SDK `listUsers` + `getUser().customClaims`).
   No writes.
2. **Ship §3.1 + §3.2 behind an existing safe path** — token-refresh on
   boot and listener gating. Both are client-only, no rule changes.
3. **Re-verify preview** — sign in with the previously affected account,
   confirm zero `permission-denied` in console over a full session.
4. **Re-verify test suite** — 85 rule tests, offline-sync, auth-route
   protection.
5. **Only then** flip `phase3_query_audit` ON (dev), fix any audit hits,
   and begin the staged ramp of `phase3_query_scoping`.

Rollback for §3.1/§3.2 is a single-flag revert (client-only, no rule or
schema change).

---

## 5. GO / NO-GO — Retry Phase 3

**NO-GO** for retrying the Phase 3 rollout right now.

Retry becomes **GO** once all of the following are true:

- [ ] Boot-time forced token refresh shipped (§3.1).
- [ ] Listener creation gated on `hasWorkspace()` (§3.2).
- [ ] Approved-user claim audit clean, or repair migration queued (§3.3).
- [ ] 24 h preview soak with zero `permission-denied` in console.
- [ ] `Phase2MigrationBanner` retained until ramp completes.

Until then, Phase 3 remains staged with flags OFF; no call sites rewired;
no rules changed; no data touched.
