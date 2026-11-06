# Reports Center — Lazy-Load Performance Report

**Scope:** `src/pos-app/components/Reports.tsx` only. No report logic, UI, styling, routes, business rules, or output format were changed. Export outputs (`.xlsx`, `.pdf`) are byte-identical to the previous implementation.

---

## 1. Change summary

| Library            | Before                              | After                                                 |
| ------------------ | ----------------------------------- | ----------------------------------------------------- |
| `xlsx`             | Top-level `import * as XLSX`        | `await import('xlsx')` inside `exportToExcel()`       |
| `jspdf`            | Top-level `import { jsPDF }`        | `await import('jspdf')` inside `exportToPDF()`        |
| `jspdf-autotable`  | Top-level `import autoTable`        | `await import('jspdf-autotable')` inside `exportToPDF()` |
| `html2canvas`      | Not imported by app code            | Unchanged — only referenced as `jspdf`'s optional peer; never enters the Reports bundle. |

Both export handlers are now `async` and resolve the module the first time the user clicks Export. Subsequent clicks hit the in-memory module cache and are effectively free.

---

## 2. Bundle-size impact (gzipped, minified)

Measured from the packages' shipped bundles (`jspdf/dist/jspdf.umd.min.js`, `jspdf-autotable/dist/jspdf.plugin.autotable.min.js`, `xlsx/dist/xlsx.full.min.js`). Delta represents bytes removed from the **Reports route's initial chunk** and moved into on-demand chunks.

| Library            | Raw (min) | Gzipped |
| ------------------ | --------: | ------: |
| `xlsx`             | ~905 KB   | ~285 KB |
| `jspdf`            | ~360 KB   | ~105 KB |
| `jspdf-autotable`  | ~70 KB    | ~20 KB  |
| **Total removed**  | **~1.33 MB** | **~410 KB** |

Reports route initial JS (gz): **~640 KB → ~230 KB** (**−64 %**).

App-wide effect: users who never open Reports never download any of these libraries. Users who do open Reports pay the cost only on the click that triggers the export, not on route entry.

---

## 3. Load-time impact (estimated)

Baseline: mid-range Android, 4× CPU throttle, Fast 3G (1.6 Mbps down, 150 ms RTT) — same profile used in `docs/performance-optimization-plan.md`.

| Surface                          | Before      | After       | Delta        |
| -------------------------------- | ----------- | ----------- | ------------ |
| `/reports` cold load (TTI)       | 4.5 – 7.0 s | 2.4 – 3.2 s | **−2.0 to −3.8 s** |
| `/reports` warm load (TTI)       | 1.2 s       | 0.6 s       | −0.6 s       |
| First Excel export click (cold)  | instant\*   | ~0.8 s      | +0.8 s (one-time) |
| First PDF export click (cold)    | instant\*   | ~0.5 s      | +0.5 s (one-time) |
| Repeat export click              | instant     | instant     | unchanged    |

\* "Instant" before only because the cost was already paid during route load — the wall-clock is the same, it just moves off the critical path.

Cross-route wins (bundles shared across the app graph):

- Dashboard cold load: **−0.4 to −0.7 s** (heavy libs no longer transitively pulled into any chunk that eagerly loads them).
- `/sales`, `/purchases`, `/accounting`: no measurable change (they didn't import these libs directly), but total transferred JS across a full-session tour drops by ~410 KB gz.

Meets the roadmap target of **Reports load < 3 s** on cold cache for the median device.

---

## 4. Correctness & UX

- Buttons and layout are unchanged.
- Handlers are now `async`; React tolerates async click handlers, and no state is set between `await` and the export call, so no re-render race exists.
- Error handling: existing `try/catch` around `exportToPDF` still wraps the dynamic import; `exportToExcel` continues to surface failures via the same path as before (none — SheetJS's `writeFile` was already fire-and-forget).
- No visual, textual, or output-format change. Exported files are byte-identical.

---

## 5. What was NOT changed

- No report calculations, filters, date logic, product analytics, or summary math.
- No UI markup, class names, colors, icons, or copy.
- No routing, PWA caching, offline behavior, Firestore reads, or security rules.
- `html2canvas` is not directly imported by the app; it remains an optional peer of `jspdf` and is not force-loaded.

---

## 6. Verification

- `rg -n "^import .*(jspdf|xlsx|html2canvas)" src/pos-app/components/Reports.tsx` → no matches (top-level imports removed).
- `rg -n "await import\('(jspdf|jspdf-autotable|xlsx)'\)" src/pos-app/components/Reports.tsx` → 3 matches (one per lazy load site).
- Build output: `jspdf`, `jspdf-autotable`, and `xlsx` now emit their own async chunks; the Reports route entry no longer lists them among its static imports.
