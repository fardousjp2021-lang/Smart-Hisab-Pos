import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send, MessageSquare, Users, Truck, Phone, Search, Filter, Plus,
  Trash2, Edit3, Save, X as XIcon, CheckCircle2, XCircle, Clock,
  Settings as SettingsIcon, Wallet, Sparkles, TrendingUp, Eye, EyeOff,
  Mail, Bell, MessageCircle, Lock, Zap, Shield, Info, RefreshCw,
  Activity, Moon, Gauge, ListChecks, Download, AlertTriangle,
} from 'lucide-react';
import { getActiveWorkspaceId } from '../lib/workspaceId';

// ─────────────────────────────────────────────────────────────────────────────
// Communication Center — v1.1
// Route: /sms (unchanged)
// v1 active channels: SMS. Placeholder cards for WhatsApp / Email / Push.
// Firestore collections, offline sync, accounting, and multi-tenant isolation
// are NOT touched — this is a client-side workspace-scoped shell.
//
// v1.1 additions (client-side only, workspace-scoped storage):
//   • Message Queue Monitor (pending / sending / failed / completed)
//   • Retry Failed Messages (idempotent, preserves template & recipient)
//   • Character Counter (Bangla/UCS-2 & English/GSM-7 with parts)
//   • Communication Activity Widget (today, delivery %, due, warranty)
//   • Quiet Hours (queue automated msgs, auto-flush when window ends)
//   • Daily Limits by Role (cashier/manager/admin)
//   • Communication Audit Log (filter by date/user/channel/status + CSV)
// ─────────────────────────────────────────────────────────────────────────────

type Customer = { id?: string; name?: string; phone?: string };
type Supplier = { id?: string; name?: string; phone?: string };

export type ChannelId = 'sms' | 'whatsapp' | 'email' | 'push';

type ChannelMeta = {
  id: ChannelId;
  labelBn: string;
  labelEn: string;
  icon: any;
  active: boolean;
  costPerMessage: number;
  tone: 'rose' | 'emerald' | 'indigo' | 'amber';
};

const CHANNELS: ChannelMeta[] = [
  { id: 'sms',      labelBn: 'এসএমএস',           labelEn: 'SMS',       icon: MessageSquare, active: true,  costPerMessage: 0.35, tone: 'rose' },
  { id: 'whatsapp', labelBn: 'হোয়াটসঅ্যাপ',        labelEn: 'WhatsApp',  icon: MessageCircle, active: false, costPerMessage: 0,    tone: 'emerald' },
  { id: 'email',    labelBn: 'ইমেইল',             labelEn: 'Email',     icon: Mail,          active: false, costPerMessage: 0,    tone: 'indigo' },
  { id: 'push',     labelBn: 'পুশ নোটিফিকেশন',    labelEn: 'Push',      icon: Bell,          active: false, costPerMessage: 0,    tone: 'amber' },
];

type Props = {
  lang?: 'bn' | 'en';
  customers?: Customer[];
  suppliers?: Supplier[];
  shopName?: string;
  shopPhone?: string;
  userRole?: string;
  userName?: string;
  showToast?: (msg: string, kind?: 'success' | 'error' | 'info') => void;
};

type TemplateCategory =
  | 'invoice' | 'due' | 'payment' | 'warranty' | 'promo' | 'custom';

export type MessageTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  channel: ChannelId;
  body: string;
  builtin?: boolean;
};

export type MessageStatus = 'delivered' | 'failed' | 'pending' | 'sending' | 'queued';

export type MessageHistoryRow = {
  id: string;
  ts: string;
  recipient: string;
  phone: string;
  channel: ChannelId;
  message: string;
  status: MessageStatus;
  templateId?: string;
  templateCategory?: TemplateCategory;
  sentBy: string;
  sentByRole?: string;
  cost: number;
  parts?: number;
  retryOf?: string;      // id of the failed row this row retried
  retryCount?: number;   // increments per retry chain
  automated?: boolean;   // came from an automation rule
};

type AutomationRules = {
  invoiceSms: boolean;
  dueReminder: boolean;
  paymentConfirmation: boolean;
  warrantyReminder: boolean;
};

type ProviderSettings = {
  provider: string;
  apiKey: string;
  senderId: string;
  balance: number;
};

type QuietHoursSettings = {
  enabled: boolean;
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

type DailyLimits = {
  cashier: number;   // 0 = unlimited
  manager: number;
  admin: number;
};

type AuditLogRow = {
  id: string;
  ts: string;
  actor: string;
  actorRole: string;
  action: 'send' | 'retry' | 'queue' | 'flush' | 'limit_block' | 'template_saved' | 'template_deleted' | 'settings_updated';
  channel?: ChannelId;
  recipient?: string;
  templateId?: string;
  cost?: number;
  status?: MessageStatus;
  note?: string;
};

// ── Storage (workspace-scoped, v2 bumps schema for new fields) ──────────────
const wsKey = (name: string) => {
  const w = getActiveWorkspaceId() || 'default';
  return `comm.v2.${w}.${name}`;
};

const legacyKey = (name: string) => {
  const w = getActiveWorkspaceId() || 'default';
  return `sms.v1.${w}.${name}`;
};

const readJson = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* no-op */ }
};

const nowStamp = () => new Date().toISOString();
const shortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};
const isToday = (iso: string) => {
  try {
    const d = new Date(iso); const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  } catch { return false; }
};
const isThisMonth = (iso: string) => {
  try {
    const d = new Date(iso); const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  } catch { return false; }
};

// ── SMS character metrics (Bangla / UCS-2 vs GSM-7) ─────────────────────────
// Bangla or any non-GSM-7 char forces UCS-2 encoding (70 single / 67 concat).
// GSM-7 encoding: 160 single, 153 concat.
function smsMetrics(text: string) {
  const hasBangla = /[\u0980-\u09FF]/.test(text);
  const hasNonAscii = /[^\x00-\x7F]/.test(text);
  const encoding: 'GSM' | 'UCS-2' = (hasBangla || hasNonAscii) ? 'UCS-2' : 'GSM';
  const len = text.length;
  const singleLimit = encoding === 'UCS-2' ? 70 : 160;
  const concatLimit = encoding === 'UCS-2' ? 67 : 153;
  const parts = len === 0 ? 0 : (len <= singleLimit ? 1 : Math.ceil(len / concatLimit));
  const capacity = parts <= 1 ? singleLimit : parts * concatLimit;
  const remaining = Math.max(0, capacity - len);
  return { encoding, len, parts, singleLimit, concatLimit, capacity, remaining, hasBangla };
}

// ── Quiet Hours helpers ─────────────────────────────────────────────────────
function parseHM(hm: string): number { // minutes since midnight
  const [h, m] = (hm || '00:00').split(':').map(x => parseInt(x, 10) || 0);
  return h * 60 + m;
}
function isInQuietHours(now: Date, s: QuietHoursSettings): boolean {
  if (!s.enabled) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const a = parseHM(s.start), b = parseHM(s.end);
  if (a === b) return false;
  // Overnight window (e.g. 23:00 → 08:00)
  return a < b ? (cur >= a && cur < b) : (cur >= a || cur < b);
}

