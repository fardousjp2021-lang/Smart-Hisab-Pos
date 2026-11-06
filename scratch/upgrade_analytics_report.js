import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const analyticsKpiCards = `
      {/* Analytics KPI Summary Cards */}
      {subId === 'rep_analytics' && viewLedgerMode === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-indigo-600 font-black tracking-wide uppercase">
              <span>{tt(lang, 'সেরা বিক্রীত পণ্য (Top Item)', 'Top Selling Product')}</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 tracking-tight truncate">{analytics[0]?.name || '—'}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{analytics[0]?.units || 0} {tt(lang, 'টি পিস বিক্রি হয়েছে', 'units sold')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-cyan-600 font-black tracking-wide uppercase">
              <span>{tt(lang, 'মোট বিক্রিত ইউনিট (Units)', 'Total Units Sold')}</span>
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 mt-2 tracking-tight">{analytics.reduce((a, b) => a + Number(b.units || 0), 0).toLocaleString('en-US')} <span className="text-sm font-bold text-slate-500">pcs</span></div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{analytics.length} {tt(lang, 'টি ভিন্ন ভিন্ন পণ্য', 'unique items')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-blue-600 font-black tracking-wide uppercase">
              <span>{tt(lang, 'মোট রেভিনিউ (Revenue)', 'Total Revenue')}</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">{money(analytics.reduce((a, b) => a + Number(b.revenue || 0), 0))}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'অ্যানালিটিক্স আয় সমষ্টি', 'Aggregated revenue')}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between text-xs text-emerald-600 font-black tracking-wide uppercase">
              <span>{tt(lang, 'মোট প্রফিট (Net Profit)', 'Total Profit')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 tracking-tight">{canSeeCost ? money(analytics.reduce((a, b) => a + Number(b.profit || 0), 0)) : '—'}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{tt(lang, 'পণ্য ভিত্তিক মোট লাভ', 'Aggregated net margin')}</div>
          </div>
        </div>
      )}
`;

if (!rc.includes("subId === 'rep_analytics' && viewLedgerMode === 'main'")) {
  rc = rc.replace(
    '      {/* Ledger Mode Selector Bar */}',
    analyticsKpiCards + '\n      {/* Ledger Mode Selector Bar */}'
  );
  fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
  console.log('Successfully added Analytics KPI summary cards to ReportCenter.tsx!');
} else {
  console.log('Analytics KPI cards already present!');
}
