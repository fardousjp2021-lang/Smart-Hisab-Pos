# Report Center — P0 Completion Report

**Date:** 2026-07-23
**Scope:** P0 launch blockers from `docs/report-center-production-audit.md`
**Non-goals:** Routes, theme, business logic, accounting math, multi-tenant architecture — untouched.

---

## 1. Hard-coded dates removed

| File | Line (pre-fix) | Symbol | Before | After |
|---|---|---|---|---|
| `src/pos-app/App.tsx` | 1446–1447 | `reportsCustomStart` / `reportsCustomEnd` defaults | `'2026-05-01'` / `'2026-05-24'` | `firstOfMonth()` / `today()` (dynamic on mount) |
| `src/pos-app/App.tsx` | 1905–1918 | `getReportDateRangeString()` presets | Fixed May-2026 strings | Derived from `new Date()` for today / week / 15-days / month |
| `src/pos-app/App.tsx` | 2717–2739 | `getFilteredSales()` preset filter | Anchored to `2026-05-24` + hard `"2026-05"` month | Anchored to `today`, month prefix derived from `today.slice(0,7)` |
| `src/pos-app/App.tsx` | 2128 | `newSale.date` in Direct Sell path | `"2026-05-24"` | `new Date().toISOString().slice(0,10)` |

**Result:** all "Today / This Week / 15 Days / This Month" presets now advance with the real clock. Custom range defaults to the current calendar month on first render.

---

## 2. Missing report renderers — implemented

Added `src/pos-app/components/ReportCenter.tsx` and wired it in `App.tsx` (`activeTab === 'reports'`). One dispatcher renders all 7 sub-tabs:

| Sub-tab | Data source (workspace-scoped) | Status |
|---|---|---|
| `rep_sales` | `useApp().sales` filtered by date | ✅ |
| `rep_purchase` | `App.tsx purchases` state | ✅ |
| `rep_inventory` | `useApp().products` (live stock / min / value / status) | ✅ |
| `rep_financial` | Revenue = Sales; COGS = `purchasePriceAtTime × qty`; Expenses; Purchases; Net = Gross − Expenses | ✅ |
| `rep_warranty` | `roni_serial_records_v1` (workspace-scoped localStorage), status derived from `warrantyExpiryDate` vs today | ✅ |
| `rep_analytics` | Product-wise aggregation over filtered sales (units / revenue / cost / profit, sorted) | ✅ |
| `print_doc` | Reuses Sales dataset in a print-ready shell | ✅ |

No mock data is introduced by the new component — every dataset is either live Firestore state (via `useApp()`) or existing local storage keys used by the rest of the app.

**Cost / profit RBAC:** columns and totals collapse to `—` unless
`userRole ∈ {admin, super_admin, manager, Store Admin}` — closes the P0 cashier-leak concern flagged in the audit.

---

## 3. Extended exports

All four export paths available on every sub-tab, driven by the currently rendered dataset:

| Format | Implementation | Notes |
|---|---|---|
| CSV | Pure JS, UTF-8 BOM, CRLF | Fully offline |
| Excel (`.xlsx`) | Lazy `import('xlsx')` | Sheet name = report title |
| PDF | Lazy `import('jspdf')` + `jspdf-autotable`, A4 landscape | Header shows title / period / generated-at |
| Print | New window with A4-style stylesheet, calls `window.print()` | Print-only view driven by the same rendered table |

Filenames pattern: `{subId}_{startDate}_{endDate}.{ext}` so exports are unambiguous even without a report title.

Heavy libraries (`xlsx`, `jspdf`, `jspdf-autotable`) remain out of the initial bundle — imports execute only when the button is pressed.

---

## 4. Report states

Every sub-tab now surfaces:

| State | Trigger | UI |
|---|---|---|
| Loading | `useApp().loadingData === true` | Full-panel spinner + text |
| Empty | Filtered dataset is `[]` | Dashed card + guidance ("select another range") |
| Error | Any export path throws | Dismissible rose banner with reason |
| Offline | `navigator.onLine === false` | Header pill + in-report amber notice ("Showing cached data") |

Online/offline state is subscribed via `window` events so the badge flips live without a reload.

---

## 5. Constraints honored

- ✅ No new routes.
- ✅ No route/theme/business-logic/accounting-formula changes (COGS formula preserved verbatim from the existing sales analytics).
- ✅ Multi-tenant architecture untouched — `ReportCenter` reads only from `useApp()` (workspace-scoped context) and props already scoped upstream.
- ✅ No mock data introduced (existing seed rows in `purchases` / `expenses` state are pre-existing and out of scope for this P0 pass — see P1 backlog).
- ✅ Sidebar IDs (`rep_sales | rep_purchase | rep_inventory | rep_financial | rep_warranty | rep_analytics | print_doc`) preserved — deep links still resolve.

---

## 6. Performance impact

| Metric | Before | After | Delta |
|---|---|---|---|
| Initial `/reports` render dispatch | none (blank) | 1 memoized filter pass over `sales` + specialized dataset | +O(N sales) once |
| Filter recomputation | none | Only on `[data, startDate, endDate]` change (all `useMemo`) | Prevents per-keystroke O(N) recompute the audit flagged |
| Row rendering ceiling | Unbounded | Hard-capped at **500 rows** in DOM, exports still ship full data | Prevents jank on ≥ 5k datasets |
| `xlsx` / `jspdf` / `jspdf-autotable` in initial chunk | Lazy already (Reports.tsx) | Lazy inside `ReportCenter` | Unchanged — still zero cost until user clicks Export |
| New chunk size (`ReportCenter.tsx`) | — | ~11 KB source, ~4 KB gzipped estimated | Negligible |

No new dependencies added. No Firestore reads introduced (all data flows through the existing AppContext snapshot listeners).

---

## 7. Remaining backlog

### P1 — before scaling
- Toolbar filters: product / customer / supplier / category / cashier selects.
- Analytics: real charts (daily-revenue line, top-products bar, category-mix donut) + period-over-period deltas on KPI cards.
- Wire `purchases` and `expenses` off local seed state and onto Firestore-backed collections (they already exist for other modules) so the Purchase / Finance reports reflect real activity across sessions.
- Include `workspaceId` / workspace name in export filenames + PDF footer.
- Localize PDF (Bangla font embed) — currently English glyphs only.
- Table virtualization (`react-window` / `@tanstack/virtual`) for datasets > 5k rows instead of the 500-row DOM cap.

### P2 — polish
- "Last synced at" indicator in the offline pill.
- Cash-flow chart on Finance report.
- Warranty: bulk export by expiry bucket (Active / Expiring 30d / Expired).
- Excel: multi-sheet workbook (Summary + Rows + Meta) instead of single sheet.
- Print: multi-page footer with page numbers.
- Retry queue for export failures behind a toast.

---

## 8. Verification checklist

- [x] Presets reflect the actual system clock (`Today`, `This Week`, `This Month`).
- [x] Custom date range defaults to current month on mount.
- [x] Each of the 7 sub-tabs renders its own dataset (no more "Sales-under-every-tab").
- [x] Export buttons (CSV / Excel / PDF / Print) all fire against the currently rendered dataset.
- [x] Loading / Empty / Error / Offline states verified per sub-tab.
- [x] Cashier role sees `—` in cost/profit columns.
- [x] No modifications to routes, theme, accounting formulas, or multi-tenant boundaries.
