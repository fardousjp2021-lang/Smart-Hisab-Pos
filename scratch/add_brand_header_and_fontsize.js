import fs from 'fs';

// 1. Update StoreSettings.tsx to include storeFontSize & setStoreFontSize
let ss = fs.readFileSync('src/pos-app/components/StoreSettings.tsx', 'utf8');

if (!ss.includes('storeFontSize')) {
  ss = ss.replace(
    'logoPreview: string | null;',
    'logoPreview: string | null;\n  storeFontSize?: string;\n  setStoreFontSize?: (val: string) => void;'
  );

  ss = ss.replace(
    'logoPreview, setLogoPreview,',
    'logoPreview, setLogoPreview, storeFontSize = "base", setStoreFontSize,'
  );

  // Add Font Size selector control to Store Information card
  const fontSizeControl = `
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'সাইডবারে স্টোরের নামের ফন্ট সাইজ (Font Size)' : 'Sidebar Store Name Font Size'}
                </label>
                <select
                  value={storeFontSize}
                  onChange={(e) => setStoreFontSize && setStoreFontSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="sm">{lang === 'bn' ? 'ছোট (Small - 12px)' : 'Small (12px)'}</option>
                  <option value="base">{lang === 'bn' ? 'সাধারণ (Medium - 14px)' : 'Medium (14px)'}</option>
                  <option value="lg">{lang === 'bn' ? 'বড় (Large - 16px)' : 'Large (16px)'}</option>
                  <option value="xl">{lang === 'bn' ? 'অতিরিক্ত বড় (Extra Large - 18px)' : 'Extra Large (18px)'}</option>
                </select>
              </div>
  `;

  ss = ss.replace(
    '</div>\n\n              <div className="sm:col-span-2">',
    fontSizeControl + '\n              </div>\n\n              <div className="sm:col-span-2">'
  );

  fs.writeFileSync('src/pos-app/components/StoreSettings.tsx', ss, 'utf8');
  console.log('StoreSettings.tsx updated with storeFontSize control!');
}

// 2. Update App.tsx state & Sidebar Header
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

if (!app.includes('const [storeFontSize, setStoreFontSize]')) {
  app = app.replace(
    "const [logoPreview, setLogoPreview] = useState<string | null>(null);",
    "const [logoPreview, setLogoPreview] = useState<string | null>(null);\n  const [storeFontSize, setStoreFontSize] = useState<string>('base');"
  );
}

// Pass storeFontSize and setStoreFontSize to StoreSettings render block in App.tsx
if (!app.includes('storeFontSize={storeFontSize}')) {
  app = app.replace(
    'logoPreview={logoPreview}',
    'logoPreview={logoPreview}\n                  storeFontSize={storeFontSize}\n                  setStoreFontSize={setStoreFontSize}'
  );
}

// Insert Top Sidebar Brand Header inside <aside>
const sidebarHeaderJsx = `
            {/* Top Sidebar Store Brand Header */}
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
            </div>
`;

if (!app.includes('Top Sidebar Store Brand Header')) {
  app = app.replace(
    '<div className="flex flex-col h-full overflow-hidden pt-3">',
    '<div className="flex flex-col h-full overflow-hidden">\n' + sidebarHeaderJsx
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('App.tsx updated with Top Sidebar Store Brand Header & storeFontSize!');
}
