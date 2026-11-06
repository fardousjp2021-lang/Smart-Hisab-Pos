import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, X, ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  unit: string;
  brand?: string;
  hsn?: string;
  alertQty?: number;
  barcode?: string;
  tax?: string;
  taxType?: string;
  profitMargin?: string;
  mrp?: string;
  warehouse?: string;
  itemType?: string;
  status?: string;
  sellerPoints?: number;
  description?: string;
  discountType?: string;
  discount?: string;
}

interface Props {
  lang: 'bn' | 'en';
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categoriesList?: string[];
  setCategoriesList?: React.Dispatch<React.SetStateAction<string[]>>;
  brandsList?: string[];
  setBrandsList?: React.Dispatch<React.SetStateAction<string[]>>;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setActiveSubTab?: (tab: string) => void;
}

interface ParsedItemRow {
  rowNum: number;
  name: string;
  category: string;
  sku: string;
  hsn: string;
  unit: string;
  alertQty: number;
  brand: string;
  lotNumber: string;
  priceBeforeTax: number;
  taxName: string;
  taxValue: number;
  taxType: string;
  salesPrice: number;
  openingStock: number;
  barcode: string;
  sellerPoints: number;
  description: string;
  discountType: string;
  discount: number;
  mrp: number;
  isValid: boolean;
  isDuplicateSKU: boolean;
  validationError?: string;
}

// Import Instruction Specification Rows (Excluding Tax & Price Before Tax)
const IMPORT_INSTRUCTIONS_SPEC = [
  { num: 1, name: 'Item Name', required: false, desc: '' },
  { num: 2, name: 'Category Name', required: false, desc: '' },
  { num: 3, name: 'SKU', required: false, desc: '' },
  { num: 4, name: 'HSN', required: false, desc: '' },
  { num: 5, name: 'Unit Name', required: false, desc: '' },
  { num: 6, name: 'Alert Quantity', required: false, desc: '' },
  { num: 7, name: 'Brand Name', required: false, desc: '' },
  { num: 8, name: 'Lot Number', required: false, desc: '' },
  { num: 9, name: 'Sales Price', required: false, desc: '' },
  { num: 10, name: 'Opening Stock', required: false, desc: '' },
  { num: 11, name: 'Barcode', required: false, desc: '' },
  { num: 12, name: 'Seller Points', required: false, desc: '' },
  { num: 13, name: 'Description', required: false, desc: '' },
  { num: 14, name: 'Discount Type', required: false, desc: '"Percentage" or "Fixed"' },
  { num: 15, name: 'Discount', required: false, desc: '' },
  { num: 16, name: 'MRP', required: false, desc: '' },
];

