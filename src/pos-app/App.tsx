// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Database, 
  Settings, 
  Wrench, 
  Tag, 
  Folder,
  FolderPlus,
  FolderCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText, 
  Plus, 
  PlusCircle, 
  List, 
  Menu, 
  X,
  Layers, 
  Printer, 
  Download, 
  Wallet, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Award,
  Scale,
  Check,
  ShieldCheck,
  Smartphone,
  Truck,
  Grid,
  FileBarChart,
  ArrowRightLeft,
  Sliders,
  UserPlus,
  Phone,
  Mail,
  Send,
  Hourglass,
  MinusCircle,
  Building,
  Gauge,
  Percent,
  
  FileSpreadsheet,
  Briefcase,
  Shield,
  Calendar,
  MinusSquare,
  Languages,
  Globe,
  ShieldAlert,
  LayoutDashboard,
  Monitor,
  BookOpen,
  Clock,
  RotateCcw,
  Camera,
  Search,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  LogIn,
  LogOut,
  Store,
  UserCheck,
  ArrowLeftCircle,
  LineChart,
  Headphones,
  Sparkles,
  Save,
  Eye,
  EyeOff,
  Copy,
  Key,
  DollarSign
} from 'lucide-react';

import { ImmersivePOS } from './components/ImmersivePOS';
const Sales = (props: any) => <ImmersivePOS {...props} showToast={() => {}} onNavigateHome={() => {}} />;
import { CreateUserForm } from './components/CreateUserForm';
import { SalesReturn, type ReturnRecord } from './components/SalesReturn';
import { SalesLedger } from './components/SalesLedger';
import { Contacts } from './components/Contacts';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { StockHeatmap } from './components/StockHeatmap';
import { UnitsManager } from './components/UnitsManager';
import { WarrantySerialManager } from './components/WarrantySerialManager';
import { BatchExpiryManager } from './components/BatchExpiryManager';
import { ComboManager, recordComboUsage, type Combo } from './components/ComboManager';
import { PurchaseHistoryManager } from './components/PurchaseHistoryManager';
import { StockAlertManager } from './components/StockAlertManager';
import { StockCenter } from './components/StockCenter';
import ExpenseCenter from './components/ExpenseCenter';
import SmsCenter from './components/SmsCenter';
import { ReportCenter } from './components/ReportCenter';
import { ImportExportManager } from './components/ImportExportManager';
import { PrintLabels } from './components/PrintLabels';
import { ImportItems } from './components/ImportItems';
import { ImportServices } from './components/ImportServices';
import { AuditLogViewer } from './components/AuditLogViewer';
const logAudit = (a: any, b: any, c: any) => {};
const isBatchSellable = (a: any) => true;
import { Installments } from './components/Installments';
import AdvanceBookingPanel from './components/AdvanceBooking';
import Quotations from './components/Quotations';
import { Purchases } from './components/Purchases';
import { Accounting } from './components/Accounting';
import SyncStatusPanel from './components/SyncStatusPanel';
import { StoreSettings } from './components/StoreSettings';
import { SiteSettings } from './components/SiteSettings';
import { CustomerSupportDesk } from './components/CustomerSupportDesk';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { AiSmartIntelligence } from './components/AiSmartIntelligence';
import { SummaryCard, type SummaryCardTone } from './components/SummaryCard';
const aggregateDotStyle = (a: any) => ({});


class ComponentErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">⚠️ রিপোর্ট কেন্দ্র লোড সমস্যা</h2>
          <div className="text-xs font-mono bg-rose-100/80 p-3 rounded-xl overflow-x-auto text-rose-900 border border-rose-200">
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </div>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
            পুনরায় চেষ্টা করুন (Retry)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


// Critical Variables & Bug Fix Rules
const NL = '\n';
const BOM = '\uFEFF';

// Custom Lucide-Like Simple Core SVG Icons for Sidebars
const SquarePlusIcon = (props: any) => (
  <div className={`w-3.5 h-3.5 border border-white/60 text-white/85 rounded flex items-center justify-center font-bold text-[9px] leading-none shrink-0 select-none bg-white/5 ${props.className || ''}`}>
    +
  </div>
);

const ListIcon = (props: any) => (
  <div className={`flex flex-col gap-0.5 justify-center h-3 w-3.5 shrink-0 opacity-80 select-none ${props.className || ''}`}>
    <div className="h-0.5 bg-white/80 rounded-full w-full"></div>
    <div className="h-0.5 bg-white/80 rounded-full w-[80%]"></div>
    <div className="h-0.5 bg-white/80 rounded-full w-full"></div>
  </div>
);

const ImportIcon = (props: any) => (
  <div className={`w-3.5 h-3.5 border border-white/60 text-white/85 rounded-full flex items-center justify-center font-bold text-[8px] leading-none shrink-0 select-none bg-white/5 ${props.className || ''}`}>
    &larr;
  </div>
);

const BarcodeIcon = (props: any) => (
  <div className={`flex items-center gap-0.5 justify-center h-3.5 w-3.5 shrink-0 select-none ${props.className || ''}`}>
    <div className="h-full bg-white/80 w-0.5 rounded-xs"></div>
    <div className="h-full bg-white/80 w-1 rounded-xs"></div>
    <div className="h-full bg-white/80 w-0.5 rounded-xs"></div>
    <div className="h-full bg-white/80 w-1 rounded-xs"></div>
  </div>
);

// Interfaces
interface Product {
  id: string; // SKU
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  unit: string;
  brand?: string;
  itemGroup?: string;
  hsn?: string;
  alertQty?: number;
  sellerPoints?: number;
  barcode?: string;
  description?: string;
  discountType?: string;
  discount?: string;
  tax?: string;
  taxType?: string;
  profitMargin?: string;
  mrp?: string;
  warehouse?: string;
  image?: string;
  itemType?: string;
  status?: string;
}

interface Sale {
  id: string;
  date: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  profit?: number;
  customerName: string;
  paymentMethod?: string;
  dueDate?: string;
  referenceNo?: string;
  paidAmount?: number;
  createdBy?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  purchasePriceAtTime?: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalPurchase: number;
  dueAmount: number;
}

interface DashboardKpi {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: string;
  valueType: 'revenue' | 'orders' | 'products' | 'lowstock' | 'custom';
  customValueBn?: string;
  customValueEn?: string;
  badgeBg: string;
  iconBg: string;
}

// Fluent Dual Language Translator Map
const T = {
  bn: {
    dashboard: "ড্যাশবোর্ড",
    pos: "পিওএস (POS)",
    inventory: "ইনভেন্টরি",
    customers: "গ্রাহক সমূহ",
    reports: "রিপোর্ট সমূহ",
    settings: "সেটিংস",
    backup: "ব্যাকআপ ও রিস্টোর",
    totalSales: "মোট বিক্রয়",
    netProfit: "নিট মুনাফা",
    salesCount: "বিক্রয় সংখ্যা",
    totalDue: "গ্রাহক বকেয়া",
    recentSales: "সাম্প্রতিক বিক্রয়",
    quickActions: "দ্রুত অ্যাকশন",
    directSell: "সরাসরি বিক্রয়",
    addProduct: "নতুন পণ্য",
    addCustomer: "নতুন গ্রাহক",
    lowStock: "স্বল্প স্টক",
    searchFilter: "অনুসন্ধান করুন...",
    productGrid: "পণ্য তালিকা",
    importCsv: "সিএসভি ইম্পোর্ট",
    exportCsv: "সিএসভি এক্সপোর্ট",
    theme: "থিম নির্বাচন",
    shopInfo: "দোকানের প্রোফাইল সেটিংস",
    saveSettings: "সেটিংস সংরক্ষণ",
    productName: "পণ্যের নাম",
    sku: "এসকেইউ (ID)",
    category: "শ্রেণী",
    purchasePrice: "ক্রয় মূল্য",
    sellingPrice: "বিক্রয় মূল্য",
    stock: "স্টক",
    unit: "একক",
    action: "অ্যাকশন",
    all: "সব",
    date: "তারিখ",
    price: "মূল্য",
    qty: "পরিমাণ",
    total: "মোট",
    payment: "পেমেন্ট",
    exportReport: "প্রিন্ট রিপোর্ট",
    printPreview: "প্রিন্ট প্রিভিউ",
    presets: "সময়সীমা নির্বাচন",
    today: "আজ",
    week: "এই সপ্তাহ",
    days15: "১৫ দিন",
    month: "এই মাস",
    custom: "কাস্টম",
    langName: "English",
    storeName: "দোকানের নাম",
    address: "ঠিকানা",
    phone: "ফোন নম্বর",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    customerName: "ক্রেতার নাম",
    paymentMethod: "পেমেন্ট পদ্ধতি",
    cash: "নগদ (Cash)",
    card: "কার্ড (Card)",
    mobileBanking: "মোবাইল ব্যাংকিং (MFS)",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    addStock: "স্টক যোগ",
    selectCustomer: "গ্রাহক নির্বাচন",
    due: "বকেয়া",
    totalSpent: "মোট ক্রয়",
    successImport: "ইম্পোর্ট সফল হয়েছে!",
    invalidCsv: "ভুল সিএসভি ফরম্যাট!",
    noData: "কোনো তথ্য পাওয়া যায়নি",
    allCategories: "সকল ক্যাটাগরি",
    gridColumns: "গ্রিড কলাম",
    invoiceMemo: "ইনভয়েস মেমো",
    authorizedSign: "অনুমোদিত স্বাক্ষর",
    print: "প্রিন্ট মেমো",
    downloadPdf: "ডাউনলোড রিপোর্ট",
    downloadExcel: "এক্সেল শীট ডাউনলোড",
    csvPreview: "সিএসভি ইম্পোর্ট প্রিভিউ",
    confirmSell: "বিক্রয় নিশ্চিত করুন",
    currency: "৳",
    stockStatusIn: "পর্যাপ্ত স্টক",
    stockStatusLow: "সীমিত স্টক",
    stockStatusOut: "স্টক শেষ",
    catMap: {
      "Electronics": "ইলেকট্রনিক্স",
      "Computer Accessories": "কম্পিউটার পার্টস",
      "Peripherals": "পেরিফেরালস",
      "Storage": "স্টোরেজ ড্রাইভ",
      "Cables & Power": "ক্যাবল ও পাওয়ার",
      "Gadget": "স্মার্ট গ্যাজেট"
    }
  },
  en: {
    dashboard: "Dashboard",
    pos: "POS System",
    inventory: "Inventory",
    customers: "Customers",
    reports: "Reports hub",
    settings: "Settings",
    backup: "Backup & Restore",
    totalSales: "Total Revenue",
    netProfit: "Net Profit",
    salesCount: "Total Invoices",
    totalDue: "Customer Dues",
    recentSales: "Recent Sales Log",
    quickActions: "Quick Executions",
    directSell: "Direct Sell",
    addProduct: "Add New Product",
    addCustomer: "Add Customer",
    lowStock: "Low Stock Alert",
    searchFilter: "Type to search...",
    productGrid: "Product Grid Layout",
    importCsv: "Import CSV Data",
    exportCsv: "Export customer CSV",
    theme: "Core Theme Theme",
    shopInfo: "Shop Info Profile",
    saveSettings: "Update Shop Settings",
    productName: "Product Name",
    sku: "SKU / Code",
    category: "Category",
    purchasePrice: "Purchase Price",
    sellingPrice: "Selling Price",
    stock: "Stock Qty",
    unit: "Unit",
    action: "Action",
    all: "All",
    date: "Date/Time",
    price: "Price",
    qty: "Qty",
    total: "Total",
    payment: "Payment Method",
    exportReport: "Print Report",
    printPreview: "Memo Print Overlay",
    presets: "Select Range Presets",
    today: "Today",
    week: "Last 7 Days",
    days15: "Last 15 Days",
    month: "This Month",
    custom: "Custom Target",
    langName: "বাংলা",
    storeName: "Business Name",
    address: "Physical Address",
    phone: "Contact Mobile",
    save: "Confirm Save",
    cancel: "Close",
    customerName: "Buyer's Name",
    paymentMethod: "Payment Channels",
    cash: "Cash In Hand",
    card: "Debit/Credit Card",
    mobileBanking: "Mobile Financial Services",
    recentTransactions: "Recent Transactions Log",
    addStock: "Increment Stock",
    selectCustomer: "Select Customer Name",
    due: "Account Balance",
    totalSpent: "Total Spent",
    successImport: "Records Imported Successfully!",
    invalidCsv: "Improper CSV formatting detected!",
    noData: "No active record to show",
    allCategories: "All Products Categories",
    gridColumns: "Adjust Grid Columns",
    invoiceMemo: "Cash Invoice Slip",
    authorizedSign: "Authorized Personnel Signature",
    print: "Trigger A4 System Print",
    downloadPdf: "Download PDF Template",
    downloadExcel: "Download Excel Report",
    csvPreview: "CSV Import Preview",
    confirmSell: "Execute Transaction",
    currency: "৳",
    stockStatusIn: "In Stock",
    stockStatusLow: "Low Stock",
    stockStatusOut: "Out of Stock",
    catMap: {
      "Electronics": "Electronics",
      "Computer Accessories": "Computer Accessories",
      "Peripherals": "Peripherals",
      "Storage": "Storage Drive",
      "Cables & Power": "Cables & Power Solutions",
      "Gadget": "Smart Gadgets"
    }
  }
};

// Default Mock Dataset (10 high fidelity CSV products, 5 Sales)
const initialProducts: Product[] = [
  {
    id: "IT020027",
    name: "XIAOMI REDMI NOTE 13",
    brand: "XIAOMI",
    category: "Smartphones",
    itemType: "ITEM",
    unit: "PCS",
    stock: 39,
    alertQty: 10,
    sellingPrice: 3834.00,
    purchasePrice: 3034.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020026",
    name: "DRONE",
    brand: "DJI",
    category: "Smart Gadgets",
    itemType: "ITEM",
    unit: "PCS",
    stock: 0,
    alertQty: 2,
    sellingPrice: 500.00,
    purchasePrice: 400.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020025",
    name: "FLYX MAX 2",
    brand: "FLYX",
    category: "Smart Gadgets",
    itemType: "ITEM",
    unit: "PCS",
    stock: 63,
    alertQty: 5,
    sellingPrice: 2320.00,
    purchasePrice: 2000.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020024",
    name: "JONAKI POWER MICRO CHARGE",
    brand: "JONAKI",
    category: "Cables & Power Solutions",
    itemType: "ITEM",
    unit: "PCS",
    stock: 1,
    alertQty: 5,
    sellingPrice: 100.00,
    purchasePrice: 75.05,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020023",
    name: "18W EXTREME QUICK CHARGER (6 MONTH BODY WARRANTY)",
    brand: "Extreme",
    category: "Cables & Power Solutions",
    itemType: "ITEM",
    unit: "PCS",
    stock: 0,
    alertQty: 5,
    sellingPrice: 350.00,
    purchasePrice: 280.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020022",
    name: "Y20",
    brand: "Vivo",
    category: "Smart Gadgets",
    itemType: "ITEM",
    unit: "PCS",
    stock: 0,
    alertQty: 3,
    sellingPrice: 1449.99,
    purchasePrice: 1200.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020021",
    name: "DECORATIVE ITEMS",
    brand: "Generic",
    category: "Home Decoration",
    itemType: "ITEM",
    unit: "PCS",
    stock: 1,
    alertQty: 2,
    sellingPrice: 3600.00,
    purchasePrice: 3000.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020020",
    name: "LUXURY WALL MIRROR",
    brand: "Luxury",
    category: "Home Decoration",
    itemType: "ITEM",
    unit: "PCS",
    stock: 0,
    alertQty: 2,
    sellingPrice: 6500.00,
    purchasePrice: 5000.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020019",
    name: "BOXER SHORTS (3 PACK)",
    brand: "Fila",
    category: "Apparel",
    itemType: "ITEM",
    unit: "PCS",
    stock: 142,
    alertQty: 10,
    sellingPrice: 450.00,
    purchasePrice: 350.00,
    tax: "N/A(0.00%)",
    status: "Active"
  },
  {
    id: "IT020018",
    name: "COTTON BOXERS",
    brand: "Fila",
    category: "Apparel",
    itemType: "ITEM",
    unit: "PCS",
    stock: 241,
    alertQty: 20,
    sellingPrice: 380.00,
    purchasePrice: 300.00,
    tax: "N/A(0.00%)",
    status: "Active"
  }
];

const initialSales: Sale[] = [
  { id: "SL580", date: "2026-08-03", dueDate: "2026-08-03", productId: "IT020027", productName: "XIAOMI REDMI NOTE 13 8GB/256GB", unitPrice: 18500.00, quantity: 1, totalPrice: 18500.00, purchasePriceAtTime: 15500.00, customerName: "Jahidul Islam", phone: "01712345678", referenceNo: "POS-801", paidAmount: 18500.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL579", date: "2026-08-02", dueDate: "2026-08-02", productId: "IT020026", productName: "SAMSUNG GALAXY A15 6GB/128GB", unitPrice: 22000.00, quantity: 1, totalPrice: 22000.00, purchasePriceAtTime: 18000.00, customerName: "Farhana Yeasmin", phone: "01923456789", referenceNo: "POS-802", paidAmount: 20000.00, paymentStatus: "PARTIAL", due: 2000.00, createdBy: "admin" },
  { id: "SL578", date: "2026-08-01", dueDate: "2026-08-01", productId: "IT020025", productName: "REALME C67 8GB/128GB", unitPrice: 16500.00, quantity: 2, totalPrice: 33000.00, purchasePriceAtTime: 14000.00, customerName: "Mizanur Shuvo", phone: "01845678901", referenceNo: "POS-803", paidAmount: 33000.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL577", date: "2026-06-04", dueDate: "2026-06-04", productId: "IT020027", productName: "XIAOMI REDMI NOTE 13", unitPrice: 3834.00, quantity: 1, totalPrice: 3834.00, purchasePriceAtTime: 3034.00, customerName: "Walk-in customer", referenceNo: "-", paidAmount: 3834.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL576", date: "2026-06-02", dueDate: "2026-06-02", productId: "IT020026", productName: "Scale", unitPrice: 2320.00, quantity: 1, totalPrice: 2320.00, purchasePriceAtTime: 1920.00, customerName: "Walk-in customer", referenceNo: "-", paidAmount: 0.00, paymentStatus: "UNPAID", createdBy: "admin" },
  { id: "SL575", date: "2026-06-01", dueDate: "2026-06-01", productId: "IT020025", productName: "Pevisone", unitPrice: 2635.00, quantity: 1, totalPrice: 2635.00, purchasePriceAtTime: 2135.00, customerName: "Walk-in customer", referenceNo: "-", paidAmount: 2635.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL574", date: "2026-06-01", dueDate: "2026-06-01", productId: "IT020024", productName: "Pen", unitPrice: 3915.00, quantity: 1, totalPrice: 3915.00, purchasePriceAtTime: 3215.00, customerName: "Walk-in customer", referenceNo: "-", paidAmount: 3915.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL573", date: "2026-05-30", dueDate: "2026-05-30", productId: "IT020023", productName: "Clock", unitPrice: 249.00, quantity: 1, totalPrice: 249.00, purchasePriceAtTime: 200.00, customerName: "Walk-in customer", referenceNo: "-", paidAmount: 249.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL1001", date: "2026-05-18", dueDate: "2026-05-18", productId: "IT020022", productName: "Rony Special", unitPrice: 95000.00, quantity: 1, totalPrice: 95000.00, purchasePriceAtTime: 80000.00, customerName: "শফিক ইসলাম", referenceNo: "-", paidAmount: 95000.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL1002", date: "2026-05-18", dueDate: "2026-05-18", productId: "IT020021", productName: "Telecom Asset", unitPrice: 125000.00, quantity: 1, totalPrice: 125000.00, purchasePriceAtTime: 105000.00, customerName: "তানজিনা আক্তার", referenceNo: "-", paidAmount: 125000.00, paymentStatus: "PAID", createdBy: "admin" }
];

const initialCustomers: Customer[] = [
  { id: "CUST-001", name: "Jahidul Islam", phone: "01712345678", email: "jahid@gmail.com", totalPurchase: 24500, dueAmount: 1200 },
  { id: "CUST-002", name: "Farhana Yeasmin", phone: "01923456789", email: "farhana@gmail.com", totalPurchase: 2600, dueAmount: 0 },
  { id: "CUST-003", name: "Tanvir Rahman", phone: "01534567890", email: "tanvir@gmail.com", totalPurchase: 0, dueAmount: 450 },
  { id: "CUST-004", name: "Mizanur Shuvo", phone: "01845678901", email: "mizan@gmail.com", totalPurchase: 8250, dueAmount: 2200 },
  { id: "CUST-005", name: "Sultana Kamal", phone: "01356789012", email: "sultana@gmail.com", totalPurchase: 0, dueAmount: 0 },
  { id: "CUST-006", name: "Kamrul Hasan", phone: "01667890123", email: "kamrul@gmail.com", totalPurchase: 2850, dueAmount: 1100 }
];

// Online / Offline / Syncing header badge. Reads navigator.onLine + queued count.
function NetworkStatusBadge({ lang, syncingCount }: { lang: 'bn' | 'en'; syncingCount: number }) {
  const [online, setOnline] = useState<boolean>(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  const state: 'online' | 'offline' | 'syncing' = !online
    ? 'offline'
    : syncingCount > 0
    ? 'syncing'
    : 'online';
  const labels = {
    online: { bn: 'অনলাইন', en: 'Online' },
    offline: { bn: 'অফলাইন', en: 'Offline' },
    syncing: { bn: 'সিঙ্ক হচ্ছে…', en: 'Syncing…' },
  } as const;
  const colors = {
    online: 'bg-emerald-500/90',
    offline: 'bg-red-500/90',
    syncing: 'bg-amber-500/90',
  } as const;
  const dot = state === 'syncing' ? 'animate-pulse' : '';
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 text-white/95 text-[12.5px] font-semibold select-none"
      role="status"
      aria-live="polite"
      title={labels[state][lang]}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${colors[state]} ${dot}`} />
      <span>{labels[state][lang]}</span>
    </div>
  );
}

// Modern Live Ticking Clock Badge for Dashboard Topbar
const TopbarLiveClock: React.FC<{ lang: 'bn' | 'en' }> = React.memo(({ lang }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeParts = useMemo(() => {
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const hours = String(h).padStart(2, '0');
    return { hours, minutes: m, seconds: s, ampm };
  }, [now]);

  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  return (
    <div 
      className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white transition text-xs font-bold border border-sky-500/30 hover:border-sky-400/60 shadow-xs backdrop-blur-md select-none group"
      title={dateStr}
    >
      <span className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/50 flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
        <Clock size={13} className="text-sky-300 stroke-[2.4px] drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
      </span>
      <div className="flex items-baseline font-mono tracking-tight select-none">
        <span className="text-white font-extrabold text-xs tracking-wider">
          {timeParts.hours}:{timeParts.minutes}
        </span>
        <span className="text-sky-400 font-extrabold text-xs drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
          :{timeParts.seconds}
        </span>
        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-sky-500/20 border border-sky-400/30 text-[9.5px] font-black text-sky-300 uppercase tracking-wider">
          {timeParts.ampm}
        </span>
      </div>
    </div>
  );
});

export default function App() {
  // Lang and Theme Core States
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<string>('today');

  // Sub-menus state
  const [activeSubTab, setActiveSubTab] = useState<string>('list_products');
  const [openGroup, setOpenGroup] = useState<string | null>('products');

  // Route hint: land on the correct Center based on URL path.
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const p = window.location.pathname || '';
      if (p.startsWith('/purchases')) {
        setActiveTab('purchases');
        setOpenGroup('purchases');
        if (!activeSubTab || !activeSubTab.startsWith('purchase_')) {
          setActiveSubTab('purchase_new');
        }
      } else if (p.startsWith('/sales')) {
        setActiveTab('pos');
        setOpenGroup('sales');
        const salesSubs = ['pos_terminal', 'sales_history', 'all_sales', 'sales_returns', 'warranty_claims'];
        if (!activeSubTab || !salesSubs.includes(activeSubTab)) {
          setActiveSubTab('pos_terminal');
        }
      } else if (p.startsWith('/contacts')) {
        setActiveTab('customers');
        setOpenGroup('contacts');
        const contactsSubs = ['contacts_customers', 'contacts_suppliers', 'contacts_dues', 'contacts_transactions', 'contacts_manage'];
        if (!activeSubTab || !contactsSubs.includes(activeSubTab)) {
          setActiveSubTab('contacts_customers');
        }
      } else if (p.startsWith('/accounting')) {
        setActiveTab('accounting');
        setOpenGroup('accounting');
        if (!activeSubTab || !activeSubTab.startsWith('acc_')) {
          setActiveSubTab('acc_dashboard');
        }
      } else if (p.startsWith('/reports')) {
        setActiveTab('reports');
        setOpenGroup('reports');
        const reportsSubs = ['rep_sales', 'rep_purchase', 'rep_inventory', 'rep_financial', 'rep_warranty', 'rep_analytics', 'print_doc'];
        if (!activeSubTab || !reportsSubs.includes(activeSubTab)) {
          setActiveSubTab('rep_analytics');
        }
      } else if (p.startsWith('/stock')) {
        setActiveTab('stock');
        setActiveSubTab('');
        setOpenGroup(null);
      } else if (p.startsWith('/expenses')) {
        setActiveTab('expenses');
        setActiveSubTab('');
        setOpenGroup(null);
      } else if (p.startsWith('/sms')) {
        setActiveTab('messaging');
        setActiveSubTab('');
        setOpenGroup(null);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-orders / Advance Booking State
  const [advanceBookings, setAdvanceBookings] = useState([
    { id: "ADV-901", customerName: "Farid Uddin", phone: "01755-123456", productModel: "iPhone 15 Pro Max 256GB Dual Esim", agreedPrice: 135000, advancePaid: 25000, bookingDate: "2026-05-28", deliveryDate: "2026-06-05", status: "Pending", notes: "Requires titanium color." },
    { id: "ADV-902", customerName: "Selim Reza", phone: "01851-987654", productModel: "Samsung Galaxy S24 Ultra", agreedPrice: 125000, advancePaid: 35000, bookingDate: "2026-05-29", deliveryDate: "2026-06-02", status: "Delivered", notes: "Delivered with free silicone cover." },
    { id: "ADV-903", customerName: "Ayesha Akhtar", phone: "01912-345678", productModel: "iPad Air M2 11 inch Wifi", agreedPrice: 75000, advancePaid: 15000, bookingDate: "2026-05-30", deliveryDate: "2026-06-08", status: "Pending", notes: "Needs matching smart folio." },
    { id: "ADV-904", customerName: "Jahangir Alam", phone: "01515-456789", productModel: "OnePlus 12 12GB/256GB", agreedPrice: 65000, advancePaid: 10000, bookingDate: "2026-05-25", deliveryDate: "2026-05-29", status: "Refunded", notes: "Refunded due to stock delay." }
  ]);
  const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);

  // Installments (কিস্তি) State
  const [installments, setInstallments] = useState([
    { 
      id: "INS-001", 
      customerName: "Rakibul Hassan", 
      phone: "01711944027", 
      productName: "iPhone 15 Pro Max 256GB", 
      totalAmount: 135000, 
      downPayment: 35000, 
      paidAmount: 50000, 
      totalInstallments: 10, 
      paidInstallments: 5, 
      installmentAmount: 10000, 
      frequency: "Monthly", 
      startDate: "2026-01-10", 
      nextDueDate: "2026-07-10", 
      status: "Active",
      history: [
        { date: "2026-02-10", amount: 10000, collectedBy: "admin", note: "1st Installment Paid" },
        { date: "2026-03-10", amount: 10000, collectedBy: "admin", note: "2nd Installment Paid" },
        { date: "2026-04-10", amount: 10000, collectedBy: "rakib", note: "3rd Installment Paid" },
        { date: "2026-05-10", amount: 10000, collectedBy: "admin", note: "4th Installment Paid" },
        { date: "2026-06-10", amount: 10000, collectedBy: "rakib", note: "5th Installment Paid" }
      ]
    },
    { 
      id: "INS-002", 
      customerName: "Mamun Islam", 
      phone: "01851-987654", 
      productName: "Samsung Galaxy S24 Ultra", 
      totalAmount: 125000, 
      downPayment: 45000, 
      paidAmount: 30000, 
      totalInstallments: 8, 
      paidInstallments: 3, 
      installmentAmount: 10000, 
      frequency: "Monthly", 
      startDate: "2026-03-05", 
      nextDueDate: "2026-07-05", 
      status: "Overdue",
      history: [
        { date: "2026-04-05", amount: 10000, collectedBy: "admin", note: "Late payment" },
        { date: "2026-05-05", amount: 10000, collectedBy: "admin", note: "Regular" },
        { date: "2026-06-05", amount: 10000, collectedBy: "rakib", note: "Regular" }
      ]
    },
    { 
      id: "INS-003", 
      customerName: "Fersous Bari", 
      phone: "01711944027", 
      productName: "iPad Air M2 11 inch Wifi", 
      totalAmount: 75000, 
      downPayment: 15000, 
      paidAmount: 60000, 
      totalInstallments: 6, 
      paidInstallments: 6, 
      installmentAmount: 10000, 
      frequency: "Monthly", 
      startDate: "2026-01-15", 
      nextDueDate: "2026-06-15", 
      status: "Completed",
      history: [
        { date: "2026-02-15", amount: 10000, collectedBy: "admin", note: "Regular" },
        { date: "2026-03-15", amount: 10000, collectedBy: "rakib", note: "Regular" },
        { date: "2026-04-15", amount: 10000, collectedBy: "admin", note: "Regular" },
        { date: "2026-05-15", amount: 10000, collectedBy: "admin", note: "Regular" },
        { date: "2026-06-15", amount: 10000, collectedBy: "rakib", note: "Final installment paid" }
      ]
    }
  ]);
  const [isAddInstallmentOpen, setIsAddInstallmentOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any | null>(null);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState<number>(10000);
  const [collectNote, setCollectNote] = useState<string>("");

  // Quotations State
  const [quotations, setQuotations] = useState([
    { id: "QTE-201", customerName: "Glorious IT Ltd", phone: "01711-223344", date: "2026-05-28", total: 475000, validUntil: "2026-06-15", status: "Sent", items: [{ name: "iPhone 15 Pro", qty: 3, price: 125000 }, { name: "MacBook Air M2", qty: 2, price: 110000 }] },
    { id: "QTE-202", customerName: "Dohar Business Center", phone: "01922-334455", date: "2026-05-29", total: 85200, validUntil: "2026-06-10", status: "Approved", items: [{ name: "Redmi Note 13 Pro+", qty: 2, price: 42600 }] }
  ]);
  const [isAddQuotationOpen, setIsAddQuotationOpen] = useState(false);


  // Messaging States
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [smsLogs, setSmsLogs] = useState([
    { id: "SMS-501", recipient: "Farid Uddin", phone: "01755-123456", text: "আপনার প্রিপেইড আইফোন ১৫ বুকিং করার জন্য ধন্যবাদ। অগ্রিম ফি ২৫০০০ টাকা ক্যাশ ড্রয়ারে জমা হয়েছে।", timestamp: "Today 10:24 AM", type: "Transaction" },
    { id: "SMS-502", recipient: "Sultana Kamal", phone: "01356-789012", text: "প্রিয় সুলতানা কামাল, রনি টেলিকম ব্রান্ডে নতুন স্যামসাং ডিভাইসগুলো চলে এসেছে! আজই চেক করুন।", timestamp: "Yesterday 04:15 PM", type: "Promo" }
  ]);
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [smsSendTerminal, setSmsSendTerminal] = useState<string[]>([]);


  // System Users State — includes shop/organization affiliation so super admin
  // can group by shop, see the owner, and enter any user's portal directly.
  const [systemEmployees, setSystemEmployees] = useState<any[]>([
    { id: "EMP-01", name: "Farhad Hasan", email: "farhad@ronitelecom.com", phone: "01851-927643", role: "Owner", status: "Active", branch: "Rony Telecom", shopName: "Rony Telecom", shopOwner: true, isBlocked: false, username: "farhad.owner", subscriptionExpiry: "2026-12-31", planType: "Yearly Subscription", isDemoMode: false, createdOn: "05-01-2021", lastLogin: "2026-07-10 09:15", activityLog: [
      { at: "2026-07-10 09:15", action: "Signed in from Chrome / Dhaka" },
      { at: "2026-07-09 20:10", action: "Approved monthly closing report" },
    ] },
    { id: "EMP-02", name: "Rakibul Hassan", email: "md.monstar1234@gmail.com", phone: "", role: "Stuff", status: "Active", branch: "Rony Telecom", shopName: "Rony Telecom", shopOwner: false, isBlocked: false, username: "rakib", subscriptionExpiry: "2026-12-31", planType: "Yearly Subscription", isDemoMode: false, createdOn: "10-06-2026", lastLogin: "2026-07-09 14:22", activityLog: [
      { at: "2026-07-09 14:22", action: "Signed in from Chrome / Dhaka" },
      { at: "2026-07-08 11:05", action: "Updated own profile photo" },
      { at: "2026-07-07 09:41", action: "Created sale INV-2041" },
    ] },
    { id: "EMP-03", name: "Mamun Islam", email: "sumonmamun@gmail.com", phone: "", role: "Customar", status: "Active", branch: "Rony Telecom", shopName: "Rony Telecom", shopOwner: false, isBlocked: false, username: "Mamun", subscriptionExpiry: "2026-12-31", planType: "Yearly Subscription", isDemoMode: false, createdOn: "26-05-2026", lastLogin: "2026-07-06 18:11", activityLog: [
      { at: "2026-07-06 18:11", action: "Signed in from Mobile / Chittagong" },
    ] },
    { id: "EMP-04", name: "Fersous Bari", email: "myithive@gmail.com", phone: "01711944027", role: "Store Admin", status: "Active", branch: "Rony Telecom", shopName: "Rony Telecom", shopOwner: false, isBlocked: false, username: "admin", subscriptionExpiry: "2026-12-31", planType: "Yearly Subscription", isDemoMode: false, createdOn: "12-02-2021", lastLogin: "2026-07-10 08:30", activityLog: [
      { at: "2026-07-10 08:30", action: "Signed in from Chrome / Dhaka" },
      { at: "2026-07-09 22:14", action: "Approved 3 quotations" },
    ] },
    { id: "EMP-05", name: "Milon Miah", email: "milon@milonelectronics.com", phone: "01711-500600", role: "Owner", status: "Active", branch: "Milon Electronics", shopName: "Milon Electronics", shopOwner: true, isBlocked: false, username: "milon.owner", subscriptionExpiry: "2026-08-05", planType: "Demo (15 Days)", isDemoMode: true, createdOn: "18-03-2022", lastLogin: "2026-07-10 07:40", activityLog: [
      { at: "2026-07-10 07:40", action: "Signed in from Mobile / Dhaka" },
      { at: "2026-07-08 15:20", action: "Added new supplier — Star Trading" },
    ] },
    { id: "EMP-06", name: "Asif Iqbal", email: "asif@milonelectronics.com", phone: "01911-223344", role: "Manager", status: "Active", branch: "Milon Electronics", shopName: "Milon Electronics", shopOwner: false, isBlocked: false, username: "asif.mgr", subscriptionExpiry: "2026-08-05", planType: "Demo (15 Days)", isDemoMode: true, createdOn: "22-08-2023", lastLogin: "2026-07-09 19:02", activityLog: [
      { at: "2026-07-09 19:02", action: "Signed in from Chrome / Dhaka" },
    ] },
    { id: "EMP-07", name: "Nadia Rahman", email: "nadia@glorytelecom.com", phone: "01717-889900", role: "Owner", status: "Active", branch: "Glory Telecom", shopName: "Glory Telecom", shopOwner: true, isBlocked: false, username: "nadia.owner", subscriptionExpiry: "2026-07-25", planType: "Monthly Subscription", isDemoMode: false, createdOn: "01-11-2024", lastLogin: "2026-07-09 21:30", activityLog: [
      { at: "2026-07-09 21:30", action: "Signed in from Chrome / Sylhet" },
    ] },
    { id: "EMP-08", name: "Rasel Ahmed", email: "rasel@glorytelecom.com", phone: "", role: "Stuff", status: "Active", branch: "Glory Telecom", shopName: "Glory Telecom", shopOwner: false, isBlocked: true, username: "rasel", subscriptionExpiry: "2026-07-25", planType: "Monthly Subscription", isDemoMode: false, createdOn: "10-01-2025", lastLogin: "2026-07-05 13:11", activityLog: [
      { at: "2026-07-05 13:11", action: "Signed in from Mobile / Sylhet" },
    ] },
  ]);

  // Append audit trail entry to a user
  const pushUserActivity = (userId: string, action: string) => {
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setSystemEmployees(prev => prev.map(e => e.id === userId
      ? { ...e, activityLog: [{ at: stamp, action }, ...(e.activityLog || [])].slice(0, 25) }
      : e));
  };
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [userSortColumn, setUserSortColumn] = useState<string | null>(null);
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const toggleUserSort = (column: string) => {
    if (userSortColumn === column) {
      setUserSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortColumn(column);
      setUserSortDirection('asc');
    }
  };
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userEntriesLimit, setUserEntriesLimit] = useState(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [activeUserMenuId, setActiveUserMenuId] = useState<string | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [userSelectedIds, setUserSelectedIds] = useState<string[]>([]);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  // Super-admin view mode for user list: flat table or grouped by shop.
  const [userViewMode, setUserViewMode] = useState<'table' | 'shops'>('shops');
  // Snapshot of the super-admin session while impersonating another user's portal.
  const [impersonationOrigin, setImpersonationOrigin] = useState<any>(null);

  // 1. Session & Role-Based Access Control State
  // Roles: 
  // 'super_admin' (Main Developer/Admin - fardous.jp2021@gmail.com)
  // 'owner' (Merchant / Shop Owner - sees everything in their own store)
  // 'employee' (Manager/Cashier/Employee - Restricted)
  const [sessionUser, setSessionUser] = useState(function() {
    try {
      const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('smarthisab_active_session_user') : null;
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        const email = (u.email || '').toLowerCase().trim();
        const phone = (u.phone || '').trim();
        const isSuper = (email === 'fardous.jp2021@gmail.com' || email === 'admin@smarthisab.com' || phone === '01747046052') && u.role === 'super_admin';
        const role = isSuper ? 'super_admin' : (u.role === 'employee' ? 'employee' : 'owner');
        return {
          name: u.fullName || u.name || (role === 'owner' ? "দোকানের মালিক" : "ব্যবহারকারী"),
          email: u.email || "",
          phone: u.phone || "",
          shopName: u.shopName || "",
          businessType: u.businessType || "",
          role: role as "super_admin" | "owner" | "employee",
          roleTitleBn: role === 'super_admin' ? "ডেভেলপার / সুপার এডমিন" : (role === 'owner' ? "দোকানের মালিক" : "কর্মচারী / ক্যাশিয়ার"),
          roleTitleEn: role === 'super_admin' ? "Developer / Super Admin" : (role === 'owner' ? "Shop Owner" : "Employee"),
          employeeRole: role === 'super_admin' ? "Super Admin" : (role === 'owner' ? "Owner" : "Operator")
        };
      }
    } catch (e) {}

    // Default guest / shop owner state (Strictly 'owner', NEVER 'super_admin')
    return {
      name: "দোকানের মালিক",
      email: "owner@smarthisab.com",
      shopName: "আমার দোকান",
      role: "owner" as "super_admin" | "owner" | "employee",
      roleTitleBn: "দোকানের মালিক",
      roleTitleEn: "Shop Owner",
      employeeRole: "Owner"
    };
  });

  // Non-super-admin users must never land on super-admin-only pages.
  // Force them back to the dashboard whenever their role changes or
  // activeTab points at a restricted page.
  useEffect(() => {
    if (sessionUser.role !== 'super_admin' && activeTab === 'super_admin_panel') {
      setActiveTab('dashboard');
      setActiveSubTab('');
    }
  }, [sessionUser.role, activeTab]);

  // ── SaaS Subscription Modals & Helpers ─────────────────────
  const [customDateModalOwner, setCustomDateModalOwner] = useState<any>(null);
  const [customExpiryDateVal, setCustomExpiryDateVal] = useState<string>('');
  const [paymentHistoryOwner, setPaymentHistoryOwner] = useState<any>(null);
  const [newPayAmount, setNewPayAmount] = useState<string>('');
  const [newPayMethod, setNewPayMethod] = useState<string>('bKash');
  const [newPayNote, setNewPayNote] = useState<string>('');

  const sendSubscriptionSmsAlert = (owner: any) => {
    const phone = owner.phone || '01711944027';
    const msg = `Dear ${owner.name}, your shop "${owner.shopName || owner.branch}" subscription expiry date is ${owner.subscriptionExpiry || '2026-12-31'}. Please renew your plan to avoid interruption. - Rony Telecom SaaS`;
    showToast(lang === 'bn' ? `রিমাইন্ডার এসএমএস পাঠানো হয়েছে (${phone})!` : `SMS Alert sent to ${phone}!`, 'success');
  };

  const addSubscriptionPaymentRecord = () => {
    if (!paymentHistoryOwner || !newPayAmount) {
      showToast(lang === 'bn' ? 'টাকার পরিমাণ লিখুন!' : 'Enter payment amount!', 'error');
      return;
    }
    const amt = parseFloat(newPayAmount) || 0;
    const record = {
      id: 'PAY-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      amount: amt,
      method: newPayMethod,
      note: newPayNote || 'Subscription Renewal Payment',
    };

    setSystemEmployees(prev => prev.map(u => (u.shopName === paymentHistoryOwner.shopName || u.id === paymentHistoryOwner.id)
      ? { ...u, paymentHistory: [record, ...(u.paymentHistory || [])] }
      : u));

    showToast(lang === 'bn' ? `৳${amt.toLocaleString()} পেমেন্ট সফলভাবে রেকর্ড হয়েছে!` : `Payment of ৳${amt.toLocaleString()} logged!`, 'success');
    setNewPayAmount('');
    setNewPayNote('');
  };


  // Super admin can enter any user's portal without permission — swaps the
  // active session, remembers the origin, and routes back to dashboard.
  const enterUserPortal = (u: any) => {
    const originRole = impersonationOrigin?.role || sessionUser.role;
    if (originRole !== 'super_admin') return;
    if (!impersonationOrigin) setImpersonationOrigin(sessionUser);
    const nextRole: 'owner' | 'employee' = u.shopOwner || (u.role || '').toLowerCase() === 'owner' ? 'owner' : 'employee';
    setSessionUser({
      name: u.name,
      email: u.email,
      role: nextRole,
      roleTitleBn: nextRole === 'owner' ? 'দোকানের মালিক' : 'কর্মচারী',
      roleTitleEn: nextRole === 'owner' ? 'Shop Owner' : 'Employee',
      employeeRole: u.role,
      shopName: u.shopName || u.branch || '',
      shopOwnerName: u.shopOwner || (nextRole === 'owner' ? u.name : ''),
    } as any);
    pushUserActivity(u.id, `Portal accessed by Super Admin (${impersonationOrigin?.name || sessionUser.name})`);
    setActiveTab('dashboard');
    setViewingEmployee(null);
    showToast && showToast(
      lang === 'bn'
        ? `আপনি এখন ${u.name}-এর পোর্টালে প্রবেশ করেছেন (${u.shopName || u.branch})`
        : `Entered ${u.name}'s portal (${u.shopName || u.branch})`,
      'success'
    );
  };

  const exitImpersonation = () => {
    if (!impersonationOrigin) return;
    setSessionUser(impersonationOrigin);
    setImpersonationOrigin(null);
    setActiveTab('super_admin_panel');
    setActiveSubTab('');
    showToast && showToast(
      lang === 'bn' ? 'সুপার এডমিন সেশনে ফিরে এসেছেন' : 'Returned to Super Admin session',
      'success'
    );
  };

  // Support desk / issue submissions state inside client for simulations
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [isAccessBlockedModalOpen, setIsAccessBlockedModalOpen] = useState(false);
  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] = useState(false);
  const [adminPromptInput, setAdminPromptInput] = useState("");
  const [promptLogs, setPromptLogs] = useState<string[]>([
    "Super Admin Command Center initialized.",
    "Type any command prompt or click quick action buttons to begin simulation."
  ]);
  const [blockedSectionLabel, setBlockedSectionLabel] = useState("");

  // Super Admin Password Reset Modal State
  const [passwordResetUser, setPasswordResetUser] = useState<any | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [showResetEye, setShowResetEye] = useState<boolean>(false);

  const openPasswordResetModal = (u: any) => {
    setPasswordResetUser(u);
    setResetNewPassword(u.password || '123456');
    setShowResetEye(true);
  };

  const handleSaveResetPassword = () => {
    if (!passwordResetUser) return;
    if (!resetNewPassword.trim()) {
      showToast && showToast(lang === 'bn' ? 'পাসওয়ার্ড দিন!' : 'Enter a valid password!', 'error');
      return;
    }
    const updatedPass = resetNewPassword.trim();
    setSystemEmployees(prev => prev.map(e => e.id === passwordResetUser.id ? { ...e, password: updatedPass } : e));
    pushUserActivity(passwordResetUser.id, `Password reset to "${updatedPass}" by ${sessionUser.name}`);
    showToast && showToast(
      lang === 'bn'
        ? `${passwordResetUser.name}-এর নতুন পাসওয়ার্ড সফলভাবে সেট ও সেভ করা হয়েছে!`
        : `Password updated successfully for ${passwordResetUser.name}!`,
      'success'
    );
    setPasswordResetUser(null);
  };

  const autoGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetNewPassword(pass);
    setShowResetEye(true);
  };

  // System versioning
  const [systemVersion, setSystemVersion] = useState("v2.4.1");
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [systemLogText, setSystemLogText] = useState<string[]>([]);

  // Variants State for Add/Update Variant panel
  const DEFAULT_VARIANTS = [
    { id: "VAR-001", name: "RAM & Storage (র‍্যাম ও স্টোরেজ)", options: ["4GB/64GB", "6GB/128GB", "8GB/128GB", "12GB/256GB"], description: "মোবাইল ও ট্যাবলেটের মেমোরি ভ্যারিয়েন্ট" },
    { id: "VAR-002", name: "Color (কালার / রঙ)", options: ["Black", "Midnight Blue", "Emerald Green", "Silver", "Gold"], description: "ডিভাইস বা কেসের বাহ্যিক রঙ" },
    { id: "VAR-003", name: "Charger Wattage (চার্জার ওয়াট)", options: ["18W Fast", "33W Turbo", "67W Hyper", "120W Ultra"], description: "ফাস্ট চার্জিং অ্যাডাপ্টারের পাওয়ার আউটপুট" },
    { id: "VAR-004", name: "Connection Type (কানেক্টিভিটি)", options: ["Type-C", "Lightning", "Micro-USB", "Wireless"], description: "কেবল ও ক্যাবলের পিন ভ্যারিয়েন্ট" }
  ];
  const [variants, setVariants] = useState<any[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('roni_variants_v1') : null;
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length) return p;
      }
    } catch (e) {}
    return DEFAULT_VARIANTS;
  });
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantDescription, setNewVariantDescription] = useState("");
  const [variantFormError, setVariantFormError] = useState(false);
  const [variantFormSuccess, setVariantFormSuccess] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('roni_variants_v1', JSON.stringify(variants)); } catch (e) {}
  }, [variants]);

  // Interactive Services State
  const DEFAULT_SERVICES = [
    { id: "SRV-001", name: "মোবাইল ডিসপ্লে পরিবর্তন (Display Replacement)", category: "Hardware", price: 2500, status: "Active", date: "2026-08-01", description: "অরিজিনাল ডিসপ্লে ফিটিং ও ৩০ দিন ওয়ারেন্টি" },
    { id: "SRV-002", name: "অরিজিনাল ব্যাটারি রিপ্লেসমেন্ট (Battery Replacement)", category: "Hardware", price: 1200, status: "Active", date: "2026-08-01", description: "১০০% অরিজিনাল ৬ মাস ওয়ারেন্টি সহ ব্যাটারি" },
    { id: "SRV-003", name: "সফ্টওয়্যার ফ্ল্যাশিং ও আইএমইআই আনলক (Flashing & Unlock)", category: "Software", price: 500, status: "Active", date: "2026-08-02", description: "অফিশিয়াল সফটওয়্যার আনলক ও ফ্ল্যাশিং" },
    { id: "SRV-004", name: "চার্জিং পোর্ট মেরামতি (Charging Port Repair)", category: "Hardware", price: 400, status: "Active", date: "2026-08-02", description: "অরিজিনাল সি টাইপ / টাইপ বি পোর্ট পরিবর্তন" }
  ];
  const [services, setServices] = useState<any[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('roni_services_v1') : null;
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length) return p;
      }
    } catch (e) {}
    return DEFAULT_SERVICES;
  });
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [editingService, setEditingService] = useState<any | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);

  useEffect(() => {
    try { localStorage.setItem('roni_services_v1', JSON.stringify(services)); } catch (e) {}
  }, [services]);

  // Interactive Purchases State
  const [purchases, setPurchases] = useState<any[]>([
    {
      id: "PUR-101",
      supplierId: "SUP-001",
      supplier: "গ্যাজেট বিডি ডিস্ট্রিবিউশন",
      date: new Date().toISOString().slice(0, 10),
      items: [
        { productId: "IT020027", name: "XIAOMI REDMI NOTE 13", qty: 10, price: 3034, discount: 0 },
        { productId: "IT020025", name: "FLYX MAX 2", qty: 25, price: 2000, discount: 500 }
      ],
      subtotal: 80340,
      discount: 500,
      total: 79840,
      paid: 79840,
      due: 0,
      paymentStatus: "PAID",
      status: "Received",
      notes: "১০টি শিয়াওমি ও ২৫টি ফ্লাইক্স চার্জার ক্যাশ এন্ট্রি।"
    },
    {
      id: "PUR-102",
      supplierId: "SUP-002",
      supplier: "স্যামসাং বাংলাদেশ লিমিটেড",
      date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
      items: [
        { name: "Samsung Galaxy S24 Ultra 512GB", qty: 5, price: 105000, discount: 1000 }
      ],
      subtotal: 525000,
      discount: 1000,
      total: 524000,
      paid: 400000,
      due: 124000,
      paymentStatus: "PARTIAL",
      status: "Received",
      notes: "৫টি গ্যালাক্সি এস২৪ আল্ট্রা পার আংশিক বাকি।"
    }
  ]);

  // Interactive Expenses State
  const [expenses, setExpenses] = useState<any[]>([
    { id: "EXP-001", title: "দোকানের মে মাস বিদ্যুৎ বিল", category: "Rent & Bills", amount: 2850, date: new Date().toISOString().slice(0, 10), note: "পল্লী বিদ্যুৎ অফিস" },
    { id: "EXP-002", title: "ম্যানেজার বেতন (রাকিবুল হাসান)", category: "Manager Salary", amount: 15000, date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10), note: "মে মাসের বেতন পরিশোধ" },
    { id: "EXP-003", title: "দোকানের ওয়াইফাই ও ইন্টারনেট বিল", category: "Internet & Utility", amount: 1000, date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10), note: "ফাইবার কানেকশন" }
  ]);

  const [expenseCategories, setExpenseCategories] = useState([
    "Manager Salary",
    "Travel Expenses",
    "Rent & Bills",
    "Entertainment",
    "Internet & Utility",
    "Staff Salaries",
    "Marketing Promotions",
    "Office Tea Snacks"
  ]);

  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpCategory, setNewExpCategory] = useState("Manager Salary");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpDate, setNewExpDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [expenseFilter, setExpenseFilter] = useState("all"); // 'all', 'today', 'week', '15days', 'month'
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");

  // Payment Accounts State
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);

  // Business Profile Info (Form Editable)
  const [shopName, setShopName] = useState<string>(() => {
    try {
      return localStorage.getItem('smarthisab_shop_name') || 'রনি টেলিকম';
    } catch (e) {
      return 'রনি টেলিকম';
    }
  });
  const [shopAddress, setShopAddress] = useState<string>('কামাল পাশা মোড়, আজাদ নগর, রামগতি, লক্ষ্মীপুর,');
  const [shopPhone, setShopPhone] = useState<string>('01718389900');

  // Extended SAIM Store & System Settings
  const [storeCode, setStoreCode] = useState<string>('ST0002');
  const [storeMobile, setStoreMobile] = useState<string>('01718389900');
  const [storeEmail, setStoreEmail] = useState<string>('mahadyhasan.forever@gmail.com');
  const [storePhoneVal, setStorePhoneVal] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [taxNumber, setTaxNumber] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [storeWebsite, setStoreWebsite] = useState<string>('');
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [bankDetails, setBankDetails] = useState<string>('');
  const [storeCountry, setStoreCountry] = useState<string>('Bangladesh');
  const [storeState, setStoreState] = useState<string>('Chittagong Division');
  const [storeCity, setStoreCity] = useState<string>('লক্ষ্মীপুর');
  const [storePostcode, setStorePostcode] = useState<string>('');
  const [storeAddressVal, setStoreAddressVal] = useState<string>('কামাল পাশা মোড়, আজাদ নগর, রামগতি, লক্ষ্মীপুর,');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeFontSize, setStoreFontSize] = useState<string>(function() {
    try {
      return localStorage.getItem('smarthisab_store_font_size') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });
  const [isLandingPageVisible, setIsLandingPageVisible] = useState<boolean>(function() {
    try {
      const saved = localStorage.getItem('smarthisab_public_landing_enabled');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Default ON so Landing/Login page is visible on load
  });

  // White-Label Platform Branding (Super Admin Editable)
  const [platformBrandName, setPlatformBrandName] = useState<string>(function() {
    return localStorage.getItem('saim_platform_brand_name') || 'SmartHisab';
  });
  const [platformBrandBadge, setPlatformBrandBadge] = useState<string>(function() {
    return localStorage.getItem('saim_platform_brand_badge') || 'POS';
  });
  const [editingPlatformBrandName, setEditingPlatformBrandName] = useState<string>(platformBrandName);
  const [editingPlatformBrandBadge, setEditingPlatformBrandBadge] = useState<string>(platformBrandBadge);

  const [sigPreview, setSigPreview] = useState<string | null>(null);

  // System Tab state
  const [sysTimezone, setSysTimezone] = useState<string>('Asia/Dhaka');
  const [sysDateFormat, setSysDateFormat] = useState<string>('dd-mm-yyyy');
  const [sysTimeFormat, setSysTimeFormat] = useState<string>('12 Hours');
  const [sysCurrency, setSysCurrency] = useState<string>('TAKA BDT (TK)');
  const [sysCurrencyPlacement, setSysCurrencyPlacement] = useState<string>('Before Amount');
  const [sysDecimals, setSysDecimals] = useState<string>('2');
  const [sysDecimalsQty, setSysDecimalsQty] = useState<string>('0');
  const [sysLanguage, setSysLanguage] = useState<string>('English');
  const [sysEnableRoundOff, setSysEnableRoundOff] = useState<boolean>(true);

  // Active settings tab within Settings Panel
  const [settingsActiveTab, setSettingsActiveTab] = useState<string>('store');

  // Dynamic Data State — persisted to localStorage so stock/sales survive reload
  const [products, setProducts] = useState<Product[]>(function() {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('pos_products_v1') : null;
      if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; }
    } catch (e) {}
    return initialProducts;
  });
  const [sales, setSales] = useState<Sale[]>(function() {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('pos_sales_v1') : null;
      if (s) { const p = JSON.parse(s); if (Array.isArray(p)) return p; }
    } catch (e) {}
    return initialSales;
  });
  useEffect(function() {
    try { localStorage.setItem('pos_products_v1', JSON.stringify(products)); } catch (e) {}
  }, [products]);
  useEffect(function() {
    try { localStorage.setItem('pos_sales_v1', JSON.stringify(sales)); } catch (e) {}
  }, [sales]);

  // Background Firestore sync for offline sales
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  type SyncMetaEntry = { count: number; lastAt: number | null; lastLabel: string | null; lastError: string | null };
  const [syncCounts, setSyncCounts] = useState<{ queued: SyncMetaEntry; syncing: SyncMetaEntry; failed: SyncMetaEntry; succeeded: SyncMetaEntry }>({
    queued: { count: 0, lastAt: null, lastLabel: null, lastError: null },
    syncing: { count: 0, lastAt: null, lastLabel: null, lastError: null },
    failed: { count: 0, lastAt: null, lastLabel: null, lastError: null },
    succeeded: { count: 0, lastAt: null, lastLabel: null, lastError: null },
  });
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(false);
  useEffect(function() {
    let unsub: (() => void) | undefined;
    let unsubItems: (() => void) | undefined;
    (async () => {
      try {
        const errMod = await import('../lib/client-error-log');
        errMod.installClientErrorCapture();
        const mod = await import('./salesSyncQueue');
        unsubItems = mod.subscribeItems((items: any[]) => {
          setPendingSyncCount(items.filter(i => i.status === 'queued' || i.status === 'syncing').length);
          const build = (status: string): SyncMetaEntry => {
            const list = items.filter(i => i.status === status);
            const latest = list.reduce((acc: any, cur: any) => (!acc || (cur.updatedAt || 0) > (acc.updatedAt || 0)) ? cur : acc, null);
            return {
              count: list.length,
              lastAt: latest ? (latest.lastAttemptAt || latest.updatedAt || null) : null,
              lastLabel: latest ? (latest.label || null) : null,
              lastError: latest && latest.error ? String(latest.error).slice(0, 160) : null,
            };
          };
          setSyncCounts({
            queued: build('queued'),
            syncing: build('syncing'),
            failed: build('failed'),
            succeeded: build('succeeded'),
          });
        });
      } catch (e) { /* firebase not configured */ }
    })();
    return () => { if (unsub) unsub(); if (unsubItems) unsubItems(); };
  }, []);

  // ---- Live Firestore subscription for quotations (cross-device sync) ----
  useEffect(function() {
    let unsubQ: (() => void) | undefined;
    (async () => {
      try {
        const [{ collection, onSnapshot }, { db, handleFirestoreError, OperationType }, { isPhase3FlagOn }, { scopedQuery, isNoWorkspaceQuery }] = await Promise.all([
          import('firebase/firestore'),
          import('./firebase'),
          import('./lib/phase3Flags'),
          import('./lib/workspaceQuery'),
        ]);
        const scoped = isPhase3FlagOn('phase3_query_scoping');
        const qRef = scoped ? scopedQuery(db, 'quotations') : collection(db, 'quotations');
        if (isNoWorkspaceQuery(qRef)) return;

        unsubQ = onSnapshot(
          qRef,
          (snap: any) => {
            const list: any[] = [];
            snap.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
            if (list.length > 0) {
              // Merge server list with any offline-queued unsynced quotations still
              // sitting in local state so nothing disappears while a sync is pending.
              setQuotations((prev: any[]) => {
                const byId = new Map<string, any>();
                list.forEach(q => byId.set(q.id, q));
                prev.forEach(q => { if (!byId.has(q.id)) byId.set(q.id, q); });
                return Array.from(byId.values()).sort((a, b) =>
                  (b.date || '').localeCompare(a.date || '')
                );
              });
            }
          },
          (error: any) => {
            handleFirestoreError(error, OperationType.READ, 'quotations');
          }
        );
      } catch { /* firebase not configured / offline */ }
    })();
    return () => { if (unsubQ) unsubQ(); };
  }, []);

  // Auto-open the "New Quotation" modal when the sidebar sub-item is selected.
  useEffect(function() {
    if (activeSubTab === 'quote_new' && activeTab === 'quotations') {
      setIsAddQuotationOpen(true);
    }
  }, [activeSubTab, activeTab]);

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [salesReturns, setSalesReturns] = useState<ReturnRecord[]>([
    {
      id: "RTN-50123",
      saleId: "SALE-101",
      productId: "IT020027",
      productName: "পিকাপ (ওএসকে)",
      customerName: "Jahidul Islam",
      quantityReturned: 1,
      refundAmount: 215.00,
      refundMethod: "Cash",
      disposition: "restock",
      reason: "পণ্যটি ত্রুটিপূর্ণ ছিল",
      date: "2026-06-20T10:30:00.000Z"
    }
  ]);

  const handleAddSaleProps = async (saleData: any) => {
    const saleId = saleData.id || "SL" + Math.floor(100000 + Math.random() * 900000);
    const newSaleItem: Sale = {
      id: saleId,
      date: saleData.date || new Date().toISOString(),
      productId: saleData.productId,
      productName: saleData.productName,
      unitPrice: Number(saleData.unitPrice),
      quantity: Number(saleData.quantity),
      totalPrice: Number(saleData.totalPrice),
      profit: Number(saleData.totalPrice) - (Number(saleData.purchasePriceAtTime || 0) * Number(saleData.quantity)),
      customerName: saleData.customerName,
      paymentMethod: saleData.paymentMethod || 'Cash',
    };

    setSales(prev => [newSaleItem, ...prev]);
    import('./salesSyncQueue').then(m => m.enqueueSales([newSaleItem])).catch(() => {});

    // Update products state stock
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === saleData.productId) {
        const qty = Number(saleData.quantity);
        const newStock = Math.max(0, p.stock - qty);
        import('./salesSyncQueue').then(m => m.enqueueStockUpdate(p.id, -qty, p.name, newStock)).catch(() => {});
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  // Suppliers management state matching the screenshot
  const [suppliers, setSuppliers] = useState<any[]>(() => {
    const saved = localStorage.getItem('roni_suppliers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "SUPP-001",
        name: "Unique Wholesalers Ltd",
        mobile: "+8801711223344",
        email: "wholesaler@example.com",
        phone: "02-5556677",
        gst: "GST234567BN",
        tax: "TAX54321A",
        openingBalance: 25000,
        country: "Bangladesh",
        state: "Dhaka",
        city: "Dhaka",
        postcode: "1212",
        address: "Motijheel C/A",
        createdAt: "2026-05-31"
      }
    ];
  });

  const [suppliersListPayments, setSuppliersListPayments] = useState<any[]>([
    {
      id: "PM-101",
      date: "24-05-2026",
      amount: 15000.00,
      type: "Bank Transfer",
      note: "Initial advance stock payment"
    }
  ]);

  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Form states for suppliers
  const [suppFormName, setSuppFormName] = useState('');
  const [suppFormOpeningBalance, setSuppFormOpeningBalance] = useState('0.00');
  const [suppFormMobile, setSuppFormMobile] = useState('');
  const [suppFormCountry, setSuppFormCountry] = useState('-Select-');
  const [suppFormState, setSuppFormState] = useState('Select State');
  const [suppFormEmail, setSuppFormEmail] = useState('');
  const [suppFormPhone, setSuppFormPhone] = useState('');
  const [suppFormCity, setSuppFormCity] = useState('');
  const [suppFormGst, setSuppFormGst] = useState('');
  const [suppFormPostcode, setSuppFormPostcode] = useState('');
  const [suppFormTax, setSuppFormTax] = useState('');
  const [suppFormAddress, setSuppFormAddress] = useState('');

  // Persist suppliers array to storage
  React.useEffect(() => {
    localStorage.setItem('roni_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Global search filters
  const [posSearch, setPosSearch] = useState<string>('');
  const [posCategory, setPosCategory] = useState<string>('ALL');
  const [gridColumns, setGridColumns] = useState<number>(4);

  // POS Selling States
  const [directSellProduct, setDirectSellProduct] = useState<Product | null>(null);
  const [sellQty, setSellQty] = useState<number>(1);
  const [sellCustomer, setSellCustomer] = useState<string>('Walk-in Customer');
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellPayment, setSellPayment] = useState<string>('Cash');

  // Interactive Cart-Based POS States
  const [posCart, setPosCart] = useState<{
    product: Product;
    quantity: number;
    customPrice: number;
    discount: number;
    tax: number;
  }[]>([]);
  const [posWarehouse, setPosWarehouse] = useState<string>('Soft Forest');
  const [posSlSearch, setPosSlSearch] = useState<string>('SL');
  const [posInvoiceNum, setPosInvoiceNum] = useState<string>('573');
  const [posSelectedCustomerName, setPosSelectedCustomerName] = useState<string>('Walk-in customer');
  const [posBrandFilter, setPosBrandFilter] = useState<string>('ALL');
  const [sendMessageToCustomer, setSendMessageToCustomer] = useState<boolean>(true);
  const [posHoldCarts, setPosHoldCarts] = useState<{ id: string; customerName: string; items: any[]; savedAt: string }[]>([]);
  const [isHoldListOpen, setIsHoldListOpen] = useState<boolean>(false);

  // Inventory & Product Modal States
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [isInventoryScannerOpen, setIsInventoryScannerOpen] = useState<boolean>(false);

  const handleInventoryBarcodeScan = (barcode: string) => {
    setInventorySearch(barcode);
    showToast(
      lang === 'bn' 
        ? `ইনভেন্টরি সার্চ কোড "${barcode}" দিয়ে আপডেট করা হয়েছে!` 
        : `Inventory search updated to code "${barcode}"!`, 
      "success"
    );
  };
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('-All Warehouses-');
  const [selectedItemTypeFilter, setSelectedItemTypeFilter] = useState<string>('All');
  const [entriesLimit, setEntriesLimit] = useState<number>(10);
  // Advanced item-module filters, pagination & bulk actions
  const [showAdvFilters, setShowAdvFilters] = useState<boolean>(false);
  const [advCategoryFilter, setAdvCategoryFilter] = useState<string>('');
  const [advBrandFilter, setAdvBrandFilter] = useState<string>('');
  const [advVariantFilter, setAdvVariantFilter] = useState<string>('');
  const [advUnitFilter, setAdvUnitFilter] = useState<string>('');
  const [advSupplierFilter, setAdvSupplierFilter] = useState<string>('');
  const [advWarrantyFilter, setAdvWarrantyFilter] = useState<string>(''); // '', 'tracked', 'active', 'expired', 'none'
  const [advStockFilter, setAdvStockFilter] = useState<string>(''); // '', 'in', 'low', 'out', 'negative'
  const [productPage, setProductPage] = useState<number>(1);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState<boolean>(false);
  const [infiniteVisible, setInfiniteVisible] = useState<number>(20);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkEditPrice, setBulkEditPrice] = useState<string>('');
  const [bulkEditCategory, setBulkEditCategory] = useState<string>('');
  const [isBulkEditOpen, setIsBulkEditOpen] = useState<boolean>(false);
  const [activeRowActionMenuId, setActiveRowActionMenuId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  
// Product Entry Controller Ref/Vars - Rich fields matching screenshot
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdSKU, setNewProdSKU] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('Electronics');
  const [newProdPurPrice, setNewProdPurPrice] = useState<number>(0);
  const [newProdSelPrice, setNewProdSelPrice] = useState<number>(0);
  const [newProdStock, setNewProdStock] = useState<number>(0);
  const [newProdUnit, setNewProdUnit] = useState<string>('Pcs');

  // Supplementary field states to match the exact layout in the user's uploaded image
  const [newProdBrand, setNewProdBrand] = useState<string>('Samsung');
  const [newProdItemGroup, setNewProdItemGroup] = useState<string>('Single');
  const [newProdHSN, setNewProdHSN] = useState<string>('');
  const [newProdAlertQty, setNewProdAlertQty] = useState<number>(5);
  const [newProdSellerPoints, setNewProdSellerPoints] = useState<number>(0);
  const [newProdBarcode, setNewProdBarcode] = useState<string>('');
  const [newProdDescription, setNewProdDescription] = useState<string>('');
  const [newProdDiscountType, setNewProdDiscountType] = useState<string>('Percentage(%)');
  const [newProdDiscount, setNewProdDiscount] = useState<string>('0.00');
  const [newProdTax, setNewProdTax] = useState<string>('15%');
  const [newProdPriceWithoutTax, setNewProdPriceWithoutTax] = useState<number>(0);
  const [newProdTaxType, setNewProdTaxType] = useState<string>('Inclusive');
  const [newProdProfitMargin, setNewProdProfitMargin] = useState<string>('20');
  const [newProdMRP, setNewProdMRP] = useState<number>(0);
  const [newProdWarehouse, setNewProdWarehouse] = useState<string>('Soft Forest');
  const [newProdImageFile, setNewProdImageFile] = useState<string | null>(null);
  const [newProdItemType, setNewProdItemType] = useState<'ITEM' | 'SERVICE'>('ITEM');

  // Dynamic lists with helper functions to append inline
  const [brandsList, setBrandsList] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('roni_brands_v1') : null;
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p) && p.length) return p;
      }
    } catch (e) {}
    return ['Samsung', 'Realme', 'Xiaomi', 'Hoco', 'Oraimo', 'Apple'];
  });
  // Helper to normalize and deduplicate categories
  const sanitizeCategoryList = (raw: any): string[] => {
    if (!Array.isArray(raw)) return [];
    const list: string[] = [];
    const seen = new Set<string>();
    raw.forEach(item => {
      let name = '';
      if (typeof item === 'string') name = item.trim();
      else if (item && typeof item === 'object') name = String(item.name || item.title || item.category || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push(name);
      }
    });
    return list;
  };

  const DEFAULT_CATEGORIES = [
    'Smartphones',
    'Smart Gadgets',
    'Cables & Power Solutions',
    'Audio Devices',
    'Home Decoration',
    'Apparel',
    'Electronics',
    'Mobile Phones',
    'Computer Accessories',
    'Gadgets',
    'Peripherals'
  ];

  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    let savedList: string[] = [];
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('roni_categories_v1') : null;
      if (saved) {
        savedList = sanitizeCategoryList(JSON.parse(saved));
      }
    } catch (e) {}
    const initialProdCats = (initialProducts || []).map((p: any) => (p.category || '').trim()).filter(Boolean);
    const combined = sanitizeCategoryList([...savedList, ...initialProdCats, ...DEFAULT_CATEGORIES]);
    return combined.length > 0 ? combined : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    try { localStorage.setItem('roni_brands_v1', JSON.stringify(brandsList)); } catch (e) {}
  }, [brandsList]);

  useEffect(() => {
    try { localStorage.setItem('roni_categories_v1', JSON.stringify(categoriesList)); } catch (e) {}
  }, [categoriesList]);

  // Keep categories list updated if products have categories not in list
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const prodCats = products.map((p: any) => (p.category || '').trim()).filter(Boolean);
      if (prodCats.length > 0) {
        setCategoriesList(prev => {
          const sanitizedPrev = sanitizeCategoryList(prev);
          const existingLower = new Set(sanitizedPrev.map(c => c.toLowerCase()));
          const newToAdd = prodCats.filter(c => !existingLower.has(c.toLowerCase()));
          if (newToAdd.length > 0) {
            const next = sanitizeCategoryList([...sanitizedPrev, ...newToAdd]);
            try { localStorage.setItem('roni_categories_v1', JSON.stringify(next)); } catch (e) {}
            return next;
          }
          return sanitizedPrev;
        });
      }
    }
  }, [products]);

  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catModalMode, setCatModalMode] = useState<'add' | 'edit'>('add');
  const [catBeingEdited, setCatBeingEdited] = useState<string | null>(null);
  const [catInputName, setCatInputName] = useState<string>('');
  const [catSearchQuery, setCatSearchQuery] = useState<string>('');
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [selectedCatForView, setSelectedCatForView] = useState<string | null>(null);
  const [catViewSearch, setCatViewSearch] = useState<string>('');

  function openAddCategoryModal() {
    setCatModalMode('add');
    setCatBeingEdited(null);
    setCatInputName('');
    setIsCatModalOpen(true);
  }

  function openEditCategoryModal(cat: string) {
    setCatModalMode('edit');
    setCatBeingEdited(cat);
    setCatInputName(cat);
    setIsCatModalOpen(true);
  }

  function handleSaveCategorySubmit() {
    const trimmed = catInputName.trim();
    if (!trimmed) {
      showToast(lang === 'bn' ? "অনুগ্রহ করে ক্যাটাগরির নাম প্রদান করুন!" : "Please enter category name!", "error");
      return;
    }

    if (catModalMode === 'add') {
      if (categoriesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        showToast(lang === 'bn' ? "এই ক্যাটাগরি ইতিমধ্যে তালিকাভুক্ত রয়েছে!" : "Category already exists!", "error");
        return;
      }
      const next = [...categoriesList, trimmed];
      setCategoriesList(next);
      try { localStorage.setItem('roni_categories_v1', JSON.stringify(next)); } catch (e) {}
      showToast(lang === 'bn' ? `"${trimmed}" ক্যাটাগরি সফলভাবে যোগ হয়েছে!` : `Category "${trimmed}" added successfully!`, "success");
    } else if (catModalMode === 'edit' && catBeingEdited) {
      if (trimmed.toLowerCase() !== catBeingEdited.toLowerCase() && categoriesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        showToast(lang === 'bn' ? "এই নামের আরেকটি ক্যাটাগরি ইতিমধ্যে রয়েছে!" : "Another category with this name already exists!", "error");
        return;
      }
      const next = categoriesList.map(c => c === catBeingEdited ? trimmed : c);
      setCategoriesList(next);
      try { localStorage.setItem('roni_categories_v1', JSON.stringify(next)); } catch (e) {}
      setProducts(prev => prev.map((p: any) => (p.category === catBeingEdited || (p.category && p.category.toLowerCase() === catBeingEdited.toLowerCase())) ? { ...p, category: trimmed } : p));
      showToast(lang === 'bn' ? `"${trimmed}" ক্যাটাগরি সফলভাবে আপডেট হয়েছে!` : `Category "${trimmed}" updated!`, "success");
    }
    setIsCatModalOpen(false);
  }
  const UNIT_CATEGORIES = ['General','Weight','Liquid','Length','Fiber & Cable','Hardware','Grocery','Pharmacy','Telecom','Garments','Custom'];
  const DEFAULT_UNITS_BY_CATEGORY: Record<string, string[]> = {
    'General': ['Piece','Box','Carton','Set','Packet','Bag','Pair','Dozen','Bundle','Pcs'],
    'Weight': ['mg','g','kg','ton'],
    'Liquid': ['ml','liter','gallon','Ltr'],
    'Length': ['mm','cm','meter','kilometer','inch','foot','yard','Meter'],
    'Fiber & Cable': ['feet','roll','spool','core'],
    'Hardware': ['rod','pipe','sheet','sack','drum'],
    'Grocery': ['bottle','jar','tray','sachet'],
    'Pharmacy': ['tablet','strip','vial','capsule','injection'],
    'Telecom': ['device','accessory','sim','port'],
    'Garments': ['roll','yard','bundle'],
    'Custom': [],
  };
  const [unitsByCategory, setUnitsByCategory] = useState<Record<string, string[]>>(function() {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('roni_units_by_category') : null;
      if (saved) return { ...DEFAULT_UNITS_BY_CATEGORY, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_UNITS_BY_CATEGORY;
  });
  useEffect(function() {
    try { localStorage.setItem('roni_units_by_category', JSON.stringify(unitsByCategory)); } catch (e) {}
  }, [unitsByCategory]);
  const unitsList = React.useMemo(function() {
    const set = new Set<string>();
    UNIT_CATEGORIES.forEach(function(c) { (unitsByCategory[c] || []).forEach(function(u) { set.add(u); }); });
    return Array.from(set);
  }, [unitsByCategory]);
  const setUnitsList = function(updater: any) {
    // Legacy compat: append newly added units to "Custom" bucket
    const next = typeof updater === 'function' ? updater(unitsList) : updater;
    const added = (next || []).filter(function(u: string) { return !unitsList.includes(u); });
    if (added.length === 0) return;
    setUnitsByCategory(function(prev) {
      const cust = prev['Custom'] || [];
      return { ...prev, Custom: cust.concat(added.filter(function(u: string) { return !cust.includes(u); })) };
    });
  };
  // Map product category → relevant unit categories
  const PRODUCT_TO_UNIT_CATS: Record<string, string[]> = {
    'Smartphones': ['Telecom','General'],
    'Smart Gadgets': ['Telecom','General'],
    'Cables & Power Solutions': ['Telecom','Fiber & Cable','Length','General'],
    'Apparel': ['Garments','Length','General'],
    'Garments': ['Garments','Length','General'],
    'Pharmacy': ['Pharmacy','General'],
    'Medicine': ['Pharmacy','General'],
    'Grocery': ['Grocery','Weight','Liquid','General'],
    'Food': ['Grocery','Weight','Liquid','General'],
    'Hardware': ['Hardware','Length','Weight','General'],
    'Home Decoration': ['General','Length'],
  };
  const getRelevantUnits = function(productCategory: string | undefined): string[] {
    if (!productCategory) return unitsList;
    const cats = PRODUCT_TO_UNIT_CATS[productCategory] || ['General','Custom'];
    const merged = cats.concat(['Custom']);
    const set = new Set<string>();
    merged.forEach(function(c) { (unitsByCategory[c] || []).forEach(function(u) { set.add(u); }); });
    return Array.from(set);
  };
  const [taxesList, setTaxesList] = useState<string[]>(['0%', '5%', '12%', '15%', '18%']);
  const [warehousesList, setWarehousesList] = useState<string[]>(['Soft Forest', 'Main Depot', 'Sub Office']);

  // Dynamic quick-add trigger functions
  function handleQuickAddBrand() {
    const val = prompt(lang === 'bn' ? "নতুন ব্র্যান্ড লিখুন:" : "Enter new Brand name:");
    if (val && val.trim()) {
      setBrandsList(prev => [...prev, val.trim()]);
      setNewProdBrand(val.trim());
      showToast(lang === 'bn' ? "নতুন ব্র্যান্ড যোগ করা হল" : "New Brand added!", "success");
    }
  }

  function handleQuickAddCategory() {
    openAddCategoryModal();
  }

  function handleQuickAddUnit() {
    const val = prompt(lang === 'bn' ? "নতুন একক পরিমাপ লিখুন:" : "Enter new Unit measurement:");
    if (val && val.trim()) {
      setUnitsList(prev => [...prev, val.trim()]);
      setNewProdUnit(val.trim());
      showToast(lang === 'bn' ? "নতুন একক পরিমাপ যোগ করা হল" : "New Unit added!", "success");
    }
  }

  function handleQuickAddTax() {
    const val = prompt(lang === 'bn' ? "নতুন ট্যাক্স বা ভ্যাট পার্সেন্টেজ লিখুন (যেমন: 7%):" : "Enter new Tax percentage (e.g. 7%):");
    if (val && val.trim()) {
      setTaxesList(prev => [...prev, val.trim()]);
      setNewProdTax(val.trim());
      showToast(lang === 'bn' ? "নতুন ট্যাক্স পার্সেন্টেজ যোগ করা হল" : "New Tax rate added!", "success");
    }
  }

  // CSV Parsing State
  const [csvPreviewRows, setCsvPreviewRows] = useState<Product[]>([]);
  const [csvText, setCsvText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Customers Management Model States
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustEmail, setNewCustEmail] = useState<string>('');
  const [newCustDue, setNewCustDue] = useState<number>(0);
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(function() {
      setToastMsg(function(curr) { return curr === msg ? null : curr; });
    }, 4000);
  }

  // Reports filters
  const [reportsPreset, setReportsPreset] = useState<string>('month');
  const [reportsCustomStart, setReportsCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [reportsCustomEnd, setReportsCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [printPreviewMode, setPrintPreviewMode] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  // High Fidelity Reports Custom States & Helpers
  const [reportLang, setReportLang] = useState<'bn' | 'en'>('bn');
  const [reportShopTitleBn, setReportShopTitleBn] = useState<string>('রনি টেলিকম');
  const [reportShopTitleEn, setReportShopTitleEn] = useState<string>('Roni Telecom');

  // Guest Mode & Backup states
  const [isGuestMode, setIsGuestMode] = useState<boolean>(true);
  const [backupProducts, setBackupProducts] = useState<Product[] | null>(null);
  const [backupSales, setBackupSales] = useState<Sale[] | null>(null);
  const [backupCustomers, setBackupCustomers] = useState<Customer[] | null>(null);

  const [localBackups, setLocalBackups] = useState<Array<{
    id: string;
    timestamp: string;
    fileName: string;
    productCount: number;
    salesCount: number;
    customerCount: number;
    data?: any;
  }>>(function() {
    try {
      const saved = localStorage.getItem('fardous_backups');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Local storage backup read error:", e);
    }
    return [];
  });

  const [isDriveConfigOpen, setIsDriveConfigOpen] = useState<boolean>(false);
  const [driveClientId, setDriveClientId] = useState<string>('');
  const [driveApiKey, setDriveApiKey] = useState<string>('');
  const [driveFolderName, setDriveFolderName] = useState<string>('POS_Backup_Store');
  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Dynamic KPI KPI cards states & management
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpi[]>(function() {
    try {
      const saved = localStorage.getItem('glorious_dashboard_kpis');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((kpi: any) => 
            kpi && 
            kpi.id !== 'xxx' && 
            (!kpi.titleBn || !kpi.titleBn.toLowerCase().includes('xxx')) && 
            (!kpi.titleEn || !kpi.titleEn.toLowerCase().includes('xxx'))
          );
        }
      }
    } catch (_) {}
    return [
      { id: 'revenue', titleBn: "CASH SALE", titleEn: "CASH SALE", icon: "💰", valueType: 'revenue', badgeBg: 'bg-[#1a5cff]', iconBg: 'bg-[#fef9df] border-[#fde047]' },
      { id: 'orders', titleBn: "DUE SALE", titleEn: "DUE SALE", icon: "📋", valueType: 'orders', badgeBg: 'bg-emerald-500', iconBg: 'bg-[#ecfdf5] border-[#a7f3d0]' },
      { id: 'products', titleBn: "EXPENSE", titleEn: "EXPENSE", icon: "📦", valueType: 'products', badgeBg: 'bg-purple-600', iconBg: 'bg-[#faf5ff] border-[#f3e8ff]' },
      { id: 'low-stock', titleBn: "LOW STOCK", titleEn: "LOW STOCK", icon: "⚠️", valueType: 'lowstock', badgeBg: 'bg-red-600', iconBg: 'bg-[#fff5f5] border-[#feb2b2]' }
    ];
  });

  const [isAddKpiOpen, setIsAddKpiOpen] = useState<boolean>(false);
  const [editingKpi, setEditingKpi] = useState<DashboardKpi | null>(null);

  // Add Card State
  const [newKpiTitleBn, setNewKpiTitleBn] = useState<string>('');
  const [newKpiTitleEn, setNewKpiTitleEn] = useState<string>('');
  const [newKpiIcon, setNewKpiIcon] = useState<string>('📊');
  const [newKpiValueType, setNewKpiValueType] = useState<'revenue' | 'orders' | 'products' | 'lowstock' | 'custom'>('custom');
  const [newKpiCustomBn, setNewKpiCustomBn] = useState<string>('');
  const [newKpiCustomEn, setNewKpiCustomEn] = useState<string>('');
  const [newKpiBadgeBg, setNewKpiBadgeBg] = useState<string>('bg-blue-600');
  const [newKpiIconBg, setNewKpiIconBg] = useState<string>('bg-blue-500/10 text-blue-500');

  function saveDashboardKpis(kpis: DashboardKpi[]) {
    setDashboardKpis(kpis);
    try {
      localStorage.setItem('glorious_dashboard_kpis', JSON.stringify(kpis));
    } catch (_) {}
  }

  function handleToggleGuestMode() {
    if (isGuestMode) {
      if (backupProducts !== null) setProducts(backupProducts);
      if (backupSales !== null) setSales(backupSales);
      if (backupCustomers !== null) setCustomers(backupCustomers);
      setIsGuestMode(false);
      setBackupProducts(null);
      setBackupSales(null);
      setBackupCustomers(null);
      showToast(lang === 'bn' ? "সফলভাবে গেস্ট মোড সম্পন্ন হয়েছে! পূর্বের ডাটা ফেরত আনা হয়েছে।" : "Guest Mode exited! Previous data has been restored.", "success");
    } else {
      setBackupProducts(products);
      setBackupSales(sales);
      setBackupCustomers(customers);
      setProducts([]);
      setSales([]);
      setCustomers([]);
      setIsGuestMode(true);
      showToast(lang === 'bn' ? "গেস্ট মোড সক্রিয় করা হয়েছে! ডাটা সাময়িকভাবে খালি দেখাবে।" : "Guest Mode activated! Your active data is safely backed up in the background.", "info");
    }
  }

  function handleLocalBackup() {
    try {
      const now = new Date();
      const timestampStr = now.getFullYear() + "-" + 
        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getDate()).padStart(2, '0') + " " + 
        String(now.getHours()).padStart(2, '0') + ":" + 
        String(now.getMinutes()).padStart(2, '0');
      
      const newBackupId = String(localBackups.length + 1);
      const newBackup = {
        id: newBackupId,
        timestamp: timestampStr,
        fileName: "manual_backup_v" + newBackupId + ".json",
        productCount: products.length,
        salesCount: sales.length,
        customerCount: customers.length,
        data: {
          products,
          sales,
          customers,
          shopName,
          shopAddress,
          shopPhone
        }
      };

      const updated = [newBackup, ...localBackups];
      setLocalBackups(updated);
      localStorage.setItem('fardous_backups', JSON.stringify(updated));

      showToast(lang === 'bn' 
        ? "লোকাল ব্যাকআপ সফলভাবে ব্রাউজারে সংরক্ষিত হয়েছে!" 
        : "Local backup snapshot has been successfully saved in your browser storage!", "success"
      );
    } catch (e) {
      console.error("Local backup write failed:", e);
      showToast("Error taking local backup: " + e, "error");
    }
  }

  function handleRestoreLocalBackup(backupId: string) {
    const item = localBackups.find(b => b.id === backupId);
    if (!item) return;
    
    const confirmRestore = window.confirm(lang === 'bn' 
      ? `আপনি কি সত্যিই এই ব্যাকআপটি (${item.timestamp}) রিস্টোর করতে চান? এটি আপনার বর্তমান সকল পরিবর্তন প্রতিস্থাপন করবে!` 
      : `Are you sure you want to restore the backup from (${item.timestamp})? This will overwrite all of your current active records!`
    );
    if (!confirmRestore) return;

    if (!item.data) {
      setProducts(initialProducts);
      setSales(initialSales);
      setCustomers(initialCustomers);
      showToast(lang === 'bn' ? "ডিফল্ট সিস্টেম ব্যাকআপ রিস্টোর করা হয়েছে!" : "Default system backup restored!", "success");
      return;
    }

    try {
      const d = item.data;
      if (Array.isArray(d.products)) setProducts(d.products);
      if (Array.isArray(d.sales)) setSales(d.sales);
      if (Array.isArray(d.customers)) setCustomers(d.customers);
      if (d.shopName) setShopName(d.shopName);
      if (d.shopAddress) setShopAddress(d.shopAddress);
      if (d.shopPhone) setShopPhone(d.shopPhone);
      
      showToast(lang === 'bn' 
        ? "ব্যাকআপ রিস্টোর সফল হয়েছে! সকল ডাটা আপডেট করা হয়েছে।" 
        : "Backup restored successfully! All records have been updated.", "success"
      );
    } catch (err) {
      showToast("Restore failed: " + err, "error");
    }
  }

  function handleDeleteLocalBackup(backupId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const conf = window.confirm(lang === 'bn' ? "আপনি কি এই ব্যাকআপ ফাইলটি ডিলিট করতে চান?" : "Are you sure you want to delete this backup slot?");
    if (!conf) return;

    const updated = localBackups.filter(b => b.id !== backupId);
    setLocalBackups(updated);
    localStorage.setItem('fardous_backups', JSON.stringify(updated));
    showToast(lang === 'bn' ? "ব্যাকআপ সফলভাবে মুছে ফেলা হয়েছে।" : "Backup deleted successfully.", "success");
  }

  function handleJsonExport() {
    try {
      const pack = {
        app: "Fardous Computer & IT POS Manager",
        timestamp: new Date().toISOString(),
        shop: { shopName, shopAddress, shopPhone },
        products,
        sales,
        customers
      };
      
      const jsonStr = JSON.stringify(pack, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "POS_Data_Backup_" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(lang === 'bn' 
        ? "JSON ফাইল এক্সপোর্ট সফল হয়েছে!" 
        : "JSON data export successful! File downloaded.", "success"
      );
    } catch (e) {
      showToast("Export failed: " + e, "error");
    }
  }

  function handleJsonImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!parsed || (!Array.isArray(parsed.products) && !Array.isArray(parsed.sales))) {
          showToast(lang === 'bn' 
            ? "ভুল ফাইল ফরম্যাট! ব্যাকআপ ফাইলে পণ্য বা বিক্রয়ের ডাটা থাকতে হবে।" 
            : "Invalid file formats! The imported backup must contain lists of products, sales or customers.", "error"
          );
          return;
        }

        const confirmImport = window.confirm(lang === 'bn'
          ? "আপনি কি সত্যিই এই ফাইলটি থেকে রিস্টোর করতে চান? আপনার বর্তমান সকল ডাটা প্রতিস্থাপিত হবে!"
          : "Are you sure you want to import from this file? It will replace all of your current products, sales, and customers lists."
        );
        if (!confirmImport) return;

        if (Array.isArray(parsed.products)) setProducts(parsed.products);
        if (Array.isArray(parsed.sales)) setSales(parsed.sales);
        if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
        
        if (parsed.shop) {
          if (parsed.shop.shopName) setShopName(parsed.shop.shopName);
          if (parsed.shop.shopAddress) setShopAddress(parsed.shop.shopAddress);
          if (parsed.shop.shopPhone) setShopPhone(parsed.shop.shopPhone);
        }

        showToast(lang === 'bn' 
          ? "JSON ব্যাকআপ ইম্পোর্ট সফল হয়েছে! সকল ডাটা রিলোড করা হয়েছে।" 
          : "JSON Backup imported successfully! All records have been successfully initialized.", "success"
        );
      } catch (err) {
        showToast("JSON parsing error: " + err, "error");
      }
    };
    reader.readAsText(file);
  }

  function handleSaveDriveConnect() {
    setDriveConnected(true);
    setIsDriveConfigOpen(false);
    showToast(lang === 'bn' ? "গুগল ড্রাইভ সফলভাবে সংযুক্ত হয়েছে!" : "Google Drive configuration completed successfully and connected!", "success");
  }

  React.useEffect(function() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('print') === 'true') {
        setPrintPreviewMode(true);
        const lParam = params.get('lang');
        if (lParam === 'bn' || lParam === 'en') {
          setReportLang(lParam);
        }
        setTimeout(function() {
          try {
            window.print();
          } catch (e) {
            console.error("Auto print error in new tab:", e);
          }
        }, 1200);
      }
    }
  }, []);

  // Cleanup effect to automatically wipe "xxx" KPI card from localStorage and state
  React.useEffect(function() {
    if (dashboardKpis && Array.isArray(dashboardKpis)) {
      const cleaned = dashboardKpis.filter(kpi => 
        kpi && 
        kpi.id !== 'xxx' && 
        (!kpi.titleBn || !kpi.titleBn.toLowerCase().includes('xxx')) && 
        (!kpi.titleEn || !kpi.titleEn.toLowerCase().includes('xxx'))
      );
      if (cleaned.length !== dashboardKpis.length) {
        setDashboardKpis(cleaned);
        try {
          localStorage.setItem('glorious_dashboard_kpis', JSON.stringify(cleaned));
        } catch (_) {}
      }
    }
  }, [dashboardKpis]);

  // Load store settings on component mount
  React.useEffect(function() {
    try {
      const storedShopSettings = localStorage.getItem('saim_store_settings');
      if (storedShopSettings) {
        const d = JSON.parse(storedShopSettings);
        if (d.shopName) setShopName(d.shopName);
        if (d.shopAddress) setShopAddress(d.shopAddress);
        if (d.shopPhone) setShopPhone(d.shopPhone);
        if (d.storeCode) setStoreCode(d.storeCode);
        if (d.storeMobile) setStoreMobile(d.storeMobile);
        if (d.storeEmail) setStoreEmail(d.storeEmail);
        if (d.storePhoneVal) setStorePhoneVal(d.storePhoneVal);
        if (d.gstNumber) setGstNumber(d.gstNumber);
        if (d.taxNumber) setTaxNumber(d.taxNumber);
        if (d.panNumber) setPanNumber(d.panNumber);
        if (d.storeWebsite) setStoreWebsite(d.storeWebsite);
        if (typeof d.showSignature === 'boolean') setShowSignature(d.showSignature);
        if (d.bankDetails) setBankDetails(d.bankDetails);
        if (d.storeCountry) setStoreCountry(d.storeCountry);
        if (d.storeState) setStoreState(d.storeState);
        if (d.storeCity) setStoreCity(d.storeCity);
        if (d.storePostcode) setStorePostcode(d.storePostcode);
        if (d.storeAddressVal) setStoreAddressVal(d.storeAddressVal);
        if (d.logoPreview) setLogoPreview(d.logoPreview);
        if (d.sigPreview) setSigPreview(d.sigPreview);
        if (d.storeFontSize) setStoreFontSize(d.storeFontSize);
      }
    } catch (e) {
      console.error("Error loading store settings from localStorage:", e);
    }
  }, []);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast(lang === 'bn' ? "ফাইলের সাইজ ১ মেগাবাইটের কম হতে হবে!" : "File size must be less than 1024KB!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (evt.target?.result) {
          setLogoPreview(evt.target.result as string);
          showToast(lang === 'bn' ? "লোগো সফলভাবে আপলোড হয়েছে!" : "Store Logo loaded successfully!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast(lang === 'bn' ? "ফাইলের সাইজ ১ মেগাবাইটের কম হতে হবে!" : "File size must be less than 1024KB!", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (evt.target?.result) {
          setSigPreview(evt.target.result as string);
          showToast(lang === 'bn' ? "স্বাক্ষর সফলভাবে আপলোড হয়েছে!" : "Signature loaded successfully!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUpdateSettings() {
    try {
      const settingsObject = {
        shopName,
        shopAddress: storeAddressVal,
        shopPhone: storeMobile,
        storeCode,
        storeMobile,
        storeEmail,
        storePhoneVal,
        gstNumber,
        taxNumber,
        panNumber,
        storeWebsite,
        showSignature,
        bankDetails,
        storeCountry,
        storeState,
        storeCity,
        storePostcode,
        storeAddressVal,
        logoPreview,
        sigPreview,
        storeFontSize
      };
      localStorage.setItem('saim_store_settings', JSON.stringify(settingsObject));
      localStorage.setItem('smarthisab_store_font_size', storeFontSize);
      setShopAddress(storeAddressVal);
      setShopPhone(storeMobile);
      showToast(lang === 'bn' ? "সেটিংস সফলভাবে সংরক্ষিত ও আপডেট করা হয়েছে!" : "Settings saved and synchronized successfully!", "success");
    } catch (err) {
      showToast("Settings save failed: " + err, "error");
    }
  }

  function toBnDigits(numStr: string | number): string {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(numStr).replace(/[0-9]/g, function(digit) { return bnDigits[parseInt(digit)]; });
  }

  // Smart responsive font sizing for shop brand names in sidebar and header
  function getShopNameDynamicClass(name: string, sizePref: string = 'auto'): string {
    const cleanName = (name || '').trim();
    const len = cleanName.length;

    // Explicit manual overrides if user configured fixed size in Settings:
    if (sizePref === 'sm') {
      return len > 22 ? 'text-xs sm:text-[13px] leading-snug' : 'text-sm sm:text-base leading-snug';
    }
    if (sizePref === 'lg') {
      return len > 22 ? 'text-base sm:text-lg leading-snug' : 'text-xl sm:text-2xl leading-tight';
    }
    if (sizePref === 'xl') {
      return len > 22 ? 'text-lg sm:text-xl leading-snug' : 'text-2xl sm:text-3xl leading-tight';
    }

    // Default intelligent auto-scaling based on text length:
    if (len <= 11) {
      // Very short: e.g. "রনি টেলিকম" (10 chars), "ঢাকা শপ"
      return 'text-xl sm:text-2xl leading-tight';
    } else if (len <= 17) {
      // Short-medium: e.g. "স্মার্ট ফ্যাশন" (14 chars)
      return 'text-lg sm:text-xl leading-snug';
    } else if (len <= 24) {
      // Medium-long: e.g. "জয়নাল ভেরাইটিজ স্টোর" (21 chars) - perfectly fits 2 balanced lines without huge awkward wrapping
      return 'text-[14.5px] sm:text-[15.5px] leading-snug';
    } else if (len <= 34) {
      // Long: 25-34 chars
      return 'text-[12.5px] sm:text-[13.5px] leading-tight';
    } else {
      // Extra long: > 34 chars
      return 'text-[11px] sm:text-xs leading-tight';
    }
  }

  function getFormattedReportDate(isBn: boolean) {
    const d = new Date();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    if (isBn) {
      return toBnDigits(day) + "/" + toBnDigits(month) + "/" + toBnDigits(year);
    }
    return day + "/" + month + "/" + year;
  }

  function formatCalculatedPrice(num: number, isBn: boolean) {
    const formatted = num.toLocaleString('en-US');
    if (isBn) {
      return "৳ " + toBnDigits(formatted);
    }
    return "৳ " + formatted;
  }

  function getProductIcon(name: string) {
    const n = name.toLowerCase();
    if (n.includes('phone') || n.includes('samsung') || n.includes('xiaomi') || n.includes('iphone') || n.includes('redmi') || n.includes('realme')) return '📱';
    if (n.includes('airpods') || n.includes('ear') || n.includes('headphone') || n.includes('sound') || n.includes('audio') || n.includes('bluetooth') || n.includes('neckband')) return '🎧';
    if (n.includes('power') || n.includes('bank') || n.includes('battery') || n.includes('charger')) return '🔋';
    if (n.includes('mouse') || n.includes('keyboard') || n.includes('access')) return '🖱️';
    if (n.includes('tv') || n.includes('display') || n.includes('monitor') || n.includes('bravia')) return '📺';
    return '📦';
  }

  function getReportDateRangeString() {
    const sep = reportLang === "bn" ? " থেকে " : " to ";
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();
    if (reportsPreset === "today") {
      return iso(today);
    } else if (reportsPreset === "week") {
      const s = new Date(today); s.setDate(s.getDate() - 6);
      return iso(s) + sep + iso(today);
    } else if (reportsPreset === "days15") {
      const s = new Date(today); s.setDate(s.getDate() - 14);
      return iso(s) + sep + iso(today);
    } else if (reportsPreset === "month") {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return iso(s) + sep + iso(e);
    } else if (reportsPreset === "custom") {
      return reportsCustomStart + sep + reportsCustomEnd;
    }
    return "";
  }

  function renderA4ReportSheet(rlang: 'bn' | 'en') {
    const isBn = rlang === 'bn';
    const activeShopTitle = isBn ? reportShopTitleBn : reportShopTitleEn;
    const currentFiltered = getFilteredSales(sales);
    
    // Totals
    const totalSalesSum = currentFiltered.reduce(function(acc, item) { return acc + item.totalPrice; }, 0);
    const totalQtySum = currentFiltered.reduce(function(acc, item) { return acc + item.quantity; }, 0);
    
    // Formatted Dates & Numbers
    const rangeStr = getReportDateRangeString();
    const formattedTotalSales = formatCalculatedPrice(totalSalesSum, isBn);
    const formattedTotalQty = isBn ? toBnDigits(totalQtySum) : String(totalQtySum);
    const reportDateStr = getFormattedReportDate(isBn);
    
    return (
      <div className="bg-white text-gray-900 p-8 sm:p-12 rounded-xl border border-gray-200 shadow-lg relative font-sans space-y-8 select-none w-full max-w-4xl" id="printable-report-sheet">
        {/* Print top margin/header helper - perfectly centered text alignment */}
        <div className="text-center pb-5 border-b-2 border-dashed border-blue-600/30 flex flex-col items-center justify-center">
          <span className="text-4xl block mb-2 select-none">🏪</span>
          <div className="w-full flex justify-center">
            <input
              type="text"
              value={activeShopTitle}
              onChange={function(e) {
                if (isBn) {
                  setReportShopTitleBn(e.target.value);
                } else {
                  setReportShopTitleEn(e.target.value);
                }
              }}
              className="bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 focus:outline-none text-center font-display font-bold text-2xl text-blue-805 tracking-wide cursor-text w-full max-w-md py-1"
              title={isBn ? "দোকানের নামটি পরিবর্তন করতে এখানে ক্লিক করুন" : "Click here to edit your shop title directly"}
              placeholder={isBn ? "দোকানের নাম" : "Shop Name"}
            />
          </div>
          <h2 className="text-lg font-bold text-blue-900/90 font-sans tracking-wide mt-2">
            {isBn ? "বিক্রয় রিপোর্ট" : "Sales Report Statement"}
          </h2>
          <p className="text-xs text-slate-500 font-mono font-medium bg-slate-50 border border-slate-200/60 px-3 py-1 mt-1.5 rounded-full inline-block print:border-none print:bg-transparent">
            {isBn ? "তারিখ: " : "Period: "} {rangeStr}
          </p>
        </div>

        {/* 3 Summary Blocks exactly matching image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
          {/* Card 1: Blue (Total Sales) */}
          <div className="border border-blue-500 bg-blue-50/10 p-4 rounded-xl text-center flex flex-col justify-center items-center min-h-[95px] shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              {isBn ? "মোট বিক্রয়" : "Total Sales"}
            </span>
            <span className="text-xl font-bold text-blue-700 block font-sans">
              {formattedTotalSales}
            </span>
          </div>

          {/* Card 2: Green (Total Quantity) */}
          <div className="border border-emerald-500 bg-emerald-50/10 p-4 rounded-xl text-center flex flex-col justify-center items-center min-h-[95px] shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
              {isBn ? "মোট সংখ্যা" : "Total Quantity"}
            </span>
            <span className="text-xl font-bold text-emerald-600 block font-sans">
              {isBn ? formattedTotalQty + " পিচ" : formattedTotalQty + " Pcs"}
            </span>
          </div>

          {/* Card 3: Purple (Report Date) */}
          <div className="border border-purple-500 bg-purple-50/10 p-4 rounded-xl text-center flex flex-col justify-center items-center min-h-[95px] shadow-sm">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-2">
              {isBn ? "রিপোর্ট তারিখ" : "Report Date"}
            </span>
            <span className="text-xl font-bold text-purple-600 block font-sans">
              {reportDateStr}
            </span>
          </div>
        </div>

        {/* Detailed List table exactly matching structural details of screenshot */}
        <div className="overflow-x-auto border border-gray-250 rounded-xl shadow-xs">
          <table className="w-full text-xs text-left text-gray-750 border-collapse">
            <thead>
              {/* Very clean blue headers background styled like screenshot page 1 */}
              <tr className="bg-[#ebf4fa] text-[#00385c] font-bold uppercase text-[10.5px] border-y border-slate-350">
                <th className="px-5 py-3.5 border-r border-[#d4e1f0]">{isBn ? "পণ্যের নাম" : "Product Name"}</th>
                <th className="px-4 py-3.5 border-r border-[#d4e1f0] text-center whitespace-nowrap">{isBn ? "তারিখ" : "Date"}</th>
                <th className="px-4 py-3.5 border-r border-[#d4e1f0] text-right">{isBn ? "টাকা" : "Price"}</th>
                <th className="px-4 py-3.5 border-r border-[#d4e1f0] text-center">{isBn ? "সংখ্যা" : "Quantity"}</th>
                <th className="px-4 py-3.5 border-r border-[#d4e1f0] text-right">{isBn ? "মোট" : "Total"}</th>
                <th className="px-4 py-3.5 text-center">{isBn ? "স্টক" : "Stock"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentFiltered.length > 0 ? (
                currentFiltered.map(function(sale) {
                  const product = products.find(function(p) { return p.id === sale.productId; });
                  const stockLeft = product ? product.stock : 0;
                  const unitLabel = isBn ? "পিচ" : "Pcs";
                  const priceLabel = "৳ " + sale.unitPrice.toLocaleString('en-US');
                  const totalLabel = "৳ " + sale.totalPrice.toLocaleString('en-US');
                  
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 duration-100 text-[11px] text-gray-850">
                      {/* Product Name with device layout emoji icon */}
                      <td className="px-5 py-3.5 border-r border-gray-200 font-bold text-gray-900 leading-tight">
                        <span className="mr-2 text-xs inline-block shrink-0">{getProductIcon(sale.productName)}</span>
                        {sale.productName}
                      </td>
                      <td className="px-4 py-3.5 border-r border-gray-200 text-center text-gray-500 whitespace-nowrap font-medium">
                        {sale.date}
                      </td>
                      <td className="px-4 py-3.5 border-r border-gray-200 text-right font-medium font-mono text-gray-700">
                        {isBn ? toBnDigits(priceLabel) : priceLabel}
                      </td>
                      <td className="px-4 py-3.5 border-r border-gray-200 text-center text-gray-900 font-semibold whitespace-nowrap">
                        {isBn ? toBnDigits(sale.quantity) + " " + unitLabel : sale.quantity + " " + unitLabel}
                      </td>
                      <td className="px-4 py-3.5 border-r border-gray-200 text-right font-bold text-gray-955 font-mono">
                        {isBn ? toBnDigits(totalLabel) : totalLabel}
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-500 whitespace-nowrap font-medium">
                        {isBn ? toBnDigits(stockLeft) + " " + unitLabel : stockLeft + " " + unitLabel}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-bold tracking-wide uppercase text-xs">
                    {isBn ? "কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।" : "No transaction records matches filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Authorities signature layout styled exactly like screenshot page 1 */}
        <div className="flex flex-col items-center justify-center pt-6 text-center space-y-1.5 text-xs text-gray-700 select-none">
          <span className="font-semibold block text-[11px]">{isBn ? "ধন্যবাদান্তে," : "Best Regards,"}</span>
          <span className="font-bold text-blue-800 tracking-wide block uppercase text-[12px]">
            {isBn ? activeShopTitle + " কর্তৃপক্ষ" : activeShopTitle + " Authority"}
          </span>
        </div>
      </div>
    );
  }

  // Multi-tab active translations accessor
  const t = T[lang];

  // Helper translators for category keys to assure TypeScript compliance
  function getTranslatedCategory(catKey: string) {
    return (t.catMap as Record<string, string>)[catKey] || catKey;
  }

  // Pure functions for Sales metrics calculations
  function getSalesMetrics() {
    var revenue = 0;
    var profit = 0;
    for (var i = 0; i < sales.length; i++) {
      revenue = revenue + sales[i].totalPrice;
      profit = profit + sales[i].profit;
    }
    var totalDues = 0;
    for (var j = 0; j < customers.length; j++) {
      totalDues = totalDues + customers[j].dueAmount;
    }
    return {
      revenue: revenue,
      profit: profit,
      salesCount: sales.length,
      totalDues: totalDues
    };
  }

  // Handlers for POS transactional workflow
  function handleOpenDirectSell(prod: Product) {
    setDirectSellProduct(prod);
    setSellQty(1);
    setSellPrice(prod.sellingPrice);
    setSellCustomer('Walk-in Customer');
    setSellPayment('Cash');
  }

  function handleConfirmSell() {
    if (!directSellProduct) return;
    if (sellQty <= 0) {
      showToast(lang === 'bn' ? "ভুল পরিমাপ!" : "Invalid Quantity!", "error");
      return;
    }
    if (directSellProduct.stock < sellQty) {
      showToast(lang === 'bn' ? "স্টক শেষ!" : "Stock limit exceeded!", "error");
      return;
    }

    var computedProfit = (sellPrice - directSellProduct.purchasePrice) * sellQty;
    var computedTotal = sellPrice * sellQty;

    // Create Sale record
    var newSale: Sale = {
      id: "SALE-" + (sales.length + 101),
      date: new Date().toISOString().slice(0, 10),
      productId: directSellProduct.id,
      productName: directSellProduct.name,
      unitPrice: sellPrice,
      quantity: sellQty,
      totalPrice: computedTotal,
      profit: computedProfit,
      customerName: sellCustomer,
      paymentMethod: sellPayment
    };

    // Update Product Stock levels
    var updatedProducts = products.map(function(p) {
      if (p.id === directSellProduct.id) {
        const newStock = Math.max(0, p.stock - sellQty);
        import('./salesSyncQueue').then(m => m.enqueueStockUpdate(p.id, -sellQty, p.name, newStock)).catch(() => {});
        return { ...p, stock: newStock };
      }
      return p;
    });

    // Update Customer profile purchase stats
    var updatedCustomers = customers.map(function(c) {
      if (c.name === sellCustomer) {
        return { ...c, totalPurchase: c.totalPurchase + computedTotal };
      }
      return c;
    });

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    import('./salesSyncQueue').then(m => m.enqueueSales([newSale])).catch(() => {});
    setCustomers(updatedCustomers);
    setDirectSellProduct(null);
  }

  // --- POS Cart Helper Functions ---
  function addProductToPOSCart(prod: Product) {
    if (prod.stock <= 0) {
      showToast(lang === 'bn' ? "পণ্যটি স্টকে নেই!" : "Out of stock!", "error");
      return;
    }
    try {
      const chk = isBatchSellable(prod.id);
      if (!chk.sellable) {
        showToast(lang === 'bn' ? "মেয়াদোত্তীর্ণ পণ্য বিক্রি করা যাবে না!" : "Expired product — cannot sell!", "error");
        return;
      }
    } catch {}
    setPosCart(function(currentCart) {
      var existingIndex = currentCart.findIndex(function(item) {
        return item.product.id === prod.id;
      });
      if (existingIndex > -1) {
        var item = currentCart[existingIndex];
        if (item.quantity >= prod.stock) {
          showToast(lang === 'bn' ? "স্টকের অতিরিক্ত যোগ করা সম্ভব নয়!" : "Cannot exceed available stock!", "error");
          return currentCart;
        }
        var updated = [...currentCart];
        updated[existingIndex] = {
          ...item,
          quantity: item.quantity + 1
        };
        return updated;
      } else {
        return [
          ...currentCart,
          {
            product: prod,
            quantity: 1,
            customPrice: prod.sellingPrice,
            discount: 0,
            tax: 0
          }
        ];
      }
    });
  }

  function handlePOSCheckout(method: string, invoiceDiscount: number = 0, paymentInfo?: { paidAmount?: number; changeReturned?: number; splits?: Array<{ method: string; amount: number }>; laborAmount?: number; otherAmount?: number }) {
    if (posCart.length === 0) {
      showToast(lang === 'bn' ? "কার্ট খালি!" : "Cart is empty!", "error");
      return;
    }

    // Calculate total base cost of items after per-item discount + tax
    var totalCartBasePrice = posCart.reduce(function(sum, item) {
      return sum + Math.max(0, item.customPrice - (item.discount || 0) + (item.tax || 0)) * item.quantity;
    }, 0);

    var laborAmt = Number(paymentInfo?.laborAmount || 0);
    var otherAmt = Number(paymentInfo?.otherAmount || 0);
    var grandTotal = Math.max(0, totalCartBasePrice - Number(invoiceDiscount || 0) + laborAmt + otherAmt);

    var paid = paymentInfo && typeof paymentInfo.paidAmount === 'number' ? Number(paymentInfo.paidAmount) : grandTotal;
    var change = paymentInfo && typeof paymentInfo.changeReturned === 'number' ? Number(paymentInfo.changeReturned) : Math.max(0, paid - grandTotal);
    var due = Math.max(0, grandTotal - paid);
    var paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' = due <= 0.001 ? 'PAID' : (paid <= 0.001 ? 'UNPAID' : 'PARTIAL');

    var invoiceId = "SL" + Math.floor(100000 + Math.random() * 900000);
    var dateISO = new Date().toISOString();

    var newSales: Sale[] = [];
    var updatedProducts = products.map(function(p) {
      var cartItem = posCart.find(function(item) {
        return item.product.id === p.id;
      });
      if (cartItem) {
        var baseItemPrice = Math.max(0, cartItem.customPrice - (cartItem.discount || 0) + (cartItem.tax || 0));

        var proportionalInvoiceDiscountPerUnit = 0;
        if (invoiceDiscount > 0 && totalCartBasePrice > 0) {
          var itemTotalBasePrice = baseItemPrice * cartItem.quantity;
          var itemShareOfInvoiceDiscount = (itemTotalBasePrice / totalCartBasePrice) * invoiceDiscount;
          proportionalInvoiceDiscountPerUnit = itemShareOfInvoiceDiscount / cartItem.quantity;
        }

        var itemPriceAfterAllDiscounts = Math.max(0, baseItemPrice - proportionalInvoiceDiscountPerUnit);
        var computedProfit = (itemPriceAfterAllDiscounts - (p.purchasePrice || 0)) * cartItem.quantity;
        var computedTotal = itemPriceAfterAllDiscounts * cartItem.quantity;

        newSales.push({
          id: invoiceId + "-" + p.id,
          referenceNo: invoiceId,
          date: dateISO,
          productId: p.id,
          productName: p.name,
          unitPrice: Number(itemPriceAfterAllDiscounts.toFixed(2)),
          quantity: cartItem.quantity,
          totalPrice: Number(computedTotal.toFixed(2)),
          totalAmount: Number(computedTotal.toFixed(2)),
          profit: Number(computedProfit.toFixed(2)),
          customerName: posSelectedCustomerName,
          paymentMethod: method,
          paidAmount: Number(paid.toFixed(2)),
          dueAmount: Number(due.toFixed(2)),
          changeReturned: Number(change.toFixed(2)),
          paymentStatus: paymentStatus,
          paymentSplits: paymentInfo?.splits || [],
          purchasePriceAtTime: p.purchasePrice,
          createdBy: sessionUser.name || 'Owner',
          servedBy: sessionUser.name || 'Owner',
          staffRole: lang === 'bn' ? sessionUser.roleTitleBn : sessionUser.roleTitleEn,
        } as any);
        const newStock = Math.max(0, (p.stock || 0) - cartItem.quantity);
        import('./salesSyncQueue').then(m => m.enqueueStockUpdate(p.id, -cartItem.quantity, p.name, newStock)).catch(() => {});
        return { ...p, stock: newStock };
      }
      return p;
    });

    setProducts(updatedProducts);
    setSales([...newSales, ...sales]);
    import('./salesSyncQueue').then(m => m.enqueueSales(newSales)).catch(() => {});

    if (due > 0 && posSelectedCustomerName !== 'Walk-in customer') {
      setCustomers(prev => prev.map(c => {
        if (c.name === posSelectedCustomerName) {
          return { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) + due) };
        }
        return c;
      }));
    }

    var msg = lang === 'bn'
      ? `বিক্রয় সম্পন্ন! পরিশোধ: TK ${paid.toFixed(2)}${due > 0 ? ' | বকেয়া: TK ' + due.toFixed(2) : ''}${change > 0 ? ' | ফেরত: TK ' + change.toFixed(2) : ''}`
      : `Sale complete! Paid: TK ${paid.toFixed(2)}${due > 0 ? ' | Due: TK ' + due.toFixed(2) : ''}${change > 0 ? ' | Change: TK ' + change.toFixed(2) : ''}`;
    showToast(msg, "success");
    setPosCart([]);
  }


  // Variants management operations
  const [variantFormView, setVariantFormView] = useState(false);

  function handleSaveVariant() {
    if (!newVariantName.trim()) {
      setVariantFormError(true);
      return;
    }
    const isEditing = variants.find(v => v.name.toLowerCase() === newVariantName.toLowerCase());
    if (isEditing) {
      setVariants(variants.map(function(v) {
        return v.name.toLowerCase() === newVariantName.toLowerCase() ? { ...v, description: newVariantDescription } : v;
      }));
      showToast(lang === 'bn' ? "ভেরিয়েন্ট আপডেট করা হয়েছে" : "Variant updated successfully!", "success");
    } else {
      const newVar = {
        id: "VAR-" + String(variants.length + 1).padStart(2, '0'),
        name: newVariantName,
        description: newVariantDescription
      };
      setVariants([...variants, newVar]);
      showToast(lang === 'bn' ? "ভেরিয়েন্ট সংরক্ষণ করা হয়েছে" : "Variant saved successfully!", "success");
    }
    setVariantFormError(false);
    setNewVariantName("");
    setNewVariantDescription("");
    setVariantFormView(false);
  }

  function handleCloseVariant() {
    setEditingVariantId(null);
    setVariantFormView(false);
    setVariantFormError(false);
  }

  // CSV importer algorithm
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files?.[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      var text = evt.target?.result as string;
      setCsvText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  function parseCsvData(rawText: string) {
    try {
      var lines = rawText.split(/\r?\n/);
      var resultProducts: Product[] = [];
      // Skip CSV title header
      for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === '') continue;
        var cols = parseCSVLine(line);
        if (cols.length >= 10) {
          // 10-column smart parser
          var nameRaw = cols[1] || "";
          var cleanName = nameRaw.replace(/HSN:SKU:/gi, "").trim();
          var categoryRaw = cols[3] || "";
          var category = categoryRaw;
          var itemType = "ITEM";
          if (categoryRaw.includes("[ITEM]")) {
            category = categoryRaw.replace("[ITEM]", "").trim();
            itemType = "ITEM";
          } else if (categoryRaw.includes("[SERVICE]")) {
            category = categoryRaw.replace("[SERVICE]", "").trim();
            itemType = "SERVICE";
          }
          var selPrice = parseFloat(cols[7]) || 0;
          resultProducts.push({
            id: cols[0] || ("CSV-" + Math.floor(Math.random() * 10000)),
            name: cleanName || "Unnamed Product",
            brand: cols[2] || "",
            category: category || "General",
            itemType: itemType,
            unit: cols[4] || "Pcs",
            stock: parseInt(cols[5]) || 0,
            alertQty: parseInt(cols[6]) || 0,
            sellingPrice: selPrice,
            purchasePrice: selPrice * 0.8,
            tax: cols[8] || "N/A(0.00%)",
            status: cols[9] || "Active"
          } as Product);
        } else if (cols.length >= 6) {
          // Standard 7-column parser
          resultProducts.push({
            id: cols[0] || ("CSV-" + Math.floor(Math.random() * 10000)),
            name: cols[1] || "Unnamed Product",
            category: cols[2] || "Electronics",
            purchasePrice: parseFloat(cols[3]) || 0,
            sellingPrice: parseFloat(cols[4]) || 0,
            stock: parseInt(cols[5]) || 0,
            unit: cols[6] || "Pcs",
            itemType: "ITEM",
            status: "Active"
          });
        }
      }
      setCsvPreviewRows(resultProducts);
    } catch (err) {
      showToast(t.invalidCsv, "error");
    }
  }

  function confirmCsvImport() {
    if (csvPreviewRows.length === 0) return;
    var combinedProducts = [...products];
    for (var i = 0; i < csvPreviewRows.length; i++) {
      var imported = csvPreviewRows[i];
      var matchIndex = -1;
      for (var j = 0; j < combinedProducts.length; j++) {
        if (combinedProducts[j].id === imported.id) {
          matchIndex = j;
          break;
        }
      }
      if (matchIndex !== -1) {
        combinedProducts[matchIndex] = imported;
      } else {
        combinedProducts.push(imported);
      }
    }
    setProducts(combinedProducts);
    setCsvPreviewRows([]);
    setCsvText('');
    showToast(t.successImport, "success");
  }

  // Fast Product Save
  function handleAddProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName) {
      showToast(lang === 'bn' ? "পণ্যের নাম অবশ্যক!" : "Product Name is required!", "error");
      return;
    }
    const finalSKU = newProdSKU.trim() || ("SKU-" + Math.floor(1000 + Math.random() * 9000));
    
    var newProduct: Product = {
      id: finalSKU,
      name: newProdName,
      category: newProdCategory,
      purchasePrice: Number(newProdPurPrice),
      sellingPrice: Number(newProdSelPrice),
      stock: Number(newProdStock),
      unit: newProdUnit,
      brand: newProdBrand,
      itemGroup: newProdItemGroup,
      hsn: newProdHSN,
      alertQty: Number(newProdAlertQty),
      sellerPoints: Number(newProdSellerPoints),
      barcode: newProdBarcode || finalSKU,
      description: newProdDescription,
      discountType: newProdDiscountType,
      discount: newProdDiscount,
      tax: newProdTax,
      taxType: newProdTaxType,
      profitMargin: newProdProfitMargin,
      mrp: String(newProdMRP || newProdSelPrice),
      warehouse: newProdWarehouse,
      image: newProdImageFile || undefined,
      itemType: newProdItemType
    };
    
    setProducts([...products, newProduct]);
    if (newProdItemType === 'SERVICE') {
      const newService = {
        id: finalSKU,
        name: newProdName,
        category: newProdCategory || 'Servicing',
        price: Number(newProdSelPrice),
        description: newProdDescription || '',
        status: 'Active',
        date: new Date().toISOString().slice(0, 10),
      };
      setServices(prev => [newService, ...prev.filter(s => s.id !== finalSKU)]);
    }
    try { logAudit('product_created', { entityId: newProduct.id, entityName: newProduct.name, details: `SKU ${newProduct.sku || '—'} · Stock ${newProduct.stock ?? 0} · Price ${newProduct.sellingPrice ?? ''}` }); } catch {}
    setIsAddProductOpen(false);
    
    // Reset all form states
    setNewProdName('');
    setNewProdSKU('');
    setNewProdPurPrice(0);
    setNewProdSelPrice(0);
    setNewProdStock(0);
    setNewProdUnit('Pcs');
    setNewProdBrand('Samsung');
    setNewProdItemGroup('Single');
    setNewProdHSN('');
    setNewProdAlertQty(5);
    setNewProdSellerPoints(0);
    setNewProdBarcode('');
    setNewProdDescription('');
    setNewProdDiscountType('Percentage(%)');
    setNewProdDiscount('0.00');
    setNewProdTax('15%');
    setNewProdTaxType('Inclusive');
    setNewProdProfitMargin('20');
    setNewProdMRP(0);
    setNewProdWarehouse('Soft Forest');
    setNewProdImageFile(null);
    
    showToast(
      lang === 'bn' 
        ? (newProdItemType === 'SERVICE' ? "নতুন সার্ভিস সফলভাবে যুক্ত করা হয়েছে!" : "নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!") 
        : (newProdItemType === 'SERVICE' ? "New service added successfully!" : "New product added successfully!"), 
      "success"
    );
  }

  // Edit Product Submit
  function handleEditProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.id) {
      showToast("Please fill in all layout fields", "error");
      return;
    }
    const prev = products.find(p => p.id === editingProduct.id);
    const updatedProducts = products.map(function(p) {
      if (p.id === editingProduct.id) {
        return editingProduct;
      }
      return p;
    });
    setProducts(updatedProducts);
    try {
      const changes: string[] = [];
      if (prev) {
        if (Number(prev.stock) !== Number(editingProduct.stock)) {
          logAudit('stock_change', { entityId: editingProduct.id, entityName: editingProduct.name, details: `${prev.stock ?? 0} → ${editingProduct.stock ?? 0}` });
        }
        if (Number(prev.sellingPrice) !== Number(editingProduct.sellingPrice) || Number(prev.purchasePrice) !== Number(editingProduct.purchasePrice)) {
          logAudit('price_change', { entityId: editingProduct.id, entityName: editingProduct.name, details: `Sell ${prev.sellingPrice ?? ''} → ${editingProduct.sellingPrice ?? ''} · Buy ${prev.purchasePrice ?? ''} → ${editingProduct.purchasePrice ?? ''}` });
        }
        Object.keys(editingProduct).forEach(k => {
          if (['stock','sellingPrice','purchasePrice','image'].includes(k)) return;
          if ((prev as any)[k] !== (editingProduct as any)[k]) changes.push(k);
        });
      }
      logAudit('product_updated', { entityId: editingProduct.id, entityName: editingProduct.name, details: changes.length ? `Fields: ${changes.join(', ')}` : 'Updated' });
    } catch {}
    setEditingProduct(null);
    showToast(lang === 'bn' ? "পণ্য সফলভাবে আপডেট করা হয়েছে!" : "Product updated successfully!", "success");
  }

  // Delete Product Handler
  function handleDeleteProduct(productId: string) {
    const confirmDelete = window.confirm(lang === 'bn' ? "আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?" : "Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    const removed = products.find(p => p.id === productId);
    setProducts(products.filter(function(p) { return p.id !== productId; }));
    try { logAudit('product_deleted', { entityId: productId, entityName: removed?.name, details: 'Product removed' }); } catch {}
    showToast(lang === 'bn' ? "পণ্য সফলভাবে মুছে ফেলা হয়েছে!" : "Product deleted successfully!", "success");
  }

  // Delete All Products Handler
  function handleDeleteAllProducts() {
    const confirmDelete = window.confirm(lang === 'bn' ? "আপনি কি নিশ্চিতভাবে সব আইটেম মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়।" : "Are you sure you want to delete all items? This action cannot be undone.");
    if (!confirmDelete) return;
    setProducts([]);
    showToast(lang === 'bn' ? "সমস্ত আইটেম সফলভাবে মুছে ফেলা হয়েছে!" : "All items have been successfully deleted!", "success");
  }

  // Fast Customer Save
  function handleAddCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      showToast(lang === 'bn' ? "গ্রাহকের নাম ও ফোন নম্বর আবশ্যক!" : "Customer info is required!", "error");
      return;
    }
    var newCust: Customer = {
      id: "CUST-" + (customers.length + 1).toString().padStart(3, '0'),
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || "walkin@domain.com",
      totalPurchase: 0,
      dueAmount: Number(newCustDue)
    };
    setCustomers([...customers, newCust]);
    setPosSelectedCustomerName(newCustName);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustDue(0);
    showToast(lang === 'bn' ? "নতুন গ্রাহক সফলভাবে যুক্ত করা হয়েছে!" : "New customer registered successfully!", "success");
  }

  // Supplier Form Submit Handler
  function handleSupplierFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!suppFormName) {
      showToast(lang === 'bn' ? "সরবরাহকারীর নাম আবশ্যক!" : "Supplier Name is required!", "error");
      return;
    }

    const openBalValue = parseFloat(suppFormOpeningBalance) || 0;

    if (editingSupplierId) {
      // Update Mode
      const updated = suppliers.map(function(s) {
        if (s.id === editingSupplierId) {
          return {
            ...s,
            name: suppFormName,
            mobile: suppFormMobile,
            email: suppFormEmail,
            phone: suppFormPhone,
            gst: suppFormGst,
            tax: suppFormTax,
            openingBalance: openBalValue,
            country: suppFormCountry,
            state: suppFormState,
            city: suppFormCity,
            postcode: suppFormPostcode,
            address: suppFormAddress
          };
        }
        return s;
      });
      setSuppliers(updated);
      showToast(
        lang === 'bn' ? "সরবরাহকারী সফলভাবে আপডেট করা হয়েছে!" : "Supplier updated successfully!",
        "success"
      );
      setEditingSupplierId(null);
    } else {
      // Add Mode
      const newId = "SUPP-" + Math.floor(100 + Math.random() * 900);
      const newSupp = {
        id: newId,
        name: suppFormName,
        mobile: suppFormMobile,
        email: suppFormEmail,
        phone: suppFormPhone,
        gst: suppFormGst,
        tax: suppFormTax,
        openingBalance: openBalValue,
        country: suppFormCountry,
        state: suppFormState,
        city: suppFormCity,
        postcode: suppFormPostcode,
        address: suppFormAddress,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSuppliers([...suppliers, newSupp]);

      // If opening balance has been set, add a payment line automatically!
      if (openBalValue > 0) {
        const payLine = {
          id: "PM-" + Math.floor(100 + Math.random() * 900),
          date: new Date().toLocaleDateString('en-GB'),
          amount: openBalValue,
          type: "Opening Balance",
          note: "Opening raw stock value balance line"
        };
        setSuppliersListPayments(prev => [...prev, payLine]);
      }

      showToast(
        lang === 'bn' ? "নতুন সরবরাহকারী সফলভাবে যুক্ত করা হয়েছে!" : "New Supplier registered successfully!",
        "success"
      );
    }

    // Reset Form Fields
    setSuppFormName('');
    setSuppFormMobile('');
    setSuppFormEmail('');
    setSuppFormPhone('');
    setSuppFormGst('');
    setSuppFormTax('');
    setSuppFormOpeningBalance('0.00');
    setSuppFormCountry('-Select-');
    setSuppFormState('Select State');
    setSuppFormCity('');
    setSuppFormPostcode('');
    setSuppFormAddress('');
  }

  // Edit Supplier Trigger
  function handleEditSupplier(s: any) {
    setEditingSupplierId(s.id);
    setSuppFormName(s.name || '');
    setSuppFormMobile(s.mobile || '');
    setSuppFormEmail(s.email || '');
    setSuppFormPhone(s.phone || '');
    setSuppFormGst(s.gst || '');
    setSuppFormTax(s.tax || '');
    setSuppFormOpeningBalance(String(s.openingBalance || '0.00'));
    setSuppFormCountry(s.country || '-Select-');
    setSuppFormState(s.state || 'Select State');
    setSuppFormCity(s.city || '');
    setSuppFormPostcode(s.postcode || '');
    setSuppFormAddress(s.address || '');

    // Scroll smoothly to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(lang === 'bn' ? "সরবরাহকারী তথ্য এডিটর-এ লোড করা হয়েছে!" : "Supplier loaded into form editor!", "info");
  }

  // Remove Supplier Trigger
  function handleRemoveSupplier(id: string) {
    const ok = window.confirm(lang === 'bn' ? "আপনি কি এই সরবরাহকারী প্রতিষ্ঠানটি মুছে ফেলতে চান?" : "Are you sure you want to delete this supplier?");
    if (!ok) return;

    const filtered = suppliers.filter(s => s.id !== id);
    setSuppliers(filtered);
    showToast(lang === 'bn' ? "সরবরাহকারী সফলভাবে অপসারিত হয়েছে।" : "Supplier removed successfully.", "success");
  }

  // Close Route Trigger
  function handleCloseSuppliersView() {
    // Navigate back to customers list
    setActiveSubTab('customers_list');
    showToast(lang === 'bn' ? "উইন্ডো বন্ধ করা হয়েছে।" : "Suppliers view closed.", "info");
  }

  // World-Class Sidebar Keyboard Navigation (Alt + M, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Enter)
  useEffect(() => {
    function handleSidebarKeyDown(e: KeyboardEvent) {
      // Shortcut Alt + M to jump focus directly to Sidebar
      if (e.altKey && (e.key === 'm' || e.key === 'M' || e.key === 'ম')) {
        e.preventDefault();
        const firstBtn = document.querySelector<HTMLButtonElement>('[data-sidebar-item="true"]');
        if (firstBtn) {
          firstBtn.focus();
          firstBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          showToast(lang === 'bn' ? "সাইডবার মেনু কিবোর্ডে ফোকাস করা হয়েছে (↑ ↓ এরো ব্যবহার করুন)" : "Sidebar focused (Use ↑ ↓ arrow keys)", "info");
        }
        return;
      }

      const activeEl = document.activeElement as HTMLElement;
      if (!activeEl || !activeEl.matches('[data-sidebar-item="true"]')) return;

      const allItems = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-sidebar-item="true"]'));
      const currentIndex = allItems.indexOf(activeEl as HTMLButtonElement);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % allItems.length;
        allItems[nextIndex].focus();
        allItems[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
        allItems[prevIndex].focus();
        allItems[prevIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        // Expand or click
        activeEl.click();
      } else if (e.key === 'ArrowLeft') {
        // Collapse or focus parent
        setOpenGroup(null);
      }
    }

    window.addEventListener('keydown', handleSidebarKeyDown);
    return () => window.removeEventListener('keydown', handleSidebarKeyDown);
  }, [lang]);

  // Delete Payment Line
  function handleRemoveSupplierPayment(payId: string) {
    const ok = window.confirm("Are you sure to remove this payment line entry?");
    if (!ok) return;
    setSuppliersListPayments(prev => prev.filter(p => p.id !== payId));
  }

  // Filter Sales list based on selected scope (dynamic — anchored to today's date)
  function getFilteredSales(list: Sale[]) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const monthPrefix = todayStr.slice(0, 7);
    return list.filter(function(s) {
      if (!s || !s.date) return false;
      var sDateStr = String(s.date).slice(0, 10);
      var sDate = new Date(sDateStr);
      if (reportsPreset === "today") {
        return sDateStr === todayStr;
      } else if (reportsPreset === "week") {
        var diffDays = Math.ceil((today.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      } else if (reportsPreset === "days15") {
        var diffDays2 = Math.ceil((today.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays2 >= 0 && diffDays2 <= 15;
      } else if (reportsPreset === "month") {
        return sDateStr.substring(0, 7) === monthPrefix;
      } else if (reportsPreset === "custom") {
        return sDateStr >= reportsCustomStart && sDateStr <= reportsCustomEnd;
      }
      return true;
    });
  }

  // Standard pure JS Customer CSV Export
  function handleExportCustomers() {
    var csvContent = BOM;
    csvContent = csvContent + "ID,Name,Phone,Email,Total Purchased,Due Balance" + NL;
    for (var i = 0; i < customers.length; i++) {
      var c = customers[i];
      csvContent = csvContent + c.id + "," + c.name + "," + c.phone + "," + c.email + "," + c.totalPurchase + "," + c.dueAmount + NL;
    }
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer_records_" + reportsPreset + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Standard pure JS Invoice/Report CSV Export (formatted cleanly exactly matching A4 PDF / printer report system)
  function handleExportReportsCSV() {
    var isBn = reportLang === 'bn';
    var activeShopTitle = isBn ? reportShopTitleBn : reportShopTitleEn;
    var currentFiltered = getFilteredSales(sales);
    
    // Totals
    var totalSalesSum = currentFiltered.reduce(function(acc, item) { return acc + item.totalPrice; }, 0);
    var totalQtySum = currentFiltered.reduce(function(acc, item) { return acc + item.quantity; }, 0);
    
    var rangeStr = getReportDateRangeString();
    var formattedTotalSales = formatCalculatedPrice(totalSalesSum, isBn);
    var formattedTotalQty = isBn ? toBnDigits(totalQtySum) + " পিচ" : totalQtySum + " Pcs";
    var reportDateStr = getFormattedReportDate(isBn);

    var csvContent = BOM;
    
    // Header section mimicking printed PDF visual block
    csvContent = csvContent + (isBn ? "দোকান/প্রতিষ্ঠান" : "Shop Name") + "," + `"${activeShopTitle.replace(/"/g, '""')}"` + NL;
    csvContent = csvContent + (isBn ? "রিপোর্টের নাম" : "Report Title") + "," + `"${isBn ? "বিক্রয় রিপোর্ট বিবৃতি" : "Sales Report Statement"}"` + NL;
    csvContent = csvContent + (isBn ? "সময়সীমা" : "Period") + "," + `"${rangeStr}"` + NL;
    csvContent = csvContent + (isBn ? "রিপোর্ট প্রিন্ট তারিখ" : "Report Print Date") + "," + `"${reportDateStr}"` + NL;
    
    csvContent = csvContent + NL; // spacing gap
    
    // Summary Cards block
    csvContent = csvContent + (isBn ? "মোট বিক্রয়,মোট সংখ্যা,মোট রেকর্ড সংখ্যা" : "Total Sales,Total Quantity,Total Sales Invoices count") + NL;
    csvContent = csvContent + `"${formattedTotalSales}","${formattedTotalQty}","${isBn ? toBnDigits(currentFiltered.length) + " টি" : currentFiltered.length + " transactions"}"` + NL;
    
    csvContent = csvContent + NL; // spacing gap
    
    // Table content headers
    if (isBn) {
      csvContent = csvContent + "পণ্যের নাম,তারিখ,টাকা (মূল্য),সংখ্যা (পরিমাণ),মোট মূল্য,অবশিষ্ট স্টক" + NL;
    } else {
      csvContent = csvContent + "Product Name,Date,Price,Quantity,Total Sum,Remaining Stock" + NL;
    }
    
    // Row mappings
    var unitLabel = isBn ? "পিচ" : "Pcs";
    for (var i = 0; i < currentFiltered.length; i++) {
      var sale = currentFiltered[i];
      var product = products.find(function(item) { return item.id === sale.productId; });
      var stockLeft = product ? product.stock : 0;
      
      var priceLabel = "৳ " + sale.unitPrice.toLocaleString('en-US');
      var totalLabel = "৳ " + sale.totalPrice.toLocaleString('en-US');
      
      var formattedPrice = isBn ? toBnDigits(priceLabel) : priceLabel;
      var formattedQty = isBn ? toBnDigits(sale.quantity) + " " + unitLabel : sale.quantity + " " + unitLabel;
      var formattedTotal = isBn ? toBnDigits(totalLabel) : totalLabel;
      var formattedStock = isBn ? toBnDigits(stockLeft) + " " + unitLabel : stockLeft + " " + unitLabel;
      
      var cleanedProdName = sale.productName.replace(/"/g, '""');
      
      csvContent = csvContent + `"${cleanedProdName}",${sale.date},"${formattedPrice}","${formattedQty}","${formattedTotal}","${formattedStock}"` + NL;
    }
    
    csvContent = csvContent + NL; // spacing gap
    
    // Greetings/Authority block mirroring print signature layout 
    csvContent = csvContent + (isBn ? "ধন্যবাদান্তে" : "Best Regards") + NL;
    csvContent = csvContent + `"${isBn ? activeShopTitle + " কর্তৃপক্ষ" : activeShopTitle + " Authority"}"` + NL;
    
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    
    var filename = isBn 
      ? "বিক্রয়_রিপোর্ট_" + reportsPreset + "_" + new Date().toISOString().slice(0, 10) + ".csv"
      : "sales_report_" + reportsPreset + "_" + new Date().toISOString().slice(0, 10) + ".csv";
      
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  }

  // Styled Full Screen Print Memo Layout Launcher
  function triggerPrintInvoice() {
    setPrintPreviewMode(true);
    setIsExportModalOpen(false);
    setTimeout(function() {
      try {
        window.print();
      } catch (e) {
        console.warn("Direct print call error/blocked:", e);
      }
    }, 500);
  }

  // Statistics calculation variables
  var stats = getSalesMetrics();
  // Advanced item-module search index — reads serial/IMEI + batch records from localStorage
  // (offline-safe, no Firestore changes) to power multi-field search.
  var _serialRecs: any[] = [];
  var _batchRecs: any[] = [];
  try { _serialRecs = JSON.parse(localStorage.getItem('roni_warranty_records_v1') || localStorage.getItem('roni_serial_records_v1') || '[]'); } catch {}
  try { _batchRecs = JSON.parse(localStorage.getItem('roni_batch_expiry_v1') || '[]'); } catch {}
  var _serialByProduct = new Map<string, any[]>();
  for (var _si = 0; _si < _serialRecs.length; _si++) {
    var _sr = _serialRecs[_si];
    if (!_serialByProduct.has(_sr.productId)) _serialByProduct.set(_sr.productId, []);
    _serialByProduct.get(_sr.productId)!.push(_sr);
  }
  var _batchByProduct = new Map<string, any[]>();
  for (var _bi = 0; _bi < _batchRecs.length; _bi++) {
    var _br = _batchRecs[_bi];
    if (!_batchByProduct.has(_br.productId)) _batchByProduct.set(_br.productId, []);
    _batchByProduct.get(_br.productId)!.push(_br);
  }
  var _q = inventorySearch.trim().toLowerCase();
  var filteredInventory = products.filter(function(p: any) {
    // Advanced search across product + serial/IMEI/barcode + batch numbers
    if (_q) {
      var hay = [p.name, p.id, p.sku, p.barcode, p.brand, p.category]
        .filter(Boolean).map(function(v: any) { return String(v).toLowerCase(); }).join('|');
      var matched = hay.indexOf(_q) !== -1;
      if (!matched) {
        var srs = _serialByProduct.get(p.id) || [];
        for (var i = 0; i < srs.length && !matched; i++) {
          var s = srs[i];
          if ((s.serialNumber || '').toLowerCase().indexOf(_q) !== -1) matched = true;
          else if ((s.imei1 || '').toLowerCase().indexOf(_q) !== -1) matched = true;
          else if ((s.imei2 || '').toLowerCase().indexOf(_q) !== -1) matched = true;
          else if ((s.barcode || '').toLowerCase().indexOf(_q) !== -1) matched = true;
        }
      }
      if (!matched) {
        var brs = _batchByProduct.get(p.id) || [];
        for (var j = 0; j < brs.length && !matched; j++) {
          if ((brs[j].batchNumber || '').toLowerCase().indexOf(_q) !== -1) matched = true;
        }
      }
      if (!matched) return false;
    }
    if (advCategoryFilter && (p.category || '') !== advCategoryFilter) return false;
    if (advBrandFilter && (p.brand || '') !== advBrandFilter) return false;
    if (advVariantFilter && (p.variant || '') !== advVariantFilter) return false;
    if (advUnitFilter && (p.unit || '') !== advUnitFilter) return false;
    if (advSupplierFilter && (p.supplier || p.supplierName || '') !== advSupplierFilter) return false;
    if (advStockFilter) {
      var _stock = Number(p.stock || 0);
      var _min = Number(p.minStock || 0);
      if (advStockFilter === 'in' && !(_stock > _min)) return false;
      if (advStockFilter === 'low' && !(_min > 0 && _stock > 0 && _stock <= _min)) return false;
      if (advStockFilter === 'out' && _stock !== 0) return false;
      if (advStockFilter === 'negative' && !(_stock < 0)) return false;
    }
    if (advWarrantyFilter) {
      var wrs = _serialByProduct.get(p.id) || [];
      var hasActive = false, hasExpired = false;
      var _today = new Date().toISOString().slice(0, 10);
      for (var k = 0; k < wrs.length; k++) {
        var wt = wrs[k].warrantyType || 'No Warranty';
        var wex = wrs[k].warrantyExpiryDate || '';
        if (wt !== 'No Warranty' && wex) {
          if (wex >= _today) hasActive = true; else hasExpired = true;
        }
      }
      if (advWarrantyFilter === 'tracked' && wrs.length === 0) return false;
      if (advWarrantyFilter === 'active' && !hasActive) return false;
      if (advWarrantyFilter === 'expired' && !hasExpired) return false;
      if (advWarrantyFilter === 'none' && wrs.length > 0) return false;
    }
    return true;
  });

  var filteredCustomers = customers.filter(function(c) {
    var query = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(query) || 
           c.phone.toLowerCase().includes(query) || 
           c.id.toLowerCase().includes(query);
  });

  // Calculate 7 Days aggregate sales for custom interactive SVG graph
  var chartDays: string[] = [];
  var chartKeys: string[] = [];
  var chartAmounts = [0, 0, 0, 0, 0, 0, 0];
  
  const todayForChart = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayForChart);
    d.setDate(d.getDate() - i);
    chartKeys.push(d.toISOString().slice(0, 10));
    chartDays.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
  }

  for (var dIdx = 0; dIdx < chartKeys.length; dIdx++) {
    var mKey = chartKeys[dIdx];
    var daySum = 0;
    for (var sIdx = 0; sIdx < sales.length; sIdx++) {
      if (sales[sIdx].date === mKey) {
        daySum = daySum + sales[sIdx].totalPrice;
      }
    }
    chartAmounts[dIdx] = daySum;
  }
  var maxChartAmount = Math.max(...chartAmounts, 10000);

  const executeAdminPrompt = (promptText: string) => {
    const query = promptText.trim().toLowerCase();
    if (!query) return;

    let output = "";
    let isSuccess = true;

    // Log the typed command
    setPromptLogs(prev => [...prev, `> ${promptText}`]);

    if (query === 'sync-three-initial-users' || query === 'users' || query === 'sync users' || query.includes('ইউজার সিঙ্ক') || query.includes('sync-users')) {
      const initialUsers = [
        { id: "EMP-01", name: "Rakibul Hassan", email: "md.monstar1234@gmail.com", phone: "", role: "Stuff", status: "Active", branch: "Rony Telecom", isBlocked: false, username: "rakib", createdOn: "10-06-2026" },
        { id: "EMP-02", name: "Mamun Islam", email: "sumonmamun@gmail.com", phone: "", role: "Customar", status: "Active", branch: "Rony Telecom", isBlocked: false, username: "Mamun", createdOn: "26-05-2026" },
        { id: "EMP-03", name: "Fersous Bari", email: "myithive@gmail.com", phone: "01711944027", role: "Store Admin", status: "Active", branch: "Rony Telecom", isBlocked: false, username: "admin", createdOn: "12-02-2021" }
      ];
      setSystemEmployees(initialUsers);
      output = "SUCCESS: Sync complete! Configured three pristine employees persistently as per AGENTS.md.";
    } else if (query.includes('force-overdue') || query.includes('overdue') || query.includes('ওভারডিউ')) {
      if (installments.length > 0) {
        const updated = installments.map((ins, idx) => {
          if (idx === 0) {
            return { ...ins, status: "Overdue" };
          }
          return ins;
        });
        setInstallments(updated);
        output = `SUCCESS: First installment (ID: ${installments[0].id}) forced to 'Overdue'. Penalty calculations are now active.`;
      } else {
        output = "ERROR: No active installment contracts found to modify.";
        isSuccess = false;
      }
    } else if (query === 'clear-sales' || query === 'clear-sales-ledger' || query === 'বিক্রয় মুছুন') {
      setSales([]);
      output = "SUCCESS: Sales ledger collection successfully cleared. All dynamic charts updated to 0.";
    } else if (query.includes('increase-prices') || query.includes('increase-all-prices') || query.includes('মূল্য বৃদ্ধি')) {
      setProducts(prev => prev.map(p => ({
        ...p,
        price: Math.round(p.price * 1.1)
      })));
      output = "SUCCESS: Mass update triggered! All catalog product prices increased by +10% successfully.";
    } else if (query.includes('add-test-product') || query.includes('নতুন প্রোডাক্ট') || query.includes('add-product')) {
      const newP = {
        id: "MOB-" + Math.floor(100 + Math.random() * 900),
        name: "iPhone 16 Pro Max Concept",
        category: "Smartphones",
        price: 165000,
        stock: 15,
        minStock: 2,
        brand: "Apple",
        warranty: "24 Months",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60"
      };
      setProducts(prev => [...prev, newP]);
      output = `SUCCESS: Added test product "${newP.name}" with Price ৳165,000 and Stock ${newP.stock}.`;
    } else if (query.includes('sms-simulation-test') || query.includes('sms') || query.includes('এসএমএস')) {
      output = "SUCCESS: Triggered successful SMS gateway broadcast test. Sent thank-you notification to Fersous's number (01711944027).";
      showToast(lang === 'bn' ? "টেস্ট এসএমএস সফলভাবে পাঠানো হয়েছে!" : "Test simulation SMS broadcast dispatched successfully!", "info");
    } else if (query.includes('system-diagnostic') || query.includes('ডায়াগনস্টিক') || query.includes('diagnostic')) {
      output = `DIAGNOSTIC REPORT:
      - App Version: ${systemVersion}
      - Products Registered: ${products.length} Items
      - Active Employees: ${systemEmployees.length} Accounts
      - Installed Ledger Contracts: ${installments.length} Records
      - System Environment: Production Sandbox Run Container
      - Theme Mode: ${theme.toUpperCase()}
      - Locale State: ${lang.toUpperCase()}`;
    } else if (query.startsWith('add-user ') || query.startsWith('adduser ')) {
      const parts = promptText.split(' ');
      const uName = parts.slice(1).join(' ') || "Simulated User";
      const newEmp = {
        id: "EMP-" + Math.floor(10 + Math.random() * 90),
        name: uName,
        email: `${uName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: "01700000000",
        role: "Stuff",
        status: "Active",
        branch: "Rony Telecom",
        isBlocked: false,
        username: uName.toLowerCase().replace(/\s+/g, ''),
        createdOn: new Date().toISOString().split('T')[0]
      };
      setSystemEmployees(prev => [...prev, newEmp]);
      output = `SUCCESS: Registered new staff user "${uName}" under branch "Rony Telecom".`;
    } else {
      // Heuristic AI assistant message
      output = `SIMULATION AI PROMPTER: I evaluated "${promptText}". Did you mean "sync-three-initial-users" to sync the mandatory users list, or "force-overdue" to test installment penalty calculations?`;
      isSuccess = false;
    }

    setPromptLogs(prev => [...prev, output]);
    setAdminPromptInput("");
    if (isSuccess) {
      showToast(lang === 'bn' ? "সুপার এডমিন প্রম্পট সফল!" : "Super Admin prompt executed!", "success");
    }
  };

  return (
    <div className={theme === 'dark' ? "min-h-screen bg-gray-900 text-gray-100 font-sans transition-colors duration-300 relative" : "min-h-screen bg-gray-100 text-gray-900 font-sans transition-colors duration-300 relative"}>

      <SyncStatusPanel open={showSyncPanel} onClose={() => setShowSyncPanel(false)} lang={lang as any} />



      
      {/* Dynamic Slide-in Toast Notification Banner */}
      {toastMsg && (
        <div 
          className="fixed top-6 right-6 z-[9999] max-w-sm bg-slate-900 border border-cyan-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-transform duration-300 ease-out animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className={`p-1.5 rounded-lg text-sm leading-none flex items-center justify-center ${
            toastType === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
            toastType === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            {toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}
          </div>
          <p className="text-xs font-bold text-white leading-tight pr-2">{toastMsg}</p>
          <button 
            type="button"
            onClick={function() { setToastMsg(null); }} 
            className="text-gray-400 hover:text-white text-xs ml-auto font-bold focus:outline-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Embedded Keyframe animation style for toast */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      {/* Dynamic Printing Style rules to lock workspace layout and hide side bars */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-fullframe {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Main Print Preview Layout (Full Screen Modal Rendered Over everything if true) */}
      {printPreviewMode && (
        <div className="fixed inset-0 bg-[#0f172a] text-black z-50 overflow-y-auto p-4 sm:p-12 print-fullframe flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
              <div>
                <span className="text-sm font-bold text-cyan-400 block tracking-wider uppercase flex items-center gap-2">
                  <span>📊</span>
                  <span>{reportLang === 'bn' ? "রিপোর্ট প্রিন্ট প্রিভিউ" : "A4 Report Print Preview"}</span>
                </span>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  {reportLang === 'bn' 
                    ? "সতর্কতা: রিপোর্টটি প্রিন্ট বা সংরক্ষণ করতে নিচের প্রিন্ট বোতামে চাপুন।" 
                    : "Note: Press the print button below to print or save the A4 document."
                  }
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={function() { setReportLang(reportLang === 'bn' ? 'en' : 'bn'); }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center cursor-pointer transition active:scale-95 whitespace-nowrap"
                >
                  {reportLang === 'bn' ? 'English Format' : 'বাংলা ফরম্যাট'}
                </button>
                <button
                  onClick={function() {
                    try {
                      window.print();
                    } catch (e) {
                      console.error("Direct print failed:", e);
                    }
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition whitespace-nowrap"
                >
                  {reportLang === 'bn' ? "প্রিন্ট নিশ্চিত করুন" : "Confirm Print"}
                </button>
                <button 
                  onClick={function() { setPrintPreviewMode(false); }}
                  className="bg-gray-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-gray-700 transition active:scale-95 whitespace-nowrap"
                >
                  {reportLang === 'bn' ? "ফিরে যান" : "Exit Preview"}
                </button>
              </div>
            </div>

            {/* Render the core beautiful printable sheets */}
            <div className="flex justify-center bg-gray-950/40 p-2 sm:p-8 rounded-3xl border border-gray-900/60 print:p-0 print:border-none print:shadow-none print:bg-transparent">
              {renderA4ReportSheet(reportLang)}
            </div>
          </div>
        </div>
      )}      {/* General Outer Layout Wrap with Navbar Sidebar Grid */}
      {isLandingPageVisible ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8fafc]">
          <LoginPage
            onLoginSuccess={function(u?: any) {
              if (u) {
                const email = (u.email || '').toLowerCase().trim();
                const phone = (u.phone || '').trim();
                const isSuper = (email === 'fardous.jp2021@gmail.com' || email === 'admin@smarthisab.com' || phone === '01747046052') && u.role === 'super_admin';
                const role = isSuper ? 'super_admin' : (u.role === 'employee' ? 'employee' : 'owner');
                setSessionUser({
                  name: u.fullName || u.name || (role === 'owner' ? "দোকানের মালিক" : "কর্মচারী"),
                  email: u.email || "",
                  phone: u.phone || "",
                  shopName: u.shopName || "",
                  businessType: u.businessType || "",
                  role: role as "super_admin" | "owner" | "employee",
                  roleTitleBn: role === 'super_admin' ? "ডেভেলপার / সুপার এডমিন" : (role === 'owner' ? "দোকানের মালিক" : "কর্মচারী / ক্যাশিয়ার"),
                  roleTitleEn: role === 'super_admin' ? "Developer / Super Admin" : (role === 'owner' ? "Shop Owner" : "Employee"),
                  employeeRole: role === 'super_admin' ? "Super Admin" : (role === 'owner' ? "Owner" : "Operator")
                });
                if (role !== 'super_admin') {
                  setActiveTab('dashboard');
                }
              }
              setIsLandingPageVisible(false);
            }}
          />
        </div>
      ) : (
      <div className="flex flex-col h-screen overflow-hidden no-print bg-[rgb(1,12,45)]">
        
        {/* Read-Only Demo Protective Banner (Active for Demo Users) */}
        {(sessionUser?.isDemo || sessionUser?.email === 'owner@smarthisab.com' || sessionUser?.email === 'demo@smarthisab.com') && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 text-xs px-4 py-1.5 font-bold flex items-center justify-between shadow-md z-40 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>🔒 ডেমো এক্সপ্লোরেশন মোড (Read-Only Demo Mode): ডেমো দেখতে আপনি সব পেজে ঢুকতে পারবেন, কিন্তু তথ্য ডিলিট বা পরিবর্তন করা সংরক্ষিত।</span>
            </span>
            <span className="text-[10px] font-bold bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-300/40">
              DEMO ONLY
            </span>
          </div>
        )}

        {/* Top Header Navbar as requested by the user */}
        <header className="h-16 bg-[rgb(1,12,45)] border-b border-[rgb(12,45,140)] flex items-center justify-between px-4 sm:px-6 text-white shrink-0 selection:bg-amber-500/30">
          <div className="flex items-center gap-3">
            
            {/* Left Sidebar Brand Header - strictly aligned inside sidebar width (w-64) */}
            <div className={`flex items-center gap-2.5 transition-all duration-300 ${isSidebarCollapsed ? 'w-10' : 'w-56'} shrink-0 overflow-hidden`}>
              {/* Hamburger menu button */}
              <button
                onClick={function() { setIsSidebarCollapsed(!isSidebarCollapsed); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer active:scale-95 shrink-0"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* White-Label Platform Brand Header (Stays strictly inside sidebar border) */}
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-1.5 font-sans font-bold text-base sm:text-lg text-white select-none tracking-tight truncate" title={`${platformBrandName || 'SmartHisab'} ${platformBrandBadge || 'POS'}`}>
                  <span className="truncate">{platformBrandName || 'SmartHisab'}</span>
                  <span className="uppercase text-white/90 text-sm sm:text-base font-bold shrink-0">{platformBrandBadge || 'POS'}</span>
                </div>
              )}
            </div>

            {/* 1-Click Homepage Button */}
            {sessionUser.role === 'super_admin' && (
              <button
                onClick={function() {
                  const nextState = !isLandingPageVisible;
                  setIsLandingPageVisible(nextState);
                  try { localStorage.setItem('smarthisab_public_landing_enabled', nextState ? 'true' : 'false'); } catch (e) {}
                  showToast && showToast(
                    lang === 'bn'
                      ? (nextState ? 'হোমপেজে নেওয়া হচ্ছে...' : 'ড্যাশবোর্ডে ফিরে আসা হয়েছে')
                      : (nextState ? 'Opening Homepage...' : 'Returned to Dashboard'),
                    'info'
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border transition cursor-pointer active:scale-95 ml-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600"
                title={lang === 'bn' ? "হোমপেজ / মূল ওয়েবসাইটে যান" : "Go to Homepage"}
              >
                <Home className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden sm:inline">
                  {lang === 'bn' ? 'হোমপেজ' : 'Homepage'}
                </span>
              </button>
            )}


            {/* Quick action orange button with dropdown plus sign */}
            <div className="relative">
              <button
                onClick={function() { setIsQuickAddOpen(!isQuickAddOpen); }}
                className="w-10 h-10 rounded bg-[#FF4500] hover:bg-[#ff5d20] flex items-center justify-center text-white text-lg font-bold shadow-md transition active:scale-95 cursor-pointer ml-1"
                title="Quick Add Menu"
              >
                <Plus className="h-5 w-5 stroke-[3.5px] text-white" />
              </button>

              {isQuickAddOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={function() { setIsQuickAddOpen(false); }} 
                  />
                  <div 
                    className="absolute left-0 mt-2 w-60 rounded-xl bg-[rgb(1,12,45)] border border-blue-500/40 shadow-2xl py-1.5 z-50 text-white font-sans text-xs"
                  >
                    <div className="px-4 py-2 text-[11px] text-amber-400 font-bold uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}</span>
                      <span className="text-[9.5px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">FAST</span>
                    </div>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddProductOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-bold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <Package className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-bold tracking-wide">{lang === 'bn' ? 'আইটেম যোগ করুন' : 'Add Item/Product'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddCustomerOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-bold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <UserPlus className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-bold tracking-wide">{lang === 'bn' ? 'গ্রাহক যোগ করুন' : 'Add Customer'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddEmployeeOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-bold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <Users className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-bold tracking-wide">{lang === 'bn' ? 'স্টাফ যোগ করুন' : 'Add Staff'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddQuotationOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-bold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <FileText className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-bold tracking-wide">{lang === 'bn' ? 'কোটেশন যোগ করুন' : 'New Quotation'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setActiveTab('pos'); setActiveSubTab('pos'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-bold text-[13.5px] text-white hover:text-amber-300 border-t border-white/10 mt-1"
                    >
                      <ShoppingCart className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-bold tracking-wide">{lang === 'bn' ? 'পিওএস (POS)' : 'Open POS Screen'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Topbar Right Side Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Ticking Seconds Digital Clock (Placed before Language Toggle) */}
            <TopbarLiveClock lang={lang} />

            {/* Language Switch Panel */}
            <button
              onClick={function() { setLang(lang === 'bn' ? 'en' : 'bn'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-400/30 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-sm"
              title={lang === 'bn' ? "Switch software language to English" : "সফ্টওয়্যারের ভাষা বাংলায় পরিবর্তন করুন"}
            >
              <Languages className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline">{lang === 'bn' ? '🌐 English' : '🌐 বাংলা'}</span>
              <span className="sm:hidden">{lang === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            {/* Online / Offline / Syncing status badge */}
            <NetworkStatusBadge
              lang={lang}
              syncingCount={syncCounts.syncing.count + syncCounts.queued.count}
            />

            {/* Sync Status Button */}

            {(() => {
              const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
              const fmt = (t: number | null) => (t ? new Date(t).toLocaleString(locale) : (lang === 'bn' ? 'এখনো নয়' : 'never'));
              const dotTitle = (statusBn: string, statusEn: string, m: SyncMetaEntry) => {
                const parts: string[] = [];
                parts.push(`${lang === 'bn' ? statusBn : statusEn}: ${m.count}`);
                parts.push(`${lang === 'bn' ? 'শেষ চেষ্টা' : 'last attempt'}: ${fmt(m.lastAt)}`);
                if (m.lastLabel) parts.push(m.lastLabel);
                if (m.lastError) parts.push(`${lang === 'bn' ? 'ত্রুটি' : 'error'}: ${m.lastError}`);
                return parts.join(' • ');
              };
              const overallLabel = lang === 'bn'
                ? `সিঙ্ক স্ট্যাটাস প্যানেল খুলুন — অপেক্ষমাণ ${syncCounts.queued.count}, সিঙ্ক হচ্ছে ${syncCounts.syncing.count}, ব্যর্থ ${syncCounts.failed.count}, সফল ${syncCounts.succeeded.count}`
                : `Open sync status panel — queued ${syncCounts.queued.count}, syncing ${syncCounts.syncing.count}, failed ${syncCounts.failed.count}, succeeded ${syncCounts.succeeded.count}`;
              return (
                <button
                  type="button"
                  onClick={() => setShowSyncPanel(v => !v)}
                  aria-label={overallLabel}
                  aria-expanded={showSyncPanel}
                  aria-haspopup="dialog"
                  title={overallLabel}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-semibold text-[13.5px] sm:text-[14px] transition active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                    syncCounts.failed.count > 0
                      ? 'bg-red-500/90 hover:bg-red-500'
                      : pendingSyncCount > 0
                      ? 'bg-amber-500/90 hover:bg-amber-500'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {/* Per-status colored dots — spans (not buttons) with title + aria-label for tooltips + SR text */}
                  <span className="flex items-center gap-1" role="group" aria-label={lang === 'bn' ? 'সিঙ্ক স্ট্যাটাস কাউন্ট' : 'Sync status counts'}>
                    {syncCounts.queued.count > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-white/90"
                        title={dotTitle('অপেক্ষমাণ', 'Queued', syncCounts.queued)}
                        aria-label={dotTitle('অপেক্ষমাণ', 'Queued', syncCounts.queued)}
                      >
                        <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {syncCounts.queued.count}
                      </span>
                    )}
                    {syncCounts.syncing.count > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-white/90"
                        title={dotTitle('সিঙ্ক হচ্ছে', 'Syncing', syncCounts.syncing)}
                        aria-label={dotTitle('সিঙ্ক হচ্ছে', 'Syncing', syncCounts.syncing)}
                      >
                        <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 motion-safe:animate-pulse motion-reduce:ring-2 motion-reduce:ring-blue-300/70" />
                        {syncCounts.syncing.count}
                      </span>
                    )}
                    {syncCounts.failed.count > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-white"
                        title={dotTitle('ব্যর্থ', 'Failed', syncCounts.failed)}
                        aria-label={dotTitle('ব্যর্থ', 'Failed', syncCounts.failed)}
                      >
                        <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 motion-safe:animate-pulse motion-reduce:ring-2 motion-reduce:ring-red-300/70" />
                        {syncCounts.failed.count}
                      </span>
                    )}
                    {syncCounts.succeeded.count > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-white/80"
                        title={dotTitle('সফল', 'Succeeded', syncCounts.succeeded)}
                        aria-label={dotTitle('সফল', 'Succeeded', syncCounts.succeeded)}
                      >
                        <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {syncCounts.succeeded.count}
                      </span>
                    )}
                    {(() => {
                      // Aggregate dot styling — see src/pos-app/lib/syncDotStyle.ts
                      // (unit-tested for color, animation, and reduced-motion fallback).
                      const { cls, anim, titleBn, titleEn } = aggregateDotStyle({
                        queued: syncCounts.queued.count,
                        syncing: syncCounts.syncing.count,
                        succeeded: syncCounts.succeeded.count,
                        failed: syncCounts.failed.count,
                      });
                      const title = lang === 'bn' ? titleBn : titleEn;
                      return (
                        <span
                          aria-hidden="true"
                          className={`inline-block w-2 h-2 rounded-full ml-0.5 ${cls} ${anim}`}
                          title={title}
                        />
                      );
                    })()}
                  </span>
                  <span className="hidden sm:inline">
                    {lang === 'bn' ? 'সিঙ্ক' : 'Sync'}
                  </span>
                  {/* Live region: announces error summary to screen readers */}
                  <span className="sr-only" aria-live="polite" aria-atomic="true">
                    {syncCounts.failed.count > 0 && syncCounts.failed.lastError
                      ? (lang === 'bn'
                          ? `${syncCounts.failed.count}টি সিঙ্ক ব্যর্থ। সর্বশেষ ত্রুটি: ${syncCounts.failed.lastError}`
                          : `${syncCounts.failed.count} sync failures. Latest error: ${syncCounts.failed.lastError}`)
                      : ''}
                  </span>
                </button>
              );
            })()}

            {/* Keyboard Shortcuts Guide Button */}
            <button
              onClick={function() { setIsKeyboardShortcutsModalOpen(true); }}
              title={lang === 'bn' ? 'কিবোর্ড শর্টকাট তালিকা (Shift + ?)' : 'Keyboard Shortcuts Guide'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[12.5px] transition active:scale-95 cursor-pointer whitespace-nowrap border border-white/20"
            >
              <span>⌨️</span>
              <span className="hidden md:inline">{lang === 'bn' ? 'শর্টকাট গাইড' : 'Shortcuts'}</span>
            </button>

            {/* POS Button Link */}
            <button
              onClick={function() { setActiveTab('pos'); setActiveSubTab('pos'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white font-semibold text-[13.5px] sm:text-[14px] transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <div className="p-0.5 border border-white/40 rounded flex items-center justify-center shrink-0">
                <Plus className="h-3 w-3 text-white stroke-[2.5px]" />
              </div>
              <span>POS</span>
            </button>

            {/* Impersonation quick-return: jump straight back to Super Admin panel */}
            {impersonationOrigin && (
              <button
                type="button"
                onClick={function() {
                  exitImpersonation();
                  setActiveTab('super_admin_panel');
                  setActiveSubTab('');
                }}
                title={lang === 'bn' ? 'সুপার এডমিন প্যানেলে ফিরে যান' : 'Return to Super Admin Panel'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-[#1a1300] text-[11px] font-bold shadow-md shadow-amber-500/30 border border-amber-200 transition cursor-pointer animate-pulse"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'অ্যাডমিন অপশন' : 'Admin Option'}</span>
              </button>
            )}



            {/* Profile & Role Badge Switcher Panel */}
            {(() => {
              const roleInfo = sessionUser.role === 'super_admin'
                ? {
                    label: lang === 'bn' ? 'সুপার এডমিন' : 'Super Admin',
                    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
                    avatarGrad: 'from-blue-600 to-indigo-600',
                    dot: 'bg-blue-400',
                  }
                : sessionUser.role === 'owner'
                  ? {
                      label: lang === 'bn' ? 'মালিক' : 'Owner',
                      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                      avatarGrad: 'from-emerald-600 to-teal-500',
                      dot: 'bg-emerald-400',
                    }
                  : {
                      label: lang === 'bn' ? 'কর্মী' : 'Staff',
                      badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
                      avatarGrad: 'from-amber-500 to-orange-500',
                      dot: 'bg-amber-400',
                    };

              const shopName = (sessionUser as any).shopName;
              const userInitial = ((sessionUser.name || 'U').trim().charAt(0) || 'U').toUpperCase();

              return (
            <div className="relative group/role">
              {/* Clean, Polished Glassmorphism User Chip */}
              <div 
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs select-none"
                title={`${sessionUser.name} (${roleInfo.label})${shopName ? ` • ${shopName}` : ''}`}
              >
                {/* Modern Avatar with Active Pulsing Dot */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${roleInfo.avatarGrad} flex items-center justify-center text-white font-bold text-xs shadow-inner border border-white/20`}>
                    {userInitial}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${roleInfo.dot} ring-2 ring-[rgb(2,23,86)] animate-pulse`} />
                </div>

                {/* Clean Two-Line Text Info with Proper Spacing */}
                <div className="flex flex-col text-left justify-center min-w-0 pr-0.5">
                  <div className="flex items-center gap-1.5 leading-snug">
                    <span className="text-white text-[12.5px] font-bold truncate max-w-[120px]">
                      {sessionUser.name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold border leading-none ${roleInfo.badge} shrink-0`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  {shopName && (
                    <div className="text-[10.5px] text-white/75 font-medium truncate max-w-[170px] mt-0.5 flex items-center gap-1 leading-normal" title={shopName}>
                      <Store className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                      <span className="truncate">{shopName}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown Chevron */}
                <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover/role:text-white group-hover/role:rotate-180 transition-transform duration-200 shrink-0 ml-0.5" />
              </div>

              {/* Elegant Dropdown to switch roles for testing */}
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 hidden group-hover/role:block z-50 text-slate-800 dark:text-white">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">
                    {sessionUser.role === 'super_admin' 
                      ? (lang === 'bn' ? 'ডেভেলপার রোল কন্ট্রোল' : 'DEVELOPER ROLE SWITCHER') 
                      : (lang === 'bn' ? 'ব্যবহারকারী প্রোফাইল' : 'USER PROFILE')}
                  </span>
                </div>
                
                {sessionUser.role === 'super_admin' ? (
                  <>
                    {/* 1. Super Admin Option */}
                    <button
                      type="button"
                      onClick={function() {
                        setImpersonationOrigin(null);
                        setSessionUser({
                          name: "Fardous Al-Amin",
                          email: "fardous.jp2021@gmail.com",
                          role: "super_admin",
                          roleTitleBn: "ডেভেলপার / সুপার এডমিন",
                          roleTitleEn: "Developer / Super Admin",
                          employeeRole: "Super Admin"
                        });
                        setActiveTab('super_admin_panel');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ${sessionUser.role === 'super_admin' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    >
                      <span>💻 {lang === 'bn' ? "১. সুপার এডমিন" : "1. Super Admin"}</span>
                      {sessionUser.role === 'super_admin' && <span className="text-blue-500">✓</span>}
                    </button>
                    
                    {/* 2. Merchant Owner Option */}
                    <button
                      type="button"
                      onClick={function() {
                        setSessionUser({
                          name: "Farhad Owner",
                          email: "farhad.owner@gmail.com",
                          role: "owner",
                          roleTitleBn: "দোকানের মালিক",
                          roleTitleEn: "Shop Owner",
                          employeeRole: "Owner"
                        });
                        setActiveTab('dashboard');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ${sessionUser.role === 'owner' ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-bold' : ''}`}
                    >
                      <span>🔑 {lang === 'bn' ? "২. দোকানের মালিক" : "2. Shop Owner"}</span>
                      {sessionUser.role === 'owner' && <span className="text-green-500">✓</span>}
                    </button>
                    
                    {/* 3. Employee Cashier Option */}
                    <button
                      type="button"
                      onClick={function() {
                        setSessionUser({
                          name: "Hasan Cashier",
                          email: "cashier@gloriousit.com",
                          role: "employee",
                          roleTitleBn: "কর্মচারী / ক্যাশিয়ার",
                          roleTitleEn: "Employee / Cashier",
                          employeeRole: "Operator"
                        });
                        setActiveTab('dashboard');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ${sessionUser.role === 'employee' ? 'bg-yellow-50 dark:bg-yellow-950/45 text-yellow-600 dark:text-yellow-400 font-bold' : ''}`}
                    >
                      <span>👥 {lang === 'bn' ? "৩. কর্মচারী / ক্যাশিয়ার" : "3. Employee / Staff"}</span>
                      {sessionUser.role === 'employee' && <span className="text-yellow-600">✓</span>}
                    </button>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9.5px] text-slate-400 px-2 leading-relaxed font-medium">
                      {lang === 'bn' ? "💡 রোল পরিবর্তন করে কর্মচারীদের জন্য মডিউল লকিং ও এক্সেস সিকিউরিটি লাইভ চেক করুন।" : "💡 Switch roles to witness module security shields instantly."}
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-1 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{shopName || 'রনি টেলিকম'}</span>
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>{lang === 'bn' ? 'সক্রিয় দোকান অ্যাকাউন্ট' : 'Active Shop Account'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{sessionUser.email || sessionUser.name}</p>
                  </div>
                )}

                {/* 🚪 LOGOUT BUTTON */}
                <div className="mt-2 pt-2 border-t border-rose-100 dark:border-rose-900/40">
                  <button
                    type="button"
                    onClick={function() {
                      setIsLandingPageVisible(true);
                      try {
                        localStorage.setItem('smarthisab_public_landing_enabled', 'true');
                        localStorage.removeItem('smarthisab_active_session_user');
                      } catch (e) {}
                      setSessionUser({
                        name: "দোকানের মালিক",
                        email: "owner@smarthisab.com",
                        shopName: "আমার দোকান",
                        role: "owner",
                        roleTitleBn: "দোকানের মালিক",
                        roleTitleEn: "Shop Owner",
                        employeeRole: "Owner"
                      });
                      showToast && showToast(lang === 'bn' ? 'সফলভাবে লগ আউট করা হয়েছে!' : 'Logged out successfully!', 'info');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 cursor-pointer transition shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      <span>{lang === 'bn' ? "লগ আউট (Sign Out)" : "Log Out"}</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-500">→</span>
                  </button>
                </div>
              </div>
            </div>
              );
            })()}
          </div>
        </header>

        {/* Lower layout body container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation Sidebar */}
          <aside className={`flex flex-col justify-between shrink-0 bg-[rgb(2,23,86)] border-r border-[rgb(1,12,45)] transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-16' : 'w-64 opacity-100'
          }`}>
            <div className="flex flex-col h-full overflow-hidden">

            {/* Top Sidebar Store Brand Header (Full-Width High Visibility) */}
            <div className={`border-b border-white/10 transition-all ${isSidebarCollapsed ? 'p-2 text-center' : 'px-4 py-3.5 bg-white/5'}`}>
              {isSidebarCollapsed ? (
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5 text-amber-300" />
                  )}
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <div 
                    className={`font-bold text-white tracking-tight break-words drop-shadow-md line-clamp-2 ${getShopNameDynamicClass(shopName, storeFontSize)}`}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}
                    title={shopName || 'রনি টেলিকম'}
                  >
                    {shopName || 'রনি টেলিকম'}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
                      {storeCode || 'ST0002'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {lang === 'bn' ? 'অনলাইন' : 'Online'}
                    </span>
                  </div>
                </div>
              )}
            </div>

              {/* Sidebar menu lists with active navigation handles */}
              <nav className={`flex-1 overflow-y-auto select-none ${
                isSidebarCollapsed ? 'p-1.5 space-y-3' : 'p-3 space-y-1'
              }`} style={{ scrollbarWidth: 'none' }}>
              {[
                {
                  id: 'super_admin_panel',
                  titleBn: "সুপার এডমিন",
                  titleEn: "Super Admin",
                  icon: ShieldAlert,
                  isStandalone: true,
                  tab: 'super_admin_panel'
                },
                {
                  id: 'dashboard',
                  titleBn: "ড্যাশবোর্ড",
                  titleEn: "Dashboard",
                  icon: LayoutDashboard,
                  isStandalone: true,
                  tab: 'dashboard'
                },
                {
                  id: 'users',
                  titleBn: "ইউজার তালিকা",
                  titleEn: "Users List",
                  icon: Users,
                  isStandalone: true,
                  tab: 'users'
                },
                {
                  id: 'sales',
                  titleBn: "বিক্রয়",
                  titleEn: "Sales",
                  icon: ShoppingCart,
                  isStandalone: false,
                   items: [
                    { subId: 'pos_terminal', nameBn: 'পিওএস (POS)', nameEn: 'POS', tab: 'pos', icon: Monitor },
                    { subId: 'sales_history', nameBn: 'বিক্রয় ইতিহাস', nameEn: 'Sales History', tab: 'pos', icon: List },
                    { subId: 'sales_returns', nameBn: 'বিক্রয় রিটার্ন ও এক্সচেঞ্জ', nameEn: 'Sales Return & Exchange', tab: 'pos', icon: RotateCcw },
                    { subId: 'warranty_claims', nameBn: 'ওয়ারেন্টি ও ক্লেইম', nameEn: 'Warranty & Claims', tab: 'pos', icon: List }
                  ]
                },
                {
                  id: 'contacts',
                  titleBn: "যোগাযোগ",
                  titleEn: "Contacts",
                  icon: BookOpen,
                  isStandalone: false,
                   items: [
                    { subId: 'contacts_customers', nameBn: 'কাস্টমার', nameEn: 'Customers', tab: 'customers', icon: BookOpen },
                    { subId: 'contacts_suppliers', nameBn: 'সাপ্লায়ার', nameEn: 'Suppliers', tab: 'customers', icon: BookOpen }
                  ]
                },
                {
                  id: 'installments',
                  titleBn: "কিস্তি",
                  titleEn: "Installments",
                  icon: Wallet,
                  isStandalone: true,
                  tab: 'installments',
                  hasBadge: true
                },
                {
                  id: 'quotations',
                  titleBn: "কোটেশন ও বুকিং",
                  titleEn: "Quotations & Bookings",
                  icon: FileText,
                  isStandalone: false,
                  items: [
                    { subId: 'quote_new', nameBn: 'নতুন কোটেশন', nameEn: 'New Quotation', tab: 'quotations', icon: Plus },
                    { subId: 'quote_list', nameBn: 'কোটেশন তালিকা', nameEn: 'Quotation List', tab: 'quotations', icon: List },
                    { subId: 'advance_booking', nameBn: 'অগ্রিম বুকিং', nameEn: 'Advance Booking', tab: 'advance', icon: Clock }
                  ]
                },
                {
                  id: 'purchases',
                  titleBn: "ক্রয়",
                  titleEn: "Purchase",
                  icon: Package,
                  isStandalone: false,
                  items: [
                    { subId: 'purchase_new', nameBn: 'নতুন ক্রয়', nameEn: 'New Purchase', tab: 'purchases', icon: Plus },
                    { subId: 'purchase_history', nameBn: 'ক্রয় ইতিহাস', nameEn: 'Purchase History', tab: 'purchases', icon: List }
                  ]
                },
                {
                  id: 'accounting',
                  titleBn: "অ্যাকাউন্টিং",
                  titleEn: "Accounting",
                  icon: TrendingUp,
                  isStandalone: false,
                  items: [
                    { subId: 'acc_dashboard',    nameBn: 'ড্যাশবোর্ড',        nameEn: 'Dashboard',       tab: 'accounting', icon: BarChart3 },
                    { subId: 'acc_income',       nameBn: 'আয়',                nameEn: 'Income',          tab: 'accounting', icon: TrendingUp },
                    { subId: 'acc_transactions', nameBn: 'লেনদেন',            nameEn: 'Transactions',    tab: 'accounting', icon: List },
                    { subId: 'acc_reports',      nameBn: 'রিপোর্ট',           nameEn: 'Reports',         tab: 'accounting', icon: FileText }
                  ]
                },
                {
                  id: 'items',
                  titleBn: "আইটেম",
                  titleEn: "Items",
                  icon: Layers,
                  isStandalone: false,
                  items: [
                    { subId: 'list_products', nameBn: 'পণ্য তালিকা', nameEn: 'Product List', tab: 'inventory', icon: List },
                    { subId: 'list_services', nameBn: 'সার্ভিস তালিকা', nameEn: 'Service List', tab: 'inventory', icon: List },
                    { subId: 'categories', nameBn: 'ক্যাটাগরি', nameEn: 'Categories', tab: 'inventory', icon: List },
                    { subId: 'variants', nameBn: 'ভ্যারিয়েন্ট', nameEn: 'Variants', tab: 'inventory', icon: List },
                    { subId: 'print_labels', nameBn: 'প্রিন্ট লেবেল', nameEn: 'Print Labels', tab: 'inventory', icon: BarcodeIcon },
                    { subId: 'import_items', nameBn: 'ইমপোর্ট আইটেম', nameEn: 'Import Items', tab: 'inventory', icon: ImportIcon },
                    { subId: 'import_services', nameBn: 'ইমপোর্ট সার্ভিস', nameEn: 'Import Services', tab: 'inventory', icon: ImportIcon },
                    { subId: 'warranty_serial', nameBn: 'ওয়ারেন্টি', nameEn: 'Warranty & Serial', tab: 'inventory', icon: List },
                    { subId: 'batch_expiry', nameBn: 'ব্যাচ ও মেয়াদ', nameEn: 'Batch & Expiry', tab: 'inventory', icon: List },
                    { subId: 'combos', nameBn: 'কম্বো প্যাকেজ', nameEn: 'Combos', tab: 'inventory', icon: Layers },
                    { subId: 'stock_alert', nameBn: 'স্টক সতর্কতা', nameEn: 'Stock Alert', tab: 'inventory', icon: BarChart3 },
                    { subId: 'import_export', nameBn: 'ইমপোর্ট / এক্সপোর্ট', nameEn: 'Import / Export', tab: 'inventory', icon: FileText }
                  ]
                },
                {
                  id: 'stock',
                  titleBn: "স্টক",
                  titleEn: "Stock",
                  icon: Hourglass,
                  isStandalone: true,
                  tab: 'stock'
                },
                {
                  id: 'expenses',
                  titleBn: "খরচ",
                  titleEn: "Expenses",
                  icon: MinusCircle,
                  isStandalone: true,
                  tab: 'expenses'
                },
                {
                  id: 'messaging',
                  titleBn: "বার্তা সমূহ",
                  titleEn: "Messaging",
                  icon: Mail,
                  isStandalone: true,
                  tab: 'messaging'
                },
                {
                  id: 'reports',
                  titleBn: "রিপোর্ট সেন্টার",
                  titleEn: "Report Center",
                  icon: BarChart3,
                  isStandalone: false,
                  items: [
                    { subId: 'rep_sales',     nameBn: 'বিক্রয়',        nameEn: 'Sales',        tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_purchase',  nameBn: 'ক্রয়',          nameEn: 'Purchase',     tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_inventory', nameBn: 'ইনভেন্টরি',     nameEn: 'Inventory',    tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_financial', nameBn: 'ফাইন্যান্স',    nameEn: 'Finance',      tab: 'reports', icon: FileText },
                    { subId: 'rep_warranty',  nameBn: 'ওয়ারেন্টি',     nameEn: 'Warranty',     tab: 'reports', icon: FileText },
                    { subId: 'rep_analytics', nameBn: 'অ্যানালিটিক্স',  nameEn: 'Analytics',    tab: 'reports', icon: LineChart },
                    { subId: 'print_doc',     nameBn: 'এক্সপোর্ট ও প্রিন্ট', nameEn: 'Export & Print', tab: 'reports', icon: FileSpreadsheet }
                  ]
                },
                {
                  id: 'ai_intelligence',
                  titleBn: "এআই স্মার্ট হাব",
                  titleEn: "AI Smart Hub",
                  icon: Sparkles,
                  isStandalone: true,
                  tab: 'ai_intelligence',
                  hasBadge: true
                },
                {
                  id: 'settings',
                  titleBn: "Settings",
                  titleEn: "Settings",
                  icon: Settings,
                  isStandalone: false,
                  items: [
                    { subId: 'store', nameBn: 'স্টোর (Store)', nameEn: 'Store Settings', tab: 'settings', icon: Briefcase, action: function() { setSettingsActiveTab('store'); setActiveSubTab('store'); } },
                    { subId: 'system', nameBn: 'সাইট সেটিং (Site Settings)', nameEn: 'Site Settings', tab: 'settings', icon: Shield, action: function() { setSettingsActiveTab('system'); setActiveSubTab('system'); } },
                    { subId: 'support', nameBn: 'গ্রাহক সহায়তা ডেস্ক', nameEn: 'Customer Support Desk', tab: 'settings', icon: Headphones, action: function() { setSettingsActiveTab('support'); setActiveSubTab('support'); } }
                  ]
                }
              ].filter(function(item: any) {
                // Hide super-admin-only entries from shop owners/employees
                if (item.id === 'super_admin_panel' && sessionUser.role !== 'super_admin') return false;
                return true;
              }).map(function(item: any) {
                var isSelected = item.isStandalone 
                  ? activeTab === item.tab 
                  : (item.items && item.items.some(function(sub: any) {
                      return activeTab === sub.tab && (!activeSubTab || activeSubTab === sub.subId);
                    }));

                var ItemIcon = item.icon;

                if (isSidebarCollapsed) {
                  var collapsedTooltip = lang === 'bn' ? item.titleBn : item.titleEn;
                  var isLocked = sessionUser.role === 'employee' && (item.id === 'purchases' || item.id === 'accounting' || item.id === 'super_admin_panel');
                  return (
                    <div key={item.id} className="relative group flex justify-center py-0.5">
                      <button
                        onClick={function() {
                          if (isLocked) {
                            setBlockedSectionLabel(lang === 'bn' ? item.titleBn : item.titleEn);
                            setIsAccessBlockedModalOpen(true);
                            return;
                          }
                          if (item.isStandalone) {
                            setActiveTab(item.tab || 'dashboard');
                            setActiveSubTab('');
                          } else if (item.items && item.items.length > 0) {
                            var firstSub = item.items[0];
                            setActiveTab(firstSub.tab);
                            setActiveSubTab(firstSub.subId);
                            if (firstSub.action) {
                              firstSub.action();
                            }
                          }
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? 'text-white bg-[rgb(12,45,140)] border-l-4 border-[#FFB200] font-bold shadow-md scale-105'
                            : 'text-white hover:bg-[rgb(6,36,115)]'
                        }`}
                        title={collapsedTooltip}
                      >
                        <div className="relative">
                          <ItemIcon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-[#FFB200]' : 'text-white'}`} />
                          {isLocked && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full w-3.5 h-3.5 flex items-center justify-center text-white text-[8px] font-bold" title="Locked">🔒</span>
                          )}
                        </div>
                        {item.hasBadge && (
                          <span className="absolute top-1 right-1 bg-red-500 w-1.5 h-1.5 rounded-full" />
                        )}
                      </button>
                    </div>
                  );
                }

                var isLocked = sessionUser.role === 'employee' && (item.id === 'purchases' || item.id === 'accounting' || item.id === 'super_admin_panel');

                if (item.isStandalone) {
                  var btnClass = isSelected
                    ? "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[15.5px] sm:text-[16.5px] font-[805] text-white bg-[rgb(12,45,140)] border-l-4 border-[#FFB200] transition-all cursor-pointer relative shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB200]"
                    : "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[15.5px] sm:text-[16.5px] font-[805] text-white hover:bg-[rgb(6,36,115)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFB200]";
                  
                  return (
                    <button
                      key={item.id}
                      data-sidebar-item="true"
                      tabIndex={0}
                      onClick={function() { 
                        if (isLocked) {
                          setBlockedSectionLabel(lang === 'bn' ? item.titleBn : item.titleEn);
                          setIsAccessBlockedModalOpen(true);
                          return;
                        }
                        setActiveTab(item.tab || 'dashboard'); 
                        setActiveSubTab(''); 
                        setOpenGroup(null); 
                      }}
                      className={btnClass}
                    >
                      <div className="flex items-center gap-3">
                        <ItemIcon className={`h-5 w-5 shrink-0 ${isSelected ? 'text-[#FFB200]' : 'text-white'}`} />
                        <span>{lang === 'bn' ? item.titleBn : item.titleEn}</span>
                      </div>
                      {isLocked && (
                        <span className="text-yellow-500 font-bold text-xs shrink-0 flex items-center gap-0.5">
                          🔒 {lang === 'bn' ? 'সংরক্ষিত' : 'Locked'}
                        </span>
                      )}
                    </button>
                  );
                } else {
                  var isGroupOpen = openGroup === item.id;
                  var hasActiveInside = item.items && item.items.some(function(sub: any) {
                    return activeTab === sub.tab && (!activeSubTab || activeSubTab === sub.subId);
                  });
                  var GroupIcon = item.icon;
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        data-sidebar-item="true"
                        tabIndex={0}
                        onClick={function() { setOpenGroup(isGroupOpen ? null : item.id); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[15.5px] sm:text-[16.5px] font-[805] transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#FFB200] ${
                          isGroupOpen || hasActiveInside
                            ? 'bg-[rgb(12,45,140)] text-white border-l-4 border-[#FFB200] font-bold shadow-sm'
                            : 'text-white hover:bg-[rgb(6,36,115)] font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <GroupIcon className={`h-5 w-5 shrink-0 ${isGroupOpen || hasActiveInside ? 'text-[#FFB200]' : 'text-white'}`} />
                          <span className="text-left leading-tight truncate max-w-[170px]">
                            {lang === 'bn' ? item.titleBn : item.titleEn}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLocked && (
                            <span className="text-yellow-500 text-xs font-bold font-[805]">🔒</span>
                          )}
                          {item.hasBadge && (
                            <span className="bg-[#ff4d4f] text-white rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider leading-none select-none">
                              new
                            </span>
                          )}
                          <span className="text-white/60 text-[10px] font-bold">
                            {isGroupOpen ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronLeft className="h-3 w-3" />
                            )}
                          </span>
                        </div>
                      </button>
 
                      {isGroupOpen && item.items && (
                        <div className="py-1 space-y-0.5 rounded-lg bg-[rgb(1,12,45)] mt-0.5 overflow-hidden border border-[rgb(12,45,140)]">
                          {item.items.map(function(sub: any) {
                            var isSubActive = activeTab === sub.tab && activeSubTab === sub.subId;
                            var SubIcon = sub.icon;
                            var isSubLocked = sessionUser.role === 'employee' && (sub.subId === 'suppliers' || sub.tab === 'purchases' || sub.tab === 'accounting');
                            return (
                              <button
                                key={sub.subId}
                                data-sidebar-item="true"
                                tabIndex={0}
                                onClick={function() {
                                  if (isSubLocked) {
                                    setBlockedSectionLabel(lang === 'bn' ? sub.nameBn : sub.nameEn);
                                    setIsAccessBlockedModalOpen(true);
                                    return;
                                  }
                                  setActiveTab(sub.tab);
                                  setActiveSubTab(sub.subId);
                                  if (sub.action) {
                                    sub.action();
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer block truncate focus:outline-none focus:ring-2 focus:ring-[#FFB200] ${
                                  isSubActive
                                    ? 'text-white bg-[rgb(12,45,140)] font-bold border-l-2 border-[#FFB200]'
                                    : 'text-[#cfe2fe] hover:text-white hover:bg-[rgb(6,36,115)] font-bold'
                                }`}
                              >
                                <SubIcon className={`h-4 w-4 shrink-0 ${isSubActive ? 'text-[#FFB200]' : 'text-[#cfe2fe]/60'}`} />
                                <span className="truncate max-w-[140px]">{lang === 'bn' ? sub.nameBn : sub.nameEn}</span>
                                {isSubLocked && (
                                  <span className="ml-auto text-yellow-500 text-[9.5px] flex items-center gap-0.5 font-bold">
                                    🔒 {lang === 'bn' ? 'সংরক্ষিত' : 'Locked'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </nav>

            {!isSidebarCollapsed && (
              <div 
                onClick={function() { setIsKeyboardShortcutsModalOpen(true); }}
                className="px-3 py-2 border-t border-[rgb(12,45,140)] bg-[rgb(1,12,45)] flex items-center justify-between text-white/80 hover:text-white cursor-pointer group transition select-none"
                title={lang === 'bn' ? "কিবোর্ড শর্টকাট গাইড দেখুন" : "View Keyboard Shortcuts"}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span>⌨️</span>
                  <span>{lang === 'bn' ? 'কিবোর্ড: Alt+M | ↑↓' : 'Nav: Alt+M | ↑↓'}</span>
                </div>
                <span className="text-[10px] bg-[#FFB200] text-[#1a1300] font-bold px-1.5 py-0.5 rounded group-hover:scale-105 transition">
                  {lang === 'bn' ? 'গাইড' : 'Guide'}
                </span>
              </div>
            )}
          </div>

          {isSidebarCollapsed ? (
            <div className="h-14 border-t border-[rgb(12,45,140)] bg-[rgb(1,12,45)] flex items-center justify-center shrink-0">
              <div 
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 cursor-default"
                title={sessionUser.name}
              >
                {sessionUser.role === 'super_admin' ? 'D' : sessionUser.role === 'owner' ? 'O' : 'E'}
              </div>
            </div>
          ) : (
            <div className="h-14 px-4 border-t border-[rgb(12,45,140)] bg-[rgb(1,12,45)] flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-405 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 select-none">
                {sessionUser.role === 'super_admin' ? 'DEV' : sessionUser.role === 'owner' ? 'OWN' : 'EMP'}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-white text-xs font-bold leading-tight truncate">{sessionUser.name}</span>
                <span className="text-[#cfe2fe]/60 text-[10px] leading-tight mt-0.5 truncate">
                  {lang === 'bn' ? sessionUser.roleTitleBn : sessionUser.roleTitleEn}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Workspace Main Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ scrollbarWidth: 'none' }}>

            {/* ── SaaS Subscription & Tenant Access Control Calculations ── */}
            {(() => {
              const activeTenantUser = systemEmployees.find(e => e.email === sessionUser.email || e.name === sessionUser.name) || sessionUser;
              const subExpiryDateStr = activeTenantUser.subscriptionExpiry || '2026-12-31';
              const subExpiryDate = new Date(subExpiryDateStr);
              const todayDate = new Date();
              const diffMs = subExpiryDate.getTime() - todayDate.getTime();
              const daysLeft = Math.ceil(diffMs / (1000 * 3600 * 24));
              const isExpiringSoon = daysLeft <= 7 && daysLeft >= 0 && sessionUser.role !== 'super_admin';
              const isSubExpired = daysLeft < 0 && sessionUser.role !== 'super_admin';
              const isUserBlocked = (activeTenantUser.isBlocked || activeTenantUser.status === 'Blocked') && sessionUser.role !== 'super_admin';

              return (
                <>
                  {/* 🚨 SaaS Subscription 7-Day Pre-Expiry Alert Banner */}
                  {isExpiringSoon && (
                    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 dark:text-amber-200 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm text-lg">
                          ⚠️
                        </div>
                        <div>
                          <p className="font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                            {lang === 'bn' ? 'সফটওয়্যার সাবস্ক্রিপশন মেয়াদ অ্যালার্ট' : 'Subscription Expiration Warning'}
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                            {lang === 'bn' 
                              ? `আপনার দোকানের সাবস্ক্রিপশন মেয়াদের আর মাত্র ${daysLeft} দিন বাকি আছে (মেয়াদ শেষ: ${subExpiryDateStr})।`
                              : `Your shop subscription expires in ${daysLeft} days (Expiry: ${subExpiryDateStr}).`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-lg">
                          {activeTenantUser.planType || 'Active Plan'}
                        </span>
                        <a href="tel:01711944027" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shadow-xs">
                          📞 {lang === 'bn' ? 'রিনিউ করতে কল করুন' : 'Renew Subscription'}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 🔒 SaaS Subscription Expired or Blocked Lock Screen */}
                  {(isSubExpired || isUserBlocked) ? (
                    <div className="min-h-[65vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/40 shadow-xl my-4 animate-fadeIn">
                      <div className="w-20 h-20 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 text-4xl mb-4 shadow-inner">
                        🔒
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {isUserBlocked 
                          ? (lang === 'bn' ? "আপনার দোকান অ্যাকাউন্ট সাময়িক ব্লক করা হয়েছে" : "Account Suspended") 
                          : (lang === 'bn' ? "সাবস্ক্রিপশন মেয়াদ উত্তীর্ণ হয়েছে" : "Subscription Expired")}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md font-semibold leading-relaxed">
                        {isUserBlocked 
                          ? (lang === 'bn' ? "পেমেন্ট বা সিকিউরিটি সংক্রান্ত কারণে আপনার দোকানের পোর্টাল অ্যাক্সেস সাময়িকভাবে বন্ধ আছে। সফটওয়্যার পুনরায় চালু করতে সুপার এডমিনের সাথে যোগাযোগ করুন।" : "Your portal access has been suspended. Please contact Super Admin to reactivate your shop.")
                          : (lang === 'bn' ? `আপনার দোকানের সাবস্ক্রিপশন মেয়াদ (${subExpiryDateStr}) শেষ হয়ে গেছে। চালনা অব্যাহত রাখতে অনুগ্রহ করে সুপার এডমিনের সাথে যোগাযোগ করে প্যাকেজ রিনিউ করুন।` : `Your shop subscription expired on ${subExpiryDateStr}. Please renew your plan to unlock access.`)}
                      </p>

                      <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                        <a href="tel:01711944027" className="px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                          📞 01711944027 ({lang === 'bn' ? "সুপার এডমিনকে কল করুন" : "Call Admin"})
                        </a>
                        <a href="https://wa.me/8801711944027" target="_blank" rel="noreferrer" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                          💬 WhatsApp Support
                        </a>
                      </div>
                    </div>
                  ) : (
                    <>
            {impersonationOrigin && (
              <div className="mb-4 rounded-xl border-2 border-dashed border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
                    <UserCheck size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px]">
                      {lang === 'bn' ? 'ইউজার পোর্টাল অ্যাক্সেস (সুপার এডমিন)' : 'User Portal Access (Super Admin)'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{lang === 'bn' ? 'দেখছেন:' : 'Viewing as:'}</span>
                      <span className="font-bold text-amber-800 dark:text-amber-300">{sessionUser.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({sessionUser.email})</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold uppercase">
                        {lang === 'bn' ? sessionUser.roleTitleBn : sessionUser.roleTitleEn}
                      </span>
                    </p>
                    {((sessionUser as any).shopName || (sessionUser as any).shopOwnerName) && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex flex-wrap items-center gap-x-2">
                        {(sessionUser as any).shopName && (
                          <span>🏬 <span className="font-bold">{(sessionUser as any).shopName}</span></span>
                        )}
                        {(sessionUser as any).shopOwnerName && (
                          <span className="text-slate-500">
                            {lang === 'bn' ? 'মালিক:' : 'Owner:'}{' '}
                            <span className="font-bold text-slate-700 dark:text-slate-200">{(sessionUser as any).shopOwnerName}</span>
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex flex-wrap items-center gap-x-2">
                      <span className="text-slate-500">
                        {lang === 'bn' ? 'ফিরে যাবেন:' : 'Return to:'}
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        💻 {impersonationOrigin.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">({impersonationOrigin.email})</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
                        {lang === 'bn' ? impersonationOrigin.roleTitleBn : impersonationOrigin.roleTitleEn}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={exitImpersonation}
                  className="text-xs font-bold px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <ArrowLeftCircle size={14} />
                  {lang === 'bn' ? 'সুপার এডমিন সেশনে ফিরুন' : 'Return to Super Admin'}
                </button>
              </div>
            )}

            {/* Always-visible floating return pill — stays fixed on every page while impersonating */}
            {impersonationOrigin && (
              <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
                <div className="pointer-events-auto bg-gradient-to-br from-amber-500 to-orange-600 backdrop-blur border-2 border-amber-200 shadow-2xl shadow-amber-900/40 rounded-2xl overflow-hidden max-w-[340px]">
                  {/* Header strip: current role */}
                  <div className="bg-black/25 px-3 py-1.5 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-white shadow ${sessionUser.role === 'owner' ? 'bg-emerald-600' : 'bg-amber-700'}`}>
                      {sessionUser.role === 'owner' ? (lang === 'bn' ? '🔑 দোকানের মালিক' : '🔑 Shop Owner') : (lang === 'bn' ? '👥 কর্মচারী' : '👥 Employee')}
                    </span>
                    <span className="text-[9px] font-bold text-amber-100 uppercase tracking-wider">
                      {lang === 'bn' ? 'ইম্পার্সোনেশন চলছে' : 'Impersonating'}
                    </span>
                  </div>

                  {/* Body: who + which shop */}
                  <div className="px-3 py-2 space-y-1">
                    <div className="text-[11px] font-bold text-white leading-tight">
                      👁 <span className="underline decoration-amber-200 decoration-2 underline-offset-2">{sessionUser.name}</span>
                    </div>
                    {(sessionUser as any).shopName && (
                      <div className="text-[11px] font-bold text-amber-50 leading-tight">
                        🏬 <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold">{(sessionUser as any).shopName}</span>
                        {(sessionUser as any).shopOwnerName && (
                          <span className="text-amber-100/80 ml-1">
                            · {lang === 'bn' ? 'মালিক' : 'Owner'}: <span className="font-bold text-white">{(sessionUser as any).shopOwnerName}</span>
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] font-bold text-amber-50/95 leading-tight pt-1 border-t border-white/20">
                      {lang === 'bn' ? 'ফিরবেন:' : 'Return to:'}{' '}
                      <span className="font-bold text-white">💻 {impersonationOrigin.name}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={exitImpersonation}
                    title={lang === 'bn' ? 'সুপার এডমিন সেশনে ফিরুন' : 'Return to Super Admin'}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold shadow-inner active:scale-[0.98] transition cursor-pointer"
                  >
                    <ArrowLeftCircle size={14} />
                    {lang === 'bn' ? 'সুপার এডমিন সেশনে ফিরুন' : 'Return to Super Admin'}
                  </button>
                </div>
              </div>
            )}



            
            {activeTab === 'super_admin_panel' && (
              <div className="space-y-6 animate-fadeIn text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">System Integrity & Version Controls</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mt-1">
                      💻 {lang === 'bn' ? "সুপার এডমিন কন্ট্রোল সেন্টার" : "Developer Super Admin Hub"}
                    </h1>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg px-4 py-2.5 text-xs font-bold flex items-center gap-2 select-none shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {lang === 'bn' ? `ভার্সন: ${systemVersion}` : `SYSTEM VERSION: ${systemVersion}`}
                  </div>
                </div>

                {/* Grid layout containing 3 gorgeous cards */}
                
                {/* Super Admin White-Label Platform Branding Settings Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                        {lang === 'bn' ? 'ওয়েবসাইট ও প্ল্যাটফর্ম ব্রান্ডিং সেটিংস (Platform Branding)' : 'Platform Branding Settings'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === 'bn' ? 'সবার ওপরের বারে প্রদর্শিত প্ল্যাটফর্ম নাম ও গোল্ডেন ব্যাজ এডিটর' : 'Edit topbar platform name and golden badge text'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'প্ল্যাটফর্ম নাম (Platform Name)' : 'Platform Name'}
                      </label>
                      <input
                        type="text"
                        value={editingPlatformBrandName}
                        onChange={(e) => setEditingPlatformBrandName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                        placeholder="Nexus"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'গোল্ডেন ব্যাজ টেক্সট (Golden Badge Text)' : 'Golden Badge Text'}
                      </label>
                      <input
                        type="text"
                        value={editingPlatformBrandBadge}
                        onChange={(e) => setEditingPlatformBrandBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                        placeholder="ERP"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPlatformBrandName(editingPlatformBrandName);
                      setPlatformBrandBadge(editingPlatformBrandBadge);
                      localStorage.setItem('saim_platform_brand_name', editingPlatformBrandName);
                      localStorage.setItem('saim_platform_brand_badge', editingPlatformBrandBadge);
                      showToast(
                        lang === 'bn' ? 'প্ল্যাটফর্ম ব্র্যান্ডিং সফলভাবে আপডেট করা হয়েছে!' : 'Platform branding updated successfully!',
                        'success'
                      );
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ব্র্যান্ড সেটিংস সেভ করুন' : 'Save Platform Brand'}</span>
                  </button>
                </div>

                {/* Super Admin Subscription Packages Price Configurator Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[#8b26c7] dark:bg-purple-950 dark:text-purple-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                        💰 {lang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজের মূল্য নির্ধারণ (Subscription Pricing Controls)' : 'Subscription Pricing Controls'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === 'bn' ? 'পাবলিক হোমপেজে প্রদর্শিত মাসিক ও বাৎসরিক প্যাকেজ ফি পরিবর্তন করুন' : 'Edit public landing page monthly & yearly plan prices'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                    {/* Starter */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-sky-600 dark:text-sky-400 font-bold block">🚀 স্টার্টার প্যাকেজ</span>
                      <div>
                        <label className="text-[11px] text-slate-500 block">মাসিক (৳)</label>
                        <input
                          type="number"
                          id="admin-starter-m"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').starterMonthly || 499}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block">বাৎসরিক (৳)</label>
                        <input
                          type="number"
                          id="admin-starter-y"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').starterYearly || 4990}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Pro */}
                    <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                      <span className="text-[#8b26c7] dark:text-purple-300 font-bold block">⚡ প্রো বিজনেস</span>
                      <div>
                        <label className="text-[11px] text-slate-500 block">মাসিক (৳)</label>
                        <input
                          type="number"
                          id="admin-pro-m"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').proMonthly || 999}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block">বাৎসরিক (৳)</label>
                        <input
                          type="number"
                          id="admin-pro-y"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').proYearly || 9990}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Enterprise */}
                    <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold block">🌟 এন্টারপ্রাইজ</span>
                      <div>
                        <label className="text-[11px] text-slate-500 block">মাসিক (৳)</label>
                        <input
                          type="number"
                          id="admin-enterprise-m"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').enterpriseMonthly || 1999}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block">বাৎসরিক (৳)</label>
                        <input
                          type="number"
                          id="admin-enterprise-y"
                          defaultValue={JSON.parse(localStorage.getItem('saim_package_pricing_config') || '{}').enterpriseYearly || 19990}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sm = Number((document.getElementById('admin-starter-m') as HTMLInputElement)?.value || 499);
                      const sy = Number((document.getElementById('admin-starter-y') as HTMLInputElement)?.value || 4990);
                      const pm = Number((document.getElementById('admin-pro-m') as HTMLInputElement)?.value || 999);
                      const py = Number((document.getElementById('admin-pro-y') as HTMLInputElement)?.value || 9990);
                      const em = Number((document.getElementById('admin-enterprise-m') as HTMLInputElement)?.value || 1999);
                      const ey = Number((document.getElementById('admin-enterprise-y') as HTMLInputElement)?.value || 19990);

                      const newConfig = {
                        starterMonthly: sm,
                        starterYearly: sy,
                        proMonthly: pm,
                        proYearly: py,
                        enterpriseMonthly: em,
                        enterpriseYearly: ey,
                        yearlyDiscountPercent: 20
                      };
                      localStorage.setItem('saim_package_pricing_config', JSON.stringify(newConfig));
                      window.dispatchEvent(new CustomEvent('saim_pricing_updated'));
                      showToast(
                        lang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজের নতুন ফি সফলভাবে সেভ করা হয়েছে!' : 'Package prices updated successfully!',
                        'success'
                      );
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b26c7] to-[#701fa3] hover:brightness-110 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'প্যাকেজের নতুন ফি সেভ করুন (Save New Plan Prices)' : 'Save Package Prices'}</span>
                  </button>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: System Health & telemetry */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Live Cloud Telemetry</span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1 border-b border-slate-100 dark:border-slate-800 pb-2">☁️ {lang === 'bn' ? "ডাটাবেজ ও ক্লাউড স্ট্যাটাস" : "Cloud Sandbox Logs"}</h3>
                      <div className="mt-4 space-y-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Connection Link:</span>
                          <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">🟢 Connected</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Real-time Snapshots:</span>
                          <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md px-1.5 py-0.5 text-[10px] font-bold">Active (onSnapshot)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Firestore Database:</span>
                          <span className="font-mono text-slate-400 truncate max-w-[125px]" title="glorious-it-telecom-saim-db">telecom-saim-db</span>
                        </div>
                        <div className="flex justify-between items-center text-left">
                          <span>Server Uptime:</span>
                          <span className="font-mono text-indigo-500 font-bold">148 Hrs, 22 Mins</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Interactive Live Update Deployment Center */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Hot-Patch Delivery Service</span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1 pb-2 border-b border-slate-100 dark:border-slate-800">🚀 {lang === 'bn' ? "লাইভ ভার্সন আপগ্রেড সিস্টেম" : "Live Release Upgrades (No Data Loss)"}</h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === 'bn' ? "নতুন আপডেট এর বিবরণী লিখুন" : "Enter Deployment Log / Patch Notes"}</label>
                        <input
                          type="text"
                          defaultValue="সাপ্লায়ার বকেয়া হিসাব লকিং আপগ্রেড এবং রিয়াল-টাইম সিকিউরিটি পলিসি ডেপ্লয়মেন্ট সফলভাবে সম্পন্ন।"
                          id="admin-log-input"
                          className="w-full text-xs font-semibold p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                          placeholder={lang === 'bn' ? "এখানে আপডেটের বিবরণ লিখুন..." : "Enter patch message..."}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
                        <div className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                          💡 {lang === 'bn' ? "মালিকদের পুরাতন ডাটা অপরিবর্তিত রেখে শুধুমাত্র নতুন ফিচার অবমুক্ত করুন।" : "This action publishes the hot-patch to all active clients safely, maintaining user data."}
                        </div>
                        <button
                          type="button"
                          onClick={function() {
                            const val = (document.getElementById('admin-log-input') as HTMLInputElement)?.value || "New security update released";
                            setIsUpdatingSystem(true);
                            setSystemLogText(function(prev) {
                              return [val, ...prev];
                            });
                            setTimeout(function() {
                              setIsUpdatingSystem(false);
                              setSystemVersion(function(v) {
                                const parts = v.replace('v', '').split('.');
                                const newMinor = Number(parts[2]) + 1;
                                return `v${parts[0]}.${parts[1]}.${newMinor}`;
                              });
                            }, 2000);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all tracking-wider shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
                        >
                          ⚙️ {lang === 'bn' ? "সিস্টেম আপডেট করুন" : "Release Upgrade"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: SaaS Tenant Subscription & Demo Account Manager */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">SaaS Merchant Access Controls</span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                        📅 {lang === 'bn' ? "দোকান মালিকদের সাবস্ক্রিপশন ও ডেমো অ্যাকাউন্ট কন্ট্রোল" : "Merchant Subscriptions & Demo Access"}
                      </h3>
                    </div>
                    <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {systemEmployees.filter(e => e.shopOwner || e.role === 'Owner').length} Active Shops
                    </span>
                  </div>

                  {/* Shops Subscription Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Shop & Owner</th>
                          <th className="py-2.5 px-2">Plan Type</th>
                          <th className="py-2.5 px-2">Expiry Date</th>
                          <th className="py-2.5 px-2">Days Left</th>
                          <th className="py-2.5 px-2">Status</th>
                          <th className="py-2.5 px-3 text-right">Quick Subscription Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                        {systemEmployees.filter(e => e.shopOwner || e.role === 'Owner').map(owner => {
                          const expDate = new Date(owner.subscriptionExpiry || '2026-12-31');
                          const leftDays = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                          const isExp = leftDays < 0;
                          const isWarn = leftDays <= 7 && leftDays >= 0;

                          return (
                            <tr key={owner.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3">
                                <p className="font-bold text-slate-800 dark:text-white text-xs">{owner.shopName || owner.branch}</p>
                                <p className="text-[10px] text-slate-400">👤 {owner.name} ({owner.phone || owner.email})</p>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     if (owner.shopName) {
                                       setShopName(owner.shopName);
                                       if (owner.phone) setShopPhone(owner.phone);
                                       showToast(`দোকানদার "${owner.shopName}" এর পোর্টালে সুইচ করা হয়েছে! এখন আপনি স্টক ও প্রোডাক্ট সেটআপ করতে পারবেন।`, 'success');
                                     }
                                   }}
                                   className="mt-1.5 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[9.5px] hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                                 >
                                   <span>🔑 দোকান পোর্টালে প্রবেশ (প্রোডাক্ট এন্ট্রি)</span>
                                 </button>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  owner.isDemoMode ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {owner.planType || (owner.isDemoMode ? 'Demo' : 'Monthly')}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-mono text-slate-700 dark:text-slate-300">
                                {owner.subscriptionExpiry || '2026-12-31'}
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  owner.isBlocked ? 'bg-red-100 text-red-700' : isExp ? 'bg-red-100 text-red-700' : isWarn ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {owner.isBlocked ? 'BLOCKED' : isExp ? 'Expired' : `${leftDays} Days`}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                {owner.isBlocked ? (
                                  <span className="text-red-600 font-bold">🚫 Blocked</span>
                                ) : isExp ? (
                                  <span className="text-red-500 font-bold">⚠️ Expired</span>
                                ) : isWarn ? (
                                  <span className="text-amber-600 font-bold">⚠️ Expiring Soon</span>
                                ) : (
                                  <span className="text-emerald-600 font-bold">🟢 Active</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex justify-end gap-1.5 flex-wrap">
                                  {/* 7 Days Demo */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 7);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ডেমো (৭ দিন)', isDemoMode: true, isBlocked: false, status: 'Active' } : u));
                                    showToast(`"7 Days Demo" granted for ${owner.shopName}`, 'success');
                                  }} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold rounded cursor-pointer">
                                    🎁 ৭ দিন
                                  </button>

                                  {/* 15 Days Demo */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 15);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ডেমো (১৫ দিন)', isDemoMode: true, isBlocked: false, status: 'Active' } : u));
                                    showToast(`"15 Days Demo" granted for ${owner.shopName}`, 'success');
                                  }} className="px-2 py-1 bg-purple-200 hover:bg-purple-300 text-purple-950 text-[10px] font-bold rounded cursor-pointer">
                                    🎁 ১৫ দিন
                                  </button>

                                  {/* 1 Month */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 30);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'মান্থলি (১ মাস)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(`Renewed 1 Month for ${owner.shopName}`, 'success');
                                  }} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    🚀 ১ মাস
                                  </button>

                                  {/* 6 Months */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 180);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'হাফ-ইয়ারলি (৬ মাস)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(`Renewed 6 Months for ${owner.shopName}`, 'success');
                                  }} className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    ⚡ ৬ মাস
                                  </button>

                                  {/* 1 Year */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ইয়ারলি (১ বছর)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(`Renewed 1 Year for ${owner.shopName}`, 'success');
                                  }} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    🌟 ১ বছর
                                  </button>

                                  {/* Custom Days */}
                                  <button type="button" onClick={() => {
                                    const input = prompt(`কাস্টম কত দিনের সাবস্ক্রিপশন দিতে চান? (${owner.shopName})`, "30");
                                    if (input) {
                                      const days = parseInt(input.trim(), 10);
                                      if (!isNaN(days) && days > 0) {
                                        const nextDate = new Date();
                                        nextDate.setDate(nextDate.getDate() + days);
                                        const expiryStr = nextDate.toISOString().split('T')[0];
                                        setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                          ? { ...u, subscriptionExpiry: expiryStr, planType: `কাস্টম (${days} দিন)`, isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                        showToast(`Granted ${days} Days for ${owner.shopName}`, 'success');
                                      } else {
                                        showToast("সঠিক সংখ্যা বসান!", "error");
                                      }
                                    }
                                  }} className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold rounded cursor-pointer shadow-2xs border border-amber-600">
                                    ⚙️ কাস্টম দিন
                                  </button>

                                  {/* Block / Unblock */}
                                  <button type="button" onClick={() => {
                                    const willBlock = !owner.isBlocked;
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, isBlocked: willBlock, status: willBlock ? 'Blocked' : 'Active' } : u));
                                    showToast(willBlock ? `Blocked ${owner.shopName}` : `Unblocked ${owner.shopName}`, willBlock ? 'error' : 'success');
                                  }} className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                                    owner.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'
                                  }`}>
                                    {owner.isBlocked ? '🔓 Unblock' : '🚫 Block'}
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

                {/* Super Admin Prompt Console Block */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Interactive Developer Console</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        📟 {lang === 'bn' ? "সুপার এডমিন কন্ট্রোল প্রম্পট সেন্টার" : "Super Admin Command Control & Prompt"}
                      </h3>
                    </div>
                    <span className="text-[9.5px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-full font-bold select-none">
                      ONLINE SHELL
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {lang === 'bn' 
                      ? "এখানে টেক্সট কমান্ড লিখে বা নিচের কুইক প্রম্পট বাটনে ক্লিক করে পুরো সিস্টেমের ডাটা ও মেমোরি স্টেট পরিবর্তন করতে পারেন।" 
                      : "Type natural text commands or use the shortcut buttons below to manipulate mock states and simulate platform actions instantly."}
                  </p>

                  {/* Terminal Log Screen */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 font-mono text-[11.5px] leading-relaxed space-y-2 h-[160px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {promptLogs.map((log, idx) => {
                      const isInput = log.startsWith('>');
                      const isSuccess = log.startsWith('SUCCESS');
                      const isError = log.startsWith('ERROR');
                      let textColor = "text-slate-700 font-semibold";
                      if (isInput) textColor = "text-blue-700 font-bold";
                      else if (isSuccess) textColor = "text-emerald-600 font-bold";
                      else if (isError) textColor = "text-rose-600 font-bold";
                      
                      return (
                        <div key={idx} className={`${textColor} whitespace-pre-wrap`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>

                  {/* Prompt Form Input Bar */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPromptInput.trim()) {
                      executeAdminPrompt(adminPromptInput);
                    }
                  }} className="flex gap-2.5 items-center mb-5">
                    <div className="flex-1 relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-xs font-bold select-none">
                        admin@rony-telecom:~#
                      </span>
                      <input
                        type="text"
                        value={adminPromptInput}
                        onChange={(e) => setAdminPromptInput(e.target.value)}
                        placeholder={lang === 'bn' ? "এখানে প্রম্পট লিখুন (উদা: sync-users, force-overdue, sms)..." : "Type a super admin command (e.g. sync-users, force-overdue, sms)..."}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-[160px] pr-3.5 py-3 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-slate-400 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 border border-indigo-500/30"
                    >
                      🚀 {lang === 'bn' ? "রান করুন" : "Execute Command"}
                    </button>
                  </form>

                  {/* Quick Shortcut Buttons */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                      💡 {lang === 'bn' ? "কুইক সিমুলেশন বাটন সমূহ (Quick Shortcuts):" : "Quick simulation shortcut commands:"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("sync-three-initial-users")}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        👥 {lang === 'bn' ? "৩ জন মূল ইউজার সিঙ্ক করুন (AGENTS.md)" : "Sync 3 Initial Users (AGENTS.md)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("force-overdue")}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        ⚠️ {lang === 'bn' ? "কিস্তি ওভারডিউ সিমুলেশন করুন" : "Simulate Overdue Installment"}
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("increase-all-prices")}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        📈 {lang === 'bn' ? "প্রোডাক্ট মূল্য ১০% বৃদ্ধি করুন" : "Mass Update: +10% Prices"}
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("add-test-product")}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        📱 {lang === 'bn' ? "টেস্ট মোবাইল প্রোডাক্ট যোগ করুন" : "Insert Mock Product"}
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("sms-simulation-test")}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        💬 {lang === 'bn' ? "টেস্ট এসএমএস ব্রডকাস্ট করুন" : "Simulate Broadcast SMS"}
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAdminPrompt("system-diagnostic")}
                        className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-white text-[11px] font-medium px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        🔍 {lang === 'bn' ? "সিস্টেম ডায়াগনস্টিক রিপোর্ট" : "Run Diagnostic Check"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Raw Database Inspections and simulated hot patch histories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Data Backups & Master JSON Export Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm text-left">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">📁 {lang === 'bn' ? "ডাটাবেজ টেবিল ব্যাকআপ ও সিকিউর এক্সপোর্ট" : "Raw Collections Inspection & Backups"}</h3>
                    <p className="text-xs text-slate-400 mb-4 font-semibold leading-relaxed">
                      {lang === 'bn' ? "ভার্সন আপডেটের পর কোন ডাটা মুছে যাওয়ার ঝুঁকি এড়াতে পুরো রিলেশনাল ডাটা টেবিলটি এখানে এক ক্লিকে ব্যাকআপ ফাইল আকারে সংরক্ষণ করে রাখুন।" : "Extract database states in binary JSON blocks to secure merchant transactions before platform maintenance."}
                    </p>

                    <div className="space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
                      {/* Products count row */}
                      <div className="flex justify-between items-center p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 dark:text-white">
                        <span>🏷️ Products Collection</span>
                        <span className="font-mono text-indigo-600 font-bold">{products.length} Items</span>
                      </div>
                      {/* Sales count row */}
                      <div className="flex justify-between items-center p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 dark:text-white">
                        <span>💰 Sales Collection</span>
                        <span className="font-mono text-green-600 font-bold">{sales.length} Records</span>
                      </div>
                      {/* Customers count row */}
                      <div className="flex justify-between items-center p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 dark:text-white">
                        <span>👥 Customers List</span>
                        <span className="font-mono text-yellow-600 font-bold">{customers.length} Accounts</span>
                      </div>
                      {/* Support tickets count row */}
                      <div className="flex justify-between items-center p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 dark:text-white">
                        <span>🛠️ Support Tickets Database</span>
                        <span className="font-mono text-blue-600 font-bold">{supportTickets.length} Threads</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={function() {
                          const jsonStr = JSON.stringify({ products, sales, customers, supportTickets }, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `smarthisab_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        💾 {lang === 'bn' ? "সকল ডাটা ব্যাকআপ ডাউনলোড" : "Download Master Backup (.json)"}
                      </button>

                      <label className="w-full text-center py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs transition rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md">
                        📥 {lang === 'bn' ? "ফাইল থেকে রিস্টোর করুন" : "Restore from JSON File"}
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleJsonImport}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Deployment Release Log */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">📜 {lang === 'bn' ? "রিলিজ ও আপগ্রেড হিস্ট্রি" : "Active Release Logs"}</h3>
                      <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                        {systemLogText.length === 0 ? (
                          <div className="flex items-start gap-2.5 text-xs text-slate-500 font-semibold leading-relaxed border-l-2 border-indigo-500 pl-3.5">
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-200 block">v2.4.1 (Active Release)</span>
                              <span>{lang === 'bn' ? "সাপ্লায়ার বকেয়া হিসাব লকিং মেকানিজম অ্যান্ড সাপোর্ট টিম চ্যানেল ডেপ্লয়মেন্ট সফল।" : "Supplier secure locking mechanisms and local support helpdesk channel successfully configured."}</span>
                            </div>
                          </div>
                        ) : (
                          systemLogText.map(function(txt, idx) {
                            return (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border-l-2 border-blue-500 pl-3.5">
                                <div>
                                  <span className="font-bold text-slate-700 dark:text-slate-200 block">Patch update #{systemLogText.length - idx}</span>
                                  <span>{txt}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold text-slate-400 leading-relaxed">
                      {lang === 'bn' ? "📌 রিলিজ লগের সকল আপগ্রেড ব্যাকগ্রাউন্ড ডাটাবেজ মডেল অক্ষুন্ন রেখে সিস্টেমে ডেপ্লয় হয়।" : "📌 This console interacts directly with local sandboxed database state targets securely."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'helpdesk' && (
              <div className="space-y-6 animate-fadeIn text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Live Technical Help Center</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mt-1">
                      🛠️ {lang === 'bn' ? "গ্রাহক সহায়তা ডেস্ক (Helpdesk)" : "Telecom Support Helpdesk"}
                    </h1>
                  </div>
                  <div className="bg-indigo-50 dark:bg-slate-950 text-indigo-700 dark:text-indigo-400 rounded-xl px-4 py-2 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold flex items-center gap-1.5 select-none shrink-0">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping shrink-0" />
                    {lang === 'bn' ? "সাপোর্ট এজেন্ট অনলাইনে আছে" : "Support Technicians Online"}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Log a block/complaint Ticket form */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm text-left h-fit">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">📝 {lang === 'bn' ? "নতুন টিকেট সাবমিট করুন" : "Submit Support Ticket"}</h2>
                    <p className="text-xs text-slate-400 font-semibold mb-5 leading-relaxed">
                      {lang === 'bn' ? "আপনার সফটওয়্যার পরিচালনায় কোনো সমস্যা বা আইটি পরামর্শের প্রয়োজন হলে টিকেট কাটুন।" : "Submit a ticket directly to developer. Ensure you describe visual/routing errors completely."}
                    </p>

                    <form onSubmit={function(e) {
                      e.preventDefault();
                      if (!newTicketMessage.trim()) return;
                      const newTicket = {
                        id: "TKT-" + Math.floor(100 + Math.random() * 900),
                        merchantEmail: sessionUser.email,
                        merchantName: `${sessionUser.name} (${sessionUser.roleTitleEn})`,
                        message: newTicketMessage,
                        date: new Date().toISOString().split('T')[0],
                        isResolved: false,
                        resolutionNote: ""
                      };
                      setSupportTickets(function(prev) {
                        return [newTicket, ...prev];
                      });
                      setNewTicketMessage("");
                    }} className="space-y-4">
                      {/* Submitter Name Block read-only */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{lang === 'bn' ? "টিকেট সাবমিটকারী" : "Ticket Submitter"}</label>
                        <div className="w-full text-xs font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 capitalize">
                          👤 {sessionUser.name} ({sessionUser.roleTitleEn})
                        </div>
                      </div>

                      {/* Msg text area */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{lang === 'bn' ? "আপনার সমস্যার বিবরণ বিস্তারিত লিখুন" : "Describe Your Problem / Error Details"}</label>
                        <textarea
                          rows={4}
                          value={newTicketMessage}
                          onChange={function(e) { setNewTicketMessage(e.target.value); }}
                          placeholder={lang === 'bn' ? "এখানে লিখুন... (যেমন: প্রিন্ট করার সময় মার্জিন ঠিক করতে চাই...)" : "Write details here..."}
                          className="w-full text-xs font-semibold p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl tracking-wider shadow-md transition cursor-pointer"
                      >
                        🚀 {lang === 'bn' ? "টিকেট সাবমিট করুন" : "Publish Support Ticket"}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Existing Tickets list with interactive actions */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-855 p-6 rounded-2xl shadow-sm col-span-1 lg:col-span-2 text-left">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">📁 {lang === 'bn' ? "আপনার পূর্ববর্তী টিকেট সমূহ" : "Ticket Threads Management"}</h2>
                    
                    <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                      {supportTickets.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                          {lang === 'bn' ? "কোনো সাপোর্ট টিকেট পাওয়া যায়নি।" : "No tickets issued yet."}
                        </div>
                      ) : (
                        supportTickets.map(function(tkt) {
                          return (
                            <div key={tkt.id} className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden bg-slate-50/45 dark:bg-slate-950/25">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/50 pb-2.5 mb-3">
                                <div>
                                  <span className="bg-slate-100 dark:bg-slate-800 dark:text-slate-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">{tkt.id}</span>
                                  <span className="text-[11px] text-slate-400 ml-2 font-bold">{tkt.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">Submitter: {tkt.merchantName}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    tkt.isResolved 
                                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                                      : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse"
                                  }`}>
                                    {tkt.isResolved ? (lang === 'bn' ? 'সমাধানকৃত' : 'Resolved') : (lang === 'bn' ? 'অপেক্ষমান' : 'Open Ticket')}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                                {tkt.message}
                              </p>

                              {/* Resolution Card Block if present */}
                              {tkt.isResolved && tkt.resolutionNote && (
                                <div className="mt-3.5 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100/60 dark:border-green-900/20 text-xs text-left">
                                  <span className="font-bold text-green-700 dark:text-green-400 block mb-1">👨‍💻 {lang === 'bn' ? "ডেভেলপার সমাধান মন্তব্য:" : "Developer Resolution Note:"}</span>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{tkt.resolutionNote}</p>
                                </div>
                              )}

                              {/* Interactive resolving capabilities for Super Admins for testing */}
                              {!tkt.isResolved && sessionUser.role === 'super_admin' && (
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                  <input
                                    type="text"
                                    placeholder={lang === 'bn' ? "সমাধানের মন্তব্য লিখুন..." : "Enter resolution note..."}
                                    id={`tkt-res-input-${tkt.id}`}
                                    className="flex-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={function() {
                                      const resVal = (document.getElementById(`tkt-res-input-${tkt.id}`) as HTMLInputElement)?.value || "সমস্যাটির সমাধান করা হয়েছে।";
                                      setSupportTickets(function(prev) {
                                        return prev.map(function(pt) {
                                          if (pt.id === tkt.id) {
                                            return { ...pt, isResolved: true, resolutionNote: resVal };
                                          }
                                          return pt;
                                        });
                                      });
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold uppercase tracking-wider shrink-0 transition cursor-pointer"
                                  >
                                    ✓ {lang === 'bn' ? "সমাধান করুন" : "Resolve"}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* SmartHisab AI Executive Briefing Bar */}
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 rounded-2xl shadow-lg border border-indigo-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{lang === 'bn' ? 'স্মার্ট হিসাব এআই ইনটেলিজেন্স' : 'SmartHisab AI Intelligence'}</span>
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider">Smart AI</span>
                      </div>
                      <p className="text-xs text-indigo-200 font-medium mt-0.5">
                        {lang === 'bn' 
                          ? 'আজকের ব্যবসায়িক স্বাস্থ্য ও রিস্টক বিশ্লেষণ সম্পন্ন • সম্ভাব্য সেলস পূর্বাভাস ও লাভ বাড়ানোর কৌশল প্রস্তুত' 
                          : 'Live business health analyzed • Predictive sales forecasting & margin booster ready'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('ai_intelligence'); setActiveSubTab(''); }}
                    className="px-3.5 py-1.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    {lang === 'bn' ? 'এআই হাব দেখুন' : 'Open AI Hub'}
                    <ChevronRight size={13} />
                  </button>
                </div>

                {(() => {
                  const displayRevenue = sales.reduce((sum, s) => sum + (Number(s.totalPrice) || 0), 0);
                  const displayProductsCount = products.length;
                  const displayLowStockCount = products.filter(p => (Number(p.stock) || 0) <= 5).length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-kpi-grid">
                      {dashboardKpis
                        .filter(function(kpi) {
                          return kpi && 
                            kpi.id !== 'xxx' && 
                            (!kpi.titleBn || !kpi.titleBn.toLowerCase().includes('xxx')) && 
                            (!kpi.titleEn || !kpi.titleEn.toLowerCase().includes('xxx'));
                        })
                        .sort(function(a, b) {
                          // Precise order match: Sales (revenue) -> Sales Due (orders) -> Expense (products) -> Purchase Due (low-stock)
                          const orderList = ['revenue', 'orders', 'products', 'low-stock', 'lowstock'];
                          const aIdx = orderList.indexOf(a.id);
                          const bIdx = orderList.indexOf(b.id);
                          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                          if (aIdx !== -1) return -1;
                          if (bIdx !== -1) return 1;
                          return 0;
                        })
                        .map(function(kpi) {
                          let numValue = 0;
                          let displayValueText = "";
                          let cardTone: SummaryCardTone = "slate";
                          let RightIcon: any = FileText;

                          const isStandardKpi = ['revenue', 'orders', 'products', 'low-stock', 'lowstock'].includes(kpi.id);

                          if (kpi.id === 'revenue') {
                            numValue = displayRevenue;
                            cardTone = "blue";
                            RightIcon = DollarSign;
                          } else if (kpi.id === 'orders') {
                            numValue = stats.totalDues;
                            cardTone = "rose";
                            RightIcon = Calendar;
                          } else if (kpi.id === 'products') {
                            numValue = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                            cardTone = "amber";
                            RightIcon = MinusSquare;
                          } else if (kpi.id === 'low-stock' || kpi.id === 'lowstock') {
                            numValue = displayLowStockCount;
                            cardTone = "emerald";
                            RightIcon = Package;
                          } else {
                            numValue = kpi.valueType === 'revenue' ? displayRevenue : 
                                       kpi.valueType === 'orders' ? stats.totalDues : 
                                       kpi.valueType === 'products' ? displayProductsCount : displayLowStockCount;
                            cardTone = "slate";
                            RightIcon = BarChart3;
                          }

                          // Format the big value text precisely matching "৳215" or "1 Pcs" style from user reference image
                          const isConfidentialKpi = sessionUser.role === 'employee' && (kpi.id === 'revenue' || kpi.id === 'products' || kpi.id === 'low-stock' || kpi.id === 'lowstock');
                          
                          if (isConfidentialKpi) {
                            displayValueText = lang === 'bn' ? "🔒 সংরক্ষিত" : "🔒 Secured";
                          } else if (kpi.id === 'revenue' || kpi.id === 'orders' || kpi.id === 'products') {
                            displayValueText = `৳${numValue.toLocaleString()}`;
                          } else if (kpi.id === 'low-stock' || kpi.id === 'lowstock') {
                            displayValueText = `${numValue} Pcs`;
                          } else if (typeof numValue === 'number') {
                            displayValueText = numValue.toLocaleString();
                          } else {
                            displayValueText = String(numValue);
                          }

                          // Determine the title text (label)
                          let titleText = lang === 'bn' ? kpi.titleBn : kpi.titleEn;
                          if (kpi.id === 'revenue') {
                            titleText = lang === 'bn' ? "বিক্রয়" : "SALES";
                          } else if (kpi.id === 'orders') {
                            titleText = lang === 'bn' ? "বকেয়া বিক্রয়" : "SALES DUE";
                          } else if (kpi.id === 'products') {
                            titleText = lang === 'bn' ? "ব্যয়" : "EXPENSE";
                          } else if (kpi.id === 'low-stock' || kpi.id === 'lowstock') {
                            titleText = lang === 'bn' ? "ক্রয়" : "PURCHASE";
                          }

                          return (
                            <div key={kpi.id} className="relative group">
                              <SummaryCard
                                icon={<RightIcon className="w-5 h-5" />}
                                label={titleText}
                                value={displayValueText}
                                tone={cardTone}
                              />
                              {!isStandardKpi && (
                                <button
                                  type="button"
                                  onClick={function(e) {
                                    e.stopPropagation();
                                    const updated = dashboardKpis.filter(item => item.id !== kpi.id);
                                    saveDashboardKpis(updated);
                                    showToast(lang === 'bn' ? "ওভারভিউ বক্স কার্ডটি সফলভাবে ডিলিট করা হয়েছে!" : "Dynamic card removed successfully!", "success");
                                  }}
                                  className="absolute top-2 right-2 p-1 px-1.5 rounded-full bg-slate-200 hover:bg-red-500 text-slate-600 hover:text-white transition-colors duration-150 text-[9px] font-bold cursor-pointer z-10"
                                  title={lang === 'bn' ? "মুছে ফেলুন" : "Remove"}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })()}

                {/* Dashboard layout with custom native SVG BarChart and Quick links */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Native SVG BarChart spanning 7 columns - styled with balanced width */}
                  <div className={`p-4 sm:p-6 rounded-2xl lg:col-span-7 space-y-4 border transition-colors duration-300 font-sans flex flex-col justify-between h-full ${
                    theme === 'dark' ? 'bg-[#182237] border-gray-800/60' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    {/* Header title block */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
                      <h2 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>
                        📊 {lang === 'bn' ? "ক্রয়, বিক্রয় এবং ব্যয় বার চার্ট" : "Purchase, Sales and Expense Bar Chart"}
                      </h2>
                    </div>

                    {/* Modern legend with soft pill chips */}
                    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 py-2 select-none text-xs sm:text-sm font-semibold font-sans">
                      {[
                        { label: lang === 'bn' ? 'ক্রয়' : 'Purchase', from: '#34d399', to: '#059669', text: '#059669' },
                        { label: lang === 'bn' ? 'বিক্রয়' : 'Sales', from: '#60a5fa', to: '#2563eb', text: '#2563eb' },
                        { label: lang === 'bn' ? 'ব্যয়' : 'Expense', from: '#fb923c', to: '#ea580c', text: '#ea580c' },
                      ].map((l) => (
                        <div key={l.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="w-2.5 h-2.5 rounded-full shadow" style={{ background: `linear-gradient(135deg, ${l.from}, ${l.to})` }} />
                          <span className="tracking-wide font-bold" style={{ color: l.text }}>{l.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Modern SVG plot with gradient bars, soft grid and hover value labels */}
                    {sessionUser.role === 'employee' ? (
                      <div className="h-[380px] w-full flex flex-col items-center justify-center bg-gray-100/30 dark:bg-slate-900/60 border border-dashed border-gray-300 dark:border-slate-800 rounded-2xl p-6 text-center select-none animate-fadeIn">
                        <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3.5 text-yellow-500">
                          <Shield className="w-7 h-7 stroke-[1.5]" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                          {lang === 'bn' ? "আর্থিক চার্ট সুরক্ষিত" : "Financial Analytics Locked"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed font-semibold">
                          {lang === 'bn'
                            ? "দোকানের গোপন লাভ-ক্ষতি ও ব্যয়চিত্র সুরক্ষিত রাখার স্বার্থে এই গ্রাফিক্যাল রিপোর্টটি কর্মচারী অ্যাকাউন্ট থেকে লক করে রাখা হয়েছে।"
                            : "Financial logs and cost-revenue metrics are confidential. Access to this analytical view is restricted for staff."}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex items-center justify-center relative py-2 sm:py-4">
                        {(() => {
                        const monthlyData = [
                          { key: "2025-12", label: "Dec,2025", purchase: 0, sales: 0, expense: 0 },
                          { key: "2026-01", label: "Jan,2026", purchase: 0, sales: 0, expense: 0 },
                          { key: "2026-02", label: "Feb,2026", purchase: 0, sales: 0, expense: 0 },
                          { key: "2026-03", label: "Mar,2026", purchase: 0, sales: 0, expense: 0 },
                          { key: "2026-04", label: "Apr,2026", purchase: 5000, sales: 45000, expense: 0 },
                          { key: "2026-05", label: "May,2026", purchase: 35000, sales: 149000, expense: 300 },
                          { key: "2026-06", label: "Jun,2026", purchase: 8000, sales: 46000, expense: 1200 }
                        ];

                        sales.forEach(function(s) {
                          if (!s.date) return;
                          const parts = s.date.split('-');
                          if (parts.length >= 2) {
                            const yearMonth = parts[0] + "-" + parts[1];
                            const target = monthlyData.find(m => m.key === yearMonth);
                            if (target) {
                              const isBase = s.id && s.id.startsWith("SALE-");
                              if (!isBase) target.sales += (Number(s.totalPrice) || 0);
                            }
                          }
                        });
                        purchases.forEach(function(p) {
                          if (!p.date) return;
                          const parts = p.date.split('-');
                          if (parts.length >= 2) {
                            const yearMonth = parts[0] + "-" + parts[1];
                            const target = monthlyData.find(m => m.key === yearMonth);
                            if (target) {
                              const isBase = p.id && p.id.startsWith("PUR-");
                              if (!isBase) target.purchase += (Number(p.total) || 0);
                            }
                          }
                        });
                        expenses.forEach(function(e) {
                          if (!e.date) return;
                          const parts = e.date.split('-');
                          if (parts.length >= 2) {
                            const yearMonth = parts[0] + "-" + parts[1];
                            const target = monthlyData.find(m => m.key === yearMonth);
                            if (target) {
                              const isBase = e.id && e.id.startsWith("EXP-");
                              if (!isBase) target.expense += (Number(e.amount) || 0);
                            }
                          }
                        });

                        const isDark = theme === 'dark';
                        const axisText = isDark ? '#94a3b8' : '#475569';
                        const gridStroke = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.16)';

                        const series: Array<{ key: 'purchase' | 'sales' | 'expense'; label: string; gradId: string; from: string; to: string; glow: string }> = [
                          { key: 'purchase', label: lang === 'bn' ? 'ক্রয়' : 'Purchase', gradId: 'bar-purchase', from: '#34d399', to: '#059669', glow: 'rgba(5,150,105,0.35)' },
                          { key: 'sales',    label: lang === 'bn' ? 'বিক্রয়' : 'Sales',   gradId: 'bar-sales',    from: '#60a5fa', to: '#2563eb', glow: 'rgba(37,99,235,0.35)' },
                          { key: 'expense',  label: lang === 'bn' ? 'ব্যয়' : 'Expense',  gradId: 'bar-expense',  from: '#fb923c', to: '#ea580c', glow: 'rgba(234,88,12,0.35)' },
                        ];

                        const maxVal = Math.max(1, ...monthlyData.flatMap(m => [m.purchase, m.sales, m.expense]));
                        // nice round upper bound
                        const niceMax = (() => {
                          const pow = Math.pow(10, Math.floor(Math.log10(maxVal)));
                          const n = Math.ceil(maxVal / pow);
                          const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
                          return step * pow;
                        })();

                        const W = 720, H = 420;
                        const padL = 56, padR = 20, padT = 24, padB = 72;
                        const plotW = W - padL - padR;
                        const plotH = H - padT - padB;
                        const groupW = plotW / monthlyData.length;
                        const barGap = 4;
                        const barW = Math.max(6, (groupW - barGap * 4) / 3);

                        const yFor = (v: number) => padT + plotH - (v / niceMax) * plotH;

                        const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);

                        const gridLines = 5;
                        const ticks = Array.from({ length: gridLines + 1 }, (_, i) => (niceMax / gridLines) * i);

                        return (
                          <svg
                            viewBox={`0 0 ${W} ${H}`}
                            preserveAspectRatio="xMidYMid meet"
                            className="w-full h-auto max-w-full aspect-[720/420] select-none"
                            role="img"
                            aria-label={lang === 'bn' ? 'ক্রয়, বিক্রয় ও ব্যয়ের বার চার্ট' : 'Purchase, sales and expense bar chart'}
                          >
                            <defs>
                              {series.map((s) => (
                                <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={s.from} />
                                  <stop offset="100%" stopColor={s.to} />
                                </linearGradient>
                              ))}
                              <filter id="bar-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
                                <feOffset dx="0" dy="3" result="off" />
                                <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
                                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                            </defs>

                            {/* Y grid + ticks */}
                            {ticks.map((t, i) => {
                              const y = yFor(t);
                              return (
                                <g key={i}>
                                  <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={gridStroke} strokeWidth={1} strokeDasharray={i === 0 ? '' : '3 5'} />
                                  <text x={padL - 10} y={y + 4} textAnchor="end" fill={axisText} style={{ fontSize: '13px', fontWeight: 600 }}>৳{fmt(t)}</text>
                                </g>
                              );
                            })}

                            {/* Bars */}
                            {monthlyData.map((m, i) => {
                              const gx = padL + i * groupW;
                              const centerX = gx + groupW / 2;
                              return (
                                <g key={m.key} className="motion-safe:animate-[fade-in_0.6s_ease-out_both]">
                                  {series.map((s, si) => {
                                    const v = (m as any)[s.key] as number;
                                    const bh = (v / niceMax) * plotH;
                                    const bx = centerX - (barW * 1.5 + barGap) + si * (barW + barGap);
                                    const by = padT + plotH - bh;
                                    return (
                                      <g key={s.key} className="group">
                                        <rect
                                          x={bx}
                                          y={by}
                                          width={barW}
                                          height={Math.max(0, bh)}
                                          rx={Math.min(6, barW / 2)}
                                          fill={`url(#${s.gradId})`}
                                          filter="url(#bar-shadow)"
                                          style={{ transition: 'opacity .2s ease' }}
                                          className="group-hover:opacity-90"
                                        >
                                          <title>{`${s.label} • ${m.label}: ৳${v.toLocaleString()}`}</title>
                                        </rect>
                                        {v > 0 && (
                                          <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fill={s.to} style={{ fontSize: '11px', fontWeight: 800, pointerEvents: 'none' }}>
                                            {fmt(v)}
                                          </text>
                                        )}
                                      </g>
                                    );
                                  })}
                                  <text x={centerX} y={H - padB + 22} textAnchor="middle" fill={axisText} transform={`rotate(-28 ${centerX} ${H - padB + 22})`} style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {m.label.split(',')[0]}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Baseline */}
                            <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1.2} />
                          </svg>
                        );
                      })()}
                    </div>
                    )}
                  </div>

                  {/* Sidebar stacks for actions - Stock Warning Items spanning 5 columns with ample width */}
                  <div className="lg:col-span-5 h-full flex flex-col">
                    <div className={`p-4 sm:p-6 rounded-2xl border transition-colors duration-300 font-sans flex flex-col justify-between h-full flex-1 ${
                      theme === 'dark' ? 'bg-[#182237] border-gray-800/60' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Header title block */}
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-left flex items-center justify-between">
                          <h2 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 transition-colors duration-300 ${
                            theme === 'dark' ? 'text-white' : 'text-slate-800'
                          }`}>
                            ⚠️ {lang === 'bn' ? "স্টক সতর্কতা আইটেম সমূহ" : "Stock Warning Items"}
                          </h2>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40">
                            {products.filter(p => (p.stock ?? 0) <= (p.alertQty ?? 5)).length || 8} {lang === 'bn' ? "টি সতর্কতা" : "Alerts"}
                          </span>
                        </div>

                        {/* Highly precise low-stock/warning-items Table styled with Ant Design specifications */}
                        <div className="overflow-x-auto lg:overflow-x-hidden flex-1 flex flex-col justify-between mt-3">
                          <table className="w-full text-xs text-left border-collapse select-none h-full">
                            <thead>
                              <tr className={`border-b transition-colors duration-150 ${
                                theme === 'dark' ? 'border-gray-800 text-gray-400 bg-gray-900/40' : 'border-slate-200 text-slate-700 font-bold bg-slate-50/70'
                              }`}>
                                <th className="py-2.5 px-3 font-bold text-left w-10 text-slate-500">#</th>
                                <th className="py-2.5 px-3 font-bold text-left">{lang === 'bn' ? "আইটেম নাম" : "Item Name"}</th>
                                <th 
                                  className="py-2.5 px-3 font-bold text-center whitespace-nowrap"
                                  style={{ whiteSpace: 'nowrap' }}
                                >
                                  {lang === 'bn' ? "বিভাগ" : "Department"}
                                </th>
                                <th 
                                  className="py-2.5 px-3 font-bold text-center whitespace-nowrap"
                                  style={{ whiteSpace: 'nowrap' }}
                                >
                                  {lang === 'bn' ? "অবশিষ্ট স্টক" : "Stock"}
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y transition-colors duration-150 ${
                              theme === 'dark' ? 'divide-gray-800/65' : 'divide-slate-100'
                            }`}>
                              {(() => {
                                const warningItems = products.length > 0 
                                  ? [...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 8)
                                  : [
                                      { id: "1", name: "Drone", category: "Smart Gadgets", stock: 1 },
                                      { id: "2", name: "18W Extreme Quick Charger", category: "Cables & Power Solutions", stock: 2 },
                                      { id: "3", name: "Y20 Display", category: "Smart Gadgets", stock: 3 },
                                      { id: "4", name: "Decorative Items", category: "Home Decoration", stock: 4 },
                                      { id: "5", name: "Luxury Wall Mirror", category: "Home Decoration", stock: 2 },
                                      { id: "6", name: "Xiaomi Redmi Note 13", category: "Smartphones", stock: 1 }
                                    ];

                                return warningItems.map(function(item, idx) {
                                  const stockVal = item.stock ?? (idx % 3 + 1);
                                  const isCritical = stockVal <= 2;
                                  const isWarning = stockVal <= 4;

                                  return (
                                    <tr 
                                      key={item.id || idx} 
                                      className="hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition duration-100"
                                    >
                                      {/* Sl.No */}
                                      <td className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 w-10">
                                        {lang === 'bn' ? toBnDigits(idx + 1) : (idx + 1)}
                                      </td>

                                      {/* Item Name */}
                                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100 max-w-[170px] truncate" title={item.name}>
                                        {item.name}
                                      </td>

                                      {/* Category / Department */}
                                      <td 
                                        className="py-2.5 px-3 text-center whitespace-nowrap" 
                                        style={{ whiteSpace: 'nowrap' }}
                                      >
                                        <span 
                                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 whitespace-nowrap"
                                          style={{ whiteSpace: 'nowrap' }}
                                        >
                                          {item.category || "—"}
                                        </span>
                                      </td>

                                      {/* Remaining Stock Warning Badge */}
                                      <td className="py-2.5 px-3 text-center whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                                          isCritical 
                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40' 
                                            : isWarning 
                                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40' 
                                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/40'
                                        }`} style={{ whiteSpace: 'nowrap' }}>
                                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                                            isCritical ? 'bg-rose-500 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                          }`} />
                                          <span>
                                            {stockVal <= 0 
                                              ? (lang === 'bn' ? 'স্টক শেষ' : 'Out of stock')
                                              : (lang === 'bn' ? `${toBnDigits(stockVal)}টি বাকি` : `${stockVal} Left`)
                                            }
                                          </span>
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>

                        {/* Card footer for neat bottom alignment */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none mt-2">
                          <span className="font-semibold text-[11px]">
                            {lang === 'bn' ? 'স্টক লিমিট: ৫টির নিচে' : 'Threshold: Below 5'}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setActiveTab('inventory'); setActiveSubTab('stock_alert'); }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{lang === 'bn' ? 'সকল স্টক সতর্কতা' : 'View all alerts'}</span>
                            <span>↗</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transaction Live Sync Log */}
                <div className={`p-5 sm:p-6 rounded-2xl border transition-colors duration-300 font-sans ${
                  theme === 'dark' ? 'bg-[#182237] border-gray-800/60' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <h2 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                      🛒 {lang === 'bn' ? "সাম্প্রতিক বিক্রয়সমূহ" : "Recent Sales Log"}
                    </h2>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Sync
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left select-none">
                      <thead>
                        <tr className={`border-b transition-colors duration-150 ${
                          theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-slate-200 text-slate-700 font-bold'
                        }`}>
                          <th className="py-2.5 px-3">{lang === 'bn' ? "তারিখ ও সময়" : "Date & Time"}</th>
                          <th className="py-2.5 px-3">{lang === 'bn' ? "ইনভয়েস আইডি" : "Invoice ID"}</th>
                          <th className="py-2.5 px-3">{lang === 'bn' ? "পণ্য" : "Product"}</th>
                          <th className="py-2.5 px-2 text-center">{lang === 'bn' ? "পরিমাণ" : "Qty"}</th>
                          <th className="py-2.5 px-3 text-right">{lang === 'bn' ? "মোট পরিশোধ" : "Total Paid"}</th>
                          <th className="py-2.5 px-3">{lang === 'bn' ? "গ্রাহক" : "Customer"}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'bn' ? "পেমেন্ট মেথড" : "Payment Method"}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y transition-colors duration-150 ${
                        theme === 'dark' ? 'divide-gray-800' : 'divide-slate-100'
                      }`}>
                        {sales.slice(0, 5).map(function(s) {
                          // Format ISO date string into friendly local Bengali format
                          let dateText = s.date;
                          if (s.date && s.date.includes('T')) {
                            try {
                              const d = new Date(s.date);
                              const day = d.getDate();
                              const monthNames = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
                              const month = monthNames[d.getMonth()] || '';
                              let hours = d.getHours();
                              const mins = d.getMinutes().toString().padStart(2, '0');
                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              hours = hours % 12 || 12;
                              dateText = lang === 'bn' 
                                ? `${toBnDigits(day)} ${month}, ${toBnDigits(hours)}:${toBnDigits(mins)} ${ampm}` 
                                : `${day} ${month}, ${hours}:${mins} ${ampm}`;
                            } catch {
                              dateText = s.date.slice(0, 10);
                            }
                          }

                          let pmText = s.paymentMethod || 'Cash';
                          let pmBadge = (
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#f0fdf4] text-[#15803d] border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40">
                              💵 {lang === 'bn' ? 'নগদ' : 'Cash'}
                            </span>
                          );
                          if (pmText.toLowerCase().includes('bkash') || pmText.toLowerCase().includes('বিকাশ')) {
                            pmBadge = (
                              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fdf2f8] text-[#be185d] border border-pink-200/60 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/40">
                                📱 {lang === 'bn' ? 'বিকাশ' : 'bKash'}
                              </span>
                            );
                          } else if (pmText.toLowerCase().includes('due') || pmText.toLowerCase().includes('বকেয়া') || pmText.includes('+')) {
                            pmBadge = (
                              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fff5f5] text-[#e11d48] border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40">
                                ⚠️ {pmText}
                              </span>
                            );
                          }

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition duration-100">
                              <td className="py-3 px-3 font-semibold text-slate-500 dark:text-slate-400">{dateText}</td>
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                  #{s.id}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{s.productName}</td>
                              <td className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-300">
                                {lang === 'bn' ? toBnDigits(s.quantity) : s.quantity}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-[#059669] dark:text-emerald-400 text-sm">
                                ৳{s.totalPrice.toLocaleString()}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                    {(s.customerName || 'W').charAt(0).toUpperCase()}
                                  </div>
                                  <span>{s.customerName || 'Walk-in Customer'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">{pmBadge}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. POS WORKSPACE & SALES LEDGER */}
            {(activeTab === 'pos' || activeTab === 'sales') && (
              (!activeSubTab || activeSubTab === 'add_sale' || activeSubTab === 'pos' || activeSubTab === 'pos_terminal') ? (
                <ImmersivePOS
                  lang={lang}
                  products={products}
                  setProducts={setProducts}
                  customers={customers}
                  setCustomers={setCustomers}
                  posCart={posCart}
                  setPosCart={setPosCart}
                  posWarehouse={posWarehouse}
                  setPosWarehouse={setPosWarehouse}
                  posSlSearch={posSlSearch}
                  setPosSlSearch={setPosSlSearch}
                  posInvoiceNum={posInvoiceNum}
                  setPosInvoiceNum={setPosInvoiceNum}
                  posSelectedCustomerName={posSelectedCustomerName}
                  setPosSelectedCustomerName={setPosSelectedCustomerName}
                  posBrandFilter={posBrandFilter}
                  setPosBrandFilter={setPosBrandFilter}
                  sendMessageToCustomer={sendMessageToCustomer}
                  setSendMessageToCustomer={setSendMessageToCustomer}
                  posHoldCarts={posHoldCarts}
                  setPosHoldCarts={setPosHoldCarts}
                  isHoldListOpen={isHoldListOpen}
                  setIsHoldListOpen={setIsHoldListOpen}
                  setIsAddCustomerOpen={setIsAddCustomerOpen}
                  addProductToPOSCart={addProductToPOSCart}
                  handlePOSCheckout={handlePOSCheckout}
                  setActiveTab={setActiveTab}
                  setActiveSubTab={setActiveSubTab}
                  showToast={showToast}
                  theme={theme}
                />
              ) : (activeSubTab === 'all_sales' || activeSubTab === 'sales_history') ? (
                <SalesLedger
                  sales={sales}
                  setSales={setSales}
                  products={products}
                  setProducts={setProducts}
                  customers={customers}
                  salesReturns={salesReturns}
                  setSalesReturns={setSalesReturns}
                  lang={lang}
                  showToast={showToast}
                  theme={theme}
                  setActiveTab={setActiveTab}
                  setActiveSubTab={setActiveSubTab}
                />
              ) : activeSubTab === 'sales_returns' ? (
                <SalesReturn
                  products={products}
                  setProducts={setProducts}
                  sales={sales}
                  setSales={setSales}
                  salesReturns={salesReturns}
                  setSalesReturns={setSalesReturns}
                  lang={lang}
                  showToast={showToast}
                  theme={theme}
                />
              ) : activeSubTab === 'warranty_claims' ? (
                <WarrantySerialManager lang={lang} products={products} sales={sales} showToast={showToast} />
              ) : null
            )}

            {/* Direct Sell Modal Panel with custom parameters inputs */}
            {directSellProduct && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className={`p-6 rounded-2xl max-w-md w-full space-y-4 border shadow-2xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-200'
                }`}>
                  <div className={`flex justify-between items-center pb-2 border-b ${
                    theme === 'dark' ? 'border-gray-800' : 'border-slate-100'
                  }`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
                    }`}>💸 POS INSTANT DIRECT TRANSACTION</h3>
                    <button 
                      onClick={function() { setDirectSellProduct(null); }}
                      className="text-gray-400 hover:text-red-500 font-bold cursor-pointer text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className={`p-4 border rounded-xl space-y-1 transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-900/60 border-gray-850' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Active Product Context</p>
                    <p className={`text-sm font-bold transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-805'
                    }`}>{directSellProduct.name}</p>
                    <p className={`text-xs font-mono transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                    }`}>Price Baseline: ৳{directSellProduct.sellingPrice.toLocaleString()} | Available: {directSellProduct.stock}</p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <span className={`text-[10px] uppercase font-bold block mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                      }`}>Customer Selection Profile</span>
                      <select
                        value={sellCustomer}
                        onChange={function(e) { setSellCustomer(e.target.value); }}
                        className={`w-full border text-xs rounded-xl p-3 focus:outline-none cursor-pointer font-semibold ${
                          theme === 'dark' 
                            ? 'bg-gray-900 border-gray-800 text-gray-300 focus:border-cyan-400' 
                            : 'bg-slate-50 border-slate-205 text-slate-800 focus:border-blue-500'
                        }`}
                      >
                        <option value="Walk-in Customer">Walk-in Customer</option>
                        {customers.map(function(c) {
                          return (
                            <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className={`text-[10px] uppercase font-bold block mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                        }`}>Selling Qty</span>
                        <input
                          type="number"
                          value={sellQty}
                          min="1"
                          max={directSellProduct.stock}
                          onChange={function(e) { setSellQty(Math.max(1, parseInt(e.target.value) || 1)); }}
                          className={`w-full border text-xs font-mono rounded-xl p-3 focus:outline-none font-bold ${
                            theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                        }`}>Custom Unit Price (৳)</span>
                        <input
                          type="number"
                          value={sellPrice}
                          onChange={function(e) { setSellPrice(parseFloat(e.target.value) || 0); }}
                          className={`w-full border text-xs font-mono rounded-xl p-3 focus:outline-none font-bold ${
                            theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className={`text-[10px] uppercase font-bold block mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                      }`}>{t.paymentMethod}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['Cash', 'Card', 'Mobile Banking'].map(function(method) {
                          const isSel = sellPayment === method;
                          return (
                            <button
                              key={method}
                              onClick={function() { setSellPayment(method); }}
                              className={isSel 
                                ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-500 dark:text-cyan-300 font-bold p-2.5 rounded-xl text-xs flex justify-center transition cursor-pointer" 
                                : `border text-xs flex justify-center p-2.5 rounded-xl transition cursor-pointer font-semibold ${
                                    theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700' : 'bg-slate-50 border-slate-202 text-slate-600 hover:bg-slate-100'
                                  }`
                              }
                            >
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className={`border p-4 rounded-xl flex justify-between items-center text-xs font-mono transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-900 border-gray-850' : 'bg-slate-50 border-slate-150'
                  }`}>
                    <span className="text-gray-500 font-bold">Computed Grand Total:</span>
                    <span className={`text-base font-bold ${
                      theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
                    }`}>৳{(sellPrice * sellQty).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={function() { setDirectSellProduct(null); }}
                      className={`font-semibold p-3.5 rounded-xl text-xs cursor-pointer transition text-center ${
                        theme === 'dark' ? 'bg-gray-900 text-gray-405 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleConfirmSell}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3.5 rounded-xl text-xs cursor-pointer transition text-center shadow-md active:scale-95"
                    >
                      {t.confirmSell}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INVENTORY PANEL */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {activeSubTab === 'variants' ? (
                  <div className="space-y-6 text-left">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
                      <div className="flex items-baseline gap-2">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-xl font-sans tracking-tight">
                          {lang === 'bn' ? 'পণ্যের ভ্যারিয়েন্ট সমূহ' : 'Item Variants'}
                        </h1>
                        <span className="text-gray-400 text-xs font-normal">
                          {lang === 'bn' ? 'পণ্য বা ডিভাইসের সাইজ, র্যাম/রোম, কালার ও ভ্যারিয়েন্ট নিয়ন্ত্রণ করুন' : 'Configure RAM, storage, color & size variants'}
                        </span>
                      </div>
                      
                      {variantFormView ? (
                        <button
                          type="button"
                          onClick={handleCloseVariant}
                          className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          ← {lang === 'bn' ? 'তালিকা দেখুন' : 'Back to Variants List'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={function() {
                            setEditingVariantId(null);
                            setVariantFormView(true);
                            setNewVariantName("");
                            setNewVariantDescription("");
                            setVariantFormError(false);
                          }}
                          className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
                        >
                          <span className="text-sm">+</span>
                          <span>{lang === 'bn' ? 'নতুন ভ্যারিয়েন্ট যোগ করুন' : 'Add New Variant'}</span>
                        </button>
                      )}
                    </div>

                    {variantFormView ? (
                      /* Generous high-fidelity Variant Entry Card Panel */
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8 font-sans">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                          <span className="text-2xl">🏷️</span>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                              {editingVariantId 
                                ? (lang === 'bn' ? 'ভ্যারিয়েন্ট টাইপ সম্পাদনা করুন' : 'Edit Item Variant')
                                : (lang === 'bn' ? 'নতুন ভ্যারিয়েন্ট টাইপ এন্ট্রি করুন' : 'Register New Item Variant')}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                              {lang === 'bn' ? 'যেমন: RAM & Storage, Color, Charger Wattage ইত্যাদি' : 'e.g. RAM & Storage, Color, Size profiles'}
                            </p>
                          </div>
                        </div>

                        {variantFormError && (
                          <div className="border border-red-200 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl p-3.5 mb-6 text-xs font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{lang === 'bn' ? 'অনুগ্রহ করে ভ্যারিয়েন্টের নাম সঠিকভাবে লিখুন!' : 'Please enter a valid Variant Name!'}</span>
                          </div>
                        )}

                        <div className="space-y-5 max-w-2xl">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {lang === 'bn' ? 'ভ্যারিয়েন্ট নাম (আবশ্যক)' : 'Variant Name (Required)'} *
                            </label>
                            <input
                              id="variant-name-input"
                              type="text"
                              required
                              value={newVariantName}
                              onChange={function(e) {
                                setNewVariantName(e.target.value);
                                if (e.target.value.trim() !== '') setVariantFormError(false);
                              }}
                              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs text-slate-800 dark:text-white font-bold"
                              placeholder={lang === 'bn' ? "যেমন: RAM & Storage (র‍্যাম ও স্টোরেজ)" : "e.g. RAM & Storage"}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {lang === 'bn' ? 'অপশন বা মানসমূহ (কমা দিয়ে আলাদা করুন)' : 'Variant Option Values (Comma Separated)'}
                            </label>
                            <input
                              type="text"
                              value={newVariantDescription}
                              onChange={function(e) { setNewVariantDescription(e.target.value); }}
                              className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs text-slate-800 dark:text-white font-semibold"
                              placeholder={lang === 'bn' ? "যেমন: 4GB/64GB, 8GB/128GB, 12GB/256GB" : "e.g. 4GB/64GB, 8GB/128GB, 12GB/256GB"}
                            />
                            <p className="text-[11px] text-slate-400 font-medium mt-1">
                              💡 {lang === 'bn' ? 'ভ্যারিয়েন্টের মানগুলো কমা (,) দিয়ে টাইপ করুন' : 'Separate values with commas for chip tags'}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={function() {
                                if (!newVariantName.trim()) {
                                  setVariantFormError(true);
                                  return;
                                }
                                var optionsList = newVariantDescription ? newVariantDescription.split(',').map(s => s.trim()).filter(Boolean) : ["Standard"];
                                if (editingVariantId) {
                                  setVariants(prev => prev.map(v => v.id === editingVariantId ? { ...v, name: newVariantName.trim(), options: optionsList, description: newVariantDescription } : v));
                                  showToast(lang === 'bn' ? "ভ্যারিয়েন্ট সফলভাবে আপডেট করা হয়েছে!" : "Variant updated successfully!", "success");
                                } else {
                                  var nextId = "VAR-" + String(variants.length + 1).padStart(3, '0');
                                  setVariants(prev => [...prev, { id: nextId, name: newVariantName.trim(), options: optionsList, description: newVariantDescription }]);
                                  showToast(lang === 'bn' ? "ভ্যারিয়েন্ট সফলভাবে সংরক্ষণ করা হয়েছে!" : "Variant saved successfully!", "success");
                                }
                                setEditingVariantId(null);
                                setVariantFormView(false);
                                setNewVariantName("");
                                setNewVariantDescription("");
                              }}
                              className="bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
                            >
                              ✓ {editingVariantId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Variant') : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Variant')}
                            </button>
                            <button
                              type="button"
                              onClick={handleCloseVariant}
                              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Custom dynamic DataTable showing registered Variants */
                      <div className="space-y-5">
                        {/* Top Stats Cards */}
                        {(() => {
                          const totalTypes = variants.length;
                          const totalOptions = variants.reduce((acc, v) => acc + (v.options ? v.options.length : 1), 0);
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-lg">
                                  📊
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'ভ্যারিয়েন্ট টাইপ' : 'Variant Types'}</p>
                                  <p className="text-lg font-bold text-slate-800 dark:text-white">{totalTypes} {lang === 'bn' ? 'টি' : 'types'}</p>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                  🏷️
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট অপশন মান' : 'Total Values'}</p>
                                  <p className="text-lg font-bold text-emerald-600">{totalOptions} {lang === 'bn' ? 'টি অপশন' : 'values'}</p>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                  📱
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'ক্যাটালগ স্ট্যাটাস' : 'Catalog Status'}</p>
                                  <p className="text-lg font-bold text-indigo-600">🟢 {lang === 'bn' ? 'সক্রিয়' : 'Active'}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  <th className="px-6 py-4 font-bold">ID</th>
                                  <th className="px-6 py-4 font-bold">{lang === 'bn' ? 'ভ্যারিয়েন্ট নাম' : 'Variant Name'}</th>
                                  <th className="px-6 py-4 font-bold">{lang === 'bn' ? 'অপশন ও মানসমূহ (Values)' : 'Options & Values'}</th>
                                  <th className="px-6 py-4 text-center font-bold">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {variants.map(function(item) {
                                  const opts = item.options || (item.description ? item.description.split(',').map((s: string) => s.trim()) : ["Standard"]);
                                  return (
                                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{item.id}</td>
                                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-xs">{item.name}</td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {opts.map((opt: string, i: number) => (
                                            <span key={i} className="inline-block px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                                              {opt}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <button
                                            type="button"
                                            onClick={function() {
                                              setEditingVariantId(item.id);
                                              setNewVariantName(item.name);
                                              setNewVariantDescription(opts.join(', '));
                                              setVariantFormView(true);
                                              setVariantFormError(false);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                                          >
                                            ✏️ {lang === 'bn' ? 'এডিট' : 'Edit'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={function() {
                                              if (window.confirm(lang === 'bn' ? `"${item.name}" ভ্যারিয়েন্টটি মুছে ফেলতে চান?` : `Delete variant "${item.name}"?`)) {
                                                setVariants(prev => prev.filter(v => v.id !== item.id));
                                                showToast(lang === 'bn' ? 'ভ্যারিয়েন্ট মুছে ফেলা হয়েছে!' : 'Variant removed', 'info');
                                              }
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold transition cursor-pointer"
                                          >
                                            🗑️ {lang === 'bn' ? 'মুছুন' : 'Delete'}
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
                    )}
                  </div>
                ) : activeSubTab === 'categories' ? (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-2 select-none">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 shadow-xs">
                          <Folder className="w-6 h-6" />
                        </div>
                        <div>
                          <h1 className="font-bold text-slate-800 dark:text-white text-lg sm:text-xl font-sans tracking-tight">
                            {lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Product Categories'}
                          </h1>
                          <p className="text-slate-400 text-xs font-medium mt-0.5">
                            {lang === 'bn' ? 'পণ্যের ক্যাটাগরি এবং গ্রুপসমূহ সহজে পরিচালনা ও সুবিন্যস্ত করুন' : 'Manage and organize inventory product categories effortlessly'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Live Search */}
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={catSearchQuery}
                            onChange={e => setCatSearchQuery(e.target.value)}
                            placeholder={lang === 'bn' ? "ক্যাটাগরি খুঁজুন..." : "Search categories..."}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-3 focus:ring-blue-500/10 focus:border-blue-500 shadow-2xs transition"
                          />
                          {catSearchQuery && (
                            <button
                              onClick={() => setCatSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Add Category Button */}
                        <button
                          type="button"
                          onClick={openAddCategoryModal}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 transition duration-150 active:scale-95 cursor-pointer shadow-md shadow-blue-500/20 shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'নতুন ক্যাটাগরি যোগ করুন' : 'Add New Category'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Top Stats Cards using SummaryCard */}
                    {(() => {
                      const totalCats = categoriesList.length;
                      const totalAssignedProducts = products.filter(p => p.category).length;
                      const activeCatsCount = categoriesList.filter(c => products.some(p => p.category && String(p.category).toLowerCase() === String(c).toLowerCase())).length;
                      const emptyCatsCount = Math.max(0, totalCats - activeCatsCount);

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <SummaryCard
                            icon={<Folder className="w-5 h-5" />}
                            label={lang === 'bn' ? 'মোট ক্যাটাগরি' : 'Total Categories'}
                            value={`${totalCats} ${lang === 'bn' ? 'টি' : ''}`}
                            tone="blue"
                          />
                          <SummaryCard
                            icon={<Package className="w-5 h-5" />}
                            label={lang === 'bn' ? 'ক্যাটাগরিভুক্ত পণ্য' : 'Categorized Items'}
                            value={`${totalAssignedProducts} ${lang === 'bn' ? 'টি' : ''}`}
                            tone="emerald"
                          />
                          <SummaryCard
                            icon={<Tag className="w-5 h-5" />}
                            label={lang === 'bn' ? 'সক্রিয় ক্যাটাগরি' : 'Active Categories'}
                            value={`${activeCatsCount} ${lang === 'bn' ? 'টি' : ''}`}
                            tone="purple"
                          />
                          <SummaryCard
                            icon={<AlertCircle className="w-5 h-5" />}
                            label={lang === 'bn' ? 'খালি ক্যাটাগরি' : 'Empty Categories'}
                            value={`${emptyCatsCount} ${lang === 'bn' ? 'টি' : ''}`}
                            tone="amber"
                          />
                        </div>
                      );
                    })()}

                    {/* Category Cards Grid */}
                    {(() => {
                      const filteredCats = categoriesList.filter(cat => 
                        !catSearchQuery.trim() || String(cat || '').toLowerCase().includes(catSearchQuery.toLowerCase().trim())
                      );

                      if (filteredCats.length === 0) {
                        return (
                          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900/50">
                              <Folder className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                              {lang === 'bn' ? 'কোনো ক্যাটাগরি পাওয়া যায়নি' : 'No Categories Found'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              {catSearchQuery 
                                ? (lang === 'bn' ? `"${catSearchQuery}" এর সাথে মিলে এমন কোনো ক্যাটাগরি নেই।` : `No category matches "${catSearchQuery}".`)
                                : (lang === 'bn' ? 'আপনার ইনভেন্টরিতে এখনো কোনো ক্যাটাগরি তৈরি করা হয়নি।' : 'No categories created in your inventory yet.')}
                            </p>
                            <button
                              type="button"
                              onClick={openAddCategoryModal}
                              className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{lang === 'bn' ? 'প্রথম ক্যাটাগরি যোগ করুন' : 'Add First Category'}</span>
                            </button>
                          </div>
                        );
                      }

                      const tonePalette: Array<'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'indigo'> = [
                        'blue', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'indigo'
                      ];

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filteredCats.map(function(cat, idx) {
                            const catProducts = products.filter(function(p: any) { 
                              return p.category === cat || (p.category && String(p.category).toLowerCase() === String(cat).toLowerCase()); 
                            });
                            const count = catProducts.length;
                            const totalStock = catProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
                            const totalValuation = catProducts.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.sellingPrice) || 0)), 0);

                            const cardTone = tonePalette[idx % tonePalette.length];
                            const toneStyles = {
                              blue: {
                                badge: 'bg-blue-50 text-blue-600 border-blue-200/80',
                                pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200',
                                hoverBorder: 'hover:border-blue-300',
                              },
                              emerald: {
                                badge: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
                                pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200',
                                hoverBorder: 'hover:border-emerald-300',
                              },
                              purple: {
                                badge: 'bg-purple-50 text-purple-600 border-purple-200/80',
                                pill: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200',
                                hoverBorder: 'hover:border-purple-300',
                              },
                              amber: {
                                badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
                                pill: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200',
                                hoverBorder: 'hover:border-amber-300',
                              },
                              rose: {
                                badge: 'bg-rose-50 text-rose-600 border-rose-200/80',
                                pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200',
                                hoverBorder: 'hover:border-rose-300',
                              },
                              cyan: {
                                badge: 'bg-cyan-50 text-cyan-600 border-cyan-200/80',
                                pill: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200',
                                hoverBorder: 'hover:border-cyan-300',
                              },
                              indigo: {
                                badge: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
                                pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200',
                                hoverBorder: 'hover:border-indigo-300',
                              },
                            }[cardTone];

                            return (
                              <div 
                                key={cat} 
                                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all duration-200 space-y-4 group flex flex-col justify-between ${toneStyles.hoverBorder}`}
                              >
                                <div className="space-y-3 cursor-pointer" onClick={() => setSelectedCatForView(cat)}>
                                  <div className="flex justify-between items-center">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-xs group-hover:scale-105 transition duration-200 ${toneStyles.badge}`}>
                                      <Folder className="w-5 h-5" />
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                                      count > 0 
                                        ? toneStyles.pill 
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                                    }`}>
                                      {count} {lang === 'bn' ? 'টি পণ্য' : 'Items'}
                                    </span>
                                  </div>

                                  <div>
                                    <h3 className="font-bold text-base text-slate-800 dark:text-white group-hover:text-blue-600 transition truncate" title={cat}>
                                      {cat}
                                    </h3>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      <span>{lang === 'bn' ? `মোট স্টক: ${totalStock} টি` : `Total Stock: ${totalStock} pcs`}</span>
                                      {count > 0 && (
                                        <>
                                          <span className="text-slate-300 dark:text-slate-700">•</span>
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">৳{totalValuation.toLocaleString()}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCatForView(cat)}
                                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    title={lang === 'bn' ? 'ক্যাটাগরির পণ্যসমূহ দেখুন' : 'View products in this category'}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{lang === 'bn' ? 'পণ্য দেখুন' : 'Items'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEditCategoryModal(cat)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    title={lang === 'bn' ? 'ক্যাটাগরি সম্পাদনা করুন' : 'Edit category name'}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setCatToDelete(cat)}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                    title={lang === 'bn' ? 'ক্যাটাগরি মুছে ফেলুন' : 'Delete category'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{lang === 'bn' ? 'মুছুন' : 'Delete'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdvCategoryFilter(cat);
                                      setProductPage(1);
                                      setActiveSubTab('list_products');
                                      showToast(lang === 'bn' ? `"${cat}" ফিল্টারে পণ্য তালিকা ওপেন হয়েছে` : `Filtered by "${cat}" in product list`, "info");
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                                    title={lang === 'bn' ? 'ইনভেন্টরি টেবিলে ফিল্টার করুন' : 'Filter in full product list'}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Category Products Modal */}
                    {selectedCatForView && (() => {
                      const allCatProducts = products.filter((p: any) => 
                        p.category === selectedCatForView || (p.category && String(p.category).toLowerCase() === String(selectedCatForView).toLowerCase())
                      );
                      const filteredModalProducts = allCatProducts.filter((p: any) => {
                        if (!catViewSearch.trim()) return true;
                        const q = catViewSearch.toLowerCase().trim();
                        return (
                          (p.name && p.name.toLowerCase().includes(q)) ||
                          (p.sku && p.sku.toLowerCase().includes(q)) ||
                          (p.id && p.id.toLowerCase().includes(q)) ||
                          (p.brand && p.brand.toLowerCase().includes(q))
                        );
                      });
                      const modalTotalStock = allCatProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
                      const modalTotalValue = allCatProducts.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.sellingPrice) || 0)), 0);

                      return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedCatForView(null); setCatViewSearch(''); }}>
                          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                          <div 
                            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
                            onClick={e => e.stopPropagation()}
                          >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 shrink-0">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/50">
                                  <Folder className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                      {selectedCatForView}
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      {allCatProducts.length} {lang === 'bn' ? 'টি পণ্য' : 'Products'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {lang === 'bn' ? 'এই ক্যাটাগরির সমস্ত পণ্যের স্টক ও মূল্যের তালিকা' : 'Inventory items and stock details for this category'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setSelectedCatForView(null); setCatViewSearch(''); }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Stats bar & Search */}
                            <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <span>{lang === 'bn' ? 'মোট স্টক:' : 'Total Stock:'} <strong className="text-slate-900 dark:text-white font-bold">{modalTotalStock}</strong> {lang === 'bn' ? 'টি' : 'pcs'}</span>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span>{lang === 'bn' ? 'মোট বিক্রয় মূল্য:' : 'Total Retail Value:'} <strong className="text-emerald-600 font-bold">৳{modalTotalValue.toLocaleString()}</strong></span>
                              </div>

                              <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                  type="text"
                                  value={catViewSearch}
                                  onChange={e => setCatViewSearch(e.target.value)}
                                  placeholder={lang === 'bn' ? "এই ক্যাটাগরিতে খুঁজুন..." : "Filter items..."}
                                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Products Table */}
                            <div className="flex-1 overflow-y-auto p-6">
                              {filteredModalProducts.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                    {catViewSearch ? (lang === 'bn' ? 'কোনো পণ্য মেলেনি' : 'No matching items') : (lang === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই' : 'No products in this category')}
                                  </p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                      <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">{lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</th>
                                        <th className="px-4 py-3">{lang === 'bn' ? 'ব্র্যান্ড' : 'Brand'}</th>
                                        <th className="px-4 py-3">{lang === 'bn' ? 'কোড / SKU' : 'SKU'}</th>
                                        <th className="px-4 py-3 text-center">{lang === 'bn' ? 'স্টক' : 'Stock'}</th>
                                        <th className="px-4 py-3 text-right">{lang === 'bn' ? 'ক্রয় মূল্য' : 'Purchase'}</th>
                                        <th className="px-4 py-3 text-right">{lang === 'bn' ? 'বিক্রয় মূল্য' : 'Selling'}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                      {filteredModalProducts.map((prod: any, pIdx: number) => {
                                        const stockQty = Number(prod.stock) || 0;
                                        const alertQty = Number(prod.alertQty) || 5;
                                        const isLow = stockQty <= alertQty && stockQty > 0;
                                        const isOut = stockQty <= 0;

                                        return (
                                          <tr key={prod.id || pIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                                            <td className="px-4 py-3 text-slate-400 font-bold">{pIdx + 1}</td>
                                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">
                                              <div className="flex items-center gap-2">
                                                <span>{prod.name}</span>
                                                {prod.itemType === 'SERVICE' && (
                                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                                                    Service
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{prod.brand || '-'}</td>
                                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{prod.sku || prod.id}</td>
                                            <td className="px-4 py-3 text-center">
                                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                                                isOut 
                                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                                                  : isLow 
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                              }`}>
                                                {stockQty} {prod.unit || 'PCS'}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400">
                                              ৳{Number(prod.purchasePrice || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                                              ৳{Number(prod.sellingPrice || 0).toLocaleString()}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const targetCat = selectedCatForView;
                                  setSelectedCatForView(null);
                                  setCatViewSearch('');
                                  setAdvCategoryFilter(targetCat);
                                  setProductPage(1);
                                  setActiveSubTab('list_products');
                                  showToast(lang === 'bn' ? `"${targetCat}" ক্যাটাগরির পণ্য তালিকা খোলা হয়েছে` : `Opened product list filtered by "${targetCat}"`, "info");
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{lang === 'bn' ? 'সম্পূর্ণ ইনভেন্টরি পেজে ফিল্টার করুন' : 'Filter in Full Product List'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setSelectedCatForView(null); setCatViewSearch(''); }}
                                className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Beautiful Add / Edit Category Modal */}
                    {isCatModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsCatModalOpen(false)}>
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                        <div 
                          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Modal Header */}
                          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:to-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/50">
                                <FolderPlus className="w-5 h-5" />
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                  {catModalMode === 'add' 
                                    ? (lang === 'bn' ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Create New Category') 
                                    : (lang === 'bn' ? 'ক্যাটাগরি সম্পাদনা' : 'Edit Category')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                  {catModalMode === 'add'
                                    ? (lang === 'bn' ? 'ইনভেন্টরি পণ্য সুবিন্যস্ত করতে নতুন ক্যাটাগরি যোগ করুন' : 'Add category to organize inventory items')
                                    : (lang === 'bn' ? 'বিদ্যমান ক্যাটাগরির নাম পরিবর্তন করুন' : 'Rename existing category')}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsCatModalOpen(false)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Modal Body */}
                          <div className="p-6 sm:p-7 space-y-5 text-left">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span>{lang === 'bn' ? 'ক্যাটাগরির নাম' : 'Category Name'} <span className="text-rose-500">*</span></span>
                              </label>
                              <input
                                type="text"
                                autoFocus
                                value={catInputName}
                                onChange={e => setCatInputName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveCategorySubmit();
                                  }
                                }}
                                placeholder={lang === 'bn' ? "যেমন: স্মার্টফোন, চার্জার ও ক্যাবল..." : "e.g. Smartphone, Charger & Cable..."}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition shadow-2xs"
                              />
                            </div>

                            {/* Quick Suggestion Chips (Add mode only) */}
                            {catModalMode === 'add' && (
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                  {lang === 'bn' ? 'জনপ্রিয় সাজেশন (ক্লিক করে নির্বাচন করুন):' : 'Popular Suggestions:'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    lang === 'bn' ? 'স্মার্টফোন' : 'Smartphones',
                                    lang === 'bn' ? 'মোবাইল এক্সেসরিজ' : 'Mobile Accessories',
                                    lang === 'bn' ? 'চার্জার ও ক্যাবল' : 'Charger & Cable',
                                    lang === 'bn' ? 'ইয়ারফোন ও সাউন্ড' : 'Earphones & Audio',
                                    lang === 'bn' ? 'স্মার্ট গ্যাজেটস' : 'Smart Gadgets',
                                    lang === 'bn' ? 'ব্যাটারি ও পাওয়ার ব্যাংক' : 'Power Bank',
                                    lang === 'bn' ? 'কভার ও গ্লাস' : 'Covers & Glass',
                                    lang === 'bn' ? 'অন্যান্য' : 'Others'
                                  ].map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => setCatInputName(chip)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
                                    >
                                      + {chip}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Modal Footer */}
                          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <button
                              type="button"
                              onClick={() => setIsCatModalOpen(false)}
                              className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveCategorySubmit}
                              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{catModalMode === 'add' ? (lang === 'bn' ? 'ক্যাটাগরি যুক্ত করুন' : 'Add Category') : (lang === 'bn' ? 'আপডেট করুন' : 'Update Category')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {catToDelete && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setCatToDelete(null)}>
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                        <div 
                          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm overflow-hidden my-auto p-6 text-center animate-in fade-in zoom-in-95 duration-200"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-200 dark:border-rose-900/50">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <h4 className="text-base font-bold text-slate-800 dark:text-white">
                            {lang === 'bn' ? 'ক্যাটাগরি মুছে ফেলতে চান?' : 'Delete Category?'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {lang === 'bn' 
                              ? `"${catToDelete}" ক্যাটাগরিটি মুছে ফেলা হবে। এই ক্যাটাগরির পণ্যসমূহ আন-ক্যাটাগরাইজড হয়ে যাবে।` 
                              : `Category "${catToDelete}" will be removed.`}
                          </p>
                          <div className="flex items-center gap-3 mt-5">
                            <button
                              type="button"
                              onClick={() => setCatToDelete(null)}
                              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const targetCat = catToDelete;
                                const updatedCats = categoriesList.filter(c => c !== targetCat);
                                setCategoriesList(updatedCats);
                                setProducts(prev => prev.map((p: any) => 
                                  (p.category === targetCat || (p.category && String(p.category).toLowerCase() === String(targetCat).toLowerCase()))
                                    ? { ...p, category: 'Uncategorized' } 
                                    : p
                                ));
                                try {
                                  localStorage.setItem('roni_categories_v1', JSON.stringify(updatedCats));
                                } catch (e) {}
                                showToast(lang === 'bn' ? `"${targetCat}" ক্যাটাগরি মুছে ফেলা হয়েছে!` : `Category "${targetCat}" deleted!`, "info");
                                setCatToDelete(null);
                              }}
                              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeSubTab === 'brands' ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
                      <div className="flex items-baseline gap-2">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-xl font-sans tracking-tight">Brands</h1>
                        <span className="text-gray-400 text-xs font-normal">Hardware & Electronics Manufacturers</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-bold">
                        <span>🏠 Home</span>
                        <span className="text-[10px] text-gray-400 font-normal">&gt;</span>
                        <span>Brands List</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-slate-205 shadow-sm'
                    }`}>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800">Manufacturers Desk</h2>
                        <span className="text-[11px] text-gray-500">Track global hardware providers with warranty authorizations</span>
                      </div>
                      <button
                        onClick={function() {
                          var newBrand = window.prompt("Enter Brand Name:", "Dell");
                          if (newBrand) {
                            showToast("Brand registered securely!", "success");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                      >
                        <span>+</span>
                        <span>Add New Brand</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: "Apple", desc: "Premium iOS and macOS hardware ecosystem" },
                        { name: "Samsung", desc: "Flagship Android smartphones and displays" },
                        { name: "HP", desc: "Enterprise laptops and printing devices" },
                        { name: "Asus", desc: "Republic of Gamers and Vivobook lineups" },
                        { name: "Xiaomi", desc: "Value flagship hardware of various form factors" }
                      ].map(function(brand) {
                        return (
                          <div key={brand.name} className="bg-white rounded-xl border border-slate-205 p-5 shadow-sm space-y-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Authorized</span>
                            <h3 className="font-bold text-sm text-slate-805 pt-1">{brand.name}</h3>
                            <p className="text-[11px] text-slate-500 font-medium">{brand.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : activeSubTab === 'list_services' ? (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
                      <div className="flex items-baseline gap-2">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-xl font-sans tracking-tight">{lang === 'bn' ? 'সার্ভিস তালিকা' : 'Service List'}</h1>
                        <span className="text-gray-400 text-xs font-normal">{lang === 'bn' ? 'আপনার দোকানের মেকানিক ও সার্ভিসিং ক্যাটালগ পরিচালনা করুন' : 'Manage your repair service catalog'}</span>
                      </div>
                      <button
                        onClick={function() {
                          setNewProdItemType('SERVICE');
                          setIsAddProductOpen(true);
                        }}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
                      >
                        <span className="text-sm">+</span>
                        <span>{lang === 'bn' ? 'নতুন সার্ভিস যোগ করুন' : 'Add New Service'}</span>
                      </button>
                    </div>

                    {/* Top Summary Stats Cards */}
                    {(() => {
                      const totalCount = services.length;
                      const activeCount = services.filter((s: any) => s.status !== 'Inactive').length;
                      const catCount = new Set(services.map((s: any) => s.category)).size;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-lg">
                              📊
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট সার্ভিস' : 'Total Services'}</p>
                              <p className="text-lg font-bold text-slate-800 dark:text-white">{totalCount} {lang === 'bn' ? 'টি' : 'items'}</p>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
                              🟢
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'সক্রিয় সার্ভিস' : 'Active Services'}</p>
                              <p className="text-lg font-bold text-emerald-600">{activeCount} {lang === 'bn' ? 'টি' : 'active'}</p>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-lg">
                              🛠️
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট ক্যাটাগরি' : 'Categories'}</p>
                              <p className="text-lg font-bold text-indigo-600">{catCount} {lang === 'bn' ? 'টি' : 'categories'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Filter & Search Bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={serviceSearchQuery}
                          onChange={e => setServiceSearchQuery(e.target.value)}
                          placeholder={lang === 'bn' ? "সার্ভিসের নাম বা ID দিয়ে খুঁজুন..." : "Search service name or ID..."}
                          className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-slate-500">{lang === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}</span>
                        <select
                          value={serviceCategoryFilter}
                          onChange={e => setServiceCategoryFilter(e.target.value)}
                          className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
                        >
                          <option value="all">{lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
                          <option value="Hardware">Hardware (হার্ডওয়্যার)</option>
                          <option value="Software">Software (সফটওয়্যার)</option>
                          <option value="Servicing">Servicing (সার্ভিসিং)</option>
                        </select>
                      </div>
                    </div>

                    {/* Service Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="px-4 py-3.5">ID</th>
                              <th className="px-4 py-3.5 min-w-[200px]">{lang === 'bn' ? 'সার্ভিসিং কাজের নাম' : 'Service Name'}</th>
                              <th className="px-4 py-3.5">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                              <th className="px-4 py-3.5 text-right">{lang === 'bn' ? 'সার্ভিস ফি (৳)' : 'Service Fee (৳)'}</th>
                              <th className="px-4 py-3.5 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                              <th className="px-4 py-3.5 text-center">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                              <th className="px-4 py-3.5 text-center">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(() => {
                              const filtered = services.filter((s: any) => {
                                const q = serviceSearchQuery.toLowerCase().trim();
                                const matchQ = !q || (s.name || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q);
                                const matchCat = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
                                return matchQ && matchCat;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-bold bg-slate-50/50">
                                      🛠️ {lang === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি!' : 'No services found!'}
                                    </td>
                                  </tr>
                                );
                              }

                              return filtered.map((s: any) => (
                                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.id}</td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-800 dark:text-white text-xs">{s.name}</span>
                                      {s.description && <span className="text-[10px] text-slate-400 font-medium mt-0.5">{s.description}</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                      {s.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                    ৳{Number(s.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      s.status === 'Inactive' 
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                        : s.status === 'Pending' 
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {s.status || 'Active'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-center text-slate-500 font-mono text-[11px]">
                                    {s.date || new Date().toISOString().slice(0, 10)}
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingService({ ...s })}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                                      >
                                        ✏️ {lang === 'bn' ? 'এডিট' : 'Edit'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setServiceToDelete(s)}
                                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold transition cursor-pointer"
                                      >
                                        🗑️ {lang === 'bn' ? 'মুছুন' : 'Delete'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Modern Edit Service Modal */}
                    {editingService && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingService(null)}>
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                        <div 
                          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden my-auto p-6 animate-in fade-in zoom-in-95 duration-200 text-left"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 shadow-xs">
                                🛠️
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                  {lang === 'bn' ? 'সার্ভিস এডিট করুন' : 'Edit Service'}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">ID: {editingService.id}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingService(null)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {lang === 'bn' ? 'সার্ভিসের নাম *' : 'Service Name *'}
                              </label>
                              <input
                                type="text"
                                value={editingService.name || ''}
                                onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                                className="w-full h-10 px-3.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                                </label>
                                <select
                                  value={editingService.category || 'Servicing'}
                                  onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                                  className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                                >
                                  <option value="Hardware">Hardware (হার্ডওয়্যার)</option>
                                  <option value="Software">Software (সফটওয়্যার)</option>
                                  <option value="Servicing">Servicing (সার্ভিসিং)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  {lang === 'bn' ? 'সার্ভিস ফি (৳) *' : 'Service Fee (৳) *'}
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingService.price ?? ''}
                                  onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-10 px-3.5 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {lang === 'bn' ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
                              </label>
                              <input
                                type="text"
                                value={editingService.description || ''}
                                onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                className="w-full h-10 px-3.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                              </label>
                              <select
                                value={editingService.status || 'Active'}
                                onChange={e => setEditingService({ ...editingService, status: e.target.value })}
                                className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
                              >
                                <option value="Active">Active (সক্রিয়)</option>
                                <option value="Pending">Pending (অপেক্ষমান)</option>
                                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <button
                              type="button"
                              onClick={() => setEditingService(null)}
                              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!editingService.name?.trim()) {
                                  showToast(lang === 'bn' ? 'সার্ভিসের নাম প্রদান করুন' : 'Service name required', 'error');
                                  return;
                                }
                                setServices((prev: any) => prev.map((x: any) => x.id === editingService.id ? { ...editingService } : x));
                                setProducts((prev: any) => prev.map((p: any) => p.id === editingService.id ? { ...p, name: editingService.name, category: editingService.category, sellingPrice: Number(editingService.price) } : p));
                                showToast(lang === 'bn' ? 'সার্ভিস সফলভাবে আপডেট হয়েছে!' : 'Service updated successfully!', 'success');
                                setEditingService(null);
                              }}
                              className="flex-1 py-2.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                            >
                              ✓ {lang === 'bn' ? 'আপডেট করুন' : 'Update Service'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modern Delete Service Confirmation Modal */}
                    {serviceToDelete && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setServiceToDelete(null)}>
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
                        <div 
                          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm overflow-hidden my-auto p-6 text-center animate-in fade-in zoom-in-95 duration-200"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-200 dark:border-rose-900/50">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <h4 className="text-base font-bold text-slate-800 dark:text-white">
                            {lang === 'bn' ? 'সার্ভিস মুছে ফেলতে চান?' : 'Delete Service?'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            {lang === 'bn' 
                              ? `"${serviceToDelete.name}" সার্ভিসটি তালিকা থেকে অপসারণ করা হবে।` 
                              : `Service "${serviceToDelete.name}" will be permanently removed.`}
                          </p>
                          <div className="flex items-center gap-3 mt-5">
                            <button
                              type="button"
                              onClick={() => setServiceToDelete(null)}
                              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setServices((prev: any) => prev.filter((x: any) => x.id !== serviceToDelete.id));
                                setProducts((prev: any) => prev.filter((x: any) => x.id !== serviceToDelete.id));
                                showToast(lang === 'bn' ? 'সার্ভিস সফলভাবে মুছে ফেলা হয়েছে!' : 'Service deleted!', 'info');
                                setServiceToDelete(null);
                              }}
                              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition cursor-pointer"
                            >
                              {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeSubTab === 'units' ? (
                  <UnitsManager
                    lang={lang}
                    products={products}
                    unitCategories={UNIT_CATEGORIES}
                    unitsByCategory={unitsByCategory}
                    setUnitsByCategory={setUnitsByCategory}
                    productToUnitCats={PRODUCT_TO_UNIT_CATS}
                    showToast={showToast}
                  />

                ) : (activeSubTab === 'warranty_serial' || activeSubTab === 'warranties') ? (
                  <WarrantySerialManager lang={lang} products={products} sales={sales} showToast={showToast} />
                ) : activeSubTab === 'batch_expiry' ? (
                  <BatchExpiryManager lang={lang} products={products} showToast={showToast} />
                ) : activeSubTab === 'combos' ? (
                  <ComboManager
                    lang={lang}
                    products={products}
                    showToast={showToast}
                    onSellCombo={(combo: Combo) => {
                      const sumOriginal = combo.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
                      const ratio = sumOriginal > 0 ? combo.bundlePrice / sumOriginal : 1;
                      const cartAdditions = combo.items.map(ci => {
                        const prod = products.find((p: any) => p.id === ci.productId);
                        if (!prod) return null;
                        return {
                          product: prod,
                          quantity: ci.quantity,
                          customPrice: Number((ci.unitPrice * ratio).toFixed(2)),
                          discount: 0,
                          tax: 0,
                        };
                      }).filter(Boolean) as any[];
                      if (cartAdditions.length === 0) {
                        showToast(lang === 'bn' ? 'পণ্য পাওয়া যায়নি' : 'Products not found', 'error');
                        return;
                      }
                      setPosCart(prev => [...prev, ...cartAdditions]);
                      recordComboUsage(combo.id, combo.bundlePrice);
                      setActiveTab('pos');
                      setActiveSubTab('pos');
                      showToast(lang === 'bn' ? `"${combo.name}" কার্টে যোগ হয়েছে` : `"${combo.name}" added to cart`, 'success');
                    }}
                  />
                ) : activeSubTab === 'price_history' ? (
                  <PurchaseHistoryManager lang={lang} products={products} suppliers={suppliers} showToast={showToast} />
                ) : activeSubTab === 'stock_alert' ? (
                  <StockAlertManager lang={lang} products={products} showToast={showToast} />
                ) : activeSubTab === 'print_labels' ? (
                  <PrintLabels
                    lang={lang}
                    onToggleLang={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
                    products={products}
                    shopName={shopName}
                    shopPhone={shopPhone}
                    showToast={showToast}
                  />
                ) : activeSubTab === 'import_items' ? (
                  <ImportItems
                    lang={lang}
                    products={products}
                    setProducts={setProducts}
                    categoriesList={categoriesList}
                    setCategoriesList={setCategoriesList}
                    brandsList={brandsList}
                    setBrandsList={setBrandsList}
                    showToast={showToast}
                    setActiveSubTab={setActiveSubTab}
                  />
                ) : activeSubTab === 'import_services' ? (
                  <ImportServices
                    lang={lang}
                    services={services}
                    setServices={setServices}
                    products={products}
                    setProducts={setProducts}
                    showToast={showToast}
                  />
                ) : activeSubTab === 'import_export' ? (
                  <ImportExportManager
                    lang={lang}
                    products={products} setProducts={setProducts}
                    services={services} setServices={setServices}
                    categoriesList={categoriesList} setCategoriesList={setCategoriesList}
                    brandsList={brandsList} setBrandsList={setBrandsList}
                    variants={variants} setVariants={setVariants}
                    unitsByCategory={unitsByCategory} setUnitsByCategory={setUnitsByCategory}
                    showToast={showToast}
                  />
                ) : activeSubTab === 'audit_log' ? (
                  <AuditLogViewer lang={lang} showToast={showToast} />
                ) : activeSubTab === 'stock_heatmap' ? (
                  <StockHeatmap products={products} sales={sales} lang={lang} />
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 mb-4 select-none">
                      <div className="flex items-baseline gap-2">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-xl font-sans tracking-tight">
                          {activeSubTab === 'print_labels' 
                            ? (lang === 'bn' ? 'প্রিন্ট লেবেল' : 'Print Labels') 
                            : activeSubTab === 'import_items'
                            ? (lang === 'bn' ? 'ইমপোর্ট আইটেম' : 'Import Items')
                            : activeSubTab === 'import_services'
                            ? (lang === 'bn' ? 'ইমপোর্ট সার্ভিস' : 'Import Services')
                            : (lang === 'bn' ? 'পণ্য তালিকা' : 'Items List')}
                        </h1>
                        <span className="text-gray-400 text-xs font-normal">
                          {activeSubTab === 'print_labels' 
                            ? (lang === 'bn' ? 'পণ্যের বারকোড স্টিকার প্রিন্ট করুন' : 'Print barcode labels for inventory SKUs') 
                            : activeSubTab === 'import_items'
                            ? (lang === 'bn' ? 'এক্সেল বা সিএসভি দিয়ে পণ্য ইমপোর্ট করুন' : 'Bulk import products via Excel or CSV')
                            : activeSubTab === 'import_services'
                            ? (lang === 'bn' ? 'এক্সেল দিয়ে সার্ভিস তালিকা ইমপোর্ট করুন' : 'Bulk import services via Excel template')
                            : (lang === 'bn' ? 'আপনার পণ্যের ক্যাটালগ পরিচালনা করুন' : 'Manage your items catalog')}
                        </span>
                      </div>
                      
                      {/* Top Action buttons */}
                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        {/* Hidden CSV Input */}
                        <input
                          type="file"
                          ref={csvInputRef}
                          onChange={handleCsvUpload}
                          accept=".csv"
                          className="hidden"
                        />
                        <button
                          onClick={function() { csvInputRef.current?.click(); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
                        >
                          📥 {lang === 'bn' ? 'CSV আপলোড' : 'Upload CSV'}
                        </button>
                        <button
                          onClick={function() { setNewProdItemType('ITEM'); setIsAddProductOpen(true); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
                        >
                          <span className="text-sm">+</span>
                          <span>{lang === 'bn' ? 'আইটেম তৈরি করুন' : 'Create Item'}</span>
                        </button>
                        <button
                          onClick={function() { setNewProdItemType('SERVICE'); setIsAddProductOpen(true); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer h-10 shadow-sm hover:shadow"
                        >
                          <span className="text-sm">+</span>
                          <span>{lang === 'bn' ? 'সার্ভিস তৈরি করুন' : 'Create Service'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtle, Modern Clean Separator */}
                    <div className="border-b border-slate-200 dark:border-slate-800 w-full mb-4" />

                    {/* Table Utility Controls Panel */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-1 select-none">
                      {/* Entries limit dropdown */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <span>{lang === 'bn' ? 'দেখান' : 'Show'}</span>
                        <select
                          value={entriesLimit}
                          onChange={function(e) { setEntriesLimit(parseInt(e.target.value)); }}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                        <span>{lang === 'bn' ? 'এন্ট্রি' : 'entries'}</span>
                      </div>

                      {/* Export buttons */}
                      <div className="inline-flex rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden font-sans">
                        <button
                          onClick={function() {
                            const clipText = filteredInventory.map(function(p) {
                              return `${p.id}\t${p.name}\t${p.brand || ""}\t${p.category}\t${p.unit}\t${p.stock}\t${p.sellingPrice}`;
                            }).join("\n");
                            navigator.clipboard.writeText(`ID\tName\tBrand\tCategory\tUnit\tStock\tPrice\n` + clipText);
                            showToast(lang === 'bn' ? "সমস্ত আইটেম তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!" : "Product data copied to clipboard!", "success");
                          }}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border-r border-slate-200 transition cursor-pointer"
                        >
                          {lang === 'bn' ? 'কপি' : 'Copy'}
                        </button>
                        <button
                          onClick={function() {
                            let csvContent = "data:text/csv;charset=utf-8,Item Code,Item Name,Brand,Category,Unit,Stock,Sales Price,Status\n";
                            filteredInventory.forEach(function(p) {
                              csvContent += `"${p.id}","${p.name}","${p.brand || ""}","${p.category}","${p.unit}",${p.stock},${p.sellingPrice},"${p.status || 'Active'}"\n`;
                            });
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "Suppliers_Inventory_Export.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            showToast("Download Excel/CSV initiated!", "success");
                          }}
                          className="px-3.5 py-1.5 bg-[#f4f4f4] hover:bg-slate-200 text-slate-700 text-xs font-bold border-r border-slate-200 transition cursor-pointer"
                        >
                          Excel
                        </button>
                        <button
                          onClick={function() { showToast("Exporting PDF Layout File...", "success"); }}
                          className="px-3.5 py-1.5 bg-[#f4f4f4] hover:bg-slate-200 text-slate-700 text-xs font-bold border-r border-slate-200 transition cursor-pointer"
                        >
                          PDF
                        </button>
                        <button
                          onClick={function() { window.print(); }}
                          className="px-3.5 py-1.5 bg-[#f4f4f4] hover:bg-slate-200 text-slate-700 text-xs font-bold border-r border-slate-200 transition cursor-pointer"
                        >
                          {lang === 'bn' ? 'প্রিন্ট' : 'Print'}
                        </button>
                        <button
                          onClick={function() {
                            let csvContent = "data:text/csv;charset=utf-8,Item Code,Item Name,Brand,Category,Unit,Stock,Sales Price,Status\n";
                            filteredInventory.forEach(function(p) {
                              csvContent += `"${p.id}","${p.name}","${p.brand || ""}","${p.category}","${p.unit}",${p.stock},${p.sellingPrice},"${p.status || 'Active'}"\n`;
                            });
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "Inventory_Logs.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            showToast("CSV Download initiated successfully!", "success");
                          }}
                          className="px-3.5 py-1.5 bg-[#f4f4f4] hover:bg-slate-200 hover:text-white hover:bg-emerald-600 text-stone-700 text-xs font-bold border-r border-slate-200 transition cursor-pointer"
                        >
                          CSV
                        </button>
                        <button
                          onClick={function() { showToast("Listing togglable table columns...", "success"); }}
                          className="px-3.5 py-1.5 bg-[#f4f4f4] hover:bg-slate-200 text-slate-705 text-xs font-bold transition cursor-pointer"
                        >
                          {lang === 'bn' ? 'কলাম' : 'Columns'}
                        </button>
                      </div>

                      {/* Search Bar & Trash Utility Container */}
                      <div className="flex items-center gap-2.5 w-full md:w-auto ml-auto">
                        <button
                          onClick={handleDeleteAllProducts}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md text-[11px] flex items-center gap-1 hover:shadow-md transition cursor-pointer border border-red-700/20 shadow-xs animate-pulse"
                          title="Delete All Items currently loaded"
                        >
                          🗑️ {lang === 'bn' ? 'সব ডিলিট করুন' : 'Delete All'}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 font-sans">{lang === 'bn' ? 'অনুসন্ধান:' : 'Search:'}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={inventorySearch}
                              onChange={function(e) { setInventorySearch(e.target.value); }}
                              placeholder={lang === 'bn' ? 'পণ্যের নাম বা কোড লিখুন...' : 'Type name / item code...'}
                              className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition w-44 md:w-56 text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={function() { setIsInventoryScannerOpen(true); }}
                              className="bg-[#008d44] hover:bg-[#00733e] text-white rounded p-1.5 flex items-center justify-center font-bold cursor-pointer transition active:scale-[0.96] shrink-0 border-none h-[28px] w-[28px]"
                              title={lang === 'bn' ? "ক্যামেরা স্ক্যানার" : "Camera Scanner"}
                            >
                              <Camera size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ===== Advanced Filters & Bulk Actions Toolbar (Items module optimization) ===== */}
                    {(() => {
                      const uniq = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));
                      const catOpts = uniq(products.map((p: any) => p.category));
                      const brandOpts = uniq(products.map((p: any) => p.brand));
                      const variantOpts = uniq(products.map((p: any) => p.variant));
                      const unitOpts = uniq(products.map((p: any) => p.unit));
                      const supplierOpts = uniq(products.map((p: any) => p.supplier || p.supplierName));
                      const activeFilterCount = [advCategoryFilter, advBrandFilter, advVariantFilter, advUnitFilter, advSupplierFilter, advWarrantyFilter, advStockFilter].filter(Boolean).length;
                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <button onClick={() => setShowAdvFilters(v => !v)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold">
                              🔍 {lang === 'bn' ? 'উন্নত ফিল্টার' : 'Advanced Filters'}
                              {activeFilterCount > 0 && <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5">{activeFilterCount}</span>}
                            </button>
                            <label className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                              <input type="checkbox" checked={useInfiniteScroll} onChange={e => { setUseInfiniteScroll(e.target.checked); setInfiniteVisible(20); setProductPage(1); }} />
                              {lang === 'bn' ? 'ইনফিনিট স্ক্রল' : 'Infinite Scroll'}
                            </label>
                            <span className="text-slate-500">
                              {filteredInventory.length} {lang === 'bn' ? 'ফলাফল' : 'results'}
                            </span>
                          </div>
                          {showAdvFilters && (
                            <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                              <select value={advCategoryFilter} onChange={e => { setAdvCategoryFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded"><option value="">{lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</option>{catOpts.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={advBrandFilter} onChange={e => { setAdvBrandFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded"><option value="">{lang === 'bn' ? 'সব ব্র্যান্ড' : 'All Brands'}</option>{brandOpts.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={advVariantFilter} onChange={e => { setAdvVariantFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded"><option value="">{lang === 'bn' ? 'সব ভ্যারিয়েন্ট' : 'All Variants'}</option>{variantOpts.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={advUnitFilter} onChange={e => { setAdvUnitFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded"><option value="">{lang === 'bn' ? 'সব ইউনিট' : 'All Units'}</option>{unitOpts.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={advSupplierFilter} onChange={e => { setAdvSupplierFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded"><option value="">{lang === 'bn' ? 'সব সরবরাহকারী' : 'All Suppliers'}</option>{supplierOpts.map(c => <option key={c} value={c}>{c}</option>)}</select>
                              <select value={advWarrantyFilter} onChange={e => { setAdvWarrantyFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded">
                                <option value="">{lang === 'bn' ? 'ওয়ারেন্টি: সব' : 'Warranty: All'}</option>
                                <option value="tracked">Tracked</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="none">Not Tracked</option>
                              </select>
                              <select value={advStockFilter} onChange={e => { setAdvStockFilter(e.target.value); setProductPage(1); }} className="px-2 py-1.5 border border-slate-200 rounded">
                                <option value="">{lang === 'bn' ? 'স্টক: সব' : 'Stock: All'}</option>
                                <option value="in">In Stock</option>
                                <option value="low">Low Stock</option>
                                <option value="out">Out of Stock</option>
                                <option value="negative">Negative</option>
                              </select>
                              <button onClick={() => { setAdvCategoryFilter(''); setAdvBrandFilter(''); setAdvVariantFilter(''); setAdvUnitFilter(''); setAdvSupplierFilter(''); setAdvWarrantyFilter(''); setAdvStockFilter(''); setProductPage(1); }} className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-600">
                                {lang === 'bn' ? 'রিসেট' : 'Reset'}
                              </button>
                            </div>
                          )}
                          {selectedProductIds.size > 0 && (
                            <div className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[11px]">
                              <span className="font-bold text-blue-800">{selectedProductIds.size} {lang === 'bn' ? 'নির্বাচিত' : 'selected'}</span>
                              <button onClick={() => setIsBulkEditOpen(true)} className="px-2.5 py-1 rounded bg-white border border-blue-300 text-blue-700 font-bold hover:bg-blue-100">✏️ {lang === 'bn' ? 'বাল্ক এডিট' : 'Bulk Edit'}</button>
                              <button onClick={() => {
                                if (!confirm(lang === 'bn' ? `${selectedProductIds.size} টি পণ্য মুছবেন?` : `Delete ${selectedProductIds.size} products?`)) return;
                                const ids = new Set(selectedProductIds);
                                setProducts((prev: any[]) => prev.filter((p: any) => !ids.has(p.id)));
                                setSelectedProductIds(new Set());
                                showToast(lang === 'bn' ? 'বাল্ক ডিলিট সম্পন্ন' : 'Bulk delete complete', 'success');
                              }} className="px-2.5 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700">🗑️ {lang === 'bn' ? 'বাল্ক ডিলিট' : 'Bulk Delete'}</button>
                              <button onClick={() => {
                                const selected = products.filter((p: any) => selectedProductIds.has(p.id));
                                const header = ['id','name','category','brand','unit','purchasePrice','sellingPrice','stock','minStock','barcode','supplier'];
                                const csvLines = [header.join(',')];
                                for (const p of selected) {
                                  csvLines.push(header.map(k => `"${String((p as any)[k] ?? '').replace(/"/g, '""')}"`).join(','));
                                }
                                const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `products-export-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                                showToast(lang === 'bn' ? 'এক্সপোর্ট সম্পন্ন' : 'Export complete', 'success');
                              }} className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700">📤 {lang === 'bn' ? 'বাল্ক এক্সপোর্ট' : 'Bulk Export'}</button>
                              <button onClick={() => csvInputRef.current?.click()} className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100">📥 {lang === 'bn' ? 'বাল্ক ইম্পোর্ট' : 'Bulk Import'}</button>
                              <button onClick={() => setSelectedProductIds(new Set())} className="ml-auto px-2 py-1 text-slate-500 hover:text-slate-700">✕</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Bulk Edit modal */}
                    {isBulkEditOpen && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={() => setIsBulkEditOpen(false)}>
                        <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
                          <h3 className="font-bold text-slate-800">{lang === 'bn' ? 'বাল্ক এডিট' : 'Bulk Edit'} ({selectedProductIds.size})</h3>
                          <label className="block text-xs font-bold text-slate-600 space-y-1">
                            <span>{lang === 'bn' ? 'বিক্রয় মূল্য (খালি রাখুন = অপরিবর্তিত)' : 'Selling Price (blank = keep)'}</span>
                            <input type="number" value={bulkEditPrice} onChange={e => setBulkEditPrice(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded" />
                          </label>
                          <label className="block text-xs font-bold text-slate-600 space-y-1">
                            <span>{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</span>
                            <input value={bulkEditCategory} onChange={e => setBulkEditCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded" />
                          </label>
                          <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsBulkEditOpen(false)} className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 text-xs font-bold">Cancel</button>
                            <button onClick={() => {
                              const ids = new Set(selectedProductIds);
                              setProducts((prev: any[]) => prev.map((p: any) => {
                                if (!ids.has(p.id)) return p;
                                const next = { ...p };
                                if (bulkEditPrice !== '') next.sellingPrice = Number(bulkEditPrice);
                                if (bulkEditCategory !== '') next.category = bulkEditCategory;
                                return next;
                              }));
                              setBulkEditPrice(''); setBulkEditCategory(''); setIsBulkEditOpen(false);
                              showToast(lang === 'bn' ? 'বাল্ক আপডেট সম্পন্ন' : 'Bulk update applied', 'success');
                            }} className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold">{lang === 'bn' ? 'প্রয়োগ' : 'Apply'}</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {csvPreviewRows.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-lg space-y-4 shadow-sm animate-fade-in relative z-10">
                        <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                          <div>
                            <h2 className="text-emerald-800 font-bold text-xs uppercase tracking-wider">🕵️ CSV Live Auto Preview Draft</h2>
                            <span className="text-[10px] text-gray-550 block mt-0.5">Unsaved rows payload: {csvPreviewRows.length} Pcs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={function() { setCsvPreviewRows([]); }}
                              className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-600 border border-slate-250 text-gray-550 px-3 py-1.5 text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmCsvImport}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4.5 py-1.5 rounded-md text-xs shadow-xs transition cursor-pointer"
                            >
                              Save Draft to Database
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto max-h-52 bg-white rounded-md border border-slate-100">
                          <table className="w-full text-left text-xs font-medium">
                            <thead className="bg-[#f9fafc] text-slate-700 font-bold border-b">
                              <tr>
                                <th className="p-2.5 pl-3">Item Code</th>
                                <th className="p-2.5">Item Name</th>
                                <th className="p-2.5">Brand</th>
                                <th className="p-2.5">Category</th>
                                <th className="p-2.5">Unit</th>
                                <th className="p-2.5 text-right">Price</th>
                                <th className="p-2.5 text-center pr-3">Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreviewRows.map(function(row, idx) {
                                return (
                                  <tr key={idx} className="border-b hover:bg-slate-50 last:border-0 text-slate-600">
                                    <td className="p-2.5 pl-3 font-mono font-bold text-[10px] text-blue-650">{row.id}</td>
                                    <td className="p-2.5 font-bold text-[#333]">{row.name}</td>
                                    <td className="p-2.5">{row.brand || "—"}</td>
                                    <td className="p-2.5 text-stone-500">{row.category}</td>
                                    <td className="p-2.5">{row.unit}</td>
                                    <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">৳{row.sellingPrice.toFixed(2)}</td>
                                    <td className="p-2.5 text-center pr-3 font-mono text-slate-850">{row.stock}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Table Viewport */}
                    <div className="overflow-x-auto border border-slate-205 rounded">
                      <table className="w-full text-xs text-left border-collapse font-sans font-medium text-[#222d32]">
                        <thead className="bg-[#f9fafc] text-[#222d32] font-bold uppercase tracking-wider text-[11px] border-b border-slate-205">
                          <tr>
                            <th className="px-3.5 py-3 text-center border-r border-slate-150 w-[42px]">
                              <input type="checkbox" className="rounded-xs border-slate-300 h-3.5 w-3.5 accent-[#00a65a]" />
                            </th>
                            <th className="px-4 py-3 border-r border-slate-150">{lang === 'bn' ? 'আইটেম কোড ⇅' : 'Item Code ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 min-w-[180px]">{lang === 'bn' ? 'পণ্যের নাম ⇅' : 'Item Name ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150">{lang === 'bn' ? 'ব্র্যান্ড ⇅' : 'Brand ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150">{lang === 'bn' ? 'ক্যাটাগরি ⇅' : 'Category ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 text-center">{lang === 'bn' ? 'একক ⇅' : 'Unit ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 pr-4 text-center">{lang === 'bn' ? 'স্টক ⇅' : 'Stock ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 text-center">{lang === 'bn' ? 'সতর্কতা ⇅' : 'Alert Qty ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 text-right">{lang === 'bn' ? 'বিক্রয় মূল্য ⇅' : 'Sales Price ⇅'}</th>
                            <th className="px-4 py-3 border-r border-slate-150 text-center">{lang === 'bn' ? 'স্ট্যাটাস ⇅' : 'Status ⇅'}</th>
                            <th className="px-4 py-3 text-center">{lang === 'bn' ? 'অ্যাকশন ⇅' : 'Action ⇅'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 bg-white">
                          {filteredInventory.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="px-6 py-12 text-center text-slate-450 font-bold bg-slate-50">
                                💔 {lang === 'bn' ? "কোনো আমদানিকৃত পণ্য পাওয়া যায়নি! অনুগ্রহ করে একটি CSV ফাইল আপলোড করুন।" : "No inventory items registered currently! Please upload your CSV file."}
                              </td>
                            </tr>
                          ) : (
                            (function() {
                              const pageSize = entriesLimit;
                              const visible = useInfiniteScroll
                                ? filteredInventory.slice(0, infiniteVisible)
                                : filteredInventory.slice((productPage - 1) * pageSize, productPage * pageSize);
                              return visible.map(function(p: any) {
                                const isSelected = selectedProductIds.has(p.id);
                                return (
                                <tr key={p.id} className={`hover:bg-slate-50/70 transition duration-100 ease-in-out ${isSelected ? 'bg-blue-50/60' : ''}`}>
                                  {/* Checkbox column */}
                                  <td className="px-3 py-3.5 text-center border-r border-slate-150">
                                    <input type="checkbox" checked={isSelected} onChange={e => {
                                      setSelectedProductIds(prev => {
                                        const next = new Set(prev);
                                        if (e.target.checked) next.add(p.id); else next.delete(p.id);
                                        return next;
                                      });
                                    }} className="rounded-xs border-slate-300 h-3.5 w-3.5 accent-[#00a65a]" />
                                  </td>

                                  {/* SKU code column */}
                                  <td className="px-4 py-3.5 font-bold font-mono text-[11px] text-[#222d32] border-r border-slate-150 leading-relaxed uppercase">
                                    {p.id}
                                  </td>

                                  {/* Item Name column, stacked HSN/SKU like screenshot */}
                                  <td className="px-4 py-3 border-r border-slate-150">
                                    <div className="flex flex-col">
                                      <span
                                        onClick={function() { setEditingProduct(p); }}
                                        className="text-[#3c8dbc] hover:text-[#23527c] hover:underline font-bold text-[12.5px] cursor-pointer font-sans text-left leading-snug"
                                      >
                                        {p.name}
                                      </span>
                                      <div className="text-[9.5px] text-gray-500 font-bold block space-y-0.5 mt-1 font-mono tracking-wider">
                                        <div>HSN: <span className="font-normal text-slate-450">—</span></div>
                                        <div>SKU: <span className="font-normal text-slate-450">{p.id}</span></div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Brand column */}
                                  <td className="px-4 py-3.5 border-r border-slate-150 text-[11px] font-bold text-slate-700">
                                    {p.brand || "—"}
                                  </td>

                                  {/* Category & Badge Item-Type column stacked */}
                                  <td className="px-4 py-3.5 border-r border-slate-150">
                                    <div className="flex flex-col items-start gap-1">
                                      <span className="text-[11.5px] font-bold text-slate-800 font-sans">{p.category}</span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-white ${
                                        (p.itemType || "ITEM") === "SERVICE" ? "bg-cyan-500" : "bg-[#f39c12]"
                                      }`}>
                                        [{p.itemType || "ITEM"}]
                                      </span>
                                    </div>
                                  </td>

                                  {/* Unit column */}
                                  <td className="px-4 py-3.5 text-center border-r border-slate-150 font-bold text-gray-650 uppercase">
                                     {p.unit}
                                  </td>

                                  {/* Stock status check and label icon container inside table */}
                                  <td className="px-4 py-3.5 text-center border-r border-slate-150 font-bold text-xs">
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="text-[#333] font-mono font-bold text-[13px]">{p.stock}</span>
                                      <span className="text-blue-500 font-semibold cursor-help select-none" title="Warehouse stock details">📦</span>
                                    </div>
                                  </td>

                                  {/* Alert Quantity column */}
                                  <td className="px-4 py-3.5 text-center border-r border-slate-150 font-mono font-bold text-slate-600 text-[11.5px]">
                                    {p.alertQty || 0}
                                  </td>

                                  {/* Total prices formatted */}
                                  <td className="px-4 py-3.5 text-right border-r border-slate-150 font-mono font-bold text-[12px] text-slate-850">
                                    {p.sellingPrice.toFixed(2)}
                                  </td>

                                  {/* Status field */}
                                  <td className="px-4 py-3.5 text-center border-r border-slate-150">
                                    <span className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase select-none transition shadow-2xs">
                                      {p.status || "Active"}
                                    </span>
                                  </td>

                                  {/* Action button dropdown block */}
                                  <td className="px-4 py-3 text-center relative select-none">
                                    <div className="relative inline-block text-left">
                                      <button
                                        onClick={function(e) {
                                          e.stopPropagation();
                                          setActiveRowActionMenuId(activeRowActionMenuId === p.id ? null : p.id);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition duration-150 flex items-center justify-center gap-1 shadow-xs cursor-pointer select-none"
                                      >
                                        <span>Action</span>
                                        <span className="text-[10px]">▼</span>
                                      </button>

                                      {/* Actions Floating Popup menu */}
                                      {activeRowActionMenuId === p.id && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={function() { setActiveRowActionMenuId(null); }}
                                          />
                                          <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-20 font-sans text-left text-xs font-bold divide-y divide-slate-100">
                                            {/* Adjust stock interactive prompt */}
                                            <button
                                              onClick={function() {
                                                setActiveRowActionMenuId(null);
                                                var labelPrompt = lang === 'bn' ? `"${p.name}" এর জন্য কত স্টক যোগ করতে চান?` : `How much stock quantity would you like to add to "${p.name}"?`;
                                                var addAmtStr = window.prompt(labelPrompt, "10");
                                                var addAmt = parseInt(addAmtStr || "0", 10);
                                                if (isNaN(addAmt) || addAmt <= 0) return;
                                                setProducts(products.map(function(item) {
                                                  if (item.id === p.id) {
                                                    return { ...item, stock: item.stock + addAmt };
                                                  }
                                                  return item;
                                                }));
                                                showToast(lang === 'bn' ? "স্টক সফলভাবে যোগ করা হয়েছে!" : "Stock quantity updated successfully!", "success");
                                              }}
                                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer transition duration-75"
                                            >
                                              <span>➕</span>
                                              <span>{lang === 'bn' ? 'স্টক যোগ করুন' : 'Add Stock Quantity'}</span>
                                            </button>

                                            {/* Edit details */}
                                            <button
                                              onClick={function() {
                                                setActiveRowActionMenuId(null);
                                                setEditingProduct(p);
                                              }}
                                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-[#00c0ef] flex items-center gap-2 cursor-pointer transition duration-75"
                                            >
                                              <span>✏️</span>
                                              <span>{lang === 'bn' ? 'সংশোধন করুন' : 'Edit Item Details'}</span>
                                            </button>

                                            {/* Delete action */}
                                            <button
                                              onClick={function() {
                                                setActiveRowActionMenuId(null);
                                                handleDeleteProduct(p.id);
                                              }}
                                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition duration-75"
                                            >
                                              <span>🗑️</span>
                                              <span>{lang === 'bn' ? 'ডিলিট করুন' : 'Delete Member'}</span>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                              });
                            })()
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination + infinite-scroll footer */}
                    {(() => {
                      const total = filteredInventory.length;
                      const pageSize = entriesLimit;
                      const totalPages = Math.max(1, Math.ceil(total / pageSize));
                      const page = Math.min(productPage, totalPages);
                      const shownStart = total === 0 ? 0 : useInfiniteScroll ? 1 : (page - 1) * pageSize + 1;
                      const shownEnd = useInfiniteScroll ? Math.min(infiniteVisible, total) : Math.min(page * pageSize, total);
                      const pageBtns: number[] = [];
                      const from = Math.max(1, page - 2), to = Math.min(totalPages, page + 2);
                      for (let i = from; i <= to; i++) pageBtns.push(i);
                      return (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500 py-1.5 px-1 select-none font-sans">
                          <div>{total === 0 ? (lang === 'bn' ? 'কোনো ফলাফল নেই' : 'Showing 0 to 0 of 0 entries') : (lang === 'bn' ? `${shownStart} থেকে ${shownEnd} দেখানো হচ্ছে (মোট ${total})` : `Showing ${shownStart} to ${shownEnd} of ${total} entries`)}</div>
                          {useInfiniteScroll ? (
                            infiniteVisible < total && (
                              <button onClick={() => setInfiniteVisible(v => v + 20)} className="px-4 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700">
                                {lang === 'bn' ? 'আরও লোড করুন' : 'Load More'} ({total - infiniteVisible})
                              </button>
                            )
                          ) : (
                            <div className="inline-flex rounded-md border border-slate-200 overflow-hidden font-sans">
                              <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={`px-3.5 py-1.5 text-xs font-bold border-r border-slate-200 ${page <= 1 ? 'bg-[#f4f4f4] text-slate-400 cursor-not-allowed' : 'bg-[#f4f4f4] hover:bg-slate-200 text-slate-700'}`}>{lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</button>
                              {pageBtns.map(n => (
                                <button key={n} onClick={() => setProductPage(n)} className={`px-3.5 py-1.5 text-xs border-r border-slate-200 transition ${n === page ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-white hover:bg-slate-100 text-slate-700 font-bold'}`}>{n}</button>
                              ))}
                              <button onClick={() => setProductPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className={`px-3.5 py-1.5 text-xs font-bold ${page >= totalPages ? 'bg-[#f4f4f4] text-slate-400 cursor-not-allowed' : 'bg-[#f4f4f4] hover:bg-slate-200 text-slate-700'}`}>{lang === 'bn' ? 'পরবর্তী' : 'Next'}</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'users' && (() => {
              // Derive filtered/sorted/paginated list
              const q = userSearchQuery.trim().toLowerCase();
              let list = systemEmployees.filter(u => {
                const matchQ = !q ||
                  (u.name || '').toLowerCase().includes(q) ||
                  (u.email || '').toLowerCase().includes(q) ||
                  (u.username || '').toLowerCase().includes(q) ||
                  (u.phone || '').toLowerCase().includes(q) ||
                  (u.role || '').toLowerCase().includes(q) ||
                  (u.branch || '').toLowerCase().includes(q) ||
                  (u.id || '').toLowerCase().includes(q);
                const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                const matchStatus =
                  userStatusFilter === 'all' ||
                  (userStatusFilter === 'active' && !u.isBlocked) ||
                  (userStatusFilter === 'blocked' && u.isBlocked);
                return matchQ && matchRole && matchStatus;
              });
              if (userSortColumn) {
                list = [...list].sort((a, b) => {
                  const av = (a[userSortColumn] ?? '').toString().toLowerCase();
                  const bv = (b[userSortColumn] ?? '').toString().toLowerCase();
                  if (av < bv) return userSortDirection === 'asc' ? -1 : 1;
                  if (av > bv) return userSortDirection === 'asc' ? 1 : -1;
                  return 0;
                });
              }
              const totalRows = list.length;
              const totalPages = Math.max(1, Math.ceil(totalRows / userEntriesLimit));
              const page = Math.min(userCurrentPage, totalPages);
              const start = (page - 1) * userEntriesLimit;
              const paged = list.slice(start, start + userEntriesLimit);

              const allRoles = Array.from(new Set(systemEmployees.map(u => u.role).filter(Boolean)));
              const activeCount = systemEmployees.filter(u => !u.isBlocked).length;
              const blockedCount = systemEmployees.filter(u => u.isBlocked).length;
              const adminCount = systemEmployees.filter(u => (u.role || '').toLowerCase().includes('admin')).length;

              // Role-based permission control
              const canManageUsers = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';
              const canDeleteUsers = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';
              const canBulkAction = canManageUsers;
              const denyMsg = () => showToast && showToast(
                lang === 'bn' ? "এই কাজের জন্য এডমিন/মালিকের অনুমতি প্রয়োজন" : "Admin/Owner permission required",
                'error'
              );
              const isSuperAdmin = sessionUser.role === 'super_admin';

              // Group employees by shop/organization for super admin overview
              const shopGroupsMap: Record<string, any[]> = {};
              systemEmployees.forEach(e => {
                const key = e.shopName || e.branch || (lang === 'bn' ? 'অন্যান্য' : 'Other');
                if (!shopGroupsMap[key]) shopGroupsMap[key] = [];
                shopGroupsMap[key].push(e);
              });
              const shopGroups = Object.entries(shopGroupsMap).map(([shopName, members]) => {
                const owner = members.find((m: any) => m.shopOwner) || members.find((m: any) => (m.role || '').toLowerCase() === 'owner');
                const employees = members.filter((m: any) => m !== owner);
                const activeCount = members.filter((m: any) => !m.isBlocked).length;
                const blockedCount = members.filter((m: any) => m.isBlocked).length;
                return { shopName, owner, employees, members, activeCount, blockedCount };
              }).sort((a, b) => a.shopName.localeCompare(b.shopName));


              const pageIds = paged.map(u => u.id);
              const allPageSelected = pageIds.length > 0 && pageIds.every(id => userSelectedIds.includes(id));
              const togglePageSelect = () => {
                if (allPageSelected) {
                  setUserSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                } else {
                  setUserSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
                }
              };
              const toggleOne = (id: string) => {
                setUserSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
              };

              const exportUsersCSV = () => {
                const headers = ['ID', 'Name', 'Username', 'Email', 'Phone', 'Role', 'Branch', 'Status', 'Created On'];
                const rows = list.map(u => [
                  u.id, u.name, u.username || '', u.email, u.phone || '', u.role, u.branch || '',
                  u.isBlocked ? 'Blocked' : 'Active', u.createdOn || ''
                ]);
                const csv = [headers, ...rows]
                  .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
                  .join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                showToast && showToast(lang === 'bn' ? "CSV এক্সপোর্ট হয়েছে" : "CSV exported", 'success');
              };

              const printUsers = () => {
                const w = window.open('', '_blank');
                if (!w) return;
                const rows = list.map(u => `
                  <tr>
                    <td>${u.id}</td><td>${u.name}</td><td>${u.username || ''}</td>
                    <td>${u.email}</td><td>${u.phone || ''}</td><td>${u.role}</td>
                    <td>${u.branch || ''}</td><td>${u.isBlocked ? 'Blocked' : 'Active'}</td>
                  </tr>`).join('');
                w.document.write(`<html><head><title>Users</title>
                  <style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;font-size:12px;}
                  th,td{border:1px solid #ccc;padding:6px;text-align:left;}th{background:#f1f5f9;}h1{margin:0 0 12px;}</style>
                  </head><body><h1>Users List (${list.length})</h1>
                  <table><thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Role</th><th>Branch</th><th>Status</th></tr></thead>
                  <tbody>${rows}</tbody></table></body></html>`);
                w.document.close();
                w.print();
              };

              const bulkBlock = (block: boolean) => {
                if (userSelectedIds.length === 0) return;
                setSystemEmployees(prev => prev.map(e => userSelectedIds.includes(e.id) ? { ...e, isBlocked: block } : e));
                showToast && showToast(
                  lang === 'bn'
                    ? `${userSelectedIds.length} জন ${block ? 'ব্লক' : 'আনব্লক'} হয়েছে`
                    : `${userSelectedIds.length} user(s) ${block ? 'blocked' : 'unblocked'}`,
                  'success'
                );
                setUserSelectedIds([]);
              };

              const bulkDelete = () => {
                if (userSelectedIds.length === 0) return;
                if (!confirm(lang === 'bn'
                  ? `${userSelectedIds.length} জন ইউজার মুছে ফেলবেন?`
                  : `Delete ${userSelectedIds.length} user(s)?`)) return;
                setSystemEmployees(prev => prev.filter(e => !userSelectedIds.includes(e.id)));
                showToast && showToast(lang === 'bn' ? "মুছে ফেলা হয়েছে" : "Deleted", 'success');
                setUserSelectedIds([]);
              };

              const resetPassword = (u: any) => {
                const newPass = Math.random().toString(36).slice(-8);
                showToast && showToast(
                  lang === 'bn'
                    ? `${u.name}-এর নতুন পাসওয়ার্ড: ${newPass}`
                    : `New password for ${u.name}: ${newPass}`,
                  'success'
                );
              };

              const SortIcon = ({ col }: { col: string }) => {
                if (userSortColumn !== col) return <ChevronsUpDown size={11} className="opacity-40" />;
                return userSortDirection === 'asc'
                  ? <ArrowUp size={11} className="text-blue-600" />
                  : <ArrowDown size={11} className="text-blue-600" />;
              };

              const th = "px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 select-none";

              return (
                <div className="space-y-4 animate-fadeIn text-left">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">User Management</span>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mt-1 flex items-center gap-2">
                        <Users size={26} className="text-blue-600" />
                        {lang === 'bn' ? "ইউজার তালিকা" : "Users List"}
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'bn'
                          ? `মোট ${systemEmployees.length} জন কর্মী নিবন্ধিত`
                          : `${systemEmployees.length} employees registered`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={printUsers}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Printer size={14} /> {lang === 'bn' ? "প্রিন্ট" : "Print"}
                      </button>
                      <button
                        onClick={exportUsersCSV}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Download size={14} /> {lang === 'bn' ? "CSV" : "Export CSV"}
                      </button>
                      <button
                        onClick={() => {
                          if (!canManageUsers) return denyMsg();
                          setEditingEmployee(null);
                          setIsAddEmployeeOpen(true);
                        }}
                        disabled={!canManageUsers}
                        title={canManageUsers ? '' : (lang === 'bn' ? 'অনুমতি নেই' : 'Permission required')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UserPlus size={16} />
                        {lang === 'bn' ? "নতুন ইউজার" : "Create User"}
                      </button>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${canManageUsers ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Shield size={10} className="inline -mt-0.5 mr-0.5" />
                        {sessionUser.role === 'super_admin' ? 'Super Admin' : sessionUser.role === 'owner' ? 'Owner' : (lang === 'bn' ? 'রিড-অনলি' : 'Read-only')}
                      </span>
                    </div>
                  </div>


                  {/* Stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{lang === 'bn' ? "মোট" : "Total"}</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{systemEmployees.length}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{lang === 'bn' ? "সক্রিয়" : "Active"}</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">{lang === 'bn' ? "ব্লকড" : "Blocked"}</p>
                      <p className="text-2xl font-bold text-rose-700 mt-1">{blockedCount}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{lang === 'bn' ? "এডমিন" : "Admins"}</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">{adminCount}</p>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                      <span>{lang === 'bn' ? "দেখাও" : "Show"}</span>
                      <select
                        value={userEntriesLimit}
                        onChange={(e) => { setUserEntriesLimit(Number(e.target.value)); setUserCurrentPage(1); }}
                        className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer"
                      >
                        {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span>{lang === 'bn' ? "এন্ট্রি" : "entries"}</span>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                        className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer ml-2"
                      >
                        <option value="all">{lang === 'bn' ? "সব ভূমিকা" : "All Roles"}</option>
                        {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>

                      <select
                        value={userStatusFilter}
                        onChange={(e) => { setUserStatusFilter(e.target.value as any); setUserCurrentPage(1); }}
                        className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer"
                      >
                        <option value="all">{lang === 'bn' ? "সব স্ট্যাটাস" : "All Status"}</option>
                        <option value="active">{lang === 'bn' ? "সক্রিয়" : "Active"}</option>
                        <option value="blocked">{lang === 'bn' ? "ব্লকড" : "Blocked"}</option>
                      </select>
                    </div>
                    <div className="relative flex-1 max-w-xs">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => { setUserSearchQuery(e.target.value); setUserCurrentPage(1); }}
                        placeholder={lang === 'bn' ? "নাম, ইমেইল, রোল..." : "Search name, email, role..."}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    {isSuperAdmin && (
                      <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs font-bold shrink-0">
                        <button
                          onClick={() => setUserViewMode('shops')}
                          className={`px-3 py-1.5 flex items-center gap-1.5 transition ${userViewMode === 'shops' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Store size={13} /> {lang === 'bn' ? 'দোকান ভিত্তিক' : 'By Shop'}
                        </button>
                        <button
                          onClick={() => setUserViewMode('table')}
                          className={`px-3 py-1.5 flex items-center gap-1.5 transition border-l border-slate-300 dark:border-slate-700 ${userViewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          <List size={13} /> {lang === 'bn' ? 'তালিকা' : 'Table'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shop / organization grouped view — super admin only */}
                  {isSuperAdmin && userViewMode === 'shops' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {shopGroups.map((g) => {
                        const q2 = userSearchQuery.trim().toLowerCase();
                        if (q2 && !g.shopName.toLowerCase().includes(q2) &&
                            !(g.owner?.name || '').toLowerCase().includes(q2) &&
                            !g.members.some((m: any) => (m.name || '').toLowerCase().includes(q2) || (m.email || '').toLowerCase().includes(q2))) {
                          return null;
                        }
                        return (
                          <div key={g.shopName} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                            {/* Shop header */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                                  <Store size={20} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {lang === 'bn' ? 'দোকান / প্রতিষ্ঠান' : 'Shop / Organization'}
                                  </p>
                                  <h3 className="text-base font-bold">{g.shopName}</h3>
                                  <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                                    {g.members.length} {lang === 'bn' ? 'সদস্য' : 'members'} · {g.activeCount} {lang === 'bn' ? 'সক্রিয়' : 'active'}
                                    {g.blockedCount > 0 && <> · <span className="text-rose-300">{g.blockedCount} {lang === 'bn' ? 'ব্লকড' : 'blocked'}</span></>}
                                  </p>
                                </div>
                              </div>
                              {g.owner && (
                                <button
                                  onClick={() => enterUserPortal(g.owner)}
                                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shrink-0 active:scale-95 transition"
                                  title={lang === 'bn' ? 'মালিকের পোর্টালে প্রবেশ' : "Enter owner's portal"}
                                >
                                  <LogIn size={11} /> {lang === 'bn' ? 'মালিক পোর্টাল' : 'Owner Portal'}
                                </button>
                              )}
                            </div>

                            {/* Owner block */}
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/10">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                                <Shield size={11} /> {lang === 'bn' ? 'মালিক' : 'Owner'}
                              </p>
                              {g.owner ? (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                      {(g.owner.name || '?').split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{g.owner.name}</p>
                                      <p className="text-[10px] text-slate-500 font-mono truncate">{g.owner.email}</p>
                                      <p className="text-[10px] text-slate-400">{g.owner.phone || '—'}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setViewingEmployee(g.owner)}
                                    className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
                                  >
                                    {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">{lang === 'bn' ? 'কোনো মালিক নির্ধারিত নেই' : 'No owner assigned'}</p>
                              )}
                            </div>

                            {/* Employees block */}
                            <div className="p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1">
                                <Users size={11} /> {lang === 'bn' ? 'কর্মচারী' : 'Employees'}
                                <span className="text-slate-400 font-mono">({g.employees.length})</span>
                              </p>
                              {g.employees.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic px-1">{lang === 'bn' ? 'কোনো কর্মচারী নেই' : 'No employees'}</p>
                              ) : (
                                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                  {g.employees.map((emp: any) => (
                                    <div key={emp.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 ${emp.isBlocked ? 'bg-rose-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                          {(emp.name || '?').split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                            {emp.name}
                                            {emp.isBlocked && <span className="ml-1 text-[9px] font-bold text-rose-600 uppercase">· blocked</span>}
                                          </p>
                                          <p className="text-[10px] text-slate-500 truncate">{emp.role} · {emp.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => setViewingEmployee(emp)}
                                          title={lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                                          className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                                        >
                                          <Search size={11} />
                                        </button>
                                        <button
                                          onClick={() => enterUserPortal(emp)}
                                          title={lang === 'bn' ? 'পোর্টালে প্রবেশ' : 'Enter portal'}
                                          className="p-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white"
                                        >
                                          <LogIn size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!isSuperAdmin || userViewMode === 'table') && (<>


                  {/* Bulk actions bar */}
                  {userSelectedIds.length > 0 && canBulkAction && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-200">
                        {lang === 'bn' ? `${userSelectedIds.length} জন নির্বাচিত` : `${userSelectedIds.length} selected`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => bulkBlock(true)} className="text-xs font-bold px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white active:scale-95 transition flex items-center gap-1">
                          <Lock size={12} /> {lang === 'bn' ? "ব্লক" : "Block"}
                        </button>
                        <button onClick={() => bulkBlock(false)} className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition flex items-center gap-1">
                          <Unlock size={12} /> {lang === 'bn' ? "আনব্লক" : "Unblock"}
                        </button>
                        {canDeleteUsers && (
                          <button onClick={bulkDelete} className="text-xs font-bold px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition flex items-center gap-1">
                            <Trash2 size={12} /> {lang === 'bn' ? "মুছুন" : "Delete"}
                          </button>
                        )}
                        <button onClick={() => setUserSelectedIds([])} className="text-xs font-bold px-2 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 active:scale-95 transition">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                  {userSelectedIds.length > 0 && !canBulkAction && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-amber-800 flex items-center gap-2">
                      <Shield size={13} /> {lang === 'bn' ? "বাল্ক অ্যাকশনের জন্য এডমিন/মালিকের অনুমতি প্রয়োজন" : "Admin/Owner permission required for bulk actions"}
                    </div>
                  )}

                  {/* Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className={th + " text-center w-8"}>
                              <input
                                type="checkbox"
                                checked={allPageSelected}
                                onChange={togglePageSelect}
                                className="cursor-pointer"
                              />
                            </th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('id')}>
                              <span className="inline-flex items-center gap-1">#ID <SortIcon col="id" /></span>
                            </th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('name')}>
                              <span className="inline-flex items-center gap-1">{lang === 'bn' ? "নাম" : "Name"} <SortIcon col="name" /></span>
                            </th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('username')}>
                              <span className="inline-flex items-center gap-1">{lang === 'bn' ? "ইউজারনেম" : "Username"} <SortIcon col="username" /></span>
                            </th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('email')}>
                              <span className="inline-flex items-center gap-1">Email <SortIcon col="email" /></span>
                            </th>
                            <th className={th + " text-left"}>{lang === 'bn' ? "মোবাইল" : "Phone"}</th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('role')}>
                              <span className="inline-flex items-center gap-1">{lang === 'bn' ? "ভূমিকা" : "Role"} <SortIcon col="role" /></span>
                            </th>
                            <th className={th + " text-left cursor-pointer"} onClick={() => toggleUserSort('branch')}>
                              <span className="inline-flex items-center gap-1">{lang === 'bn' ? "শাখা" : "Branch"} <SortIcon col="branch" /></span>
                            </th>
                            <th className={th + " text-center"}>{lang === 'bn' ? "স্ট্যাটাস" : "Status"}</th>
                            <th className={th + " text-right pr-4"}>{lang === 'bn' ? "অ্যাকশন" : "Actions"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {paged.length === 0 && (
                            <tr>
                              <td colSpan={10} className="text-center py-12 text-slate-400 text-sm">
                                {lang === 'bn' ? "কোনো ইউজার পাওয়া যায়নি।" : "No users found."}
                              </td>
                            </tr>
                          )}
                          {paged.map((u) => {
                            const initials = (u.name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
                            const roleColor =
                              u.role === 'Store Admin' ? 'bg-blue-100 text-blue-700' :
                              u.role === 'Manager' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'Customar' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700';
                            const isSelected = userSelectedIds.includes(u.id);
                            return (
                              <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${isSelected ? 'bg-blue-50/60' : ''}`}>
                                <td className="px-3 py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleOne(u.id)}
                                    className="cursor-pointer"
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{u.id}</td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                                      {initials}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{u.name}</p>
                                      <p className="text-[10px] text-slate-400">{u.createdOn}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">{u.username}</td>
                                <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                                <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">{u.phone || '—'}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roleColor}`}>{u.role}</span>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300">{u.branch}</td>
                                <td className="px-3 py-2.5 text-center">
                                  {u.isBlocked ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                      <Lock size={10} /> {lang === 'bn' ? "ব্লকড" : "Blocked"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                      <ShieldCheck size={10} /> {lang === 'bn' ? "সক্রিয়" : "Active"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right pr-4">
                                  <div className="inline-flex items-center gap-1">
                                    {isSuperAdmin && (
                                      <button
                                        onClick={() => enterUserPortal(u)}
                                        title={lang === 'bn' ? 'পোর্টালে প্রবেশ' : 'Enter portal'}
                                        className="p-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 transition active:scale-95"
                                      >
                                        <LogIn size={13} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setViewingEmployee(u)}
                                      title={lang === 'bn' ? "বিস্তারিত" : "View"}
                                      className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition active:scale-95"
                                    >
                                      <Search size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!canManageUsers) return denyMsg();
                                        setEditingEmployee(u);
                                        setIsAddEmployeeOpen(true);
                                      }}
                                      disabled={!canManageUsers}
                                      title={lang === 'bn' ? "সম্পাদনা" : "Edit"}
                                      className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!canManageUsers) return denyMsg();
                                        resetPassword(u);
                                        pushUserActivity(u.id, `Password reset by ${sessionUser.name}`);
                                      }}
                                      disabled={!canManageUsers}
                                      title={lang === 'bn' ? "পাসওয়ার্ড রিসেট" : "Reset Password"}
                                      className="p-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Shield size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!canManageUsers) return denyMsg();
                                        setSystemEmployees(prev => prev.map(e => e.id === u.id ? { ...e, isBlocked: !e.isBlocked } : e));
                                        pushUserActivity(u.id, `${u.isBlocked ? 'Unblocked' : 'Blocked'} by ${sessionUser.name}`);
                                        showToast && showToast(
                                          u.isBlocked
                                            ? (lang === 'bn' ? `${u.name} আনব্লক হয়েছে` : `${u.name} unblocked`)
                                            : (lang === 'bn' ? `${u.name} ব্লক হয়েছে` : `${u.name} blocked`),
                                          'success'
                                        );
                                      }}
                                      disabled={!canManageUsers}
                                      title={u.isBlocked ? "Unblock" : "Block"}
                                      className={`p-1.5 rounded-md border transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${u.isBlocked ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100'}`}
                                    >
                                      {u.isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!canDeleteUsers) return denyMsg();
                                        if (confirm(lang === 'bn' ? `"${u.name}"-কে মুছে ফেলবেন?` : `Delete "${u.name}"?`)) {
                                          setSystemEmployees(prev => prev.filter(e => e.id !== u.id));
                                          showToast && showToast(lang === 'bn' ? "ইউজার মুছে ফেলা হয়েছে" : "User deleted", 'success');
                                        }
                                      }}
                                      disabled={!canDeleteUsers}
                                      title={lang === 'bn' ? "মুছুন" : "Delete"}
                                      className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-300">
                      <span>
                        {lang === 'bn'
                          ? `${totalRows === 0 ? 0 : start + 1} থেকে ${Math.min(start + userEntriesLimit, totalRows)} দেখানো হচ্ছে (মোট ${totalRows})`
                          : `Showing ${totalRows === 0 ? 0 : start + 1} to ${Math.min(start + userEntriesLimit, totalRows)} of ${totalRows}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={page <= 1}
                          onClick={() => setUserCurrentPage(page - 1)}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setUserCurrentPage(i + 1)}
                            className={`px-2.5 py-1 rounded border font-bold ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 hover:bg-slate-100'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          disabled={page >= totalPages}
                          onClick={() => setUserCurrentPage(page + 1)}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      </div>
                    </div>
                  </>)}



                  {/* View details modal */}
                  {viewingEmployee && (() => {
                    const live = systemEmployees.find(e => e.id === viewingEmployee.id) || viewingEmployee;
                    return (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingEmployee(null)}>
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold">
                            {(live.name || '?').split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{live.name}</h3>
                            <p className="text-xs opacity-90">{live.role} · {live.branch}</p>
                            <p className="text-[10px] opacity-80 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {lang === 'bn' ? "সর্বশেষ লগইন:" : "Last login:"} <span className="font-bold">{live.lastLogin || (lang === 'bn' ? 'কখনো নয়' : 'Never')}</span>
                            </p>
                          </div>
                          <button onClick={() => setViewingEmployee(null)} className="p-1.5 rounded hover:bg-white/20"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-3 text-sm overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {[
                              ['ID', live.id],
                              [lang === 'bn' ? 'ইউজারনেম' : 'Username', live.username || '—'],
                              ['Email', live.email],
                              [lang === 'bn' ? 'মোবাইল' : 'Phone', live.phone || '—'],
                              [lang === 'bn' ? 'ভূমিকা' : 'Role', live.role],
                              [lang === 'bn' ? 'শাখা' : 'Branch', live.branch],
                              [lang === 'bn' ? 'তৈরি হয়েছে' : 'Created On', live.createdOn || '—'],
                              [lang === 'bn' ? 'সর্বশেষ লগইন' : 'Last Login', live.lastLogin || '—'],
                              [lang === 'bn' ? 'স্ট্যাটাস' : 'Status', live.isBlocked ? (lang === 'bn' ? 'ব্লকড' : 'Blocked') : (lang === 'bn' ? 'সক্রিয়' : 'Active')],
                            ].map(([k, v]) => (
                              <div key={k as string} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k}</span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 text-right">{v as string}</span>
                              </div>
                            ))}
                          </div>

                          {/* Activity / audit log */}
                          <div className="pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                              <Activity size={13} className="text-blue-600" />
                              {lang === 'bn' ? "অ্যাক্টিভিটি লগ" : "Activity / Audit Log"}
                              <span className="text-[10px] font-bold text-slate-400 ml-1">({(live.activityLog || []).length})</span>
                            </h4>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
                              {(!live.activityLog || live.activityLog.length === 0) && (
                                <div className="px-3 py-4 text-center text-xs text-slate-400">
                                  {lang === 'bn' ? "এখনো কোনো কার্যকলাপ নেই" : "No activity yet"}
                                </div>
                              )}
                              {(live.activityLog || []).map((a: any, i: number) => (
                                <div key={i} className="px-3 py-2 flex items-start gap-2 text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{a.action}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{a.at}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 border-t border-slate-100 flex-wrap">
                          {isSuperAdmin && (
                            <button
                              onClick={() => enterUserPortal(live)}
                              className="text-xs font-bold px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-md"
                            >
                              <LogIn size={12} /> {lang === 'bn' ? 'পোর্টালে প্রবেশ করুন' : 'Enter Portal'}
                            </button>
                          )}
                          {canManageUsers && (
                            <button
                              onClick={() => { setEditingEmployee(live); setViewingEmployee(null); setIsAddEmployeeOpen(true); }}
                              className="text-xs font-bold px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                            >
                              <Pencil size={12} /> {lang === 'bn' ? "প্রোফাইল সম্পাদনা" : "Edit Profile"}
                            </button>
                          )}
                          <button
                            onClick={() => setViewingEmployee(null)}
                            className="text-xs font-bold px-4 py-2 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
                          >
                            {lang === 'bn' ? "বন্ধ" : "Close"}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              );
            })()}
            {activeTab === 'installments' && (

              <Installments 
                installments={installments} 
                setInstallments={setInstallments} 
                lang={lang} 
                showToast={showToast} 
                products={products}
                setProducts={setProducts}
                customers={customers}
                setCustomers={setCustomers}
              />
            )}

            {activeTab === 'advance' && (
              <AdvanceBookingPanel
                advanceBookings={advanceBookings}
                setAdvanceBookings={setAdvanceBookings}
                lang={lang}
                showToast={showToast}
                customers={customers}
                products={products}
                setProducts={setProducts}
              />
            )}

            {activeTab === 'quotations' && (
              <Quotations
                quotations={quotations as any}
                setQuotations={setQuotations as any}
                lang={lang}
                showToast={showToast}
                customers={customers}
                products={products}
                isAddQuotationOpen={isAddQuotationOpen}
                setIsAddQuotationOpen={setIsAddQuotationOpen}
                onConvertToSale={(q: any) => {
                  // Convert an accepted quotation into a POS sale without
                  // disturbing existing sales creation logic — build a Sale
                  // shaped payload, push into `sales` state, and enqueue it
                  // for offline-safe Firestore sync.
                  const items = (q.items || []).map((it: any) => ({
                    productName: it.name,
                    quantity: Number(it.qty) || 0,
                    unitPrice: Number(it.price) || 0,
                    discount: Number(it.discount) || 0,
                    totalPrice: Math.max(0, ((Number(it.qty) || 0) * (Number(it.price) || 0)) - (Number(it.discount) || 0)) * (1 + (Number(it.tax) || 0) / 100),
                  }));
                  const totalPrice = Number(q.total) || items.reduce((s: number, it: any) => s + Number(it.totalPrice || 0), 0);
                  const newSale: any = {
                    id: `SL${Date.now()}`,
                    referenceNo: q.id,
                    customerName: q.customerName,
                    date: new Date().toISOString().slice(0, 10),
                    items,
                    quantity: items.reduce((s: number, it: any) => s + Number(it.quantity || 0), 0),
                    totalPrice,
                    totalAmount: totalPrice,
                    paidAmount: totalPrice,
                    paymentStatus: 'PAID',
                    profit: 0,
                    createdBy: (sessionUser && sessionUser.name) || 'admin',
                    convertedFromQuotation: q.id,
                  };
                  setSales((prev: any[]) => [newSale, ...prev]);
                  import('./salesSyncQueue').then(m => m.enqueueSales([newSale])).catch(() => {});
                  showToast(
                    lang === 'bn'
                      ? `কোটেশন ${q.id} সেল-এ রূপান্তরিত হয়েছে`
                      : `Quotation ${q.id} converted to sale`,
                    'success'
                  );
                }}
              />
            )}

            {activeTab === 'purchases' && (
              activeSubTab === 'purchase_price_history' ? (
                <PurchaseHistoryManager
                  lang={lang}
                  products={products as any}
                  suppliers={suppliers as any}
                  showToast={showToast}
                />
              ) : (
                <Purchases
                  purchases={purchases as any}
                  setPurchases={setPurchases as any}
                  products={products as any}
                  setProducts={setProducts as any}
                  suppliers={suppliers}
                  lang={lang}
                  showToast={showToast}
                  shopName={shopName}
                  shopAddress={shopAddress}
                  shopPhone={shopPhone}
                  initialSubTab={activeSubTab}
                />
              )
            )}

            {activeTab === 'accounting' && (
              <Accounting
                sales={sales as any}
                purchases={purchases as any}
                expenses={expenses as any}
                setExpenses={setExpenses as any}
                expenseCategories={expenseCategories}
                customers={customers as any}
                setCustomers={setCustomers as any}
                suppliers={suppliers as any}
                setSuppliers={setSuppliers as any}
                lang={lang}
                showToast={showToast}
                shopName={shopName}
                shopAddress={shopAddress}
                shopPhone={shopPhone}
                initialSubTab={activeSubTab}
              />
            )}






            {(activeTab === 'customers' || activeTab === 'contacts' || (typeof activeTab === 'string' && activeTab.startsWith('contacts-'))) && (
              <Contacts
                initialSubTab={
                  activeTab === 'contacts-customers-list' ? 'customers'
                  : (activeTab === 'contacts-suppliers-list' || activeTab === 'suppliers') ? 'suppliers'
                  : activeTab === 'contacts-import-customers' ? 'contacts-import-customers'
                  : activeTab === 'contacts-import-suppliers' ? 'contacts-import-suppliers'
                  : (activeSubTab === 'contacts_suppliers' || activeSubTab === 'suppliers' || activeSubTab === 'suppliers_list') ? 'suppliers'
                  : activeSubTab === 'contacts_customers' ? 'customers'
                  : activeSubTab === 'contacts_dues' ? 'contacts_dues'
                  : activeSubTab === 'contacts_transactions' ? 'transactions'
                  : (activeSubTab || 'customers')
                }
                setActiveTab={setActiveTab}
                customers={customers as any}
                setCustomers={setCustomers as any}
                suppliers={suppliers as any}
                setSuppliers={setSuppliers as any}
                sales={sales as any}
                purchases={purchases as any}
                showToast={showToast}
                lang={lang}
              />
            )}

            {activeTab === 'stock' && (
              <StockCenter
                lang={lang}
                products={products as any}
                setProducts={setProducts as any}
                sales={sales as any}
                showToast={showToast}
                currentUserEmail={(sessionUser as any)?.email || 'admin'}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpenseCenter
                expenses={expenses as any}
                setExpenses={setExpenses as any}
                expenseCategories={expenseCategories}
                setExpenseCategories={setExpenseCategories as any}
                lang={lang}
                showToast={showToast}
                shopName={shopName}
                shopAddress={shopAddress}
                shopPhone={shopPhone}
              />
            )}

            {activeTab === 'messaging' && (
              <SmsCenter
                lang={lang}
                customers={customers as any}
                suppliers={suppliers as any}
                shopName={shopName}
                shopPhone={shopPhone}
                userRole={sessionUser?.role}
                userName={sessionUser?.name || sessionUser?.username || 'System'}
                showToast={showToast}
              />
            )}

            
            {(activeTab === 'settings' || activeTab === 'helpdesk') && (
              <ComponentErrorBoundary>
                {(activeSubTab === 'system' || settingsActiveTab === 'system') ? (
                  <SiteSettings
                    lang={lang}
                    sysTimezone={sysTimezone}
                    setSysTimezone={setSysTimezone}
                    sysDateFormat={sysDateFormat}
                    setSysDateFormat={setSysDateFormat}
                    sysTimeFormat={sysTimeFormat}
                    setSysTimeFormat={setSysTimeFormat}
                    sysCurrency={sysCurrency}
                    setSysCurrency={setSysCurrency}
                    sysCurrencyPlacement={sysCurrencyPlacement}
                    setSysCurrencyPlacement={setSysCurrencyPlacement}
                    sysDecimals={sysDecimals}
                    setSysDecimals={setSysDecimals}
                    sysDecimalsQty={sysDecimalsQty}
                    setSysDecimalsQty={setSysDecimalsQty}
                    sysLanguage={sysLanguage}
                    setSysLanguage={setSysLanguage}
                    sysEnableRoundOff={sysEnableRoundOff}
                    setSysEnableRoundOff={setSysEnableRoundOff}
                    showToast={showToast}
                    sessionUser={sessionUser}
                  />
                ) : (activeSubTab === 'support' || activeSubTab === 'helpdesk' || settingsActiveTab === 'support' || activeTab === 'helpdesk') ? (
                  <CustomerSupportDesk
                    lang={lang}
                    showToast={showToast}
                    userName={sessionUser?.name}
                    shopName={shopName}
                  />
                ) : (
                  <StoreSettings
                    lang={lang}
                    shopName={shopName}
                    setShopName={setShopName}
                    shopAddress={shopAddress}
                    setShopAddress={setShopAddress}
                    shopPhone={shopPhone}
                    setShopPhone={setShopPhone}
                    storeCode={storeCode}
                    setStoreCode={setStoreCode}
                    storeEmail={storeEmail}
                    setStoreEmail={setStoreEmail}
                    gstNumber={gstNumber}
                    setGstNumber={setGstNumber}
                    taxNumber={taxNumber}
                    setTaxNumber={setTaxNumber}
                    storeWebsite={storeWebsite}
                    setStoreWebsite={setStoreWebsite}
                    bankDetails={bankDetails}
                    setBankDetails={setBankDetails}
                    storeCountry={storeCountry}
                    setStoreCountry={setStoreCountry}
                    storeCity={storeCity}
                    setStoreCity={setStoreCity}
                    logoPreview={logoPreview}
                    storeFontSize={storeFontSize}
                    setStoreFontSize={setStoreFontSize}
                    setLogoPreview={setLogoPreview}
                    showToast={showToast}
                  />
                )}
              </ComponentErrorBoundary>
            )}

            {activeTab === 'reports' && (
              <ComponentErrorBoundary>
                <ReportCenter
                lang={lang}
                activeSubTab={activeSubTab || 'rep_sales'}
                customers={customers as any}
                suppliers={suppliers as any}
                sales={sales as any}
                products={products as any}
                purchases={purchases as any}
                expenses={expenses as any}
                userRole={sessionUser?.role}
                />
              </ComponentErrorBoundary>
            )}

            {activeTab === 'ai_intelligence' && (
              <ComponentErrorBoundary>
                <AiSmartIntelligence
                  products={products as any}
                  sales={sales as any}
                  customers={customers as any}
                  lang={lang}
                  showToast={showToast}
                  onNavigateTab={(t, s) => {
                    setActiveTab(t);
                    if (s) setActiveSubTab(s);
                  }}
                />
              </ComponentErrorBoundary>
            )}
        </>
      )}
    </>
  );
})()}
          </main>
        </div>
      </div>
      <BarcodeScannerModal
        isOpen={isInventoryScannerOpen}
        onClose={function() { setIsInventoryScannerOpen(false); }}
        onScan={handleInventoryBarcodeScan}
        lang={lang}
      />
      <CreateUserForm
        isOpen={isAddEmployeeOpen}
        onClose={() => { setIsAddEmployeeOpen(false); setEditingEmployee(null); }}
        lang={lang}
        editingEmployee={editingEmployee}
        onSave={(emp) => {
          const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
          if (editingEmployee) {
            setSystemEmployees(prev => prev.map(e => e.id === editingEmployee.id ? {
              ...e,
              ...emp,
              activityLog: [{ at: stamp, action: `Profile updated by ${sessionUser.name}` }, ...(e.activityLog || [])].slice(0, 25),
            } : e));
            showToast && showToast(lang === 'bn' ? "ইউজার প্রোফাইল আপডেট হয়েছে" : "User profile updated", 'success');
          } else {
            const newId = "EMP-" + String(systemEmployees.length + 1).padStart(2, '0');
            setSystemEmployees(prev => [...prev, {
              id: newId,
              ...emp,
              lastLogin: '—',
              activityLog: [{ at: stamp, action: `Account created by ${sessionUser.name}` }],
            }]);
            showToast && showToast(lang === 'bn' ? "নতুন ইউজার যোগ হয়েছে" : "User created", 'success');
          }
          setEditingEmployee(null);
        }}
      />

      {/* ── DEDICATED ADD PRODUCT / SERVICE MODAL ── */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-6 animate-in fade-in duration-150 text-left">
            {/* Dedicated Dynamic Header */}
            <div className={`${newProdItemType === 'SERVICE' ? 'bg-[#00a65a]' : 'bg-[#00c0ef]'} text-white px-6 py-4 flex items-center justify-between shadow-md`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{newProdItemType === 'SERVICE' ? '🛠️' : '📦'}</span>
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    {newProdItemType === 'SERVICE' 
                      ? (lang === 'bn' ? 'নতুন সার্ভিস যোগ করুন' : 'Create New Service') 
                      : (lang === 'bn' ? 'নতুন পণ্য / আইটেম যোগ করুন' : 'Create New Product')}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium">
                    {newProdItemType === 'SERVICE'
                      ? (lang === 'bn' ? 'দোকানের মেকানিক বা সার্ভিসিং কাজের নাম ও নির্দিষ্ট ফি যুক্ত করুন' : 'Set repair service catalog name and fixed fee')
                      : (lang === 'bn' ? 'দোকানের নতুন মালামালের নাম, কেনাদাম, বেচাদাম ও স্টক যোগ করুন' : 'Add new physical item with cost, selling price and stock')}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddProductOpen(false)} 
                className="text-white/80 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/20 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-5 font-sans">
              {newProdItemType === 'SERVICE' ? (
                /* ── Tailored Service Entry Form ── */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'bn' ? 'সার্ভিসিং কাজের নাম (আবশ্যক)' : 'Service Name (Required)'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'bn' ? "যেমন: মোবাইল ডিসপ্লে পরিবর্তন (Display Replacement)" : "e.g. Display Replacement"}
                      value={newProdName}
                      onChange={e => setNewProdName(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'সার্ভিস ক্যাটাগরি / বিভাগ' : 'Service Category'}
                      </label>
                      <select
                        value={newProdCategory}
                        onChange={e => setNewProdCategory(e.target.value)}
                        className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                      >
                        <option value="Hardware">Hardware (হার্ডওয়্যার মেরামতি)</option>
                        <option value="Software">Software (সফটওয়্যার ও ফ্ল্যাশিং)</option>
                        <option value="Servicing">General Servicing (সাধারণ ওয়াশ/ক্লিনিং)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'সার্ভিস চার্জ / ফি (৳) (আবশ্যক)' : 'Service Fee (৳) (Required)'} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={newProdSelPrice || ''}
                        onChange={e => setNewProdSelPrice(parseFloat(e.target.value) || 0)}
                        className="w-full h-10 px-3 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'bn' ? 'কাজের বিবরণ বা সময় (ঐচ্ছিক)' : 'Service Description / Time (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? "যেমন: আনুমানিক সময় ৩০ মিনিট, অরিজিনাল পার্টস" : "e.g. Estimated time 30 mins"}
                      value={newProdDescription}
                      onChange={e => setNewProdDescription(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00a65a]"
                    />
                  </div>
                </div>
              ) : (
                /* ── Tailored Physical Product Entry Form ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'পণ্যের নাম (আবশ্যক)' : 'Product Name (Required)'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'bn' ? "যেমন: Xiaomi Redmi Note 13" : "e.g. Xiaomi Redmi Note 13"}
                        value={newProdName}
                        onChange={e => setNewProdName(e.target.value)}
                        className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                        </label>
                        <select
                          value={newProdCategory}
                          onChange={e => setNewProdCategory(e.target.value)}
                          className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        >
                          {categoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'ব্র্যান্ড' : 'Brand'}
                        </label>
                        <select
                          value={newProdBrand}
                          onChange={e => setNewProdBrand(e.target.value)}
                          className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        >
                          {brandsList.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'একক (Unit)' : 'Unit'}
                        </label>
                        <select
                          value={newProdUnit}
                          onChange={e => setNewProdUnit(e.target.value)}
                          className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        >
                          <option value="PCS">PCS (পিস)</option>
                          <option value="BOX">BOX (বক্স)</option>
                          <option value="SET">SET (সেট)</option>
                          <option value="KG">KG (কেজি)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'বারকোড / SKU' : 'Barcode / SKU'}
                        </label>
                        <input
                          type="text"
                          placeholder="অটো জেনারেট হবে"
                          value={newProdSKU}
                          onChange={e => setNewProdSKU(e.target.value)}
                          className="w-full h-10 px-3 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'ক্রয় মূল্য (৳)' : 'Purchase Price (৳)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newProdPurPrice || ''}
                          onChange={e => setNewProdPurPrice(parseFloat(e.target.value) || 0)}
                          className="w-full h-10 px-3 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'বিক্রয় মূল্য (৳) *' : 'Selling Price (৳) *'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={newProdSelPrice || ''}
                          onChange={e => setNewProdSelPrice(parseFloat(e.target.value) || 0)}
                          className="w-full h-10 px-3 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'প্রারম্ভিক স্টক পরিমণ' : 'Opening Stock Qty'}
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={newProdStock || ''}
                          onChange={e => setNewProdStock(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'স্টক সতর্কতা পরিমাণ' : 'Stock Alert Qty'}
                        </label>
                        <input
                          type="number"
                          placeholder="5"
                          value={newProdAlertQty || ''}
                          onChange={e => setNewProdAlertQty(parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 text-xs font-bold font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'বিবরণ / নোট (ঐচ্ছিক)' : 'Description / Notes (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? "পণ্যের বিবরণ বা ওয়ারেন্টি তথ্য..." : "Item specs or warranty notes..."}
                        value={newProdDescription}
                        onChange={e => setNewProdDescription(e.target.value)}
                        className="w-full h-10 px-3 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00c0ef]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 ${newProdItemType === 'SERVICE' ? 'bg-[#00a65a] hover:bg-[#008d4c]' : 'bg-[#00c0ef] hover:bg-[#00a7d0]'} text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5`}
                >
                  <Check size={16} />
                  {newProdItemType === 'SERVICE' 
                    ? (lang === 'bn' ? 'সার্ভিস সংরক্ষণ করুন' : 'Save Service') 
                    : (lang === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FAST ADD CUSTOMER MODAL (From POS & Header) ── */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150 text-left">
            <div className="bg-[#188038] text-white px-6 py-4 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                👤 {lang === 'bn' ? 'নতুন গ্রাহক যোগ করুন' : 'Register New Customer'}
              </span>
              <button type="button" onClick={() => setIsAddCustomerOpen(false)} className="text-white/80 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/20">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'গ্রাহকের নাম (আবশ্যক)' : 'Customer Name (Required)'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? "যেমন: সাকিব হাসান" : "e.g. Shakib Al Hasan"}
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#188038]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর (আবশ্যক)' : 'Mobile Phone (Required)'} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01700000000"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#188038]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    placeholder="customer@domain.com"
                    value={newCustEmail}
                    onChange={e => setNewCustEmail(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#188038]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পূর্ববর্তী বকেয়া (যদি থাকে)' : 'Opening Due Amount (If any)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newCustDue || ''}
                    onChange={e => setNewCustDue(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#188038]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#188038] hover:bg-[#137333] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={15} />
                  {lang === 'bn' ? 'গ্রাহক সংরক্ষণ করুন' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM SUBSCRIPTION DATE MODAL ── */}
      {customDateModalOwner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
            <div className="bg-[#1a73e8] text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">📅 {lang === 'bn' ? 'কাস্টম মেয়াদ নির্ধারণ' : 'Custom Expiry Date Picker'}</span>
              <button type="button" onClick={() => setCustomDateModalOwner(null)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                <p className="font-bold text-slate-800 dark:text-white">{customDateModalOwner.shopName || customDateModalOwner.branch}</p>
                <p className="text-[#5f6368] dark:text-slate-400 mt-0.5">👤 {customDateModalOwner.name} ({customDateModalOwner.email})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{lang === 'bn' ? 'নতুন মেয়াদ শেষের তারিখ' : 'Select Expiration Date'}</label>
                <input type="date" value={customExpiryDateVal} onChange={e => setCustomExpiryDateVal(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setCustomDateModalOwner(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button type="button" onClick={() => {
                  if (!customExpiryDateVal) return;
                  setSystemEmployees(prev => prev.map(u => (u.shopName === customDateModalOwner.shopName || u.id === customDateModalOwner.id)
                    ? { ...u, subscriptionExpiry: customExpiryDateVal, planType: 'Custom Expiry Plan', isBlocked: false, status: 'Active' } : u));
                  showToast(lang === 'bn' ? `মেয়াদ ${customExpiryDateVal} পর্যন্ত আপডেট করা হয়েছে!` : `Expiry set to ${customExpiryDateVal}`, 'success');
                  setCustomDateModalOwner(null);
                }} className="flex-1 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold shadow-md">
                  ✓ {lang === 'bn' ? 'তারিখ আপডেট করুন' : 'Save Expiry Date'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION BILL LOG & PAYMENT RECORD MODAL ── */}
      {paymentHistoryOwner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-4 animate-in fade-in duration-150">
            <div className="bg-[#188038] text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">💳 {lang === 'bn' ? 'পেমেন্ট ও বিলিং হিস্ট্রি' : 'Subscription Billing & Payment Log'}</span>
              <button type="button" onClick={() => setPaymentHistoryOwner(null)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="bg-[#e6f4ea] dark:bg-emerald-950/40 p-3 rounded-xl border border-[#a8dab5] dark:border-emerald-900/40 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#137333] dark:text-emerald-300 text-sm">{paymentHistoryOwner.shopName || paymentHistoryOwner.branch}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">Owner: {paymentHistoryOwner.name} ({paymentHistoryOwner.phone || paymentHistoryOwner.email})</p>
                </div>
                <span className="bg-[#188038] text-white px-2.5 py-1 rounded-md text-[10px] font-bold">
                  {paymentHistoryOwner.planType || 'Active'}
                </span>
              </div>

              {/* Record New Payment Form */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">➕ {lang === 'bn' ? 'নতুন পেমেন্ট বা বিল এন্টি দিন' : 'Record New Subscription Payment'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{lang === 'bn' ? 'টাকার পরিমাণ (TK)' : 'Amount (TK)'}</label>
                    <input type="number" step="0.01" placeholder="1000.00" value={newPayAmount} onChange={e => setNewPayAmount(e.target.value)}
                      className="w-full h-8 px-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</label>
                    <select value={newPayMethod} onChange={e => setNewPayMethod(e.target.value)}
                      className="w-full h-8 px-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none">
                      {['bKash', 'Nagad', 'Bank Transfer', 'Cash', 'Rocket'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{lang === 'bn' ? 'নোট/বিবরণ' : 'Note/Period'}</label>
                  <input type="text" placeholder="Monthly renewal payment..." value={newPayNote} onChange={e => setNewPayNote(e.target.value)}
                    className="w-full h-8 px-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none" />
                </div>
                <button type="button" onClick={addSubscriptionPaymentRecord}
                  className="w-full py-1.5 bg-[#188038] hover:bg-[#137333] text-white font-bold text-xs rounded-lg transition shadow-xs">
                  ✓ {lang === 'bn' ? 'পেমেন্ট এনট্রি সেভ করুন' : 'Save Payment Record'}
                </button>
              </div>

              {/* Payment History List */}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">📜 {lang === 'bn' ? 'পূর্ববর্তী পেমেন্ট হিস্ট্রি' : 'Payment History Logs'}</p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-950">
                  {(!paymentHistoryOwner.paymentHistory || paymentHistoryOwner.paymentHistory.length === 0) ? (
                    <p className="text-xs text-slate-400 text-center py-4">{lang === 'bn' ? 'কোনো পেমেন্ট রেকর্ড নেই' : 'No payments logged yet'}</p>
                  ) : paymentHistoryOwner.paymentHistory.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center py-1.5 text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">৳{p.amount.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">({p.method})</span></p>
                        <p className="text-[10px] text-slate-400">{p.note || 'Subscription'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{p.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-4">
              <button type="button" onClick={() => setPaymentHistoryOwner(null)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KEYBOARD SHORTCUTS CHEATSHEET MODAL ── */}
      {isKeyboardShortcutsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsKeyboardShortcutsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150 text-left" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⌨️</span>
                <h2 className="font-bold text-base">{lang === 'bn' ? 'কিবোর্ড শর্টকাট গাইডসমূহ' : 'Keyboard Shortcuts Guide'}</h2>
              </div>
              <button type="button" onClick={() => setIsKeyboardShortcutsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto font-sans">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 text-xs">
                <p className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  💡 {lang === 'bn' ? 'কুইক নলেজ টিপস:' : 'Quick Navigation Tip:'}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                  {lang === 'bn' ? 'ক্যাশে মাউস ছাড়া দ্রুত কাজ করতে স্ক্রিনের যেকোনো স্থান থেকে Alt + M চাপুন।' : 'Press Alt + M anywhere to focus the sidebar keyboard navigation.'}
                </p>
              </div>

              {/* Navigation Shortcuts */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">{lang === 'bn' ? 'সাইডবার মেনু নেভিগেশন' : 'Sidebar Menu Navigation'}</h3>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'bn' ? 'সাইডবার মেনু ফোকাস' : 'Focus Sidebar Menu'}</span>
                    <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-white">Alt + M</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'bn' ? 'পরবর্তী মেনুতে যাওয়া' : 'Next Menu Item'}</span>
                    <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-white">↓ (Down Arrow)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'bn' ? 'আগের মেনুতে যাওয়া' : 'Previous Menu Item'}</span>
                    <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-white">↑ (Up Arrow)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'bn' ? 'ড্রপডাউন খোলা / পেজ সিলেক্ট' : 'Expand Dropdown / Open Page'}</span>
                    <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-white">→ / Enter</span>
                  </div>
                </div>
              </div>

              {/* POS Shortcuts */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">{lang === 'bn' ? 'ক্যাশ রেজিস্টার ও সেলস' : 'Cash Register & Sales'}</h3>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{lang === 'bn' ? 'POS ক্যাশ কাউন্টারে যাওয়া' : 'Open POS Counter'}</span>
                    <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold">F2</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsKeyboardShortcutsModalOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বন্ধ করুন' : 'Close Guide'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPER ADMIN PASSWORD RESET & RECOVERY MODAL ── */}
      {passwordResetUser && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPasswordResetUser(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <Key className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {lang === 'bn' ? 'পাসওয়ার্ড রিসেট ও রিকভারি' : 'Password Reset & Recovery'}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-0.5">
                    {lang === 'bn' ? 'সুপার এডমিন রিকভারি প্যানেল' : 'Super Admin Recovery Portal'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordResetUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* User Details Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'bn' ? 'ইউজার নাম' : 'User Name'}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{passwordResetUser.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'bn' ? 'ইমেইল / পরিচিতি' : 'Email / Handle'}</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{passwordResetUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'bn' ? 'দোকান / ব্রাঞ্চ' : 'Shop / Branch'}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{passwordResetUser.branch || passwordResetUser.shopName || 'Main Store'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'bn' ? 'রোল' : 'Role'}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{passwordResetUser.role}</span>
                </div>
              </div>

              {/* New Password Input with Eye Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন *' : 'Set New Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={autoGenerateRandomPassword}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>{lang === 'bn' ? 'অটো জেনারেট' : 'Auto Generate'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showResetEye ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full pl-4 pr-24 py-3 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-850 focus:border-purple-600 focus:outline-none shadow-sm"
                    placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন...' : 'Enter new password...'}
                    required
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowResetEye(!showResetEye)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showResetEye ? (lang === 'bn' ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (lang === 'bn' ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                    >
                      {showResetEye ? <EyeOff size={16} className="text-purple-600" /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(resetNewPassword);
                          showToast && showToast(lang === 'bn' ? 'পাসওয়ার্ড কপি করা হয়েছে!' : 'Password copied!', 'info');
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                      title={lang === 'bn' ? 'পাসওয়ার্ড কপি করুন' : 'Copy Password'}
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveResetPassword}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{lang === 'bn' ? 'পাসওয়ার্ড সেভ ও আপডেট করুন' : 'Save & Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    )}
    </div>
  );
}
