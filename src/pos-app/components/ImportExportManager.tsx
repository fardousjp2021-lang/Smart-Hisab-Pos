import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Download, Upload, FileSpreadsheet, FileText, Printer, FileDown, FileUp, 
  Database, CheckCircle2, AlertTriangle, Package, Wrench, FolderTree, Tag, 
  Layers, Ruler, ShieldCheck, FileCheck
} from 'lucide-react';

type Lang = 'bn' | 'en';

interface Props {
  lang: Lang;
  products: any[];
  setProducts: (p: any[]) => void;
  services: any[];
  setServices: (s: any[]) => void;
  categoriesList: string[];
  setCategoriesList: (c: string[]) => void;
  brandsList: string[];
  setBrandsList: (b: string[]) => void;
  variants: any[];
  setVariants: (v: any[]) => void;
  unitsByCategory: Record<string, string[]>;
  setUnitsByCategory: (u: Record<string, string[]>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type DatasetKey = 'products' | 'services' | 'categories' | 'brands' | 'variants' | 'units' | 'warranty' | 'stock_alerts';

const readLS = (k: string, fb: any = []) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb; } catch { return fb; } };

const BENGALI_COLUMN_MAP: Record<string, string> = {
  id: 'আইডি',
  name: 'নাম / বিবরণ',
  category: 'ক্যাটাগরি',
  brand: 'ব্র্যান্ড',
  sku: 'SKU কোড',
  barcode: 'বারকোড',
  unit: 'ইউনিট',
  stock: 'বর্তমান স্টক',
  quantity: 'পরিমাণ',
  reorderLevel: 'অ্যালার্ট সীমা',
  alertQty: 'অ্যালার্ট সীমা',
  price: 'বিক্রয়মূল্য (৳)',
  sellingPrice: 'বিক্রয়মূল্য (৳)',
  cost: 'ক্রয়মূল্য (৳)',
  purchasePrice: 'ক্রয়মূল্য (৳)',
  itemType: 'টাইপ',
  tax: 'ভ্যাট/ট্যাক্স',
  status: 'স্ট্যাটাস',
  description: 'বিবরণ',
  duration: 'সময়সীমা',
  serialNumber: 'সিরিয়াল নম্বর',
  imei1: 'IMEI 1',
  imei2: 'IMEI 2',
  warrantyType: 'ওয়ারেন্টির মেয়াদ',
  warrantyExpiryDate: 'মেয়াদ উত্তীর্ণের তারিখ',
  batchNumber: 'ব্যাচ নম্বর',
  expiryDate: 'মেয়াদ উত্তীর্ণের তারিখ',
  productId: 'পণ্য আইডি',
  productName: 'পণ্যের নাম',
};

