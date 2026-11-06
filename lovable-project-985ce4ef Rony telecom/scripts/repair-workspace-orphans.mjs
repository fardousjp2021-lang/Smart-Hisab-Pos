#!/usr/bin/env node
/**
 * Phase 1 orphan repair — DRY-RUN ONLY.
 *
 * Repairs the 3 orphan documents identified in
 * docs/multi-tenant-phase1-validation.md.
 *
 * Usage:
 *   node scripts/repair-workspace-orphans.mjs --project <projectId> --dry-run
 *
 * No --apply flag is implemented. To execute the plan, review the printed
 * actions and run them via the standard backfill/admin tooling with human
 * sign-off. This script intentionally cannot mutate data.
 *
 * Plan (see analysis report for rationale):
 *   1. categories/cat_legacy_import_2024_08_01  → assign workspaceId = ws_root
 *   2. categories/cat_seed_default              → assign workspaceId = ws_root
 *   3. notifications/notif_broadcast_2025_11_12 → archive (soft-delete)
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { argv, exit } from 'node:process';

const PLAN = [
  { op: 'assign',  collection: 'categories',    docId: 'cat_legacy_import_2024_08_01', workspaceId: 'ws_root' },
  { op: 'assign',  collection: 'categories',    docId: 'cat_seed_default',             workspaceId: 'ws_root' },
  { op: 'archive', collection: 'notifications', docId: 'notif_broadcast_2025_11_12' },
];

function parseArgs() {
  const args = { project: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--project') args.project = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
  }
  if (!args.project || !args.dryRun) {
    console.error('Usage: --project <id> --dry-run   (dry-run is the only supported mode)');
    exit(1);
  }
  return args;
}

async function main() {
  const args = parseArgs();
  initializeApp({ credential: applicationDefault(), projectId: args.project });
  const db = getFirestore();

  console.log(`\nDRY-RUN against project=${args.project}\n`);
  for (const step of PLAN) {
    const ref = db.collection(step.collection).doc(step.docId);
    const snap = await ref.get();
    const exists = snap.exists;
    const data = exists ? snap.data() : null;
    const currentWs = data?.workspaceId ?? null;

    if (step.op === 'assign') {
      console.log(`[assign]  ${step.collection}/${step.docId}`);
      console.log(`          exists=${exists} currentWorkspaceId=${currentWs ?? '(none)'}`);
      console.log(`          would set workspaceId="${step.workspaceId}"`);
      if (currentWs && currentWs !== step.workspaceId) {
        console.log(`          ⚠️  SKIP — already assigned to different workspace`);
      } else if (!exists) {
        console.log(`          ⚠️  SKIP — document not found`);
      } else {
        console.log(`          ✅ would apply`);
      }
    } else if (step.op === 'archive') {
      console.log(`[archive] ${step.collection}/${step.docId}`);
      console.log(`          exists=${exists}`);
      console.log(`          would set { archived: true, archivedAt: <server ts>, archivedReason: "phase1-orphan" }`);
      if (!exists) console.log(`          ⚠️  SKIP — document not found`);
      else console.log(`          ✅ would apply (soft-delete; original doc preserved)`);
    }
    console.log('');
  }
  console.log('End of dry-run. No writes performed.\n');
}

main().catch((e) => { console.error(e); exit(1); });
