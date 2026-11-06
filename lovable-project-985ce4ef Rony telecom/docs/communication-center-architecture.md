# Communication Center — v1.0 Architecture Report

## Route & scope

- **Route** — `/sms` (unchanged). No new routes, sub-pages, or sidebar entries.
- **Module identity** — renamed internally to **Communication Center**; the sidebar label ("Messaging / বার্তা সমূহ") is unchanged so muscle-memory holds.
- **Active channel** — SMS only. WhatsApp, Email, and Push are declared in the channel registry but flagged `active: false`.
- **Untouched** — Firestore collections, offline sync queues, multi-tenant isolation, accounting logic, and the existing UI theme (rose/slate palette).

## Page structure

```
/sms  →  SmsCenter (src/pos-app/components/SmsCenter.tsx)
├── Header                    · title · version chip · role badge · balance shortcut
├── Channel selector          · SMS (active) · WhatsApp · Email · Push (all disabled)
├── Overview Dashboard        · today · this month · SMS balance · delivery rate
├── Quick Send (7/12)
│   ├── Recipient switch      · Customer · Supplier · Manual
│   ├── Recipient preview
│   ├── Message editor        · char/part counter
│   ├── Template chips        · cashier sees invoice chips only
│   ├── Variable hint         · lists all 8 supported variables
│   └── Send button           · disabled without send permission
├── Templates (5/12)          · list + editor modal
├── Message History (12/12)   · 7 columns · channel/status/date filters + search
├── Automation Rules (6/12)   · 4 toggles (admin-only)
├── Provider Settings (6/12)  · provider · sender ID · API key · test · balance
└── Coming Soon (12/12)       · WhatsApp / Email / Push disabled cards
```

## Channel registry (source of truth)

Every capability keys off a single `CHANNELS` array; adding a channel later
is a one-record change:

```ts
type ChannelMeta = {
  id: 'sms' | 'whatsapp' | 'email' | 'push';
  labelBn: string; labelEn: string;
  icon: LucideIcon;
  active: boolean;              // v1.0: only 'sms' = true
  costPerMessage: number;
  tone: 'rose' | 'emerald' | 'indigo' | 'amber';
};
```

Downstream consumers (channel selector cards, history badges, template editor
dropdown, filters, coming-soon strip, cost calculation) all read from the same
array — no per-channel branching in JSX.

## Permissions matrix

| Role                        | view | send            | templates:manage | automation:manage | settings:manage |
|-----------------------------|:----:|:---------------:|:----------------:|:-----------------:|:---------------:|
| super_admin / owner / admin | ✅   | ✅              | ✅               | ✅                | ✅              |
| manager                     | ✅   | ✅              | ✅               | ❌                | ❌              |
| cashier / employee          | ✅   | ✅ (invoice)    | ❌               | ❌                | ❌              |
| other                       | ✅   | ❌              | ❌               | ❌                | ❌              |

Enforced in `permissionsFor(role)` and honoured by:
- `Send` button (`disabled` unless `send`).
- Template quick-chips & `applyTemplate()` (cashiers restricted to `category === 'invoice'`).
- Template editor open / save / delete (`templates:manage`).
- Automation toggles (`automation:manage`, greyed with amber notice).
- Provider settings inputs + `Test message` (`settings:manage`, native `disabled`).

## Storage (workspace-scoped, offline-safe)

All state is client-side `localStorage`, prefixed with the active workspace id — same isolation rule as `ExpenseCenter` and `StockCenter`. Nothing here touches Firestore.

| Key                                | Shape                     |
|------------------------------------|---------------------------|
| `comm.v2.<ws>.templates`           | `MessageTemplate[]`       |
| `comm.v2.<ws>.history`             | `MessageHistoryRow[]`     |
| `comm.v2.<ws>.provider`            | `ProviderSettings`        |
| `comm.v2.<ws>.automation`          | `AutomationRules`         |

**Migration** — on first load, v1 keys (`sms.v1.<ws>.templates|history|settings`) are
read and mapped into the v2 shape (channel = `sms`, sentBy = `System`, cost = default). Legacy
values are left in place; no destructive rewrites.

## Schema

