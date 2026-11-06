import React, { useMemo, useState, useEffect } from 'react';
import {
  Package, Plus, Search, Printer, Trash2, Edit3, Eye, RotateCcw,
  ShoppingCart, Wallet, Clock, X as XIcon, Save, Filter,
} from 'lucide-react';
import { enqueuePurchase, enqueuePurchaseReturn, enqueueStockUpdate } from '../salesSyncQueue';
import { runTransaction, doc } from 'firebase/firestore';
import { db } from '../firebase';

// ---------- Types ----------
type PItem = {
  productId?: string;
  name: string;
  qty: number;
  price: number;      // purchase price per unit
  discount?: number;  // per-line flat discount (৳)
};

type Purchase = {
  id: string;
  supplierId?: string;
  supplier: string;
  date: string;
  items?: PItem[];
  subtotal?: number;
  discount?: number;
  total: number;
  paid?: number;
  due?: number;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  status?: string;
  notes?: string;
  type?: 'purchase' | 'return';
  refInvoice?: string;
  returnReason?: string;
  updatedAt?: string;
};

type Props = {
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<any[]>>;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  suppliers: any[];
  lang: 'bn' | 'en';
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  initialSubTab?: string;
};

type TabKey = 'new' | 'history' | 'return';

const STATUS_BADGE: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function Purchases({
  purchases, setPurchases, products, setProducts, suppliers,
  lang, showToast, shopName, shopAddress, shopPhone, initialSubTab,
}: Props) {
  const t = {
    title: lang === 'bn' ? 'ক্রয় ব্যবস্থাপনা' : 'Purchase Management',
    subtitle: lang === 'bn' ? 'সরবরাহকারী থেকে পণ্য ক্রয় ও রিটার্ন পরিচালনা' : 'Manage purchases & returns from suppliers',
    tabs: {
      new: lang === 'bn' ? 'নতুন ক্রয়' : 'New Purchase',
      history: lang === 'bn' ? 'ক্রয় ইতিহাস' : 'Purchase History',
      ret: lang === 'bn' ? 'ক্রয় রিটার্ন' : 'Purchase Return',
    },
    stats: {
      today: lang === 'bn' ? 'আজকের ক্রয়' : "Today's Purchases",
      total: lang === 'bn' ? 'মোট ক্রয় মূল্য' : 'Total Purchase Amount',
      pending: lang === 'bn' ? 'বকেয়া পেমেন্ট' : 'Pending Payments',
      returns: lang === 'bn' ? 'ক্রয় রিটার্ন' : 'Purchase Returns',
    },
    supplier: lang === 'bn' ? 'সরবরাহকারী' : 'Supplier',
    date: lang === 'bn' ? 'তারিখ' : 'Date',
    searchProduct: lang === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...',
    qty: lang === 'bn' ? 'পরিমাণ' : 'Qty',
    price: lang === 'bn' ? 'ক্রয় মূল্য' : 'Purchase Price',
    disc: lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount',
    line: lang === 'bn' ? 'মোট' : 'Total',
    notes: lang === 'bn' ? 'নোট' : 'Notes',
    payment: lang === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status',
    paid: lang === 'bn' ? 'পরিশোধিত' : 'Paid Amount',
    save: lang === 'bn' ? 'সংরক্ষণ' : 'Save Purchase',
    print: lang === 'bn' ? 'প্রিন্ট' : 'Print',
    add: lang === 'bn' ? 'যোগ করুন' : 'Add',
    remove: lang === 'bn' ? 'মুছুন' : 'Remove',
    subtotal: lang === 'bn' ? 'সাব-টোটাল' : 'Subtotal',
    grand: lang === 'bn' ? 'সর্বমোট' : 'Grand Total',
    due: lang === 'bn' ? 'বকেয়া' : 'Due',
    invoice: lang === 'bn' ? 'ইনভয়েস নং' : 'Invoice #',
    search: lang === 'bn' ? 'ইনভয়েস খুঁজুন...' : 'Search invoice...',
    allSuppliers: lang === 'bn' ? 'সব সরবরাহকারী' : 'All suppliers',
    from: lang === 'bn' ? 'তারিখ থেকে' : 'From',
    to: lang === 'bn' ? 'পর্যন্ত' : 'To',
    view: lang === 'bn' ? 'দেখুন' : 'View',
    edit: lang === 'bn' ? 'এডিট' : 'Edit',
    reason: lang === 'bn' ? 'রিটার্নের কারণ' : 'Return Reason',
    fullReturn: lang === 'bn' ? 'ফুল রিটার্ন' : 'Full Return',
    partialReturn: lang === 'bn' ? 'পার্শিয়াল রিটার্ন' : 'Partial Return',
    processReturn: lang === 'bn' ? 'রিটার্ন প্রক্রিয়া' : 'Process Return',
    findInv: lang === 'bn' ? 'ইনভয়েস দিয়ে খুঁজুন' : 'Find by invoice',
    empty: lang === 'bn' ? 'কোনো রেকর্ড নেই' : 'No records',
    selectSupplier: lang === 'bn' ? 'সরবরাহকারী বাছাই করুন' : 'Select supplier',
    addAtLeastOne: lang === 'bn' ? 'কমপক্ষে একটি পণ্য যোগ করুন' : 'Add at least one product',
    saved: lang === 'bn' ? 'ক্রয় সংরক্ষিত হয়েছে' : 'Purchase saved',
    returnDone: lang === 'bn' ? 'রিটার্ন সম্পন্ন হয়েছে' : 'Return processed',
    invNotFound: lang === 'bn' ? 'ইনভয়েস পাওয়া যায়নি' : 'Invoice not found',
    details: lang === 'bn' ? 'ক্রয় বিবরণী' : 'Purchase Details',
    close: lang === 'bn' ? 'বন্ধ' : 'Close',
  };

  const initialTab: TabKey =
    initialSubTab === 'purchase_history' ? 'history'
    : initialSubTab === 'purchase_return' ? 'return'
    : 'new';
  const [tab, setTab] = useState<TabKey>(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialSubTab]);

  // ---------- Summary ----------
  const today = new Date().toISOString().slice(0, 10);
  const summary = useMemo(() => {
    let todayTotal = 0, grand = 0, pending = 0, returnsTotal = 0;
    for (const p of purchases) {
      const total = Number(p.total) || 0;
      const paid = Number(p.paid ?? total) || 0;
      if ((p.type || 'purchase') === 'return') { returnsTotal += Math.abs(total); continue; }
      grand += total;
      if (p.date === today) todayTotal += total;
      if (p.paymentStatus && p.paymentStatus !== 'PAID') pending += Math.max(0, total - paid);
    }
    return { todayTotal, grand, pending, returnsTotal };
  }, [purchases, today]);

  // ============= NEW PURCHASE =============
  const emptyForm = {
    id: '',
    supplierId: '',
    supplier: '',
    date: today,
    notes: '',
    paymentStatus: 'PAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
    paid: 0,
    items: [] as PItem[],
    productQuery: '',
  };
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);

  const productSuggestions = useMemo(() => {
    const q = form.productQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p: any) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [form.productQuery, products]);

  function addProduct(p: any) {
    setForm(f => ({
      ...f,
      productQuery: '',
      items: [...f.items, {
        productId: p.id,
        name: p.name,
        qty: 1,
        price: Number(p.purchasePrice) || 0,
        discount: 0,
      }],
    }));
  }

  function addManualLine() {
    setForm(f => ({
      ...f,
      items: [...f.items, { name: '', qty: 1, price: 0, discount: 0 }],
    }));
  }

  function updateItem(i: number, patch: Partial<PItem>) {
    setForm(f => ({
      ...f,
      items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it),
    }));
  }

  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const discount = form.items.reduce((s, it) => s + (Number(it.discount) || 0), 0);
    const grand = Math.max(0, subtotal - discount);
    const paid = form.paymentStatus === 'PAID' ? grand
               : form.paymentStatus === 'UNPAID' ? 0
               : Math.min(Number(form.paid) || 0, grand);
    const due = Math.max(0, grand - paid);
    return { subtotal, discount, grand, paid, due };
  }, [form.items, form.paymentStatus, form.paid]);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function handleSave() {
    if (!form.supplier.trim()) { showToast(t.selectSupplier, 'error'); return; }
    if (form.items.length === 0) { showToast(t.addAtLeastOne, 'error'); return; }
    const nextId = editingId
      || 'PUR-' + String(Math.max(100, ...purchases
          .filter(p => (p.id || '').startsWith('PUR-'))
          .map(p => parseInt((p.id || '').replace(/[^0-9]/g, '')) || 0)) + 1);
    const record: Purchase = {
      id: nextId,
      supplierId: form.supplierId,
      supplier: form.supplier,
      date: form.date,
      items: form.items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.grand,
      paid: totals.paid,
      due: totals.due,
      paymentStatus: form.paymentStatus,
      status: totals.due === 0 ? 'Received' : 'Ordered',
      notes: form.notes,
      type: 'purchase',
      updatedAt: new Date().toISOString(),
    };
    // Stock adjustment — additive on create; delta on edit
    setProducts(prev => {
      const prevItems: PItem[] = editingId
        ? ((purchases.find(p => p.id === editingId)?.items) || [])
        : [];
      const deltaMap = new Map<string, number>();
      for (const it of prevItems) if (it.productId) deltaMap.set(it.productId, (deltaMap.get(it.productId) || 0) - (Number(it.qty) || 0));
      for (const it of form.items) if (it.productId) deltaMap.set(it.productId, (deltaMap.get(it.productId) || 0) + (Number(it.qty) || 0));
      return prev.map(pr => {
        const d = deltaMap.get(pr.id);
        if (!d) return pr;
        return { ...pr, stock: (Number(pr.stock) || 0) + d };
      });
    });
    setPurchases(prev => {
      const exists = prev.some(p => p.id === nextId);
      const next = exists ? prev.map(p => p.id === nextId ? { ...p, ...record } : p) : [record, ...prev];
      return next;
    });
    try { enqueuePurchase(record, form.supplier); } catch { /* noop */ }
    showToast(t.saved, 'success');
    resetForm();
    setTab('history');
  }

  function startEdit(p: Purchase) {
    setEditingId(p.id);
    setForm({
      id: p.id,
      supplierId: p.supplierId || '',
      supplier: p.supplier || '',
      date: p.date || today,
      notes: p.notes || '',
      paymentStatus: p.paymentStatus || 'PAID',
      paid: Number(p.paid ?? p.total) || 0,
      items: (p.items && p.items.length ? p.items : [{
        name: p.supplier || 'Item', qty: 1, price: Number(p.total) || 0, discount: 0,
      }]),
      productQuery: '',
    });
    setTab('new');
  }

  // ============= HISTORY =============
  const [hSearch, setHSearch] = useState('');
  const [hSupplier, setHSupplier] = useState('all');
  const [hFrom, setHFrom] = useState('');
  const [hTo, setHTo] = useState('');
  const [viewing, setViewing] = useState<Purchase | null>(null);

  const filteredHistory = useMemo(() => {
    return purchases
      .filter(p => (p.type || 'purchase') === 'purchase')
      .filter(p => !hSearch || (p.id || '').toLowerCase().includes(hSearch.toLowerCase()))
      .filter(p => hSupplier === 'all' || p.supplier === hSupplier)
      .filter(p => !hFrom || (p.date || '') >= hFrom)
      .filter(p => !hTo || (p.date || '') <= hTo)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [purchases, hSearch, hSupplier, hFrom, hTo]);

  const supplierNames = useMemo(() => {
    const set = new Set<string>();
    purchases.forEach(p => p.supplier && set.add(p.supplier));
    suppliers.forEach((s: any) => s?.name && set.add(s.name));
    return Array.from(set);
  }, [purchases, suppliers]);

  function printInvoice(p: Purchase) {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const rows = (p.items || []).map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.name || ''}</td>
        <td style="text-align:right">${Number(it.qty) || 0}</td>
        <td style="text-align:right">৳ ${(Number(it.price) || 0).toFixed(2)}</td>
        <td style="text-align:right">৳ ${(Number(it.discount) || 0).toFixed(2)}</td>
        <td style="text-align:right">৳ ${(((Number(it.qty)||0)*(Number(it.price)||0)) - (Number(it.discount)||0)).toFixed(2)}</td>
      </tr>`).join('');
    w.document.write(`
      <html><head><title>Purchase ${p.id}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:24px;color:#0f172a}
        h1{color:#1d4ed8;margin:0}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #e2e8f0;padding:6px 8px;font-size:12px}
        th{background:#eff6ff;text-align:left}
        .row{display:flex;justify-content:space-between;gap:16px;margin-top:6px;font-size:13px}
        .totals{margin-top:12px;width:280px;margin-left:auto}
      </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h1>${shopName || 'Shop'}</h1>
            <div>${shopAddress || ''}</div>
            <div>${shopPhone || ''}</div>
          </div>
          <div style="text-align:right">
            <h2 style="margin:0;color:#1d4ed8">PURCHASE INVOICE</h2>
            <div>#${p.id}</div>
            <div>${p.date || ''}</div>
          </div>
        </div>
        <div class="row"><strong>Supplier:</strong><span>${p.supplier || ''}</span></div>
        ${p.notes ? `<div class="row"><strong>Notes:</strong><span>${p.notes}</span></div>` : ''}
        <table>
          <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Discount</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <table class="totals">
          <tr><td>Subtotal</td><td style="text-align:right">৳ ${(Number(p.subtotal)||Number(p.total)||0).toFixed(2)}</td></tr>
          <tr><td>Discount</td><td style="text-align:right">৳ ${(Number(p.discount)||0).toFixed(2)}</td></tr>
          <tr><td><strong>Grand Total</strong></td><td style="text-align:right"><strong>৳ ${(Number(p.total)||0).toFixed(2)}</strong></td></tr>
          <tr><td>Paid</td><td style="text-align:right">৳ ${(Number(p.paid ?? p.total)||0).toFixed(2)}</td></tr>
          <tr><td>Due</td><td style="text-align:right">৳ ${(Number(p.due)||0).toFixed(2)}</td></tr>
        </table>
        <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  }

  // ============= RETURN =============
  const [retSearch, setRetSearch] = useState('');
  const [retInvoice, setRetInvoice] = useState<Purchase | null>(null);
  const [retQty, setRetQty] = useState<Record<number, number>>({});
  const [retReason, setRetReason] = useState('');

  function findInvoice() {
    const p = purchases.find(x => (x.id || '').toLowerCase() === retSearch.trim().toLowerCase() && (x.type || 'purchase') === 'purchase');
    if (!p) { showToast(t.invNotFound, 'error'); setRetInvoice(null); return; }
    setRetInvoice(p);
    const q: Record<number, number> = {};
    (p.items || []).forEach((_, i) => q[i] = 0);
    setRetQty(q);
    setRetReason('');
  }

  function setFullReturn() {
    if (!retInvoice) return;
    const q: Record<number, number> = {};
    (retInvoice.items || []).forEach((it, i) => q[i] = Number(it.qty) || 0);
    setRetQty(q);
  }

  function processReturn() {
    if (!retInvoice) return;
    const items = (retInvoice.items || []).map((it, i) => ({
      ...it,
      qty: Math.min(Number(it.qty) || 0, Number(retQty[i]) || 0),
    })).filter(it => it.qty > 0);
    if (items.length === 0) { showToast(t.addAtLeastOne, 'error'); return; }
    const subtotal = items.reduce((s, it) => s + (it.qty * (Number(it.price) || 0)), 0);
    const nextId = 'PRT-' + String(Math.max(100, ...purchases
      .filter(p => (p.id || '').startsWith('PRT-'))
      .map(p => parseInt((p.id || '').replace(/[^0-9]/g, '')) || 0)) + 1);
    const record: Purchase = {
      id: nextId,
      supplier: retInvoice.supplier,
      supplierId: retInvoice.supplierId,
      date: today,
      items,
      subtotal,
      discount: 0,
      total: -subtotal,
      paid: -subtotal,
      due: 0,
      paymentStatus: 'PAID',
      status: 'Returned',
      notes: retReason,
      type: 'return',
      refInvoice: retInvoice.id,
      returnReason: retReason,
      updatedAt: new Date().toISOString(),
    };
    // Reduce stock back
    setProducts(prev => prev.map(pr => {
      const line = items.find(it => it.productId === pr.id);
      if (!line) return pr;
      return { ...pr, stock: Math.max(0, (Number(pr.stock) || 0) - (Number(line.qty) || 0)) };
    }));
    setPurchases(prev => [record, ...prev]);

    // Execute Firestore Transaction for PurchaseReturn & product stock reduction
    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          // Reads first
          const productSnaps: Record<string, any> = {};
          for (const line of items) {
            if (line.productId) {
              const pRef = doc(db, 'products', line.productId);
              productSnaps[line.productId] = await tx.get(pRef);
            }
          }

          // Writes second
          const purRef = doc(db, 'purchases', record.id);
          tx.set(purRef, record);

          for (const line of items) {
            if (line.productId && productSnaps[line.productId]) {
              const pSnap = productSnaps[line.productId];
              if (pSnap.exists()) {
                const currentStock = Number(pSnap.data().stock || 0);
                const returnQty = Number(line.qty || 0);
                tx.update(pSnap.ref, { stock: Math.max(0, currentStock - returnQty), updatedAt: new Date().toISOString() });
              }
            }
          }
        });
      } catch (err) {
        console.warn('[PurchaseReturn] Transaction failed / offline fallback:', err);
        enqueuePurchaseReturn(record, 'return ' + retInvoice.id);
        items.forEach(line => {
          if (line.productId) {
            enqueueStockUpdate(line.productId, -(Number(line.qty) || 0));
          }
        });
      }
    })();

    showToast(t.returnDone, 'success');
    setRetInvoice(null); setRetQty({}); setRetReason(''); setRetSearch('');
    setTab('history');
  }

  // ---------- UI ----------
  const tabBtn = (k: TabKey, label: string) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={
        'shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition ' +
        (tab === k
          ? 'bg-blue-600 text-white border-blue-600 shadow'
          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700')
      }
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl md:text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={<ShoppingCart className="w-5 h-5" />} label={t.stats.today} value={`৳ ${summary.todayTotal.toLocaleString()}`} tone="blue" />
        <SummaryCard icon={<Package className="w-5 h-5" />} label={t.stats.total} value={`৳ ${summary.grand.toLocaleString()}`} tone="emerald" />
        <SummaryCard icon={<Clock className="w-5 h-5" />} label={t.stats.pending} value={`৳ ${summary.pending.toLocaleString()}`} tone="amber" />
        <SummaryCard icon={<RotateCcw className="w-5 h-5" />} label={t.stats.returns} value={`৳ ${summary.returnsTotal.toLocaleString()}`} tone="rose" />
      </div>

      {/* Tabs */}
      <div className="-mx-4 md:mx-0 overflow-x-auto">
        <div className="flex items-center gap-2 px-4 md:px-0 min-w-max">
          {tabBtn('new', t.tabs.new)}
          {tabBtn('history', t.tabs.history)}
          {tabBtn('return', t.tabs.ret)}
        </div>
      </div>

      {/* NEW PURCHASE */}
      {tab === 'new' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.supplier}</label>
              <select
                value={form.supplierId}
                onChange={e => {
                  const s = suppliers.find((x: any) => x.id === e.target.value);
                  setForm(f => ({ ...f, supplierId: e.target.value, supplier: s?.name || '' }));
                }}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">{t.selectSupplier}</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.date}</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.payment}</label>
              <select
                value={form.paymentStatus}
                onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value as any }))}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
              >
                <option value="PAID">PAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="UNPAID">UNPAID</option>
              </select>
            </div>
          </div>

          {/* Product search */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-600 mb-1">{t.searchProduct}</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={form.productQuery}
                onChange={e => setForm(f => ({ ...f, productQuery: e.target.value }))}
                placeholder={t.searchProduct}
                className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            {productSuggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow max-h-56 overflow-auto">
                {productSuggestions.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between"
                  >
                    <span className="truncate">{p.name} <span className="text-slate-400">· {p.id}</span></span>
                    <span className="text-slate-500">৳ {Number(p.purchasePrice || 0).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={addManualLine} className="mt-2 text-xs text-blue-700 hover:underline">+ {t.add}</button>
          </div>

          {/* Items */}
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Item</th>
                  <th className="py-2 px-2 w-24">{t.qty}</th>
                  <th className="py-2 px-2 w-32">{t.price}</th>
                  <th className="py-2 px-2 w-28">{t.disc}</th>
                  <th className="py-2 px-2 w-28 text-right">{t.line}</th>
                  <th className="py-2 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-6">{t.empty}</td></tr>
                )}
                {form.items.map((it, i) => {
                  const lineTotal = (Number(it.qty) || 0) * (Number(it.price) || 0) - (Number(it.discount) || 0);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-2 text-slate-500">{i + 1}</td>
                      <td className="py-2 px-2">
                        <input value={it.name} onChange={e => updateItem(i, { name: e.target.value })} className="w-full h-9 px-2 border border-slate-200 rounded" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min={0} value={it.qty} onChange={e => updateItem(i, { qty: Number(e.target.value) || 0 })} className="w-full h-9 px-2 border border-slate-200 rounded" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min={0} value={it.price} onChange={e => updateItem(i, { price: Number(e.target.value) || 0 })} className="w-full h-9 px-2 border border-slate-200 rounded" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min={0} value={it.discount || 0} onChange={e => updateItem(i, { discount: Number(e.target.value) || 0 })} className="w-full h-9 px-2 border border-slate-200 rounded" />
                      </td>
                      <td className="py-2 px-2 text-right font-medium">৳ {Math.max(0, lineTotal).toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">
                        <button onClick={() => removeItem(i)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.notes}</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              {form.paymentStatus === 'PARTIAL' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t.paid}</label>
                  <input type="number" min={0} value={form.paid} onChange={e => setForm(f => ({ ...f, paid: Number(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-1">
              <Row label={t.subtotal} value={`৳ ${totals.subtotal.toFixed(2)}`} />
              <Row label={t.disc} value={`৳ ${totals.discount.toFixed(2)}`} />
              <Row label={t.grand} value={`৳ ${totals.grand.toFixed(2)}`} strong />
              <Row label={t.paid} value={`৳ ${totals.paid.toFixed(2)}`} />
              <Row label={t.due} value={`৳ ${totals.due.toFixed(2)}`} tone={totals.due > 0 ? 'rose' : 'emerald'} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {editingId && (
              <button onClick={resetForm} className="px-4 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm">
                {t.close}
              </button>
            )}
            <button
              onClick={() => {
                const preview: Purchase = {
                  id: editingId || 'PREVIEW',
                  supplier: form.supplier || '-',
                  date: form.date,
                  items: form.items,
                  subtotal: totals.subtotal,
                  discount: totals.discount,
                  total: totals.grand,
                  paid: totals.paid,
                  due: totals.due,
                  notes: form.notes,
                  paymentStatus: form.paymentStatus,
                };
                printInvoice(preview);
              }}
              className="px-4 h-10 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-sm inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t.print}
            </button>
            <button onClick={handleSave} className="px-5 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm inline-flex items-center gap-2 shadow">
              <Save className="w-4 h-4" /> {t.save}
            </button>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input value={hSearch} onChange={e => setHSearch(e.target.value)} placeholder={t.search} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm" />
            </div>
            <select value={hSupplier} onChange={e => setHSupplier(e.target.value)} className="h-10 px-3 border border-slate-200 rounded-lg text-sm">
              <option value="all">{t.allSuppliers}</option>
              {supplierNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="date" value={hFrom} onChange={e => setHFrom(e.target.value)} className="h-10 px-3 border border-slate-200 rounded-lg text-sm" />
            <input type="date" value={hTo} onChange={e => setHTo(e.target.value)} className="h-10 px-3 border border-slate-200 rounded-lg text-sm" />
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 px-3">{t.invoice}</th>
                  <th className="py-2 px-3">{t.date}</th>
                  <th className="py-2 px-3">{t.supplier}</th>
                  <th className="py-2 px-3 text-right">{t.grand}</th>
                  <th className="py-2 px-3">{t.payment}</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-6">{t.empty}</td></tr>
                )}
                {filteredHistory.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-blue-700">{p.id}</td>
                    <td className="py-2 px-3">{p.date}</td>
                    <td className="py-2 px-3">{p.supplier}</td>
                    <td className="py-2 px-3 text-right">৳ {(Number(p.total) || 0).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span className={'inline-flex items-center px-2 py-0.5 rounded border text-xs ' + (STATUS_BADGE[p.paymentStatus || 'PAID'] || STATUS_BADGE.PAID)}>
                        {p.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setViewing(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700" title={t.view}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => printInvoice(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700" title={t.print}><Printer className="w-4 h-4" /></button>
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-amber-50 text-amber-700" title={t.edit}><Edit3 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURN */}
      {tab === 'return' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={retSearch}
                onChange={e => setRetSearch(e.target.value)}
                placeholder={t.findInv}
                className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <button onClick={findInvoice} className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              {t.findInv}
            </button>
          </div>

          {retInvoice && (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <div><span className="text-slate-500">{t.invoice}:</span> <span className="font-medium">{retInvoice.id}</span></div>
                <div><span className="text-slate-500">{t.supplier}:</span> <span className="font-medium">{retInvoice.supplier}</span></div>
                <div><span className="text-slate-500">{t.date}:</span> {retInvoice.date}</div>
                <button onClick={setFullReturn} className="text-xs px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50">
                  {t.fullReturn}
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b">
                      <th className="py-2 px-2">Item</th>
                      <th className="py-2 px-2 w-24 text-right">Bought</th>
                      <th className="py-2 px-2 w-28 text-right">{t.price}</th>
                      <th className="py-2 px-2 w-28">Return {t.qty}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(retInvoice.items || []).map((it, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 px-2">{it.name}</td>
                        <td className="py-2 px-2 text-right">{it.qty}</td>
                        <td className="py-2 px-2 text-right">৳ {(Number(it.price) || 0).toFixed(2)}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number" min={0} max={it.qty}
                            value={retQty[i] || 0}
                            onChange={e => setRetQty(prev => ({ ...prev, [i]: Math.min(Number(it.qty) || 0, Math.max(0, Number(e.target.value) || 0)) }))}
                            className="w-full h-9 px-2 border border-slate-200 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                    {(!retInvoice.items || retInvoice.items.length === 0) && (
                      <tr><td colSpan={4} className="text-center text-slate-400 py-4">{t.empty}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t.reason}</label>
                <textarea value={retReason} onChange={e => setRetReason(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>

              <div className="flex justify-end">
                <button onClick={processReturn} className="px-5 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm inline-flex items-center gap-2 shadow">
                  <RotateCcw className="w-4 h-4" /> {t.processReturn}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-800">{t.details} — {viewing.id}</h3>
              <button onClick={() => setViewing(null)} className="p-1 rounded hover:bg-slate-100"><XIcon className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">{t.supplier}:</span> {viewing.supplier}</div>
                <div><span className="text-slate-500">{t.date}:</span> {viewing.date}</div>
                <div><span className="text-slate-500">{t.payment}:</span> {viewing.paymentStatus || 'PAID'}</div>
                <div><span className="text-slate-500">{t.grand}:</span> ৳ {(Number(viewing.total) || 0).toLocaleString()}</div>
              </div>
              {viewing.notes && <div><span className="text-slate-500">{t.notes}:</span> {viewing.notes}</div>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-slate-50 text-xs text-slate-600">
                    <tr>
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-right">{t.qty}</th>
                      <th className="p-2 text-right">{t.price}</th>
                      <th className="p-2 text-right">{t.line}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewing.items || []).map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{it.name}</td>
                        <td className="p-2 text-right">{it.qty}</td>
                        <td className="p-2 text-right">৳ {(Number(it.price) || 0).toFixed(2)}</td>
                        <td className="p-2 text-right">৳ {((Number(it.qty) || 0) * (Number(it.price) || 0) - (Number(it.discount) || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                    {(!viewing.items || viewing.items.length === 0) && (
                      <tr><td colSpan={4} className="p-3 text-center text-slate-400">{t.empty}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => printInvoice(viewing)} className="px-4 h-9 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm inline-flex items-center gap-1">
                  <Printer className="w-4 h-4" /> {t.print}
                </button>
                <button onClick={() => { startEdit(viewing); setViewing(null); }} className="px-4 h-9 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 inline-flex items-center gap-1">
                  <Edit3 className="w-4 h-4" /> {t.edit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' }) {
  const tones: Record<string, { bg: string; text: string }> = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white dark:from-blue-950/40 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-800 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-400',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50/90 via-purple-50/40 to-white dark:from-purple-950/40 dark:via-purple-950/20 dark:to-slate-900 border-purple-200/80 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-400',
    },
  };

  const currentTone = tones[tone] || tones.blue;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left select-none ${currentTone.bg}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className={currentTone.text}>{icon}</span>
        </div>
        <span className={`font-extrabold text-xs sm:text-sm tracking-tight truncate ${currentTone.text}`}>
          {label}
        </span>
      </div>
      <div className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono truncate">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'rose' | 'emerald' }) {
  const toneCls = tone === 'rose' ? 'text-rose-700' : tone === 'emerald' ? 'text-emerald-700' : 'text-slate-800';
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`${toneCls} ${strong ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
