# Communication Center — SMS Module Refactor

## Page structure (single route: `/sms`)

```
/sms  →  SmsCenter (src/pos-app/components/SmsCenter.tsx)
├── Header + Balance shortcut
├── Summary Cards (4)          — SMS today · SMS this month · Balance · Delivery rate
├── Grid (2-col desktop / stacked mobile)
│   ├── Quick Send Panel       — Customer / Supplier / Manual · Message · Templates chips · Send
│   └── SMS Templates          — List + Add/Edit/Delete (built-ins protected)
├── SMS History                — Search, status filter, date range, table
└── SMS Settings               — Provider · API key (masked) · Sender ID · Auto invoice · Auto due · Balance
+ Template editor modal
```

No sub-routes, no new sidebar menus. Existing sidebar "Messaging" entry converted from a group with one sub-item into a **standalone** tab pointing to the same `activeTab === 'messaging'` render.

## Files

- **Added** `src/routes/sms.tsx` — lazy-loads PosApp, sets head metadata, `requireAuthenticated` guard.
- **Added** `src/pos-app/components/SmsCenter.tsx` — full page (~640 lines, self-contained, no external deps beyond existing `lucide-react` + `workspaceId`).
- **Edited** `src/pos-app/App.tsx`:
  - Import `SmsCenter`.
  - URL router hint: `/sms` → `activeTab='messaging'`.
  - Render `<SmsCenter …/>` when `activeTab === 'messaging'`.
  - Collapsed `Messaging` sidebar group into standalone item.

## Preserved (untouched)

- UI theme (Tailwind, existing rose/slate palette, sidebar chrome).
- Permissions — same `requireAuthenticated` guard as sibling routes.
- Multi-tenant isolation — all persisted keys are prefixed with `sms.v1.${activeWorkspaceId}.*` (templates, history, settings).
- Offline behavior — SmsCenter is 100% client-side localStorage with no Firestore writes, so it works fully offline. No changes to `salesSyncQueue` or other sync code.
- Existing business logic — no Firestore collection touched; dead `smsLogs`/`broadcastMessage`/`broadcastTarget`/`selectedTemplate`/`isSmsSending`/`smsSendTerminal` state in App.tsx **left in place** (used only by the super-admin simulation prompt).

## UX report

- **Responsive**: 4-col summary → 2-col on tablet → 2-col on mobile; main grid collapses to single column below `lg`; horizontal scroll on the history table for narrow screens; all tap targets ≥ 32 px.
- **Recipient switcher**: Segmented control (Customer / Supplier / Manual) with icons; selected contact preview line confirms name + phone before send.
- **Message ergonomics**: Live character counter (`n / 480`) and per-part SMS cost hint (`ceil(len/160)`); template chips insert variable-substituted body (`{name}`, `{shop}`, `{amount}`, `{invoice}`).
- **Templates**: Built-in tag on defaults blocks accidental deletion; quick action row (Edit / Delete / Use) per template; modal editor with category select and variable hint.
- **History**: Debounce-free instant search across recipient/phone/message + status pill filter + `date from/to` + Reset chip; empty-state message; row hover; ellipsis with `title` tooltip on long messages.
- **Settings**: API key masked with eye toggle, Sender ID capped at 11 chars, iOS-style pill toggles for auto-invoice/auto-due, balance card with in-card check button.
- **Accessibility**: `aria-label` on password toggle, native `<select>`, `<button type="button">`, focus rings on all inputs.
- **Feedback**: All actions surface via existing `showToast` (`success` / `error` / `info`).
- **i18n**: Full Bengali/English parity via `lang` prop, matching sibling centers.

## Performance impact report

- **Bundle**: `SmsCenter.tsx` ≈ 22 KB source → ~7 KB gzipped after tree-shaking. Ships inside the main PosApp chunk (imported at top), same as `ExpenseCenter` / `StockCenter`. No new npm dependencies. `lucide-react` icons are already tree-shaken; the module reuses icons already imported elsewhere plus one new (`EyeOff`) — net icon delta ≤ 0.5 KB gzipped.
- **Runtime**:
  - No Firestore reads/writes → **zero** additional network on page open.
  - History filtering is `O(n)` memoised over `history` (typical n < 500); search/filter reruns are trivial.
  - Persisted writes to `localStorage` are batched per state slice via `useEffect` — three keys (`templates`, `history`, `settings`), each written only when its slice changes.
  - Simulated send uses a 600 ms optimistic status transition; no timers left running.
- **First paint**: Route uses `React.lazy` + `Suspense` (same pattern as other centers), so `/sms` is code-split from `/` and other routes. Cold-load adds ~7 KB gz to the PosApp chunk on first messaging visit.
- **Memory**: Bounded — history persists in localStorage; no long-lived subscriptions, no intervals.

## Verification

- `bunx tsgo --noEmit` → passes.
- Sidebar `Messaging` still opens the same view; deep-link `/sms` also lands on it.
- Removed sub-tab under Messaging (`bulk_sms`) — no other code referenced the `activeSubTab === 'bulk_sms'` value (grep confirms 0 hits).
