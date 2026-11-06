#!/usr/bin/env node
/**
 * Hybrid identity — user mirror sync (Option C in
 * docs/workspace-identity-architecture.md).
 *
 * Writes/refreshes `/users/{uid}` mirror docs from the source of truth
 * (Firebase Auth custom claims + `/user_workspaces/{uid}` membership).
 * The mirror is READ-ONLY for admin tooling / reports; authorization
 * still comes from the signed ID-token claim. Rules are unchanged.
 *
 * Mirror doc shape (additive — does not remove existing fields):
 *   {
 *     uid,
 *     workspaceId,        // from claim (source of truth)
 *     role,               // 'admin' | 'member'
 *     email,
 *     emailVerified,
 *     approved,
 *     mirrorUpdatedAt,    // server timestamp
 *     mirrorSource: 'sync-user-mirror.mjs',
 *   }
 *
 * Defaults to DRY-RUN. No writes without --apply.
 *
 * Usage:
 *   node scripts/sync-user-mirror.mjs \
 *     --project=fardouscomputer52 \
 *     [--only-missing]      # only write docs that don't exist yet
 *     [--apply]             # perform writes
 *     [--limit=0]           # cap for smoke tests
 *     [--concurrency=25]
 *
 * NO claim mutations. NO rule edits. NO deletions. Safe to re-run.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
const apply = args.apply === true;
const onlyMissing = args['only-missing'] === true;
const limit = Number(args.limit ?? 0);
const concurrency = Math.max(1, Number(args.concurrency ?? 25));
const outPath = String(args.out ?? `./reports/user-mirror-${Date.now()}.json`);

initializeApp({
  projectId,
  credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : undefined,
});
const auth = getAuth();
const db = getFirestore();

async function pMap(items, fn, n) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

const summary = { scanned: 0, wouldWrite: 0, wrote: 0, skipped: 0, errors: 0, entries: [] };
let pageToken;
outer: do {
  const page = await auth.listUsers(1000, pageToken);
  pageToken = page.pageToken;
  await pMap(page.users, async (u) => {
    if (limit && summary.scanned >= limit) return;
    summary.scanned++;
    try {
      const claims = u.customClaims ?? {};
      const workspaceId = claims.workspaceId ?? null;
      if (!workspaceId) { summary.skipped++; return; }
      const ref = db.doc(`users/${u.uid}`);
      const snap = await ref.get();
      if (snap.exists && onlyMissing) { summary.skipped++; return; }
      const payload = {
        uid: u.uid,
        workspaceId,
        role: claims.admin ? 'admin' : 'member',
        email: u.email ?? null,
        emailVerified: !!u.emailVerified,
        approved: !!claims.approved,
        mirrorUpdatedAt: FieldValue.serverTimestamp(),
        mirrorSource: 'sync-user-mirror.mjs',
      };
      summary.entries.push({ uid: u.uid, workspaceId, existed: snap.exists });
      if (apply) {
        await ref.set(payload, { merge: true });
        summary.wrote++;
      } else {
        summary.wouldWrite++;
      }
    } catch (e) {
      summary.errors++;
      summary.entries.push({ uid: u.uid, error: String(e?.message ?? e) });
    }
  }, concurrency);
  if (limit && summary.scanned >= limit) break outer;
} while (pageToken);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(`[user-mirror] scanned=${summary.scanned} ${apply ? `wrote=${summary.wrote}` : `wouldWrite=${summary.wouldWrite}`} skipped=${summary.skipped} errors=${summary.errors}`);
console.log(`[user-mirror] report → ${outPath}`);
if (!apply) console.log('[user-mirror] DRY-RUN. Re-run with --apply to persist.');
