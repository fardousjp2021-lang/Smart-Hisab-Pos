import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Printer, Trash2, Edit3, Filter, X as XIcon, Save,
  FileText, TrendingDown, Calendar, Download, Tag, ChevronDown, ChevronUp,
} from 'lucide-react';
import { enqueueExpense } from '../salesSyncQueue';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

type ExpenseRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  note?: string;
};

type Props = {
  expenses: ExpenseRow[];
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>;
  expenseCategories: string[];
  setExpenseCategories?: React.Dispatch<React.SetStateAction<any[]>>;
  lang?: 'bn' | 'en';
  showToast?: (msg: string, kind?: 'success' | 'error' | 'info') => void;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
};

const fmt = (n: number) =>
  '৳' + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const today = () => new Date().toISOString().slice(0, 10);
const monthKey = (d: string) => (d || '').slice(0, 7);
const nowMonth = () => new Date().toISOString().slice(0, 7);

type QuickRange = 'all' | 'today' | '7d' | '30d' | 'month';

export default function ExpenseCenter(props: Props) {
  const {
    expenses, setExpenses, expenseCategories, setExpenseCategories,
    lang = 'en', showToast, shopName = 'Shop', shopAddress = '', shopPhone = '',
  } = props;

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quick, setQuick] = useState<QuickRange>('all');
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [open, setOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Apply quick range → from/to
  const range = useMemo(() => {
    if (quick === 'all') return { f: from, tt: to };
    const now = new Date();
    let f = from, tt = to;
    if (quick === 'today') { f = today(); tt = today(); }
    else if (quick === '7d') {
      const d = new Date(now); d.setDate(d.getDate() - 6);
      f = d.toISOString().slice(0, 10); tt = today();
    } else if (quick === '30d') {
      const d = new Date(now); d.setDate(d.getDate() - 29);
      f = d.toISOString().slice(0, 10); tt = today();
    } else if (quick === 'month') {
      f = nowMonth() + '-01'; tt = today();
    }
    return { f, tt };
  }, [quick, from, to]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return expenses
      .filter(e =>
        !needle ||
        (e.title || '').toLowerCase().includes(needle) ||
        (e.category || '').toLowerCase().includes(needle) ||
        (e.note || '').toLowerCase().includes(needle) ||
        (e.paymentMethod || '').toLowerCase().includes(needle) ||
        (e.id || '').toLowerCase().includes(needle)
      )
      .filter(e => !cat || e.category === cat)
      .filter(e => !range.f || (e.date || '') >= range.f)
      .filter(e => !range.tt || (e.date || '') <= range.tt)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [expenses, q, cat, range]);

  const total = useMemo(() => filtered.reduce((a, e) => a + Number(e.amount || 0), 0), [filtered]);
  const todayTotal = useMemo(
    () => expenses.filter(e => e.date === today()).reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses],
  );
  const monthTotal = useMemo(
    () => expenses.filter(e => monthKey(e.date) === nowMonth()).reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses],
  );
  const monthCount = useMemo(
    () => expenses.filter(e => monthKey(e.date) === nowMonth()).length,
    [expenses],
  );

  const categoryAnalytics = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => {
      const key = e.category || 'General';
      map[key] = (map[key] || 0) + Number(e.amount || 0);
    });
    const tot = filtered.reduce((s, e) => s + Number(e.amount || 0), 0) || 1;
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        pct: Math.round((amount / tot) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const dailyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.date] = (map[e.date] || 0) + Number(e.amount || 0); });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
  }, [filtered]);

  const exportCSV = () => {
    const header = ['ID', 'Date', 'Title', 'Category', 'Payment Method', 'Amount', 'Note'];
    const rows = filtered.map(e => [e.id, e.date, e.title, e.category, e.paymentMethod || 'Cash', String(e.amount), (e.note || '').replace(/\n/g, ' ')]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `expenses-${today()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast && showToast(t('CSV এক্সপোর্ট হয়েছে', 'CSV exported'), 'success');
  };

  const printReport = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const rowsHtml = filtered.map(e => `
      <tr>
        <td>${e.date}</td>
        <td>${escapeHtml(e.title)}</td>
        <td>${escapeHtml(e.category)}</td>
        <td>${escapeHtml(e.paymentMethod || 'Cash')}</td>
        <td class="right">${fmt(e.amount)}</td>
      </tr>`).join('');
    w.document.write(`
      <html><head><title>Expense Report</title>
      <style>
        body{font-family:system-ui,Arial;padding:24px;color:#0f172a}
        h1{margin:0 0 4px 0;font-size:20px}
        .sub{color:#64748b;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
        th{background:#f1f5f9}
        .right{text-align:right}
        tfoot td{font-weight:700;background:#fef2f2}
      </style></head><body>
      <h1>${escapeHtml(shopName)} — Expense Report</h1>
      <div class="sub">${escapeHtml(shopAddress)} ${shopPhone ? '· ' + escapeHtml(shopPhone) : ''}<br/>
      Range: ${range.f || '—'} → ${range.tt || '—'} · Category: ${cat || 'All'} · Entries: ${filtered.length}</div>
      <table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Source</th><th class="right">Amount</th></tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="5" style="text-align:center;padding:12px">No entries</td></tr>'}</tbody>
      <tfoot><tr><td colspan="4" class="right">Total</td><td class="right">${fmt(total)}</td></tr></tfoot>
      </table>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  const printSingleVoucher = (e: ExpenseRow) => {
    const w = window.open('', '_blank', 'width=500,height=600');
    if (!w) return;
    w.document.write(`
      <html><head><title>Expense Voucher #${e.id}</title>
      <style>
        body{font-family:system-ui,Arial;padding:20px;color:#0f172a;max-width:400px;margin:auto}
        .card{border:2px solid #e2e8f0;border-radius:16px;padding:20px;background:#fff}
        .h{text-align:center;border-b:2px dashed #cbd5e1;padding-bottom:12px;margin-bottom:12px}
        .title{font-size:18px;font-weight:800;color:#e11d48}
        .row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0}
        .amt{font-size:22px;font-weight:900;color:#e11d48;text-align:center;background:#fff1f2;padding:10px;border-radius:12px;margin:12px 0}
        .foot{margin-top:30px;display:flex;justify-content:space-between;font-size:11px;color:#64748b;border-t:1px solid #e2e8f0;pt:10px}
      </style></head><body>
      <div class="card">
        <div class="h">
          <div style="font-size:16px;font-weight:800">${escapeHtml(shopName)}</div>
          <div style="font-size:11px;color:#64748b">${escapeHtml(shopAddress)}</div>
          <div class="title" style="margin-top:6px">EXPENSE VOUCHER</div>
        </div>
        <div class="row"><span>Voucher ID:</span><strong>#${e.id}</strong></div>
        <div class="row"><span>Date:</span><span>${e.date}</span></div>
        <div class="row"><span>Title:</span><strong>${escapeHtml(e.title)}</strong></div>
        <div class="row"><span>Category:</span><span>${escapeHtml(e.category)}</span></div>
        <div class="row"><span>Payment Source:</span><strong style="color:#2563eb">${escapeHtml(e.paymentMethod || 'Cash Drawer')}</strong></div>
        ${e.note ? `<div class="row"><span>Note:</span><span>${escapeHtml(e.note)}</span></div>` : ''}
        <div class="amt">AMOUNT: ${fmt(e.amount)}</div>
        <div class="foot">
          <div>Prepared By: ____________</div>
          <div>Authorized Sign: ____________</div>
        </div>
      </div>
      <script>setTimeout(()=>{window.print();},250)</script>
      </body></html>
    `);
    w.document.close();
  };

  const clearFilters = () => { setQ(''); setCat(''); setFrom(''); setTo(''); setQuick('all'); };

  const catList = expenseCategories && expenseCategories.length
    ? expenseCategories
    : ['General', 'Rent & Bills', 'Salaries', 'Travel', 'Utility', 'Other'];

  return (
    <div className="w-full space-y-5 animate-fade-in text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-2xl shrink-0">
            <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              {t('খরচ ব্যবস্থাপনা কেন্দ্র', 'Expense Management Center')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('দোকানের সব খরচ, ক্যাটাগরি বিশ্লেষণ, পেমেন্ট মাধ্যম ও রসিদ ব্যবস্থাপনা', 'Manage all store expenses, category analytics, payment sources & voucher receipts')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => setCatModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer">
            <Tag size={14} /> {t('ক্যাটাগরি সমূহ', 'Categories')}
          </button>
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer">
            <Download size={14} /> CSV
          </button>
          <button onClick={printReport} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer">
            <Printer size={14} /> {t('প্রিন্ট রিপোর্ট', 'Print Report')}
          </button>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer">
            <Plus size={15} /> {t('+ নতুন খরচ যোগ করুন', '+ Add Expense')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard tone="rose" label={t('আজকের মোট খরচ', "Today's Expenses")} value={fmt(todayTotal)} icon={<Calendar size={16} />} />
        <SummaryCard tone="orange" label={t('এই মাসের খরচ', 'This Month')} value={fmt(monthTotal)} icon={<TrendingDown size={16} />} sub={`${monthCount} ${t('টি এন্ট্রি', 'entries')}`} />
        <SummaryCard tone="blue" label={t('ফিল্টারকৃত মোট', 'Filtered Total')} value={fmt(total)} icon={<Filter size={16} />} sub={`${filtered.length} ${t('টি এন্ট্রি', 'entries')}`} />
        <SummaryCard tone="slate" label={t('মোট ক্যাটাগরি', 'Active Categories')} value={String(catList.length)} icon={<Tag size={16} />} />
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap gap-2 items-center">
          {(['all', 'today', '7d', '30d', 'month'] as QuickRange[]).map(k => (
            <button key={k}
              onClick={() => setQuick(k)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                quick === k
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {k === 'all' ? t('সব', 'All')
                : k === 'today' ? t('আজ', 'Today')
                : k === '7d' ? t('৭ দিন', '7 Days')
                : k === '30d' ? t('৩০ দিন', '30 Days')
                : t('এই মাস', 'This Month')}
            </button>
          ))}
          <div className="ml-auto text-xs font-bold text-slate-500">
            {t('ফিল্টারকৃত মোট:', 'Filtered Total:')} <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{fmt(total)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('শিরোনাম, ক্যাটাগরি, মাধ্যম বা রেফারেন্স খুঁজুন...', 'Search title, category, source or ID...')}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none">
            <option value="">{t('সব ক্যাটাগরি', 'All Categories')}</option>
            {catList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setQuick('all'); }} className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none" />
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setQuick('all'); }} className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none" />
        </div>
        {(q || cat || from || to || quick !== 'all') && (
          <div>
            <button onClick={clearFilters} className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer">
              <XIcon size={12} /> {t('ফিল্টার রিসেট করুন', 'Reset filters')}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Expense Data Table */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('খরচের তালিকা (Expense Log)', 'Expense List')}</h3>
            <span className="text-xs font-bold text-slate-400">{filtered.length} {t('টি রেকর্ড সংগৃহীত', 'entries found')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-none">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 w-28">{t('তারিখ', 'Date')}</th>
                  <th className="py-3 px-4">{t('খরচের বিবরণ', 'Expense Title')}</th>
                  <th className="py-3 px-4">{t('ক্যাটাগরি', 'Category')}</th>
                  <th className="py-3 px-4">{t('পেমেন্ট মাধ্যম', 'Source')}</th>
                  <th className="py-3 px-4 text-right">{t('পরিমাণ (৳)', 'Amount')}</th>
                  <th className="py-3 px-4 text-center">{t('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">{t('কোনো খরচের রেকর্ড পাওয়া যায়নি', 'No expenses found')}</td></tr>
                )}
                {filtered.map(row => (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-500 text-[11px] whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-white text-xs">{row.title}</div>
                        {row.note && <div className="text-[10px] text-slate-400 font-semibold truncate max-w-xs">{row.note}</div>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-900/50">
                          💳 {row.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-bold text-sm whitespace-nowrap">
                        {fmt(row.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-600 transition cursor-pointer" 
                            title={t('ভাউচার প্রিন্ট', 'Print Voucher')}
                            onClick={() => printSingleVoucher(row)}
                          >
                            <FileText size={13} />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-blue-600 transition cursor-pointer" 
                            title={t('সম্পাদনা', 'Edit')}
                            onClick={() => { setEditing(row); setOpen(true); }}
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:text-rose-700 transition cursor-pointer" 
                            title={t('মুছুন', 'Delete')}
                            onClick={() => {
                              if (confirm(t('মুছবেন?', 'Delete this entry?'))) {
                                setExpenses(prev => prev.filter((x: any) => x.id !== row.id));
                                try { deleteDoc(doc(db, 'expenses', row.id)).catch(() => {}); } catch {}
                                showToast && showToast(t('মুছে ফেলা হয়েছে', 'Deleted'), 'success');
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Analytics & Daily Breakdowns */}
        <div className="space-y-4">
          {/* Category Percentage Analytics */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Tag size={16} className="text-rose-500" />
              <span>{t('ক্যাটাগরি ভিত্তিক খরচের হিসাব (% Ratio)', 'Category Cost Analytics (%)')}</span>
            </h3>
            
            <div className="space-y-2.5">
              {categoryAnalytics.length === 0 && (
                <div className="text-xs text-slate-400 font-semibold text-center py-4">{t('কোনো তথ্য নেই', 'No data')}</div>
              )}
              {categoryAnalytics.map(item => (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{fmt(item.amount)} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BreakdownCard title={t('দৈনিক মোট (গত ৭ দিন)', 'Daily totals (7d)')} rows={dailyBreakdown} empty={t('কোনো তথ্য নেই', 'No data')} />
        </div>
      </div>

      {open && (
        <ExpenseModal
          title={editing ? t('খরচ সম্পাদনা', 'Edit expense') : t('নতুন খরচ যোগ করুন', 'Add expense')}
          initial={editing}
          categories={catList}
          onAddCategory={(name) => {
            const trimmed = name.trim();
            if (!trimmed) return false;
            if (setExpenseCategories) {
              setExpenseCategories(prev => Array.from(new Set([...(prev || []), trimmed])));
            }
            return true;
          }}
          onClose={() => setOpen(false)}
          onSave={(row) => {
            if (editing) {
              setExpenses(prev => prev.map(x => x.id === editing.id ? { ...x, ...row } : x));
              showToast && showToast(t('আপডেট সম্পন্ন', 'Updated'), 'success');
            } else {
              const newRow: ExpenseRow = {
                id: `EXP-${Date.now()}`,
                ...row,
              };
              setExpenses(prev => [newRow, ...prev]);
              try { enqueueExpense(newRow); } catch {}
              showToast && showToast(t('সংরক্ষণ সম্পন্ন', 'Saved'), 'success');
            }
            setOpen(false);
          }}
          t={t}
        />
      )}

      {catModalOpen && (
        <CategoryModal
          categories={catList}
          value={newCat}
          setValue={setNewCat}
          editable={Boolean(setExpenseCategories)}
          onAdd={(name) => {
            const trimmed = name.trim();
            if (!trimmed) return;
            if (setExpenseCategories) {
              setExpenseCategories(prev => Array.from(new Set([...(prev || []), trimmed])));
              setNewCat('');
              showToast && showToast(t('ক্যাটাগরি যোগ হয়েছে', 'Category added'), 'success');
            }
          }}
          onDelete={(name) => {
            if (setExpenseCategories && confirm(t('ক্যাটাগরি মুছবেন?', 'Delete category?'))) {
              setExpenseCategories(prev => (prev || []).filter(c => c !== name));
              showToast && showToast(t('মুছে ফেলা হয়েছে', 'Deleted'), 'success');
            }
          }}
          onClose={() => setCatModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

function SummaryCard(props: { tone?: string; label: string; value: string; icon: React.ReactNode; sub?: string }) {
  const tones: Record<string, { bg: string; text: string }> = {
    rose: {
      bg: 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white dark:from-rose-950/40 dark:via-rose-950/20 dark:to-slate-900 border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-400',
    },
    orange: {
      bg: 'bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-800 dark:text-amber-400',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-white dark:from-blue-950/40 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-50/90 via-slate-50/40 to-white dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-900 border-slate-200/80 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
    },
  };

  const tStyle = tones[props.tone || 'slate'] || tones.slate;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left select-none ${tStyle.bg}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className={tStyle.text}>{props.icon}</span>
        </div>
        <span className={`font-bold text-xs sm:text-sm tracking-tight truncate ${tStyle.text}`}>
          {props.label}
        </span>
      </div>
      <div className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono truncate">
        {props.value}
      </div>
      {props.sub && <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">{props.sub}</div>}
    </div>
  );
}

function BreakdownCard(props: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...props.rows.map(r => r[1]));
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{props.title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {props.rows.length === 0 && <div className="text-xs text-slate-400 font-semibold text-center py-4">{props.empty}</div>}
        {props.rows.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
              <span>{k}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{fmt(v)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function ExpenseModal(props: {
  title: string;
  initial: ExpenseRow | null;
  categories: string[];
  onClose: () => void;
  onSave: (row: Omit<ExpenseRow, 'id'>) => void;
  onAddCategory?: (name: string) => boolean;
  t: (bn: string, en: string) => string;
}) {
  const init = props.initial;
  const [title, setTitle] = useState(init?.title || '');
  const [category, setCategory] = useState(init?.category || (props.categories[0] || 'General'));
  const [paymentMethod, setPaymentMethod] = useState(init?.paymentMethod || 'Cash Drawer (ক্যাশ)');
  const [amount, setAmount] = useState<number>(Number(init?.amount || 0));
  const [date, setDate] = useState(init?.date || today());
  const [note, setNote] = useState(init?.note || '');
  const [addingCat, setAddingCat] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const returnFocusToSelect = useRef(false);

  const openAddCat = () => { setAddingCat(true); setCustomCat(''); };
  const cancelAddCat = () => {
    setAddingCat(false);
    setCustomCat('');
    returnFocusToSelect.current = true;
  };
  const commitCustomCat = () => {
    const name = customCat.trim();
    if (!name) { cancelAddCat(); return; }
    const ok = props.onAddCategory ? props.onAddCategory(name) : false;
    if (ok || props.categories.includes(name)) {
      setCategory(name);
    } else {
      setCategory(name);
    }
    setCustomCat('');
    setAddingCat(false);
    returnFocusToSelect.current = true;
  };

  useEffect(() => {
    if (!addingCat && returnFocusToSelect.current) {
      returnFocusToSelect.current = false;
      selectRef.current?.focus();
    }
    if (addingCat) {
      customInputRef.current?.focus();
      customInputRef.current?.select();
    }
  }, [addingCat]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={props.onClose}>
      <div
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — rose gradient banner */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <TrendingDown size={20} className="p-1 bg-white/20 rounded-lg" />
            <h3 className="text-base font-bold">{props.title}</h3>
          </div>
          <button onClick={props.onClose} className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer">
            <XIcon size={18} />
          </button>
        </div>

        {/* Body — landscape 2-column layout */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {/* LEFT column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{props.t('খরচের শিরোনাম', 'Title')} *</label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={props.t('যেমন: দোকান ভাড়া বা বিদ্যুৎ বিল', 'e.g. Electricity bill or Shop rent')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-bold bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                <span>{props.t('ক্যাটাগরি', 'Category')} *</span>
                {props.onAddCategory && !addingCat && (
                  <button
                    type="button"
                    onClick={() => { setAddingCat(true); setCustomCat(''); }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <Plus size={12} /> {props.t('নতুন ক্যাটাগরি', 'New')}
                  </button>
                )}
              </label>

              {!addingCat ? (
                <div className="flex gap-2">
                  <select
                    ref={selectRef}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {props.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {category && !props.categories.includes(category) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={customInputRef}
                    value={customCat}
                    onChange={e => setCustomCat(e.target.value)}
                    placeholder={props.t('নতুন ক্যাটাগরি নাম...', 'Custom category name...')}
                    className="flex-1 rounded-xl border border-rose-300 dark:border-rose-800 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={commitCustomCat}
                    disabled={!customCat.trim()}
                    className="px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddCat}
                    className="px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{props.t('পেমেন্ট মাধ্যম (Payment Source)', 'Payment Source')} *</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-bold bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="Cash Drawer (ক্যাশ)">💵 Cash Drawer (ক্যাশ ড্রয়ার)</option>
                <option value="bKash / Mobile Banking (বিকাশ)">📱 bKash / Mobile Banking (বিকাশ)</option>
                <option value="Bank Account (ব্যাংক)">🏦 Bank Account (ব্যাংক অ্যাকাউন্ট)</option>
                <option value="Petty Cash (পেটি ক্যাশ)">🪙 Petty Cash (পেটি ক্যাশ)</option>
              </select>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{props.t('পরিমাণ (৳)', 'Amount (৳)')} *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm font-bold">৳</span>
                <input
                  type="number"
                  min={0}
                  value={amount || ''}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-rose-200 dark:border-rose-900/50 pl-8 pr-3.5 py-2.5 text-base font-bold text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{props.t('তারিখ', 'Date')} *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs font-bold bg-white dark:bg-slate-950 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{props.t('নোট / অতিরিক্ত তথ্য', 'Note')}</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder={props.t('রেফারেন্স বা অতিরিক্ত বিবরণ...', 'Additional reference notes...')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-950 dark:text-white focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-xs text-slate-400 font-semibold hidden sm:block">
            {props.t('সংরক্ষণের আগে তথ্যগুলো যাচাই করুন।', 'Review details before saving.')}
          </div>
          <div className="flex gap-2.5 ml-auto">
            <button
              onClick={props.onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              {props.t('বাতিল', 'Cancel')}
            </button>
            <button
              onClick={() => {
                if (!title.trim() || amount <= 0) return;
                props.onSave({ title: title.trim(), category, paymentMethod, amount, date, note });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              <Save size={14} /> {props.t('সংরক্ষণ করুন', 'Save Expense')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryModal(props: {
  categories: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  value: string;
  setValue: (v: string) => void;
  t: (bn: string, en: string) => string;
  editable: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={props.onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{props.t('বিভাগ ব্যবস্থাপনা', 'Manage categories')}</h3>
          <button onClick={props.onClose} className="p-1 text-slate-500 hover:text-slate-800"><XIcon size={16} /></button>
        </div>
        {props.editable && (
          <div className="flex gap-2 mb-3">
            <input value={props.value} onChange={e => props.setValue(e.target.value)} placeholder={props.t('নতুন বিভাগ', 'New category')} className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-sm" />
            <button onClick={() => props.onAdd(props.value)} className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">
              <Plus size={14} />
            </button>
          </div>
        )}
        <div className="max-h-72 overflow-auto divide-y divide-slate-100 rounded-lg border border-slate-200">
          {props.categories.map(c => (
            <div key={c} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-slate-700">{c}</span>
              {props.editable && (
                <button onClick={() => props.onDelete(c)} className="text-slate-400 hover:text-rose-600" title="Delete">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {props.categories.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">{props.t('কোনো বিভাগ নেই', 'No categories')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

