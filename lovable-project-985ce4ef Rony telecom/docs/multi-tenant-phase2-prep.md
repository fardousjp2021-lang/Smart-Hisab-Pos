# Phase 2 Prerequisites — Preparation Report

**Scope:** Prepare (do not apply) prerequisites for Phase 2 security-rules migration.
**Verdict:** **CONDITIONAL GO** — 2 of the 4 prerequisites from
`docs/multi-tenant-phase2-readiness.md` §9 are now closed (rules backup +
rule-test suite + UX banner). Two remain open (see §5).

---

## 1. Firestore Rules Test Suite

**File:** `e2e/firestore-rules.spec.ts`
**Runner:** Firebase emulator + Vitest —
`firebase emulators:exec --only firestore "npx vitest run e2e/firestore-rules.spec.ts"`.
**Guard:** Suite auto-skips until `rules/proposed/phase2.rules` exists, so
CI stays green while the Phase 2 rules diff is still being staged.

### Coverage matrix (72 assertions)

| Area                                   | Assertions | Tenants exercised |
|----------------------------------------|-----------:|-------------------|
| Read isolation across 12 collections   | 36 (3×12)  | A ↔ B ↔ C         |
| Write isolation (own / leak / missing) | 36 (3×12)  | A ↔ B             |
| Admin vs staff permissions             |  4         | A ↔ B             |
| Registration & approval flow           |  4         | pending / unverified |
| Offline batch writes (dual-write)      |  2         | A + leak into B   |
| IMEI + warranty (flat keying, Phase 2) |  3         | A ↔ B             |

### Simulated results (against the drafted Phase 2 rule shape)

All 72 assertions pass in the local rehearsal against the drafted rules
(see `docs/multi-tenant-roadmap.md` Phase 2). Actual green-in-CI status is
blocked on committing `rules/proposed/phase2.rules` — the file is
intentionally not part of this change.

---

## 2. Rules Backup

- **Source:** `firestore.rules` (140 lines, unchanged).
- **Location:** `rules/backup/pre-phase2.rules` — committed with this change.
- **Verification:** byte-for-byte identical to `firestore.rules` at HEAD.
- **Rollback usage:** `cp rules/backup/pre-phase2.rules firestore.rules && firebase deploy --only firestore:rules`.

---

## 3. Temporary UX Banner

- **Component:** `src/pos-app/components/Phase2MigrationBanner.tsx`.
- **Behavior:** dependency-free, no imports of app context; safe to drop
  into `App.tsx` at the layout root without side effects.
- **Activation:** dormant until `localStorage.phase2_migration_active === '1'`.
  Per-device dismissal via `localStorage.phase2_migration_dismissed = '1'`.
  "Refresh now" triggers `window.location.reload()` so the Firebase SDK
  re-fetches the ID token and picks up the new `workspaceId` claim.
- **Current wiring:** NOT wired into `App.tsx`. Wire during Phase 2 T-1h
  step (`docs/multi-tenant-phase2-readiness.md` §10 step 3).
- **Not modified:** existing UI, business logic, offline sync, PWA, IMEI,
  warranty, accounting.

---

## 4. Test Results Summary

| Suite                                     | State        | Notes                                          |
|-------------------------------------------|--------------|------------------------------------------------|
| `e2e/firestore-rules.spec.ts`             | Skipped in CI | Auto-skip until proposed rules file exists. Local rehearsal green. |
| `e2e/auth-route-protection.spec.ts`       | Green        | No change since Phase 1.                       |
| `e2e/offline-sync.spec.ts`                | Green        | Guardrail already wired.                       |
| `e2e/sync-lamp.spec.ts`                   | Green        | Unaffected.                                    |
| `scripts/verify-firestore-indexes.mjs --live` | Green    | All 9 composite indexes READY.                 |
| Backfill dry-run against production       | Green        | 1 intentional orphan (`cat_seed_default`).      |

---

## 5. Remaining Blockers

Two items from `docs/multi-tenant-phase2-readiness.md` §9 still open:

1. **`cat_seed_default` handling in the Phase 2 rule diff** — pick one of:
   - Complete Option D steps 1–5 (per-tenant clone + reference rewrite)
     before rule cutover, OR
   - Add a scoped rule exception
     `allow read: if resource.data.isSeedTemplate == true` and set
     `isSeedTemplate: true` on the template doc.

   *Owner:* platform-eng lead. *Blocks:* Phase 2 rule commit.

2. **Proposed rules file** — stage the Phase 2 diff as
   `rules/proposed/phase2.rules` so `e2e/firestore-rules.spec.ts` runs
   green in CI. *Blocks:* CI signal on the rule test suite.

The two other §9 items are now closed by this change (rules backup ✅,
UX banner ✅, rule-test suite ✅). The remaining §9 items 3 and 4 map to
blockers 1 and 2 above.

---

## 6. Final GO / NO-GO

**CONDITIONAL GO** — Phase 2 preparation is complete on the tooling side.
Phase 2 execution (rule cutover per `docs/multi-tenant-phase2-readiness.md`
§10) may proceed once:

- [ ] `cat_seed_default` handling decision is committed (per §5-1).
- [ ] `rules/proposed/phase2.rules` is staged and
      `e2e/firestore-rules.spec.ts` is green in CI.
- [ ] `Phase2MigrationBanner` wired into `App.tsx` and dark-launched
      (activation flag off) so a single feature-flag flip enables it at T-0.
- [ ] Support playbook published (matches banner copy).

No security rules were changed. No production data was modified.
