import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldHeaderSnippet = `            {/* Top Sidebar Store Brand Header */}
            <div className={\`border-b border-white/10 transition-all \${isSidebarCollapsed ? 'p-2 text-center' : 'p-3.5 flex items-center gap-3'}\`}>
              <div className={\`shrink-0 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-inner \${isSidebarCollapsed ? 'w-10 h-10 mx-auto' : 'w-11 h-11'}\`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-amber-300" />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div 
                    className={\`font-black text-white leading-tight truncate tracking-tight \${
                      storeFontSize === 'sm' ? 'text-xs' :
                      storeFontSize === 'lg' ? 'text-base' :
                      storeFontSize === 'xl' ? 'text-lg' : 'text-sm'
                    }\`}
                    title={shopName}
                  >
                    {shopName || 'রনি টেলিকম'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                      {storeCode || 'ST0002'}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-0.5">
                      ● {lang === 'bn' ? 'অনলাইন' : 'Online'}
                    </span>
                  </div>
                </div>
              )}
            </div>`;

const newHeaderSnippet = `            {/* Top Sidebar Store Brand Header (Full-Width High Visibility) */}
            <div className={\`border-b border-white/10 transition-all \${isSidebarCollapsed ? 'p-2 text-center' : 'px-4 py-3.5 bg-white/5'}\`}>
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
                    className={\`font-black text-white leading-tight tracking-wide break-words drop-shadow-sm \${
                      storeFontSize === 'sm' ? 'text-base' :
                      storeFontSize === 'lg' ? 'text-xl' :
                      storeFontSize === 'xl' ? 'text-2xl' : 'text-lg sm:text-xl'
                    }\`}
                    title={shopName}
                  >
                    {shopName || 'রনি টেলিকম'}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
                      {storeCode || 'ST0002'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {lang === 'bn' ? 'অনলাইন' : 'Online'}
                    </span>
                  </div>
                </div>
              )}
            </div>`;

if (app.includes(oldHeaderSnippet)) {
  app = app.replace(oldHeaderSnippet, newHeaderSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully upgraded sidebar store name to full-width large high-visibility font!');
} else {
  console.log('Old header snippet not found in App.tsx');
}
