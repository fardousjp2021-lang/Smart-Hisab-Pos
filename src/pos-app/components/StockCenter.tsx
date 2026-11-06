// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, Search, Plus, Minus,
  Download, Printer, History, Boxes, Wallet, RefreshCw
} from 'lucide-react';
import { StockAlertManager } from './StockAlertManager';
import { StockHeatmap } from './StockHeatmap';
import { SummaryCard } from './SummaryCard';

interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  note?: string;
  date: string;
  recordedBy?: string;
}

const MOV_KEY = 'roni_stock_movements_v1';

function loadMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(MOV_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveMovements(list: Movement[]) {
  try { localStorage.setItem(MOV_KEY, JSON.stringify(list)); } catch {}
}

interface Props {
  lang: 'bn' | 'en';
  products: any[];
  setProducts: (updater: any) => void;
  sales?: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUserEmail?: string;
}

export const StockCenter: React.FC<Props> = ({
  lang, products, setProducts, sales = [], showToast, currentUserEmail = 'admin',
}) => {
  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'in' | 'out'>('all');

  const selectedProduct = products.find((x: any) => x.id === selectedProductId);
  const selectedProductCurrentStock = Number(selectedProduct?.stock ?? selectedProduct?.quantity ?? 0);
  const selectedProductNewStock = movementType === 'in' 
    ? selectedProductCurrentStock + Number(quantity || 0) 
    : Math.max(0, selectedProductCurrentStock - Number(quantity || 0));

  useEffect(() => { setMovements(loadMovements()); }, []);

  const kpis = useMemo(() => {
    let totalItems = 0, inStock = 0, low = 0, out = 0, value = 0;
    for (const p of products) {
      const s = Number(p.stock || 0);
      const min = Number(p.minStock || 0);
      const cost = Number(p.purchasePrice || p.costPrice || 0);
      totalItems++;
      value += Math.max(0, s) * cost;
      if (s <= 0) out++;
      else if (min > 0 && s <= min) low++;
      else inStock++;
    }
    return { totalItems, inStock, low, out, value };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return products.filter((p: any) =>
      (p.name || '').toLowerCase().includes(s) || (p.id || '').toLowerCase().includes(s)
    ).slice(0, 8);
  }, [products, search]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find((x: any) => x.id === selectedProductId);
    if (!p) { showToast(t('পণ্য নির্বাচন করুন', 'Select a product'), 'error'); return; }
    if (!quantity || quantity <= 0) { showToast(t('সঠিক পরিমাণ দিন', 'Enter a valid quantity'), 'error'); return; }
    const currentStock = Number(p.stock || 0);
    if (movementType === 'out' && currentStock < quantity) {
      showToast(t(`স্টক অপর্যাপ্ত (${currentStock})`, `Insufficient stock (${currentStock})`), 'error');
      return;
    }
    const newStock = movementType === 'in' ? currentStock + quantity : currentStock - quantity;
    setProducts((prev: any[]) => prev.map((x: any) => x.id === p.id ? { ...x, stock: newStock } : x));
    try {
      import('../salesSyncQueue').then(m => m.enqueueStockUpdate(p.id, movementType === 'in' ? quantity : -quantity, p.name, newStock)).catch(() => {});
    } catch {}
    const mv: Movement = {
      id: `MV-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      type: movementType,
      quantity,
      note,
      date: new Date().toISOString(),
      recordedBy: currentUserEmail,
    };
    const next = [mv, ...movements];
    setMovements(next);
    saveMovements(next);
    setQuantity(0); setNote(''); setSelectedProductId(''); setSearch('');
    showToast(t('স্টক সমন্বয় সম্পন্ন', 'Stock adjustment saved'), 'success');
  };

  const filteredMovements = useMemo(() => {
    return movements.filter(m => historyFilter === 'all' ? true : m.type === historyFilter);
  }, [movements, historyFilter]);

  const exportMovementsCsv = () => {
    const header = ['Date', 'Item Code', 'Name', 'Type', 'Quantity', 'Note', 'By'];
    const lines = [header.join(',')];
    for (const m of filteredMovements) {
      lines.push([m.date, m.productId, m.productName, m.type, m.quantity, m.note || '', m.recordedBy || '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const printMovements = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const rows = filteredMovements.map(m => `<tr>
      <td>${new Date(m.date).toLocaleString()}</td><td>${m.productId}</td>
      <td>${m.productName}</td><td>${m.type.toUpperCase()}</td>
      <td style="text-align:right">${m.quantity}</td><td>${m.note || ''}</td><td>${m.recordedBy || ''}</td>
    </tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>Stock Movements</title>
      <style>body{font-family:system-ui,sans-serif;padding:20px;color:#0f172a}
      h1{font-size:18px;margin:0 0 4px}small{color:#64748b}
      table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
      th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
      th{background:#f1f5f9;font-weight:700}</style></head><body>
      <h1>${t('স্টক মুভমেন্ট রিপোর্ট', 'Stock Movement Report')}</h1>
      <small>${new Date().toLocaleString()} • ${filteredMovements.length} ${t('এন্ট্রি', 'entries')}</small>
      <table><thead><tr>
        <th>${t('তারিখ', 'Date')}</th><th>${t('পণ্য কোড', 'Item Code')}</th>
        <th>${t('নাম', 'Name')}</th><th>${t('ধরন', 'Type')}</th>
        <th>${t('পরিমাণ', 'Qty')}</th><th>${t('নোট', 'Note')}</th><th>${t('ব্যবহারকারী', 'By')}</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <script>setTimeout(()=>{window.print();},250)</script></body></html>`);
    w.document.close();
  };

  const fmtMoney = (n: number) => `৳ ${Math.round(n).toLocaleString()}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 gap-3 select-none">
        <div className="flex items-baseline gap-2">
          <h1 className="font-extrabold text-slate-800 text-lg sm:text-xl font-sans tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            {t('স্টক সেন্টার', 'Stock Center')}
          </h1>
          <span className="text-gray-400 text-xs font-normal">
            {t('সমন্বয়, সতর্কতা, মুভমেন্ট ও হিটম্যাপ — এক জায়গায়', 'Adjustments, alerts, movements & heatmap — all in one')}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard icon={<Package className="w-5 h-5" />} label={t('মোট পণ্য', 'Total Items')} value={kpis.totalItems.toString()} tone="slate" />
        <SummaryCard icon={<TrendingUp className="w-5 h-5" />} label={t('পর্যাপ্ত স্টক', 'In Stock')} value={kpis.inStock.toString()} tone="emerald" />
        <SummaryCard icon={<AlertTriangle className="w-5 h-5" />} label={t('কম স্টক', 'Low Stock')} value={kpis.low.toString()} tone="amber" />
        <SummaryCard icon={<TrendingDown className="w-5 h-5" />} label={t('স্টক শেষ', 'Out of Stock')} value={kpis.out.toString()} tone="rose" />
        <SummaryCard icon={<Wallet className="w-5 h-5" />} label={t('স্টক মূল্য', 'Stock Value')} value={fmtMoney(kpis.value)} tone="indigo" />
      </div>

      {/* Adjustment form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {t('স্টক সমন্বয় ও দ্রুত স্টক প্যানেল', 'Stock Adjustment Panel')}
          </h2>
          {selectedProduct && (
            <div className="flex items-center gap-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
              <span>{t('বর্তমান স্টক:', 'Current Stock:')} <strong className="font-black">{selectedProductCurrentStock}</strong></span>
              <span>➔</span>
              <span>{t('নতুন স্টক হবে:', 'New Stock:')} <strong className="font-black text-emerald-600 dark:text-emerald-400">{selectedProductNewStock}</strong> ({movementType === 'in' ? '+' : '-'}{quantity})</span>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-4 text-xs items-start">
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5">{t('পণ্য খুঁজুন', 'Find product')} *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedProductId(''); }}
                placeholder={t('নাম বা কোড লিখুন...', 'Type name or code...')}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            {search && !selectedProductId && filteredProducts.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p: any) => (
                  <button type="button" key={p.id}
                    onClick={() => { setSelectedProductId(p.id); setSearch(`${p.name} (${p.id})`); }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer">
                    <div className="font-extrabold text-slate-800 dark:text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      SKU: {p.id} • {t('বর্তমান স্টক', 'Current Stock')}: <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.stock ?? 0} {p.unit || 'pcs'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5">{t('ধরন', 'Type')}</label>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setMovementType('in')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-black inline-flex items-center justify-center gap-1 transition cursor-pointer ${movementType === 'in' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}>
                <Plus className="w-3.5 h-3.5" /> {t('ইন (+)', 'IN (+)')}
              </button>
              <button type="button" onClick={() => setMovementType('out')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-black inline-flex items-center justify-center gap-1 transition cursor-pointer ${movementType === 'out' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}>
                <Minus className="w-3.5 h-3.5" /> {t('আউট (-)', 'OUT (-)')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5">{t('পরিমাণ', 'Quantity')} *</label>
            <input type="number" min={0} value={quantity || ''} onChange={e => setQuantity(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white font-black text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1.5">{t('নোট / রেফারেন্স', 'Note / Reference')}</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder={t('যেমন: নতুন পারচেজ বা সমন্বয় কারণ', 'e.g. Purchase or adjustment reason')}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>

          <div className="md:col-span-6 flex justify-end">
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-md transition cursor-pointer">
              ✓ {t('স্টক সমন্বয় সংরক্ষণ করুন', 'Save Stock Adjustment')}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Stock Alert Manager (Clean table without duplicate stats cards) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">
              {t('স্টক সতর্কতা ও পারচেজ রিকুইজিশন টেবিল', 'Stock Alerts & Reorder Table')}
            </h2>
          </div>
        </div>
        <StockAlertManager embedded={true} lang={lang} products={products} showToast={showToast} />
      </div>

      {/* Movement History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {t('স্টক সমন্বয় ও মুভমেন্ট ইতিহাস', 'Stock Movement Audit Log')}
            <span className="text-xs font-bold text-slate-400">({filteredMovements.length})</span>
          </h2>

          <div className="flex items-center gap-2.5">
            <div className="flex text-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
              {(['all', 'in', 'out'] as const).map(k => (
                <button key={k} onClick={() => setHistoryFilter(k)}
                  className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${historyFilter === k ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}>
                  {k === 'all' ? t('সব', 'All') : k === 'in' ? t('ইন (+)', 'IN (+)') : t('আউট (-)', 'OUT (-)')}
                </button>
              ))}
            </div>

            <button onClick={exportMovementsCsv}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
              <Download className="w-3.5 h-3.5" /> {t('এক্সপোর্ট', 'Export')}
            </button>

            <button onClick={printMovements}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition cursor-pointer">
              <Printer className="w-3.5 h-3.5" /> {t('প্রিন্ট', 'Print')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black uppercase">
              <tr>
                <th className="px-4 py-3 text-center w-10">#</th>
                <th className="px-4 py-3">{t('তারিখ ও সময়', 'Date & Time')}</th>
                <th className="px-4 py-3">{t('পণ্য কোড ও নাম', 'Item & Code')}</th>
                <th className="px-4 py-3 text-center">{t('ধরন', 'Type')}</th>
                <th className="px-4 py-3 text-right">{t('পরিমাণ', 'Qty')}</th>
                <th className="px-4 py-3">{t('কারণ / নোট', 'Note')}</th>
                <th className="px-4 py-3">{t('ইউজার', 'User')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredMovements.map((m, idx) => (
                <tr key={m.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 text-center font-extrabold text-slate-400 text-[11px]">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-500 text-[11px] whitespace-nowrap">{new Date(m.date).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-800 dark:text-white">{m.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.productId}</div>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      m.type === 'in' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                    }`}>
                      {m.type === 'in' ? t('🟢 ইন (+)', '🟢 IN (+)') : t('🔴 আউট (-)', '🔴 OUT (-)')}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-black text-sm whitespace-nowrap ${m.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-semibold max-w-[200px] truncate">{m.note || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 font-bold text-[11px]">{m.recordedBy || 'Admin'}</td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-bold">
                    {t('কোনো সমন্বয় ইতিহাস নেই', 'No stock movements recorded yet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <StockHeatmap products={products} sales={sales} lang={lang} />
      </div>
    </div>
  );
};
