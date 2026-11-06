import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Add rememberMe state
if (!lp.includes('const [rememberMe, setRememberMe]')) {
  lp = lp.replace(
    "const [openFaq, setOpenFaq] = useState<number | null>(null);",
    "const [openFaq, setOpenFaq] = useState<number | null>(null);\n  const [rememberMe, setRememberMe] = useState(true);"
  );
}

// 2. Add Remember Me Checkbox under Password field
const oldPasswordBlock = `                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-left">পাসওয়ার্ড</label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[11px] font-extrabold text-[#8b26c7] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            পাসওয়ার্ড ভুলে গেছেন?
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                      </div>`;

const newPasswordBlock = `                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-left">পাসওয়ার্ড</label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[11px] font-extrabold text-[#8b26c7] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            পাসওয়ার্ড ভুলে গেছেন?
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 accent-[#8b26c7] rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                            <span>পাসওয়ার্ড মনে রাখুন (Remember Me)</span>
                          </label>
                        </div>
                      </div>`;

if (lp.includes(oldPasswordBlock)) {
  lp = lp.replace(oldPasswordBlock, newPasswordBlock);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully added Remember Me checkbox to Auth Modal!');
} else {
  console.log('Old password block not found in LandingPage.tsx');
}
