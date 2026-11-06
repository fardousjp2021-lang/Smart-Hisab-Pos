import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Wrench, RefreshCw, X, Layers } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  status?: string;
  date?: string;
}

interface Props {
  lang: 'bn' | 'en';
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  products?: any[];
  setProducts?: React.Dispatch<React.SetStateAction<any[]>>;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface ParsedServiceRow {
  rowNum: number;
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  status: string;
  isValid: boolean;
  isDuplicateID: boolean;
  validationError?: string;
}

export const ImportServices: React.FC<Props> = ({
  lang,
  services,
  setServices,
  products = [],
  setProducts,
  showToast,
}) => {
  const isBn = lang === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedServiceRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);

  // Generate and download a sample Services Excel / CSV template
  const handleDownloadSampleServicesTemplate = () => {
    const sampleData = [
      {
        'Service Name (সার্ভিসের নাম)': 'Display Replacement (Redmi Note 13)',
        'Service Code (সার্ভিস কোড/আইডি)': 'SRV-801',
        'Category (ক্যাটাগরি)': 'Hardware',
        'Service Fee (সার্ভিস ফি ৳)': 2500,
        'Description (বিবরণ)': 'Original OLED Display with 1 Month Touch Warranty',
        'Status (স্ট্যাটাস)': 'Active',
      },
      {
        'Service Name (সার্ভিসের নাম)': 'Software Flash & Unlocking',
        'Service Code (সার্ভিস কোড/আইডি)': 'SRV-802',
        'Category (ক্যাটাগরি)': 'Software',
        'Service Fee (সার্ভিস ফি ৳)': 500,
        'Description (বিবরণ)': 'Official Firmware Flashing & FRP Unlock',
        'Status (স্ট্যাটাস)': 'Active',
      },
      {
        'Service Name (সার্ভিসের নাম)': 'Battery Change & Charging Port Fix',
        'Service Code (সার্ভিস কোড/আইডি)': 'SRV-803',
        'Category (ক্যাটাগরি)': 'Servicing',
        'Service Fee (সার্ভিস ফি ৳)': 1200,
        'Description (বিবরণ)': 'High Capacity Battery Replacement',
        'Status (স্ট্যাটাস)': 'Active',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Services_Template');
    XLSX.writeFile(wb, `smarthisab_services_import_template.xlsx`);

    showToast?.(
      isBn ? 'স্যাম্পল সার্ভিস ইমপোর্ট এক্সেল টেমপ্লেট ডাউনলোড করা হয়েছে!' : 'Sample services import template downloaded!',
      'success'
    );
  };

  // Parse uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          showToast?.(isBn ? 'ফাইলটিতে কোনো তথ্য পাওয়া যায়নি!' : 'No rows found in the uploaded file!', 'error');
          setIsProcessing(false);
          return;
        }

        const existingServiceIds = new Set(services.map(s => (s.id || '').toLowerCase()));

        const rows: ParsedServiceRow[] = rawData.map((row, idx) => {
          const name = String(row['Service Name (সার্ভিসের নাম)'] || row['Service Name'] || row['name'] || row['Title'] || row['সার্ভিসের নাম'] || '').trim();
          const rawCode = String(row['Service Code (সার্ভিস কোড/আইডি)'] || row['Service Code'] || row['code'] || row['id'] || row['ID'] || '').trim();
          const category = String(row['Category (ক্যাটাগরি)'] || row['Category'] || row['category'] || row['ক্যাটাগরি'] || 'Servicing').trim();
          const price = parseFloat(String(row['Service Fee (সার্ভিস ফি ৳)'] || row['Service Fee'] || row['price'] || row['Fee'] || 0)) || 0;
          const description = String(row['Description (বিবরণ)'] || row['Description'] || row['description'] || row['বিবরণ'] || '').trim();
          const status = String(row['Status (স্ট্যাটাস)'] || row['Status'] || row['status'] || 'Active').trim();

          const generatedId = rawCode || ("SRV-" + Math.floor(100 + Math.random() * 900));
          const isDuplicateID = existingServiceIds.has(generatedId.toLowerCase());
          const isValid = name.length > 0 && price >= 0;

          let validationError = '';
          if (!name) validationError = isBn ? 'সার্ভিসের নাম অনুপস্থিত' : 'Service name missing';
          else if (price < 0) validationError = isBn ? 'ভুল সার্ভিস চার্জ' : 'Invalid fee amount';

          return {
            rowNum: idx + 1,
            id: generatedId,
            name,
            category,
            price,
            description,
            status,
            isValid,
            isDuplicateID,
            validationError,
          };
        });

        setParsedRows(rows);
        showToast?.(
          isBn ? `সফলভাবে ${rows.length}টি সার্ভিস রিড করা হয়েছে!` : `Parsed ${rows.length} service rows!`,
          'info'
        );
      } catch (err) {
        console.error(err);
        showToast?.(isBn ? 'ফাইল প্রসেস করতে ব্যর্থ হয়েছে!' : 'Failed to parse file structure!', 'error');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Execute import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast?.(isBn ? 'ইমপোর্ট করার মতো কোনো বৈধ সার্ভিস নেই!' : 'No valid service rows to import!', 'error');
      return;
    }

    const newServicesList: ServiceItem[] = [...services];
    const newProductsList: any[] = products ? [...products] : [];

    let addedCount = 0;
    let updatedCount = 0;

