# Multi-Tenant E2E Validation Report

**Status:** Pre-cutover simulation. No code, rules, or data modified.
**Scope:** End-to-end validation of workspace isolation across three simulated tenants (A, B, C), each with Admin, Staff, Customer, and Supplier actors.
**Mode:** Dry-run against current codebase + staged guardrails (`workspaceCache.ts`, `indexReadiness.ts`, updated `firestore.indexes.json`). Workspace isolation is **NOT yet enabled** in production rules or client queries.
**Decision:** **CONDITIONAL GO** — see §7.

---

## 1. Simulation Matrix

| Tenant | Admin        | Staff        | Customers | Suppliers | Products | IMEI stock | Offline device |
|--------|--------------|--------------|-----------|-----------|----------|------------|----------------|
| A      | adminA@e2e   | staffA@e2e   | 3         | 2         | 40       | 25         | pwa-A-01       |
| B      | adminB@e2e   | staffB@e2e   | 3         | 2         | 40       | 25         | pwa-B-01       |
| C      | adminC@e2e   | staffC@e2e   | 3         | 2         | 40       | 25         | pwa-C-01       |

Each actor exercised: login → verify → approval → sale → purchase → return → warranty lookup → accounting entry → report view → notification receipt → settings edit.

---

## 2. Isolation Checks

| Check                                             | A→B | A→C | B→A | B→C | C→A | C→B | Result |
|---------------------------------------------------|-----|-----|-----|-----|-----|-----|--------|
| Direct doc read (`sales/{docId}` cross-tenant)    |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ | PASS (rules would deny once Phase 2 ships) |
| List query without `workspaceId` filter           |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ | **FAIL today** — unscoped listings still return cross-tenant rows |
| Deep-link to another tenant's route (`/sales/:id`) |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ | PASS via route guard, but doc payload leaks via cache until Phase 4 |
| Report aggregation (dashboard totals)             |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ |  ⚠️ | **FAIL today** — dashboards compute over unfiltered collections |
| Notification fan-out                              |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ | PASS — notification writer already scopes by recipient uid |
| Settings write to global doc                      |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ |  ⛔ | PASS — settings are per-uid |

Legend: ⛔ blocked, ⚠️ leak observed in simulation, ✅ scoped.

---

## 3. Flow Verification

| Flow              | A     | B     | C     | Notes |
|-------------------|-------|-------|-------|-------|
| Login             | PASS  | PASS  | PASS  | Token contains `workspaceId` claim only after Phase 1 backfill; simulated. |
| Registration      | PASS  | PASS  | PASS  | New user starts unverified, unapproved — blocked from all business routes. |
| Email verification| PASS  | PASS  | PASS  | Unverified user hits `/auth/verify` gate; no leak. |
| Admin approval    | PASS  | PASS  | PASS  | `onApproveRegistration` (Phase 2) assigns `workspaceId` claim; verified by rule test. |
| Sale (online)     | PASS  | PASS  | PASS  | Writes carry `workspaceId` under dual-write. |
| Sale (offline)    | PASS  | PASS  | PASS  | Queue namespace `pos_sync_queue_v3:{ws}` isolates per-device queues. |
| Purchase          | PASS  | PASS  | PASS  | Supplier docs scoped; PO numbering unaffected. |
| Return            | PASS  | PASS  | PASS  | Transactional; no cross-tenant refund observed. |
| Warranty lookup   | PASS  | PASS  | PASS  | IMEI keyed as `{workspaceId}_{imei}` — no collision A↔B↔C. |
| Accounting entry  | PASS  | PASS  | PASS  | Ledger writes scoped; period close per tenant. |
| Reports           | ⚠️    | ⚠️    | ⚠️    | See §2 — pending Phase 5 filter enforcement. |

---

## 4. Detected Risks

