# Multi-Tenant (workspaceId) Migration — Checklist & Risk Assessment

> No code was modified. This document is inventory + plan only.

## TL;DR

The app is currently **single-tenant with client-side email ownership filtering** — Firestore rules let every verified user read/write all business collections. There is **no `workspaceId` concept anywhere in application code**, but `firestore.indexes.json` was already pre-authored with `workspaceId + createdAt` composites for every business collection, so index deploys are the cheapest part of the migration. The two non-trivial architectural decisions are (a) how rules will resolve "current user's workspace" (custom claim vs. `users/{uid}.workspaceId` lookup), and (b) how to keep `imeiSales/{imei}`'s atomic cross-terminal uniqueness guarantee once the doc ID must be tenant-scoped.

---

## 1. Collections requiring `workspaceId`

**Add field + backfill (Firestore auto-IDs, no re-keying):**

| Collection | Notes |
| --- | --- |
| `products` | `createdByEmail` only today |
| `sales` | `recordedByEmail` only today |
| `sales_returns` | none today |
| `purchases` | none today |
| `expenses` | none today |
| `stockMovements` | `recordedByEmail` only today |
| `issues` | see open question — could stay per-user like notifications |
| `customers` | none today |
| `suppliers` | none today |
| `quotations` | caller-supplied IDs (`QTE-203`) — see §8 collision risk |

**Add field to `users/{uid}` and `registrations/{email}`** so an admin can assign a workspace at approval time. `businessName`/`businessType` already collected at registration would seed the workspace record.

**Stay global — do NOT scope:**

| Collection | Reason |
| --- | --- |
| `settings/{docId}` | system-wide config (registration mode, whitelist) |
| `registrations/{email}` | pre-tenant-assignment signup flow |
| `notifications/{noteId}` | keyed by user email, per-user by design |
| `adminApprovalLogs` | platform-level admin audit |

**Deterministic-ID special case — `imeiSales/{imei}`:**
Doc ID is the raw IMEI; global uniqueness is enforced by Firestore's `create` atomicity as an anti-double-sale mechanism. Either:
- **Option A (safer):** re-key to `{workspaceId}_{imei}` — a doc-ID migration, not a backfill. Preserves per-tenant atomicity, loses cross-tenant uniqueness (which is fine — different shops can legitimately sell devices with the same serial).
- **Option B (weaker):** keep flat ID, add `workspaceId` field, enforce scoping only in rules — no longer uses Firestore's native atomic-create trick for uniqueness.

Option A is recommended.

## 2. Queries and indexes to change

**Add `where('workspaceId','==',ws)` as the leading equality clause:**

- `AppContext.tsx:506` — `onSnapshot(collection(db,'products'))`
- `AppContext.tsx:544-549` — sales window: `where('date','>=', …), orderBy('date','desc'), limit(2000)`
- `salesPagination.ts:47-53` — `where('date','<', before), orderBy('date','desc')`
- `AppContext.tsx:581` — `stockMovements` bare snapshot
- `Contacts.tsx:194,200` — `customers`, `suppliers`
- `App.tsx:1082` — `quotations`
- `AppContext.tsx:612` — `issues` (pending decision)
- All `getDoc`/`tx.get` doc-id lookups in `AppContext.tsx` and `salesSyncQueue.ts` — no query change, but rules must verify `resource.data.workspaceId == userWorkspace()` on read/update/delete.

**Index changes vs. `firestore.indexes.json`:**

- Already present and correct: every `workspaceId + createdAt` / `+ status + createdAt` / `+ customerId + createdAt` / `+ supplierId + createdAt` composite for the business collections. These become active as soon as the queries add the `workspaceId` clause.
- **Missing (must add before enforcement):**
  - `sales`: `workspaceId ASC + date DESC` — the sales window and pagination queries key off `date`, not `createdAt`. Without this composite the queries fail post-migration.
  - Same `workspaceId + date` shape needed anywhere else the code sorts by `date` (recheck `stockMovements`, `sales_returns` if any date-ordered listing is added).
- Present but unused today (safe to keep, cost-of-write only): `products.workspaceId+categoryId/supplierId/status/expiryDate/serialNumber`; `issues.workspaceId+customerId` (issues has no `customerId` field today).

## 3. Security rules changes

Current: `firestore.rules` has `isAdmin()` (lines 9-13) and `emailVerified()` (14-16) helpers only. No `userWorkspace()` equivalent exists.

**Required additions:**

1. **Resolve current user's workspace.** Two options — pick one before writing any rule change:
   - *Custom claim* (`request.auth.token.workspaceId`) — set by Cloud Functions at approval/assignment time, mirrors how `admin` is already handled. Fast, no extra reads.
   - *Firestore lookup* (`get(/databases/.../users/$(request.auth.uid)).data.workspaceId`) — no infra, but 1 extra billed read per rule evaluation.
