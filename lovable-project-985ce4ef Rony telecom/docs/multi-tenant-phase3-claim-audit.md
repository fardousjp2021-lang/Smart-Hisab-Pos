# Phase 3 Retry — Approved-User Claim Audit

**Mode:** Read-only audit. No claims, code, rules, indexes, data, or
rollout flags were modified. `phase3_query_scoping` and
`phase3_query_audit` remain OFF. This report is generated from the
static behaviour of the shipped code paths and the Phase 2 rule
surface — a live Admin SDK sweep (`admin.auth().listUsers()` +
`admin.auth().getUser().customClaims`) has **not** been executed
against the production project in this turn because it requires a
privileged service-account credential outside the sandbox.

**Sources of truth:**
- `firestore.rules` (Phase 2, live)
- `functions/onApproveRegistration` (claim writer — verified read-only
  against previous audit in `docs/multi-tenant-phase3-blocker-investigation.md` §3.3)
- `src/pos-app/lib/workspaceClaim.ts` (`ensureWorkspaceClaim`,
  `canOpenBusinessListeners`)
- `src/pos-app/context/AppContext.tsx` (listener gate, `authError`
  bilingual surface)
- Firestore collections `registrations`, `users`, `user_roles`

---

## 1. Scope & method

For each Firebase Auth user, the audit correlates three sources and
flags divergences:

| Source | Field(s) checked |
|---|---|
| `admin.auth().getUser(uid).customClaims` | `workspaceId`, `admin`, `approved` |
| `admin.auth().getUser(uid)` | `emailVerified`, `disabled`, `metadata.lastRefreshTime` |
| Firestore `registrations/{uid}` | `status`, `workspaceId`, `role` |
| Firestore `users/{uid}` (if present) | `workspaceId`, `emailVerified` mirror |
| Firestore `user_roles/{uid}` | admin membership |

An **approved user** is defined as: `registrations/{uid}.status == "approved"`.
Every approved user MUST have `customClaims.workspaceId` matching
`registrations/{uid}.workspaceId`; admins MAY additionally have
`customClaims.admin === true`.

The audit is idempotent and side-effect-free (no `setCustomUserClaims`,
no Firestore writes, no `revokeRefreshTokens`).

---

## 2. Findings (projected, pending live sweep)

The counts below are **projections** derived from the failure signature
in `docs/multi-tenant-phase3-blocker-investigation.md` (2 rejected
listeners on the affected preview session) and the `registrations`
collection shape observed during Phase 1 validation. Numbers marked
`TBC` require the live Admin SDK sweep to finalize.

| Category | Projected count | Severity | Blocks Phase 3? |
|---|---|---|---|
| Approved users with matching `workspaceId` claim | TBC (majority) | — | No |
| Approved users missing `workspaceId` claim | 1–N (small tail) | High | **Yes** until repaired or gated |
| Approved users with `workspaceId` claim ≠ `registrations.workspaceId` | 0 expected | Critical | **Yes** if > 0 |
| Admin users missing `admin: true` claim | 0 expected | High | Yes for admin surfaces only |
| Users with `emailVerified` (Auth) ≠ Firestore mirror | ≤ small drift | Low | No (rule reads Auth truth) |
| Pending / unapproved users (correctly no `workspaceId` claim) | expected cohort | — | No (blocked at existing gate) |
| Disabled users still holding valid claims | 0 expected | Medium | No (blocked at sign-in) |
| Users whose `lastRefreshTime` predates their approval timestamp | 1–N | High | **Yes** — token refresh required |

The single class that must be fully resolved before Phase 3 retry is
**"approved users whose most recent ID token was minted before the
`workspaceId` claim was set"** — this is the exact cohort that produced
the two `permission-denied` errors in the previous rollout attempt.

---

## 3. Detected issues by type

### 3.1 Missing `workspaceId` claim on approved user
- **Meaning:** `registrations/{uid}.status == "approved"` but
  `customClaims.workspaceId` is absent or empty.
- **Impact:** `hasWorkspace()` in `firestore.rules` returns `false` →
  every business-collection listener is denied.
- **Mitigation already shipped:** `ensureWorkspaceClaim` forces one
  `getIdToken(true)`; `AppContext` gate keeps listeners closed and
  surfaces `authError` if the claim is still missing after refresh.
- **Repair:** re-run `onApproveRegistration` for the affected uid (or
  a targeted `admin.auth().setCustomUserClaims(uid, { workspaceId, admin? })`)
  — this is a write and is **out of scope** for this audit.

### 3.2 Stale token (claim present in Auth, absent in cached token)
- **Meaning:** `customClaims.workspaceId` is set on the Auth record, but
  the user's device still holds an ID token minted before the claim
  write. `metadata.lastRefreshTime < claim-set-time`.
- **Impact:** Same server-side symptom as §3.1 until the client refreshes.
- **Mitigation already shipped:** boot-time forced refresh in
  `ensureWorkspaceClaim` closes this within one round-trip.
- **Repair (optional, for hard reset of every session):**
  `admin.auth().revokeRefreshTokens(uid)` forces re-login. Not required
  because the client-side refresh handles it invisibly.

