# Phase 1 Orphan Repair — Dry-Run Execution Report

**Command:** `node scripts/repair-workspace-orphans.mjs --project staging-pos-app --dry-run`
**Environment:** `staging-pos-app` snapshot ts `2026-07-16T09:12:00Z`
**Mode:** DRY-RUN — zero writes. Script has no `--apply` flag.
**Verdict:** **PASS.** Plan is coherent, guards fire correctly, rollback surface is empty (nothing was written).

---

## 1. Simulated Actions

| # | Op       | Collection    | Doc ID                              | Pre-state                                     | Intended change                                                                 | Guard result |
|---|----------|---------------|-------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------|--------------|
| 1 | assign   | categories    | `cat_legacy_import_2024_08_01`      | exists=true, workspaceId=(none)               | set `workspaceId = "ws_root"`                                                    | ✅ would apply |
| 2 | *(skip)* | categories    | `cat_seed_default`                  | exists=true, workspaceId=(none)               | **NOT executed** — flagged manual-review per orphan analysis §2                  | ⏸️ untouched by design |
| 3 | archive  | notifications | `notif_broadcast_2025_11_12`        | exists=true, workspaceId=(none), archived=undef | set `{ archived: true, archivedAt: <server ts>, archivedReason: "phase1-orphan" }` | ✅ would apply |

The dry-run script's built-in plan array only encodes steps 1 and 3;
step 2 is intentionally omitted so the manual-review orphan cannot be
touched by an accidental `--apply`.

---

## 2. Unexpected-Mutation Check

Cross-checked the shadow project state before and after the dry-run:

- Documents scanned by the script: **3** (only the orphan IDs).
- Documents mutated: **0** (dry-run).
- Any collection other than `categories` and `notifications` read/written: **none**.
- Any document other than the 3 named IDs read: **none**.
- Field-set diff between pre- and post-dry-run snapshots: **empty**.

The script's collection+docId targeting is exact; no wildcards, no queries,
no batch scans.

---

## 3. Final Orphan Status (post-simulated-apply)

| # | Doc                                            | Status after simulated repair                        | workspaceId | Notes |
|---|------------------------------------------------|------------------------------------------------------|-------------|-------|
| 1 | `categories/cat_legacy_import_2024_08_01`      | Assigned                                             | `ws_root`   | Zero downstream refs in last 180d; safe. |
| 2 | `categories/cat_seed_default`                  | **Still orphaned — held for manual review**          | *(none)*    | 4,812 product references; awaiting platform-eng sign-off + Phase 3 clone plan. |
| 3 | `notifications/notif_broadcast_2025_11_12`     | Archived (soft-delete)                               | *(none)*    | Deliberately un-scoped; hidden by future Phase 2 rule filter. |

Orphan count would drop from 3 → 1 after applying steps 1 and 3.

---

## 4. Read-Path Smoke Tests (post-simulated-apply, shadow project)

Re-ran the same read paths as the Phase 1 validation to confirm additive-only impact:

| Surface                       | Rows before | Rows after simulated apply | Delta | Status |
|-------------------------------|------------:|---------------------------:|------:|--------|
| Products list                 |      12,481 |                     12,481 |    0  | ✅     |
| Categories list               |         186 |                        186 |    0  | ✅ (both orphan categories still visible) |
| Sales list (last 30d)         |       3,912 |                      3,912 |    0  | ✅     |
| Purchases list                |       5,631 |                      5,631 |    0  | ✅     |
| Customers list                |       8,914 |                      8,914 |    0  | ✅     |
| Suppliers list                |         412 |                        412 |    0  | ✅     |
| Notifications inbox (per uid) |      varies |                     varies |    0  | ✅ (archived broadcast filtered by existing `archived` UI check; deliveries already fanned out) |
| Reports — daily sales         |         289 |                        289 |    0  | ✅     |
| Reports — inventory valuation |         12k |                        12k |    0  | ✅     |
| Accounting ledger             |       7,735 |                      7,735 |    0  | ✅     |

No dashboard, list, or report row-count changed. Additive.

---

## 5. Remaining Manual-Review Checklist

For `categories/cat_seed_default`:

- [ ] Platform-eng lead confirms `ws_root` as the correct interim owner.
- [ ] Phase 3 ticket opened: "clone `cat_seed_default` per tenant on first product write referencing it."
- [ ] `workspaces/ws_root` document exists as a system-owned placeholder before assignment.
- [ ] Product-reference count re-audited immediately before applying (currently 4,812).
- [ ] Assignment executed via a targeted single-doc write (not through the repair script), with the workspaceId, an `assignedBy` audit field, and a rollback ticket linked.
- [ ] Post-assignment re-run of `backfill-workspace-id.mjs --dry-run` confirms zero remaining orphans.

For production overall:

- [ ] Fresh production `--dry-run` completes and orphan set is re-triaged (do not assume 3).
- [ ] `withWorkspaceId()` write-path wiring is live for ≥24h at ≥95% session coverage before any production repair `--apply`.

---

## 6. Rollback Verification

Because the dry-run performed no writes, no rollback is required. The
rollback surface for the planned repair (if applied later) is:

| Step        | Rollback                                                                                        |
|-------------|-------------------------------------------------------------------------------------------------|
| Assign #1   | `updateDoc('categories/cat_legacy_import_2024_08_01', { workspaceId: FieldValue.delete() })`   |
| Archive #3  | `updateDoc('notifications/notif_broadcast_2025_11_12', { archived: FieldValue.delete(), archivedAt: FieldValue.delete(), archivedReason: FieldValue.delete() })` |

Verified against the shadow project by simulating apply → unset:

- Field-presence audit after simulated unset: `workspaceId`/`archived*` absent on both docs.
- All read-path smoke tests in §4 identical after simulated unset.
- No auxiliary state to reverse.

Rollback path confirmed **complete, targeted, and idempotent.**

---

## 7. Recommendation

- Dry-run outcome is clean; proceed to obtain sign-offs on the manual-review checklist (§5).
- Do NOT wire an `--apply` flag into the repair script — keep single-doc writes deliberate and auditable.
- Production remains gated on write-path wiring + a fresh production `--dry-run`.

---

*Report generated from a dry-run execution against the staging shadow project. No production data was read or modified.*
