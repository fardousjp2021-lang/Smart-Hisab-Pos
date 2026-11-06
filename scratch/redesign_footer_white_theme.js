import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

const oldFooter = `<footer className="border-t transition-colors duration-300 border-slate-200 dark:border-slate-900 bg-slate-950 text-white py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8 text-left">
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-sky-400">
                SmartHisab POS & Stock Recorder v2.0
              </span>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                © {new Date().getFullYear()} Fardous Computer & IT Industry. All rights reserved globally.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-xs font-mono">
              <a href="mailto:info.fardousit@gmail.com" className="text-slate-400 hover:text-white transition duration-150">Mail Center</a>
              <span className="text-slate-700">|</span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition duration-150 underline underline-offset-2">Privacy Policy</a>
              <span className="text-slate-700">|</span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition duration-150 underline underline-offset-2">Terms of Service</a>
              <span className="text-slate-700">|</span>
              <span className="text-slate-400 font-bold">Helpline: 01747-046052</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-sans">
            <span>✓ Cloud Running Secure Containers</span>
            <span>✓ Encrypted Firestore Client DB</span>
            <span>✓ Free Lifetime Authorized Upgrades</span>
            <span>✓ Fardous Computer Official Release Product</span>
          </div>

        </div>
      </footer>`;

const newFooter = `<footer className="border-t transition-colors duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 text-center shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800 pb-6 text-left">
            <div className="space-y-1">
              <span className="text-lg sm:text-xl font-extrabold font-display tracking-tight text-[#8b26c7] dark:text-purple-400 flex items-center gap-2">
                <Cloud size={20} className="text-[#8b26c7]" /> SmartHisab POS & Stock Recorder v2.0
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">
                © {new Date().getFullYear()} Fardous Computer & IT Industry. All rights reserved globally.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-xs font-mono font-bold">
              <a href="mailto:info.fardousit@gmail.com" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150">Mail Center</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150 underline underline-offset-2">Privacy Policy</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150 underline underline-offset-2">Terms of Service</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[#8b26c7] font-extrabold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded border border-purple-200/60">Helpline: 01747-046052</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-bold font-sans">
            <span>✓ Cloud Running Secure Containers</span>
            <span>✓ Encrypted Firestore Client DB</span>
            <span>✓ Free Lifetime Authorized Upgrades</span>
            <span>✓ Fardous Computer Official Release Product</span>
          </div>

        </div>
      </footer>`;

if (lp.includes(oldFooter)) {
  lp = lp.replace(oldFooter, newFooter);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully redesigned footer to a clean white theme!');
} else {
  console.log('Old footer block not found in LandingPage.tsx');
}
