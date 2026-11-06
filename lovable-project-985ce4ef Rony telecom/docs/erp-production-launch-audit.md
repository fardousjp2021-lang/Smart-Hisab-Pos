# ERP Production Launch Audit

Date: 2026-07-27
Auditor: Lovable (static code audit — no code modified)
Scope: all functional modules, 19 areas, 16 verification criteria

---

## 1. Executive summary

| | |
|---|---|
| **Overall readiness score** | **74 / 100** |
| **Launch blockers open** | 4 |
| **P1 items** | 7 |
| **P2 items** | 8 |
| **Final recommendation** | **✗ Not Ready** for unconditional public launch — **Conditionally Ready** once the 4 blockers below are cleared |

The reporting stack, multi-tenant identity layer, offline sync queue and route
guards are in strong shape after the Phase 1–5 migrations. The remaining risk is
concentrated in three places: (a) the **Purchase and Expense operational pages**
(not the reports) still render seed arrays hard-coded in `App.tsx`;
(b) **User Management and Settings persist to `localStorage`**, not Firestore,
so they are neither multi-tenant nor durable; (c) **`firestore.rules` is still
labelled as a staged, not-deployed Phase 2 file**, and several live listeners
remain unscoped.

---

## 2. Module-by-module scorecard

| # | Module | Score | Status | Principal finding |
|---|---|---|---|---|
| 1 | Authentication | 88 | Production Ready | `requireAuthenticated()` guards on all protected routes; ~1.5 s auth-hydration wait preserves session across refresh; email-verification enforced. Role model (`super_admin` / `owner` / `employee`) lives on the session user. |
| 2 | Dashboard | 72 | Needs Minor Work | KPIs derive from live context, but the chart axis in `App.tsx:2941` is a hard-coded key array (`"2026-05-18" … "2026-05-24"`). Employee KPI masking is present. |
| 3 | Products | 85 | Production Ready | Live `scopedQuery(db,'products')` listener; create/update writes stamp `workspaceId`; stock movements written transactionally. |
| 4 | Categories | 78 | Needs Minor Work | Clone-on-first-use from `cat_seed_default` works, but category lists in several editors fall back to local arrays; no dedicated category admin screen. |
| 5 | Brands | 55 | Needs Major Work | Brand list at `App.tsx:5448` is a literal in-file array (`Apple`, `Xiaomi`, …) with descriptive copy — presentation-only, no Firestore collection, no CRUD. |
| 6 | Inventory / Stock | 82 | Production Ready | `/stock` single-page center with KPIs, adjustments, alerts, history; movements are live. Some alert thresholds cached in `localStorage`. |
| 7 | Sales | 86 | Production Ready | Workspace-scoped paginated reads (`salesPagination.ts`), offline queue v3, returns/exchange and warranty wired. |
| 8 | Purchases | 48 | Needs Major Work | The **operational** Purchase page still renders the seed array `PUR-101/102/103` (`App.tsx:929`) and branches on `p.id.startsWith("PUR-")` at line 4674. Only the *Report* path was migrated to live data. |
| 9 | Customers | 84 | Production Ready | `Contacts.tsx` uses `scopedQuery(db,'customers')`, with an unscoped fallback branch when no workspace resolves (see P1-3). |
| 10 | Suppliers | 70 | Needs Minor Work | Live supplier reads, but `suppliersListPayments` (`App.tsx:1192`) is still seeded local state used for due display. |
| 11 | Accounting | 80 | Production Ready | 1 188-line module with live sales/expense inputs; not yet reconciled line-by-line against the Finance report. |
| 12 | Expenses | 52 | Needs Major Work | `ExpenseCenter` is fully prop-driven (`props.expenses`) and `App.tsx:936` supplies six literal rows `EXP-001…EXP-006`. Writes do not reach Firestore from this page. |
| 13 | Reports | 91 | Production Ready | 7 live sub-tabs, `useLiveLedgers` workspace-scoped snapshots, CSV/Excel/PDF/Print with lazy-loaded `xlsx`/`jspdf`, full loading/empty/error/offline states, cost/profit RBAC gate. |
| 14 | Communication Center | 60 | Needs Major Work | v1.1 UI is complete (queue monitor, retries, GSM-7/UCS-2 counter, quiet hours, audit log), but **no provider is wired** — zero `fetch`/`httpsCallable` calls; sending is simulated and credentials sit in plaintext `localStorage`. |
| 15 | Notifications | 68 | Needs Minor Work | Alerts derive from `localStorage` snapshots rather than a Firestore `notifications` collection; read-state and prefs are device-local, not per-user/per-workspace. |
| 16 | Settings | 58 | Needs Major Work | Store, invoice, business, backup settings all persist to `localStorage` keys. `settingsSync.ts` mirrors some values, but the Settings Center itself is the source of truth on the device — settings do not follow the user across devices. |
| 17 | User Management | 45 | Needs Major Work | `settings.tsx:316` persists the user list to `localStorage` (`USERS_KEY`). A client-editable user/role store is a privilege-escalation surface; roles must be server-authoritative (claims + Firestore). `systemEmployees` (`App.tsx:761`) is also seeded. |
| 18 | Multi-tenant | 76 | Needs Minor Work | `scopedQuery` covers products, sales, customers, suppliers, purchases, purchase_returns, expenses. **Unscoped listeners remain**: `quotations` (`App.tsx:1087`), `stockMovements` (`AppContext:638`), `issues` (`:669`), `users` (`:703`). `firestore.rules` header still says *staged, not deployed*. |
| 19 | Offline / PWA | 83 | Production Ready | Firestore IndexedDB persistence, `workspaceCache` clears on tenant mismatch, sync queue v3 with legacy migration, `manifest.webmanifest` + `offline.html` present, service worker gated for preview. |

