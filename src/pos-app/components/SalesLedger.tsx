// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product, Customer } from '../types';
import type { ReturnRecord } from './SalesReturn';
import { runTransaction, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { enqueueSalesReturn, enqueueStockUpdate, enqueueSales } from '../salesSyncQueue';
import { 
  Briefcase, Calendar, Search, Users, MapPin, 
  Plus, FileSpreadsheet, Download, Printer, Copy, Columns, 
  ChevronDown, Edit2, Trash2, CheckCircle, Clock, FileText, RefreshCw, X,
  RotateCcw, ArrowRightLeft, Receipt as ReceiptIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SalesLedgerProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  salesReturns?: ReturnRecord[];
  setSalesReturns?: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
  lang?: 'bn' | 'en';
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  theme?: 'light' | 'dark';
  setActiveTab: (tab: string) => void;
  setActiveSubTab: (subTab: string) => void;
}

export const SalesLedger: React.FC<SalesLedgerProps> = ({
  sales,
  setSales,
  products,
  setProducts,
  customers,
  salesReturns = [],
  setSalesReturns,
  lang = 'bn',
  showToast,
  theme = 'light',
  setActiveTab,
  setActiveSubTab
}) => {
  // Filtration States
  const [warehouse, setWarehouse] = useState<string>('-All Warehouses-');
  const [selectedCust, setSelectedCust] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Table Pagination & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'checkbox', 'date', 'dueDate', 'salesCode', 'referenceNo',
    'customerName', 'total', 'paidAmount', 'paymentStatus', 'createdBy', 'action'
  ]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState<boolean>(false);

  // Sorting
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };
  const sortArrow = (key: string) => (sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅');

  // Row Interactive States
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Sale | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Sale | null>(null);
  // Invoice detail tabs: "receipt" shows the printable receipt; "return" hosts return / exchange / refund flow.
  const [receiptTab, setReceiptTab] = useState<'receipt' | 'return'>('receipt');
  useEffect(() => { setReceiptTab('receipt'); }, [selectedInvoiceForReceipt?.id]);

  // Edit Invoice Fields
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editPaid, setEditPaid] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL'>('PAID');

  // Multi-select actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Defensive readers
  const getTotal = (s: Sale) => Number((s as any).totalPrice ?? (s as any).totalAmount ?? 0);
  const getPaid = (s: Sale) => {
    if (s.paidAmount !== undefined && s.paidAmount !== null) return Number(s.paidAmount);
    if (s.paymentStatus === 'UNPAID' || s.paymentStatus === 'PARTIAL') return 0;
    return getTotal(s);
  };
  const getStatus = (s: Sale): 'PAID' | 'UNPAID' | 'PARTIAL' => {
    if (s.paymentStatus === 'PAID' || s.paymentStatus === 'UNPAID' || s.paymentStatus === 'PARTIAL') return s.paymentStatus;
    const total = getTotal(s), paid = getPaid(s);
    if (paid <= 0) return 'UNPAID';
    if (paid + 0.001 < total) return 'PARTIAL';
    return 'PAID';
  };
  const getCustomerName = (s: Sale) => String(s.customerName ?? 'Walk-in customer');
  const getProductLabel = (s: Sale) => {
    if (Array.isArray((s as any).items) && (s as any).items.length > 0) {
      return (s as any).items.map((it: any) => it.productName ?? it.name ?? '').filter(Boolean).join(', ');
    }
    return String((s as any).productName ?? '');
  };
  const getCreator = (s: Sale) => String(s.createdBy ?? s.recordedByEmail ?? 'admin');

  // Dynamic user list from sales
  const userOptions = React.useMemo(() => {
    const set = new Set<string>();
    sales.forEach(s => { const u = getCreator(s); if (u) set.add(u); });
    return Array.from(set).sort();
  }, [sales]);

  // Toggle selection
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRowIds(paginatedSales.map(s => s.id));
    else setSelectedRowIds([]);
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedRowIds.includes(id)) setSelectedRowIds(prev => prev.filter(r => r !== id));
    else setSelectedRowIds(prev => [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    if (!confirm(lang === 'bn'
      ? `আপনি কি নিশ্চিত ${selectedRowIds.length}টি ইনভয়েস ডিলিট করতে চান?`
      : `Delete ${selectedRowIds.length} selected invoices?`)) return;
    const idsToDelete = [...selectedRowIds];
    setSales(prev => prev.filter(s => !selectedRowIds.includes(s.id)));
    setSelectedRowIds([]);
    idsToDelete.forEach(id => {
      try { deleteDoc(doc(db, 'sales', id)).catch(() => {}); } catch {}
    });
    showToast(lang === 'bn' ? 'নির্বাচিত ইনভয়েস ডিলিট হয়েছে!' : 'Selected invoices deleted!', 'success');
  };

  // Live filter computation (defensive)
  const filteredSales = sales.filter(s => {
    // 1. Warehouse filter — matches branch/warehouse field if present
    if (warehouse !== '-All Warehouses-') {
      const branch = String((s as any).branch ?? (s as any).warehouse ?? '').toLowerCase();
      if (branch && !branch.includes(warehouse.toLowerCase())) return false;
    }

    // 2. Customer Filter
    if (selectedCust && getCustomerName(s) !== selectedCust) return false;

    // 3. User filter
    if (selectedUser !== 'All' && getCreator(s) !== selectedUser) return false;

    // 4. Date Range filter logic
    const saleDateStr = s.date ?? (s as any).createdAt;
    if (saleDateStr) {
      const saleTs = new Date(saleDateStr).getTime();
      if (!Number.isNaN(saleTs)) {
        if (fromDate) {
          const from = new Date(fromDate).getTime();
          if (saleTs < from) return false;
        }
        if (toDate) {
          const to = new Date(toDate + 'T23:59:59').getTime();
          if (saleTs > to) return false;
        }
      }
    }

    // 5. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        String(s.id ?? '').toLowerCase().includes(q) ||
        getCustomerName(s).toLowerCase().includes(q) ||
        getProductLabel(s).toLowerCase().includes(q) ||
        getCreator(s).toLowerCase().includes(q) ||
        String((s as any).referenceNo ?? '').toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Sorting
  const sortedSales = React.useMemo(() => {
    const arr = [...filteredSales];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'date': av = new Date(a.date ?? 0).getTime(); bv = new Date(b.date ?? 0).getTime(); break;
        case 'dueDate': av = new Date(a.dueDate ?? a.date ?? 0).getTime(); bv = new Date(b.dueDate ?? b.date ?? 0).getTime(); break;
        case 'salesCode': av = String(a.id ?? ''); bv = String(b.id ?? ''); break;
        case 'referenceNo': av = String((a as any).referenceNo ?? ''); bv = String((b as any).referenceNo ?? ''); break;
        case 'customerName': av = getCustomerName(a); bv = getCustomerName(b); break;
        case 'total': av = getTotal(a); bv = getTotal(b); break;
        case 'paidAmount': av = getPaid(a); bv = getPaid(b); break;
        case 'paymentStatus': av = getStatus(a); bv = getStatus(b); break;
        case 'createdBy': av = getCreator(a); bv = getCreator(b); break;
        default: av = 0; bv = 0;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filteredSales, sortKey, sortDir]);

  // Pagination
  const totalEntries = sortedSales.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const paginatedSales = sortedSales.slice(startIndex, endIndex);


  // Export & Action utilities
  const handleCopyTable = () => {
    const textData = sortedSales.map(s =>
      `${s.id}\t${s.date ?? ''}\t${getCustomerName(s)}\t${getTotal(s)}\t${getPaid(s)}\t${getCreator(s)}`
    ).join('\n');
    navigator.clipboard.writeText(`Invoice ID\tDate\tCustomer\tTotal\tPaid\tCreated By\n${textData}`);
    showToast(lang === 'bn' ? "তালিকা সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!" : "Table copied to clipboard!", "success");
  };

  const handleExportCSV = () => {
    const headers = "SALES DATE,DUE DATE,SALES CODE,REFERENCE NO.,CUSTOMER NAME,TOTAL,PAID AMOUNT,PAYMENT STATUS,CREATED BY\n";
    const rows = sortedSales.map(s => {
      const totalAmount = getTotal(s);
      const paidAmt = getPaid(s);
      return `"${s.date ?? ''}","${s.dueDate ?? s.date ?? ''}","${s.id}","${(s as any).referenceNo ?? '-'}","${getCustomerName(s)}",${totalAmount},${paidAmt},"${getStatus(s)}","${getCreator(s)}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'bn' ? "সিএসভি ফাইল ডাউনলোড করা হয়েছে!" : "CSV report exported successfully!", "success");
  };

  const handleExportExcel = () => {
    const data = sortedSales.map((s, idx) => ({
      '#': idx + 1,
      'SALES DATE': s.date ?? '',
      'DUE DATE': s.dueDate ?? s.date ?? '',
      'SALES CODE': s.id,
      'REFERENCE NO.': (s as any).referenceNo ?? '-',
      'CUSTOMER NAME': getCustomerName(s),
      'TOTAL (BDT)': getTotal(s),
      'PAID AMOUNT (BDT)': getPaid(s),
      'PAYMENT STATUS': getStatus(s),
      'CREATED BY': getCreator(s)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesLedger');
    XLSX.writeFile(wb, `Sales_Ledger_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(lang === 'bn' ? "এক্সেল রিপোর্ট ডাউনলোড হয়েছে!" : "Excel ledger downloaded successfully!", "success");
  };

  const handlePrintTable = () => {
    window.print();
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিত যে এই ইনভয়েস (${id}) ডিলিট করতে চান?` : `Are you sure you want to delete invoice ${id}?`)) {
      setSales(prev => prev.filter(s => s.id !== id));
      setSelectedRowIds(prev => prev.filter(r => r !== id));
      setActiveDropdownRow(null);
      try { deleteDoc(doc(db, 'sales', id)).catch(() => {}); } catch {}
      showToast(lang === 'bn' ? "ইনভয়েসটি ডিলিট করা হয়েছে!" : "Invoice deleted successfully!", "success");
    }
  };

  const handleOpenEditModal = (s: Sale) => {
    setSelectedInvoiceForEdit(s);
    setEditCustomerName(getCustomerName(s));
    setEditTotal(getTotal(s));
    setEditPaid(getPaid(s));
    setEditStatus(getStatus(s));
    setActiveDropdownRow(null);
  };


  const handleSaveInvoiceEdit = () => {
    if (!editCustomerName.trim()) {
      showToast(lang === 'bn' ? "গ্রাহকের নাম দিন!" : "Please provide a valid customer name!", "error");
      return;
    }
    const total = Number(editTotal);
    const paid = Number(editPaid);
    if (Number.isNaN(total) || total < 0) {
      showToast(lang === 'bn' ? "সঠিক টোটাল দিন!" : "Enter a valid total amount!", "error");
      return;
    }
    if (Number.isNaN(paid) || paid < 0) {
      showToast(lang === 'bn' ? "সঠিক পরিশোধিত পরিমাণ দিন!" : "Enter a valid paid amount!", "error");
      return;
    }
    if (paid > total) {
      showToast(lang === 'bn' ? "পরিশোধিত পরিমাণ টোটালের চেয়ে বেশি হতে পারবে না!" : "Paid amount cannot exceed total!", "error");
      return;
    }
    let finalStatus: 'PAID' | 'UNPAID' | 'PARTIAL' = editStatus;
    if (paid <= 0) finalStatus = 'UNPAID';
    else if (paid >= total) finalStatus = 'PAID';
    else finalStatus = 'PARTIAL';

    let updatedSaleObj: Sale | null = null;
    setSales(prev => prev.map(s => {
      if (s.id === selectedInvoiceForEdit?.id) {
        updatedSaleObj = { ...s, customerName: editCustomerName, totalPrice: total, paidAmount: paid, paymentStatus: finalStatus };
        return updatedSaleObj;
      }
      return s;
    }));
    if (updatedSaleObj) {
      try {
        enqueueSales([updatedSaleObj]);
      } catch {}
    }
    setSelectedInvoiceForEdit(null);
    showToast(lang === 'bn' ? "ইনভয়েস আপডেট হয়েছে!" : "Invoice updated successfully!", "success");
  };

  const columnsList = [
    { key: 'checkbox', label: '[ ]' },
    { key: 'date', label: 'SALES DATE' },
    { key: 'dueDate', label: 'DUE DATE' },
    { key: 'salesCode', label: 'SALES CODE' },
    { key: 'referenceNo', label: 'REFERENCE NO.' },
    { key: 'customerName', label: 'CUSTOMER NAME' },
    { key: 'total', label: 'TOTAL' },
    { key: 'paidAmount', label: 'PAID AMOUNT' },
    { key: 'paymentStatus', label: 'PAYMENT STATUS' },
    { key: 'createdBy', label: 'CREATED BY' },
    { key: 'action', label: 'ACTION' }
  ];

  // Helper to obtain default times for our mock list matching user image
  const getInvoiceTime = (id: string) => {
    const times: Record<string, string> = {
      'SL577': '09:03 pm',
      'SL576': '04:15 pm',
      'SL575': '11:30 am',
      'SL574': '10:45 am',
      'SL573': '08:20 pm',
      'SL1001': '02:10 pm',
      'SL1002': '11:05 am'
    };
    return times[id] || '12:00 pm';
  };

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      
      {/* 1. Header/Breadcrumbs block exactly as mockup */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-gray-200">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-bold text-slate-900 text-xl tracking-tight">
            {lang === 'bn' ? 'বিক্রয় তালিকা' : 'Sales Invoices'}
          </h1>
          <span className="text-gray-500 text-xs font-semibold">
            {lang === 'bn' ? 'রনি টেলিকম এর বিক্রয় হিসেব ও ইনভয়েস তালিকা' : 'Rony Telecom sales records and invoice indexes'}
          </span>
        </div>
        
        {/* Breadcrumb path */}
        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-2 md:mt-0 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>🏠 {lang === 'bn' ? 'হোম' : 'Home'}</span>
          <span className="text-gray-400">/</span>
          <span className="font-bold text-gray-700">{lang === 'bn' ? 'বিক্রয় তালিকা' : 'Sales List'}</span>
        </div>
      </div>

      {/* 2. Top FILTERS Container Panel row matching user photo */}
      <div className="p-5 bg-white dark:bg-gray-850 rounded-xl border border-slate-205 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filter A: Warehouse */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-slate-500 block">
            {lang === 'bn' ? 'Warehouse *' : 'Warehouse *'}
          </label>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-[#008d44] font-medium"
          >
            <option value="-All Warehouses-">-All Warehouses-</option>
            <option value="Rony Telecom">Rony Telecom</option>
          </select>
        </div>

        {/* Filter B: Customers */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-slate-500 block">
            {lang === 'bn' ? 'Customers' : 'Customers'}
          </label>
          <select
            value={selectedCust}
            onChange={(e) => setSelectedCust(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-[#008d44] font-medium"
          >
            <option value="">{lang === 'bn' ? 'Search Name/Mobile' : 'Search Name/Mobile'}</option>
            <option value="Walk-in customer">Walk-in customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Filter C: Users */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-slate-500 block">
            {lang === 'bn' ? 'Users' : 'Users'}
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-[#008d44] font-medium"
          >
            <option value="All">All</option>
            {userOptions.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Filter D: From Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-slate-500 block">
            {lang === 'bn' ? 'From Date' : 'From Date'}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-[#008d44] font-mono"
          />
        </div>

        {/* Filter E: To Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase text-slate-500 block">
            {lang === 'bn' ? 'To Date' : 'To Date'}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-[#008d44] font-mono"
          />
        </div>
      </div>

      {/* 3. Main Data Card hold the Table list and tools */}
      <div className="bg-white border border-slate-205 rounded-xl shadow-xs overflow-hidden">
        
        {/* Card Title and Header POS Shortcut bar */}
        <div className="px-5 py-4 border-b border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <Briefcase size={16} className="text-[#008d44]" />
            {lang === 'bn' ? 'বিক্রয় তালিকা' : 'Sales Listing'}
          </h3>

          {/* POS Terminal trigger button */}
          <button
            onClick={() => {
              setActiveSubTab('pos_terminal');
              setActiveTab('pos');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 cursor-pointer shadow-sm hover:shadow flex items-center gap-1.5"
          >
            <Plus size={14} className="stroke-[3]" />
            {lang === 'bn' ? 'ইনভয়েস তৈরি করুন (POS)' : 'Create Invoice (POS)'}
          </button>
        </div>

        {/* 4. Action bar inside card: Copier/Excel buttons & Items-per-page, Search input */}
        <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
          
          {/* Left panel: Row per page entry count */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>{lang === 'bn' ? 'দেখান' : 'Show'}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>{lang === 'bn' ? 'এন্ট্রি' : 'entries'}</span>
          </div>

          {/* Center panel: Modern neutral chips buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleCopyTable}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
            >
              <Copy size={13} className="text-slate-500" />
              <span>{lang === 'bn' ? 'কপি' : 'Copy'}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>{lang === 'bn' ? 'এক্সেল' : 'Excel'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
            >
              <Download size={13} className="text-blue-600" />
              <span>{lang === 'bn' ? 'পিডিএফ (CSV)' : 'PDF (CSV)'}</span>
            </button>
            <button
              onClick={handlePrintTable}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
            >
              <Printer size={13} className="text-purple-600" />
              <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
            >
              <FileText size={13} className="text-amber-600" />
              <span>{lang === 'bn' ? 'সিএসভি' : 'CSV'}</span>
            </button>
            
            {/* Column visibility controller dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 hover:border-slate-300"
              >
                <Columns size={13} className="text-slate-500" />
                <span>{lang === 'bn' ? 'কলামসমূহ' : 'Columns'}</span>
              </button>

              {showColumnsDropdown && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-20 text-xs font-semibold text-slate-700">
                  {columnsList.map(col => {
                    if (col.key === 'checkbox' || col.key === 'action') return null;
                    return (
                      <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => {
                            if (visibleColumns.includes(col.key)) {
                              setVisibleColumns(prev => prev.filter(c => c !== col.key));
                            } else {
                              setVisibleColumns(prev => [...prev, col.key]);
                            }
                          }}
                        />
                        {col.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Search field with Bengali/English labels */}
          <div className="flex items-center gap-2 self-end xl:self-auto">
            <span className="text-xs font-bold text-slate-550">{lang === 'bn' ? 'অনুসন্ধানঃ' : 'Search:'}</span>
            <div className="relative">
              <input
                type="text"
                placeholder={lang === 'bn' ? 'ইউজার বা গ্রাহক খুঁজুন...' : 'Search user or customer...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3.5 pr-8 py-1.5 w-60 text-xs border border-slate-250 rounded-lg focus:outline-[#008d44] font-medium"
              />
              <Search className="absolute right-2.5 top-2 text-slate-400" size={13.5} />
            </div>
          </div>
        </div>

        {/* Bulk action bar — visible only when rows are selected */}
        {selectedRowIds.length > 0 && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-800">
              {lang === 'bn'
                ? `${selectedRowIds.length}টি ইনভয়েস নির্বাচিত`
                : `${selectedRowIds.length} invoice(s) selected`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedRowIds([])}
                className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Clear'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={12} />
                {lang === 'bn' ? 'ডিলিট করুন' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* 5. TABLE CONTAINER & BODY BLOCK */}
        <div className="overflow-x-auto">

          <table className="w-full text-xs text-left border-collapse text-slate-700 font-medium">
            
            {/* Modern Clean Table Header */}
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-xs">
              <tr>
                {visibleColumns.includes('checkbox') && (
                  <th className="px-4 py-3 border-r border-slate-200 text-center w-12">
                    <input
                      type="checkbox"
                      checked={paginatedSales.length > 0 && paginatedSales.every(s => selectedRowIds.includes(s.id))}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                )}
                {visibleColumns.includes('date') && <th onClick={() => handleSort('date')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">SALES DATE {sortArrow('date')}</th>}
                {visibleColumns.includes('dueDate') && <th onClick={() => handleSort('dueDate')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">DUE DATE {sortArrow('dueDate')}</th>}
                {visibleColumns.includes('salesCode') && <th onClick={() => handleSort('salesCode')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">SALES CODE {sortArrow('salesCode')}</th>}
                {visibleColumns.includes('referenceNo') && <th onClick={() => handleSort('referenceNo')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">REFERENCE NO. {sortArrow('referenceNo')}</th>}
                {visibleColumns.includes('customerName') && <th onClick={() => handleSort('customerName')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">CUSTOMER NAME {sortArrow('customerName')}</th>}
                {visibleColumns.includes('total') && <th onClick={() => handleSort('total')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">TOTAL {sortArrow('total')}</th>}
                {visibleColumns.includes('paidAmount') && <th onClick={() => handleSort('paidAmount')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">PAID AMOUNT {sortArrow('paidAmount')}</th>}
                {visibleColumns.includes('paymentStatus') && <th onClick={() => handleSort('paymentStatus')} className="px-4 py-3 border-r border-slate-200 text-center cursor-pointer select-none hover:bg-slate-200/40">PAYMENT STATUS {sortArrow('paymentStatus')}</th>}
                {visibleColumns.includes('createdBy') && <th onClick={() => handleSort('createdBy')} className="px-4 py-3 border-r border-slate-200 cursor-pointer select-none hover:bg-slate-200/40">CREATED BY {sortArrow('createdBy')}</th>}
                {visibleColumns.includes('action') && <th className="px-4 py-3 text-center">ACTION</th>}
              </tr>
            </thead>

            {/* Table Rows Body */}
            <tbody className="divide-y divide-slate-150">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-450 font-bold bg-slate-50">
                    💔 {lang === 'bn' ? "কোনো বিক্রয় এন্ট্রি খুঁজে পাওয়া যায়নি!" : "No sales record found matching current filtration!"}
                  </td>
                </tr>
              ) : (
                paginatedSales.map((s) => {
                  const saleId = s.id;
                  const isRowSelected = selectedRowIds.includes(saleId);
                  const status = getStatus(s);
                  const totalVal = getTotal(s);
                  const paidVal = getPaid(s);
                  const dateStr = s.date ? (String(s.date).includes('-') ? String(s.date).split('-').reverse().join('-') : new Date(s.date).toLocaleDateString()) : '-';
                  const dueRaw = s.dueDate ?? s.date;
                  const dueStr = dueRaw ? (String(dueRaw).includes('-') ? String(dueRaw).split('-').reverse().join('-') : new Date(dueRaw).toLocaleDateString()) : '-';

                  return (
                    <tr
                      key={saleId}
                      className={`hover:bg-slate-55/40 text-slate-750 font-medium ${isRowSelected ? 'bg-cyan-50/40' : ''}`}
                    >
                      {visibleColumns.includes('checkbox') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-center">
                          <input type="checkbox" checked={isRowSelected} onChange={() => handleToggleSelectRow(saleId)} />
                        </td>
                      )}

                      {visibleColumns.includes('date') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-slate-600">{dateStr}</td>
                      )}

                      {visibleColumns.includes('dueDate') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-slate-450 text-[11px]">{dueStr}</td>
                      )}

                      {visibleColumns.includes('salesCode') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 font-bold text-blue-600 font-mono text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <span>{saleId}</span>
                            <button
                              type="button"
                              title={lang === 'bn' ? "ইনভয়েস আইডি কপি করুন" : "Copy Invoice ID"}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(saleId);
                                showToast(lang === 'bn' ? `আইডি (${saleId}) কপি হয়েছে!` : `ID ${saleId} copied!`, 'success');
                              }}
                              className="p-1 hover:bg-blue-100 text-slate-400 hover:text-blue-700 rounded cursor-pointer transition"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('referenceNo') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-slate-450 uppercase text-[11px] font-mono">
                          {(s as any).referenceNo || '-'}
                        </td>
                      )}

                      {visibleColumns.includes('customerName') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 font-bold text-slate-800">{getCustomerName(s)}</td>
                      )}

                      {visibleColumns.includes('total') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 font-mono font-bold text-slate-800 text-[12.5px]">
                          ৳ {totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}

                      {visibleColumns.includes('paidAmount') && (
                        <td className={`px-4 py-3.5 border-r border-slate-200 font-mono font-bold text-[12.5px] ${
                          status === 'PAID' ? 'text-[#008d44]' : status === 'PARTIAL' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          ৳ {paidVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}

                      {visibleColumns.includes('paymentStatus') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-center">
                          {status === 'PAID' && (
                            <span className="text-white bg-[#008d44] text-[11px] font-bold px-2 py-[3px] rounded-[3px] inline-block shadow-sm select-none">PAID</span>
                          )}
                          {status === 'PARTIAL' && (
                            <span className="text-white bg-amber-500 text-[11px] font-bold px-2 py-[3px] rounded-[3px] inline-block shadow-sm select-none">PARTIAL</span>
                          )}
                          {status === 'UNPAID' && (
                            <span className="text-white bg-red-600 text-[11px] font-bold px-2 py-[3px] rounded-[3px] inline-block shadow-sm select-none">UNPAID</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.includes('createdBy') && (
                        <td className="px-4 py-3.5 border-r border-slate-200 text-slate-550 font-mono font-semibold">{getCreator(s)}</td>
                      )}


                      {/* Action Dropdown precisely mapped */}
                      {visibleColumns.includes('action') && (
                        <td className="px-4 py-3.5 text-center relative">
                          <button
                            onClick={() => setActiveDropdownRow(activeDropdownRow === saleId ? null : saleId)}
                            className="bg-[#00c0ef] hover:bg-[#00acd6] text-white px-3 py-1.5 rounded-[4px] text-[11px] font-bold flex items-center gap-1 mx-auto shadow-sm tracking-wide transition cursor-pointer"
                          >
                            <span>অ্যাকশন</span>
                            <ChevronDown size={11} className="stroke-[3]" />
                          </button>

                          {/* Action Items List dropdown */}
                          {activeDropdownRow === saleId && (
                            <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-40 text-left text-xs font-semibold">
                              
                              {/* Edit triggers modal */}
                              <button
                                onClick={() => handleOpenEditModal(s)}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 size={13} className="text-blue-500" />
                                {lang === 'bn' ? 'সম্পাদনা (Edit)' : 'Edit Sale'}
                              </button>

                              {/* View receipt triggers printer view modal */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForReceipt(s);
                                  setReceiptTab('receipt');
                                  setActiveDropdownRow(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Printer size={13} className="text-green-500" />
                                {lang === 'bn' ? 'রসিদ প্রিন্ট' : 'View Receipt'}
                              </button>

                              {/* Return process triggers instant return panel for this exact invoice */}
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForReceipt(s);
                                  setReceiptTab('return');
                                  setActiveDropdownRow(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <RefreshCw size={13} className="text-amber-500" />
                                {lang === 'bn' ? 'রিটার্ন প্রসেস' : 'Return Entry'}
                              </button>

                              {/* Divider */}
                              <div className="border-t border-slate-100 my-1"></div>

                              {/* Delete option */}
                              <button
                                onClick={() => handleDeleteInvoice(saleId)}
                                className="w-full px-4 py-2 hover:bg-red-50 text-red-650 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 size={13} className="text-red-500" />
                                {lang === 'bn' ? 'ডিলিট করুন' : 'Delete Invoice'}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. TABLE FOOTER: Information entries status & custom pagination buttons */}
        <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Entries visual counter */}
          <span className="text-xs font-bold text-slate-500 font-sans">
            {lang === 'bn' ? (
              `মোট ${totalEntries} এন্ট্রি এর মধ্যে ${totalEntries === 0 ? 0 : startIndex + 1} থেকে ${endIndex} টি দেখানো হচ্ছে`
            ) : (
              `Showing ${totalEntries === 0 ? 0 : startIndex + 1} to ${endIndex} of ${totalEntries} entries`
            )}
          </span>

          {/* Simple and elegant pagination blocks */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                currentPage === 1
                  ? 'border-slate-200 text-slate-300 bg-slate-100 cursor-not-allowed'
                  : 'border-slate-250 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
            </button>

            {/* Loop pages */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const pg = i + 1;
              const isCurrent = currentPage === pg;
              return (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition border ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white shadow-3xs'
                      : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  {pg}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                currentPage === totalPages
                  ? 'border-slate-200 text-slate-300 bg-slate-100 cursor-not-allowed'
                  : 'border-slate-250 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {lang === 'bn' ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        </div>

      </div>

      {/* MODAL 1: VIEW/PRINT RECEIPT DIALOG popup */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-3xs flex items-center justify-center p-4">
          
          {/* Inject dynamic print style only when printing */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* hide all other page elements */
              body * {
                visibility: hidden !important;
              }
              /* display only the receipt portion and set as layout body */
              #invoice-print-section, #invoice-print-section * {
                visibility: visible !important;
              }
              #invoice-print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                padding: 10px !important;
                margin: 0 !important;
                font-family: 'Inter', 'Noto Sans Bengali', sans-serif !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="bg-white rounded-[24px] max-w-[420px] w-full p-6 shadow-2xl relative space-y-4 text-slate-800 border border-[#eff3f6] flex flex-col justify-between max-h-[92vh] overflow-y-auto animate-fade-in">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedInvoiceForReceipt(null)}
              className="absolute right-4 top-4 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition cursor-pointer z-10 no-print animate-fade-in"
              aria-label="Close"
            >
              <X size={16} className="stroke-[3]" />
            </button>

            {/* Invoice-detail tabs (Receipt / Return & Exchange) — hidden while printing */}
            <div className="no-print flex gap-2 pr-8">
              <button
                type="button"
                onClick={() => setReceiptTab('receipt')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  receiptTab === 'receipt'
                    ? 'bg-[#008d44] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ReceiptIcon size={13} />
                {lang === 'bn' ? 'রসিদ' : 'Receipt'}
              </button>
              <button
                type="button"
                onClick={() => setReceiptTab('return')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  receiptTab === 'return'
                    ? 'bg-[#008d44] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <RotateCcw size={13} />
                {lang === 'bn' ? 'রিটার্ন / এক্সচেঞ্জ' : 'Return / Exchange'}
              </button>
            </div>

            {/* Receipt tab body */}
            <div style={{ display: receiptTab === 'receipt' ? 'block' : 'none' }}>

            {/* Print Section to isolate for thermal paper printing */}
            <div 
              id="invoice-print-section" 
              className="bg-white text-xs pt-1 text-black print-container-wrapper"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Bengali", sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              
              {/* Header exact matches user photo */}
              <div className="text-center space-y-0.5">
                <h1 className="font-bold text-[24px] uppercase tracking-wide text-black leading-tight select-none" style={{ fontWeight: 800 }}>
                  RONY TELECOM
                </h1>
                <p className="text-[11.5px] text-black font-semibold leading-tight">
                  কামাল পাশা মোড়, আজাদ নগর, রামগতি, লক্ষ্মীপুর,, লক্ষ্মীপুর
                </p>
                <p className="text-[11.5px] text-black font-bold leading-tight">
                  Tel: 01718389900
                </p>
                <p className="text-[11px] text-black/90 font-medium tracking-tight leading-tight select-all">
                  mahadyhasan.forever@gmail.com
                </p>
              </div>

              {/* SALES INVOICE banner between two solid lines */}
              <div className="border-t border-black mt-3 mb-1"></div>
              <div className="text-center font-bold tracking-widest text-[#000] text-[13px] uppercase py-0.5" style={{ fontWeight: 750 }}>
                SALES INVOICE
              </div>
              <div className="border-t border-black mt-1 mb-3"></div>

              {/* Invoice Meta details side-by-side matching screenshot exactly */}
              <div className="space-y-1 text-[11.5px] text-black font-semibold">
                
                {/* Row 1: Invoice # and Date */}
                <div className="flex justify-between items-baseline">
                  <div className="flex w-full">
                    <span className="font-bold min-w-[85px]">Invoice #</span>
                    <span className="font-bold flex-1 text-left">
                      {(() => {
                        const rawId = selectedInvoiceForReceipt.id;
                        return rawId.startsWith('SL') ? rawId : `SL${rawId}`;
                      })()}
                    </span>
                    <span className="font-bold text-right">
                      {selectedInvoiceForReceipt.date.includes('-') 
                        ? selectedInvoiceForReceipt.date.split('-').reverse().join('-') 
                        : new Date(selectedInvoiceForReceipt.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
                      }
                    </span>
                  </div>
                </div>

                {/* Row 2: Customer */}
                <div className="flex text-left">
                  <span className="font-bold min-w-[85px]">Customer</span>
                  <span className="font-bold flex-1 text-left">{selectedInvoiceForReceipt.customerName}</span>
                </div>

                {/* Row 3: Served by */}
                <div className="flex text-left">
                  <span className="font-bold min-w-[85px]">Served by</span>
                  <span className="font-bold flex-1 text-left">
                    {selectedInvoiceForReceipt.createdBy === 'admin' ? 'Admin' : (selectedInvoiceForReceipt.createdBy || 'Admin')}
                  </span>
                </div>

                {/* Row 4: Time */}
                <div className="flex text-left">
                  <span className="font-bold min-w-[85px]">Time</span>
                  <span className="font-bold flex-1 text-left">
                    {getInvoiceTime(selectedInvoiceForReceipt.id)}
                  </span>
                </div>

              </div>

              {/* Dotted split separator */}
              <div className="border-t-2 border-dotted border-black my-2.5"></div>

              {/* Main table items lists with exact Disc column to replicate picture exactly */}
              <table className="w-full text-left text-[11px] text-black border-collapse font-sans">
                <thead>
                  <tr className="text-black font-bold text-[11.5px]">
                    <th className="py-1 text-left w-5">#</th>
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-center w-10">Qty</th>
                    <th className="py-1 text-right w-16">Rate</th>
                    <th className="py-1 text-center w-10">Disc</th>
                    <th className="py-1 text-right w-20">Total</th>
                  </tr>
                  <tr className="border-b-2 border-dotted border-black">
                    <td colSpan={6} className="h-0.5"></td>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const items = Array.isArray((selectedInvoiceForReceipt as any).items) && (selectedInvoiceForReceipt as any).items.length > 0
                      ? (selectedInvoiceForReceipt as any).items
                      : [{
                          productName: (selectedInvoiceForReceipt as any).productName ?? '-',
                          quantity: (selectedInvoiceForReceipt as any).quantity ?? 1,
                          unitPrice: (selectedInvoiceForReceipt as any).unitPrice ?? getTotal(selectedInvoiceForReceipt),
                          discount: 0,
                          totalPrice: getTotal(selectedInvoiceForReceipt),
                        }];
                    return items.map((it: any, idx: number) => {
                      const qty = Number(it.quantity ?? 1);
                      const rate = Number(it.unitPrice ?? it.price ?? 0);
                      const disc = Number(it.discount ?? 0);
                      const lineTotal = Number(it.totalPrice ?? (qty * rate - disc));
                      return (
                        <tr key={idx} className="align-top text-black text-[11.5px]">
                          <td className="py-1.5 font-bold">{idx + 1}</td>
                          <td className="py-1.5 text-left font-semibold pr-1.5 break-words max-w-[130px]">
                            {it.productName ?? it.name ?? '-'}
                          </td>
                          <td className="py-1.5 text-center font-bold">{qty}</td>
                          <td className="py-1.5 text-right font-semibold">{rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="py-1.5 text-center font-semibold">{disc > 0 ? disc : '-'}</td>
                          <td className="py-1.5 text-right font-bold">{lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>

              {/* Solid line above Total */}
              <div className="border-t border-black mt-2"></div>

              {/* Total and Paid Amount summaries */}
              {(() => {
                const foundCust = customers.find(c => c.name === getCustomerName(selectedInvoiceForReceipt));
                const previousDue = foundCust ? Number(foundCust.dueAmount ?? 0) : 0;
                const grandTotal = getTotal(selectedInvoiceForReceipt);
                const paidVal = getPaid(selectedInvoiceForReceipt);
                const currentDue = Math.max(0, grandTotal - paidVal);
                const totalDueVal = previousDue + currentDue;
                return (
                  <div className="w-full text-black select-none font-normal text-[11px]">
                    {/* Total Row side-by-side */}
                    <div className="flex justify-between items-center py-2 text-black" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="text-[12px] font-normal tracking-wider uppercase">TOTAL</span>
                      <span className="text-[13px] font-normal font-mono">
                        {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Solid divider line */}
                    <div className="border-t-[1.5px] border-black pb-1.5 mt-0.5"></div>

                    {/* Paid Amount Row side-by-side */}
                    <div className="flex justify-between items-center py-1 text-black" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="text-[11px] font-normal uppercase">Paid Amount</span>
                      <span className="text-[12px] font-normal font-mono">
                        {paidVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Previous Due Row side-by-side */}
                    <div className="flex justify-between items-center py-1 text-black" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="text-[11px] font-normal text-zinc-900 uppercase">Previous Due</span>
                      <span className="text-[12px] font-normal font-mono">
                        {previousDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Thin separation line */}
                    <div className="border-t border-gray-300 w-full my-1.5"></div>

                    {/* Total Due Amount Row side-by-side */}
                    <div className="flex justify-between items-center py-1 text-black" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="text-[11px] font-normal uppercase">Total Due Amount</span>
                      <span className="text-[12px] font-normal font-mono">
                        {totalDueVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Dotted Split separator below Paid Amount */}
              <div className="border-t-2 border-dotted border-black my-2.5"></div>

              {/* Customer message, terms & time */}
              <div className="text-center font-sans space-y-1.5 px-1 pb-1">
                <h4 className="font-bold text-[13px] text-black tracking-wide" style={{ fontWeight: 800 }}>
                  Thank You for Your Business!
                </h4>
                <p className="text-[10px] text-zinc-700 italic font-medium leading-relaxed max-w-[270px] mx-auto">
                  Thank you for your business. Please contact us for any queries regarding this invoice
                </p>
                
                {/* Dynamic timestamp output */}
                <div className="text-[10.5px] text-black font-bold pt-1 label-timestamp">
                  <span>
                    {selectedInvoiceForReceipt.date.includes('-') 
                      ? selectedInvoiceForReceipt.date.split('-').reverse().join('-') 
                      : new Date(selectedInvoiceForReceipt.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
                    }
                  </span>
                  <span className="mx-2">|</span>
                  <span>{getInvoiceTime(selectedInvoiceForReceipt.id)}</span>
                </div>

              </div>

              {/* Bottom Dotted separator wrapping inside the print container */}
              <div className="border-t-2 border-dotted border-black my-2.5"></div>

            </div>

            {/* Print action buttons inside modal box styled exactly as instructions & green button */}
            <div className="space-y-2 pt-1.5 no-print">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-[#008d44] hover:bg-[#00733e] text-white font-bold text-xs py-3.5 rounded-xl transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 select-none shadow-sm shadow-[#008d44]/20"
              >
                {/* Print bills look cash card icon */}
                <span className="text-sm font-semibold">💵</span>
                <span>PRINT</span>
              </button>
            </div>

            {/* End of Receipt tab body */}
            </div>

            {/* Return / Exchange tab body */}
            {receiptTab === 'return' && (
              <ReturnExchangePanel
                sale={selectedInvoiceForReceipt}
                products={products}
                setProducts={setProducts}
                setSales={setSales}
                setSalesReturns={setSalesReturns}
                lang={lang}
                showToast={showToast}
                onDone={() => setSelectedInvoiceForReceipt(null)}
                existingReturns={salesReturns}
              />
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: EDIT INVOICE POPUP */}
      {selectedInvoiceForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">
                {lang === 'bn' ? 'ইনভয়েস এডিট' : 'Edit Invoice Data'} - {selectedInvoiceForEdit.id}
              </h3>
              <button
                onClick={() => setSelectedInvoiceForEdit(null)}
                className="text-gray-400 hover:text-red-500 font-bold"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inputs Details */}
            <div className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-500 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-[#008d44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Total (BDT)</label>
                  <input
                    type="number"
                    value={editTotal}
                    onChange={(e) => setEditTotal(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Paid Amount (BDT)</label>
                  <input
                    type="number"
                    value={editPaid}
                    onChange={(e) => setEditPaid(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Payment status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 border rounded-lg font-semibold"
                >
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                </select>
              </div>

            </div>

            {/* Safe/Cancel buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoiceForEdit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveInvoiceEdit}
                className="bg-[#008d44] hover:bg-[#00733e] text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition"
              >
                {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// -----------------------------------------------------------------------------
// ReturnExchangePanel
// -----------------------------------------------------------------------------
// Renders inside the invoice-details modal ("Return / Exchange" tab) and
// merges the former stand-alone Sales Return page into the drawer.
// Supports:
//   - partial returns (per line item)
//   - full returns (all items at max quantity)
//   - exchange with another product (in-stock)
//   - restock vs damaged disposition
//   - automatic stock adjustment (return: +qty when restock; exchange: -qty)
//   - refund records appended to the shared salesReturns state
// Preserves original sale storage (only decrements item quantities / totals).
// -----------------------------------------------------------------------------
interface ReturnExchangePanelProps {
  sale: Sale | null;
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setSalesReturns?: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
  existingReturns: ReturnRecord[];
  lang: 'bn' | 'en';
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onDone: () => void;
}

interface DraftLine {
  productId: string;
  productName: string;
  unitPrice: number;
  originalQty: number;
  returnQty: number;
}

const ReturnExchangePanel: React.FC<ReturnExchangePanelProps> = ({
  sale,
  products,
  setProducts,
  setSales,
  setSalesReturns,
  existingReturns,
  lang,
  showToast,
  onDone,
}) => {
  // Derive editable line items from the sale (falling back to legacy top-level fields).
  const lines: DraftLine[] = useMemo(() => {
    if (!sale) return [];
    const items = Array.isArray((sale as any).items) && (sale as any).items.length > 0
      ? (sale as any).items
      : [{
          productId: (sale as any).productId ?? '',
          productName: (sale as any).productName ?? '-',
          quantity: (sale as any).quantity ?? 1,
          unitPrice: (sale as any).unitPrice ?? Number((sale as any).totalPrice ?? 0),
        }];
    return items.map((it: any) => {
      const pid = String(it.productId ?? '');
      // Compute already-returned qty for this sale+product so max reflects remaining stock.
      const alreadyReturned = existingReturns
        .filter(r => r.saleId === sale.id && r.productId === pid)
        .reduce((sum, r) => sum + Number(r.quantityReturned || 0), 0);
      const originalQty = Math.max(0, Number(it.quantity ?? 0) - alreadyReturned);
      return {
        productId: pid,
        productName: String(it.productName ?? it.name ?? '-'),
        unitPrice: Number(it.unitPrice ?? it.price ?? 0),
        originalQty,
        returnQty: 0,
      };
    });
  }, [sale, existingReturns]);

  const [drafts, setDrafts] = useState<DraftLine[]>(lines);
  useEffect(() => { setDrafts(lines); }, [lines]);

  const [disposition, setDisposition] = useState<'restock' | 'damaged'>('restock');
  const [refundMethod, setRefundMethod] = useState<string>('Cash');
  const [reason, setReason] = useState<string>('');

  // Exchange
  const [exchangeEnabled, setExchangeEnabled] = useState<boolean>(false);
  const [exchangeProductId, setExchangeProductId] = useState<string>('');
  const [exchangeQty, setExchangeQty] = useState<number>(1);

  const setQty = (idx: number, qty: number) => {
    setDrafts(prev => prev.map((d, i) => i === idx
      ? { ...d, returnQty: Math.max(0, Math.min(d.originalQty, Math.floor(qty || 0))) }
      : d));
  };
  const setFullReturn = () => setDrafts(prev => prev.map(d => ({ ...d, returnQty: d.originalQty })));
  const clearReturn = () => setDrafts(prev => prev.map(d => ({ ...d, returnQty: 0 })));

  const refundTotal = drafts.reduce((s, d) => s + d.returnQty * d.unitPrice, 0);
  const exchangeProduct = products.find(p => p.id === exchangeProductId);
  const exchangeCost = exchangeEnabled && exchangeProduct
    ? Number(exchangeProduct.sellingPrice ?? exchangeProduct.price ?? 0) * Math.max(1, exchangeQty)
    : 0;
  const netRefund = Number((refundTotal - exchangeCost).toFixed(2));

  const anyReturn = drafts.some(d => d.returnQty > 0);

  const handleSubmit = () => {
    if (!sale) return;
    if (!anyReturn && !exchangeEnabled) {
      showToast(lang === 'bn' ? 'কমপক্ষে একটি পণ্য রিটার্ন বা এক্সচেঞ্জ নির্বাচন করুন' : 'Select at least one item to return or exchange', 'error');
      return;
    }
    if (exchangeEnabled) {
      if (!exchangeProduct) {
        showToast(lang === 'bn' ? 'এক্সচেঞ্জের জন্য পণ্য নির্বাচন করুন' : 'Select a product to exchange with', 'error');
        return;
      }
      if (exchangeQty <= 0) {
        showToast(lang === 'bn' ? 'এক্সচেঞ্জ পরিমাণ ১ বা তার বেশি হতে হবে' : 'Exchange quantity must be at least 1', 'error');
        return;
      }
      if ((exchangeProduct.stock ?? 0) < exchangeQty) {
        showToast(lang === 'bn' ? 'এই পণ্যের পর্যাপ্ত স্টক নেই' : 'Not enough stock for this product', 'error');
        return;
      }
    }

    let newRecords: ReturnRecord[] = [];
    // 1) Persist ReturnRecord entries (one per returned line item).
    if (setSalesReturns && anyReturn) {
      const now = new Date().toISOString();
      newRecords = drafts
        .filter(d => d.returnQty > 0)
        .map((d, i) => ({
          id: `RTN-${Date.now().toString().slice(-6)}${i}`,
          saleId: sale.id,
          productId: d.productId,
          productName: d.productName,
          customerName: String((sale as any).customerName ?? 'Walk-in Customer'),
          quantityReturned: d.returnQty,
          refundAmount: Number((d.returnQty * d.unitPrice).toFixed(2)),
          refundMethod,
          disposition,
          reason: reason || (lang === 'bn' ? 'গ্রাহকের ফেরত প্রদান' : 'Customer return'),
          date: now,
        }));
      setSalesReturns(prev => [...newRecords, ...prev]);
    }

    // 2) Stock adjustments (restock returns add back; exchange product decrements).
    if (setProducts) {
      setProducts(prev => prev.map(p => {
        let stock = Number(p.stock ?? 0);
        if (disposition === 'restock') {
          const d = drafts.find(dr => dr.productId === p.id);
          if (d) stock += d.returnQty;
        }
        if (exchangeEnabled && exchangeProduct && p.id === exchangeProduct.id) {
          stock -= exchangeQty;
        }
        return stock === Number(p.stock ?? 0) ? p : { ...p, stock };
      }));
    }

    let updatedSaleObj: Sale | null = null;
    // 3) Update the original sale: decrement returned items, add exchange as a new line.
    setSales(prev => prev.map(s => {
      if (s.id !== sale.id) return s;
      const src: any[] = Array.isArray((s as any).items) && (s as any).items.length > 0
        ? (s as any).items
        : [{
            productId: (s as any).productId ?? '',
            productName: (s as any).productName ?? '-',
            quantity: (s as any).quantity ?? 1,
            unitPrice: (s as any).unitPrice ?? Number((s as any).totalPrice ?? 0),
            totalPrice: Number((s as any).totalPrice ?? 0),
          }];
      const nextItems = src.map((it: any) => {
        const d = drafts.find(dr => dr.productId === String(it.productId ?? ''));
        if (!d || d.returnQty <= 0) return it;
        const newQty = Math.max(0, Number(it.quantity ?? 0) - d.returnQty);
        const rate = Number(it.unitPrice ?? it.price ?? 0);
        return { ...it, quantity: newQty, totalPrice: Number((newQty * rate).toFixed(2)) };
      });
      if (exchangeEnabled && exchangeProduct) {
        const rate = Number(exchangeProduct.sellingPrice ?? exchangeProduct.price ?? 0);
        nextItems.push({
          productId: exchangeProduct.id,
          productName: exchangeProduct.name ?? '-',
          quantity: exchangeQty,
          unitPrice: rate,
          discount: 0,
          totalPrice: Number((rate * exchangeQty).toFixed(2)),
        });
      }
      const newTotal = Number(nextItems.reduce((sum: number, it: any) => sum + Number(it.totalPrice ?? 0), 0).toFixed(2));
      const unitProfit = Number((s as any).quantity ?? 0) > 0
        ? Number((s as any).profit ?? 0) / Number((s as any).quantity ?? 1)
        : 0;
      const totalReturnedQty = drafts.reduce((sum, d) => sum + d.returnQty, 0);
      const remainingProfit = Math.max(0, Number((s as any).profit ?? 0) - unitProfit * totalReturnedQty);
      updatedSaleObj = {
        ...s,
        items: nextItems,
        totalPrice: newTotal,
        totalAmount: newTotal,
        quantity: nextItems.reduce((sum: number, it: any) => sum + Number(it.quantity ?? 0), 0),
        profit: remainingProfit,
      } as Sale;
      return updatedSaleObj;
    }));

    // Execute Firestore Transaction for SalesReturn & inventory adjustments
    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          // Reads first
          const productSnaps: Record<string, any> = {};
          if (disposition === 'restock') {
            for (const d of drafts) {
              if (d.returnQty > 0 && d.productId) {
                const pRef = doc(db, 'products', d.productId);
                productSnaps[d.productId] = await tx.get(pRef);
              }
            }
          }
          let exchangeSnap: any = null;
          if (exchangeEnabled && exchangeProduct && exchangeProduct.id) {
            const exRef = doc(db, 'products', exchangeProduct.id);
            exchangeSnap = await tx.get(exRef);
          }

          // Writes second
          newRecords.forEach(rec => {
            const rRef = doc(db, 'salesReturns', rec.id);
            tx.set(rRef, rec);
          });

          if (sale && sale.id && updatedSaleObj) {
            const sRef = doc(db, 'sales', sale.id);
            tx.set(sRef, updatedSaleObj, { merge: true });
          }

          if (disposition === 'restock') {
            for (const d of drafts) {
              if (d.returnQty > 0 && d.productId && productSnaps[d.productId]) {
                const pSnap = productSnaps[d.productId];
                if (pSnap.exists()) {
                  const currentStock = Number(pSnap.data().stock || 0);
                  tx.update(pSnap.ref, { stock: currentStock + d.returnQty, updatedAt: new Date().toISOString() });
                }
              }
            }
          }

          if (exchangeEnabled && exchangeProduct && exchangeSnap && exchangeSnap.exists()) {
            const currentExStock = Number(exchangeSnap.data().stock || 0);
            tx.update(exchangeSnap.ref, { stock: Math.max(0, currentExStock - exchangeQty), updatedAt: new Date().toISOString() });
          }
        });
      } catch (err) {
        console.warn('[SalesReturn] Transaction failed / offline fallback:', err);
        newRecords.forEach(rec => enqueueSalesReturn(rec, rec.customerName));
        if (disposition === 'restock') {
          drafts.forEach(d => {
            if (d.returnQty > 0 && d.productId) {
              enqueueStockUpdate(d.productId, d.returnQty, d.productName);
            }
          });
        }
        if (exchangeEnabled && exchangeProduct && exchangeProduct.id) {
          enqueueStockUpdate(exchangeProduct.id, -exchangeQty, exchangeProduct.name);
        }
      }
    })();

    showToast(
      lang === 'bn'
        ? `প্রক্রিয়া সম্পন্ন হয়েছে। নেট রিফান্ড: ৳${netRefund.toFixed(2)}`
        : `Processed successfully. Net refund: ৳${netRefund.toFixed(2)}`,
      'success'
    );
    onDone();
  };

  if (!sale) return null;

  return (
    <div className="pt-3 space-y-4 text-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <RotateCcw size={16} className="text-[#008d44]" />
          {lang === 'bn' ? 'রিটার্ন / এক্সচেঞ্জ' : 'Return / Exchange'}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setFullReturn}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            {lang === 'bn' ? 'সম্পূর্ণ রিটার্ন' : 'Full Return'}
          </button>
          <button
            type="button"
            onClick={clearReturn}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            {lang === 'bn' ? 'রিসেট' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Line items */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-[11.5px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="text-left py-2 px-3 font-bold">{lang === 'bn' ? 'পণ্য' : 'Item'}</th>
              <th className="text-right py-2 px-2 font-bold">{lang === 'bn' ? 'রেট' : 'Rate'}</th>
              <th className="text-center py-2 px-2 font-bold">{lang === 'bn' ? 'সর্বোচ্চ' : 'Max'}</th>
              <th className="text-center py-2 px-2 font-bold">{lang === 'bn' ? 'রিটার্ন' : 'Return Qty'}</th>
              <th className="text-right py-2 px-3 font-bold">{lang === 'bn' ? 'রিফান্ড' : 'Refund'}</th>
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-slate-400">
                {lang === 'bn' ? 'রিটার্নযোগ্য কোন পণ্য নেই' : 'No returnable items'}
              </td></tr>
            )}
            {drafts.map((d, idx) => (
              <tr key={`${d.productId}-${idx}`} className="border-t border-slate-100">
                <td className="py-2 px-3 font-semibold">{d.productName}</td>
                <td className="py-2 px-2 text-right font-mono">{d.unitPrice.toFixed(2)}</td>
                <td className="py-2 px-2 text-center font-bold">{d.originalQty}</td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="number"
                    min={0}
                    max={d.originalQty}
                    value={d.returnQty}
                    onChange={(e) => setQty(idx, parseInt(e.target.value, 10))}
                    disabled={d.originalQty === 0}
                    className="w-16 text-center border rounded-md py-1 text-[11.5px] font-bold disabled:bg-slate-100"
                  />
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold">
                  ৳{(d.returnQty * d.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disposition + refund method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
            {lang === 'bn' ? 'ডিসপোজিশন' : 'Disposition'}
          </label>
          <select
            value={disposition}
            onChange={(e) => setDisposition(e.target.value as 'restock' | 'damaged')}
            className="w-full text-xs p-2 border rounded-lg font-semibold"
          >
            <option value="restock">{lang === 'bn' ? 'স্টকে যোগ করুন' : 'Restock'}</option>
            <option value="damaged">{lang === 'bn' ? 'ত্রুটিপূর্ণ / বাতিল' : 'Damaged / Scrap'}</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
            {lang === 'bn' ? 'রিফান্ড মাধ্যম' : 'Refund Method'}
          </label>
          <select
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
            className="w-full text-xs p-2 border rounded-lg font-semibold"
          >
            <option value="Cash">Cash</option>
            <option value="Bkash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Bank">Bank</option>
            <option value="Store Credit">Store Credit</option>
          </select>
        </div>
      </div>

      {/* Exchange section */}
      <div className="border border-slate-200 rounded-xl p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={exchangeEnabled}
            onChange={(e) => setExchangeEnabled(e.target.checked)}
          />
          <ArrowRightLeft size={14} className="text-[#008d44]" />
          {lang === 'bn' ? 'অন্য পণ্যের সাথে এক্সচেঞ্জ' : 'Exchange with another product'}
        </label>
        {exchangeEnabled && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <select
              value={exchangeProductId}
              onChange={(e) => setExchangeProductId(e.target.value)}
              className="col-span-2 text-xs p-2 border rounded-lg font-semibold"
            >
              <option value="">{lang === 'bn' ? 'পণ্য নির্বাচন করুন...' : 'Select product...'}</option>
              {products
                .filter(p => Number(p.stock ?? 0) > 0)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ৳{Number(p.sellingPrice ?? p.price ?? 0).toFixed(2)} (stk {p.stock ?? 0})
                  </option>
                ))}
            </select>
            <input
              type="number"
              min={1}
              value={exchangeQty}
              onChange={(e) => setExchangeQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="text-xs p-2 border rounded-lg font-bold text-center"
              placeholder="Qty"
            />
          </div>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
          {lang === 'bn' ? 'কারণ' : 'Reason'}
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={lang === 'bn' ? 'ফেরতের কারণ...' : 'Reason for return...'}
          className="w-full text-xs p-2 border rounded-lg"
        />
      </div>

      {/* Totals + submit */}
      <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'মোট রিফান্ড' : 'Return refund'}</span>
          <span className="font-mono font-bold">৳{refundTotal.toFixed(2)}</span>
        </div>
        {exchangeEnabled && (
          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'এক্সচেঞ্জ মূল্য' : 'Exchange cost'}</span>
            <span className="font-mono font-bold">- ৳{exchangeCost.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
          <span className="font-bold">{lang === 'bn' ? 'নেট রিফান্ড' : 'Net refund'}</span>
          <span className={`font-mono font-bold ${netRefund >= 0 ? 'text-[#008d44]' : 'text-red-600'}`}>
            ৳{netRefund.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-[#008d44] hover:bg-[#00733e] text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
      >
        {lang === 'bn' ? 'প্রক্রিয়া সম্পন্ন করুন' : 'Process Return / Exchange'}
      </button>
    </div>
  );
};

