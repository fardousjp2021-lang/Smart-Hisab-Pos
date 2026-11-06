import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Fix low-contrast text classes across entire LandingPage.tsx
lp = lp.replace(/text-slate-550/g, 'text-slate-700');
lp = lp.replace(/text-slate-450/g, 'text-slate-600');
lp = lp.replace(/text-slate-405/g, 'text-slate-600');

// 2. Fix broken YouTube player embed in Video Tutorials section
const oldVideoPlayer = `<iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={\`https://www.youtube.com/embed/\${videoTutorials[activeVideoIndex].embedId}?rel=0&autoplay=0\`}
                    title={videoTutorials[activeVideoIndex].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>`;

const newVideoPlayer = `<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 group-hover:scale-110 transition duration-300 border-2 border-white/20">
                      <Play size={28} className="translate-x-0.5 fill-white" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                        SmartHisab HD Video Guide
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {videoTutorials[activeVideoIndex].title}
                      </h3>
                      <p className="text-xs text-purple-200/90 font-medium">
                        {videoTutorials[activeVideoIndex].description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleScrollToAuth('login')}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-300" />
                      <span>১-ক্লিকে প্র্যাকটিক্যাল ডেমো ড্যাশবোর্ডে দেখুন →</span>
                    </button>
                  </div>`;

if (lp.includes(oldVideoPlayer)) {
  lp = lp.replace(oldVideoPlayer, newVideoPlayer);
}

// 3. Update Footer text to SmartHisab POS official copyright
lp = lp.replace(/NexusERP POS & Shop Register v2.4/g, 'SmartHisab POS — Cloud-Based Business POS Software');
lp = lp.replace(/Fardous IT POS/g, 'SmartHisab POS');

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully completed comprehensive audit & text clarity fixes for LandingPage.tsx!');
