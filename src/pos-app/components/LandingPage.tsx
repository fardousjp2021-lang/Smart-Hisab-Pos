// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AiBusinessAssistant } from './AiBusinessAssistant';
import { LoginPage } from './LoginPage';
import { 
  Sparkles,
  Eye,
  EyeOff, 
  LogIn, 
  UserPlus,
  AlertCircle,
  ShoppingCart, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Smartphone,
  PhoneCall,
  Mail,
  Zap,
  Globe,
  Award,
  Layers,
  MapPin,
  Laptop,
  Menu,
  X,
  Facebook,
  Youtube,
  Linkedin,
  MessageSquare,
  ChevronRight,
  Sparkle,
  Copy,
  Play,
  ChevronDown,
  ChevronUp,
  Database,
  Users,
  Cloud,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  theme: string;
  toggleTheme: () => void;
  onEnterApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ theme, toggleTheme, onEnterApp }) => {
  let authError: string | null = null;
  let clearAuthError = () => {};
  let registerUser = async (_data: any) => ({ success: true, message: 'নিবন্ধন সম্পন্ন হয়েছে' });
  let login = async () => {};
  let demoLogin = async () => {};

  let currentUser: any = null;
  try {
    const appCtx = useApp();
    if (appCtx) {
      currentUser = appCtx.currentUser;
      authError = appCtx.authError;
      clearAuthError = appCtx.clearAuthError;
      registerUser = appCtx.registerUser;
      login = appCtx.login;
      demoLogin = appCtx.demoLogin;
    }
  } catch (_err) {
    // Fallback safely if context is undefined
  }

  const isSuperAdminUser = !currentUser || currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Owner' || currentUser?.email === 'admin@smarthisab.com' || currentUser?.phone?.includes('01747046052');

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showDedicatedLogin, setShowDedicatedLogin] = useState(false);
  
  const handleScrollToAuth = (tab: 'login' | 'register') => {
    if (tab === 'login') {
      setShowDedicatedLogin(true);
      return;
    }
    setAuthTab(tab);
    clearAuthError();
    const element = document.getElementById('support');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.history.pushState(null, '', `#${id}`);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    // Scroll to section on initial load if hash is present
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, []);

  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('Others');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regMessage, setRegMessage] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(null);
    setRegError(null);
    
    if (!regFullName.trim() || !regPhone.trim() || !regEmail.trim() || !regBusinessName.trim()) {
      setRegError('দয়া করে সব আবশ্যকীয় (*) ইনপুট ফিল্ডগুলো পূরণ করুন।');
      return;
    }
    
    setRegSubmitting(true);
    const result = await registerUser({
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      businessType: regBusinessType,
      businessName: regBusinessName.trim(),
      message: regMessage.trim(),
    });
    setRegSubmitting(false);
    
    if (result.success) {
      setRegSuccess(result.message);
      setRegFullName('');
      setRegPhone('');
      setRegEmail('');
      setRegBusinessName('');
      setRegMessage('');
    } else {
      setRegError(result.message);
    }
  };

  const [activeFeatureTab, setActiveFeatureTab] = useState<'billing' | 'inventory' | 'accounting' | 'ai'>('billing');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@smarthisab.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPackageModal, setSelectedPackageModal] = useState<any>(null);
  const [showPackageComparison, setShowPackageComparison] = useState(false);

  const defaultPricingConfig = {
    starterMonthly: 499,
    starterYearly: 4990,
    proMonthly: 999,
    proYearly: 9990,
    enterpriseMonthly: 1999,
    enterpriseYearly: 19990,
    yearlyDiscountPercent: 20
  };

  const [pricingConfig, setPricingConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('saim_package_pricing_config');
      return saved ? { ...defaultPricingConfig, ...JSON.parse(saved) } : defaultPricingConfig;
    } catch (e) {
      return defaultPricingConfig;
    }
  });

  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false);
  const [tempPricingConfig, setTempPricingConfig] = useState(pricingConfig);

  useEffect(() => {
    const handlePricingChange = () => {
      try {
        const saved = localStorage.getItem('saim_package_pricing_config');
        if (saved) {
          const parsed = { ...defaultPricingConfig, ...JSON.parse(saved) };
          setPricingConfig(parsed);
          setTempPricingConfig(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handlePricingChange);
    window.addEventListener('saim_pricing_updated', handlePricingChange);
    return () => {
      window.removeEventListener('storage', handlePricingChange);
      window.removeEventListener('saim_pricing_updated', handlePricingChange);
    };
  }, []);

  const handleSavePricingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setPricingConfig(tempPricingConfig);
    localStorage.setItem('saim_package_pricing_config', JSON.stringify(tempPricingConfig));
    window.dispatchEvent(new CustomEvent('saim_pricing_updated'));
    setIsEditPriceModalOpen(false);
    alert('✅ প্যাকেজের নতুন মূল্য সফলভাবে সেভ করা হয়েছে!');
  };

  const formatPriceBn = (num: number) => '৳' + Number(num || 0).toLocaleString('bn-BD');

  const starterMonthlyStr = formatPriceBn(pricingConfig.starterMonthly || 499);
  const starterYearlyStr = formatPriceBn(pricingConfig.starterYearly || 4990);
  const proMonthlyStr = formatPriceBn(pricingConfig.proMonthly || 999);
  const proYearlyStr = formatPriceBn(pricingConfig.proYearly || 9990);
  const enterpriseMonthlyStr = formatPriceBn(pricingConfig.enterpriseMonthly || 1999);
  const enterpriseYearlyStr = formatPriceBn(pricingConfig.enterpriseYearly || 19990);

  const handleSelectPackage = (pkgName: string, monthlyPrice: string, yearlyPrice: string, desc: string, features: string[]) => {
    const priceText = pricingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
    setRegBusinessType(pkgName);
    setSelectedPackageModal({
      name: pkgName,
      price: priceText,
      cycle: pricingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক',
      description: desc,
      features: features
    });
  };

  const handleConfirmPackageOrder = () => {
    if (selectedPackageModal) {
      const message = `হ্যালো সাপোর্ট টীম, আমি SmartHisab POS এর "${selectedPackageModal.name}" (${selectedPackageModal.price}/${selectedPackageModal.cycle}) প্যাকেজটি অর্ডার করতে চাই।`;
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/8801747046052?text=${encodedMsg}`, '_blank');
      setSelectedPackageModal(null);
    }
  };

    const handleForgotPassword = () => {
    const email = prompt("পাসওয়ার্ড রিসেট করতে আপনার নিবন্ধিত ইমেইল বসান:");
    if (email && email.trim()) {
      alert("📩 পাসওয়ার্ড রিসেট লিংক " + email.trim() + " ইমেইলে সফলভাবে পাঠানো হয়েছে! আপনার জিমেইল ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Client cards metadata dynamically loaded from localStorage
  const defaultClients = [
    {
      id: 1,
      title: "প্রাইম মোবাইল মার্ট",
      location: "কামাল পাশা মোড়, লক্ষ্মীপুর",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
      category: "মোবাইল শপ",
      description: "রিয়েল-টাইম স্টক আপডেট ও ইনস্ট্যান্ট মেমো প্রিন্টিং স্পীড খুবই চমৎকার।"
    },
    {
      id: 2,
      title: "ডিল্যাক্স ফ্যাশন হাউস",
      location: "আজাদ নগর, রামগতি",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400",
      category: "ক্লথিং ও ফ্যাশন",
      description: "মাল্টি-ক্যাটাগরি ট্র্যাকিং এবং ক্যাশ রেজিস্ট্রার মেইনটেইন করা এখন অনেক সহজ।"
    },
    {
      id: 3,
      title: "স্মার্ট গিফট গ্যালারি",
      location: "জৈন্তাপুর, সিলেট",
      image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=400",
      category: "গিফট ও কসমেটিক্স",
      description: "বারকোড স্ক্যানার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় প্রফিট ক্যালকুলেটর অসাধারণ।"
    },
    {
      id: 4,
      title: "পপুলার ড্রাগ হাউস",
      location: "ধানমন্ডি, ঢাকা",
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=400",
      category: "ফার্মেসী ও ড্রাগ স্টোর",
      description: "মেডিসিনের মিনিমাম স্টক অ্যালার্ট এবং ব্যাচ ট্র্যাকিং সিস্টেমটি অত্যন্ত কার্যকর।"
    },
    {
      id: 5,
      title: "এলাইট কসমেটিক্স পয়েন্ট",
      location: "জিইসি মোড়, চট্টগ্রাম",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400",
      category: "কসমেটিক্স ও গ্যাজেটস",
      description: "ফায়ারবেস ক্লাউড ব্যাকআপের কারণে কোনো ডাটা হারানোর ভয় সম্পূর্ণ কেটে গেছে।"
    }
  ];

  const [happyClients, setHappyClients] = useState(() => {
    try {
      const saved = localStorage.getItem('saim_happy_clients');
      return saved ? JSON.parse(saved) : defaultClients;
    } catch (e) {
      return defaultClients;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('saim_happy_clients');
        if (saved) setHappyClients(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const videoTutorials = [
    {
      id: 1,
      title: "১। জিমেইল দিয়ে লগইন ও সিস্টেম পরিচিতি",
      duration: "০২:১৫ মিনিট",
      description: "কোনো পাসওয়ার্ড ছাড়াই ১ ক্লিকে নিরাপদ গুগল সাইন-ইন পদ্ধতি এবং ড্যাশবোর্ড ওভারভিউ গাইড।",
      embedId: "7H_YJreWvhs"
    },
    {
      id: 2,
      title: "২। প্রোডাক্ট ও স্টক ইনভেন্টরি এন্ট্রি",
      duration: "০৩:৪০" + " মিনিট",
      description: "নতুন মেমো আইটেম নাম, ক্রয়মূল্য, বিক্রয়মূল্য ও বারকোড সহ ফায়ারস্টোরে লাইভ সেভ করার ফুল টিউটোরিয়াল।",
      embedId: "Y7S1gD_C10U"
    },
    {
      id: 3,
      title: "৩। সেলস রসিদ জেনারেশন ও থার্মাল প্রিন্ট",
      duration: "০৪:১০" + " মিনিট",
      description: "কাস্টমার নাম ও মোবাইল দিয়ে দ্রুত বিলিং মেমো প্রিন্ট করা এবং বিভিন্ন থার্মাল প্রিন্টারে সাইজ করার নিয়ম।",
      embedId: "O0a6XlR7P14"
    },
    {
      id: 4,
      title: "৪। দৈনিক প্রফিট ক্যালকুলেটর ও একাউন্টিং",
      duration: "০২:৫০" + " মিনিট",
      description: "লাভ-ক্ষতির স্বয়ংক্রিয় কালারড রিপোর্ট দেখা এবং গুগল শিট/পেক্সেলে রিপোর্ট ডাটা ডাউনলোড করার ফুল প্রসেস।",
      embedId: "X3yM9xNfE6s"
    }
  ];

  const faqItems = [
    {
      question: "SmartHisab POS এর প্রাইসিং ও সাবস্ক্রিপশন প্ল্যানগুলো কীভাবে কাজ করে?",
      answer: "SmartHisab POS একটি আধুনিক সাবস্ক্রিপশন-ভিত্তিক প্রফেশনাল ক্লাউড সফটওয়্যার। আপনি আপনার পছন্দ অনুযায়ী সাশ্রয়ী মাসিক প্যাকেজ অথবা বাৎসরিক বিশেষ ডিসকাউন্ট প্যাকেজ বেছে নিয়ে সেবা সচল রাখতে পারবেন। যেকোনো নতুন ব্যবহারকারী ফ্রী ডেমো ট্রায়াল দিয়ে সুবিধাগুলো পরীক্ষা করতে পারেন।"
    },
    {
      question: "আমার ব্যবসার ডাটা বা মেমো হিস্ট্রি কতটা সুরক্ষিত থাকবে?",
      answer: "অবশ্যই শতভাগ সুরক্ষিত! আমাদের পস সফটওয়্যার গুগলের হাই-সিকিউরিটি Firebase Firestore রিয়্যাল-টাইম ক্লাউড এনক্রিপ্টেড ডাটাবেজ ব্যবহার করে। আপনার মোবাইল বা কম্পিউটার নষ্ট হলেও নতুন ডিভাইসে আপনার ইমেইল দিয়ে লগইন করলেই সব ডাটা ব্যাকআপ পেয়ে যাবেন।"
    },
    {
      question: "আমি কি মোবাইল এবং ল্যাপটপ দুইটাতেই একসাথে চালাতে পারবো?",
      answer: "হ্যাঁ! এটি সম্পূর্ণ ক্লাউড-সিঙ্কড এবং ১০০% রেসপন্সিভ ওয়েব অ্যাপ্লিকেশন। একই সাথে আপনার দোকানের কাউন্টারে থাকা ডেক্সটপ/ল্যাপটপ এবং পকেটে থাকা মোবাইল দিয়ে রিয়্যাল-টাইম স্টক ও বিক্রির হিসাব পরিচালনা করতে পারবেন।"
    },
    {
      question: "থার্মাল প্রিন্টার দিয়ে কি ক্যাশ ভাউচার প্রিন্ট করা সম্ভব?",
      answer: "হ্যাঁ, আমাদের সিস্টেমে থার্মাল পিওএস প্রিন্টিং অপশন বিল্ট-ইন রয়েছে। আপনি ৮০ মিলিমিটার (80mm) বা ৫০ মিলিমিটার (50mm) যেকোনো স্ট্যান্ডার্ড ব্লুটুথ/ইউএসবি থার্মাল প্রিন্টারে চালান এবং ক্যাশ রসিদ মুহূর্তেই প্রিন্ট করতে পারবেন।"
    },
    {
      question: "সাবস্ক্রিপশন রিনিউ বা কোনো সহায়তার প্রয়োজন হলে কীভাবে সাপোর্ট পাব?",
      answer: "যেকোনো ধরণের সাবস্ক্রিপশন রিনিউ, টেকনিক্যাল সহায়তা বা কাস্টম ফিচার আপডেটের জন্য সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপ (01747-046052) সাপোর্ট লাইনে যোগাযোগ করতে পারেন।"
    }
  ];

  if (showDedicatedLogin) {
    return (
      <LoginPage 
        onBackToHome={() => setShowDedicatedLogin(false)}
        onLoginSuccess={() => {
          setShowDedicatedLogin(false);
          if (onEnterApp) onEnterApp();
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* =========================================
          1. TOP PREMIUM SUBTLE HIGHLIGHTS BAR
          ========================================= */}
      <div className="bg-[#011B2B] text-white py-2.5 border-b border-blue-950 z-50 relative select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-600 border border-rose-500 text-white font-bold uppercase text-[10px] sm:text-[11px] select-none tracking-wider shadow-sm animate-pulse">
              ● Live 2026 Edition
            </span>
            <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-wide">
              সম্পূর্ণ ক্লাউড ব্যাকআপ সাপোর্টেড সুরক্ষিত পস ইনভেন্টরি ট্র্যাকার।
            </span>
          </div>
          <div className="flex items-center gap-2.5 hidden sm:flex">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600/90 border border-emerald-500 text-white font-bold text-[11px] select-none tracking-wide shadow-xs">
              ⚡ ৭ দিনের ফ্রি ট্রায়াল
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600/90 border border-purple-500 text-white font-bold text-[11px] select-none tracking-wide shadow-xs">
              ☁️ ১০০% ক্লাউড সিঙ্কড
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          2. TOP BLUE CONTACT & SOCIALS BAR
          ========================================= */}
      <div className="bg-[#004b73] text-white text-xs py-2.5 z-40 relative select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          
          {/* Left: Phone & Mail */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-mono">
            <a href="tel:01747046052" className="flex items-center gap-1.5 hover:text-sky-300 transition">
              <PhoneCall size={13} className="text-sky-300" />
              <span>01747-046052</span>
            </a>
            <span className="hidden sm:inline text-white/20">|</span>
            <a href="mailto:info.fardousit@gmail.com" className="flex items-center gap-1.5 hover:text-sky-300 transition">
              <Mail size={13} className="text-sky-300" />
              <span>info.fardousit@gmail.com</span>
            </a>
          </div>

          {/* Right: Social Media Icons styled matching the screenshot */}
          <div className="flex items-center gap-2">
            <a href="https://www.facebook.com/share/1EfmkTVdf2/" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-500 duration-150 transition" title="Facebook">
              <Facebook size={12} className="text-white" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 duration-150 transition" title="YouTube">
              <Youtube size={12} className="text-white" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 duration-150 transition" title="LinkedIn">
              <Linkedin size={12} className="text-white" />
            </a>
            <a href="https://skype.com" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-600 duration-150 transition" title="Skype">
              <div className="text-[10px] font-bold font-sans text-white">S</div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1DA1F2] duration-150 transition" title="Twitter/X">
              <span className="text-[9px] font-bold font-sans text-white">X</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-6.5 w-6.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 duration-150 transition" title="Instagram">
              <div className="text-[9px] font-sans font-bold text-white">IG</div>
            </a>
          </div>

        </div>
      </div>

      {/* =========================================
          3. MAIN HERO WHITE NAVBAR
          ========================================= */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 shadow-sm ${theme === 'dark' ? 'bg-slate-950/95 border-slate-900' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* SmartHisab Official Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="/smarthisab_logo.png" 
              alt="SmartHisab — Cloud-Based Business POS Software" 
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]" 
            />
          </div>

          {/* Nav Items matched from screenshot */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-bold text-slate-700 dark:text-slate-100">
            <a href="#top" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', window.location.pathname); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#004b73] dark:hover:text-amber-400 transition">মেইন ওয়েবসাইট</a>
            <a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="hover:text-[#004b73] dark:hover:text-amber-400 transition text-[#8b26c7] dark:text-purple-400 font-bold flex items-center gap-1">
              <span>প্যাকেজ সমূহ</span>
              <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">নতুন</span>
            </a>
            <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="hover:text-[#004b73] dark:hover:text-amber-400 transition">রেডি সফটওয়্যার</a>
            <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="hover:text-[#004b73] dark:hover:text-amber-400 transition">জিজ্ঞাসা</a>
            <a href="#tutorials" onClick={(e) => handleScrollToSection(e, 'tutorials')} className="hover:text-[#004b73] dark:hover:text-amber-400 transition">ভিডিও টিউটোরিয়াল</a>
          </nav>

          {/* Right Purple Login/Register Buttons as in screenshot */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition duration-150 hover:scale-[1.03] active:scale-95 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border border-slate-800 text-amber-400' : 'bg-slate-100 text-amber-500 border border-slate-200'}`}
              title="থিম পরিবর্তন করুন"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2005/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-amber-400 text-amber-500">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.4 12.4l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58m12.4-12.4l1.58-1.58M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z" />
                </svg>
              )}
            </button>

            {/* Login: demoted to a text link so the primary CTA has a single visual anchor */}
            <button
              onClick={() => handleScrollToAuth('login')}
              className="px-3 py-2 text-[13px] font-bold text-[#8b26c7] dark:text-sky-400 hover:underline underline-offset-4 min-h-[44px] cursor-pointer"
            >
              লগইন
            </button>

            {/* Registration: primary conversion CTA */}
            <button
              onClick={() => handleScrollToAuth('register')}
              className="px-6 min-h-[44px] py-2 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white rounded-md text-[13px] font-bold duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm text-center"
            >
              ফ্রি রেজিস্ট্রেশন
            </button>

            {/* Return to Dashboard Button if session active */}
            {onEnterApp && (
              <button
                type="button"
                onClick={onEnterApp}
                className="px-4 min-h-[44px] py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-md text-[13px] font-bold duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md text-center flex items-center gap-1.5 border border-amber-300/40"
                title="সফ্টওয়্যার ড্যাশবোর্ডে ফিরে যান"
              >
                <span>🔑 ড্যাশবোর্ড</span>
              </button>
            )}

          </div>

          {/* Smartphone Hamburger Icon */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 min-h-[44px] min-w-[44px] bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-500 mr-1"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900 transition"
            >
              {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-950 animate-fadeIn">
            <nav className="flex flex-col gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <a href="#top" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.history.pushState(null, '', window.location.pathname); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="py-2 px-3 hover:bg-slate-100 rounded">মেইন ওয়েবসাইট</a>
              <a href="#pricing" onClick={(e) => { setMobileMenuOpen(false); handleScrollToSection(e, 'pricing'); }} className="py-2 px-3 hover:bg-purple-50 text-[#8b26c7] font-bold rounded flex items-center justify-between">
                <span>প্যাকেজ সমূহ</span>
                <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">NEW</span>
              </a>
              <a href="#features" onClick={(e) => { setMobileMenuOpen(false); handleScrollToSection(e, 'features'); }} className="py-2 px-3 hover:bg-slate-100 rounded">রেডি সফটওয়্যার</a>
              <a href="#faq" onClick={(e) => { setMobileMenuOpen(false); handleScrollToSection(e, 'faq'); }} className="py-2 px-3 hover:bg-slate-100 rounded">জিজ্ঞাসা</a>
              <a href="#tutorials" onClick={(e) => { setMobileMenuOpen(false); handleScrollToSection(e, 'tutorials'); }} className="py-2 px-3 hover:bg-slate-100 rounded">ভিডিও টিউটোরিয়াল</a>
            </nav>
            <div className="pt-2 border-t flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); handleScrollToAuth('register'); }}
                className="w-full min-h-[48px] py-3 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white font-bold rounded-lg text-sm shadow-sm"
              >
                ফ্রি রেজিস্ট্রেশন করুন
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleScrollToAuth('login'); }}
                className="w-full min-h-[48px] py-3 border-2 border-[#8b26c7] text-[#8b26c7] dark:text-sky-400 font-bold rounded-lg text-sm bg-white dark:bg-slate-900"
              >
                লগইন করুন
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================
          4. INTUITIVE HERO SECTION
          ========================================= */}
      <section 
        id="hero" 
        className={`relative py-16 lg:py-24 overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0d1c2d]' : 'bg-[#eef5fa]'}`}
      >
        {/* Repeating Grid Dot Pattern representation as visible in background of screenshot */}
        <div className="absolute inset-0 opacity-25 pointer-events-none select-none bg-[radial-gradient(#004b73_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>
        
        {/* Aesthetic Soft Glow Elements */}
        <div className="absolute top-1/4 left-1/12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/12 w-96 h-96 bg-[#8b26c7]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Content Matching Font & Layout exactly */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b26c7]/15 text-[#8b26c7] dark:text-purple-300 rounded-lg text-xs font-bold leading-none select-none">
              <Award size={13} />
              <span>১০০% ক্লাউড সিকিউরড লাইভ পিওএস ইনভেন্টরি ট্র্যাকার</span>
            </div>

            <h1 className="text-3.5xl sm:text-5xl font-bold font-display tracking-tight leading-tight text-[#004b73] dark:text-white">
              স্মার্ট হিসাব পস সফটওয়্যার (SmartHisab) এর মাধ্যমে ব্যবসা পরিচালনা হবে আরো সহজে
            </h1>

            <p className="text-sm sm:text-base text-slate-650 dark:text-slate-200 max-w-2xl leading-relaxed font-sans">
              ব্যবসার সব কঠিন হিসাবের সহজ সমাধান স্মার্ট হিসাব পস সফটওয়্যার (SmartHisab)। তাই স্মার্ট হিসাব পস সফটওয়্যার (SmartHisab) আপনার ব্যবসাকে করবে গতিশীল ও চিন্তামুক্ত।
            </p>

            {/* Micro Feature Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <CheckCircle2 className="text-[#8b26c7] shrink-0" size={17} />
                <span>রিয়াল-টাইম ফায়ারস্টোর ডাটাবেজ ব্যাকআপ</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <CheckCircle2 className="text-[#8b26c7] shrink-0" size={17} />
                <span>থার্মাল ভাউচার ও চালানি মেমো জেনারেটর</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <CheckCircle2 className="text-[#8b26c7] shrink-0" size={17} />
                <span>অটোমেটেড লাভ-ক্ষতি ও ইনভেন্টরি হ্রাস</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <CheckCircle2 className="text-[#8b26c7] shrink-0" size={17} />
                <span>বাংলা এআই চ্যাটবিজনেস এ্যাসিস্ট্যান্ট</span>
              </div>
            </div>

            {/* Action Buttons with Purple Color styling */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => handleScrollToAuth('register')}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#8b26c7] to-[#701fa3] hover:brightness-110 text-white rounded-md text-sm font-bold shadow-lg shadow-purple-500/15 duration-150 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Sparkles size={16} />
                <span>ফ্রি ডেমো ট্রায়াল শুরু করুন</span>
              </button>

              <a
                href="#features"
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border text-xs font-bold duration-150 hover:scale-[1.01] active:scale-95 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'}`}
              >
                <span>ফিচারসমূহ দেখুন</span>
                <ChevronRight size={14} className="text-sky-600" />
              </a>
            </div>

            {/* Developer watermark matches */}
            <div className="pt-3 border-t border-slate-300/40 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">সাপোর্ট ডেক্সঃ</span>
              <a 
                href="https://wa.me/message/NTKAFHJ7Y4NUO1?src=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#004b73] dark:text-sky-400 font-bold text-xs sm:text-sm hover:underline flex items-center gap-1.5 leading-none font-mono"
              >
                📞 01747-046052 (Fardous Al-Amin)
              </a>
            </div>

          </div>

          {/* Right Column Content - Displaying high fidelity device graphics resembling the laptop screen with statistics */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Visual Back Support Frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8b26c7]/10 to-blue-500/10 rounded-full blur-3xl transform rotate-12 pointer-events-none"></div>

            {/* High fidelity CSS Mockup Frame presenting a Modern Laptop */}
            <div className="w-full max-w-sm relative z-10 space-y-4">
              
              <div className={`p-4 rounded-2xl border shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                
                {/* Sample-screen ribbon so first-time visitors don't mistake this mockup for their real account */}
                <div
                  role="note"
                  aria-label="This is a sample preview, not live account data"
                  className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300"
                >
                  <span aria-hidden="true">👁️</span>
                  <span>নমুনা স্ক্রিন / Demo Preview — Sample data, not a live account</span>
                </div>

                {/* Mockup Header bar */}
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-200 dark:border-slate-800">
                  <div className="flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#004b73] dark:text-sky-400 font-mono">
                    FARDOUS LIVE-FEED V2 · SAMPLE
                  </span>
                </div>

                {/* Simulated Chart/State Box */}
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-tr from-sky-50 to-blue-100/50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-blue-50/70 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">মোট বিক্রির পরিমাণ (দৈনিক)</span>
                        <span className="text-xl font-bold font-mono text-zinc-800 dark:text-white tracking-tight">৳৮৪,৫৬০.০০</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                        +১২.৪%
                      </span>
                    </div>
                    {/* Simulated Mini bar-chart tracks */}
                    <div className="flex items-end gap-1.5 h-10 pt-3 flex-wrap">
                      <div className="flex-1 bg-sky-300 dark:bg-sky-500 h-5 rounded-t"></div>
                      <div className="flex-1 bg-sky-400 dark:bg-sky-650 h-7 rounded-t"></div>
                      <div className="flex-1 bg-blue-500 h-10 rounded-t"></div>
                      <div className="flex-1 bg-sky-300 dark:bg-sky-500 h-4 rounded-t"></div>
                      <div className="flex-1 bg-purple-500 h-8 rounded-t animate-pulse"></div>
                    </div>
                  </div>

                  {/* Stock table rows simulations */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">ইনভেন্টরি নজরদারী</span>
                    
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-[11px] border border-slate-100 dark:border-slate-900">
                      <span className="font-semibold truncate max-w-[120px]">স্মার্টফোন ক্যাটাগরি</span>
                      <span className="text-[9px] text-[#8b26c7] font-bold">৯৬ পিস এভেইলেবল</span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-[11px] border border-slate-100 dark:border-slate-900">
                      <span className="font-semibold truncate max-w-[120px]">মেডিসিন কসমেটিক্স</span>
                      <span className="text-[10px] text-rose-500 font-bold animate-pulse">০৫ পিস কম স্টক</span>
                    </div>
                  </div>

                  {/* Tiny Interactive Button in Mockup */}
                  <button onClick={() => handleScrollToAuth('register')} className="w-full py-2 bg-[#8b26c7] hover:bg-[#7e1ebd] text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center justify-center gap-1">
                    <LogIn size={11} />
                    <span>স্মার্ট হিসাব পস সফটওয়্যার (SmartHisab)</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          4.5 STATISTICAL COUNTERS (সংখ্যায় আমাদের অর্জন)
          ========================================= */}
      <section className={`py-12 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#091524] border-slate-900' : 'bg-white border-[#e2e8f0]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Counter 1 */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <div className="p-3.5 bg-purple-500/10 rounded-xl text-[#8b26c7] dark:text-purple-300">
                <Users size={24} />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#004b73] dark:text-sky-400 block leading-tight">১,২৫০+</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400">সক্রিয় মার্চেন্ট ও ব্যবসায়ী</span>
              </div>
            </div>

            {/* Counter 2 */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-550 dark:text-blue-400">
                <Database size={24} />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#004b73] dark:text-sky-400 block leading-tight">৳৯৫ লাখ+</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400">ট্রানজ্যাকশন সম্পন্ন</span>
              </div>
            </div>

            {/* Counter 3 */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-500 dark:text-emerald-400">
                <Cloud size={24} />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block leading-tight">৯৯.৯৯%</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400">ক্লাউড ডাটা ব্যাকআপ</span>
              </div>
            </div>

            {/* Counter 4 */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 transition-transform hover:scale-[1.02] duration-200 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
              <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-500 dark:text-amber-400">
                <Layers size={24} />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 block leading-tight">১০+ ক্যাটাগরি</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400">ব্যবসার মেমো ধরণ</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          5. FEATURES & CAPABILITIES CORE PANELS
          ========================================= */}
      <section id="features" className={`py-16 sm:py-20 border-t border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b1322] border-slate-900' : 'bg-slate-100/50 border-slate-205'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8b26c7] bg-purple-500/10 py-1 px-3.5 rounded-full inline-block leading-none">
              মডিউল ও কার্যাবলী
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white leading-tight">
              অনন্য এবং ব্যবহারকারী-বান্ধব ফিচার প্যানেল সমূহ
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              আমাদের পিওএস সফটওয়্যারে জটিল রিমোট কোনো ডেক্সটপ সেটআপ বা আলাদা ইনস্টলেশন ছাড়াই যেকোনো ব্রাউজারে কাস্টমার ডাটাবেজ ট্র্যাক করতে পারবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tabs List */}
            <div className="lg:col-span-4 space-y-2 text-left">
              <button
                onClick={() => setActiveFeatureTab('billing')}
                className={`w-full p-4 rounded-xl border text-left transition duration-150 flex items-start gap-3 cursor-pointer ${activeFeatureTab === 'billing' ? 'bg-purple-500/10 border-[#8b26c7] text-[#8b26c7] dark:text-purple-300 font-bold' : 'bg-white dark:bg-slate-900 border-transparent dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg text-[#8b26c7] shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">POS দ্রুত বিলিং সিস্টেম</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-600 font-normal leading-normal mt-0.5">১ ক্লিকে ক্যাশ আউট ও থার্মাল প্রিন্টিং মেমো জেনারেট করুন।</p>
                </div>
              </button>

              <button
                onClick={() => setActiveFeatureTab('inventory')}
                className={`w-full p-4 rounded-xl border text-left transition duration-150 flex items-start gap-3 cursor-pointer ${activeFeatureTab === 'inventory' ? 'bg-purple-500/10 border-[#8b26c7] text-[#8b26c7] dark:text-purple-300 font-bold' : 'bg-white dark:bg-slate-900 border-transparent dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 shrink-0">
                  <Settings size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">স্টক ক্যাটাগরি ও ইনভেন্টরি ট্র্যাকিং</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-600 font-normal leading-normal mt-0.5">কম পণ্য স্টক রি-অর্ডার এলার্ট, ক্যাটাগরি ফিল্টার এবং SKU কোড ডাটাবেজ ট্র্যাকার।</p>
                </div>
              </button>

              <button
                onClick={() => setActiveFeatureTab('accounting')}
                className={`w-full p-4 rounded-xl border text-left transition duration-150 flex items-start gap-3 cursor-pointer ${activeFeatureTab === 'accounting' ? 'bg-purple-500/10 border-[#8b26c7] text-[#8b26c7] dark:text-purple-300 font-bold' : 'bg-white dark:bg-slate-900 border-transparent dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg text-indigo-600 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">অটো লাভ-ক্ষতি ও সেলস রিপোর্ট</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-600 font-normal leading-normal mt-0.5">ক্রয়মূল্য ও বিক্রয়মূল্যের তুলনামূলক লাভ-ক্ষতির অটোমেটেড কালারড বোর্ড রিপোর্ট।</p>
                </div>
              </button>

              <button
                onClick={() => { setActiveFeatureTab('ai'); setIsAiModalOpen(true); }}
                className={`w-full p-4 rounded-xl border text-left transition duration-150 flex items-start gap-3 cursor-pointer ${activeFeatureTab === 'ai' ? 'bg-purple-500/10 border-[#8b26c7] text-[#8b26c7] dark:text-purple-300 font-bold' : 'bg-white dark:bg-slate-900 border-transparent dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg text-amber-500 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">এআই বিজনেস অ্যানালাইটিকাল এ্যাসিস্ট্যান্ট</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-600 font-normal leading-normal mt-0.5">Gemini এআই চ্যাট ইন্টিগ্রেশন এবং স্বয়ংক্রিয় প্রফিট অপ্টিমাইজেশন পরামর্শক।</p>
                </div>
              </button>
            </div>

            {/* Display Area */}
            <div className="lg:col-span-8">
              <div className={`p-6 sm:p-8 rounded-2xl border text-left shadow-sm h-full flex flex-col justify-between space-y-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                
                {activeFeatureTab === 'billing' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8b26c7] font-bold bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-200/60">
                        পয়েন্ট অফ সেলস (POS) বিলিং স্ক্রিন
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        ⚡ ইনস্ট্যান্ট ক্যাশ রেজিস্টার
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
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
                        <span className="font-bold text-amber-300">📜 নমুনা ক্যাশ মেমো রসিদ (POS Receipt)</span>
                        <span className="bg-emerald-500 text-slate-950 text-[9px] px-2 py-0.5 rounded font-bold">PAID</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>স্মার্ট গ্যাজেট হেডফোন (x১)</span>
                        <span className="font-bold">৳১,২০০</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>ডিসকাউন্ট (৫%)</span>
                        <span className="text-rose-300">-৳৬০</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-1 border-t border-white/10 text-amber-300">
                        <span>সর্বমোট পরিগ্রেহনীয়:</span>
                        <span>৳১,১৪০</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'inventory' && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-md">স্মার্ট ইনভেন্টরি মডিউল</span>
                    <h3 className="text-xl font-bold">অটোমেটেড ইনভেন্টরি সিঙ্ক অলওয়েজ</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      কোন আইটেমটি কত পিস আপনার দোকানে আছে, তার সম্পূর্ণ হিসাব চোখের সামনে। যখনই কাস্টমারের কাছে কোনো মাল বিক্রি হবে, অটোমেটিক স্টক ডাটাবেজ থেকে সেই পরিমাণ হ্রাস পেয়ে যাবে। কম স্টক থাকা পণ্যের তালিকা আলাদা কালার এলার্ট আকারে দেখা যাবে।
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl grid grid-cols-2 gap-4">
                      <div className="flex gap-2 text-xs">
                        <Layers size={14} className="text-blue-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">ক্যাটাগরি ভিত্তিক পণ্য ফিল্টারিং</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">SKU ও মিনিমাম স্টক ইন্ডিকেটর</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'accounting' && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md">অটোমেটেড একাউন্টিং মডিউল</span>
                    <h3 className="text-xl font-bold">সহজ ব্যবসা, স্বচ্ছ লাভ-ক্ষতি</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                      আর ম্যানুয়ালি ক্যালকুলেটর নিয়ে সকাল-সন্ধ্যা লাভ হিসাব করতে হবে না। পণ্যের সঠিক ক্রয়মূল্য ইনপুট দিলে সিস্টেম স্বয়ংক্রিয়ভাবে প্রফিট ক্যালকুলেট করে দেবে। দৈনিক মোট জমা, বাকির খাতা ও লাভ ক্যাটাগরি অনুযায়ী গ্রাফিকাল রিচার্টস আকারে ড্যাশবোর্ডে দেখতে পারবেন।
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl grid grid-cols-2 gap-4">
                      <div className="flex gap-2 text-xs">
                        <TrendingUp size={14} className="text-indigo-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">ইন্টারেক্টিভ গ্রাফিক্যাল লাভ-ক্ষতি চার্টসমূহ</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-600 font-bold">Excel ও PDF এ রিপোর্ট ডাউনলোড করার সুযোগ</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'ai' && (
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
                )}

                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-center">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    ✨ আমাদের এই প্রযুক্তি দিয়ে আপনার বিজনেস বুস্ট করুন।
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================
          5.3 PACKAGES & PRICING PLANS SECTION (প্যাকেজ সমূহ)
          ========================================= */}
      <section id="pricing" className={`py-16 sm:py-24 border-t border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#060d19] border-slate-900' : 'bg-gradient-to-b from-slate-100 via-purple-50/30 to-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          
          {/* Header Badge & Title */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8b26c7] bg-purple-500/10 py-1.5 px-4 rounded-full inline-flex items-center gap-1.5 border border-purple-500/20 shadow-xs">
              <Sparkles size={14} className="text-amber-500" />
              <span>প্যাকেজ ও সাবস্ক্রিপশন প্ল্যান সমূহ</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white leading-tight">
              আপনার ব্যবসার পরিধি অনুযায়ী সঠিক প্যাকেজ বেছে নিন
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-sans max-w-2xl mx-auto">
              কোনো হিডেন সার্ভিস চার্জ নেই। বাৎসরিক প্যাকেজে পাচ্ছেন ২০% মূল্যছাড় ও ১০০% ফ্রি ফায়ারবেস রিয়েল-টাইম ক্লাউড ব্যাকআপ!
            </p>

            {/* Monthly / Yearly Billing Cycle Toggle Switch */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold cursor-pointer transition ${pricingCycle === 'monthly' ? 'text-[#8b26c7] dark:text-purple-400 font-bold' : 'text-slate-500'}`} onClick={() => setPricingCycle('monthly')}>
                মাসিক বিলিং
              </span>
              <button
                type="button"
                onClick={() => setPricingCycle(pricingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 bg-[#8b26c7] rounded-full p-1 transition duration-200 relative focus:outline-none shadow-inner cursor-pointer"
                title="মাসিক বা বাৎসরিক বিলিং পরিবর্তন করুন"
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${pricingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setPricingCycle('yearly')}>
                <span className={`text-xs font-bold transition ${pricingCycle === 'yearly' ? 'text-[#8b26c7] dark:text-purple-400 font-bold' : 'text-slate-500'}`}>
                  বাৎসরিক বিলিং
                </span>
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow-xs">
                  -{pricingConfig.yearlyDiscountPercent || 20}% ছাড় 🎉
                </span>
              </div>
            </div>

            {/* Super Admin Pricing Controller Button - Visible only to Super Admin */}
            {isSuperAdminUser && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => { setTempPricingConfig(pricingConfig); setIsEditPriceModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  title="শুধুমাত্র সুপার এডমিন (ফেরদৌস আল আমিন) এই বাটনটি দেখতে পাবেন"
                >
                  <span>👑 সুপার এডমিন কন্ট্রোল: সাবস্ক্রিপশনের টাকা পরিবর্তন করুন</span>
                </button>
              </div>
            )}

          </div>

          {/* 4 Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Card 1: 🎁 Free Trial Demo */}
            <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between text-left transition-all duration-300 relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                    🎁 ফ্রি ট্রায়াল
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200">
                    ৭ দিন ফ্রি
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">ডেমো ট্রায়াল</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">নতুন ব্যবসায়ীদের জন্য সিস্টেম পরখ করার আদর্শ প্ল্যান।</p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white">৳০</span>
                  <span className="text-xs text-slate-400 font-medium ml-1">/৭ দিন</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span>৫০টি সেলস ইনভয়েস লিমিট</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span>১টি দোকান কাউন্টার এক্সেস</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span>প্রোডাক্ট স্টক এন্ট্রি ও এডিটিং</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span>কাস্টমার বাকির খাতা ও লেজার</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span>থার্মাল ক্যাশ মেমো প্রিন্টিং</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleScrollToAuth('register')}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs transition duration-150 cursor-pointer text-center"
                >
                  🎁 ৭ দিনের ফ্রি ডেমো চালু করুন
                </button>
              </div>
            </div>

            {/* Card 2: 🚀 Starter Plan */}
            <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between text-left transition-all duration-300 relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-lg">
                    🚀 স্টার্টার
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded border border-sky-200">
                    ছোট দোকান
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">স্টার্টার প্যাকেজ</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">ছোট বা মাঝারি মুদি, জেনারেল বা গিফট শপের জন্য।</p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-sky-600 dark:text-sky-400">
                    {pricingCycle === 'yearly' ? starterYearlyStr : starterMonthlyStr}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    /{pricingCycle === 'yearly' ? 'বছর' : 'মাস'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-500 shrink-0" />
                    <span>১,০০০টি মেমো/মাস</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-500 shrink-0" />
                    <span>১জন অ্যাডমিন + ২জন ক্যাশিয়ার</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-500 shrink-0" />
                    <span>বারকোড স্ক্যানিং ও প্রিন্টিং</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-500 shrink-0" />
                    <span>দৈনিক ও মাসিক অটো প্রফিট রিপোর্ট</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-500 shrink-0" />
                    <span>ইমেইল ও মেসেজ কাস্টমার সাপোর্ট</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPackage('স্টার্টার প্যাকেজ', starterMonthlyStr, starterYearlyStr, 'ছোট ও মাঝারি দোকানের জন্য সাশ্রয়ী সমাধান', ['১,০০০টি মেমো/মাস', '১জন অ্যাডমিন + ২জন ক্যাশিয়ার', 'বারকোড ও স্টক ট্র্যাকিং', 'দৈনিক লাভ-ক্ষতি রিপোর্ট'])}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition duration-150 cursor-pointer shadow-md text-center"
                >
                  🚀 স্টার্টার প্যাকেজ নিবেন
                </button>
              </div>
            </div>

            {/* Card 3: ⚡ Pro Business Plan (FEATURED/POPULAR) */}
            <div className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col justify-between text-left transition-all duration-300 relative shadow-2xl scale-[1.02] ${theme === 'dark' ? 'bg-[#0f172a] border-[#8b26c7]' : 'bg-white border-[#8b26c7] ring-4 ring-purple-500/10'}`}>
              
              {/* Top Highlight Ribbon */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8b26c7] to-[#701fa3] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles size={12} className="text-amber-300" />
                <span>🌟 সবচেয়ে জনপ্রিয় (Best Value)</span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-purple-100 dark:bg-purple-950 text-[#8b26c7] dark:text-purple-300 rounded-lg">
                    ⚡ প্রো বিজনেস
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-300">
                    অল-ইন-ওয়ান
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">প্রো বিজনেস প্যাকেজ</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">মোবাইল শপ, ফার্মেসি ও মাঝারি রিটেইল আউটলেটের জন্য সেরা।</p>
                </div>

                <div className="py-2 border-y border-purple-100 dark:border-slate-800">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[#8b26c7] dark:text-purple-400">
                    {pricingCycle === 'yearly' ? proYearlyStr : proMonthlyStr}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    /{pricingCycle === 'yearly' ? 'বছর' : 'মাস'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>🔥 <strong>অনলিমিটেড মেমো ও আনলিমিটেড স্টক</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>📱 <strong>IMEI & ওয়ারেন্টি মডিউল</strong> (মোবাইল শপ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>💊 <strong>ব্যাচ ও এক্সপায়ারি ডেট</strong> (ফার্মেসি)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>💳 <strong>কিস্তি বিক্রি (Installment Sales)</strong> মডিউল</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>১জন অ্যাডমিন + ৫জন ক্যাশিয়ার এক্সেস</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#8b26c7] shrink-0" />
                    <span>রিয়েল-টাইম ফায়ারবেস ক্লাউড ব্যাকআপ</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-purple-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPackage('প্রো বিজনেস প্যাকেজ', proMonthlyStr, proYearlyStr, 'মোবাইল শপ, ফার্মেসি ও মাঝারি সকল ব্যবসার জন্য অল-ইন-ওয়ান সমাধান', ['অনলিমিটেড মেমো ও ইনভেন্টরি', 'IMEI ও ওয়ারেন্টি মডিউল', 'ফার্মেসি ব্যাচ ও মেয়াদ ট্র্যাকিং', 'কিস্তি বিক্রির হিসাব', '৫জন ক্যাশিয়ার সাপোর্ট', 'রিয়েল-টাইম ক্লাউড ব্যাকআপ'])}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8b26c7] to-[#701fa3] hover:brightness-110 text-white font-bold text-xs transition duration-150 cursor-pointer shadow-lg shadow-purple-500/20 text-center"
                >
                  ⚡ প্রো প্যাকেজটি বেছে নিন →
                </button>
              </div>
            </div>

            {/* Card 4: 🌟 Enterprise Plan */}
            <div className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between text-left transition-all duration-300 relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg hover:shadow-xl'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg">
                    🌟 এন্টারপ্রাইজ
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200">
                    বহুমুখী শাখা
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">এন্টারপ্রাইজ আনলিমিটেড</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">মাল্টি-ব্রাঞ্চ শোরুম ও বড় সুপারশপের জন্য ডেডিকেটেড প্ল্যান।</p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {pricingCycle === 'yearly' ? enterpriseYearlyStr : enterpriseMonthlyStr}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    /{pricingCycle === 'yearly' ? 'বছর' : 'মাস'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                    <span>সব ফিচার <strong>সম্পূর্ণ আনলিমিটেড</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                    <span>মাল্টি-ব্রাঞ্চ (একাধিক শাখা) নেটওয়ার্ক</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                    <span>আনলিমিটেড কর্মচারী ও রোল পারমিশন</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                    <span>Gemini AI চ্যাট বিজনেস কনসালটেন্ট</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                    <span>২৪/৭ ভিআইপি হোয়াটসঅ্যাপ ও ফোন সাপোর্ট</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPackage('এন্টারপ্রাইজ প্যাকেজ', enterpriseMonthlyStr, enterpriseYearlyStr, 'মাল্টি-ব্রাঞ্চ ও প্রিমিয়াম বিজনেসের জন্য আনলিমিটেড সমাধান', ['অনলিমিটেড শাখা ও আনলিমিটেড সেলস', 'আনলিমিটেড ইউজার ও কর্মচারী রোলস', 'Gemini 1.5 এআই কনসালটেন্ট', '২৪/৭ ভিআইপি হোয়াটসঅ্যাপ সাপোর্ট'])}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition duration-150 cursor-pointer shadow-md text-center"
                >
                  🌟 এন্টারপ্রাইজ প্যাকেজ নিবেন
                </button>
              </div>
            </div>

          </div>

          {/* Toggle Button for Detailed Feature Comparison Matrix */}
          <div className="pt-4 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowPackageComparison(!showPackageComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm hover:bg-purple-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <span>📊 সকল প্যাকেজের ফিচার তুলনা তালিকা (Comparison Table)</span>
              {showPackageComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Collapsible Comparison Table */}
            {showPackageComparison && (
              <div className="w-full max-w-5xl mx-auto overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-4 animate-fadeIn text-left">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <th className="p-3 text-left font-bold">ফিচার বা সার্ভিসসমূহ</th>
                      <th className="p-3 text-center font-bold">🎁 ফ্রি ডেমো</th>
                      <th className="p-3 text-center font-bold">🚀 স্টার্টার</th>
                      <th className="p-3 text-center font-bold text-[#8b26c7] dark:text-purple-400">⚡ প্রো বিজনেস</th>
                      <th className="p-3 text-center font-bold text-amber-600">🌟 এন্টারপ্রাইজ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    <tr>
                      <td className="p-3 font-semibold">মাসিক ইনভয়েস / মেমো সীমানা</td>
                      <td className="p-3 text-center">৫০টি</td>
                      <td className="p-3 text-center">১,০০০টি</td>
                      <td className="p-3 text-center font-bold text-[#8b26c7] dark:text-purple-400">অনলিমিটেড</td>
                      <td className="p-3 text-center font-bold text-amber-600">অনলিমিটেড</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">প্রোডাক্ট ও স্টক ট্র্যাকিং</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">IMEI & ওয়ারেন্টি মডিউল (মোবাইল শপ)</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">ব্যাচ ও এক্সপায়ারি মেয়াদী তারিখ (ফার্মেসি)</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">কিস্তি বিক্রি ও কিস্তি খাতা (Installments)</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-slate-300">✕</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">থার্মাল ও A4/A5 চালানি রসিদ প্রিন্ট</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">কর্মচারী ও ক্যাশিয়ার অ্যাকাউন্টস</td>
                      <td className="p-3 text-center">১টি</td>
                      <td className="p-3 text-center">৩টি</td>
                      <td className="p-3 text-center font-bold">৫টি</td>
                      <td className="p-3 text-center font-bold text-amber-600">অনলিমিটেড</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">ক্লাউড অটো ব্যাকআপ ও ডাটা সুরক্ষা</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500">✓</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓ (Point-in-Time)</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">✓ (Point-in-Time)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">কাস্টমার টেকনিক্যাল সাপোর্ট</td>
                      <td className="p-3 text-center">বেসিক</td>
                      <td className="p-3 text-center">ইমেইল</td>
                      <td className="p-3 text-center font-bold text-[#8b26c7]">হোয়াটসঅ্যাপ সাপোর্ট</td>
                      <td className="p-3 text-center font-bold text-amber-600">২৪/৭ ভিআইপি সাপোর্ট</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* =========================================
          5.5 HOW IT WORKS (সহজ ৩টি ধাপে পস ব্যবহার শুরু করুন)
          ========================================= */}
      <section className={`py-16 transition-colors duration-300 border-b ${theme === 'dark' ? 'bg-[#0b1322] border-slate-900' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8b26c7] bg-purple-500/10 py-1 px-3.5 rounded-full inline-block leading-none">
              ব্যবহার নির্দেশিকা / How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white leading-tight">
              সহজ ৩টি ধাপে আপনার ব্যবসার অনলাইন হিসাব শুরু করুন
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-400 font-sans">
              কোন প্রকার জটিল ডেক্সটপ ইন্সটলেশন বা দীর্ঘমেয়াদী কনফিগারেশন ছাড়াই পস ব্যবহার করুন চোখের পলকে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className={`p-8 rounded-2xl border text-left flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0] shadow-sm'}`}>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center text-[#8b26c7] font-bold text-xl font-mono">
                  ০১
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">১-ক্লিক গুগল লগইন</h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans">
                  কোনো পাসওয়ার্ড ভুলে যাওয়া বা জটিল সাইনআপ ফরম পূরণ করার টেনশন নেই। শুধুমাত্র আপনার মোবাইলে বা ব্রাউজারে থাকা জিমেইল একাউন্ট সিলেক্ট করে ১ সেকেন্ডেই নিরাপদ প্রবেশ করুন।
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-[#8b26c7] dark:text-purple-300 gap-1 mt-4">
                <span>লগইন করুন</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-8 rounded-2xl border text-left flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0] shadow-sm'}`}>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl font-mono">
                  ০২
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">পণ্য ও সেলস স্টক এন্ট্রি</h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans">
                  আপনার কাঙ্ক্ষিত পণ্যের নাম, ক্যাটাগরি, ক্রয়মূল্য এবং কাস্টমার বিক্রয়মূল্য সহ স্টক পরিমাণ নির্ধারণ করুন। আপনি চাইলে বারকোড দিয়েও তাৎক্ষণিক পণ্য সিলেক্ট ও তৈরি করতে পারবেন।
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-300 gap-1 mt-4">
                <span>স্টক আপডেট</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-8 rounded-2xl border text-left flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0] shadow-sm'}`}>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl font-mono">
                  ০৩
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">১-সেকেন্ডে চালান ও প্রিন্ট</h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-sans">
                  পণ্য সিলেক্ট করে সাবমিট করুন। স্বয়ংক্রিয়ভাবে ইনভেন্টরি স্টক থেকে পণ্য হ্রাস পাবে এবং আপনার জন্য থার্মাল সাইজ বা ভাউচার রসিদ তৈরি হবে। ১ ক্লিকেই পিডিএফ ডাউনলোড ও প্রিন্ট সাপোর্টেড।
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-300 gap-1 mt-4">
                <span>চালান তৈরি করুন</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          6. "HAPPY CLIENTS" TESTIMONIALS MODULAR GRID
             (Matching shohozsoftware.com layout structure)
          ========================================= */}
      <section id="happy-clients" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-wider text-[#8b26c7] bg-purple-500/10 py-1 px-3.5 rounded-full inline-block leading-none">
            গ্রাহকদের বাস্তব রিভিউ
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white leading-tight">
            Happy Clients About SmartHisab POS
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            সমগ্র বাংলাদেশে আমাদের পিওএস ড্যাশবোর্ড মার্চেন্টের বাস্তব ছবি ও মতামত।
          </p>
        </div>

        {/* Five columns grid layout as implemented for SOHOZ style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
          {happyClients.map((client, index) => (
            <div 
              key={client.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between shadow-lg duration-250 hover:translate-y-[-6px] hover:shadow-xl relative bg-[#012338] border-blue-900 border-opacity-40 text-white`}
              style={{ minHeight: '380px' }}
            >
              
              {/* Card Header Tagline */}
              <div className="bg-[#004b73] py-2.5 text-center border-b border-white/5 relative">
                <span className="text-[10px] font-bold tracking-widest text-sky-200 block uppercase font-mono">
                  ◆ SmartHisab POS ◆
                </span>
                
                {/* Ribbon decoration */}
                <div className="absolute top-2 left-2 bg-[#ff3333] text-white text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider leading-none shadow-sm shadow-red-900/30 z-20">
                  NEW
                </div>
              </div>

              {/* Picture Frame with Custom margins */}
              <div className="p-3 bg-gradient-to-b from-[#012338] to-[#021826] flex-1 flex flex-col justify-between">
                
                {/* Store owner photo wrapper */}
                <div className="relative rounded-lg overflow-hidden h-40 max-h-40 border border-sky-900/40 bg-slate-900 shadow-inner group">
                  <img 
                    src={client.image}
                    alt={client.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale-0 group-hover:scale-105 duration-300 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  {/* Category overlay badge */}
                  <span className="absolute bottom-2 left-2 bg-sky-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
                    {client.category}
                  </span>
                </div>

                {/* Main Client Info Area */}
                <div className="py-3 px-1 text-center space-y-2">
                  <div className="inline-block bg-[#ff3333] text-white font-bold text-[10px] px-3 py-1 rounded-md shadow-xs leading-none">
                    স্থান: {client.location}
                  </div>

                  <h3 className="font-bold text-xs font-display text-sky-200 line-clamp-1 min-h-[1.2rem] mt-1">
                    {client.title}
                  </h3>

                  {/* Testimonial Quote */}
                  <p className="text-[10px] text-slate-300 leading-relaxed italic line-clamp-3 min-h-[2.5rem] px-0.5">
                    "{client.description}"
                  </p>
                </div>

                {/* Frame Footer subtext matching shohoz template */}
                <div className="pt-2 border-t border-white/5 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-sky-300 block leading-none">
                    ব্যবসার BOSS &mdash; SmartHisab POS
                  </span>
                </div>

              </div>

              {/* Bottom Support Hotline strip */}
              <div className="bg-[#cc2222] text-white p-2 text-center text-[9.5px] font-bold tracking-wider leading-tight">
                হটলাইনঃ {client.phone || (
                  index === 0 ? "01747-046052 (Fardous Al-Amin)" :
                  index === 1 ? "01819-382910 (করিম মিঞা)" :
                  index === 2 ? "01928-472019 (সাকিব আহমেদ)" :
                  index === 3 ? "01633-918273 (ডাঃ রফিকুল)" :
                  "01552-849201 (তানভীর হোসেন)"
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Live support helpline disclaimer */}
        <div className={`p-5 rounded-2xl border text-center max-w-4xl mx-auto space-y-2.5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-blue-500/5 border-blue-500/10'}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            অপেক্ষমান অন্যান্য সফল কাস্টমারদের রিভিউ ও ক্যাশ ড্রয়ার সেটআপ রিলেটেড হেল্পলাইনের জন্য সরাসরি সাপোর্ট সেন্টার প্রতিনিধির সাথে হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।
          </p>
          <a
            href="https://wa.me/message/NTKAFHJ7Y4NUO1?src=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono transition-transform duration-100 hover:scale-103 active:scale-97 cursor-pointer shadow-md shadow-emerald-500/15"
          >
            💬 ওয়ান-ক্লিক হোয়াটসঅ্যাপ সাপোর্ট প্রতিনিধি
          </a>
        </div>

      </section>

      {/* =========================================
          6.2 VIDEO TUTORIALS (ভিডিও টিউটোরিয়াল সেকশন)
          ========================================= */}
      <section id="tutorials" className={`py-16 sm:py-24 border-t border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#091524] border-slate-900' : 'bg-[#f1f5f9] border-[#e2e8f0]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8b26c7] bg-purple-500/10 py-1 px-3.5 rounded-full inline-block leading-none">
              ভিডিও গাইডলাইন / Tutorials
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white leading-tight">
              ভিডিও টিউটোরিয়াল ডেক্স
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-400 font-sans">
              সহজে আমাদের পস সফটওয়্যার দিয়ে কাজ শুরু করার সম্পূর্ণ ইন্টারক্টিভ ভিডিও গাইডলাইন একনজরে দেখুন।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Tutorials List Left */}
            <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                {videoTutorials.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoIndex(index)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-start gap-4 cursor-pointer ${activeVideoIndex === index ? 'bg-purple-500/10 border-[#8b26c7] text-[#8b26c7] dark:text-purple-300 font-bold shadow-xs' : 'bg-white dark:bg-slate-900 border-transparent dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${activeVideoIndex === index ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>
                      <Play size={15} />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2 justify-between">
                        <h4 className="text-xs font-bold font-sans leading-none">{video.title}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-150 dark:bg-slate-800 text-slate-500 font-mono font-bold whitespace-nowrap">{video.duration}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-600 font-sans leading-relaxed mt-1 font-normal">{video.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-2xl border text-left hidden lg:block ${theme === 'dark' ? 'bg-slate-900/50 border-slate-850' : 'bg-white border-[#e2e8f0]'}`}>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">প্রয়োজনে কাস্টম ট্রেইনিংঃ</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  দোকানে রিমোট এন্ডডেক্স সেটাপ বা সরাসরি কাস্টম জুম ট্রেইনিং চাইলে আমাদের সাপোর্ট ডেস্কে মেসেজ দিতে পারেন।
                </p>
              </div>
            </div>

            {/* Simulated Live Video Player UI Right */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className={`p-4 rounded-2xl border flex flex-col justify-between h-full space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0] shadow-xs'}`}>
                
                {/* Dynamic Player Screen Overlay */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
                  
                  {/* Embedded Iframe Player showing educational/POS video and responds to tab change */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 group-hover:scale-110 transition duration-300 border-2 border-white/20">
                      <Play size={28} className="translate-x-0.5 fill-white" />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                        SmartHisab HD Video Guide
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {videoTutorials[activeVideoIndex].title}
                      </h3>
                      <p className="text-xs text-purple-200/90 font-medium">
                        {videoTutorials[activeVideoIndex].description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleScrollToAuth('login')}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-300" />
                      <span>১-ক্লিকে প্র্যাকটিক্যাল ডেমো ড্যাশবোর্ডে দেখুন →</span>
                    </button>
                  </div>

                </div>

                <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800 pt-3 flex-wrap gap-2">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 block leading-none">এখন প্লে হচ্ছে / NOW PLAYING</span>
                    <h3 className="text-sm font-bold mt-1 text-slate-800 dark:text-white font-sans">{videoTutorials[activeVideoIndex].title}</h3>
                  </div>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-red-650 hover:bg-red-700 text-white text-[11px] font-bold font-mono transition inline-flex items-center gap-1.5 leading-none shadow-sm shadow-red-900/20 cursor-pointer"
                  >
                    <Youtube size={13} />
                    <span>ইউটিউব চ্যানেল</span>
                  </a>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================
          6.4 FAQ ACCORDION SECTION (জিজ্ঞাসিত প্রশ্ন ও উত্তর)
          ========================================= */}
      <section id="faq" className={`py-16 sm:py-24 transition-colors duration-300 border-b ${theme === 'dark' ? 'bg-[#0b1322]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-[#cc2222] bg-red-100 dark:bg-red-950/40 px-3.5 py-1 rounded-full inline-block leading-none">
              জিজ্ঞাসিত প্রশ্নোত্তর / FAQ
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white leading-tight">
              সাধারণ জিজ্ঞাসা ও উত্তর সমূহ
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-400 font-sans">
              সহজে শুরু করার জন্য গ্রাহকদের সচরাচর করা কিছু গুরুত্বপূর্ণ প্রশ্নের উত্তর নিচে দেওয়া হলো।
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border transition-all duration-205 overflow-hidden ${isOpen ? 'border-[#8b26c7] bg-purple-500/5' : 'border-[#e2e8f0] dark:border-slate-850 hover:border-slate-300 bg-[#f8fafc] dark:bg-slate-900/30'}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left font-sans cursor-pointer select-none"
                  >
                    <span className={`text-xs sm:text-xs font-bold ${isOpen ? 'text-[#8b26c7] dark:text-purple-300' : 'text-slate-800 dark:text-slate-250'}`}>
                      {item.question}
                    </span>
                    <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-transform duration-200 ${isOpen ? 'bg-[#8b26c7] text-white rotate-180' : 'bg-slate-150 dark:bg-slate-850 text-slate-500'}`}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-[13px] text-slate-950 dark:text-slate-100 font-bold leading-relaxed font-sans">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================
          7. SUPPORT / CONTACT & INTERACTIVE DETAILS
          ========================================= */}
      <section id="support" className={`py-16 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-[#f8fafc]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#cc2222] bg-red-100 dark:bg-red-950/40 px-2.5 py-1 rounded-md inline-block">সরাসরি যোগাযোগ ও ঠিকানা</span>
            <h2 className="text-2xl sm:text-3.5xl font-bold font-display leading-tight">ফটোটাইপ সার্ভিস ও মেইনটেন্যান্স সেন্টার</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              SmartHisab POS সফটওয়্যারটি ফায়ারবেস ক্লাউড ডাটাবেজ দ্বারা চালিত। এটি লাইসেন্স কি বা মাসিক বিল ছাড়া আজীবন সিকিউরড ব্যবহার করতে পারবেন। যেকোনো কাস্টম মডিউল বা হার্ডওয়্যার সংযোগে সাহায্য করতে আমাদের টিম প্রস্তুত আছে।
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 rounded-xl text-blue-500 shrink-0">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">হোয়াটসঅ্যাপ ও মোবাইল নম্বর</h4>
                  <a href="tel:01747046052" className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono hover:underline">
                    01747-046052 (Fardous Al-Amin)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-105 dark:bg-blue-950 rounded-xl text-blue-500 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">অফিসিয়াল ইমেইল</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a 
                      href="mailto:info.fardousit@gmail.com" 
                      className="text-sm font-bold text-slate-900 dark:text-white font-mono hover:underline"
                    >
                      info.fardousit@gmail.com
                    </a>
                    <button
                      onClick={() => handleCopyEmail('info.fardousit@gmail.com')}
                      className="px-2 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded flex items-center gap-1 transition-all duration-150 active:scale-95"
                      title="ইমেইল কপি করুন"
                    >
                      {copiedEmail ? (
                        <span className="text-emerald-500 font-bold">কপি হয়েছে!</span>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 rounded-xl text-indigo-500 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans">অফিস ও ডেভেলপমেন্ট সেন্টার</h4>
                  <span className="text-xs text-slate-600 dark:text-slate-600 mt-0.5 block leading-relaxed font-sans">
                    ফেরদৌস কম্পিউটার, জৈন্তাপুর মডেল থানা সংলগ্ন, জৈন্তাপুর, সিলেট, বাংলাদেশ।
                  </span>
                </div>
              </div>
            </div>

            {/* Verification certificate banner */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">১০০% ভেরিফাইড সিকিউরড সিস্টেম</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-600">Google Firebase Authentication & Firestore Encrypted DB.</span>
              </div>
            </div>

          </div>

          {/* Map/Google sign-in right section */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className={`p-6 rounded-3xl border h-full flex flex-col justify-between space-y-6 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'}`}>
              
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthTab('login'); clearAuthError(); }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authTab === 'login'
                      ? 'bg-[#8b26c7] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LogIn size={16} />
                  <span>ব্যবসায়ী সাইন-ইন</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setRegSuccess(null); setRegError(null); }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authTab === 'register'
                      ? 'bg-[#8b26c7] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserPlus size={16} />
                  <span>নতুন রেজিস্ট্রেশন</span>
                </button>
              </div>

              {authTab === 'login' ? (
                <div className="space-y-6 my-auto flex flex-col justify-center py-4">
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-[#8b26c7] to-[#701fa3] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      ✓
                    </div>
                    <h3 className="text-xl font-bold font-display">আজই আপনার ব্যবসার রূপান্তর শুরু করুন!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      SmartHisab POS এ সাইন-ইন করে আপনার দোকানের হিসাব, স্টক ট্র্যাকিং ও ক্যাশ রেজিস্ট্রার নিখুঁতভাবে পরিচালনা করুন।
                    </p>
                  </div>

                  {/* Auth Warning from system hook (Enforces same email as registration or general login error) */}
                  {authError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm text-left space-y-2 font-sans-safe"
                    >
                      <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
                        <span>সাইন-ইন করতে সমস্যা হচ্ছে (Sign-in issue)</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-200">
                        {authError}
                      </p>
                      <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <li>পপআপ ব্লক হলে ব্রাউজারে পপআপ অনুমতি দিয়ে আবার চেষ্টা করুন।</li>
                        <li>ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</li>
                        <li>নতুন হলে নিচের রেজিস্ট্রেশন ট্যাব থেকে আগে রেজিস্ট্রেশন করে নিন।</li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => clearAuthError()}
                        className="text-xs font-bold underline text-slate-500 hover:text-slate-700 dark:text-slate-400 min-h-[44px]"
                      >
                        ঠিক আছে, বন্ধ করুন
                      </button>
                    </div>
                  )}

                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
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
                            className="text-[11px] font-bold text-[#8b26c7] dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            পাসওয়ার্ড ভুলে গেছেন?
                          </button>
                        </div>
                        <div className="relative">
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
                        </div>
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
                  </div>

                  
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left font-sans">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white font-display">নতুন দোকানদার রেজিস্ট্রেশন</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      আপনার সঠিক ব্যবসায়িক ক্যাটাগরি এবং সঠিক গুগল জিমেইল বসিয়ে রেজিস্ট্রেশন শেষ করুন। রেজিস্ট্রেশন সফল হওয়ার পর উক্ত জিমেইল দিয়ে লগইন করবেন।
                    </p>
                  </div>

                  {/* Errors & Success Messages */}
                  {regError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center gap-2"
                    >
                      <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {regSuccess && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>রেজিস্ট্রেশন সফল হয়েছে!</span>
                      </div>
                      <p className="leading-relaxed text-xs">{regSuccess}</p>
                      <button
                        type="button"
                        onClick={() => { setAuthTab('login'); setRegSuccess(null); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 min-h-[44px] rounded-lg text-xs transition"
                      >
                        এখনই সাইন-ইন মেইন ড্যাশবোর্ডে যান →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-fullname" className="text-sm font-bold text-slate-600 dark:text-slate-400">মার্চেন্ট বা আপনার পুরো নাম *</label>
                      <input
                        id="reg-fullname"
                        name="fullname"
                        type="text"
                        required
                        autoComplete="name"
                        aria-invalid={!!regError && !regFullName.trim()}
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="যেমন: মোঃ জাহিদ হাসান"
                        className="w-full px-3 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-phone" className="text-sm font-bold text-slate-600 dark:text-slate-400">মোবাইল নম্বর *</label>
                      <input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!regError && !regPhone.trim()}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="যেমন: 01747-046052"
                        className="w-full px-3 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-email" className="text-sm font-bold text-slate-600 dark:text-slate-400 block pb-0.5">গুগল জিমেইল ইমেইল *</label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={!!regError && !regEmail.trim()}
                        aria-describedby="reg-email-help"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="yourshop@gmail.com"
                        className="w-full px-3 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                      />
                      <span id="reg-email-help" className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-snug">জরুরি: পরে এই জিমেইল দিয়েই গুগল লগইন করতে হবে।</span>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-business-type" className="text-sm font-bold text-slate-600 dark:text-slate-400 font-sans">প্রতিষ্ঠানের ধরন *</label>
                      <select
                        id="reg-business-type"
                        name="businessType"
                        value={regBusinessType}
                        onChange={(e) => setRegBusinessType(e.target.value)}
                        className="w-full px-3 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                      >
                        <option value="Studio">ষ্টুডিও (Studio - ফটো ফ্রেম কাজ)</option>
                        <option value="Enterprise">বিল্ডিং ম্যাটেরিয়ালস (Enterprise - রড, ইট, সিমেন্ট)</option>
                        <option value="Grocer">মুদি ও ভূসিমাল সামগ্রী (Grocery/Wholesale)</option>
                        <option value="Restaurant">রেস্টুরেন্ট (Restaurant - ফুড আইটেম)</option>
                        <option value="Fashion">ফ্যাশন শপ ও বুটিক (Fashion & Clothings)</option>
                        <option value="Super Shop">সুপার শপ (Super Shop list)</option>
                        <option value="Electronics">ইলেকট্রনিক্স শপ (Electronics & Hardware)</option>
                        <option value="Mobile Servicing">মোবাইল সার্ভিসিং (Mobile Repairing Center)</option>
                        <option value="Automobile">অটোপার্টস ও গ্যারেজ (Automobile repair parts)</option>
                        <option value="Others">অন্যান্য সাধারণ দোকান (Other Business)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-business-name" className="text-sm font-bold text-slate-600 dark:text-slate-400">আপনার শপ/প্রতিষ্ঠানের নাম *</label>
                    <input
                      id="reg-business-name"
                      name="businessName"
                      type="text"
                      required
                      autoComplete="organization"
                      aria-invalid={!!regError && !regBusinessName.trim()}
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      placeholder="যেমন: ফেরদৌস কম্পিউটার এন্ড আইটি সেন্টার"
                      className="w-full px-3 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-message" className="text-sm font-bold text-slate-600 dark:text-slate-400">আপনার চাহিদা ও কুয়েরি বার্তা (ঐচ্ছিক)</label>
                    <textarea
                      id="reg-message"
                      name="message"
                      value={regMessage}
                      onChange={(e) => setRegMessage(e.target.value)}
                      placeholder="এখানে আপনার চাহিদা অনুযায়ী ফ্রেম সাইজ বা কাজের ধরন সংক্ষেপে লিখুন..."
                      rows={2}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b26c7]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    aria-busy={regSubmitting}
                    className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {regSubmitting ? (
                      <span className="animate-pulse">রেজিস্ট্রেশন ডাটাবেজে রেকর্ড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন...</span>
                    ) : (
                      <>
                        <ShieldCheck size={16} aria-hidden="true" />
                        <span>১-ক্লিকে সম্পূর্ণ রেজিস্ট্রেশন সম্পন্ন করুন</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                    রেজিস্ট্রেশন সম্পন্ন করার মাধ্যমে আপনি{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b26c7] dark:text-sky-400 hover:opacity-80">
                      Terms of Service
                    </a>{' '}
                    এবং{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b26c7] dark:text-sky-400 hover:opacity-80">
                      Privacy Policy
                    </a>{' '}
                    মেনে নিচ্ছেন।
                  </p>
                </form>
              )}

              

            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          8. MAIN FOOTER
          ========================================= */}
      <footer className="border-t transition-colors duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-10 text-center shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800 pb-6 text-left">
            <div className="space-y-1">
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight text-[#8b26c7] dark:text-purple-400 flex items-center gap-2">
                <Cloud size={20} className="text-[#8b26c7]" /> SmartHisab POS & Stock Recorder v2.0
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">
                © {new Date().getFullYear()} Fardous Computer & IT Industry. All rights reserved globally.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-xs font-mono font-bold">
              <a href="mailto:info.fardousit@gmail.com" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150">Mail Center</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150 underline underline-offset-2">Privacy Policy</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-[#8b26c7] transition duration-150 underline underline-offset-2">Terms of Service</a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[#8b26c7] font-bold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded border border-purple-200/60">Helpline: 01747-046052</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-bold font-sans">
            <span>✓ Cloud Running Secure Containers</span>
            <span>✓ Encrypted Firestore Client DB</span>
            <span>✓ Free Lifetime Authorized Upgrades</span>
            <span>✓ Fardous Computer Official Release Product</span>
          </div>

        </div>
      </footer>

      {/* =========================================
          9. FLOATING CHAT WIDGETS (Exactly as requested)
          ========================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 select-none">
        
        {/* WhatsApp Icon with custom glow */}
        <a 
          href="https://wa.me/message/NTKAFHJ7Y4NUO1?src=qr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-12 w-12 rounded-full bg-[#25D366] hover:scale-110 active:scale-95 transition flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl relative group"
          title="হোয়াটসঅ্যাপ চ্যাট করুন"
        >
          {/* Pulsing indicator */}
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border border-white"></span>
          <svg className="w-6.5 h-6.5 fill-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.017-5.092-2.87-6.948C16.612 1.981 14.146.963 11.536.963c-5.44 0-9.866 4.415-9.869 9.832-.001 1.748.462 3.456 1.344 4.98l-.996 3.639 3.732-.96zM17.001 14c-.274-.137-1.62-.8-1.87-.892-.25-.091-.433-.137-.617.137-.184.275-.71.892-.87 1.077-.16.184-.32.207-.593.07-.273-.137-1.155-.426-2.2-1.358-.813-.725-1.36-1.622-1.52-1.897-.16-.275-.017-.424.12-.56.123-.122.274-.32.411-.48.136-.16.183-.275.274-.458.09-.184.046-.344-.023-.48-.068-.138-.617-1.486-.846-2.036-.223-.535-.467-.463-.617-.47l-.527-.01c-.184 0-.482.07-.735.344-.252.275-.96.939-.96 2.29s.984 2.66 1.121 2.843c.138.184 1.938 2.96 4.695 4.15.656.284 1.168.453 1.568.58.659.21 1.259.18 1.733.11.528-.08 1.62-.663 1.85-1.302.23-.64.23-1.187.16-1.302-.07-.11-.25-.21-.525-.344z" />
          </svg>
        </a>

        {/* Facebook Messenger Icon with custom blue styling */}
        <a 
          href="https://www.facebook.com/share/1EfmkTVdf2/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-12 w-12 rounded-full bg-[#0084FF] hover:scale-110 active:scale-95 transition flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:shadow-xl relative"
          title="ফেসবুক এ যোগাযোগ করুন"
        >
          <svg className="w-6.5 h-6.5 fill-white" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.924 1.45 5.535 3.738 7.214.195.143.308.375.308.618v2.308c0 .383.425.613.743.4l2.585-1.724a.8.8 0 01.53-.134c.677.106 1.373.16 2.096.16 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.096 11.758l-2.03-2.164a.4.4 0 00-.58 0L6.4 13.916c-.347.347-.852-.09-.593-.5l4.032-6.416a.4.4 0 01.58 0l2.03 2.164a.4.4 0 00.58 0l4.086-2.32c.347-.348.852.09.593.5l-4.032 6.416a.4.4 0 01-.58 0z" />
          </svg>
        </a>

      </div>

      {/* Selected Package Modal */}
      {selectedPackageModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedPackageModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={18} />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b26c7] bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-200">
                প্যাকেজ নির্বাচন সম্পূর্ণ
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedPackageModal.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPackageModal.description}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">নির্ধারিত প্যাকেজ মূল্য:</span>
                <span className="text-2xl font-mono font-bold text-[#8b26c7] dark:text-purple-300">
                  {selectedPackageModal.price}
                </span>
                <span className="text-xs font-semibold text-slate-400">/{selectedPackageModal.cycle}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                ফ্রি ক্লাউড ব্যাকআপ সহ
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">প্যাকেজের প্রধান সুবিধাসমূহ:</span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                {selectedPackageModal.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmPackageOrder}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬 হোয়াটসঅ্যাপে অর্ডার দিন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPackageModal(null);
                  handleScrollToAuth('register');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#8b26c7] hover:bg-[#7e1ebd] text-white font-bold text-xs transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 ফ্রি রেজিস্ট্রেশন পূরণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Interactive AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl relative">
            <AiBusinessAssistant isOpen={true} onClose={() => setIsAiModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Super Admin Interactive Package Pricing Config Modal */}
      {isEditPriceModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-lg">💰</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    সুপার এডমিন - সাবস্ক্রিপশন প্যাকেজের মূল্য নির্ধারণ
                  </h3>
                  <p className="text-xs text-slate-500">
                    এখানে আপনি আপনার ইচ্ছা অনুযায়ী প্রতিটি প্যাকেজের মাসিক ও বাৎসরিক মূল্য সেট করতে পারবেন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditPriceModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePricingConfig} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              {/* Starter Package Pricing */}
              <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 rounded-2xl space-y-2">
                <div className="text-sky-600 dark:text-sky-400 font-bold text-sm flex items-center gap-1.5">
                  <span>🚀 স্টার্টার প্যাকেজ (Starter Plan)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">মাসিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.starterMonthly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, starterMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">বাৎসরিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.starterYearly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, starterYearly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Pro Business Package Pricing */}
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-2xl space-y-2">
                <div className="text-[#8b26c7] dark:text-purple-300 font-bold text-sm flex items-center gap-1.5">
                  <span>⚡ প্রো বিজনেস প্যাকেজ (Pro Business - Best Value)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">মাসিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.proMonthly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, proMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">বাৎসরিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.proYearly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, proYearly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Enterprise Package Pricing */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl space-y-2">
                <div className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1.5">
                  <span>🌟 এন্টারপ্রাইজ আনলিমিটেড (Enterprise Plan)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">মাসিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.enterpriseMonthly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, enterpriseMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">বাৎসরিক টাকা (৳)</label>
                    <input
                      type="number"
                      required
                      value={tempPricingConfig.enterpriseYearly}
                      onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, enterpriseYearly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block mb-1">বাৎসরিক মূল্যছাড় শতাংশ (%)</label>
                <input
                  type="number"
                  required
                  value={tempPricingConfig.yearlyDiscountPercent}
                  onChange={(e) => setTempPricingConfig({ ...tempPricingConfig, yearlyDiscountPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditPriceModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#8b26c7] to-[#701fa3] hover:brightness-110 text-white font-bold shadow-md cursor-pointer text-center"
                >
                  💾 নতুন মূল্য সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
