# Phase 3 Pre-flight — Admin SDK Claim Sweep & Repair Package

**Status:** Ready to run. NO claims mutated by this document. NO Firestore
rules touched. NO Phase 3 flags flipped. `phase3_query_scoping` and
`phase3_query_audit` remain OFF.

**Scope:** Provides the Admin SDK tooling required by
`docs/multi-tenant-phase3-claim-audit.md` §B1–B2:

1. A read-only sweep of every Firebase Auth user.
2. Classification of each user against `/registrations` + `/user_workspaces`.
3. A dry-run repair script.
4. An apply script (opt-in flag).
5. Rollback instructions.
6. A post-repair verification checklist.

---

## 1. Files delivered

| File | Purpose | Writes? |
|---|---|---|
| `scripts/audit-workspace-claims.mjs` | Sweep + classify all users | NO |
| `scripts/repair-workspace-claims.mjs` | Repair Class 3.1 / 3.2 | Only with `--apply` |
| `docs/multi-tenant-phase3-claim-repair.md` | This runbook | NO |

Both scripts share the same CLI conventions used by the existing
`scripts/backfill-workspace-id.mjs` and `scripts/repair-workspace-orphans.mjs`.

---

## 2. Signals inspected per user

For every Firebase Auth user the sweep records:

- `uid`, `email`, `disabled`
- `emailVerified` (Auth)
- `customClaims.workspaceId` (string or null)
- `customClaims.approved` (boolean)
- `customClaims.admin` (boolean)
- `metadata.lastSignInTime`, `tokensValidAfterTime`
- `/registrations/{uid}.status` (`approved` | `pending` | absent)
- `/user_workspaces/{uid}.workspaceId` (Firestore truth for membership)

The Firestore truth = `user_workspaces.workspaceId` if present, else
`registrations.workspaceId`. That value is the tie-breaker for stale claims.

---

## 3. Classification matrix

| Class | Predicate | Auto-repair? |
|---|---|---|
| `ok` | approved, verified, claim = Firestore | — |
| `pending` | `registrations.status !== 'approved'` | No (informational) |
| `unverified` | `emailVerified === false` | No (informational) |
| `orphan` | Auth user with no registration doc | No (manual triage) |
| `admin_no_ws` | admin claim, no Firestore membership | No (by design) |
| **`class_3_1_missing`** | approved user, claim absent OR `approved !== true` | **Yes** — set claim from Firestore |
| **`class_3_2_stale`** | claim workspace ≠ Firestore workspace | **Yes** — overwrite with Firestore truth |
| **`class_3_3_invalid`** | claim workspace present, but no membership doc exists | **No** — flagged for manual review |

Only Classes 3.1 and 3.2 are eligible for automated repair. Class 3.3 is
never auto-repaired — the claim points to a workspace the user is not a
member of, and blindly overwriting could mask an authorization bug.

---

## 4. Run the sweep (READ-ONLY)

### 4.1 Prereqs

- Service account JSON with `roles/firebase.admin` (or equivalent
  `iam.serviceAccountTokenCreator` + Auth Admin + Datastore User) exported
  as `GOOGLE_APPLICATION_CREDENTIALS`, or passed via `--service-account`.
- Node 20+.
- `firebase-admin` installed at repo root:
  ```
  npm i --no-save firebase-admin@^12
  ```

### 4.2 Command

```
GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
  node scripts/audit-workspace-claims.mjs \
    --project=fardouscomputer52 \
    --out=./reports/claim-audit
```

### 4.3 Output

- `reports/claim-audit.json` — full report + per-classification counts
- `reports/claim-audit.csv` — same rows, spreadsheet-friendly
- `reports/claim-audit.repairs.json` — queue for the repair script

The sweep performs **zero writes**. Safe to run against production during
business hours.

### 4.4 Success gate

Ready to move to §5 only if:

