# Report Center — Data-Source Verification Report

Date: 2026-07-25

## 1. Source map (post-change)

| Report sub-tab | Dataset | Source | Workspace scoped |
|---|---|---|---|
| `rep_sales` | sales | `useApp().sales` (AppContext `scopedQuery('sales')`) | Yes |
| `rep_purchase` | purchases + purchase returns | `useLiveLedgers()` → `scopedQuery('purchases')`, `scopedQuery('purchase_returns')` | Yes |
| `rep_inventory` | products | `useApp().products` (`scopedQuery('products')`) | Yes |
| `rep_financial` | sales + purchases + purchase returns + expenses | AppContext + `useLiveLedgers()` | Yes |
| `rep_warranty` | serial records | `localStorage roni_serial_records_v1` (offline store, unchanged) | Device-local |
| `rep_analytics` | sales aggregation | `useApp().sales` | Yes |
| `print_doc` | sales | `useApp().sales` | Yes |

## 2. Purchase report — verified figures

Computed in `purchaseTotals` / `supplierDues` from live documents only:

- **Total purchase amount** — `Σ purchase.total` over the selected range.
- **Total quantity** — `Σ purchase.quantity`, falling back to `Σ items[].quantity`
  when the document stores line items instead of a rollup.
- **Paid / Due** — `Σ purchase.paid`, `Σ purchase.due` (stored `due` respected;
  otherwise `total − paid`, floored at 0).
- **Supplier dues** — grouped by `supplierId` (fallback `supplier`), each row
  carrying `total / paid / due`, sorted by outstanding due descending.
- **Purchase returns** — rendered as signed rows (`Status = Return`, negative
  qty/amount) and summarised as `returnAmount` / `returnQty`. Returns are shown
  separately and do **not** mutate any existing accounting formula.

Table columns: `PO # · Date · Supplier · Status · Qty · Total · Paid · Due`.

## 3. Expense report — verified figures

- **Category totals** — `expenseByCategory`: `Σ amount` grouped by `category`
  (`Uncategorized` when absent), sorted descending. Surfaced in the Finance
  report as `Expense · <category>` rows and included in every export.
- **Date totals** — `expenseByDate`: `Σ amount` grouped by `YYYY-MM-DD`, sorted
  ascending, available for trend/period reconciliation.
- **Summary total** — `financeTotals.expenseTotal`, unchanged formula
  (`Σ Number(e.amount)`), now fed by live documents.

Reconciliation invariant: `Σ expenseByCategory.amount == Σ expenseByDate.amount
== financeTotals.expenseTotal` (all three reduce the same `filteredExpenses`).

## 4. Accounting parity

`financeTotals` is untouched:

```
grossProfit = revenue − cogs
netProfit   = grossProfit − expenseTotal
```

Purchase returns and supplier dues were added as **informational rows only**.
No change to revenue, COGS, gross profit or net profit derivation.

## 5. Multi-tenant isolation

- Every ledger read is built by `scopedQuery`, which is also covered by the
  dev-time `auditQueryHasWorkspaceFilter` guard (`purchases` and `expenses` are
  both in its `BUSINESS` set).
- Missing/late `workspaceId` claim → `NO_WORKSPACE_QUERY` → empty report, never
  a cross-tenant read.
- Phase 2 security rules already restrict these collections by
  `userWorkspace()`; the client filter matches the rule predicate, so no
  permission-denied churn is expected.
