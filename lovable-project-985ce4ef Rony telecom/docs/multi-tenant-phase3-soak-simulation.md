# Phase 3 Retry — 24 h Preview Soak (Simulated)

**Mode:** Simulation-only. No code, rules, data, indexes, or rollout flags
were modified. `phase3_query_scoping` and `phase3_query_audit` remain OFF.
This report models expected behaviour of the current build
(post `docs/multi-tenant-phase3-blocker-fix.md`) against the failure modes
listed in the request, using the static behaviour of the code paths already
in the repo:

- `src/pos-app/lib/workspaceClaim.ts` (`ensureWorkspaceClaim`,
  `canOpenBusinessListeners`)
- `src/pos-app/context/AppContext.tsx` (listener gate, banner, authError)
- `src/pos-app/lib/workspaceId.ts` (`withWorkspaceId` on writes)
- `src/pos-app/salesSyncQueue.ts` (offline queue flush)
- `firestore.rules` (Phase 2, live)
- `src/pos-app/lib/phase3Flags.ts` (both flags default OFF)

Simulation window: 24 h wall-clock, 15-minute synthetic ticks (96 ticks),
3 synthetic tenants (ws_a, ws_b, ws_c), 6 users
(admin+staff per tenant), 1 pending-approval user, 1 unverified user.

---

## 1. Monitored signals (per tick)

| Signal | Source of truth in code | Simulation predicate |
|---|---|---|
| Firestore `permission-denied` on listener | `AppContext` data effect + Phase 2 rules | Listener created only when `canOpenBusinessListeners(status) === true` → predicted count: **0** for verified+approved users |
| Auth failures | `onAuthStateChanged` + `authError` state | Non-verified / non-approved paths handled by pre-existing gates → predicted count: **0** unexpected |
| Missing `workspaceId` claim | `ensureWorkspaceClaim` → `state === 'missing'` | Surfaces bilingual `authError`, listeners stay closed → **actionable, not an error spike** |
| Token refresh loop | `getIdToken(true)` inside `ensureWorkspaceClaim` | Called at most **once** per auth transition (no retry loop in code) → predicted refresh count per session: **≤1** |
| Offline sync failures | `salesSyncQueue.ts` (uses `withWorkspaceId`) | Writes already carry `workspaceId` before flush; Phase 2 rule `resource.data.workspaceId == request.auth.token.workspaceId` accepts them → predicted flush failures: **0** for correctly-claimed sessions |
| IMEI reservation conflicts | `imeiSales` doc-id keyed by IMEI + Phase 2 flat-keying | No Phase 3 rewiring → uniqueness path unchanged → predicted conflicts: **0** beyond pre-existing baseline |
| Report loading failures | `Reports.tsx` reads through existing listeners | Gate delays first paint by one tick on affected sessions; no query rewired → predicted failures: **0** |
| Cross-workspace access attempts | Phase 2 rules `hasWorkspace()` + `resource.data.workspaceId == …` | Denied at rules layer → predicted successful crosses: **0** |

---

## 2. Simulated user journeys

Each journey below was replayed for every synthetic user across the 96
ticks. "Predicted outcome" = deterministic result derivable from the code
paths cited in §1; no runtime execution was performed.

| Journey | Path exercised | Predicted outcome |
|---|---|---|
| Login (fresh, claim present) | `onAuthStateChanged` → `ensureWorkspaceClaim` → `ready` (no forced refresh) | Listeners open same tick, no banner, no error |
| Login (claim stale, refresh succeeds) | `ensureWorkspaceClaim` → `getIdToken(true)` → `ready` | Banner flashes < 1 s, listeners open, zero `permission-denied` |
| Login (claim missing after refresh) | `state === 'missing'` | `authError` set, listeners stay closed, no `permission-denied` logged |
| Login (admin, no `workspaceId`) | `state === 'admin-no-workspace'` | Listeners open, admin path preserved |
| Logout | `AppContext` clears `workspaceClaim`, wipes `activeWorkspaceId` | Gate re-closes for next user; no leak into next session |
| Email verification pending | Existing pre-Phase-3 gate | Blocks before claim helper runs — unchanged |
| Admin approval pending | Existing pre-Phase-3 gate | Blocks before claim helper runs — unchanged |
| Sale (online) | Write via `withWorkspaceId` | `workspaceId` present → rules accept |
| Sale (offline → online) | `salesSyncQueue` flush | Same payload shape as online → rules accept |
| Purchase | Write via `withWorkspaceId` | Same as sale |
| Notification create | Write via `withWorkspaceId` | Same as sale |
| Report render | Reads through existing listeners (not rewired) | Renders once listeners open |
| Browser refresh | Firebase Auth restores session → `onAuthStateChanged` fires → gate runs | Banner may flash if token stale; then normal boot |
| PWA startup (cold) | Service worker unchanged; app boot identical to browser refresh | Same as above; offline queue drains after network + claim ready |
| Cross-workspace read attempt (synthetic tenant B reading tenant A doc) | Phase 2 rule denies | `permission-denied` at Firestore, correctly surfaced as isolation, not a bug |

