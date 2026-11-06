// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  subscribeItems,
  retryItem,
  retryAllFailed,
  removeItem,
  clearSucceeded,
  flushQueue,
  getItems,
  type SyncItem,
} from '../salesSyncQueue';

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: 'bn' | 'en';
}

const STATUS_STYLES: Record<string, string> = {
  queued: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  syncing: 'bg-blue-500/15 text-blue-300 border-blue-500/30 motion-safe:animate-pulse motion-reduce:ring-2 motion-reduce:ring-blue-500/40',
  succeeded: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const STATUS_LABEL_BN: Record<string, string> = {
  queued: 'অপেক্ষমাণ',
  syncing: 'সিঙ্ক হচ্ছে',
  succeeded: 'সফল',
  failed: 'ব্যর্থ',
};

export default function SyncStatusPanel({ open, onClose, lang = 'en' }: Props) {
  const [items, setItems] = useState<SyncItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'queued' | 'syncing' | 'succeeded' | 'failed'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showStack, setShowStack] = useState<Record<string, boolean>>({});

  const [online, setOnline] = useState<boolean>(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  type RefreshEntry = {
    at: number;
    trigger: 'manual' | 'auto' | 'online' | 'open';
    online: boolean;
    counts: { queued: number; syncing: number; succeeded: number; failed: number };
    synced?: number;
    error?: string;
  };
  const HISTORY_LIMIT = 20;
  const HISTORY_KEY = 'pos_sync_refresh_history_v1';

  const [refreshHistory, setRefreshHistory] = useState<RefreshEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
    } catch { return []; }
  });

  type HistoryFilter = 'all' | 'queued' | 'syncing' | 'failed' | 'succeeded' | 'errors';
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  const persistHistory = (next: RefreshEntry[]) => {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
  };

  const pushHistory = (entry: RefreshEntry) => {
    setRefreshHistory(h => {
      const next = [entry, ...h].slice(0, HISTORY_LIMIT);
      persistHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setRefreshHistory([]);
    try { window.localStorage.removeItem(HISTORY_KEY); } catch {}
  };

  const summarize = (its: any[]) => ({
    queued: its.filter(i => i.status === 'queued').length,
    syncing: its.filter(i => i.status === 'syncing').length,
    succeeded: its.filter(i => i.status === 'succeeded').length,
    failed: its.filter(i => i.status === 'failed').length,
  });

  const doRefresh = async (trigger: RefreshEntry['trigger']) => {
    setRefreshing(true);
    let synced: number | undefined;
    let error: string | undefined;
    try {
      setItems(getItems());
      const res = await flushQueue();
      synced = res?.synced;
      const now = getItems();
      setItems(now);
      pushHistory({
        at: Date.now(),
        trigger,
        online: typeof navigator === 'undefined' ? true : navigator.onLine,
        counts: summarize(now),
        synced,
      });
    } catch (e: any) {
      error = e?.message || String(e);
      pushHistory({
        at: Date.now(),
        trigger,
        online: typeof navigator === 'undefined' ? true : navigator.onLine,
        counts: summarize(getItems()),
        error,
      });
    } finally {
      setLastRefreshedAt(Date.now());
      setRefreshing(false);
    }
  };

  const refreshNow = () => doRefresh('manual');

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeItems((its) => { setItems(its); setLastRefreshedAt(Date.now()); });

    const handleOnline = () => { setOnline(true); void doRefresh('online'); };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = window.setInterval(() => { void doRefresh('auto'); }, 15_000);
    void doRefresh('open');

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(interval);
    };
  }, [open]);

  if (!open) return null;

  const L = (bn: string, en: string) => (lang === 'bn' ? bn : en);
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  const fmtTime = (t: number) => new Date(t).toLocaleTimeString(locale);
  const fmtDateTime = (t: number) => new Date(t).toLocaleString(locale);
  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  const counts = {
    all: items.length,
    queued: items.filter(i => i.status === 'queued').length,
    syncing: items.filter(i => i.status === 'syncing').length,
    succeeded: items.filter(i => i.status === 'succeeded').length,
    failed: items.filter(i => i.status === 'failed').length,
  };

  return (
    <div
      className="fixed inset-0 z-[9997] bg-black/60 flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={L('সিঙ্ক স্ট্যাটাস প্যানেল', 'Sync status panel')}
        tabIndex={-1}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {L('সিঙ্ক স্ট্যাটাস', 'Sync Status')}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  online
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-300 border-red-500/30'
                }`}
                title={online ? 'Online — auto-refresh active' : 'Offline'}
              >
                {online ? L('অনলাইন', 'Online') : L('অফলাইন', 'Offline')}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {L('বিক্রয় ও স্টক আপডেট সিঙ্কের অবস্থা', 'Sales & stock update sync status')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={L('প্যানেল বন্ধ করুন', 'Close panel')}
            className="text-slate-400 hover:text-white text-2xl leading-none px-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
          >×</button>
        </div>

        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-700 bg-slate-900/60">
          {(['all', 'queued', 'syncing', 'failed', 'succeeded'] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                filter === k
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {k === 'all'
                ? L('সব', 'All')
                : lang === 'bn'
                ? STATUS_LABEL_BN[k]
                : k.charAt(0).toUpperCase() + k.slice(1)}
              {' '}({counts[k]})
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => { void refreshNow(); }}
            disabled={refreshing}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:opacity-60 flex items-center gap-1"
            title={L('ম্যানুয়ালি রিফ্রেশ করুন', 'Manually refresh')}
          >
            <span className={refreshing ? 'inline-block animate-spin' : 'inline-block'}>⟳</span>
            {refreshing ? L('রিফ্রেশ হচ্ছে…', 'Refreshing…') : L('রিফ্রেশ', 'Refresh')}
          </button>
          <button
            onClick={() => flushQueue()}
            className="text-xs px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            {L('এখন সিঙ্ক', 'Sync now')}
          </button>
          {counts.failed > 0 && (
            <button
              onClick={() => retryAllFailed()}
              className="text-xs px-2.5 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-white"
            >
              {L('সব ব্যর্থ রিট্রাই', 'Retry all failed')}
            </button>
          )}
          {counts.succeeded > 0 && (
            <button
              onClick={() => clearSucceeded()}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200"
            >
              {L('সফল মুছুন', 'Clear succeeded')}
            </button>
          )}
        </div>

        <div className="px-3 py-1.5 border-b border-slate-700/60 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {L('সর্বশেষ আপডেট', 'Last updated')}: {fmtDateTime(lastRefreshedAt)}
          </span>
          <span className="text-slate-500">
            {online
              ? L('প্রতি ১৫ সেকেন্ডে অটো-রিফ্রেশ', 'Auto-refresh every 15s')
              : L('অফলাইন — অটো-রিফ্রেশ পজড', 'Offline — auto-refresh paused')}
          </span>
        </div>


        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sorted.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-10">
              {L('কোন আইটেম নেই', 'No items')}
            </div>
          )}
          {sorted.map(item => (
            <div
              key={item.id}
              className="bg-slate-800/70 border border-slate-700 rounded-lg p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    STATUS_STYLES[item.status] || ''
                  }`}
                >
                  {lang === 'bn' ? STATUS_LABEL_BN[item.status] : item.status}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                  {item.kind === 'sale' ? L('বিক্রয়', 'sale') : L('স্টক', 'stock')}
                </span>
                <span className="text-sm text-white font-medium truncate">{item.label}</span>
                <span className="ml-auto text-[10px] text-slate-500">
                  {fmtTime(item.updatedAt)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5">
                <span>{L('চেষ্টা', 'attempts')}: {item.attempts}</span>
                <span>{L('কিউ', 'queued')}: {fmtDateTime(item.queuedAt)}</span>
                <span>
                  {L('শেষ চেষ্টা', 'last attempt')}:{' '}
                  {item.lastAttemptAt
                    ? fmtDateTime(item.lastAttemptAt)
                    : L('—', '—')}
                </span>
                <span className="font-mono text-slate-500 break-all">ref: {item.refId}</span>
              </div>
              {item.error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 mt-1 break-words"
                >
                  <div className="text-[10px] uppercase font-bold text-red-200/80 mb-0.5">
                    {L('ত্রুটি', 'Error')}
                  </div>
                  <div className="font-semibold">
                    <span className="sr-only">
                      {L(`${item.kind === 'sale' ? 'বিক্রয়' : 'স্টক'} ${item.label} সিঙ্ক ব্যর্থ: `,
                         `${item.kind === 'sale' ? 'Sale' : 'Stock'} ${item.label} failed to sync: `)}
                    </span>
                    {item.error}
                  </div>
                  {item.errorStack && (
                    <>
                      <button
                        onClick={() =>
                          setShowStack(s => ({ ...s, [item.id]: !s[item.id] }))
                        }
                        className="text-[10px] text-red-200/80 underline mt-0.5"
                      >
                        {showStack[item.id]
                          ? L('স্ট্যাক লুকান', 'Hide stack')
                          : L('স্ট্যাক দেখান', 'Show stack')}
                      </button>
                      {showStack[item.id] && (
                        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[10px] text-red-200/90 bg-black/30 rounded p-2">
{item.errorStack}
                        </pre>
                      )}
                    </>
                  )}
                </div>
              )}
              {item.history && item.history.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() =>
                      setExpanded(s => ({ ...s, [item.id]: !s[item.id] }))
                    }
                    className="text-[10px] text-slate-300 hover:text-white underline"
                  >
                    {expanded[item.id]
                      ? L('ইতিহাস লুকান', 'Hide history')
                      : L(`ইতিহাস দেখান (${item.history.length})`, `Show history (${item.history.length})`)}
                  </button>
                  {expanded[item.id] && (
                    <ul className="mt-1 space-y-1 border-l border-slate-700 pl-2">
                      {[...item.history].reverse().map((h, idx) => (
                        <li
                          key={idx}
                          className="text-[10px] text-slate-300 flex flex-col gap-0.5"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[9px] uppercase font-bold ${
                                STATUS_STYLES[h.status] || ''
                              }`}
                            >
                              {lang === 'bn' ? STATUS_LABEL_BN[h.status] || h.status : h.status}
                            </span>
                            <span className="text-slate-400">
                              {fmtDateTime(h.at)}
                            </span>
                            {typeof h.durationMs === 'number' && (
                              <span className="text-slate-500">
                                {h.durationMs}ms
                              </span>
                            )}
                          </div>
                          {h.error && (
                            <div className="text-red-300/90 break-words">{h.error}</div>
                          )}
                          {h.errorStack && (
                            <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-red-200/70 bg-black/20 rounded p-1">
{h.errorStack}
                            </pre>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="flex gap-2 mt-1">
                {(item.status === 'failed' || item.status === 'queued') && (
                  <button
                    onClick={() => retryItem(item.id)}
                    className="text-[11px] px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    {L('রিট্রাই', 'Retry')}
                  </button>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  {L('মুছুন', 'Remove')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent refresh attempts */}
        <div className="border-t border-slate-700 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {L('সাম্প্রতিক রিফ্রেশ', 'Recent refreshes')}
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="refresh-filter" className="sr-only">
                {L('স্ট্যাটাস অনুযায়ী ফিল্টার', 'Filter by status')}
              </label>
              <select
                id="refresh-filter"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as HistoryFilter)}
                className="text-[11px] bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
                aria-label={L('স্ট্যাটাস অনুযায়ী ফিল্টার', 'Filter by status')}
              >
                <option value="all">{L('সব', 'All')}</option>
                <option value="queued">{L('অপেক্ষমাণ থাকলে', 'Has queued')}</option>
                <option value="syncing">{L('সিঙ্ক হচ্ছে থাকলে', 'Has syncing')}</option>
                <option value="failed">{L('ব্যর্থ থাকলে', 'Has failed')}</option>
                <option value="succeeded">{L('সফল থাকলে', 'Has succeeded')}</option>
                <option value="errors">{L('শুধু ত্রুটি', 'Errors only')}</option>
              </select>
              {refreshHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
                  aria-label={L('হিস্টোরি মুছুন', 'Clear history')}
                >
                  {L('মুছুন', 'Clear')}
                </button>
              )}
              <span className="text-[10px] text-slate-500">
                {L(`সর্বশেষ ${refreshHistory.length}টি`, `latest ${refreshHistory.length}`)}
              </span>
            </div>
          </div>
          {(() => {
            const matches = (h: RefreshEntry) => {
              switch (historyFilter) {
                case 'all': return true;
                case 'errors': return !!h.error;
                default: return (h.counts[historyFilter] || 0) > 0;
              }
            };
            const shown = refreshHistory.filter(matches);
            if (refreshHistory.length === 0) {
              return (
                <p className="text-[11px] text-slate-500">
                  {L('এখনো কোনো রিফ্রেশ হয়নি।', 'No refresh attempts yet.')}
                </p>
              );
            }
            if (shown.length === 0) {
              return (
                <p className="text-[11px] text-slate-500">
                  {L('এই ফিল্টারে কোনো এন্ট্রি নেই।', 'No entries match this filter.')}
                </p>
              );
            }
            return (
              <ul
                className="max-h-40 overflow-y-auto space-y-1"
                aria-label={L('সাম্প্রতিক রিফ্রেশ চেষ্টার তালিকা', 'Recent refresh attempts')}
              >
                {shown.map((h, i) => {
                  const triggerLabel = {
                    manual: L('ম্যানুয়াল', 'Manual'),
                    auto: L('অটো', 'Auto'),
                    online: L('অনলাইন ফিরেছে', 'Back online'),
                    open: L('প্যানেল খোলা', 'Panel open'),
                  }[h.trigger];
                  return (
                  <li
                    key={h.at + '_' + i}
                    className="text-[11px] text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded px-2 py-1 flex flex-wrap items-center gap-x-2 gap-y-0.5"
                  >
                    <span className="text-slate-400 font-mono">{fmtTime(h.at)}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-200">
                      {triggerLabel}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${h.online ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                      {h.online ? L('অনলাইন', 'online') : L('অফলাইন', 'offline')}
                    </span>
                    {typeof h.synced === 'number' && h.synced > 0 && (
                      <span className="text-emerald-300">
                        +{h.synced} {L('সিঙ্ক', 'synced')}
                      </span>
                    )}
                    <span className="text-slate-400">
                      Q:{h.counts.queued} · S:{h.counts.syncing} · F:{h.counts.failed} · ✓:{h.counts.succeeded}
                    </span>
                    {h.error && (
                      <span className="text-red-300 break-all" role="alert">
                        {L('ত্রুটি', 'error')}: {h.error}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