2. **`userWorkspace()` helper** returning the chosen source.
3. **Per-collection changes** for `products`, `sales`, `sales_returns`, `purchases`, `expenses`, `stockMovements`, `issues`, `customers`, `suppliers`, `quotations`:
   ```
   allow read: if emailVerified() && resource.data.workspaceId == userWorkspace();
   allow create: if emailVerified() && request.resource.data.workspaceId == userWorkspace();
   allow update, delete: if emailVerified() && resource.data.workspaceId == userWorkspace();
   ```
4. **`imeiSales/{imei}`** (rules:89-96) — currently `emailVerified()`-only, no tenant check. Under Option A the doc ID `{workspaceId}_{imei}` self-verifies via a `docId.matches('^' + userWorkspace() + '_.*')` guard; under Option B the `workspaceId` field must be checked on both read and create.
5. **`users/{uid}`** (rules:68-80) — add `workspaceId` to the list of fields the user cannot self-modify (currently only `isAdmin` is protected).
6. Global collections (`settings`, `registrations`, `notifications`, `adminApprovalLogs`) — unchanged.

## 4. Offline-sync queue impact

`src/pos-app/salesSyncQueue.ts` — all 8 `SyncKind` variants (`sale, stock, purchase, expense, customer, supplier, quotation, return`) write payloads that do **not** carry a `workspaceId` field today. `SyncItem.payload: any` (line 24-41) makes threading it in mechanical, but every enqueue call site and every `writeItem` branch must be updated:

- **All enqueue call sites** must attach `workspaceId` from the active session (from `AppContext`) at enqueue time — NOT at flush time, because a device may be offline for hours and the "current workspace" at flush must equal the one at enqueue (e.g. staff changing shifts between tenants on a shared device).
- **`writeItem`** must validate the payload carries `workspaceId` and reject/quarantine items that don't (belt-and-braces).
- **`imeiSales` transactional path** (:442-519) — the doc ref changes from `doc(db,'imeiSales', imei)` to `doc(db,'imeiSales', workspaceId + '_' + imei)` under Option A, and the reservation payload gains `workspaceId`.
- **Sale-return path** (:486-519) — the parent `sales` doc `tx.get`/`tx.update` must verify workspaceId match or refuse to release IMEIs, otherwise a cross-tenant token replay could release another shop's reservations.

**localStorage keys that need workspace namespacing:**

- `pos_sync_queue_v2` (line 6) — bump to `pos_sync_queue_v3:{workspaceId}` or introduce a per-user prefix; otherwise queued items from one workspace flush under another workspace's session on a shared device.
- `pos_sync_conflicts_v1` (line 654) — same issue.
- `pos_last_sync_at_v1` (line 430) — same.
- `roni_item_audit_log_v1` (`auditLog.ts:27`) — same (lower stakes, human-readable log only).
- `settingsSync.ts` keys (`settingsSync:v1:{docId}`) — no change; settings stay global.

## 5. Reports and dashboards

**Zero direct Firestore calls** in `src/routes/reports.tsx`, `src/routes/accounting.tsx`, `Dashboard.tsx`, `Reports.tsx`, `Accounting.tsx` — all consume pre-fetched arrays from `AppContext.useApp()`. Once `AppContext`'s listeners (§2) are workspace-scoped, every downstream KPI, chart, and aggregation is automatically correct with no per-report change. **Verification step required post-migration:** open each dashboard with two tenant accounts on the same browser (after cache clear) and confirm no cross-tenant rows.

## 6. Data migration for existing users and data

**Backfill script** (one-off admin-run Cloud Function or `firebase-admin` node script):

1. Assign every existing `users/{uid}` doc a `workspaceId` (derive from `businessName`/`businessType` groupings, or run manual admin CSV mapping if multiple shops share the current single tenant).
2. Mirror the assignment onto `registrations/{email}` for pending signups.
3. For each business collection, iterate every doc and `updateDoc({ workspaceId: <owner's workspaceId> })`. Ownership is derived from `createdByEmail`/`recordedByEmail` → `users` lookup.
4. **`imeiSales`** requires a doc-copy migration under Option A: read every existing doc, write a new one at `{workspaceId}_{imei}`, then delete the old flat-ID doc. Do this in a Cloud Function with a transaction per IMEI to avoid mid-migration double-sells.
5. **Client cache invalidation**: bump a `dataSchemaVersion` value read at app boot; on mismatch, call `clearIndexedDbPersistence()` and clear `localStorage` sync-queue keys before letting the app resume. Without this, devices that were online during the single-tenant era will keep serving stale unscoped rows from the Firestore IndexedDB cache.

**Rules deploy sequence** (order matters — do NOT flip enforcement first):

1. Add `workspaceId` field to writes (dual-write phase, still no rule enforcement).
2. Deploy missing indexes (`workspaceId + date` on sales, etc.).
3. Run backfill until 100% coverage confirmed by admin dashboard.
4. Deploy new rules that require `workspaceId == userWorkspace()`.
5. Ship client build with `where('workspaceId','==',ws)` added to all queries in the same release.
6. Bump `dataSchemaVersion` to force cache clear.

