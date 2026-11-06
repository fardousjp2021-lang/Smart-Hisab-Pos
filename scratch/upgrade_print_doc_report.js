import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const printDocCards = `
      {/* Export & Print Interactive Action Cards */}
      {subId === 'print_doc' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => exportCSV([active.headers, ...active.rows], \`\${active.title}_\${startDate}_\${endDate}.csv\`)}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-emerald-700 font-black tracking-wide uppercase">
              <span>{tt(lang, 'CSV ফাইল ডাউনলোড', 'Export CSV File')}</span>
              <div className="p-2 rounded-xl bg-emerald-500 text-white group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-emerald-900 mt-2 tracking-tight">{tt(lang, 'স্প্রেডশিট ডেটা', 'Spreadsheet CSV')}</div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">{tt(lang, 'দ্রুত CSV ফাইল জেনারেট করুন', 'Generate instant CSV document')}</div>
          </button>

          <button
            onClick={() => exportExcel(active.headers, active.rows, active.title, \`\${active.title}_\${startDate}_\${endDate}.xlsx\`)}
            disabled={exporting === 'excel'}
            className="rounded-2xl border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-xs text-emerald-100 font-black tracking-wide uppercase">
              <span>{tt(lang, 'Excel ফাইল ডাউনলোড', 'Export Excel File')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2 tracking-tight">{exporting === 'excel' ? 'প্রসেস হচ্ছে...' : tt(lang, 'মাইক্রোসফট এক্সেল', 'Microsoft Excel')}</div>
            <div className="text-xs text-emerald-100 mt-1 font-medium">{tt(lang, 'ফরম্যাটকৃত এক্সেল ওয়ার্কশিট', 'Formatted XLSX workbook')}</div>
          </button>

          <button
            onClick={() => exportPDF(active.title, active.headers, active.rows, \`\${active.title}_\${startDate}_\${endDate}.pdf\`)}
            disabled={exporting === 'pdf'}
            className="rounded-2xl border border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-xs text-indigo-100 font-black tracking-wide uppercase">
              <span>{tt(lang, 'PDF নথি ডাউনলোড', 'Export PDF Document')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2 tracking-tight">{exporting === 'pdf' ? 'প্রসেস হচ্ছে...' : tt(lang, 'পিডিএফ লেআউট', 'PDF Document')}</div>
            <div className="text-xs text-indigo-100 mt-1 font-medium">{tt(lang, 'প্রিন্ট-প্রস্তুত পিডিএফ ফরম্যাট', 'Print-ready PDF report')}</div>
          </button>

          <button
            onClick={doPrint}
            className="rounded-2xl border border-slate-300 bg-slate-800 text-white hover:bg-slate-900 p-5 shadow-sm hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-300 font-black tracking-wide uppercase">
              <span>{tt(lang, 'সরাসরি প্রিন্ট', 'Direct Print')}</span>
              <div className="p-2 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2 tracking-tight">{tt(lang, 'ব্রাউজার প্রিন্ট লেআউট', 'Browser Print Preview')}</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">{tt(lang, 'কাগজে প্রিন্ট করার পৃষ্ঠা', 'Physical paper invoice print')}</div>
          </button>
        </div>
      )}
`;

if (!rc.includes("subId === 'print_doc' && viewLedgerMode === 'main'")) {
  rc = rc.replace(
    '      {/* Ledger Mode Selector Bar */}',
    printDocCards + '\n      {/* Ledger Mode Selector Bar */}'
  );
  fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
  console.log('Successfully added Export & Print interactive action cards to ReportCenter.tsx!');
} else {
  console.log('Export & Print action cards already present!');
}
