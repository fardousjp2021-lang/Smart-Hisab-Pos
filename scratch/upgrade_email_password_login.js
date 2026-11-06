import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Add loginEmail and loginPassword state in LandingPage.tsx
if (!lp.includes('const [loginEmail, setLoginEmail]')) {
  lp = lp.replace(
    'const [rememberMe, setRememberMe] = useState(true);',
    "const [rememberMe, setRememberMe] = useState(true);\n  const [loginEmail, setLoginEmail] = useState('admin@smarthisab.com');\n  const [loginPassword, setLoginPassword] = useState('admin123');"
  );
}

// 2. Bind value and onChange to input fields in LandingPage.tsx
const oldFormBlock = `<form onSubmit={(e) => { e.preventDefault(); demoLogin(); }} className="space-y-3 pt-1">
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
                        />`;

const newFormBlock = `<form onSubmit={(e) => { e.preventDefault(); demoLogin(); }} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">ইমেইল বা মোবাইল নম্বর</label>
                        <input
                          type="text"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. admin@smarthisab.com বা 01700-000000"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                      </div>
                      <div>
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
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />`;

if (lp.includes(oldFormBlock)) {
  lp = lp.replace(oldFormBlock, newFormBlock);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully bound loginEmail and loginPassword in LandingPage.tsx!');
} else {
  console.log('Old form block not found in LandingPage.tsx');
}
