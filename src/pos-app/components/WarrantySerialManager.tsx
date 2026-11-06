// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck, Plus, Trash2, Edit2, Check, X, AlertCircle, Search,
  Package, Calendar, Clock, Hash, Eye, RefreshCw, Download,
  ShieldAlert, Shield, CheckCircle2, AlertTriangle, Filter, Printer
} from 'lucide-react';

interface WarrantyRecord {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  imei?: string;
  customerName?: string;
  customerPhone?: string;
  purchaseDate: string;
  warrantyMonths: number;
  warrantyExpiry: string;
  status: 'active' | 'expired' | 'claimed' | 'void';
  notes?: string;
  createdAt: string;
}

interface WarrantySerialManagerProps {
  lang?: 'bn' | 'en';
  products?: any[];
  showToast?: (msg: string, type?: string) => void;
}

const STATUS_CONFIG = {
  active:  { label: 'সক্রিয়', labelEn: 'Active',  bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  expired: { label: 'মেয়াদ শেষ', labelEn: 'Expired', bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertTriangle },
  claimed: { label: 'দাবি করা', labelEn: 'Claimed', bg: 'bg-amber-100', text: 'text-amber-700', icon: ShieldAlert },
  void:    { label: 'বাতিল', labelEn: 'Void', bg: 'bg-gray-100', text: 'text-gray-600', icon: X },
};

function daysUntilExpiry(expiryDate: string): number {
  const exp = new Date(expiryDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calcExpiry(purchaseDate: string, months: number): string {
  const d = new Date(purchaseDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function Modal({ open, onClose, title, children, maxWidth = 'max-w-3xl' }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden border border-slate-200 dark:border-slate-800 text-left`} onClick={e => e.stopPropagation()}>
        <div className="bg-[#1a73e8] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">🛡️ {title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', required = false }: any) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] transition-all"
      />
    </div>
  );
}

const DEFAULT_RECORDS: WarrantyRecord[] = [
  {
    id: 'WR-001', productId: 'IT020027', productName: 'XIAOMI REDMI NOTE 13',
    serialNumber: 'XR13-DH-20240510-001', imei: '860123456789012',
    customerName: 'Jahidul Islam', customerPhone: '01712345678',
    purchaseDate: '2026-05-10', warrantyMonths: 12,
    warrantyExpiry: '2027-05-10', status: 'active', createdAt: '2026-05-10'
  },
  {
    id: 'WR-002', productId: 'IT020025', productName: 'FLYX MAX 2',
    serialNumber: 'FM2-KA-20240301-005', imei: '861234567890123',
    customerName: 'Farhana Yeasmin', customerPhone: '01923456789',
    purchaseDate: '2025-03-01', warrantyMonths: 6,
    warrantyExpiry: '2025-09-01', status: 'expired', createdAt: '2025-03-01'
  },
  {
    id: 'WR-003', productId: 'IT020023', productName: '18W EXTREME QUICK CHARGER',
    serialNumber: 'EQC-18W-20240215-012', imei: '',
    customerName: 'Tanvir Rahman', customerPhone: '01534567890',
    purchaseDate: '2026-02-15', warrantyMonths: 6,
    warrantyExpiry: '2026-08-15', status: 'claimed',
    notes: 'Claimed due to overheating issue', createdAt: '2026-02-15'
  },
];

export const WarrantySerialManager = ({
  lang = 'bn',
  products = [],
  showToast: externalToast
}: WarrantySerialManagerProps) => {
  const isBn = lang === 'bn';

  const [records, setRecords] = useState<WarrantyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('roni_warranty_records_v1') || localStorage.getItem('roni_serial_records_v1');
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return DEFAULT_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('roni_warranty_records_v1', JSON.stringify(records));
      localStorage.setItem('roni_serial_records_v1', JSON.stringify(records));
    } catch {}
  }, [records]);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (externalToast) { externalToast(msg, type); return; }
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'claimed' | 'void'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WarrantyRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<WarrantyRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [fProductName, setFProductName] = useState('');
  const [fSerial, setFSerial] = useState('');
  const [fImei, setFImei] = useState('');
  const [fCustName, setFCustName] = useState('');
  const [fCustPhone, setFCustPhone] = useState('');
  const [fPurchaseDate, setFPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [fMonths, setFMonths] = useState('12');
  const [fStatus, setFStatus] = useState<WarrantyRecord['status']>('active');
  const [fNotes, setFNotes] = useState('');

  const resetForm = () => {
    setFProductName(''); setFSerial(''); setFImei(''); setFCustName('');
    setFCustPhone(''); setFPurchaseDate(new Date().toISOString().slice(0, 10));
    setFMonths('12'); setFStatus('active'); setFNotes('');
  };

  const openEdit = (r: WarrantyRecord) => {
    setEditingRecord(r);
    setFProductName(r.productName); setFSerial(r.serialNumber); setFImei(r.imei || '');
    setFCustName(r.customerName || ''); setFCustPhone(r.customerPhone || '');
    setFPurchaseDate(r.purchaseDate); setFMonths(String(r.warrantyMonths));
    setFStatus(r.status); setFNotes(r.notes || '');
  };

  const saveRecord = () => {
    if (!fProductName.trim() || !fSerial.trim()) {
      showToast(isBn ? 'পণ্যের নাম ও সিরিয়াল নম্বর আবশ্যিক' : 'Product name and serial number required', 'error'); return;
    }
    const expiry = calcExpiry(fPurchaseDate, Number(fMonths) || 12);
    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id
        ? { ...r, productName: fProductName, serialNumber: fSerial, imei: fImei, customerName: fCustName, customerPhone: fCustPhone, purchaseDate: fPurchaseDate, warrantyMonths: Number(fMonths) || 12, warrantyExpiry: expiry, status: fStatus, notes: fNotes }
        : r));
      showToast(isBn ? 'ওয়ারেন্টি আপডেট হয়েছে' : 'Warranty updated');
      setEditingRecord(null);
    } else {
      const newRec: WarrantyRecord = {
        id: 'WR-' + String(Date.now()).slice(-6),
        productId: products.find((p: any) => p.name === fProductName)?.id || '',
        productName: fProductName, serialNumber: fSerial, imei: fImei,
        customerName: fCustName, customerPhone: fCustPhone,
        purchaseDate: fPurchaseDate, warrantyMonths: Number(fMonths) || 12,
        warrantyExpiry: expiry, status: fStatus, notes: fNotes,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setRecords(prev => [newRec, ...prev]);
      showToast(isBn ? 'নতুন ওয়ারেন্টি যোগ হয়েছে' : 'Warranty added');
      setAddOpen(false);
    }
    resetForm();
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
    showToast(isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.productName.toLowerCase().includes(q) || r.serialNumber.toLowerCase().includes(q) || (r.imei || '').includes(q) || (r.customerName || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter(r => r.status === 'active').length,
    expired: records.filter(r => r.status === 'expired').length,
    expiringSoon: records.filter(r => r.status === 'active' && daysUntilExpiry(r.warrantyExpiry) <= 30 && daysUntilExpiry(r.warrantyExpiry) >= 0).length,
  }), [records]);

  const FormContent = () => (
    <div className="space-y-4 text-left font-sans">
      {/* Row 1: Product Selection & Manual Product Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isBn ? 'পণ্যের নাম' : 'Product Name'} <span className="text-rose-500">*</span>
          </label>
          {products.length > 0 ? (
            <select
              value={fProductName}
              onChange={e => setFProductName(e.target.value)}
              className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            >
              <option value="">{isBn ? '-- লিস্ট থেকে পণ্য নির্বাচন করুন --' : '-- Select Product from List --'}</option>
              {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
              <option value={fProductName}>{fProductName || (isBn ? 'অন্যান্য (ম্যানুয়াল ইনপুট)' : 'Manual Name Input')}</option>
            </select>
          ) : (
            <InputField label="" value={fProductName} onChange={setFProductName} placeholder={isBn ? 'পণ্যের নাম লিখুন' : 'Product name'} />
          )}
        </div>

        <div>
          <InputField
            label={isBn ? 'ম্যানুয়াল পণ্য নাম (যদি লিস্টে না থাকে)' : 'Manual Product Name (Optional)'}
            value={fProductName}
            onChange={setFProductName}
            placeholder={isBn ? 'যেমন: Xiaomi Redmi Note 13' : 'e.g. Xiaomi Redmi Note 13'}
          />
        </div>
      </div>

      {/* Row 2: Serial Number, IMEI Number, Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label={isBn ? 'সিরিয়াল নম্বর (Serial Number)' : 'Serial Number'}
          value={fSerial}
          onChange={setFSerial}
          placeholder="SN-XXXX-YYYY"
          required
        />
        <InputField
          label={isBn ? 'IMEI (ঐচ্ছিক)' : 'IMEI (Optional)'}
          value={fImei}
          onChange={setFImei}
          placeholder="15-Digit IMEI Code"
        />
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isBn ? 'ওয়ারেন্টি স্ট্যাটাস' : 'Status'}</label>
          <select
            value={fStatus}
            onChange={e => setFStatus(e.target.value as any)}
            className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{isBn ? v.label : v.labelEn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Customer Name, Phone Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={isBn ? 'গ্রাহকের নাম' : 'Customer Name'}
          value={fCustName}
          onChange={setFCustName}
          placeholder={isBn ? 'যেমন: জাহেদুল ইসলাম' : 'e.g. Jahidul Islam'}
        />
        <InputField
          label={isBn ? 'ফোন নম্বর' : 'Phone Number'}
          value={fCustPhone}
          onChange={setFCustPhone}
          placeholder="017XXXXXXXX"
          type="tel"
        />
      </div>

      {/* Row 4: Purchase Date, Warranty Duration, Calculated Expiry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <InputField
          label={isBn ? 'ক্রয়ের তারিখ' : 'Purchase Date'}
          value={fPurchaseDate}
          onChange={setFPurchaseDate}
          type="date"
        />
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isBn ? 'ওয়ারেন্টি মেয়াদ (মাস)' : 'Warranty Period (Months)'}</label>
          <select
            value={fMonths}
            onChange={e => setFMonths(e.target.value)}
            className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
          >
            {[1, 3, 6, 9, 12, 18, 24, 36].map(m => (
              <option key={m} value={m}>{m} {isBn ? 'মাস' : 'months'}</option>
            ))}
          </select>
        </div>
        <div className="bg-[#e8f0fe] dark:bg-blue-950/40 border border-[#aecbfa] dark:border-blue-900/40 rounded-xl p-2.5 text-xs text-[#1a73e8] dark:text-blue-300 font-bold flex flex-col justify-center h-10">
          <span>📅 {isBn ? 'মেয়াদ শেষ হবে:' : 'Warranty Expires:'}</span>
          <span className="font-mono text-sm text-[#1557b0] dark:text-blue-200">{calcExpiry(fPurchaseDate, Number(fMonths) || 12)}</span>
        </div>
      </div>

      {/* Row 5: Notes */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isBn ? 'নোট / অতিরিক্ত তথ্য' : 'Notes / Additional Information'}</label>
        <textarea
          value={fNotes}
          onChange={e => setFNotes(e.target.value)}
          rows={2}
          placeholder={isBn ? 'যেকোনো অতিরিক্ত মন্তব্য বা ক্লেইম সংক্রান্ত বিবরণ লিখুন...' : 'Additional notes...'}
          className="w-full px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 text-left animate-fade-in font-sans">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-slate-800 text-lg sm:text-xl font-sans tracking-tight flex items-center gap-2">
              <ShieldCheck size={22} className="text-purple-600" />
              {isBn ? 'ওয়ারেন্টি ও সিরিয়াল ম্যানেজার' : 'Warranty & Serial Manager'}
            </h1>
            <span className="text-gray-400 text-xs font-normal">
              {isBn ? 'পণ্যের ওয়ারেন্টি ও সিরিয়াল নম্বর ট্র্যাক করুন' : 'Track product warranties and serial numbers'}
            </span>
          </div>
          <button 
            onClick={() => { resetForm(); setAddOpen(true); }}
            className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
          >
            <Plus size={16} />
            <span>{isBn ? 'নতুন ওয়ারেন্টি' : 'Add Warranty'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isBn ? 'মোট রেকর্ড' : 'Total', value: stats.total, color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { label: isBn ? 'সক্রিয়' : 'Active', value: stats.active, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: isBn ? 'মেয়াদ শেষ' : 'Expired', value: stats.expired, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-600' },
            { label: isBn ? 'শীঘ্রই শেষ' : 'Expiring Soon', value: stats.expiringSoon, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={isBn ? 'পণ্য, সিরিয়াল বা গ্রাহক খুঁজুন...' : 'Search product, serial, customer...'}
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50" />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'expired', 'claimed', 'void'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? 'bg-purple-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s === 'all' ? (isBn ? 'সব' : 'All') : isBn ? STATUS_CONFIG[s].label : STATUS_CONFIG[s].labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">পণ্য / সিরিয়াল</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs hidden md:table-cell">গ্রাহক</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">ওয়ারেন্টি মেয়াদ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
                    {isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No records found'}
                  </td></tr>
                )}
                {filtered.map(r => {
                  const days = daysUntilExpiry(r.warrantyExpiry);
                  const cfg = STATUS_CONFIG[r.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={r.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">{r.productName}</p>
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                              <Hash size={9} /> {r.serialNumber}
                            </p>
                            {r.imei && <p className="text-gray-400 text-[10px]">IMEI: {r.imei}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700 text-xs font-medium">{r.customerName || '—'}</p>
                        <p className="text-gray-400 text-xs">{r.customerPhone || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-700">{r.warrantyExpiry}</p>
                        {r.status === 'active' && (
                          <p className={`text-[10px] font-semibold mt-0.5 ${days <= 0 ? 'text-rose-500' : days <= 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {days <= 0 ? (isBn ? 'মেয়াদ শেষ' : 'Expired') : `${days}d ${isBn ? 'বাকি' : 'left'}`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon size={10} />
                          {isBn ? cfg.label : cfg.labelEn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => {
                              var nextStatus = r.status === 'claimed' ? 'active' : 'claimed';
                              var msg = nextStatus === 'claimed' 
                                ? (isBn ? `"${r.productName}" এর ওয়ারেন্টি ক্লেইম রেকর্ড করা হয়েছে!` : `Warranty claimed for "${r.productName}"!`)
                                : (isBn ? `"${r.productName}" সক্রিয় অবস্থায় ফিরিয়ে নেওয়া হয়েছে!` : `Restored to active!`);
                              setRecords(prev => prev.map(x => x.id === r.id ? { ...x, status: nextStatus } : x));
                              showToast(msg, 'success');
                            }} 
                            title={isBn ? "ওয়ারেন্টি ক্লেইম টগল করুন" : "Toggle Warranty Claim"}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-purple-200"
                          >
                            <ShieldCheck size={12} />
                            <span>{r.status === 'claimed' ? (isBn ? 'সক্রিয় করুন' : 'Activate') : (isBn ? 'ক্লেইম' : 'Claim')}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              window.print();
                            }} 
                            title={isBn ? "ওয়ারেন্টি কার্ড প্রিন্ট করুন" : "Print Warranty Slip"}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            <Printer size={13} />
                          </button>

                          <button 
                            type="button"
                            onClick={() => openEdit(r)} 
                            title={isBn ? "সম্পাদনা" : "Edit"}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button 
                            type="button"
                            onClick={() => setDeletingId(r.id)} 
                            title={isBn ? "মুছে ফেলুন" : "Delete"}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
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

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm(); }} title={isBn ? 'নতুন ওয়ারেন্টি যোগ' : 'Add Warranty'} maxWidth="max-w-4xl">
        <FormContent />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setAddOpen(false); resetForm(); }}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={saveRecord}
            className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={15} />
            {isBn ? 'সংরক্ষণ করুন' : 'Save Warranty'}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingRecord} onClose={() => { setEditingRecord(null); resetForm(); }} title={isBn ? 'ওয়ারেন্টি সম্পাদনা' : 'Edit Warranty'} maxWidth="max-w-4xl">
        <FormContent />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setEditingRecord(null); resetForm(); }}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={saveRecord}
            className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={15} />
            {isBn ? 'আপডেট করুন' : 'Update Warranty'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewingRecord} onClose={() => setViewingRecord(null)} title={isBn ? 'ওয়ারেন্টির বিবরণ' : 'Warranty Details'}>
        {viewingRecord && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${STATUS_CONFIG[viewingRecord.status].bg}`}>
              <ShieldCheck size={28} className={STATUS_CONFIG[viewingRecord.status].text} />
              <div>
                <p className="font-bold text-gray-800">{viewingRecord.productName}</p>
                <p className={`text-xs font-semibold ${STATUS_CONFIG[viewingRecord.status].text}`}>
                  {isBn ? STATUS_CONFIG[viewingRecord.status].label : STATUS_CONFIG[viewingRecord.status].labelEn}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: isBn ? 'সিরিয়াল নম্বর' : 'Serial No.', value: viewingRecord.serialNumber },
                { label: 'IMEI', value: viewingRecord.imei || '—' },
                { label: isBn ? 'গ্রাহক' : 'Customer', value: viewingRecord.customerName || '—' },
                { label: isBn ? 'ফোন' : 'Phone', value: viewingRecord.customerPhone || '—' },
                { label: isBn ? 'ক্রয়ের তারিখ' : 'Purchase Date', value: viewingRecord.purchaseDate },
                { label: isBn ? 'মেয়াদ শেষ' : 'Expiry', value: viewingRecord.warrantyExpiry },
                { label: isBn ? 'ওয়ারেন্টি' : 'Warranty', value: `${viewingRecord.warrantyMonths} ${isBn ? 'মাস' : 'months'}` },
                { label: isBn ? 'রেকর্ড আইডি' : 'Record ID', value: viewingRecord.id },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>
            {viewingRecord.notes && (
              <div className="bg-amber-50 rounded-xl p-3 text-xs">
                <p className="font-semibold text-gray-500 mb-1">{isBn ? 'নোট' : 'Notes'}</p>
                <p className="text-gray-700">{viewingRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title={isBn ? 'রেকর্ড মুছুন' : 'Delete Record'}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto"><Trash2 size={20} className="text-rose-500" /></div>
          <p className="text-gray-600 text-sm">{isBn ? 'এই ওয়ারেন্টি রেকর্ড মুছতে চান?' : 'Delete this warranty record?'}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">{isBn ? 'বাতিল' : 'Cancel'}</button>
            <button onClick={() => deleteRecord(deletingId!)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600">{isBn ? 'মুছুন' : 'Delete'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WarrantySerialManager;

