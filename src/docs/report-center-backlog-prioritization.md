# Report Center — P1/P2 Backlog Prioritization

**Date:** 2026-07-25
**Input:** `docs/report-center-p0-completion.md` (P0 closed)
**Scope:** Analysis only — no code changed.

Categories: **(1)** Must complete before public launch · **(2)** Recommended before launch · **(3)** Safe after launch (v1.1) · **(4)** Long-term (v2.0)

---

## 1. P1 backlog

### 1.1 Wire `purchases` / `expenses` off local seed state onto Firestore
**Category: 1 — Must complete before launch**

| Dimension | Assessment |
|---|---|
| User impact | **Critical.** Purchase and Finance reports show numbers that vanish on refresh and differ per device. Users will read them as real and reconcile against them. |
| Business impact | **Critical.** Wrong COGS/net-profit output is an accounting-trust failure; also the last remaining seed-data surface in a "no mock data" product. |
| Performance | Neutral to positive — replaces in-memory arrays with existing workspace-scoped snapshot listeners already open elsewhere. No new listeners if reused from `useApp()`. |
| Effort | **M** (0.5–1.5 days): map existing Firestore purchase/expense collections into the report dataset shape; no schema change. |
| Risk if postponed | Financial misreporting, support tickets, potential data-integrity claims. Not acceptable at launch. |

### 1.2 Toolbar filters (product / customer / supplier / category / cashier)
**Category: 2 — Recommended before launch**

| Dimension | Assessment |
|---|---|
| User impact | High. Date-range-only filtering forces manual scanning; the 500-row DOM cap makes wide ranges hard to use without narrowing. |
| Business impact | Medium. Competitive table-stakes for POS reporting; affects perceived completeness in demos. |
| Performance | Positive — filters shrink the rendered set before the 500-row cap and reduce export sizes. Memoized filters keep recompute O(N) per change. |
| Effort | **M** (1–2 days): select controls + predicate composition on the existing `useMemo` filter chain. |
| Risk if postponed | Usability complaints and churn risk on larger stores; no correctness risk. Shippable as a fast-follow if launch date is fixed. |

### 1.3 Workspace ID / name in export filenames and PDF footer
**Category: 2 — Recommended before launch**

| Dimension | Assessment |
|---|---|
| User impact | Medium. Multi-store operators cannot tell two downloaded PDFs apart. |
| Business impact | Medium-high. This is a multi-tenant product; unlabelled exports mixed across stores is a real audit hazard. |
| Performance | None. |
| Effort | **S** (1–2 hours): append workspace name to the existing filename template and PDF header block. |
| Risk if postponed | Cross-store document confusion; low technical risk but cheap enough that deferring is hard to justify. |

### 1.4 Analytics charts (daily revenue line, top-products bar, category donut) + period deltas
**Category: 3 — Safe after launch (v1.1)**

| Dimension | Assessment |
|---|---|
| User impact | Medium. The Analytics tab currently delivers a sorted table — informative but not the "insights dashboard" the icon promises. |
| Business impact | Medium. Marketing/demo value more than operational value; all underlying numbers are already exportable. |
| Performance | Adds a charting dependency; must be lazy-loaded like `xlsx`/`jspdf` to protect the initial chunk. Delta calculations double the filter pass (prior period) — still O(N). |
| Effort | **M–L** (2–3 days) including lazy-load wiring and responsive behaviour. |
| Risk if postponed | None functional. Perceived-sophistication gap only. |

### 1.5 Bangla font embed in PDF export
**Category: 2 — Recommended before launch**

| Dimension | Assessment |
|---|---|
| User impact | **High for the actual user base.** Bangla product names, customer names, and category labels render as boxes/blank glyphs in PDF today. |
| Business impact | High in the target market — a PDF that cannot print a customer's name is not deliverable to that customer. |
| Performance | Font subset adds ~100–300 KB, but only inside the already-lazy PDF path. Zero initial-bundle cost if embedded on demand. |
| Effort | **M** (0.5–1 day): subset a Bangla font, register with jsPDF VFS, select per report language. |
| Risk if postponed | Bangla-language customers effectively lose the PDF channel; CSV/Excel/Print still work, which is the only reason this isn't category 1. |

### 1.6 Table virtualization for > 5k rows (replacing the 500-row DOM cap)
**Category: 3 — Safe after launch (v1.1)**

| Dimension | Assessment |
|---|---|
| User impact | Low-medium now. The cap protects responsiveness; the gap is that on-screen data is silently truncated. Needs an explicit "showing first 500 of N" notice — that notice is category 2, the virtualization itself is not. |
| Business impact | Low at current per-store volumes; rises with year-over-year data growth. |
| Performance | Strongly positive at scale; neutral today since the cap already prevents jank. |
| Effort | **M** (1–2 days) plus regression testing across all 7 sub-tabs and the print path. |
| Risk if postponed | Users mistake truncated views for complete data — mitigated cheaply by the truncation banner. |

---

