// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  AlertCircle,
  PackagePlus,
  Sparkles,
  Loader2,
  Download,
  ChevronDown,
  Printer,
  Tag
} from 'lucide-react';

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockLevel, setSelectedStockLevel] = useState('ALL'); // ALL, LOW, OUT, NORMAL

  // Form modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Thermal Barcode Sticker state
  const [stickerProduct, setStickerProduct] = useState<Product | null>(null);
  const [stickerCopies, setStickerCopies] = useState<number>(5);
  const [stickerFormat, setStickerFormat] = useState<'thermal_50x25' | 'thermal_38x25' | 'thermal_80mm'>('thermal_50x25');

  // Form fields state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState('টি (Pcs)');

  // Unit list and Add Unit Modal state
  const [unitsList, setUnitsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('rony_telecom_units');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return [
      'টি (Pcs)',
      'কেজি (Kg)',
      'পিস (Piece)',
      'লিটার (Litre)',
      'বক্স (Box)',
      'ফুট (Feet)'
    ];
  });
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');

  const saveUnitsList = (newList: string[]) => {
    setUnitsList(newList);
    localStorage.setItem('rony_telecom_units', JSON.stringify(newList));
  };

  const [aiPredictLoading, setAiPredictLoading] = useState(false);
  const [aiPredictResult, setAiPredictResult] = useState<{ suggestedPrice: number; reasoning: string } | null>(null);

  const testAiPricing = async () => {
    if (!name || purchasePrice <= 0) {
      alert("দয়াকরে প্রথমে পণ্যের নাম এবং ক্রয়মূল্য ইনপুট দিন!");
      return;
    }
    setAiPredictLoading(true);
    setAiPredictResult(null);
    try {
      const res = await fetch('/api/ai/product-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, costPrice: purchasePrice })
      });
      if (!res.ok) throw new Error("এআই মূল্য নির্ধারণ ব্যর্থ হয়েছে।");
      const data = await res.json();
      setAiPredictResult(data);
    } catch (err) {
      console.error(err);
      const fallbackPrice = Math.round(purchasePrice * 1.20);
      setAiPredictResult({
        suggestedPrice: fallbackPrice,
        reasoning: "লোকাল অফলাইন মোডে ২০% প্রফিট মার্জিন ধরে এই মূল্য সাজেস্ট করা হয়েছে।"
      });
    } finally {
      setAiPredictLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`PRD-${Math.floor(100000 + Math.random() * 900000)}`); // Auto-generate SKU
    setCategory('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setStock(10);
    setUnit('টি (Pcs)');
    setAiPredictResult(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setPurchasePrice(product.purchasePrice);
    setSellingPrice(product.sellingPrice);
    setStock(product.stock);
    setUnit(product.unit);
    setAiPredictResult(null);
    setIsModalOpen(true);
  };

  // Submit product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !category || purchasePrice <= 0 || sellingPrice <= 0) {
      alert("অনুগ্রহ করে সকল সঠিক তথ্য পূরণ করুন।");
      return;
    }

    const payload = {
      name,
      sku,
      category,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock),
      unit
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }
    setIsModalOpen(false);
  };

  // Delete product
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে পণ্য "${name}" ডিলিট করতে চান?`)) {
      await deleteProduct(id);
    }
  };

  // Filter logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (selectedStockLevel === 'OUT') {
      matchesStock = p.stock === 0;
    } else if (selectedStockLevel === 'LOW') {
      matchesStock = p.stock > 0 && p.stock <= 5;
    } else if (selectedStockLevel === 'NORMAL') {
      matchesStock = p.stock > 5;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Export currently filtered products to CSV for inventory auditing using XLSX
  const exportToCSV = () => {
    if (filteredProducts.length === 0) {
      alert("ডাউনলোড করার জন্য ফিল্টারকৃত কোন পণ্য পাওয়া যায়নি!");
      return;
    }

    // Map filtered products to structured columns for auditing
    const dataToExport = filteredProducts.map((p, index) => ({
      'ক্রমিক নং (SL No)': index + 1,
      'পণ্যের নাম (Product Name)': p.name,
      'SKU / বারকোড (SKU/Barcode)': p.sku,
      'ক্যাটাগরি (Category)': p.category || 'N/A',
      'ক্রয়মূল্য (Purchase Price ৳)': p.purchasePrice,
      'বিক্রয়মূল্য (Selling Price ৳)': p.sellingPrice,
      'প্রত্যাশিত লাভ (Est. Profit ৳)': p.sellingPrice - p.purchasePrice,
      'স্টক কোয়ান্টিটি (Stock Quantity)': p.stock,
      'পরিমাপক একক (Unit)': p.unit,
      'স্টকের অবস্থা (Stock Status)': p.stock === 0 ? 'স্টক শেষ (Out of Stock)' : (p.stock <= 5 ? 'সীমিত স্টক (Low Stock)' : 'পর্যাপ্ত স্টক (In Stock)')
    }));

    // Create a worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Generate CSV string
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    // Prepend UTF-8 BOM so Bangla displays correctly in MS Excel and other office suites
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_inventory_report.csv');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header section with add and download buttons - Designed identically to high-end enterprise dashboards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">পণ্য তালিকা ও ইনভেন্টরি</h2>
          <p className="text-slate-500 text-xs mt-1">পণ্য সংরক্ষণ করুন, দাম নির্ধারণ করুন এবং মেয়াদোত্তর স্টক ট্র্যাক করুন।</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Download CSV button with modern outline style */}
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-none border border-slate-250 text-slate-700 bg-white hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition duration-155 cursor-pointer"
            title="বর্তমানে ফিল্টার করা পণ্য তালিকা এক্সেল বা স্প্রেডশিটে ব্যবহারের জন্য নামান"
          >
            <Download size={14} className="text-slate-500" />
            <span>CSV ডাউনলোড</span>
          </button>

          {/* New product solid primary blue action button */}
          <button
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-none justify-center bg-blue-600 hover:bg-blue-700 font-bold px-4 py-2.5 rounded-xl text-white text-xs flex items-center gap-2 shadow-sm shadow-blue-500/10 active:scale-95 transition duration-150 cursor-pointer text-center"
          >
            <Plus size={16} />
            <span>+ নতুন পণ্য যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Persistent Prominent Real-time Search & Filtering Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search size={16} className="text-blue-500" />
          </span>
          <input
            type="text"
            id="persistent-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্যের নাম অথবা SKU/বারকোড দিয়ে রিয়েল-টাইমে খুঁজুন..."
            className="w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white duration-150 transition-all font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters control row underneath the search bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">ক্যাটাগরি ফিল্টার</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 duration-150 cursor-pointer"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock state filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">স্টক মাত্রা ফিল্টার</span>
            <select
              value={selectedStockLevel}
              onChange={(e) => setSelectedStockLevel(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 duration-150 cursor-pointer"
            >
              <option value="ALL">সকল স্টক লেভেল</option>
              <option value="LOW">সীমিত স্টক (১-৫)</option>
              <option value="OUT">স্টক আউট (০)</option>
              <option value="NORMAL">পর্যাপ্ত স্টক (&gt;৫)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main product log list table - Exquisite corporate look */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-500">
            <thead className="text-slate-700 bg-slate-50/50 border-b border-slate-150 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">পণ্যের নাম / SKU</th>
                <th className="px-6 py-4">ক্যাটাগরি</th>
                <th className="px-6 py-4">ক্রয়মূল্য (৳)</th>
                <th className="px-6 py-4">বিক্রয়মূল্য (৳)</th>
                <th className="px-6 py-4">প্রত্যাশিত লাভ (৳)</th>
                <th className="px-6 py-4 text-center">স্টক কোয়ান্টিটি</th>
                <th className="px-6 py-4 text-center">অবস্থা</th>
                <th className="px-6 py-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const estProfit = p.sellingPrice - p.purchasePrice;
                  
                  // Color conditions for stock badges reflecting screenshot design
                  let badgeBg = 'bg-emerald-50/70 text-emerald-600 border-emerald-200/80';
                  let statusText = 'পর্যাপ্ত স্টক';
                  
                  if (p.stock === 0) {
                    badgeBg = 'bg-rose-50/70 text-rose-600 border-rose-200';
                    statusText = 'স্টক শেষ';
                  } else if (p.stock <= 5) {
                    badgeBg = 'bg-amber-50/70 text-amber-600 border-amber-200';
                    statusText = 'সীমিত স্টক';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 duration-150 group transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-[13px] leading-tight">
                          {p.name}
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 block bg-slate-100/90 border border-slate-200/40 px-2 py-0.5 rounded-md w-max mt-1 font-semibold">
                          {p.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 font-medium">
                          {p.category || 'অসংজ্ঞায়িত'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium text-[12.5px]">৳{p.purchasePrice}</td>
                      <td className="px-6 py-4 text-slate-900 font-bold text-[12.5px]">৳{p.sellingPrice}</td>
                      <td className="px-6 py-4 text-emerald-655 font-bold text-[12.5px]">৳{estProfit}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800 text-[12.5px]">
                        {p.stock} <span className="text-[10px] font-medium text-slate-400 ml-0.5">({p.unit || 'টি (Pcs)'})</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border tracking-wide uppercase ${badgeBg}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 matches-action">
                          {/* Quick Thermal Sticker button */}
                          <button
                            onClick={() => {
                              setStickerProduct(p);
                              setStickerCopies(Math.max(1, p.stock || 5));
                            }}
                            className="p-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:border-emerald-300 rounded-lg border border-emerald-200 transition duration-150 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                            title="থার্মাল বারকোড স্টিকার প্রিন্ট করুন"
                          >
                            <Printer size={11} className="text-emerald-600" />
                            <span>স্টিকার</span>
                          </button>

                          {/* Fine custom Edit button */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 px-3 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-650 hover:border-blue-200 rounded-lg border border-slate-200 transition duration-150 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Edit size={11} className="text-slate-400 group-hover:text-blue-500" />
                            <span>এডিট</span>
                          </button>
                          
                          {/* Fine custom Delete button */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 px-3 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 hover:border-rose-200 rounded-lg border border-slate-200 transition duration-150 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Trash2 size={11} className="text-slate-400 group-hover:text-rose-500" />
                            <span>ডিলিট</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-450 text-xs font-medium">
                    কোন পণ্য পাওয়া যায়নি। নতুন পণ্য তালিকা যোগ করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable modal backdrop for CRUD form (In Bangla) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <PackagePlus size={20} className="text-blue-600" />
                {editingProduct ? 'পণ্যের তথ্য এডিট' : 'নতুন পণ্য সংযুক্তিকরণ'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-200 duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">পণ্যের নাম *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="যেমনঃ স্যামসাং এস২৩ প্লাস ডার্ক চেরি"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* SKU Code */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">SKU কোড / বারকোড *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    placeholder="PRD-XXXXXX"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ক্যাটাগরি *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    placeholder="যেমনঃ মোবাইল, ল্যাপটপ, এক্সেসরিজ"
                    list="category-suggestions"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((cat, i) => (
                      <option key={i} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    required
                    min={0}
                    placeholder="যেমনঃ ৪৫০০০"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">বিক্রয়মূল্য (৳) *</label>
                  <input
                    type="number"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    required
                    min={0}
                    placeholder="যেমনঃ ৫২০০০"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* AI Margin Assistant Block */}
                <div className="col-span-1 md:col-span-2 py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1 leading-none">
                      <Sparkles size={12} className="text-amber-500 animate-pulse" />
                      এআই মার্জিন সাজেসশন হেল্পার
                    </span>
                    <button
                      type="button"
                      onClick={testAiPricing}
                      disabled={aiPredictLoading || !name || purchasePrice <= 0}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white cursor-pointer flex items-center gap-1 duration-150 active:scale-95 disabled:opacity-50 select-none shadow-xs"
                    >
                      {aiPredictLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      এআই অ্যানালাইসিস
                    </button>
                  </div>
                  
                  {aiPredictResult ? (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 text-[11px] space-y-1.5 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          ম্যাক্সিমাম রিটেল প্রাইজ: <span className="text-amber-600 dark:text-amber-400 font-bold font-mono text-xs ml-0.5">৳{aiPredictResult.suggestedPrice}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSellingPrice(aiPredictResult.suggestedPrice);
                            setAiPredictResult(null);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold cursor-pointer duration-100"
                        >
                          এপ্লাই করুন
                        </button>
                      </div>
                      <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                        {aiPredictResult.reasoning}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      * নাম এবং ক্রয়মূল্য দেওয়ার পর 'এআই অ্যানালাইসিস' ক্লিক করলে লাভজনক প্রাইজ মার্জিন হিসেব করে দেবে।
                    </p>
                  )}
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">স্টক পরিমাণ *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    min={0}
                    placeholder="যেমনঃ ২৫"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Unit type select */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">পরিমাপক একক (Unit) *</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {unitsList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddUnitOpen(true)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-blue-600 font-bold text-lg flex items-center justify-center cursor-pointer aspect-square shadow-2xs transition-all active:scale-95 select-none"
                      style={{ height: '42px', width: '42px' }}
                      title="Add Custom Unit"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition-colors font-medium"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                >
                  {editingProduct ? 'আপডেট সংরক্ষণ' : 'পণ্য যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal - styled exactly like the first user reference image */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-[320px] shadow-[0_15px_45px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden text-slate-800 animate-fadeIn">
            
            {/* Header: Teal-to-blue gradient matching the image */}
            <div className="bg-gradient-to-r from-[#17a2b8] to-[#0176d3] px-4.5 py-3.5 flex items-center justify-between text-white font-semibold">
              <span className="text-[17px] font-medium tracking-wide">Add Unit</span>
              <button
                type="button"
                onClick={() => setIsAddUnitOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4.5 space-y-4">
              <div>
                <label className="block text-slate-800 font-bold text-sm mb-1.5 font-sans">
                  Unit Name*
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder=""
                  className="w-full border border-slate-300 rounded-[4px] px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold text-sm mb-1.5 font-sans">
                  Description
                </label>
                <textarea
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-[4px] px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 resize-y"
                />
              </div>
            </div>

            {/* Footer with action buttons identical to reference */}
            <div className="p-3.5 border-t border-slate-100 flex justify-end gap-2.5 bg-white">
              <button
                type="button"
                onClick={() => setIsAddUnitOpen(false)}
                className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmedName = newUnitName.trim();
                  if (!trimmedName) {
                    alert("Please enter a valid Unit Name");
                    return;
                  }
                  if (unitsList.includes(trimmedName)) {
                    setUnit(trimmedName);
                  } else {
                    const updated = [...unitsList, trimmedName];
                    saveUnitsList(updated);
                    setUnit(trimmedName);
                  }
                  setNewUnitName('');
                  setNewUnitDesc('');
                  setIsAddUnitOpen(false);
                }}
                className="bg-[#008d44] hover:bg-[#00733e] text-white px-4.5 py-1.5 rounded-[4px] font-medium text-[13px] transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Thermal Barcode Sticker Print Modal */}
      {stickerProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #printable-quick-sticker, #printable-quick-sticker * { visibility: visible !important; }
              #printable-quick-sticker {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: ${
                  stickerFormat === 'thermal_50x25' ? '50mm' :
                  stickerFormat === 'thermal_38x25' ? '38mm' : '80mm'
                } !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: white !important;
              }
              .quick-sticker-unit {
                page-break-after: ${stickerFormat !== 'thermal_80mm' ? 'always' : 'auto'} !important;
                break-after: ${stickerFormat !== 'thermal_80mm' ? 'page' : 'auto'} !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              @page {
                size: ${
                  stickerFormat === 'thermal_50x25' ? '50mm 25mm' :
                  stickerFormat === 'thermal_38x25' ? '38mm 25mm' : '80mm auto'
                };
                margin: 0;
              }
            }
          `}</style>

          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center print:hidden">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <Printer size={18} className="text-emerald-600" />
                🏷️ থার্মাল বারকোড স্টিকার প্রিন্ট
              </h3>
              <button 
                onClick={() => setStickerProduct(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 print:p-0">
              {/* Product Info (Screen only) */}
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900 print:hidden">
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">নির্বাচিত পণ্য:</p>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{stickerProduct.name}</div>
                <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  SKU: {stickerProduct.sku || stickerProduct.id} | মূল্য: ৳{stickerProduct.sellingPrice} | স্টক: {stickerProduct.stock} {stickerProduct.unit || 'Pcs'}
                </div>
              </div>

              {/* Print Controls (Screen only) */}
              <div className="grid grid-cols-2 gap-3 print:hidden">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">কপি সংখ্যা (স্টিকার পরিমাণ)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={stickerCopies}
                    onChange={(e) => setStickerCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">প্রিন্টার পেপার সাইজ</label>
                  <select
                    value={stickerFormat}
                    onChange={(e) => setStickerFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="thermal_50x25">🏷️ থার্মাল রোল (৫০x২৫ মিমি)</option>
                    <option value="thermal_38x25">🏷️ থার্মাল রোল (৩৮x২৫ মিমি)</option>
                    <option value="thermal_80mm">🖨️ ৮০মিমি POS থার্মাল রোল</option>
                  </select>
                </div>
              </div>

              {/* Preview Box (Screen only) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 print:hidden">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex justify-between items-center">
                  <span>স্টিকার প্রিভিউ (১টি নমুনা):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{stickerCopies} টি প্রিন্ট হবে</span>
                </div>
                <div className="border border-slate-300 rounded-lg p-2 bg-white text-center max-w-[210px] mx-auto text-black font-sans space-y-1 shadow-xs flex flex-col justify-between items-center">
                  <div className="text-[10px] font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5 w-full text-center truncate">
                    রনি টেলিকম
                  </div>
                  <div className="text-[10px] font-bold text-center truncate text-slate-900 px-1 w-full">
                    {stickerProduct.name}
                  </div>
                  {/* SVG Barcode simulation line */}
                  <div className="w-full flex justify-center items-center py-0.5 text-center">
                    <svg viewBox="0 0 100 24" className="w-full h-7">
                      <rect x="2" y="0" width="3" height="24" fill="#000" />
                      <rect x="8" y="0" width="2" height="24" fill="#000" />
                      <rect x="13" y="0" width="5" height="24" fill="#000" />
                      <rect x="21" y="0" width="2" height="24" fill="#000" />
                      <rect x="26" y="0" width="4" height="24" fill="#000" />
                      <rect x="33" y="0" width="2" height="24" fill="#000" />
                      <rect x="38" y="0" width="6" height="24" fill="#000" />
                      <rect x="47" y="0" width="3" height="24" fill="#000" />
                      <rect x="53" y="0" width="2" height="24" fill="#000" />
                      <rect x="58" y="0" width="4" height="24" fill="#000" />
                      <rect x="65" y="0" width="2" height="24" fill="#000" />
                      <rect x="70" y="0" width="5" height="24" fill="#000" />
                      <rect x="78" y="0" width="2" height="24" fill="#000" />
                      <rect x="83" y="0" width="4" height="24" fill="#000" />
                      <rect x="90" y="0" width="3" height="24" fill="#000" />
                      <rect x="95" y="0" width="2" height="24" fill="#000" />
                    </svg>
                  </div>
                  <div className="text-[9px] font-mono font-bold tracking-wider text-slate-800 leading-none text-center w-full">
                    {stickerProduct.sku || stickerProduct.id}
                  </div>
                  <div className="text-[10.5px] font-bold text-slate-950 text-center w-full flex justify-center items-center">
                    MRP: ৳{Number(stickerProduct.sellingPrice || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Printable sheet element (Targeted by print CSS) */}
              <div id="printable-quick-sticker" className="hidden print:block text-center">
                {Array.from({ length: stickerCopies }).map((_, idx) => (
                  <div key={idx} className="quick-sticker-unit border border-slate-300 rounded-lg p-2 bg-white text-center text-black font-sans space-y-1 my-1 flex flex-col justify-between items-center">
                    <div className="text-[10px] font-bold uppercase border-b border-slate-200 pb-0.5 w-full text-center truncate">
                      রনি টেলিকম
                    </div>
                    <div className="text-[10px] font-bold text-center truncate text-slate-900 px-1 w-full">
                      {stickerProduct.name}
                    </div>
                    <div className="w-full flex justify-center items-center py-0.5 text-center">
                      <svg viewBox="0 0 100 24" className="w-full h-7">
                        <rect x="2" y="0" width="3" height="24" fill="#000" />
                        <rect x="8" y="0" width="2" height="24" fill="#000" />
                        <rect x="13" y="0" width="5" height="24" fill="#000" />
                        <rect x="21" y="0" width="2" height="24" fill="#000" />
                        <rect x="26" y="0" width="4" height="24" fill="#000" />
                        <rect x="33" y="0" width="2" height="24" fill="#000" />
                        <rect x="38" y="0" width="6" height="24" fill="#000" />
                        <rect x="47" y="0" width="3" height="24" fill="#000" />
                        <rect x="53" y="0" width="2" height="24" fill="#000" />
                        <rect x="58" y="0" width="4" height="24" fill="#000" />
                        <rect x="65" y="0" width="2" height="24" fill="#000" />
                        <rect x="70" y="0" width="5" height="24" fill="#000" />
                        <rect x="78" y="0" width="2" height="24" fill="#000" />
                        <rect x="83" y="0" width="4" height="24" fill="#000" />
                        <rect x="90" y="0" width="3" height="24" fill="#000" />
                        <rect x="95" y="0" width="2" height="24" fill="#000" />
                      </svg>
                    </div>
                    <div className="text-[9px] font-mono font-bold tracking-wider text-slate-800 leading-none text-center w-full">
                      {stickerProduct.sku || stickerProduct.id}
                    </div>
                    <div className="text-[10.5px] font-bold text-slate-950 text-center w-full flex justify-center items-center">
                      MRP: ৳{Number(stickerProduct.sellingPrice || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons (Screen only) */}
              <div className="pt-2 flex justify-end gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={() => setStickerProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Printer size={15} />
                  <span>সরাসরি থার্মাল প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
