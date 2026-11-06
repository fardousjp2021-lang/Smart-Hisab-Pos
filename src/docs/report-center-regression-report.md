# Report Center — Regression Report

Date: 2026-07-25
Change set: `src/pos-app/hooks/useLiveLedgers.ts` (new),
`src/pos-app/components/ReportCenter.tsx`, `src/pos-app/App.tsx` (2 props removed).

## 1. Static verification

| Check | Result |
|---|---|
| `bunx tsgo --noEmit` | Pass (0 errors) |
| Mock/demo identifiers in report path (`PUR-`, `EXP-0`) | 0 matches |
| Hard-coded dates (`2026-05-`) in report path | 0 matches |
| Unscoped Firestore read in new hook | 0 (`scopedQuery` only; `NO_WORKSPACE_QUERY` short-circuit) |
| Routes changed | None (`/reports` and all 7 sub-tab IDs unchanged) |
| UI layout changed | None (same header, toolbar, table shell, states) |
| Accounting formulas changed | None (`financeTotals` byte-identical) |

## 2. Functional regression matrix

| Area | Expectation | Status |
|---|---|---|
| Sales report | Unaffected (AppContext source) | Pass |
| Inventory report | Unaffected (products source) | Pass |
| Warranty report | Unaffected (localStorage serials) | Pass |
| Analytics report | Unaffected (sales aggregation) | Pass |
| Purchase report | Renders live POs + returns with Qty/Paid/Due | Pass |
| Finance report | Adds returns, supplier dues, per-category expense rows; net profit unchanged | Pass |
| Empty state | Purchase tab empty only when both POs and returns are empty in range | Pass |
| Loading state | Now gated on `loadingData || ledgersLoading` | Pass |
| Error state | Banner shows `error || ledgerError` (listener failures surface) | Pass |
| Offline | Firestore IndexedDB cache serves the listeners; offline pill still rendered | Pass (cached data) |

## 3. Export regression

Exports read the shared `active.headers` / `active.rows` contract, which is
unchanged in shape — only the Purchase headers grew from 5 to 8 columns.

| Export | Purchase tab | Finance tab | Other tabs |
|---|---|---|---|
| CSV (BOM + CRLF) | Pass | Pass | Pass |
| Excel (lazy `xlsx`) | Pass | Pass | Pass |
| PDF (lazy `jspdf` + autotable) | Pass | Pass | Pass |
| Print (new window) | Pass | Pass | Pass |

Known carry-over (pre-existing, not a regression): PDF output has no embedded
Bangla font, so Bangla glyphs in PDF remain unreliable — tracked in the backlog
as a "Recommended" item.

## 4. Transactional modules

`Purchases.tsx`, `ExpenseCenter.tsx` and `Accounting.tsx` still receive the
existing `purchases` / `expenses` state and setters from `App.tsx`. Their
behaviour, offline sync queue (`salesSyncQueue.ts` v3) and PWA behaviour are
untouched by this change.

## 5. Residual risk

- If a workspace has legacy purchase/expense documents without `workspaceId`,
  they will not appear in reports. Remediation path already exists:
  `scripts/backfill-workspace-id.mjs`.
- `purchase_returns` is read defensively; if the collection does not yet exist
  the listener resolves empty and the report degrades to purchases only.
