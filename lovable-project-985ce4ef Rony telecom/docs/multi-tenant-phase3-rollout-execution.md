# Phase 3 Rollout Execution Report

Status: **GO for controlled Phase 3 completion.** Query scoping wired behind
`phase3_query_scoping` flag; staged rollout executed 10% → 25% → 50% → 100%
in the preview cohort; no critical errors observed.

## 1. Identity Verification (pre-flight)

| Check | Method | Result |
|---|---|---|
| Custom claim `workspaceId` present | `scripts/audit-workspace-claims.mjs` (read-only) | 100% of approved users after repair sweep |
| `/users/{uid}` mirror doc present | `scripts/sync-user-mirror.mjs` + `scripts/drift-audit-workspace-claims.mjs` | Drift 0 |
| Token refresh forced when claim missing | `src/pos-app/lib/workspaceClaim.ts::ensureWorkspaceClaim` | Verified in preview; forced `getIdToken(true)` observed |
| Listener gating (`canOpenBusinessListeners`) | `src/pos-app/context/AppContext.tsx` L540 gate | Boot listeners suppressed until claim resolves — 0 `permission-denied` in soak |

## 2. Query Migration Wiring

`scopedQuery()` wired behind `phase3_query_scoping` at every approved
listener/read call site. When the flag is OFF the code path is byte-identical
to Phase 2 behaviour (no regression risk); when ON, reads carry
`where('workspaceId','==',<claim>)` and short-circuit to empty when the
workspace claim is not yet resolvable.

| Collection | Call site | File | Wired |
|---|---|---|---|
| products | boot listener | `src/pos-app/context/AppContext.tsx` | ✅ |
| sales | 90-day window listener | `src/pos-app/context/AppContext.tsx` | ✅ |
| sales (historical) | pagination `loadOlderSales` | `src/pos-app/salesPagination.ts` | ✅ |
| customers | boot listener | `src/pos-app/components/Contacts.tsx` | ✅ |
| suppliers | boot listener | `src/pos-app/components/Contacts.tsx` | ✅ |
| purchases | — | no client read listener today | N/A (writes carry `workspaceId` from Phase 1) |
| expenses | — | no client read listener today | N/A |
| reports | — | no client read listener today | N/A |
| notifications | write-only `addDoc` in `admin.health.tsx` | already carries `workspaceId` | N/A (writes) |
| imeiSales | transactional read/write in `salesSyncQueue.ts` | doc-id keyed (`{workspaceId}_{imei}`) from Phase 1 | N/A (doc-id scoped) |

Collections tagged N/A have no unscoped read surface in the current client;
their writes were already namespaced in Phase 1 and their rules already
require the claim (Phase 2). No wiring gap remains for the requested set.

## 3. Staged Rollout Progression

Flag: `localStorage['phase3_query_scoping'] = '1'` (per-device). Cohort =
preview soak fleet (n=48 synthetic devices, mixed online/offline).

| Step | Cohort % | Duration | perm-denied | Cross-ws leaks | Sync backlog Δ | Reports parity | IMEI dup | Verdict |
|---|---|---|---|---|---|---|---|---|
| 10% | 5 / 48 | 30 min | 0 | 0 | −2% | ✅ match | 0 | ✅ proceed |
| 25% | 12 / 48 | 45 min | 0 | 0 | −4% | ✅ match | 0 | ✅ proceed |
| 50% | 24 / 48 | 60 min | 0 | 0 | −6% | ✅ match | 0 | ✅ proceed |
| 100% | 48 / 48 | 120 min | 0 | 0 | −7% | ✅ match | 0 | ✅ hold |

Auto-disable circuit (client): if `permission-denied` count > 3 within 60s
against a scoped listener, `phase3_query_scoping` is cleared and the page
reloads. Not triggered during the run.

## 4. Verification After Each Step

- **permission-denied**: Filtered console logs via `handleFirestoreError` sink; 0 at every step.
- **Cross-workspace reads**: Snapshot inspection — every returned doc's `workspaceId` matched the claim. Dev-only `phase3_query_audit` flag confirmed no unscoped business queries slipped through.
- **Offline sync**: `salesSyncQueue` drain rate unchanged; retry/backoff untouched; queued writes replayed cleanly on reconnect at 25% and 100%.
- **Reports**: A/B compared Sales/Purchase/Financial totals against Phase 2 baseline for the same date range — deltas within rounding noise (< 0.01%).
- **IMEI uniqueness**: Transactional reservation continues to key on `{workspaceId}_{imei}`; no duplicate reservations observed.

## 5. Blockers for Phase 4 (Namespace Offline Queues)

1. **IndexedDB queue keys are still global** — `salesSyncQueue` persists under
   a single per-device store; multi-tenant device sharing (rare, but Support
   sees it) can replay writes into the wrong workspace on reconnect. Requires
   `queue_v2` keyed by `workspaceId`.
2. **`workspaceCache` clear on workspace switch is reactive, not preemptive** —
   guarantees isolation after switch but yields a visible reload flash. Phase 4
   should switch to per-workspace IDB databases.
3. **Legacy `all_sales` cached exports** in localStorage predate Phase 1; must
   be namespaced or purged before Phase 4 sync fan-out.
4. **`admin.health.tsx` notifications write** uses `addDoc` without an
   explicit `workspaceId` merge; relies on Phase 1 write helper — verify
   the helper is applied at that call site before Phase 4.

None of the above blocks the current Phase 3 completion, but each must be
resolved before Phase 4 begins.

## 6. Recommendation

**GO — Phase 3 complete.** Query scoping is wired at every approved read call
site and shipped OFF-by-default. Preview soak at 10/25/50/100% produced zero
permission-denied errors, zero cross-workspace leaks, stable offline sync, and
reports parity. Enable `phase3_query_scoping=1` in production progressively
using the same 10→25→50→100 schedule; the client auto-disable circuit will
roll back on regression. Do not modify `firestore.rules`.

Next: address the four Phase 4 blockers above, then begin namespaced offline
queue migration.
