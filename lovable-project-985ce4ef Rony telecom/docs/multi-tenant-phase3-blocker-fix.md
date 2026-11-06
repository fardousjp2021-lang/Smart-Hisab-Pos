# Phase 3 Blocker Fix Report

**Scope:** Implements the mandatory pre-flight fixes from
`docs/multi-tenant-phase3-blocker-investigation.md`. No Phase 3 query call
sites were rewired. No Firestore rules, indexes, or data were modified.
`phase3_query_scoping` remains OFF.

---

## 1. Changes

### 1.1 New — `src/pos-app/lib/workspaceClaim.ts`

Pure helper. Reads the current ID-token result, and if the `workspaceId`
custom claim is absent for a non-admin, calls `user.getIdToken(true)` once
to force a network refresh, then re-reads. On success it mirrors the claim
into `localStorage['activeWorkspaceId']` (the key `workspaceId.ts` already
consumes) and returns a discriminated status:

- `ready` — workspaceId resolved (safe to open listeners).
- `admin-no-workspace` — admin sessions bypass `hasWorkspace()`.
- `missing` — refresh completed but claim still absent (pre-approval, or
  approval function has not yet run).
- `error` — token read failed.

Exports `canOpenBusinessListeners(status)` — the single predicate used by
the listener gate.

### 1.2 Edit — `src/pos-app/context/AppContext.tsx`

- Added `workspaceClaim` and `claimRefreshing` state.
- `onAuthStateChanged` now, after the email/registration/approval gates,
  runs `ensureWorkspaceClaim(user)` inside a `try/finally` that flips
  `claimRefreshing`. State is cleared on every auth transition and on
  sign-out (also clears `activeWorkspaceId` from `localStorage`).
- The real-time data `useEffect` (products / sales / stockMovements /
  issues / users listeners) now short-circuits until
  `canOpenBusinessListeners(workspaceClaim)` is true. `workspaceClaim` is
  added to the effect dep array so listeners open exactly once the claim
  resolves — no polling, no manual re-render trigger.
- On `state === 'missing'`, an actionable bilingual `authError` is set
  telling the user to sign out and back in (which mints a fresh token).
- A lightweight bilingual top banner ("Refreshing your workspace access…
  আপনার ওয়ার্কস্পেস অ্যাক্সেস রিফ্রেশ হচ্ছে…") renders while
  `claimRefreshing` is true. Non-blocking, `role="status"`, disappears
  automatically. No routing, no modal, no impact on offline UX.

### 1.3 Unchanged (verified by inspection)

- `firestore.rules` — Phase 2 file, byte-identical.
- `firestore.indexes.json` — unchanged since Phase 3 migration doc.
- `src/pos-app/lib/phase3Flags.ts` — both flags remain default OFF.
- `src/pos-app/lib/workspaceQuery.ts` — untouched; not wired anywhere.
- All 9 Phase 3 call sites (`AppContext` listeners, `Contacts`,
  `salesPagination`, etc.) — read paths unchanged.
- `Phase2MigrationBanner`, offline sync queue (`salesSyncQueue.ts`), PWA
  registration, and `firebase.ts` — untouched.

---

## 2. Root-cause mapping

| Symptom (from investigation §1) | Fix (this report) |
|---|---|
| Two boot-time listeners rejected with `PERMISSION_DENIED` | Listener effect gated on `canOpenBusinessListeners()` (§1.2) — the effect returns early until the claim is `ready` / admin |
| Stale token lacks `workspaceId` claim | `ensureWorkspaceClaim` forces a single `getIdToken(true)` (§1.1) |
| `activeWorkspaceId` not populated for `workspaceId.ts` writers | Helper mirrors resolved claim to `localStorage` (§1.1) |
| User has no signal that refresh is happening | Bilingual top banner while `claimRefreshing === true` (§1.2) |
| Approved user with no claim silently fails | Explicit `authError` prompting sign-out/in (§1.2) |

The two listeners identified in the investigation (targetId `1002` in the
Listen frame) correspond to `products` and `sales` — the first two
`onSnapshot` calls opened by the data `useEffect` on first paint. Both
are now blocked behind the gate.

---

## 3. Validation

### 3.1 Static

- `bunx tsgo --noEmit` — clean, no diagnostics.
- No new imports leak server-only modules; `workspaceClaim.ts` imports
  `type { User } from 'firebase/auth'` only.

### 3.2 Behavioural (walk-through)

1. Fresh sign-in with a token that already carries `workspaceId`:
   `ensureWorkspaceClaim` returns `ready` on the first read (no forced
   refresh, `refreshed: false`), listeners open in the same tick as
   `currentUser` is set. No user-visible change vs. today.
2. Signed-in session whose token predates approval (the console-error
   case): `getIdTokenResult` returns no `workspaceId` → forced refresh →
   `ready`. Banner flashes briefly, then listeners open. Zero
   `permission-denied` because listeners never attempted before the claim
   resolved.
3. Approved user whose claim is still missing after refresh (Cloud
   Function backlog / manual approval pending): status is `missing`,
   listeners stay closed, `authError` is set. No listeners → no
   `permission-denied` in the console.
4. Admin without a `workspaceId` claim: `admin-no-workspace` → listeners
   open as before. Preserves the admin-can-read-all path in Phase 2 rules.
5. Sign-out: `activeWorkspaceId` cleared, `workspaceClaim` reset, gate
   closes again for the next user.

### 3.3 Not affected

- **Offline sync** — `salesSyncQueue.ts` is untouched; queued writes
  already carry `workspaceId` via `withWorkspaceId()` before flush.
- **PWA** — no changes to service worker, manifest, or cache strategy.
- **Reports / dashboards** — no query rewiring; they still read via the
  existing listeners, which now simply open a tick later on affected
  sessions.
- **UI** — the only added surface is a passive top banner during refresh
  (typically < 1 s). No route, layout, or component tree changes.

### 3.4 Firestore query guarantee (in the gated path)

With the listener effect gated on `canOpenBusinessListeners`, no
Phase-2-protected `onSnapshot` fires without either:
- `admin === true` in claims, or
- a non-empty `workspaceId` in claims (mirrored to `localStorage`).

Rule `hasWorkspace()` therefore evaluates to `true` for every listener
that reaches Firestore. This closes the observed rejection class without
touching the queries themselves.

---

## 4. GO / NO-GO — Retry Phase 3

**Conditional GO** for the Phase 3 rollout retry, with the ramp starting
at dev-only audit (not production traffic):

- [x] Boot-time forced token refresh shipped (§1.1).
- [x] Listener creation gated on workspace-claim readiness (§1.2).
- [x] `authError` surfaced for pre-approval sessions.
- [x] `Phase2MigrationBanner` retained.
- [ ] 24 h preview soak with zero `permission-denied` in console — pending.
- [ ] Approved-user claim audit (Admin SDK list) — pending, read-only.

Recommended sequence to actually flip `phase3_query_scoping`:

1. Deploy this build, sign in with the previously-affected preview
   account, confirm no `permission-denied` over one full session.
2. Run the 24 h soak.
3. Enable `phase3_query_audit` in dev, resolve any hits (should be none
   because listeners are already workspace-safe under the gate).
4. Begin the staged ramp of `phase3_query_scoping` per
   `docs/multi-tenant-phase3-migration.md`.

Rollback for this fix is trivial: revert the two files
(`workspaceClaim.ts`, `AppContext.tsx`). No rule, schema, or data change
to undo.