- `class_3_3_invalid == 0` (or every entry is triaged in this doc's §8 log)
- `orphan == 0` on approved-user emails (Auth-only users may exist for
  invitations; confirm each)
- Counts of `class_3_1_missing` + `class_3_2_stale` match the expected
  cohort from `docs/multi-tenant-phase3-claim-audit.md`

If Class 3.3 is non-zero, STOP and triage before running the repair.

---

## 5. Repair — DRY RUN (default)

```
GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
  node scripts/repair-workspace-claims.mjs \
    --project=fardouscomputer52 \
    --input=./reports/claim-audit.repairs.json
```

Emits `reports/claim-repair.log.json` with `planned` counts per uid and the
exact `nextClaims` payload that would be set. No calls to
`setCustomUserClaims`. No Firestore audit log entries.

Review the log with the workspace owner before proceeding.

---

## 6. Repair — APPLY

```
GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
  node scripts/repair-workspace-claims.mjs \
    --project=fardouscomputer52 \
    --input=./reports/claim-audit.repairs.json \
    --apply \
    --revoke-tokens
```

Behaviour with `--apply`:

- Reads current `customClaims` per uid (captured as `previousClaims`).
- Merges `{ workspaceId, approved: true, admin? }` on top.
- Calls `admin.auth().setCustomUserClaims(uid, nextClaims)`.
- With `--revoke-tokens`, calls `admin.auth().revokeRefreshTokens(uid)` so
  the next request forces a fresh ID token (skips the ~1 h wait for the
  existing ID token to expire; client-side `getIdToken(true)` in
  `workspaceClaim.ts` already covers most sessions but revoke is the
  defensive choice for the tail).
- Writes an audit row to
  `/audit_logs/claim_repair/entries/{ts}_{uid}` with previous + next claims
  and the acting script name.

Recommended run order:

1. Repair with `--apply` (no revoke) for internal test tenants.
2. Verify §7 checklist against those tenants.
3. Repair the remaining cohort with `--apply --revoke-tokens`.

---

## 7. Post-repair verification checklist

Run these checks **before** flipping any Phase 3 flag.

### 7.1 Automated

- [ ] Re-run `scripts/audit-workspace-claims.mjs` with the same flags.
- [ ] Confirm `class_3_1_missing == 0` and `class_3_2_stale == 0`.
- [ ] Confirm `class_3_3_invalid` unchanged (or 0 after manual triage).
- [ ] `reports/claim-repair.log.json` shows `error == 0`.
- [ ] Firestore `/audit_logs/claim_repair/entries` row count matches
      `applied` count in the log.

### 7.2 Live preview soak (single session)

- [ ] Sign in with an account that was in Class 3.1 before repair.
- [ ] `Phase2MigrationBanner` does not appear (or disappears within 1 s).
- [ ] Browser console: **zero** `permission-denied` from Firestore over a
      5-minute exercise of Sales, Contacts, Reports, Notifications.
- [ ] `AppContext` `authError` is null.
- [ ] Network tab: no `Listen/channel` frames with RPC code 7.

### 7.3 Rules test suite

- [ ] `e2e/firestore-rules.spec.ts` — 85 tests still PASS.
- [ ] `e2e/offline-sync.spec.ts` — PASS.
- [ ] `e2e/auth-route-protection.spec.ts` — 5 static PASS.

### 7.4 Data integrity

- [ ] Spot-check 5 repaired users in Firebase Console → Authentication →
      Custom claims — payload matches `nextClaims` in the log.
- [ ] Spot-check 5 audit log entries in Firestore — `previousClaims` field
      is populated (rollback prerequisite).

Only after 7.1–7.4 all check green does Phase 3 retry become **GO**.

---

## 8. Rollback

Rollback is per-user and driven off the repair log.

### 8.1 Single user

Restore that user's `previousClaims` from the log entry:

```
node -e '
  const admin = require("firebase-admin");
  admin.initializeApp({ projectId: "fardouscomputer52" });
  const uid = process.argv[1];
  const prev = JSON.parse(process.argv[2]); // paste previousClaims JSON
  admin.auth().setCustomUserClaims(uid, prev)
    .then(() => admin.auth().revokeRefreshTokens(uid))
    .then(() => console.log("restored", uid));
' <uid> '<previousClaims-json>'
```

Or use the Firestore audit log:

```
/audit_logs/claim_repair/entries/{ts}_{uid}.previousClaims
```

### 8.2 Full batch rollback

`reports/claim-repair.log.json` contains `previousClaims` for every applied
entry. Feed it through a short script that iterates `results[]` where
`applied === true` and calls `setCustomUserClaims(uid, previousClaims)`
followed by `revokeRefreshTokens(uid)`.

### 8.3 What rollback does NOT touch

- No Firestore business data.
- No `firestore.rules`.
- No Phase 3 flags (they were never flipped).
- No `Phase2MigrationBanner` state.

### 8.4 When to roll back

- Post-repair audit shows a **new** Class 3.3 population (the repair
  moved users onto workspaces they don't belong to — indicates a bad
  `user_workspaces` doc, not a script bug).
- `permission-denied` rate rises above baseline after repair.
- Business tenant reports missing data (would indicate stale IndexedDB
  cache colliding with the new workspaceId — clear cache first;
  `ensureWorkspaceCacheFor` should handle this automatically).

---

## 9. Non-goals / hard invariants

This package **does not**:

- Modify claims automatically. `--apply` is required and off by default.
- Change `firestore.rules`. Phase 2 rules stay live.
- Change indexes.
- Flip `phase3_query_scoping` or `phase3_query_audit`. Both remain OFF.
- Rewire any of the 9 Phase 3 call sites in
  `docs/multi-tenant-phase3-migration.md`.
- Touch `cat_seed_default` (Phase 4 concern).
- Delete or archive Auth users.

Anything above is out of scope for this runbook and requires its own
approval gate.

---

## 10. Manual triage log (Class 3.3 & orphans)

Fill in during the sweep. One row per uid.

| uid | email | classification | Firestore state | Decision | Owner | Ticket |
|---|---|---|---|---|---|---|
| _(empty until sweep runs)_ | | | | | | |

Decisions typically fall into: (a) delete Auth user (test artifact),
(b) manually set correct `user_workspaces` doc then re-run sweep,
(c) mark disabled pending owner contact.

---

## 11. GO / NO-GO gate for Phase 3 retry

Phase 3 retry becomes **GO** only when:

- [ ] Sweep §4 executed and archived.
- [ ] Dry-run §5 reviewed and signed off.
- [ ] Apply §6 executed and log archived.
- [ ] All §7 checklist items green.
- [ ] Rollback rehearsed on one non-critical user (optional but recommended).
- [ ] `docs/multi-tenant-phase3-claim-audit.md` updated with the actual
      class counts observed.

Until every box is checked, Phase 3 flags stay OFF and no call site is
rewired.
