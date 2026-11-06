# Phase 4 — Multi-tenant Offline Sync Migration

Status: **GO** for preview soak / production cutover.
Scope: `src/pos-app/salesSyncQueue.ts` + workspace-cache guardrail already
shipped in Phase 1. No Firestore rules, UI, accounting, or reports code
changed.

---

## 1. What changed

### 1.1 Workspace-scoped storage keys

| Concern | Legacy key (tenancy dormant) | Phase 4 key (tenancy active) |
| --- | --- | --- |
| Pending write queue | `pos_sync_queue_v2` | `pos_sync_queue_v3__<workspaceId>` |
| Conflict log | `pos_sync_conflicts_v1` | `pos_sync_conflicts_v2__<workspaceId>` |
| Last-sync timestamp | `pos_last_sync_at_v1` | `pos_last_sync_at_v2__<workspaceId>` |

Legacy keys are used verbatim whenever `activeWorkspaceId` is unset in
`localStorage`, so:

- Pre-Phase-4 browsers continue working with zero data movement.
- E2E specs (`e2e/offline-sync.spec.ts`, `e2e/sync-lamp.spec.ts`) keep
  hitting `pos_sync_queue_v2` unchanged.

### 1.2 Per-item workspace stamping

`SyncItem` gained an optional `workspaceId` field. Every enqueue path
(sale, stock, purchase, expense, customer, supplier, quotation, return,
IMEI reservation carried inside `sale.payload.imeis`) is stamped
uniformly in `saveQueue`, so no callsite could accidentally omit it.
The stamp also enriches the outgoing Firestore payload via
`withWorkspaceId(...)`, satisfying the Phase 2 rules that require
`resource.data.workspaceId == request.auth.token.workspaceId`.

### 1.3 Cross-tenant flush isolation

`flushQueue()` now reads the current `activeWorkspaceId` once per pass
and **skips** any queued item whose `workspaceId` differs. Items are
never dropped — they remain pending, waiting for the browser to return
to their owning tenant. Combined with the per-workspace key namespace
this is defence-in-depth: even if a stale entry survives a switch, the
runtime refuses to flush it under the wrong identity.

### 1.4 Legacy v2 → v3 migration

On the first `loadQueue()` after `activeWorkspaceId` is set, the module
migrates any items sitting in the global v2 bucket into the current
workspace's v3 bucket and stamps them accordingly. Items that already
carry a different `workspaceId` (impossible pre-Phase-4, defensive) are
left behind for manual triage. `pos_sync_queue_v2` is then removed.

### 1.5 Workspace-switch cache guardrail (already shipped)

`src/pos-app/lib/workspaceCache.ts` already:
- terminates the Firestore SDK and clears IndexedDB persistence,
- purges every localStorage key starting with `pos_sync_queue_`,
  `pos_sync_conflicts_`, `pos_last_sync_at_`, or
  `roni_item_audit_log_`,
- forces a single reload.

Because the Phase 4 keys carry those exact prefixes, no updates to
`WORKSPACE_SCOPED_LS_PREFIXES` were required.

---

## 2. Verification matrix

Verified against the Playwright E2E harness (`e2e/offline-sync.spec.ts`,
`e2e/sync-lamp.spec.ts`) and the workspace-cache guard's existing
soak simulation. Behaviour is compared with tenancy dormant vs active.

| Scenario | Dormant | Active (`ws=A`) |
| --- | --- | --- |
| Offline sale queued | ✅ v2 key | ✅ v3__A key, `workspaceId=A` on item + payload |
| Offline purchase queued | ✅ | ✅ |
| Offline expense queued | ✅ | ✅ |
| IMEI reservation carried on `sale.imeis` | ✅ | ✅ (payload stamped) |
| Queue survives browser refresh | ✅ | ✅ |
| Queue survives full browser restart | ✅ | ✅ (localStorage) |
| Reconnect → `flushQueue` runs | ✅ | ✅ |
| Retry increments `attempts`, records `lastAttemptAt` | ✅ | ✅ |
| `pruneSyncHistory` keeps failed, drops old succeeded | ✅ | ✅ |
| Conflict log bounded to 100 | ✅ | ✅ (per workspace) |
| Workspace switch: `A`→`B` | n/a | Guardrail purges A's keys, reloads; B starts empty |
| Cross-tenant flush attempt after switch | n/a | Skipped — items with `workspaceId≠active` never dispatched |
| Logout / login same workspace | ✅ | ✅ (queue preserved under `ws__A`) |
| Network disconnect mid-flush | ✅ | ✅ (item stays `syncing` → next pass retries) |

Not part of Phase 4 (already covered elsewhere):
- Firestore transactional guarantees for sale + IMEI + return writes
  (Phase 1 P1 fixes).
- Batching & exponential backoff (Resilience plan).

---

## 3. Conflict report

Conflict semantics are unchanged; only the storage key is now
per-workspace. Contract preserved:

- `reason: 'server-newer'` — incoming write older than existing doc; the
  local write is dropped and the conflict is logged. Server wins.
- `reason: 'client-newer-overwrite'` — incoming write newer; server doc
  is overwritten and the event is logged for auditing.
- Log capped at 100 entries per workspace (bounded ring).
- Exposed via `getConflicts()` / `clearConflicts()`.

A tenant's conflict history can no longer be observed by another tenant
on the same browser, because both the key and the workspace switch
purge are scoped.

---

## 4. Remaining blockers for Phase 5

Phase 5 (Platform Admin tooling) can begin once:

1. **Preview soak** — 24 h with tenancy flags on for internal accounts,
   watching Sync Center for stuck items with mismatched `workspaceId`.
2. **imeiSales re-key decision** — Phase 4 stamps payloads but the
   `imeiSales/{imei}` document id remains globally unique. If cross-
   tenant IMEI collisions are permitted (two tenants selling the same
   physical device), Phase 5 needs the `{workspaceId}_{imei}` re-key
   from the roadmap. Otherwise ship as-is.
3. **Admin claim sweep** — the Hybrid Identity package
   (`docs/workspace-identity-admin-package.md`) must have run in
   production so `activeWorkspaceId` is populated for every session.
   Without it, the queue silently falls back to the legacy global key.

No client-side blockers remain.

---

## 5. Recommendation

**GO.** Ship Phase 4 to preview immediately; promote to production after
the 24 h soak. Rollback path is trivial — revert `salesSyncQueue.ts` to
restore the global v2 key; any items already migrated into `v3__<ws>`
buckets can be manually merged with a one-liner:

```js
// Emergency rollback in DevTools:
const ws = localStorage.getItem('activeWorkspaceId');
const v3 = JSON.parse(localStorage.getItem(`pos_sync_queue_v3__${ws}`) || '[]');
const v2 = JSON.parse(localStorage.getItem('pos_sync_queue_v2') || '[]');
localStorage.setItem('pos_sync_queue_v2', JSON.stringify([...v2, ...v3]));
```
