import fs from 'fs';

let admin = fs.readFileSync('src/pos-app/components/AdminPanel.tsx', 'utf8');

// 1. Add state variables inside AdminPanel component
const stateSnippet = `  const [selectedUserUid, setSelectedUserUid] = React.useState<string | null>(null);
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
  };`;

admin = admin.replace(
  `  const [selectedUserUid, setSelectedUserUid] = React.useState<string | null>(null);\n  const [resolutionText, setResolutionText] = React.useState<{ [issueId: string]: string }>({});`,
  stateSnippet
);

// 2. Add client manager JSX block before end of AdminPanel
const managerJsx = `
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
    </div>`;

admin = admin.replace(`    </div>\n  );`, managerJsx + `\n  );`);
fs.writeFileSync('src/pos-app/components/AdminPanel.tsx', admin, 'utf8');
console.log('Successfully added client showcase manager to AdminPanel.tsx!');
