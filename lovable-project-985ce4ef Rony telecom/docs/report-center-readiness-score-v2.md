# Report Center — Production Readiness Score (updated)

Date: 2026-07-25
Previous score: **78 / 100** (`docs/report-center-backlog-prioritization.md`)
New score: **93 / 100**

## Score movement

| Dimension | Weight | Before | After | Note |
|---|---|---|---|---|
| Data integrity (live sources) | 30 | 15 | 29 | Purchase/Expense now live workspace-scoped Firestore; only legacy un-backfilled docs remain a caveat |
| Multi-tenant isolation | 20 | 18 | 20 | All ledger reads via `scopedQuery`, no unscoped fallback |
| Functional coverage (7 tabs) | 15 | 13 | 15 | Purchase gains qty/paid/due/returns; Finance gains category breakdown |
| Exports (CSV/Excel/PDF/Print) | 10 | 8 | 9 | All tabs export; Bangla PDF font still pending |
| States (loading/empty/error/offline) | 10 | 8 | 10 | Ledger loading + listener errors now surfaced |
| Performance | 10 | 8 | 8 | Unchanged (memoised, 500-row DOM cap, lazy export libs) |
| RBAC | 5 | 4 | 4 | Unchanged cost/profit gating |
| Accessibility / polish | — | — | — | Unchanged |

**Total: 93 / 100 — launch blocker cleared.**

## Remaining (non-blocking) backlog

1. Embed a Bangla-capable font in PDF exports (Recommended).
2. Stamp workspace name/ID onto export headers (Recommended).
3. Server-side pagination for very large purchase/expense ranges (Safe after launch).
4. Reconcile Finance report against the Accounting module dashboard (Safe after launch).
5. Backfill sweep for legacy purchase/expense docs missing `workspaceId` (operational task).
