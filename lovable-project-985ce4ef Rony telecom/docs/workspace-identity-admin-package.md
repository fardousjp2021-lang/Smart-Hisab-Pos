# Workspace Identity — Admin SDK Package & Phase 3 Retry Checklist

Implements the hybrid architecture approved in
`docs/workspace-identity-architecture.md`. Claims stay authoritative
(`firestore.rules` unchanged); `/users/{uid}` becomes the mirror
fallback used by admin tooling. This document ships the operator
runbook only — no code, rules, claims, or UI are modified by adopting it.

## 1. Package contents

| Script                                         | Mode(s)                    | Writes                                   |
| ---------------------------------------------- | -------------------------- | ---------------------------------------- |
| `scripts/audit-workspace-claims.mjs`           | read-only                  | none                                     |
| `scripts/repair-workspace-claims.mjs`          | dry-run (default), `--apply` | `auth.setCustomUserClaims`, `/audit_logs/claim_repair/*` |
| `scripts/rollback-workspace-claims.mjs` (new)  | dry-run (default), `--apply` | reverts claims from journal, marks entry rolledBackAt |
| `scripts/sync-user-mirror.mjs` (new)           | dry-run (default), `--apply` | `/users/{uid}` merge-writes only         |
| `scripts/drift-audit-workspace-claims.mjs` (new) | read-only                  | none (exits 1 on drift)                  |

All scripts:
- Use the Firebase Admin SDK with `GOOGLE_APPLICATION_CREDENTIALS`.
- Default to dry-run where they can write.
- Are idempotent and safe to re-run.
- Do not read or edit `firestore.rules`.

## 2. Setup

```bash
# 1. Install (once)
bun add -d firebase-admin

# 2. Provision a service account with these roles on the target project:
#    - Firebase Authentication Admin
#    - Cloud Datastore User          (Firestore read/write)
#    - (optional) Logs Writer        (for /audit_logs)
# Download the JSON key.

# 3. Point the shell at it
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/sa.json
export PROJECT_ID=fardouscomputer52
```

## 3. One-time Phase 3 unblock (backfill)

Run in order. Each step is dry-run first, then apply.

```bash
# 3.1 — Read-only audit of every Auth user
node scripts/audit-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --out=./reports/claim-audit

# 3.2 — Dry-run repair of Class 3.1 (missing) + 3.2 (stale)
node scripts/repair-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --input=./reports/claim-audit.repairs.json

# 3.3 — Apply (with token revocation to force refresh)
node scripts/repair-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --input=./reports/claim-audit.repairs.json \
  --apply --revoke-tokens

# 3.4 — Dry-run the mirror sync
node scripts/sync-user-mirror.mjs --project=$PROJECT_ID

# 3.5 — Apply the mirror (safe, additive merge write)
node scripts/sync-user-mirror.mjs --project=$PROJECT_ID --apply

# 3.6 — Post-backfill drift check (must exit 0)
node scripts/drift-audit-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --out=./reports/drift-postbackfill
```

Rollback (if 3.3 caused any regression):

```bash
node scripts/rollback-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --since=<ISO timestamp of 3.3 run>
# review, then --apply --revoke-tokens
```

## 4. Monthly drift workflow

Wire the drift script into a monthly scheduled job (CI, Cloud Run job,
or an on-call laptop cron). It is read-only, so no permissions or
rules review needed for repeated runs.

```bash
node scripts/drift-audit-workspace-claims.mjs \
  --project=$PROJECT_ID \
  --out=./reports/drift-$(date +%Y-%m)
```

Interpretation:

| Category                        | Follow-up                                       |
| ------------------------------- | ----------------------------------------------- |
| `drift_claim_vs_membership`     | Re-run audit → repair for the listed uids       |
| `drift_mirror_vs_claim`         | Re-run `sync-user-mirror.mjs --apply`           |
| `drift_missing_mirror`          | Re-run `sync-user-mirror.mjs --only-missing --apply` |
| `drift_orphan_mirror`           | Manual review — usually deleted-user cleanup    |

Expected steady-state: `driftCount == 0`. Any non-zero result opens
a ticket; no scripted auto-repair runs.

## 5. Verification checklist (proves nothing regressed)

After the backfill + mirror sync, confirm each item before flipping
Phase 3 flags:

- [ ] `firestore.rules` diff vs. `rules/backup/pre-phase2.rules` is
      identical to the diff at end of Phase 2 (no new changes).
- [ ] `src/pos-app/lib/workspaceClaim.ts` unchanged; boot banner still
      appears only for users with missing claim.
- [ ] `src/pos-app/salesSyncQueue.ts` unchanged; offline queue still
      flushes on reconnect (spot-check with airplane mode + 3 sales).
- [ ] Token refresh: sign in as a repaired user; `getIdTokenResult()`
      now contains `workspaceId` on first paint (no banner).
- [ ] UI parity: sidebar, POS, Reports, Settings pages render
      byte-identically vs. pre-run screenshots.
- [ ] Firestore rules test suite (`e2e/firestore-rules.spec.ts`)
      still 85/85 PASS.
- [ ] Offline sync spec (`e2e/offline-sync.spec.ts`) still PASS.
- [ ] Drift audit for the whole tenant exits 0.

## 6. Phase 3 retry checklist

Only after §5 is fully green:

- [ ] Confirm `docs/multi-tenant-phase3-claim-audit.md` classes 3.1
      and 3.2 counts are both 0 in the latest audit.
- [ ] Confirm class 3.3 is 0 or has a signed-off manual-review note.
- [ ] Confirm `firestore.indexes.json` composites are all READY (run
      `node scripts/verify-firestore-indexes.mjs --live`).
- [ ] Announce a 30-minute maintenance window (advisory — no downtime
      expected; safety net only).
- [ ] Flip `phase3_scoped_queries` flag ON in
      `src/pos-app/lib/phase3Flags.ts` **in a follow-up PR** (not
      part of this package).
- [ ] Monitor preview console for `permission-denied` for 30 min; if
      any appear on own-tenant listeners, flip flag OFF, rerun
      audit, rollback if required.
- [ ] At T+24h, re-run drift audit; expect 0.

## 7. What this package deliberately does NOT do

- Does not modify `firestore.rules` or any rule file.
- Does not modify any query call site or client component.
- Does not modify offline sync, PWA behavior, or IMEI reservation.
- Does not auto-execute the sweep; every write requires an explicit
  `--apply` from an operator.
- Does not delete users, mirror docs, or audit-log entries.
- Does not flip Phase 3 flags — that stays a manual follow-up PR.
