import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Add Eye, EyeOff to lucide-react imports in LandingPage.tsx
if (!lp.includes('Eye,')) {
  lp = lp.replace(
    '  Sparkles,',
    '  Sparkles,\n  Eye,\n  EyeOff,'
  );
}

// 2. Add showPassword state in LandingPage.tsx
if (!lp.includes('const [showPassword, setShowPassword]')) {
  lp = lp.replace(
    "const [loginPassword, setLoginPassword] = useState('admin123');",
    "const [loginPassword, setLoginPassword] = useState('admin123');\n  const [showPassword, setShowPassword] = useState(false);"
  );
}

// 3. Update password input to have an Eye toggle button inside
const oldPasswordInput = `<input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                        />`;

const newPasswordInput = `<div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer transition"
                            title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>`;

if (lp.includes(oldPasswordInput)) {
  lp = lp.replace(oldPasswordInput, newPasswordInput);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully added Password Eye Show/Hide toggle to Auth Modal!');
} else {
  console.log('Old password input block not found in LandingPage.tsx');
}