export const ImportItems: React.FC<Props> = ({
  lang,
  products,
  setProducts,
  categoriesList = [],
  setCategoriesList,
  brandsList = [],
  setBrandsList,
  showToast,
  setActiveSubTab,
}) => {
  const isBn = lang === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedWarehouse, setSelectedWarehouse] = useState('System Warehouse');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedItemRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);

  // Available warehouses list
  const warehouses = ['System Warehouse', 'Main Godown', 'Showroom', 'Store Room 1'];

  // Handle Download Example Format CSV/Excel
  const handleDownloadExampleFormat = () => {
    const exampleRow1 = {
      'Item Name': 'XIAOMI REDMI NOTE 13 8GB/256GB',
      'Category Name': 'Smartphones',
      'SKU': 'IT020099',
      'HSN': '8517',
      'Unit Name': 'PCS',
      'Alert Quantity': 3,
      'Brand Name': 'Xiaomi',
      'Lot Number': 'LOT-2026-A',
      'Sales Price': 19500,
      'Opening Stock': 15,
      'Barcode': '6941812739281',
      'Seller Points': 10,
      'Description': 'Official Global Version Smartphone',
      'Discount Type': 'Fixed',
      'Discount': 500,
      'MRP': 20000,
    };

    const exampleRow2 = {
      'Item Name': '18W EXTREME QUICK CHARGER',
      'Category Name': 'Cables & Power Solutions',
      'SKU': 'IT020098',
      'HSN': '8504',
      'Unit Name': 'PCS',
      'Alert Quantity': 5,
      'Brand Name': 'Extreme',
      'Lot Number': 'LOT-2026-B',
      'Sales Price': 350,
      'Opening Stock': 30,
      'Barcode': '8901234567890',
      'Seller Points': 2,
      'Description': 'Fast Quick Charger Adapter 18W',
      'Discount Type': 'Percentage',
      'Discount': 5,
      'MRP': 400,
    };

    const ws = XLSX.utils.json_to_sheet([exampleRow1, exampleRow2]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import_Items_Template');
    XLSX.writeFile(wb, `import_items_example_format.csv`);

    showToast?.(
      isBn ? 'ইনস্ট্রাকশন অনুযায়ী এক্সামপল ফরম্যাট সিএসভি ডাউনলোড করা হয়েছে!' : 'Downloaded Example Format CSV template successfully!',
      'success'
    );
  };

  // Handle File Change & Parsing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setImportCompleted(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawData.length === 0) {
          showToast?.(isBn ? 'ফাইলটিতে কোনো তথ্য পাওয়া যায়নি!' : 'No data rows found in the uploaded file!', 'error');
          setIsProcessing(false);
          return;
        }

        const existingSkus = new Set(products.map(p => (p.id || p.barcode || '').toLowerCase()));

        const rows: ParsedItemRow[] = rawData.map((row, idx) => {
          const name = String(row['Item Name'] || row['Product Name'] || row['name'] || row['পণ্যের নাম'] || '').trim();
          const category = String(row['Category Name'] || row['Category'] || row['category'] || row['ক্যাটাগরি'] || 'General').trim();
          const rawSku = String(row['SKU'] || row['sku'] || row['ID'] || row['id'] || '').trim();
          const hsn = String(row['HSN'] || row['hsn'] || '').trim();
          const unit = String(row['Unit Name'] || row['Unit'] || row['unit'] || 'PCS').trim();
          const alertQty = parseInt(String(row['Alert Quantity'] || row['alertQty'] || 5), 10) || 5;
          const brand = String(row['Brand Name'] || row['Brand'] || row['brand'] || 'Generic').trim();
          const lotNumber = String(row['Lot Number'] || row['lotNumber'] || '').trim();
          const priceBeforeTax = parseFloat(String(row['Price Before Tax'] || row['purchasePrice'] || row['cost'] || 0)) || 0;
          const taxName = String(row['Tax Name'] || 'N/A').trim();
          const taxValue = parseFloat(String(row['Tax Value'] || 0)) || 0;
          const taxType = String(row['Tax Type'] || 'Exclusive').trim();
          const salesPrice = parseFloat(String(row['Sales Price'] || row['sellingPrice'] || row['price'] || 0)) || 0;
          const openingStock = parseInt(String(row['Opening Stock'] || row['stock'] || row['quantity'] || 0), 10) || 0;
          const barcode = String(row['Barcode'] || row['barcode'] || '').trim();
          const sellerPoints = parseInt(String(row['Seller Points'] || 0), 10) || 0;
          const description = String(row['Description'] || row['description'] || '').trim();
          const discountType = String(row['Discount Type'] || 'Fixed').trim();
          const discount = parseFloat(String(row['Discount'] || 0)) || 0;
          const mrp = parseFloat(String(row['MRP'] || salesPrice || 0)) || salesPrice;

          const generatedSku = rawSku || ("IT" + Math.floor(100000 + Math.random() * 900000));
          const isDuplicateSKU = existingSkus.has(generatedSku.toLowerCase());
          const isValid = name.length > 0 && salesPrice >= 0;

          let validationError = '';
          if (!name) validationError = isBn ? 'Item Name অনুপস্থিত' : 'Item Name is required';

          return {
            rowNum: idx + 1,
            name,
            category,
            sku: generatedSku,
            hsn,
            unit,
            alertQty,
            brand,
            lotNumber,
            priceBeforeTax,
            taxName,
            taxValue,
            taxType,
            salesPrice,
            openingStock,
            barcode,
            sellerPoints,
            description,
            discountType,
            discount,
            mrp,
            isValid,
            isDuplicateSKU,
            validationError,
          };
        });

        setParsedRows(rows);
        showToast?.(
          isBn ? `সফলভাবে ${rows.length}টি আইটেম সারি রিড করা হয়েছে!` : `Successfully read ${rows.length} items from CSV/Excel!`,
          'info'
        );
      } catch (err) {
        console.error(err);
        showToast?.(isBn ? 'ফাইল প্রসেস করতে ত্রুটি হয়েছে!' : 'Error parsing uploaded CSV file!', 'error');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Perform Execute Import
  const handleExecuteImport = () => {
    if (!selectedFile && parsedRows.length === 0) {
      showToast?.(isBn ? 'অনুগ্রহ করে প্রথমে সিএসভি ফাইল আপলোড করুন!' : 'Please select a CSV file to import!', 'error');
      return;
    }

    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast?.(isBn ? 'ইমপোর্ট করার মতো কোনো বৈধ আইটেম নেই!' : 'No valid product rows to import!', 'error');
      return;
    }

    const updatedProducts: Product[] = [...products];
    const updatedCategories = new Set(categoriesList);
    const updatedBrands = new Set(brandsList);

    let addedCount = 0;
    let updatedCount = 0;

    validRows.forEach(row => {
      if (row.category) updatedCategories.add(row.category);
      if (row.brand) updatedBrands.add(row.brand);

      const existingIdx = updatedProducts.findIndex(p => (p.id || '').toLowerCase() === row.sku.toLowerCase());

      const productObj: Product = {
        id: row.sku,
        name: row.name,
        category: row.category || 'General',
        brand: row.brand || 'Generic',
        purchasePrice: row.priceBeforeTax,
        sellingPrice: row.salesPrice,
        stock: row.openingStock,
        unit: row.unit || 'PCS',
        alertQty: row.alertQty || 5,
        barcode: row.barcode || row.sku,
        hsn: row.hsn,
        tax: row.taxName !== 'N/A' ? `${row.taxName} (${row.taxValue}%)` : 'N/A(0.00%)',
        taxType: row.taxType,
        mrp: String(row.mrp),
        warehouse: selectedWarehouse,
        sellerPoints: row.sellerPoints,
        description: row.description,
        discountType: row.discountType,
        discount: String(row.discount),
        itemType: 'ITEM',
        status: 'Active',
      };

      if (existingIdx > -1) {
        updatedProducts[existingIdx] = {
          ...updatedProducts[existingIdx],
          ...productObj,
          stock: (updatedProducts[existingIdx].stock || 0) + row.openingStock,
        };
        updatedCount++;
      } else {
        updatedProducts.unshift(productObj);
        addedCount++;
      }
    });

    // Save to state
    setProducts(updatedProducts);
    if (setCategoriesList) setCategoriesList(Array.from(updatedCategories));
    if (setBrandsList) setBrandsList(Array.from(updatedBrands));

    // Persist
    try {
      localStorage.setItem('pos_products_v1', JSON.stringify(updatedProducts));
    } catch (e) {}

    setImportCompleted(true);
    showToast?.(
      isBn 
        ? `ইমপোর্ট সম্পন্ন! ${addedCount}টি নতুন এবং ${updatedCount}টি আইটেম আপডেট হয়েছে (${selectedWarehouse})।` 
        : `Import successful! ${addedCount} added & ${updatedCount} updated in ${selectedWarehouse}.`,
      'success'
    );
  };

  const validCount = parsedRows.filter(r => r.isValid).length;

  return (
    <div className="space-y-4 text-left font-sans animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 rounded-2xl">
      
      {/* 1. TOP HEADER & BREADCRUMB BAR (Matching Screenshot Top Bar) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Import Items
            </h1>
            <span className="text-xs text-slate-400 font-semibold">
              Add/Update Brand
            </span>
          </div>
        </div>

        {/* Right side breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>🏠 Home</span>
          <span>&rsaquo;</span>
          <span>Items List</span>
          <span>&rsaquo;</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">Import Items</span>
        </div>
      </div>

      {/* 2. TOP FORM PANEL: Warehouse & File Upload Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
          Please Enter Valid Data
        </p>

        <div className="space-y-3.5 max-w-xl">
          {/* Warehouse Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <label className="sm:col-span-4 text-xs font-bold text-slate-700 dark:text-slate-300 sm:text-right">
              Warehouse <span className="text-rose-500">*</span>
            </label>
            <div className="sm:col-span-8">
              <select
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Import Items File Input */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <label className="sm:col-span-4 text-xs font-bold text-slate-700 dark:text-slate-300 sm:text-right">
              Import Items <span className="text-rose-500">*</span>
            </label>
            <div className="sm:col-span-8 space-y-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Browse...
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  {selectedFile ? selectedFile.name : 'No file selected.'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                Note: File must be in CSV format.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Import (Green) & Close (Orange) matching screenshot */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleExecuteImport}
            className="px-8 py-2.5 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold text-xs rounded-md shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>{importCompleted ? 'Import Completed ✓' : 'Import'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (setActiveSubTab) setActiveSubTab('list_products');
            }}
            className="px-8 py-2.5 bg-[#f39c12] hover:bg-[#e08e0b] text-white font-bold text-xs rounded-md shadow-xs transition active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* 3. PARSED PREVIEW TABLE (If CSV is uploaded) */}
      {parsedRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>📋 Parsed CSV Rows ({parsedRows.length})</span>
              <span className="text-emerald-600 font-bold">✓ Ready: {validCount}</span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                <tr>
                  <th className="p-2 text-center">#</th>
                  <th className="p-2">Item Name</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2 text-right">Cost</th>
                  <th className="p-2 text-right">Sales Price</th>
                  <th className="p-2 text-center">Opening Stock</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {parsedRows.map(r => (
                  <tr key={r.rowNum} className={!r.isValid ? 'bg-rose-50 dark:bg-rose-950/20' : ''}>
                    <td className="p-2 text-center font-bold text-slate-400">{r.rowNum}</td>
                    <td className="p-2 font-bold text-slate-800 dark:text-white">{r.name}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2 font-mono text-blue-600">{r.sku}</td>
                    <td className="p-2 text-right font-mono">৳{r.priceBeforeTax}</td>
                    <td className="p-2 text-right font-mono font-bold">৳{r.salesPrice}</td>
                    <td className="p-2 text-center font-bold">{r.openingStock} {r.unit}</td>
                    <td className="p-2 text-center">
                      {r.isValid ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ Ready</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">✕ {r.validationError}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BOTTOM INSTRUCTIONS PANEL: 20-Row Instructions Table matching Screenshot */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">
            Import Instructions
          </h3>

          <button
            type="button"
            onClick={handleDownloadExampleFormat}
            className="px-4 py-1.5 bg-[#00c0ef] hover:bg-[#00acd6] text-white font-bold text-xs rounded-md shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Example Format</span>
          </button>
        </div>

        {/* 20 Specification Rows Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4 font-bold">Column Name</th>
                <th className="py-2.5 px-4 font-bold w-32">Value</th>
                <th className="py-2.5 px-4 font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              {IMPORT_INSTRUCTIONS_SPEC.map(spec => (
                <tr key={spec.num} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3 text-center text-slate-400 font-bold">{spec.num}</td>
                  <td className="py-2 px-4 font-bold text-slate-800 dark:text-slate-200">{spec.name}</td>
                  <td className="py-2 px-4">
                    {spec.required ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#00a65a] text-white shadow-2xs inline-block">
                        Required
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 inline-block">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-slate-500 font-mono text-[11px]">
                    {spec.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
export default ImportItems;

