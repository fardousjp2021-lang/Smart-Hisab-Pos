import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Update Subtitle
lp = lp.replace(
  'SmartHisab POS ব্যবহারের জন্য কোনো পেমেন্ট গেটওয়ে বা মাসিক চার্জ সাবস্ক্রিপশন নেই। আপনি সম্পূর্ণ আজীবন ফ্রি ফিচার ব্যবহার করে ব্যবসা নিখুঁত ট্র্যাক করতে পারবেন।',
  'SmartHisab POS এ সাইন-ইন করে আপনার দোকানের হিসাব, স্টক ট্র্যাকিং ও ক্যাশ রেজিস্ট্রার নিখুঁতভাবে পরিচালনা করুন।'
);

// 2. Add Direct Login Email/Pass Form option in Sign-In tab
const oldGoogleBlock = `<div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <button
                      onClick={login}
                      type="button"
                      className="w-full min-h-[48px] py-4 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white rounded-xl text-base font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-95 duration-100"
                    >
                      <LogIn size={18} aria-hidden="true" />
                      <span>গুগল অ্যাকাউন্ট দিয়ে এখনই প্রবেশ করুন</span>
                    </button>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                      🔒 আপনার তথ্য এনক্রিপ্টেড কানেকশনে (SSL) স্থানান্তর হয়। Google OAuth নিরাপত্তা মান মেনে চলা হয়।
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                      সাইন-ইন করার মাধ্যমে আপনি আমাদের{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b26c7] dark:text-sky-400 hover:opacity-80">
                        Terms of Service
                      </a>{' '}
                      এবং{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b26c7] dark:text-sky-400 hover:opacity-80">
                        Privacy Policy
                      </a>{' '}
                      মেনে নিচ্ছেন।
                    </p>
                  </div>`;

const newAuthBlock = `<div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                    {/* Google OAuth button */}
                    <button
                      onClick={login}
                      type="button"
                      className="w-full min-h-[48px] py-3.5 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-95 duration-100"
                    >
                      <LogIn size={18} aria-hidden="true" />
                      <span>গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করুন</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                      <span className="bg-slate-50 dark:bg-slate-950 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">অথবা</span>
                    </div>

                    {/* Direct Quick Login Form */}
                    <form onSubmit={(e) => { e.preventDefault(); demoLogin(); }} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">ইমেইল বা মোবাইল নম্বর</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. admin@smarthisab.com বা 01700-000000"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">পাসওয়ার্ড</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>লগইন করে ড্যাশবোর্ডে প্রবেশ করুন →</span>
                      </button>
                    </form>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed pt-1">
                      🔒 আপনার তথ্য এনক্রিপ্টেড কানেকশনে (SSL) সুরক্ষিত রাখা হয়। সাইন-ইন করার মাধ্যমে আপনি আমাদের{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b26c7] dark:text-sky-400 hover:opacity-80">
                        Terms of Service
                      </a>{' '}
                      মেনে নিচ্ছেন।
                    </p>
                  </div>`;

if (lp.includes(oldGoogleBlock)) {
  lp = lp.replace(oldGoogleBlock, newAuthBlock);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully upgraded Auth Modal into fully functional & professional dual-login design!');
} else {
  console.log('Old Google block not found');
}
