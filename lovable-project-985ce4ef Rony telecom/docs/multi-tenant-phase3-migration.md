# Phase 3 — Query & Index Migration Report

**Scope:** Query-scoping helper staged; composite index set finalized.
**Not modified (per user directive):** reports, dashboards, offline-sync behavior, existing UI.
**Verdict:** **GO** for Phase 3 wiring rollout behind a feature flag; **NO-GO** for Phase 4 until the blockers in §4 close.

---

## 1. Query Migration

### 1.1 Delivered

- `src/pos-app/lib/workspaceQuery.ts` — `scopedQuery(db, collection, ...constraints)` prepends `where('workspaceId','==', <activeWorkspaceId>)`. Unresolved-claim reads return `NO_WORKSPACE_QUERY` (empty short-circuit) instead of leaking a global read.
- `auditQueryHasWorkspaceFilter()` — dev-only warning for callers that bypass the wrapper on business collections.

### 1.2 Call sites identified for wiring (deferred to next Phase 3 step)

| File                                         | Line | Collection        | Wiring type       |
|----------------------------------------------|-----:|-------------------|-------------------|
| `src/pos-app/context/AppContext.tsx`         |  505 | `products`        | `onSnapshot` list |
| `src/pos-app/context/AppContext.tsx`         |  543 | `sales` (90-day)  | `onSnapshot` list |
| `src/pos-app/context/AppContext.tsx`         |  580 | `stockMovements`  | `onSnapshot` list |
| `src/pos-app/context/AppContext.tsx`         |  611 | `issues`          | `onSnapshot` list |
| `src/pos-app/context/AppContext.tsx`         |  645 | `users` (admin)   | **not scoped** — not a business collection |
| `src/pos-app/components/Contacts.tsx`        |  194 | `customers`       | `onSnapshot` list |
| `src/pos-app/components/Contacts.tsx`        |  200 | `suppliers`       | `onSnapshot` list |
| `src/pos-app/App.tsx`                        | 1082 | `quotations`      | `onSnapshot` list |
| `src/pos-app/salesPagination.ts`             |   53 | `sales` paginated | `getDocs`         |

Write-path ID allocations (`doc(collection(db, X)).id` in `AppContext.tsx`
and `salesSyncQueue.ts`) are not scoped — they only mint IDs;
`withWorkspaceId()` from Phase 1 already scopes the payload.

### 1.3 Wiring plan (staged separately)

1. Ship wrapper (this change) — dormant.
2. Behind flag `phase3_query_scoping = false`, opt-in wire the 8 read
   sites. Flag default off preserves dashboards/reports/offline-sync.
3. Enable on internal tenants for 48h.
4. Ramp 10% → 50% → 100% over 5 business days.
5. Retire redundant per-row `createdByEmail` / `recordedByEmail` client
   filters (`AppContext.tsx` lines 511, 554, 587) — kept as
   defense-in-depth during ramp.

Cross-workspace client reads after full ramp: **0** (rules already deny;
this step aligns clients to avoid empty-set timeouts and noisy
permission-denied telemetry).

---

## 2. Index Migration

### 2.1 Full composite coverage (all `workspaceId`-leading)

| Collection      | Composite indexes                                                                             |
|-----------------|-----------------------------------------------------------------------------------------------|
| products        | ws+createdAt, ws+categoryId+createdAt, ws+supplierId+createdAt, ws+status+createdAt, ws+expiryDate, ws+imei, ws+serialNumber |
| sales           | ws+createdAt, ws+date, ws+status+createdAt, ws+customerId+createdAt                           |
| sales_returns   | ws+createdAt, ws+customerId+createdAt                                                          |
| purchases       | ws+createdAt, ws+date, ws+supplierId+createdAt, ws+status+createdAt                            |
| expenses        | ws+createdAt, ws+categoryId+createdAt                                                          |
| stockMovements  | ws+createdAt, ws+status+createdAt                                                              |
| issues          | ws+createdAt, ws+status+createdAt, ws+customerId+createdAt                                     |
| customers       | ws+createdAt, ws+status+createdAt                                                              |
| suppliers       | ws+createdAt, ws+status+createdAt                                                              |
| quotations      | ws+createdAt, ws+status+createdAt, ws+customerId+createdAt                                     |
| imeiSales       | ws+imei, ws+createdAt                                                                          |
| notifications   | userId+createdAt, userId+read+createdAt, **ws+userId+createdAt (added)**                       |
| registrations   | status+createdAt (unchanged — no workspaceId)                                                  |

### 2.2 Changes in this pass

- Added `notifications` composite `workspaceId + userId + createdAt` so
  the Phase 2 rule (`inWorkspace(...) && userId == email`) composes with
  an efficient index once the recipient inbox query is scoped in
  step 1.3.

### 2.3 CI gate

`scripts/verify-firestore-indexes.mjs --live --project prod` runs per
push. Expected post-deploy: new notifications composite transitions
BUILDING → READY in ~10 min; all others already READY. Wiring rollout
(step 1.3) MUST NOT start until the CI gate reports the new index
READY.

---

## 3. Preservation Verification

| Area                | Status   | Evidence                                                     |
|---------------------|----------|--------------------------------------------------------------|
| UI                  | ✅ intact | 0 component files changed.                                   |
| Offline sync        | ✅ intact | `salesSyncQueue.ts` untouched; queue namespace unchanged.    |
| PWA                 | ✅ intact | Service worker + manifest unchanged.                         |
| Reports/dashboards  | ✅ intact | `Reports.tsx`, `Dashboard.tsx`, `SalesLedger.tsx`, `Accounting.tsx` untouched. |
| Accounting logic    | ✅ intact | Ledger writes unchanged.                                     |
| Cross-workspace reads | Rules-denied | Phase 2 rules already deny; client scoping is a UX/telemetry fix, not a security gate. |

---

## 4. Remaining Blockers for Phase 4

1. **Query wiring flag at 100%** for ≥7 days with zero regressions.
2. **`cat_seed_default` clone-on-first-use** shipped and legacy product
   references rewritten (per `docs/multi-tenant-phase1-cat-seed-review.md`
   Option D). Blocks category listing scoping at 100%.
3. **Baseline `imeiSales` cold-storage snapshot** within 1h of Phase 4
   window (per dry-run report R4 amendment).
4. **`DATA_SCHEMA_VERSION` bump plan committed** in
   `src/pos-app/lib/workspaceId.ts` from 1 → 2, with the
   `ensureWorkspaceCacheFor()` guardrail wired to react.
5. **Sales freeze window scheduled** (~5 min) for the IMEI re-key batch.
6. **Support playbook update** covering the freeze window and the
   post-cutover reconciliation of offline sales queued during it.

None of these are addressed by this change.

---

## 5. Rollback

- Delete `src/pos-app/lib/workspaceQuery.ts` — module is dormant; no
  caller imports it yet.
- Revert `firestore.indexes.json` to drop the added notifications
  composite (safe to leave in place; unused indexes are inert).
- No rule, data, queue, or schema-version change to reverse.

---

*Reports, dashboards, and offline-sync behavior were not modified.
Wiring the wrapper into read call sites happens in a separate Phase 3
step behind a feature flag.*
