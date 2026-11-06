#!/usr/bin/env node
/**
 * Pre-launch verification suite — automated production readiness checks.
 *
 * Runs a battery of static + live checks against the current build,
 * emits a PASS/FAIL report, and exits non-zero if any REQUIRED check fails.
 *
 * Usage:
 *   node scripts/prelaunch-verify.mjs                # static-only (safe on any machine, no network)
 *   node scripts/prelaunch-verify.mjs --live         # also runs live checks (needs env vars below)
 *   node scripts/prelaunch-verify.mjs --json out.json
 *
 * Live-mode env vars (only required when --live is passed):
 *   FIRESTORE_PROJECT_ID           Firebase project ID
 *   GOOGLE_APPLICATION_CREDENTIALS Path to service-account JSON (indexes + backup checks)
 *   PROD_URL                       https://your-domain.example (custom domain check + PWA)
 *
 * Each check reports one of:
 *   PASS   — automated verification succeeded
 *   FAIL   — automated verification failed (blocker if `required`)
 *   SKIP   — check not run (missing env / mode); noted for the manual checklist
 *   MANUAL — cannot be automated; must be verified by a human before launch
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const LIVE = process.argv.includes('--live');
const JSON_OUT_IDX = process.argv.indexOf('--json');
const JSON_OUT = JSON_OUT_IDX !== -1 ? process.argv[JSON_OUT_IDX + 1] : null;

const results = [];
function record(id, category, name, status, required, detail = '') {
  results.push({ id, category, name, status, required, detail });
}

async function fileExists(p) {
  try { await access(resolve(p)); return true; } catch { return false; }
}

async function readText(p) {
  try { return await readFile(resolve(p), 'utf8'); } catch { return null; }
}

// ---------- Static checks ----------

async function checkFirestoreRulesDeployed() {
  const rules = await readText('firestore.rules');
  if (!rules) return record('rules.file', 'Firestore', 'firestore.rules present', 'FAIL', true, 'file missing');
  const musts = ['emailVerified()', 'isAdmin()', 'userWorkspace()', 'workspaceId'];
  const missing = musts.filter((m) => !rules.includes(m));
  if (missing.length) {
    record('rules.shape', 'Firestore', 'Rules include multi-tenant helpers', 'FAIL', true, `missing: ${missing.join(', ')}`);
  } else {
    record('rules.shape', 'Firestore', 'Rules include multi-tenant helpers', 'PASS', true);
  }
  record('rules.deploy', 'Firestore', 'Rules deployed to Firebase',
    LIVE ? 'MANUAL' : 'MANUAL', true,
    'Run `firebase deploy --only firestore:rules` and confirm dashboard shows current revision.');
}

async function checkFirestoreIndexes() {
  const ok = await fileExists('firestore.indexes.json');
  if (!ok) return record('indexes.file', 'Firestore', 'firestore.indexes.json present', 'FAIL', true);
  try {
    execSync('node scripts/verify-firestore-indexes.mjs', { stdio: 'pipe' });
    record('indexes.static', 'Firestore', 'All required composite indexes declared', 'PASS', true);
  } catch (e) {
    record('indexes.static', 'Firestore', 'All required composite indexes declared', 'FAIL', true,
      e.stdout?.toString() || e.message);
  }
  if (LIVE) {
    try {
      execSync('node scripts/verify-firestore-indexes.mjs --live', { stdio: 'pipe' });
      record('indexes.live', 'Firestore', 'All required composite indexes READY in project', 'PASS', true);
    } catch (e) {
      record('indexes.live', 'Firestore', 'All required composite indexes READY in project', 'FAIL', true,
        e.stdout?.toString() || e.message);
    }
  } else {
    record('indexes.live', 'Firestore', 'All required composite indexes READY in project', 'SKIP', true,
      'Run with --live and GOOGLE_APPLICATION_CREDENTIALS + FIRESTORE_PROJECT_ID');
  }
}

async function checkFirebaseBackup() {
  // firebase.json may declare scheduled backups (Firestore PITR / scheduled backups)
  const cfg = await readText('firebase.json');
  const hasSchedule = cfg && /backup|pitr|scheduledBackups/i.test(cfg);
  record('backup.config', 'Backup', 'Backup configuration referenced in firebase.json',
    hasSchedule ? 'PASS' : 'MANUAL', true,
    hasSchedule ? '' : 'Configure daily scheduled backups + PITR in Firebase console; verify last successful backup timestamp.');
}

async function checkCustomDomain() {
  const url = process.env.PROD_URL;
  if (!LIVE || !url) {
    return record('domain.https', 'Domain', 'Custom domain serves HTTPS 200', 'SKIP', true,
      'Pass --live and PROD_URL=https://yourdomain.tld');
  }
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (res.ok) record('domain.https', 'Domain', 'Custom domain serves HTTPS 200', 'PASS', true, `${res.status} ${url}`);
    else record('domain.https', 'Domain', 'Custom domain serves HTTPS 200', 'FAIL', true, `HTTP ${res.status}`);
  } catch (e) {
    record('domain.https', 'Domain', 'Custom domain serves HTTPS 200', 'FAIL', true, e.message);
  }
}

async function checkPwaManifest() {
  const manifest = await readText('public/manifest.webmanifest');
  if (!manifest) return record('pwa.manifest', 'PWA', 'Web app manifest present', 'FAIL', true);
  try {
    const m = JSON.parse(manifest);
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missing = required.filter((k) => !m[k]);
    if (missing.length) {
      record('pwa.manifest', 'PWA', 'Web app manifest complete', 'FAIL', true, `missing: ${missing.join(', ')}`);
    } else if (m.display !== 'standalone' && m.display !== 'fullscreen') {
      record('pwa.manifest', 'PWA', 'Web app manifest installable', 'FAIL', true, `display=${m.display}`);
    } else {
      record('pwa.manifest', 'PWA', 'Web app manifest installable', 'PASS', true);
    }
  } catch (e) {
    record('pwa.manifest', 'PWA', 'Web app manifest valid JSON', 'FAIL', true, e.message);
  }
  record('pwa.sw', 'PWA', 'Service worker registration is preview-guarded',
    (await readText('src/lib/pwa-register.ts'))?.includes('isPreviewHost') ? 'PASS' : 'FAIL', true);
  record('pwa.install', 'PWA', 'Install prompt appears on production hostname', 'MANUAL', true,
    'Open PROD_URL in Chrome desktop + Android Chrome; confirm "Install app" appears in address bar and Add to Home Screen works on iOS Safari.');
}

async function checkRouteProtection() {
  const routes = ['sales','purchases','accounting','contacts','reports','notifications','settings','sync-center'];
  const missing = [];
  for (const r of routes) {
    const src = await readText(`src/routes/${r}.tsx`);
    if (!src || !/requireAuthenticated/.test(src) || !/beforeLoad[\s\S]{0,120}requireAuthenticated/.test(src)) {
      missing.push(r);
    }
  }
  record('routes.guard', 'Auth', 'Every private route calls requireAuthenticated in beforeLoad',
    missing.length ? 'FAIL' : 'PASS', true, missing.length ? `unguarded: ${missing.join(', ')}` : '');
}

async function checkMultiTenantIsolation() {
  // Static assertions on rules + query helpers.
  const rules = await readText('firestore.rules');
  const query = await readText('src/pos-app/lib/workspaceQuery.ts');
  const claim = await readText('src/pos-app/lib/workspaceClaim.ts');
  const stamp = await readText('src/pos-app/lib/workspaceId.ts');
  const ok = rules && /workspaceId/.test(rules) && query && /scopedQuery/.test(query) && claim && stamp;
  record('mt.helpers', 'Multi-tenant', 'Workspace helpers (query/claim/stamp) present', ok ? 'PASS' : 'FAIL', true);
  record('mt.rules', 'Multi-tenant', 'Rules enforce workspaceId match on business collections',
    rules && /request\.resource\.data\.workspaceId\s*==\s*userWorkspace\(\)/.test(rules) ? 'PASS' : 'FAIL', true);
  record('mt.crossws', 'Multi-tenant', 'Cross-workspace read/write rejected (rules E2E)', 'MANUAL', true,
    'Run: firebase emulators:exec --only firestore "npx vitest run e2e/firestore-rules.spec.ts" — expect 85/85 PASS.');
}

async function checkOfflineSync() {
  const queue = await readText('src/pos-app/salesSyncQueue.ts');
  if (!queue) return record('offline.queue', 'Offline', 'Offline queue implementation present', 'FAIL', true);
  const wsScoped = /workspaceId/.test(queue) && /migrateLegacy/.test(queue);
  record('offline.queue', 'Offline', 'Offline queue is workspace-scoped', wsScoped ? 'PASS' : 'FAIL', true);
  record('offline.e2e', 'Offline', 'Offline → online flush E2E harness present',
    (await fileExists('e2e/offline-sync.spec.ts')) ? 'PASS' : 'FAIL', true);
  record('offline.manual', 'Offline', 'Offline sale created, queued, and flushed after reconnect', 'MANUAL', true,
    'DevTools → Network → Offline: create sale + return; reconnect; confirm doc lands with correct workspaceId and no duplicate.');
}

async function checkSessionPersistence() {
  const fb = await readText('src/pos-app/firebase.ts');
  const persists = fb && /(browserLocalPersistence|indexedDBLocalPersistence|setPersistence)/.test(fb);
  record('session.persist', 'Auth', 'Firebase Auth persistence configured',
    persists ? 'PASS' : 'MANUAL', true,
    persists ? '' : 'Verify user stays signed in after full browser refresh and after closing/reopening the tab.');
}

async function checkAdminRecovery() {
  record('admin.recovery', 'Auth', 'Admin password reset + recovery email path', 'MANUAL', true,
    'Trigger password reset for a test admin; confirm email arrives, link works, sign-in restored, and audit log entry created.');
}

async function checkPerformanceTargets() {
  // Static hint: heavy libs should be lazy.
  const files = ['src/pos-app/components/Reports.tsx', 'src/pos-app/components/Dashboard.tsx'];
  const heavy = ['xlsx', 'recharts', 'jspdf'];
  const warnings = [];
  for (const f of files) {
    const src = await readText(f);
    if (!src) continue;
    for (const h of heavy) {
      const staticImport = new RegExp(`^import[^\\n]+['"]${h}['"]`, 'm').test(src);
      if (staticImport) warnings.push(`${f} statically imports ${h}`);
    }
  }
  record('perf.split', 'Performance', 'Heavy libs (xlsx/recharts/jspdf) are code-split',
    warnings.length ? 'FAIL' : 'PASS', false, warnings.join('; '));
  record('perf.dashboard', 'Performance', 'Dashboard load < 2s (warm cache)', 'MANUAL', true,
    'Lighthouse: navigate to /accounting; TTI < 2000ms on Fast 3G / mid-tier laptop.');
  record('perf.pos',       'Performance', 'POS load < 1s (warm cache)', 'MANUAL', true, 'Lighthouse on /sales.');
  record('perf.search',    'Performance', 'Product search < 300ms', 'MANUAL', true, 'Type in POS search; measure first-result latency across 5 samples.');
  record('perf.scan',      'Performance', 'Barcode scan → line added < 200ms', 'MANUAL', true, 'Scan 10 items; average processing time under 200ms.');
  record('perf.reports',   'Performance', 'Reports render < 3s', 'MANUAL', true, 'Open Reports → Monthly Sales; measure to first chart paint.');
}

async function checkBarcodeAndImei() {
  const scanner = await fileExists('src/pos-app/components/BarcodeScannerModal.tsx');
  const imei = await fileExists('src/pos-app/components/WarrantySerialManager.tsx');
  record('scan.components', 'Scanning', 'Barcode + IMEI/Warranty components present',
    scanner && imei ? 'PASS' : 'FAIL', true);
  record('scan.manual', 'Scanning', 'Camera barcode scan works on Android + iOS Safari', 'MANUAL', true,
    'Test EAN-13, Code-128, and QR; verify IMEI reservation transaction prevents double-sell.');
}

async function checkReportsExport() {
  const reports = await readText('src/pos-app/components/Reports.tsx');
  const hasExport = reports && /(xlsx|csv|jspdf|Blob)/i.test(reports);
  record('reports.export', 'Reports', 'Export code paths present', hasExport ? 'PASS' : 'FAIL', true);
  record('reports.parity', 'Reports', 'Export contents match on-screen totals (workspace-scoped)', 'MANUAL', true,
    'Export Sales Ledger CSV for a date range; sum totals equal the on-screen KPI; row workspaceId matches active workspace only.');
}

async function checkNotifications() {
  const notif = await fileExists('src/routes/notifications.tsx');
  record('notif.route', 'Notifications', 'Notification & Alert Center route present',
    notif ? 'PASS' : 'FAIL', true);
  record('notif.delivery', 'Notifications', 'In-app notifications appear for stock/expiry/warranty/payment events', 'MANUAL', true,
    'Trigger one of each event type in a staging workspace; confirm badge count and list update within 2s.');
}

// ---------- Entry ----------

const checks = [
  checkFirestoreRulesDeployed,
  checkFirestoreIndexes,
  checkFirebaseBackup,
  checkCustomDomain,
  checkPwaManifest,
  checkRouteProtection,
  checkMultiTenantIsolation,
  checkOfflineSync,
  checkSessionPersistence,
  checkAdminRecovery,
  checkPerformanceTargets,
  checkBarcodeAndImei,
  checkReportsExport,
  checkNotifications,
];

for (const c of checks) {
  try { await c(); }
  catch (e) { record(c.name, 'Runner', c.name, 'FAIL', true, e.message); }
}

// ---------- Report ----------

const counts = results.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {});
const requiredFails = results.filter((r) => r.required && r.status === 'FAIL');
const requiredSkips = results.filter((r) => r.required && r.status === 'SKIP');

const lines = [];
lines.push('# Pre-launch Verification Report');
lines.push('');
lines.push(`Mode: ${LIVE ? 'LIVE' : 'STATIC-ONLY'}`);
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push(`Totals: PASS=${counts.PASS||0}  FAIL=${counts.FAIL||0}  SKIP=${counts.SKIP||0}  MANUAL=${counts.MANUAL||0}`);
lines.push('');
lines.push('## Results');
lines.push('| Category | Check | Status | Required | Detail |');
lines.push('|----------|-------|--------|----------|--------|');
for (const r of results) {
  lines.push(`| ${r.category} | ${r.name} | ${r.status} | ${r.required ? 'yes' : 'no'} | ${r.detail.replace(/\|/g,'\\|').slice(0,180)} |`);
}
lines.push('');
lines.push('## Verdict');
if (requiredFails.length === 0 && requiredSkips.length === 0) {
  lines.push('**GO** — all required automated checks passed. Complete the MANUAL checks in the deployment checklist before launch.');
} else if (requiredFails.length === 0) {
  lines.push(`**CONDITIONAL GO** — ${requiredSkips.length} required check(s) skipped. Re-run with --live and required env vars.`);
} else {
  lines.push(`**NO-GO** — ${requiredFails.length} required check(s) failed. Address the FAIL rows above.`);
}

const report = lines.join('\n');
console.log(report);
if (JSON_OUT) await writeFile(JSON_OUT, JSON.stringify(results, null, 2));

process.exit(requiredFails.length === 0 ? 0 : 1);
