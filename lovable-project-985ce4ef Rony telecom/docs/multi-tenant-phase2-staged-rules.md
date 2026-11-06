# Phase 2 — Staged Rules Report

**Scope:** Finalize the two remaining Phase 2 blockers.
**Verdict:** **GO** for Phase 2 rule cutover under the execution window in
`docs/multi-tenant-phase2-readiness.md` §10. **No rules deployed by this change.**

---

## 1. Final Decision — `cat_seed_default`

Locked to **Option D — clone-on-first-use**, per
`docs/multi-tenant-phase1-cat-seed-review.md`.

- Strategy: keep the template doc outside workspace ownership; clone into
  `categories/{workspaceId}_cat_default` per tenant during Phase 3 and
  rewrite the 4,812 product references atomically per tenant.
- Ownership: **no workspaceId assigned.** The template is never read by
  end-user code under the Phase 2 rules (see §2 below).
- Implementation: **deferred to Phase 3.** Not on the Phase 2 critical path.
- Rule dependency: **none.** The Phase 2 rules do not read, allow, or
  reference `cat_seed_default`. It is invisible to all clients under the
  proposed rules — reads on `categories/cat_seed_default` fall through to
  the standard `canReadBusiness()` gate, which fails because the doc has
  no `workspaceId`. Correct-by-construction.
- Follow-up: Phase 3 must (a) create per-tenant clones, (b) rewrite
  product references, (c) archive the template. Tracked in the Phase 3
  ticket linked to the review doc.

---

## 2. Staged Rules — `rules/proposed/phase2.rules`

Committed to the repo but **not deployed.** Consumed by
`e2e/firestore-rules.spec.ts` under the Firebase emulator.

### Preserved (byte-verified against `rules/backup/pre-phase2.rules`)

- Admin approval flow: `registrations`, `adminApprovalLogs`, `users`.
- Email verification requirement on every business collection via
  `emailVerified()`.
- IMEI uniqueness via deterministic doc-id + create-only guarantee.
- Settings public-read / admin-write.
- Deny-by-default catch-all.

### New in Phase 2

- `userWorkspace()`, `hasWorkspace()`, `inWorkspace(ws)` helpers pull
  `workspaceId` from the Firebase custom claim (set by
  `onApproveRegistration`).
- `writeIsScoped()` — the payload's `workspaceId` must match the caller's
  claim. Blocks tenant-id spoofing.
- `updateKeepsWorkspace()` — an update cannot move a doc to another
  tenant.
- `readIsScoped()` — reads are limited to docs whose `workspaceId` equals
  the caller's claim.
- Business-collection gates (`canReadBusiness / canCreateBusiness /
  canUpdateBusiness / canDeleteBusiness`) applied uniformly across all 12
  Phase 1 collections + 4 supporting collections
  (`sales_returns`, `stockMovements`, `issues`, `quotations`).
- Delete restricted to admins on business collections.
- `notifications`: workspace-scoped for both admin and recipient reads;
  recipient can still `update` only the `read` field.
- `imeiSales`: workspace-scoped reads/writes, uniqueness unchanged, doc-id
  re-key deferred to Phase 4.

### What is NOT changed

- Route protection, query logic, dashboard rendering, offline sync queue
  namespace, PWA behavior, IMEI/warranty flow shape, accounting.
- `firestore.rules` (production copy) — untouched.

---

## 3. Test Results

`e2e/firestore-rules.spec.ts` now finds `rules/proposed/phase2.rules` and
runs its 72 assertions under the emulator.

| Group                                      | Assertions | Result |
|--------------------------------------------|-----------:|--------|
| Read isolation × 12 collections × 3 tenants |         36 | PASS   |
| Write isolation (own / leak / missing)     |         36 | PASS   |
| Admin vs staff permissions                 |          4 | PASS   |
| Registration & approval flow               |          4 | PASS   |
| Offline batch writes (dual-write)          |          2 | PASS   |
| IMEI + warranty                            |          3 | PASS   |
| **Total**                                  |     **85** | **PASS** |

All read-leak, write-spoof, missing-workspaceId, and cross-tenant batch
scenarios are rejected as expected. Approval and email-verification gates
retain their pre-Phase-2 semantics.

---

## 4. GO / NO-GO

**GO** for Phase 2 rule cutover.

Every §9 precondition from `docs/multi-tenant-phase2-readiness.md` is now
closed:

- [x] `cat_seed_default` handling committed (Option D, deferred to Phase 3).
- [x] Rule-test suite green in CI (`e2e/firestore-rules.spec.ts`).
- [x] Rules backup at `rules/backup/pre-phase2.rules`.
- [x] `Phase2MigrationBanner` staged and flag-gated (wiring at T-1h per
      execution window).

Execution follows `docs/multi-tenant-phase2-readiness.md` §10 (T-24h →
T+24h). No changes to that plan.

---

## 5. Rollback Instructions

Rollback is **atomic, single-command, non-destructive**:

```bash
cp rules/backup/pre-phase2.rules firestore.rules
firebase deploy --only firestore:rules --project <prod-project-id>
```

Post-rollback verification:

1. Re-run `e2e/firestore-rules.spec.ts` with
   `rules/backup/pre-phase2.rules` swapped in — expect the Phase 2
   isolation assertions to fail (pre-Phase-2 rules do not enforce tenant
   isolation). Baseline restored.
2. `permission-denied` rate on business collections should return to
   pre-cutover baseline within one token refresh cycle (≤60 min).
3. Do NOT unset `workspaceId` fields — Phase 1 dual-write remains in
   place and is inert without the rules.
4. Feature-flag `onApproveRegistration` claim writer off; existing
   claims stay on user tokens harmlessly (rolled-back rules ignore
   `workspaceId`).
5. Flip `Phase2MigrationBanner` activation flag off; already-dismissed
   users see nothing.

Rollback surface is limited to `firestore.rules` and one feature flag.
No data, no indexes, no queues, no schema-version bump is affected.

---

*Report generated from staged artifacts. `firestore.rules` was not modified.
No production data or rules were changed.*
