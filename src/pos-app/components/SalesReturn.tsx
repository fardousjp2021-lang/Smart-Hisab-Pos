// @ts-nocheck
import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { 
  RotateCcw, Search, CheckCircle2, AlertTriangle, Trash2, 
  Plus, Check, History, Receipt, Info, Download, FileSpreadsheet, Printer, ArrowRightLeft, DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SummaryCard } from './SummaryCard';

export interface ReturnRecord {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  customerName: string;
  quantityReturned: number;
  refundAmount: number;
  refundMethod: string;
  disposition: 'restock' | 'damaged'; // restock adds back to inventory, damaged registers as write-off
  reason: string;
  date: string;
}

interface SalesReturnProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  salesReturns: ReturnRecord[];
  setSalesReturns: React.Dispatch<React.SetStateAction<ReturnRecord[]>>;
  lang?: string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  theme?: 'light' | 'dark';
}

export const SalesReturn: React.FC<SalesReturnProps> = ({
  products,
  setProducts,
  sales,
  setSales,
  salesReturns,
  setSalesReturns,
  lang = 'bn',
  showToast,
  theme = 'light'
}) => {
  // Return Processing tab / history tab
  const [activeTab, setActiveTab2] = useState<'create' | 'history'>('create');
  
  // Create Return states
  const [searchInvoiceId, setSearchInvoiceId] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Return form inputs
  const [qtyToReturn, setQtyToReturn] = useState<number>(1);
  const [disposition, setDisposition] = useState<'restock' | 'damaged'>('restock');
  const [refundMethod, setRefundMethod] = useState<string>('Cash');
  const [reason, setReason] = useState<string>('');
  const [customRefundAmount, setCustomRefundAmount] = useState<string>('');

  // Manual return states (when invoice is not found / legacy return)
  const [isManualReturn, setIsManualReturn] = useState<boolean>(false);
  const [manualProdId, setManualProdId] = useState<string>('');
  const [manualCustomer, setManualCustomer] = useState<string>('Walk-in Customer');
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualPrice, setManualPrice] = useState<string>('');

  // Search filter for return history
  const [historySearch, setHistorySearch] = useState<string>('');

  // Handler: Search original sale
  const handleSearchInvoice = () => {
    if (!searchInvoiceId.trim()) {
      showToast(lang === 'bn' ? "ইনভয়েস বা বিক্রয় আইডি লিখুন!" : "Enter Invoice or Sale ID!", "error");
      return;
    }
    const found = sales.find(s => s.id.toLowerCase() === searchInvoiceId.trim().toLowerCase());
    if (found) {
      setSelectedSale(found);
      setQtyToReturn(1); // Reset to 1
      setCustomRefundAmount(found.unitPrice.toString());
      setIsManualReturn(false);
      showToast(lang === 'bn' ? "বিক্রয় রেকর্ড খুঁজে পাওয়া গেছে!" : "Sales record found!", "success");
    } else {
      setSelectedSale(null);
      showToast(lang === 'bn' ? "এই আইডি দিয়ে কোনো বিক্রয় রেকর্ড পাওয়া যায়নি!" : "No sales record found for this ID!", "info");
    }
  };

  // Handler: Add return process
  const handleProcessReturn = () => {
    let returnedItemName = "";
    let returnedProdId = "";
    let customerName = "";
    let unitRefund = 0;
    let saleIdStr = "";

    if (isManualReturn) {
      const p = products.find(prod => prod.id === manualProdId);
      if (!p) {
        showToast(lang === 'bn' ? "অনুগ্রহ করে একটি সঠিক বৈধ্য পণ্য সিলেক্ট করুন!" : "Please select a valid product!", "error");
        return;
      }
      if (manualQty <= 0) {
        showToast(lang === 'bn' ? "রিটার্ন পরিমাণ ১ বা তার বেশি হতে হবে!" : "Quantity must be 1 or more!", "error");
        return;
      }
      returnedItemName = p.name;
      returnedProdId = p.id;
      customerName = manualCustomer || "Walk-in Customer";
      unitRefund = parseFloat(manualPrice) || p.sellingPrice;
      saleIdStr = 'MANUAL';
    } else {
      if (!selectedSale) return;
      if (qtyToReturn <= 0 || qtyToReturn > selectedSale.quantity) {
        showToast(
          lang === 'bn' 
            ? `অনুপযুক্ত পরিমাণ! সর্বোচ্চ সংখ্যা ${selectedSale.quantity} হতে পারে।` 
            : `Invalid quantity! Max possible return is ${selectedSale.quantity}`, 
          "error"
        );
        return;
      }
      returnedItemName = selectedSale.productName;
      returnedProdId = selectedSale.productId;
      customerName = selectedSale.customerName;
      unitRefund = parseFloat(customRefundAmount) || selectedSale.unitPrice;
      saleIdStr = selectedSale.id;
    }

    const finalQuantity = isManualReturn ? manualQty : qtyToReturn;
    const finalRefundTotal = Number((unitRefund * finalQuantity).toFixed(2));
    const returnId = "RTN-" + Math.floor(100000 + Math.random() * 900000);

    const newReturn: ReturnRecord = {
      id: returnId,
      saleId: saleIdStr,
      productId: returnedProdId,
      productName: returnedItemName,
      customerName: customerName,
      quantityReturned: finalQuantity,
      refundAmount: finalRefundTotal,
      refundMethod: refundMethod,
      disposition: disposition,
      reason: reason || (lang === 'bn' ? "গ্রাহকের ফেরত প্রদান" : "Customer preference/return"),
      date: new Date().toISOString()
    };

    // Update Sales Returns list
    setSalesReturns(prev => [newReturn, ...prev]);

    // Update Products Stock in memory if disposition is 'restock'
    if (disposition === 'restock') {
      setProducts(prevProds => prevProds.map(p => {
        if (p.id === returnedProdId) {
          return {
            ...p,
            stock: p.stock + finalQuantity
          };
        }
        return p;
      }));
    }

    // Adjust original sale unless it was manual return
    if (!isManualReturn && selectedSale) {
      setSales(prevSales => prevSales.map(s => {
        if (s.id === selectedSale.id) {
          const newQty = Math.max(0, s.quantity - finalQuantity);
          const newTotalPrice = Math.max(0, Number((newQty * s.unitPrice).toFixed(2)));
          // Recalculate profit proportionally
          const unitProfit = s.quantity > 0 ? s.profit / s.quantity : 0;
          const newProfit = Math.max(0, Number((newQty * unitProfit).toFixed(2)));
          return {
            ...s,
            quantity: newQty,
            totalPrice: newTotalPrice,
            profit: newProfit
          };
        }
        return s;
      }).filter(s => s.quantity > 0)); // If quantity reaches 0, we can drop or keep with 0. Better keep non-zero.
    }

    showToast(
      lang === 'bn' 
        ? `পণ্য রিটার্ন সফলভাবে সম্পন্ন হয়েছে! রসিদ আইডি: ${returnId}` 
        : `Product return processed successfully! Ref ID: ${returnId}`, 
      "success"
    );

    // Reset fields
    setSelectedSale(null);
    setSearchInvoiceId('');
    setReason('');
    setManualProdId('');
    setManualQty(1);
    setManualPrice('');
    setIsManualReturn(false);
  };

  // Helper calculation for analytical summary
  const summaryTotalProcessed = salesReturns.length;
  const summaryTotalRefunded = salesReturns.reduce((sum, r) => sum + r.refundAmount, 0);
  const summaryRestockedQty = salesReturns.filter(r => r.disposition === 'restock').reduce((sum, r) => sum + r.quantityReturned, 0);
  const summaryDamagedQty = salesReturns.filter(r => r.disposition === 'damaged').reduce((sum, r) => sum + r.quantityReturned, 0);

  // Filter history
  const filteredReturns = salesReturns.filter(r => 
    r.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.productName.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.saleId.toLowerCase().includes(historySearch.toLowerCase())
  );

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredReturns.map((r, i) => ({
      '#': i + 1,
      'Return ID': r.id,
      'Sale ID': r.saleId,
      'Customer': r.customerName,
      'Product Name': r.productName,
      'Returned Qty': r.quantityReturned,
      'Refund (BDT)': r.refundAmount,
      'Refund Method': r.refundMethod,
      'Status': r.disposition === 'restock' ? (lang === 'bn' ? 'স্টকে ফেরত যুক্ত' : 'Restocked') : (lang === 'bn' ? 'ত্রুটিপূর্ণ/বাতিল' : 'Scrapped/Damaged'),
      'Date': new Date(r.date).toLocaleDateString(),
      'Reason': r.reason
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales_Returns');
    XLSX.writeFile(wb, `Sales_Returns_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(lang === 'bn' ? "এক্সেল রিপোর্ট ডাউনলোড করা হয়েছে!" : "Excel report downloaded!", "success");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(lang === 'bn' ? "পণ্য রিটার্ন এবং রিফান্ড বিবরণী" : "Sales Return & Refund Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["Return ID", "Sale ID", "Customer Name", "Product", "Qty", "Refund BDT", "Disposition", "Date"];
    const tableRows = filteredReturns.map(r => [
      r.id,
      r.saleId,
      r.customerName,
      r.productName,
      r.quantityReturned.toString(),
      `৳${r.refundAmount.toFixed(2)}`,
      r.disposition === 'restock' ? 'Restocked' : 'Damaged',
      new Date(r.date).toLocaleDateString()
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [0, 141, 68] } // high contrast green theme matching
    });

    doc.save(`Sales_Returns_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast(lang === 'bn' ? "পিডিএফ রিপোর্ট ডাউনলোড করা হয়েছে!" : "PDF report downloaded!", "success");
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Header and Brand Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-baseline gap-2">
          <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg sm:text-xl font-sans tracking-tight flex items-center gap-2">
            <RotateCcw className="text-[#008d44] shrink-0" size={22} />
            {lang === 'bn' ? 'পণ্য রিটার্ন ও এক্সচেঞ্জ সিস্টেম' : 'Product Return & Exchange Center'}
          </h1>
          <span className="text-gray-400 text-xs font-normal">
            {lang === 'bn' ? 'গ্রাহকদের ফেরতকৃত পণ্য ও রিফান্ড ড্যাশবোর্ড' : 'Client refund registers & stock rollbacks'}
          </span>
        </div>
        
        {/* Toggle navigation panel */}
        <div className="flex gap-2.5 mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab2('create')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#008d44] text-white shadow-sm'
                : 'bg-slate-200/70 hover:bg-slate-250 text-slate-700 dark:bg-gray-850 dark:text-slate-300 dark:hover:bg-gray-800'
            }`}
          >
            <Plus size={14} />
            {lang === 'bn' ? 'রিটার্ন প্রসেস করুন' : 'New Return Entry'}
          </button>
          <button
            onClick={() => setActiveTab2('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#008d44] text-white shadow-sm'
                : 'bg-slate-200/70 hover:bg-slate-250 text-slate-700 dark:bg-gray-850 dark:text-slate-300 dark:hover:bg-gray-800'
            }`}
          >
            <History size={14} />
            {lang === 'bn' ? 'রিটার্ন ইতিহাস' : 'Returns Ledger'}
          </button>
        </div>
      </div>

      {/* Metric summary panel card row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          icon={<RotateCcw className="w-5 h-5" />} 
          label={lang === 'bn' ? 'মোট রিটার্ন সংখ্যা' : 'Returns Processed'} 
          value={summaryTotalProcessed.toString()} 
          tone="rose"
        />
        <SummaryCard 
          icon={<DollarSign className="w-5 h-5" />} 
          label={lang === 'bn' ? 'মোট রিফান্ডকৃত অর্থ' : 'Total Refund Amount'} 
          value={`৳${summaryTotalRefunded.toLocaleString()}`} 
          tone="emerald"
        />
        <SummaryCard 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          label={lang === 'bn' ? 'স্টকে রি-লোড পণ্য' : 'Restocked Quantity'} 
          value={`${summaryRestockedQty} Pcs`} 
          tone="blue"
        />
        <SummaryCard 
          icon={<AlertTriangle className="w-5 h-5" />} 
          label={lang === 'bn' ? 'ক্ষতিগ্রস্ত/ত্রুটিপূর্ণ পণ্য' : 'Damaged / Lost'} 
          value={`${summaryDamagedQty} Pcs`} 
          tone="amber"
        />
      </div>

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form and search panel segment */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 bg-white dark:bg-gray-850 border border-slate-205 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-800">
                <h3 className="font-bold text-slate-750 dark:text-slate-200 text-sm flex items-center gap-2">
                  <Receipt size={17} className="text-[#008d44]" />
                  {lang === 'bn' ? 'ইনভেস অনুসন্ধান' : 'Invoice Rollback Search'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualReturn(!isManualReturn);
                    setSelectedSale(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {isManualReturn 
                    ? (lang === 'bn' ? 'ইনভয়েস দিয়ে সার্চ করুন' : 'Search standard Invoice')
                    : (lang === 'bn' ? 'ম্যানুয়াল ফাস্ট রিটার্ন' : 'Manual Quick Return')}
                </button>
              </div>

              {!isManualReturn ? (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-300 block">
                    {lang === 'bn' ? 'ইনভয়েস বা বিক্রয় আইডি লিখুন' : 'Enter Sales/Invoice ID (e.g. SALE-101)'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="e.g. SALE-101"
                        value={searchInvoiceId}
                        onChange={(e) => setSearchInvoiceId(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 focus:outline-[#008d44] font-mono uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchInvoice}
                      className="bg-[#008d44] hover:bg-[#00733e] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Search size={14} />
                      {lang === 'bn' ? 'খুঁজুন' : 'Search'}
                    </button>
                  </div>

                  {/* Quick recent sale matching helper dropdown to make it user friendly */}
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      {lang === 'bn' ? 'বা সাম্প্রতিক বিক্রয় কন্ট্যাক্ট থেকে বেছে নিন:' : 'Or Select from Recent Sales List:'}
                    </label>
                    <select
                      className="w-full text-xs font-medium p-2 border border-slate-200 dark:border-gray-800 rounded-lg bg-slate-50 dark:bg-gray-900"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setSearchInvoiceId(val);
                          const found = sales.find(s => s.id === val);
                          if (found) {
                            setSelectedSale(found);
                            setQtyToReturn(1);
                            setCustomRefundAmount(found.unitPrice.toString());
                            setIsManualReturn(false);
                          }
                        }
                      }}
                      value={selectedSale?.id || ''}
                    >
                      <option value="">{lang === 'bn' ? '-- বেছে নিন --' : '-- Choose Recent Invoice --'}</option>
                      {sales.slice(0, 10).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.customerName} ({s.productName} x {s.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-150 text-[11.5px] leading-relaxed text-blue-800 dark:text-blue-300">
                  ⚠️ <strong>{lang === 'bn' ? 'ম্যানুয়াল রিটার্ন মোড সক্রিয়:' : 'Manual Return Mode:'}</strong> {lang === 'bn' ? 'ইনভয়েস রেকর্ড না খুঁজে সরাসরি স্টক বা লেজার অ্যাডজাস্ট করতে নিচের পণ্য সিলেকশন ফর্মটি ফিল আপ করুন।' : 'Directly adjust inventory or bookkeeping without querying historical receipts.'}
                </div>
              )}
            </div>

            {/* Quick specifications / instructions of company return rules */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11.5px] leading-relaxed text-amber-800 dark:text-amber-400 space-y-1 select-none">
              <span className="font-bold flex items-center gap-1">
                <Info size={14} />
                {lang === 'bn' ? 'রিটার্ন পলিসি ও নিয়মাবলী' : 'Store Returns Guidelines'}
              </span>
              <p className="font-sans font-medium text-[11px]">
                {lang === 'bn' 
                  ? '১. বিক্রয়কৃত পণ্য রিটার্ন দিলে অরিজিনাল ইনভয়েসের লাভ ও মোট মূল্য স্বয়ংক্রিয়ভাবে পরিবর্তিত হিসাব অনুযায়ী ড্যাশবোর্ডে অ্যাডজাস্ট হয়ে যাবে।' 
                  : '1. Processing standard return automatically adjusts sales logs, profit margins and revenues reflecting in Reports instantly.'}
              </p>
              <p className="font-sans font-medium text-[11px]">
                {lang === 'bn' 
                  ? '২. "স্টকে ফেরত দিন" সিলেক্ট করলে উপাদানটির স্টক লাইভ রিস্টোর হবে।' 
                  : '2. Restocking items increases active inventory amounts.'}
              </p>
            </div>
          </div>

          {/* Form Details Area and Active Checkout return processor */}
          <div className="lg:col-span-7">
            {(!selectedSale && !isManualReturn) ? (
              <div className="p-8 text-center bg-slate-100 dark:bg-gray-900 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center space-y-3 h-full min-h-[300px]">
                <RotateCcw className="text-slate-300 dark:text-slate-700 animate-pulse" size={48} />
                <p className="text-xs text-slate-500 font-bold">
                  {lang === 'bn' ? 'ইনভয়েস নম্বর এবং বিক্রয় ট্র্যাকিং কোড সার্চ করুন অথবা রিফান্ড প্রসেস শুরু করতে "ম্যানুয়াল রিটার্ন" এ ক্লিক করুন' : 'Search an Invoice ID or proceed with direct Manual entry to start the flow.'}
                </p>
              </div>
            ) : (
              <div className="p-6 bg-white dark:bg-gray-850 border border-slate-205 dark:border-gray-800 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 mb-4">
                    {lang === 'bn' ? 'রিটার্ন ট্রান্সঅ্যাকশন বিবরণ' : 'Return Transactions Form'}
                  </h3>

                  {/* CASE 1: Standard Sale Selected Details */}
                  {selectedSale && !isManualReturn && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-150 mb-5 text-[11.5px] font-sans">
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Invoice ID:</span>
                        <span className="font-bold font-mono text-[#008d44]">{selectedSale.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Customer:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedSale.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Product Name:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedSale.productName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">Purchased Details:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {selectedSale.quantity} Pcs x ৳{selectedSale.unitPrice}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FORM INPUT FIELDS */}
                  <div className="space-y-4">
                    {/* If Direct Manual Return, let them pick product */}
                    {isManualReturn && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                            {lang === 'bn' ? 'রিটার্ন পণ্য সিলেক্ট করুন *' : 'Select Return Item *'}
                          </label>
                          <select
                            className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                            value={manualProdId}
                            onChange={(e) => {
                              const pId = e.target.value;
                              setManualProdId(pId);
                              const foundP = products.find(p => p.id === pId);
                              if (foundP) {
                                setManualPrice(foundP.sellingPrice.toString());
                              }
                            }}
                          >
                            <option value="">{lang === 'bn' ? '-- পণ্য খুঁজুন --' : '-- Choose Product --'}</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku} | Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                            {lang === 'bn' ? 'গ্রাহকের নাম (অপশনাল)' : 'Customer Name (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={manualCustomer}
                            onChange={(e) => setManualCustomer(e.target.value)}
                            className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                            placeholder="Walk-in Customer"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* QTY TO RETURN */}
                      <div>
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                          {lang === 'bn' ? 'ফেরতকৃত পণ্যের পরিমাণ *' : 'Quantity Returned *'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedSale ? selectedSale.quantity : undefined}
                          value={isManualReturn ? manualQty : qtyToReturn}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            if (isManualReturn) {
                              setManualQty(val);
                            } else {
                              if (selectedSale && val > selectedSale.quantity) {
                                setQtyToReturn(selectedSale.quantity);
                              } else {
                                setQtyToReturn(val);
                              }
                            }
                          }}
                          className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 font-mono font-bold"
                        />
                      </div>

                      {/* UNIT REFUND AMOUNT RATE */}
                      <div>
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                          {lang === 'bn' ? 'একক রিফান্ড মূল্য (৳)*' : 'Unit Refund Price (৳)*'}
                        </label>
                        <input
                          type="number"
                          value={isManualReturn ? manualPrice : customRefundAmount}
                          onChange={(e) => {
                            if (isManualReturn) {
                              setManualPrice(e.target.value);
                            } else {
                              setCustomRefundAmount(e.target.value);
                            }
                          }}
                          className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 font-mono font-bold"
                        />
                      </div>

                      {/* RE-STOCK DECISION */}
                      <div>
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                          {lang === 'bn' ? 'ফেরত পণ্যের অবস্থা ও অ্যাকশন' : 'Returned Item Action'}
                        </label>
                        <select
                          className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 font-medium"
                          value={disposition}
                          onChange={(e) => setDisposition(e.target.value as any)}
                        >
                          <option value="restock">{lang === 'bn' ? 'স্টকে ফেরত যোগ করুন' : 'Restock to Inventory'}</option>
                          <option value="damaged">{lang === 'bn' ? 'ত্রুটিপূর্ণ/বাতিল (স্টকে যোগ হবে না)' : 'Damaged / Write-off'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* REFUND METHOD */}
                      <div>
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                          {lang === 'bn' ? 'রিফান্ড বা পেমেন্টের মাধ্যম' : 'Refund / Settlement Channel'}
                        </label>
                        <select
                          className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 font-medium"
                          value={refundMethod}
                          onChange={(e) => setRefundMethod(e.target.value)}
                        >
                          <option value="Cash">{lang === 'bn' ? 'নগদ ক্যাশ (Cash)' : 'Cash'}</option>
                          <option value="bKash">{lang === 'bn' ? 'বিকাশ (bKash)' : 'bKash'}</option>
                          <option value="Nagad">{lang === 'bn' ? 'নগদ (Nagad)' : 'Nagad'}</option>
                          <option value="Rocket">{lang === 'bn' ? 'রকেট (Rocket)' : 'Rocket'}</option>
                          <option value="Store Credit">{lang === 'bn' ? 'দোকান ক্রেডিট / এক্সচেঞ্জ' : 'Store Credit / Exchange'}</option>
                        </select>
                      </div>

                      {/* REASON FOR RETURN */}
                      <div>
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-300 block mb-1">
                          {lang === 'bn' ? 'রিটার্নের কারণ / যেকোনো মন্তব্য' : 'Reason for Return / Logs Note'}
                        </label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
                          placeholder={lang === 'bn' ? "যেমনঃ সাইজে মিল নেই, ওয়ারেন্টি রিপ্লেসমেন্ট" : "e.g. Broken screen package, Model swap"}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC CALCULATION BLOCK SUMMARY */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 rounded-xl space-y-1.5 font-sans select-none">
                      <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <span>{lang === 'bn' ? 'মোট রিফান্ডের পরিমাণ:' : 'Estimated Settlement Refund:'}</span>
                        <span className="font-mono text-sm font-bold">
                          ৳{((parseFloat(isManualReturn ? manualPrice : customRefundAmount) || 0) * (isManualReturn ? manualQty : qtyToReturn)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* CONFIRM ACTION BUTTONS */}
                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSale(null);
                          setIsManualReturn(false);
                        }}
                        className="p-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-gray-805 dark:text-slate-400 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleProcessReturn}
                        className="bg-[#008d44] hover:bg-[#00733e] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowRightLeft size={14} />
                        {lang === 'bn' ? 'রিটার্ন সম্পন্ন করুন' : 'Confirm Return Ledger'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters controls panel */}
          <div className="p-4 bg-white dark:bg-gray-850 rounded-2xl border border-slate-205 dark:border-gray-800 flex flex-col md:flex-row gap-3 justify-between items-center select-none">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder={lang === 'bn' ? "আইডি, কাস্টমার বা পণ্য দিয়ে খুঁজুন..." : "Filter by ID, client, item..."}
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 font-medium"
              />
            </div>
            
            {/* Export buttons aligned with custom mock theme preferences */}
            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={exportToExcel}
                className="bg-[#17a2b8]/90 hover:bg-[#138496] text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
                title="Export as Excel Workbook"
              >
                <FileSpreadsheet size={14} />
                {lang === 'bn' ? 'এক্সেল ডাউনলোড' : 'Excel Report'}
              </button>
              <button
                onClick={exportToPDF}
                className="bg-[#17a2b8]/90 hover:bg-[#138496] text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
                title="Export as PDF"
              >
                <Download size={14} />
                {lang === 'bn' ? 'পিডিএফ ফাইল' : 'PDF File'}
              </button>
            </div>
          </div>

          {/* Table list with headers matching strict rule alignments */}
          <div className="p-6 bg-white dark:bg-gray-850 border border-slate-205 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-sans font-medium">
                {/* Modern clean table header */}
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3 border-r border-slate-200">Return ID ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200">Original Sale ID ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200">Customer Name ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200">Product Name ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200 text-center">Returned Qty ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200 text-right">Refund Amount ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200 text-center">Method ⇅</th>
                    <th className="px-4 py-3 border-r border-slate-200 text-center">Disposition ⇅</th>
                    <th className="px-4 py-3 text-center">Date ⇅</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-gray-800 bg-white dark:bg-transparent">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-450 font-bold bg-slate-50 dark:bg-gray-900/50">
                        💔 {lang === 'bn' ? "কোনো পণ্য রিটার্ন ক্যাশব্যাক পাওয়া যায়নি!" : "No returns records registered currently!"}
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((r) => {
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-gray-800/40 transition duration-100 ease-in-out">
                          <td className="px-4 py-3.5 font-bold font-mono text-[11px] text-slate-800 dark:text-slate-100 uppercase border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span>{r.id}</span>
                              <button
                                type="button"
                                title={lang === 'bn' ? "আইডি কপি করুন" : "Copy ID"}
                                onClick={() => {
                                  navigator.clipboard.writeText(r.id);
                                  showToast(lang === 'bn' ? `রিটার্ন আইডি (${r.id}) কপি হয়েছে!` : `Return ID ${r.id} copied!`, 'success');
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded cursor-pointer transition"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-bold font-mono text-[11px] border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span className={r.saleId === 'MANUAL' ? 'text-amber-500' : 'text-blue-500'}>
                                {r.saleId}
                              </span>
                              {r.saleId !== 'MANUAL' && (
                                <button
                                  type="button"
                                  title={lang === 'bn' ? "ইনভয়েস আইডি কপি করুন" : "Copy Sale ID"}
                                  onClick={() => {
                                    navigator.clipboard.writeText(r.saleId);
                                    showToast(lang === 'bn' ? `ইনভয়েস আইডি (${r.saleId}) কপি হয়েছে!` : `Sale ID ${r.saleId} copied!`, 'success');
                                  }}
                                  className="p-1 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded cursor-pointer transition"
                                >
                                  <Copy size={11} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-200 font-bold text-slate-700 dark:text-slate-300">
                            {r.customerName}
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-200 font-medium text-slate-700 dark:text-slate-300">
                            {r.productName}
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-slate-200 font-mono font-bold text-slate-800 dark:text-white text-[12.5px]">
                            {r.quantityReturned}
                          </td>
                          <td className="px-4 py-3.5 text-right border-r border-slate-200 font-mono font-bold text-red-600">
                            ৳{r.refundAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-slate-200">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300">
                              {r.refundMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-slate-200">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                              r.disposition === 'restock' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {r.disposition === 'restock' 
                                ? (lang === 'bn' ? 'স্টকে যুক্ত' : 'Restocked') 
                                : (lang === 'bn' ? 'ত্রুটিপূর্ণ বাতিল' : 'Scrapped/Damaged')}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-[10.5px] font-mono text-slate-400">
                            {new Date(r.date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
