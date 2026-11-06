// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, Search, Printer, Camera, Package, Users, Plus,
  Edit2, Check, Trash2, AlertCircle, Clock,
  ShoppingCart, Tag, Banknote, CreditCard, Smartphone, Wallet,
  PauseCircle, PlayCircle, Receipt,
  Hash, Building2, User, MessageSquare, List, LayoutGrid, ChevronRight, Zap
} from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  unit: string;
  brand?: string;
  imageUrl?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  dueAmount: number;
}

interface PosCartItem {
  product: Product;
  quantity: number;
  customPrice: number;
  discount: number;
  tax: number;
  customName?: string;
}

interface ImmersivePOSProps {
  lang: 'en' | 'bn';
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  posCart: PosCartItem[];
  setPosCart: React.Dispatch<React.SetStateAction<PosCartItem[]>>;
  posWarehouse: string;
  setPosWarehouse: (val: string) => void;
  posSlSearch: string;
  setPosSlSearch: (val: string) => void;
  posInvoiceNum: string;
  setPosInvoiceNum: (val: string) => void;
  posSelectedCustomerName: string;
  setPosSelectedCustomerName: (val: string) => void;
  posBrandFilter: string;
  setPosBrandFilter: (val: string) => void;
  sendMessageToCustomer: boolean;
  setSendMessageToCustomer: (val: boolean) => void;
  posHoldCarts: any[];
  setPosHoldCarts: React.Dispatch<React.SetStateAction<any[]>>;
  isHoldListOpen: boolean;
  setIsHoldListOpen: (val: boolean) => void;
  setIsAddCustomerOpen: (val: boolean) => void;
  addProductToPOSCart: (product: Product) => void;
  handlePOSCheckout: (paymentMethod: string, invoiceDiscount?: number) => void;
  setActiveTab: (val: string) => void;
  setActiveSubTab?: (val: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  theme?: 'light' | 'dark';
}

// Google Cloud Category Color Tokens
const GOOGLE_CATEGORY_PALETTE: Record<string, { bg: string; text: string; border: string }> = {
  'Smartphones': { bg: '#e8f0fe', text: '#1a73e8', border: '#aecbfa' },
  'Smart Gadgets': { bg: '#fce8e6', text: '#d93025', border: '#fad2cf' },
  'Cables & Power Solutions': { bg: '#feefc3', text: '#b06000', border: '#fde293' },
  'Accessories': { bg: '#e6f4ea', text: '#137333', border: '#a8dab5' },
  'Mobile Phone': { bg: '#f1f3f4', text: '#3c4043', border: '#dadce0' },
  'SIM Card': { bg: '#f3e8fd', text: '#9334e6', border: '#d7aefb' },
  'Load/Recharge': { bg: '#e8eaed', text: '#202124', border: '#bdc1c6' },
  'Telecom': { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  'Default': { bg: '#f1f3f4', text: '#5f6368', border: '#dadce0' },
};

function getGoogleCategoryStyle(cat: string) {
  return GOOGLE_CATEGORY_PALETTE[cat] || GOOGLE_CATEGORY_PALETTE['Default'];
}

function getProductInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase();
}

export const ImmersivePOS: React.FC<ImmersivePOSProps> = ({
  lang,
  products,
  setProducts,
  customers,
  setCustomers,
  posCart,
  setPosCart,
  posWarehouse,
  setPosWarehouse,
  posSlSearch,
  setPosSlSearch,
  posInvoiceNum,
  setPosInvoiceNum,
  posSelectedCustomerName,
  setPosSelectedCustomerName,
  posBrandFilter,
  setPosBrandFilter,
  sendMessageToCustomer,
  setSendMessageToCustomer,
  posHoldCarts,
  setPosHoldCarts,
  isHoldListOpen,
  setIsHoldListOpen,
  setIsAddCustomerOpen,
  addProductToPOSCart,
  handlePOSCheckout,
  setActiveTab,
  setActiveSubTab,
  showToast,
  theme = 'light',
}) => {
  const isBn = lang === 'bn';

  // ── UI States ──────────────────────────────────────────────
  const [posCategory, setPosCategory] = useState<string>('ALL');
  const [posSearch, setPosSearch] = useState<string>('');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [itemSuggestions, setItemSuggestions] = useState<Product[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [editingNameIdx, setEditingNameIdx] = useState<number | null>(null);
  const [editingNameVal, setEditingNameVal] = useState('');
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  // ── Charges & Discounts ────────────────────────────────────
  const [discountInput, setDiscountInput] = useState<string>('');
  const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [tempDiscountVal, setTempDiscountVal] = useState('');
  const [tempDiscountType, setTempDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');

  const [laborEnabled, setLaborEnabled] = useState(false);
  const [laborAmt, setLaborAmt] = useState<string>('');
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherAmt, setOtherAmt] = useState<string>('');
  const [invoiceNote, setInvoiceNote] = useState('');

  // ── Payment Modals ─────────────────────────────────────────
  const [payModal, setPayModal] = useState<null | 'cash' | 'digital' | 'due' | 'multi'>(null);
  const [cashInput, setCashInput] = useState('');
  const [digitalMethod, setDigitalMethod] = useState('bKash');
  const [digitalInput, setDigitalInput] = useState('');
  const [dueInput, setDueInput] = useState('');
  const [multiSplits, setMultiSplits] = useState<{ method: string; amount: string }[]>([
    { method: 'Cash', amount: '' },
    { method: 'bKash', amount: '' },
  ]);

  // ── Receipt ────────────────────────────────────────────────
  const [receipt, setReceipt] = useState<any | null>(null);

  // ── Live clock ─────────────────────────────────────────────
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // ── Cart Totals ────────────────────────────────────────────
  const totals = useMemo(() => {
    let qty = 0, amount = 0, itemDisc = 0, tax = 0;
    (posCart || []).forEach(item => {
      qty += item.quantity;
      amount += item.customPrice * item.quantity;
      itemDisc += (item.discount || 0) * item.quantity;
      tax += (item.tax || 0) * item.quantity;
    });
    const invoiceDisc = discountType === 'Percent'
      ? (amount * (parseFloat(discountInput) || 0)) / 100
      : parseFloat(discountInput) || 0;
    const labor = laborEnabled ? (parseFloat(laborAmt) || 0) : 0;
    const other = otherEnabled ? (parseFloat(otherAmt) || 0) : 0;
    const grand = Math.max(0, amount - itemDisc + tax + labor - invoiceDisc + other);
    return { qty, amount, itemDisc, tax, invoiceDisc, labor, other, grand };
  }, [posCart, discountInput, discountType, laborEnabled, laborAmt, otherEnabled, otherAmt]);

  // ── Product Search Suggestions ─────────────────────────────
  useEffect(() => {
    const q = itemSearch.trim().toLowerCase();
    if (q.length < 1) { setItemSuggestions([]); return; }
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    ).slice(0, 6);
    setItemSuggestions(matches);
  }, [itemSearch, products]);

  // ── Unified Add to Cart Handler ───────────────────────────
  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      showToast(isBn ? 'পণ্যটি স্টকে নেই!' : 'Out of stock!', 'error');
      return;
    }
    setPosCart(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const idx = current.findIndex(item => item.product && item.product.id === product.id);
      if (idx > -1) {
        if (current[idx].quantity >= product.stock) {
          showToast(isBn ? 'স্টকের অতিরিক্ত যোগ করা সম্ভব নয়!' : 'Stock limit reached!', 'error');
          return current;
        }
        const updated = [...current];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [
        ...current,
        {
          product: product,
          quantity: 1,
          customPrice: product.sellingPrice,
          discount: 0,
          tax: 0
        }
      ];
    });
    showToast(isBn ? `"${product.name}" কার্টে যোগ হয়েছে!` : `Added "${product.name}" to cart!`, 'success');
  }, [isBn, setPosCart, showToast]);

  // ── Barcode Handler ────────────────────────────────────────
  const handleBarcodeScan = (barcode: string) => {
    const q = barcode.toLowerCase().trim();
    const matched = products.find(p =>
      p.sku?.toLowerCase() === q || p.id.toLowerCase() === q || p.name.toLowerCase() === q
    );
    if (matched) {
      addToCart(matched);
    } else {
      showToast(isBn ? `কোনো পণ্য পাওয়া যায়নি!` : `No product found for "${barcode}"`, 'error');
    }
  };

  // ── Add item from search ───────────────────────────────────
  const addFromSearch = () => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return;
    const matched = products.find(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q || (p.sku || '').toLowerCase() === q
    );
    if (matched) {
      addToCart(matched);
      setItemSearch('');
      setItemSuggestions([]);
    } else {
      showToast(isBn ? 'পণ্য পাওয়া যায়নি!' : 'Product not found!', 'error');
    }
  };

  // ── Hold Cart ──────────────────────────────────────────────
  const holdCart = () => {
    if (!posCart.length) { showToast(isBn ? 'কার্ট খালি!' : 'Cart is empty!', 'error'); return; }
    setPosHoldCarts(prev => [{
      id: 'HOLD-' + Date.now(),
      customerName: posSelectedCustomerName,
      items: posCart,
      savedAt: timeStr,
      invoiceState: { discountInput, discountType, laborEnabled, laborAmt, otherEnabled, otherAmt, posWarehouse }
    }, ...prev]);
    setPosCart([]);
    setDiscountInput('');
    setLaborEnabled(false); setLaborAmt('');
    setOtherEnabled(false); setOtherAmt('');
    setInvoiceNote('');
    showToast(isBn ? 'বিল হোল্ড করা হয়েছে!' : 'Cart held!', 'success');
  };

  const restoreHold = (hc: any) => {
    setPosCart(hc.items);
    setPosSelectedCustomerName(hc.customerName);
    if (hc.invoiceState) {
      const s = hc.invoiceState;
      if (s.discountInput !== undefined) setDiscountInput(s.discountInput);
      if (s.discountType) setDiscountType(s.discountType);
      if (s.laborEnabled !== undefined) setLaborEnabled(s.laborEnabled);
      if (s.laborAmt !== undefined) setLaborAmt(s.laborAmt);
      if (s.otherEnabled !== undefined) setOtherEnabled(s.otherEnabled);
      if (s.otherAmt !== undefined) setOtherAmt(s.otherAmt);
      if (s.posWarehouse) setPosWarehouse(s.posWarehouse);
    }
    setPosHoldCarts(prev => prev.filter(h => h.id !== hc.id));
    setIsHoldListOpen(false);
    showToast(isBn ? 'হোল্ড বিল রিস্টোর হয়েছে!' : 'Cart restored!', 'success');
  };

  // ── Checkout ───────────────────────────────────────────────
  const doCheckout = (method: string, paidAmount: number, changeAmt = 0, splits: any[] = []) => {
    if (!posCart.length) { showToast(isBn ? 'কার্ট খালি!' : 'Cart is empty!', 'error'); return; }

    const invoiceId = 'SL' + Math.floor(100000 + Math.random() * 900000);
    const due = Math.max(0, totals.grand - paidAmount);
    const change = Math.max(0, paidAmount - totals.grand);

    handlePOSCheckout(method, totals.invoiceDisc);

    const foundCust = customers.find(c => c.name === posSelectedCustomerName);

    setReceipt({
      id: invoiceId,
      date: dateStr,
      time: timeStr,
      customerName: posSelectedCustomerName,
      customerPhone: foundCust?.phone || '',
      previousDue: foundCust?.dueAmount || 0,
      paymentMethod: method,
      items: posCart.map(item => ({ ...item, product: { ...item.product } })),
      warehouse: posWarehouse,
      invoiceNum: posInvoiceNum || invoiceId,
      laborAmount: totals.labor,
      invoiceDisc: totals.invoiceDisc,
      otherAmount: totals.other,
      grandTotal: totals.grand,
      paidAmount,
      dueAmount: due,
      changeReturned: change,
      splits,
      note: invoiceNote,
    });

    // Reset
    setPayModal(null);
    setCashInput('');
    setDigitalInput('');
    setDueInput('');
    setDiscountInput('');
    setLaborEnabled(false); setLaborAmt('');
    setOtherEnabled(false); setOtherAmt('');
    setInvoiceNote('');
  };

  // ── Cart item update helpers ───────────────────────────────
  const updateCartItem = (idx: number, key: string, val: any) => {
    setPosCart(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const removeCartItem = (idx: number) => {
    setPosCart(prev => prev.filter((_, i) => i !== idx));
  };

  const newInvoice = () => {
    setPosCart([]);
    setDiscountInput('');
    setLaborEnabled(false); setLaborAmt('');
    setOtherEnabled(false); setOtherAmt('');
    setInvoiceNote('');
    setPosSelectedCustomerName('Walk-in customer');
    showToast(isBn ? 'নতুন ইনভয়েস তৈরি হয়েছে!' : 'New invoice created!', 'success');
  };

  // ── Filtered Products ──────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = posSearch.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchCat = posCategory === 'ALL' || p.category === posCategory;
      const matchBrand = posBrandFilter === 'ALL' || (p.brand || p.name.split(' ')[0]) === posBrandFilter;
      return matchSearch && matchCat && matchBrand;
    });
  }, [products, posSearch, posCategory, posBrandFilter]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
  const selectedCust = customers.find(c => c.name === posSelectedCustomerName);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'F1') { e.preventDefault(); if (posCart.length) { setCashInput(totals.grand.toFixed(2)); setPayModal('cash'); } }
      if (e.key === 'F2') { e.preventDefault(); if (posCart.length) { setDigitalInput(totals.grand.toFixed(2)); setPayModal('digital'); } }
      if (e.key === 'F3') { e.preventDefault(); if (posCart.length) { setPayModal('multi'); } }
      if (e.key === 'F4') { e.preventDefault(); holdCart(); }
      if (e.key === 'Escape') { setPayModal(null); setReceipt(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [posCart, totals]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#f8f9fa] text-slate-800 font-sans select-none overflow-hidden">

      {/* ══════════════ GOOGLE CLOUD TOP APP BAR ══════════════ */}
      <div className="h-12 bg-[#202124] text-white border-b border-[#3c4043] flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
        {/* Brand logo & workspace status */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#1a73e8] rounded-md flex items-center justify-center shadow-xs">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight">RONY TELECOM</span>
            <span className="text-[10px] bg-[#3c4043] text-[#e8eaed] font-medium px-2 py-0.5 rounded-full border border-white/10">
              {isBn ? 'পয়েন্ট অব সেল' : 'Cloud POS Workspace'}
            </span>
          </div>
        </div>

        {/* Center Nav Tools */}
        <div className="hidden md:flex items-center gap-1">
          {/* 1. New Invoice */}
          <button type="button" onClick={newInvoice} title="New Invoice"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <Receipt size={13} className="text-[#8ab4f8]" />
            {isBn ? 'নতুন ইনভয়েস' : 'New Invoice'}
          </button>

          {/* 2. Customer Manager */}
          <button type="button" onClick={() => setIsAddCustomerOpen(true)} title="Add Customer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <Users size={13} className="text-[#81c995]" />
            {isBn ? 'কাস্টমার' : 'Customers'}
          </button>

          {/* 3. Inventory Stock Lookup */}
          <button type="button" onClick={() => { setActiveTab('inventory'); if (setActiveSubTab) setActiveSubTab('list'); }} title="View Stock"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <Package size={13} className="text-[#c58af9]" />
            {isBn ? 'পণ্য স্টক' : 'Stock List'}
          </button>

          {/* 4. Sales History */}
          <button type="button" onClick={() => { setActiveTab('pos'); if (setActiveSubTab) setActiveSubTab('all_sales'); }} title="Sales History"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <Banknote size={13} className="text-[#fcad70]" />
            {isBn ? 'বিক্রয় হিসাব' : 'Sales History'}
          </button>

          {/* 5. Barcode Scanner */}
          <button type="button" onClick={() => setIsScannerOpen(true)} title="Scan Barcode"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <Camera size={13} className="text-[#80c4ff]" />
            {isBn ? 'স্ক্যানার' : 'Scanner'}
          </button>

          {/* 6. Hotkey Guide */}
          <button type="button" onClick={() => setIsShortcutModalOpen(true)} title="Keyboard Shortcuts"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[#e8eaed] transition text-xs font-medium border border-white/10 cursor-pointer">
            <Zap size={12} className="text-[#fde293]" />
            <span className="font-mono text-[10px] font-bold">F1-F4</span>
          </button>

          {/* 7. Main Dashboard */}
          <button type="button" onClick={() => { setActiveTab('dashboard'); if (setActiveSubTab) setActiveSubTab(''); }} title="Main Dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 text-[#e8eaed] hover:text-white transition text-xs font-medium cursor-pointer">
            <LayoutGrid size={13} className="text-[#fde293]" />
            {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </button>
        </div>

        {/* Right Tools: Hold List & Live Clock */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[#9aa0a6] text-xs font-mono bg-[#3c4043]/50 px-2.5 py-0.5 rounded border border-white/5">
            <Clock size={11} className="text-[#8ab4f8]" />
            <span>{timeStr}</span>
          </div>

          {/* Hold List Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setIsHoldListOpen(!isHoldListOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3c4043] hover:bg-[#4a4e51] text-white text-xs font-medium transition border border-white/10">
              <PauseCircle size={13} className="text-[#fdd663]" />
              {isBn ? 'হোল্ড' : 'Hold'}
              {posHoldCarts.length > 0 && (
                <span className="bg-[#ea4335] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">{posHoldCarts.length}</span>
              )}
            </button>

            {isHoldListOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsHoldListOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-[#dadce0] shadow-xl rounded-lg z-40 overflow-hidden text-slate-800 animate-in fade-in duration-100">
                  <div className="px-3.5 py-2 bg-[#f8f9fa] border-b border-[#dadce0] flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{isBn ? 'হোল্ড লিস্ট' : 'Held Carts'} ({posHoldCarts.length})</span>
                    <button type="button" onClick={() => setIsHoldListOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#f1f3f4]">
                    {posHoldCarts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-5">{isBn ? 'কোনো হোল্ড বিল নেই' : 'No held carts'}</p>
                    ) : posHoldCarts.map(hc => (
                      <div key={hc.id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#f8f9fa]">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{hc.customerName}</p>
                          <p className="text-[10px] text-slate-400">{hc.savedAt} · {hc.items.length} items</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => restoreHold(hc)}
                            className="px-2 py-0.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded text-[10px] font-medium transition">
                            Restore
                          </button>
                          <button type="button" onClick={() => { setPosHoldCarts(p => p.filter(h => h.id !== hc.id)); showToast('Deleted', 'info'); }}
                            className="p-1 text-[#d93025] hover:bg-[#fce8e6] rounded">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-6 h-6 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
            A
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN WORKSPACE CONTENT ══════════════ */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">

        {/* ════ LEFT PANEL — Google Invoice Desk ════ */}
        <div className="w-full lg:w-[54%] xl:w-[52%] flex flex-col bg-white rounded-lg border border-[#dadce0] shadow-xs overflow-hidden">

          {/* Controls Bar: Warehouse, Customer, SL & Item Search */}
          <div className="p-2.5 bg-[#f8f9fa] border-b border-[#dadce0] space-y-2 shrink-0">
            {/* Top Info Strip */}
            <div className="grid grid-cols-3 gap-2">
              {/* Warehouse */}
              <div className="flex items-center bg-white border border-[#dadce0] rounded-md h-8 px-2 focus-within:ring-1 focus-within:ring-[#1a73e8] focus-within:border-[#1a73e8]">
                <Building2 size={12} className="text-[#5f6368] mr-1.5 shrink-0" />
                <select value={posWarehouse} onChange={e => setPosWarehouse(e.target.value)}
                  className="w-full text-[11px] font-medium border-none bg-transparent focus:outline-none text-slate-800 cursor-pointer">
                  <option value="Soft Forest">Soft Forest</option>
                  <option value="Main Warehouse">{isBn ? 'প্রধান গুদাম' : 'Main Warehouse'}</option>
                  <option value="Rony Telecom">Rony Telecom</option>
                </select>
              </div>

              {/* SL Number */}
              <div className="flex items-center bg-white border border-[#dadce0] rounded-md h-8 px-2 focus-within:ring-1 focus-within:ring-[#1a73e8]">
                <Hash size={12} className="text-[#5f6368] mr-1 shrink-0" />
                <span className="text-[10px] font-bold text-slate-400 mr-1">SL</span>
                <input type="text" value={posSlSearch || '001'} onChange={e => setPosSlSearch(e.target.value)}
                  className="w-full text-[11px] font-bold border-none bg-transparent focus:outline-none text-slate-800 text-center font-mono" />
              </div>

              {/* Date */}
              <div className="flex items-center justify-center bg-white border border-[#dadce0] rounded-md h-8 px-2 text-[11px] font-medium text-slate-600">
                <Clock size={11} className="text-[#5f6368] mr-1.5 shrink-0" />
                <span>{dateStr}</span>
              </div>
            </div>

            {/* Customer & Quick Search Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Customer Selection */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="flex-1 flex items-center bg-white border border-[#dadce0] rounded-md h-8 px-2 focus-within:ring-1 focus-within:ring-[#1a73e8]">
                    <User size={12} className="text-[#5f6368] mr-1.5 shrink-0" />
                    <select value={posSelectedCustomerName} onChange={e => setPosSelectedCustomerName(e.target.value)}
                      className="w-full text-[11px] font-medium border-none bg-transparent focus:outline-none text-slate-800 cursor-pointer truncate">
                      <option value="Walk-in customer">{isBn ? 'সাধারণ গ্রাহক' : 'Walk-in customer'}</option>
                      {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => setIsAddCustomerOpen(true)} title="Add Customer"
                    className="h-8 w-8 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md flex items-center justify-center transition shrink-0">
                    <Plus size={14} />
                  </button>
                </div>
                {selectedCust && selectedCust.dueAmount > 0 && (
                  <p className="text-[10px] font-semibold text-[#d93025] pl-0.5">
                    {isBn ? 'পূর্ববর্তী বকেয়া:' : 'Previous Due:'} ৳{selectedCust.dueAmount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Quick Item Search & Barcode */}
              <div className="relative">
                <div className="flex items-center bg-white border border-[#dadce0] rounded-md h-8 px-2 focus-within:ring-1 focus-within:ring-[#1a73e8]">
                  <Search size={12} className="text-[#5f6368] mr-1.5 shrink-0" />
                  <input type="text" value={itemSearch}
                    placeholder={isBn ? 'পণ্য সার্চ/স্ক্যান...' : 'Item name/code...'}
                    onChange={e => setItemSearch(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { addFromSearch(); } if (e.key === 'Escape') { setItemSearch(''); setItemSuggestions([]); } }}
                    className="flex-1 text-[11px] font-medium border-none bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400" />
                  <button type="button" onClick={() => setIsScannerOpen(true)} title="Barcode Scanner"
                    className="p-1 text-[#188038] hover:bg-[#e6f4ea] rounded transition">
                    <Camera size={13} />
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {itemSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#dadce0] rounded-md shadow-lg z-30 overflow-hidden">
                    {itemSuggestions.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => { addToCart(p); setItemSearch(''); setItemSuggestions([]); }}
                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#f1f3f4] text-left border-b border-[#f1f3f4] last:border-0 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{p.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#1a73e8]">৳{p.sellingPrice.toLocaleString()}</span>
                          <span className={`ml-2 text-[9px] font-medium ${p.stock > 0 ? 'text-[#188038]' : 'text-[#d93025]'}`}>
                            {p.stock > 0 ? `Stock: ${p.stock}` : 'Out'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Workspace Cart Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#f8f9fa] border-b border-[#dadce0] text-[#5f6368] font-medium z-10 text-[11px]">
                <tr>
                  <th className="py-2 px-3">{isBn ? 'পণ্য' : 'Item'}</th>
                  <th className="py-2 px-1 text-center w-12">{isBn ? 'স্টক' : 'Stock'}</th>
                  <th className="py-2 px-1 text-center w-20">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="py-2 px-1 text-center w-20">{isBn ? 'মূল্য' : 'Price'}</th>
                  <th className="py-2 px-1 text-center w-16">{isBn ? 'ছাড়' : 'Disc'}</th>
                  <th className="py-2 px-1 text-center w-20">{isBn ? 'সাবটোটাল' : 'Subtotal'}</th>
                  <th className="py-2 px-1 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f3f4]">
                {posCart.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400 bg-white">
                      <div className="w-10 h-10 mx-auto rounded-full bg-[#f1f3f4] flex items-center justify-center mb-2">
                        <ShoppingCart size={18} className="text-[#5f6368]" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{isBn ? 'কার্ট খালি' : 'Cart is empty'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{isBn ? 'ডান পাশের তালিকা থেকে পণ্য বেছে নিন' : 'Click a product on the right to add to cart'}</p>
                    </td>
                  </tr>
                ) : posCart.map((item, idx) => {
                  const subtotal = Math.max(0, (item.customPrice - (item.discount || 0)) + (item.tax || 0)) * item.quantity;
                  const catStyle = getGoogleCategoryStyle(item.product.category);
                  return (
                    <tr key={`${item.product.id}-${idx}`} className="hover:bg-[#f8f9fa] transition-colors text-[11px]">
                      {/* Item Name & Custom edit */}
                      <td className="py-1.5 px-3">
                        {editingNameIdx === idx ? (
                          <div className="flex items-center gap-1">
                            <input autoFocus type="text" value={editingNameVal}
                              onChange={e => setEditingNameVal(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') { updateCartItem(idx, 'customName', editingNameVal); setEditingNameIdx(null); }
                                if (e.key === 'Escape') setEditingNameIdx(null);
                              }}
                              className="flex-1 px-1.5 py-0.5 text-[11px] border border-[#1a73e8] rounded focus:outline-none font-medium" />
                            <button type="button" onClick={() => { updateCartItem(idx, 'customName', editingNameVal); setEditingNameIdx(null); }}
                              className="p-0.5 text-[#188038] hover:bg-[#e6f4ea] rounded"><Check size={12} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <div className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center shrink-0"
                              style={{ backgroundColor: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>
                              {getProductInitials(item.product.name)}
                            </div>
                            <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={item.customName || item.product.name}>
                              {item.customName || item.product.name}
                            </span>
                            <button type="button" onClick={() => { setEditingNameIdx(idx); setEditingNameVal(item.customName || item.product.name); }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-0.5">
                              <Edit2 size={10} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-1.5 px-1 text-center font-medium text-slate-500">
                        {item.product.stock}
                      </td>

                      {/* Quantity Selector */}
                      <td className="py-1.5 px-1 text-center">
                        <div className="inline-flex items-center border border-[#dadce0] rounded bg-white h-6 overflow-hidden">
                          <button type="button" onClick={() => { if (item.quantity > 1) updateCartItem(idx, 'quantity', item.quantity - 1); }}
                            className="w-5 h-full flex items-center justify-center text-slate-500 hover:bg-[#f1f3f4] font-bold transition text-xs border-r border-[#dadce0]">
                            −
                          </button>
                          <input type="number" min="1" max={item.product.stock} value={item.quantity}
                            onChange={e => {
                              const val = Math.min(item.product.stock, Math.max(1, parseInt(e.target.value) || 1));
                              updateCartItem(idx, 'quantity', val);
                            }}
                            className="w-8 text-center font-bold text-[10px] border-none focus:outline-none text-slate-800 bg-transparent" />
                          <button type="button" onClick={() => {
                            if (item.quantity < item.product.stock) updateCartItem(idx, 'quantity', item.quantity + 1);
                            else showToast(isBn ? 'স্টক সীমা অতিক্রম!' : 'Stock limit reached!', 'error');
                          }}
                            className="w-5 h-full flex items-center justify-center text-[#1a73e8] hover:bg-[#e8f0fe] font-bold transition text-xs border-l border-[#dadce0]">
                            +
                          </button>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-1.5 px-1 text-center">
                        <input type="number" step="0.01" value={item.customPrice === 0 ? '' : item.customPrice}
                          onChange={e => updateCartItem(idx, 'customPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 h-6 text-center text-[10px] font-bold bg-white text-slate-800 border border-[#dadce0] rounded focus:outline-none focus:border-[#1a73e8]" />
                      </td>

                      {/* Discount */}
                      <td className="py-1.5 px-1 text-center">
                        <input type="number" step="0.01" min="0" value={item.discount === 0 ? '' : item.discount}
                          onChange={e => updateCartItem(idx, 'discount', Math.min(parseFloat(e.target.value) || 0, item.customPrice))}
                          className="w-14 h-6 text-center text-[10px] font-bold bg-white text-slate-800 border border-[#dadce0] rounded focus:outline-none focus:border-[#d93025]" />
                      </td>

                      {/* Subtotal */}
                      <td className="py-1.5 px-1 text-center font-bold text-slate-800">
                        ৳{subtotal.toFixed(2)}
                      </td>

                      {/* Delete */}
                      <td className="py-1.5 px-1 text-center">
                        <button type="button" onClick={() => removeCartItem(idx)}
                          className="p-1 text-slate-400 hover:text-[#d93025] rounded transition">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charges Strip */}
          {posCart.length > 0 && (
            <div className="bg-[#f8f9fa] border-t border-[#dadce0] px-3 py-1.5 shrink-0 flex items-center gap-3 text-[11px]">
              <label className="flex items-center gap-1 font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={laborEnabled} onChange={e => setLaborEnabled(e.target.checked)} className="rounded border-slate-300 text-[#1a73e8] w-3 h-3" />
                {isBn ? 'মজুরি' : 'Labor'}
                {laborEnabled && (
                  <input type="number" value={laborAmt} onChange={e => setLaborAmt(e.target.value)} placeholder="0.00"
                    className="w-16 h-5 px-1 text-[10px] font-bold border border-[#dadce0] rounded text-right bg-white" />
                )}
              </label>

              <label className="flex items-center gap-1 font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={otherEnabled} onChange={e => setOtherEnabled(e.target.checked)} className="rounded border-slate-300 text-[#1a73e8] w-3 h-3" />
                {isBn ? 'অন্যান্য' : 'Other'}
                {otherEnabled && (
                  <input type="number" value={otherAmt} onChange={e => setOtherAmt(e.target.value)} placeholder="0.00"
                    className="w-16 h-5 px-1 text-[10px] font-bold border border-[#dadce0] rounded text-right bg-white" />
                )}
              </label>

              <button type="button" onClick={() => { setTempDiscountVal(discountInput); setTempDiscountType(discountType); setIsDiscountModalOpen(true); }}
                className="flex items-center gap-1 font-medium text-[#1a73e8] hover:underline">
                <Tag size={10} />
                {isBn ? 'ছাড়' : 'Discount'}
                {discountInput && parseFloat(discountInput) > 0 && (
                  <span className="bg-[#e8f0fe] text-[#1a73e8] px-1 rounded text-[9px] font-bold">
                    {discountType === 'Percent' ? discountInput + '%' : '৳' + discountInput}
                  </span>
                )}
              </button>

              <label className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                <input type="checkbox" checked={sendMessageToCustomer} onChange={e => setSendMessageToCustomer(e.target.checked)} className="rounded border-slate-300 text-[#1a73e8] w-3 h-3" />
                <MessageSquare size={10} /> SMS
              </label>
            </div>
          )}

          {/* Google Dashboard Totals Strip */}
          <div className="bg-[#202124] text-white shrink-0 px-3 py-2 grid grid-cols-4 divide-x divide-[#3c4043] text-center">
            <div>
              <p className="text-[9px] font-medium text-[#9aa0a6] uppercase">{isBn ? 'পরিমাণ' : 'Items'}</p>
              <p className="text-xs font-bold text-white mt-0.5">{totals.qty}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#9aa0a6] uppercase">{isBn ? 'মোট' : 'Subtotal'}</p>
              <p className="text-xs font-bold text-[#8ab4f8] mt-0.5">৳{totals.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-[#9aa0a6] uppercase">{isBn ? 'ছাড়' : 'Disc.'}</p>
              <p className="text-xs font-bold text-[#f28b82] mt-0.5">৳{(totals.itemDisc + totals.invoiceDisc).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#81c995] uppercase">{isBn ? 'গ্র্যান্ড টোটাল' : 'Grand Total'}</p>
              <p className="text-sm font-black text-[#81c995] mt-0.5">৳{totals.grand.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Action Payment Bar */}
          <div className="p-2 bg-white border-t border-[#dadce0] shrink-0 space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <button type="button" onClick={holdCart}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-[#fef7e0] hover:bg-[#feefc3] text-[#b06000] rounded-md transition text-xs font-bold border border-[#fde293]">
                <PauseCircle size={15} />
                {isBn ? 'হোল্ড (F4)' : 'Hold (F4)'}
              </button>

              <button type="button" onClick={() => { if (!posCart.length) return; setCashInput(totals.grand.toFixed(2)); setPayModal('cash'); }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-[#188038] hover:bg-[#137333] text-white rounded-md transition text-xs font-bold shadow-xs">
                <Banknote size={15} />
                {isBn ? 'ক্যাশ (F1)' : 'Cash (F1)'}
              </button>

              <button type="button" onClick={() => { if (!posCart.length) return; setMultiSplits([{ method: 'Cash', amount: '' }, { method: 'bKash', amount: '' }]); setPayModal('multi'); }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-[#9334e6] hover:bg-[#7e22ce] text-white rounded-md transition text-xs font-bold shadow-xs">
                <List size={15} />
                {isBn ? 'স্প্লিট / মিক্স (F3)' : 'Split / Mix (F3)'}
              </button>
            </div>

            <button type="button" onClick={() => { if (!posCart.length) return; setDueInput('0'); setPayModal('due'); }}
              className="w-full py-1.5 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#d93025] rounded-md transition text-[11px] font-bold border border-[#fad2cf] flex items-center justify-center gap-1.5">
              <AlertCircle size={13} />
              {isBn ? 'বকেয়া সেল (Due Sale)' : 'Due / Credit Sale'}
            </button>
          </div>
        </div>

        {/* ════ RIGHT PANEL — Google Catalog Shelf ════ */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-[#dadce0] shadow-xs overflow-hidden">

          {/* Header & Filter Controls */}
          <div className="p-2.5 bg-[#f8f9fa] border-b border-[#dadce0] space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5f6368]" />
                <input type="text" placeholder={isBn ? 'ক্যাটালগ ফিল্টার করুন...' : 'Filter catalog items...'}
                  value={posSearch} onChange={e => setPosSearch(e.target.value)}
                  className="w-full pl-7 pr-3 h-8 text-xs font-medium border border-[#dadce0] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1a73e8] focus:border-[#1a73e8]" />
              </div>
              <button type="button" onClick={() => setPosSearch('')} title="Reset Search"
                className="h-8 px-2.5 border border-[#dadce0] rounded-md text-xs font-medium text-slate-600 hover:bg-[#f1f3f4]">↺</button>
              <button type="button" onClick={() => setIsGridView(!isGridView)} title="Toggle Grid/List View"
                className="h-8 w-8 border border-[#dadce0] rounded-md flex items-center justify-center text-slate-600 hover:bg-[#f1f3f4]">
                {isGridView ? <List size={14} /> : <LayoutGrid size={14} />}
              </button>
            </div>

            {/* Category Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
              <button type="button" onClick={() => setPosCategory('ALL')}
                className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                  posCategory === 'ALL' ? 'bg-[#1a73e8] text-white' : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                }`}>
                {isBn ? 'সব' : 'All'} ({products.length})
              </button>
              {categories.map(cat => {
                const style = getGoogleCategoryStyle(cat);
                const isActive = posCategory === cat;
                return (
                  <button key={cat} type="button" onClick={() => setPosCategory(cat)}
                    className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                      isActive ? 'bg-[#1a73e8] text-white' : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                    }`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Shelf Container */}
          <div className="flex-1 overflow-y-auto p-2.5">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Package size={36} className="mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">{isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products match filter'}</p>
              </div>
            ) : isGridView ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredProducts.map(p => {
                  const inCart = (posCart || []).find(c => c.product && c.product.id === p.id);
                  const isOut = p.stock <= 0;
                  const style = getGoogleCategoryStyle(p.category);

                  return (
                    <div key={p.id} onClick={() => addToCart(p)}
                      className={`relative rounded-md border p-2 cursor-pointer transition-all duration-150 active:scale-95 flex flex-col justify-between ${
                        isOut ? 'bg-[#f1f3f4] border-[#dadce0] opacity-50 cursor-not-allowed'
                        : inCart ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-xs'
                        : 'bg-white border-[#dadce0] hover:border-[#1a73e8] hover:shadow-xs'
                      }`}>

                      {/* Stock Badge */}
                      <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded text-[8px] font-bold ${
                        isOut ? 'bg-[#d93025] text-white' : p.stock <= 5 ? 'bg-[#f9ab00] text-white' : 'bg-[#188038] text-white'
                      }`}>
                        {isOut ? 'OUT' : `Qty: ${p.stock}`}
                      </span>

                      {/* In-cart badge */}
                      {inCart && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1a73e8] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                          {inCart.quantity}
                        </span>
                      )}

                      {/* Icon Avatar */}
                      <div className="w-10 h-10 mx-auto rounded-md flex items-center justify-center mt-3"
                        style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                        <span className="font-bold text-xs">{getProductInitials(p.name)}</span>
                      </div>

                      {/* Info */}
                      <div className="text-center mt-2">
                        <p className="text-[10px] font-bold text-slate-800 truncate" title={p.name}>{p.name}</p>
                        <p className="text-xs font-black text-[#1a73e8] mt-0.5">৳{p.sellingPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-1">
                {filteredProducts.map(p => {
                  const inCart = (posCart || []).find(c => c.product && c.product.id === p.id);
                  const isOut = p.stock <= 0;
                  const style = getGoogleCategoryStyle(p.category);
                  return (
                    <div key={p.id} onClick={() => addToCart(p)}
                      className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition ${
                        isOut ? 'bg-[#f1f3f4] border-[#dadce0] opacity-50'
                        : inCart ? 'bg-[#e8f0fe] border-[#1a73e8]'
                        : 'bg-white border-[#dadce0] hover:border-[#1a73e8]'
                      }`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                          {getProductInitials(p.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-[9px] text-slate-400">{p.category} · {p.id}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#1a73e8]">৳{p.sellingPrice.toLocaleString()}</p>
                          <p className={`text-[9px] ${isOut ? 'text-[#d93025]' : 'text-[#188038]'}`}>Stock: {p.stock}</p>
                        </div>
                        {inCart && (
                          <span className="w-5 h-5 bg-[#1a73e8] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}

      {/* CASH PAYMENT MODAL */}
      {payModal === 'cash' && (() => {
        const cashGiven = parseFloat(cashInput) || 0;
        const change = Math.max(0, cashGiven - totals.grand);
        const due = Math.max(0, totals.grand - cashGiven);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in duration-150">
              <div className="bg-[#188038] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5"><Banknote size={16} /> {isBn ? 'ক্যাশ পেমেন্ট' : 'Cash Payment'}</span>
                <button type="button" onClick={() => setPayModal(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-[#e6f4ea] border border-[#a8dab5] rounded-md p-3 text-center">
                  <p className="text-[10px] font-bold text-[#137333] uppercase">{isBn ? 'গ্র্যান্ড টোটাল' : 'Grand Total'}</p>
                  <p className="text-2xl font-black text-[#137333] mt-0.5">৳{totals.grand.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'গ্রাহকের নগদ (TK)' : 'Cash Received (TK)'}</label>
                  <input autoFocus type="number" step="0.01" min="0" value={cashInput}
                    onChange={e => setCashInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { doCheckout('Cash', cashGiven, change, [{ method: 'Cash', amount: cashGiven }]); } }}
                    className="w-full h-10 px-3 text-lg font-black text-right border-2 border-[#188038] rounded-md focus:outline-none" />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button type="button" onClick={() => setCashInput(totals.grand.toFixed(2))} className="py-1 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] text-[10px] font-bold rounded border border-[#a8dab5]">{isBn ? 'সঠিক' : 'Exact'}</button>
                  {[500, 1000, 2000].map(a => (
                    <button key={a} type="button" onClick={() => setCashInput(a.toString())} className="py-1 bg-[#f1f3f4] hover:bg-[#e8eaed] text-slate-800 text-[10px] font-bold rounded border border-[#dadce0]">৳{a}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#fef7e0] border border-[#fde293] p-2 rounded">
                    <p className="text-[9px] font-bold text-[#b06000]">{isBn ? 'ফেরত' : 'Change'}</p>
                    <p className="font-black text-[#b06000] text-sm mt-0.5">৳{change.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#fce8e6] border border-[#fad2cf] p-2 rounded">
                    <p className="text-[9px] font-bold text-[#c5221f]">{isBn ? 'বকেয়া' : 'Remaining Due'}</p>
                    <p className={`font-black text-sm mt-0.5 ${due > 0 ? 'text-[#c5221f]' : 'text-slate-400'}`}>৳{due.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button type="button" onClick={() => setPayModal(null)} className="flex-1 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-slate-700 rounded-md text-xs font-bold">{isBn ? 'বাতিল' : 'Cancel'}</button>
                <button type="button" onClick={() => doCheckout('Cash', cashGiven, change, [{ method: 'Cash', amount: cashGiven }])}
                  className="flex-1 py-2 bg-[#188038] hover:bg-[#137333] text-white rounded-md text-xs font-bold shadow-xs">
                  ✓ {isBn ? 'নিশ্চিত করুন' : 'Confirm Sale'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DIGITAL PAYMENT MODAL */}
      {payModal === 'digital' && (() => {
        const paid = parseFloat(digitalInput) || 0;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-xl overflow-hidden">
              <div className="bg-[#1a73e8] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5"><Smartphone size={16} /> {digitalMethod} Payment</span>
                <button type="button" onClick={() => setPayModal(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'পেমেন্ট পদ্ধতি' : 'Method'}</label>
                  <select value={digitalMethod} onChange={e => setDigitalMethod(e.target.value)} className="w-full h-9 px-2 text-xs font-bold border border-[#dadce0] rounded-md bg-white">
                    {['bKash', 'Nagad', 'Rocket', 'Card', 'Bank Transfer'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="bg-[#e8f0fe] rounded-md p-3 text-center border border-[#aecbfa]">
                  <p className="text-[10px] font-bold text-[#1a73e8] uppercase">{isBn ? 'গ্র্যান্ড টোটাল' : 'Grand Total'}</p>
                  <p className="text-xl font-black text-[#1a73e8] mt-0.5">৳{totals.grand.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'পেমেন্টের পরিমাণ' : 'Amount Paid'}</label>
                  <input autoFocus type="number" step="0.01" value={digitalInput} onChange={e => setDigitalInput(e.target.value)}
                    className="w-full h-10 px-3 text-lg font-black text-right border-2 border-[#1a73e8] rounded-md focus:outline-none" />
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button type="button" onClick={() => setPayModal(null)} className="flex-1 py-2 bg-[#f1f3f4] text-slate-700 rounded-md text-xs font-bold">{isBn ? 'বাতিল' : 'Cancel'}</button>
                <button type="button" onClick={() => doCheckout(digitalMethod, paid, 0, [{ method: digitalMethod, amount: paid }])}
                  className="flex-1 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-bold shadow-xs">
                  ✓ {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DUE PAYMENT MODAL */}
      {payModal === 'due' && (() => {
        const partialPaid = parseFloat(dueInput) || 0;
        const dueLeft = Math.max(0, totals.grand - partialPaid);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-xl overflow-hidden">
              <div className="bg-[#d93025] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5"><AlertCircle size={16} /> {isBn ? 'বকেয়া সেল' : 'Due / Credit Sale'}</span>
                <button type="button" onClick={() => setPayModal(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-md p-3 text-center">
                  <p className="text-[10px] font-bold text-[#c5221f] uppercase">{isBn ? 'মোট পরিশোধযোগ্য' : 'Total Payable'}</p>
                  <p className="text-2xl font-black text-[#c5221f] mt-0.5">৳{totals.grand.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'আংশিক জমা' : 'Partial Payment'}</label>
                  <input type="number" step="0.01" min="0" max={totals.grand} value={dueInput} onChange={e => setDueInput(e.target.value)}
                    className="w-full h-10 px-3 text-lg font-black text-right border-2 border-[#d93025] rounded-md focus:outline-none" />
                </div>
                <div className="bg-[#fef7e0] rounded-md p-2 text-center border border-[#fde293]">
                  <p className="text-[10px] font-bold text-[#b06000]">{isBn ? 'বকেয়া থাকবে' : 'Remaining Due'}</p>
                  <p className="text-lg font-black text-[#b06000]">৳{dueLeft.toFixed(2)}</p>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button type="button" onClick={() => setPayModal(null)} className="flex-1 py-2 bg-[#f1f3f4] text-slate-700 rounded-md text-xs font-bold">{isBn ? 'বাতিল' : 'Cancel'}</button>
                <button type="button" onClick={() => doCheckout(`Due (Paid: ${partialPaid.toFixed(2)})`, partialPaid, 0, [{ method: 'Due', amount: dueLeft }, ...(partialPaid > 0 ? [{ method: 'Cash', amount: partialPaid }] : [])])}
                  className="flex-1 py-2 bg-[#d93025] text-white rounded-md text-xs font-bold shadow-xs">
                  ✓ {isBn ? 'কনফার্ম করুন' : 'Confirm Due'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MULTI SPLIT MODAL */}
      {payModal === 'multi' && (() => {
        const paid = multiSplits.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
        const due = Math.max(0, totals.grand - paid);
        const change = Math.max(0, paid - totals.grand);
        const methods = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Card', 'Bank Transfer', 'Due'];
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
              <div className="bg-[#9334e6] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5"><List size={16} /> Split Payment</span>
                <button type="button" onClick={() => setPayModal(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 bg-[#f8f9fa] border border-[#dadce0] rounded-md p-2 text-center text-xs">
                  <div><p className="text-[9px] font-bold text-slate-500 uppercase">Total</p><p className="font-black text-[#1a73e8]">৳{totals.grand.toFixed(2)}</p></div>
                  <div><p className="text-[9px] font-bold text-slate-500 uppercase">Paid</p><p className="font-black text-[#188038]">৳{paid.toFixed(2)}</p></div>
                  <div><p className="text-[9px] font-bold text-slate-500 uppercase">{due > 0 ? 'Due' : 'Change'}</p><p className={`font-black ${due > 0 ? 'text-[#d93025]' : 'text-[#b06000]'}`}>৳{(due > 0 ? due : change).toFixed(2)}</p></div>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {multiSplits.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <select value={row.method} onChange={e => { const u = [...multiSplits]; u[idx] = { ...u[idx], method: e.target.value }; setMultiSplits(u); }}
                        className="w-32 h-8 px-2 text-xs font-bold border border-[#dadce0] rounded-md bg-white">
                        {methods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <input type="number" step="0.01" value={row.amount} placeholder="0.00"
                        onChange={e => { const u = [...multiSplits]; u[idx] = { ...u[idx], amount: e.target.value }; setMultiSplits(u); }}
                        className="flex-1 h-8 px-2 text-xs font-black text-right border border-[#dadce0] rounded-md focus:outline-none" />
                      <button type="button" onClick={() => setMultiSplits(prev => prev.filter((_, i) => i !== idx))}
                        className="w-8 h-8 flex items-center justify-center text-[#d93025] hover:bg-[#fce8e6] rounded-md border border-[#fad2cf]"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setMultiSplits(p => [...p, { method: 'Cash', amount: '' }])}
                  className="w-full py-1 border border-dashed border-[#9334e6] text-[#9334e6] text-xs font-bold rounded-md">+ Add row</button>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button type="button" onClick={() => setPayModal(null)} className="flex-1 py-2 bg-[#f1f3f4] text-slate-700 rounded-md text-xs font-bold">{isBn ? 'বাতিল' : 'Cancel'}</button>
                <button type="button" onClick={() => {
                  const splits = multiSplits.map(r => ({ method: r.method, amount: parseFloat(r.amount) || 0 })).filter(r => r.amount > 0);
                  if (!splits.length) { showToast('Enter payment amount', 'error'); return; }
                  doCheckout(splits.map(s => `${s.method}:${s.amount}`).join(' + '), paid, change, splits);
                }} className="flex-1 py-2 bg-[#9334e6] text-white rounded-md text-xs font-bold shadow-xs">✓ Confirm</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DISCOUNT MODAL */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#dadce0] flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><Tag size={15} className="text-[#1a73e8]" /> {isBn ? 'ছাড়' : 'Discount'}</span>
              <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{isBn ? 'পরিমাণ' : 'Amount'}</label>
                <input type="number" step="0.01" autoFocus value={tempDiscountVal} onChange={e => setTempDiscountVal(e.target.value)}
                  className="w-full h-9 px-2 text-xs font-bold border border-[#dadce0] rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{isBn ? 'ধরন' : 'Type'}</label>
                <select value={tempDiscountType} onChange={e => setTempDiscountType(e.target.value as any)} className="w-full h-9 px-2 text-xs font-bold border border-[#dadce0] rounded-md bg-white">
                  <option value="Fixed">৳ Fixed</option>
                  <option value="Percent">% Percent</option>
                </select>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button type="button" onClick={() => { setDiscountInput(''); setIsDiscountModalOpen(false); }} className="flex-1 py-1.5 bg-[#f1f3f4] text-slate-700 rounded-md text-xs font-bold">{isBn ? 'বাতিল' : 'Remove'}</button>
              <button type="button" onClick={() => { setDiscountInput(tempDiscountVal); setDiscountType(tempDiscountType); setIsDiscountModalOpen(false); }}
                className="flex-1 py-1.5 bg-[#1a73e8] text-white rounded-md text-xs font-bold shadow-xs">{isBn ? 'প্রয়োগ' : 'Apply'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ THERMAL RECEIPT MODAL ══════════════ */}
      {receipt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden !important; } #pos-receipt, #pos-receipt * { visibility: visible !important; } #pos-receipt { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; } .no-print { display: none !important; } }` }} />

          <div className="bg-white rounded-xl w-full max-w-[340px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-4">
            <div className="bg-[#202124] text-white px-4 py-3 flex justify-between items-center no-print shrink-0">
              <span className="text-xs font-bold flex items-center gap-1.5"><span className="w-2 h-2 bg-[#81c995] rounded-full animate-pulse" /> Sale Complete</span>
              <button type="button" onClick={() => setReceipt(null)} className="text-white/70 hover:text-white"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4" id="pos-receipt">
              <div className="max-w-[280px] mx-auto space-y-2.5 text-[11px] text-black font-sans">
                <div className="text-center space-y-0.5">
                  <h1 className="font-black text-base tracking-wider uppercase">RONY TELECOM</h1>
                  <p className="text-[10px] text-slate-600">কামাল পাশা মোড়, Azad Nagar, রামগতি, লক্ষ্মীপুর</p>
                  <p className="text-[10px] text-slate-600">Tel: 01718389900</p>
                </div>

                <div className="border-t border-dashed border-black my-1.5" />
                <div className="text-center font-bold text-xs uppercase tracking-widest">SALES INVOICE</div>
                <div className="border-t border-dashed border-black my-1.5" />

                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-slate-500">Invoice #</span><span className="font-semibold">{receipt.invoiceNum}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date/Time</span><span className="font-semibold">{receipt.date} {receipt.time}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-semibold">{receipt.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold">{receipt.paymentMethod}</span></div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-1.5" />

                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-dashed border-slate-400">
                      <th className="py-1 text-left font-semibold">Item</th>
                      <th className="py-1 text-center font-semibold">Qty</th>
                      <th className="py-1 text-right font-semibold">Rate</th>
                      <th className="py-1 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item: any, i: number) => {
                      const disc = (item.discount || 0) * item.quantity;
                      const total = item.customPrice * item.quantity - disc;
                      return (
                        <tr key={i} className="border-b border-dotted border-slate-200">
                          <td className="py-1 pr-1">{item.customName || item.product?.name}</td>
                          <td className="py-1 text-center">{item.quantity}</td>
                          <td className="py-1 text-right">{item.customPrice.toFixed(2)}</td>
                          <td className="py-1 text-right font-semibold">{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-black pt-1" />

                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between font-bold text-xs">
                    <span>GRAND TOTAL</span>
                    <span>৳{receipt.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">Paid Amount</span><span>৳{receipt.paidAmount.toFixed(2)}</span></div>
                  {receipt.changeReturned > 0 && <div className="flex justify-between"><span className="text-slate-500">Change Returned</span><span>৳{receipt.changeReturned.toFixed(2)}</span></div>}
                  {receipt.dueAmount > 0 && <div className="flex justify-between font-bold text-[#d93025]"><span>Due Remaining</span><span>৳{receipt.dueAmount.toFixed(2)}</span></div>}
                </div>

                <div className="border-t border-dashed border-black my-2 text-center space-y-0.5 pt-1">
                  <p className="font-semibold text-[10px]">Thank You for Shopping!</p>
                  <p className="text-[9px] text-slate-500 font-mono">{receipt.date} | {receipt.time}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#f8f9fa] border-t border-[#dadce0] flex gap-2 shrink-0 no-print">
              <button type="button" onClick={() => window.print()} className="flex-1 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-md flex items-center justify-center gap-1">
                <Printer size={13} /> {isBn ? 'প্রিন্ট' : 'Print Receipt'}
              </button>
              <button type="button" onClick={() => setReceipt(null)} className="px-4 py-2 bg-[#f1f3f4] text-slate-700 font-bold text-xs rounded-md">
                {isBn ? 'বন্ধ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ KEYBOARD SHORTCUTS GUIDE MODAL ══════════════ */}
      {isShortcutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#dadce0] animate-in fade-in duration-150 text-left">
            <div className="bg-[#202124] text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2 text-[#8ab4f8]">
                ⚡ {isBn ? 'কি-বোর্ড শর্টকাট গাইড (POS Hotkeys)' : 'POS Keyboard Shortcuts Guide'}
              </span>
              <button type="button" onClick={() => setIsShortcutModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-3 text-left">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="p-3 bg-[#e8f0fe] text-[#1a73e8] rounded-xl border border-[#aecbfa] flex items-center justify-between">
                  <span>{isBn ? 'ক্যাশ ক্যাশিয়ার পেমেন্ট' : 'Cash Payment'}</span>
                  <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-slate-800 shadow-2xs">F1</span>
                </div>
                <div className="p-3 bg-[#fce8e6] text-[#d93025] rounded-xl border border-[#fad2cf] flex items-center justify-between">
                  <span>{isBn ? 'ডিজিটাল (bKash/Nagad)' : 'Digital Pay'}</span>
                  <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-slate-800 shadow-2xs">F2</span>
                </div>
                <div className="p-3 bg-[#f3e8fd] text-[#9334e6] rounded-xl border border-[#d7aefb] flex items-center justify-between">
                  <span>{isBn ? 'স্প্লিট / মিক্সড পেমেন্ট' : 'Split/Mix Pay'}</span>
                  <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-slate-800 shadow-2xs">F3</span>
                </div>
                <div className="p-3 bg-[#feefc3] text-[#b06000] rounded-xl border border-[#fde293] flex items-center justify-between">
                  <span>{isBn ? 'বিল হোল্ড করুন' : 'Hold Bill'}</span>
                  <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-slate-800 shadow-2xs">F4</span>
                </div>
                <div className="p-3 bg-[#f1f3f4] text-[#3c4043] rounded-xl border border-[#dadce0] flex items-center justify-between col-span-2">
                  <span>{isBn ? 'পেমেন্ট উইন্ডো বন্ধ করুন' : 'Cancel Modal'}</span>
                  <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-slate-800 shadow-2xs">ESC</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4">
              <button type="button" onClick={() => setIsShortcutModalOpen(false)}
                className="w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">
                {isBn ? 'ঠিক আছে' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
        lang={lang}
      />

      <style>{`.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
};