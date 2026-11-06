// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { SummaryCard } from './SummaryCard';
import {
  Users, Search, Plus, Edit2, Trash2, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, Eye, Download, Upload, X, Check,
  AlertCircle, TrendingUp, CreditCard, UserCheck, Building2,
  Filter, RefreshCw, ArrowUpDown, FileText, DollarSign
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  totalPurchase: number;
  dueAmount: number;
  createdAt?: string;
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  mobile: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  openingBalance: number;
  notes?: string;
  createdAt?: string;
}

interface ContactsProps {
  initialSubTab?: string;
  setActiveTab?: (tab: string) => void;
}

const defaultCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Jahidul Islam', phone: '01712345678', email: 'jahid@gmail.com', address: 'ঢাকা', totalPurchase: 24500, dueAmount: 1200, createdAt: '2026-05-10' },
  { id: 'CUST-002', name: 'Farhana Yeasmin', phone: '01923456789', email: 'farhana@gmail.com', address: 'চট্টগ্রাম', totalPurchase: 2600, dueAmount: 0, createdAt: '2026-05-15' },
  { id: 'CUST-003', name: 'Tanvir Rahman', phone: '01534567890', email: 'tanvir@gmail.com', address: 'সিলেট', totalPurchase: 0, dueAmount: 450, createdAt: '2026-05-20' },
  { id: 'CUST-004', name: 'Mizanur Shuvo', phone: '01845678901', email: 'mizan@gmail.com', address: 'রাজশাহী', totalPurchase: 8250, dueAmount: 2200, createdAt: '2026-06-01' },
  { id: 'CUST-005', name: 'Sultana Kamal', phone: '01356789012', email: 'sultana@gmail.com', address: 'খুলনা', totalPurchase: 0, dueAmount: 0, createdAt: '2026-06-05' },
  { id: 'CUST-006', name: 'Kamrul Hasan', phone: '01667890123', email: 'kamrul@gmail.com', address: 'বরিশাল', totalPurchase: 2850, dueAmount: 1100, createdAt: '2026-06-10' },
];

const defaultSuppliers: Supplier[] = [
  { id: 'SUPP-001', name: 'Unique Wholesalers Ltd', mobile: '+8801711223344', email: 'wholesaler@example.com', address: 'Motijheel C/A', city: 'Dhaka', country: 'Bangladesh', openingBalance: 25000, createdAt: '2026-05-31' },
  { id: 'SUPP-002', name: 'Dhaka Mobile House', mobile: '+8801811334455', email: 'dmh@example.com', address: 'Elephant Road', city: 'Dhaka', country: 'Bangladesh', openingBalance: 12000, createdAt: '2026-06-01' },
  { id: 'SUPP-003', name: 'Telecom Parts BD', mobile: '+8801511445566', email: 'tpbd@example.com', address: 'Banani', city: 'Dhaka', country: 'Bangladesh', openingBalance: 8500, createdAt: '2026-06-10' },
];

type SortField = 'name' | 'phone' | 'totalPurchase' | 'dueAmount';

