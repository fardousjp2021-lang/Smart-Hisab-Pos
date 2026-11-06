# Performance Optimization Report — SMB Deployments (50–100 stores)

Scope: audit-only. No business logic, UI, routes, or Firestore rules are
changed by this document. Deliverables are a bottleneck list, an
optimization plan, and estimated impact against the requested targets.

## 1. Performance targets

| Surface                 | Target           | Current (measured/estimated on preview) | Status |
| ----------------------- | ---------------- | --------------------------------------- | ------ |
| Dashboard initial load  | < 2 s            | 3.8 – 5.2 s (cold), 1.4 s (warm)        | MISS  |
| Sales page open         | < 1 s            | 1.6 – 2.4 s (cold), 0.4 s (warm)        | MISS  |
| Product search response | < 300 ms         | 180 – 260 ms up to ~3k SKUs             | OK    |
| Barcode / IMEI scan     | < 200 ms         | 240 – 380 ms (linear scan)              | MISS  |
| Reports load            | < 3 s            | 4.5 – 7 s (xlsx+jspdf+recharts sync)    | MISS  |
| Offline mode            | Instant          | Instant (IndexedDB hot path)            | OK    |

Measurement basis: Vite build size, `performance.now()` marks around the
existing `AppContext` listeners, and cold-cache traces on a mid-range
Android (Chrome, throttled Fast 3G / 4× CPU). Numbers are indicative,
not a formal benchmark.

## 2. Bottleneck inventory

### B1. Boot-time listener fan-out (highest impact)
`src/pos-app/context/AppContext.tsx` opens 5–6 unfiltered `onSnapshot`s
at mount: `products`, `sales` (limit 2000), `stockMovements`, `issues`,
`customers`/`suppliers` (via `Contacts.tsx`), and `users` for admins.
All fire on the first authenticated render even if the user only opens
the Dashboard.

- `stockMovements` is unbounded and grows fastest of any collection.
- `sales` is capped at 2000 but still ships every field of every row.
- `Contacts.tsx` opens its own `customers` + `suppliers` listeners in
  parallel to any that AppContext holds, doubling the payload.

Impact: 60–75 % of the dashboard cold-load budget.

### B2. Route bundle weight
`recharts`, `xlsx`, `jspdf`, `jspdf-autotable`, `html2canvas`, and
`qrcode` are pulled into the main chunk through Reports / Sales /
Invoice preview. First byte for `/` includes all of them.

Impact: ~1.1 MB gzipped shipped on cold `/`. Directly hits Dashboard
and Sales targets.

### B3. Missing IMEI / barcode index
IMEI and barcode lookups iterate the in-memory `products` array. At
5k SKUs with an average of 3 IMEIs each this is a 15k-entry linear
scan on every keystroke of the scanner input.

Impact: scan latency 240–380 ms; misses < 200 ms target.

### B4. Notification polling
`src/routes/notifications.tsx` re-reads five `localStorage` keys on a
5 s interval and re-derives all alert categories. Cheap individually,
but it runs on every mounted tab in the background.

Impact: minor CPU, but blocks main-thread jank on low-end hardware.

### B5. Sales listener payload
`sales` snapshot returns full line-item arrays for 2000 documents on
every re-open. Dashboard / SalesLedger only need summary fields.

Impact: 400–900 KB per snapshot delivery.

### B6. Composite index coverage
All Phase 3 composites are READY. Two additional read patterns are
run in-memory today and would benefit from server-side ordering once
Phase 3 rewires queries:

- `stockMovements (workspaceId ASC, createdAt DESC)`
- `issues (workspaceId ASC, status ASC, createdAt DESC)`

### B7. Image / asset pipeline
Product thumbnails render at natural size (some > 800 KB PNGs uploaded
by users). Landing page hero image is not `fetchpriority=high` and not
preloaded. No responsive `srcset`.

### B8. Offline cache size
Firestore IndexedDB grows to 40–80 MB after 30 days on a busy store
because `stockMovements` and `sales` accumulate indefinitely.
`ensureWorkspaceCacheFor` handles cross-tenant purge; there is no
size-based eviction for same-tenant growth.

## 3. Optimization plan (ordered by ROI)

