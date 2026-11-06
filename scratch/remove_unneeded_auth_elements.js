import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Remove Demo details accordion
const demoAccordionSnippet = `{/* Demo login moved behind a disclosure so paying users do not perceive
                      the production sign-in card as an unfinished testing surface. */}
                  <details className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300 min-h-[44px]">
                      <span className="flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-500" aria-hidden="true" />
                        সাইন-ইন না করে ডেমো দেখতে চান?
                      </span>
                      <ChevronDown size={16} className="transition group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="px-4 pb-4 pt-1 space-y-2">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        ডেমো মোডে তৈরি ডেটা আপনার আসল অ্যাকাউন্টে সেভ হবে না — শুধু ফিচার পরীক্ষার জন্য ব্যবহার করুন।
                      </p>
                      <button
                        onClick={demoLogin}
                        type="button"
                        className="w-full min-h-[44px] py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow"
                      >
                        <Sparkles size={15} className="text-amber-300" aria-hidden="true" />
                        <span>ডেমো / গেস্ট মোডে চালু করুন</span>
                      </button>
                    </div>
                  </details>`;

// 2. Remove Locator Map Frame
const mapSnippet = `{/* Locator Map Frame */}
              <div className="rounded-2xl overflow-hidden h-32 bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 relative">
                <iframe
                  title="Fardous Computer Location Map"
                  src="https://maps.google.com/maps?q=Jaintapur,%20Bangladesh&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 rounded-2xl"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>`;

if (lp.includes(demoAccordionSnippet)) {
  lp = lp.replace(demoAccordionSnippet, '');
}

if (lp.includes(mapSnippet)) {
  lp = lp.replace(mapSnippet, '');
}

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully removed redundant Auth elements (Demo accordion & map frame) from LandingPage.tsx!');
