# Phase 1 Orphan Analysis Report

**Source:** `docs/multi-tenant-phase1-validation.md` §3 (staging dry-run).
**Orphan count:** 3 documents out of 99,857 scanned (0.003%).
**Scope:** Analysis + dry-run repair plan only. **No production data touched.**

---

## 1. Orphan Inventory

| # | Collection    | Document ID                        | Missing relationships                                    | Expected workspace ownership |
|---|---------------|------------------------------------|----------------------------------------------------------|------------------------------|
| 1 | categories    | `cat_legacy_import_2024_08_01`     | No `ownerUid` / `createdBy` / `userId` / `uid`; not referenced by any product's `categoryId` in the last 180 days | System default (`ws_root`) — was a bulk CSV import applied before per-user ownership was enforced |
| 2 | categories    | `cat_seed_default`                 | No owner fields; created by the app bootstrap at first-install; referenced by 4,812 products as a fallback category | System default (`ws_root`) — seed data shared across the historical single-tenant install |
| 3 | notifications | `notif_broadcast_2025_11_12`       | `ownerUid = uid_deleted_svc_bot` — points at a decommissioned service account no longer present in `users/`; recipient uids on the doc still exist | None — broadcast already fully delivered; no live consumer |

---

## 2. Classification

| # | Doc                                          | Class                          | Rationale |
|---|----------------------------------------------|--------------------------------|-----------|
| 1 | `categories/cat_legacy_import_2024_08_01`    | **Safe to assign automatically** | No live product references; assigning to `ws_root` has zero blast radius. |
| 2 | `categories/cat_seed_default`                | **Requires manual review**     | Referenced by 4,812 products across (presumably) multiple future tenants. Assigning to `ws_root` is the correct interim answer, but Phase 3 will need a per-tenant clone-on-first-use strategy, so an admin must sign off. |
| 3 | `notifications/notif_broadcast_2025_11_12`   | **Should be archived**         | Owner user deleted; broadcast already delivered; no re-send needed. Soft-delete preserves audit trail without leaving an un-scoped live doc. |

Summary: **1 auto-assign · 1 manual-review · 1 archive.**

---

## 3. Repair Strategy

Per-orphan actions, ordered by risk:

1. **`categories/cat_legacy_import_2024_08_01`** → `workspaceId = "ws_root"`.
   Additive; no product references depend on the field. Reversible via
   `backfill-workspace-id.mjs --unset` filtered to this docId.

2. **`categories/cat_seed_default`** → `workspaceId = "ws_root"`, gated on
   admin sign-off. Track a Phase 3 follow-up: "clone `cat_seed_default` per
   tenant on first product write referencing it." Do not delete or rename
   until Phase 3 clone logic ships — 4,812 products point at this doc.

3. **`notifications/notif_broadcast_2025_11_12`** → soft-delete:
   `{ archived: true, archivedAt: serverTimestamp(), archivedReason: "phase1-orphan" }`.
   Do NOT hard-delete; keeps audit trail. `workspaceId` intentionally left
   unset — an archived, un-scoped notification is safe once Phase 2 rules
   filter reads by `workspaceId != null && workspaceId == userWorkspace()`.

---

## 4. Repair Script (Dry-Run Only)

Delivered: `scripts/repair-workspace-orphans.mjs`.

- Encodes the 3-step plan above.
- Only supports `--dry-run`; no `--apply` flag exists.
- Prints per-step: existence check, current `workspaceId`, intended
  operation, and pre-flight guards (skip on missing doc or conflicting
  existing assignment).
- To execute in staging or production, an operator reviews the dry-run
  output and runs the equivalent writes through the standard backfill or
  admin console with human sign-off.

Run against staging:

```bash
node scripts/repair-workspace-orphans.mjs --project staging-pos-app --dry-run
```

---

## 5. Rollback Instructions

Fully reversible in every case:

| # | Repair                                 | Rollback command / action                                                         |
|---|----------------------------------------|-----------------------------------------------------------------------------------|
| 1 | assign `cat_legacy_import_...` to `ws_root` | `FieldValue.delete()` on `workspaceId`; equivalent to running `backfill-workspace-id.mjs --unset` narrowed to this doc |
| 2 | assign `cat_seed_default` to `ws_root`      | Same as above; also revert any Phase 3 clone logic if it shipped in the interim   |
| 3 | archive `notif_broadcast_2025_11_12`        | Unset `archived`, `archivedAt`, `archivedReason` fields; original body untouched  |

No auxiliary state (rules, indexes, claims, queues) is modified by the
repair, so rollback is limited to per-doc field deletion.

---

## 6. Risk Assessment

| ID | Risk                                                                                        | Severity | Mitigation                                                                                  |
|----|---------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------|
| O1 | `cat_seed_default` reassignment breaks tenants that expect it as a shared fallback         | Medium   | Manual sign-off; Phase 3 clone-on-first-use plan tracked before rules enforce workspace filter. |
| O2 | Race: a new orphan is created between dry-run and repair                                    | Low      | Repair must run **after** `withWorkspaceId()` write-path wiring is live (blocks new orphans). |
| O3 | Archived notification later needed for compliance audit                                     | Low      | Soft-delete preserves the doc; only `archived` flag is added.                                |
| O4 | `ws_root` doesn't exist as an actual workspace document                                     | Low      | Create `workspaces/ws_root` as a system-owned placeholder before assignment; verify in staging first. |
| O5 | Cross-environment drift — production orphan set differs from staging                        | Medium   | Re-run `backfill-workspace-id.mjs --dry-run` against production and re-triage before applying. |
| O6 | Operator runs writes without dry-run review                                                 | Low      | Repair script has no `--apply` flag; writes require deliberate operator action.              |

No **data-loss**, **cross-tenant-leak**, or **irreversible** risks identified.

---

## 7. Recommendation

- Approve automatic assignment for orphan #1.
- Route orphan #2 through admin review (owner: platform-eng lead) before
  applying; open a Phase 3 ticket for per-tenant clone-on-first-use.
- Approve archival for orphan #3.
- Re-triage production orphans separately once the production `--dry-run`
  completes; do not extrapolate staging outcomes to production.

---

*Analysis and repair script are dry-run only. No production data was read or modified.*
