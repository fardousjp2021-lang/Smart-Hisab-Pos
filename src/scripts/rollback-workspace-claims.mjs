#!/usr/bin/env node
/**
 * Hybrid identity — claim rollback.
 *
 * Reverts custom-claim changes made by `scripts/repair-workspace-claims.mjs`
 * using the journal at `/audit_logs/claim_repair/*`. Every journal entry
 * records `previousClaims`, so rollback is deterministic.
 *
 * Modes:
 *   Default (dry-run)                     : print what would be reverted.
 *   --apply                               : actually setCustomUserClaims.
 *   --uid=<uid>                           : rollback a single user.
 *   --since=<ISO> --until=<ISO>           : rollback a time window.
 *   --revoke-tokens                       : also revoke sessions after revert.
 *
 * NEVER touches Firestore rules, business data, mirror docs, or Auth
 * fields other than customClaims. Journal entries themselves are
 * preserved (a `rollback_of` marker is written alongside).
 *
 * Usage:
 *   node scripts/rollback-workspace-claims.mjs \
 *     --project=fardouscomputer52 \
 *     --since=2026-07-17T00:00:00Z
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const projectId = args.project;
if (!projectId) { console.error('--project=<id> required'); process.exit(2); }
const apply = args.apply === true;
const revoke = args['revoke-tokens'] === true;
const uidFilter = args.uid ? String(args.uid) : null;
const since = args.since ? new Date(String(args.since)) : null;
const until = args.until ? new Date(String(args.until)) : null;

initializeApp({ projectId, credential: applicationDefault() });
const auth = getAuth();
const db = getFirestore();

let q = db.collection('audit_logs').doc('claim_repair').collection('entries');
if (since) q = q.where('appliedAt', '>=', since);
if (until) q = q.where('appliedAt', '<=', until);
const snap = await q.get();

const targets = [];
snap.forEach((d) => {
  const data = d.data();
  if (uidFilter && data.uid !== uidFilter) return;
  if (!data.previousClaims) return;
  if (data.rolledBackAt) return;
  targets.push({ id: d.id, ...data });
});

console.log(`[rollback] candidates=${targets.length} apply=${apply}`);
let ok = 0, err = 0;
for (const t of targets) {
  try {
    if (apply) {
      await auth.setCustomUserClaims(t.uid, t.previousClaims ?? null);
      if (revoke) await auth.revokeRefreshTokens(t.uid);
      await db.collection('audit_logs').doc('claim_repair').collection('entries').doc(t.id).set({
        rolledBackAt: FieldValue.serverTimestamp(),
        rollbackTool: 'rollback-workspace-claims.mjs',
      }, { merge: true });
    }
    console.log(`  ${apply ? 'REVERTED' : 'WOULD REVERT'} ${t.uid} → ${JSON.stringify(t.previousClaims)}`);
    ok++;
  } catch (e) {
    err++;
    console.error(`  FAIL ${t.uid}: ${e?.message ?? e}`);
  }
}
console.log(`[rollback] done ok=${ok} err=${err}`);
if (!apply) console.log('[rollback] DRY-RUN. Re-run with --apply to execute.');
process.exit(err === 0 ? 0 : 1);
