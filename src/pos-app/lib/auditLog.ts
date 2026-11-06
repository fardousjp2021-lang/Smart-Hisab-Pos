// @ts-nocheck
// Item-module audit log. LocalStorage-backed, offline-safe.
// Does not modify Firestore collections, rules, or existing business logic.

export type AuditAction =
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'stock_change'
  | 'price_change'
  | 'warranty_claim'
  | 'serial_update'
  | 'batch_change';

export interface AuditEntry {
  id: string;
  at: string;           // ISO timestamp
  action: AuditAction;
  entityId?: string;    // product / batch / serial id
  entityName?: string;
  userName?: string;
  device?: string;
  details?: string;     // human-readable summary
  meta?: Record<string, any>;
}

const KEY = 'roni_item_audit_log_v1';
const MAX_ENTRIES = 5000;

function detectDevice(): string {
  try {
    if (typeof navigator === 'undefined') return 'server';
    const ua = navigator.userAgent || '';
    let os = 'Unknown OS';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    let br = 'Browser';
    if (/Edg\//.test(ua)) br = 'Edge';
    else if (/Chrome\//.test(ua)) br = 'Chrome';
    else if (/Firefox\//.test(ua)) br = 'Firefox';
    else if (/Safari\//.test(ua)) br = 'Safari';
    const kind = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
    return `${kind} · ${os} · ${br}`;
  } catch { return 'Unknown'; }
}

function currentUserName(): string {
  try {
    const keys = ['roni_current_user', 'currentUser', 'pos_current_user'];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj && (obj.name || obj.displayName || obj.email)) {
          return obj.name || obj.displayName || obj.email;
        }
      } catch {
        if (raw && raw.length < 60) return raw;
      }
    }
  } catch {}
  return 'System';
}

export function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function persist(list: AuditEntry[]) {
  try {
    const trimmed = list.slice(-MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
}

export function logAudit(
  action: AuditAction,
  opts: Partial<Omit<AuditEntry, 'id' | 'at' | 'action'>> = {},
): AuditEntry {
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    action,
    userName: opts.userName || currentUserName(),
    device: opts.device || detectDevice(),
    entityId: opts.entityId,
    entityName: opts.entityName,
    details: opts.details,
    meta: opts.meta,
  };
  const list = loadAudit();
  list.push(entry);
  persist(list);
  return entry;
}

export function clearAudit() { persist([]); }

export function exportAuditCsv(entries: AuditEntry[]): string {
  const header = ['Timestamp', 'Action', 'User', 'Device', 'Entity', 'Details'];
  const rows = entries.map(e => [
    e.at,
    e.action,
    e.userName || '',
    e.device || '',
    e.entityName || e.entityId || '',
    (e.details || '').replace(/\r?\n/g, ' '),
  ]);
  return [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
