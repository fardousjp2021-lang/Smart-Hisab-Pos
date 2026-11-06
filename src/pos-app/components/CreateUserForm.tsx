// @ts-nocheck
import React, { useState, useRef } from 'react';
import { 
  UserPlus, X, Upload, CheckCircle2, ShieldCheck, 
  User, Mail, Phone, Lock, Building, Key, Sparkles, Image as ImageIcon,
  Eye, EyeOff
} from 'lucide-react';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: {
    username: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    branch: string;
    isBlocked: boolean;
    createdOn?: string;
  }) => void;
  lang: 'bn' | 'en';
  editingEmployee?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    branch: string;
    isBlocked: boolean;
    username?: string;
    createdOn?: string;
  } | null;
}

export function CreateUserForm({ isOpen, onClose, onSave, lang, editingEmployee }: CreateUserFormProps) {
  const initialFirstName = editingEmployee 
    ? editingEmployee.name.split(' ')[0] || '' 
    : '';
  const initialLastName = editingEmployee 
    ? editingEmployee.name.split(' ').slice(1).join(' ') || '' 
    : '';

  const [username, setUsername] = useState(editingEmployee?.username || (editingEmployee?.email ? editingEmployee.email.split('@')[0] : ''));
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [mobile, setMobile] = useState(editingEmployee?.phone || '');
  const [email, setEmail] = useState(editingEmployee?.email || '');
  const [role, setRole] = useState(editingEmployee?.role || 'Manager');
  const [password, setPassword] = useState(editingEmployee ? '••••••••' : '');
  const [confirmPassword, setConfirmPassword] = useState(editingEmployee ? '••••••••' : '');
  const [defaultWarehouse, setDefaultWarehouse] = useState(editingEmployee?.branch || 'Rony Telecom');

  // Password visibility toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File upload preview state
  const [selectedImage, setSelectedImage] = useState<string | null>(editingEmployee?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert(lang === 'bn' ? "ইউজারনেম দিন!" : "Username is required!");
      return;
    }
    if (!firstName.trim()) {
      alert(lang === 'bn' ? "প্রথম নাম দিন!" : "First Name is required!");
      return;
    }
    if (!email.trim()) {
      alert(lang === 'bn' ? "ইমেইল ঠিকানা দিন!" : "Email is required!");
      return;
    }
    if (!editingEmployee && !password) {
      alert(lang === 'bn' ? "পাসওয়ার্ড দিন!" : "Password is required!");
      return;
    }
    if (!editingEmployee && password !== confirmPassword) {
      alert(lang === 'bn' ? "পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!" : "Passwords do not match!");
      return;
    }

    const nameCombined = `${firstName} ${lastName}`.trim();
    onSave({
      username: username.trim(),
      name: nameCombined,
      email: email.trim(),
      phone: mobile.trim() || '',
      role: role,
      status: editingEmployee?.status || 'Active',
      branch: defaultWarehouse,
      isBlocked: editingEmployee?.isBlocked || false,
      avatar: selectedImage || null,
      createdOn: editingEmployee?.createdOn || new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden relative text-left">
        
        {/* Header Profile Gradient Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 shadow-md text-white flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <UserPlus className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {editingEmployee 
                  ? (lang === 'bn' ? 'ইউজার তথ্য আপডেট করুন' : 'Update User Account') 
                  : (lang === 'bn' ? 'নতুন ইউজার / কর্মচারী তৈরি করুন' : 'Create New User Account')}
              </h1>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                {lang === 'bn' ? 'সিস্টেম এক্সেস, রোল ও প্রোফাইল তথ্য প্রদান করুন' : 'Configure credentials, role permissions & profile avatar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2 Cols): Input Fields */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Section 1: Account Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Key className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang === 'bn' ? '১. আইডি ও পরিচিতি (Credentials)' : '1. Basic Credentials'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'ইউজারনেম (Username) *' : 'Username *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. hasan_cashier"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'রোল (Role Permission) *' : 'Role *'}
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Owner">{lang === 'bn' ? 'দোকানের মালিক (Shop Owner)' : 'Shop Owner'}</option>
                        <option value="Manager">{lang === 'bn' ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                        <option value="Cashier">{lang === 'bn' ? 'ক্যাশিয়ার (Cashier)' : 'Cashier'}</option>
                        <option value="Operator">{lang === 'bn' ? 'অপারেটর (Operator)' : 'Operator'}</option>
                        <option value="Admin">{lang === 'bn' ? 'অ্যাডমিন (Admin)' : 'Admin'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'প্রথম নাম (First Name) *' : 'First Name *'}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. হাসান"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'শেষ নাম (Last Name)' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. মাহমুদ"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Branch */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang === 'bn' ? '২. যোগাযোগ ও ব্রাঞ্চ (Contact & Branch)' : '2. Contact & Branch'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'ইমেইল ঠিকানা (Email) *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="employee@gloriousit.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number)' : 'Mobile Phone'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="01718XXXXXX"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {lang === 'bn' ? 'নির্ধারিত শপ / ব্রাঞ্চ (Branch / Store)' : 'Branch Assignment'}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={defaultWarehouse}
                        onChange={(e) => setDefaultWarehouse(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder={lang === 'bn' ? 'দোকানের নাম লিখুন (যেমন: রনি টেলিকম)' : 'Type shop name (e.g. Rony Telecom)'}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Password Credentials */}
              {!editingEmployee && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      {lang === 'bn' ? '৩. এক্সেস পাসওয়ার্ড (PASSWORD SECURITY)' : '3. PASSWORD SECURITY'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {lang === 'bn' ? 'পাসওয়ার্ড (Password) *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          title={showPassword ? (lang === 'bn' ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (lang === 'bn' ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {lang === 'bn' ? 'কনফার্ম পাসওয়ার্ড *' : 'Confirm Password *'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          title={showConfirmPassword ? (lang === 'bn' ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (lang === 'bn' ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (1 Col): Avatar Uploader & Access Summary Card */}
            <div className="space-y-6">
              
              {/* Profile Photo Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-5 text-center space-y-4">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  {lang === 'bn' ? 'প্রোফাইল ছবি (Profile Avatar)' : 'Profile Avatar'}
                </h4>

                <div className="relative group mx-auto w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-md">
                  {selectedImage ? (
                    <img src={selectedImage} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                      <User className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      <span className="text-[10px] font-bold">No Photo</span>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1">
                    <Upload className="w-6 h-6 text-amber-300" />
                    <span className="text-[10px] font-bold">{lang === 'bn' ? 'ছবি আপলোড' : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {lang === 'bn' ? 'PNG, JPG আপলোড করুন (Max 2MB)' : 'Accepted PNG/JPG format'}
                </div>
              </div>

              {/* Role Privilege Summary Card */}
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'এক্সেস অধিকার সারসংক্ষেপ' : 'Access Permissions'}</span>
                </div>
                <div className="text-[11.5px] text-slate-600 dark:text-slate-300 space-y-1.5 font-medium leading-relaxed">
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'নির্বাচিত রোল:' : 'Assigned Role:'}</span>
                    <span className="font-black text-blue-600 dark:text-blue-400">{role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'পিওএস সেলস:' : 'POS Sales:'}</span>
                    <span className="font-bold text-emerald-600">Allowed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'রিপোর্ট দেখা:' : 'Reports Access:'}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {role === 'Cashier' ? 'Restricted' : 'Full Access'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল (Close)' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 hover:from-blue-700 hover:to-slate-950 text-white text-xs font-black shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>
                {editingEmployee 
                  ? (lang === 'bn' ? 'ইউজার আপডেট করুন' : 'Update User') 
                  : (lang === 'bn' ? 'ইউজার তৈরি করুন' : 'Save New User')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}