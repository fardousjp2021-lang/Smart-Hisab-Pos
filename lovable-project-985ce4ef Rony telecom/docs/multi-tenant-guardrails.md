# Multi-Tenant Guardrails — Deployment Notes

Two guardrails from `docs/multi-tenant-dryrun-report.md` are now landed in the codebase. **Multi-tenant mode is NOT enabled** — this change ships infrastructure only, dormant until the Phase 1 migration wires it up.

## What shipped

### 1. IndexedDB isolation on workspace switch

`src/pos-app/lib/workspaceCache.ts`

- `ensureWorkspaceCacheFor(workspaceId)` — boot-time guard. On workspace mismatch: terminates Firestore, calls `clearIndexedDbPersistence(db)`, purges every workspace-scoped localStorage prefix (`pos_sync_queue_`, `pos_sync_conflicts_`, `pos_last_sync_at_`, `roni_item_audit_log_`), records the new workspace, then reloads once.
- `switchWorkspace(nextId)` — manual entry point for a future "Switch workspace" UI.
- `clearWorkspaceCache()` — internal, exported for tests.
- No-op when `workspaceId` is undefined, so the module is safe to land pre-tenancy.
- Preserved: service-worker precache (fonts, JS, HTML shells), settings mirror (`settingsSync:v1:*` is intentionally NOT purged — settings stay global), Firebase Auth session (managed by the Auth SDK, not IndexedDB persistence).

Wire-up point (Phase 1 of the migration): in `src/pos-app/context/AppContext.tsx` after auth hydration and before any Firestore listener is attached:

```ts
const cleared = await ensureWorkspaceCacheFor(user.workspaceId);
if (cleared) return; // page is reloading, abort further boot
```

### 2. Composite-index readiness gate

- `src/pos-app/lib/indexReadiness.ts` — runtime probe (`verifyRequiredIndexes()`) plus the exported source-of-truth list `REQUIRED_INDEXES` covering the four contract shapes:
  - `sales.workspaceId + date DESC`
  - `purchases.workspaceId + date DESC`
  - `products.workspaceId + categoryId ASC`
  - `imeiSales.workspaceId + imei ASC`
- `scripts/verify-firestore-indexes.mjs` — CI script with two modes:
  - **Static** (default): asserts every required composite is declared in `firestore.indexes.json`. Runs on every PR. Fast, no network.
  - **Live** (`--live`): additionally calls the Firestore Admin REST API and asserts `state === READY` per composite. Requires `GOOGLE_APPLICATION_CREDENTIALS` + `FIRESTORE_PROJECT_ID`. Run before every release.
- `firestore.indexes.json` — added the two composites that were flagged by the dry-run (R4): `sales.workspaceId+date DESC` and `purchases.workspaceId+date DESC`. All others were already declared.

Verified: `node scripts/verify-firestore-indexes.mjs` → **PASSED**.

## Updated risk assessment

| Ref | Original risk | Status after guardrails |
| :-: | --- | --- |
| R2  | Stale Firestore IndexedDB cache leaks cross-tenant rows between phases | **Closed** — `ensureWorkspaceCacheFor` clears on mismatch and reloads. Ship-blocker downgraded to "must call it during Phase 1 wire-up." |
| R4  | Missing composite index breaks list pages after enforcement | **Closed** — CI static gate blocks the PR, and `--live` gate blocks the release. Ship-blocker downgraded to "must run `--live` mode in the release pipeline." |
| R1  | `imeiSales` re-key rollback loses cross-tenant duplicates | Unchanged — mitigated by pre-migration snapshot (Phase 4 rollback checklist item). |
| R3  | Shared-device sync-queue leak | **Reduced** — the cache guard now purges `pos_sync_queue_*`, `pos_sync_conflicts_*`, `pos_last_sync_at_*` on workspace switch. Phase 4 namespacing is still recommended for defense in depth. |
| R10 | Custom-claim propagation lag | Unchanged — mitigated by forced `getIdToken(true)` in Phase 2. |
| R12 | `auditLog.ts` localStorage leak | **Reduced** — `roni_item_audit_log_*` is now in the purge list. |
| NEW-1 | Cache-clear reload loop if `clearIndexedDbPersistence` fails | New, low — mitigated by the `RELOAD_ONCE_FLAG` sessionStorage marker; a second boot with an unresolvable clear falls through without reloading again. |
| NEW-2 | CI gate stays static-only in a slow release pipeline | New, low — teams that skip `--live` mode may ship against a still-building index. Documented in the deployment checklist below. |