function Modal({ open, onClose, title, children, maxWidth = 'max-w-3xl' }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden border border-slate-200 dark:border-slate-800 text-left`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1a73e8] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">👤 {title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] transition-all"
      />
    </div>
  );
}

export const Contacts = ({
  initialSubTab = 'customers',
  setActiveTab,
  customers: externalCustomers,
  setCustomers: externalSetCustomers,
  suppliers: externalSuppliers,
  setSuppliers: externalSetSuppliers,
  sales = [],
  purchases = [],
  showToast: externalToast,
  lang = 'bn'
}: ContactsProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers' | 'transactions'>(
    (initialSubTab === 'suppliers' || initialSubTab === 'contacts-import-suppliers') ? 'suppliers'
    : (initialSubTab === 'contacts_transactions' || initialSubTab === 'transactions') ? 'transactions'
    : 'customers'
  );
  
  // Customers state (fallback to local if not passed)
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('roni_contacts_customers_v1');
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return defaultCustomers;
  });

  // Suppliers state (fallback to local if not passed)
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('roni_contacts_suppliers_v1');
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p; }
    } catch {}
    return defaultSuppliers;
  });

  const customers = externalCustomers ?? localCustomers;
  const setCustomers = externalSetCustomers ?? setLocalCustomers;
  const suppliers = externalSuppliers ?? localSuppliers;
  const setSuppliers = externalSetSuppliers ?? setLocalSuppliers;

  // Persist to localStorage if using local fallback
  useEffect(() => {
    if (!externalCustomers) {
      try { localStorage.setItem('roni_contacts_customers_v1', JSON.stringify(customers)); } catch {}
    }
  }, [customers, externalCustomers]);

  useEffect(() => {
    if (!externalSuppliers) {
      try { localStorage.setItem('roni_contacts_suppliers_v1', JSON.stringify(suppliers)); } catch {}
    }
  }, [suppliers, externalSuppliers]);

  const [dueOnly, setDueOnly] = useState(initialSubTab === 'contacts_dues');
  const [collectingDueCust, setCollectingDueCust] = useState<Customer | null>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectPaymentMethod, setCollectPaymentMethod] = useState<'Cash' | 'bKash' | 'Bank' | 'Other'>('Cash');
  const [collectNote, setCollectNote] = useState('');

  // Sync activeSubTab & dueOnly when initialSubTab prop changes (e.g. from sidebar clicks)
  useEffect(() => {
    if (initialSubTab === 'suppliers' || initialSubTab === 'contacts-import-suppliers' || initialSubTab === 'contacts_suppliers') {
      setActiveSubTab('suppliers');
      setDueOnly(false);
    } else if (initialSubTab === 'contacts_dues') {
      setActiveSubTab('customers');
      setDueOnly(true);
    } else if (initialSubTab === 'contacts_transactions' || initialSubTab === 'transactions') {
      setActiveSubTab('transactions');
      setDueOnly(false);
    } else if (initialSubTab === 'customers' || initialSubTab === 'contacts_customers') {
      setActiveSubTab('customers');
      setDueOnly(false);
    }
  }, [initialSubTab]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Modal states - Customer
  const [addCustOpen, setAddCustOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [viewingCust, setViewingCust] = useState<Customer | null>(null);
  const [deletingCustId, setDeletingCustId] = useState<string | null>(null);

  // Customer form fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Modal states - Supplier
  const [addSuppOpen, setAddSuppOpen] = useState(false);
  const [editingSupp, setEditingSupp] = useState<Supplier | null>(null);
  const [viewingSupp, setViewingSupp] = useState<Supplier | null>(null);
  const [deletingSuppId, setDeletingSuppId] = useState<string | null>(null);

  // Supplier form fields
  const [suppName, setSuppName] = useState('');
  const [suppMobile, setSuppMobile] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [suppAddress, setSuppAddress] = useState('');
  const [suppCity, setSuppCity] = useState('');
  const [suppCountry, setSuppCountry] = useState('Bangladesh');
  const [suppBalance, setSuppBalance] = useState('0');
  const [suppNotes, setSuppNotes] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset form
  const resetCustForm = () => {
    setCustName(''); setCustPhone(''); setCustEmail('');
    setCustAddress(''); setCustNotes('');
  };
  const resetSuppForm = () => {
    setSuppName(''); setSuppMobile(''); setSuppEmail('');
    setSuppAddress(''); setSuppCity(''); setSuppCountry('Bangladesh');
    setSuppBalance('0'); setSuppNotes('');
  };

  // Fill edit form
  const openEditCust = (c: Customer) => {
    setEditingCust(c);
    setCustName(c.name); setCustPhone(c.phone); setCustEmail(c.email);
    setCustAddress(c.address || ''); setCustNotes(c.notes || '');
  };
  const openEditSupp = (s: Supplier) => {
    setEditingSupp(s);
    setSuppName(s.name); setSuppMobile(s.mobile); setSuppEmail(s.email);
    setSuppAddress(s.address || ''); setSuppCity(s.city || '');
    setSuppCountry(s.country || 'Bangladesh'); setSuppBalance(String(s.openingBalance));
    setSuppNotes(s.notes || '');
  };

  // Save Customer
  const saveCust = () => {
    if (!custName.trim() || !custPhone.trim()) { showToast('নাম ও ফোন নম্বর আবশ্যিক', 'error'); return; }
    if (editingCust) {
      setCustomers(prev => prev.map(c => c.id === editingCust.id
        ? { ...c, name: custName, phone: custPhone, email: custEmail, address: custAddress, notes: custNotes }
        : c));
      showToast('গ্রাহক আপডেট হয়েছে');
      setEditingCust(null);
    } else {
      const newCust: Customer = {
        id: 'CUST-' + String(Date.now()).slice(-6),
        name: custName, phone: custPhone, email: custEmail,
        address: custAddress, notes: custNotes,
        totalPurchase: 0, dueAmount: 0,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setCustomers(prev => [newCust, ...prev]);
      showToast('নতুন গ্রাহক যোগ হয়েছে');
      setAddCustOpen(false);
    }
    resetCustForm();
  };

  // Delete Customer
  const deleteCust = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeletingCustId(null);
    showToast('গ্রাহক মুছে ফেলা হয়েছে');
  };

  // Save Supplier
  const saveSupp = () => {
    if (!suppName.trim() || !suppMobile.trim()) { showToast('নাম ও মোবাইল আবশ্যিক', 'error'); return; }
    if (editingSupp) {
      setSuppliers(prev => prev.map(s => s.id === editingSupp.id
        ? { ...s, name: suppName, mobile: suppMobile, email: suppEmail, address: suppAddress, city: suppCity, country: suppCountry, openingBalance: Number(suppBalance) || 0, notes: suppNotes }
        : s));
      showToast('সরবরাহকারী আপডেট হয়েছে');
      setEditingSupp(null);
    } else {
      const newSupp: Supplier = {
        id: 'SUPP-' + String(Date.now()).slice(-6),
        name: suppName, mobile: suppMobile, email: suppEmail,
        address: suppAddress, city: suppCity, country: suppCountry,
        openingBalance: Number(suppBalance) || 0, notes: suppNotes,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setSuppliers(prev => [newSupp, ...prev]);
      showToast('নতুন সরবরাহকারী যোগ হয়েছে');
      setAddSuppOpen(false);
    }
    resetSuppForm();
  };

  // Delete Supplier
  const deleteSupp = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setDeletingSuppId(null);
    showToast('সরবরাহকারী মুছে ফেলা হয়েছে');
  };

  // Collect Due Payment
  const handleCollectDue = () => {
    if (!collectingDueCust) return;
    const payVal = Number(collectAmount);
    if (!payVal || payVal <= 0) {
      showToast('অনুগ্রহ করে সঠিক জমার পরিমাণ প্রদান করুন', 'error');
      return;
    }
    const payAmt = Math.min(payVal, collectingDueCust.dueAmount);
    setCustomers(prev => prev.map(c => {
      if (c.id === collectingDueCust.id) {
        return { ...c, dueAmount: Math.max(0, c.dueAmount - payAmt) };
      }
      return c;
    }));
    showToast(`✅ ${collectingDueCust.name} এর ৳${payAmt.toLocaleString()} বকেয়া আদায় সম্পন্ন হয়েছে!`);
    setCollectingDueCust(null);
    setCollectAmount('');
    setCollectNote('');
  };

  // Sorting
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Filtered & sorted Customers
  const filteredCustomers = useMemo(() => {
    let list = customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchDue = dueOnly ? c.dueAmount > 0 : true;
      return matchSearch && matchDue;
    });
    list = list.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [customers, search, dueOnly, sortField, sortDir]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  // All combined transactions (Sales & Purchases)
  const allTransactions = useMemo(() => {
    const list: any[] = [];
    (sales || []).forEach((s: any) => {
      list.push({
        id: s.id || `SL-${Date.now()}`,
        date: s.date || new Date().toISOString(),
        partyName: s.customerName || 'ওয়াক-ইন কাস্টমার',
        partyType: 'Customer',
        type: 'Sale',
        amount: Number(s.totalPrice || s.totalAmount || 0),
        paidAmount: Number(s.paidAmount || s.totalPrice || 0),
        dueAmount: Math.max(0, Number(s.totalPrice || 0) - Number(s.paidAmount || s.totalPrice || 0)),
        paymentMethod: s.paymentMethod || 'Cash',
        status: s.paymentStatus || (Number(s.dueAmount) > 0 ? 'DUE' : 'PAID')
      });
    });
    (purchases || []).forEach((p: any) => {
      list.push({
        id: p.id || `PUR-${Date.now()}`,
        date: p.date || new Date().toISOString(),
        partyName: p.supplierName || 'সরবরাহকারী',
        partyType: 'Supplier',
        type: 'Purchase',
        amount: Number(p.totalAmount || p.totalPrice || 0),
        paidAmount: Number(p.paidAmount || p.totalAmount || 0),
        dueAmount: Number(p.dueAmount || 0),
        paymentMethod: p.paymentMethod || 'Cash',
        status: p.paymentStatus || 'PAID'
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, purchases]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t =>
      t.partyName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allTransactions, search]);

  // Pagination
  const totalPages = activeSubTab === 'customers'
    ? Math.ceil(filteredCustomers.length / perPage)
    : activeSubTab === 'suppliers'
    ? Math.ceil(filteredSuppliers.length / perPage)
    : Math.ceil(filteredTransactions.length / perPage);

  const pagedCustomers = filteredCustomers.slice((page - 1) * perPage, page * perPage);
  const pagedSuppliers = filteredSuppliers.slice((page - 1) * perPage, page * perPage);
  const pagedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  // Stats
  const totalDue = customers.reduce((s, c) => s + c.dueAmount, 0);
  const totalRevenue = customers.reduce((s, c) => s + c.totalPurchase, 0);

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown size={12} className={`ml-1 inline ${sortField === field ? 'text-indigo-500' : 'text-gray-400'}`} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-6 font-sans text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#7c3aed]">
                <Users size={22} />
              </span>
              {lang === 'bn' ? 'যোগাযোগ ব্যবস্থাপনা' : 'Contact Management'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn' ? 'গ্রাহক ও সরবরাহকারীদের সম্পূর্ণ তালিকা পরিচালনা করুন' : 'Manage your complete list of customers & suppliers'}
            </p>
          </div>
          <button
            onClick={() => activeSubTab === 'customers' ? (resetCustForm(), setAddCustOpen(true)) : (resetSuppForm(), setAddSuppOpen(true))}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={16} />
            {activeSubTab === 'customers' 
              ? (lang === 'bn' ? 'নতুন গ্রাহক' : 'Add New Customer')
              : (lang === 'bn' ? 'নতুন সরবরাহকারী' : 'Add New Supplier')}
          </button>
        </div>

        {/* Stats Summary Cards Grid */}
        {activeSubTab === 'customers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard 
              icon={<Users className="w-5 h-5" />} 
              label={lang === 'bn' ? 'মোট গ্রাহক' : 'Total Customers'} 
              value={customers.length.toString()} 
              tone="blue"
            />
            <SummaryCard 
              icon={<TrendingUp className="w-5 h-5" />} 
              label={lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'} 
              value={`৳${totalRevenue.toLocaleString()}`} 
              tone="emerald"
            />
            <SummaryCard 
              icon={<CreditCard className="w-5 h-5" />} 
              label={lang === 'bn' ? 'মোট বকেয়া' : 'Total Due'} 
              value={`৳${totalDue.toLocaleString()}`} 
              tone="rose"
            />
            <SummaryCard 
              icon={<AlertCircle className="w-5 h-5" />} 
              label={lang === 'bn' ? 'বকেয়া আছে' : 'Due Customers'} 
              value={`${customers.filter(c => c.dueAmount > 0).length} ${lang === 'bn' ? 'জন' : 'Ppl'}`} 
              tone="amber"
            />
          </div>
        )}

        {activeSubTab === 'suppliers' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f5f3ff] dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'মোট সরবরাহকারী' : 'Total Suppliers'}</span>
                <p className="text-2xl font-bold text-[#7c3aed]">{suppliers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shadow-xs">
                <Building2 size={18} />
              </div>
            </div>

            <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'মোট পূর্ববর্তী পাওনা' : 'Total Opening Balance'}</span>
                <p className="text-2xl font-bold text-[#059669]">৳{suppliers.reduce((s, sup) => s + sup.openingBalance, 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                <DollarSign size={18} />
              </div>
            </div>

            <div className="bg-[#f0f9ff] dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'সক্রিয় সরবরাহকারী' : 'Active Suppliers'}</span>
                <p className="text-2xl font-bold text-[#0284c7]">{suppliers.length} {lang === 'bn' ? 'টি' : ''}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                <UserCheck size={18} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Search Card Block */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-5 space-y-4 font-sans">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Sub Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 flex-wrap">
              {[
                { id: 'customers', label: lang === 'bn' ? 'গ্রাহক' : 'Customers', icon: Users, count: customers.length },
                { id: 'suppliers', label: lang === 'bn' ? 'সরবরাহকারী' : 'Suppliers', icon: Building2, count: suppliers.length },
                { id: 'transactions', label: lang === 'bn' ? 'লেনদেন ইতিহাস' : 'Transaction History', icon: FileText, count: allTransactions.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveSubTab(tab.id as any); setSearch(''); setPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === tab.id 
                      ? 'bg-white dark:bg-slate-900 text-[#7c3aed] shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeSubTab === tab.id ? 'bg-purple-100 dark:bg-purple-950 text-[#7c3aed]' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Filter Pill for Dues */}
            {activeSubTab === 'customers' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setDueOnly(false); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    !dueOnly ? 'bg-[#7c3aed] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Users size={13} />
                  <span>{lang === 'bn' ? `সকল গ্রাহক (${customers.length})` : `All Customers (${customers.length})`}</span>
                </button>
                <button
                  onClick={() => { setDueOnly(true); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    dueOnly ? 'bg-[#e11d48] text-white shadow-xs' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-300'
                  }`}
                >
                  <AlertCircle size={13} />
                  <span>{lang === 'bn' ? `শুধুমাত্র বকেয়া (${customers.filter(c => c.dueAmount > 0).length} জন)` : `Dues Only (${customers.filter(c => c.dueAmount > 0).length})`}</span>
                </button>
              </div>
            )}

            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? "নাম, ফোন বা ইমেইল খুঁজুন..." : "Search name, phone or email..."}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
              {search && (
                <button onClick={() => setSearch('')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Customer Table */}
          {activeSubTab === 'customers' && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs cursor-pointer" onClick={() => toggleSort('name')}>
                      {lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'} <SortIcon field="name" />
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'ফোন' : 'Phone'}</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">{lang === 'bn' ? 'ইমেইল' : 'Email'}</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 dark:text-slate-400 text-xs cursor-pointer" onClick={() => toggleSort('totalPurchase')}>
                      {lang === 'bn' ? 'মোট ক্রয়' : 'Total Purchase'} <SortIcon field="totalPurchase" />
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 dark:text-slate-400 text-xs cursor-pointer" onClick={() => toggleSort('dueAmount')}>
                      {lang === 'bn' ? 'বকেয়া' : 'Due Amount'} <SortIcon field="dueAmount" />
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pagedCustomers.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-semibold">{lang === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No customers found'}</td></tr>
                  )}
                  {pagedCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#7c3aed] transition-colors font-semibold">
                          <Phone size={12} />
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{c.email || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-200">৳{c.totalPurchase.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.dueAmount > 0 ? (
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-200/60 dark:border-rose-900/40">
                            ৳{c.dueAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200/60 dark:border-emerald-900/40">পরিশোধিত</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {c.dueAmount > 0 && (
                            <>
                              <button
                                onClick={() => { setCollectingDueCust(c); setCollectAmount(String(c.dueAmount)); }}
                                title="বকেয়া আদায় করুন"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                              >
                                <DollarSign size={13} />
                                <span>আদায়</span>
                              </button>
                              <a
                                href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${c.name}, রনি টেলিকম-এ আপনার ৳${c.dueAmount.toLocaleString()} টাকা বকেয়া রয়েছে। অনুগ্রহ করে বকেয়া পরিশোধ করার অনুরোধ করা হচ্ছে। ধন্যবাদ!`)}`}
                                target="_blank"
                                rel="noreferrer"
                                title="হোয়াটসঅ্যাপ রিমাইন্ডার পাঠান"
                                className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 transition"
                              >
                                📱
                              </a>
                            </>
                          )}
                          <button onClick={() => setViewingCust(c)} title="দেখুন" className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-500 transition cursor-pointer">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEditCust(c)} title="সম্পাদনা" className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-500 transition cursor-pointer">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeletingCustId(c.id)} title="মুছুন" className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Supplier Table */}
          {activeSubTab === 'suppliers' && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">{lang === 'bn' ? 'সরবরাহকারীর নাম' : 'Supplier Name'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs">{lang === 'bn' ? 'মোবাইল' : 'Mobile'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs hidden md:table-cell">{lang === 'bn' ? 'ইমেইল' : 'Email'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 text-xs hidden lg:table-cell">{lang === 'bn' ? 'শহর' : 'City'}</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-500 text-xs">{lang === 'bn' ? 'পূর্ববর্তী পাওনা' : 'Opening Balance'}</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 text-xs">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedSuppliers.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">{lang === 'bn' ? 'কোনো সরবরাহকারী পাওয়া যায়নি' : 'No suppliers found'}</td></tr>
                  )}
                  {pagedSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-violet-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${s.mobile}`} className="flex items-center gap-1 text-gray-600 hover:text-violet-600 transition-colors">
                          <Phone size={12} />
                          {s.mobile}
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-500 text-xs">{s.email || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <MapPin size={11} /> {s.city || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.openingBalance > 0 ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'}`}>
                          ৳{s.openingBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewingSupp(s)} title={lang === 'bn' ? "দেখুন" : "View"} className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEditSupp(s)} title={lang === 'bn' ? "সম্পাদনা" : "Edit"} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeletingSuppId(s.id)} title={lang === 'bn' ? "মুছুন" : "Delete"} className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transaction History Table */}
          {activeSubTab === 'transactions' && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'ইনভয়েস / রেফারেন্স' : 'Invoice / Ref'}</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'গ্রাহক / সরবরাহকারী' : 'Customer / Supplier'}</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'ধরন' : 'Type'}</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'}</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 dark:text-slate-400 text-xs">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pagedTransactions.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-semibold">{lang === 'bn' ? 'কোনো লেনদেনের ইতিহাস পাওয়া যায়নি' : 'No transaction history found'}</td></tr>
                  )}
                  {pagedTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {t.date ? String(t.date).slice(0, 10) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          #{t.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${t.partyType === 'Supplier' ? 'bg-purple-600' : 'bg-indigo-600'}`}>
                            {t.partyName.charAt(0).toUpperCase()}
                          </div>
                          <span>{t.partyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                          t.type === 'Sale' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200/60' 
                            : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 border-purple-200/60'
                        }`}>
                          {t.type === 'Sale' ? (lang === 'bn' ? '🟢 বিক্রয়' : '🟢 Sale') : (lang === 'bn' ? '🔵 ক্রয়' : '🔵 Purchase')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#059669] dark:text-emerald-400 text-sm">
                        ৳{t.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.paymentMethod.toLowerCase().includes('bkash') || t.paymentMethod.includes('বিকাশ') ? (lang === 'bn' ? '📱 বিকাশ' : '📱 bKash') : (lang === 'bn' ? '💵 নগদ' : '💵 Cash')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.dueAmount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                            ⚠️ {lang === 'bn' ? `বকেয়া (৳${t.dueAmount.toLocaleString()})` : `Due (৳${t.dueAmount.toLocaleString()})`}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                            ✅ {lang === 'bn' ? 'পরিশোধিত' : 'Paid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                মোট {activeSubTab === 'customers' ? filteredCustomers.length : activeSubTab === 'suppliers' ? filteredSuppliers.length : filteredTransactions.length} টি রেকর্ড
              </span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium">
                  ← পূর্বের
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === p ? 'bg-indigo-500 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium">
                  পরের →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === MODALS === */}

      {/* Add Customer Modal */}
      <Modal open={addCustOpen} onClose={() => { setAddCustOpen(false); resetCustForm(); }} title="নতুন গ্রাহক যোগ করুন" maxWidth="max-w-3xl">
        <div className="space-y-4 text-left font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="পূর্ণ নাম *" value={custName} onChange={setCustName} placeholder="গ্রাহকের নাম লিখুন" />
            <InputField label="ফোন নম্বর *" value={custPhone} onChange={setCustPhone} placeholder="০১৭XXXXXXXX" type="tel" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="ইমেইল (ঐচ্ছিক)" value={custEmail} onChange={setCustEmail} placeholder="email@example.com" type="email" />
            <InputField label="ঠিকানা (ঐচ্ছিক)" value={custAddress} onChange={setCustAddress} placeholder="সম্পূর্ণ ঠিকানা লিখুন" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">নোট / অতিরিক্ত তথ্য</label>
            <textarea
              value={custNotes}
              onChange={e => setCustNotes(e.target.value)}
              placeholder="গ্রাহকের অতিরিক্ত যেকোনো মন্তব্য বা তথ্য..."
              rows={2}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setAddCustOpen(false); resetCustForm(); }}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={saveCust}
              className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Check size={15} />
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal open={!!editingCust} onClose={() => { setEditingCust(null); resetCustForm(); }} title="গ্রাহক সম্পাদনা" maxWidth="max-w-3xl">
        <div className="space-y-4 text-left font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="পূর্ণ নাম *" value={custName} onChange={setCustName} placeholder="গ্রাহকের নাম লিখুন" />
            <InputField label="ফোন নম্বর *" value={custPhone} onChange={setCustPhone} placeholder="০১৭XXXXXXXX" type="tel" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="ইমেইল (ঐচ্ছিক)" value={custEmail} onChange={setCustEmail} placeholder="email@example.com" type="email" />
            <InputField label="ঠিকানা (ঐচ্ছিক)" value={custAddress} onChange={setCustAddress} placeholder="সম্পূর্ণ ঠিকানা লিখুন" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">নোট / অতিরিক্ত তথ্য</label>
            <textarea
              value={custNotes}
              onChange={e => setCustNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setEditingCust(null); resetCustForm(); }}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={saveCust}
              className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Check size={15} />
              আপডেট করুন
            </button>
          </div>
        </div>
      </Modal>

      {/* View Customer Modal */}
      <Modal open={!!viewingCust} onClose={() => setViewingCust(null)} title="গ্রাহকের বিবরণ">
        {viewingCust && (
          <div className="space-y-4 font-sans text-left">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {viewingCust.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viewingCust.name}</h3>
                <p className="text-xs text-slate-400">{viewingCust.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'ফোন', value: viewingCust.phone, icon: Phone },
                { label: 'ইমেইল', value: viewingCust.email || '—', icon: Mail },
                { label: 'ঠিকানা', value: viewingCust.address || '—', icon: MapPin },
                { label: 'যোগ হয়েছে', value: viewingCust.createdAt || '—', icon: FileText },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <item.icon size={12} /> {item.label}
                  </p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">মোট ক্রয়</p>
                <p className="text-lg font-bold text-[#059669]">৳{viewingCust.totalPurchase.toLocaleString()}</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${viewingCust.dueAmount > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">বকেয়া</p>
                <p className={`text-lg font-bold ${viewingCust.dueAmount > 0 ? 'text-[#e11d48]' : 'text-slate-400'}`}>৳{viewingCust.dueAmount.toLocaleString()}</p>
              </div>
            </div>
            {viewingCust.notes && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">নোট</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{viewingCust.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal open={!!deletingCustId} onClose={() => setDeletingCustId(null)} title="গ্রাহক মুছুন">
        <div className="text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto">
            <Trash2 size={22} className="text-rose-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm">আপনি কি নিশ্চিতভাবে এই গ্রাহক মুছতে চান? এই কাজটি আর ফেরানো যাবে না।</p>
          <div className="flex gap-3">
            <button onClick={() => setDeletingCustId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">বাতিল</button>
            <button onClick={() => deleteCust(deletingCustId!)} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition">মুছুন</button>
          </div>
        </div>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal open={addSuppOpen} onClose={() => { setAddSuppOpen(false); resetSuppForm(); }} title="নতুন সরবরাহকারী যোগ করুন" maxWidth="max-w-3xl">
        <div className="space-y-4 text-left font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="প্রতিষ্ঠানের নাম *" value={suppName} onChange={setSuppName} placeholder="সরবরাহকারীর নাম" />
            <InputField label="মোবাইল *" value={suppMobile} onChange={setSuppMobile} placeholder="+৮৮০১৭XXXXXXXX" type="tel" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="ইমেইল (ঐচ্ছিক)" value={suppEmail} onChange={setSuppEmail} placeholder="supplier@example.com" type="email" />
            <InputField label="ঠিকানা" value={suppAddress} onChange={setSuppAddress} placeholder="সম্পূর্ণ ঠিকানা" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="শহর" value={suppCity} onChange={setSuppCity} placeholder="শহর" />
            <InputField label="দেশ" value={suppCountry} onChange={setSuppCountry} placeholder="বাংলাদেশ" />
            <InputField label="পূর্ববর্তী পাওনা (৳)" value={suppBalance} onChange={setSuppBalance} placeholder="0.00" type="number" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">নোট</label>
            <textarea value={suppNotes} onChange={e => setSuppNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c3aed] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { setAddSuppOpen(false); resetSuppForm(); }}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              বাতিল
            </button>
            <button onClick={saveSupp}
              className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5">
              <Check size={15} />
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal open={!!editingSupp} onClose={() => { setEditingSupp(null); resetSuppForm(); }} title="সরবরাহকারী সম্পাদনা" maxWidth="max-w-3xl">
        <div className="space-y-4 text-left font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="প্রতিষ্ঠানের নাম *" value={suppName} onChange={setSuppName} placeholder="সরবরাহকারীর নাম" />
            <InputField label="মোবাইল *" value={suppMobile} onChange={setSuppMobile} type="tel" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="ইমেইল" value={suppEmail} onChange={setSuppEmail} type="email" />
            <InputField label="ঠিকানা" value={suppAddress} onChange={setSuppAddress} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="শহর" value={suppCity} onChange={setSuppCity} />
            <InputField label="দেশ" value={suppCountry} onChange={setSuppCountry} />
            <InputField label="পূর্ববর্তী পাওনা (৳)" value={suppBalance} onChange={setSuppBalance} type="number" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { setEditingSupp(null); resetSuppForm(); }}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              বাতিল
            </button>
            <button onClick={saveSupp}
              className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5">
              <Check size={15} />
              আপডেট করুন
            </button>
          </div>
        </div>
      </Modal>

      {/* View Supplier Modal */}
      <Modal open={!!viewingSupp} onClose={() => setViewingSupp(null)} title="সরবরাহকারীর বিবরণ">
        {viewingSupp && (
          <div className="space-y-4 font-sans text-left">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {viewingSupp.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viewingSupp.name}</h3>
                <p className="text-xs text-slate-400">{viewingSupp.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'মোবাইল', value: viewingSupp.mobile, icon: Phone },
                { label: 'ইমেইল', value: viewingSupp.email || '—', icon: Mail },
                { label: 'ঠিকানা', value: viewingSupp.address || '—', icon: MapPin },
                { label: 'শহর / দেশ', value: `${viewingSupp.city || '—'}, ${viewingSupp.country || '—'}`, icon: Building2 },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><item.icon size={12} /> {item.label}</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3.5 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">পূর্ববর্তী পাওনা</p>
              <p className="text-xl font-bold text-[#7c3aed]">৳{viewingSupp.openingBalance.toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Supplier Confirm */}
      <Modal open={!!deletingSuppId} onClose={() => setDeletingSuppId(null)} title="সরবরাহকারী মুছুন">
        <div className="text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto">
            <Trash2 size={22} className="text-rose-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm">আপনি কি নিশ্চিতভাবে এই সরবরাহকারী মুছতে চান?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeletingSuppId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">বাতিল</button>
            <button onClick={() => deleteSupp(deletingSuppId!)} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition">মুছুন</button>
          </div>
        </div>
      </Modal>

      {/* Collect Due Modal */}
      <Modal
        open={!!collectingDueCust}
        onClose={() => setCollectingDueCust(null)}
        title="বকেয়া কালেকশন / পেমেন্ট জমা"
        maxWidth="max-w-md"
      >
        {collectingDueCust && (
          <div className="space-y-4 text-left font-sans">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-500 font-bold">গ্রাহকের নাম</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">{collectingDueCust.name}</p>
                <p className="text-xs text-slate-400">ফোন: {collectingDueCust.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-rose-500 font-bold">বর্তমান বকেয়া</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">৳{collectingDueCust.dueAmount.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">জমার পরিমাণ (৳) *</label>
              <input
                type="number"
                value={collectAmount}
                onChange={e => setCollectAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">পেমেন্ট মেথড</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Cash', label: '💵 নগদ' },
                  { id: 'bKash', label: '📱 বিকাশ' },
                  { id: 'Bank', label: '🏦 ব্যাংক' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCollectPaymentMethod(m.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      collectPaymentMethod === m.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                value={collectNote}
                onChange={e => setCollectNote(e.target.value)}
                placeholder="যেমন: ক্যাশ টাকা জমা দিলেন"
                className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCollectingDueCust(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleCollectDue}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={15} />
                জমা নিশ্চিত করুন
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;

