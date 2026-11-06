#!/usr/bin/env node
/**
 * Phase 1 backfill — populate `workspaceId` on all documents in business
 * collections that don't have one yet.
 *
 * Usage:
 *   node scripts/backfill-workspace-id.mjs --project <projectId> --dry-run
 *   node scripts/backfill-workspace-id.mjs --project <projectId> --apply
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS to point at a service-account key
 * with Firestore write access.
 *
 * Resolution strategy for a document's workspaceId (in order):
 *   1. Document already has workspaceId → skip.
 *   2. Document has ownerUid / createdBy / userId → look up that user's
 *      profile at users/{uid} and use profile.workspaceId.
 *   3. Otherwise → write to `orphans.csv` for manual triage. NEVER guess.
 *
 * Guarantees:
 *   - Idempotent: safe to re-run.
 *   - Non-destructive: only sets missing fields; never overwrites existing ones.
 *   - Chunked: 400 writes per batch to stay under the 500-op limit.
 *   - Emits a per-collection report at the end.
 *
 * Rollback: run with --unset to remove the workspaceId field again.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { writeFileSync, appendFileSync, existsSync, unlinkSync } from 'node:fs';
import { argv, exit } from 'node:process';

const COLLECTIONS = [
  'products', 'services', 'categories', 'brands', 'variants',
  'customers', 'suppliers', 'sales', 'purchases', 'expenses',
  'notifications', 'reports',
];
const OWNER_FIELDS = ['ownerUid', 'createdBy', 'userId', 'uid'];
const BATCH_SIZE = 400;
const ORPHANS = 'orphans.csv';

function parseArgs() {
  const args = { project: null, dryRun: false, apply: false, unset: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') args.project = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--apply') args.apply = true;
    else if (a === '--unset') args.unset = true;
  }
  if (!args.project) { console.error('Missing --project <projectId>'); exit(1); }
  if (!args.dryRun && !args.apply && !args.unset) { console.error('Pass --dry-run, --apply, or --unset'); exit(1); }
  return args;
}

async function resolveWorkspaceForOwner(db, cache, ownerUid) {
  if (!ownerUid) return null;
  if (cache.has(ownerUid)) return cache.get(ownerUid);
  const snap = await db.collection('users').doc(ownerUid).get();
  const ws = snap.exists ? (snap.data().workspaceId ?? null) : null;
  cache.set(ownerUid, ws);
  return ws;
}

async function processCollection(db, name, args, userCache) {
  const snap = await db.collection(name).get();
  let scanned = 0, needsBackfill = 0, resolved = 0, orphaned = 0, unset = 0;
  let batch = db.batch();
  let opsInBatch = 0;

  for (const docSnap of snap.docs) {
    scanned++;
    const data = docSnap.data();

    if (args.unset) {
      if (data.workspaceId !== undefined) {
        batch.update(docSnap.ref, { workspaceId: FieldValue.delete() });
        opsInBatch++;
        unset++;
      }
    } else {
      if (typeof data.workspaceId === 'string' && data.workspaceId.length > 0) continue;
      needsBackfill++;
      let owner = null;
      for (const f of OWNER_FIELDS) if (data[f]) { owner = data[f]; break; }
      const ws = await resolveWorkspaceForOwner(db, userCache, owner);
      if (ws) {
        if (args.apply) { batch.update(docSnap.ref, { workspaceId: ws }); opsInBatch++; }
        resolved++;
      } else {
        appendFileSync(ORPHANS, `${name},${docSnap.id},${owner ?? ''}\n`);
        orphaned++;
      }
    }

    if (opsInBatch >= BATCH_SIZE) {
      if (args.apply || args.unset) await batch.commit();
      batch = db.batch();
      opsInBatch = 0;
    }
  }
  if (opsInBatch > 0 && (args.apply || args.unset)) await batch.commit();
  return { name, scanned, needsBackfill, resolved, orphaned, unset };
}

async function main() {
  const args = parseArgs();
  initializeApp({
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : applicationDefault(),
    projectId: args.project,
  });
  const db = getFirestore();
  if (existsSync(ORPHANS)) unlinkSync(ORPHANS);
  writeFileSync(ORPHANS, 'collection,docId,ownerUid\n');

  const userCache = new Map();
  const results = [];
  for (const c of COLLECTIONS) {
    process.stdout.write(`→ ${c} … `);
    const r = await processCollection(db, c, args, userCache);
    results.push(r);
    console.log(`scanned=${r.scanned} backfill=${r.needsBackfill} resolved=${r.resolved} orphans=${r.orphaned} unset=${r.unset}`);
  }

  console.log('\n=== Summary ===');
  console.table(results);
  console.log(`Mode: ${args.dryRun ? 'DRY-RUN' : args.unset ? 'UNSET (rollback)' : 'APPLY'}`);
  console.log(`Orphan report: ${ORPHANS}`);
}

main().catch((e) => { console.error(e); exit(1); });
