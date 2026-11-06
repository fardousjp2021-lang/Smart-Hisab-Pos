# Pre-launch Deployment Checklist

Use this checklist before every public production deployment. The
**Automated** section is executed by `scripts/prelaunch-verify.mjs`
and the CI workflow `.github/workflows/prelaunch.yml`. The **Manual**
section captures checks that cannot be fully automated and must be
signed off by a human release manager.

Do not launch unless every REQUIRED row is checked and the automated
verifier exits with status `GO`.

---

## How to run

```bash
# Static (no network, no secrets — safe on any machine)
node scripts/prelaunch-verify.mjs

# Live (requires env vars — see script header)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json \
FIRESTORE_PROJECT_ID=your-project-id \
PROD_URL=https://your-domain.tld \
  node scripts/prelaunch-verify.mjs --live --json prelaunch.json

# Browser smoke (against dev preview or production URL)
PLAYWRIGHT_BASE_URL=https://your-domain.tld bunx playwright test e2e/prelaunch-smoke.spec.ts

# Multi-tenant rules unit tests (Firestore emulator)
firebase emulators:exec --only firestore "npx vitest run e2e/firestore-rules.spec.ts"
```

---

## Automated (verified by CI)

| # | Area | Check | Script |
|---|------|-------|--------|
| A1  | Firestore | Rules file present + multi-tenant helpers | `prelaunch-verify.mjs` |
| A2  | Firestore | Composite indexes declared               | `verify-firestore-indexes.mjs` |
| A3  | Firestore | Composite indexes READY in project (live) | `verify-firestore-indexes.mjs --live` |
| A4  | Firestore | Rules unit tests 85/85 PASS              | `e2e/firestore-rules.spec.ts` |
| A5  | Auth      | Every private route calls `requireAuthenticated` | `e2e/auth-route-protection.spec.ts` |
| A6  | Auth      | Firebase Auth persistence configured     | `prelaunch-verify.mjs` |
| A7  | Multi-tenant | `scopedQuery`, `workspaceClaim`, `workspaceId` helpers present | `prelaunch-verify.mjs` |
| A8  | Multi-tenant | Rules reject cross-workspace read/write | `e2e/firestore-rules.spec.ts` |
| A9  | Offline   | Queue is workspace-scoped (`v3` keys + `migrateLegacy`) | `prelaunch-verify.mjs` |
| A10 | Offline   | Offline → online flush E2E harness present | `e2e/offline-sync.spec.ts` |
| A11 | PWA       | Manifest complete + `display: standalone` | `prelaunch-verify.mjs`, `e2e/prelaunch-smoke.spec.ts` |
| A12 | PWA       | Service-worker registration is preview-guarded | `prelaunch-verify.mjs` |
| A13 | Domain    | `PROD_URL` returns 200 over HTTPS (live) | `prelaunch-verify.mjs --live` |
| A14 | Performance | Heavy libs (xlsx/recharts/jspdf) are code-split | `prelaunch-verify.mjs` |
| A15 | Smoke     | Home renders without console errors      | `e2e/prelaunch-smoke.spec.ts` |
| A16 | Smoke     | Offline fallback page reachable          | `e2e/prelaunch-smoke.spec.ts` |
| A17 | Smoke     | Reload keeps route (session persistence surface) | `e2e/prelaunch-smoke.spec.ts` |

---

## Manual (release manager sign-off)

| # | Area | Check | How to verify | Owner | ✅ |
|---|------|-------|---------------|-------|----|
| M1  | Firestore | `firebase deploy --only firestore:rules` executed and console shows current revision | Firebase console → Firestore → Rules | Release Eng | ☐ |
| M2  | Backup   | Daily scheduled backup + PITR enabled; last backup < 24h old | Firebase console → Firestore → Backups | Release Eng | ☐ |
| M3  | Domain   | DNS A/AAAA for apex + `www` point to Firebase hosting; SSL cert issued | `dig`, browser padlock | Ops | ☐ |
| M4  | PWA      | Install prompt appears on desktop Chrome + Android Chrome; iOS "Add to Home Screen" launches standalone | Real devices | QA | ☐ |
| M5  | Offline sales | DevTools → Offline: create sale + return + IMEI sale; reconnect; docs land with correct `workspaceId`, no duplicates | Manual repro | QA | ☐ |
| M6  | Scanning | Camera scans EAN-13, Code-128, QR on Android + iOS; IMEI double-sell prevented (concurrent tabs) | 2× devices | QA | ☐ |
| M7  | Reports export | Sales/Purchase/Inventory CSV + XLSX + PDF export; totals match on-screen KPIs; only current workspace rows appear | Compare in Excel | Finance | ☐ |
| M8  | Admin recovery | Password reset email arrives < 5 min; link works; sign-in restored; audit-log entry created | Real inbox | Ops | ☐ |
| M9  | Session persistence | Sign in, hard-refresh browser, close/reopen tab, restart browser → still signed in | Manual | QA | ☐ |
| M10 | Multi-tenant | Sign in as Tenant A, verify Tenant B docs invisible in every module; repeat via direct Firestore console fetch with A's token | Two accounts | Security | ☐ |
| M11 | Cross-workspace protection | Attempt to write doc with `workspaceId: B` while signed in as A → rejected by rules | DevTools console | Security | ☐ |
| M12 | Offline queues | Kill app mid-flush; reopen → pending items resume from correct workspace queue | Manual | QA | ☐ |
| M13 | Dashboard perf | Lighthouse on `/accounting`, warm cache: TTI < 2000 ms | Lighthouse | Perf | ☐ |
| M14 | POS perf | Lighthouse on `/sales`, warm cache: TTI < 1000 ms | Lighthouse | Perf | ☐ |
| M15 | Search perf | Type in POS product search: first result < 300 ms across 5 samples | Manual timing | Perf | ☐ |
| M16 | Scan perf | Barcode scan → line item added < 200 ms average over 10 scans | Manual timing | Perf | ☐ |
| M17 | Reports perf | Monthly Sales report renders in < 3000 ms | Manual timing | Perf | ☐ |
| M18 | Notifications | Trigger stock, expiry, warranty, payment events; badge and list update < 2 s | Staging | QA | ☐ |
| M19 | Route protection | Signed-out user cannot reach `/sales`, `/purchases`, `/accounting`, `/contacts`, `/reports`, `/settings`, `/admin/health` | Incognito | Security | ☐ |
| M20 | Error handling | Force a 500 from a server function; UI shows friendly error and logs to `client-error-log` | Staging | QA | ☐ |
| M21 | Memory leaks | Navigate Sales ↔ Reports ↔ Dashboard 20× with DevTools Memory tab; heap returns to baseline within 20% | Chrome DevTools | Perf | ☐ |
| M22 | Duplicate listeners | DevTools → Network → Firestore Listen: only one `Listen` channel per collection per workspace | Chrome DevTools | Perf | ☐ |

---

## Report artefacts

Every CI run uploads:

- `prelaunch-report.md`  — static run, Markdown table + verdict
- `prelaunch.json`       — machine-readable results
- `prelaunch-live.md`    — live run (scheduled / manual dispatch)
- `prelaunch-live.json`  — machine-readable live results

Release managers attach the PASS report to the deployment ticket.

---

## Verdict rules

- **GO** — all REQUIRED automated checks PASS and all MANUAL rows are ✅.
- **CONDITIONAL GO** — automated checks PASS but one or more REQUIRED checks are SKIPPED (rerun `--live` before shipping).
- **NO-GO** — any REQUIRED automated check FAILS or any MANUAL row is unchecked.
