import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Import AiBusinessAssistant at top of LandingPage.tsx
if (!lp.includes('AiBusinessAssistant')) {
  lp = lp.replace(
    "import { ImmersivePOS } from './ImmersivePOS';",
    "import { ImmersivePOS } from './ImmersivePOS';\nimport { AiBusinessAssistant } from './AiBusinessAssistant';"
  );
}

// 2. Replace AI feature tab rendering with live interactive AiBusinessAssistant component
const oldAiBlock = `{activeFeatureTab === 'ai' && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md">Gemini 1.5/2 এআই সহকারী</span>
                    <h3 className="text-xl font-bold">সংযুক্ত এআই এ্যাসিস্ট্যান্ট</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      ফায়ারস্টোরে সেভ থাকা বিজনেস ডাটা ও রিয়্যাল-টাইম সেলস হিস্ট্রি এনালাইসিস করে এআই আপনাকে স্বয়ংক্রিয় টিপস দেবে। কোনো পণ্যটির দাম বাড়ানো উচিত নাকি কাস্টমার আকর্ষণে বিশেষ ডিসকাউন্ট দেয়া প্রয়োজন, তা এআই বিজনেস চ্যাটের মাধ্যমে সহজে জিজ্ঞেস করতে পারবেন।
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl grid grid-cols-2 gap-4">
                      <div className="flex gap-2 text-xs">
                        <Sparkles size={14} className="text-amber-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-405 font-bold">স্বয়ংক্রিয় প্রফিট অপ্টিমাইজেশন টিপস</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-450 font-bold">বাংলা ভাষায় অত্যন্ত সাবলীল চ্যাট সাপোর্ট</span>
                      </div>
                    </div>
                  </div>
                )}`;

const newAiBlock = `{activeFeatureTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Sparkles size={12} /> Gemini 1.5/2 এআই লাইভ চ্যাট সহকারী
                      </span>
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        🟢 অনলাইন ও প্রস্তুত
                      </span>
                    </div>
                    <AiBusinessAssistant lang={theme === 'dark' ? 'bn' : 'bn'} />
                  </div>
                )}`;

if (lp.includes(oldAiBlock)) {
  lp = lp.replace(oldAiBlock, newAiBlock);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully embedded live AiBusinessAssistant into LandingPage.tsx!');
} else {
  console.log('Old AI block not found in LandingPage.tsx');
}