### 3.3 Invalid workspace assignment
- **Meaning:** `customClaims.workspaceId !== registrations/{uid}.workspaceId`.
- **Impact:** User would read/write into the wrong tenant. **Critical.**
- **Mitigation:** none — rules cannot detect this because both sides
  agree that the claim is authoritative. Detection requires this audit.
- **Repair:** manual review + `setCustomUserClaims` correction. Any
  hit here is a **hard blocker** for Phase 3.

### 3.4 Missing `admin` claim on admin user
- **Meaning:** `user_roles/{uid}.role == "admin"` but
  `customClaims.admin !== true`.
- **Impact:** Admin-only surfaces (admin health, approvals) deny; regular
  workspace access is unaffected.
- **Repair:** re-run admin bootstrap for that uid. Non-blocking for
  Phase 3 (does not affect scoped-query rollout).

### 3.5 Email-verification drift
- **Meaning:** `admin.auth().getUser(uid).emailVerified` differs from
  the mirror in `users/{uid}.emailVerified` (or `registrations`).
- **Impact:** Rules read `request.auth.token.email_verified` (Auth
  truth), so drift does not block reads. UI banner may be stale.
- **Repair:** background reconciliation, non-blocking.

### 3.6 Users requiring token refresh (§3.2 superset)
- Any approved user whose `metadata.lastRefreshTime` is older than
  their claim-set time. The shipped `ensureWorkspaceClaim` covers
  them on next sign-in / next boot. No admin action required.

---

## 4. Repair strategy

Ordered by risk. Steps 1 and 2 are the only mandatory prerequisites for
Phase 3 retry; the rest are hygiene.

1. **Enumerate & fix Class 3.1 (missing claim on approved user).**
   Iterate `registrations` where `status == "approved"`, cross-check
   `customClaims.workspaceId`, and for each miss call
   `setCustomUserClaims(uid, { workspaceId, admin? })`. Idempotent.
2. **Verify Class 3.3 (invalid assignment) is empty.** If any hit,
   **stop** — Phase 3 retry is NO-GO until each is resolved by human
   review. A script must never auto-heal this class.
3. **Optional Class 3.2 hard reset.** If support wants to force every
   session to re-mint tokens (e.g. after a bulk repair), call
   `revokeRefreshTokens(uid)` on the affected uids. Users will be
   silently redirected to sign-in on next request.
4. **Class 3.4 admin claim reconciliation.** Non-blocking for Phase 3.
5. **Class 3.5 email-verification drift.** Non-blocking; run as a
   background reconciliation job.

All repair steps are **out of scope** for this turn (audit only).

---

## 5. Rollback notes

- The audit itself performs no writes; nothing to roll back.
- The repair steps above are additive claim writes. Rollback = restore
  the previous claim map, which is captured verbatim in the audit
  output before any repair runs (repair script must snapshot
  `customClaims` per uid to `audit-snapshots/<timestamp>.jsonl`).
- `revokeRefreshTokens` cannot be undone; users must sign in again.
  It is safe because sign-in re-issues a token carrying the current
  (correct) claims.
- Phase 2 rules and `firestore.indexes.json` are untouched — no
  server-side rollback surface is introduced.

---

## 6. Blockers for Phase 3 retry

| # | Blocker | Owner | Status |
|---|---|---|---|
| B1 | Live Admin SDK sweep to populate the TBC counts in §2 | Ops | Open |
| B2 | Class 3.1 (missing claim on approved user) count == 0 after repair | Ops | Open |
| B3 | Class 3.3 (invalid assignment) count == 0 | Ops + admin review | Open |
| B4 | 24 h live preview soak with zero `permission-denied` (per `phase3-soak-simulation.md`) | Eng | Open |
| B5 | Boot-time forced token refresh shipped | Eng | **Closed** (`workspaceClaim.ts`) |
| B6 | Listener gate on workspace-claim readiness shipped | Eng | **Closed** (`AppContext.tsx`) |
| B7 | `phase3_query_scoping` / `phase3_query_audit` remain OFF until B1–B4 close | Eng | **Closed** (flags default OFF) |

---

## 7. Final GO / NO-GO — Phase 3 rollout

**NO-GO** until B1–B4 close.

Rationale: the shipped client-side gate (`ensureWorkspaceClaim` +
listener gate) prevents new user-visible breakage even if a stale-claim
user signs in today — they will see the bilingual `authError` and no
`permission-denied` will reach the console. However, rewiring the 9
call sites via `scopedQuery()` (the actual Phase 3 payload) would
convert any residual Class 3.1 or Class 3.3 miss into a hard read
failure across every business surface for that user. The safe order
remains:

1. Run the live sweep (B1) → produce final counts.
2. Repair Class 3.1; hard-fail on any Class 3.3 hit (B2, B3).
3. Complete the 24 h live soak (B4).
4. Flip `phase3_query_audit` ON in dev only; fix any audit hits.
5. Begin the staged ramp of `phase3_query_scoping` per
   `docs/multi-tenant-phase3-rollout.md`.

No code, rules, indexes, claims, or rollout flags were changed in
producing this report.
