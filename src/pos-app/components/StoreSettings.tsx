import React, { useState } from 'react';
import { 
  Building, Phone, Mail, Globe, MapPin, FileText, 
  CreditCard, Upload, CheckCircle2, ShieldCheck, 
  Store, Award, Save, RefreshCw, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface Props {
  lang: 'bn' | 'en';
  shopName: string;
  setShopName: (val: string) => void;
  shopAddress: string;
  setShopAddress: (val: string) => void;
  shopPhone: string;
  setShopPhone: (val: string) => void;
  storeCode: string;
  setStoreCode: (val: string) => void;
  storeEmail: string;
  setStoreEmail: (val: string) => void;
  gstNumber: string;
  setGstNumber: (val: string) => void;
  taxNumber: string;
  setTaxNumber: (val: string) => void;
  storeWebsite: string;
  setStoreWebsite: (val: string) => void;
  bankDetails: string;
  setBankDetails: (val: string) => void;
  storeCountry: string;
  setStoreCountry: (val: string) => void;
  storeCity: string;
  setStoreCity: (val: string) => void;
  logoPreview: string | null;
  storeFontSize?: string;
  setStoreFontSize?: (val: string) => void;
  setLogoPreview: (val: string | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StoreSettings: React.FC<Props> = ({
  lang,
  shopName, setShopName,
  shopAddress, setShopAddress,
  shopPhone, setShopPhone,
  storeCode, setStoreCode,
  storeEmail, setStoreEmail,
  gstNumber, setGstNumber,
  taxNumber, setTaxNumber,
  storeWebsite, setStoreWebsite,
  bankDetails, setBankDetails,
  storeCountry, setStoreCountry,
  storeCity, setStoreCity,
  logoPreview, setLogoPreview, storeFontSize = "base", setStoreFontSize,
  showToast,
}) => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      const payload = {
        shopName,
        shopAddress,
        shopPhone,
        storeCode,
        storeEmail,
        gstNumber,
        taxNumber,
        storeWebsite,
        bankDetails,
        storeCountry,
        storeCity,
        logoPreview,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('saim_store_settings', JSON.stringify(payload));
      setTimeout(() => {
        setSaving(false);
        showToast(
          lang === 'bn' ? 'স্টোর সেটিংস সফলভাবে আপডেট করা হয়েছে!' : 'Store settings updated successfully!',
          'success'
        );
      }, 300);
    } catch (e: any) {
      setSaving(false);
      showToast(e?.message || 'Failed to save store settings', 'error');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-full p-4 sm:p-6 space-y-6 text-slate-800 font-sans">
      {/* Top Banner Profile */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner overflow-hidden shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-amber-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{shopName || 'রনি টেলিকম'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 uppercase shadow-sm">
                {storeCode || 'ST0001'}
              </span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate max-w-md">{shopAddress || 'লক্ষ্মীপুর, বাংলাদেশ'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg hover:shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{lang === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Store Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'স্টোর প্রোফাইল ও তথ্য (Store Profile)' : 'Store General Information'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'দোকানের নাম, কোড ও যোগাযোগের মূল বিবরণী' : 'Basic profile, store code and primary contact details'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'দোকানের নাম (Store Name) *' : 'Store Name *'}
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                  placeholder="e.g. রনি টেলিকম"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'স্টোর কোড (Store Code)' : 'Store Code'}
                </label>
                <input
                  type="text"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                  placeholder="ST0002"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number)' : 'Mobile Phone'}
                </label>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                  placeholder="01718389900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'ইমেইল ঠিকানা (Email Address)' : 'Official Email'}
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                  placeholder="info@telecom.com"
                />
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'সাইডবারে স্টোরের নামের ফন্ট সাইজ (Font Size)' : 'Sidebar Store Name Font Size'}
                </label>
                <select
                  value={storeFontSize}
                  onChange={(e) => setStoreFontSize && setStoreFontSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="sm">{lang === 'bn' ? 'ছোট (Small - 12px)' : 'Small (12px)'}</option>
                  <option value="base">{lang === 'bn' ? 'সাধারণ (Medium - 14px)' : 'Medium (14px)'}</option>
                  <option value="lg">{lang === 'bn' ? 'বড় (Large - 16px)' : 'Large (16px)'}</option>
                  <option value="xl">{lang === 'bn' ? 'অতিরিক্ত বড় (Extra Large - 18px)' : 'Extra Large (18px)'}</option>
                </select>
              </div>
  
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'ওয়েবসাইট লিংক (Website URL)' : 'Website URL'}
                </label>
                <input
                  type="text"
                  value={storeWebsite}
                  onChange={(e) => setStoreWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
                  placeholder="https://ronytelecom.com"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Address & Location */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'অবস্থান ও ঠিকানা (Location & Address)' : 'Store Location & Address'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'ইনভয়েস মেমোতে প্রিন্ট হওয়া ফিজিক্যাল ঠিকানা' : 'Physical address printed on customer sales receipts'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'দেশ (Country)' : 'Country'}
                </label>
                <input
                  type="text"
                  value={storeCountry}
                  onChange={(e) => setStoreCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'জেলা / শহর (City / District)' : 'City / District'}
                </label>
                <input
                  type="text"
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'সম্পূর্ণ ঠিকানা (Full Street Address)' : 'Full Address'}
                </label>
                <textarea
                  rows={2}
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  placeholder="কামাল পাশা মোড়, আজাদ নগর, রামগতি, লক্ষ্মীপুর"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tax & Bank Info */}
        <div className="space-y-6">

          {/* Card 4: Legal & Bank */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'ট্যাক্স ও ব্যাংক অ্যাকাউন্ট (Legal & Bank)' : 'Tax & Payment Info'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'ট্রেড লাইসেন্স ও ব্যাংক একাউন্ট বিবরণী' : 'Trade license, GST/Tax and banking for invoice'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ট্রেড লাইসেন্স / GST No.' : 'Trade License / GST'}
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50"
                  placeholder="e.g. TR-9281048"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ট্যাক্স পেয়ার আইডি (TAX / TIN)' : 'Tax TIN Number'}
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50"
                  placeholder="e.g. TIN-481920"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাংক বিবরণী (Bank Payment Notes)' : 'Bank Account Details'}
                </label>
                <textarea
                  rows={3}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50"
                  placeholder="Dutch-Bangla Bank Ltd, AC: 19283019284"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
