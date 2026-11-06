import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Add platformBrandName & platformBrandBadge state variables to App.tsx
const stateVars = `
  // White-Label Platform Branding (Super Admin Editable)
  const [platformBrandName, setPlatformBrandName] = useState<string>(function() {
    return localStorage.getItem('saim_platform_brand_name') || 'Nexus';
  });
  const [platformBrandBadge, setPlatformBrandBadge] = useState<string>(function() {
    return localStorage.getItem('saim_platform_brand_badge') || 'ERP';
  });
  const [editingPlatformBrandName, setEditingPlatformBrandName] = useState<string>(platformBrandName);
  const [editingPlatformBrandBadge, setEditingPlatformBrandBadge] = useState<string>(platformBrandBadge);
`;

if (!app.includes('platformBrandName')) {
  app = app.replace(
    "const [storeFontSize, setStoreFontSize] = useState<string>('base');",
    "const [storeFontSize, setStoreFontSize] = useState<string>('base');\n" + stateVars
  );
}

// 2. Add Topbar Platform Brand Display next to Hamburger menu
const topbarBrandJsx = `
            {/* White-Label Platform Brand Header (Super Admin Editable) */}
            <div className="flex items-center gap-1.5 font-sans font-black text-lg text-white tracking-wide select-none ml-1">
              <span>{platformBrandName || 'Nexus'}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase shadow-sm">
                {platformBrandBadge || 'ERP'}
              </span>
            </div>
`;

if (!app.includes('White-Label Platform Brand Header')) {
  app = app.replace(
    'title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}\n            >\n              <Menu className="h-5 w-5" />\n            </button>',
    'title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}\n            >\n              <Menu className="h-5 w-5" />\n            </button>\n' + topbarBrandJsx
  );
}

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('App.tsx updated with dynamic platform branding state & topbar header!');
