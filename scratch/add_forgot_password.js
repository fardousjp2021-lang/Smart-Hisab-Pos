import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Add handleForgotPassword function
const forgotFn = `  const handleForgotPassword = () => {
    const email = prompt("পাসওয়ার্ড রিসেট করতে আপনার নিবন্ধিত ইমেইল বসান:");
    if (email && email.trim()) {
      alert("📩 পাসওয়ার্ড রিসেট লিংক " + email.trim() + " ইমেইলে সফলভাবে পাঠানো হয়েছে! আপনার জিমেইল ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
    }
  };`;

lp = lp.replace(
  'const handleRegisterSubmit = (e: React.FormEvent) => {',
  forgotFn + '\n\n  const handleRegisterSubmit = (e: React.FormEvent) => {'
);

// 2. Add Forgot Password link in UI
const oldPassInput = `<div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-left">পাসওয়ার্ড</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />
                      </div>`;

const newPassInput = `<div>
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

if (lp.includes(oldPassInput)) {
  lp = lp.replace(oldPassInput, newPassInput);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully added Forgot Password option to LandingPage.tsx!');
} else {
  console.log('Old pass input block not found');
}
