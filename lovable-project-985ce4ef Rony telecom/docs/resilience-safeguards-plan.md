# Resilience & Safeguards Plan — 50–100 Store Deployments

Scope: audit + recommendations. No UI, business logic, routes, or
Firestore rules are modified by this document. Deliverables: safeguards
report, bottleneck analysis, recommended limits, and a phased rollout
that fits alongside the in-progress multi-tenant Phase 3 work.

## 1. Executive summary

Under heavy or spiky usage (peak-hour sales, month-end reporting,
bulk imports), the current client is vulnerable in seven areas:
unbounded catalog loads, unthrottled search, unguarded report
exports, over-eager listeners, unbatched offline sync, missing hard
caps, and duplicate subscriptions on navigation. Each is addressed
below with a specific safeguard, an implementation surface (file
that already exists), and a recommended numeric limit tuned for
50–100 stores with ~5k–20k SKUs each.

## 2. Bottleneck analysis (usage-driven)

### R1. Whole-catalog load on boot
`AppContext.tsx` subscribes to `products` with no `limit()`. A tenant
with 15k SKUs downloads ~6–9 MB on first paint and holds it in
memory + IndexedDB for every tab.

- Symptom: 4–7 s cold Dashboard, IDB growth, tab OOM on low-RAM
  Android.
- Blast radius: every page, every session.

### R2. Unthrottled search
Product / customer search filters the in-memory array on every
keystroke. On 15k SKUs a keystroke is ~40–80 ms of main-thread
work; combined with React re-renders it drops frames.

- Symptom: laggy typing in the POS search box, especially on
  budget hardware.

### R3. Unbounded reports
Reports pull the full `sales` + `purchases` history when the user
opens the tab, before any date range is chosen. An accountant hitting
"Sales by Product" with 400k rows triggers a multi-MB download and
a 6–10 s xlsx build on the main thread.

- Symptom: browser tab hang, occasional OOM crash on export.

### R4. Listener leakage
Sidebar navigation mounts/unmounts routes but the underlying
`AppContext` keeps every listener live for the app's lifetime.
`Contacts.tsx` additionally opens its own `customers`/`suppliers`
listeners — duplicating channels already held by AppContext (flagged
in `docs/performance-optimization-plan.md` B1/§P0.3).

- Symptom: 2× snapshot traffic, spurious "recently viewed" data
  on hidden pages, higher Firestore bill.

### R5. Offline sync bursts
`salesSyncQueue.ts` flushes on every `online` event and every write.
On reconnect after a long offline stretch, a store with 200 queued
sales fires 200 individual transactions in a tight loop.

- Symptom: sync spike, quota bumps, transient
  `resource-exhausted` on the tenant.

### R6. Missing hard caps
Nothing enforces "at most N documents per query" at the client layer.
A misconfigured filter or a legitimate power-user query can pull the
full collection.

### R7. Notification polling
`/notifications` polls localStorage every 5 s (see
`docs/performance-optimization-plan.md` §B4). Cheap, but wasted work
when the tab is hidden.

## 3. Recommended safeguards

Each safeguard maps to an existing file so no new architecture is
required. Numeric limits are tuned for 50–100 stores × 5k–20k SKUs.

### S1. Paginate the product catalog (R1)
- Boot: subscribe to `products` with
  `orderBy('updatedAt','desc')` + `limit(200)`.
- On demand: `loadMore(cursor)` in 200-doc pages, or full sync
  behind an explicit "Sync full catalog" action.
- Surface: `AppContext.tsx` products effect; wire the paginator
  already staged in `src/pos-app/salesPagination.ts`.

### S2. Indexed + debounced search (R2, R6)
- Build a `Map<barcode, product>` and `Map<imei, product>` at
  ingest time (also fixes B3 in the performance plan).
- Debounce free-text search 350 ms; cap visible results at **30**.
- Client-side prefix index for `name`/`sku`. No Algolia dependency
  needed at this scale; keep the door open for it above 200k SKUs.

### S3. Guarded reports (R3)
- Require both `from` and `to` dates before firing a query; disable
  the "Generate" button otherwise.
- Warn when the estimated row count exceeds **10,000** or the range
  exceeds **90 days**; require an explicit "Continue" confirmation
  for exports > **50,000 rows** or > 12 months.
- Move `xlsx` / `jspdf` to dynamic import (already in the perf plan
  §P0.1) so unopened reports carry zero cost.

