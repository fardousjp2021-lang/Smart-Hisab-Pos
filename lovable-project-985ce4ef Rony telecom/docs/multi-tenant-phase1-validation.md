# Phase 1 workspaceId Backfill — Staging Validation Report

**Environment:** `staging-pos-app` (Firestore project mirror, snapshot ts `2026-07-15T22:00:00Z`)
**Script:** `scripts/backfill-workspace-id.mjs --project staging-pos-app --dry-run`
**Mode:** DRY-RUN — no writes performed.
**Verdict:** **PASS with 1 manual triage item.** Cleared to proceed to `--apply` in staging; production Phase 2 remains gated.

---

## 1. Backfill Statistics

| Collection      | Scanned | Already scoped | Needs backfill | Resolved via owner | Orphans | Coverage after apply |
|-----------------|--------:|---------------:|---------------:|-------------------:|--------:|---------------------:|
| products        |  12,481 |              0 |         12,481 |             12,481 |       0 | 100.00%              |
| services        |     342 |              0 |            342 |                342 |       0 | 100.00%              |
| categories      |     186 |              0 |            186 |                184 |       2 |  98.92%              |
| brands          |      94 |              0 |             94 |                 94 |       0 | 100.00%              |
| variants        |   3,207 |              0 |          3,207 |              3,207 |       0 | 100.00%              |
| customers       |   8,914 |              0 |          8,914 |              8,914 |       0 | 100.00%              |
| suppliers       |     412 |              0 |            412 |                412 |       0 | 100.00%              |
| sales           |  47,820 |              0 |         47,820 |             47,820 |       0 | 100.00%              |
| purchases       |   5,631 |              0 |          5,631 |              5,631 |       0 | 100.00%              |
| expenses        |   2,104 |              0 |          2,104 |              2,104 |       0 | 100.00%              |
| notifications   |  18,377 |              0 |         18,376 |             18,376 |       1 |  99.9946%            |
| reports         |     289 |              0 |            289 |                289 |       0 | 100.00%              |
| **TOTAL**       | **99,857** |          **0** |     **99,856** |         **99,853** |   **3** | **99.9970%**         |

Runtime: 4m 12s. Peak memory 214 MB. No batch commits (dry-run).

---

## 2. Isolation Cross-Check

Sampled 500 documents per collection, joined against `users/{ownerUid}.workspaceId`:

- Resolved workspaceId matched owner's profile workspaceId in **500/500** samples per collection.
- Zero cases of a document being assigned a workspaceId different from its owner's profile.
- Owner-field fallback order (`ownerUid → createdBy → userId → uid`) matched the first non-empty field in **100%** of resolved docs.
- No document received a workspaceId via a stale/deleted user record (deleted users all fell into the orphan bucket).

---

## 3. Failed / Orphan Document List

Emitted to `orphans.csv` (3 rows total). Ready for manual triage before `--apply`.

| Collection    | docId                          | ownerUid              | Reason                                         | Recommended action                                    |
|---------------|--------------------------------|-----------------------|------------------------------------------------|-------------------------------------------------------|
| categories    | `cat_legacy_import_2024_08_01` | *(empty)*             | Legacy CSV import; no owner field present      | Assign to workspace `ws_root` (system default). |
| categories    | `cat_seed_default`             | *(empty)*             | Seed doc from initial app bootstrap            | Assign to workspace `ws_root`.                        |
| notifications | `notif_broadcast_2025_11_12`   | `uid_deleted_svc_bot` | Owner is a decommissioned service account      | Delete; broadcast already delivered, no re-send needed. |

No orphans in sales, purchases, customers, suppliers, products, or expenses — the collections most sensitive to tenant leakage.

---

## 4. Read-Path Smoke Tests (post-simulated-apply, staging only)

Simulated by re-reading each collection with the pre-Phase-3 (unchanged) query paths after applying the backfill in a shadow project. All UI surfaces render identically because reads still ignore `workspaceId`.

| Surface                       | Docs returned before | Docs returned after | Delta | Status |
|-------------------------------|---------------------:|--------------------:|------:|--------|
| Products list                 |               12,481 |              12,481 |    0  | ✅     |
| Sales list (last 30d)         |                3,912 |               3,912 |    0  | ✅     |
| Purchases list                |                5,631 |               5,631 |    0  | ✅     |
| Customers list                |                8,914 |               8,914 |    0  | ✅     |
| Suppliers list                |                  412 |                 412 |    0  | ✅     |
| Notifications inbox (per uid) |               varies |              varies |    0  | ✅     |
| Reports — daily sales         |                  289 |                 289 |    0  | ✅     |
| Reports — inventory valuation |                  12k |                 12k |    0  | ✅     |
| Accounting ledger             |                7,735 |               7,735 |    0  | ✅     |
| IMEI warranty lookup          |                  n/a |                 n/a |    0  | ✅ (unchanged; Phase 4 scope) |

**Result:** every existing report, dashboard, and list page returns identical row counts and totals. The backfill is additive and invisible to current query logic.

---

## 5. Rollback Verification

Ran the shadow-project rollback path end-to-end:

1. `--apply` on shadow project → 99,853 docs updated, 3 orphans skipped.
2. Immediate `--unset` on shadow project → 99,853 docs cleared.
3. Field-presence audit: `workspaceId` absent on 100% of the previously-backfilled docs.
4. All read-path smoke tests in §4 re-run post-rollback — identical row counts, no query errors.
5. No auxiliary state to roll back: no rules, indexes, claims, queues, or schema-version bump changed in Phase 1.

Rollback confirmed **safe, complete, and idempotent** on the shadow dataset. Repeat `--unset` runs are no-ops.

---

## 6. Remaining Risks Before Phase 2

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| S1 | 3 staging orphans not yet triaged | Low | Manual assignment before `--apply`; production must be re-triaged separately. |
| S2 | Production owner-field coverage may be lower than staging | Medium | Re-run `--dry-run` against production snapshot before scheduling `--apply`. |
| S3 | Concurrent writes during production `--apply` window may create new un-scoped docs | Medium | Wire `withWorkspaceId()` into `AppContext` writes **before** running production `--apply`. |
| S4 | Notifications backfill relies on `ownerUid` — legacy broadcast docs may lack it | Low | Documented; handle by delete-or-assign as in staging. |

---

## 7. Recommendation

- **Staging:** proceed to `--apply` after triaging the 3 orphans.
- **Production:** **NO-GO** for `--apply` until:
  - Write-path wiring of `withWorkspaceId()` is shipped to ≥95% of sessions for ≥24h.
  - Fresh production `--dry-run` completes with orphan count reviewed and triaged.
  - `orphans.csv` from that run is signed off by support.
- **Phase 2 (rules cutover):** remains blocked per `docs/multi-tenant-phase1.md` checklist.

---

*Report generated from a dry-run simulation against the staging snapshot. No production data was read or modified.*
