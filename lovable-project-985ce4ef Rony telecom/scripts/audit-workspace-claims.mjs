#!/usr/bin/env node
/**
 * Phase 3 pre-flight — Admin SDK claim sweep (READ-ONLY).
 *
 * Audits every Firebase Auth user and cross-references their custom claims
 * against `/registrations/{uid}` and `/user_workspaces/{uid}` in Firestore.
 * Produces a JSON + CSV report classifying each user into one of:
 *
 *   ok                — claims present, workspace matches registration
 *   class_3_1_missing — approved user with no `workspaceId` claim
 *   class_3_2_stale   — claim present but does not match Firestore membership
 *   class_3_3_invalid — claim points to a workspace the user is not a member of
 *   pending           — registration exists but not yet approved (informational)
 *   unverified        — email not verified (informational)
 *   admin_no_ws       — admin user without workspaceId (allowed by design)
 *   orphan            — auth user with no registration doc (informational)
 *
 * NO writes. NO claim mutations. NO rules changes. Safe to run against prod.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
 *   node scripts/audit-workspace-claims.mjs \
 *     --project=fardouscomputer52 \
 *     --out=./reports/claim-audit
 *
 * Optional flags:
 *   --page-size=1000     listUsers page size (default 1000, max 1000)
 *   --concurrency=25     Firestore lookup concurrency (default 25)
 *   --limit=0            stop after N users (0 = all)
 */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { argv, env, exit } from 'node:process';