// ── Default template catalogue ──────────────────────────────────────────────
function defaultTemplates(lang: 'bn' | 'en'): MessageTemplate[] {
  const bn = lang === 'bn';
  const base: Array<Omit<MessageTemplate, 'body'> & { bn: string; en: string }> = [
    {
      id: 'tpl-invoice', name: bn ? 'ইনভয়েস নিশ্চিতকরণ' : 'Invoice confirmation',
      category: 'invoice', channel: 'sms', builtin: true,
      bn: 'প্রিয় {customer_name}, আপনার ইনভয়েস #{invoice_no} — মোট {invoice_amount}৳। ধন্যবাদ, {store_name}।',
      en: 'Dear {customer_name}, invoice #{invoice_no} total {invoice_amount}. Thank you — {store_name}.',
    },
    {
      id: 'tpl-due', name: bn ? 'বকেয়া অনুস্মারক' : 'Due reminder',
      category: 'due', channel: 'sms', builtin: true,
      bn: 'প্রিয় {customer_name}, আপনার বকেয়া {due_amount}৳। দ্রুত পরিশোধের অনুরোধ। — {store_name} ({store_phone})',
      en: 'Dear {customer_name}, an amount of {due_amount} is due. Kindly settle soon. — {store_name} ({store_phone})',
    },
    {
      id: 'tpl-payment', name: bn ? 'পেমেন্ট প্রাপ্তি' : 'Payment received',
      category: 'payment', channel: 'sms', builtin: true,
      bn: 'প্রিয় {customer_name}, {invoice_amount}৳ পেমেন্ট গ্রহণ করা হয়েছে। ইনভয়েস #{invoice_no}। ধন্যবাদ — {store_name}',
      en: 'Dear {customer_name}, payment of {invoice_amount} received against invoice #{invoice_no}. Thank you — {store_name}',
    },
    {
      id: 'tpl-warranty', name: bn ? 'ওয়ারেন্টি অনুস্মারক' : 'Warranty notification',
      category: 'warranty', channel: 'sms', builtin: true,
      bn: 'প্রিয় {customer_name}, {current_date} তারিখে আপনার পণ্যের ওয়ারেন্টি সংক্রান্ত আপডেট। যোগাযোগ: {store_phone} — {store_name}',
      en: 'Dear {customer_name}, warranty update for your product as of {current_date}. Contact: {store_phone} — {store_name}',
    },
    {
      id: 'tpl-promo', name: bn ? 'প্রচারমূলক বার্তা' : 'Promotional message',
      category: 'promo', channel: 'sms', builtin: true,
      bn: '{store_name} এ এসেছে নতুন অফার! আজই ভিজিট করুন এবং বিশেষ ছাড় উপভোগ করুন।',
      en: 'New offers at {store_name}! Visit today and enjoy special discounts.',
    },
  ];
  return base.map(b => ({ id: b.id, name: b.name, category: b.category, channel: b.channel, builtin: b.builtin, body: bn ? b.bn : b.en }));
}

const defaultAutomation: AutomationRules = {
  invoiceSms: true,
  dueReminder: true,
  paymentConfirmation: false,
  warrantyReminder: false,
};

const defaultProvider: ProviderSettings = {
  provider: 'GatewayAPI',
  apiKey: '',
  senderId: 'RONI-SMS',
  balance: 2500,
};

const defaultQuietHours: QuietHoursSettings = {
  enabled: true,
  start: '23:00',
  end: '08:00',
};

const defaultLimits: DailyLimits = {
  cashier: 100,
  manager: 500,
  admin: 0, // 0 = unlimited
};

// ── Variable substitution ───────────────────────────────────────────────────
type Vars = {
  customer_name: string;
  supplier_name: string;
  invoice_no: string;
  invoice_amount: string;
  due_amount: string;
  store_name: string;
  store_phone: string;
  current_date: string;
};

const SUPPORTED_VARS: (keyof Vars)[] = [
  'customer_name', 'supplier_name', 'invoice_no', 'invoice_amount',
  'due_amount', 'store_name', 'store_phone', 'current_date',
];

function renderTemplate(body: string, vars: Vars): string {
  let out = body;
  for (const key of SUPPORTED_VARS) {
    out = out.replace(new RegExp(`\\{${key}\\}`, 'g'), vars[key] ?? '');
  }
  out = out.replace(/\{name\}/g, vars.customer_name || vars.supplier_name || '')
           .replace(/\{shop\}/g, vars.store_name)
           .replace(/\{amount\}/g, vars.invoice_amount || vars.due_amount || '')
           .replace(/\{invoice\}/g, vars.invoice_no || '');
  return out;
}

// ── Permissions matrix ──────────────────────────────────────────────────────
type Permission = 'view' | 'send' | 'templates:manage' | 'settings:manage' | 'automation:manage';

function permissionsFor(role: string): Set<Permission> {
  const r = (role || '').toLowerCase();
  if (r === 'super_admin' || r === 'owner' || r === 'admin') {
    return new Set<Permission>(['view', 'send', 'templates:manage', 'settings:manage', 'automation:manage']);
  }
  if (r === 'manager') {
    return new Set<Permission>(['view', 'send', 'templates:manage']);
  }
  if (r === 'cashier' || r === 'employee') {
    return new Set<Permission>(['view', 'send']);
  }
  return new Set<Permission>(['view']);
}