export const ImportExportManager: React.FC<Props> = (props) => {
  const { lang, products, setProducts, services, setServices, categoriesList, setCategoriesList,
    brandsList, setBrandsList, variants, setVariants, unitsByCategory, setUnitsByCategory, showToast } = props;

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);
  const [dataset, setDataset] = useState<DatasetKey>('products');
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastImportSummary, setLastImportSummary] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const warrantyRecords = useMemo(() => {
    const s1 = readLS('roni_warranty_records_v1', []);
    if (s1 && s1.length) return s1;
    return readLS('roni_serial_records_v1', []);
  }, [dataset]);
  const stockAlerts = useMemo(() => {
    const batches = readLS('roni_batch_expiry_v1', []);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows: any[] = [];
    products.forEach((p: any) => {
      const stock = Number(p.stock ?? p.quantity ?? 0);
      const reorder = Number(p.reorderLevel ?? p.alertQty ?? p.lowStockThreshold ?? 5);
      let status = '';
      if (stock < 0) status = 'Negative';
      else if (stock === 0) status = 'Out of Stock';
      else if (stock <= reorder) status = 'Low Stock';
      if (status) rows.push({ productId: p.id, productName: p.name, stock, reorderLevel: reorder, status, category: p.category, brand: p.brand });
    });
    batches.forEach((b: any) => {
      if (!b.expiryDate) return;
      const exp = new Date(b.expiryDate); exp.setHours(0, 0, 0, 0);
      const diff = Math.floor((exp.getTime() - today.getTime()) / 86400000);
      let status = '';
      if (diff < 0) status = 'Expired';
      else if (diff <= 7) status = 'Expiring 7d';
      else if (diff <= 15) status = 'Expiring 15d';
      else if (diff <= 30) status = 'Expiring 30d';
      if (status) rows.push({ productId: b.productId, productName: b.productName, batchNumber: b.batchNumber, expiryDate: b.expiryDate, status });
    });
    return rows;
  }, [products, dataset]);

  const datasets: { key: DatasetKey; labelBn: string; labelEn: string; icon: any; rows: any[]; sample: any[]; onImport?: (rows: any[]) => number }[] = [
    { key: 'products', labelBn: 'পণ্য', labelEn: 'Products', icon: Package, rows: products,
      sample: [{ id: 'P-1001', name: 'iPhone 15 Pro', category: 'Mobile Phones', brand: 'Apple', sku: 'IP15P-256', barcode: '8901234567890', unit: 'pcs', price: 175000, cost: 160000, stock: 10, reorderLevel: 3 }],
      onImport: (rows) => { const merged = [...products]; rows.forEach(r => { const idx = merged.findIndex((x: any) => x.id === r.id); if (idx >= 0) merged[idx] = { ...merged[idx], ...r }; else merged.push(r); }); setProducts(merged); return rows.length; } },
    { key: 'services', labelBn: 'সার্ভিস', labelEn: 'Services', icon: Wrench, rows: services,
      sample: [{ id: 'S-01', name: 'Screen Replacement', price: 3500, duration: '45 min', category: 'Repair' }],
      onImport: (rows) => { const merged = [...services]; rows.forEach(r => { const idx = merged.findIndex((x: any) => x.id === r.id); if (idx >= 0) merged[idx] = { ...merged[idx], ...r }; else merged.push(r); }); setServices(merged); return rows.length; } },
    { key: 'categories', labelBn: 'ক্যাটাগরি', labelEn: 'Categories', icon: FolderTree, rows: categoriesList.map(name => ({ name })),
      sample: [{ name: 'Electronics' }, { name: 'Accessories' }],
      onImport: (rows) => { const names = rows.map((r: any) => String(r.name || '').trim()).filter(Boolean); const merged = Array.from(new Set([...categoriesList, ...names])); setCategoriesList(merged); return names.length; } },
    { key: 'brands', labelBn: 'ব্র্যান্ড', labelEn: 'Brands', icon: Tag, rows: brandsList.map(name => ({ name })),
      sample: [{ name: 'Apple' }, { name: 'Samsung' }],
      onImport: (rows) => { const names = rows.map((r: any) => String(r.name || '').trim()).filter(Boolean); const merged = Array.from(new Set([...brandsList, ...names])); setBrandsList(merged); return names.length; } },
    { key: 'variants', labelBn: 'ভ্যারিয়েন্ট', labelEn: 'Variants', icon: Layers, rows: variants,
      sample: [{ id: 'VAR-01', name: 'RAM Size', description: '8GB, 12GB, 16GB' }],
      onImport: (rows) => { const merged = [...variants]; rows.forEach(r => { const idx = merged.findIndex((x: any) => x.id === r.id); if (idx >= 0) merged[idx] = { ...merged[idx], ...r }; else merged.push({ id: r.id || `VAR-${Date.now()}`, name: r.name || '', description: r.description || '' }); }); setVariants(merged); return rows.length; } },
    { key: 'units', labelBn: 'ইউনিট', labelEn: 'Units', icon: Ruler, rows: Object.entries(unitsByCategory || {}).flatMap(([category, us]) => (us || []).map((unit: string) => ({ category, unit }))),
      sample: [{ category: 'Electronics', unit: 'pcs' }, { category: 'Accessories', unit: 'box' }],
      onImport: (rows) => { const map = { ...unitsByCategory }; rows.forEach((r: any) => { const c = String(r.category || '').trim(); const u = String(r.unit || '').trim(); if (!c || !u) return; if (!map[c]) map[c] = []; if (!map[c].includes(u)) map[c].push(u); }); setUnitsByCategory(map); return rows.length; } },
    { key: 'warranty', labelBn: 'ওয়ারেন্টি রেকর্ড', labelEn: 'Warranty Records', icon: ShieldCheck, rows: warrantyRecords,
      sample: [{ productId: 'P-1001', productName: 'iPhone 15 Pro', serialNumber: 'SN123456', imei1: '350000000000001', imei2: '', warrantyType: '12 Months', warrantyExpiryDate: '2027-01-01' }],
      onImport: (rows) => {
        const existing = readLS('roni_warranty_records_v1', readLS('roni_serial_records_v1', []));
        const merged = [...existing, ...rows];
        localStorage.setItem('roni_serial_records_v1', JSON.stringify(merged));
        localStorage.setItem('roni_warranty_records_v1', JSON.stringify(merged));
        return rows.length;
      } },
    { key: 'stock_alerts', labelBn: 'স্টক সতর্কতা', labelEn: 'Stock Alerts', icon: AlertTriangle, rows: stockAlerts,
      sample: [{ productId: 'P-1001', productName: 'iPhone 15 Pro', stock: 2, reorderLevel: 5, status: 'Low Stock' }] },
  ];

  const active = datasets.find(d => d.key === dataset)!;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(active.rows.length ? active.rows : [{ info: 'No data' }]);
    XLSX.utils.book_append_sheet(wb, ws, active.labelEn.slice(0, 31));
    XLSX.writeFile(wb, `${active.key}-${Date.now()}.xlsx`);
    showToast(t('এক্সেল এক্সপোর্ট সম্পন্ন', 'Excel export complete'), 'success');
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(active.rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${active.key}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast(t('সিএসভি এক্সপোর্ট সম্পন্ন', 'CSV export complete'), 'success');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const rows = active.rows;
    const cols = rows.length ? Object.keys(rows[0]) : ['info'];
    const body = rows.length ? rows.map((r: any) => cols.map(c => String(r[c] ?? ''))) : [['No data']];
    doc.setFontSize(14);
    doc.text(`${active.labelEn} — Export`, 14, 14);
    autoTable(doc, { head: [cols], body, startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [12, 45, 140] } });
    doc.save(`${active.key}-${Date.now()}.pdf`);
    showToast(t('পিডিএফ এক্সপোর্ট সম্পন্ন', 'PDF export complete'), 'success');
  };

  const printData = () => {
    const rows = active.rows;
    const cols = rows.length ? Object.keys(rows[0]) : ['info'];
    const w = window.open('', '_blank'); if (!w) return;
    const html = `<html><head><title>${active.labelEn}</title>
      <style>body{font-family:Arial;padding:20px;color:#0f172a}h1{margin:0 0 12px;color:#0c2d8c}
      table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left}
      th{background:#0c2d8c;color:#fff}tr:nth-child(even){background:#f1f5f9}</style></head><body>
      <h1>${active.labelEn}</h1><p>Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r: any) => `<tr>${cols.map(c => `<td>${String(r[c] ?? '')}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}">No data</td></tr>`}</tbody>
      </table><script>window.onload=()=>window.print()</script></body></html>`;
    w.document.write(html); w.document.close();
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(active.sample);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${active.key}-template.xlsx`);
    showToast(t('নমুনা এক্সেল টেমপ্লেট ডাউনলোড হয়েছে', 'Sample Excel template downloaded'), 'success');
  };

  const onImportFile = (file: File) => {
    if (!active.onImport) { showToast(t('এই ডেটাসেট শুধু এক্সপোর্টযোগ্য', 'This dataset is export-only'), 'error'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as any[];
        const n = active.onImport!(rows);
        setLastImportSummary(`${n} ${t('টি রেকর্ড সফলভাবে ইমপোর্ট হয়েছে', 'records imported successfully')}`);
        showToast(`${n} ${t('টি রেকর্ড সফলভাবে ইমপোর্ট হয়েছে', 'records imported successfully')}`, 'success');
      } catch (err: any) {
        showToast(t('ইমপোর্ট ব্যর্থ: ', 'Import failed: ') + (err?.message || ''), 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl shrink-0">
            <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 dark:text-white text-lg sm:text-xl tracking-tight">
              {t('ইমপোর্ট / এক্সপোর্ট সেন্টার', 'Import & Export Center')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              {t('পণ্য, সার্ভিস ও পয়েন্ট-অব-সেল রেকর্ড এক্সেল বা সিএসভিতে ব্যাকআপ ও আপলোড করুন', 'Backup & import products, services & POS master data in Excel or CSV')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {datasets.map(d => {
          const IconComp = d.icon;
          const isSelected = dataset === d.key;
          return (
            <button 
              key={d.key} 
              onClick={() => { setDataset(d.key); setSelectedFile(null); setLastImportSummary(null); }}
              className={`p-3 rounded-2xl text-xs font-extrabold border transition flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {d.rows.length}
                </span>
              </div>
              <div className="font-bold text-xs truncate">{lang === 'bn' ? d.labelBn : d.labelEn}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FileDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">
                {t('১. এক্সপোর্ট করুন (Export Data)', '1. Export Data')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
              {t(`"${lang === 'bn' ? active.labelBn : active.labelEn}"-এর সমস্ত ডেটা বিভিন্ন ফরম্যাটে ডাউনলোড করুন`, `Download all data of "${active.labelEn}" in various formats`)}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={exportExcel} 
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-4 py-3 rounded-2xl transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
              </button>
              <button 
                onClick={exportCSV} 
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black px-4 py-3 rounded-2xl transition shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" /> CSV (.csv)
              </button>
              <button 
                onClick={exportPDF} 
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black px-4 py-3 rounded-2xl transition shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" /> PDF Document
              </button>
              <button 
                onClick={printData} 
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-black px-4 py-3 rounded-2xl transition shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" /> {t('প্রিন্ট রিপোর্ট', 'Print Report')}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={downloadTemplate} 
              className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold px-4 py-3 rounded-2xl transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('📥 নমুনা এক্সেল টেমপ্লেট ডাউনলোড (Sample .xlsx)', '📥 Download Sample Excel Template')}</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FileUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">
                {t('২. ইমপোর্ট করুন (Import Data)', '2. Import Data')}
              </h2>
            </div>

            {active.onImport ? (
              <>
                <div 
                  className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/30 dark:bg-indigo-950/20 transition cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-indigo-500 dark:text-indigo-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-extrabold text-slate-800 dark:text-white">
                    {t('ফাইল ড্রপ করুন অথবা নির্বাচন করতে ক্লিক করুন', 'Drag & drop file or click to browse')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                    {t('সমর্থিত ফরম্যাট: .xlsx / .csv', 'Supported formats: .xlsx / .csv')}
                  </div>

                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl shadow-xs">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span>{selectedFile.name}</span>
                    </div>
                  )}

                  <input 
                    ref={fileRef} 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }} 
                  />
                </div>

                {lastImportSummary && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3.5 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lastImportSummary}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                {t('এই ডেটাসেটটি শুধুমাত্র এক্সপোর্টযোগ্য (Computed System Log)', 'This dataset is export-only (Computed System Log)')}
              </div>
            )}
          </div>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {t('বিদ্যমান ডেটা সংরক্ষিত থাকবে। একই আইডি (ID) হলে পুরাতন রেকর্ড আপডেট হবে।', 'Existing data is preserved. Records with matching IDs will be updated.')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <span>📋 {t('ডেটা প্রিভিউ', 'Data Preview')}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              ({lang === 'bn' ? active.labelBn : active.labelEn})
            </span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {active.rows.length} {t('টি রেকর্ড সংগৃহীত', 'records available')}
          </span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black uppercase">
              <tr>
                <th className="px-3.5 py-3 text-center w-10">#</th>
                {(active.rows[0] ? Object.keys(active.rows[0]) : ['info']).map(colKey => (
                  <th key={colKey} className="px-3.5 py-3 whitespace-nowrap">
                    {lang === 'bn' ? (BENGALI_COLUMN_MAP[colKey] || colKey) : colKey}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {active.rows.slice(0, 50).map((r: any, i: number) => (
                <tr key={i} className="border-t border-slate-100">
                  {Object.keys(active.rows[0]).map(c => <td key={c} className="px-2 py-1.5 text-slate-600 truncate max-w-[180px]">{String(r[c] ?? '')}</td>)}
                </tr>
              ))}
              {!active.rows.length && <tr><td className="px-2 py-4 text-center text-gray-400">{t('কোনো ডেটা নেই', 'No data')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