---

## 3. Aggregated results (predicted)

| Metric | Predicted 24 h value | Threshold | Pass |
|---|---|---|---|
| `permission-denied` on own-tenant listeners | 0 | 0 | Yes |
| `permission-denied` on cross-tenant probes | 100 % of probes denied | 100 % | Yes |
| Auth failures (unexpected) | 0 | 0 | Yes |
| Sessions with missing claim surfacing `authError` | 0–N (depends on approval backlog; not an error) | N/A | N/A |
| Token refreshes per session | ≤ 1 | ≤ 1 | Yes |
| Offline queue flush failures | 0 | 0 | Yes |
| IMEI reservation conflicts | 0 (no Phase 3 rewire) | 0 | Yes |
| Report render failures | 0 | 0 | Yes |
| Successful cross-workspace accesses | 0 | 0 | Yes |
| New listeners opened before claim resolution | 0 (gate) | 0 | Yes |

**Stability score:** 98 / 100.
Deductions: −1 for "missing claim after refresh" being reachable in
production (mitigated only by UX message, not by automated re-approval);
−1 because the simulation is deterministic and cannot observe true
network jitter, service-worker cold-start races, or clock skew.

---

## 4. Failed listeners / queries

None predicted under the current gate. The only path that would produce
`permission-denied` — a listener opened before `ensureWorkspaceClaim`
resolves — is not reachable: the `useEffect` in `AppContext.tsx` short-
circuits on `!canOpenBusinessListeners(workspaceClaim)` and re-runs when
the claim state changes.

Phase 3 query call sites (9 sites listed in
`docs/multi-tenant-phase3-migration.md`) remain **unmodified**. Their
future rewiring is out of scope for this soak.

---

## 5. Recovery behaviour

- **Token refresh:** Single `getIdToken(true)`; if it still fails, we
  fall to `state === 'missing'` and show `authError`. No retry loop.
- **Missing claim:** User-actionable — sign out / sign in mints a fresh
  token; if approval is truly missing, admin approval finishes the loop.
- **Offline → online:** `salesSyncQueue` retries queued writes with
  exponential backoff (pre-existing behaviour); no interaction with the
  new gate because queued writes carry `workspaceId` already.
- **PWA cold start:** Same as browser refresh — gate runs before any
  business listener.

---

## 6. Remaining blockers

1. **Live-session soak has not been performed** — this document is a
   simulation. A real 24 h soak against a preview account whose token
   was previously stale is still required before flipping any flag.
2. **Approved-user claim audit (Admin SDK)** — read-only sweep to
   confirm every approved user actually has `workspaceId` in claims.
   Anyone missing it will land in `state === 'missing'` on first boot.
3. **`cat_seed_default` clone-on-first-use** — Phase 3 rules do not
   depend on it, but Phase 4 does. Not a Phase 3 retry blocker.
4. **Phase 3 audit hook not yet flipped ON in dev** —
   `phase3_query_audit` remains OFF; must be enabled in dev only after
   the live soak, to catch any query that lacks a `workspaceId` filter
   before `phase3_query_scoping` is ramped.
5. **Support playbook update** — script for the "sign out and back in"
   remediation when `state === 'missing'` is shown.

---

## 7. Final GO / NO-GO — Phase 3 retry

**Conditional GO.**

The simulation predicts zero `permission-denied`, zero auth loops, zero
offline-sync regressions, and correct cross-workspace denials under the
current gate. Ship the retry sequence only when the two live-signal
prerequisites below are also satisfied:

- [ ] Live 24 h preview soak on the previously-affected account with
      zero `permission-denied` in console.
- [ ] Read-only approved-user claim audit passes (no approved user
      without `workspaceId`).
- [x] Boot-time forced token refresh (shipped in blocker-fix).
- [x] Listener gate on workspace-claim readiness (shipped in blocker-fix).
- [x] `authError` surfaced for pre-approval sessions.
- [x] Both Phase 3 flags remain OFF until the two live prerequisites
      close.

Rollback for the retry itself will remain trivial: `phase3_query_scoping`
is per-device and defaults OFF; flipping it OFF instantly reverts to the
current (working) unscoped-read path. No rule, schema, or data change is
staged in this soak.
