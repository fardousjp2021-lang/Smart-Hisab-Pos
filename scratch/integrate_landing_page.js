import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Add import
if (!app.includes("import { LandingPage }")) {
  app = app.replace(
    "import { CustomerSupportDesk } from './components/CustomerSupportDesk';",
    "import { CustomerSupportDesk } from './components/CustomerSupportDesk';\nimport { LandingPage } from './components/LandingPage';"
  );
}

// 2. Add state isLandingPageVisible
if (!app.includes("isLandingPageVisible")) {
  app = app.replace(
    "const [storeFontSize, setStoreFontSize] = useState<string>('base');",
    "const [storeFontSize, setStoreFontSize] = useState<string>('base');\n  const [isLandingPageVisible, setIsLandingPageVisible] = useState<boolean>(false);"
  );
}

// 3. Add Topbar Landing Page Button next to Quick Add or Role switcher
const topbarBtnSnippet = `<button
              onClick={function() { setIsLandingPageVisible(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md border border-indigo-400/30 transition cursor-pointer active:scale-95 ml-2"
              title="ওয়েবসাইট পাবলিক হোম পেজ দেখুন"
            >
              <Globe className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline">পাবলিক হোম পেজ</span>
            </button>`;

if (!app.includes("setIsLandingPageVisible(true)")) {
  app = app.replace(
    `{/* White-Label Platform Brand Header (Super Admin Editable) */}`,
    topbarBtnSnippet + `\n\n            {/* White-Label Platform Brand Header (Super Admin Editable) */}`
  );
}

// 4. Render LandingPage full-screen if isLandingPageVisible is true
const landingRenderBlock = `{isLandingPageVisible ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <div className="relative">
            <button
              onClick={function() { setIsLandingPageVisible(false); }}
              className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-2xl transition flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <span>🔑 ড্যাশবোর্ডে ফিরে যান (Return to Dashboard)</span>
            </button>
            <LandingPage
              theme={theme || 'dark'}
              toggleTheme={toggleTheme || (() => {})}
              onEnterApp={function() { setIsLandingPageVisible(false); }}
            />
          </div>
        </div>
      ) : (`;

if (!app.includes("isLandingPageVisible ? (")) {
  app = app.replace(
    `<div className="flex flex-col h-screen overflow-hidden no-print bg-[rgb(1,12,45)]">`,
    landingRenderBlock + `\n      <div className="flex flex-col h-screen overflow-hidden no-print bg-[rgb(1,12,45)]">`
  );

  // Close ternary at end of main layout
  app = app.replace(
    `</footer>\n      </div>`,
    `</footer>\n      </div>\n      )}`
  );
}

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('Successfully integrated LandingPage into App.tsx!');
