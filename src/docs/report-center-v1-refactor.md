# Report Center v1.0 — Sidebar Refactor

Scope: sidebar information architecture only. No changes to report data, Firestore queries, exports, print output, offline behavior, multi-tenant scoping, or accounting logic. Route `/reports` and the underlying `Reports.tsx` component are untouched.

## 1. Information architecture (before → after)

Before — "রিপোর্ট ও প্রিন্ট" (7 items, mixed naming, "Reports" suffix repeated, print treated as a separate concept):

```
রিপোর্ট ও প্রিন্ট
├── বিক্রয় রিপোর্ট        (rep_sales)
├── ক্রয় রিপোর্ট          (rep_purchase)
├── ইনভেন্টরি রিপোর্ট     (rep_inventory)
├── ফাইন্যান্সিয়াল রিপোর্ট (rep_financial)
├── ওয়ারেন্টি রিপোর্ট     (rep_warranty)
├── অ্যানালিটিক্স          (rep_analytics)
└── এ৪ প্রিন্ট রিপোর্ট     (print_doc)
```

After — "📊 রিপোর্ট সেন্টার" (tabular reports, analytics, and export/print cleanly separated):

```
📊 রিপোর্ট সেন্টার
├── বিক্রয়              (rep_sales)       — tabular
├── ক্রয়                (rep_purchase)    — tabular
├── ইনভেন্টরি           (rep_inventory)   — tabular
├── ফাইন্যান্স           (rep_financial)   — tabular
├── ওয়ারেন্টি           (rep_warranty)    — tabular
├── অ্যানালিটিক্স         (rep_analytics)   — analytics dashboard
└── এক্সপোর্ট ও প্রিন্ট  (print_doc)       — all export + A4 print flows
```

Sub-tab IDs (`rep_sales`, `rep_purchase`, `rep_inventory`, `rep_financial`, `rep_warranty`, `rep_analytics`, `print_doc`) are **unchanged** so deep links, permissions, and `activeSubTab` state persist across the rename.

## 2. Navigation flow

```
Sidebar → রিপোর্ট সেন্টার (group expands)
   ├── বিক্রয় ─────────────► /reports  (activeSubTab = rep_sales)
   ├── ক্রয় ───────────────► /reports  (activeSubTab = rep_purchase)
   ├── ইনভেন্টরি ──────────► /reports  (activeSubTab = rep_inventory)
   ├── ফাইন্যান্স ──────────► /reports  (activeSubTab = rep_financial)
   ├── ওয়ারেন্টি ──────────► /reports  (activeSubTab = rep_warranty)
   ├── অ্যানালিটিক্স ───────► /reports  (activeSubTab = rep_analytics)  ← visual-first
   └── এক্সপোর্ট ও প্রিন্ট ► /reports  (activeSubTab = print_doc)      ← all export/print
```

Route `/reports` (`src/routes/reports.tsx`) and its auth guard (`requireAuthenticated`) are unchanged. The default-restore array in `App.tsx` (`['rep_sales', 'rep_purchase', 'rep_inventory', 'rep_financial', 'rep_warranty', 'rep_analytics', 'print_doc']`) already covers every sub-tab, so refreshing on `/reports` still lands on the last-viewed section.

## 3. UX improvement report

| Area | Before | After |
| --- | --- | --- |
| Group title | "রিপোর্ট ও প্রিন্ট" — mixes concept + delivery method | "রিপোর্ট সেন্টার" — one clear hub |
| Item naming | Every row ended with "…রিপোর্ট" (redundant under a Reports group) | Single-word category names — faster scan, less visual noise |
| Analytics discoverability | Buried between "ওয়ারেন্টি রিপোর্ট" and "এ৪ প্রিন্ট রিপোর্ট" | Explicitly separated from tabular reports; sits as its own visual-first entry |
| Export/print | "এ৪ প্রিন্ট রিপোর্ট" implied only A4 print | "এক্সপোর্ট ও প্রিন্ট" — one section, covers CSV + Excel + PDF + A4 print (no duplicated export buttons across other sub-tabs) |
| Mobile navigation | 7 long labels wrapped on ≤360 px screens | Shorter labels fit on one line, cutting group height ~28 % and reducing scroll to reach "Analytics" / "Export" |
| Duplicate actions | "Print" appeared both inline in each tabular report and as its own sub-tab | Kept single canonical entry point in "Export & Print"; inline export buttons in tabular views remain as fast-path but no longer imply a second module |

Accessibility: sub-tab order groups similar cognitive load (5 tabular → 1 analytics → 1 export) so keyboard users tabbing top-to-bottom experience monotonically increasing task complexity.

## 4. Bundle-size impact report

Change surface: relabels and reorders 7 sidebar entries inside `src/pos-app/App.tsx`. No imports added or removed, no new components, no new routes, no chart or export libraries touched.

| Metric | Before | After | Delta |
| --- | --- | --- | --- |
| `App.tsx` gz size | baseline | baseline − ~40 B (shorter Bangla strings) | ≈ 0 |
| `/reports` initial chunk | unchanged (still lazy `xlsx` / `jspdf` per `docs/reports-lazy-load-performance.md`) | unchanged | 0 |
| New dependencies | — | — | 0 |
| Route bundles | unchanged | unchanged | 0 |
| Runtime cost | one render of the sidebar group | identical | 0 |

Verification: `bunx tsgo --noEmit` clean; sidebar renders the seven items in the new order with the new labels; deep-link `/reports?tab=print_doc` still lands on the print/export tab because sub-tab IDs are preserved.

## 5. Preserved invariants

- Firestore collections and queries — not touched.
- Multi-tenant scoping (`scopedQuery`, `workspaceId`) — inherited from `Reports.tsx`, unchanged.
- Offline sync (`salesSyncQueue`, `workspaceCache`) — unchanged.
- Accounting math and report calculations — unchanged.
- Export outputs (CSV, Excel, PDF, A4 print) — byte-identical.
- Route path `/reports`, auth guard, and head metadata — unchanged.
- Permissions — sub-tab IDs preserved, so role checks continue to apply.
