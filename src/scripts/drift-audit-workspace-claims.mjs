#!/usr/bin/env node
/**
 * Hybrid identity — monthly drift audit (READ-ONLY).
 *
 * Compares three sources for every Firebase Auth user:
 *   1. Custom claims (authoritative — used by firestore.rules)
 *   2. /users/{uid} mirror (operational fallback for tooling)
 *   3. /user_workspaces/{uid} membership (business truth)
 *
 * Emits a mismatch report but NEVER writes. Intended to run monthly
 * from CI or a scheduled runner. Escalation:
 *   - drift_claim_vs_membership → feed into repair-workspace-claims
 *   - drift_mirror_vs_claim     → feed into sync-user-mirror
 *   - drift_orphan_mirror       → manual review (mirror doc for a
 *                                  user that no longer exists in Auth)
 *
 * Exit codes:
 *   0  no drift
 *   1  drift detected (see report)
 *   2  configuration error
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
 *   node scripts/drift-audit-workspace-claims.mjs \
 *     --project=fardouscomputer52 \
 *     --out=./reports/drift
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const projectId = args.project;
if (!projectId) { console.error('--project=<id> required'); process.exit(2); }
const outBase = String(args.out ?? `./reports/drift-${Date.now()}`);
const concurrency = Math.max(1, Number(args.concurrency ?? 25));

initializeApp({ projectId, credential: applicationDefault() });
const auth = getAuth();
const db = getFirestore();

async function pMap(items, fn, n) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) { const idx = i++; await fn(items[idx]); }
    }),
  );
}

const drift = {
  drift_claim_vs_membership: [],
  drift_mirror_vs_claim: [],
  drift_missing_mirror: [],
  drift_orphan_mirror: [],
};
const seenAuthUids = new Set();
const summary = { scanned: 0, users: 0, mirrors: 0, driftCount: 0 };

let pageToken;
do {
  const page = await auth.listUsers(1000, pageToken);
  pageToken = page.pageToken;
  summary.users += page.users.length;
  await pMap(page.users, async (u) => {
    summary.scanned++;
    seenAuthUids.add(u.uid);
    const claims = u.customClaims ?? {};
    const claimWs = claims.workspaceId ?? null;
    const [mirrorSnap, membershipSnap] = await Promise.all([
      db.doc(`users/${u.uid}`).get(),
      db.doc(`user_workspaces/${u.uid}`).get(),
    ]);
    const mirror = mirrorSnap.exists ? mirrorSnap.data() : null;
    const membership = membershipSnap.exists ? membershipSnap.data() : null;
    const membershipWs = membership?.workspaceId ?? null;
    const mirrorWs = mirror?.workspaceId ?? null;

    if (claimWs && membershipWs && claimWs !== membershipWs) {
      drift.drift_claim_vs_membership.push({ uid: u.uid, claim: claimWs, membership: membershipWs });
    }
    if (claimWs && mirrorWs && claimWs !== mirrorWs) {
      drift.drift_mirror_vs_claim.push({ uid: u.uid, claim: claimWs, mirror: mirrorWs });
    }
    if (claimWs && !mirror) {
      drift.drift_missing_mirror.push({ uid: u.uid, claim: claimWs });
    }
  }, concurrency);
} while (pageToken);

// Orphan mirrors: users/{uid} docs whose uid no longer exists in Auth.
const mirrorSnap = await db.collection('users').select().get();
summary.mirrors = mirrorSnap.size;
for (const doc of mirrorSnap.docs) {
  if (!seenAuthUids.has(doc.id)) {
    drift.drift_orphan_mirror.push({ uid: doc.id });
  }
}

summary.driftCount =
  drift.drift_claim_vs_membership.length +
  drift.drift_mirror_vs_claim.length +
  drift.drift_missing_mirror.length +
  drift.drift_orphan_mirror.length;

mkdirSync(dirname(outBase + '.json'), { recursive: true });
writeFileSync(outBase + '.json', JSON.stringify({ summary, drift }, null, 2));
const rows = ['category,uid,claim,membership,mirror'];
for (const [cat, list] of Object.entries(drift)) {
  for (const e of list) rows.push([cat, e.uid, e.claim ?? '', e.membership ?? '', e.mirror ?? ''].join(','));
}
writeFileSync(outBase + '.csv', rows.join('\n'));

console.log(`[drift] scanned=${summary.scanned} mirrors=${summary.mirrors} drift=${summary.driftCount}`);
for (const [cat, list] of Object.entries(drift)) console.log(`[drift]   ${cat}: ${list.length}`);
console.log(`[drift] report → ${outBase}.{json,csv}`);
process.exit(summary.driftCount === 0 ? 0 : 1);