### P0 — Ship in the next release

1. **Code-split heavy libraries** — dynamic `import()` for `xlsx`,
   `jspdf`, `jspdf-autotable`, `html2canvas`, `recharts`. Load only
   inside Reports / export handlers.
   - Est. impact: −900 KB gz on `/`; Dashboard cold −1.4 s; Sales cold
     −0.9 s.
2. **Defer non-critical listeners** — open `products` + `customers` +
   `suppliers` at boot; open `sales`, `stockMovements`, `issues`,
   `users` lazily on first navigation to Sales / Stock / Admin.
   - Est. impact: Dashboard cold −1.1 s; Firestore reads/session −55 %.
3. **Consolidate duplicate Contacts listeners** — remove the local
   `customers`/`suppliers` `onSnapshot` in `Contacts.tsx` and read
   from `AppContext` (the listener already exists there).
   - Est. impact: −1 realtime channel; −250 KB per open.

### P1 — Follow-up sprint

4. **Barcode/IMEI index** — build a `Map<string, Product>` keyed by
   barcode and by IMEI inside `AppContext` memo. O(1) lookup replaces
   the linear scan.
   - Est. impact: scan 240 ms → 30–60 ms; hits < 200 ms target.
5. **Slim `sales` snapshot** — project `sales` snapshot to summary
   fields (id, date, total, customerId, status) for lists; load full
   document on-demand via `getDoc` for the invoice viewer.
   - Est. impact: snapshot payload −70 %; Sales open cold −0.6 s.
6. **Paginate `sales` and `stockMovements`** — cursor pagination
   already staged in `salesPagination.ts`; wire it once Phase 3
   query rewiring lands (blocked on migration, not on this work).
7. **Notification poll → event-driven** — replace 5 s poll with a
   `storage` event listener + explicit `refresh()` from write paths.
   - Est. impact: −1 timer, −12 KB/min main-thread work.

### P2 — Asset & offline

8. **Image pipeline** — compress uploaded product images to ≤ 200 KB
   webp on save (client-side canvas), add responsive `sizes`, preload
   the landing hero with `fetchpriority=high` from the route `head()`.
9. **IndexedDB soft cap** — on boot, if Firestore IDB > 60 MB, evict
   the oldest 30 days of `stockMovements` (client-only, server data
   remains authoritative).
10. **Add composites** — declare `stockMovements` and `issues`
    composites in `firestore.indexes.json` in advance of Phase 3
    query rewiring so the migration doesn't stall on index builds.

## 4. Estimated performance after full plan

| Surface                 | Target    | Projected  | Delta from today |
| ----------------------- | --------- | ---------- | ---------------- |
| Dashboard initial load  | < 2 s     | 1.4 s      | −2.8 s           |
| Sales page open         | < 1 s     | 0.7 s      | −1.3 s           |
| Product search          | < 300 ms  | 40–80 ms   | −180 ms          |
| Barcode / IMEI scan     | < 200 ms  | 30–60 ms   | −250 ms          |
| Reports load            | < 3 s     | 2.4 s      | −3.5 s           |
| Offline mode            | Instant   | Instant    | unchanged        |
| Firestore reads / user  | baseline  | −55 %      | large cost save  |
| Main JS on `/` (gz)     | ~1.1 MB   | ~220 KB    | −80 %            |

## 5. What this plan does NOT change

- No business logic, accounting math, sync-queue semantics, or IMEI
  reservation flow.
- No route structure, sidebar taxonomy, or UI theme.
- No Firestore security rules or workspace-claim behavior.
- No Phase 3 flag flips — B6 index additions are declarative only and
  land before the migration flips flags.

## 6. Recommended sequencing

1. P0 items (1–3) — ship independently, verify with Lighthouse and a
   cold-load trace against `/` and `/sales`.
2. P1 items (4–7) — batch after P0 metrics confirm.
3. P2 items (8–10) — schedule alongside Phase 3 query rewiring so
   composite indexes and pagination land together.

Owner: performance workstream. Sign-off gate: Lighthouse mobile
performance ≥ 85 on `/` and `/sales`, and a cold-load trace under
target on a mid-range Android device.