    validRows.forEach(row => {
      const existingIdx = newServicesList.findIndex(s => (s.id || '').toLowerCase() === row.id.toLowerCase());
      
      const serviceData: ServiceItem = {
        id: row.id,
        name: row.name,
        category: row.category || 'Servicing',
        price: row.price,
        description: row.description,
        status: row.status || 'Active',
        date: new Date().toISOString().slice(0, 10),
      };

      if (existingIdx > -1) {
        newServicesList[existingIdx] = serviceData;
        updatedCount++;
      } else {
        newServicesList.unshift(serviceData);
        addedCount++;
      }

      // Also sync into products list as itemType: 'SERVICE'
      if (setProducts) {
        const prodIdx = newProductsList.findIndex(p => (p.id || '').toLowerCase() === row.id.toLowerCase());
        const prodData = {
          id: row.id,
          name: row.name,
          category: row.category || 'Servicing',
          purchasePrice: 0,
          sellingPrice: row.price,
          stock: 999, // Infinite stock for services
          unit: 'JOB',
          brand: 'Service',
          itemType: 'SERVICE',
          status: row.status || 'Active',
          description: row.description,
        };
        if (prodIdx > -1) {
          newProductsList[prodIdx] = { ...newProductsList[prodIdx], ...prodData };
        } else {
          newProductsList.unshift(prodData);
        }
      }
    });

    // Commit to state
    setServices(newServicesList);
    if (setProducts) setProducts(newProductsList);

    // Persist to localStorage
    try {
      localStorage.setItem('pos_services_v1', JSON.stringify(newServicesList));
      if (setProducts) {
        localStorage.setItem('pos_products_v1', JSON.stringify(newProductsList));
      }
    } catch (e) {}

    setImportCompleted(true);
    showToast?.(
      isBn 
        ? `সার্ভিস ইমপোর্ট সম্পন্ন! ${addedCount}টি নতুন এবং ${updatedCount}টি সার্ভিস আপডেট করা হয়েছে।`
        : `Import Success! ${addedCount} new services added & ${updatedCount} updated.`,
      'success'
    );
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicateID).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6 text-left font-sans animate-fadeIn select-none">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              📥 {isBn ? "ইমপোর্ট সার্ভিসেস ( Import Services )" : "Bulk Import Service Catalog"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isBn ? "মোবাইল মেকানিক, সার্ভিসিং ও সফটওয়্যার সার্ভিস সমূহের ক্যাটালগ এক ক্লিকে আপলোড করুন" : "Upload Excel or CSV files to add mobile repair & software services to catalog in bulk"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadSampleServicesTemplate}
          className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{isBn ? "স্যাম্পল সার্ভিস এক্সেল ডাউনলোড" : "Download Service Template"}</span>
        </button>
      </div>

      {/* Upload Dropzone Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {selectedFile ? selectedFile.name : (isBn ? "সার্ভিস লিস্ট এক্সেল বা CSV ফাইল সিলেক্ট করুন" : "Select Service List Excel/CSV File")}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {isBn ? "ফাইল ফরম্যাট: .xlsx, .xls, .csv" : "Supported formats: .xlsx, .xls, .csv"}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? (isBn ? "অন্য ফাইল সিলেক্ট করুন" : "Choose Another File") : (isBn ? "ফাইল আপলোড করুন" : "Browse File")}</span>
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setParsedRows([]);
                  setImportCompleted(false);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                ✕ {isBn ? "ক্লিয়ার" : "Clear"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parsed Results & Data Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Summary KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{isBn ? "মোট সার্ভিস" : "Parsed Services"}</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white mt-1 block">{parsedRows.length} {isBn ? "টি" : "services"}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">{isBn ? "বৈধ সার্ভিস" : "Valid Services"}</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">✓ {validCount} {isBn ? "টি" : ""}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">{isBn ? "বিদ্যমান আইডি (আপডেট হবে)" : "Duplicate Service IDs"}</span>
              <span className="text-xl font-bold text-amber-600 mt-1 block">⚠️ {duplicateCount} {isBn ? "টি" : ""}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">{isBn ? "ত্রুটিপূর্ণ সারি" : "Invalid Rows"}</span>
              <span className="text-xl font-bold text-rose-600 mt-1 block">✕ {invalidCount} {isBn ? "টি" : ""}</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  📋 {isBn ? "সার্ভিস ডাটা প্রিভিউ ও ভ্যালিডেশন" : "Service Data Preview Table"}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {isBn ? "ক্যাটালগে ইমপোর্ট করার জন্য প্রস্তুতকৃত সার্ভিসসমূহ দেখে নিন" : "Verify service titles and pricing fees before finalizing import"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={validCount === 0 || importCompleted}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {importCompleted 
                    ? (isBn ? "ইমপোর্ট সম্পন্ন হয়েছে ✓" : "Import Completed ✓")
                    : (isBn ? `ইমপোর্ট সম্পন্ন করুন (${validCount}টি)` : `Finalize Import (${validCount})`)}
                </span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10.5px] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3 text-center">Row</th>
                    <th className="py-3 px-3">{isBn ? "সার্ভিসের নাম" : "Service Name"}</th>
                    <th className="py-3 px-3">Service ID</th>
                    <th className="py-3 px-3">{isBn ? "ক্যাটাগরি" : "Category"}</th>
                    <th className="py-3 px-3 text-right">{isBn ? "সার্ভিস ফি (৳)" : "Service Fee"}</th>
                    <th className="py-3 px-3">{isBn ? "বিবরণ" : "Description"}</th>
                    <th className="py-3 px-3 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {parsedRows.map(r => (
                    <tr
                      key={r.rowNum}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        !r.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : r.isDuplicateID ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{r.rowNum}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                        {r.name || <span className="text-rose-500 font-semibold italic">{isBn ? "নাম অনুপস্থিত" : "Missing Name"}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{r.id}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{r.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">৳{r.price.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[200px] truncate" title={r.description}>{r.description || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        {!r.isValid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                            ✕ {r.validationError || 'Invalid'}
                          </span>
                        ) : r.isDuplicateID ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                            ⚠️ Update ID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                            ✓ Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ImportServices;

