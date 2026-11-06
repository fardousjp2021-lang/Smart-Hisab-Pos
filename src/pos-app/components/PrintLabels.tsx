import React, { useState, useMemo, useEffect } from 'react';
import { Search, Printer, CheckSquare, Square, RefreshCw, Eye, Sliders, CheckCircle2, Tag, Store, Globe, Info, HelpCircle, Phone, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  purchasePrice: number;
  stock: number;
  barcode?: string;
  unit?: string;
  brand?: string;
}

interface Props {
  lang: 'bn' | 'en';
  onToggleLang?: () => void;
  products: Product[];
  shopName: string;
  shopPhone?: string;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// ==========================================
// Standard Code 128 (Subset B) Binary Table
// 107 standardized patterns for 100% scannable hardware barcodes
// ==========================================
const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011' // 106: Stop code
];

/**
 * 100% Scannable Standard Code 128 (Subset B) SVG Generator
 * Includes Start Code (104), Weighted Checksum, Stop Code (106),
 * and standard 10-module Quiet Zones on left & right.
 */
const BarcodeSVG: React.FC<{ value: string; height?: number; className?: string }> = ({ 
  value, 
  height = 26, 
  className = "" 
}) => {
  const { binary, totalModules, quietZone } = useMemo(() => {
    let clean = (value || 'IT020027').trim().toUpperCase().replace(/[^\x20-\x7E]/g, '');
    if (!clean) clean = 'ITEM01';

    // Start Code B index is 104
    let checksum = 104;
    let bits = CODE128_PATTERNS[104];

    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i) - 32;
      const validCode = code >= 0 && code < 95 ? code : 0;
      checksum += validCode * (i + 1);
      bits += CODE128_PATTERNS[validCode];
    }

    const checkVal = checksum % 103;
    bits += CODE128_PATTERNS[checkVal];
    bits += CODE128_PATTERNS[106]; // Stop code (13 modules)

    const qZone = 10; // Standard Quiet Zone modules
    return {
      binary: bits,
      totalModules: bits.length + (qZone * 2),
      quietZone: qZone
    };
  }, [value]);

  const barWidth = 1.2;

  return (
    <svg 
      viewBox={`0 0 ${totalModules * barWidth} ${height}`} 
      className={`w-full max-w-full select-none overflow-hidden ${className}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      <rect width="100%" height="100%" fill="#ffffff" />
      {binary.split('').map((bit, idx) => {
        if (bit === '1') {
          return (
            <rect
              key={idx}
              x={(quietZone + idx) * barWidth}
              y={0}
              width={barWidth}
              height={height}
              fill="#000000"
            />
          );
        }
        return null;
      })}
    </svg>
  );
};

export const PrintLabels: React.FC<Props> = ({ 
  lang, 
  onToggleLang, 
  products, 
  shopName, 
  shopPhone, 
  showToast 
}) => {
  // Local language state synced with parent prop
  const [activeLang, setActiveLang] = useState<'bn' | 'en'>(lang);

  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  const isBn = activeLang === 'bn';

  const handleToggleLanguage = () => {
    const nextLang = activeLang === 'bn' ? 'en' : 'bn';
    setActiveLang(nextLang);
    if (onToggleLang) {
      onToggleLang();
    }
    showToast?.(nextLang === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে: বাংলা' : 'Language changed to: English', 'info');
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Selected stickers state: Map product ID -> copies
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (products.length > 0) {
      products.slice(0, 3).forEach(p => { initial[p.id] = 2; });
    }
    return initial;
  });

  // Sticker Layout Customization Options
  const [paperFormat, setPaperFormat] = useState<'thermal_50x25' | 'thermal_38x25' | 'thermal_58x40' | 'thermal_80mm' | 'a4_24' | 'a4_30'>('thermal_50x25');
  const [showShopTitle, setShowShopTitle] = useState(true);
  const [showShopPhone, setShowShopPhone] = useState(false);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBarcodeText, setShowBarcodeText] = useState(true);
  const [showCostCode, setShowCostCode] = useState(false);
  const [customPriceLabel, setCustomPriceLabel] = useState('MRP:');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isSingleTestPrint, setIsSingleTestPrint] = useState(false);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['ALL', ...cats];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.id && p.id.toLowerCase().includes(q)) || (p.barcode && p.barcode.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Computed total labels to print
  const totalLabelsToPrint = useMemo(() => {
    return Object.values(selectedItemsMap).reduce((sum, count) => sum + (count > 0 ? count : 0), 0);
  }, [selectedItemsMap]);

  // List of sticker instances for preview & printing
  const stickerList = useMemo(() => {
    const list: Array<{ product: Product; index: number }> = [];
    products.forEach(p => {
      const count = selectedItemsMap[p.id] || 0;
      for (let i = 0; i < count; i++) {
        list.push({ product: p, index: i });
      }
    });
    return list;
  }, [products, selectedItemsMap]);

  // Stickers actually sent to print (supports single 1-sticker test mode)
  const printableStickerList = useMemo(() => {
    if (isSingleTestPrint) {
      return stickerList.slice(0, 1);
    }
    return stickerList;
  }, [stickerList, isSingleTestPrint]);

  // Handlers
  const handleToggleProduct = (id: string) => {
    setSelectedItemsMap(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const handleUpdateCopies = (id: string, copies: number) => {
    const qty = Math.max(0, copies);
    setSelectedItemsMap(prev => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedItemsMap(prev => {
      const next = { ...prev };
      filteredProducts.forEach(p => {
        if (!next[p.id]) next[p.id] = 1;
      });
      return next;
    });
    showToast?.(isBn ? 'ফিল্টারকৃত সকল পণ্য নির্বাচিত হয়েছে' : 'Selected all filtered products', 'info');
  };

  const handleFillByStock = () => {
    setSelectedItemsMap(prev => {
      const next = { ...prev };
      filteredProducts.forEach(p => {
        const stockQty = Math.max(1, p.stock || 1);
        next[p.id] = stockQty;
      });
      return next;
    });
    showToast?.(isBn ? 'স্টক সংখ্যা অনুযায়ী লেবেল কপি পূরণ করা হয়েছে' : 'Label counts set according to current stock', 'success');
  };

  const handleClearAll = () => {
    setSelectedItemsMap({});
    showToast?.(isBn ? 'সকল সিলেকশন মুছে ফেলা হয়েছে' : 'Cleared all selections', 'info');
  };

  const handleTriggerPrint = () => {
    if (stickerList.length === 0) {
      showToast?.(isBn ? 'প্রিন্ট করার জন্য অন্তত একটি পণ্য নির্বাচন করুন!' : 'Please select at least one product to print!', 'error');
      return;
    }
    setIsSingleTestPrint(false);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Quick 1-label print test to confirm thermal sensor alignment
  const handleTriggerTestOnePrint = () => {
    if (stickerList.length === 0) {
      showToast?.(isBn ? 'টেস্ট প্রিন্টের জন্য অন্তত একটি পণ্য নির্বাচন করুন!' : 'Please select at least one product for test print!', 'error');
      return;
    }
    setIsSingleTestPrint(true);
    showToast?.(isBn ? '১টি নমুনা টেস্ট স্টিকার প্রিন্ট হচ্ছে...' : 'Printing 1 sample test sticker...', 'info');
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsSingleTestPrint(false), 800);
    }, 100);
  };

  return (
    <div className="space-y-5 text-left font-sans animate-fadeIn select-none print:p-0 print:m-0 print:bg-white">
      
      {/* ======================================================== */}
      {/* Strict Pixel-Perfect Thermal Printer Print CSS Styles    */}
      {/* Prevents blank label skip, page overflow & sensor drift  */}
      {/* ======================================================== */}
      <style>{`
        @media print {
          /* 1. Hide everything else in the POS UI */
          body * {
            visibility: hidden !important;
          }

          /* 2. Reset HTML & Body completely */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
            height: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Make only the sticker container visible */
          #printable-sticker-sheet, #printable-sticker-sheet * {
            visibility: visible !important;
          }

          #printable-sticker-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            width: ${
              paperFormat === 'thermal_50x25' ? '50mm' :
              paperFormat === 'thermal_38x25' ? '38mm' :
              paperFormat === 'thermal_58x40' ? '58mm' :
              paperFormat === 'thermal_80mm' ? '80mm' : '100%'
            } !important;
          }

          /* 4. Thermal rolls must be block layout (gap: 0) to avoid sensor drift */
          .sticker-container-root {
            display: ${paperFormat.startsWith('thermal') && paperFormat !== 'thermal_80mm' ? 'block' : paperFormat === 'thermal_80mm' ? 'flex' : 'grid'} !important;
            flex-direction: ${paperFormat === 'thermal_80mm' ? 'column' : 'initial'} !important;
            grid-template-columns: ${
              paperFormat === 'a4_30' || paperFormat === 'a4_24' ? 'repeat(3, 1fr)' : 'none'
            } !important;
            gap: ${paperFormat.startsWith('thermal') ? '0' : '2.5mm'} !important;
            margin: 0 !important;
            padding: ${paperFormat.startsWith('thermal') ? '0' : '4mm 2mm'} !important;
            width: 100% !important;
          }

          /* 5. Exact dimension lock on every sticker item */
          .thermal-sticker-item {
            page-break-after: ${paperFormat.startsWith('thermal') && paperFormat !== 'thermal_80mm' ? 'always' : 'auto'} !important;
            break-after: ${paperFormat.startsWith('thermal') && paperFormat !== 'thermal_80mm' ? 'page' : 'auto'} !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: ${paperFormat.startsWith('a4') ? '1px dotted #ccc' : paperFormat === 'thermal_80mm' ? '1px dashed #bbb' : 'none'} !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            background: #ffffff !important;
            ${
              paperFormat === 'thermal_50x25'
                ? 'width: 50mm !important; height: 25mm !important; max-height: 25mm !important; padding: 1mm 1.5mm !important;'
                : paperFormat === 'thermal_38x25'
                ? 'width: 38mm !important; height: 25mm !important; max-height: 25mm !important; padding: 0.8mm 1mm !important;'
                : paperFormat === 'thermal_58x40'
                ? 'width: 58mm !important; height: 40mm !important; max-height: 40mm !important; padding: 2mm !important;'
                : paperFormat === 'thermal_80mm'
                ? 'width: 80mm !important; margin-bottom: 2mm !important; padding: 2.5mm !important;'
                : paperFormat === 'a4_30'
                ? 'width: 100% !important; height: 29.7mm !important; max-height: 29.7mm !important; padding: 1.5mm !important;'
                : 'width: 100% !important; height: 37mm !important; max-height: 37mm !important; padding: 2mm !important;'
            }
          }

          /* 6. Strict millimetric @page declaration */
          @page {
            size: ${
              paperFormat === 'thermal_50x25' ? '50mm 25mm' :
              paperFormat === 'thermal_38x25' ? '38mm 25mm' :
              paperFormat === 'thermal_58x40' ? '58mm 40mm' :
              paperFormat === 'thermal_80mm' ? '80mm auto' : 'A4 portrait'
            };
            margin: ${paperFormat.startsWith('thermal') ? '0 !important' : '4mm !important'};
          }
        }
      `}</style>

      {/* Screen Header Row (Hidden on print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                🏷️ {isBn ? "থার্মাল ও বারকোড স্টিকার প্রিন্ট" : "Thermal & Barcode Sticker Printing"}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase border border-emerald-300 dark:border-emerald-700">
                Code 128 Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isBn 
                ? "যেকোনো থার্মাল স্টিকার প্রিন্টার (৫০x২৫মিমি, ৩৮x২৫মিমি, ৫৮x৪০মিমি) বা A4 শিটে ১০০% স্ক্যানযোগ্য বারকোড প্রিন্ট করুন" 
                : "Print 100% hardware-scannable labels on thermal sticker rolls (50x25mm, 38x25mm) or A4 sheets"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Thermal Print Setup Guide Button */}
          <button
            type="button"
            onClick={() => setShowGuideModal(!showGuideModal)}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs border border-amber-300 dark:border-amber-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            title={isBn ? "থার্মাল প্রিন্টার সেটিংস গাইড" : "Thermal Print Setup Guide"}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isBn ? "প্রিন্টার গাইড" : "Print Guide"}</span>
          </button>

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
            title={isBn ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "ENGLISH" : "বাংলা"}</span>
          </button>

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            📋 {isBn ? `মোট: ${totalLabelsToPrint} টি` : `Total: ${totalLabelsToPrint}`}
          </span>

          {/* Test 1 Sticker Button */}
          <button
            type="button"
            onClick={handleTriggerTestOnePrint}
            disabled={stickerList.length === 0}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            title={isBn ? "রোল টেস্টের জন্য ১টি স্টিকার প্রিন্ট করুন" : "Test print 1 label on thermal roll"}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? "১টি টেস্ট প্রিন্ট" : "Test 1 Label"}</span>
          </button>

          {/* Full Print Button */}
          <button
            type="button"
            onClick={handleTriggerPrint}
            disabled={stickerList.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? "থার্মাল প্রিন্ট শুরু করুন" : "Start Print"}</span>
          </button>
        </div>
      </div>

      {/* Quick Setup Guide Banner (Collapsible) */}
      {showGuideModal && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 shadow-sm print:hidden animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1.5 text-xs text-amber-950 dark:text-amber-100">
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
                  🖨️ {isBn ? "থার্মাল স্টিকার প্রিন্টারে নিখুঁত প্রিন্টের ৪টি সহজ নিয়ম:" : "4 Rules for Flawless Thermal Sticker Printing:"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-medium">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block text-[11px]">১. Destination (প্রিন্টার):</span>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">আপনার থার্মাল প্রিন্টার (যেমন: Xprinter XP-365B / Rongta / Zebra) সিলেক্ট করুন।</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block text-[11px]">২. Paper Size (সাইজ):</span>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">রোলের সাইজ ৫০x২৫মিমি বা ৩৮x২৫মিমি নির্বাচন করুন।</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block text-[11px]">৩. Margins (মার্জিন):</span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">অবশ্যই "None" সিলেক্ট করবেন (Default রাখলে স্টিকার ছোট হবে)।</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block text-[11px]">৪. Headers & Footers:</span>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">টিক চিহ্ন সম্পূর্ণ তুলে দিন (Uncheck রাখুন)।</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setShowGuideModal(false)}
              className="text-amber-800 hover:text-amber-950 font-bold text-sm px-2 py-1 rounded-lg hover:bg-amber-200/60"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid: Left Controls & Selector, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* Left 7 Columns: Selection & Customization (Hidden on print) */}
        <div className="lg:col-span-7 space-y-4 print:hidden">
          
          {/* Sticker Customization Control Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>{isBn ? "প্রিন্টার ও লেআউট ফরম্যাট নির্বাচন" : "Printer Format & Layout"}</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200">
                {isBn ? "রোল সেন্সর সেফ" : "Sensor Calibrated"}
              </span>
            </div>

            {/* Format selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { 
                  key: 'thermal_50x25', 
                  labelBn: '🏷️ থার্মাল (৫০x২৫ মিমি)', 
                  labelEn: 'Thermal (50x25mm)', 
                  badge: isBn ? 'সর্বাধিক ব্যবহৃত' : 'Most Popular' 
                },
                { 
                  key: 'thermal_38x25', 
                  labelBn: '🏷️ থার্মাল (৩৮x২৫ মিমি)', 
                  labelEn: 'Thermal (38x25mm)', 
                  badge: isBn ? 'ছোট এক্সেসরিজ' : 'Compact Tag' 
                },
                { 
                  key: 'thermal_58x40', 
                  labelBn: '🏷️ থার্মাল (৫৮x৪০ মিমি)', 
                  labelEn: 'Thermal (58x40mm)', 
                  badge: isBn ? 'বক্স লেবেল' : 'Box Tag' 
                },
                { 
                  key: 'thermal_80mm', 
                  labelBn: '🖨️ ৮০মিমি রোল (একটানা)', 
                  labelEn: '80mm Thermal Stream', 
                  badge: isBn ? 'রসিদ পেপার' : 'POS Roll' 
                },
                { 
                  key: 'a4_24', 
                  labelBn: '📄 A4 স্টিকার (২৪টি - ৩x৮)', 
                  labelEn: 'A4 Sheet (24 Labels)', 
                  badge: isBn ? 'লেজার/কালার' : 'Avery 24' 
                },
                { 
                  key: 'a4_30', 
                  labelBn: '📄 A4 স্টিকার (৩০টি - ৩x১০)', 
                  labelEn: 'A4 Sheet (30 Labels)', 
                  badge: isBn ? 'লেজার/কালার' : 'Avery 30' 
                },
              ].map(fmt => (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => setPaperFormat(fmt.key as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                    paperFormat === fmt.key
                      ? 'bg-blue-50/90 text-blue-800 border-blue-500 dark:bg-blue-950 dark:text-blue-200 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold">{isBn ? fmt.labelBn : fmt.labelEn}</span>
                  <span className="text-[9.5px] mt-1 font-semibold text-slate-400 dark:text-slate-400">
                    {fmt.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Checkbox fields selection */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isBn ? "স্টিকারে প্রদর্শিত তথ্য নির্বাচন করুন:" : "Information to Show on Sticker:"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showShopTitle}
                    onChange={e => setShowShopTitle(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "দোকানের নাম" : "Shop Name"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showShopPhone}
                    onChange={e => setShowShopPhone(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "দোকানের ফোন" : "Shop Phone"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={e => setShowProductName(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "পণ্যের নাম" : "Product Name"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={e => setShowPrice(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "বিক্রয় মূল্য (MRP)" : "Retail Price"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showBarcodeText}
                    onChange={e => setShowBarcodeText(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "বারকোড SKU কোড" : "Barcode SKU"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={showCostCode}
                    onChange={e => setShowCostCode(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isBn ? "ক্রয়মূল্য সিক্রেট কোড" : "Cost Code"}</span>
                </label>
              </div>

              {/* Price Prefix Preset selector */}
              {showPrice && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    {isBn ? "মূল্য প্রিফিক্স:" : "Price Prefix:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['MRP:', '৳', 'Tk.', 'Price:', ''].map(prefix => (
                      <button
                        key={prefix}
                        type="button"
                        onClick={() => setCustomPriceLabel(prefix)}
                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition ${
                          customPriceLabel === prefix
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        {prefix === '' ? (isBn ? 'ফাঁকা' : 'None') : prefix}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Selection List Table Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isBn ? "পণ্য বা SKU দিয়ে খুঁজুন..." : "Search items or SKU..."}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'ALL' ? (isBn ? 'সব ক্যাটাগরি' : 'All Categories') : cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-2 text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-xl border border-blue-200 hover:bg-blue-100 cursor-pointer shrink-0"
                >
                  ✓ {isBn ? "সব সিলেক্ট" : "Select All"}
                </button>

                <button
                  type="button"
                  onClick={handleFillByStock}
                  className="px-3 py-2 text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl border border-emerald-200 hover:bg-emerald-100 cursor-pointer shrink-0"
                >
                  📦 {isBn ? "স্টক অনুযায়ী" : "Fill Stock"}
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2 text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl border border-rose-200 hover:bg-rose-100 cursor-pointer shrink-0"
                >
                  ✕ {isBn ? "ক্লিয়ার" : "Clear"}
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10.5px] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">{isBn ? "পণ্যের নাম" : "Product Name"}</th>
                    <th className="py-2.5 px-3">{isBn ? "ক্যাটাগরি" : "Category"}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? "মূল্য (৳)" : "Price"}</th>
                    <th className="py-2.5 px-3 text-center">{isBn ? "স্টক" : "Stock"}</th>
                    <th className="py-2.5 px-3 text-center w-28">{isBn ? "লেবেল কপি" : "Copies"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        {isBn ? "কোনো পণ্য পাওয়া যায়নি!" : "No products found!"}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const isSelected = Boolean(selectedItemsMap[p.id]);
                      const copies = selectedItemsMap[p.id] || 0;

                      return (
                        <tr
                          key={p.id}
                          className={`transition ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleProduct(p.id)}
                              className="cursor-pointer text-slate-500 hover:text-blue-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">
                            <div>
                              <span>{p.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                SKU: {p.barcode || p.id}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {p.category || '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            ৳{Number(p.sellingPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {p.stock ?? 0} {p.unit || 'PCS'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              value={copies}
                              onChange={e => handleUpdateCopies(p.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
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

        {/* Right 5 Columns: Realtime Interactive Sticker Preview & Print Sheet */}
        <div className="lg:col-span-5 space-y-4 print:w-full print:col-span-12">
          
          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-between h-full">
            
            {/* Live Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? "লাইভ স্টিকার শিট প্রিভিউ" : "Live Sticker Sheet Preview"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200">
                  {paperFormat === 'thermal_50x25' ? '50×25mm' :
                   paperFormat === 'thermal_38x25' ? '38×25mm' :
                   paperFormat === 'thermal_58x40' ? '58×40mm' :
                   paperFormat === 'thermal_80mm' ? '80mm POS' : 'A4 Sheet'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                  {stickerList.length} {isBn ? "টি স্টিকার" : "Stickers"}
                </span>
              </div>
            </div>

            {/* Printable Sticker Sheet Area */}
            <div 
              id="printable-sticker-sheet" 
              className="flex-1 overflow-y-auto max-h-[580px] print:max-h-none p-2 bg-white rounded-xl shadow-xs border border-slate-200" 
              style={{ scrollbarWidth: 'none' }}
            >
              {printableStickerList.length === 0 ? (
                <div className="py-20 text-center text-slate-400 select-none">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-xs font-bold">
                    {isBn ? "বাম পাশের তালিকা থেকে পণ্য নির্বাচন করুন" : "Select products from the list to preview stickers"}
                  </p>
                </div>
              ) : (
                <div 
                  className={`sticker-container-root grid gap-2.5 text-center text-black font-sans ${
                    paperFormat === 'a4_30' ? 'grid-cols-3' : 
                    paperFormat === 'a4_24' ? 'grid-cols-3' : 
                    paperFormat === 'thermal_38x25' ? 'grid-cols-1 max-w-[190px] mx-auto' :
                    paperFormat === 'thermal_58x40' ? 'grid-cols-1 max-w-[260px] mx-auto' :
                    'grid-cols-1 max-w-[230px] mx-auto'
                  }`}
                >
                  {printableStickerList.map((item, idx) => {
                    const p = item.product;
                    const barcodeVal = p.barcode || p.id || 'IT020027';

                    // Layout variations based on paper size
                    const isCompact38 = paperFormat === 'thermal_38x25';
                    const isLarge58 = paperFormat === 'thermal_58x40';

                    return (
                      <div
                        key={`${p.id}-${idx}`}
                        className={`thermal-sticker-item border border-slate-300 rounded-lg flex flex-col justify-between items-center bg-white shadow-2xs text-black text-center overflow-hidden box-border ${
                          isCompact38 
                            ? 'p-1.5 min-h-[85px] max-w-[180px] space-y-0.5' 
                            : isLarge58 
                            ? 'p-3 min-h-[135px] max-w-[250px] space-y-1.5'
                            : 'p-2 min-h-[95px] max-w-[220px] space-y-1'
                        }`}
                      >
                        {/* Shop Header Row */}
                        {showShopTitle && (
                          <div className="w-full text-center border-b border-black/20 pb-0.5">
                            <span className={`block font-bold tracking-tight uppercase text-slate-900 truncate ${
                              isCompact38 ? 'text-[8.5px] leading-tight' : isLarge58 ? 'text-xs' : 'text-[10px] leading-tight'
                            }`}>
                              {shopName || 'রনি টেলিকম'}
                            </span>
                            {showShopPhone && shopPhone && (
                              <span className={`block font-mono font-bold text-slate-600 truncate ${
                                isCompact38 ? 'text-[7px]' : 'text-[8px]'
                              }`}>
                                📞 {shopPhone}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Product Title */}
                        {showProductName && (
                          <div 
                            className={`font-bold text-slate-900 text-center truncate w-full px-0.5 ${
                              isCompact38 ? 'text-[8px] leading-tight' : isLarge58 ? 'text-xs leading-snug line-clamp-2' : 'text-[9.5px] leading-tight'
                            }`} 
                            title={p.name}
                          >
                            {p.name}
                          </div>
                        )}

                        {/* 100% Hardware Scannable Standard Code 128 Barcode Graphic */}
                        <div className="w-full flex justify-center items-center py-0.5 text-center">
                          <BarcodeSVG 
                            value={barcodeVal} 
                            height={isCompact38 ? 18 : isLarge58 ? 32 : 22} 
                          />
                        </div>

                        {/* SKU Barcode Number string */}
                        {showBarcodeText && (
                          <div className={`font-mono font-bold text-slate-800 leading-none text-center w-full ${
                            isCompact38 ? 'text-[7.5px] tracking-tight' : isLarge58 ? 'text-[10px] tracking-widest' : 'text-[8.5px] tracking-wider'
                          }`}>
                            {barcodeVal}
                          </div>
                        )}

                        {/* Retail Price MRP & Secret Cost Code */}
                        {(showPrice || showCostCode) && (
                          <div className="flex items-center justify-center w-full font-bold text-slate-950 px-0.5 mt-0.5 text-center gap-1.5">
                            {showPrice && (
                              <span className={`text-center font-bold ${
                                isCompact38 ? 'text-[9px]' : isLarge58 ? 'text-sm' : 'text-[10.5px]'
                              }`}>
                                {customPriceLabel} ৳{Number(p.sellingPrice || 0).toLocaleString()}
                              </span>
                            )}
                            {showCostCode && (
                              <span className={`font-mono font-bold text-slate-500 bg-slate-100 px-1 rounded text-center ${
                                isCompact38 ? 'text-[7px]' : 'text-[8px]'
                              }`}>
                                C:{p.purchasePrice || 0}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Print Action Footer (Hidden on print) */}
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold">
                  {isBn ? "থার্মাল প্রিন্টার (Xprinter, Rongta, Zebra) ও সাধারণ A4 শিট সাপোর্টেড।" : "Ready for Xprinter, Rongta, Zebra & A4 sheets."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerTestOnePrint}
                  disabled={stickerList.length === 0}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? "১টি টেস্ট প্রিন্ট" : "Test 1"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  disabled={stickerList.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? "প্রিন্ট করুন" : "Print Labels"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintLabels;

