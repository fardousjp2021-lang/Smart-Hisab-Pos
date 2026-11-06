# Report Center — Seed Removal Report

Date: 2026-07-25
Scope: Purchase & Expense reporting inside the Report Center (`/reports`).

## 1. What was removed

| Item | Before | After |
|---|---|---|
| `purchases` prop into `ReportCenter` | `useState([...3 demo POs...])` in `App.tsx:929` (PUR-101/102/103, hard-coded dates `2026-05-28/25/22`) | Prop removed from `<ReportCenter>`; reports no longer read it |
| `expenses` prop into `ReportCenter` | `useState([...6 demo rows...])` in `App.tsx:936` (EXP-001…006, hard-coded May-2026 dates) | Prop removed from `<ReportCenter>`; reports no longer read it |
| `Props.purchases` / `Props.expenses` | Declared in `ReportCenter` interface | Deleted from the interface and destructuring |
| Purchase returns | Not represented at all | Live `purchase_returns` collection |

The seed `purchases` / `expenses` React state remains in `App.tsx` **only** for the
transactional Purchase and Expense modules, which were explicitly out of scope
("do not change business logic / routes / UI layout"). No reporting path reads it.

## 2. What replaced it

New file: `src/pos-app/hooks/useLiveLedgers.ts`

- Subscribes with `onSnapshot` to three collections through `scopedQuery(db, …)`:
  `purchases`, `purchase_returns`, `expenses`.
- `scopedQuery` injects `where('workspaceId','==',<activeWorkspaceId>)` as the
  first constraint (matches the leading `workspaceId ASC` composite indexes in
  `firestore.indexes.json`).
- When no workspace is resolvable it returns `NO_WORKSPACE_QUERY`; the hook then
  yields empty arrays. **There is no unscoped fallback read.**
- Normalisation layer only (no accounting math): coerces Firestore `Timestamp`
  → ISO string, `total/totalAmount/grandTotal` → `total`, `paid/paidAmount` →
  `paid`, derives `due = max(total - paid, 0)` **only when the document has no
  stored `due`**, and derives `quantity` from `items[]` **only when the document
  has no stored `quantity`**.

## 3. Grep verification

```
rg -n "PUR-10|EXP-00|2026-05-" src/pos-app/components/ReportCenter.tsx src/pos-app/hooks/useLiveLedgers.ts
→ no matches
```

No mock arrays, no seed constants, and no hard-coded dates or amounts exist in
either the Report Center or the new ledger hook. All date boundaries continue to
derive from `new Date()` presets (today / week / 15 days / month / custom).
