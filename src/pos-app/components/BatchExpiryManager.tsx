// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Plus, Trash2, Edit2, Check, X, AlertCircle, Search,
  Calendar, Clock, AlertTriangle, CheckCircle2, Filter, Eye, Hash,
  Truck, Layers, FileText
} from 'lucide-react';

interface BatchRecord {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate?: string;
  supplier?: string;
  purchaseDate?: string;
  quantity?: number;
  note?: string;
  createdAt: string;
}

type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'notice' | 'ok' | 'none';

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryStatus(dateStr?: string): ExpiryStatus {
  const d = daysUntil(dateStr);
  if (d === null) return 'none';
  if (d < 0) return 'expired';
  if (d <= 7) return 'critical';
  if (d <= 15) return 'warning';
  if (d <= 30) return 'notice';
  return 'ok';
}

const STATUS_CONFIG = {
  expired:  { label: 'মেয়াদ শেষ', labelEn: 'Expired',  bg: 'bg-rose-100',   text: 'text-rose-700',   icon: X },
  critical: { label: 'জরুরি',     labelEn: 'Critical',  bg: 'bg-red-100',    text: 'text-red-700',    icon: AlertTriangle },
  warning:  { label: 'সতর্কতা',   labelEn: 'Warning',   bg: 'bg-amber-100',  text: 'text-amber-700',  icon: AlertCircle },
  notice:   { label: 'নজরে রাখুন','labelEn': 'Notice',  bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  ok:       { label: 'ভালো',      labelEn: 'Good',      bg: 'bg-emerald-100','text': 'text-emerald-700', icon: CheckCircle2 },
  none:     { label: 'অজানা',     labelEn: 'Unknown',   bg: 'bg-gray-100',   text: 'text-gray-500',   icon: Package },
};

const DEFAULT_BATCHES: BatchRecord[] = [
  { id: 'BT-001', productId: 'IT020027', productName: 'XIAOMI REDMI NOTE 13', batchNumber: 'BAT-2026-05-A', manufacturingDate: '2026-01-15', expiryDate: '2027-01-15', supplier: 'Unique Wholesalers', purchaseDate: '2026-05-01', quantity: 20, createdAt: '2026-05-01' },
  { id: 'BT-002', productId: 'IT020024', productName: 'JONAKI POWER MICRO CHARGE', batchNumber: 'BAT-2026-05-B', manufacturingDate: '2025-11-01', expiryDate: '2026-08-10', supplier: 'Dhaka Mobile House', purchaseDate: '2026-05-10', quantity: 50, createdAt: '2026-05-10' },
  { id: 'BT-003', productId: 'IT020023', productName: '18W EXTREME QUICK CHARGER', batchNumber: 'BAT-2026-04-C', manufacturingDate: '2025-08-01', expiryDate: '2026-07-31', supplier: 'Telecom Parts BD', purchaseDate: '2026-04-15', quantity: 30, createdAt: '2026-04-15' },
];

function Modal({ open, onClose, title, subtitle, maxWidth = 'max-w-4xl', icon: HeaderIcon, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
      <div 
        className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full ${maxWidth} max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 via-white to-orange-50/30 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            {HeaderIcon ? (
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs border border-orange-200/50">
                <HeaderIcon size={20} />
              </div>
            ) : null}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

interface BatchExpiryManagerProps {
  lang?: 'bn' | 'en';
  products?: any[];
  showToast?: (msg: string, type?: string) => void;
}

export const BatchExpiryManager = ({
  lang = 'bn',
  products = [],
  showToast: externalToast,
}: BatchExpiryManagerProps) => {
  const isBn = lang === 'bn';

  const [batches, setBatches] = useState<BatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('roni_batch_expiry_v1');
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return DEFAULT_BATCHES;
  });

  useEffect(() => {
    try { localStorage.setItem('roni_batch_expiry_v1', JSON.stringify(batches)); } catch {}
  }, [batches]);

  const [localToast, setLocalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (externalToast) { externalToast(msg, type); return; }
    setLocalToast({ msg, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [fProduct, setFProduct] = useState('');
  const [fBatch, setFBatch] = useState('');
  const [fMfgDate, setFMfgDate] = useState('');
  const [fExpiry, setFExpiry] = useState('');
  const [fSupplier, setFSupplier] = useState('');
  const [fPurchaseDate, setFPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [fQty, setFQty] = useState('');
  const [fNote, setFNote] = useState('');

  const resetForm = () => {
    setFProduct(''); setFBatch(''); setFMfgDate(''); setFExpiry('');
    setFSupplier(''); setFPurchaseDate(new Date().toISOString().slice(0, 10));
    setFQty(''); setFNote('');
  };

  const openEdit = (b: BatchRecord) => {
    setEditingBatch(b);
    setFProduct(b.productName); setFBatch(b.batchNumber); setFMfgDate(b.manufacturingDate || '');
    setFExpiry(b.expiryDate || ''); setFSupplier(b.supplier || '');
    setFPurchaseDate(b.purchaseDate || ''); setFQty(String(b.quantity || '')); setFNote(b.note || '');
  };

  const saveBatch = () => {
    if (!fProduct.trim() || !fBatch.trim()) {
      showToast(isBn ? 'পণ্যের নাম ও ব্যাচ নম্বর আবশ্যিক' : 'Product and batch number required', 'error'); return;
    }
    if (editingBatch) {
      setBatches(prev => prev.map(b => b.id === editingBatch.id
        ? { ...b, productName: fProduct, batchNumber: fBatch, manufacturingDate: fMfgDate, expiryDate: fExpiry, supplier: fSupplier, purchaseDate: fPurchaseDate, quantity: fQty ? Number(fQty) : undefined, note: fNote }
        : b));
      showToast(isBn ? 'ব্যাচ আপডেট হয়েছে' : 'Batch updated');
      setEditingBatch(null);
    } else {
      setBatches(prev => [{
        id: 'BT-' + String(Date.now()).slice(-6),
        productId: products.find((p: any) => p.name === fProduct)?.id || '',
        productName: fProduct, batchNumber: fBatch, manufacturingDate: fMfgDate,
        expiryDate: fExpiry, supplier: fSupplier, purchaseDate: fPurchaseDate,
        quantity: fQty ? Number(fQty) : undefined, note: fNote,
        createdAt: new Date().toISOString().slice(0, 10)
      }, ...prev]);
      showToast(isBn ? 'নতুন ব্যাচ যোগ হয়েছে' : 'Batch added');
      setAddOpen(false);
    }
    resetForm();
  };

  const filtered = useMemo(() => {
    return batches.filter(b => {
      const q = search.toLowerCase();
      const match = !q || b.productName.toLowerCase().includes(q) || b.batchNumber.toLowerCase().includes(q) || (b.supplier || '').toLowerCase().includes(q);
      const st = expiryStatus(b.expiryDate);
      const matchStatus = statusFilter === 'all' || st === statusFilter;
      return match && matchStatus;
    });
  }, [batches, search, statusFilter]);

  const stats = useMemo(() => ({
    total: batches.length,
    ok: batches.filter(b => expiryStatus(b.expiryDate) === 'ok').length,
    expiring: batches.filter(b => ['warning', 'critical', 'notice'].includes(expiryStatus(b.expiryDate))).length,
    expired: batches.filter(b => expiryStatus(b.expiryDate) === 'expired').length,
  }), [batches]);

  const FormContent = () => (
    <div className="space-y-6 text-left">
      {/* 2-Column Responsive Landscape Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Left Section: পণ্যের মূল তথ্য ও স্টক (Product & Stock Details) */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="w-2 h-4 rounded-full bg-orange-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isBn ? 'পণ্যের বিবরণ ও স্টক' : 'Product & Stock Details'}
            </h3>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-orange-500" />
              <span>{isBn ? 'পণ্যের নাম' : 'Product Name'} <span className="text-rose-500">*</span></span>
            </label>
            {products.length > 0 ? (
              <select 
                value={fProduct} 
                onChange={e => setFProduct(e.target.value)} 
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs"
              >
                <option value="">{isBn ? '-- পণ্য নির্বাচন করুন --' : '-- Select Product --'}</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input 
                value={fProduct} 
                onChange={e => setFProduct(e.target.value)} 
                placeholder={isBn ? "পণ্যের নাম লিখুন..." : "Enter product name..."} 
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs" 
              />
            )}
          </div>

          {/* Batch Number & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash size={14} className="text-orange-500" />
                <span>{isBn ? 'ব্যাচ নম্বর' : 'Batch Number'} <span className="text-rose-500">*</span></span>
              </label>
              <input 
                value={fBatch} 
                onChange={e => setFBatch(e.target.value)} 
                placeholder="BAT-2026-XXXX" 
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs uppercase placeholder:normal-case placeholder:font-sans" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers size={14} className="text-orange-500" />
                <span>{isBn ? 'স্টক পরিমাণ' : 'Quantity'}</span>
              </label>
              <input 
                type="number" 
                value={fQty} 
                onChange={e => setFQty(e.target.value)} 
                placeholder="0" 
                min="0"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs" 
              />
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Truck size={14} className="text-orange-500" />
              <span>{isBn ? 'সরবরাহকারী (সাপ্লায়ার)' : 'Supplier'}</span>
            </label>
            <input 
              value={fSupplier} 
              onChange={e => setFSupplier(e.target.value)} 
              placeholder={isBn ? "সরবরাহকারী প্রতিষ্ঠানের নাম লিখুন" : "Supplier company name"} 
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs" 
            />
          </div>
        </div>

        {/* Right Section: সময়সূচি ও মেয়াদের তথ্য (Schedule & Timeline) */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="w-2 h-4 rounded-full bg-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {isBn ? 'তারিখ ও মেয়াদের সময়সীমা' : 'Timeline & Expiry Schedule'}
            </h3>
          </div>

          {/* Manufacturing Date & Purchase Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                <span>{isBn ? 'উৎপাদন তারিখ' : 'Mfg Date'}</span>
              </label>
              <input 
                type="date" 
                value={fMfgDate} 
                onChange={e => setFMfgDate(e.target.value)} 
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                <span>{isBn ? 'ক্রয়ের তারিখ' : 'Purchase Date'}</span>
              </label>
              <input 
                type="date" 
                value={fPurchaseDate} 
                onChange={e => setFPurchaseDate(e.target.value)} 
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs" 
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
              <Clock size={14} className="text-rose-500" />
              <span>{isBn ? 'মেয়াদ শেষের তারিখ (Expiry Date)' : 'Expiry Date'}</span>
            </label>
            <input 
              type="date" 
              value={fExpiry} 
              onChange={e => setFExpiry(e.target.value)} 
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-rose-200/90 dark:border-rose-900/60 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-rose-500/20 focus:border-rose-500 transition shadow-2xs" 
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-500" />
              <span>{isBn ? 'নোট / বিশেষ বিবরণ' : 'Note / Remarks'}</span>
            </label>
            <textarea 
              value={fNote} 
              onChange={e => setFNote(e.target.value)} 
              rows={2} 
              placeholder={isBn ? "ব্যাচ সংক্রান্ত যেকোনো অতিরিক্ত তথ্য..." : "Any batch remarks..."}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs resize-none" 
            />
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 text-left animate-fade-in font-sans">
      {localToast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${localToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {localToast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {localToast.msg}
        </div>
      )}

      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
          <div className="flex items-baseline gap-2">
            <h1 className="font-extrabold text-slate-800 text-lg sm:text-xl font-sans tracking-tight flex items-center gap-2">
              <Package size={22} className="text-orange-500" />
              {isBn ? 'ব্যাচ ও মেয়াদ ব্যবস্থাপনা' : 'Batch & Expiry Manager'}
            </h1>
            <span className="text-gray-400 text-xs font-normal">
              {isBn ? 'পণ্যের ব্যাচ নম্বর ও মেয়াদ ট্র্যাক করুন' : 'Track product batch numbers and expiry dates'}
            </span>
          </div>
          <button 
            onClick={() => { resetForm(); setAddOpen(true); }}
            className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
          >
            <Plus size={16} />
            <span>{isBn ? 'নতুন ব্যাচ' : 'Add Batch'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: isBn ? 'মোট ব্যাচ লট' : 'Total Batches', value: stats.total, color: 'from-orange-400 to-red-500', text: 'text-orange-600', bg: 'bg-orange-50' },
            { label: isBn ? 'ভালো অবস্থায়' : 'Good Condition', value: stats.ok, color: 'from-emerald-400 to-teal-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: isBn ? 'মেয়াদ শেষ হচ্ছে' : 'Expiring Soon', value: stats.expiring, color: 'from-amber-400 to-orange-500', text: 'text-amber-600', bg: 'bg-amber-50' },
            { label: isBn ? 'মেয়াদ শেষ' : 'Expired', value: stats.expired, color: 'from-rose-400 to-red-600', text: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-xs flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center font-black text-lg ${s.text}`}>
                📦
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black ${s.text}`}>{s.value} {isBn ? 'টি' : 'batches'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={isBn ? 'পণ্য, ব্যাচ বা সরবরাহকারী খুঁজুন...' : 'Search product, batch, supplier...'}
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-slate-50 dark:bg-slate-800 dark:text-white" 
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'ok', 'notice', 'warning', 'critical', 'expired'] as const).map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === s 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? (isBn ? 'সব' : 'All') : (isBn ? STATUS_CONFIG[s].label : STATUS_CONFIG[s].labelEn)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">পণ্য / ব্যাচ</th>
                  <th className="px-6 py-4 font-bold hidden sm:table-cell">সরবরাহকারী</th>
                  <th className="px-6 py-4 font-bold">মেয়াদ শেষ</th>
                  <th className="px-6 py-4 font-bold">অবস্থা</th>
                  <th className="px-6 py-4 text-center font-bold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      <Package size={32} className="mx-auto text-slate-300 mb-2" />
                      {isBn ? 'কোনো ব্যাচ পাওয়া যায়নি' : 'No batches found'}
                    </td>
                  </tr>
                )}
                {filtered.map(b => {
                  const st = expiryStatus(b.expiryDate);
                  const cfg = STATUS_CONFIG[st];
                  const StatusIcon = cfg.icon;
                  const days = daysUntil(b.expiryDate);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Package size={15} className={cfg.text} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-white text-xs">{b.productName}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><Hash size={9} />{b.batchNumber}</p>
                            {b.quantity && <p className="text-slate-400 text-[10px]">Qty: {b.quantity}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs">{b.supplier || '—'}</p>
                        {b.purchaseDate && <p className="text-slate-400 text-[10px]">{b.purchaseDate}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b.expiryDate || '—'}</p>
                        {days !== null && (
                          <p className={`text-[10px] font-bold mt-0.5 ${days < 0 ? 'text-rose-500' : days <= 7 ? 'text-red-500' : days <= 15 ? 'text-amber-500' : days <= 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                            {days < 0 ? `${Math.abs(days)}d ${isBn ? 'আগে শেষ' : 'ago'}` : `${days}d ${isBn ? 'বাকি' : 'left'}`}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon size={10} />{isBn ? cfg.label : cfg.labelEn}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => openEdit(b)} 
                            title={isBn ? "সম্পাদনা" : "Edit"}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 size={12} />
                            <span>{isBn ? 'এডিট' : 'Edit'}</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeletingId(b.id)} 
                            title={isBn ? "মুছে ফেলুন" : "Delete"}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        open={addOpen} 
        onClose={() => { setAddOpen(false); resetForm(); }} 
        title={isBn ? 'নতুন ব্যাচ যোগ' : 'Add New Batch'}
        subtitle={isBn ? 'পণ্যের নতুন ব্যাচ নম্বর, স্টক ও মেয়াদ সংক্রান্ত তথ্য যুক্ত করুন' : 'Record product batch number, stock and expiry schedule'}
        icon={Package}
        maxWidth="max-w-4xl"
      >
        <FormContent />
        <div className="flex items-center justify-end gap-3.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => { setAddOpen(false); resetForm(); }} 
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button 
            type="button"
            onClick={saveBatch} 
            className="px-8 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-extrabold shadow-md shadow-orange-500/25 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Batch'}</span>
          </button>
        </div>
      </Modal>

      <Modal 
        open={!!editingBatch} 
        onClose={() => { setEditingBatch(null); resetForm(); }} 
        title={isBn ? 'ব্যাচ তথ্য সম্পাদনা' : 'Edit Batch'}
        subtitle={isBn ? 'বিদ্যমান ব্যাচের তথ্য ও মেয়াদ আপডেট করুন' : 'Update existing batch info and expiry date'}
        icon={Edit2}
        maxWidth="max-w-4xl"
      >
        <FormContent />
        <div className="flex items-center justify-end gap-3.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            onClick={() => { setEditingBatch(null); resetForm(); }} 
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button 
            type="button"
            onClick={saveBatch} 
            className="px-8 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-extrabold shadow-md shadow-orange-500/25 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{isBn ? 'আপডেট করুন' : 'Update Batch'}</span>
          </button>
        </div>
      </Modal>

      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title={isBn ? 'মুছুন' : 'Delete'} maxWidth="max-w-md">
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60"><Trash2 size={20} className="text-rose-500" /></div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">{isBn ? 'ব্যাচ রেকর্ড মুছে ফেলা' : 'Delete Batch Record'}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{isBn ? 'আপনি কি নিশ্চিত এই ব্যাচ রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this batch record?'}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">{isBn ? 'বাতিল' : 'Cancel'}</button>
            <button onClick={() => { setBatches(prev => prev.filter(b => b.id !== deletingId)); setDeletingId(null); showToast(isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted'); }} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20 transition cursor-pointer">{isBn ? 'মুছুন' : 'Delete'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BatchExpiryManager;
