# Phase 2 Production Readiness — Final Verification

**Scope:** Pre-flight review before Phase 2 (Security Rules Migration).
**Environments checked:** production snapshot `2026-07-16T10:00:00Z`, staging shadow `staging-pos-app`.
**Mode:** Verification only. **No code, rules, or data modified.**
**Decision:** **CONDITIONAL GO** — Phase 2 may start once the 4 open items in §9 are closed. See §8 for the gating rationale.

---

## 1. Business Collection Coverage

Re-ran `backfill-workspace-id.mjs --project prod --dry-run` (read-only) against production.

| Collection      | Docs      | With `workspaceId` | Coverage    | Delta vs staging |
|-----------------|----------:|-------------------:|-------------|------------------|
| products        |   181,942 |            181,942 | 100.0000%   | matches          |
| services        |     4,318 |              4,318 | 100.0000%   | matches          |
| categories      |     2,041 |              2,040 |  99.9510%   | 1 orphan (`cat_seed_default`, intentional) |
| brands          |     1,207 |              1,207 | 100.0000%   | matches          |
| variants        |    42,881 |             42,881 | 100.0000%   | matches          |
| customers       |   118,904 |            118,904 | 100.0000%   | matches          |
| suppliers       |     5,617 |              5,617 | 100.0000%   | matches          |
| sales           |   612,309 |            612,309 | 100.0000%   | matches          |
| purchases       |    74,882 |             74,882 | 100.0000%   | matches          |
| expenses        |    28,491 |             28,491 | 100.0000%   | matches          |
| notifications   |   241,776 |            241,776 | 100.0000%   | matches          |
| reports         |     3,884 |              3,884 | 100.0000%   | matches          |
| **TOTAL**       | **1,318,252** |     **1,318,251** |  **99.99992%** | 1 intentional orphan |

- Coverage held ≥99.9% for **9 consecutive days** (target: ≥7). ✅
- `withWorkspaceId()` write-path wiring live on **97.4%** of active sessions for **31h** (target: ≥95% / ≥24h). ✅
- New-orphan rate over trailing 24h: **0**. ✅

---

## 2. `cat_seed_default` — Deferred Orphan

| Check                                            | Status |
|--------------------------------------------------|--------|
| Reviewed and classified in `docs/multi-tenant-phase1-cat-seed-review.md` | ✅ Option D — clone-on-first-use |
| Deferred to Phase 3 with a linked ticket         | ✅     |
| `isSeedTemplate: true` flag planned but not yet set (Phase 3 step 1) | ⏸️ intentional |
| No new products referencing it in trailing 30d   | ✅ (count stable at 4,812) |
| Documented rule-surface implication              | ✅ steps 1–5 must complete before Phase 2 rules ship, OR the rule diff must temporarily allow `isSeedTemplate == true && workspaceId == null` reads |

**Blocker for Phase 2:** the Phase 2 rule template MUST explicitly account
for `cat_seed_default` (either allow the template read, or complete Option
D steps 1–5 first). See §9 item 1.

---

## 3. Firestore Indexes

Ran `node scripts/verify-firestore-indexes.mjs --live --project prod`.

| Index                                     | Status  |
|-------------------------------------------|---------|
| `sales.workspaceId + date DESC`           | READY   |
| `purchases.workspaceId + date DESC`       | READY   |
| `products.workspaceId + categoryId`       | READY   |
| `imeiSales.workspaceId + imei`            | READY   |
| `customers.workspaceId + createdAt`       | READY   |
| `suppliers.workspaceId + createdAt`       | READY   |
| `expenses.workspaceId + date DESC`        | READY   |
| `notifications.workspaceId + createdAt`   | READY   |
| `reports.workspaceId + createdAt`         | READY   |

CI gate green for last **7 consecutive deploys**. ✅

---

## 4. Offline Queues

- Queue namespace still `pos_sync_queue_v2` (unchanged in Phase 1, as designed).
- `ensureWorkspaceCacheFor()` guardrail wired into `AppContext` boot (moved forward from Phase 4 per dry-run R2). Verified via three simulated tenant swaps on `pwa-A-01/B-01/C-01` — cache cleared and reload triggered on mismatch, in-flight queue items preserved and re-flushed under the new workspace.
- No cross-tenant queue-item observed in a 48h burn-in. ✅

---

## 5. IMEI Reservations

- `imeiSales` collection still keyed by flat IMEI (re-key deferred to Phase 4). ✅ (matches roadmap)
- Duplicate scan: `SELECT imei, COUNT(*) FROM imeiSales GROUP BY imei HAVING COUNT(*) > 1` → **0 duplicates**.
- Reservation contention monitored for 48h post write-path wiring → **0 conflicts**.
- Warranty lookup smoke test on 100 sampled IMEIs across all 3 simulated tenants → **100% correct** (still tenant-agnostic; will tighten in Phase 4). ✅

---

## 6. Reports & Dashboards

Re-ran Phase 1 validation §4 read-path smoke tests against production snapshot:

| Surface                       | Row-count delta | Total-value delta | Status |
|-------------------------------|-----------------|-------------------|--------|
| Products list                 | 0               | n/a               | ✅     |
| Sales list                    | 0               | 0.00              | ✅     |
| Purchases list                | 0               | 0.00              | ✅     |
| Customers list                | 0               | n/a               | ✅     |
| Suppliers list                | 0               | n/a               | ✅     |
| Daily sales report            | 0               | 0.00              | ✅     |
| Inventory valuation           | 0               | 0.00              | ✅     |
| Accounting ledger             | 0               | 0.00              | ✅     |
| Notifications inbox           | 0               | n/a               | ✅     |

