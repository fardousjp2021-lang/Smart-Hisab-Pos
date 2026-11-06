# Report Center — Production Audit

**Scope:** `/reports` route (`src/routes/reports.tsx` → `src/pos-app/App.tsx` shell → `src/pos-app/components/Reports.tsx`)
**Method:** Static code audit — no runtime changes.
**Verdict headline:** ⚠️ **Not ready for production** — the sidebar advertises 7 specialized report modules, but only a **single Sales report view** is actually wired up. Six of the seven sub-tabs are UI-only placeholders.

---

## 1. Sub-tab wiring (critical finding)

`src/pos-app/App.tsx` (L3672–3678) registers seven sub-tabs under the Reports group:

| Sidebar sub-tab | subId | Rendered component | Status |
|---|---|---|---|
| বিক্রয় / Sales | `rep_sales` | Shared Sales A4 view + `Reports.tsx` | ✅ Functional |
| ক্রয় / Purchase | `rep_purchase` | *(none — same Sales view shows)* | ❌ Placeholder |
| ইনভেন্টরি / Inventory | `rep_inventory` | *(none)* | ❌ Placeholder |
| ফাইন্যান্স / Finance | `rep_financial` | *(none)* | ❌ Placeholder |
| ওয়ারেন্টি / Warranty | `rep_warranty` | *(none)* | ❌ Placeholder |
| অ্যানালিটিক্স / Analytics | `rep_analytics` | `Reports.tsx` analytics view mode | ⚠️ Partial (table only, no charts) |
| এক্সপোর্ট ও প্রিন্ট / Export & Print | `print_doc` | Print preview + CSV exporter | ⚠️ Partial (Sales only) |

There is **no `switch (activeSubTab)` renderer** for `rep_purchase | rep_inventory | rep_financial | rep_warranty`. Clicking these tabs changes the URL/highlight but the same Sales-oriented content is shown. **Launch blocker.**

---

## 2. Data source

- `Reports.tsx` reads `sales`, `products`, `theme` from `useApp()` — real Firestore state, workspace-scoped through the AppContext listeners.
- `App.tsx` report block uses `sales`, `products`, `customers`, `suppliers` — all live Firestore data.
- **Mock/placeholder detected:** `getFilteredSales()` in `App.tsx` L2708–2729 hard-codes the reference date **`"2026-05-24"`** for today/week/15-day/month presets. This is not "today's date" — it will silently miss real transactions the moment the calendar advances. **Launch blocker.**
- `reportsCustomStart` / `reportsCustomEnd` default to `2026-05-01` / `2026-05-24` (App.tsx L1446–1447) — hard-coded seed values, not derived from the current month.

---

## 3. Filters

| Filter | Present | Notes |
|---|---|---|
| Date range (start/end) | ✅ | `Reports.tsx` L29–36 default = last 30 days (correct, dynamic). |
| Preset (today/week/15d/month/custom) | ⚠️ | Present in App.tsx but pinned to 2026-05-24 (see §2). |
| Search | ❌ | No product/invoice/customer search anywhere in Reports. |
| Customer filter | ❌ | Not implemented. |
| Supplier filter | ❌ | Not implemented (also no Purchase report to filter). |
| Product filter | ❌ | Not implemented. |
| Category / channel / cashier / branch | ❌ | None. |

---

## 4. Exports

| Format | Path | Status |
|---|---|---|
| PDF (Sales) | `Reports.tsx` `exportToPDF` (lazy `jspdf` + `jspdf-autotable`) | ✅ Works, English-only |
| Excel (Sales) | `Reports.tsx` `exportToExcel` (lazy `xlsx`) | ✅ Works, includes summary sheet |
| CSV (Sales) | `App.tsx` `handleExportReportsCSV` L2750 | ✅ Works, bilingual (Bn/En) |
| CSV (Customers) | `App.tsx` `handleExportCustomers` L2732 | ✅ Works |
| Print preview (A4) | `Reports.tsx` inline `@media print` + `handlePrint` | ✅ Works |
| Purchase / Inventory / Finance / Warranty exports | — | ❌ Missing |

The lazy dynamic imports for `xlsx`, `jspdf`, `jspdf-autotable` are correctly kept out of the initial bundle.

---

## 5. Analytics

- **KPI cards:** ✅ Today profit, This-month profit, All-time profit (Reports.tsx L389–431). Numbers derived from `sales[]` correctly.
- **Product-wise analytics table:** ✅ Aggregates units/revenue/cost/profit per product, sorted by revenue.
- **Charts:** ❌ No line, bar, or pie charts anywhere in Reports. The Analytics tab is a table, not a dashboard.
- **Trend calculations:** ❌ No period-over-period deltas, no moving averages, no growth %.
- **Top/bottom performers, category mix, channel mix, hour-of-day heatmap:** ❌ None.

---

## 6. Performance

