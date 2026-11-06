// @ts-nocheck
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Mail, 
  UserPlus, 
  ShieldCheck,
  AlertTriangle,
  Activity,
  Cpu,
  CornerDownRight,
  HelpCircle,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  Search,
  User as UserIcon,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    users, 
    toggleUserBlock, 
    toggleUserAdmin, 
    currentUser,
    products,
    sales,
    issues,
    resolveSupportIssue
  } = useApp();

  const [selectedUserUid, setSelectedUserUid] = React.useState<string | null>(null);
  // Merchant Subscription Management State
  const [subscriptions, setSubscriptions] = React.useState<{ [userUid: string]: { plan: string; expiryDate: string; status: 'Active' | 'Expired' | 'Trial' } }>(() => {
    try {
      const saved = localStorage.getItem('saim_merchant_subscriptions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleUpdateSubscription = (userUid: string, plan: string, daysToAdd: number) => {
    const now = new Date();
    const future = new Date(now.setDate(now.getDate() + daysToAdd)).toISOString().slice(0, 10);
    const updated = {
      ...subscriptions,
      [userUid]: {
        plan,
        expiryDate: future,
        status: 'Active' as const
      }
    };
    setSubscriptions(updated);
    localStorage.setItem('saim_merchant_subscriptions', JSON.stringify(updated));
    alert('সাবস্ক্রিপশন সফলভাবে আপডেট করা হয়েছে! নতুন মেয়াদের শেষ তারিখ: ' + future);
  };
  const [resolutionText, setResolutionText] = React.useState<{ [issueId: string]: string }>({});

  // Dynamic Client Showcase State
  const defaultClientsList = [
    { id: 1, title: "প্রাইম মোবাইল মার্ট", location: "কামাল পাশা মোড়, লক্ষ্মীপুর", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400", category: "মোবাইল শপ", description: "রিয়েল-টাইম স্টক আপডেট ও ইনস্ট্যান্ট মেমো প্রিন্টিং স্পীড খুবই চমৎকার।" },
    { id: 2, title: "ডিল্যাক্স ফ্যাশন হাউস", location: "আজাদ নগর, রামগতি", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400", category: "ক্লথিং ও ফ্যাশন", description: "মাল্টি-ক্যাটাগরি ট্র্যাকিং এবং ক্যাশ রেজিস্ট্রার মেইনটেইন করা এখন অনেক সহজ।" },
    { id: 3, title: "স্মার্ট গিফট গ্যালারি", location: "জৈন্তাপুর, সিলেট", image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=400", category: "গিফট ও কসমেটিক্স", description: "বারকোড স্ক্যানার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় প্রফিট ক্যালকুলেটর অসাধারণ।" },
    { id: 4, title: "পপুলার ড্রাগ হাউস", location: "ধানমন্ডি, ঢাকা", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=400", category: "ফার্মেসী ও ড্রাগ স্টোর", description: "মেডিসিনের মিনিমাম স্টক অ্যালার্ট এবং ব্যাচ ট্র্যাকিং সিস্টেমটি অত্যন্ত কার্যকর।" },
    { id: 5, title: "এলাইট কসমেটিক্স পয়েন্ট", location: "জিইসি মোড়, চট্টগ্রাম", image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400", category: "কসমেটিক্স ও গ্যাজেটস", description: "ফায়ারবেস ক্লাউড ব্যাকআপের কারণে কোনো ডাটা হারানোর ভয় সম্পূর্ণ কেটে গেছে।" }
  ];

  const [clientCards, setClientCards] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('saim_happy_clients');
      return saved ? JSON.parse(saved) : defaultClientsList;
    } catch (e) {
      return defaultClientsList;
    }
  });

  const [newTitle, setNewTitle] = React.useState('');
  const [newLoc, setNewLoc] = React.useState('');
  const [newCat, setNewCat] = React.useState('মোবাইল শপ');
  const [newImg, setNewImg] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');

  const handleAddClientCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLoc.trim()) {
      alert("অনুগ্রহ করে দোকানের নাম ও ঠিকানা ফিল্ড পূরণ করুন!");
      return;
    }
    const newCard = {
      id: Date.now(),
      title: newTitle.trim(),
      location: newLoc.trim(),
      category: newCat.trim(),
      image: newImg.trim() || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
      description: newDesc.trim() || "আমাদের শপের সকল হিসাব নিকাশ অত্যন্ত বিশ্বস্ততার সাথে পরিচালিত হচ্ছে।"
    };
    const updated = [newCard, ...clientCards];
    setClientCards(updated);
    localStorage.setItem('saim_happy_clients', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setNewTitle('');
    setNewLoc('');
    setNewImg('');
    setNewDesc('');
    alert("নতুন ক্লায়েন্ট শোপকেস কার্ড সফলভাবে পাবলিক হোম পেজে যুক্ত হয়েছে!");
  };

  const handleDeleteClientCard = (id: number) => {
    if (confirm("আপনি কি নিশ্চিত যে এই দোকান কার্ডটি মুছতে চান?")) {
      const updated = clientCards.filter((c) => c.id !== id);
      setClientCards(updated);
      localStorage.setItem('saim_happy_clients', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleBlockToggle = async (uid: string, isBlocked: boolean, email: string) => {
    if (email === 'fardous.jp2021@gmail.com' || email === 'info.fardousit@gmail.com') {
      alert("প্রধান অ্যাডমিনকে ব্লক করা সম্ভব নয়!");
      return;
    }
    
    const message = isBlocked 
      ? "আপনি কি নিশ্চিত যে এই ইউজারকে আনব্লক করতে চান?" 
      : "আপনি কি নিশ্চিত যে এই ইউজারকে ব্লক করতে চান? ব্লক করা ইউজার সিস্টেম এক্সেস করতে পারবে না।";

    if (confirm(message)) {
      await toggleUserBlock(uid, !isBlocked);
    }
  };

  const handleAdminToggle = async (uid: string, isAdmin: boolean, email: string) => {
    if (email === 'fardous.jp2021@gmail.com' || email === 'info.fardousit@gmail.com') {
      alert("প্রধান অ্যাডমিনের প্রিভিলেজ পরিবর্তন করা সম্ভব নয়!");
      return;
    }

    const message = isAdmin 
      ? "আপনি কি নিশ্চিত যে এই ইউজারের অ্যাডমিন পাওয়ার অপসারণ করতে চান?" 
      : "আপনি কি নিশ্চিত যে এই ইউজারকে অ্যাডমিন বানাতে চান?";

    if (confirm(message)) {
      await toggleUserAdmin(uid, !isAdmin);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">ইউজার কন্ট্রোল ও অ্যাক্সেস প্যানেল</h2>
          <p className="text-slate-500 text-sm mt-1">লগইন করা সক্রিয় কর্মীদের অ্যাক্সেস লেভেল এবং ব্লকিং স্ট্যাটাস ম্যানেজ করুন।</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Users size={24} />
        </div>
      </div>

      {/* Admin Safety Alert banner */}
      <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold">সতর্ক বার্তা (Admin Guideline):</p>
          <p className="mt-0.5">অ্যাডমিন প্রিভিলেজ পাওয়া কর্মীরা পণ্য যোগ, মুছে ফেলা এবং সম্পূর্ণ ক্রয়মূল্যের রেকর্ড পরিবর্তন করতে পারেন। অনুগ্রহ করে বিশ্বস্ত কর্মীদের ছাড়া কাউকে অ্যাডমিন অ্যাক্সেস দেবেন না।</p>
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-sm">সিস্টেম ইউজার তালিকা ({users.length} জন নিবন্ধিত)</h3>
          <span className="text-xs text-slate-400">ব্যক্তিগত তথ্য দেখতে 'নিরীক্ষণ' বাটনে ক্লিক করুন</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 bg-slate-50/70 uppercase font-bold text-center">
              <tr>
                <th className="px-6 py-4 text-left">ইউজার ও প্রোফাইল</th>
                <th className="px-6 py-4 text-left">ইমেইল ঠিকানা</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">ভূমিকা (Role)</th>
                <th className="px-6 py-4 text-right">নিরীক্ষণ ও সেটিং</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isMainAdmin = u.email === 'fardous.jp2021@gmail.com' || u.email === 'info.fardousit@gmail.com';
                const isSelected = selectedUserUid === u.uid;
                return (
                  <tr key={u.uid} className={`hover:bg-slate-50 duration-150 text-center ${isSelected ? 'bg-blue-50/20' : ''}`}>
                    {/* User profile details */}
                    <td className="px-6 py-4 text-left flex items-center gap-3">
                      {u.photoURL ? (
                        <img 
                          src={u.photoURL} 
                          alt={u.displayName} 
                          className="w-9 h-9 rounded-full border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                          {u.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">UID: {u.uid.substring(0, 8)}...</p>
                      </div>
                    </td>

                    {/* Email address */}
                    <td className="px-6 py-4 text-left font-mono text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    {/* Block/Unblock badge indicator */}
                    <td className="px-6 py-4">
                      {u.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-705 rounded-full">
                          <UserX size={12} />
                          <span>ব্লকড ইউজার</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-750 rounded-full">
                          <UserCheck size={12} />
                          <span>সক্রিয় কর্মী</span>
                        </span>
                      )}
                    </td>

                    {/* Role privilege details */}
                    <td className="px-6 py-4">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-blue-105 text-blue-700 rounded-full">
                          <ShieldCheck size={12} />
                          <span>সিস্টেম অ্যাডমিন</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-650 rounded-full">
                          <span>সেলস পারসোনাল</span>
                        </span>
                      )}
                    </td>

                    {/* Admin triggers */}
                    <td className="px-6 py-4 text-right">
                      {isMainAdmin ? (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedUserUid(u.uid)}
                            className={`p-1 px-2.5 rounded-lg border text-xs font-bold duration-150 cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-650 text-white bg-indigo-600' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            অনার প্রোফাইল এনালাইসিস
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex justify-end gap-1.5">
                          {/* Inspect Profile */}
                          <button
                            onClick={() => setSelectedUserUid(isSelected ? null : u.uid)}
                            className={`p-1 px-2.5 rounded-lg border text-xs font-semibold hover:shadow-xs duration-150 flex items-center gap-1 cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 text-white shadow-xs border-indigo-650' 
                                : 'bg-white border-slate-200 text-indigo-700 hover:bg-indigo-50 border-indigo-150'
                            }`}
                          >
                            <span>তথ্য পর্যবেক্ষণ</span>
                          </button>

                          {/* Toggle Admin permissions */}
                          <button
                            onClick={() => handleAdminToggle(u.uid, u.isAdmin, u.email)}
                            className={`p-1 px-2.5 rounded-lg border text-xs font-semibold hover:shadow-xs duration-150 flex items-center gap-1 cursor-pointer ${
                              u.isAdmin 
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            <span>{u.isAdmin ? 'অ্যাডমিন রিমুভ' : 'অ্যাডমিন বানান'}</span>
                          </button>

                          {/* Toggle block state */}
                          <button
                            onClick={() => handleBlockToggle(u.uid, u.isBlocked, u.email)}
                            className={`p-1 px-2.5 rounded-lg border text-xs font-semibold hover:shadow-xs duration-150 flex items-center gap-1 cursor-pointer ${
                              u.isBlocked 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-rose-50 border-rose-250 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            <span>{u.isBlocked ? 'আনব্লক করুণ' : 'ব্লক করুন'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Diagnostic Profile Console */}
      {selectedUserUid && (() => {
        const selectedUser = users.find(u => u.uid === selectedUserUid);
        if (!selectedUser) return null;

        // Filter products and sales
        const userProducts = products.filter(p => p.createdByEmail === selectedUser.email);
        const userSales = sales.filter(s => s.recordedByEmail === selectedUser.email);
        const userSalesTotal = userSales.reduce((acc, curr) => acc + curr.totalPrice, 0);

        return (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">ইউজার প্রোফাইল ও কার্য নিরীক্ষণ কন্ট্রোল</h3>
                  <p className="text-[10px] text-slate-400">নিবন্ধিত কর্মীর এন্ট্রি করা পণ্যসমূহ ও সাম্প্রতিক বিক্রয় রশিদ পর্যালোচনা</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUserUid(null)} 
                className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer"
              >
                নিরীক্ষণ বন্ধ করুন
              </button>
            </div>

            {/* Profile Core variables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile card metadata */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex items-center gap-3">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} className="w-12 h-12 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-lg">{selectedUser.displayName.charAt(0)}</div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{selectedUser.displayName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">UID: {selectedUser.uid.substring(0, 10)}...</p>
                  </div>
                </div>
                
                <div className="text-xs text-slate-600 space-y-1.5 pt-1.5 border-t border-slate-200 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">ইমেইলঃ</span>
                    <span className="truncate max-w-[140px]" title={selectedUser.email}>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">ভূমিকাঃ</span>
                    <span className={`font-bold ${selectedUser.isAdmin ? 'text-blue-600' : 'text-slate-500'}`}>
                      {selectedUser.isAdmin ? 'সিস্টেম অ্যাডমিন' : 'সেলস অপারেটর'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">স্ট্যাটাসঃ</span>
                    <span className={`font-bold ${selectedUser.isBlocked ? 'text-red-650' : 'text-emerald-600'}`}>
                      {selectedUser.isBlocked ? 'ব্লকড ইউজার' : 'সক্রিয় কর্মী'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products entered box */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/20 p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">ডাটাবেজে এন্ট্রি করা পণ্য</span>
                  <ShoppingBag size={20} className="text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-display font-bold text-blue-850 text-blue-800">{userProducts.length} <span className="text-xs font-medium text-slate-500">টি আইটেম</span></p>
                  <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">এই ব্যবহারকারী সিস্টেমে নতুন স্টক আপলোড করেছেন এবং SKU কোড ডিফাইন করেছেন।</p>
                </div>
              </div>

              {/* Transactions made box */}
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/20 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">ব্যক্তিগত বিক্রয় অবদান</span>
                  <ShoppingCart size={20} className="text-emerald-500" />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-display font-bold text-emerald-850 text-emerald-800">৳ {userSalesTotal.toLocaleString()} <span className="text-xs font-medium text-slate-500">টাকা</span></p>
                  <p className="text-[10px] text-slate-455 mt-1 leading-relaxed">মোট {userSales.length} টি বিক্রয় রশিদ বা ক্যাশ মেমো এন্ট্রি করে লাভ সংগ্রাহক হিসেবে অবদান রেখেছেন।</p>
                </div>
              </div>
            </div>

            {/* Custom tabular activities of this user */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Product list entered by user */}
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-3xs">
                <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-755 text-slate-705">ব্যবহারকারীর যুক্ত করা পণ্য তালিকা</h5>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">{userProducts.length} টি পণ্য</span>
                </div>
                
                {userProducts.length === 0 ? (
                  <div className="text-slate-400 text-xs text-center py-6">এই ব্যবহারকারী কোনো পণ্য যুক্ত করেননি।</div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-105 text-xs">
                    {userProducts.map(p => (
                      <div key={p.id} className="p-2.5 hover:bg-slate-50/60 duration-100 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">SKU: {p.sku} | {p.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">৳ {p.sellingPrice}/-</p>
                          <p className="text-[9px] text-slate-500">স্টকঃ {p.stock} {p.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Sales lists entered by user */}
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-3xs">
                <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-755 text-slate-705 font-display">ব্যবহারকারীর সাম্প্রতিক করা বিক্রয়সমূহ</h5>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">{userSales.length} টি রসিদ</span>
                </div>

                {userSales.length === 0 ? (
                  <div className="text-slate-400 text-xs text-center py-6">এই ব্যবহারকারী কোনো বিক্রয় করেননি।</div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-105 text-xs">
                    {userSales.map(s => (
                      <div key={s.id} className="p-2.5 hover:bg-slate-50/60 duration-100 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{s.productName}</p>
                          <p className="text-[9px] text-slate-400 font-mono">আইডি-ID: #{s.id.substring(0, 5).toUpperCase()} | {s.quantity} {s.unitPrice}৳</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">৳ {s.totalPrice}/-</p>
                          <p className="text-[9px] text-slate-400 font-mono">{new Date(s.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* Support tickets feedback panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">সিস্টেম ইস্যু ও ইউজার সাপোর্ট ডেস্ক</h3>
              <p className="text-[10px] text-slate-400">কর্মীদের পাঠানো ত্রুটি, বাটন লক বা ডাটাবেজ সংক্রান্ত সমস্যা সমাধানের স্থান</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-650 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            মোট টিকিট সংখ্যাঃ {issues.length} টি
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            কোন কর্মী এখনও সিস্টেম ত্রুটির কথা রিপোর্ট করেননি।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map(issue => {
              const uText = resolutionText[issue.id] || '';
              return (
                <div 
                  key={issue.id} 
                  className={`p-4 border rounded-xl space-y-3 transition duration-150 ${
                    issue.isResolved 
                      ? 'bg-slate-50/50 border-slate-200' 
                      : 'bg-rose-50/20 border-rose-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs flex items-center justify-center">
                        {issue.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{issue.userName}</p>
                        <p className="text-[9px] text-slate-400 font-mono leading-none">{issue.userEmail}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        issue.isResolved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {issue.isResolved ? 'সমাধান করা হয়েছে' : 'অপেক্ষমান রয়েছে (Pending)'}
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(issue.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Complaint details */}
                  <div className="bg-white p-3 border border-slate-100 text-xs text-slate-800 rounded-lg leading-relaxed shadow-3xs">
                    <p className="font-semibold text-slate-400 text-[9px] uppercase mb-0.5">রিপোর্টকৃত সমস্যাঃ</p>
                    <p className="text-xs font-medium text-slate-800">{issue.message}</p>
                    
                    {issue.systemStateSummary && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 font-mono flex items-center gap-1">
                        <Cpu size={10} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={issue.systemStateSummary}>{issue.systemStateSummary}</span>
                      </div>
                    )}
                  </div>

                  {/* Resolve input text section */}
                  {!issue.isResolved ? (
                    <div className="space-y-1.5">
                      <textarea
                        value={uText}
                        onChange={(e) => setResolutionText(prev => ({ ...prev, [issue.id]: e.target.value }))}
                        placeholder="সমাধান বা ব্যবস্থার কথা লিখুন (যেমনঃ 'পণ্য যোগ করতে ক্যাটাগরি ঠিক করুন, স্টক রিফ্রেশ করা হয়েছে।')"
                        rows={2}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                      />
                      <button
                        onClick={async () => {
                          if (!uText.trim()) {
                            alert("অনুগ্রহ করে সমাধান বার্তাটি লিখুন!");
                            return;
                          }
                          await resolveSupportIssue(issue.id, uText.trim());
                        }}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-3xs"
                      >
                        <CheckCircle2 size={12} />
                        <span>টিকিটটি মিমাংসিত হিসেবে নিশ্চিত করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 text-xs text-slate-700 rounded-lg p-2.5 border border-emerald-100 flex gap-2 items-start">
                      <CornerDownRight size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] text-emerald-805 block leading-none">আপনার দেওয়া সমাধান নির্দেশিকাঃ</span>
                        <p className="text-slate-600 mt-1 italic font-medium">"{issue.resolutionNote}"</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      
      {/* Merchant SaaS Subscription Manager Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>💳</span>
              <span>দোকান সাবস্ক্রিপশন ও মেয়াদ প্যাকেজ ম্যানেজার (Merchant Subscription Manager)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              নিবন্ধিত সকল ব্যবসায়ীদের মাসিক/বার্ষিক সাবস্ক্রিপশন প্যাকেজ নির্ধারণ ও মেয়াদের তারিখ আপডেট করার প্যানেল
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            SaaS Billing Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">দোকান / ইউজার নাম</th>
                <th className="p-3">ইমেইল & মোবাইল</th>
                <th className="p-3">বর্তমান প্যাকেজ</th>
                <th className="p-3">মেয়াদ শেষ হওয়ার তারিখ</th>
                <th className="p-3 text-center">সাবস্ক্রিপশন একশন (+মেয়াদ বাড়ান)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {(users || []).map((u: any) => {
                const sub = subscriptions[u.uid || u.id] || { plan: 'ফ্রি ট্রায়াল (7 Days)', expiryDate: new Date(Date.now() + 7*86400000).toISOString().slice(0, 10), status: 'Active' };
                const isExpired = new Date(sub.expiryDate) < new Date();
                return (
                  <tr key={u.uid || u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name || u.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.role}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-mono">{u.email}</div>
                      <div className="text-[10px] text-slate-500">{u.phone || '—'}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-700 uppercase">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (isExpired ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                        📅 {sub.expiryDate} {isExpired ? '(মেয়াদ শেষ)' : ''}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'ডেমো (৭ দিন)', 7)}
                          className="px-2 py-1 rounded bg-purple-100 text-purple-900 font-bold text-[10px] hover:bg-purple-200 transition cursor-pointer"
                        >
                          🎁 ৭ দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'ডেমো (১৫ দিন)', 15)}
                          className="px-2 py-1 rounded bg-purple-200 text-purple-950 font-bold text-[10px] hover:bg-purple-300 transition cursor-pointer"
                        >
                          🎁 ১৫ দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'মান্থলি (১ মাস)', 30)}
                          className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition cursor-pointer"
                        >
                          🚀 ১ মাস
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'হাফ-ইয়ারলি (৬ মাস)', 180)}
                          className="px-2 py-1 rounded bg-teal-600 text-white font-bold text-[10px] hover:bg-teal-700 transition cursor-pointer"
                        >
                          ⚡ ৬ মাস
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'ইয়ারলি (১ বছর)', 365)}
                          className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition cursor-pointer"
                        >
                          🌟 ১ বছর
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const input = prompt("কাস্টম কত দিনের সাবস্ক্রিপশন দিতে চান?", "30");
                            if (input) {
                              const days = parseInt(input.trim(), 10);
                              if (!isNaN(days) && days > 0) {
                                handleUpdateSubscription(u.uid || u.id, `কাস্টম (${days} দিন)`, days);
                              }
                            }
                          }}
                          className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] hover:bg-amber-600 transition cursor-pointer border border-amber-600"
                        >
                          ⚙️ কাস্টম দিন
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Public Landing Page Client Showcase Manager */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>🏬</span>
              <span>পাবলিক হোম পেজ ক্লায়েন্ট শোপকেস ম্যানেজার (Client Showcase Manager)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              পাবলিক হোম পেজে প্রদর্শিত ব্যবসায়ীদের আসল নাম, ছবি, ঠিকানা ও রিভিউ ইনপুট ও ম্যানেজ করার প্যানেল
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#8b26c7]/10 text-[#8b26c7]">
            {clientCards.length} টি ক্লায়েন্ট কার্ড
          </span>
        </div>

        {/* Add New Client Form */}
        <form onSubmit={handleAddClientCard} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">➕ নতুন মার্চেন্ট / দোকান যুক্ত করুন</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">দোকানের নাম *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. রনি টেলিকম"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">স্থান / শহর *</label>
              <input
                type="text"
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                placeholder="e.g. আজাদ নগর, লক্ষ্মীপুর"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="মোবাইল শপ">মোবাইল শপ & গ্যাজেট</option>
                <option value="ক্লথিং ও ফ্যাশন">ক্লথিং ও ফ্যাশন</option>
                <option value="গিফট ও কসমেটিক্স">গিফট ও কসমেটিক্স</option>
                <option value="ফার্মেসী ও ড্রাগ স্টোর">ফার্মেসী ও ড্রাগ স্টোর</option>
                <option value="গ্রোসারী ও সুপারশপ">গ্রোসারী ও সুপারশপ</option>
                <option value="অন্যান্য ব্যবসা">অন্যান্য ব্যবসা</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">ছবি/লোগো ইউআরএল (Image URL)</label>
              <input
                type="text"
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                placeholder="https://... (ফাঁকা রাখলে ডিফল্ট ছবি নেওয়া হবে)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">গ্রাহকের মন্তব্য / রিভিউ</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. রিয়েল-টাইম স্টক ট্র্যাকিং সুবিধা অত্যন্ত চমৎকার।"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>➕ হোম পেজে ক্লায়েন্ট কার্ড যুক্ত করুন</span>
          </button>
        </form>

        {/* Existing Client Cards List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">📋 বর্তমানে সংযুক্ত মার্চেন্ট কার্ডসমূহ ({clientCards.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clientCards.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-2">
                <div className="flex items-start gap-3">
                  <img src={c.image} alt={c.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 block w-fit mt-0.5">{c.category}</span>
                    <span className="text-[10px] font-semibold text-slate-500 block truncate mt-0.5">📍 {c.location}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 italic line-clamp-2 bg-white p-2 rounded border border-slate-100 font-medium">"{c.description}"</p>
                <button
                  type="button"
                  onClick={() => handleDeleteClientCard(c.id)}
                  className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  🗑️ কার্ডটি মুছুন (Delete)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};