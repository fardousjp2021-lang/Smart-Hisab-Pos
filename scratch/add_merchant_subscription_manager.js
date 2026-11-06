import fs from 'fs';

let admin = fs.readFileSync('src/pos-app/components/AdminPanel.tsx', 'utf8');

// 1. Add subscription state to AdminPanel
const subStateSnippet = `  // Merchant Subscription Management State
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
  };`;

admin = admin.replace(
  `  const [selectedUserUid, setSelectedUserUid] = React.useState<string | null>(null);`,
  `  const [selectedUserUid, setSelectedUserUid] = React.useState<string | null>(null);\n` + subStateSnippet
);

// 2. Add Subscription Control Card JSX to AdminPanel
const subCardJsx = `
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
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'মান্থলি প্যাকেজ (1 Month)', 30)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition cursor-pointer shadow-2xs"
                        >
                          +১ মাস রিচার্জ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'ইয়ারলি প্রফেশনাল (1 Year)', 365)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer shadow-2xs"
                        >
                          +১ বছর রিচার্জ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubscription(u.uid || u.id, 'লাইফটাইম ফ্রি', 3650)}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] transition cursor-pointer shadow-2xs"
                        >
                          আজীবন ফ্রি
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>`;

admin = admin.replace(
  `{/* Dynamic Public Landing Page Client Showcase Manager */}`,
  subCardJsx + `\n\n      {/* Dynamic Public Landing Page Client Showcase Manager */}`
);

fs.writeFileSync('src/pos-app/components/AdminPanel.tsx', admin, 'utf8');
console.log('Successfully added Merchant Subscription Manager to AdminPanel.tsx!');
