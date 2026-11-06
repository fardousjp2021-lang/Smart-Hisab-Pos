// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  DollarSign, 
  BookOpen, 
  Clock, 
  Activity, 
  Trash2, 
  Eye, 
  CreditCard,
  Copy,
  ChevronDown,
  UserPlus,
  ShoppingBag,
  Info,
  Edit3,
  Printer,
  Bell,
  History as HistoryIcon,
  MessageSquare,
  FileText,
  X as XIcon,
  Filter
} from 'lucide-react';


interface InstallmentHistory {
  date: string;
  amount: number;
  collectedBy: string;
  note?: string;
  timestamp?: string;
  penaltyApplied?: number;
  receiptId?: string;
  action?: 'created' | 'collected' | 'edited' | 'deleted' | 'reminder';
  meta?: Record<string, any>;
}

interface Installment {
  id: string;
  customerName: string;
  phone: string;
  productName: string;
  productId?: string;
  totalAmount: number;
  downPayment: number;
  paidAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  frequency: string;
  startDate: string;
  nextDueDate: string;
  status: string; // 'Active' | 'Completed' | 'Overdue'
  history: InstallmentHistory[];
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchase: number;
  dueAmount: number;
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  stock: number;
  brand?: string;
}

interface InstallmentsProps {
  installments: Installment[];
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>;
  lang: 'en' | 'bn';
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export function Installments({ 
  installments, 
  setInstallments, 
  lang, 
  showToast, 
  products, 
  setProducts,
  customers, 
  setCustomers 
}: InstallmentsProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeRowActionMenuId, setActiveRowActionMenuId] = useState<string | null>(null);

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Customer selection mode: 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Product selection mode: 'inventory' | 'custom'
  const [productMode, setProductMode] = useState<'inventory' | 'custom'>('inventory');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Add Form states (either custom or selection-derived)
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newTotalAmount, setNewTotalAmount] = useState<number>(0); // Base price per unit (before markup)
  const [newDownPayment, setNewDownPayment] = useState<number>(0);
  const [newTotalInstallments, setNewTotalInstallments] = useState<number>(6);
  const [newFrequency, setNewFrequency] = useState('Monthly');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newExtraProfit, setNewExtraProfit] = useState<number>(0);
  const [newExtraProfitType, setNewExtraProfitType] = useState<'flat' | 'percent'>('flat');

  // Collection State
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectNote, setCollectNote] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [activeSms, setActiveSms] = useState<{ phone: string; message: string } | null>(null);

  // Search terms inside the form selectors for clean UX
  const [customerFormSearch, setCustomerFormSearch] = useState('');
  const [productFormSearch, setProductFormSearch] = useState('');

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: string;
    totalAmount: number;
    downPayment: number;
    totalInstallments: number;
    frequency: string;
    nextDueDate: string;
    notes: string;
  } | null>(null);

  // Sort + date range
  const [sortBy, setSortBy] = useState<'nextDueDate' | 'customer' | 'remaining' | 'id'>('nextDueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');

  // Print preview modal
  const [printPreview, setPrintPreview] = useState<{ title: string; html: string } | null>(null);

  // SMS template customization (persisted)
  const DEFAULT_SMS_TEMPLATE_BN = 'রনি টেলিকম: প্রিয় {customerName}, আপনার {product}-এর কিস্তি ৳{emi} পরিশোধের তারিখ {dueDate}। অবশিষ্ট বকেয়া ৳{remaining}। দ্রুত পরিশোধ করার অনুরোধ।';
  const DEFAULT_SMS_TEMPLATE_EN = 'Rony Telecom: Dear {customerName}, your EMI of BDT {emi} for {product} is due on {dueDate}. Remaining BDT {remaining}. Please pay promptly.';
  const [smsTemplateBn, setSmsTemplateBn] = useState<string>(() => {
    try { return localStorage.getItem('inst_sms_tpl_bn') || DEFAULT_SMS_TEMPLATE_BN; } catch { return DEFAULT_SMS_TEMPLATE_BN; }
  });
  const [smsTemplateEn, setSmsTemplateEn] = useState<string>(() => {
    try { return localStorage.getItem('inst_sms_tpl_en') || DEFAULT_SMS_TEMPLATE_EN; } catch { return DEFAULT_SMS_TEMPLATE_EN; }
  });
  const [isSmsSettingsOpen, setIsSmsSettingsOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem('inst_sms_tpl_bn', smsTemplateBn); } catch {} }, [smsTemplateBn]);
  useEffect(() => { try { localStorage.setItem('inst_sms_tpl_en', smsTemplateEn); } catch {} }, [smsTemplateEn]);



  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Base × Qty and computed profit / final total for the add form
  const baseSubtotal = useMemo(() => Math.max(0, newTotalAmount) * Math.max(1, newQuantity || 1), [newTotalAmount, newQuantity]);
  const computedProfit = useMemo(() => {
    if (!newExtraProfit || newExtraProfit <= 0) return 0;
    return newExtraProfitType === 'percent'
      ? Math.round(baseSubtotal * (newExtraProfit / 100))
      : Math.round(newExtraProfit);
  }, [baseSubtotal, newExtraProfit, newExtraProfitType]);
  const finalTotalWithProfit = useMemo(() => baseSubtotal + computedProfit, [baseSubtotal, computedProfit]);


  // Translations
  const t = {
    title: lang === 'bn' ? 'কিস্তি ব্যবস্থাপনা ড্যাশবোর্ড' : 'Installment Ledger & Tracking Panel',
    subtitle: lang === 'bn' ? 'গ্রাহকদের কিস্তির হিসাব এবং কিস্তি সংগ্রহের ডিজিটাল রেজিস্টার' : 'Digital manager to track customer EMIs, installments, and collections',
    searchPlaceholder: lang === 'bn' ? 'গ্রাহকের নাম, মোবাইল বা প্রোডাক্ট খুঁজুন...' : 'Search customer name, phone, or product...',
    addBtn: lang === 'bn' ? 'নতুন কিস্তি অ্যাকাউন্ট' : 'New Installment Account',
    filterAll: lang === 'bn' ? 'সকল কিস্তি' : 'All Accounts',
    filterActive: lang === 'bn' ? 'চলতি' : 'Active',
    filterOverdue: lang === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Overdue',
    filterCompleted: lang === 'bn' ? 'পরিশোধিত' : 'Completed',
    
    // KPI Cards
    kpiTotalActive: lang === 'bn' ? 'সক্রিয় কিস্তি হিসাব' : 'Active Installments',
    kpiTotalDue: lang === 'bn' ? 'মোট বকেয়া কিস্তি' : 'Total Remaining Balance',
    kpiCollected: lang === 'bn' ? 'মোট আদায়কৃত টাকা' : 'Total Collected Amount',
    kpiOverdueAccounts: lang === 'bn' ? 'মেয়াদোত্তীর্ণ অ্যাকাউন্ট' : 'Overdue Accounts',
    
    // Table Headers
    thCustomer: lang === 'bn' ? 'গ্রাহক ও মোবাইল ⇅' : 'Customer & Phone ⇅',
    thProduct: lang === 'bn' ? 'পণ্য ও মোট মূল্য ⇅' : 'Product & Total Price ⇅',
    thDownPayment: lang === 'bn' ? 'ডাউন পেমেন্ট ⇅' : 'Down Payment ⇅',
    thPaidAmt: lang === 'bn' ? 'আদায়কৃত টাকা ⇅' : 'Collected Amount ⇅',
    thRemaining: lang === 'bn' ? 'অবশিষ্ট বকেয়া ⇅' : 'Remaining Due ⇅',
    thInstallments: lang === 'bn' ? 'কিস্তির সংখ্যা ⇅' : 'Installments ⇅',
    thNextDue: lang === 'bn' ? 'পরবর্তী কিস্তির তারিখ ⇅' : 'Next Due Date ⇅',
    thStatus: lang === 'bn' ? 'অবস্থা ⇅' : 'Status ⇅',
    thAction: lang === 'bn' ? 'অ্যাকশন ⇅' : 'Action ⇅',

    // Form Labels
    lblCustomer: lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name',
    lblPhone: lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number',
    lblProduct: lang === 'bn' ? 'পণ্যের নাম ও মডেল' : 'Product & Model',
    lblTotalAmt: lang === 'bn' ? 'মোট বিক্রয়মূল্য (৳)' : 'Total Sale Price (৳)',
    lblDownPayment: lang === 'bn' ? 'ডাউন পেমেন্ট (৳)' : 'Down Payment (৳)',
    lblTotalInstallments: lang === 'bn' ? 'সর্বমোট কিস্তি সংখ্যা' : 'Total Number of Installments',
    lblFrequency: lang === 'bn' ? 'কিস্তির ধরণ' : 'Installment Interval',
    lblStartDate: lang === 'bn' ? 'কিস্তি শুরুর তারিখ' : 'Installment Start Date',
    lblInstallmentAmt: lang === 'bn' ? 'প্রতি কিস্তির পরিমাণ (৳)' : 'Installment Amount (৳)',
    lblCollectAmt: lang === 'bn' ? 'আদায়কৃত কিস্তির টাকা (৳)' : 'Collected Installment Amount (৳)',
    lblCollectNote: lang === 'bn' ? 'পেমেন্ট নোট / মন্তব্য' : 'Payment Note / Description',

    // Status Badges
    badgeActive: lang === 'bn' ? 'চলতি' : 'Active',
    badgeOverdue: lang === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Overdue',
    badgeCompleted: lang === 'bn' ? 'পরিশোধিত' : 'Completed',

    // CTAs
    cancel: lang === 'bn' ? 'বাতিল' : 'Cancel',
    save: lang === 'bn' ? 'সংরক্ষণ করুন' : 'Create Account',
    collect: lang === 'bn' ? 'কিস্তি আদায়' : 'Collect EMI',
    details: lang === 'bn' ? 'হিস্ট্রি ও বিস্তারিত' : 'Payment History',
    noData: lang === 'bn' ? 'কোনো কিস্তির রেকর্ড পাওয়া যায়নি!' : 'No installment records found!',
    
    // Additional Help
    customerSelectHelp: lang === 'bn' ? 'বিদ্যমান গ্রাহক নির্বাচন করুন' : 'Select Existing Customer',
    customerNewHelp: lang === 'bn' ? 'নতুন গ্রাহক যোগ করুন' : 'Add New Customer',
    productInventoryHelp: lang === 'bn' ? 'স্টক থেকে পণ্য নির্বাচন করুন' : 'Choose Product from Inventory',
    productCustomHelp: lang === 'bn' ? 'কাস্টম পণ্য বিবরণ' : 'Specify Custom Product details',
    stockLevel: lang === 'bn' ? 'স্টক সংখ্যা:' : 'In-stock count:',
    progressLabel: lang === 'bn' ? 'পরিশোধের অগ্রগতি' : 'Payment Progress',
    copyLedger: lang === 'bn' ? 'লেজার কপি করুন' : 'Copy Ledger Summary'
  };

  // Helper: check if a record is overdue based on dates
  const computedInstallments = useMemo(() => {
    return installments.map(item => {
      const remaining = item.totalAmount - item.paidAmount;
      if (remaining <= 0) {
        return { ...item, status: 'Completed' };
      }
      // If today is past the due date and not fully paid, it is overdue
      const isOverdue = new Date(item.nextDueDate) < new Date(todayStr);
      return {
        ...item,
        status: isOverdue ? 'Overdue' : item.status === 'Overdue' ? 'Active' : item.status
      };
    });
  }, [installments, todayStr]);

  // Filter and search
  const filteredInstallments = useMemo(() => {
    return computedInstallments.filter(item => {
      const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.phone.includes(searchTerm) ||
                            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
      let matchesDate = true;
      if ((dueFrom || dueTo) && item.nextDueDate && item.nextDueDate !== '—') {
        if (dueFrom && item.nextDueDate < dueFrom) matchesDate = false;
        if (dueTo && item.nextDueDate > dueTo) matchesDate = false;
      } else if (dueFrom || dueTo) {
        matchesDate = false;
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [computedInstallments, searchTerm, statusFilter, dueFrom, dueTo]);


  // Find installments due within the next 3 days
  const upcomingAlerts = useMemo(() => {
    const todayDate = new Date(todayStr + 'T00:00:00');
    const threeDaysFromNow = new Date(todayDate);
    threeDaysFromNow.setDate(todayDate.getDate() + 3);

    return computedInstallments.filter(item => {
      const remaining = item.totalAmount - item.paidAmount;
      if (remaining <= 0 || item.status === 'Completed') return false;
      if (!item.nextDueDate || item.nextDueDate === '—') return false;

      const dueDate = new Date(item.nextDueDate + 'T00:00:00');
      return dueDate >= todayDate && dueDate <= threeDaysFromNow;
    });
  }, [computedInstallments, todayStr]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalActive = 0;
    let totalDue = 0;
    let totalCollected = 0;
    let totalOverdue = 0;

    computedInstallments.forEach(item => {
      totalCollected += item.paidAmount;
      totalDue += (item.totalAmount - item.paidAmount);
      if (item.status === 'Completed') {
        // no active
      } else if (item.status === 'Overdue') {
        totalOverdue += 1;
      } else {
        totalActive += 1;
      }
    });

    return { totalActive, totalDue, totalCollected, totalOverdue };
  }, [computedInstallments]);

  // Filtered statistics based on current status filter & search
  const filteredStats = useMemo(() => {
    let totalReceivable = 0;
    let totalCollected = 0;
    let totalRemaining = 0;

    filteredInstallments.forEach(item => {
      totalReceivable += item.totalAmount;
      totalCollected += item.paidAmount;
      totalRemaining += (item.totalAmount - item.paidAmount);
    });

    return { totalReceivable, totalCollected, totalRemaining };
  }, [filteredInstallments]);

  // Filter existing customers inside form selector
  const filteredFormCustomers = useMemo(() => {
    if (!customerFormSearch) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerFormSearch.toLowerCase()) ||
      c.phone.includes(customerFormSearch)
    );
  }, [customers, customerFormSearch]);

  // Filter existing products inside form selector
  const filteredFormProducts = useMemo(() => {
    if (!productFormSearch) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(productFormSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productFormSearch.toLowerCase()))
    );
  }, [products, productFormSearch]);

  // Handle selected customer change
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setNewCustomerName(found.name);
      setNewPhone(found.phone);
    } else {
      setNewCustomerName('');
      setNewPhone('');
    }
  };

  // Handle selected product change
  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const found = products.find(p => p.id === id);
    if (found) {
      setNewProductName(`${found.brand ? found.brand + ' ' : ''}${found.name}`);
      setNewTotalAmount(found.sellingPrice);
      setNewQuantity(1);
      setNewExtraProfit(0);
      // default downpayment 30% of base price (recomputed live from finalTotalWithProfit in the form)
      setNewDownPayment(Math.round(found.sellingPrice * 0.3));
    } else {
      setNewProductName('');
      setNewTotalAmount(0);
      setNewDownPayment(0);
      setNewQuantity(1);
      setNewExtraProfit(0);
    }
  };


  // Handle add installment
  const handleAddInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resolve final customer information
    let resolvedName = newCustomerName.trim();
    let resolvedPhone = newPhone.trim();

    if (customerMode === 'existing') {
      const found = customers.find(c => c.id === selectedCustomerId);
      if (found) {
        resolvedName = found.name;
        resolvedPhone = found.phone;
      }
    }

    // Resolve final product information
    let resolvedProduct = newProductName.trim();
    if (productMode === 'inventory') {
      const found = products.find(p => p.id === selectedProductId);
      if (found) {
        resolvedProduct = `${found.brand ? found.brand + ' ' : ''}${found.name}`;
      }
    }

    if (!resolvedName || !resolvedPhone || !resolvedProduct || newTotalAmount <= 0) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে সকল সঠিক তথ্য প্রদান করুন!' : 'Please fill all required fields properly!', 'error');
      return;
    }

    const qty = Math.max(1, Math.floor(newQuantity || 1));
    const effectiveTotal = finalTotalWithProfit; // base*qty + markup

    if (newDownPayment > effectiveTotal) {
      showToast(lang === 'bn' ? 'ডাউন পেমেন্ট মোট মূল্যের চেয়ে বেশি হতে পারে না!' : 'Down payment cannot exceed total sale price!', 'error');
      return;
    }

    // Stock check when using inventory product
    let usedProductId: string | undefined = undefined;
    if (productMode === 'inventory' && selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod && (prod.stock || 0) < qty) {
        showToast(lang === 'bn' ? `স্টকে পর্যাপ্ত পণ্য নেই! (উপলব্ধ: ${prod?.stock || 0})` : `Insufficient stock! (Available: ${prod?.stock || 0})`, 'error');
        return;
      }
      usedProductId = selectedProductId;
    }

    const productDisplay = qty > 1 ? `${resolvedProduct} × ${qty}` : resolvedProduct;

    if (customerMode === 'new') {
      const customerExists = customers.some(c => c.phone === resolvedPhone);
      if (!customerExists) {
        const newCustId = "CUST-" + Math.floor(1000 + Math.random() * 9000);
        const newCust: Customer = {
          id: newCustId,
          name: resolvedName,
          phone: resolvedPhone,
          email: `${resolvedName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          totalPurchase: effectiveTotal,
          dueAmount: effectiveTotal - newDownPayment
        };
        setCustomers(prev => [...prev, newCust]);
      } else {
        setCustomers(prev => prev.map(c => c.phone === resolvedPhone
          ? { ...c, totalPurchase: (c.totalPurchase || 0) + effectiveTotal, dueAmount: (c.dueAmount || 0) + (effectiveTotal - newDownPayment) }
          : c));
      }
    } else {
      setCustomers(prev => prev.map(c => c.id === selectedCustomerId
        ? { ...c, totalPurchase: (c.totalPurchase || 0) + effectiveTotal, dueAmount: (c.dueAmount || 0) + (effectiveTotal - newDownPayment) }
        : c));
    }

    if (usedProductId && setProducts) {
      setProducts(prev => prev.map(p => p.id === usedProductId ? { ...p, stock: Math.max(0, (p.stock || 0) - qty) } : p));
    }

    const remaining = effectiveTotal - newDownPayment;
    const emiAmount = Math.round(remaining / newTotalInstallments);
    const nowIso = new Date().toISOString();

    const profitNote = computedProfit > 0
      ? (lang === 'bn'
          ? ` | অতিরিক্ত মুনাফা: ৳${computedProfit.toLocaleString()}${newExtraProfitType === 'percent' ? ` (${newExtraProfit}%)` : ''}`
          : ` | Extra profit: BDT ${computedProfit.toLocaleString()}${newExtraProfitType === 'percent' ? ` (${newExtraProfit}%)` : ''}`)
      : '';

    const newIns: Installment = {
      id: "INS-" + Math.floor(100 + Math.random() * 900),
      customerName: resolvedName,
      phone: resolvedPhone,
      productName: productDisplay,
      productId: usedProductId,
      totalAmount: effectiveTotal,
      downPayment: newDownPayment,
      paidAmount: newDownPayment,
      totalInstallments: newTotalInstallments,
      paidInstallments: 0,
      installmentAmount: emiAmount,
      frequency: newFrequency,
      startDate: newStartDate,
      nextDueDate: newStartDate,
      status: 'Active',
      createdAt: nowIso,
      updatedAt: nowIso,
      notes: computedProfit > 0
        ? (lang === 'bn'
            ? `বেস: ৳${(newTotalAmount * qty).toLocaleString()} + মুনাফা: ৳${computedProfit.toLocaleString()}${newExtraProfitType === 'percent' ? ` (${newExtraProfit}%)` : ''} = মোট ৳${effectiveTotal.toLocaleString()}`
            : `Base: BDT ${(newTotalAmount * qty).toLocaleString()} + Profit: BDT ${computedProfit.toLocaleString()}${newExtraProfitType === 'percent' ? ` (${newExtraProfit}%)` : ''} = Total BDT ${effectiveTotal.toLocaleString()}`)
        : '',
      history: [
        {
          date: todayStr,
          amount: newDownPayment,
          collectedBy: "admin",
          note: (lang === 'bn' ? "অ্যাকাউন্ট খোলা হয়েছে ও ডাউন পেমেন্ট আদায়" : "Account created & down payment collected.") + profitNote,
          action: 'created',
          timestamp: new Date().toLocaleTimeString(),
          receiptId: "REC-" + Math.floor(10000 + Math.random() * 90000)
        }
      ]
    };

    setInstallments([newIns, ...installments]);
    setIsAddModalOpen(false);

    setNewCustomerName('');
    setNewPhone('');
    setNewProductName('');
    setNewTotalAmount(0);
    setNewDownPayment(0);
    setNewTotalInstallments(6);
    setNewQuantity(1);
    setNewExtraProfit(0);
    setNewExtraProfitType('flat');
    setSelectedCustomerId('');
    setSelectedProductId('');
    setCustomerFormSearch('');
    setProductFormSearch('');

    showToast(lang === 'bn' ? 'নতুন কিস্তি অ্যাকাউন্ট সফলভাবে খোলা হয়েছে!' : 'New installment account created successfully!', 'success');
  };


  // Open collector modal
  const openCollectModal = (ins: Installment) => {
    setSelectedInstallment(ins);
    const remaining = ins.totalAmount - ins.paidAmount;
    // Suggest standard installment amount or remaining amount, whichever is smaller
    setCollectAmount(Math.min(ins.installmentAmount, remaining));
    
    // Auto pre-fill smart ordinal note (e.g., '৬ষ্ঠ কিস্তি পরিশোধ সম্পন্ন')
    const nextNum = (ins.paidInstallments || 0) + 1;
    const ordinalsBn = ['', '১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম', '১১শ', '১২শ'];
    const ordText = ordinalsBn[nextNum] || `${nextNum}তম`;
    const defaultNote = lang === 'bn' ? `${ordText} কিস্তি পরিশোধ সম্পন্ন` : `Paid Installment #${nextNum}`;
    setCollectNote(defaultNote);
    
    // Automatically calculate penalty if overdue (e.g. flat 150 BDT)
    if (ins.status === 'Overdue') {
      setPenaltyAmount(150);
    } else {
      setPenaltyAmount(0);
    }

    setIsCollectModalOpen(true);
    setActiveRowActionMenuId(null);
  };

  // Save Collected Installment
  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment || collectAmount <= 0) return;

    const finalPenalty = penaltyAmount || 0;
    const remainingBefore = selectedInstallment.totalAmount + finalPenalty - selectedInstallment.paidAmount;
    if (collectAmount > remainingBefore) {
      showToast(lang === 'bn' ? 'আদায়ের পরিমাণ অবশিষ্ট বকেয়ার চেয়ে বেশি হতে পারে না!' : 'Collection amount cannot exceed remaining due balance!', 'error');
      return;
    }

    const updatedInstallments = installments.map(item => {
      if (item.id === selectedInstallment.id) {
        const newTotalAmount = item.totalAmount + finalPenalty;
        const newPaidAmount = item.paidAmount + collectAmount;
        const newPaidInstallments = item.paidInstallments + 1;
        const isFullyPaid = newPaidAmount >= newTotalAmount;

        // Compute next due date (approx. +1 month or week)
        const currentDate = new Date(item.nextDueDate);
        if (item.frequency === 'Monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 7);
        }
        const newNextDueDate = currentDate.toISOString().split('T')[0];

        // Format nice note
        let calculatedNote = collectNote;
        if (!calculatedNote) {
          calculatedNote = lang === 'bn' 
            ? `${newPaidInstallments} নং কিস্তি আদায় সম্পন্ন।${finalPenalty > 0 ? ` (জরিমানা ফি: ৳${finalPenalty} যোগ করা হয়েছে)` : ''}` 
            : `Installment #${newPaidInstallments} payment collected.${finalPenalty > 0 ? ` (Overdue penalty of ৳${finalPenalty} applied)` : ''}`;
        }

        const newRemaining = newTotalAmount - newPaidAmount;

        // SMS Message construction
        const smsMsg = lang === 'bn'
          ? `রনি টেলিকম: প্রিয় ${item.customerName}, আপনার পেমেন্ট ৳${collectAmount.toLocaleString()} গ্রহণ করা হয়েছে।${finalPenalty > 0 ? ` (জরিমানা ফি ৳${finalPenalty} যোগ করা হয়েছে)` : ''} মোট পরিশোধ: ৳${newPaidAmount.toLocaleString()}, বকেয়া: ৳${newRemaining.toLocaleString()}। ধন্যবাদ!`
          : `Rony Telecom: Dear ${item.customerName}, we have received your payment of BDT ${collectAmount.toLocaleString()} for ${item.productName}.${finalPenalty > 0 ? ` (Overdue penalty BDT ${finalPenalty} applied)` : ''} Total Paid: BDT ${newPaidAmount.toLocaleString()}, Remaining Balance: BDT ${newRemaining.toLocaleString()}. Thank you!`;

        // Trigger simulated SMS trigger
        setTimeout(() => {
          setActiveSms({
            phone: item.phone,
            message: smsMsg
          });
        }, 300);

        return {
          ...item,
          totalAmount: newTotalAmount,
          paidAmount: newPaidAmount,
          paidInstallments: newPaidInstallments,
          status: isFullyPaid ? 'Completed' : 'Active',
          nextDueDate: isFullyPaid ? '—' : newNextDueDate,
          history: [
            ...item.history,
            {
              date: todayStr,
              amount: collectAmount,
              collectedBy: "admin",
              note: calculatedNote,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              penaltyApplied: finalPenalty,
              receiptId: "REC-" + Math.floor(10000 + Math.random() * 90000),
              action: 'collected'
            }
          ]
        };
      }
      return item;
    });

    // Sync customer dueAmount for this collection
    setCustomers(prev => prev.map(c => c.phone === selectedInstallment.phone
      ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) - collectAmount + finalPenalty) }
      : c));

    setInstallments(updatedInstallments);
    setIsCollectModalOpen(false);
    setSelectedInstallment(null);
    showToast(lang === 'bn' ? 'কিস্তির পেমেন্ট সফলভাবে সংগ্রহ করা হয়েছে!' : 'Installment payment recorded successfully!', 'success');
  };

  // Delete/Terminate Account (restore stock + adjust customer due)
  const deleteInstallment = (id: string) => {
    const target = installments.find(i => i.id === id);
    if (!target) return;
    if (!window.confirm(lang === 'bn' ? 'ডিলিট করবেন? স্টক পুনরুদ্ধার হবে ও গ্রাহকের বকেয়া কমবে।' : 'Delete this installment? Stock will be restored and dues adjusted.')) return;
    if (target.productId && setProducts) {
      setProducts(prev => prev.map(p => p.id === target.productId ? { ...p, stock: (p.stock || 0) + 1 } : p));
    }
    const remaining = target.totalAmount - target.paidAmount;
    setCustomers(prev => prev.map(c => c.phone === target.phone
      ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) - remaining), totalPurchase: Math.max(0, (c.totalPurchase || 0) - target.totalAmount) }
      : c));
    setInstallments(installments.filter(item => item.id !== id));
    showToast(lang === 'bn' ? 'অ্যাকাউন্ট ডিলিট ও স্টক পুনরুদ্ধার হয়েছে!' : 'Account deleted and stock restored!', 'info');
    setActiveRowActionMenuId(null);
  };

  // Sync customer dues after each collection
  const syncDueAfterCollect = (phone: string, amount: number, penalty: number) => {
    setCustomers(prev => prev.map(c => c.phone === phone
      ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) - amount + penalty) }
      : c));
  };

  const openEditModal = (ins: Installment) => {
    setEditForm({
      id: ins.id,
      totalAmount: ins.totalAmount,
      downPayment: ins.downPayment,
      totalInstallments: ins.totalInstallments,
      frequency: ins.frequency,
      nextDueDate: ins.nextDueDate === '—' ? todayStr : ins.nextDueDate,
      notes: ins.notes || ''
    });
    setIsEditModalOpen(true);
    setActiveRowActionMenuId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    const target = installments.find(i => i.id === editForm.id);
    if (!target) return;
    if (editForm.totalAmount < target.paidAmount) {
      showToast(lang === 'bn' ? 'মোট মূল্য পরিশোধিত টাকার চেয়ে কম হতে পারে না!' : 'Total cannot be less than paid amount!', 'error');
      return;
    }
    const remainingUnits = Math.max(1, editForm.totalInstallments - target.paidInstallments);
    const newEmi = Math.max(0, Math.round((editForm.totalAmount - target.paidAmount) / remainingUnits));
    const dueDelta = editForm.totalAmount - target.totalAmount;
    setInstallments(prev => prev.map(i => i.id === editForm.id ? {
      ...i,
      totalAmount: editForm.totalAmount,
      downPayment: editForm.downPayment,
      totalInstallments: editForm.totalInstallments,
      frequency: editForm.frequency,
      nextDueDate: editForm.nextDueDate,
      installmentAmount: newEmi,
      notes: editForm.notes,
      status: editForm.totalAmount <= i.paidAmount ? 'Completed' : i.status,
      updatedAt: new Date().toISOString(),
      history: [...i.history, {
        date: todayStr, amount: 0, collectedBy: 'admin',
        note: (lang === 'bn' ? 'হিসাব সম্পাদনা: মোট ৳' : 'Account edited: total ৳') + editForm.totalAmount.toLocaleString(),
        timestamp: new Date().toLocaleTimeString(),
        action: 'edited', meta: { dueDelta }
      }]
    } : i));
    if (dueDelta !== 0) {
      setCustomers(prev => prev.map(c => c.phone === target.phone ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) + dueDelta) } : c));
    }
    setIsEditModalOpen(false);
    setEditForm(null);
    showToast(lang === 'bn' ? 'কিস্তি হিসাব আপডেট হয়েছে!' : 'Installment account updated!', 'success');
  };

  const renderTemplate = (tpl: string, ins: Installment) => {
    const remaining = ins.totalAmount - ins.paidAmount;
    return tpl
      .replace(/\{customerName\}/g, ins.customerName)
      .replace(/\{phone\}/g, ins.phone)
      .replace(/\{product\}/g, ins.productName)
      .replace(/\{emi\}/g, ins.installmentAmount.toLocaleString())
      .replace(/\{dueDate\}/g, ins.nextDueDate)
      .replace(/\{remaining\}/g, remaining.toLocaleString())
      .replace(/\{total\}/g, ins.totalAmount.toLocaleString())
      .replace(/\{paid\}/g, ins.paidAmount.toLocaleString())
      .replace(/\{id\}/g, ins.id);
  };

  const sendReminder = (ins: Installment) => {
    const tpl = lang === 'bn' ? smsTemplateBn : smsTemplateEn;
    const msg = renderTemplate(tpl, ins);
    setActiveSms({ phone: ins.phone, message: msg });
    setInstallments(prev => prev.map(i => i.id === ins.id ? {
      ...i,
      history: [...i.history, {
        date: todayStr, amount: 0, collectedBy: 'system',
        note: lang === 'bn' ? 'রিমাইন্ডার এসএমএস পাঠানো হয়েছে' : 'Reminder SMS dispatched',
        action: 'reminder', timestamp: new Date().toLocaleTimeString()
      }]
    } : i));
    setActiveRowActionMenuId(null);
    showToast(lang === 'bn' ? 'রিমাইন্ডার পাঠানো হয়েছে!' : 'Reminder sent!', 'success');
  };

  const PRINT_STYLES = `body{font-family:Arial,sans-serif;padding:24px;color:#111;}
    h1,h2,h3{margin:0 0 8px 0;}
    .head{text-align:center;border-bottom:2px solid #008d44;padding-bottom:10px;margin-bottom:16px;}
    .row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;}
    table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px;}
    th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;} th{background:#e4ebf0;}
    .total{margin-top:12px;font-size:14px;text-align:right;font-weight:800;}
    .foot{margin-top:24px;text-align:center;font-size:11px;color:#555;border-top:1px dashed #888;padding-top:10px;}`;

  // Opens the in-app print preview modal. User confirms before printing.
  const openPrintWindow = (title: string, bodyHtml: string) => {
    const fullHtml = `<!doctype html><html><head><title>${title}</title><meta charset="utf-8"/><style>${PRINT_STYLES}</style></head><body>${bodyHtml}</body></html>`;
    setPrintPreview({ title, html: fullHtml });
  };

  // Actually opens the print window after user confirms in preview
  const confirmPrint = () => {
    if (!printPreview) return;
    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) { showToast(lang === 'bn' ? 'পপআপ ব্লক করা হয়েছে!' : 'Popup blocked!', 'error'); return; }
    const html = printPreview.html.replace('</body>', `<script>window.onload=()=>{setTimeout(()=>window.print(),200);}<\/script></body>`);
    w.document.write(html);
    w.document.close();
    setPrintPreview(null);
  };

  // Export the currently-filtered ledger as a printable statement (Save as PDF)
  const exportLedgerPDF = () => {
    if (filteredInstallments.length === 0) {
      showToast(lang === 'bn' ? 'কোনো রেকর্ড নেই!' : 'No records to export!', 'error');
      return;
    }
    const rows = filteredInstallments.map((ins, i) => {
      const remaining = ins.totalAmount - ins.paidAmount;
      return `<tr>
        <td>${i + 1}</td>
        <td>${ins.id}</td>
        <td>${ins.customerName}<br/><small>${ins.phone}</small></td>
        <td>${ins.productName}</td>
        <td style="text-align:right">৳${ins.totalAmount.toLocaleString()}</td>
        <td style="text-align:right">৳${ins.paidAmount.toLocaleString()}</td>
        <td style="text-align:right">৳${remaining.toLocaleString()}</td>
        <td style="text-align:center">${ins.paidInstallments}/${ins.totalInstallments}</td>
        <td style="text-align:center">${ins.nextDueDate}</td>
        <td style="text-align:center">${ins.status}</td>
      </tr>`;
    }).join('');
    const totalReceivable = filteredStats.totalReceivable;
    const totalCollected = filteredStats.totalCollected;
    const totalRemaining = filteredStats.totalRemaining;
    const filterDesc = `${statusFilter}${searchTerm ? ` | "${searchTerm}"` : ''}${dueFrom ? ` | from ${dueFrom}` : ''}${dueTo ? ` | to ${dueTo}` : ''}`;
    const body = `
      <div class="head"><h2>Rony Telecom — Full Installment Ledger</h2>
      <div>Generated: ${todayStr} | Filter: <b>${filterDesc}</b> | Records: <b>${filteredInstallments.length}</b></div></div>
      <table><thead><tr>
        <th>#</th><th>A/C</th><th>Customer</th><th>Product</th>
        <th style="text-align:right">Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Remaining</th>
        <th style="text-align:center">EMIs</th><th style="text-align:center">Next Due</th><th style="text-align:center">Status</th>
      </tr></thead><tbody>${rows}</tbody>
      <tfoot><tr style="background:#f1f5f9;font-weight:800">
        <td colspan="4" style="text-align:right">TOTAL</td>
        <td style="text-align:right">৳${totalReceivable.toLocaleString()}</td>
        <td style="text-align:right">৳${totalCollected.toLocaleString()}</td>
        <td style="text-align:right">৳${totalRemaining.toLocaleString()}</td>
        <td colspan="3"></td>
      </tr></tfoot></table>
      <div class="foot">Rony Telecom — Installment Ledger Report. Use browser Print → Save as PDF.</div>`;
    openPrintWindow(`Ledger ${todayStr}`, body);
  };



  const printStatement = (ins: Installment) => {
    const remaining = ins.totalAmount - ins.paidAmount;
    const rows = ins.history.map((h, i) => `<tr>
      <td>${i + 1}</td><td>${h.date} ${h.timestamp || ''}</td>
      <td>${h.receiptId || '—'}</td><td>${h.action || 'collected'}</td>
      <td style="text-align:right">৳${h.amount.toLocaleString()}</td>
      <td style="text-align:right">৳${(h.penaltyApplied || 0).toLocaleString()}</td>
      <td>${(h.note || '').replace(/</g, '&lt;')}</td></tr>`).join('');
    const body = `
      <div class="head"><h2>Rony Telecom — Installment Statement</h2>
      <div>A/C: <b>${ins.id}</b> | Date: ${todayStr}</div></div>
      <div class="row"><span>Customer:</span><b>${ins.customerName} (${ins.phone})</b></div>
      <div class="row"><span>Product:</span><b>${ins.productName}</b></div>
      <div class="row"><span>Total Sale:</span><b>৳${ins.totalAmount.toLocaleString()}</b></div>
      <div class="row"><span>Down Payment:</span><b>৳${ins.downPayment.toLocaleString()}</b></div>
      <div class="row"><span>EMI:</span><b>৳${ins.installmentAmount.toLocaleString()} × ${ins.totalInstallments} (${ins.frequency})</b></div>
      <div class="row"><span>Paid to Date:</span><b>৳${ins.paidAmount.toLocaleString()}</b></div>
      <div class="row"><span>Remaining:</span><b>৳${remaining.toLocaleString()}</b></div>
      <div class="row"><span>Next Due:</span><b>${ins.nextDueDate}</b></div>
      <table><thead><tr><th>#</th><th>Date/Time</th><th>Receipt</th><th>Action</th><th>Amount</th><th>Penalty</th><th>Note</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#888">No entries</td></tr>'}</tbody></table>
      <div class="total">Total Paid: ৳${ins.paidAmount.toLocaleString()} | Outstanding: ৳${remaining.toLocaleString()}</div>
      <div class="foot">Thank you for choosing Rony Telecom.</div>`;
    openPrintWindow(`Statement ${ins.id}`, body);
    setActiveRowActionMenuId(null);
  };

  const printReceipt = (ins: Installment, hist: InstallmentHistory) => {
    const body = `
      <div class="head"><h2>Rony Telecom — Payment Receipt</h2>
      <div>Receipt: <b>${hist.receiptId || '—'}</b> | ${hist.date} ${hist.timestamp || ''}</div></div>
      <div class="row"><span>A/C:</span><b>${ins.id}</b></div>
      <div class="row"><span>Customer:</span><b>${ins.customerName} (${ins.phone})</b></div>
      <div class="row"><span>Product:</span><b>${ins.productName}</b></div>
      <div class="row"><span>Amount Paid:</span><b>৳${hist.amount.toLocaleString()}</b></div>
      <div class="row"><span>Penalty:</span><b>৳${(hist.penaltyApplied || 0).toLocaleString()}</b></div>
      <div class="row"><span>Collected By:</span><b>${hist.collectedBy}</b></div>
      <div class="row"><span>Note:</span><b>${(hist.note || '').replace(/</g, '&lt;')}</b></div>
      <div class="foot">Signature: ____________________ &nbsp;&nbsp; Thank you!</div>`;
    openPrintWindow(`Receipt ${hist.receiptId || ins.id}`, body);
  };


  // Copy ledger history as SMS / Text
  const copyLedgerHistoryToClipboard = (ins: Installment) => {
    const remaining = ins.totalAmount - ins.paidAmount;
    let statement = `--- RONY TELECOM INSTALLMENT STATEMENT ---\n`;
    statement += `Invoice/A/C: ${ins.id}\n`;
    statement += `Customer: ${ins.customerName} (${ins.phone})\n`;
    statement += `Product: ${ins.productName}\n`;
    statement += `Total Sale Price: BDT ${ins.totalAmount.toLocaleString()}\n`;
    statement += `Total Paid to Date: BDT ${ins.paidAmount.toLocaleString()}\n`;
    statement += `Total Remaining: BDT ${remaining.toLocaleString()}\n`;
    statement += `Installments Covered: ${ins.paidInstallments} of ${ins.totalInstallments} (Interval: ${ins.frequency})\n`;
    if (remaining > 0) {
      statement += `Next Due Date: ${ins.nextDueDate} (EMI: BDT ${ins.installmentAmount.toLocaleString()})\n`;
    } else {
      statement += `Account Status: FULLY COMPLETED (PAID)\n`;
    }
    statement += `\n--- PAYMENT TRANSACTIONS LEDGER ---\n`;
    ins.history.forEach((h, index) => {
      statement += `${index + 1}. [${h.date}] BDT ${h.amount.toLocaleString()} - ${h.note || 'Regular Payment'}\n`;
    });
    statement += `\nThank you for choosing Rony Telecom!`;

    navigator.clipboard.writeText(statement);
    showToast(lang === 'bn' ? 'কিস্তি বিবরণী ক্লিপবোর্ডে কপি হয়েছে!' : 'Ledger statement copied to clipboard!', 'success');
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = [
      'Installment ID',
      'Customer Name',
      'Phone',
      'Product Name',
      'Total Amount (BDT)',
      'Down Payment (BDT)',
      'Paid Amount (BDT)',
      'Remaining Balance (BDT)',
      'Total Installments',
      'Paid Installments',
      'Installment Amount (BDT)',
      'Frequency',
      'Start Date',
      'Next Due Date',
      'Status'
    ];

    const rows = computedInstallments.map(item => {
      const remaining = item.totalAmount - item.paidAmount;
      return [
        item.id,
        `"${item.customerName.replace(/"/g, '""')}"`,
        `"${item.phone}"`,
        `"${item.productName.replace(/"/g, '""')}"`,
        item.totalAmount,
        item.downPayment,
        item.paidAmount,
        remaining,
        item.totalInstallments,
        item.paidInstallments,
        item.installmentAmount,
        `"${item.frequency}"`,
        item.startDate,
        item.nextDueDate,
        item.status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add Byte Order Mark (BOM) to support UTF-8 in Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rony_Telecom_Installments_Ledger_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(lang === 'bn' ? 'কিস্তি লেজার সিএসভি ফাইল ডাউনলোড শুরু হয়েছে!' : 'Installments ledger CSV download started!', 'success');
  };

  // Status Badge Builder
  const getStatusBadge = (status: string) => {
    if (status === 'Completed') {
      return (
        <span className="text-white bg-[#00a65a] text-[10px] font-extrabold px-2 py-1 rounded-[3px] shadow-sm uppercase">
          {t.badgeCompleted}
        </span>
      );
    } else if (status === 'Overdue') {
      return (
        <span className="text-white bg-[#ff4444] text-[10px] font-extrabold px-2 py-1 rounded-[3px] shadow-sm uppercase select-none animate-pulse">
          {t.badgeOverdue}
        </span>
      );
    } else {
      return (
        <span className="text-white bg-[#17a2b8]/90 text-[10px] font-extrabold px-2 py-1 rounded-[3px] shadow-sm uppercase">
          {t.badgeActive}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-[11px] font-black tracking-wider text-[#008d44] uppercase">
            {lang === 'bn' ? 'রনি টেলিকম কিস্তি বুক রেজিস্টার' : 'Rony Telecom Installment Book Register'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            💳 {t.title}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* SMS template settings */}
          <button
            onClick={() => setIsSmsSettingsOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer border border-slate-200"
            title={lang === 'bn' ? 'রিমাইন্ডার SMS টেমপ্লেট' : 'Reminder SMS template'}
          >
            <MessageSquare size={14} />
            <span>{lang === 'bn' ? 'SMS টেমপ্লেট' : 'SMS Template'}</span>
          </button>

          {/* Export PDF (full ledger via print preview) */}
          <button
            onClick={exportLedgerPDF}
            className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer border-none"
          >
            <FileText size={14} />
            <span>{lang === 'bn' ? 'পিডিএফ এক্সপোর্ট' : 'Export PDF'}</span>
          </button>

          {/* Export to CSV Button */}
          <button
            onClick={exportToCSV}
            className="bg-[#17a2b8]/90 hover:bg-[#138496] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer border-none"
          >
            <Copy size={14} />
            <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}</span>
          </button>

          {/* Add New Installment Account Button */}
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setCustomerMode('existing');
              setProductMode('inventory');
            }}
            className="bg-[#008d44] hover:bg-[#00733e] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer border-none"
          >
            <Plus size={15} />
            <span>{t.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Upcoming Alerts Alert Box */}
      {upcomingAlerts.length > 0 && (
        <div className="border border-red-200 bg-red-50/70 rounded-2xl p-4 sm:p-5 flex flex-col items-start gap-3.5 animate-fade-in select-none">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-red-900">
                ⚠️ {lang === 'bn' ? 'আসন্ন কিস্তি পেমেন্ট অ্যালার্ট (পরবর্তী ৩ দিনের মধ্যে)' : 'Upcoming Installment Alerts (Within Next 3 Days)'}
              </h4>
              <p className="text-xs text-red-700/80 font-bold mt-0.5">
                {lang === 'bn' 
                  ? `পরবর্তী ৩ দিনের মধ্যে কিস্তি পরিশোধের সময়সীমা শেষ হতে চলেছে এমন কিস্তি হিসাবগুলো নিচে দেওয়া হলো। অনুগ্রহ করে দ্রুত গ্রাহকদের সাথে যোগাযোগ করে কিস্তি সংগ্রহ করুন।` 
                  : `There are ${upcomingAlerts.length} installment contracts approaching their payment due date within the next 3 days. Please follow up with the customers.`
                }
              </p>
            </div>
          </div>

          {/* List of approaching installments */}
          <div className="flex flex-wrap gap-2.5 w-full">
            {upcomingAlerts.map(alert => {
              return (
                <div key={alert.id} className="bg-white border border-red-100 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-700 flex items-center gap-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900">{alert.customerName}</span>
                    <span className="text-slate-400 font-mono">({alert.phone})</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="font-semibold text-slate-800">{alert.productName}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-red-600 font-extrabold">৳{alert.installmentAmount.toLocaleString()}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-slate-500 font-bold">{alert.nextDueDate}</span>
                  <button
                    onClick={() => openCollectModal(alert)}
                    className="ml-1 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer border-none"
                  >
                    {lang === 'bn' ? 'আদায় করুন' : 'Collect EMI'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Active */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{t.kpiTotalActive}</span>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalActive}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Activity size={22} />
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{t.kpiCollected}</span>
            <h3 className="text-2xl font-black text-emerald-600">৳{stats.totalCollected.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            ৳
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{t.kpiTotalDue}</span>
            <h3 className="text-2xl font-black text-orange-600">৳{stats.totalDue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Defaulter / Overdue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{t.kpiOverdueAccounts}</span>
            <h3 className="text-2xl font-black text-[#ff4444]">{stats.totalOverdue}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#ff4444] flex items-center justify-center font-black">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Filtered Ledger Summary Box */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-extrabold tracking-wide text-slate-800 flex items-center gap-1.5 uppercase">
              <Activity size={14} className="text-emerald-600" />
              {lang === 'bn' ? 'ফিল্টারড হিসাব সারসংক্ষেপ' : 'Filtered Ledger Summary'}
            </h4>
            <p className="text-[11px] text-slate-500 font-semibold">
              {lang === 'bn' 
                ? `বর্তমান ফিল্টার অনুযায়ী মোট হিসাবকৃত সারসংক্ষেপ (মোট রেকর্ড: ${filteredInstallments.length} টি)` 
                : `Aggregated totals based on current filters and searches (Total Records: ${filteredInstallments.length})`
              }
            </p>
          </div>
          <div className="text-[10px] font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
            {lang === 'bn' ? 'ফিল্টার: ' : 'Filter: '} <span className="text-slate-900 font-extrabold">{statusFilter}</span> 
            {searchTerm && ` | "${searchTerm}"`}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Total Receivable */}
          <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl flex items-center justify-between transition hover:shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                {lang === 'bn' ? 'মোট প্রাপ্য মূল্য (Receivable)' : 'Total Receivable Amount'}
              </span>
              <h3 className="text-xl font-black text-slate-900 font-mono">৳{filteredStats.totalReceivable.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Collected */}
          <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl flex items-center justify-between transition hover:shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                {lang === 'bn' ? 'মোট সংগৃহীত (Collected)' : 'Total Collected'}
              </span>
              <h3 className="text-xl font-black text-emerald-600 font-mono">৳{filteredStats.totalCollected.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Remaining Balance */}
          <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl flex items-center justify-between transition hover:shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                {lang === 'bn' ? 'মোট অবশিষ্ট বকেয়া (Remaining)' : 'Total Remaining Balance'}
              </span>
              <h3 className="text-xl font-black text-orange-500 font-mono">৳{filteredStats.totalRemaining.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>


      {/* Main Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Status Tabs filters */}
          <div className="flex flex-wrap gap-1 bg-slate-200/65 p-1 rounded-xl">
            {['All', 'Active', 'Overdue', 'Completed'].map(status => {
              const label = status === 'All' ? t.filterAll : status === 'Active' ? t.filterActive : status === 'Overdue' ? t.filterOverdue : t.filterCompleted;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-[#008d44] text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Dropdown status filter */}
            <div className="relative w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs font-bold pl-3 pr-8 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d44]/20 focus:border-[#008d44] appearance-none cursor-pointer"
              >
                <option value="All">{lang === 'bn' ? 'সকল স্ট্যাটাস ফিল্টার' : 'Filter Status: All'}</option>
                <option value="Active">{lang === 'bn' ? 'চলতি কিস্তি' : 'Active Only'}</option>
                <option value="Overdue">{lang === 'bn' ? 'মেয়াদোত্তীর্ণ কিস্তি' : 'Overdue Only'}</option>
                <option value="Completed">{lang === 'bn' ? 'পরিশোধিত কিস্তি' : 'Completed Only'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d44]/20 focus:border-[#008d44]"
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={14} />
            </div>
          </div>
        </div>

        {/* Date range filter row */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            <Filter size={12} />
            <span>{lang === 'bn' ? 'পরবর্তী কিস্তির তারিখ:' : 'Next Due Date:'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold text-slate-500">{lang === 'bn' ? 'থেকে' : 'From'}</label>
            <input
              type="date"
              value={dueFrom}
              onChange={e => setDueFrom(e.target.value)}
              className="text-xs font-semibold px-2 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-bold text-slate-500">{lang === 'bn' ? 'পর্যন্ত' : 'To'}</label>
            <input
              type="date"
              value={dueTo}
              onChange={e => setDueTo(e.target.value)}
              className="text-xs font-semibold px-2 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44]"
            />
          </div>
          {(dueFrom || dueTo) && (
            <button
              onClick={() => { setDueFrom(''); setDueTo(''); }}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 cursor-pointer flex items-center gap-1"
            >
              <XIcon size={11} />
              {lang === 'bn' ? 'তারিখ ক্লিয়ার' : 'Clear dates'}
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-bold ml-auto">
            {lang === 'bn' ? `দৃশ্যমান রেকর্ড: ${filteredInstallments.length}` : `Showing ${filteredInstallments.length} record(s)`}
          </span>
        </div>


        {/* Data Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#e4ebf0] text-slate-800 border-b border-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200">{t.thCustomer}</th>
                <th className="px-4 py-3 border-r border-slate-200">{t.thProduct}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-right">{t.thDownPayment}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-right">{t.thPaidAmt}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-right">{t.thRemaining}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center">{t.thInstallments}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center">{t.thNextDue}</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center">{t.thStatus}</th>
                <th className="px-4 py-3 text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 bg-white font-sans text-slate-700">
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-extrabold bg-slate-50/50">
                    💔 {t.noData}
                  </td>
                </tr>
              ) : (
                filteredInstallments.map(item => {
                  const remainingDue = item.totalAmount - item.paidAmount;
                  const payPercentage = Math.min(100, Math.round((item.paidAmount / item.totalAmount) * 100));
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition duration-75">
                      {/* Customer info */}
                      <td className="px-4 py-4 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-150 flex items-center justify-center font-extrabold text-slate-700 shrink-0 select-none">
                            {item.customerName[0]}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#333] text-[13px]">{item.customerName}</div>
                            <div className="text-[10.5px] text-gray-500 font-mono mt-0.5">{item.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="px-4 py-4 border-r border-slate-100">
                        <div className="font-extrabold text-slate-800 leading-snug">{item.productName}</div>
                        <div className="text-[11px] text-[#008d44] font-extrabold font-mono mt-1">৳{item.totalAmount.toLocaleString()}</div>
                      </td>

                      {/* Down Payment */}
                      <td className="px-4 py-4 border-r border-slate-100 text-right font-mono font-bold text-slate-600">
                        ৳{item.downPayment.toLocaleString()}
                      </td>

                      {/* Collected/Paid Amount */}
                      <td className="px-4 py-4 border-r border-slate-100 text-right font-mono">
                        <div className="font-extrabold text-emerald-600">৳{item.paidAmount.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{payPercentage}% paid</div>
                      </td>

                      {/* Remaining balance */}
                      <td className="px-4 py-4 border-r border-slate-100 text-right font-mono">
                        <div className="font-black text-orange-600">৳{remainingDue.toLocaleString()}</div>
                        {/* Progress Bar */}
                        <div className="w-24 ml-auto h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full ${payPercentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                            style={{ width: `${payPercentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Installment count */}
                      <td className="px-4 py-4 border-r border-slate-100 text-center">
                        <div className="inline-block bg-slate-100 px-2.5 py-1 rounded-lg">
                          <span className="font-black text-slate-800 font-mono">{item.paidInstallments}</span>
                          <span className="text-slate-400 font-bold mx-1">/</span>
                          <span className="font-bold text-slate-500 font-mono">{item.totalInstallments}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 font-mono">৳{item.installmentAmount}/mo</div>
                        {/* Color-coded visual progress bar */}
                        <div className="w-24 mx-auto h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200" title={`${Math.min(100, Math.round((item.paidInstallments / item.totalInstallments) * 100))}% paid`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.status === 'Completed' ? 'bg-[#00a65a]' :
                              item.status === 'Overdue' ? 'bg-[#ff4444]' :
                              'bg-[#17a2b8]'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((item.paidInstallments / item.totalInstallments) * 100))}%` }}
                          />
                        </div>
                      </td>

                      {/* Next Due date */}
                      <td className="px-4 py-4 border-r border-slate-100 text-center font-mono font-bold">
                        {item.nextDueDate !== '—' && remainingDue > 0 ? (
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <div className="flex items-center gap-1 text-slate-700">
                              <Calendar size={12} className="text-slate-400" />
                              <span>{item.nextDueDate}</span>
                            </div>
                            {item.status === 'Overdue' ? (
                              <span className="text-[9px] text-red-500 font-black tracking-tighter uppercase select-none">
                                {lang === 'bn' ? 'বিলম্বিত' : 'Overdue!'}
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#008d44] font-bold font-sans tracking-tight">
                                {lang === 'bn' ? 'চলতি' : 'In term'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 border-r border-slate-100 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action Dropdown Menu */}
                      <td className="px-4 py-4 text-center relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRowActionMenuId(activeRowActionMenuId === item.id ? null : item.id);
                            }}
                            className="bg-[#008d44] hover:bg-[#00733e] text-white px-2.5 py-1.5 rounded-sm font-bold text-[11.5px] transition duration-150 flex items-center justify-center gap-1 shadow-xs cursor-pointer select-none"
                          >
                            <span>Action</span>
                            <span className="text-[10px]">▼</span>
                          </button>

                          {activeRowActionMenuId === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveRowActionMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 z-20 font-sans text-left text-xs font-bold divide-y divide-slate-150">
                                
                                {/* Collect payment button */}
                                {item.status !== 'Completed' && remainingDue > 0 && (
                                  <button
                                    onClick={() => openCollectModal(item)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-emerald-600 flex items-center gap-2 cursor-pointer transition duration-75"
                                  >
                                    <CreditCard size={13} />
                                    <span>{t.collect}</span>
                                  </button>
                                )}

                                {/* Copy ledger statement */}
                                <button
                                  onClick={() => {
                                    copyLedgerHistoryToClipboard(item);
                                    setActiveRowActionMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition duration-75"
                                >
                                  <Copy size={13} />
                                  <span>{t.copyLedger}</span>
                                </button>

                                {/* View Details timeline */}
                                <button
                                  onClick={() => {
                                    setSelectedInstallment(item);
                                    setActiveRowActionMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-blue-600 flex items-center gap-2 cursor-pointer transition duration-75"
                                >
                                  <Eye size={13} />
                                  <span>{t.details}</span>
                                </button>


                                {/* Edit Account */}
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-600 flex items-center gap-2 cursor-pointer transition duration-75"
                                >
                                  <Edit3 size={13} />
                                  <span>{lang === 'bn' ? 'হিসাব সম্পাদনা' : 'Edit Account'}</span>
                                </button>

                                {/* Print Statement */}
                                <button
                                  onClick={() => printStatement(item)}
                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition duration-75"
                                >
                                  <Printer size={13} />
                                  <span>{lang === 'bn' ? 'স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}</span>
                                </button>

                                {/* Send Reminder */}
                                {item.status !== 'Completed' && remainingDue > 0 && (
                                  <button
                                    onClick={() => sendReminder(item)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-orange-600 flex items-center gap-2 cursor-pointer transition duration-75"
                                  >
                                    <Bell size={13} />
                                    <span>{lang === 'bn' ? 'রিমাইন্ডার পাঠান' : 'Send Reminder'}</span>
                                  </button>
                                )}


                                {/* Delete Account */}
                                <button
                                  onClick={() => deleteInstallment(item.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer transition duration-75"
                                >
                                  <Trash2 size={13} />
                                  <span>{lang === 'bn' ? 'অ্যাকাউন্ট মুছুন' : 'Delete Account'}</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ACCOUNT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start lg:items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-6xl p-6 shadow-2xl space-y-4 animate-fade-in text-left max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">💳 {lang === 'bn' ? 'নতুন কিস্তি অ্যাকাউন্ট খুলুন' : 'New Installment EMI Setup'}</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInstallment} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ============ LEFT COLUMN: Customer & Product ============ */}
                <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-dashed border-slate-200">
                    {lang === 'bn' ? '১ · গ্রাহক ও পণ্য' : '1 · Customer & Product'}
                  </div>
              {/* Customer Selector Options */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 font-bold">{t.lblCustomer} *</label>
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('existing');
                        setSelectedCustomerId('');
                        setNewCustomerName('');
                        setNewPhone('');
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${customerMode === 'existing' ? 'bg-[#008d44] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      {t.customerSelectHelp}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('new');
                        setSelectedCustomerId('');
                        setNewCustomerName('');
                        setNewPhone('');
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${customerMode === 'new' ? 'bg-[#008d44] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      {t.customerNewHelp}
                    </button>
                  </div>
                </div>

                {customerMode === 'existing' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'গ্রাহক খুঁজুন (নাম বা ফোন)...' : 'Filter customers list...'}
                        value={customerFormSearch}
                        onChange={e => setCustomerFormSearch(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                      <Search size={12} className="absolute right-3 top-2.5 text-slate-400" />
                    </div>
                    <select
                      value={selectedCustomerId}
                      onChange={e => handleSelectCustomer(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] bg-white font-sans text-xs"
                      required={customerMode === 'existing'}
                    >
                      <option value="">{lang === 'bn' ? '-- গ্রাহক নির্বাচন করুন --' : '-- Choose Customer --'}</option>
                      {filteredFormCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required={customerMode === 'new'}
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        placeholder="e.g. Jahidul Islam"
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required={customerMode === 'new'}
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        placeholder="e.g. 01711944027"
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Selector Options */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 font-bold">{t.lblProduct} *</label>
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setProductMode('inventory');
                        setSelectedProductId('');
                        setNewProductName('');
                        setNewTotalAmount(0);
                        setNewDownPayment(0);
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${productMode === 'inventory' ? 'bg-[#008d44] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      {t.productInventoryHelp}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProductMode('custom');
                        setSelectedProductId('');
                        setNewProductName('');
                        setNewTotalAmount(0);
                        setNewDownPayment(0);
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${productMode === 'custom' ? 'bg-[#008d44] text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      {t.productCustomHelp}
                    </button>
                  </div>
                </div>

                {productMode === 'inventory' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'মডেল বা ব্র্যান্ড খুঁজুন...' : 'Filter store inventory...'}
                        value={productFormSearch}
                        onChange={e => setProductFormSearch(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                      <Search size={12} className="absolute right-3 top-2.5 text-slate-400" />
                    </div>
                    <select
                      value={selectedProductId}
                      onChange={e => handleSelectProduct(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] bg-white font-sans text-xs"
                      required={productMode === 'inventory'}
                    >
                      <option value="">{lang === 'bn' ? '-- পণ্য নির্বাচন করুন --' : '-- Choose Product --'}</option>
                      {filteredFormProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.brand ? p.brand + ' ' : ''}{p.name} - ৳{p.sellingPrice.toLocaleString()} ({t.stockLevel} {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required={productMode === 'custom'}
                      value={newProductName}
                      onChange={e => setNewProductName(e.target.value)}
                      placeholder="e.g. Vivo V30 Lite 5G"
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44]"
                    />
                  </div>
                )}
              </div>
                </div>

                {/* ============ RIGHT COLUMN: Pricing, Profit, EMI Terms ============ */}
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-dashed border-slate-200">
                    {lang === 'bn' ? '২ · মূল্য, মুনাফা ও কিস্তির শর্ত' : '2 · Pricing, Profit & EMI Terms'}
                  </div>
              {/* Pricing section: base price + quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 mb-1.5">
                    {lang === 'bn' ? 'প্রতি ইউনিট বেস মূল্য (৳) *' : 'Base Price Per Unit (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTotalAmount || ''}
                    onChange={e => setNewTotalAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] font-mono"
                    disabled={productMode === 'inventory'}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">
                    {lang === 'bn' ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={newQuantity}
                    onChange={e => setNewQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] font-mono"
                  />
                </div>
              </div>

              {/* Extra Profit / Markup on installment sale */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-emerald-800 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={13} />
                    {lang === 'bn' ? 'অতিরিক্ত মুনাফা / মার্কআপ (কিস্তির জন্য)' : 'Extra Profit / Markup (installment)'}
                  </label>
                  <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setNewExtraProfitType('flat')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${newExtraProfitType === 'flat' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
                    >৳ {lang === 'bn' ? 'ফ্ল্যাট' : 'Flat'}</button>
                    <button
                      type="button"
                      onClick={() => setNewExtraProfitType('percent')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${newExtraProfitType === 'percent' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
                    >% {lang === 'bn' ? 'শতকরা' : 'Percent'}</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    step={newExtraProfitType === 'percent' ? 0.5 : 1}
                    value={newExtraProfit || ''}
                    onChange={e => setNewExtraProfit(Number(e.target.value))}
                    placeholder={newExtraProfitType === 'percent' ? 'e.g. 10' : 'e.g. 500'}
                    className="w-full p-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono bg-white"
                  />
                  <div className="p-2.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-mono text-emerald-900 flex items-center justify-between">
                    <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'মুনাফা:' : 'Profit:'}</span>
                    <span className="font-black">৳{computedProfit.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-700/80 font-semibold">
                  {lang === 'bn'
                    ? 'বেস মূল্যের উপর অতিরিক্ত মুনাফা যোগ করে চূড়ান্ত বিক্রয়মূল্য গণনা হবে।'
                    : 'This markup is added to the base price to compute the final installment sale price.'}
                </p>
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-slate-500 mb-1.5">{t.lblDownPayment}</label>
                <input
                  type="number"
                  min={0}
                  value={newDownPayment || ''}
                  onChange={e => setNewDownPayment(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] font-mono"
                />
              </div>

              {/* Installments Intervals & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5">{t.lblTotalInstallments} *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTotalInstallments}
                    onChange={e => setNewTotalInstallments(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">{t.lblFrequency}</label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008d44] bg-white text-xs"
                  >
                    <option value="Monthly">{lang === 'bn' ? 'মাসিক কিস্তি' : 'Monthly Interval'}</option>
                    <option value="Weekly">{lang === 'bn' ? 'সাপ্তাহিক কিস্তি' : 'Weekly Interval'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">{t.lblStartDate}</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Breakdown + EMI Preview */}
              {newTotalAmount > 0 && (
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'bn' ? 'বেস × পরিমাণ:' : 'Base × Qty:'}</span>
                    <span className="text-slate-200 font-bold">৳{newTotalAmount.toLocaleString()} × {newQuantity} = ৳{baseSubtotal.toLocaleString()}</span>
                  </div>
                  {computedProfit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-400">{lang === 'bn' ? '+ অতিরিক্ত মুনাফা:' : '+ Extra Profit:'}</span>
                      <span className="text-emerald-300 font-bold">৳{computedProfit.toLocaleString()}{newExtraProfitType === 'percent' ? ` (${newExtraProfit}%)` : ''}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-700 pt-1.5 text-[12px]">
                    <span className="text-slate-300">{lang === 'bn' ? 'চূড়ান্ত বিক্রয়মূল্য:' : 'Final Sale Price:'}</span>
                    <span className="text-white font-black">৳{finalTotalWithProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'bn' ? 'ডাউন পেমেন্ট:' : 'Down Payment:'}</span>
                    <span className="text-slate-200">- ৳{(newDownPayment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-1.5 text-[13px]">
                    <span className="text-slate-300">{t.lblInstallmentAmt}:</span>
                    <span className="text-[#4ade80] font-black">
                      ৳{Math.max(0, Math.round((finalTotalWithProfit - newDownPayment) / (newTotalInstallments || 1))).toLocaleString()} × {newTotalInstallments}
                    </span>
                  </div>
                </div>
              )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-extrabold rounded-xl transition cursor-pointer border-none"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COLLECT INSTALLMENT (WIDE LANDSCAPE REDESIGN) */}
      {isCollectModalOpen && selectedInstallment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in text-left font-sans">
            {/* Header */}
            <div className="bg-[#008d44] text-white px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
                  💰
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">{t.collect}</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">ইনভয়েস/হিসাব নং: #{selectedInstallment.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Profile Brief Info Card (2 Columns Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
                    <span className="font-black text-slate-800 dark:text-white">{selectedInstallment.customerName}</span>
                    <span className="font-mono text-[11px] text-slate-500">({selectedInstallment.phone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">{lang === 'bn' ? 'পণ্য:' : 'Product:'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedInstallment.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-bold">{lang === 'bn' ? 'কিস্তির মেয়াদের ধরন:' : 'Frequency:'}</span>
                    <span className="font-extrabold text-[#7c3aed] bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                      {selectedInstallment.frequency === 'Monthly' ? 'মাসিক' : 'সাপ্তাহিক'} (৳{selectedInstallment.installmentAmount.toLocaleString()} × {selectedInstallment.totalInstallments})
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">{lang === 'bn' ? 'মোট বিক্রয়মূল্য:' : 'Total Amount:'}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">৳{selectedInstallment.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">{lang === 'bn' ? 'পরিশোধিত টাকা:' : 'Paid Amount:'}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">৳{selectedInstallment.paidAmount.toLocaleString()} ({selectedInstallment.paidInstallments}/{selectedInstallment.totalInstallments} কিস্তি)</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/60 pt-1.5">
                    <span className="text-slate-500 font-bold">{lang === 'bn' ? 'অবশিষ্ট বকেয়া:' : 'Remaining Due:'}</span>
                    <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">৳{(selectedInstallment.totalAmount - selectedInstallment.paidAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Input Form (2 Columns Grid) */}
              <form onSubmit={handleCollectPayment} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      {t.lblCollectAmt} (৳) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                      <input
                        type="number"
                        required
                        min={1}
                        max={selectedInstallment.totalAmount + (penaltyAmount || 0) - selectedInstallment.paidAmount}
                        value={collectAmount || ''}
                        onChange={e => setCollectAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d44] font-mono text-base font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      {lang === 'bn' ? 'জরিমানা ফি (ঐচ্ছিক) (৳)' : 'Penalty Fee (Optional) (৳)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                      <input
                        type="number"
                        min={0}
                        value={penaltyAmount || ''}
                        onChange={e => setPenaltyAmount(Number(e.target.value))}
                        placeholder={lang === 'bn' ? 'যেমন: ১৫০' : 'e.g. 150'}
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d44] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {selectedInstallment.status === 'Overdue' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <span className="text-base">⚠️</span>
                    <p className="text-[11px] font-bold">
                      {lang === 'bn' ? 'অ্যাকাউন্টটি মেয়াদোত্তীর্ণ! ১৫০ টাকা জরিমানা ফি স্বয়ংক্রিয়ভাবে ধরা হয়েছে।' : 'Account is overdue! ৳150 penalty fee automatically calculated.'}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">
                      {t.lblCollectNote}
                    </label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-900/40">
                      {lang === 'bn' ? '⚡ স্বয়ংক্রিয় প্রস্তাবিত বা ড্রপডাউন থেকে দ্রুত বাছুন' : '⚡ Auto-suggested or pick preset'}
                    </span>
                  </div>

                  {/* Quick Auto-Suggestion Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(() => {
                      const nextNum = (selectedInstallment.paidInstallments || 0) + 1;
                      const ordinalsBn = ['', '১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম', '১১শ', '১২শ'];
                      const ordText = ordinalsBn[nextNum] || `${nextNum}তম`;
                      const autoNote = lang === 'bn' ? `${ordText} কিস্তি পরিশোধ সম্পন্ন` : `Paid Installment #${nextNum}`;
                      const suggestions = [
                        { label: `⚡ ${autoNote}`, text: autoNote },
                        { label: lang === 'bn' ? '⚡ জমার সাথে জরিমানা' : '⚡ Included Penalty Fee', text: lang === 'bn' ? 'জমার সাথে জরিমানা সহ পরিশোধ' : 'Included Penalty Fee' },
                        { label: lang === 'bn' ? '⚡ আংশিক কিস্তি' : '⚡ Partial Payment', text: lang === 'bn' ? 'আংশিক কিস্তি পরিশোধ' : 'Partial EMI Payment' },
                        { label: lang === 'bn' ? '⚡ অগ্রিম কিস্তি' : '⚡ Advance EMI', text: lang === 'bn' ? 'অগ্রিম কিস্তি জমা' : 'Advance EMI Payment' }
                      ];
                      return suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCollectNote(s.text)}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#f5f3ff] hover:bg-purple-100 text-[#7c3aed] border border-purple-200/60 dark:bg-purple-950/40 dark:border-purple-900/40 dark:text-purple-300 transition cursor-pointer active:scale-95 shadow-3xs"
                        >
                          {s.label}
                        </button>
                      ));
                    })()}
                  </div>

                  {/* Preset Dropdown & Free Input Combo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      onChange={e => { if (e.target.value) setCollectNote(e.target.value); }}
                      defaultValue=""
                      className="sm:col-span-1 px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#008d44] cursor-pointer"
                    >
                      <option value="" disabled>-- {lang === 'bn' ? 'ড্রপডাউন অপশন' : 'Select Note'} --</option>
                      <option value="১ম কিস্তি পরিশোধ সম্পন্ন">১ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="২য় কিস্তি পরিশোধ সম্পন্ন">২য় কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৩য় কিস্তি পরিশোধ সম্পন্ন">৩য় কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৪র্থ কিস্তি পরিশোধ সম্পন্ন">৪র্থ কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৫ম কিস্তি পরিশোধ সম্পন্ন">৫ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৬ষ্ঠ কিস্তি পরিশোধ সম্পন্ন">৬ষ্ঠ কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৭ম কিস্তি পরিশোধ সম্পন্ন">৭ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৮ম কিস্তি পরিশোধ সম্পন্ন">৮ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="৯ম কিস্তি পরিশোধ সম্পন্ন">৯ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="১০ম কিস্তি পরিশোধ সম্পন্ন">১০ম কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="১১শ কিস্তি পরিশোধ সম্পন্ন">১১শ কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="১২শ কিস্তি পরিশোধ সম্পন্ন">১২শ কিস্তি পরিশোধ সম্পন্ন</option>
                      <option value="জরিমানাসহ কিস্তি জমা">জরিমানাসহ কিস্তি জমা</option>
                      <option value="আংশিক কিস্তি পরিশোধ">আংশিক কিস্তি পরিশোধ</option>
                      <option value="অগ্রিম কিস্তি জমা">অগ্রিম কিস্তি জমা</option>
                    </select>

                    <input
                      type="text"
                      value={collectNote}
                      onChange={e => setCollectNote(e.target.value)}
                      placeholder={lang === 'bn' ? 'অথবা নিজের মতো টাইপ করুন...' : 'Or type custom note...'}
                      className="sm:col-span-2 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d44] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCollectModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-black rounded-xl transition cursor-pointer text-xs border-none shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span>💰</span>
                    <span>{t.collect}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT HISTORY TIMELINE DETAILS */}
      {selectedInstallment && !isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">📜 {t.details} - {selectedInstallment.customerName}</h3>
              <button 
                onClick={() => setSelectedInstallment(null)}
                className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Profile Brief Info */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 border border-slate-150 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-bold">{lang === 'bn' ? 'গ্রাহকের মোবাইল' : 'Customer Phone'}</span>
                <span className="font-extrabold text-slate-800 font-mono text-[12px]">{selectedInstallment.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">{lang === 'bn' ? 'ক্রয়কৃত আইটেম' : 'Purchased Item'}</span>
                <span className="font-extrabold text-slate-800 text-[12px]">{selectedInstallment.productName}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block font-bold">{lang === 'bn' ? 'মোট বিক্রয়মূল্য' : 'Total Amount'}</span>
                <span className="font-black text-[#008d44] font-mono text-[13px]">৳{selectedInstallment.totalAmount.toLocaleString()}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block font-bold">{lang === 'bn' ? 'অবशिष्ट বকেয়া' : 'Remaining Due'}</span>
                <span className="font-black text-orange-600 font-mono text-[13px]">৳{(selectedInstallment.totalAmount - selectedInstallment.paidAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Detailed Payment Ledger Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? 'টাকা আদায়ের বিস্তারিত লেজার' : 'Detailed Payment Ledger'}
                </h4>
                <button
                  type="button"
                  onClick={() => copyLedgerHistoryToClipboard(selectedInstallment)}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-150 transition active:scale-95"
                >
                  <Copy size={11} />
                  <span>{t.copyLedger}</span>
                </button>
              </div>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64 scrollbar-thin">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#e4ebf0] text-slate-800 border-b border-slate-300 font-extrabold select-none">
                      <th className="p-2.5 font-sans">{lang === 'bn' ? 'রসিদ / সময়' : 'Receipt / Time'}</th>
                      <th className="p-2.5 font-sans">{lang === 'bn' ? 'সংগ্রাহক' : 'Collector'}</th>
                      <th className="p-2.5 font-sans text-right">{lang === 'bn' ? 'জরিমানা' : 'Penalty'}</th>
                      <th className="p-2.5 font-sans text-right">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                      <th className="p-2.5 font-sans">{lang === 'bn' ? 'মন্তব্য' : 'Note'}</th>
                      <th className="p-2.5 font-sans text-center">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                    {selectedInstallment.history.map((hist, idx) => {
                      const fallbackTime = "12:00 PM";
                      const fallbackReceipt = `REC-${14380 + idx * 7}`;
                      const receipt = hist.receiptId || fallbackReceipt;
                      const timeStr = hist.timestamp || fallbackTime;
                      const penalty = hist.penaltyApplied !== undefined ? hist.penaltyApplied : 0;
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5 space-y-0.5">
                            <span className="font-mono font-extrabold text-slate-800 block">{receipt}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{hist.date} {timeStr}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider block w-fit">
                              {hist.collectedBy}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-500">
                            {penalty > 0 ? `৳${penalty.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-emerald-600 text-xs">
                            ৳{hist.amount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-slate-500 max-w-[120px] truncate" title={hist.note}>
                            {hist.note}
                          </td>
                          <td className="p-2.5 text-center">
                            {(hist.action === 'collected' || !hist.action) && hist.amount > 0 ? (
                              <button
                                onClick={() => printReceipt(selectedInstallment, hist)}
                                title={lang === 'bn' ? 'রসিদ প্রিন্ট' : 'Print receipt'}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <Printer size={13} />
                              </button>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => printStatement(selectedInstallment)}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 border border-blue-100"
              >
                <Printer size={13} />
                {lang === 'bn' ? 'পূর্ণ স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}
              </button>
              <button
                type="button"
                onClick={() => openEditModal(selectedInstallment)}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 border border-amber-100"
              >
                <Edit3 size={13} />
                {lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
              </button>
              {selectedInstallment.status !== 'Completed' && (selectedInstallment.totalAmount - selectedInstallment.paidAmount) > 0 && (
                <button
                  onClick={() => openCollectModal(selectedInstallment)}
                  className="px-5 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-extrabold rounded-xl transition cursor-pointer text-xs mr-2 border-none"
                >
                  {t.collect}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedInstallment(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close View'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated SMS Notification popup */}
      {activeSms && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-700 animate-slide-in flex flex-col gap-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-green-400">⚡ SMS Gateway (Simulated)</span>
            </div>
            <button
              onClick={() => setActiveSms(null)}
              className="text-slate-400 hover:text-white font-extrabold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 font-bold">To: <span className="font-mono text-white font-extrabold">{activeSms.phone}</span></div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-sans text-[11px] leading-relaxed text-slate-100 select-all font-medium">
              {activeSms.message}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-bold text-right flex items-center justify-end gap-1">
            <span>Sent automatically via Rony Telecom SMS Engine</span>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT INSTALLMENT ACCOUNT */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">✏️ {lang === 'bn' ? 'কিস্তি হিসাব সম্পাদনা' : 'Edit Installment Account'}</h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditForm(null); }} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'মোট মূল্য (৳)' : 'Total Amount (৳)'}</label>
                  <input type="number" min={0} required value={editForm.totalAmount || ''}
                    onChange={e => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'ডাউন পেমেন্ট (৳)' : 'Down Payment (৳)'}</label>
                  <input type="number" min={0} value={editForm.downPayment || ''}
                    onChange={e => setEditForm({ ...editForm, downPayment: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'মোট কিস্তি' : 'Total EMIs'}</label>
                  <input type="number" min={1} required value={editForm.totalInstallments}
                    onChange={e => setEditForm({ ...editForm, totalInstallments: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'ধরণ' : 'Frequency'}</label>
                  <select value={editForm.frequency}
                    onChange={e => setEditForm({ ...editForm, frequency: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white">
                    <option value="Monthly">{lang === 'bn' ? 'মাসিক' : 'Monthly'}</option>
                    <option value="Weekly">{lang === 'bn' ? 'সাপ্তাহিক' : 'Weekly'}</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'পরবর্তী কিস্তির তারিখ' : 'Next Due Date'}</label>
                  <input type="date" required value={editForm.nextDueDate}
                    onChange={e => setEditForm({ ...editForm, nextDueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">{lang === 'bn' ? 'নোট' : 'Notes'}</label>
                  <textarea value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-150">
                {lang === 'bn' ? 'নোট: মোট মূল্য পরিবর্তন করলে গ্রাহকের বকেয়াও স্বয়ংক্রিয়ভাবে সমন্বয় হবে ও নতুন EMI হিসাব করা হবে।' : 'Note: Changing total will auto-adjust customer dues and recompute EMI.'}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditForm(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">
                  {t.cancel}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-extrabold rounded-xl cursor-pointer border-none">
                  {lang === 'bn' ? 'সংরক্ষণ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 5: PRINT PREVIEW */}
      {printPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Printer size={16} />
                  {lang === 'bn' ? 'প্রিন্ট প্রিভিউ' : 'Print Preview'} — <span className="text-slate-500 font-bold">{printPreview.title}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {lang === 'bn' ? 'প্রিন্ট করার আগে ফরম্যাট নিশ্চিত করুন। (Save as PDF অপশন প্রিন্ট ডায়ালগে পাবেন)' : 'Verify the layout before printing. Use browser Save as PDF from the print dialog.'}
                </p>
              </div>
              <button
                onClick={() => setPrintPreview(null)}
                className="text-slate-400 hover:text-slate-700 font-black cursor-pointer p-1"
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-100 p-4">
              <iframe
                title="print-preview"
                srcDoc={printPreview.html}
                className="w-full h-full bg-white border border-slate-300 rounded-lg shadow-inner"
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setPrintPreview(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={confirmPrint}
                className="px-5 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-extrabold rounded-xl text-xs cursor-pointer border-none flex items-center gap-1.5"
              >
                <Printer size={13} />
                {lang === 'bn' ? 'প্রিন্ট / সেভ পিডিএফ' : 'Print / Save PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: SMS TEMPLATE SETTINGS */}
      {isSmsSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <MessageSquare size={16} />
                {lang === 'bn' ? 'রিমাইন্ডার SMS টেমপ্লেট' : 'Reminder SMS Template'}
              </h3>
              <button onClick={() => setIsSmsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer text-sm">✕</button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900 font-semibold leading-relaxed">
              <div className="font-black mb-1">{lang === 'bn' ? 'উপলব্ধ প্লেসহোল্ডার:' : 'Available placeholders:'}</div>
              <div className="font-mono text-[10.5px] text-blue-800">
                {'{customerName} {phone} {product} {emi} {dueDate} {remaining} {total} {paid} {id}'}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wider">
                  {lang === 'bn' ? 'বাংলা টেমপ্লেট' : 'Bangla Template'}
                </label>
                <textarea
                  value={smsTemplateBn}
                  onChange={e => setSmsTemplateBn(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#008d44]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wider">
                  {lang === 'bn' ? 'ইংরেজি টেমপ্লেট' : 'English Template'}
                </label>
                <textarea
                  value={smsTemplateEn}
                  onChange={e => setSmsTemplateEn(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#008d44]"
                />
              </div>

              {/* Preview */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'bn' ? 'উদাহরণ প্রিভিউ' : 'Sample Preview'}
                </div>
                <div className="text-[11.5px] text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {renderTemplate(lang === 'bn' ? smsTemplateBn : smsTemplateEn, {
                    id: 'INS-001', customerName: 'জাহিদুল ইসলাম', phone: '01711944027',
                    productName: 'Samsung Galaxy A15', installmentAmount: 2500,
                    nextDueDate: todayStr, totalAmount: 20000, paidAmount: 7500,
                    downPayment: 5000, totalInstallments: 8, paidInstallments: 3,
                    frequency: 'Monthly', startDate: todayStr, status: 'Active', history: []
                  } as Installment)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSmsTemplateBn(DEFAULT_SMS_TEMPLATE_BN);
                  setSmsTemplateEn(DEFAULT_SMS_TEMPLATE_EN);
                  showToast(lang === 'bn' ? 'ডিফল্ট টেমপ্লেট পুনরুদ্ধার হয়েছে' : 'Defaults restored', 'info');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer"
              >
                {lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset defaults'}
              </button>
              <button
                onClick={() => { setIsSmsSettingsOpen(false); showToast(lang === 'bn' ? 'SMS টেমপ্লেট সংরক্ষিত' : 'SMS template saved', 'success'); }}
                className="px-5 py-2.5 bg-[#008d44] hover:bg-[#00733e] text-white font-extrabold rounded-xl text-xs cursor-pointer border-none"
              >
                {lang === 'bn' ? 'সংরক্ষণ' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}