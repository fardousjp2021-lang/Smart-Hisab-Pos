// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  History, Search, Download, Eye, X, Package,
  TrendingUp, TrendingDown, Calendar, Filter, ChevronDown,
  BarChart3, Clock, Building2, DollarSign, ArrowUpDown
} from 'lucide-react';

interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  previousPrice: number;
  newPrice: number;
  changeType: 'purchase' | 'selling' | 'both';
  changedBy?: string;
  supplier?: string;
  date: string;
  note?: string;
  quantity?: number;
}

interface PurchaseHistoryManagerProps {
  lang?: 'bn' | 'en';
  products?: any[];
  suppliers?: any[];
  showToast?: (msg: string, type?: string) => void;
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const DEFAULT_HISTORY: PriceHistory[] = [
  { id: 'PH-001', productId: 'IT020027', productName: 'XIAOMI REDMI NOTE 13', previousPrice: 2800, newPrice: 3034, changeType: 'purchase', changedBy: 'admin', supplier: 'Unique Wholesalers Ltd', date: '2026-05-15', note: 'Price increase due to USD rate change', quantity: 20 },
  { id: 'PH-002', productId: 'IT020025', productName: 'FLYX MAX 2', previousPrice: 1800, newPrice: 2000, changeType: 'both', changedBy: 'admin', supplier: 'Dhaka Mobile House', date: '2026-05-20', note: 'New shipment price', quantity: 15 },
  { id: 'PH-003', productId: 'IT020024', productName: 'JONAKI POWER MICRO CHARGE', previousPrice: 80, newPrice: 75, changeType: 'purchase', changedBy: 'admin', supplier: 'Telecom Parts BD', date: '2026-06-01', note: 'Bulk discount applied', quantity: 100 },
  { id: 'PH-004', productId: 'IT020023', productName: '18W EXTREME QUICK CHARGER', previousPrice: 300, newPrice: 280, changeType: 'purchase', changedBy: 'rakib', supplier: 'Unique Wholesalers Ltd', date: '2026-06-10', quantity: 30 },
  { id: 'PH-005', productId: 'IT020022', productName: 'Y20', previousPrice: 1100, newPrice: 1200, changeType: 'both', changedBy: 'admin', supplier: 'Dhaka Mobile House', date: '2026-06-15', note: 'Model upgrade pricing', quantity: 10 },
];

export const PurchaseHistoryManager = ({
  lang = 'bn',
  products = [],
  suppliers = [],
  showToast,
}: PurchaseHistoryManagerProps) => {
  const isBn = lang === 'bn';

  const [history, setHistory] = useState<PriceHistory[]>(() => {
    try {
      const saved = localStorage.getItem('roni_price_history_v1');
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return DEFAULT_HISTORY;
  });

  useEffect(() => {
    try { localStorage.setItem('roni_price_history_v1', JSON.stringify(history)); } catch {}
  }, [history]);

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'purchase' | 'selling' | 'both'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<PriceHistory | null>(null);

  // Form
  const [fProduct, setFProduct] = useState('');
  const [fPrevPrice, setFPrevPrice] = useState('');
  const [fNewPrice, setFNewPrice] = useState('');
  const [fType, setFType] = useState<'purchase' | 'selling' | 'both'>('purchase');
  const [fSupplier, setFSupplier] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fQty, setFQty] = useState('');
  const [fNote, setFNote] = useState('');

  const resetForm = () => {
    setFProduct(''); setFPrevPrice(''); setFNewPrice('');
    setFType('purchase'); setFSupplier(''); setFDate(new Date().toISOString().slice(0, 10));
    setFQty(''); setFNote('');
  };

  const saveEntry = () => {
    if (!fProduct.trim() || !fNewPrice) { showToast && showToast(isBn ? 'পণ্য ও নতুন মূল্য আবশ্যিক' : 'Product and new price required', 'error'); return; }
    const entry: PriceHistory = {
      id: 'PH-' + String(Date.now()).slice(-6),
      productId: products.find((p: any) => p.name === fProduct)?.id || '',
      productName: fProduct, previousPrice: Number(fPrevPrice) || 0, newPrice: Number(fNewPrice),
      changeType: fType, supplier: fSupplier, date: fDate,
      quantity: fQty ? Number(fQty) : undefined, note: fNote,
      changedBy: 'admin'
    };
    setHistory(prev => [entry, ...prev]);
    showToast && showToast(isBn ? 'মূল্য পরিবর্তন রেকর্ড হয়েছে' : 'Price change recorded');
    setAddOpen(false);
    resetForm();
  };

  const allSuppliers = useMemo(() => {
    const fromHistory = history.map(h => h.supplier).filter(Boolean);
    const fromSuppliers = suppliers.map((s: any) => s.name);
    return [...new Set([...fromHistory, ...fromSuppliers])];
  }, [history, suppliers]);

  const allProducts = useMemo(() => {
    const fromHistory = history.map(h => h.productName);
    const fromProducts = products.map((p: any) => p.name);
    return [...new Set([...fromHistory, ...fromProducts])];
  }, [history, products]);

  const filtered = useMemo(() => {
    return history.filter(h => {
      const q = search.toLowerCase();
      const matchSearch = !q || h.productName.toLowerCase().includes(q) || (h.supplier || '').toLowerCase().includes(q);
      const matchProduct = productFilter === 'all' || h.productName === productFilter;
      const matchSupplier = supplierFilter === 'all' || h.supplier === supplierFilter;
      const matchType = typeFilter === 'all' || h.changeType === typeFilter;
      const matchFrom = !dateFrom || h.date >= dateFrom;
      const matchTo = !dateTo || h.date <= dateTo;
      return matchSearch && matchProduct && matchSupplier && matchType && matchFrom && matchTo;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [history, search, productFilter, supplierFilter, typeFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const increases = history.filter(h => h.newPrice > h.previousPrice).length;
    const decreases = history.filter(h => h.newPrice < h.previousPrice).length;
    const avgChange = history.length ? history.reduce((s, h) => s + ((h.newPrice - h.previousPrice) / (h.previousPrice || 1)) * 100, 0) / history.length : 0;
    return { total: history.length, increases, decreases, avgChange: avgChange.toFixed(1) };
  }, [history]);

  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Prev Price', 'New Price', 'Change%', 'Type', 'Supplier', 'Qty', 'Note'];
    const rows = filtered.map(h => [
      h.date, h.productName, h.previousPrice, h.newPrice,
      h.previousPrice ? (((h.newPrice - h.previousPrice) / h.previousPrice) * 100).toFixed(1) + '%' : 'N/A',
      h.changeType, h.supplier || '', h.quantity || '', h.note || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `price-history-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 p-4 sm:p-6">
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              <History size={24} className="text-blue-500" />
              {isBn ? 'ক্রয় মূল্য ইতিহাস' : 'Purchase Price History'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{isBn ? 'পণ্যের ক্রয় মূল্যের পরিবর্তনের সম্পূর্ণ রেকর্ড' : 'Complete record of purchase price changes'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} /> CSV
            </button>
            <button onClick={() => { resetForm(); setAddOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all">
              + {isBn ? 'এন্ট্রি যোগ' : 'Add Entry'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isBn ? 'মোট পরিবর্তন' : 'Total Changes', value: stats.total, text: 'text-blue-600', bg: 'bg-blue-50' },
            { label: isBn ? 'মূল্য বৃদ্ধি' : 'Price Increases', value: stats.increases, text: 'text-rose-600', bg: 'bg-rose-50' },
            { label: isBn ? 'মূল্য হ্রাস' : 'Price Decreases', value: stats.decreases, text: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: isBn ? 'গড় পরিবর্তন' : 'Avg Change', value: stats.avgChange + '%', text: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={isBn ? 'পণ্য বা সরবরাহকারী খুঁজুন...' : 'Search product or supplier...'}
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'purchase', 'selling', 'both'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${typeFilter === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t === 'all' ? (isBn ? 'সব' : 'All') : t === 'purchase' ? (isBn ? 'ক্রয়' : 'Purchase') : t === 'selling' ? (isBn ? 'বিক্রয়' : 'Selling') : (isBn ? 'উভয়' : 'Both')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
              <option value="all">{isBn ? 'সব পণ্য' : 'All Products'}</option>
              {allProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
              <option value="all">{isBn ? 'সব সরবরাহকারী' : 'All Suppliers'}</option>
              {allSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">{isBn ? 'পণ্য' : 'Product'}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs">{isBn ? 'আগের মূল্য' : 'Previous'}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs">{isBn ? 'নতুন মূল্য' : 'New Price'}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs">{isBn ? 'পরিবর্তন' : 'Change'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs hidden md:table-cell">{isBn ? 'সরবরাহকারী' : 'Supplier'}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs">{isBn ? 'বিস্তারিত' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    <History size={32} className="mx-auto text-gray-300 mb-2" />
                    {isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No records found'}
                  </td></tr>
                )}
                {filtered.map(h => {
                  const change = h.previousPrice > 0 ? ((h.newPrice - h.previousPrice) / h.previousPrice * 100) : 0;
                  const isUp = h.newPrice > h.previousPrice;
                  const isDown = h.newPrice < h.previousPrice;
                  return (
                    <tr key={h.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{h.productName}</p>
                            {h.quantity && <p className="text-gray-400 text-[10px]">Qty: {h.quantity}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-500 text-xs">৳{h.previousPrice.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-gray-800 text-xs">৳{h.newPrice.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`flex items-center justify-end gap-0.5 text-xs font-bold ${isUp ? 'text-rose-600' : isDown ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
                          {isUp ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-500 text-xs">{h.supplier || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-xs">{h.date}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setViewingEntry(h)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm(); }} title={isBn ? 'মূল্য পরিবর্তন রেকর্ড' : 'Record Price Change'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'পণ্য' : 'Product'} *</label>
            {products.length > 0 ? (
              <select value={fProduct} onChange={e => { setFProduct(e.target.value); const p = products.find((x: any) => x.name === e.target.value); if (p) setFPrevPrice(String(p.purchasePrice || '')); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                <option value="">{isBn ? '-- পণ্য নির্বাচন --' : '-- Select --'}</option>
                {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            ) : (
              <input value={fProduct} onChange={e => setFProduct(e.target.value)} placeholder="Product name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'আগের মূল্য' : 'Prev Price'}</label>
              <input type="number" value={fPrevPrice} onChange={e => setFPrevPrice(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'নতুন মূল্য' : 'New Price'} *</label>
              <input type="number" value={fNewPrice} onChange={e => setFNewPrice(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'পরিমাণ' : 'Qty'}</label>
              <input type="number" value={fQty} onChange={e => setFQty(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'ধরন' : 'Type'}</label>
              <select value={fType} onChange={e => setFType(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                <option value="purchase">{isBn ? 'ক্রয় মূল্য' : 'Purchase Price'}</option>
                <option value="selling">{isBn ? 'বিক্রয় মূল্য' : 'Selling Price'}</option>
                <option value="both">{isBn ? 'উভয়' : 'Both'}</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'তারিখ' : 'Date'}</label>
              <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'সরবরাহকারী' : 'Supplier'}</label>
            {suppliers.length > 0 ? (
              <select value={fSupplier} onChange={e => setFSupplier(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                <option value="">{isBn ? '-- নির্বাচন --' : '-- Select --'}</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            ) : (
              <input value={fSupplier} onChange={e => setFSupplier(e.target.value)} placeholder="Supplier name" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            )}</div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">{isBn ? 'নোট' : 'Note'}</label>
            <textarea value={fNote} onChange={e => setFNote(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 resize-none" /></div>
          {fPrevPrice && fNewPrice && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${Number(fNewPrice) > Number(fPrevPrice) ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {Number(fNewPrice) > Number(fPrevPrice) ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isBn ? 'পরিবর্তন:' : 'Change:'} {Number(fPrevPrice) > 0 ? ((Number(fNewPrice) - Number(fPrevPrice)) / Number(fPrevPrice) * 100).toFixed(1) + '%' : 'N/A'}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setAddOpen(false); resetForm(); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">{isBn ? 'বাতিল' : 'Cancel'}</button>
            <button onClick={saveEntry} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold">{isBn ? 'সংরক্ষণ' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewingEntry} onClose={() => setViewingEntry(null)} title={isBn ? 'মূল্য পরিবর্তনের বিবরণ' : 'Price Change Details'}>
        {viewingEntry && (
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {[
                { label: isBn ? 'পণ্য' : 'Product', value: viewingEntry.productName },
                { label: isBn ? 'আগের মূল্য' : 'Previous Price', value: '৳' + viewingEntry.previousPrice.toLocaleString() },
                { label: isBn ? 'নতুন মূল্য' : 'New Price', value: '৳' + viewingEntry.newPrice.toLocaleString() },
                { label: isBn ? 'সরবরাহকারী' : 'Supplier', value: viewingEntry.supplier || '—' },
                { label: isBn ? 'পরিমাণ' : 'Quantity', value: viewingEntry.quantity || '—' },
                { label: isBn ? 'তারিখ' : 'Date', value: viewingEntry.date },
                { label: isBn ? 'পরিবর্তনের ধরন' : 'Change Type', value: viewingEntry.changeType },
                { label: isBn ? 'পরিবর্তনকারী' : 'Changed By', value: viewingEntry.changedBy || 'system' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
            {viewingEntry.note && (
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-gray-700">
                <span className="font-semibold">{isBn ? 'নোট: ' : 'Note: '}</span>{viewingEntry.note}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseHistoryManager;