- No pagination on the sales table — `sortedFilteredSales.map(...)` renders every row for the range. Will jank on ≥ 5k rows.
- No virtualization (`react-window` / `@tanstack/virtual`) even though it is already used elsewhere in the app.
- Filtering is done inline on every render (Reports.tsx L51) with no `useMemo`. Every keystroke on a date input recomputes all KPIs plus product analytics — O(N) each time.
- Firestore usage: correct — reports read from AppContext snapshot listeners (no per-report `getDocs`); good.
- Route-level code splitting: ✅ `reports.tsx` uses `lazy(() => import("@/pos-app/App"))` and lazy heavy libs.

---

## 7. Offline behavior

- Data source is the AppContext Firestore listener, which uses Firestore's IndexedDB persistence (workspace-scoped cache is enforced by `workspaceCache.ts`).
- Cached reports work offline **for whatever the listener has already streamed**; there is no explicit "last synced at" indicator or fallback banner in the Report Center.
- CSV/Excel/PDF exports run entirely client-side → work offline.
- No sync-recovery UI for stale reports (no "Data may be outdated — reconnect" state).

---

## 8. Multi-tenant isolation

- `sales`, `products`, `customers`, `suppliers` all come from `useApp()`, which loads via `scopedQuery()` with `workspaceId` (verified in Phase 3 migration).
- No report code queries Firestore directly, so no bypass risk.
- Export filenames do not include `workspaceId`, but the exported rows are already scoped by context — low risk.
- ✅ **Isolation OK.**

---

## 9. Permissions (RBAC)

- No role guard on the Reports route beyond `requireAuthenticated`.
- No conditional hiding of Finance / Analytics / Export buttons based on `Admin | Manager | Cashier`.
- Cashiers can currently view profit/cost/margin and export the entire sales history. **P1 gap** — profit visibility for cashiers is a common leakage concern.

---

## 10. Error handling

| Case | Behavior |
|---|---|
| Empty date range (no sales) | Renders empty table, KPIs show ৳0. No friendly empty state illustration. |
| Firestore listener error | No `errorComponent` around Reports; falls through to route-level boundary. |
| Permission denied on read | Same — no in-panel message. |
| Export failure | `exportToPDF` catches and `console.error`s only; user sees nothing. `exportToExcel` and CSV have no try/catch. |
| Offline with no cache | Blank tables, no banner. |

---

## Classification

### ✅ Fully functional modules
- **Sales report view** (KPIs, product analytics table, Excel/PDF/CSV/Print exports).

### ⚠️ Partially implemented modules
- **Analytics** — data present, no charts, no trends.
- **Export & Print** — works only for Sales; other modules have nothing to export.

### ❌ UI-only placeholders
- **Purchase report**
- **Inventory report**
- **Finance report**
- **Warranty report**

### 🚨 Launch blockers
1. Six sidebar entries are dead — no renderer switch on `activeSubTab` for `rep_purchase | rep_inventory | rep_financial | rep_warranty | print_doc` (only Sales is actually wired).
2. Hard-coded reference date `"2026-05-24"` in `getFilteredSales()` — the "Today / This Week / This Month" presets will drift and misreport as soon as the real clock advances.
3. Hard-coded custom-range defaults (`2026-05-01` → `2026-05-24`).
4. Cashier role can see profit/cost and export the full ledger — needs RBAC gate.

### 🛠 Recommended fixes (priority order)

**P0 — must fix before launch**
- Wire a `switch (activeSubTab)` in the Reports render block that mounts a dedicated component per sub-tab, or hide the unimplemented entries from the sidebar until built.
- Replace the `"2026-05-24"` constant and the seeded custom-range defaults with `new Date()` / `startOfMonth(new Date())`.
- Implement (or scaffold + hide) `PurchaseReport`, `InventoryReport`, `FinanceReport`, `WarrantyReport` — even a minimal table view is enough to unblock the tabs.
- Gate profit/cost columns and export buttons behind `hasRole(['admin','manager'])`.

**P1 — before scaling to multi-store**
- Add product / customer / supplier / category filter controls to the shared toolbar.
- Wrap heavy derivations (`filteredSales`, `productAnalytics`, sort) in `useMemo` keyed on `[sales, startDate, endDate]`.
- Add pagination or `react-window` virtualization for tables > 500 rows.
- Add `errorComponent` / empty-state / offline banner inside the Reports panel (do not rely on the route boundary).

**P2 — polish**
- Add real charts (line = daily revenue, bar = top products, donut = category mix) to the Analytics sub-tab.
- Period-over-period trend deltas on KPI cards.
- Include `workspaceId` / workspace name in export filenames and PDF footer.
- Localize PDF (Bangla font embedding) — currently English-only.
- Wrap all export handlers in `try/catch` with a toast on failure.

---

## Final verdict

**❌ Not production ready.**

The Report Center is currently a **Sales-only reporting page dressed up as a 7-module center**. The sidebar and the roadmap promise Purchase, Inventory, Finance, Warranty, and Analytics reports that do not exist in code, and the date-preset logic is pinned to a fixed calendar day that will silently produce wrong numbers within days of launch. Ship-blocking issues are small in count (4) but structural — treat this module as **"needs work"** and complete P0 before advertising it publicly.