## Rollback notes

Both guardrails are additive and independently reversible:

- **`workspaceCache.ts`** — no import sites in Phase 0. Revert by deleting the file; nothing else changes. Once wired up (Phase 1), rollback = remove the `ensureWorkspaceCacheFor` call from `AppContext.tsx`; the module can stay for reuse.
- **`indexReadiness.ts`** — no runtime callers yet. Revert by deleting.
- **`scripts/verify-firestore-indexes.mjs`** — CI-only. Revert by deleting or by removing the CI step. `firestore.indexes.json` composite additions are safe to keep (extra indexes have write cost only, no read cost).
- **`firestore.indexes.json`** — the two added composites are inert until a query filters `workspaceId==X ORDER BY date DESC`. No query does that today, so they cost nothing at runtime; index build itself costs one background pass over the collection.

Pre-existing rollback artifacts (from the roadmap) are not affected: `firestore.rules.pre-tenancy`, Cloud Function `migrate-imei-sales-reverse`, pre-migration `imeiSales` snapshot — all remain the source of truth for the Phase 4 rollback.

## Deployment checklist

Pre-release (any release, guardrails-active):

- [ ] `node scripts/verify-firestore-indexes.mjs` passes in CI on the PR.
- [ ] `bun run build && tsgo --noEmit` passes (guardrail modules compile).

Phase 0 (this release — guardrails only):

- [ ] Deploy `firestore.indexes.json` via `firebase deploy --only firestore:indexes`.
- [ ] Wait for Firebase Console → Firestore → Indexes to report every composite **Enabled** (background build; usually minutes on small collections).
- [ ] Confirm no application code imports `workspaceCache.ts` or `indexReadiness.ts` yet (`rg 'workspaceCache|indexReadiness' src`).
- [ ] Merge & ship.

Before Phase 1 wire-up (future release):

- [ ] `ensureWorkspaceCacheFor(user.workspaceId)` added at the top of `AppContext` bootstrap, after auth hydrates.
- [ ] `verifyRequiredIndexes()` called at boot on any release that flips a client feature flag to enable workspace-scoped queries; app refuses to enable multi-tenant mode when `report.allReady === false`.

Before every release from Phase 3 onward:

- [ ] `node scripts/verify-firestore-indexes.mjs --live` (with service-account creds) passes in the release pipeline. This is the ship-blocker gate that the dry-run report identified.
- [ ] Runbook lists the two new composites and confirms they are `READY` in the Firebase Console.

Post-release monitoring:

- [ ] Firebase Console → Firestore → Rules metrics show no elevated `permission-denied` after any workspace-cache reload cascade.
- [ ] Client console shows no `failed-precondition` errors from list pages.
- [ ] Sync-queue backlog per device stays within normal band (no post-purge orphan spike).

## Files changed in this release

- **Added:** `src/pos-app/lib/workspaceCache.ts`, `src/pos-app/lib/indexReadiness.ts`, `scripts/verify-firestore-indexes.mjs`, `docs/multi-tenant-guardrails.md`.
- **Edited:** `firestore.indexes.json` (two composites added).
- **Unchanged:** business logic, routes, UI, security rules, offline sync behavior, PWA config, accounting calculations, dashboard theme.
