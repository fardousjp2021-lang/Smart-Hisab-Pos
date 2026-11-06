# Multi-Tenant Support — Phased Implementation Roadmap

> Companion document to `docs/multi-tenant-migration-plan.md`. This roadmap is planning-only; no code has been modified. Prerequisites: the five open design questions in that document (§8) must be answered before Phase 1 starts. This roadmap assumes:
>
> - **Q1** IDs → Firestore auto-IDs everywhere (or workspace-prefixed if kept human-readable).
> - **Q2** `issues` → workspace-scoped (not per-user).
> - **Q3** Rule workspace resolution → **custom claim** (`request.auth.token.workspaceId`), set by a Cloud Function at approval time. Rationale: no per-read Firestore cost, mirrors how `admin` claim already works.
> - **Q4** `imeiSales` → **Option A**, doc ID re-keyed to `{workspaceId}_{imei}` to preserve atomic cross-terminal uniqueness within a tenant.
> - **Q5** One user belongs to exactly one workspace (1:1). Many-to-many is out of scope for v1.

If any of these change, the roadmap must be re-scoped before implementation.

---

## Phase 1 — Add `workspaceId` fields and generate backfill scripts

**Goal:** every new document written to Firestore carries a `workspaceId`, and every existing document is backfilled. Rules and queries remain unchanged; this is a pure dual-write phase.

**Risk level:** Low-Medium. Reversible, no user-visible behavior change, no rule enforcement. Main risk is silently mis-tagging documents with the wrong workspace during backfill (R6).

**Required code changes:**

- `src/pos-app/context/AppContext.tsx` — expose `currentWorkspaceId` derived from `users/{uid}.workspaceId` in the auth state; add loading gate so no writes happen before it resolves.
- `src/pos-app/salesSyncQueue.ts` — every `enqueue*` function attaches `workspaceId` to the payload at enqueue time (not flush time). `writeItem` refuses to write payloads missing `workspaceId` and quarantines them.
- All write call sites (`AppContext.tsx`, `Contacts.tsx`, `Products.tsx`, `Sales.tsx`, `Purchases.tsx`, `Accounting.tsx`, `Quotations.tsx`, etc.) — pass `workspaceId` into the create/update payload.
- New `users/{uid}.workspaceId` field, admin-assignable via the Admin Panel.
- New `registrations/{email}.workspaceId` field, set by admin at approval time.
- Cloud Function `onApproveRegistration` that sets the `workspaceId` custom claim on the Firebase Auth user (claim not read by rules yet, prepared for Phase 2).
- New `dataSchemaVersion` constant in the client, initially `1`; bump to `2` at Phase 4 cutover.

**Data migration requirements:**

- **Backfill script** (`scripts/backfill-workspace-id.ts`, run via `firebase-admin` under a service account):
  1. Load `users` → build `{ email → workspaceId }` map.
  2. For each business collection (`products`, `sales`, `sales_returns`, `purchases`, `expenses`, `stockMovements`, `issues`, `customers`, `suppliers`, `quotations`), iterate every doc and set `workspaceId` derived from `createdByEmail`/`recordedByEmail` → map lookup. Docs with no ownership metadata land in an `orphans.csv` for admin review.
  3. Rerun daily as an idempotent no-op until Phase 5 cutover, catching any late-created docs the client shipped before the release.
- **`imeiSales` deferred to Phase 4** — do NOT re-key in Phase 1.
- **Dry-run mode** first (`--dry-run` flag prints counts + `orphans.csv` without writing).

**Rollback strategy:**

- Roll back the client release — dual-write is additive; the extra field is harmless to old readers.
- The backfill sets an extra field; a reverse script (`unset workspaceId`) can strip it if needed, but this is rarely necessary because Phase 2 hasn't enforced anything yet.

**Offline sync / IMEI impact:**

- **Offline sync:** low. Queue payloads gain a field. Any in-flight items enqueued by an older client version will lack `workspaceId` and quarantine on flush — this is intentional (they need admin re-attribution) but may show as a small backlog spike on rollout day. Mitigation: run the backfill script every hour during the rollout window so orphans are visible.
- **IMEI reservations:** none. `imeiSales` doc shape and doc ID are unchanged in Phase 1.

---

## Phase 2 — Update Firestore security rules

**Goal:** rules require `workspaceId == request.auth.token.workspaceId` on every business collection. Client queries are still unscoped at this point — they'll break for cross-tenant reads (which is the intent).

