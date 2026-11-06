// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Search, Download, Trash2, X, Filter,
  Check, AlertCircle, RefreshCw, Package, Edit2, Tag,
  ShieldCheck, History, Clock, User, Monitor, ChevronDown
} from 'lucide-react';

import {
  loadAudit,
  clearAudit,
  exportAuditCsv,
  type AuditEntry,
  type AuditAction,
} from '../lib/auditLog';

interface AuditLogViewerProps {
  lang?: 'bn' | 'en';
  showToast?: (msg: string, type?: string) => void;
}

const ACTION_CONFIG: Record<AuditAction, { label: string; labelBn: string; icon: any; color: string; bg: string }> = {
  product_created: { label: 'Product Created', labelBn: 'পণ্য যোগ', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  product_updated: { label: 'Product Updated', labelBn: 'পণ্য আপডেট', icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100' },
  product_deleted: { label: 'Product Deleted', labelBn: 'পণ্য মুছে গেছে', icon: Trash2, color: 'text-rose-600', bg: 'bg-rose-100' },
  stock_change:    { label: 'Stock Change', labelBn: 'স্টক পরিবর্তন', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  price_change:    { label: 'Price Change', labelBn: 'মূল্য পরিবর্তন', icon: Tag, color: 'text-amber-600', bg: 'bg-amber-100' },
  warranty_claim:  { label: 'Warranty Claim', labelBn: 'ওয়ারেন্টি দাবি', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
  serial_update:   { label: 'Serial Update', labelBn: 'সিরিয়াল আপডেট', icon: History, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  batch_change:    { label: 'Batch Change', labelBn: 'ব্যাচ পরিবর্তন', icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
};

const DEMO_ENTRIES: AuditEntry[] = [
  { id: 'audit_001', at: new Date(Date.now() - 3600000).toISOString(), action: 'product_created', entityId: 'IT020027', entityName: 'XIAOMI REDMI NOTE 13', userName: 'admin', device: 'Desktop · Windows · Chrome', details: 'পণ্য নতুন যোগ করা হয়েছে — স্টক: 39, মূল্য: ৳3834' },
  { id: 'audit_002', at: new Date(Date.now() - 7200000).toISOString(), action: 'stock_change', entityId: 'IT020025', entityName: 'FLYX MAX 2', userName: 'rakib', device: 'Desktop · Windows · Chrome', details: 'স্টক আপডেট: 50 → 63 (+13 পিস)' },
  { id: 'audit_003', at: new Date(Date.now() - 14400000).toISOString(), action: 'price_change', entityId: 'IT020024', entityName: 'JONAKI POWER MICRO CHARGE', userName: 'admin', device: 'Mobile · Android · Chrome', details: 'ক্রয় মূল্য পরিবর্তন: ৳80 → ৳75 (-6.25%)' },
  { id: 'audit_004', at: new Date(Date.now() - 86400000).toISOString(), action: 'product_updated', entityId: 'IT020023', entityName: '18W EXTREME QUICK CHARGER', userName: 'admin', device: 'Desktop · Windows · Chrome', details: 'পণ্যের বিবরণ আপডেট করা হয়েছে' },
  { id: 'audit_005', at: new Date(Date.now() - 172800000).toISOString(), action: 'warranty_claim', entityId: 'WR-003', entityName: '18W EXTREME QUICK CHARGER', userName: 'rakib', device: 'Desktop · Windows · Chrome', details: 'ওয়ারেন্টি দাবি গ্রহণ করা হয়েছে — গ্রাহক: Tanvir Rahman' },
  { id: 'audit_006', at: new Date(Date.now() - 259200000).toISOString(), action: 'batch_change', entityId: 'BT-002', entityName: 'JONAKI POWER MICRO CHARGE', userName: 'admin', device: 'Desktop · Windows · Edge', details: 'নতুন ব্যাচ যোগ: BAT-2026-05-B, মেয়াদ: 2026-08-10' },
  { id: 'audit_007', at: new Date(Date.now() - 345600000).toISOString(), action: 'product_deleted', entityId: 'OLD-001', entityName: 'Discontinued Item', userName: 'admin', device: 'Desktop · Windows · Chrome', details: 'পণ্য মুছে ফেলা হয়েছে (স্টক: 0)' },
  { id: 'audit_008', at: new Date(Date.now() - 432000000).toISOString(), action: 'serial_update', entityId: 'WR-001', entityName: 'XIAOMI REDMI NOTE 13', userName: 'admin', device: 'Mobile · iOS · Safari', details: 'সিরিয়াল নম্বর আপডেট: XR13-DH-20240510-001' },
];

export const AuditLogViewer = ({
  lang = 'bn',
  showToast,
}: AuditLogViewerProps) => {
  const isBn = lang === 'bn';

  // Load from localStorage via lib, fallback to demo
  const [entries, setEntries] = useState<AuditEntry[]>(() => {
    const stored = loadAudit();
    return stored.length > 0 ? stored : DEMO_ENTRIES;
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const perPage = 15;

  const [localToast, setLocalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (showToast) { showToast(msg, type); return; }
    setLocalToast({ msg, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  const allUsers = useMemo(() => [...new Set(entries.map(e => e.userName || 'System').filter(Boolean))], [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q || (e.entityName || '').toLowerCase().includes(q) || (e.details || '').toLowerCase().includes(q) || (e.userName || '').toLowerCase().includes(q);
      const matchAction = actionFilter === 'all' || e.action === actionFilter;
      const matchUser = userFilter === 'all' || e.userName === userFilter;
      const d = e.at.slice(0, 10);
      const matchFrom = !dateFrom || d >= dateFrom;
      const matchTo = !dateTo || d <= dateTo;
      return matchSearch && matchAction && matchUser && matchFrom && matchTo;
    }).sort((a, b) => b.at.localeCompare(a.at));
  }, [entries, search, actionFilter, userFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: entries.length,
      today: entries.filter(e => e.at.slice(0, 10) === today).length,
      users: new Set(entries.map(e => e.userName)).size,
      actions: new Set(entries.map(e => e.action)).size,
    };
  }, [entries]);

  const handleExportCSV = () => {
    const csv = exportAuditCsv(filtered);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast(isBn ? 'অডিট লগ ডাউনলোড হচ্ছে...' : 'Downloading audit log...');
  };

  const handleClear = () => {
    clearAudit();
    setEntries([]);
    setConfirmClear(false);
    toast(isBn ? 'অডিট লগ পরিষ্কার করা হয়েছে' : 'Audit log cleared');
  };

  const handleRefresh = () => {
    const stored = loadAudit();
    setEntries(stored.length > 0 ? stored : DEMO_ENTRIES);
    toast(isBn ? 'লগ রিফ্রেশ হয়েছে' : 'Log refreshed');
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMin / 60);
      const diffD = Math.floor(diffH / 24);
      if (diffMin < 1) return isBn ? 'এইমাত্র' : 'Just now';
      if (diffMin < 60) return `${diffMin}${isBn ? ' মিনিট আগে' : 'm ago'}`;
      if (diffH < 24) return `${diffH}${isBn ? ' ঘন্টা আগে' : 'h ago'}`;
      if (diffD < 7) return `${diffD}${isBn ? ' দিন আগে' : 'd ago'}`;
      return d.toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return isoStr; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/50 p-4 sm:p-6">
      {localToast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${localToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {localToast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {localToast.msg}
        </div>
      )}

      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              <ClipboardList size={24} className="text-slate-500" />
              {isBn ? 'অডিট লগ ভিউয়ার' : 'Audit Log Viewer'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isBn ? 'পণ্য পরিবর্তনের সম্পূর্ণ অডিট ট্রেইল' : 'Complete audit trail of item-module changes'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
              <RefreshCw size={12} /> {isBn ? 'রিফ্রেশ' : 'Refresh'}
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Download size={12} /> CSV
            </button>
            <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50">
              <Trash2 size={12} /> {isBn ? 'পরিষ্কার' : 'Clear'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isBn ? 'মোট রেকর্ড' : 'Total Entries', value: stats.total, icon: ClipboardList, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: isBn ? 'আজকের লগ' : "Today's Logs", value: stats.today, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: isBn ? 'ব্যবহারকারী' : 'Users', value: stats.users, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: isBn ? 'অ্যাকশনের ধরন' : 'Action Types', value: stats.actions, icon: Monitor, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm flex items-center gap-3`}>
              <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={isBn ? 'পণ্য, ব্যবহারকারী বা বিবরণ খুঁজুন...' : 'Search entity, user or details...'}
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-slate-700 text-white border-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <Filter size={14} /> {isBn ? 'ফিল্টার' : 'Filter'}
              <ChevronDown size={12} className={showFilters ? 'rotate-180' : ''} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'অ্যাকশন' : 'Action'}</label>
                <select value={actionFilter} onChange={e => { setActionFilter(e.target.value as any); setPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50">
                  <option value="all">{isBn ? 'সব' : 'All'}</option>
                  {Object.entries(ACTION_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{isBn ? v.labelBn : v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'ব্যবহারকারী' : 'User'}</label>
                <select value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50">
                  <option value="all">{isBn ? 'সব' : 'All'}</option>
                  {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'তারিখ থেকে' : 'From Date'}</label>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{isBn ? 'তারিখ পর্যন্ত' : 'To Date'}</label>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-gray-50" />
              </div>
            </div>
          )}
        </div>

        {/* Log Entries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {paged.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm font-medium">{isBn ? 'কোনো অডিট লগ পাওয়া যায়নি' : 'No audit entries found'}</p>
              <p className="text-gray-300 text-xs mt-1">{isBn ? 'পণ্য পরিবর্তন করলে এখানে লগ দেখাবে' : 'Logs will appear when item changes are made'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paged.map((entry, i) => {
                const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG['product_updated'];
                const ActionIcon = cfg.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <ActionIcon size={15} className={cfg.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${cfg.bg} ${cfg.color} mb-1`}>
                            {isBn ? cfg.labelBn : cfg.label}
                          </span>
                          <p className="text-sm font-semibold text-gray-800">{entry.entityName || '—'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{entry.details || '—'}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(entry.at)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {entry.userName && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <User size={9} /> {entry.userName}
                          </span>
                        )}
                        {entry.device && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Monitor size={9} /> {entry.device}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-400">
                {isBn ? `মোট ${filtered.length} টি রেকর্ড` : `${filtered.length} total entries`}
              </span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white font-medium">←</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === p ? 'bg-slate-700 text-white' : 'border border-gray-200 hover:bg-white text-gray-600'}`}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white font-medium">→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Clear Modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmClear(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{isBn ? 'সব লগ মুছুন?' : 'Clear All Logs?'}</h3>
              <p className="text-gray-500 text-sm mt-1">{isBn ? 'এই কাজটি আর ফেরানো যাবে না। সব অডিট রেকর্ড মুছে যাবে।' : 'This cannot be undone. All audit records will be deleted.'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">{isBn ? 'বাতিল' : 'Cancel'}</button>
              <button onClick={handleClear} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600">{isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Clear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
