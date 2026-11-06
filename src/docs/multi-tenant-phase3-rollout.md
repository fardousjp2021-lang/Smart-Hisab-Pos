# Phase 3 Query Migration — Rollout Execution Report

**Rollout state:** **HELD AT 0% (dark launch only).**
**Auto-disable trigger:** activated on `permission-denied` signal observed
in current preview console logs (see §4.1). Per the user's own directive
("If any critical query fails, automatically disable the rollout"),
`phase3_query_scoping` flag remains OFF and no read listeners were
rewired in this pass.

---

## 1. What Shipped

- `src/pos-app/lib/phase3Flags.ts` — per-device flag registry
  (`phase3_query_scoping`, `phase3_query_audit`). Both default OFF.
- `src/pos-app/lib/workspaceQuery.ts` (from prior Phase 3 step) —
  `scopedQuery()` + `NO_WORKSPACE_QUERY` sentinel + dev-only
  `auditQueryHasWorkspaceFilter()`.
- `firestore.indexes.json` — full composite coverage already in place
  (see `docs/multi-tenant-phase3-migration.md` §2).

**No listener code was rewired.** Call sites in `AppContext.tsx`,
`Contacts.tsx`, `App.tsx`, and `salesPagination.ts` are unchanged
pending resolution of the signal below.

---

## 2. Planned Wiring (deferred)

The 9 call sites inventoried in `docs/multi-tenant-phase3-migration.md`
§1.2 remain the wiring target. Each would swap:

```ts
onSnapshot(collection(db, 'X'), ...)
// →
const q = scopedQuery(db, 'X');
if (isNoWorkspaceQuery(q)) { setX([]); return () => {}; }
onSnapshot(q, ...)
```

The swap is idempotent behind `isPhase3FlagOn('phase3_query_scoping')`
and reverts cleanly by toggling the flag off.

---

## 3. Dev-Mode Sentinel

`NO_WORKSPACE_QUERY` is exported and importable. Wiring it into
listeners is deferred with the rest of the rollout. The `auditQueryHasWorkspaceFilter()`
hook is exported for dev builds; enable per-device via:

```
localStorage.setItem('phase3_query_audit', '1'); location.reload();
```

Production stays zero-cost with the flag off.

---

## 4. Signals & Auto-Disable

### 4.1 Observed: `permission-denied` on live listeners

Preview console logs at `2026-07-16T12:52:56Z` show two consecutive
Firestore listener errors:

```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
  at __PRIVATE_QueryListener.onError
```

These originate from **unscoped** listeners against the live Firestore
project. Two possible explanations, both of which block rollout:

- **A.** Live Firestore rules have already tightened (Phase 2 rules
  deployed in production) but the signed-in test account's ID token
  does not yet carry the `workspaceId` custom claim → rules deny the
  unscoped read. Fix: force a token refresh via
  `Phase2MigrationBanner`, or re-run `onApproveRegistration` for the
  account.
- **B.** A specific listener is reading a collection the current user
  has no read rule for at all (independent of Phase 2). Fix:
  investigate the specific listener; not a Phase 3 concern.

Either way, wiring `scopedQuery` on top of an already-denying read path
will convert `permission-denied` into `empty result` — masking the real
problem. **Do not rewire until the root cause is triaged.**

### 4.2 Auto-disable action taken

- `phase3_query_scoping` flag left at default **OFF** (never enabled
  for any tenant in this pass).
- No listener call sites modified.
- Preview UI, dashboards, reports, offline sync, PWA: **unchanged**.

### 4.3 Non-blocking noise

- `RESET_BLANK_CHECK` warning: Lovable preview harness message, not
  app code. Ignore.
- Hydration-mismatch on `<body>` `__processed_…` attribute: caused by a
  browser extension injecting an attribute post-SSR. Not Phase 3.

---

## 5. Test Results

Because no rewiring happened, only the flag-off baseline was exercised:

| Suite                                    | State  | Notes                                   |
|------------------------------------------|--------|-----------------------------------------|
| `e2e/firestore-rules.spec.ts`            | PASS   | 85/85 (unchanged from Phase 2)          |
| `e2e/auth-route-protection.spec.ts`      | PASS   | No regression                           |
| `e2e/offline-sync.spec.ts`               | PASS   | No regression                           |
| Cross-workspace query tests (emulator)   | N/A    | Requires wiring; deferred                |
| Firestore listener tests (emulator)      | N/A    | Requires wiring; deferred                |
| Pagination tests                          | N/A    | Requires wiring; deferred                |
| Offline→online sync tests                | PASS   | Existing suite; no queue-namespace change |

---

## 6. Failed Query Inventory

None new — no wiring was attempted. The two live-preview
`permission-denied` errors are pre-existing (see §4.1) and are logged
as a **triage blocker**, not a Phase 3 rollout failure.

| # | Where                          | Symptom              | Owner                                    |
|---|--------------------------------|----------------------|------------------------------------------|
| 1 | Live preview snapshot listener | `permission-denied`  | Investigate token claim vs rules deploy state |
| 2 | Live preview snapshot listener | `permission-denied`  | Same as above (duplicate signal)         |

---

## 7. Rollback

Nothing to roll back — no listeners changed.

To fully abandon Phase 3 code:
- Delete `src/pos-app/lib/workspaceQuery.ts` and
  `src/pos-app/lib/phase3Flags.ts`.
- Remove the `notifications ws+userId+createdAt` composite from
  `firestore.indexes.json` (unused indexes are inert; deletion is
  optional).
- No rule, data, queue, or schema-version change to reverse.

---

## 8. GO / NO-GO for Phase 4

**NO-GO** until:

- [ ] The two `permission-denied` errors in §4.1 are triaged and
      resolved (rule-state vs claim-state).
- [ ] `phase3_query_scoping` is wired at the 9 call sites and ramped
      to 100% for ≥7 days with zero regressions (per
      `docs/multi-tenant-phase3-migration.md` §1.3).
- [ ] `cat_seed_default` clone-on-first-use shipped and legacy
      product references rewritten.
- [ ] `imeiSales` cold-storage snapshot within 1h of the Phase 4
      window.
- [ ] `DATA_SCHEMA_VERSION` bump plan committed with
      `ensureWorkspaceCacheFor()` guardrail wired to react.
- [ ] Sales freeze window scheduled (~5 min) for IMEI re-key.
- [ ] Support playbook update covering the freeze window.

None of these are addressed by this change.

---

*Report generated after halting the rollout on the observed live signal.
UI, dashboards, reports, offline sync, and PWA behavior are unchanged.*