## 2. P2 backlog

| Item | Category | User impact | Business impact | Performance | Effort | Risk if postponed |
|---|---|---|---|---|---|---|
| "Last synced at" in offline pill | 3 — v1.1 | Medium — tells users how stale cached figures are | Medium — trust in offline mode | None | S (2–4h) | Users act on stale data unaware; partly mitigated by the existing offline notice |
| Cash-flow chart on Finance report | 4 — v2.0 | Low-medium | Low — nice-to-have analysis | Lazy chart lib, negligible | M (1–2d) | None |
| Warranty bulk export by expiry bucket (Active / 30d / Expired) | 3 — v1.1 | Medium — service teams currently filter manually after export | Medium — drives renewal/service revenue | None (client-side grouping) | S–M (4–8h) | Manual spreadsheet work; workaround exists |
| Excel multi-sheet workbook (Summary + Rows + Meta) | 4 — v2.0 | Low — single sheet carries all rows | Low | None | S (3–5h) | None |
| Print multi-page footer with page numbers | 3 — v1.1 | Medium — unnumbered multi-page printouts are a real filing problem for accountants | Medium in paper-heavy workflows | None | S (2–4h) | Physical document handling friction |
| Retry queue for export failures behind a toast | 4 — v2.0 | Low — the error banner already surfaces failures and the user can re-click | Low | None | M (1d) | None; current error state is sufficient |

---

## 3. Final v1.0 launch checklist

**Blockers (must be green to ship)**
- [ ] Purchase report reads live Firestore purchase data — no seed state.
- [ ] Expense/Finance report reads live Firestore expense data — no seed state.
- [ ] Net profit / COGS on the Finance tab reconcile against the Accounting module for the same period.
- [ ] All 7 sub-tabs verified against a real workspace with ≥ 1 month of data.
- [ ] Cross-workspace isolation spot-check: two workspaces, no row bleed in any tab or export.
- [ ] Cashier role sees `—` for every cost/profit column and total, on every tab.
- [ ] CSV / Excel / PDF / Print all succeed on all 7 sub-tabs.
- [ ] Date presets verified against the real system clock (today / week / 15d / month) across a month boundary.

**Strongly recommended before ship**
- [ ] Workspace name in export filenames and PDF header/footer.
- [ ] Bangla font embedded in the PDF path.
- [ ] "Showing first 500 of N rows — exports include all rows" truncation banner.
- [ ] Toolbar filters (at minimum product + customer/supplier).

**Ship-readiness hygiene**
- [ ] Offline pill and cached-data notice verified with the network disabled.
- [ ] Export error banner verified by forcing a failure.
- [ ] Empty state verified with a range containing zero rows on each tab.
- [ ] Initial bundle re-measured to confirm `xlsx` / `jspdf` remain lazy.

---

## 4. Recommended completion order

1. **P1.1** Firestore-back `purchases` + `expenses` — unblocks the correctness of two tabs; everything downstream depends on real data.
2. **Reconciliation pass** — Finance totals vs Accounting module (validates step 1).
3. **P1.3** Workspace identity in exports — smallest high-value win, no dependencies.
4. **Truncation banner** (carved out of P1.6) — removes the silent-truncation hazard for hours of work.
5. **P1.5** Bangla PDF font — market-critical, isolated to the lazy PDF path.
6. **P1.2** Toolbar filters — largest of the pre-launch items; ship after the data layer is final so predicates target real fields.
7. — **v1.0 launch gate** —
8. **P2** "Last synced at", print page numbers, warranty expiry-bucket export (v1.1 cluster, all small).
9. **P1.4** Analytics charts + period deltas (v1.1).
10. **P1.6** Full virtualization (v1.1, once real data volumes are observed).
11. **P2** Cash-flow chart, multi-sheet Excel, export retry queue (v2.0).

---

## 5. Estimated production readiness score

### Report Center — **78 / 100**

| Dimension | Weight | Score | Notes |
|---|---|---|---|
| Functional completeness | 25 | 21 / 25 | All 7 tabs render and export; filters limited to date range |
| Data correctness | 25 | 15 / 25 | Dynamic dates fixed, but Purchase/Finance still on seed state — the dominant deduction |
| Security / RBAC / tenancy | 15 | 14 / 15 | Workspace-scoped throughout; cost/profit gated by role |
| Exports & print | 15 | 11 / 15 | Four formats on every tab; Bangla PDF glyphs and workspace labelling missing |
| Performance | 10 | 9 / 10 | Memoized filters, lazy heavy libs, 500-row cap; virtualization pending |
| UX states & polish | 10 | 8 / 10 | Loading/empty/error/offline present; truncation and last-synced notices missing |

**Verdict:** Not yet launch-ready — held back by a single blocker class (seed-backed Purchase/Expense data). Closing item P1.1 plus the reconciliation pass lifts the score to roughly **88/100**; adding items 3–6 in the order above reaches **93–95/100**, which is a comfortable v1.0 posture.