Distribution: **7 Production Ready · 6 Needs Minor Work · 6 Needs Major Work**

---

## 3. Verification matrix

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | No placeholder pages | ⚠️ Partial | Brands section is descriptive copy only; no dead tab renders the wrong view anymore. |
| 2 | No mock / seed data | ✗ Fail | `purchases` (`App.tsx:929`), `expenses` (`:936`), `systemEmployees` (`:761`), `suppliersListPayments` (`:1192`), `salesReturns` (`:1116`), `promptLogs` (`:899`). |
| 3 | No hard-coded values | ✗ Fail | Chart key array `App.tsx:2941`; brand list `:5448`; `PUR-`/`EXP-` id prefix branching `:4674`, `:4686`. |
| 4 | Live workspace-scoped Firestore everywhere | ⚠️ Partial | 4 unscoped listeners (quotations, stockMovements, issues, users) + Contacts unscoped fallback. |
| 5 | Exports work | ✓ Pass | Reports (CSV/Excel/PDF/Print), Expenses CSV, SMS audit-log CSV, Import/Export manager. Bangla PDF glyphs still unsupported. |
| 6 | RBAC enforced | ⚠️ Partial | Sidebar/tab locks and KPI masking for `employee`; cost/profit gate in Reports. **Client-side only** — no rule-level or claim-level role enforcement, and the user list is client-editable. |
| 7 | Refresh preserves session | ✓ Pass | `authGuard.ts` waits for Firebase hydration before redirecting. |
| 8 | Offline mode | ✓ Pass | Persistence + queue + offline states in reports; validated in `e2e/offline-sync.spec.ts`. |
| 9 | Mobile responsiveness | ⚠️ Partial | Card fallbacks exist in newer centers (Expenses, Reports); the 7 156-line `App.tsx` legacy tables are desktop-first. |
| 10 | Firestore performance | ✓ Pass | 37 composite indexes declared; sales paginated; 500-row DOM cap in reports; export libs lazy-loaded. Full-collection `onSnapshot` on purchases/expenses/products is unbounded (no range limit). |
| 11 | Security | ⚠️ Partial | Rules file self-describes as staged; App Check enabled; secrets in `localStorage` in the Communication Center. |
| 12 | Navigation consistency | ✓ Pass | Path→tab mapping in `App.tsx:603+` covers all routes. |
| 13 | Sidebar consistency | ✓ Pass | Single registry, consistent icons and Bangla/English labels. |
| 14 | Dead routes | ⚠️ Minor | `/dev.sync-dot` and `/admin.health` are developer surfaces reachable in production. |
| 15 | Unused components | ⚠️ Minor | `AdminPanel`, `AiAssistant`, `LandingPage`, `Phase2MigrationBanner`, `StockArchive`, `SupportModal` have no importer. (`LandingPage` may be intentionally retired in favour of `index.tsx`.) |
| 16 | Duplicate functionality | ⚠️ Minor | `Reports.tsx` (658 lines) coexists with `ReportCenter.tsx`; `Purchases.tsx` + `PurchaseHistoryManager.tsx`; `StockCenter` + `StockArchive` + `StockHeatmap`. |

