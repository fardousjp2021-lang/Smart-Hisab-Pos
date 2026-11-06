// @ts-nocheck
/**
 * ReportCenter — unified Report Center dispatcher (v1 P0).
 *
 * Renders one of 7 specialized sub-tabs behind /reports:
 *   rep_sales | rep_purchase | rep_inventory | rep_financial |
 *   rep_warranty | rep_analytics | print_doc
 *
 * All data flows in through props (workspace-scoped from App.tsx / AppContext).
 * No mock data is introduced here. Exports (PDF/Excel/CSV/Print) are lazy-
 * loaded to keep the initial reports chunk small.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SummaryCard } from './SummaryCard';
import { useApp } from '../context/AppContext';
import { useLiveLedgers } from '../hooks/useLiveLedgers';
import {
  Calendar, Download, FileText, FileSpreadsheet, Printer,
  TrendingUp, TrendingDown, DollarSign, Package, ShieldCheck,
  BarChart2, Wifi, WifiOff, AlertTriangle, Inbox, RefreshCw,
} from 'lucide-react';

type Lang = 'bn' | 'en';

interface Props {
  sales?: any[];
  products?: any[];
  purchases?: any[];
  expenses?: any[];
  lang: Lang;
  activeSubTab: string;
  customers: any[];
  suppliers: any[];
  userRole?: string;
}


const tt = (lang: Lang, bn: string, en: string) => (lang === 'bn' ? bn : en);
const money = (n: number) => '৳ ' + (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const isoToday = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

const SUB_META: Record<string, { bn: string; en: string; icon: any; color: string }> = {
  rep_sales:     { bn: 'বিক্রয় রিপোর্ট',    en: 'Sales Report',     icon: TrendingUp,  color: 'from-blue-500 to-indigo-600' },
  rep_purchase:  { bn: 'ক্রয় রিপোর্ট',      en: 'Purchase Report',  icon: Package,     color: 'from-amber-500 to-orange-600' },
  rep_inventory: { bn: 'ইনভেন্টরি রিপোর্ট', en: 'Inventory Report', icon: Package,     color: 'from-emerald-500 to-teal-600' },
  rep_financial: { bn: 'ফাইন্যান্স রিপোর্ট', en: 'Finance Report',   icon: DollarSign,  color: 'from-rose-500 to-pink-600' },
  rep_warranty:  { bn: 'ওয়ারেন্টি রিপোর্ট',  en: 'Warranty Report',  icon: ShieldCheck, color: 'from-violet-500 to-purple-600' },
  rep_analytics: { bn: 'অ্যানালিটিক্স',     en: 'Analytics',        icon: BarChart2,   color: 'from-cyan-500 to-blue-600' },
  print_doc:     { bn: 'এক্সপোর্ট ও প্রিন্ট', en: 'Export & Print',   icon: Printer,     color: 'from-slate-500 to-slate-700' },
};

export const ReportCenter: React.FC<Props> = ({
  lang, activeSubTab, customers, suppliers, userRole, sales: propSales, products: propProducts, purchases: propPurchases, expenses: propExpenses,
}) => {
  let appCtx: any = null;
  try { appCtx = useApp(); } catch {}
  const sales = propSales || appCtx?.sales || [];
  const products = propProducts || appCtx?.products || [];
  const stockMovements = appCtx?.stockMovements || [];
  const loadingData = appCtx?.loadingData || false;
  // Live, workspace-scoped Firestore ledgers (no seed/demo state).
  const {
    purchases,
    purchaseReturns,
    expenses,
    loading: ledgersLoading,
    error: ledgerError,
  } = useLiveLedgers(true);
  const subId = activeSubTab || 'rep_sales';
  const meta = SUB_META[subId] || SUB_META.rep_sales;
  const Icon = meta.icon;


  // Date range state (dynamic; anchored to today)
  const [preset, setPreset] = useState<'today' | 'week' | 'days15' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>(firstOfMonth());
  const [endDate, setEndDate] = useState<string>(isoToday());
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Recompute [start,end] on preset change
  useEffect(() => {
    if (preset === 'custom') return;
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    if (preset === 'today') { setStartDate(iso(today)); setEndDate(iso(today)); }
    else if (preset === 'week') { const s = new Date(today); s.setDate(s.getDate() - 6); setStartDate(iso(s)); setEndDate(iso(today)); }
    else if (preset === 'days15') { const s = new Date(today); s.setDate(s.getDate() - 14); setStartDate(iso(s)); setEndDate(iso(today)); }
    else if (preset === 'month') { setStartDate(firstOfMonth()); setEndDate(iso(today)); }
    else if (preset === 'all') { setStartDate('2020-01-01'); setEndDate(iso(today)); }
  }, [preset]);

  const inRange = (d: string) => {
    if (!d) return false;
    const s = String(d).slice(0, 10);
    return s >= startDate && s <= endDate;
  };

  // Derived per-report datasets (memoized)
  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (sales || [])
      .filter((s: any) => inRange(s?.date))
      .filter((s: any) => {
        if (!q) return true;
        return (s?.id || '').toLowerCase().includes(q) ||
          (s?.productName || '').toLowerCase().includes(q) ||
          (s?.customerName || '').toLowerCase().includes(q) ||
          (s?.phone || '').toLowerCase().includes(q);
      });
  }, [sales, startDate, endDate, searchQuery]);

  const salesSummary = useMemo(() => {
    let totalRevenue = 0, totalProfit = 0, totalQty = 0, totalDue = 0;
    for (const s of filteredSales) {
      const rev = Number(s.totalPrice || s.totalAmount || 0);
      const qty = Number(s.quantity || 1);
      const cost = Number(s.purchasePriceAtTime || s.costPrice || 0) * qty;
      const prof = Number(s.profit ?? (rev - cost));
      const due = Number(s.due || s.dueAmount || 0);
      totalRevenue += rev;
      totalProfit += prof;
      totalQty += qty;
      totalDue += due;
    }
    return { totalRevenue, totalProfit, totalQty, totalDue };
  }, [filteredSales]);
  const filteredPurchases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (purchases || [])
      .filter((p: any) => inRange(p?.date))
      .filter((p: any) => {
        if (!q) return true;
        return (p?.id || '').toLowerCase().includes(q) ||
          (p?.supplier || '').toLowerCase().includes(q) ||
          (p?.productName || p?.itemName || '').toLowerCase().includes(q);
      });
  }, [purchases, startDate, endDate, searchQuery]);
  const filteredExpenses = useMemo(() => (expenses || []).filter((e: any) => inRange(e?.date)), [expenses, startDate, endDate]);
  const filteredReturns = useMemo(() => (purchaseReturns || []).filter((r: any) => inRange(r?.date)), [purchaseReturns, startDate, endDate]);

  // Purchase aggregates (live data only)
  const purchaseTotals = useMemo(() => {
    const amount = filteredPurchases.reduce((a: number, p: any) => a + Number(p.total || 0), 0);
    const qty = filteredPurchases.reduce((a: number, p: any) => a + Number(p.quantity || 0), 0);
    const due = filteredPurchases.reduce((a: number, p: any) => a + Number(p.due || 0), 0);
    const returnAmount = filteredReturns.reduce((a: number, r: any) => a + Number(r.total || 0), 0);
    const returnQty = filteredReturns.reduce((a: number, r: any) => a + Number(r.quantity || 0), 0);
    return { amount, qty, due, returnAmount, returnQty };
  }, [filteredPurchases, filteredReturns]);

  // Customer-wise dues (live sales within range)
  const customerDues = useMemo(() => {
    const map = new Map<string, { customer: string; phone: string; total: number; paid: number; due: number }>();
    for (const s of filteredSales) {
      const key = s.customerId || s.customerName || s.phone || 'Unknown Customer';
      const tot = Number(s.totalPrice || s.totalAmount || 0);
      const dueAmt = Number(s.due || s.dueAmount || 0);
      const paidAmt = Number(s.paid || s.paidAmount || (tot - dueAmt));
      const row = map.get(key) || { customer: s.customerName || key, phone: s.phone || s.customerPhone || '—', total: 0, paid: 0, due: 0 };
      row.total += tot;
      row.paid += paidAmt;
      row.due += dueAmt;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => b.due - a.due);
  }, [filteredSales]);

  

  // Supplier-wise dues (live purchases within range)
  const supplierDues = useMemo(() => {
    const map = new Map<string, { supplier: string; total: number; paid: number; due: number }>();
    for (const p of (filteredPurchases || [])) {
      const key = p.supplier || p.supplierName || 'Unknown Supplier';
      const tot = Number(p.total || p.totalAmount || 0);
      const paidAmt = Number(p.paid || p.paidAmount || 0);
      const dueAmt = Number(p.due || p.dueAmount || Math.max(0, tot - paidAmt));
      const row = map.get(key) || { supplier: key, total: 0, paid: 0, due: 0 };
      row.total += tot;
      row.paid += paidAmt;
      row.due += dueAmt;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => b.due - a.due);
  }, [filteredPurchases]);

  
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (products || []).filter((p: any) => {
      if (!q) return true;
      return (p?.id || '').toLowerCase().includes(q) ||
        (p?.name || p?.title || '').toLowerCase().includes(q) ||
        (p?.sku || p?.code || '').toLowerCase().includes(q) ||
        (p?.category || '').toLowerCase().includes(q);
    });
  }, [products, searchQuery]);

  const inventoryTotals = useMemo(() => {
    let totalItems = 0, totalStockQty = 0, totalValuation = 0, lowStockCount = 0, outStockCount = 0;
    for (const p of (products || [])) {
      totalItems++;
      const stock = Number(p.stock || 0);
      const min = Number(p.minStock || 0);
      const sell = Number(p.sellingPrice || p.price || 0);
      totalStockQty += stock;
      totalValuation += (stock * sell);
      if (stock <= 0) outStockCount++;
      else if (min > 0 && stock <= min) lowStockCount++;
    }
    return { totalItems, totalStockQty, totalValuation, lowStockCount, outStockCount };
  }, [products]);

  const warrantyTotals = useMemo(() => {
    let serials: any[] = [];
    try { serials = JSON.parse(localStorage.getItem('roni_serial_records_v1') || '[]'); } catch {}
    const today = isoToday();
    let activeCount = 0, expiredCount = 0;
    for (const r of serials) {
      const wex = r.warrantyExpiryDate || '';
      if (!wex) continue;
      if (wex >= today) activeCount++;
      else expiredCount++;
    }
    return { total: serials.length, activeCount, expiredCount };
  }, [activeSubTab]);

  // Expense category + day aggregates (live expenses only)
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredExpenses) {
      const key = e.category || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const expenseByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredExpenses) {
      const key = String(e.date || '').slice(0, 10);
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    }
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredExpenses]);


  const canSeeCost = !userRole || userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager' || userRole === 'Store Admin';

  // ---------- Export helpers (lazy) ----------
  const exportCSV = (rows: (string | number)[][], filename: string) => {
    try {
      const BOM = '\uFEFF';
      const NL = '\r\n';
      const csv = BOM + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join(NL);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'CSV export failed');
    }
  };

  const exportExcel = async (headers: string[], rows: (string | number)[][], sheetName: string, filename: string) => {
    setExporting('excel');
    try {
      const XLSX: any = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 28));
      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      setError(err?.message || 'Excel export failed');
    } finally { setExporting(null); }
  };

  const exportPDF = async (title: string, headers: string[], rows: (string | number)[][], filename: string) => {
    setExporting('pdf');
    try {
      const jsPDFModule: any = await import('jspdf');
      const autoTable: any = (await import('jspdf-autotable')).default;
      const doc = new jsPDFModule.jsPDF({ orientation: 'landscape' });
      doc.setFontSize(14);
      doc.text(title, 14, 15);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 27);
      autoTable(doc, { head: [headers], body: rows, startY: 32, styles: { fontSize: 8 }, headStyles: { fillColor: [30, 41, 99] } });
      doc.save(filename);
    } catch (err: any) {
      setError(err?.message || 'PDF export failed');
    } finally { setExporting(null); }
  };

  const doPrint = () => {
    try {
      const node = printRef.current;
      if (!node) { window.print(); return; }
      const w = window.open('', '_blank', 'width=1024,height=768');
      if (!w) { window.print(); return; }
      w.document.write(`<!doctype html><html><head><title>${meta[lang]}</title>
<style>body{font-family:system-ui,Arial,sans-serif;padding:24px;color:#0f172a}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}th{background:#e0e7ff}h1{font-size:18px;margin:0 0 4px}h2{font-size:13px;margin:0 0 16px;color:#475569;font-weight:500}</style>
</head><body>${node.innerHTML}</body></html>`);
      w.document.close();
      setTimeout(() => { try { w.print(); } catch {} }, 300);
    } catch (err: any) {
      setError(err?.message || 'Print failed');
    }
  };

  // ---------- Per-report data adapters ----------
  const salesRows = filteredSales.map((s: any) => [
    s.id || '', String(s.date || '').slice(0, 10), s.productName || '', s.customerName || '',
    Number(s.quantity || 0), Number(s.unitPrice || 0), Number(s.totalPrice || s.totalAmount || 0),
    canSeeCost ? Number(s.profit ?? ((s.totalPrice || 0) - (Number(s.purchasePriceAtTime || 0) * Number(s.quantity || 0)))) : '—',
  ]);
  const salesHeaders = ['Invoice', 'Date', 'Product', 'Customer', 'Qty', 'Unit Price', 'Total', canSeeCost ? 'Profit' : 'Profit (—)'];

  const purchaseRows: (string | number)[][] = [
    ...filteredPurchases.map((p: any) => [
      p.id || '', String(p.date || '').slice(0, 10), p.supplier || '', p.status || '',
      Number(p.quantity || 0), Number(p.total || 0), Number(p.paid || 0), Number(p.due || 0),
    ]),
    ...filteredReturns.map((r: any) => [
      r.id || '', String(r.date || '').slice(0, 10), r.supplier || '', 'Return',
      -Number(r.quantity || 0), -Number(r.total || 0), 0, 0,
    ]),
  ];
  const purchaseHeaders = ['PO #', 'Date', 'Supplier', 'Status', 'Qty', 'Total', 'Paid', 'Due'];


  const inventoryRows = (filteredProducts || []).map((p: any) => {
    const stock = Number(p.stock || 0);
    const min = Number(p.minStock || 0);
    const cost = Number(p.purchasePrice || p.costPrice || 0);
    const sell = Number(p.sellingPrice || p.price || 0);
    let status = 'In Stock';
    if (stock <= 0) status = 'Out';
    else if (min > 0 && stock <= min) status = 'Low';
    return [p.id || '', p.name || '', p.sku || '', p.category || '', stock, min, canSeeCost ? cost : '—', sell, stock * sell, status];
  });
  const inventoryHeaders = ['ID', 'Name', 'SKU', 'Category', 'Stock', 'Min', canSeeCost ? 'Cost' : 'Cost (—)', 'Sell', 'Stock Value', 'Status'];

  const financeTotals = useMemo(() => {
    const revenue = filteredSales.reduce((a: number, s: any) => a + Number(s.totalPrice || s.totalAmount || 0), 0);
    const cogs = filteredSales.reduce((a: number, s: any) => a + Number(s.purchasePriceAtTime || 0) * Number(s.quantity || 0), 0);
    const grossProfit = revenue - cogs;
    const expenseTotal = filteredExpenses.reduce((a: number, e: any) => a + Number(e.amount || 0), 0);
    const purchaseTotal = filteredPurchases.reduce((a: number, p: any) => a + Number(p.total || p.totalAmount || 0), 0);
    const netProfit = grossProfit - expenseTotal;
    return { revenue, cogs, grossProfit, expenseTotal, purchaseTotal, netProfit };
  }, [filteredSales, filteredExpenses, filteredPurchases]);

  const financeRows: (string | number)[][] = [
    ['Revenue (Sales)', money(financeTotals.revenue)],
    ['Cost of Goods Sold', canSeeCost ? money(financeTotals.cogs) : '—'],
    ['Gross Profit', canSeeCost ? money(financeTotals.grossProfit) : '—'],
    ['Purchases (Period)', money(financeTotals.purchaseTotal)],
    ['Purchase Returns (Period)', money(purchaseTotals.returnAmount)],
    ['Supplier Dues (Period)', money(purchaseTotals.due)],
    ['Expenses (Period)', money(financeTotals.expenseTotal)],
    ['Net Profit', canSeeCost ? money(financeTotals.netProfit) : '—'],
    ...expenseByCategory.map((c) => [`Expense · ${c.category}`, money(c.amount)] as (string | number)[]),
  ];

  const financeHeaders = ['Metric', 'Amount'];

  // Warranty: derive from serial records (offline localStorage) + product warranty field
  const warrantyRows = useMemo(() => {
    let serials: any[] = [];
    try { serials = JSON.parse(localStorage.getItem('roni_serial_records_v1') || '[]'); } catch {}
    const today = isoToday();
    return serials.map((r: any) => {
      const wex = r.warrantyExpiryDate || '';
      const status = !wex ? 'None' : (wex >= today ? 'Active' : 'Expired');
      return [r.productName || r.productId || '', r.serialNumber || r.imei1 || '', r.warrantyType || '—', wex || '—', status];
    });
  }, [activeSubTab]);
  const warrantyHeaders = ['Product', 'Serial / IMEI', 'Type', 'Expiry', 'Status'];

  // Analytics: product-wise aggregation over filteredSales
  const analytics = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of filteredSales) {
      const key = s.productId || s.productName || 'unknown';
      const row = map.get(key) || { name: s.productName || key, units: 0, revenue: 0, cost: 0 };
      row.units += Number(s.quantity || 0);
      row.revenue += Number(s.totalPrice || s.totalAmount || 0);
      row.cost += Number(s.purchasePriceAtTime || 0) * Number(s.quantity || 0);
      map.set(key, row);
    }
    return Array.from(map.values())
      .map(r => ({ ...r, profit: r.revenue - r.cost }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);
  const analyticsRows = analytics.map(r => [r.name, r.units, money(r.revenue), canSeeCost ? money(r.cost) : '—', canSeeCost ? money(r.profit) : '—']);
  const analyticsHeaders = ['Product', 'Units', 'Revenue', canSeeCost ? 'Cost' : 'Cost (—)', canSeeCost ? 'Profit' : 'Profit (—)'];

  const [viewLedgerMode, setViewLedgerMode] = useState<'main' | 'customer_dues' | 'supplier_dues'>('main');

  const customerDuesRows = customerDues.map(c => [c.customer, c.phone, money(c.total), money(c.paid), money(c.due)]);
  const customerDuesHeaders = ['Customer Name', 'Phone', 'Total Sales', 'Total Paid', 'Due Amount (পাওনা)'];

  const supplierDuesRows = supplierDues.map(s => [s.supplier, money(s.total), money(s.paid), money(s.due)]);
  const supplierDuesHeaders = ['Supplier Name', 'Total Purchase', 'Total Paid', 'Due Amount (বাকি)'];

  // Route each sub-tab to its dataset/UI
  const active = (() => {
    if (viewLedgerMode === 'customer_dues') return { title: tt(lang, 'কাস্টমার বকেয়া খাতা', 'Customer Due Ledger'), headers: customerDuesHeaders, rows: customerDuesRows, empty: customerDues.length === 0 };
    if (viewLedgerMode === 'supplier_dues') return { title: tt(lang, 'সাপ্লায়ার বাকি খাতা', 'Supplier Due Ledger'), headers: supplierDuesHeaders, rows: supplierDuesRows, empty: supplierDues.length === 0 };
    if (subId === 'rep_purchase')  return { title: meta[lang], headers: purchaseHeaders, rows: purchaseRows, empty: filteredPurchases.length === 0 && filteredReturns.length === 0 };
    if (subId === 'rep_inventory') return { title: meta[lang], headers: inventoryHeaders, rows: inventoryRows, empty: (filteredProducts || []).length === 0 };
    if (subId === 'rep_financial') return { title: meta[lang], headers: financeHeaders,  rows: financeRows,  empty: financeTotals.revenue === 0 && financeTotals.expenseTotal === 0 };
    if (subId === 'rep_warranty')  return { title: meta[lang], headers: warrantyHeaders, rows: warrantyRows, empty: warrantyRows.length === 0 };
    if (subId === 'rep_analytics') return { title: meta[lang], headers: analyticsHeaders, rows: analyticsRows, empty: analytics.length === 0 };
    if (subId === 'print_doc')     return { title: meta[lang], headers: salesHeaders, rows: salesRows, empty: filteredSales.length === 0 };
    return { title: meta[lang], headers: salesHeaders, rows: salesRows, empty: filteredSales.length === 0 };
  })();

  return (
    <div className="w-full min-h-full p-4 sm:p-6 space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${meta.color} p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10`}>
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{meta[lang]}</h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-0.5">
              {tt(lang, 'সময়সীমা', 'Period')}: <span className="font-bold bg-white/15 px-2 py-0.5 rounded-md">{startDate}</span> → <span className="font-bold bg-white/15 px-2 py-0.5 rounded-md">{endDate}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {online ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 border border-emerald-300/40 px-3 py-1.5 rounded-full font-bold shadow-sm">
              <Wifi className="w-3.5 h-3.5 text-emerald-300" /> {tt(lang, 'অনলাইন', 'Online')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-rose-500/30 text-rose-100 border border-rose-300/50 px-3 py-1.5 rounded-full font-bold shadow-sm">
              <WifiOff className="w-3.5 h-3.5 text-rose-300" /> {tt(lang, 'অফলাইন - ক্যাশ ডেটা', 'Offline — cached data')}
            </span>
          )}
        </div>
      </div>

      {/* Sales KPI Summary Cards */}
      {subId === 'rep_sales' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label={tt(lang, 'মোট বিক্রয়', 'Total Revenue')} 
            value={money(salesSummary.totalRevenue)} 
            tone="blue"
            subtitle={`${filteredSales.length} ${tt(lang, 'টি ইনভয়েস সম্পাদন', 'invoices total')}`}
          />
          <SummaryCard 
            icon={<TrendingUp className="w-5 h-5" />} 
            label={tt(lang, 'মোট আনুমানিক লাভ', 'Total Profit')} 
            value={canSeeCost ? money(salesSummary.totalProfit) : '—'} 
            tone="emerald"
            subtitle={tt(lang, 'ক্রয় মূল্য বাদ দিয়ে নিট লাভ', 'Net profit after COGS')}
          />
          <SummaryCard 
            icon={<Package className="w-5 h-5" />} 
            label={tt(lang, 'বিক্রিত মোট আইটেম', 'Items Sold')} 
            value={`${salesSummary.totalQty.toLocaleString('en-US')} pcs`} 
            tone="cyan"
            subtitle={tt(lang, 'মোট পরিমাপ সংখ্যা', 'Total quantity sold')}
          />
          <SummaryCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label={tt(lang, 'কাস্টমার বকেয়া', 'Customer Due')} 
            value={money(salesSummary.totalDue)} 
            tone="rose"
            subtitle={tt(lang, 'সংগৃহীত না হওয়া বকেয়া', 'Uncollected due amount')}
          />
        </div>
      )}

      {/* Purchase KPI Summary Cards */}
      {subId === 'rep_purchase' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            icon={<Package className="w-5 h-5" />} 
            label={tt(lang, 'মোট ক্রয়', 'Total Purchase')} 
            value={money(purchaseTotals.amount)} 
            tone="amber"
            subtitle={`${filteredPurchases.length} ${tt(lang, 'টি ক্রয় চালান', 'purchase POs')}`}
          />
          <SummaryCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label={tt(lang, 'পরিশোধিত অর্থ', 'Paid Amount')} 
            value={money(Math.max(0, purchaseTotals.amount - purchaseTotals.due))} 
            tone="emerald"
            subtitle={tt(lang, 'নগদ/ব্যাংকে পরিশোধিত', 'Paid in cash/bank')}
          />
          <SummaryCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label={tt(lang, 'সাপ্লায়ার বাকি', 'Supplier Due')} 
            value={money(purchaseTotals.due)} 
            tone="rose"
            subtitle={tt(lang, 'মহাজনদের কাছে বাকি', 'Remaining payable')}
          />
          <SummaryCard 
            icon={<TrendingUp className="w-5 h-5" />} 
            label={tt(lang, 'ক্রয়কৃত মোট আইটেম', 'Purchased Qty')} 
            value={`${purchaseTotals.qty.toLocaleString('en-US')} pcs`} 
            tone="indigo"
            subtitle={tt(lang, 'সংগৃহীত মালামালের সংখ্যা', 'Total quantity received')}
          />
        </div>
      )}

      {/* Inventory KPI Summary Cards */}
      {subId === 'rep_inventory' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            icon={<Package className="w-5 h-5" />} 
            label={tt(lang, 'মোট প্রোডাক্ট টাইপ', 'Total Product Types')} 
            value={inventoryTotals.totalItems.toLocaleString('en-US')} 
            tone="blue"
            subtitle={tt(lang, 'নিবন্ধিত অনন্য পণ্য', 'Unique products in catalog')}
          />
          <SummaryCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label={tt(lang, 'স্টকের মোট মূল্য', 'Stock Valuation')} 
            value={money(inventoryTotals.totalValuation)} 
            tone="emerald"
            subtitle={`${inventoryTotals.totalStockQty.toLocaleString('en-US')} pcs ${tt(lang, 'স্টকে বিদ্যমান', 'in stock')}`}
          />
          <SummaryCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label={tt(lang, 'কম স্টক অ্যালার্ট', 'Low Stock Alert')} 
            value={inventoryTotals.lowStockCount.toLocaleString('en-US')} 
            tone="amber"
            subtitle={tt(lang, 'সীমার চেয়ে কম মালামাল', 'Items below minimum stock')}
          />
          <SummaryCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label={tt(lang, 'স্টক আউট', 'Out of Stock')} 
            value={inventoryTotals.outStockCount.toLocaleString('en-US')} 
            tone="rose"
            subtitle={tt(lang, 'শূন্য স্টকের পণ্য', 'Products currently out of stock')}
          />
        </div>
      )}

      {/* Financial KPI Summary Cards */}
      {subId === 'rep_financial' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label={tt(lang, 'মোট বিক্রয় আয়', 'Total Sales Revenue')} 
            value={money(financeTotals.revenue)} 
            tone="blue"
            subtitle={tt(lang, 'বিক্রি থেকে মোট প্রাপ্তি', 'Gross sales proceeds')}
          />
          <SummaryCard 
            icon={<TrendingUp className="w-5 h-5" />} 
            label={tt(lang, 'গ্রস প্রফিট', 'Gross Profit')} 
            value={canSeeCost ? money(financeTotals.grossProfit) : '—'} 
            tone="emerald"
            subtitle={tt(lang, 'বিক্রি মাইনাস মালের কেনা দাম', 'Revenue minus COGS')}
          />
          <SummaryCard 
            icon={<TrendingDown className="w-5 h-5" />} 
            label={tt(lang, 'দোকানের খরচ', 'Total Expenses')} 
            value={money(financeTotals.expenseTotal)} 
            tone="rose"
            subtitle={tt(lang, 'পরিচালন ও বিবিধ খরচ', 'Operating expense sum')}
          />
          <SummaryCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label={tt(lang, 'প্রকৃত নিট লাভ', 'Net Profit')} 
            value={canSeeCost ? money(financeTotals.netProfit) : '—'} 
            tone="purple"
            subtitle={tt(lang, 'সব খরচ বাদ দিয়ে চূড়ান্ত লাভ', 'Final bottom-line net profit')}
          />
        </div>
      )}

      {/* Warranty KPI Summary Cards */}
      {subId === 'rep_warranty' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-indigo-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'নিবন্ধিত সিরিয়াল / IMEI', 'Total Registered Serials')}</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">{warrantyTotals.total.toLocaleString('en-US')}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'ট্র্যাককৃত পণ্যের মোট রেকর্ড', 'Total tracked units')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-emerald-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'সক্রিয় ওয়ারেন্টি (Active Warranty)', 'Active Warranty')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{warrantyTotals.activeCount.toLocaleString('en-US')}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'মেয়াদ এখনো বহাল আছে', 'Under valid coverage')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'মেয়াদোত্তীর্ণ (Expired Warranty)', 'Expired Warranty')}</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-2 tracking-tight">{warrantyTotals.expiredCount.toLocaleString('en-US')}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'ওয়ারেন্টির মেয়াদ শেষ হয়েছে', 'Coverage period elapsed')}</div>
          </div>
        </div>
      )}


      {/* Analytics KPI Summary Cards */}
      {subId === 'rep_analytics' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-indigo-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'সেরা বিক্রীত পণ্য (Top Item)', 'Top Selling Product')}</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2 tracking-tight truncate">{analytics[0]?.name || '—'}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{analytics[0]?.units || 0} {tt(lang, 'টি পিস বিক্রি হয়েছে', 'units sold')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-cyan-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'মোট বিক্রিত ইউনিট (Units)', 'Total Units Sold')}</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-600 mt-2 tracking-tight">{analytics.reduce((a, b) => a + Number(b.units || 0), 0).toLocaleString('en-US')} <span className="text-sm font-bold text-slate-500">pcs</span></div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{analytics.length} {tt(lang, 'টি ভিন্ন ভিন্ন পণ্য', 'unique items')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-blue-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'মোট রেভিনিউ (Revenue)', 'Total Revenue')}</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">{money(analytics.reduce((a, b) => a + Number(b.revenue || 0), 0))}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'অ্যানালিটিক্স আয় সমষ্টি', 'Aggregated revenue')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-emerald-600 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'মোট প্রফিট (Net Profit)', 'Total Profit')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{canSeeCost ? money(analytics.reduce((a, b) => a + Number(b.profit || 0), 0)) : '—'}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'পণ্য ভিত্তিক মোট লাভ', 'Aggregated net margin')}</div>
          </div>
        </div>
      )}


      {/* Export & Print Interactive Action Cards */}
      {subId === 'print_doc' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => exportCSV([active.headers, ...active.rows], `${active.title}_${startDate}_${endDate}.csv`)}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'CSV ফাইল ডাউনলোড', 'Export CSV File')}</span>
              <div className="p-2 rounded-xl bg-emerald-500 text-white group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-emerald-900 mt-2 tracking-tight">{tt(lang, 'স্প্রেডশিট ডেটা', 'Spreadsheet CSV')}</div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">{tt(lang, 'দ্রুত CSV ফাইল জেনারেট করুন', 'Generate instant CSV document')}</div>
          </button>

          <button
            onClick={() => exportExcel(active.headers, active.rows, active.title, `${active.title}_${startDate}_${endDate}.xlsx`)}
            disabled={exporting === 'excel'}
            className="rounded-2xl border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-xs text-emerald-100 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'Excel ফাইল ডাউনলোড', 'Export Excel File')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white mt-2 tracking-tight">{exporting === 'excel' ? 'প্রসেস হচ্ছে...' : tt(lang, 'মাইক্রোসফট এক্সেল', 'Microsoft Excel')}</div>
            <div className="text-xs text-emerald-100 mt-1 font-medium">{tt(lang, 'ফরম্যাটকৃত এক্সেল ওয়ার্কশিট', 'Formatted XLSX workbook')}</div>
          </button>

          <button
            onClick={() => exportPDF(active.title, active.headers, active.rows, `${active.title}_${startDate}_${endDate}.pdf`)}
            disabled={exporting === 'pdf'}
            className="rounded-2xl border border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-xs text-indigo-100 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'PDF নথি ডাউনলোড', 'Export PDF Document')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white mt-2 tracking-tight">{exporting === 'pdf' ? 'প্রসেস হচ্ছে...' : tt(lang, 'পিডিএফ লেআউট', 'PDF Document')}</div>
            <div className="text-xs text-indigo-100 mt-1 font-medium">{tt(lang, 'প্রিন্ট-প্রস্তুত পিডিএফ ফরম্যাট', 'Print-ready PDF report')}</div>
          </button>

          <button
            onClick={doPrint}
            className="rounded-2xl border border-slate-300 bg-slate-800 text-white hover:bg-slate-900 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold tracking-wide uppercase">
              <span>{tt(lang, 'সরাসরি প্রিন্ট', 'Direct Print')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white mt-2 tracking-tight">{tt(lang, 'ব্রাউজার প্রিন্ট লেআউট', 'Browser Print Preview')}</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">{tt(lang, 'কাগজে প্রিন্ট করার পৃষ্ঠা', 'Physical paper invoice print')}</div>
          </button>
        </div>
      )}

      {/* Ledger Mode Selector Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setViewLedgerMode('main')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            viewLedgerMode === 'main' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          📊 {tt(lang, 'মূল রিপোর্ট', 'Main Report')}
        </button>
        <button
          onClick={() => setViewLedgerMode('customer_dues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            viewLedgerMode === 'customer_dues' ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          📓 {tt(lang, 'কাস্টমার বকেয়া খাতা', 'Customer Due Ledger')}
        </button>
        <button
          onClick={() => setViewLedgerMode('supplier_dues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            viewLedgerMode === 'supplier_dues' ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          🚚 {tt(lang, 'সাপ্লায়ার বাকি খাতা', 'Supplier Due Ledger')}
        </button>
      </div>

      {/* Toolbar (Light Clean Card) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['today', 'week', 'days15', 'month', 'all', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                preset === p ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {p === 'today' && tt(lang, 'আজ', 'Today')}
              {p === 'week' && tt(lang, 'এই সপ্তাহ', 'This Week')}
              {p === 'days15' && tt(lang, '১৫ দিন', '15 Days')}
              {p === 'month' && tt(lang, 'এই মাস', 'This Month')}
              {p === 'all' && tt(lang, 'সব সময়', 'All Time')}
              {p === 'custom' && tt(lang, 'কাস্টম', 'Custom')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input type="date" value={startDate} max={endDate} disabled={preset !== 'custom'}
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-bold outline-none disabled:opacity-60" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={endDate} min={startDate} disabled={preset !== 'custom'}
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-bold outline-none disabled:opacity-60" />
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={tt(lang, 'ইনভয়েস/আইটেম/গ্রাহক খুঁজুন…', 'Search invoice/item/customer…')}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white w-48 sm:w-60 shadow-inner"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold">×</button>
            )}
          </div>

          {canSeeCost && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              <button onClick={() => exportCSV([active.headers, ...active.rows], filename('csv'))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportExcel(active.headers, active.rows, active.title, filename('xlsx'))}
                disabled={exporting === 'excel'}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-60 transition">
                <FileSpreadsheet className="w-3.5 h-3.5" /> {exporting === 'excel' ? '…' : 'Excel'}
              </button>
              <button onClick={() => exportPDF(active.title, active.headers, active.rows, filename('pdf'))}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-60 transition">
                <FileText className="w-3.5 h-3.5" /> {exporting === 'pdf' ? '…' : 'PDF'}
              </button>
              <button onClick={doPrint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition">
                <Printer className="w-3.5 h-3.5" /> {tt(lang, 'প্রিন্ট', 'Print')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {(error || ledgerError) && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800 text-xs font-medium shadow-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
          <div className="flex-1">{error || ledgerError}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800 font-bold text-sm">×</button>
        </div>
      )}

      {/* Content Area */}
      {(loadingData || ledgersLoading) ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold">{tt(lang, 'রিপোর্ট লোড হচ্ছে…', 'Loading report…')}</p>
        </div>
      ) : active.empty ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-sm">
          <div className="p-4 rounded-full bg-slate-100 text-slate-400">
            <Inbox className="w-10 h-10" />
          </div>
          <p className="text-base font-bold text-slate-800">{tt(lang, 'এই সময়ের জন্য কোনো ডেটা পাওয়া যায়নি', 'No data for this period')}</p>
          <p className="text-xs text-slate-500 max-w-sm text-center">{tt(lang, 'অন্য তারিখ পরিসীমা নির্বাচন করুন বা ওপরে ফিল্টার সার্চ পরিবর্তন করে আবার চেষ্টা করুন।', 'Select a different date range or clear the search query to try again.')}</p>
        </div>
      ) : (
        <div ref={printRef} className="rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">{active.title}</h1>
              <h2 className="text-xs font-semibold text-slate-500 mt-0.5">{startDate} → {endDate} · {active.rows.length} {tt(lang, 'টি রেকর্ড', 'rows')}</h2>
            </div>
            {!online && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-sm">
                {tt(lang, 'অফলাইন ক্যাশ থেকে দেখানো হচ্ছে', 'Showing cached data (offline)')}
              </span>
            )}
          </div>
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 text-slate-700 sticky top-0 border-b border-slate-200">
                <tr>
                  {active.headers.map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.rows.slice(0, 500).map((r, i) => (
                  <tr key={i} className="hover:bg-indigo-50/40 transition-colors">
                    {r.map((c, j) => (
                      <td key={j} className="px-4 py-2.5 whitespace-nowrap text-slate-700 font-medium">
                        {typeof c === 'number' ? c.toLocaleString('en-US') : c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {active.rows.length > 500 && (
            <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs font-semibold">
              {tt(lang, 'পারফরম্যান্সের জন্য প্রথম ৫০০ টি সারি দেখানো হচ্ছে। সম্পূর্ণ ডেটার জন্য এক্সপোর্ট করুন।', 'Showing first 500 rows for performance. Export for the full dataset.')}
              &nbsp;({active.rows.length.toLocaleString('en-US')} {tt(lang, 'মোট', 'total')})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCenter;