**Risk level:** **High.** This is the enforcement flip. If Phase 1 backfill isn't at 100% coverage, users lose access to their own data. If custom claims haven't propagated, users see empty screens for up to an hour.

**Required code changes:**

- `firestore.rules`:
  - Add `userWorkspace()` helper reading `request.auth.token.workspaceId`.
  - For each of `products`, `sales`, `sales_returns`, `purchases`, `expenses`, `stockMovements`, `issues`, `customers`, `suppliers`, `quotations`: `allow read/create/update/delete` predicates require `workspaceId == userWorkspace()`.
  - `imeiSales` — add `workspaceId` field check (doc ID re-key still deferred to Phase 4).
  - `users/{uid}` — add `workspaceId` to the `affectedKeys()` blocklist so users can't self-modify.
  - Global collections (`settings`, `registrations`, `notifications`, `adminApprovalLogs`) unchanged.
- Cloud Function that runs `admin.auth().setCustomUserClaims(uid, { admin?, workspaceId })` at approval-time (from Phase 1) is required, not optional, in Phase 2.
- Client hook that calls `user.getIdToken(true)` on first empty snapshot to force-refresh a stale claim (R10 mitigation).
- **Staged rollout:** deploy read-enforcement first, then write-enforcement 24-48 h later so any orphan reads surface as errors before writes lock down.

**Data migration requirements:**

- **Prerequisite verification** (block the deploy if not met):
  - `orphans.csv` from Phase 1 backfill is empty.
  - Every `users/{uid}` has a `workspaceId`.
  - Every active user has been re-issued a token with the workspaceId claim within the last 60 minutes (script: iterate users, `setCustomUserClaims`, log timestamp).
- No new data writes in Phase 2 itself.

**Rollback strategy:**

- Revert `firestore.rules` to the Phase 1 version (`firebase deploy --only firestore:rules` from the previous git SHA). Effect is immediate.
- Keep the previous rules file committed as `firestore.rules.pre-tenancy` for rapid rollback via one command.
- Client code unchanged in this phase, so no client rollback needed.

**Offline sync / IMEI impact:**

- **Offline sync:** **High.** Every queued write from Phase 1's dual-write window carries `workspaceId`, so Phase 2 rules accept them. But: any device whose Firebase token hasn't refreshed since the claim was set will fail every write with `permission-denied` — those failures land in `pos_sync_conflicts_v1` and confuse users. Mitigation: bundle a client-side `getIdToken(true)` on app boot in the Phase 2 client release.
- **IMEI reservations:** Medium. `imeiSales` creates now require `workspaceId` match — a token-refresh lag means IMEIs can't be reserved for up to 60 min. Mitigation: same forced token refresh; add a UI banner during rollout window ("Signing you in to your workspace…") if the claim is missing.

---

## Phase 3 — Update Firestore indexes and client queries

**Goal:** every client query attaches `where('workspaceId','==',ws)` as the leading equality clause, and the corresponding composite indexes are live.

**Risk level:** Medium. Missing indexes cause `failed-precondition` errors on list pages the moment the client ships — very visible, but fully reversible by client-only rollback.

**Required code changes:**

- `firestore.indexes.json` — add the two known-missing composites:
  - `sales`: `workspaceId ASC + date DESC` (used by `AppContext.tsx:544-549` sales window and `salesPagination.ts:47-53`).
  - Audit any other `date`-ordered listings and add analogous composites (`stockMovements`, `sales_returns` if date-sorted UIs exist).
  - Deploy indexes **before** client release: `firebase deploy --only firestore:indexes` and wait for all to report **Enabled** in the console.
- Client queries — add `where('workspaceId','==',currentWorkspaceId)` to every location listed in the migration plan §2:
  - `AppContext.tsx:506, 544, 581, 612`
  - `salesPagination.ts:47`
  - `Contacts.tsx:194, 200`
  - `App.tsx:1082`
  - Any newly-added `date`-ordered listings.
- Add a boot guard: if `currentWorkspaceId` isn't resolved, skip all snapshot subscriptions (never issue an unscoped query).

**Data migration requirements:**

- None. Data is already tagged (Phase 1) and rules already enforce (Phase 2). This phase only changes the client's read shape.

**Rollback strategy:**

