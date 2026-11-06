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
  Headphones,
  Store,
  User,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginPageProps {
  onBackToHome?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onLoginSuccess }) => {
  // Mode switcher: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Registration form states
  const [regFullName, setRegFullName] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('মোবাইল ও টেলিকম শপ');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Common UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
  let registerUser: any = null;
  try {
    const ctx = useApp();
    if (ctx) {
      login = ctx.login;
      demoLogin = ctx.demoLogin;
      registerUser = ctx.registerUser;
    }
  } catch (e) {}

  // ─────────────────────────────────────────────────────────────
  // ── SUBMIT LOGIN HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
      const inputStr = email.trim().toLowerCase();
      const cleanInputPhone = inputStr.replace(/\D/g, '');
      const customAdminEmail = (localStorage.getItem('smarthisab_super_admin_email') || 'info.fardousit@gmail.com').toLowerCase();
      const customAdminPassword = localStorage.getItem('smarthisab_super_admin_password') || 'admin123';

      // 1. Check if user exists in locally registered users list
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem('smarthisab_registered_users');
        if (stored) usersList = JSON.parse(stored);
      } catch (e) {}

      const matchedUser = usersList.find((u) => {
        const emailMatch = u.email && u.email.toLowerCase() === inputStr;
        const phoneMatch = cleanInputPhone.length >= 10 && u.phone && u.phone.includes(cleanInputPhone.slice(-10));
        return (emailMatch || phoneMatch) && u.password === password;
      });

      if (matchedUser) {
        if (matchedUser.shopName) {
          localStorage.setItem('smarthisab_shop_name', matchedUser.shopName);
        }
        localStorage.setItem('smarthisab_active_session_user', JSON.stringify(matchedUser));
        if (demoLogin) {
          await demoLogin('admin');
        } else if (login) {
          await login(matchedUser.email, password);
        }
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return;
      }

      // 2. Check if logging in with Super Admin credentials
      if (
        (inputStr === customAdminEmail || inputStr === 'admin@smarthisab.com' || inputStr === 'info.fardousit@gmail.com' || cleanInputPhone === '01747046052' || cleanInputPhone === '01996761011') &&
        (password === customAdminPassword || password === 'admin123')
      ) {
        if (demoLogin) {
          await demoLogin('admin');
        } else if (login) {
          await login(email.trim(), password);
        }
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return;
      }

      // 3. Fallback to standard context login
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

  // ─────────────────────────────────────────────────────────────
  // ── SUBMIT REGISTRATION HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation checks
    if (!regFullName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!regShopName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার দোকান বা ব্যবসার নাম লিখুন।');
      return;
    }
    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage('অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = regEmail.trim().toLowerCase();

      // Check if already registered
      let usersList: any[] = [];
      try {
        const stored = localStorage.getItem('smarthisab_registered_users');
        if (stored) usersList = JSON.parse(stored);
      } catch (err) {}

      const exists = usersList.some(
        (u) => u.email === cleanEmail || (cleanPhone.length >= 10 && u.phone && u.phone.includes(cleanPhone.slice(-10)))
      );
      if (exists) {
        setErrorMessage('এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।');
        setIsLoading(false);
        return;
      }

      // Create new shop owner account object
      const newUser = {
        id: 'usr_' + Date.now(),
        fullName: regFullName.trim(),
        shopName: regShopName.trim(),
        businessType: regBusinessType,
        phone: cleanPhone,
        email: cleanEmail,
        password: regPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      };

      usersList.push(newUser);
      localStorage.setItem('smarthisab_registered_users', JSON.stringify(usersList));
      localStorage.setItem('smarthisab_shop_name', regShopName.trim());
      localStorage.setItem('smarthisab_saved_credentials', JSON.stringify({ email: cleanEmail, password: regPassword }));
      localStorage.setItem('smarthisab_active_session_user', JSON.stringify(newUser));

      // Asynchronously record in Firestore registrations collection if connected
      if (registerUser) {
        try {
          await registerUser({
            fullName: regFullName.trim(),
            phone: cleanPhone,
            email: cleanEmail,
            businessType: regBusinessType,
            businessName: regShopName.trim(),
            message: `New Shop Registered via Web - ${regShopName.trim()}`
          });
        } catch (apiErr) {
          console.warn('Firestore registerUser sync note:', apiErr);
        }
      }

      setSuccessMessage('🎉 অভিনন্দন! আপনার দোকান অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...');

      // Auto login after 1 second
      setTimeout(async () => {
        try {
          if (demoLogin) {
            await demoLogin('admin');
          } else if (login) {
            await login(cleanEmail, regPassword);
          }
        } catch (e) {}
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 1200);

    } catch (err: any) {
      setErrorMessage(err?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'owner' | 'employee') => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
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
              type="button"
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
                    <span className="text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-[#0284c7] bg-sky-100/95 px-4 py-1.5 rounded-full border border-sky-200/90 inline-flex items-center gap-2 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
                      <span>{slide.category}</span>
                    </span>
                  </div>

                  {/* Main Hero Headline matching your website's core characteristics */}
                  <h1 className="text-2xl sm:text-3xl lg:text-[36px] xl:text-[38px] font-bold text-slate-900 tracking-tight leading-[1.25] mb-8 sm:mb-10 text-center max-w-xl mx-auto">
                    {slide.titlePrefix}{' '}
                    <span className="text-[#FF8A00]">{slide.titleHighlight}</span>
                  </h1>

                  {/* 2x2 Feature Cards Grid (Spacious & Premium) */}
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
                          <span className="text-sm sm:text-base lg:text-[16px] font-bold text-slate-800 tracking-tight leading-snug text-left">
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

          {/* Continuous Carousel Indicator Dots */}
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
      {/* ── RIGHT HALF: LOGIN & REGISTRATION FORM (Pure White Split View) ───────── */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center text-center relative overflow-y-auto min-h-screen">
        
        {/* Top Header Row with Back to Home Button */}
        <div className="w-full flex justify-end">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>হোমপেজে ফিরে যান</span>
            </button>
          )}
        </div>

        {/* Form Container (Centered) */}
        <div className="my-auto w-full max-w-[450px] mx-auto py-4">
          
          {/* Official SmartHisab Digital Accounting Logo (S-Badge Emblem) */}
          <div className="flex flex-col items-center justify-center mb-4">
            <img 
              src="/smarthisab_icon.png" 
              alt="SmartHisab Digital Accounting Software" 
              className="h-20 sm:h-24 w-auto object-contain transition-transform duration-200 hover:scale-[1.03] drop-shadow-xs" 
            />

            {/* Main Sub-headline */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug mt-3 text-center">
              আপনার ব্যবসার অল ইন ওয়ান বিজনেস সল্যুশন{' '}
              <span className="text-[#FF8A00] block sm:inline">স্মার্ট হিসাব ক্লাউড</span>
            </h2>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ── MAIN SEGMENTED SWITCHER: LOGIN vs REGISTER ───────────────────── */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className="mb-5 p-1 bg-slate-100 rounded-2xl border border-slate-200/90 flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#0284c7] shadow-sm scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock size={15} className={authMode === 'login' ? 'text-[#0284c7]' : 'text-slate-400'} />
              <span>লগইন করুন</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#0284c7] shadow-sm scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={15} className={authMode === 'register' ? 'text-[#0284c7]' : 'text-slate-400'} />
              <span>নতুন রেজিস্ট্রেশন</span>
              <span className="hidden sm:inline px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">ফ্রি</span>
            </button>
          </div>

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed text-center animate-fadeIn flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed text-center animate-fadeIn">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ── CASE 1: LOGIN MODE ───────────────────────────────────────────── */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              
              {/* Login Method Selection (Mobile & Email Two Options) */}
              <div className="space-y-2">
                <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200/90 gap-1">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('mobile'); setErrorMessage(null); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                      মোবাইল নম্বর <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
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
                      ইমেইল অ্যাড্রেস <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                      <div className="flex items-center justify-center px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-400 select-none shrink-0">
                        <Mail size={16} className="text-slate-500" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="admin@smarthisab.com বা আপনার ইমেইল"
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
                    পাসওয়ার্ড <span className="text-rose-500 font-bold">*</span>
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

              {/* Action Button ("এগিয়ে যান") */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-base font-bold shadow-md shadow-blue-500/20 transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Bottom Registration Prompt Link */}
              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600 font-medium">
                  নতুন ব্যবহারকারী? কোনো অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-[#0284c7] font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
                  >
                    <span>বিনামূল্যে নিবন্ধন করুন</span>
                    <ArrowRight size={12} />
                  </button>
                </p>
              </div>

              {/* Security & Support Trust Badge */}
              <div className="pt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-500">১০০% নিরাপদ ক্লাউড কানেকশন • SSL এনক্রিপ্টেড</span>
              </div>

            </form>
          ) : (
            /* ─────────────────────────────────────────────────────────────────── */
            /* ── CASE 2: REGISTRATION / SIGN UP MODE ──────────────────────────── */
            /* ─────────────────────────────────────────────────────────────────── */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left animate-fadeIn">
              
              <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-center text-xs font-bold text-sky-900">
                ✨ মাত্র ১ মিনিটে আপনার দোকান বা ব্যবসার অ্যাকাউন্ট তৈরি করুন!
              </div>

              {/* 1. Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  আপনার নাম (Owner Name) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                  <div className="flex items-center justify-center px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-400 shrink-0">
                    <User size={15} className="text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ সাইফুল ইসলাম"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* 2. Shop / Business Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  দোকান বা প্রতিষ্ঠানের নাম <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                  <div className="flex items-center justify-center px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-400 shrink-0">
                    <Store size={15} className="text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রনি টেলিকম অ্যান্ড গ্যাজেট"
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* 3. Business Type Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ব্যবসার ধরন (Business Category) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                  <div className="flex items-center justify-center px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-slate-400 shrink-0">
                    <ShoppingBag size={15} className="text-slate-500" />
                  </div>
                  <select
                    value={regBusinessType}
                    onChange={(e) => setRegBusinessType(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="মোবাইল ও টেলিকম শপ">📱 মোবাইল ও টেলিকম শপ</option>
                    <option value="কম্পিউটার ও ইলেকট্রনিক্স">💻 কম্পিউটার, গ্যাজেট ও ইলেকট্রনিক্স</option>
                    <option value="ডিপার্টমেন্টাল ও মুদি দোকান">🛒 সুপারশপ, গ্রোসারি ও মুদি দোকান</option>
                    <option value="ফার্মেসি ও ড্রাগ স্টোর">💊 ফার্মেসি ও ড্রাগ স্টোর</option>
                    <option value="পোশাক ও ফ্যাশন হাউস">👕 পোশাক, ফ্যাশন ও গার্মেন্টস</option>
                    <option value="হার্ডওয়্যার ও ইলেকট্রিক">🔧 হার্ডওয়্যার, স্যানিটারি ও ইলেকট্রিক</option>
                    <option value="পাইকারি / হোলসেল ব্যবসা">📦 পাইকারি / হোলসেল ব্যবসা</option>
                    <option value="অন্যান্য খুচরা ব্যবসা">🛍️ অন্যান্য ব্যবসা</option>
                  </select>
                </div>
              </div>

              {/* 4. Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  মোবাইল নম্বর (লগইনে ব্যবহৃত হবে) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 select-none shrink-0">
                    <span className="text-base">🇧🇩</span>
                    <span>+88</span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* 5. Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ইমেইল অ্যাড্রেস <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#0284c7] focus-within:ring-4 focus-within:ring-[#0284c7]/10 bg-white overflow-hidden transition shadow-2xs">
                  <div className="flex items-center justify-center px-3 py-2 bg-slate-50 border-r border-slate-200 text-slate-400 shrink-0">
                    <Mail size={15} className="text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* 6. Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    পাসওয়ার্ড <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-[#0284c7] bg-white shadow-2xs">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    কনফার্ম পাসওয়ার্ড <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-[#0284c7] bg-white shadow-2xs">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="পুনরায় লিখুন"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-600/20 transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={17} className="text-amber-300" />
                    <span>বিনামূল্যে একাউন্ট তৈরি করুন</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Already have an account link */}
              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600 font-medium">
                  ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-[#0284c7] font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
                  >
                    <span>এখানে ক্লিক করে লগইন করুন</span>
                    <ArrowRight size={12} />
                  </button>
                </p>
              </div>

            </form>
          )}

        </div>

        {/* Footer Terms & Copyright */}
        <div className="w-full text-center space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <p>
            নিবন্ধন করার মাধ্যমে আপনি আমাদের{' '}
            <a href="#" className="text-amber-600 font-bold hover:underline">ব্যবহারের শর্তাবলী (Terms)</a>{' '}
            ও{' '}
            <a href="#" className="text-amber-600 font-bold hover:underline">গোপনীয়তা নীতি (Privacy Policy)</a> মেনে নিচ্ছেন।
          </p>
          <p className="font-semibold text-slate-400 text-[11px]">
            Copyright SmartHisab 2026 • সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;

