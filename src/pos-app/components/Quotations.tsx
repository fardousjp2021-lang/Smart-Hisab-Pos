import { useMemo, useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Trash2, Edit3, Printer, Copy,
  CheckCircle2, XCircle, Clock, Send, Eye, X as XIcon, Download,
  Calendar, User as UserIcon, ShoppingCart, TrendingUp
} from 'lucide-react';
import { enqueueQuotation, enqueueQuotationDelete } from '../salesSyncQueue';

type QItem = {
  name: string;
  qty: number;
  price: number;
  discount?: number; // per-line flat discount (৳)
  tax?: number;      // per-line tax (%)
};
type Quotation = {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
  items: QItem[];
  total: number;
  discount?: number;
  tax?: number;
  notes?: string;
  terms?: string;
  updatedAt?: string;
};

type Props = {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  lang: 'bn' | 'en';
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  customers: any[];
  products: any[];
  isAddQuotationOpen: boolean;
  setIsAddQuotationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConvertToSale?: (q: Quotation) => void;
};

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Sent: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Expired: 'bg-amber-50 text-amber-700 border-amber-200',
};

const STATUS_ICON: Record<string, any> = {
  Draft: Edit3, Sent: Send, Approved: CheckCircle2, Rejected: XCircle, Expired: Clock,
};

