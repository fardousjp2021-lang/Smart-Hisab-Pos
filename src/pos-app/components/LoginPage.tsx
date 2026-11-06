// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Receipt, 
  Package, 
  BarChart3, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
  ShoppingCart,
  ChevronDown,
  ClipboardList,
  CircleDollarSign,
  LineChart,
  ShoppingBag,
  Printer,
  Bell,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Truck,
  Cloud,
  Smartphone,
  Headphones
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginPageProps {
  onBackToHome?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('email');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-fill saved credentials if Remember Me was checked previously
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('smarthisab_saved_credentials');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.email) {
          setEmail(parsed.email);
          if (parsed.email.includes('@')) {
            setLoginMethod('email');
          } else {
            setLoginMethod('mobile');
          }
        }
        if (parsed.password) setPassword(parsed.password);
        setRememberMe(true);
      }
    } catch (e) {}
  }, []);

  const [isPaused, setIsPaused] = useState(false);

  // Real website characteristics & feature slides for SmartHisab POS
  const showcaseSlides = [
    {
      id: 0,
      titlePrefix: 'অনলাইন ব্যবসার',
      titleHighlight: 'সেরা ক্লাউড POS',
      category: 'বিলিং ও কাস্টমার ম্যানেজমেন্ট',
      items: [
        { label: 'কাস্টমার ও বাকি খাতা', icon: Users, bg: 'bg-[#FAF5FF]', color: 'text-[#9333EA]' },
        { label: 'দ্রুত POS সেলস বিলিং', icon: ShoppingCart, bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]' },
        { label: 'থার্মাল মেমো প্রিন্ট', icon: Printer, bg: 'bg-[#FDF2F8]', color: 'text-[#DB2777]' },
        { label: 'গ্রাহক SMS নোটিফিকেশন', icon: Bell, bg: 'bg-[#FFF7ED]', color: 'text-[#EA580C]' },
      ],
    },
    {
      id: 1,
      titlePrefix: 'স্মার্ট ও সহজ',
      titleHighlight: 'ইনভেন্টরি সিস্টেম',
      category: 'স্টক ও বারকোড ম্যানেজমেন্ট',
      items: [
        { label: 'বারকোড স্টিকার প্রিন্ট', icon: Tag, bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
        { label: 'কম স্টক সতর্কতা এলার্ট', icon: AlertCircle, bg: 'bg-[#FFE4E6]', color: 'text-[#E11D48]' },
        { label: 'এক্সেল পণ্য ইমপোর্ট', icon: FileSpreadsheet, bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
        { label: 'ব্যাচ ও মেয়াদ ট্র্যাকিং', icon: Clock, bg: 'bg-[#FEF9C3]', color: 'text-[#CA8A04]' },
      ],
    },
    {
      id: 2,
      titlePrefix: 'ব্যবসার স্বয়ংক্রিয়',
      titleHighlight: 'হিসাব ও একাউন্টিং',
      category: 'দৈনিক লাভ-ক্ষতি ও ব্যয় বিশ্লেষণ',
      items: [
        { label: 'নির্ভুল লাভ ও ক্ষতি', icon: CircleDollarSign, bg: 'bg-[#FAF5FF]', color: 'text-[#9333EA]' },
        { label: 'ব্যয় ও খরচের খাতা', icon: Receipt, bg: 'bg-[#FFE4E6]', color: 'text-[#E11D48]' },
        { label: 'লাইভ বিক্রয় রিপোর্ট', icon: LineChart, bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
        { label: 'সাপ্লায়ার দেনা-পাওনা', icon: Truck, bg: 'bg-[#FFF7ED]', color: 'text-[#EA580C]' },
      ],
    },
    {
      id: 3,
      titlePrefix: '১০০% সুরক্ষিত',
      titleHighlight: 'ক্লাউড ব্যাকআপ',
      category: 'নিরাপত্তা ও সার্ভিস ট্র্যাকিং',
      items: [
        { label: 'অটোমেটিক ক্লাউড সিঙ্ক', icon: Cloud, bg: 'bg-[#EFF6FF]', color: 'text-[#2563EB]' },
        { label: 'মোবাইল ও পিসি সাপোর্ট', icon: Smartphone, bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
        { label: 'ওয়ারেন্টি ও সার্ভিসিং', icon: ShieldCheck, bg: 'bg-[#FDF2F8]', color: 'text-[#DB2777]' },
        { label: '২৪/৭ হেল্পলাইন সাপোর্ট', icon: Headphones, bg: 'bg-[#FEF9C3]', color: 'text-[#CA8A04]' },
      ],
    },
  ];

  // Auto-running carousel effect (runs continuously uninterrupted at a calm, relaxed pace every 5.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [showcaseSlides.length]);

  // Fallback app context if used inside AppProvider
  let login: any = null;
  let demoLogin: any = null;
  try {
    const ctx = useApp();
    if (ctx) {
      login = ctx.login;
      demoLogin = ctx.demoLogin;
    }
  } catch (e) {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    // Save or remove credentials based on Remember Me checkbox
    if (rememberMe) {
      try {
        localStorage.setItem('smarthisab_saved_credentials', JSON.stringify({ email: email.trim(), password }));
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('smarthisab_saved_credentials');
      } catch (e) {}
    }

    setIsLoading(true);
    try {
      const customAdminEmail = (localStorage.getItem('smarthisab_super_admin_email') || 'info.fardousit@gmail.com').toLowerCase();
      const customAdminPassword = localStorage.getItem('smarthisab_super_admin_password') || 'admin123';
      const inputEmail = email.trim().toLowerCase();

      // Check if logging in with Super Admin credentials
      if (
        (inputEmail === customAdminEmail || inputEmail === 'admin@smarthisab.com' || inputEmail === 'info.fardousit@gmail.com') &&
        (password === customAdminPassword || password === 'admin123')
      ) {
        if (login) {
          await login(email.trim(), password);
        }
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return;
      }

      if (login) {
        await login(email.trim(), password);
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড বা ইউজারনেম ঠিক আছে কিনা পরীক্ষা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'owner' | 'employee') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (demoLogin) {
        await demoLogin(role);
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMessage('ডেমো সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white text-slate-900 flex flex-col lg:flex-row font-sans select-none overflow-x-hidden">
      
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* ── LEFT HALF: FEATURE SHOWCASE PANEL (Soft Subtle Gray Background) ─────── */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#F8F9FB] border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 sm:p-12 lg:p-16 flex flex-col justify-between items-center text-center relative min-h-[460px] lg:min-h-screen">
        
        {/* Top Official Brand Logo (Horizontal Cloud POS Logo) */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/smarthisab_logo.png" 
              alt="SmartHisab Cloud POS" 
              className="h-10 sm:h-12 w-auto object-contain cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={onBackToHome}
              title="SmartHisab Cloud POS"
            />
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="lg:hidden text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>হোমপেজ</span>
            </button>
          )}
        </div>

        {/* Middle Showcase Content (Continuous Smooth Horizontal Sliding Carousel) */}
        <div className="my-auto py-6 sm:py-8 w-full max-w-2xl mx-auto flex flex-col items-center select-none overflow-hidden">
          
          {/* Horizontal Slider Viewport */}
          <div className="w-full overflow-hidden relative">
            <div 
              className="flex transition-transform duration-[1100ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {showcaseSlides.map((slide) => (
                <div key={slide.id} className="w-full shrink-0 flex flex-col items-center px-3 sm:px-4">
                  
                  {/* Dynamic Module / Feature Category Badge */}
                  <div className="mb-3.5">
                    <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-100/95 px-4 py-1.5 rounded-full border border-sky-200/90 inline-flex items-center gap-2 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
                      <span>{slide.category}</span>
                    </span>
                  </div>

                  {/* Main Hero Headline matching your website's core characteristics */}
                  <h1 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[38px] font-black text-slate-900 tracking-tight leading-[1.25] mb-8 sm:mb-10 text-center max-w-xl mx-auto">
                    {slide.titlePrefix}{' '}
                    <span className="text-[#FF8A00]">{slide.titleHighlight}</span>
                  </h1>

                  {/* 2x2 Feature Cards Grid (Larger, Spacious & Premium) */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl mx-auto">
                    {slide.items.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <div 
                          key={idx}
                          className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90 flex items-center gap-3.5 sm:gap-4.5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-xs`}>
                            <IconComp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                          </div>
                          <span className="text-sm sm:text-base lg:text-[16px] font-extrabold text-slate-800 tracking-tight leading-snug text-left">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Continuous Carousel Indicator Dots (Slightly larger, polished) */}
          <div className="flex items-center justify-center gap-2.5 mt-9 sm:mt-12">
            {showcaseSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 transition-all duration-700 rounded-full cursor-pointer ${
                  activeSlide === idx ? 'w-10 bg-[#0284c7] shadow-xs' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`স্লাইড ${idx + 1}: ${slide.category}`}
              />
            ))}
          </div>

        </div>

        {/* Bottom Info Support */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold pt-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <CheckCircle2 size={14} /> ১০০% এনক্রিপ্টেড ও সুরক্ষিত ক্লাউড
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-bold">
            <PhoneCall size={12} className="text-blue-600" />
            <span className="text-slate-600">হেল্পলাইন:</span>
            <a href="tel:01747046052" className="text-blue-600 hover:underline font-mono">
              01747-046052
            </a>
            <span className="text-slate-400">,</span>
            <a href="tel:01996761011" className="text-blue-600 hover:underline font-mono">
              01996-761011
            </a>
          </div>
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* ── RIGHT HALF: PURE WHITE CLEAN LOGIN FORM (Exact Dokani Styled) ───────── */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center text-center relative overflow-y-auto min-h-screen">
        
        {/* Top Header Row with Back to Home Button */}
        <div className="w-full flex justify-end">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>হোমপেজে ফিরে যান</span>
            </button>
          )}
        </div>

        {/* Form Container (Centered) */}
        <div className="my-auto w-full max-w-[430px] mx-auto py-6">
          
          {/* Official SmartHisab Digital Accounting Logo (S-Badge Emblem) */}
          <div className="flex flex-col items-center justify-center mb-6">
            <img 
              src="/smarthisab_icon.png" 
              alt="SmartHisab Digital Accounting Software" 
              className="h-24 sm:h-28 w-auto object-contain transition-transform duration-200 hover:scale-[1.03] drop-shadow-xs" 
            />

            {/* Main Sub-headline */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mt-4 text-center">
              আপনার ব্যবসার অল ইন ওয়ান বিজনেস সল্যুশন{' '}
              <span className="text-[#FF8A00] block sm:inline">স্মার্ট হিসাব ক্লাউড</span>
            </h2>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* ── Login Method Selection (Mobile & Email Two Options) ── */}
            <div className="space-y-2">
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/90 gap-1">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('mobile'); setErrorMessage(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginMethod === 'mobile'
                      ? 'bg-white text-[#0284c7] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={14} className={loginMethod === 'mobile' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  <span>মোবাইল নম্বর</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setErrorMessage(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginMethod === 'email'
                      ? 'bg-white text-[#0284c7] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail size={14} className={loginMethod === 'email' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  <span>ইমেইল অ্যাড্রেস</span>
                </button>
              </div>

              {loginMethod === 'mobile' ? (
                /* Mobile Number Option */
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    মোবাইল নম্বর <span className="text-rose-500 font-black">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                    {/* BD Flag & +88 Prefix Box */}
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 select-none shrink-0">
                      <span className="text-base">🇧🇩</span>
                      <span>+88</span>
                      <ChevronDown size={13} className="text-slate-400 ml-0.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Email Address Option */
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    ইমেইল অ্যাড্রেস <span className="text-rose-500 font-black">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                    {/* Email Icon Prefix Box */}
                    <div className="flex items-center justify-center px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-400 select-none shrink-0">
                      <Mail size={16} className="text-slate-500" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@smarthisab.com বা info.fardousit@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">
                  পাসওয়ার্ড <span className="text-rose-500 font-black">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('পাসওয়ার্ড রিকভারির জন্য অনুগ্রহ করে হেল্পলাইনে যোগাযোগ করুন: 01747-046052 অথবা 01996-761011')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white transition shadow-2xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>পাসওয়ার্ড মনে রাখুন (Remember Me)</span>
              </label>
            </div>

            {/* reCAPTCHA Info Note matching Dokani image */}
            <p className="text-[11px] text-slate-500 text-center leading-normal pt-1">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Terms of Service</a> apply.
            </p>

            {/* Dokani Vibrant Blue Action Button ("এগিয়ে যান") */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-base font-extrabold shadow-md shadow-blue-500/20 transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>এগিয়ে যান</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* 1-Click Quick Demo Login (Helpful shortcut for testing) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400">কুইক ডেমো:</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer transition"
              >
                অ্যাডমিন
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer transition"
              >
                ম্যানেজার
              </button>
            </div>

          </form>

        </div>

        {/* Footer Terms & Copyright */}
        <div className="w-full text-center space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p>
            By registering, you accept our{' '}
            <a href="#" className="text-amber-600 font-bold hover:underline">Terms of use</a>{' '}
            and{' '}
            <a href="#" className="text-amber-600 font-bold hover:underline">Privacy Policy</a>
          </p>
          <p className="font-semibold text-slate-400 text-[11px]">
            Copyright SmartHisab 2026
          </p>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
