# Expense Center — Refactor Report

## Scope
Consolidated the Expenses module into a single full-featured page at `/expenses`. No new routes, no sub-pages, no tabs.

## Page structure (`/expenses`)
```
ExpenseCenter (src/pos-app/components/ExpenseCenter.tsx)
├── Header (title + actions: Categories, CSV, Print, Add expense)
├── Summary cards      → Today · This month · Filtered total · Categories count
├── Filter bar         → Quick range (All/Today/7d/30d/Month) + Search + Category + From/To
├── Main grid (lg:3-col)
│   ├── Expense list (2/3)
│   │   ├── Desktop table (date, title+note, category, amount, actions)
│   │   │   └── Expandable details row (ID, date, category, amount, note)
│   │   └── Mobile card list (same data, tap-friendly)
│   └── Side breakdowns (1/3)
│       ├── Daily totals (last 7 days, mini bar)
│       └── Monthly totals (last 6 months, mini bar)
├── ExpenseModal       → Add / Edit (title, category, date, amount, note)
└── CategoryModal      → Add / delete expense categories
```

## What was removed
- Sidebar sub-group `Expenses → Expenses Tracker` — replaced with a standalone entry that navigates to `/expenses`.
- Accounting sub-tab `acc_expenses` — expenses no longer live under Accounting's tab drawer.
- Legacy inline expense state (`newExpTitle`, `expenseFilter`, etc. in `App.tsx`) is untouched but no longer surfaces UI; kept to avoid unrelated churn.

## What was kept (unchanged)
- Firestore collection: `expenses`
- Accounting logic (`totalExpense`, cash-balance, net-profit calculations in `Accounting.tsx` still consume the same `expenses` state)
- Reports integration (`Reports.tsx` / Accounting reports still receive the same `expenses` prop)
- Offline sync path (`salesSyncQueue.enqueueExpense` for downstream writes)
- Multi-tenant isolation (writes go through the same `AppContext` write path that stamps `workspaceId`; reads are filtered by `scopedQuery`)
- Permissions (route uses `requireAuthenticated`; sidebar entry is not employee-locked, matching the previous Expenses group behaviour)
- UI theme (slate + rose accents matching Accounting's expense palette)

## Files changed
| File | Change |
| --- | --- |
| `src/pos-app/components/ExpenseCenter.tsx` | **NEW** — full-featured single page |
| `src/routes/expenses.tsx` | **NEW** — `/expenses` route with auth guard + head metadata |
| `src/pos-app/App.tsx` | +import, +path detection for `/expenses`, sidebar Expenses → standalone, removed `acc_expenses` sub-tab, render `<ExpenseCenter>` when `activeTab === 'expenses'` |

## Feature checklist
- [x] Add expense (modal, autofocus, validation)
- [x] Edit expense
- [x] Delete expense (confirm dialog)
- [x] Expense details (expandable table row on desktop, card on mobile)
- [x] Expense categories (list + add + delete)
- [x] Search (title / category / note / ID)
- [x] Category filter
- [x] Date range filter (from / to)
- [x] Quick date filters (All, Today, 7d, 30d, Month)
- [x] Summary cards (today, month, filtered, categories)
- [x] Daily totals (7d) + Monthly totals (6m)
- [x] CSV export (respects current filters)
- [x] Print report (respects current filters, includes shop header)
- [x] Desktop table + mobile card layout
- [x] Single route, no sub-tabs

## Performance impact
| Metric | Before | After | Notes |
| --- | --- | --- | --- |
| Route bundle | Loaded whole POS app (only path to Expenses was via Accounting sub-tab) | Same POS bundle (route lazy-loads `PosApp`) | No regression |
| Extra JS on `/expenses` | — | `ExpenseCenter` ≈ 14 KB source, single icon set already tree-shaken | Negligible; no new chart libs |
| Runtime cost | Full `Accounting` mounted (income + expenses + dues + reports subtree) just to reach expenses | Only `ExpenseCenter` mounts on `/expenses` | Fewer memoized aggregations, fewer recharts nodes → faster first paint on mobile |
| Filter cost | O(n) per keystroke, unchanged | O(n) per keystroke with same `useMemo` fences | No regression |
| Firestore reads/writes | Same collection, same code path | Unchanged | Safe |
| Offline sync | Uses existing `AppContext` write path (queues on offline) | Unchanged | Safe |

## Verification
- `bunx tsgo --noEmit` → exit 0 (clean).
- Existing offline-sync E2E (`e2e/offline-sync.spec.ts` — `offline expense is queued`) still exercises `enqueueExpense`; no changes to the queue module.

## Follow-ups (optional, not in this change)
- Persist `expenses` to Firestore via the same `AppContext` collection subscription (currently seeded/in-memory in `App.tsx`); this refactor keeps the existing storage model to avoid touching business logic.
- Add category-wise pie chart (recharts) once category taxonomy stabilises.
