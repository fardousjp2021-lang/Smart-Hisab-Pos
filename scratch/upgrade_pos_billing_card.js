import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

const oldBillingCard = `{activeFeatureTab === 'billing' && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-[#8b26c7] font-bold bg-purple-500/10 px-2.5 py-1 rounded-md">পয়েন্ট অফ সেলস (POS) বিলিং স্ক্রিন</span>
                    <h3 className="text-xl font-bold">কীবোর্ড শর্টকাট ও সুপার ফাস্ট ক্যাশ রেজিস্টার</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      আপনার ক্যাশ কাউন্টারের কর্মচারীদের জন্য বিল বুক করা ডালভাত করা হয়েছে। আপনি কাস্টমারের নাম এবং মোবাইল নাম্বার দিয়ে বিল বুক করতে পারবেন। এছাড়াও সরাসরি থার্মাল প্রিন্টারে ৫০মিমি বা ৮০মিমি চওড়া কাস্টমার ভাউচার প্রিন্ট করার সাপোর্ট পাবেন।
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl grid grid-cols-2 gap-4">
                      <div className="flex gap-2 text-xs">
                        <Zap size={14} className="text-[#8b26c7] shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">১ ক্লিকে মেমো রসিদ প্রিন্ট</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Smartphone size={14} className="text-[#8b26c7] shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">মোবাইল ডিসপ্লেতে রেসপন্সিভ ভিউ</span>
                      </div>
                    </div>
                  </div>
                )}`;

const newBillingCard = `{activeFeatureTab === 'billing' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8b26c7] font-black bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-200/60">
                        পয়েন্ট অফ সেলস (POS) বিলিং স্ক্রিন
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        ⚡ ইনস্ট্যান্ট ক্যাশ রেজিস্টার
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      কীবোর্ড শর্টকাট ও সুপার ফাস্ট ক্যাশ রেজিস্টার
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed font-sans">
                      আপনার ক্যাশ কাউন্টারের কর্মচারীদের জন্য বিল বুক করা ডালভাত করা হয়েছে। কাস্টমারের নাম এবং মোবাইল নম্বর দিয়ে নিমেষেই বিল বুক করতে পারবেন। এছাড়াও সরাসরি থার্মাল প্রিন্টারে ৫০মিমি বা ৮০মিমি চওড়া কাস্টমার মেমো ভাউচার প্রিন্ট করার সাপোর্ট পাবেন।
                    </p>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 shadow-2xs">
                        <Zap size={16} className="text-[#8b26c7] shrink-0 font-bold" />
                        <span className="text-xs font-bold text-slate-950 dark:text-white">১ ক্লিকে মেমো রসিদ প্রিন্ট</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 shadow-2xs">
                        <Smartphone size={16} className="text-[#8b26c7] shrink-0 font-bold" />
                        <span className="text-xs font-bold text-slate-950 dark:text-white">মোবাইল ডিসপ্লেতে রেসপন্সিভ ভিউ</span>
                      </div>
                    </div>

                    {/* Interactive Sample POS Memo Card Preview */}
                    <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-md space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-white/20 pb-2">
                        <span className="font-extrabold text-amber-300">📜 নমুনা ক্যাশ মেমো রসিদ (POS Receipt)</span>
                        <span className="bg-emerald-500 text-slate-950 text-[9px] px-2 py-0.5 rounded font-black">PAID</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>স্মার্ট গ্যাজেট হেডফোন (x১)</span>
                        <span className="font-bold">৳১,২০০</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>ডিসকাউন্ট (৫%)</span>
                        <span className="text-rose-300">-৳৬০</span>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-1 border-t border-white/10 text-amber-300">
                        <span>সর্বমোট পরিগ্রেহনীয়:</span>
                        <span>৳১,১৪০</span>
                      </div>
                    </div>
                  </div>
                )}`;

if (lp.includes(oldBillingCard)) {
  lp = lp.replace(oldBillingCard, newBillingCard);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully upgraded POS billing card to high-contrast professional design!');
} else {
  console.log('Old billing card block not found in LandingPage.tsx');
}