- Client-only revert to the Phase 2 client (unscoped queries + enforced rules). The unscoped queries will now be **rejected by the Phase 2 rules** (they'd need to read cross-tenant docs) — so the rollback path is either:
  1. Ship a follow-up client that reads *only their own workspace* using in-memory filtering rather than server `where` (temporary, degraded performance, correct results).
  2. Or revert both Phase 3 client and Phase 2 rules simultaneously to Phase 1.
- Indexes can be left in place (extra indexes have write cost only, no read cost).

**Offline sync / IMEI impact:**

- **Offline sync:** Low. Sync queue writes are already workspace-scoped from Phase 1; this phase only changes reads.
- **IMEI reservations:** Low. Read-side change only. `imeiSales` doc ID lookup still uses the flat IMEI in Phase 3 (re-keying is Phase 4).

---

## Phase 4 — Update offline sync queues (including IMEI re-key)

**Goal:** localStorage sync-queue keys are namespaced per workspace, `imeiSales` doc IDs are migrated to `{workspaceId}_{imei}`, and cache is force-invalidated via `dataSchemaVersion` bump.

**Risk level:** **High.** This is the second architectural cutover after Phase 2. The `imeiSales` re-key requires a freeze window on sales to avoid double-sells during migration (R1). Cache invalidation on production devices is visible (brief re-hydration wait).

**Required code changes:**

- `src/pos-app/salesSyncQueue.ts`:
  - Rename `pos_sync_queue_v2` → `pos_sync_queue_v3:{workspaceId}` (leave a one-time migrator that reads the old key, tags items with the current workspace, writes to the new key, and deletes the old).
  - Same for `pos_sync_conflicts_v1` and `pos_last_sync_at_v1`.
  - `writeItem` for `kind: 'sale'` and `kind: 'return'`:
    - Change `doc(db,'imeiSales', imei)` → `doc(db,'imeiSales', workspaceId + '_' + imei)`.
    - Sale-return transaction verifies `parentSale.data.workspaceId === payload.workspaceId` before releasing IMEIs (R9).
  - Reject-and-quarantine any queued item whose `payload.workspaceId !== currentWorkspaceId` on flush (shared-device safety, R3).
- `src/pos-app/lib/auditLog.ts` — namespace `roni_item_audit_log_v1` → `…:{workspaceId}` with the same one-time migrator (R12).
- `settingsSync.ts` unchanged (settings stay global).
- Bump `dataSchemaVersion` from `1` → `2`. On boot, if the stored version < `2`:
  1. `await terminate(db)` then `await clearIndexedDbPersistence(db)`.
  2. Clear the old un-namespaced localStorage keys.
  3. Reload once.
- Cloud Function `migrate-imei-sales`:
  1. Freeze new sales for the migration window (feature flag in `settings/system` read by the client — sales button disabled with "System maintenance" banner).
  2. Iterate every `imeiSales` doc. For each, look up owning workspace via `sales/{saleId}.workspaceId`, then in a transaction: `create({workspaceId}_{imei}` with same fields, `delete` flat-IMEI doc.
  3. Unset the freeze flag.

**Data migration requirements:**

- One-shot `imeiSales` doc-copy migration (above), run under a freeze window (typically < 5 min for tens of thousands of reservations).
- Client-side one-time localStorage migrator (self-executing on first boot after Phase 4 client ships).
- Client-side IndexedDB clear via `dataSchemaVersion` bump (self-executing).

**Rollback strategy:**

- **imeiSales re-key rollback is asymmetric and dangerous.** If Phase 4 must be rolled back after the doc-copy migration, a reverse Cloud Function must copy `{workspaceId}_{imei}` docs back to flat `{imei}` docs — but any IMEI that collides across tenants (which Option A permits and legitimately expects) can't be represented in the flat schema. Any such collision means one tenant's reservation is lost on rollback.
- Mitigation: ship Phase 4 only after 24 h of Phase 3 stability. Keep the migration script's `orphans.csv` and pre-migration snapshot of `imeiSales` in cold storage for a manual recovery path.
- Client rollback (localStorage / IndexedDB changes) is safe — the client re-writes both key formats during transition, and clearing IndexedDB just forces a re-fetch.

**Offline sync / IMEI impact:**

- **Offline sync:** **High.** The rollout requires all devices to reload once after Phase 4 client ships. Queued items from before Phase 4 are migrated into the new namespaced key by the one-time migrator on boot; verify with an admin dashboard sync-queue count before/after.
- **IMEI reservations:** **Highest impact of any phase.** Sales are frozen during the doc-copy window. During the freeze, offline devices continue to queue sales locally but cannot flush — the sync UI shows "Waiting for maintenance to complete." Post-freeze, they flush against the new doc-ID scheme automatically. Communicate the freeze window in advance to shop managers.

---

## Phase 5 — Update reports, analytics, and dashboards

**Goal:** verify every KPI, chart, and export is workspace-correct end-to-end. Add tenant-selection UI for platform admins who legitimately need cross-tenant views (billing, support).

**Risk level:** Low. All reports consume in-memory context arrays that are already scoped by Phase 3. This phase is mostly verification + admin-only cross-tenant tooling.

**Required code changes:**

- `src/routes/reports.tsx`, `src/routes/accounting.tsx`, `Dashboard.tsx`, `Reports.tsx`, `Accounting.tsx`:
  - No aggregation changes required (they consume `useApp()` arrays).
  - Add a "Workspace: <name>" chip in the page header so users can confirm what they're looking at.
  - Guard exports (CSV/Excel/PDF) to include the workspace name in the file name and header.
- New Admin Panel section for platform superadmins ("Cross-tenant view"):
  - Uses `admin`-claim path (unchanged rule) to read across tenants.
  - Read-only — no writes.
  - Explicitly labeled to prevent confusion with tenant admins.
- Add an E2E test suite (`e2e/multi-tenant.spec.ts`, prod-build only) that signs in as user A (workspace 1), records the visible sales/product/customer counts, signs out, signs in as user B (workspace 2), and asserts zero overlap.
- Bump `docs/auth-route-protection-report.md` with the new test suite results.

**Data migration requirements:**

- None. This phase is verification + tooling.

**Rollback strategy:**

- Client-only revert. No data or rule changes.

**Offline sync / IMEI impact:**

- **Offline sync:** none. Reports are read-only.
- **IMEI reservations:** none.

---

## Cross-phase dependencies and sequencing

```
Phase 1 ─────────────────► dual-write, backfill (weeks 1-2)
             │
             ▼
        Phase 2 ─────────► rule enforcement, staged read-then-write (weeks 3-4)
                  │
                  ▼
             Phase 3 ────► client queries + indexes (week 5)
                       │
                       ▼
                  Phase 4 ► sync queue namespacing + imeiSales re-key (week 6, freeze window)
                            │
                            ▼
                       Phase 5 ► verification + admin tooling (weeks 7-8)
```

- **Phase 2 cannot ship until Phase 1 backfill is at 100% coverage** and every active user has a workspaceId claim within the last 60 min.
- **Phase 3 indexes must be Enabled before Phase 3 client ships** — no exceptions.
- **Phase 4 requires 24 h of stable Phase 3 telemetry** before scheduling the imeiSales freeze window.
- **Phase 5's cross-tenant admin view depends on the `admin` claim already existing** (it does, verified in the migration analysis).

## Risk summary across phases

| Phase | Risk | Reversibility | Biggest failure mode |
| :-: | :-: | --- | --- |
| 1 | Low-Medium | Fully reversible | Silent mis-tagging in backfill |
| 2 | **High** | Reversible (revert rules) | Token-refresh lag → empty screens / permission-denied |
| 3 | Medium | Reversible (client only) | Missing composite index → list pages broken |
| 4 | **High** | Partially reversible | imeiSales doc-copy rollback loses cross-tenant duplicates |
| 5 | Low | Fully reversible | Verification gaps not caught until user complaints |

## Success criteria (must be met before declaring GA)

1. `orphans.csv` from Phase 1 is empty and stays empty for 7 consecutive days.
2. Firebase Console → Firestore → Rules metrics show zero `permission-denied` on business collections for 7 consecutive days after Phase 2.
3. `e2e/multi-tenant.spec.ts` passes against production build with two live tenant accounts.
4. Sync queue backlog per device < 10 items on 95th percentile.
5. `imeiSales` doc count in the new-format namespace equals the pre-migration flat count (± legitimate cross-tenant duplicates), verified 24 h post-Phase 4.
6. Admin cross-tenant view is behind a `platform_admin` claim distinct from tenant `admin`, verified by a rule test.

## Out of scope for v1

- Many-to-many user ↔ workspace membership.
- Per-workspace theming / branding.
- Per-workspace feature flags.
- Cross-workspace search or reporting for tenant admins (only platform admins).
- Workspace-level rate limits or billing metering (would go in a separate phase 6).
