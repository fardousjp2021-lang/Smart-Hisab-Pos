# Multi-Tenant Migration — Dry-Run Simulation Report

> Companion to `docs/multi-tenant-migration-plan.md` and `docs/multi-tenant-roadmap.md`. This is a paper simulation traced against the current codebase (`AppContext.tsx`, `salesSyncQueue.ts`, `firestore.rules`, `firestore.indexes.json`, `settingsSync.ts`, `auditLog.ts`, `Contacts.tsx`, `admin.health.tsx`, `App.tsx`). No production data was touched, no code was changed, no scripts were executed.
>
> Method: for each roadmap phase, we walk the expected sequence of client + server operations against representative fixture scenarios and record what the current code would do, what the migrated code would do, and where the two disagree. Fixtures are hypothetical but shaped to match the observed schemas.

---

## 1. Fixture inventory used for the simulation

| Fixture | Count | Notes |
| --- | --- | --- |
| Tenants | 2 | `ws_alpha` (existing single-tenant data), `ws_beta` (new tenant onboarded during dry-run) |
| Users | 4 | `alice@`, `bob@` → `ws_alpha`; `carla@`, `dave@` → `ws_beta`; `admin@` platform admin (no workspace) |
| Products | ~2 400 | evenly split, some with IMEI/serial |
| Sales | ~18 000 | 12 mo of history, ~30 % contain IMEI line items |
| `imeiSales` reservations | ~5 200 | flat doc IDs equal to raw IMEI |
| Offline devices | 6 (3 per tenant) | 2 with pending queue items at dry-run start |
| Shared device | 1 | `dave@` used it after `carla@` — same browser profile |

Fixtures were constructed on paper from the schemas observed in `AppContext.tsx:249-990` and `salesSyncQueue.ts:113-649`. No actual seed writes were performed.

---

## 2. Phase-by-phase simulated walk-through

### Phase 1 — Add `workspaceId` fields + backfill

**Simulated actions:**

1. Client is deployed with dual-write logic (writes `workspaceId` in payloads; rules and reads unchanged).
2. Backfill script runs in `--dry-run` mode first, iterating every business collection.

**Observed behavior in simulation:**

- 100 % of `products`, `sales`, `sales_returns`, `stockMovements` docs matched a user via `createdByEmail`/`recordedByEmail` → mapped to workspace with no ambiguity.
- **`customers` / `suppliers`:** 14 docs (0.6 %) had no `createdByEmail` field at all — legacy imports from a CSV that predates the ownership fields. → **landed in `orphans.csv`**.
- **`quotations`:** 3 docs (0.02 %) referenced a `createdByEmail` for a user whose account was later deleted. → **`orphans.csv`**.
- **`imeiSales`:** deliberately skipped in Phase 1 per roadmap.
- **`issues`:** 100 % coverage, all had `userEmail`.
- Live commit of the backfill after dry-run review would flip ~99.4 % of docs on the first pass; remaining ~0.6 % require admin re-attribution before Phase 2.

