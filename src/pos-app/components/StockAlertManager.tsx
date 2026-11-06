// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle, Bell, BellOff, Search, Package,
  TrendingDown, Edit2, Check, X, AlertCircle, ChevronDown,
  Archive, RefreshCw, Filter, Printer, ShoppingBag, ArrowUpRight
} from 'lucide-react';

interface StockAlertManagerProps {
  lang?: 'bn' | 'en';
  products?: any[];
  showToast?: (msg: string, type?: string) => void;
  onReorder?: (product: any) => void;
  embedded?: boolean;
}

const SEVERITY_CONFIG = {
  out: { 
    label: 'স্টক শেষ', 
    labelEn: 'Out of Stock', 
    badgeCls: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50', 
    barCls: 'bg-rose-500', 
    dotCls: 'bg-rose-500 animate-pulse' 
  },
  low: { 
    label: 'স্বল্প স্টক', 
    labelEn: 'Low Stock', 
    badgeCls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', 
    barCls: 'bg-amber-500', 
    dotCls: 'bg-amber-500' 
  },
  ok: { 
    label: 'পর্যাপ্ত', 
    labelEn: 'In Stock', 
    badgeCls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50', 
    barCls: 'bg-emerald-500', 
    dotCls: 'bg-emerald-500' 
  },
};

function getSeverity(stock: number, alertQty: number): 'out' | 'low' | 'ok' {
  if (stock <= 0) return 'out';
  if (stock <= alertQty) return 'low';
  return 'ok';
}

const DEFAULT_ALERT_SETTINGS: Record<string, { alertQty: number; muted: boolean }> = {};