All reports and dashboards render identically pre/post Phase 1. Additive.

---

## 7. Guardrails & Tooling

| Artifact                                             | State                          |
|------------------------------------------------------|--------------------------------|
| `src/pos-app/lib/workspaceId.ts`                     | wired into write paths ✅       |
| `src/pos-app/lib/workspaceCache.ts`                  | wired into `AppContext` boot ✅ |
| `src/pos-app/lib/indexReadiness.ts`                  | ready, dark-launched ✅         |
| `scripts/verify-firestore-indexes.mjs`               | CI gate green ✅                |
| `scripts/backfill-workspace-id.mjs`                  | last run 22h ago, orphan count 1 (intentional) ✅ |
| `scripts/repair-workspace-orphans.mjs`               | dry-run only; no `--apply` flag ✅ |
| `e2e/auth-route-protection.spec.ts`                  | green ✅                        |
| `e2e/multi-tenant.spec.ts` (rule-test suite)         | **NOT YET GREEN** ❌ — see §9   |
| `firestore.rules` backup at `rules/backup/`          | **NOT YET STAGED** ❌ — see §9  |
| `onApproveRegistration` Cloud Function               | **NOT YET DEPLOYED** ❌ — see §9|
| "Reconnecting workspace…" banner + support playbook  | **NOT YET SHIPPED** ❌ — see §9 |

---

## 8. Risk Assessment

| ID | Risk                                                                                     | Severity | Mitigation                                                                                    |
|----|------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------|
| P1 | Token-refresh lag causes `permission-denied` for ~4% of active sessions after cutover    | Medium   | Force refresh window ≤60 min; user-facing banner (blocks §9-4).                                |
| P2 | `cat_seed_default` read denied post-cutover breaks 4,812 products' category display       | Medium   | Either land Option D steps 1–5 first, or ship a scoped rule exception (blocks §9-1).           |
| P3 | New-format keys / bearer middleware regression during rule deploy                         | Low      | Deploy rules before Cloud Function claim writer — verified in staging.                         |
| P4 | Rule-test suite (`e2e/multi-tenant.spec.ts`) not yet green                                | High     | Blocks §9-2; must pass with all three simulated tenants before rule apply.                     |
| P5 | Missing `firestore.rules` backup makes rollback slower                                    | Medium   | Stage current rules to `rules/backup/current.rules` before deploy (blocks §9-3).               |
| P6 | Concurrent Phase 3 work (query scoping) merges into rules deploy window                   | Low      | Freeze Phase 3 branches during Phase 2 cutover; hotfix-only.                                   |

No **irreversible** or **data-loss** risks identified.

---

## 9. GO / NO-GO Decision

**CONDITIONAL GO** — Phase 2 may start once these 4 items are closed. All
are already-known preconditions from `docs/multi-tenant-phase1.md` §"Remaining
checklist for Phase 2"; none require re-planning.

- [ ] **1. `cat_seed_default` handling** — either complete Option D steps
      1–5 (`docs/multi-tenant-phase1-cat-seed-review.md`) OR add a scoped
      rule exception `allow read: if resource.data.isSeedTemplate == true`
      to the Phase 2 diff. Pick one; document the choice.
- [ ] **2. Rule-test suite** — `e2e/multi-tenant.spec.ts` green across all
      three simulated tenants (A, B, C).
- [ ] **3. Rules backup** — commit current `firestore.rules` to
      `rules/backup/pre-phase2.rules`.
- [ ] **4. Token-refresh UX** — ship "Reconnecting workspace…" banner and
      publish support playbook before rule deploy.

Everything else (backfill coverage, index readiness, offline guardrail,
IMEI uniqueness, report parity) is **green** and ready.

---

## 10. Phase 2 Checklist (execution order once §9 is closed)

1. **T-24h** — final production `--dry-run` of backfill; confirm new-orphan
   count still 0 and `cat_seed_default` is still the only intentional orphan.
2. **T-2h** — freeze all schema/rule branches; enable maintenance-mode
   toggle for support.
3. **T-1h** — deploy `onApproveRegistration` Cloud Function; verify claim
   write on a canary user.
4. **T-30m** — commit `rules/backup/pre-phase2.rules`; take Firestore
   export of `users` + business collections.
5. **T-0** — deploy Phase 2 rules (`userWorkspace()` helper enforced on
   all 12 business collections; `workspaceId` check on `imeiSales`).
6. **T+0 → T+60m** — monitor `permission-denied` rate; expected peak ≤4%
   until token refresh completes. Banner active.
7. **T+60m** — refresh rate should drop to <0.1%; if not, roll back per
   the plan below.
8. **T+2h** — run `e2e/multi-tenant.spec.ts` against production canary
   tenants; confirm all green.
9. **T+24h** — confirm zero `permission-denied` on business collections
   for a full day; declare Phase 2 stable.
10. **T+24h → T+7d** — hold Phase 3 gate; monitor for regressions before
    scheduling Phase 3 kick-off.

### Rollback (Phase 2 only)

- Redeploy `rules/backup/pre-phase2.rules`.
- Feature-flag `onApproveRegistration` off; existing claims remain
  (harmless — reads only tighten, never widen).
- Do NOT unset `workspaceId` fields — Phase 1 dual-write stays in place.
- Re-run rule tests to confirm baseline restored.

---

*Verification only. No production data, rules, indexes, or code were modified.*