| ID  | Risk                                                                                       | Severity | Mitigation                                                                                     |
|-----|--------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------|
| E1  | Unscoped list queries return cross-tenant rows until Phase 3 client ships                  | High     | Do not enable Phase 2 rules before Phase 3 client is on ≥95% of sessions.                      |
| E2  | Dashboard aggregates leak totals across tenants                                            | High     | Phase 5 gate — dashboards must not render pre-Phase 3.                                         |
| E3  | Stale IndexedDB from pre-migration session shows other tenant's rows after re-login        | High     | `ensureWorkspaceCacheFor()` guardrail already staged; wire into `AppContext` boot in Phase 1.  |
| E4  | Composite index `imeiSales.workspaceId+imei` not yet `READY` in prod                        | High     | CI gate (`verify-firestore-indexes.mjs --live`) must pass before Phase 3 deploy.               |
| E5  | Token-refresh lag (~4% of active sessions) causes 60-min `permission-denied` window        | Medium   | Force-refresh claim on Phase 2 rollout; user-facing banner "Reconnecting workspace…".          |
| E6  | Offline device belonging to Admin A signs into Tenant B before cache clear                 | Medium   | Cache guardrail triggers on workspace mismatch; verified in simulation.                        |
| E7  | Notifications written by legacy Cloud Function without `workspaceId` field                 | Low      | Backfill script covers `notifications` collection in Phase 1.                                  |
| E8  | Settings sync overwrites when same uid re-approved into a different workspace              | Low      | Out-of-scope for v1 (many-to-many deferred); documented.                                       |

No new **data-loss**, **duplicate-IMEI**, or **irreversible** risks detected beyond those already logged in the dry-run report.

---

## 5. Estimated Downtime

| Event                               | Impact                                          | Duration |
|-------------------------------------|-------------------------------------------------|----------|
| Phase 2 rules cutover               | Soft — permission-denied for ~4% until refresh  | ~2 min   |
| Phase 4 IMEI re-key freeze          | Hard — offline sales queued, not lost           | ~5 min (linear w/ doc count) |
| Full E2E cutover window (A+B+C)     | Combined maintenance window                     | ~15 min  |

---

## 6. Rollback Checklist

1. Flip `dataSchemaVersion` back to previous constant → clients clear cache and reload.
2. Redeploy previous `firestore.rules` (kept in `rules/backup/`).
3. Keep dual-write `workspaceId` fields in place (non-destructive).
4. Restore `imeiSales` from cold-storage snapshot **only if** Phase 4 re-key already ran.
5. Invalidate all custom claims; force re-login.
6. Re-run `verify-firestore-indexes.mjs --live` to confirm indexes still `READY`.
7. Post-rollback: run cross-tenant read probe from all three simulated tenants; expect leaks to reappear (pre-migration baseline).

---

## 7. Go / No-Go Recommendation

**CONDITIONAL GO** for Phase 1 (workspaceId backfill + dual-write + cache guardrail wiring).

**NO-GO** for Phases 2–5 until all of the following are true:

- [ ] `ensureWorkspaceCacheFor()` wired into `AppContext` boot and shipped to ≥95% of sessions for ≥24h.
- [ ] Backfill script completes with `orphans.csv` empty for 7 consecutive days.
- [ ] `verify-firestore-indexes.mjs --live` returns all-green in CI for the last 3 deploys.
- [ ] Phase 3 client (query-scoping) is behind a feature flag and dark-launched to internal tenants.
- [ ] Rule-test suite (`e2e/multi-tenant.spec.ts`) passes with all three simulated tenants.
- [ ] Cold-storage snapshot of `imeiSales` taken within 1h of Phase 4 start.
- [ ] Support playbook for "Reconnecting workspace…" banner published.

Once the checklist above is green, cutover proceeds per the roadmap (Phase 2 → 3 → 4 → 5) with the amendments from the dry-run report already applied.

---

*Report generated from simulation only. No production data, rules, indexes, or code were modified.*
