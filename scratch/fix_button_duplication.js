import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Update Feature Section button to "ফ্রি রেজিস্ট্রেশন করুন ➔"
const oldFeatureButton = `<button
                    onClick={() => handleScrollToAuth('register')}
                    className="px-4 py-2 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-sm"
                  >
                    <span>ডেমো ব্যবহার করুন</span>
                    <span>➔</span>
                  </button>`;

const newFeatureButton = `<button
                    onClick={() => handleScrollToAuth('register')}
                    className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition duration-150 active:scale-95 shadow-md"
                  >
                    <span>ফ্রি রেজিস্ট্রেশন করুন</span>
                    <span>➔</span>
                  </button>`;

if (lp.includes(oldFeatureButton)) {
  lp = lp.replace(oldFeatureButton, newFeatureButton);
}

// 2. Upgrade Hero button to "✨ ফ্রি ডেমো ট্রায়াল শুরু করুন"
lp = lp.replace(
  '<span>ডেমো ব্যবহার করুন</span>',
  '<span>ফ্রি ডেমো ট্রায়াল শুরু করুন</span>'
);

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully resolved button duplication & redesigned CTA buttons!');