export function Quotations({
  quotations, setQuotations, lang, showToast, customers, products,
  isAddQuotationOpen, setIsAddQuotationOpen, onConvertToSale,
}: Props) {
  const t = {
    title: lang === 'bn' ? 'কোটেশন ম্যানেজমেন্ট' : 'Quotation Management',
    subtitle: lang === 'bn' ? 'ক্লায়েন্টের জন্য মূল্য প্রস্তাব তৈরি ও ট্র্যাক করুন' : 'Create & track price proposals for clients',
    newQuote: lang === 'bn' ? 'নতুন কোটেশন' : 'New Quotation',
    search: lang === 'bn' ? 'কোটেশন খুঁজুন (আইডি/নাম/ফোন)...' : 'Search (ID / name / phone)...',
    all: lang === 'bn' ? 'সব স্ট্যাটাস' : 'All Statuses',
    from: lang === 'bn' ? 'তারিখ থেকে' : 'From',
    to: lang === 'bn' ? 'পর্যন্ত' : 'To',
    stats: {
      total: lang === 'bn' ? 'মোট কোটেশন' : 'Total Quotations',
      value: lang === 'bn' ? 'মোট মূল্য' : 'Total Value',
      approved: lang === 'bn' ? 'অনুমোদিত' : 'Approved',
      pending: lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending / Sent',
    },
    id: lang === 'bn' ? 'কোটেশন আইডি' : 'Quote ID',
    customer: lang === 'bn' ? 'গ্রাহক' : 'Customer',
    date: lang === 'bn' ? 'তারিখ' : 'Date',
    valid: lang === 'bn' ? 'বৈধতা' : 'Valid Until',
    items: lang === 'bn' ? 'আইটেম' : 'Items',
    amount: lang === 'bn' ? 'পরিমাণ' : 'Amount',
    status: lang === 'bn' ? 'স্ট্যাটাস' : 'Status',
    actions: lang === 'bn' ? 'ক্রিয়া' : 'Actions',
    view: lang === 'bn' ? 'দেখুন' : 'View',
    edit: lang === 'bn' ? 'সম্পাদনা' : 'Edit',
    del: lang === 'bn' ? 'মুছুন' : 'Delete',
    print: lang === 'bn' ? 'প্রিন্ট' : 'Print',
    dup: lang === 'bn' ? 'অনুলিপি' : 'Duplicate',
    save: lang === 'bn' ? 'সংরক্ষণ' : 'Save',
    cancel: lang === 'bn' ? 'বাতিল' : 'Cancel',
    close: lang === 'bn' ? 'বন্ধ' : 'Close',
    empty: lang === 'bn' ? 'কোনো কোটেশন পাওয়া যায়নি' : 'No quotations found',
    addItem: lang === 'bn' ? '+ আইটেম যোগ' : '+ Add Item',
    itemName: lang === 'bn' ? 'পণ্যের নাম' : 'Product Name',
    qty: lang === 'bn' ? 'পরিমাণ' : 'Qty',
    price: lang === 'bn' ? 'একক মূল্য' : 'Unit Price',
    subtotal: lang === 'bn' ? 'সাবটোটাল' : 'Subtotal',
    discount: lang === 'bn' ? 'ছাড় (৳)' : 'Discount (৳)',
    tax: lang === 'bn' ? 'কর / ভ্যাট (%)' : 'Tax / VAT (%)',
    grand: lang === 'bn' ? 'সর্বমোট' : 'Grand Total',
    notes: lang === 'bn' ? 'মন্তব্য' : 'Notes',
    terms: lang === 'bn' ? 'শর্তাবলি' : 'Terms & Conditions',
    newHeading: lang === 'bn' ? 'নতুন কোটেশন তৈরি' : 'Create New Quotation',
    editHeading: lang === 'bn' ? 'কোটেশন সম্পাদনা' : 'Edit Quotation',
    detailHeading: lang === 'bn' ? 'কোটেশন বিস্তারিত' : 'Quotation Details',
    changeStatus: lang === 'bn' ? 'স্ট্যাটাস পরিবর্তন' : 'Change Status',
    convert: lang === 'bn' ? 'সেল-এ রূপান্তর' : 'Convert to Sale',
    downloadPdf: lang === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF',
    filterCustomer: lang === 'bn' ? 'গ্রাহক ফিল্টার' : 'Customer',
    allCustomers: lang === 'bn' ? 'সব গ্রাহক' : 'All Customers',
    lineDiscount: lang === 'bn' ? 'ছাড়' : 'Disc',
    lineTax: lang === 'bn' ? 'কর%' : 'Tax%',
    lineTotal: lang === 'bn' ? 'লাইন টোটাল' : 'Line Total',
    export: lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV',
    confirmDel: lang === 'bn' ? 'কোটেশনটি স্থায়ীভাবে মুছে ফেলবেন?' : 'Permanently delete this quotation?',
  };

  // ---------- auto-expire ----------
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setQuotations(prev => prev.map(q => {
      if (q.status === 'Sent' && q.validUntil && q.validUntil < today) {
        return { ...q, status: 'Expired' };
      }
      return q;
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- filters ----------
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Distinct customer names for the filter dropdown (from existing quotations).
  const customerOptions = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach(q => { if (q.customerName) set.add(q.customerName); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [quotations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotations.filter(x => {
      if (statusFilter !== 'All' && x.status !== statusFilter) return false;
      if (customerFilter !== 'All' && x.customerName !== customerFilter) return false;
      if (dateFrom && x.date < dateFrom) return false;
      if (dateTo && x.date > dateTo) return false;
      if (!q) return true;
      return (
        x.id.toLowerCase().includes(q) ||
        x.customerName.toLowerCase().includes(q) ||
        x.phone.toLowerCase().includes(q)
      );
    });
  }, [quotations, search, statusFilter, customerFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalValue = quotations.reduce((s, q) => s + (q.total || 0), 0);
    const approved = quotations.filter(q => q.status === 'Approved');
    const pending = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft');
    return {
      total: quotations.length,
      value: totalValue,
      approvedCount: approved.length,
      approvedValue: approved.reduce((s, q) => s + q.total, 0),
      pendingCount: pending.length,
    };
  }, [quotations]);

  // ---------- form state ----------
  const emptyItem = (): QItem => ({ name: '', qty: 1, price: 0, discount: 0, tax: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: '', phone: '',
    date: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    status: 'Draft' as Quotation['status'],
    items: [emptyItem()] as QItem[],
    discount: 0, tax: 0, notes: '', terms: '',
  });
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q)
    ).slice(0, 8);
  }, [customerSearch, customers]);

  // Per-line total helper — respects per-line discount (৳) and tax (%).
  const lineTotal = (it: QItem): number => {
    const gross = (Number(it.qty) || 0) * (Number(it.price) || 0);
    const afterDiscount = Math.max(0, gross - (Number(it.discount) || 0));
    return afterDiscount * (1 + (Number(it.tax) || 0) / 100);
  };
  const formSubtotal = useMemo(
    () => form.items.reduce((s, it) => s + lineTotal(it), 0),
    [form.items]
  );
  const formTaxAmt = useMemo(() => (formSubtotal - (form.discount || 0)) * ((form.tax || 0) / 100), [formSubtotal, form.discount, form.tax]);
  const formGrand = useMemo(() => Math.max(0, formSubtotal - (form.discount || 0) + formTaxAmt), [formSubtotal, form.discount, formTaxAmt]);

  function resetForm() {
    setEditingId(null);
    setForm({
      customerName: '', phone: '',
      date: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'Draft',
      items: [emptyItem()],
      discount: 0, tax: 0, notes: '', terms: '',
    });
    setCustomerSearch('');
  }

  function openEdit(q: Quotation) {
    setEditingId(q.id);
    setForm({
      customerName: q.customerName, phone: q.phone,
      date: q.date, validUntil: q.validUntil, status: q.status,
      items: q.items && q.items.length ? q.items.map(i => ({ ...i })) : [emptyItem()],
      discount: q.discount || 0, tax: q.tax || 0, notes: q.notes || '', terms: q.terms || '',
    });
    setIsAddQuotationOpen(true);
  }

  function nextId() {
    const nums = quotations
      .map(q => parseInt((q.id || '').replace(/[^0-9]/g, ''), 10))
      .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 200) + 1;
    return `QTE-${next}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName.trim()) {
      showToast(lang === 'bn' ? 'গ্রাহকের নাম আবশ্যক' : 'Customer name required', 'error');
      return;
    }
    const cleanItems = form.items
      .filter(i => i.name.trim() && Number(i.qty) > 0 && Number(i.price) >= 0)
      .map(i => ({
        name: i.name.trim(),
        qty: Number(i.qty),
        price: Number(i.price),
        discount: Number(i.discount) || 0,
        tax: Number(i.tax) || 0,
      }));
    if (!cleanItems.length) {
      showToast(lang === 'bn' ? 'অন্তত একটি বৈধ আইটেম যোগ করুন' : 'Add at least one valid item', 'error');
      return;
    }
    const payload: Quotation = {
      id: editingId || nextId(),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      date: form.date,
      validUntil: form.validUntil,
      status: form.status,
      items: cleanItems,
      total: Number(formGrand.toFixed(2)),
      discount: form.discount || 0,
      tax: form.tax || 0,
      notes: form.notes || '',
      terms: form.terms || '',
      updatedAt: new Date().toISOString(),
    };
    if (editingId) {
      setQuotations(prev => prev.map(q => q.id === editingId ? payload : q));
      showToast(lang === 'bn' ? 'কোটেশন আপডেট হয়েছে' : 'Quotation updated', 'success');
    } else {
      setQuotations(prev => [payload, ...prev]);
      showToast(lang === 'bn' ? 'নতুন কোটেশন তৈরি হয়েছে' : 'Quotation created', 'success');
    }
    // Offline-safe Firestore sync via the shared queue.
    try { enqueueQuotation(payload, payload.customerName); } catch {}
    setIsAddQuotationOpen(false);
    resetForm();
  }

  function deleteQuote(id: string) {
    if (!window.confirm(t.confirmDel)) return;
    setQuotations(prev => prev.filter(q => q.id !== id));
    if (viewing?.id === id) setViewing(null);
    try { enqueueQuotationDelete(id); } catch {}
    showToast(lang === 'bn' ? 'কোটেশন মুছে ফেলা হয়েছে' : 'Quotation deleted', 'success');
  }

  function duplicateQuote(q: Quotation) {
    const copy: Quotation = {
      ...q,
      id: nextId(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      updatedAt: new Date().toISOString(),
    };
    setQuotations(prev => [copy, ...prev]);
    try { enqueueQuotation(copy, copy.customerName); } catch {}
    showToast(lang === 'bn' ? 'অনুলিপি তৈরি হয়েছে' : 'Duplicated', 'success');
  }

  function changeStatus(id: string, status: Quotation['status']) {
    setQuotations(prev => prev.map(q => {
      if (q.id !== id) return q;
      const updated = { ...q, status, updatedAt: new Date().toISOString() };
      try { enqueueQuotation(updated, updated.customerName); } catch {}
      return updated;
    }));
    setViewing(v => v && v.id === id ? { ...v, status } : v);
    showToast(lang === 'bn' ? 'স্ট্যাটাস আপডেট' : 'Status updated', 'success');
  }


  function exportCSV() {
    const header = ['ID', 'Customer', 'Phone', 'Date', 'ValidUntil', 'Status', 'Items', 'Total'];
    const rows = filtered.map(q => [
      q.id, q.customerName, q.phone, q.date, q.validUntil, q.status,
      q.items.map(i => `${i.name} x${i.qty}`).join(' | '),
      q.total,
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `quotations_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'bn' ? 'CSV ডাউনলোড শুরু' : 'CSV download started', 'success');
  }

  // ---------- print ----------
  function buildPrintHTML(q: Quotation) {
    const rows = q.items.map((it, i) => {
      const gross = it.qty * it.price;
      const afterDisc = Math.max(0, gross - (Number(it.discount) || 0));
      const total = afterDisc * (1 + (Number(it.tax) || 0) / 100);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${it.name}</td>
          <td style="text-align:center">${it.qty}</td>
          <td style="text-align:right">৳${it.price.toLocaleString()}</td>
          <td style="text-align:right">${(Number(it.discount) || 0) > 0 ? '৳' + Number(it.discount).toLocaleString() : '—'}</td>
          <td style="text-align:right">${(Number(it.tax) || 0) > 0 ? Number(it.tax) + '%' : '—'}</td>
          <td style="text-align:right;font-weight:700">৳${Math.round(total).toLocaleString()}</td>
        </tr>`;
    }).join('');
    const sub = q.items.reduce((s, it) => {
      const gross = it.qty * it.price;
      const afterDisc = Math.max(0, gross - (Number(it.discount) || 0));
      return s + afterDisc * (1 + (Number(it.tax) || 0) / 100);
    }, 0);
    const taxAmt = (sub - (q.discount || 0)) * ((q.tax || 0) / 100);
    // Inline SVG logo — kept small so the print stays crisp and offline-friendly
    // (no external asset requests). Blue theme matches the app.
    const logoSvg = `
      <svg width="52" height="52" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="64" height="64" rx="14" fill="#2563eb"/>
        <path d="M18 40 L18 24 L26 24 L32 34 L38 24 L46 24 L46 40 L40 40 L40 32 L34 40 L30 40 L24 32 L24 40 Z" fill="#ffffff"/>
      </svg>`;
    return `<!doctype html><html><head><meta charset="utf-8"/><title>${q.id}</title>
      <style>
        body{font-family:system-ui,'Noto Sans Bengali',sans-serif;padding:32px;color:#0f172a}
        h1{margin:0;font-size:26px;letter-spacing:1px;color:#0f172a}
        .muted{color:#64748b;font-size:12px}
        .brand-row{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2563eb;padding-bottom:14px}
        .brand-left{display:flex;align-items:center;gap:12px}
        .brand-name{font-weight:800;font-size:18px;color:#1d4ed8}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12.5px}
        th,td{border:1px solid #e2e8f0;padding:7px 9px}
        th{background:#eff6ff;text-align:left;color:#1e3a8a;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
        .totals{margin-top:18px;margin-left:auto;width:300px;font-size:13px}
        .totals div{display:flex;justify-content:space-between;padding:5px 0}
        .totals .grand{border-top:2px solid #2563eb;font-weight:800;font-size:15px;padding-top:8px;margin-top:4px;color:#1d4ed8}
        .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:11px}
        .note-box{margin-top:22px;padding:12px 14px;border:1px dashed #93c5fd;border-radius:8px;font-size:12px;background:#f8fafc;color:#334155}
        .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;display:flex;justify-content:space-between}
      </style></head><body>
      <div class="brand-row">
        <div class="brand-left">
          ${logoSvg}
          <div>
            <div class="brand-name">Glorious IT POS</div>
            <div class="muted">Dohar, Dhaka • Bangladesh</div>
            <div class="muted">📞 01747-046052 &nbsp; · &nbsp; ✉ info@gloriousit.com</div>
          </div>
        </div>
        <div style="text-align:right">
          <h1>QUOTATION</h1>
          <div class="muted" style="margin-top:4px"><strong style="color:#1d4ed8">${q.id}</strong> • <span class="badge">${q.status}</span></div>
        </div>
      </div>
      <div class="grid">
        <div>
          <div class="muted" style="text-transform:uppercase;letter-spacing:1px;font-size:10px;font-weight:800">Bill To</div>
          <div style="font-weight:700;margin-top:4px;font-size:14px">${q.customerName}</div>
          <div class="muted">${q.phone || ''}</div>
        </div>
        <div style="text-align:right">
          <div class="muted">Issue Date: <strong style="color:#0f172a">${q.date}</strong></div>
          <div class="muted">Valid Until: <strong style="color:#0f172a">${q.validUntil}</strong></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px">#</th>
            <th>Item</th>
            <th style="width:50px;text-align:center">Qty</th>
            <th style="width:90px;text-align:right">Price</th>
            <th style="width:80px;text-align:right">Disc</th>
            <th style="width:60px;text-align:right">Tax</th>
            <th style="width:110px;text-align:right">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><span>৳${Math.round(sub).toLocaleString()}</span></div>
        <div><span>Discount</span><span>- ৳${(q.discount || 0).toLocaleString()}</span></div>
        <div><span>Tax (${q.tax || 0}%)</span><span>৳${Math.round(taxAmt).toLocaleString()}</span></div>
        <div class="grand"><span>Grand Total</span><span>৳${q.total.toLocaleString()}</span></div>
      </div>
      ${q.notes ? `<div class="note-box"><strong style="color:#1d4ed8">Notes:</strong> ${q.notes}</div>` : ''}
      ${q.terms ? `<div class="note-box"><strong style="color:#1d4ed8">Terms &amp; Conditions:</strong> ${q.terms}</div>` : ''}
      <div class="footer">
        <span>Thank you for your business!</span>
        <span>This is a computer-generated quotation.</span>
      </div>
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
  }

  function printQuote(q: Quotation) {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { showToast(lang === 'bn' ? 'পপ-আপ ব্লকড' : 'Popup blocked', 'error'); return; }
    w.document.write(buildPrintHTML(q));
    w.document.close();
  }


  // ---------- product picker inside line item ----------
  function pickProductForItem(idx: number, productId: string) {
    const p = products.find(x => String(x.id) === String(productId));
    if (!p) return;
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { name: (p.brand ? p.brand + ' ' : '') + p.name, qty: items[idx].qty || 1, price: p.sellingPrice || 0 };
      return { ...prev, items };
    });
  }

  // ---------- detail viewer ----------
  const [viewing, setViewing] = useState<Quotation | null>(null);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <FileText size={20} />
            </span>
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} /> {t.export}
          </button>
          <button
            onClick={() => { resetForm(); setIsAddQuotationOpen(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer border-none"
          >
            <Plus size={14} /> {t.newQuote}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard color="from-indigo-500 to-blue-600" icon={FileText} label={t.stats.total} value={stats.total} sub="" />
        <StatCard color="from-emerald-500 to-teal-600" icon={TrendingUp} label={t.stats.value} value={`৳${stats.value.toLocaleString()}`} sub="" />
        <StatCard color="from-green-500 to-emerald-600" icon={CheckCircle2} label={t.stats.approved} value={stats.approvedCount} sub={`৳${stats.approvedValue.toLocaleString()}`} />
        <StatCard color="from-amber-500 to-orange-600" icon={Clock} label={t.stats.pending} value={stats.pendingCount} sub="" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
          />
        </div>
        <div className="relative">
          <Filter size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-7 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-white"
          >
            <option value="All">{t.all}</option>
            {['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <UserIcon size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
          <select
            value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
            className="pl-7 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-white max-w-[180px]"
            title={t.filterCustomer}
          >
            <option value="All">{t.allCustomers}</option>
            {customerOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
          <Calendar size={12} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
          <span>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
        </div>
        {(search || statusFilter !== 'All' || customerFilter !== 'All' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('All'); setCustomerFilter('All'); setDateFrom(''); setDateTo(''); }}
            className="px-2.5 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            {lang === 'bn' ? 'ফিল্টার ক্লিয়ার' : 'Clear'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.id}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.customer}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.date}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.valid}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.items}</th>
                <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.amount}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.status}</th>
                <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    {t.empty}
                  </td>
                </tr>
              ) : filtered.map(q => {
                const SIcon = STATUS_ICON[q.status] || FileText;
                const isExpiringSoon = q.status === 'Sent' && q.validUntil &&
                  (new Date(q.validUntil).getTime() - Date.now()) < 3 * 86400000 &&
                  (new Date(q.validUntil).getTime() - Date.now()) > 0;
                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => setViewing(q)} className="font-bold text-indigo-600 hover:underline cursor-pointer">
                        {q.id}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{q.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{q.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{q.date}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {q.validUntil}
                      {isExpiringSoon && (
                        <span className="ml-1 text-[9px] font-bold text-amber-600">
                          ⚠ {lang === 'bn' ? 'শীঘ্রই' : 'soon'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{q.items.length}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800 font-mono">৳{q.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-full text-[10px] font-bold ${STATUS_STYLES[q.status]}`}>
                        <SIcon size={10} /> {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn onClick={() => setViewing(q)} title={t.view} color="text-blue-600"><Eye size={13} /></IconBtn>
                        <IconBtn onClick={() => openEdit(q)} title={t.edit} color="text-emerald-600"><Edit3 size={13} /></IconBtn>
                        <IconBtn onClick={() => printQuote(q)} title={t.print} color="text-slate-700"><Printer size={13} /></IconBtn>
                        <IconBtn onClick={() => duplicateQuote(q)} title={t.dup} color="text-indigo-600"><Copy size={13} /></IconBtn>
                        <IconBtn onClick={() => deleteQuote(q.id)} title={t.del} color="text-rose-600"><Trash2 size={13} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ ADD/EDIT MODAL ============ */}
      {isAddQuotationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start lg:items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-6xl p-6 shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                {editingId ? t.editHeading : t.newHeading}
              </h3>
              <button onClick={() => { setIsAddQuotationOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* LEFT — Customer + meta */}
                <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-1 border-b border-dashed border-slate-200">
                    {lang === 'bn' ? '১ · গ্রাহক ও মেটা' : '1 · Customer & Meta'}
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5 flex items-center gap-1"><UserIcon size={11} /> {t.customer} *</label>
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                        placeholder={lang === 'bn' ? 'বিদ্যমান গ্রাহক খুঁজুন...' : 'Search existing customer...'}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    {customerSearch && filteredCustomers.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg mb-2 bg-white">
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id} type="button"
                            onClick={() => { setForm(f => ({ ...f, customerName: c.name, phone: c.phone })); setCustomerSearch(''); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-xs cursor-pointer flex justify-between border-none bg-transparent"
                          >
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-slate-500 font-mono">{c.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required value={form.customerName}
                        onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                        placeholder={lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer name'}
                        className="p-2.5 border border-slate-200 rounded-lg"
                      />
                      <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={lang === 'bn' ? 'ফোন' : 'Phone'}
                        className="p-2.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1.5">{t.date}</label>
                      <input type="date" required value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5">{t.valid} *</label>
                      <input type="date" required value={form.validUntil}
                        onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5">{t.status}</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as Quotation['status'] }))}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                    >
                      {['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5">{t.notes}</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder={lang === 'bn' ? 'অতিরিক্ত মন্তব্য...' : 'Additional notes...'}
                      rows={2}
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1.5">{t.terms}</label>
                    <textarea
                      value={form.terms}
                      onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                      placeholder={lang === 'bn' ? 'পেমেন্ট শর্ত, ডেলিভারি টাইমলাইন, ওয়ারেন্টি...' : 'Payment terms, delivery timeline, warranty...'}
                      rows={3}
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-sans"
                    />
                  </div>
                </div>

                {/* RIGHT — Items + totals */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-1 border-b border-dashed border-slate-200 flex justify-between items-center">
                    <span>{lang === 'bn' ? '২ · আইটেম ও মূল্য' : '2 · Items & Pricing'}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }))}
                      className="px-2 py-1 rounded-md text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                      {t.addItem}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {form.items.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg bg-slate-50 border border-slate-150">
                        <div className="col-span-4">
                          <input
                            value={it.name}
                            onChange={e => setForm(f => {
                              const items = [...f.items]; items[idx] = { ...items[idx], name: e.target.value };
                              return { ...f, items };
                            })}
                            placeholder={t.itemName}
                            className="w-full p-2 border border-slate-200 rounded-md text-xs bg-white"
                          />
                          {products.length > 0 && (
                            <select
                              value=""
                              onChange={e => pickProductForItem(idx, e.target.value)}
                              className="w-full mt-1 p-1.5 border border-slate-200 rounded-md text-[10px] bg-white text-slate-500"
                            >
                              <option value="">{lang === 'bn' ? '↳ ইনভেন্টরি থেকে বাছুন' : '↳ Pick from inventory'}</option>
                              {products.slice(0, 40).map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {(p.brand ? p.brand + ' ' : '') + p.name} — ৳{(p.sellingPrice || 0).toLocaleString()}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input
                          type="number" min={1} value={it.qty}
                          onChange={e => setForm(f => {
                            const items = [...f.items]; items[idx] = { ...items[idx], qty: Number(e.target.value) };
                            return { ...f, items };
                          })}
                          placeholder={t.qty}
                          className="col-span-1 p-2 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                        <input
                          type="number" min={0} value={it.price}
                          onChange={e => setForm(f => {
                            const items = [...f.items]; items[idx] = { ...items[idx], price: Number(e.target.value) };
                            return { ...f, items };
                          })}
                          placeholder={t.price}
                          className="col-span-2 p-2 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                        <input
                          type="number" min={0} value={it.discount || ''}
                          onChange={e => setForm(f => {
                            const items = [...f.items]; items[idx] = { ...items[idx], discount: Number(e.target.value) };
                            return { ...f, items };
                          })}
                          placeholder={t.lineDiscount}
                          title={t.lineDiscount}
                          className="col-span-2 p-2 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                        <input
                          type="number" min={0} value={it.tax || ''}
                          onChange={e => setForm(f => {
                            const items = [...f.items]; items[idx] = { ...items[idx], tax: Number(e.target.value) };
                            return { ...f, items };
                          })}
                          placeholder={t.lineTax}
                          title={t.lineTax}
                          className="col-span-1 p-2 border border-slate-200 rounded-md text-xs font-mono bg-white"
                        />
                        <div className="col-span-1 text-right text-[11px] font-bold text-slate-700 font-mono py-2">
                          ৳{Math.round(lineTotal(it)).toLocaleString()}
                        </div>
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, i) => i !== idx) : f.items }))}
                          className="col-span-1 p-2 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1.5">{t.discount}</label>
                      <input type="number" min={0} value={form.discount || ''}
                        onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg font-mono" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1.5">{t.tax}</label>
                      <input type="number" min={0} value={form.tax || ''}
                        onChange={e => setForm(f => ({ ...f, tax: Number(e.target.value) }))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg font-mono" />
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 space-y-1.5 text-[12px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.subtotal}:</span>
                      <span className="font-bold">৳{formSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.discount}:</span>
                      <span>- ৳{(form.discount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.tax} ({form.tax || 0}%):</span>
                      <span>+ ৳{Math.round(formTaxAmt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-1.5 text-[14px]">
                      <span className="text-slate-300">{t.grand}:</span>
                      <span className="text-emerald-400 font-bold">৳{formGrand.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => { setIsAddQuotationOpen(false); resetForm(); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">
                  {t.cancel}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl cursor-pointer border-none shadow-md">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DETAIL MODAL ============ */}
      {viewing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start lg:items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl p-6 shadow-2xl space-y-4 animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" /> {t.detailHeading}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{viewing.id}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <XIcon size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <InfoBox label={t.customer} value={viewing.customerName} sub={viewing.phone} />
              <InfoBox label={t.status} value={viewing.status} sub={`${t.valid}: ${viewing.validUntil}`} accent={STATUS_STYLES[viewing.status]} />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold text-slate-600">#</th>
                    <th className="text-left px-3 py-2 font-bold text-slate-600">{t.itemName}</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-600">{t.qty}</th>
                    <th className="text-right px-3 py-2 font-bold text-slate-600">{t.price}</th>
                    <th className="text-right px-3 py-2 font-bold text-slate-600">{t.subtotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.items.map((it, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2 font-bold text-slate-800">{it.name}</td>
                      <td className="px-3 py-2 text-center font-mono">{it.qty}</td>
                      <td className="px-3 py-2 text-right font-mono">৳{it.price.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">৳{Math.round(lineTotal(it)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-xs font-mono bg-slate-50 rounded-lg p-3 border border-slate-200">
                <Row label={t.subtotal} v={`৳${Math.round(viewing.items.reduce((s, i) => s + lineTotal(i), 0)).toLocaleString()}`} />
                <Row label={t.discount} v={`- ৳${(viewing.discount || 0).toLocaleString()}`} />
                <Row label={`${t.tax} (${viewing.tax || 0}%)`} v={`৳${Math.round((viewing.items.reduce((s, i) => s + lineTotal(i), 0) - (viewing.discount || 0)) * ((viewing.tax || 0) / 100)).toLocaleString()}`} />
                <div className="border-t border-slate-300 pt-1 mt-1 flex justify-between font-bold text-[13px]">
                  <span>{t.grand}</span>
                  <span className="text-emerald-600">৳{viewing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {viewing.notes && (
              <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600">
                <strong className="text-slate-800">{t.notes}: </strong>{viewing.notes}
              </div>
            )}
            {viewing.terms && (
              <div className="p-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/40 text-xs text-slate-600">
                <strong className="text-blue-800">{t.terms}: </strong>{viewing.terms}
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">{t.changeStatus}:</span>
                {(['Draft', 'Sent', 'Approved', 'Rejected'] as const).map(s => (
                  <button key={s} onClick={() => changeStatus(viewing.id, s)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${viewing.status === s ? STATUS_STYLES[s] : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {onConvertToSale && viewing.status === 'Approved' && (
                  <button
                    onClick={() => {
                      onConvertToSale(viewing);
                      setViewing(null);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border-none">
                    <ShoppingCart size={12} /> {t.convert}
                  </button>
                )}
                <button onClick={() => printQuote(viewing)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border-none">
                  <Printer size={12} /> {t.print}
                </button>
                <button onClick={() => printQuote(viewing)}
                  title={lang === 'bn' ? 'প্রিন্ট ডায়ালগ থেকে PDF হিসেবে সেভ করুন' : 'Save as PDF from the print dialog'}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border-none">
                  <Download size={12} /> {t.downloadPdf}
                </button>
                <button onClick={() => { openEdit(viewing); setViewing(null); }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border-none">
                  <Edit3 size={12} /> {t.edit}
                </button>
                <button onClick={() => setViewing(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer border-none">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small helpers ---------- */
function StatCard({ color, icon: Icon, label, value, sub }: any) {
  const toneMap: Record<string, { bg: string; text: string }> = {
    'from-indigo-500 to-blue-600': {
      bg: 'bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-700 dark:text-indigo-400',
    },
    'from-emerald-500 to-teal-600': {
      bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    'from-green-500 to-emerald-600': {
      bg: 'bg-gradient-to-br from-green-50/90 via-green-50/40 to-white dark:from-green-950/40 dark:via-green-950/20 dark:to-slate-900 border-green-200/80 dark:border-green-800/60',
      text: 'text-green-700 dark:text-green-400',
    },
    'from-amber-500 to-orange-600': {
      bg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-400',
    },
  };
  const t = toneMap[color] || toneMap['from-indigo-500 to-blue-600'];
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left select-none ${t.bg}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className={t.text}><Icon size={18} /></span>
        </div>
        <span className={`font-bold text-xs sm:text-sm tracking-tight truncate ${t.text}`}>{label}</span>
      </div>
      <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono truncate">{value}</div>
      {sub ? <div className="mt-1 text-xs font-medium text-slate-500 truncate">{sub}</div> : null}
    </div>
  );
}

function IconBtn({ onClick, title, color, children }: any) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-md hover:bg-slate-100 ${color} cursor-pointer bg-transparent border-none`}>
      {children}
    </button>
  );
}

function InfoBox({ label, value, sub, accent }: any) {
  return (
    <div className={`p-3 rounded-xl border ${accent || 'bg-slate-50 border-slate-200'}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-sm font-bold mt-1">{value}</div>
      {sub && <div className="text-[10px] font-mono opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

function Row({ label, v }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{v}</span>
    </div>
  );
}

export default Quotations;

