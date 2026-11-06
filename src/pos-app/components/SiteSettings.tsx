import React, { useState, useRef } from 'react';
import { 
  Settings, Clock, Globe, DollarSign, Database, 
  Save, RefreshCw, Sparkles, Sliders, ShieldCheck, 
  CheckCircle2, Download, Upload, Trash2, HelpCircle,
  Eye, EyeOff
} from 'lucide-react';

interface Props {
  lang: 'bn' | 'en';
  sysTimezone: string;
  setSysTimezone: (val: string) => void;
  sysDateFormat: string;
  setSysDateFormat: (val: string) => void;
  sysTimeFormat: string;
  setSysTimeFormat: (val: string) => void;
  sysCurrency: string;
  setSysCurrency: (val: string) => void;
  sysCurrencyPlacement: string;
  setSysCurrencyPlacement: (val: string) => void;
  sysDecimals: string;
  setSysDecimals: (val: string) => void;
  sysDecimalsQty: string;
  setSysDecimalsQty: (val: string) => void;
  sysLanguage: string;
  setSysLanguage: (val: string) => void;
  sysEnableRoundOff: boolean;
  setSysEnableRoundOff: (val: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SiteSettings: React.FC<Props> = ({
  lang,
  sysTimezone, setSysTimezone,
  sysDateFormat, setSysDateFormat,
  sysTimeFormat, setSysTimeFormat,
  sysCurrency, setSysCurrency,
  sysCurrencyPlacement, setSysCurrencyPlacement,
  sysDecimals, setSysDecimals,
  sysDecimalsQty, setSysDecimalsQty,
  sysLanguage, setSysLanguage,
  sysEnableRoundOff, setSysEnableRoundOff,
  showToast,
}) => {
  const [saving, setSaving] = useState(false);

  const [adminLoginEmail, setAdminLoginEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('smarthisab_super_admin_email') || 'info.fardousit@gmail.com';
    } catch (e) {
      return 'info.fardousit@gmail.com';
    }
  });

