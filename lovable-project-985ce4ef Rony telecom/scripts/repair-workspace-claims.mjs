#!/usr/bin/env node
/**
 * Phase 3 pre-flight — Admin SDK claim repair.
 *
 * Consumes the `*.repairs.json` file produced by
 * `scripts/audit-workspace-claims.mjs` and, for each entry, sets the
 * missing/stale custom claims via `admin.auth().setCustomUserClaims`.
 *
 * Defaults to DRY-RUN. No writes happen without `--apply`.
 *
 * Class handling:
 *   class_3_1_missing → set { workspaceId, approved: true, admin? }
 *   class_3_2_stale   → set { workspaceId (Firestore truth), approved: true, admin? }
 *   class_3_3_invalid → NEVER auto-repaired (audit marks manual_review)
 *
 * Every applied change is journaled to `/audit_logs/claim_repair/{ts}_{uid}`
 * so we have a Firestore-side paper trail matching the console output.
 *
 * Usage:
 *   Dry run (default):
 *     node scripts/repair-workspace-claims.mjs \
 *       --project=fardouscomputer52 \
 *       --input=./reports/claim-audit.repairs.json
 *
 *   Apply:
 *     node scripts/repair-workspace-claims.mjs \
 *       --project=fardouscomputer52 \
 *       --input=./reports/claim-audit.repairs.json \
 *       --apply \
 *       --revoke-tokens   # optional: forces existing sessions to refresh
 *
 * Rollback: see docs/multi-tenant-phase3-claim-repair.md §Rollback.
 */

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { argv, env, exit } from 'node:process';

const args = Object.fromEntries(
  argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const PROJECT_ID = args.project ?? env.GCLOUD_PROJECT ?? env.GOOGLE_CLOUD_PROJECT;
const INPUT = resolve(args.input ?? './reports/claim-audit.repairs.json');
const APPLY = args.apply === 'true' || args.apply === '1';
const REVOKE = args['revoke-tokens'] === 'true' || args['revoke-tokens'] === '1';
const CONCURRENCY = Math.max(1, Number(args.concurrency ?? 10));
const LOG_OUT = resolve(args['log-out'] ?? './reports/claim-repair.log.json');

if (!PROJECT_ID) {
  console.error('Missing --project=<firebase-project-id>.');
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
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await worker(items[idx], idx);
      }
    }),
  );
  return out;
}

async function repairOne(entry) {
  const { uid, workspaceId, approved, admin, classification, email } = entry;
  const record = {
    uid, email, classification, workspaceId,
    approved: approved === true, admin: admin === true,
    at: new Date().toISOString(),
    applied: false, previousClaims: null, error: null,
  };
  try {
    const before = await auth.getUser(uid);
    record.previousClaims = before.customClaims ?? {};

    const nextClaims = {
      ...(before.customClaims ?? {}),
      workspaceId,
      approved: true,
    };
    if (admin === true) nextClaims.admin = true;

    if (!APPLY) {
      record.plannedClaims = nextClaims;
      return record;
    }

    await auth.setCustomUserClaims(uid, nextClaims);
    if (REVOKE) await auth.revokeRefreshTokens(uid);

    await db.collection('audit_logs').doc('claim_repair')
      .collection('entries')
      .doc(`${Date.now()}_${uid}`)
      .set({
        uid, email, classification, workspaceId,
        previousClaims: record.previousClaims,
        nextClaims,
        revokedTokens: REVOKE,
        at: FieldValue.serverTimestamp(),
        actor: 'scripts/repair-workspace-claims.mjs',
      });

    record.applied = true;
    record.nextClaims = nextClaims;
    return record;
  } catch (err) {
    record.error = err?.message ?? String(err);
    return record;
  }
}

async function main() {
  const raw = await readFile(INPUT, 'utf8');
  const queue = JSON.parse(raw);
  if (!Array.isArray(queue)) {
    console.error(`[repair] input is not an array: ${INPUT}`);
    exit(2);
  }
  const safe = queue.filter((e) => e && e.uid && e.workspaceId
    && (e.classification === 'class_3_1_missing' || e.classification === 'class_3_2_stale'));

  console.error(`[repair] project=${PROJECT_ID} apply=${APPLY} revoke=${REVOKE}`);
  console.error(`[repair] queue total=${queue.length} eligible=${safe.length}`);
  if (safe.length !== queue.length) {
    console.error(`[repair] skipped ${queue.length - safe.length} entries (missing fields or non-auto class)`);
  }

  const results = await pool(safe, CONCURRENCY, repairOne);

  const counts = results.reduce(
    (acc, r) => {
      const k = r.error ? 'error' : r.applied ? 'applied' : 'planned';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {},
  );

  await mkdir(dirname(LOG_OUT), { recursive: true });
  await writeFile(
    LOG_OUT,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), project: PROJECT_ID, apply: APPLY, revoke: REVOKE, counts, results },
      null,
      2,
    ),
  );

  console.error('[repair] done', counts);
  console.error(`[repair] log at ${LOG_OUT}`);
  if (!APPLY) console.error('[repair] DRY RUN — re-run with --apply to persist changes.');
}

main().catch((err) => {
  console.error('[repair] fatal', err);
  exit(1);
});