```ts
type ChannelId = 'sms' | 'whatsapp' | 'email' | 'push';

type TemplateCategory =
  | 'invoice' | 'due' | 'payment' | 'warranty' | 'promo' | 'custom';

interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  channel: ChannelId;          // future-ready
  body: string;                // supports {variables}
  builtin?: boolean;
}

interface MessageHistoryRow {
  id: string;
  ts: string;                  // ISO
  recipient: string;
  phone: string;
  channel: ChannelId;
  message: string;
  status: 'delivered' | 'failed' | 'pending';
  templateId?: string;
  sentBy: string;              // user display name
  cost: number;                // per-message cost x parts
}

interface AutomationRules {
  invoiceSms: boolean;
  dueReminder: boolean;
  paymentConfirmation: boolean;
  warrantyReminder: boolean;
}

interface ProviderSettings {
  provider: string;            // e.g. "GatewayAPI"
  apiKey: string;              // masked in UI
  senderId: string;            // ≤ 11 chars
  balance: number;             // remaining SMS credits (informational)
}
```

### Template variables

```
{customer_name}   {supplier_name}   {invoice_no}      {invoice_amount}
{due_amount}      {store_name}      {store_phone}     {current_date}
```

Legacy tokens (`{name}`, `{shop}`, `{amount}`, `{invoice}`) are still substituted so v1
templates render cleanly after migration.

## Default templates shipped

| id             | category  | Purpose                     |
|----------------|-----------|-----------------------------|
| tpl-invoice    | invoice   | Invoice confirmation        |
| tpl-due        | due       | Due reminder                |
| tpl-payment    | payment   | Payment received            |
| tpl-warranty   | warranty  | Warranty notification       |
| tpl-promo      | promo     | Promotional message         |

All are `builtin: true` and cannot be deleted; they can be edited (and reset by
clearing local storage) by any role with `templates:manage`.

## Files touched this turn

- **Rewritten** `src/pos-app/components/SmsCenter.tsx` — full Communication Center (~720 lines).
- **Edited** `src/pos-app/App.tsx` — passes `shopPhone`, `userRole`, `userName` into `SmsCenter`. No sidebar / route changes.
- **Added** `docs/communication-center-architecture.md` (this file).
- **Added** `docs/communication-center-roadmap.md`.

Verified: `bunx tsgo --noEmit` → clean.

---

# Future Expansion Roadmap

## v1.1 — WhatsApp Business (targeted next)

- Flip `whatsapp.active = true` in `CHANNELS`.
- Backend: add `sendWhatsapp(row)` beside `sendSms(row)` — same `MessageHistoryRow` shape, `channel: 'whatsapp'`.
- Provider settings gains a WhatsApp panel (WABA phone-number id + permanent access token) reusing `ProviderSettings` extended with a `channels: Record<ChannelId, { … }>` map.
- Template editor: enforce WhatsApp-approved template names + language code when `channel === 'whatsapp'`.
- History filter already supports channel — no UI change required.

## v1.2 — Transactional Email

- Flip `email.active = true`; recipient switch adds an `email` field alongside phone.
- Provider settings: SMTP host / port / from-address / DKIM domain, or a hosted provider (Resend / SES).
- Templates gain optional `subject` and `html` fields; category list adds `receipt` and `report`.
- Attach receipt PDF: reuse existing invoice renderer, pass URL as `{invoice_url}` variable.

## v1.3 — Web / Native Push

- Flip `push.active = true`; recipient switch adds an `audience` selector (all users / segment / single).
- Provider settings: VAPID keys (web) + FCM server key (app).
- History `phone` column relabels to `endpoint`; add device-count column.
- Add automation rule "Push on new order".

## v1.4 — Automation dispatcher

- Introduce `src/pos-app/lib/commDispatcher.ts` that receives domain events (`invoice.created`, `payment.received`, `due.overdue`, `warranty.expiring`) and reads `AutomationRules` + workspace channel priority to choose SMS → WhatsApp → Email fallback.
- Persist retries & failures back to `MessageHistoryRow` (`status: 'failed'` with reason).
- Move history/queue into Firestore collection `communications/{workspaceId}/messages` behind `scopedQuery()` so multi-device sync works — offline-first behaviour preserved via existing sync queue pattern.

## v1.5 — Analytics

- Delivery-rate trendline (last 30 days per channel).
- Cost report per template / per channel (already have `cost` column).
- Segment engagement (open rate for Email, read rate for WhatsApp).

## Extension checklist (for every new channel)

1. Add `ChannelMeta` entry with `active: false`, icon, tone, cost.
2. Ship a "Coming soon" card copy (already handled by the filter on `!c.active`).
3. When ready to enable: implement `send<Channel>()`, add provider fields, flip `active`.
4. Add category shortcuts if the channel expects a distinct template shape.
5. No UI plumbing changes — selector, history filter, template dropdown, and cost/badge components all read from `CHANNELS`.