const args = Object.fromEntries(
  argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const PROJECT_ID = args.project ?? env.GCLOUD_PROJECT ?? env.GOOGLE_CLOUD_PROJECT;
const OUT_BASE = resolve(args.out ?? './reports/claim-audit');
const PAGE_SIZE = Math.min(Number(args['page-size'] ?? 1000), 1000);
const CONCURRENCY = Math.max(1, Number(args.concurrency ?? 25));
const LIMIT = Number(args.limit ?? 0);

if (!PROJECT_ID) {
  console.error('Missing --project=<firebase-project-id> (or GCLOUD_PROJECT env).');
  exit(2);
}

initializeApp(
  env.GOOGLE_APPLICATION_CREDENTIALS
    ? { credential: applicationDefault(), projectId: PROJECT_ID }
    : args['service-account']
      ? { credential: cert(resolve(args['service-account'])), projectId: PROJECT_ID }
      : { projectId: PROJECT_ID },
);

const auth = getAuth();
const db = getFirestore();

async function pool(items, size, worker) {
  const out = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return out;
}

async function classify(user) {
  const uid = user.uid;
  const claims = user.customClaims ?? {};
  const claimWs = typeof claims.workspaceId === 'string' && claims.workspaceId.length > 0
    ? claims.workspaceId
    : null;
  const claimApproved = claims.approved === true;
  const claimAdmin = claims.admin === true;

  const [regSnap, memSnap] = await Promise.all([
    db.doc(`registrations/${uid}`).get().catch(() => null),
    db.doc(`user_workspaces/${uid}`).get().catch(() => null),
  ]);
  const reg = regSnap?.exists ? regSnap.data() : null;
  const mem = memSnap?.exists ? memSnap.data() : null;
  const fsWorkspaceId = mem?.workspaceId ?? reg?.workspaceId ?? null;
  const regStatus = reg?.status ?? null;

  const base = {
    uid,
    email: user.email ?? null,
    emailVerified: user.emailVerified === true,
    disabled: user.disabled === true,
    lastSignInTime: user.metadata?.lastSignInTime ?? null,
    tokensValidAfterTime: user.tokensValidAfterTime ?? null,
    claim_workspaceId: claimWs,
    claim_approved: claimApproved,
    claim_admin: claimAdmin,
    firestore_workspaceId: fsWorkspaceId,
    registration_status: regStatus,
  };

  if (!reg) {
    return { ...base, classification: 'orphan', repair: null };
  }
  if (regStatus && regStatus !== 'approved') {
    return { ...base, classification: 'pending', repair: null };
  }
  if (!user.emailVerified) {
    return { ...base, classification: 'unverified', repair: null };
  }
  if (claimAdmin && !fsWorkspaceId) {
    return { ...base, classification: 'admin_no_ws', repair: null };
  }
  if (!claimWs && fsWorkspaceId) {
    return {
      ...base,
      classification: 'class_3_1_missing',
      repair: { action: 'set_claim', workspaceId: fsWorkspaceId, approved: true },
    };
  }
  if (claimWs && fsWorkspaceId && claimWs !== fsWorkspaceId) {
    return {
      ...base,
      classification: 'class_3_2_stale',
      repair: { action: 'set_claim', workspaceId: fsWorkspaceId, approved: true },
    };
  }
  if (claimWs && !fsWorkspaceId) {
    return {
      ...base,
      classification: 'class_3_3_invalid',
      repair: { action: 'manual_review', reason: 'claim references workspace with no membership doc' },
    };
  }
  if (claimWs && !claimApproved) {
    return {
      ...base,
      classification: 'class_3_1_missing',
      repair: { action: 'set_claim', workspaceId: claimWs, approved: true },
    };
  }
  return { ...base, classification: 'ok', repair: null };
}

async function main() {
  console.error(`[audit] project=${PROJECT_ID} pageSize=${PAGE_SIZE} concurrency=${CONCURRENCY}`);
  const rows = [];
  let pageToken;
  let seen = 0;
  do {
    const page = await auth.listUsers(PAGE_SIZE, pageToken);
    const batch = LIMIT > 0 ? page.users.slice(0, Math.max(0, LIMIT - seen)) : page.users;
    const classified = await pool(batch, CONCURRENCY, classify);
    rows.push(...classified);
    seen += batch.length;
    pageToken = page.pageToken;
    console.error(`[audit] scanned=${seen}`);
    if (LIMIT > 0 && seen >= LIMIT) break;
  } while (pageToken);

  const counts = rows.reduce((acc, r) => {
    acc[r.classification] = (acc[r.classification] ?? 0) + 1;
    return acc;
  }, {});

  await mkdir(dirname(OUT_BASE + '.json'), { recursive: true });
  await writeFile(
    OUT_BASE + '.json',
    JSON.stringify(
      { generatedAt: new Date().toISOString(), project: PROJECT_ID, total: rows.length, counts, rows },
      null,
      2,
    ),
  );

  const headers = [
    'uid', 'email', 'emailVerified', 'disabled', 'classification',
    'claim_workspaceId', 'claim_approved', 'claim_admin',
    'firestore_workspaceId', 'registration_status',
    'lastSignInTime', 'tokensValidAfterTime',
    'repair_action', 'repair_workspaceId',
  ];
  const csv = [headers.join(',')].concat(
    rows.map((r) => headers.map((h) => {
      const v = h.startsWith('repair_')
        ? r.repair?.[h.replace('repair_', '')] ?? ''
        : r[h] ?? '';
      const s = String(v).replaceAll('"', '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',')),
  ).join('\n');
  await writeFile(OUT_BASE + '.csv', csv);

  // Machine-readable repair queue (input to repair-workspace-claims.mjs)
  const repairs = rows
    .filter((r) => r.repair && r.repair.action === 'set_claim')
    .map((r) => ({
      uid: r.uid,
      email: r.email,
      classification: r.classification,
      workspaceId: r.repair.workspaceId,
      approved: r.repair.approved === true,
      admin: r.claim_admin === true,
    }));
  await writeFile(OUT_BASE + '.repairs.json', JSON.stringify(repairs, null, 2));

  console.error('[audit] done', counts);
  console.error(`[audit] wrote ${OUT_BASE}.json / .csv / .repairs.json`);
}

main().catch((err) => {
  console.error('[audit] fatal', err);
  exit(1);
});