## 7. Risk assessment

| # | Risk | Severity | Mitigation |
| - | --- | :-: | --- |
| R1 | `imeiSales` doc-ID collision loses cross-tenant uniqueness during Option A migration cutover — a device could double-sell between old flat IDs and new prefixed IDs | **High** | Freeze new sales during the imeiSales copy step, or run copy under a transaction that writes both IDs until cutover completes. |
| R2 | Firestore IndexedDB persistent cache serves stale cross-tenant data after rules flip | **High** | `dataSchemaVersion` boot check + `clearIndexedDbPersistence()` + reload before hydrating auth. |
| R3 | Offline sync queue on shared device flushes wrong tenant's payloads | **High** | Namespace `pos_sync_queue_*` and `pos_sync_conflicts_*` by workspaceId; refuse to flush items whose payload workspaceId ≠ current session workspaceId. |
| R4 | Missing `workspaceId + date` composite index breaks Sales list & pagination immediately after enforcement | **High** | Deploy the two missing composites (`sales.workspaceId+date`, plus any other date-ordered listings) **before** the rules flip. |
| R5 | `customers`/`suppliers`/`quotations` caller-supplied IDs collide between tenants (`QTE-1` reused) | Medium | Verify ID generators in `Products.tsx`/`Contacts.tsx`/`Quotations.tsx` (open question 1) — switch to Firestore auto-IDs or prefix with workspaceId. |
| R6 | Backfill assigns wrong workspaceId to legacy rows if `createdByEmail`/`recordedByEmail` → user mapping is ambiguous (email changed, user deleted, etc.) | Medium | Dry-run backfill, output unassigned-doc report for admin review before commit. |
| R7 | Rules-lookup option (`get(/databases/.../users/{uid})`) doubles per-request cost and adds latency | Medium | Prefer custom-claim option; set claim at approval-time Cloud Function. |
| R8 | `users/{uid}` rule doesn't currently protect `workspaceId` from self-mutation; users could rewrite their own workspace after migration | Medium | Add `workspaceId` to the `diff().affectedKeys()` block (rules:73-77) alongside `isAdmin`. |
| R9 | Sale-return path releases another tenant's IMEI reservations by ID guess | Medium | Add workspaceId equality check inside the return transaction, not just at rule layer. |
| R10 | Reports & dashboards silently show empty state to users whose workspaceId claim hasn't propagated yet (custom claims can lag by up to 1h without forced token refresh) | Low-Medium | Call `user.getIdToken(true)` immediately after workspace assignment; retry once on first empty snapshot. |
| R11 | `issues` scoping decision (workspace vs. per-user) affects support ticket visibility | Low | Product decision required before rule authoring. |
| R12 | `auditLog.ts` localStorage leaks tenant activity history on shared devices | Low | Namespace `roni_item_audit_log_v1` by workspaceId; clear on sign-out. |
| R13 | Vite dev-mode super-admin bypass masks rule regressions in local testing | Low | Run migration E2E tests against a production build (see `docs/auth-route-protection-report.md`). |

## 8. Open questions blocking implementation

1. `customers`/`suppliers`/`quotations` ID generation — auto vs. sequential? (§8, R5)
2. `issues` — workspace-scoped or per-user global? (R11)
3. Rule workspace resolution — custom claim or Firestore lookup? (§3, R7)
4. `imeiSales` — Option A (re-key) or Option B (field-only)? (§1, R1)
5. Are any users today expected to belong to more than one workspace? Current inventory assumes 1:1 user→workspace; a many-to-many model would require a separate `memberships` collection and rewrite the rule helper.

## 9. Suggested migration order

```
Phase 0 — Design decisions (this document + answers to §8)
Phase 1 — Add workspaceId to writes (dual-write, no rule change)
Phase 2 — Deploy missing indexes (workspaceId+date on sales, etc.)
Phase 3 — Backfill existing docs; verify 100% coverage
Phase 4 — Namespace localStorage sync queue + bump dataSchemaVersion
Phase 5 — Ship client with workspace-scoped queries + cache-clear boot check
Phase 6 — Flip rules to enforce workspaceId equality (staged: read-first, then write)
Phase 7 — imeiSales re-key migration (Option A) under freeze window
Phase 8 — Post-launch verification: cross-tenant E2E, dashboard sanity, cost audit
```

## Files reviewed (no changes made)

`src/pos-app/context/AppContext.tsx`, `src/pos-app/salesSyncQueue.ts`, `src/pos-app/salesPagination.ts`, `src/pos-app/lib/settingsSync.ts`, `src/pos-app/lib/auditLog.ts`, `src/pos-app/firebase.ts`, `src/pos-app/components/Contacts.tsx`, `src/pos-app/components/AdminPanel.tsx`, `src/pos-app/App.tsx`, `src/routes/admin.health.tsx`, `firestore.rules`, `firestore.indexes.json`, `vite.config.ts`.