---

## 4. Launch blockers (must clear before public launch)

1. **B1 — Purchase & Expense operational pages still run on seed arrays.**
   Users can "create" a purchase or expense that never reaches Firestore, and
   the Reports tab (correctly reading live data) will disagree with the page
   they just used. Highest-visibility data-integrity defect in the system.
2. **B2 — User Management persists to `localStorage`.**
   Roles are client-editable; any user can grant themselves owner in DevTools.
   Roles must be server-authoritative (custom claims + a `user_roles`
   collection) before public exposure.
3. **B3 — `firestore.rules` is still marked staged / not deployed.**
   The header explicitly forbids treating it as live. Confirm the deployed
   ruleset matches the Phase 2 workspace-scoped file and remove the banner.
4. **B4 — Unscoped tenant listeners.** `quotations`, `stockMovements`,
   `issues`, and `users` are read without a `workspaceId` filter; the Contacts
   fallback also drops scope. Under a permissive ruleset this is cross-tenant
   leakage.

---

## 5. P1 items (fix in the first post-blocker sprint)

- **P1-1** Communication Center: wire the Phase 1 gateway (Cloud Functions +
  KMS vault) and remove plaintext credentials from `localStorage`; until then
  label the module clearly as simulated.
- **P1-2** Settings Center: migrate store/invoice/business settings to
  workspace-scoped Firestore with `settingsSync.ts` as the single writer.
- **P1-3** Remove the unscoped fallback branches in `Contacts.tsx` and
  `salesPagination.ts` — no read should ever degrade to global.
- **P1-4** Notifications: back alerts, read-state and preferences with a
  Firestore collection so they are per-user and cross-device.
- **P1-5** Brands: promote to a real workspace-scoped collection with CRUD, or
  remove the section.
- **P1-6** Server-side RBAC: enforce role in security rules for cost, profit,
  purchase and accounting reads (client gating is defence-in-depth only).
- **P1-7** Bound the unbounded `onSnapshot` reads (purchases/expenses/products)
  with a date range or `limit` before a tenant crosses ~10 k documents.

---

## 6. P2 items (safe after launch)

- **P2-1** Embed a Bangla-capable font in PDF exports.
- **P2-2** Stamp workspace name/ID onto every export header.
- **P2-3** Remove hard-coded chart key array (`App.tsx:2941`).
- **P2-4** Delete or gate the dev routes `/dev.sync-dot` and `/admin.health`.
- **P2-5** Remove the six unused components (or document why they are kept).
- **P2-6** Retire the legacy `Reports.tsx` now that `ReportCenter.tsx` is live.
- **P2-7** Mobile pass over the legacy `App.tsx` tables (card fallbacks).
- **P2-8** Reconcile the Finance report against the Accounting dashboard.

---

## 7. Score derivation

| Dimension | Weight | Score |
|---|---|---|
| Data integrity / live sources | 25 | 15 |
| Multi-tenant isolation | 15 | 11 |
| Security & RBAC | 15 | 9 |
| Functional completeness | 15 | 11 |
| Offline / PWA | 10 | 9 |
| Performance | 10 | 8 |
| Exports & reporting | 5 | 5 |
| Navigation / UX consistency | 5 | 4 |
| Code hygiene (dead code, duplication) | 5 | 2 |
| **Total** | **100** | **74** |

Clearing B1–B4 alone moves the score to an estimated **88 / 100** and flips the
recommendation to **✓ Conditionally Ready**; also completing P1-1 through P1-4
reaches an estimated **94 / 100** — **✓ Ready for Public Launch**.

---

## 8. Final recommendation

**✗ Not Ready** today. The system is architecturally sound and the reporting,
sales and offline stacks are launch-grade, but two user-facing modules
(Purchases, Expenses) still write to memory instead of the database, and the
role store is client-editable. These are correctness and security defects, not
polish. Clear blockers B1–B4 and the platform is **Conditionally Ready** for a
controlled public launch.
