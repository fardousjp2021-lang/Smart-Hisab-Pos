# Communication Center v1.1 — Enhancement Report

Route: `/sms` (unchanged) · Component: `src/pos-app/components/SmsCenter.tsx`
Scope: **client-side only**. No Firestore, no accounting, no offline-sync,
no security-rule, no theme, no route, no automation-rule changes.

---

## 1. Architecture

```
Communication Center v1.1
├─ Header  (role · online/offline · quiet-hours badge · balance)
├─ Daily-limit warning banner (near/reached)
├─ Channel selector      (SMS active · WhatsApp/Email/Push locked)
├─ Summary cards         (today · month · balance · delivery rate)
├─ Message Queue Monitor (pending · sending · failed · completed · sync state)
├─ Quick Send            (recipient + editor + Bangla/English char counter)
├─ Activity Widget       (sent today · rate · due · warranty · role gauge)
├─ Templates             (CRUD, role-gated)
├─ Message History       (filters + Retry action for failed rows)
├─ Automation Rules      (unchanged behavior)
├─ Quiet Hours & Daily Limits (per role)
├─ Provider Settings
├─ Communication Audit Log (filters + CSV export)
└─ Coming-soon channels
```

The registry `CHANNELS` still gates SMS-only sending; future channels remain
placeholder-only. All new capabilities are additive.

---

## 2. Feature detail

### 2.1 Message Queue Monitor
Real-time counts derived from local history: `pending`, `sending`, `failed`,
`completed`. Also shows online/offline sync-state pill and count of
quiet-queued rows. Values update reactively on every send/retry.

### 2.2 Retry Failed Messages
Table action shown **only** for `status === 'failed'` rows.
- Preserves recipient, phone, channel, message body, and `templateId`.
- Creates a new row with `retryOf = originalId` and `retryCount += 1`.
- Duplicate guard: while any retry exists for the same failed row with a
  non-failed status, the button is replaced by an "in progress" label.
- Retry consumes the sender's daily limit and provider balance.

### 2.3 Character Counter
Detects Bangla/UCS-2 vs GSM-7 automatically.
- GSM-7: 160 (single) / 153 (concat).
- UCS-2 (Bangla or any non-ASCII): 70 / 67.
- Displays: `len / capacity`, remaining, parts, encoding badge, capacity meter.
- Examples: `127 / 160 characters`, `Bangla SMS: 2 parts`.
- Estimated cost updates live from `channel.costPerMessage × parts`.

### 2.4 Communication Activity Widget
Today-only aggregates:
- Messages sent today (delivered rows)
- Delivery success rate (delivered ÷ attempted)
- Due reminders sent (`templateCategory === 'due'`)
- Warranty reminders sent (`templateCategory === 'warranty'`)
- Role gauge showing `myDailyCount / roleLimit`.

### 2.5 Quiet Hours
Settings: `enabled`, `start`, `end` (default 23:00 → 08:00; overnight-safe).
Automated flows that mark rows as `queued` (future automation hooks — the
audit log is wired to emit `queue` and `flush` events) get released by a
30-second scanner that detects the end of the quiet window and promotes
queued rows to `delivered`, emitting a `flush` audit entry.

### 2.6 Daily Limits by Role
Configurable numeric limits for `cashier`, `manager`, `admin`. `0 = unlimited`.
Defaults: 100 / 500 / 0.
- Counts today's non-failed rows where `sentBy === currentUser`.
- Banner warns at ≥90% and blocks at 100%.
- Both send and retry paths respect the limit; blocked attempts are logged
  as `limit_block` in the audit log.

### 2.7 Communication Audit Log
Append-only client log capped at 1000 rows per workspace. Events:
`send`, `retry`, `queue`, `flush`, `limit_block`,
`template_saved`, `template_deleted`, `settings_updated`.
Each row: timestamp, actor, actor role, action, channel, recipient,
template, cost, result/note. Filters: date range, user, channel, action.
CSV export button uses filtered rows.

---

## 3. Storage / schema changes

All state lives in `localStorage` under workspace-scoped keys
`comm.v2.<workspaceId>.<name>`. **No Firestore collections were added.**

| Key                            | Type                 | Added in v1.1 |
| ------------------------------ | -------------------- | ------------- |
| `comm.v2.<ws>.templates`       | `MessageTemplate[]`  | —             |
| `comm.v2.<ws>.history`         | `MessageHistoryRow[]`| extended      |
| `comm.v2.<ws>.provider`        | `ProviderSettings`   | —             |
| `comm.v2.<ws>.automation`      | `AutomationRules`    | —             |
| `comm.v2.<ws>.quietHours`      | `QuietHoursSettings` | **new**       |
| `comm.v2.<ws>.limits`          | `DailyLimits`        | **new**       |
| `comm.v2.<ws>.audit`           | `AuditLogRow[]`      | **new**       |

`MessageHistoryRow` new fields (all optional, backward compatible):
`sentByRole`, `templateCategory`, `parts`, `retryOf`, `retryCount`,
`automated`, plus enum status expanded with `'sending' | 'queued'`.

Legacy `sms.v1.*` migration is unchanged.

---

## 4. UX report

- **Layout**: mobile-first grid. New sections collapse to single column
  below `sm`. Queue monitor stays 2×2 on phones, 4×1 on tablets+.
- **Colour system**: retains rose primary; new tones stay within palette
  (`amber` pending, `sky` sending, `emerald` completed, `indigo` quiet).
- **Accessibility**: all toggles remain `aria-pressed`; status icons keep
  text labels; live capacity meter is decorative (data is textual).
- **Feedback**: near-limit and reached-limit states use existing toast
  system plus a persistent banner. Retry-in-progress shows a text label so
  users cannot double-click.
- **Progressive disclosure**: audit log has its own filter row and is
  capped in height so it doesn't dominate the page.

---

## 5. Performance impact (50–100 stores)

- Storage: audit log capped at 1000 rows/workspace (~≤200 KB). History
  already unbounded — behavior unchanged. Total additional storage
  overhead per store: **≈ 20–250 KB**.
- Renders: derived stats (`summary`, `queueStats`, `activityWidget`,
  `filteredAudit`) are all `useMemo` on `history` / `auditLog`; O(n) with
  n ≤ ~1–5k. Negligible cost.
- Timers: single 30 s interval for quiet-hours flush; guarded with
  `flushRef` to prevent overlap; noop when no queued rows exist.
- Bundle: pure React + `lucide-react` icons already in use. Added icons:
  `RefreshCw, Activity, Moon, Gauge, ListChecks, Download, AlertTriangle`.
  Zero new dependencies.
- Network: **zero** — no requests introduced.
- Multi-tenant safety: every key is scoped by `getActiveWorkspaceId()`;
  switching workspaces isolates queues, limits, quiet hours, and audit.

---

## 6. Non-goals (explicitly preserved)

- No changes to Firestore collections, indexes, or security rules.
- No changes to offline-sync queue or PWA behaviour.
- No changes to accounting or business logic.
- No new routes, menus, or sub-pages.
- No WhatsApp / Email / Push activation.
- Automation rule toggles behave exactly as before; the new audit/quiet
  hooks are opt-in scaffolding for when real automation is wired.