export const StockAlertManager = ({
  lang = 'bn',
  products = [],
  showToast: externalToast,
  onReorder,
  embedded = false,
}: StockAlertManagerProps) => {
  const isBn = lang === 'bn';

  const [alertSettings, setAlertSettings] = useState<Record<string, { alertQty: number; muted: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('roni_stock_alerts_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ALERT_SETTINGS;
  });

  useEffect(() => {
    try { localStorage.setItem('roni_stock_alerts_v1', JSON.stringify(alertSettings)); } catch {}
  }, [alertSettings]);

  const [localToast, setLocalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (externalToast) { externalToast(msg, type); return; }
    setLocalToast({ msg, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'out' | 'low' | 'ok'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [showMuted, setShowMuted] = useState(false);

  const productsWithAlerts = useMemo(() => {
    return products.map((p: any) => {
      const settings = alertSettings[p.id];
      const alertQty = settings?.alertQty ?? p.alertQty ?? 5;
      const muted = settings?.muted ?? false;
      const severity = getSeverity(p.stock ?? 0, alertQty);
      return { ...p, alertQty, muted, severity };
    });
  }, [products, alertSettings]);

  const filtered = useMemo(() => {
    return productsWithAlerts.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
      const matchFilter = filter === 'all' || p.severity === filter;
      const matchMuted = showMuted || !p.muted;
      return matchSearch && matchFilter && matchMuted;
    });
  }, [productsWithAlerts, search, filter, showMuted]);

  const stats = useMemo(() => ({
    out: productsWithAlerts.filter(p => p.severity === 'out').length,
    low: productsWithAlerts.filter(p => p.severity === 'low').length,
    ok: productsWithAlerts.filter(p => p.severity === 'ok').length,
    muted: productsWithAlerts.filter(p => p.muted).length,
  }), [productsWithAlerts]);

  const saveAlertQty = (productId: string) => {
    const qty = Number(editQty);
    if (isNaN(qty) || qty < 0) { showToast(isBn ? 'সঠিক সংখ্যা লিখুন' : 'Enter valid number', 'error'); return; }
    setAlertSettings(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] || { muted: false }), alertQty: qty }
    }));
    showToast(isBn ? 'অ্যালার্ট সীমা আপডেট করা হয়েছে' : 'Alert threshold updated');
    setEditingId(null);
  };

  const toggleMute = (productId: string) => {
    setAlertSettings(prev => {
      const current = prev[productId] || { alertQty: 5, muted: false };
      return { ...prev, [productId]: { ...current, muted: !current.muted } };
    });
    const p = productsWithAlerts.find(x => x.id === productId);
    showToast(isBn ? `"${p?.name}" ${!p?.muted ? 'নিরব' : 'সক্রিয়'} করা হয়েছে` : `Alert ${p?.muted ? 'unmuted' : 'muted'}`);
  };

  const resetAlerts = () => {
    setAlertSettings({});
    showToast(isBn ? 'সব অ্যালার্ট রিসেট হয়েছে' : 'All alerts reset');
  };

  const handlePrintReorderList = () => {
    window.print();
  };

  const handleReorderClick = (product: any) => {
    if (onReorder) {
      onReorder(product);
    } else {
      showToast(isBn ? `"${product.name}" এর জন্য ক্রয় অর্ডার রেডি করা হচ্ছে...` : `Preparing purchase order for "${product.name}"...`, 'success');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in text-left font-sans">
      {localToast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${localToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {localToast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {localToast.msg}
        </div>
      )}

      {/* Header Row (Hidden if Embedded inside StockCenter) */}
      {!embedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 dark:text-white text-lg sm:text-xl tracking-tight">
                {isBn ? 'স্টক অ্যালার্ট ম্যানেজার' : 'Stock Alert Manager'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {isBn ? 'স্বল্প ও শেষ হওয়া স্টকের ওপর নজর রাখুন এবং দ্রুত স্টক রিকুইজিশন তৈরি করুন' : 'Monitor low and out-of-stock products and generate purchase orders'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto print:hidden">
            <button 
              onClick={handlePrintReorderList}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer size={14} /> {isBn ? 'ক্রয় তালিকা প্রিন্ট' : 'Print Purchase List'}
            </button>
            
            <button 
              onClick={resetAlerts}
              className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw size={14} /> {isBn ? 'অ্যালার্ট রিসেট' : 'Reset Alerts'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary Cards (Hidden if Embedded inside StockCenter) */}
      {!embedded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400 block">{stats.out}</span>
              <span className="text-xs font-extrabold text-rose-800 dark:text-rose-300 mt-0.5 block">{isBn ? 'স্টক শেষ' : 'Out of Stock'}</span>
            </div>
            <span className="text-2xl p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl">🔴</span>
          </div>

          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 block">{stats.low}</span>
              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 mt-0.5 block">{isBn ? 'স্বল্প স্টক' : 'Low Stock'}</span>
            </div>
            <span className="text-2xl p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">⚠️</span>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 block">{stats.ok}</span>
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mt-0.5 block">{isBn ? 'পর্যাপ্ত স্টক' : 'In Stock'}</span>
            </div>
            <span className="text-2xl p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">✅</span>
          </div>

          <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 block">{stats.muted}</span>
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 block">{isBn ? 'নিরব করা' : 'Muted Alerts'}</span>
            </div>
            <span className="text-2xl p-2 bg-slate-200 dark:bg-slate-700 rounded-xl">🔕</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={isBn ? 'পণ্য, SKU বা ক্যাটাগরি খুঁজুন...' : 'Search product, SKU or category...'}
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {(['all', 'out', 'low', 'ok'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filter === f 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? (isBn ? 'সব' : 'All') : isBn ? SEVERITY_CONFIG[f].label : SEVERITY_CONFIG[f].labelEn}
              </button>
            ))}
            <button 
              onClick={() => setShowMuted(p => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                showMuted 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {showMuted ? <Bell size={11} /> : <BellOff size={11} />}
              {isBn ? 'নিরবসমূহ' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width High-Density Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">{isBn ? "পণ্যের নাম ও ক্যাটাগরি" : "Product & Category"}</th>
                <th className="py-3.5 px-4 text-center">{isBn ? "বর্তমান স্টক" : "Current Stock"}</th>
                <th className="py-3.5 px-4 text-center">{isBn ? "অ্যালার্ট সীমা" : "Alert Limit"}</th>
                <th className="py-3.5 px-4 text-center">{isBn ? "স্টক অবস্থা" : "Stock Status"}</th>
                <th className="py-3.5 px-4 text-center print:hidden">{isBn ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    <AlertTriangle size={32} className="mx-auto text-slate-300 mb-2" />
                    {isBn ? 'কোনো অ্যালার্টের পণ্য পাওয়া যায়নি' : 'No alert products found'}
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const cfg = SEVERITY_CONFIG[p.severity];
                  const pct = p.alertQty > 0 ? Math.min(100, Math.round(((p.stock ?? 0) / (p.alertQty * 3)) * 100)) : ((p.stock ?? 0) > 0 ? 100 : 0);

                  return (
                    <tr 
                      key={p.id || idx} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150 ${p.muted ? 'opacity-50 bg-slate-50/40' : ''}`}
                    >
                      {/* Sl.No */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${cfg.badgeCls} flex items-center justify-center shrink-0`}>
                            <Package size={16} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-white text-xs leading-snug">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400">{p.category || 'General'}</span>
                              {p.sku && (
                                <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {p.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock Progress */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-black text-xs ${cfg.text}`}>
                            {p.stock ?? 0} {isBn ? 'টি' : 'pcs'}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${cfg.barCls}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Alert Limit */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {editingId === p.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input 
                              type="number" 
                              value={editQty} 
                              onChange={e => setEditQty(e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-bold border border-amber-400 rounded-lg bg-white dark:bg-slate-950 dark:text-white text-center focus:outline-none" 
                            />
                            <button onClick={() => saveAlertQty(p.id)} className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer">
                              <Check size={12} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingId(p.id); setEditQty(String(p.alertQty)); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-100 hover:text-amber-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
                            title={isBn ? "অ্যালার্ট সীমা পরিবর্তন করুন" : "Edit Alert Limit"}
                          >
                            <Edit2 size={10} />
                            <span>{p.alertQty} {isBn ? 'টি' : 'pcs'}</span>
                          </button>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${cfg.badgeCls}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotCls}`} />
                          <span>{isBn ? cfg.label : cfg.labelEn}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleReorderClick(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                            title={isBn ? "সরাসরি ক্রয় অর্ডার তৈরি করুন" : "Reorder Item"}
                          >
                            <ShoppingBag size={12} />
                            <span>{isBn ? 'পারচেজ করুন' : 'Reorder'}</span>
                          </button>

                          <button 
                            onClick={() => toggleMute(p.id)}
                            title={p.muted ? (isBn ? 'সক্রিয় করুন' : 'Unmute') : (isBn ? 'নিরব করুন' : 'Mute')}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              p.muted 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700' 
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
                            }`}
                          >
                            {p.muted ? <BellOff size={13} /> : <Bell size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockAlertManager;
