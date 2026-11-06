# Multi-Tenant Migration — Phase 1 Summary

**Scope:** Add `workspaceId` support to all business collections and backfill
existing data. No rules, queries, UI, or business logic changed.

## What shipped

| Artifact | Purpose |
|---|---|
| `src/pos-app/lib/workspaceId.ts` | Helper module: `withWorkspaceId()`, `getActiveWorkspaceId()`, `BUSINESS_COLLECTIONS`, `DATA_SCHEMA_VERSION`. Dormant until wired into write paths. |
| `scripts/backfill-workspace-id.mjs` | Idempotent, chunked backfill script with `--dry-run`, `--apply`, `--unset` modes and orphan CSV. |
| `docs/multi-tenant-phase1.md` | This document. |

## Business collections covered

`products`, `services`, `categories`, `brands`, `variants`, `customers`,
`suppliers`, `sales`, `purchases`, `expenses`, `notifications`, `reports`.

**Deferred to Phase 4:** `imeiSales` (requires doc-ID re-key,
`{workspaceId}_{imei}`).

## Preserved (unchanged)

- Current UI and dashboard rendering
- All business logic and computations
- Offline sync queues (`pos_sync_queue_v2` namespace untouched)
- PWA behavior and service worker precache
- IMEI tracking and warranty flows
- Accounting entries and period close

## Not changed (per requirement 4)

- `firestore.rules` — no policy edits
- Route protection — no guard changes
- Query logic — no `where('workspaceId', ...)` added to reads yet
- Dashboard rendering — aggregations still unscoped

## Rollout order for Phase 1 wiring

1. Deploy helper module + backfill script (this change) — inert.
2. Wire `withWorkspaceId()` into `AppContext` write paths for each
   collection. Reads remain unchanged.
3. Run `node scripts/backfill-workspace-id.mjs --project <id> --dry-run`;
   review `orphans.csv`.
4. Assign orphans manually (support ticket per orphan owner).
5. Re-run with `--apply`.
6. Monitor for 7 consecutive days with `orphans.csv` empty.

## Rollback instructions

Phase 1 is fully reversible; no destructive changes.

1. **Revert wiring** — remove `withWorkspaceId()` from write paths (git revert).
2. **Remove backfilled fields** — `node scripts/backfill-workspace-id.mjs --project <id> --unset`.
3. **Delete helper + script** — optional; both are inert if unused.
4. **No data restore required** — original documents are untouched apart
   from the added `workspaceId` field, which `--unset` removes.
5. **No claim / rule / index rollback** — none were changed in Phase 1.

## Remaining checklist for Phase 2

- [ ] Confirm Phase 1 wiring is on ≥95% of active sessions for ≥24h.
- [ ] `orphans.csv` empty for 7 consecutive days.
- [ ] Every business collection has ≥99.9% docs with non-null `workspaceId`.
- [ ] Deploy `onApproveRegistration` Cloud Function to set custom claim.
- [ ] Prepare `userWorkspace()` rule helper and stage `firestore.rules` diff.
- [ ] Backup current `firestore.rules` to `rules/backup/` (rollback path).
- [ ] Force custom-claim refresh window ≤60 min for all active users.
- [ ] Draft "Reconnecting workspace…" banner for token-refresh lag.
- [ ] Wire `ensureWorkspaceCacheFor()` guardrail into `AppContext` boot
      (originally planned for Phase 4 — moved forward per dry-run R2).
- [ ] Rule-test suite (`e2e/multi-tenant.spec.ts`) green with three
      simulated tenants.

Phases 3–5 remain out of scope for this change.