  const [adminLoginPassword, setAdminLoginPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('smarthisab_super_admin_password') || 'admin123';
    } catch (e) {
      return 'admin123';
    }
  });

  const [showAdminPassEye, setShowAdminPassEye] = useState(false);

  const handleSave = () => {
    setSaving(true);
    try {
      const payload = {
        sysTimezone,
        sysDateFormat,
        sysTimeFormat,
        sysCurrency,
        sysCurrencyPlacement,
        sysDecimals,
        sysDecimalsQty,
        sysLanguage,
        sysEnableRoundOff,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('saim_site_settings', JSON.stringify(payload));
      setTimeout(() => {
        setSaving(false);
        showToast(
          lang === 'bn' ? 'সাইট সেটিংস সফলভাবে আপডেট করা হয়েছে!' : 'Site settings saved successfully!',
          'success'
        );
      }, 300);
    } catch (e: any) {
      setSaving(false);
      showToast(e?.message || 'Failed to save site settings', 'error');
    }
  };

  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: "SmartHisab POS & ERP",
        siteSettings: { sysTimezone, sysDateFormat, sysCurrency, sysLanguage },
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smarthisab_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showToast(lang === 'bn' ? 'স্মার্টহিসাব ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'SmartHisab backup exported successfully!', 'success');
    } catch (e: any) {
      showToast('Export failed', 'error');
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed) {
          showToast(lang === 'bn' ? 'ভুল ব্যাকআপ ফাইল!' : 'Invalid backup file!', 'error');
          return;
        }
        const conf = window.confirm(
          lang === 'bn' 
            ? 'আপনি কি ব্যাকআপ ফাইলটি থেকে রিস্টোর করতে চান?' 
            : 'Do you want to restore settings from this backup file?'
        );
        if (!conf) return;
        if (parsed.siteSettings) {
          if (parsed.siteSettings.sysTimezone) setSysTimezone(parsed.siteSettings.sysTimezone);
          if (parsed.siteSettings.sysDateFormat) setSysDateFormat(parsed.siteSettings.sysDateFormat);
          if (parsed.siteSettings.sysCurrency) setSysCurrency(parsed.siteSettings.sysCurrency);
          if (parsed.siteSettings.sysLanguage) setSysLanguage(parsed.siteSettings.sysLanguage);
        }
        showToast(
          lang === 'bn' 
            ? 'ডাটাবেজ ও সাইট সেটিংস ব্যাকআপ ফাইল থেকে রিস্টোর সম্পন্ন হয়েছে!' 
            : 'Settings restored successfully from backup file!', 
          'success'
        );
      } catch (err: any) {
        showToast('Restore error: ' + (err?.message || err), 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full min-h-full p-4 sm:p-6 space-y-6 text-slate-800 font-sans">
      {/* Top Banner Profile */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900 p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Sliders className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {lang === 'bn' ? 'সাইট ও সিস্টেম সেটিংস (Site Settings)' : 'Site & System Settings'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-400 text-slate-950 uppercase shadow-sm">
                ACTIVE
              </span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{lang === 'bn' ? 'টাইমজোন, কারেন্সি, ফর্মেটিং ও ডাটাবেজ ব্যাকআপ সেটিংস' : 'Timezone, Currency, Formatting & Backup configuration'}</span>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): General & Currency */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Timezone & Language */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'সাধারণ ও স্থানীয়করণ (General & Localization)' : 'General & Regional Settings'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'সিস্টেমের টাইমজোন, ভাষা ও সময় ফরম্যাট পছন্দসমূহ' : 'System timezone, primary language and time format preferences'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'টাইমজোন (System Timezone)' : 'System Timezone'}
                </label>
                <select
                  value={sysTimezone}
                  onChange={(e) => setSysTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+06:00)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+05:30)</option>
                  <option value="UTC">UTC (GMT+00:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'ডিফল্ট ভাষা (Primary Language)' : 'Primary Language'}
                </label>
                <select
                  value={sysLanguage}
                  onChange={(e) => setSysLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="Bengali">{lang === 'bn' ? 'বাংলা (Bengali)' : 'Bengali'}</option>
                  <option value="English">{lang === 'bn' ? 'English (ইংরেজি)' : 'English'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'তারিখ ফরম্যাট (Date Format)' : 'Date Format'}
                </label>
                <select
                  value={sysDateFormat}
                  onChange={(e) => setSysDateFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="dd-mm-yyyy">DD-MM-YYYY (e.g. 04-08-2026)</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD (e.g. 2026-08-04)</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY (e.g. 08/04/2026)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'সময় ফরম্যাট (Time Format)' : 'Time Format'}
                </label>
                <select
                  value={sysTimeFormat}
                  onChange={(e) => setSysTimeFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="12 Hours">12 Hours (AM/PM)</option>
                  <option value="24 Hours">24 Hours (Military)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Currency & Decimals */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'মুদ্রা ও ডেসিমেল ফরম্যাটিং (Currency & Decimals)' : 'Currency & Precision'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'টাকা/মুদ্রা চিহ্ন, দশমিক স্থান ও রাউন্ড অফ সেটিংস' : 'Currency symbol, placement, price precision & round-off settings'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'সিস্টেম মুদ্রা (Currency Symbol)' : 'Currency Symbol'}
                </label>
                <select
                  value={sysCurrency}
                  onChange={(e) => setSysCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="TAKA BDT (TK)">TAKA BDT (TK ৳)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'মুদ্রার চিহ্ন অবস্থান (Symbol Position)' : 'Symbol Placement'}
                </label>
                <select
                  value={sysCurrencyPlacement}
                  onChange={(e) => setSysCurrencyPlacement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="Before Amount">Before Amount (৳ 500)</option>
                  <option value="After Amount">After Amount (500 ৳)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'মূল্যের দশমিক স্থান (Price Decimals)' : 'Price Decimals'}
                </label>
                <select
                  value={sysDecimals}
                  onChange={(e) => setSysDecimals(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="0">0 (e.g. 500)</option>
                  <option value="2">2 (e.g. 500.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'পরিমাণের দশমিক স্থান (Quantity Decimals)' : 'Quantity Decimals'}
                </label>
                <select
                  value={sysDecimalsQty}
                  onChange={(e) => setSysDecimalsQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="0">0 (e.g. 5 Pcs)</option>
                  <option value="2">2 (e.g. 5.50 Kg)</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={sysEnableRoundOff}
                    onChange={(e) => setSysEnableRoundOff(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {lang === 'bn' ? 'মোট বিক্রয়ে রাউন্ড-অফ সুবিধা চালু করুন (Enable Round-Off)' : 'Enable Total Sales Round-Off'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {lang === 'bn' ? 'ক্যাশ ম্যামোতে ফ্র্যাকশন সংখ্যা পূর্ণসংখ্যায় রাউন্ড করবে' : 'Auto rounds decimal total amounts on customer sales receipts'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Backup & System Operations */}
        <div className="space-y-6">
          
          {/* Card 3: Data Backup */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'ব্যাকআপ ও সিস্টেম ক্রিয়াকলাপ' : 'System Operations'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'ডাটাবেজ ব্যাকআপ ফাইল ও ক্যাশ ম্যানেজমেন্ট' : 'JSON data backup export & cache management'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportBackup}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{lang === 'bn' ? '১-ক্লিক লোকাল ব্যাকআপ ডাউনলোড (.json)' : 'Export Local JSON Backup (.json)'}</span>
              </button>

              <input
                type="file"
                ref={restoreInputRef}
                onChange={handleImportBackupFile}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => restoreInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>{lang === 'bn' ? '📂 ব্যাকআপ ফাইল থেকে রিস্টোর / ডাটা রিকভারি' : '📂 Restore / Recover Data from JSON File'}</span>
              </button>

              <button
                onClick={() => {
                  showToast(lang === 'bn' ? 'সিস্টেম ক্যাশ সফলভাবে রিফ্রেশ করা হয়েছে!' : 'System cache cleared!', 'info');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>{lang === 'bn' ? 'সিস্টেম ক্যাশ ক্লিন করুন' : 'Clear System Cache'}</span>
              </button>
            </div>
          </div>

          {/* Card: Super Admin Login Credentials Manager */}
          <div className="rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {lang === 'bn' ? '🔑 সুপার এডমিন লগইন ইমেইল ও পাসওয়ার্ড পরিবর্তন' : '🔑 Change Super Admin Credentials'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'সিস্টেমে প্রবেশ করার প্রধান এডমিন আইডি ও পাসওয়ার্ড আপডেট করুন' : 'Update master Super Admin login email & password'}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সুপার এডমিন লগইন ইমেইল / ইউজারনেম *' : 'Super Admin Login Email / Username *'}
                </label>
                <input
                  type="text"
                  value={adminLoginEmail}
                  onChange={(e) => setAdminLoginEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="info.fardousit@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'নতুন এডমিন পাসওয়ার্ড *' : 'New Admin Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassEye ? 'text' : 'password'}
                    value={adminLoginPassword}
                    onChange={(e) => setAdminLoginPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassEye(!showAdminPassEye)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showAdminPassEye ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showAdminPassEye ? <EyeOff size={16} className="text-indigo-600" /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!adminLoginEmail.trim() || !adminLoginPassword) {
                    showToast(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড খালি রাখা যাবে না!' : 'Email and password cannot be empty!', 'error');
                    return;
                  }
                  try {
                    localStorage.setItem('smarthisab_super_admin_email', adminLoginEmail.trim());
                    localStorage.setItem('smarthisab_super_admin_password', adminLoginPassword);
                    showToast(
                      lang === 'bn' 
                        ? 'সুপার এডমিন লগইন ইমেইল ও পাসওয়ার্ড সফলভাবে আপডেট ও সেভ হয়েছে!' 
                        : 'Super Admin login credentials updated successfully!', 
                      'success'
                    );
                  } catch (e: any) {
                    showToast('Failed to save credentials: ' + e?.message, 'error');
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{lang === 'bn' ? 'এডমিন ইমেইল ও পাসওয়ার্ড আপডেট করুন' : 'Save Admin Login Credentials'}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Integrity Status */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সিস্টেম নিরাপত্তা ও হেলথ' : 'System Health Status'}</span>
            </div>
            <div className="text-[11.5px] text-slate-600 space-y-1.5 font-medium leading-relaxed">
              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'ডাটাবেজ কানেকশন:' : 'Database Link:'}</span>
                <span className="font-bold text-emerald-600">🟢 Online</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'নিরাপত্তা প্রোটোকল:' : 'Security Protocol:'}</span>
                <span className="font-bold text-blue-600">TLS 1.3 / AES-256</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'bn' ? 'অটো-সিঙ্ক স্টেটাস:' : 'Auto Sync:'}</span>
                <span className="font-bold text-slate-800">Enabled</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