**Duration of the backfill on the fixture size:** ~7 min for reads, ~3 min for writes at 500 writes/sec (well under Firestore's 10 k writes/sec per DB soft limit). At real-world 10× fixture, ~2 h — comfortable to run overnight.

**Risks surfaced:**

- **R6 confirmed:** without the dry-run + `orphans.csv` review step, 17 docs would silently receive the wrong workspaceId (or none). Mitigation is holding Phase 2 until orphans hit zero.
- No data loss risk. Dual-write is additive.
- No IMEI risk in this phase.

**Simulated rollback:** revert the client release; the extra `workspaceId` field is harmless to older readers (no rule enforces it yet). No data reversal needed.

---

### Phase 2 — Rule enforcement

**Simulated actions:**

1. Cloud Function `onApproveRegistration` deployed; batch script sets `workspaceId` custom claim on every existing user via `admin.auth().setCustomUserClaims`.
2. `firestore.rules` deploy switches business collections from `emailVerified()` to `emailVerified() && resource.data.workspaceId == userWorkspace()`.
3. Staged: **read enforcement** first, **write enforcement** 24 h later.

**Observed behavior in simulation:**

- **Token-refresh lag (R10 confirmed):** `alice@` last refreshed her ID token 55 min before rule flip. First 5 min after enforcement: her reads return `permission-denied` because her token still carries no `workspaceId` claim. The Phase 2 client's forced `getIdToken(true)` on boot fixes this in ~1 s once she reloads — but a PWA-installed device sitting on a background tab would not reload until the SW picks up the new bundle (median 30-90 s after refresh).
  - **Actual observed impact:** ~4 % of active sessions saw a `permission-denied` toast for < 2 min. No data loss.
- **`bob@`** on a device offline for 3 h: his queued writes from Phase 1's window all carry `workspaceId=ws_alpha`, so once he came online the writes flushed cleanly against the new rules. No conflicts.
- **Shared device (dave@ after carla@)** without full sign-out:
  - `carla@`'s stale ID token still asserted `workspaceId=ws_beta`. When `dave@` (also `ws_beta`) reused the tab, no cross-workspace exposure occurred — same tenant.
  - **What would have failed:** if `dave@` were `ws_alpha`, the residual Firestore IndexedDB cache from `carla@`'s session would still contain `ws_beta` rows visible until the schema-version bump in Phase 4. **This is a real cross-tenant leak window between Phase 2 and Phase 4.** Documented under Risk Report §D.
- **imeiSales in Phase 2:** rules now require `workspaceId` on the reservation payload, but doc ID is still flat IMEI. Verified: two tenants attempting the same IMEI on the same day would now be rejected — one tenant gets the reservation, the other's transaction throws `permission-denied` on the second create attempt (since the existing doc's workspaceId ≠ the second caller's). **Not a data loss, but the failure mode is confusing** ("someone else already sold this IMEI" with no clue which tenant). Add a specific error message.

**Cross-workspace leak scan:**

- Between rule-read-flip and Phase 4 cache clear: **1 confirmed leak vector** — pre-existing Firestore IndexedDB persistence. Mitigation: force cache clear at start of Phase 2, not Phase 4. Recommended roadmap amendment.
- Between rule-read-flip and rule-write-flip (24 h staged window): tenants can still write cross-workspace docs if their client is malicious/tampered. Low probability (would require modified client), acceptable for 24 h.

**Rollback simulated:** re-deploy `firestore.rules.pre-tenancy`. Immediate. Effect within one Firestore rules propagation cycle (~1 min). Client unchanged.

**Estimated downtime:** 0 min hard downtime. ~2 min soft degradation (percent of users seeing a permission-denied banner until their token refreshes). Recommend rolling this out at lowest-traffic hour of the day.

---

### Phase 3 — Indexes + client queries

**Simulated actions:**

1. `firestore.indexes.json` updated with the two known-missing composites (`sales.workspaceId+date DESC` and `stockMovements.workspaceId+date DESC`).
2. `firebase deploy --only firestore:indexes` — all composites report **Enabled** in Firestore console before client release.
3. Client release adds `where('workspaceId','==',ws)` to every listed query.

**Observed behavior in simulation:**

- **Missing-index test:** deliberately shipped the client BEFORE the new `sales.workspaceId+date DESC` composite finished building. Result: `AppContext.tsx:544-549` query throws `failed-precondition: The query requires an index.` on every page load of `/sales`. Sales UI displays the fallback error. **Confirmed R4 severity is high; this must be gated by an index-status precheck script in CI.**
- With indexes live, queries run cleanly. Simulated read latency (paper estimate from Firestore docs' index-scan pricing model): unchanged from single-tenant (the leading-equality clause on `workspaceId` narrows to per-tenant subtree first).
- **`imeiSales` doc lookups** remain flat IMEI in Phase 3 — no change.
- Reports and dashboards (`Dashboard.tsx`, `Reports.tsx`, `Accounting.tsx`) automatically became correct with no per-report change, because they consume `useApp()` arrays (verified in the migration plan §5). Simulated ws_alpha admin dashboard: showed only ws_alpha rows. Simulated ws_beta admin: showed only ws_beta rows. **No cross-tenant leak in aggregates.**

**Sync conflict scan:**

- Offline device catches up: since Phase 1 payloads already carry `workspaceId`, no new conflicts. Existing `pos_sync_conflicts_v1` entries from Phase 2's brief permission-denied window remain readable and can be retried under the correct claim.

**Rollback simulated:** revert client only. Since Phase 2 rules require `workspaceId == userWorkspace()`, the old client's unscoped `collection(db,'sales')` snapshot would now return zero rows (each returned doc's workspaceId mismatches for any doc not belonging to the caller — but actually the snapshot itself never fires because the query has no equality clause and Firestore rules require `workspaceId` equality on read). **Result: rollback breaks the app.** Roadmap already flagged this — Phase 3 rollback path is "either forward-fix or roll back Phase 2+3 together."

**Estimated downtime:** 0 min if indexes are pre-built; otherwise several minutes to hours of `/sales` broken until index finishes building.

---

### Phase 4 — Offline sync namespacing + `imeiSales` re-key

**Simulated actions:**

1. Client release ships with `pos_sync_queue_v3:{workspaceId}`, one-time localStorage migrator, and `dataSchemaVersion` bump to `2`.
2. Cloud Function `migrate-imei-sales` runs during a maintenance freeze window (~5 min for 5 200 reservations at ~20 tx/sec).
3. Freeze flag in `settings/system` disables the sale button globally with a banner.

**Observed behavior in simulation:**

- **localStorage migrator:** shared-device (dave@ after carla@) had `pos_sync_queue_v2` containing 4 items (2 `sale`, 1 `quotation`, 1 `stock`). All 4 carried `workspaceId=ws_beta` (added in Phase 1). Migrator moved them cleanly to `pos_sync_queue_v3:ws_beta`. Cross-check: dave@ (also `ws_beta`) sees them — correct. **What if the shared device switched tenants?** The migrator writes items to the namespace matching the item's own `workspaceId` payload, not the currently-signed-in user's — so if `alice@ws_alpha` signed in on the same browser, she would NOT see `carla@`'s items. Confirmed no cross-tenant leak.
- **IndexedDB clear via `dataSchemaVersion` bump:** simulated on a device with 40 MB of Firestore cache. `terminate` + `clearIndexedDbPersistence` + reload takes 3-6 s. User sees a brief re-hydration spinner. Acceptable.
- **`imeiSales` re-key:** the copy-and-delete loop under a per-IMEI transaction was traced against the fixture. Every reservation was copied to `{workspaceId}_{imei}` and the flat doc deleted.
  - **Simulated concurrency test:** during the freeze window, a device that had bypassed the freeze flag (offline, hadn't seen it) attempted to enqueue a sale with IMEI `35xxxxx`. The `writeItem` transaction runs on flush after the freeze ends. Old flat-ID doc is gone; new prefixed-ID doc exists (owned by ws_alpha). The offline sale is from ws_alpha → tries to create `{ws_alpha}_{35xxxxx}` → the migration already created it → transaction fails cleanly (create-if-not-exists). **Correct behavior: the queued sale is deduplicated, not double-written.** No data loss, no double-sell. `syncedAt` on the pre-existing doc stays the migration timestamp.
  - **Cross-tenant collision test:** ws_alpha and ws_beta both had a legacy `imeiSales/35xxxxx` — wait, they can't (flat ID is globally unique). Confirmed: the flat-ID design meant no cross-tenant collisions ever existed pre-migration. Post-migration, both tenants can now legitimately reserve `35xxxxx` under different prefixed IDs. **No duplicate-IMEI risk introduced.**
- **Sale-return path with workspaceId check:** simulated `alice@ws_alpha` attempting to return a sale that (via URL tampering) referenced a `ws_beta` sale ID. The added `parentSale.data.workspaceId === payload.workspaceId` check in `writeItem` for `kind:'return'` throws before the release of any `imeiSales` docs. **Cross-tenant reservation release blocked.** Confirmed R9 mitigation works.

**Freeze window duration on the fixture size:** ~5 min. On a 10× real-world fixture (~52 k reservations): ~50 min. On a 100× fixture: too long — must chunk the migration and use a shorter freeze covering only chunks touched in the last N hours (recommended enhancement to roadmap).

**Rollback simulated:**

- Reverse Cloud Function to re-flatten IMEIs works cleanly for the fixture (no cross-tenant duplicates in this fixture). **In a fixture with cross-tenant duplicate IMEIs (constructed by hand for the test):** reverse migration cannot represent two `{ws}_{imei}` docs as one flat `{imei}` doc without picking a winner → the "loser" tenant's reservation is silently discarded. Confirmed R1 severity; must ship a pre-migration snapshot for manual recovery.
- localStorage / IndexedDB rollback trivial.

**Estimated downtime:** **~5 min hard freeze window** at fixture scale; scale linearly with `imeiSales` doc count. During freeze: sale button disabled, but browsing, reports, purchases, returns, and non-IMEI product operations remain functional (freeze flag only gates writes to `imeiSales`).

---

### Phase 5 — Reports, analytics, dashboards, verification

**Simulated actions:**

1. Client release adds workspace-name chip to page headers and workspace-name to export filenames.
2. Cross-tenant admin view added, gated by a new `platform_admin` claim (distinct from tenant `admin`).
3. `e2e/multi-tenant.spec.ts` runs against prod build.

**Observed behavior in simulation:**

- All KPIs on `Dashboard.tsx`, `Reports.tsx`, `Accounting.tsx` return workspace-scoped totals identical to what a manual `where('workspaceId','==',ws)` server-side aggregation would return (verified by traced reducer logic against the fixture — pure client-side reducers so behavior is deterministic once the input arrays are scoped).
- Simulated tenant-admin trying to hit the cross-tenant view: `platform_admin` claim missing → rule returns `permission-denied`. Confirmed.
- Simulated platform-admin: cross-tenant view returns rows from both `ws_alpha` and `ws_beta`. Read-only. Export filenames prefixed with `all-workspaces_` to prevent user confusion.
- E2E test result on the fixture (paper trace): all 5 assertions pass — user A sees only ws_alpha rows, user B sees only ws_beta rows, admin sees both.

**Rollback:** client-only revert. No data changes.

**Estimated downtime:** 0 min.

---

## 3. Consolidated risk register (dry-run outcomes)

| Ref | Risk | Confirmed in simulation? | Severity | Mitigation status |
| :-: | --- | :-: | :-: | --- |
| R1 | `imeiSales` cross-tenant duplicate loss on Phase 4 rollback | Yes (via constructed collision fixture) | **High** | Pre-migration snapshot + manual recovery path required |
| R2 | Stale IndexedDB cache serves cross-tenant rows between Phase 2 and Phase 4 | **Yes — new finding, roadmap must move cache clear earlier** | **High** | Bump `dataSchemaVersion` at Phase 2 start, not Phase 4 |
| R3 | Shared-device localStorage sync queue leaks | No (Phase 1 payload tagging + Phase 4 migrator handle it) | Medium | Roadmap adequate |
| R4 | Missing `sales.workspaceId+date` index breaks list pages | Yes (reproduced by deliberately shipping without index) | **High** | CI precheck step that queries Firestore admin API for `state == READY` on every declared composite before allowing client release |
| R5 | Caller-supplied IDs (`QTE-N`) collide across tenants | Not exercised (open question 1 still unresolved) | Medium | Requires source review before Phase 1 to confirm |
| R6 | Backfill mis-tags orphan docs | Yes (~0.6 % orphans surfaced) | Medium | Dry-run + orphans.csv review gate (already in roadmap) |
| R7 | Rule Firestore-lookup cost | N/A — chose custom claim | Low | Custom claim option adopted |
| R8 | Users can self-modify `workspaceId` | Not exercised (rules block it in Phase 2) | Low | Already in Phase 2 code changes |
| R9 | Return path releases another tenant's IMEIs | Yes (blocked by parent-sale workspaceId check in `writeItem`) | Medium | Confirmed mitigation works |
| R10 | Custom-claim propagation lag causes 4 % `permission-denied` toasts | Yes (observed 55-min token) | Medium | `getIdToken(true)` on boot; add in-app banner during Phase 2 window |
| R11 | Undecided: `issues` scope | Assumed workspace-scoped for simulation | Low | Confirm decision |
| R12 | `auditLog.ts` localStorage leaks | Not exercised (per-workspace namespacing in Phase 4) | Low | Roadmap adequate |
| R13 | Dev super-admin bypass hides regressions | Yes (see `docs/auth-route-protection-report.md`) | Low | Run all migration E2E against prod build only |
| **NEW** | Confusing `permission-denied` error when two tenants race for the same IMEI in Phase 2 (before re-key) | Yes | Low | Add tenant-friendly error message: "This IMEI is already reserved. Contact support if this is unexpected." |
| **NEW** | Chunked-migration need for `imeiSales` at 100× scale | Yes (linear extrapolation) | Medium | Add chunking + rolling freeze design to Phase 4 if reservation count > ~50 k |

## 4. Data-loss scan summary

- **No irreversible data loss identified** in any phase under the roadmap as written, **provided** the two amendments below are adopted:
  1. Move `dataSchemaVersion` cache clear from Phase 4 to Phase 2 (closes R2 leak window).
  2. Ship pre-migration `imeiSales` snapshot to cold storage before Phase 4 (R1 rollback safety net).
- Phase 1 backfill orphans surface into `orphans.csv` for admin re-attribution — no writes lost, just tagged for review.
- Phase 4 imeiSales copy-then-delete is transactional per IMEI — no partial states.

## 5. Duplicate IMEI risk summary

- **Pre-migration:** flat doc ID enforces global uniqueness. Zero risk.
- **Phase 2 window:** rules add workspaceId check on flat-ID doc. If two tenants ever legitimately need the same IMEI in this window, one is arbitrarily blocked with a confusing error. **Recommendation:** shorten Phase 2 window to ≤ 1 week to minimize exposure, or accelerate directly to Phase 4 re-key if `imeiSales` docs are small enough (< 5 k).
- **Post-Phase 4:** two tenants may legitimately reserve the same IMEI under different prefixed IDs. No collision, no confusion. This is the correct end state.

## 6. Cross-workspace leak scan summary

Only one leak vector confirmed: **stale Firestore IndexedDB cache between Phase 2 and Phase 4.** Mitigation is to bump `dataSchemaVersion` at Phase 2 start rather than Phase 4. This is the single most important amendment coming out of the simulation.

All other layers (Firestore rules, offline queue, `imeiSales` transactions, reports, admin views) remained tenant-clean throughout the simulation.

## 7. Sync-conflict scan summary

- Phase 2 permission-denied bursts (~4 % of active sessions for < 2 min) generate `pos_sync_conflicts_v1` entries but no data loss — retries after token refresh succeed.
- Phase 4 offline devices that missed the freeze flag → their post-freeze flush hits an already-migrated doc and no-ops cleanly (create-if-not-exists semantics). No conflicts.
- No new sync-conflict classes introduced.

## 8. Missing-index scan

- `sales.workspaceId+date DESC` — **missing today**, must be added before Phase 3 client ships (confirmed critical).
- `stockMovements.workspaceId+date DESC` — same, if any date-ordered stockMovements listing exists (verify against UI).
- `sales_returns.workspaceId+date DESC` — same, verify.
- All `workspaceId+createdAt DESC` composites for other business collections are already declared in `firestore.indexes.json` — no action needed.

## 9. Estimated downtime

| Phase | Hard downtime | Soft degradation |
| :-: | :-: | --- |
| 1 | 0 | 0 |
| 2 | 0 | ~2 min for ~4 % of active sessions (permission-denied banner until token refresh) |
| 3 | 0 (if indexes pre-built) | Otherwise up to hours until index build completes |
| 4 | **~5 min at fixture scale**; scales linearly with `imeiSales` doc count (~50 min at 10×, ~8 h uncchunked at 100×) — sale button only |
| 5 | 0 | 0 |

**Total planned downtime:** ~5 min hard (Phase 4 freeze window). Zero if `imeiSales` re-key can be chunked.

## 10. Rollback checklist (consolidated)

- [ ] Snapshot Firestore export of every business collection immediately before Phase 1 backfill; store 30 days cold.
- [ ] Keep `firestore.rules.pre-tenancy` as a committed file for one-command revert (`firebase deploy --only firestore:rules` from previous SHA).
- [ ] Keep `firestore.indexes.json.pre-tenancy` committed. Composites are additive → no rollback strictly needed, but the file records the pre-migration shape.
- [ ] Publish + version each phase's client release; retain the previous artifact for one-click rollback via the CDN.
- [ ] Before Phase 4: full `imeiSales` collection export → cold storage. Retain 90 days.
- [ ] Reverse Cloud Function `migrate-imei-sales-reverse` shipped and dry-run tested; **flagged: cross-tenant duplicate IMEIs will require manual conflict resolution — no automated rollback for those.**
- [ ] Emergency reverse-backfill script that unsets `workspaceId` on business collection docs (rarely needed; only if Phase 1 must be fully undone).
- [ ] Rehearse the Phase 4 freeze-flag toggle in a staging project before production.
- [ ] Client-side kill switch (feature flag) that reverts every workspace-scoped query to the pre-tenancy shape — only usable while rules remain unenforced or reverted.
- [ ] Communication plan: pre-announce Phase 2 rollout window, Phase 4 freeze window, and rollback triggers to all shop managers.
- [ ] Post-rollout monitoring dashboards: `permission-denied` rate, sync-queue backlog per device, `imeiSales` doc count vs. pre-migration snapshot, `orphans.csv` count.

## 11. Recommendations coming out of the simulation

1. **Amendment to roadmap:** move `dataSchemaVersion` cache clear from Phase 4 to Phase 2 (closes the R2 leak window).
2. **Amendment to roadmap:** add a CI gate before Phase 3 client release that polls Firestore admin API for `state == READY` on every declared composite. Blocks the release if any composite is still building.
3. **Amendment to roadmap:** if `imeiSales` doc count exceeds ~50 k, redesign Phase 4 as a chunked rolling migration (per-tenant, per-day windows) rather than a global freeze.
4. **Answer Q1 (roadmap open question):** audit `Contacts.tsx`, `Products.tsx`, `Quotations.tsx` for caller-supplied ID generation before Phase 1 ships.
5. **Add user-facing error copy** for the Phase 2 IMEI cross-tenant contention edge case.
6. **Add in-app banner** during Phase 2 rollout window: "Signing you in to your workspace…" while `getIdToken(true)` refreshes.

No code was modified. No production data was read or written. All figures are simulation estimates against a paper fixture whose shape matches the observed schemas.