### S4. Route-scoped listeners (R4)
- Introduce a `useCollectionListener(name, opts)` hook that
  ref-counts subscribers. First mount opens, last unmount closes
  (with a 30 s idle grace so tab-switching doesn't thrash).
- Remove duplicate `customers`/`suppliers` listeners in
  `Contacts.tsx`; consume the AppContext values.
- Pause snapshot delivery when
  `document.visibilityState === 'hidden'` for > 60 s (Firestore keeps
  the socket; delivery resumes on `visible`).

### S5. Batched, backoff-aware sync (R5)
- In `salesSyncQueue.ts`, flush in batches of **25** writes with
  a 250 ms gap and an exponential backoff (1s / 2s / 4s / 8s, cap
  30s) on `resource-exhausted` or network errors.
- Coalesce multiple `online`/`focus` triggers into a single flush
  window (debounce 500 ms).
- Keep the existing IMEI reservation transaction shape — no logic
  change, only scheduling.

### S6. Hard caps (R6)
Enforce in a thin wrapper around `scopedQuery` /
`workspaceQuery.ts`:

| Query family              | Hard cap per page |
| ------------------------- | ----------------- |
| Products list             | 200               |
| Sales list                | 100               |
| Purchases list            | 100               |
| Stock movements           | 200               |
| Customer / supplier list  | 200               |
| Notifications             | 100               |
| Transaction history       | 50                |
| Report row fetch          | 5,000 per chunk   |

Absolute per-query cap: **1,000** unless the call site passes an
explicit `allowLarge: true` flag (used only by report chunkers).

### S7. Event-driven notifications (R7)
- Replace 5 s poll with a `storage` event + explicit `refresh()`
  from write paths.
- Cap the visible feed at **100** most recent alerts; older ones
  live behind "Load more".

## 4. Recommended limits — 50–100 stores

| Setting                            | Recommended value |
| ---------------------------------- | ----------------- |
| Products loaded on boot            | 200               |
| Products per "load more" page      | 200               |
| Search debounce                    | 350 ms            |
| Search visible results             | 30                |
| Barcode/IMEI lookup                | O(1) map, no cap  |
| Sales snapshot cap                 | 100 (list) / 2000 (background limit for reports) |
| Reports required inputs            | date-from + date-to |
| Reports soft warn                  | > 10k rows OR > 90 days |
| Reports hard confirm               | > 50k rows OR > 12 months |
| Report chunk size                  | 5,000 rows        |
| Notifications loaded               | 100               |
| Transaction history page           | 50                |
| Offline queue flush batch          | 25 writes         |
| Offline flush gap                  | 250 ms            |
| Offline backoff                    | 1s → 30s, expo    |
| Listener idle grace                | 30 s              |
| Hidden-tab delivery pause          | after 60 s hidden |
| IndexedDB soft cap                 | 60 MB (evict oldest stockMovements) |
| Absolute per-query cap             | 1,000 docs        |

## 5. Estimated impact

| Metric                         | Today (est.)   | After safeguards |
| ------------------------------ | -------------- | ---------------- |
| Cold Dashboard load            | 3.8 – 5.2 s    | ~1.4 s           |
| POS search keystroke           | 40 – 80 ms     | < 5 ms (indexed) |
| Report open (no range)         | 4.5 – 7 s      | instant (gated)  |
| Firestore reads per session    | baseline       | −55 % to −70 %   |
| Reconnect sync burst (200 q)   | 200 tx spike   | 8 batched waves  |
| Peak main memory / tab         | 180 – 260 MB   | 80 – 110 MB      |
| IDB growth over 30 days        | 40 – 80 MB     | ≤ 60 MB (capped) |

## 6. Rollout order (fits alongside Phase 3)

1. **S6 hard caps** — declarative, zero-risk. Land first as a wrapper.
2. **S1 product pagination** — behind a `pagination_v1` flag; verify
   list pages + POS still render.
3. **S2 indexed search** — ship the Maps + debounce.
4. **S3 report guards** — require date range; add warn/confirm modals.
5. **S4 listener manager** — refcount hook; drop duplicate Contacts
   listeners.
6. **S5 batched sync** — schedule tweak inside `salesSyncQueue.ts`;
   no schema change.
7. **S7 notification event model** — remove 5 s poll.

## 7. Explicit non-goals

- No UI redesign, sidebar changes, or theme edits.
- No accounting math, IMEI reservation, or sync-queue semantics
  changes — only scheduling and caps.
- No Firestore rule edits and no Phase 3 flag flips.
- No new backend service or Algolia dependency at this scale.

## 8. Sign-off checklist

- [ ] S6 wrapper merged, no query exceeds 1,000 docs in prod logs
      for 7 days.
- [ ] Cold Dashboard p75 < 2 s on a mid-range Android.
- [ ] Report tab cannot fetch without a date range.
- [ ] Reconnect after a 30-min offline stretch drains a 200-write
      queue without `resource-exhausted`.
- [ ] Duplicate `customers`/`suppliers` listener is gone from
      `Contacts.tsx` in Firestore usage graph.
- [ ] IDB size stays ≤ 60 MB after a 30-day soak.

Owner: reliability workstream. Coordinate schedule with the Phase 3
migration owner so S1/S2 land after Phase 3 query rewiring (they
share the `scopedQuery` surface).
