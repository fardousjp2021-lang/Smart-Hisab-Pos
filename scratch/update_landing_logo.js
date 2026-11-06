import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

const oldLogoBlock = `{/* Exact Logo matches Glorious IT globe mockup */}
          <div className="flex items-center gap-2.5">
            {/* SVG Globe + Styled text */}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
                {/* Globe Circle Representation */}
                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-spin-slow border border-blue-500/25"></div>
                <Globe className="h-7.5 w-7.5 text-sky-600 dark:text-sky-400 relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-sans font-black text-[22px] tracking-tight text-[#004b73] dark:text-sky-400">
                    Fardous
                  </span>
                  <span className="bg-[#004b73] text-white px-1.5 py-0.5 rounded font-sans font-black text-[15px] leading-tight select-none">
                    IT
                  </span>
                </div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-slate-400 dark:text-slate-500 block mt-1 uppercase">
                  Your Trusted IT Partner
                </span>
              </div>
            </div>
          </div>`;

const newLogoBlock = `{/* SmartHisab Official Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/smarthisab_logo.png" 
              alt="SmartHisab — Cloud-Based Business POS Software" 
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]" 
            />
          </div>`;

if (lp.includes(oldLogoBlock)) {
  lp = lp.replace(oldLogoBlock, newLogoBlock);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully updated LandingPage logo to SmartHisab official logo!');
} else {
  console.log('Old logo block not found in LandingPage.tsx');
}