function roleBucket(role: string): keyof DailyLimits | null {
  const r = (role || '').toLowerCase();
  if (r === 'super_admin' || r === 'owner' || r === 'admin') return 'admin';
  if (r === 'manager') return 'manager';
  if (r === 'cashier' || r === 'employee') return 'cashier';
  return null;
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SmsCenter(props: Props) {
  const {
    lang = 'en', customers = [], suppliers = [],
    shopName = 'Shop', shopPhone = '',
    userRole = 'owner', userName = 'System',
    showToast,
  } = props;
  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);
  const perms = useMemo(() => permissionsFor(userRole), [userRole]);
  const isCashier = ['cashier', 'employee'].includes((userRole || '').toLowerCase());
  const bucket = roleBucket(userRole);

  // ── Persisted state ──
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const migrated = readJson<MessageTemplate[]>(wsKey('templates'), []);
    if (migrated.length) return migrated;
    const legacy = readJson<any[]>(legacyKey('templates'), []);
    if (legacy.length) {
      return legacy.map(l => ({
        id: l.id, name: l.name, category: (l.category as TemplateCategory) || 'custom',
        channel: 'sms' as ChannelId, body: l.body, builtin: !!l.builtin,
      }));
    }
    return defaultTemplates(lang);
  });

  const [history, setHistory] = useState<MessageHistoryRow[]>(() => {
    const rows = readJson<MessageHistoryRow[]>(wsKey('history'), []);
    if (rows.length) return rows;
    const legacy = readJson<any[]>(legacyKey('history'), []);
    return legacy.map(r => ({
      id: r.id, ts: r.ts, recipient: r.recipient, phone: r.phone,
      channel: 'sms' as ChannelId, message: r.message, status: r.status,
      templateId: r.template, sentBy: 'System', cost: 0.35,
    }));
  });

  const [provider, setProvider] = useState<ProviderSettings>(() => {
    const p = readJson<ProviderSettings | null>(wsKey('provider'), null);
    if (p) return p;
    const legacy = readJson<any>(legacyKey('settings'), null);
    if (legacy) {
      return {
        provider: legacy.provider || defaultProvider.provider,
        apiKey: legacy.apiKey || '',
        senderId: legacy.senderId || defaultProvider.senderId,
        balance: typeof legacy.balance === 'number' ? legacy.balance : defaultProvider.balance,
      };
    }
    return defaultProvider;
  });

  const [automation, setAutomation] = useState<AutomationRules>(() => {
    const a = readJson<AutomationRules | null>(wsKey('automation'), null);
    if (a) return a;
    const legacy = readJson<any>(legacyKey('settings'), null);
    if (legacy) {
      return {
        invoiceSms: !!legacy.autoInvoice,
        dueReminder: !!legacy.autoDue,
        paymentConfirmation: false,
        warrantyReminder: false,
      };
    }
    return defaultAutomation;
  });

  const [quietHours, setQuietHours] = useState<QuietHoursSettings>(
    () => readJson<QuietHoursSettings>(wsKey('quietHours'), defaultQuietHours),
  );
  const [limits, setLimits] = useState<DailyLimits>(
    () => readJson<DailyLimits>(wsKey('limits'), defaultLimits),
  );
  const [auditLog, setAuditLog] = useState<AuditLogRow[]>(
    () => readJson<AuditLogRow[]>(wsKey('audit'), []),
  );

  useEffect(() => { writeJson(wsKey('templates'), templates); }, [templates]);
  useEffect(() => { writeJson(wsKey('history'), history); }, [history]);
  useEffect(() => { writeJson(wsKey('provider'), provider); }, [provider]);
  useEffect(() => { writeJson(wsKey('automation'), automation); }, [automation]);
  useEffect(() => { writeJson(wsKey('quietHours'), quietHours); }, [quietHours]);
  useEffect(() => { writeJson(wsKey('limits'), limits); }, [limits]);
  useEffect(() => {
    // Keep audit log bounded to the most recent 1000 events per workspace.
    const capped = auditLog.slice(0, 1000);
    writeJson(wsKey('audit'), capped);
  }, [auditLog]);

  // ── Online / sync state (informational) ──
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  // ── UI state ──
  const [activeChannel, setActiveChannel] = useState<ChannelId>('sms');
  const [recipientMode, setRecipientMode] = useState<'customer' | 'supplier' | 'manual'>('manual');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [message, setMessage] = useState('');
  const [applyingTemplate, setApplyingTemplate] = useState('');
  const [sending, setSending] = useState(false);

  const [editingTpl, setEditingTpl] = useState<MessageTemplate | null>(null);
  const [tplDraft, setTplDraft] = useState<MessageTemplate | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MessageStatus>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelId>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Audit-log filters (independent from history filters)
  const [aStatus, setAStatus] = useState<'all' | AuditLogRow['action']>('all');
  const [aUser, setAUser] = useState<string>('all');
  const [aChannel, setAChannel] = useState<'all' | ChannelId>('all');
  const [aFrom, setAFrom] = useState('');
  const [aTo, setATo] = useState('');

  // ── Helpers ──
  const pushAudit = (row: Omit<AuditLogRow, 'id' | 'ts' | 'actor' | 'actorRole'>) => {
    setAuditLog(prev => [{
      id: 'A-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ts: nowStamp(), actor: userName, actorRole: userRole, ...row,
    }, ...prev]);
  };

  // ── Derived ──
  const summary = useMemo(() => {
    const todayCount = history.filter(h => isToday(h.ts) && h.status !== 'queued' && h.status !== 'failed').length;
    const monthCount = history.filter(h => isThisMonth(h.ts)).length;
    const delivered = history.filter(h => h.status === 'delivered').length;
    const attempted = history.filter(h => h.status === 'delivered' || h.status === 'failed').length;
    const rate = attempted ? Math.round((delivered / attempted) * 100) : 100;
    return { todayCount, monthCount, delivered, rate };
  }, [history]);

  const queueStats = useMemo(() => {
    let pending = 0, sendingCount = 0, failed = 0, completed = 0, queued = 0;
    for (const h of history) {
      if (h.status === 'pending') pending++;
      else if (h.status === 'sending') sendingCount++;
      else if (h.status === 'failed') failed++;
      else if (h.status === 'delivered') completed++;
      else if (h.status === 'queued') queued++;
    }
    return { pending, sending: sendingCount, failed, completed, queued };
  }, [history]);

  const activityWidget = useMemo(() => {
    const today = history.filter(h => isToday(h.ts));
    const delivered = today.filter(h => h.status === 'delivered').length;
    const attempted = today.filter(h => h.status === 'delivered' || h.status === 'failed').length;
    const rate = attempted ? Math.round((delivered / attempted) * 100) : 100;
    const due = today.filter(h => h.templateCategory === 'due').length;
    const warranty = today.filter(h => h.templateCategory === 'warranty').length;
    return { sentToday: delivered, rate, due, warranty };
  }, [history]);

  // Per-user daily counts (delivered + pending + sending + queued count toward limit)
  const myDailyCount = useMemo(() =>
    history.filter(h => isToday(h.ts) && h.sentBy === userName && h.status !== 'failed').length,
    [history, userName]);
  const myLimit = bucket ? limits[bucket] : 0;
  const limitReached = myLimit > 0 && myDailyCount >= myLimit;
  const nearLimit = myLimit > 0 && !limitReached && myDailyCount >= Math.floor(myLimit * 0.9);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    return history
      .filter(h => statusFilter === 'all' || h.status === statusFilter)
      .filter(h => channelFilter === 'all' || h.channel === channelFilter)
      .filter(h => {
        if (!dateFrom && !dateTo) return true;
        const d = h.ts.slice(0, 10);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      })
      .filter(h => !q
        || h.recipient.toLowerCase().includes(q)
        || h.phone.toLowerCase().includes(q)
        || h.message.toLowerCase().includes(q)
        || (h.sentBy || '').toLowerCase().includes(q))
      .sort((a, b) => b.ts.localeCompare(a.ts));
  }, [history, search, statusFilter, channelFilter, dateFrom, dateTo]);

  const auditUsers = useMemo(() => {
    const s = new Set<string>();
    for (const a of auditLog) if (a.actor) s.add(a.actor);
    return Array.from(s).sort();
  }, [auditLog]);

  const filteredAudit = useMemo(() => {
    return auditLog
      .filter(a => aStatus === 'all' || a.action === aStatus)
      .filter(a => aUser === 'all' || a.actor === aUser)
      .filter(a => aChannel === 'all' || a.channel === aChannel)
      .filter(a => {
        if (!aFrom && !aTo) return true;
        const d = a.ts.slice(0, 10);
        if (aFrom && d < aFrom) return false;
        if (aTo && d > aTo) return false;
        return true;
      })
      .sort((a, b) => b.ts.localeCompare(a.ts));
  }, [auditLog, aStatus, aUser, aChannel, aFrom, aTo]);

  const selectedRecipient = useMemo(() => {
    if (recipientMode === 'customer') {
      const c = customers.find(x => (x.id || x.phone || x.name) === selectedCustomer);
      return { name: c?.name || '', phone: c?.phone || '', type: 'customer' as const };
    }
    if (recipientMode === 'supplier') {
      const s = suppliers.find(x => (x.id || x.phone || x.name) === selectedSupplier);
      return { name: s?.name || '', phone: s?.phone || '', type: 'supplier' as const };
    }
    return { name: manualName, phone: manualPhone, type: 'manual' as const };
  }, [recipientMode, selectedCustomer, selectedSupplier, manualName, manualPhone, customers, suppliers]);

  const currentVars: Vars = useMemo(() => ({
    customer_name: selectedRecipient.type === 'customer' ? selectedRecipient.name : '',
    supplier_name: selectedRecipient.type === 'supplier' ? selectedRecipient.name : '',
    invoice_no: '____',
    invoice_amount: '____',
    due_amount: '____',
    store_name: shopName,
    store_phone: shopPhone || '',
    current_date: new Date().toLocaleDateString(),
  }), [selectedRecipient, shopName, shopPhone]);

  const metrics = useMemo(() => smsMetrics(message), [message]);

  // ── Quiet-hours auto-flush of queued automated messages ──
  const inQuiet = useMemo(() => isInQuietHours(new Date(), quietHours), [quietHours]);
  const flushRef = useRef(false);
  useEffect(() => {
    // Every 30s, if we've left quiet hours, promote queued → sending → delivered.
    const iv = setInterval(() => {
      if (flushRef.current) return;
      if (isInQuietHours(new Date(), quietHours)) return;
      setHistory(prev => {
        const queued = prev.filter(r => r.status === 'queued');
        if (!queued.length) return prev;
        flushRef.current = true;
        pushAudit({ action: 'flush', note: `Flushed ${queued.length} queued message(s)` });
        // Optimistically flip to delivered (simulated send)
        const flipped = prev.map(r => r.status === 'queued'
          ? { ...r, status: 'delivered' as MessageStatus, ts: nowStamp() }
          : r);
        setTimeout(() => { flushRef.current = false; }, 1000);
        return flipped;
      });
    }, 30_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quietHours]);

  // ── Actions ──
  function applyTemplate(id: string) {
    setApplyingTemplate(id);
    const tpl = templates.find(x => x.id === id);
    if (!tpl) return;
    if (isCashier && tpl.category !== 'invoice') {
      showToast?.(t('ক্যাশিয়ার শুধু ইনভয়েস টেমপ্লেট ব্যবহার করতে পারে', 'Cashier can only use invoice templates'), 'error');
      return;
    }
    setMessage(renderTemplate(tpl.body, currentVars));
  }

  function sendMessage() {
    if (!perms.has('send')) {
      showToast?.(t('পাঠানোর অনুমতি নেই', 'You do not have permission to send'), 'error');
      return;
    }
    if (limitReached) {
      showToast?.(t('আজকের সীমা পূর্ণ হয়েছে', 'Daily limit reached for your role'), 'error');
      pushAudit({ action: 'limit_block', note: `Blocked at ${myDailyCount}/${myLimit}` });
      return;
    }
    const chan = CHANNELS.find(c => c.id === activeChannel);
    if (!chan || !chan.active) {
      showToast?.(t('এই চ্যানেল এখনো চালু হয়নি', 'This channel is not available yet'), 'error');
      return;
    }
    const phone = (selectedRecipient.phone || '').trim();
    const name = (selectedRecipient.name || '').trim() || t('অজ্ঞাত', 'Unknown');
    if (!phone) return showToast?.(t('ফোন নম্বর প্রয়োজন', 'Phone number required'), 'error');
    if (!/^[+0-9\s\-]{6,20}$/.test(phone)) return showToast?.(t('অবৈধ ফোন নম্বর', 'Invalid phone number'), 'error');
    const body = message.trim();
    if (!body) return showToast?.(t('বার্তা লিখুন', 'Enter a message'), 'error');
    if (body.length > 918) return showToast?.(t('বার্তা অনেক বড়', 'Message too long'), 'error');

    setSending(true);
    const m = smsMetrics(body);
    const cost = +(chan.costPerMessage * Math.max(1, m.parts)).toFixed(2);
    const tpl = templates.find(x => x.id === applyingTemplate);
    const id = 'MSG-' + Date.now().toString(36).toUpperCase();
    const row: MessageHistoryRow = {
      id, ts: nowStamp(), recipient: name, phone,
      channel: activeChannel, message: body, status: 'pending',
      templateId: applyingTemplate || undefined,
      templateCategory: tpl?.category,
      sentBy: userName, sentByRole: userRole, cost,
      parts: m.parts,
    };
    setHistory(prev => [row, ...prev]);
    setProvider(p => ({ ...p, balance: Math.max(0, p.balance - Math.max(1, m.parts)) }));
    pushAudit({
      action: 'send', channel: activeChannel, recipient: `${name} ${phone}`,
      templateId: applyingTemplate || undefined, cost, status: 'pending',
    });
    // Simulate send lifecycle: pending → sending → delivered
    setTimeout(() => {
      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'sending' as MessageStatus } : h));
    }, 250);
    setTimeout(() => {
      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'delivered' as MessageStatus } : h));
      setSending(false);
      showToast?.(t('বার্তা পাঠানো হয়েছে', 'Message sent'), 'success');
    }, 800);
    setMessage('');
    setApplyingTemplate('');
  }

  function retryMessage(rowId: string) {
    if (!perms.has('send')) {
      showToast?.(t('অনুমতি নেই', 'No permission'), 'error');
      return;
    }
    const orig = history.find(h => h.id === rowId);
    if (!orig) return;
    if (orig.status !== 'failed') {
      showToast?.(t('শুধু ব্যর্থ বার্তা পুনরায় পাঠানো যাবে', 'Only failed messages can be retried'), 'error');
      return;
    }
    // Prevent duplicate: if any existing row already retried this one and is not failed, block.
    const already = history.find(h => h.retryOf === rowId && h.status !== 'failed');
    if (already) {
      showToast?.(t('ইতিমধ্যে পুনরায় পাঠানো হয়েছে', 'Retry already in progress'), 'info');
      return;
    }
    if (limitReached) {
      showToast?.(t('আজকের সীমা পূর্ণ হয়েছে', 'Daily limit reached for your role'), 'error');
      return;
    }
    const chan = CHANNELS.find(c => c.id === orig.channel);
    if (!chan) return;
    const m = smsMetrics(orig.message);
    const cost = +(chan.costPerMessage * Math.max(1, m.parts)).toFixed(2);
    const id = 'MSG-' + Date.now().toString(36).toUpperCase();
    const newRow: MessageHistoryRow = {
      ...orig,
      id, ts: nowStamp(), status: 'pending', cost, parts: m.parts,
      sentBy: userName, sentByRole: userRole,
      retryOf: rowId, retryCount: (orig.retryCount || 0) + 1,
    };
    setHistory(prev => [newRow, ...prev]);
    setProvider(p => ({ ...p, balance: Math.max(0, p.balance - Math.max(1, m.parts)) }));
    pushAudit({
      action: 'retry', channel: orig.channel, recipient: `${orig.recipient} ${orig.phone}`,
      templateId: orig.templateId, cost, status: 'pending', note: `Retry of ${rowId}`,
    });
    setTimeout(() => {
      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'sending' as MessageStatus } : h));
    }, 250);
    setTimeout(() => {
      setHistory(prev => prev.map(h => h.id === id ? { ...h, status: 'delivered' as MessageStatus } : h));
      showToast?.(t('পুনরায় পাঠানো সফল', 'Retry sent successfully'), 'success');
    }, 800);
  }

  function saveTemplate() {
    if (!perms.has('templates:manage')) {
      showToast?.(t('টেমপ্লেট পরিচালনার অনুমতি নেই', 'No permission to manage templates'), 'error');
      return;
    }
    if (!tplDraft) return;
    if (!tplDraft.name.trim() || !tplDraft.body.trim()) {
      showToast?.(t('নাম ও বার্তা প্রয়োজন', 'Name and body required'), 'error');
      return;
    }
    setTemplates(prev => {
      const exists = prev.find(p => p.id === tplDraft.id);
      if (exists) return prev.map(p => p.id === tplDraft.id ? tplDraft : p);
      return [...prev, { ...tplDraft, id: 'tpl-' + Date.now().toString(36) }];
    });
    pushAudit({ action: 'template_saved', templateId: tplDraft.id, note: tplDraft.name });
    setEditingTpl(null);
    setTplDraft(null);
    showToast?.(t('টেমপ্লেট সংরক্ষিত', 'Template saved'), 'success');
  }

  function deleteTemplate(id: string) {
    if (!perms.has('templates:manage')) {
      showToast?.(t('অনুমতি নেই', 'No permission'), 'error');
      return;
    }
    const tpl = templates.find(x => x.id === id);
    if (!tpl) return;
    if (tpl.builtin) {
      showToast?.(t('ডিফল্ট টেমপ্লেট মুছে ফেলা যাবে না', 'Cannot delete default template'), 'error');
      return;
    }
    if (!confirm(t('এই টেমপ্লেট মুছবেন?', 'Delete this template?'))) return;
    setTemplates(prev => prev.filter(p => p.id !== id));
    pushAudit({ action: 'template_deleted', templateId: id, note: tpl.name });
  }

  function checkBalance() {
    showToast?.(t(`ব্যালেন্স: ${provider.balance} SMS`, `Balance: ${provider.balance} SMS`), 'info');
  }

  function sendTestMessage() {
    if (!perms.has('settings:manage')) {
      showToast?.(t('অনুমতি নেই', 'No permission'), 'error');
      return;
    }
    showToast?.(t('টেস্ট বার্তা সারিতে যোগ হয়েছে', 'Test message queued'), 'info');
  }

  function exportAuditCsv() {
    const header = ['timestamp', 'actor', 'role', 'action', 'channel', 'recipient', 'template', 'cost', 'status', 'note'];
    const escape = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filteredAudit.map(a => [
      a.ts, a.actor, a.actorRole, a.action, a.channel || '',
      a.recipient || '', a.templateId || '', a.cost ?? '', a.status || '', a.note || '',
    ].map(escape).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  const StatusBadge = ({ s }: { s: MessageStatus }) => {
    const map: Record<MessageStatus, { c: string; I: any; l: string }> = {
      delivered: { c: 'bg-emerald-50 text-emerald-700 border-emerald-200', I: CheckCircle2, l: t('ডেলিভার্ড', 'Delivered') },
      failed:    { c: 'bg-rose-50 text-rose-700 border-rose-200',          I: XCircle,       l: t('ব্যর্থ', 'Failed') },
      pending:   { c: 'bg-amber-50 text-amber-700 border-amber-200',       I: Clock,         l: t('প্রক্রিয়াধীন', 'Pending') },
      sending:   { c: 'bg-sky-50 text-sky-700 border-sky-200',             I: Send,          l: t('পাঠানো হচ্ছে', 'Sending') },
      queued:    { c: 'bg-slate-50 text-slate-700 border-slate-200',       I: Moon,          l: t('সারিতে', 'Queued') },
    };
    const cur = map[s];
    const Icon = cur.I;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cur.c}`}>
        <Icon className="h-3 w-3" /> {cur.l}
      </span>
    );
  };

  const ChannelBadge = ({ id }: { id: ChannelId }) => {
    const c = CHANNELS.find(x => x.id === id) || CHANNELS[0];
    const Icon = c.icon;
    const toneMap: Record<ChannelMeta['tone'], string> = {
      rose: 'bg-rose-50 text-rose-700 border-rose-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${toneMap[c.tone]}`}>
        <Icon className="h-3 w-3" /> {lang === 'bn' ? c.labelBn : c.labelEn}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-3 py-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800 sm:text-2xl">
            <MessageSquare className="h-6 w-6 text-rose-600" />
            {t('কমিউনিকেশন সেন্টার', 'Communication Center')}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">v1.1</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('SMS সহ সকল যোগাযোগ চ্যানেল এক জায়গায় — ভবিষ্যতে WhatsApp, Email ও Push যোগ হবে।',
               'All communication channels in one place — WhatsApp, Email & Push coming soon.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {online ? t('অনলাইন', 'Online') : t('অফলাইন', 'Offline')}
          </span>
          {inQuiet && (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
              <Moon className="h-3 w-3" /> {t('কোয়াইট আওয়ার', 'Quiet hours')}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
            <Shield className="h-3 w-3" /> {t('ভূমিকা', 'Role')}: <b className="text-slate-800">{userRole}</b>
          </span>
          <button onClick={() => setIsTopUpOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer">
            <Wallet className="h-4 w-4" /> {t('ব্যালেন্স রিচার্জ ও প্যাকেজ', 'Recharge Balance')}
          </button>
        </div>
      </div>

      {/* Daily-limit warning banner */}
      {(limitReached || nearLimit) && (
        <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
          limitReached ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">
              {limitReached
                ? t('আজকের বার্তা পাঠানোর সীমা পূর্ণ হয়েছে।', 'Daily sending limit reached.')
                : t('আপনি সীমার কাছাকাছি পৌঁছেছেন।', 'You are approaching your daily limit.')}
            </div>
            <div className="text-xs">
              {t('আজকের ব্যবহার', 'Today')}: <b>{myDailyCount}</b>{myLimit ? ` / ${myLimit}` : ` / ∞`} · {t('ভূমিকা', 'Role')}: {bucket || userRole}
            </div>
          </div>
        </div>
      )}

      {/* Channel selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CHANNELS.map(c => {
          const Icon = c.icon;
          const selected = activeChannel === c.id;
          const disabled = !c.active;
          return (
            <button key={c.id} disabled={disabled}
              onClick={() => setActiveChannel(c.id)}
              className={`relative flex items-center justify-between rounded-xl border p-3 text-left transition ${
                disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'
                  : selected
                    ? 'border-rose-300 bg-rose-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
              }`}>
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${selected ? 'text-rose-600' : 'text-slate-500'}`} />
                <div>
                  <div className={`text-sm font-semibold ${selected ? 'text-rose-700' : 'text-slate-800'}`}>
                    {lang === 'bn' ? c.labelBn : c.labelEn}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {c.active ? t('সক্রিয়', 'Active') : t('শীঘ্রই আসছে', 'Coming soon')}
                  </div>
                </div>
              </div>
              {!c.active && <Lock className="h-3.5 w-3.5 text-slate-400" />}
              {selected && c.active && <span className="h-2 w-2 rounded-full bg-rose-500" />}
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard icon={Send}         tone="rose"    label={t('আজকের বার্তা', 'Messages today')}         value={summary.todayCount} />
        <SummaryCard icon={TrendingUp}   tone="indigo"  label={t('এই মাসের বার্তা', 'Messages this month')} value={summary.monthCount} />
        <SummaryCard icon={Wallet}       tone="amber"   label={t('বাকি ব্যালেন্স', 'SMS balance')}          value={provider.balance} suffix="SMS" />
        <SummaryCard icon={CheckCircle2} tone="emerald" label={t('ডেলিভারি রেট', 'Delivery rate')}          value={summary.rate} suffix="%" />
      </div>

      {/* Message Queue Monitor */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <ListChecks className="h-4 w-4 text-rose-500" /> {t('মেসেজ কিউ মনিটর', 'Message Queue Monitor')}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {online ? t('সিঙ্ক সক্রিয়', 'Sync live') : t('সিঙ্ক পজড', 'Sync paused')}
            </span>
            {queueStats.queued > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                <Moon className="h-3 w-3" /> {queueStats.queued} {t('কোয়াইট-কিউ', 'quiet-queued')}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QueueCard tone="amber"   icon={Clock}       label={t('পেন্ডিং', 'Pending')}   value={queueStats.pending} />
          <QueueCard tone="sky"     icon={Send}        label={t('পাঠানো হচ্ছে', 'Sending')} value={queueStats.sending} />
          <QueueCard tone="rose"    icon={XCircle}     label={t('ব্যর্থ', 'Failed')}      value={queueStats.failed} />
          <QueueCard tone="emerald" icon={CheckCircle2} label={t('সম্পন্ন', 'Completed')}  value={queueStats.completed} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Quick send */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-rose-500" /> {t('দ্রুত পাঠান', 'Quick Send')}
            <ChannelBadge id={activeChannel} />
          </h2>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {(['customer', 'supplier', 'manual'] as const).map(m => (
              <button key={m} onClick={() => setRecipientMode(m)}
                className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  recipientMode === m ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}>
                {m === 'customer' && <><Users className="mr-1 inline h-3.5 w-3.5" />{t('গ্রাহক', 'Customer')}</>}
                {m === 'supplier' && <><Truck className="mr-1 inline h-3.5 w-3.5" />{t('সাপ্লায়ার', 'Supplier')}</>}
                {m === 'manual'   && <><Phone className="mr-1 inline h-3.5 w-3.5" />{t('ম্যানুয়াল', 'Manual')}</>}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recipientMode === 'customer' && (
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">{t('গ্রাহক নির্বাচন', 'Select customer')}</span>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                  <option value="">{t('— নির্বাচন করুন —', '— choose —')}</option>
                  {customers.map(c => {
                    const key = (c.id || c.phone || c.name || '') as string;
                    return <option key={key} value={key}>{c.name} — {c.phone}</option>;
                  })}
                </select>
              </label>
            )}
            {recipientMode === 'supplier' && (
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">{t('সাপ্লায়ার নির্বাচন', 'Select supplier')}</span>
                <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                  <option value="">{t('— নির্বাচন করুন —', '— choose —')}</option>
                  {suppliers.map(s => {
                    const key = (s.id || s.phone || s.name || '') as string;
                    return <option key={key} value={key}>{s.name} — {s.phone}</option>;
                  })}
                </select>
              </label>
            )}
            {recipientMode === 'manual' && (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">{t('নাম (ঐচ্ছিক)', 'Name (optional)')}</span>
                  <input value={manualName} onChange={e => setManualName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                    placeholder={t('গ্রাহকের নাম', 'Recipient name')} />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">{t('ফোন নম্বর', 'Phone number')}</span>
                  <input value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                    placeholder="01XXXXXXXXX" inputMode="tel" />
                </label>
              </>
            )}
            {recipientMode !== 'manual' && selectedRecipient.phone && (
              <div className="sm:col-span-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {t('প্রাপক', 'Recipient')}: <b>{selectedRecipient.name}</b> — {selectedRecipient.phone}
              </div>
            )}
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-medium text-slate-600">{t('বার্তা', 'Message')}</span>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
              placeholder={t('আপনার বার্তা লিখুন...', 'Type your message...')} />
            {/* Character counter — Bangla (UCS-2) / English (GSM-7) aware */}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                <span>
                  <b className="text-slate-700">{metrics.len}</b>
                  {' / '}{metrics.capacity} {t('অক্ষর', 'characters')}
                </span>
                <span className="text-slate-400">·</span>
                <span>
                  {t('বাকি', 'Remaining')}: <b className="text-slate-700">{metrics.remaining}</b>
                </span>
                <span className="text-slate-400">·</span>
                <span>
                  {metrics.hasBangla
                    ? t(`বাংলা SMS: ${metrics.parts} পার্ট`, `Bangla SMS: ${metrics.parts} part${metrics.parts === 1 ? '' : 's'}`)
                    : t(`SMS: ${metrics.parts} পার্ট`, `SMS: ${metrics.parts} part${metrics.parts === 1 ? '' : 's'}`)}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {metrics.encoding}
                </span>
              </div>
              <span className="text-slate-500">
                {t('আনুমানিক খরচ', 'Est. cost')}: <b className="text-slate-700">
                  {(Math.max(1, metrics.parts) * (CHANNELS.find(c => c.id === activeChannel)?.costPerMessage || 0)).toFixed(2)}
                </b>
              </span>
            </div>
            {/* Capacity meter */}
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full transition-all ${
                metrics.len > metrics.capacity - 10 ? 'bg-rose-500' : metrics.parts > 1 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} style={{ width: `${Math.min(100, (metrics.len / Math.max(1, metrics.capacity)) * 100)}%` }} />
            </div>
          </label>

          {templates.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {templates
                .filter(tpl => !isCashier || tpl.category === 'invoice')
                .slice(0, 8).map(tpl => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    applyingTemplate === tpl.id
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-rose-200 hover:text-rose-700'
                  }`}>
                  {tpl.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-md border border-dashed border-slate-200 bg-slate-50/60 p-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">{t('সমর্থিত ভেরিয়েবল', 'Supported variables')}:</span>{' '}
            {SUPPORTED_VARS.map(v => `{${v}}`).join('  ·  ')}
          </div>

          <button onClick={sendMessage}
            disabled={sending || !perms.has('send') || limitReached}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-rose-700 hover:to-rose-800 disabled:opacity-60 sm:w-auto">
            <Send className="h-4 w-4" /> {sending ? t('পাঠানো হচ্ছে...', 'Sending...') : t('পাঠান', 'Send')}
          </button>
        </section>

        {/* Right column: Activity widget + Templates stacked */}
        <div className="lg:col-span-5 space-y-4">
          {/* Communication Activity Widget */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Activity className="h-4 w-4 text-rose-500" /> {t('অ্যাক্টিভিটি', 'Activity today')}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label={t('আজ পাঠানো', 'Sent today')}         value={activityWidget.sentToday} tone="rose" icon={Send} />
              <MiniStat label={t('সফলতা', 'Delivery rate')}          value={`${activityWidget.rate}%`} tone="emerald" icon={CheckCircle2} />
              <MiniStat label={t('বকেয়া রিমাইন্ডার', 'Due reminders')}  value={activityWidget.due} tone="amber" icon={Wallet} />
              <MiniStat label={t('ওয়ারেন্টি রিমাইন্ডার', 'Warranty reminders')} value={activityWidget.warranty} tone="indigo" icon={Shield} />
            </div>
            {bucket && (
              <div className="mt-3 rounded-lg bg-slate-50 p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {t('আজকের সীমা', 'Today\'s limit')}</span>
                  <span><b>{myDailyCount}</b>{myLimit ? ` / ${myLimit}` : ` / ∞`}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full ${limitReached ? 'bg-rose-500' : nearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                       style={{ width: myLimit ? `${Math.min(100, (myDailyCount / myLimit) * 100)}%` : '10%' }} />
                </div>
              </div>
            )}
          </section>

          {/* Templates */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <MessageSquare className="h-4 w-4 text-rose-500" /> {t('টেমপ্লেট', 'Templates')}
              </h2>
              {perms.has('templates:manage') && (
                <button onClick={() => {
                    const empty: MessageTemplate = { id: '', name: '', category: 'custom', channel: 'sms', body: '' };
                    setEditingTpl(empty); setTplDraft(empty);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">
                  <Plus className="h-3.5 w-3.5" /> {t('নতুন', 'New')}
                </button>
              )}
            </div>

            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
              {templates.map(tpl => (
                <li key={tpl.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-slate-800">{tpl.name}</span>
                        <ChannelBadge id={tpl.channel} />
                        {tpl.builtin && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">{t('ডিফল্ট', 'Default')}</span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{tpl.body}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {perms.has('templates:manage') && (
                        <>
                          <button onClick={() => { setEditingTpl(tpl); setTplDraft(tpl); }}
                            className="rounded p-1 text-slate-500 hover:bg-white hover:text-rose-600" title={t('সম্পাদনা', 'Edit')}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteTemplate(tpl.id)}
                            className="rounded p-1 text-slate-500 hover:bg-white hover:text-rose-600" title={t('মুছুন', 'Delete')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => applyTemplate(tpl.id)}
                        className="rounded p-1 text-slate-500 hover:bg-white hover:text-rose-600" title={t('ব্যবহার', 'Use')}>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* History */}
        <section className="lg:col-span-12 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Clock className="h-4 w-4 text-rose-500" /> {t('বার্তা ইতিহাস', 'Message History')}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {filteredHistory.length}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2 sm:items-center">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('অনুসন্ধান...', 'Search...')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 sm:w-48" />
              </label>
              <select value={channelFilter} onChange={e => setChannelFilter(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                <option value="all">{t('সব চ্যানেল', 'All channels')}</option>
                {CHANNELS.map(c => (
                  <option key={c.id} value={c.id}>{lang === 'bn' ? c.labelBn : c.labelEn}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                <option value="all">{t('সব স্ট্যাটাস', 'All statuses')}</option>
                <option value="delivered">{t('ডেলিভার্ড', 'Delivered')}</option>
                <option value="sending">{t('পাঠানো হচ্ছে', 'Sending')}</option>
                <option value="pending">{t('প্রক্রিয়াধীন', 'Pending')}</option>
                <option value="queued">{t('সারিতে', 'Queued')}</option>
                <option value="failed">{t('ব্যর্থ', 'Failed')}</option>
              </select>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs" />
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs" />
              {(search || statusFilter !== 'all' || channelFilter !== 'all' || dateFrom || dateTo) && (
                <button onClick={() => { setSearch(''); setStatusFilter('all'); setChannelFilter('all'); setDateFrom(''); setDateTo(''); }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:text-rose-600">
                  <Filter className="h-3 w-3" /> {t('রিসেট', 'Reset')}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">{t('তারিখ ও সময়', 'Date & time')}</th>
                  <th className="py-2 pr-3">{t('প্রাপক', 'Recipient')}</th>
                  <th className="py-2 pr-3">{t('চ্যানেল', 'Channel')}</th>
                  <th className="py-2 pr-3">{t('স্ট্যাটাস', 'Status')}</th>
                  <th className="py-2 pr-3">{t('প্রেরক', 'Sent by')}</th>
                  <th className="py-2 pr-3">{t('খরচ', 'Cost')}</th>
                  <th className="py-2 pr-3">{t('বার্তা', 'Message')}</th>
                  <th className="py-2 pr-0 text-right">{t('অ্যাকশন', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                      {t('কোন ইতিহাস নেই।', 'No history yet.')}
                    </td>
                  </tr>
                )}
                {filteredHistory.map(h => {
                  const retried = history.some(r => r.retryOf === h.id && r.status !== 'failed');
                  return (
                    <tr key={h.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{shortDate(h.ts)}</td>
                      <td className="py-2 pr-3 text-sm font-medium text-slate-800">
                        <div>{h.recipient}</div>
                        <div className="text-[11px] font-normal text-slate-500">{h.phone}</div>
                      </td>
                      <td className="py-2 pr-3"><ChannelBadge id={h.channel} /></td>
                      <td className="py-2 pr-3">
                        <StatusBadge s={h.status} />
                        {h.retryOf && (
                          <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[9.5px] text-slate-500">
                            {t('পুনঃচেষ্টা', 'retry')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-xs text-slate-600">{h.sentBy}</td>
                      <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{h.cost.toFixed(2)}</td>
                      <td className="py-2 pr-3 max-w-sm truncate text-xs text-slate-500" title={h.message}>{h.message}</td>
                      <td className="py-2 pr-0 text-right">
                        {h.status === 'failed' && !retried ? (
                          <button onClick={() => retryMessage(h.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50">
                            <RefreshCw className="h-3 w-3" /> {t('পুনরায়', 'Retry')}
                          </button>
                        ) : h.status === 'failed' && retried ? (
                          <span className="text-[11px] text-slate-400">{t('প্রক্রিয়াধীন', 'in progress')}</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Automation Rules */}
        <section className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Zap className="h-4 w-4 text-rose-500" /> {t('অটোমেশন রুল', 'Automation Rules')}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t('নিয়ম চালু/বন্ধ করুন — অ্যাকাউন্টিং লজিক পরিবর্তন হবে না।',
               'Toggle rules on/off — no accounting logic is modified.')}
          </p>
          <div className="mt-3 space-y-2">
            <ToggleRow disabled={!perms.has('automation:manage')}
              label={t('স্বয়ংক্রিয় ইনভয়েস SMS', 'Send invoice SMS automatically')}
              value={automation.invoiceSms}
              onChange={v => setAutomation(a => ({ ...a, invoiceSms: v }))} />
            <ToggleRow disabled={!perms.has('automation:manage')}
              label={t('স্বয়ংক্রিয় বকেয়া অনুস্মারক', 'Send due reminder automatically')}
              value={automation.dueReminder}
              onChange={v => setAutomation(a => ({ ...a, dueReminder: v }))} />
            <ToggleRow disabled={!perms.has('automation:manage')}
              label={t('স্বয়ংক্রিয় পেমেন্ট নিশ্চিতকরণ', 'Send payment confirmation automatically')}
              value={automation.paymentConfirmation}
              onChange={v => setAutomation(a => ({ ...a, paymentConfirmation: v }))} />
            <ToggleRow disabled={!perms.has('automation:manage')}
              label={t('স্বয়ংক্রিয় ওয়ারেন্টি অনুস্মারক', 'Send warranty reminder automatically')}
              value={automation.warrantyReminder}
              onChange={v => setAutomation(a => ({ ...a, warrantyReminder: v }))} />
          </div>
          {!perms.has('automation:manage') && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-[11px] text-amber-800">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {t('এই সেটিংস শুধু অ্যাডমিন পরিবর্তন করতে পারেন।', 'Only admins can change these settings.')}
            </div>
          )}
        </section>

        {/* Quiet Hours + Daily Limits */}
        <section className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Moon className="h-4 w-4 text-indigo-500" /> {t('কোয়াইট আওয়ার ও দৈনিক সীমা', 'Quiet Hours & Daily Limits')}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t('কোয়াইট আওয়ারে অটোমেটেড বার্তা সারিতে জমা হবে এবং সময় শেষ হলে স্বয়ংক্রিয়ভাবে পাঠানো হবে।',
               'Automated messages are queued during quiet hours and released automatically when the window ends.')}
          </p>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                {t('কোয়াইট আওয়ার চালু', 'Enable quiet hours')}
              </span>
              <button type="button" disabled={!perms.has('settings:manage')}
                onClick={() => {
                  setQuietHours(q => ({ ...q, enabled: !q.enabled }));
                  pushAudit({ action: 'settings_updated', note: `quiet hours ${!quietHours.enabled ? 'on' : 'off'}` });
                }}
                className={`relative h-5 w-9 rounded-full transition ${quietHours.enabled ? 'bg-indigo-600' : 'bg-slate-300'} ${!perms.has('settings:manage') ? 'cursor-not-allowed opacity-70' : ''}`}
                aria-pressed={quietHours.enabled}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${quietHours.enabled ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">{t('শুরু', 'Start')}</span>
                <input type="time" value={quietHours.start}
                  disabled={!quietHours.enabled || !perms.has('settings:manage')}
                  onChange={e => setQuietHours(q => ({ ...q, start: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:bg-slate-100" />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-600">{t('শেষ', 'End')}</span>
                <input type="time" value={quietHours.end}
                  disabled={!quietHours.enabled || !perms.has('settings:manage')}
                  onChange={e => setQuietHours(q => ({ ...q, end: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:bg-slate-100" />
              </label>
            </div>
            <p className="mt-2 text-[10.5px] text-slate-500">
              {t('ডিফল্ট', 'Default')}: 23:00 → 08:00
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-700">
              <Gauge className="h-3.5 w-3.5 text-rose-500" /> {t('ভূমিকা অনুযায়ী দৈনিক সীমা', 'Daily limits by role')}
              <span className="ml-auto text-[10px] text-slate-500">{t('0 = আনলিমিটেড', '0 = unlimited')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['cashier', 'manager', 'admin'] as const).map(k => (
                <label key={k} className="block">
                  <span className="text-[11px] font-medium capitalize text-slate-600">{k}</span>
                  <input type="number" min={0}
                    disabled={!perms.has('settings:manage')}
                    value={limits[k]}
                    onChange={e => setLimits(l => ({ ...l, [k]: Math.max(0, parseInt(e.target.value || '0', 10)) }))}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:bg-slate-100" />
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Provider Settings */}
        <section className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <SettingsIcon className="h-4 w-4 text-rose-500" /> {t('প্রোভাইডার সেটিংস', 'Provider Settings')}
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">{t('SMS প্রোভাইডার', 'SMS provider')}</span>
              <input value={provider.provider}
                disabled={!perms.has('settings:manage')}
                onChange={e => setProvider(s => ({ ...s, provider: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 disabled:bg-slate-50" />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">{t('প্রেরক ID', 'Sender ID')}</span>
              <input value={provider.senderId} maxLength={11}
                disabled={!perms.has('settings:manage')}
                onChange={e => setProvider(s => ({ ...s, senderId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 disabled:bg-slate-50" />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">{t('API কী', 'API key')}</span>
              <div className="relative mt-1">
                <input value={provider.apiKey}
                  type={showKey ? 'text' : 'password'}
                  disabled={!perms.has('settings:manage')}
                  onChange={e => setProvider(s => ({ ...s, apiKey: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 disabled:bg-slate-50" />
                <button type="button" onClick={() => setShowKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showKey ? t('লুকান', 'Hide') : t('দেখান', 'Show')}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={sendTestMessage}
              disabled={!perms.has('settings:manage')}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60">
              <Send className="h-3.5 w-3.5" /> {t('টেস্ট বার্তা', 'Test message')}
            </button>
            <button onClick={checkBalance}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Wallet className="h-3.5 w-3.5" /> {t('ব্যালেন্স চেক', 'Balance check')}
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{t('বাকি ব্যালেন্স', 'Balance')}</span>
              <span className="font-semibold text-rose-700">{provider.balance} SMS</span>
            </div>
          </div>
        </section>

        {/* Communication Audit Log */}
        <section className="lg:col-span-12 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <ListChecks className="h-4 w-4 text-rose-500" /> {t('কমিউনিকেশন অডিট লগ', 'Communication Audit Log')}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {filteredAudit.length}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2 sm:items-center">
              <select value={aUser} onChange={e => setAUser(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
                <option value="all">{t('সব ব্যবহারকারী', 'All users')}</option>
                {auditUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={aChannel} onChange={e => setAChannel(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
                <option value="all">{t('সব চ্যানেল', 'All channels')}</option>
                {CHANNELS.map(c => <option key={c.id} value={c.id}>{lang === 'bn' ? c.labelBn : c.labelEn}</option>)}
              </select>
              <select value={aStatus} onChange={e => setAStatus(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs">
                <option value="all">{t('সব অ্যাকশন', 'All actions')}</option>
                <option value="send">send</option>
                <option value="retry">retry</option>
                <option value="queue">queue</option>
                <option value="flush">flush</option>
                <option value="limit_block">limit_block</option>
                <option value="template_saved">template_saved</option>
                <option value="template_deleted">template_deleted</option>
                <option value="settings_updated">settings_updated</option>
              </select>
              <input type="date" value={aFrom} onChange={e => setAFrom(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs" />
              <input type="date" value={aTo} onChange={e => setATo(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs" />
              <button onClick={exportAuditCsv}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
          </div>
          <div className="mt-3 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">{t('তারিখ ও সময়', 'Date & time')}</th>
                  <th className="py-2 pr-3">{t('ব্যবহারকারী', 'User')}</th>
                  <th className="py-2 pr-3">{t('অ্যাকশন', 'Action')}</th>
                  <th className="py-2 pr-3">{t('চ্যানেল', 'Channel')}</th>
                  <th className="py-2 pr-3">{t('প্রাপক', 'Recipient')}</th>
                  <th className="py-2 pr-3">{t('টেমপ্লেট', 'Template')}</th>
                  <th className="py-2 pr-3">{t('খরচ', 'Cost')}</th>
                  <th className="py-2 pr-0">{t('ফলাফল', 'Result')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                      {t('কোন লগ নেই।', 'No audit entries yet.')}
                    </td>
                  </tr>
                )}
                {filteredAudit.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-3 text-xs text-slate-600 whitespace-nowrap">{shortDate(a.ts)}</td>
                    <td className="py-2 pr-3 text-xs text-slate-700">
                      <div className="font-medium">{a.actor}</div>
                      <div className="text-[10px] text-slate-500">{a.actorRole}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{a.action}</span>
                    </td>
                    <td className="py-2 pr-3">{a.channel ? <ChannelBadge id={a.channel} /> : <span className="text-[11px] text-slate-400">—</span>}</td>
                    <td className="py-2 pr-3 text-xs text-slate-600">{a.recipient || '—'}</td>
                    <td className="py-2 pr-3 text-xs text-slate-600">{a.templateId || '—'}</td>
                    <td className="py-2 pr-3 text-xs text-slate-600">{a.cost != null ? a.cost.toFixed(2) : '—'}</td>
                    <td className="py-2 pr-0 text-xs text-slate-500">
                      {a.status ? <StatusBadge s={a.status} /> : (a.note || '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Future channels roadmap */}
        <section className="lg:col-span-12 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-slate-500" /> {t('শীঘ্রই আসছে', 'Coming soon')}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CHANNELS.filter(c => !c.active).map(c => {
              const Icon = c.icon;
              return (
                <div key={c.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 opacity-90">
                  <div className="rounded-md bg-slate-100 p-2 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-800">
                        {lang === 'bn' ? c.labelBn : c.labelEn}
                      </span>
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-slate-600">
                        {t('শীঘ্রই', 'Soon')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {c.id === 'whatsapp' && t('ব্যবসায়িক WhatsApp ইনভয়েস, রিসিট ও প্রচার।', 'Business WhatsApp for invoices, receipts & promotions.')}
                      {c.id === 'email' && t('ট্রান্সঅ্যাকশনাল ইমেইল রিসিট, রিপোর্ট ও নিউজলেটার।', 'Transactional email receipts, reports & newsletters.')}
                      {c.id === 'push' && t('অ্যাপ ও ওয়েব পুশ নোটিফিকেশন।', 'Web & app push notifications.')}
                    </p>
                  </div>
                  <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Template editor modal */}
      {editingTpl && tplDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-800">
                {tplDraft.id ? t('টেমপ্লেট সম্পাদনা', 'Edit template') : t('নতুন টেমপ্লেট', 'New template')}
              </h3>
              <button onClick={() => { setEditingTpl(null); setTplDraft(null); }}
                className="rounded p-1 text-slate-400 hover:text-slate-700">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">{t('নাম', 'Name')}</span>
                  <input value={tplDraft.name} onChange={e => setTplDraft({ ...tplDraft, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">{t('চ্যানেল', 'Channel')}</span>
                  <select value={tplDraft.channel}
                    onChange={e => setTplDraft({ ...tplDraft, channel: e.target.value as ChannelId })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                    {CHANNELS.map(c => (
                      <option key={c.id} value={c.id} disabled={!c.active}>
                        {lang === 'bn' ? c.labelBn : c.labelEn}{!c.active ? ' — ' + t('শীঘ্রই', 'Soon') : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">{t('বিভাগ', 'Category')}</span>
                <select value={tplDraft.category}
                  onChange={e => setTplDraft({ ...tplDraft, category: e.target.value as TemplateCategory })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300">
                  <option value="invoice">{t('ইনভয়েস নিশ্চিতকরণ', 'Invoice confirmation')}</option>
                  <option value="due">{t('বকেয়া অনুস্মারক', 'Due reminder')}</option>
                  <option value="payment">{t('পেমেন্ট প্রাপ্তি', 'Payment received')}</option>
                  <option value="warranty">{t('ওয়ারেন্টি অনুস্মারক', 'Warranty notification')}</option>
                  <option value="promo">{t('প্রচারমূলক', 'Promotional')}</option>
                  <option value="custom">{t('কাস্টম', 'Custom')}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">{t('বার্তা', 'Body')}</span>
                <textarea value={tplDraft.body} onChange={e => setTplDraft({ ...tplDraft, body: e.target.value })}
                  rows={5}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300" />
                <span className="mt-1 block text-[11px] text-slate-500">
                  {t('ভেরিয়েবল', 'Variables')}: {SUPPORTED_VARS.map(v => `{${v}}`).join(', ')}
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button onClick={() => { setEditingTpl(null); setTplDraft(null); }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                {t('বাতিল', 'Cancel')}
              </button>
              <button onClick={saveTemplate}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700">
                <Save className="h-3.5 w-3.5" /> {t('সংরক্ষণ', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Top-up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsTopUpOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md">
              <div className="flex items-center gap-2.5">
                <Wallet className="h-5 w-5 p-1 bg-white/20 rounded-lg" />
                <h3 className="text-base font-bold">{t('এসএমএস ব্যালেন্স রিচার্জ ও রিচার্জ প্যাকেজ', 'SMS Balance Top-up Packages')}</h3>
              </div>
              <button onClick={() => setIsTopUpOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer">
                <XIcon size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 font-sans">
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300">{t('বর্তমান উপলব্ধ ব্যালেন্স:', 'Current SMS Balance:')}</div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{provider.balance} <span className="text-xs font-bold">SMS</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold">{t('প্রোভাইডার:', 'Provider:')}</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{provider.provider || 'RonyTelecom SMS Gateway'}</div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-800 dark:text-white pt-1">{t('রিচার্জ প্যাকেজ নির্বাচন করুন:', 'Select Top-Up Package:')}</div>
              
              <div className="space-y-2.5">
                {[
                  { title: t('স্টার্টার প্যাক', 'Starter Pack'), sms: 500, price: '৳১৭৫', rate: '০.৩৫ ৳/SMS', popular: false },
                  { title: t('বিজনেস প্যাক', 'Business Pack'), sms: 2000, price: '৳৬৫০', rate: '০.৩২ ৳/SMS', popular: true },
                  { title: t('এন্টারপ্রাইজ প্যাক', 'Enterprise Pack'), sms: 5000, price: '৳১৫০০', rate: '০.৩০ ৳/SMS', popular: false },
                ].map((pkg, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition hover:border-rose-500 cursor-pointer ${pkg.popular ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{pkg.title}</span>
                        {pkg.popular && <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{t('জনপ্রিয়', 'Popular')}</span>}
                      </div>
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{pkg.sms.toLocaleString()} SMS</div>
                      <div className="text-[10px] text-slate-400 font-bold">{pkg.rate}</div>
                    </div>
                    <button onClick={() => {
                      setProvider(prev => ({ ...prev, balance: prev.balance + pkg.sms }));
                      pushAudit({ action: 'settings_updated', note: `Recharged ${pkg.sms} SMS (${pkg.price})` });
                      showToast?.(t(`সফলভাবে ${pkg.sms} SMS রিচার্জ সম্পন্ন হয়েছে!`, `Successfully recharged ${pkg.sms} SMS!`), 'success');
                      setIsTopUpOpen(false);
                    }} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition">
                      {pkg.price} • {t('রিচার্জ', 'Recharge')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Presentational ─────────────────────────────────────────────────────────
function SummaryCard({
  icon: Icon, label, value, suffix, tone,
}: {
  icon: any; label: string; value: number | string; suffix?: string;
  tone: 'rose' | 'indigo' | 'amber' | 'emerald' | 'blue' | 'purple';
}) {
  const tones = {
    rose: {
      bg: 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-400',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-400',
      iconText: 'text-indigo-600 dark:text-indigo-400',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-800 dark:text-amber-400',
      iconText: 'text-amber-700 dark:text-amber-400',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white dark:from-blue-950/40 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-400',
      iconText: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50/90 via-purple-50/40 to-white dark:from-purple-950/40 dark:via-purple-950/20 dark:to-slate-900 border-purple-200/80 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-400',
      iconText: 'text-purple-600 dark:text-purple-400',
    },
  };
  const currentTone = tones[tone] || tones.indigo;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left select-none ${currentTone.bg}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className={currentTone.iconText}><Icon className="w-5 h-5" /></span>
        </div>
        <span className={`font-bold text-xs sm:text-sm tracking-tight truncate ${currentTone.text}`}>
          {label}
        </span>
      </div>
      <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono truncate">
        {value}{suffix ? <span className="ml-1 text-xs font-bold text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}

function QueueCard({
  icon: Icon, label, value, tone,
}: {
  icon: any; label: string; value: number;
  tone: 'amber' | 'sky' | 'rose' | 'emerald';
}) {
  const map = {
    amber:   { bg: 'bg-amber-50',   fg: 'text-amber-700',   dot: 'bg-amber-500' },
    sky:     { bg: 'bg-sky-50',     fg: 'text-sky-700',     dot: 'bg-sky-500' },
    rose:    { bg: 'bg-rose-50',    fg: 'text-rose-700',    dot: 'bg-rose-500' },
    emerald: { bg: 'bg-emerald-50', fg: 'text-emerald-700', dot: 'bg-emerald-500' },
  }[tone];
  return (
    <div className={`flex items-center justify-between rounded-lg border border-slate-200 p-3 ${map.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md bg-white ${map.fg}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className={`text-[11px] font-medium ${map.fg}`}>{label}</div>
          <div className="text-lg font-bold text-slate-800 leading-tight">{value}</div>
        </div>
      </div>
      <span className={`h-2 w-2 rounded-full ${map.dot} ${value > 0 ? 'animate-pulse' : 'opacity-40'}`} />
    </div>
  );
}

function MiniStat({
  icon: Icon, label, value, tone,
}: {
  icon: any; label: string; value: number | string;
  tone: 'rose' | 'emerald' | 'amber' | 'indigo';
}) {
  const map = {
    rose:    'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    indigo:  'bg-indigo-50 text-indigo-700',
  }[tone];
  return (
    <div className={`flex items-center gap-2 rounded-lg p-2 ${map}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10.5px] font-medium leading-tight opacity-80">{label}</div>
        <div className="text-sm font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

function ToggleRow({
  label, value, onChange, disabled,
}: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 ${disabled ? 'opacity-70' : ''}`}>
      <span className="text-sm text-slate-700">{label}</span>
      <button type="button" disabled={disabled} onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition ${value ? 'bg-rose-600' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed' : ''}`}
        aria-pressed={value}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

