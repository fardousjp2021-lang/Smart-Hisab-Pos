import fs from 'fs';

// 1. Update App.tsx
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldAppButtons = `<div className="flex justify-end gap-1.5 flex-wrap">
                                   {/* Demo Grant */}
                                   <button type="button" onClick={() => {
                                     const nextDate = new Date();
                                     nextDate.setDate(nextDate.getDate() + 15);
                                     const expiryStr = nextDate.toISOString().split('T')[0];
                                     setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                       ? { ...u, subscriptionExpiry: expiryStr, planType: 'Demo (15 Days)', isDemoMode: true, isBlocked: false, status: 'Active' } : u));
                                     showToast(\`"15 Days Demo" granted for \${owner.shopName}\`, 'success');
                                   }} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold rounded cursor-pointer">
                                     🎁 Demo 15D
                                   </button>

                                   {/* Renew +1 Month */}
                                   <button type="button" onClick={() => {
                                     const nextDate = new Date();
                                     nextDate.setDate(nextDate.getDate() + 30);
                                     const expiryStr = nextDate.toISOString().split('T')[0];
                                     setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                       ? { ...u, subscriptionExpiry: expiryStr, planType: 'Monthly Subscription', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                     showToast(\`Renewed +1 Month for \${owner.shopName}\`, 'success');
                                   }} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold rounded cursor-pointer">
                                     🚀 +1 Month
                                   </button>

                                   {/* Renew +1 Year */}
                                   <button type="button" onClick={() => {
                                     const nextDate = new Date();
                                     nextDate.setFullYear(nextDate.getFullYear() + 1);
                                     const expiryStr = nextDate.toISOString().split('T')[0];
                                     setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                       ? { ...u, subscriptionExpiry: expiryStr, planType: 'Yearly Subscription', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                     showToast(\`Renewed +1 Year for \${owner.shopName}\`, 'success');
                                   }} className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded cursor-pointer">
                                     🌟 +1 Year
                                   </button>

                                   {/* Block / Unblock */}
                                   <button type="button" onClick={() => {
                                     const willBlock = !owner.isBlocked;
                                     setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                       ? { ...u, isBlocked: willBlock, status: willBlock ? 'Blocked' : 'Active' } : u));
                                     showToast(willBlock ? \`Blocked \${owner.shopName}\` : \`Unblocked \${owner.shopName}\`, willBlock ? 'error' : 'success');
                                   }} className={\`px-2 py-1 text-[10px] font-bold rounded cursor-pointer \${
                                     owner.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'
                                   }\`}>
                                     {owner.isBlocked ? '🔓 Unblock' : '🚫 Block'}
                                   </button>
                                 </div>`;

const newAppButtons = `<div className="flex justify-end gap-1.5 flex-wrap">
                                   {/* Helper func */}
                                   {(() => {
                                     const grantDays = (days: number, label: string) => {
                                       const nextDate = new Date();
                                       nextDate.setDate(nextDate.getDate() + days);
                                       const expiryStr = nextDate.toISOString().split('T')[0];
                                       setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                         ? { ...u, subscriptionExpiry: expiryStr, planType: label, isDemoMode: label.includes('Demo') || label.includes('দিন'), isBlocked: false, status: 'Active' } : u));
                                       showToast(\`"\${label}" granted for \${owner.shopName} (\${days} Days)\`, 'success');
                                     };

                                     const handleCustomDays = () => {
                                       const input = prompt(lang === 'bn' ? \`কাস্টম কত দিনের সাবস্ক্রিপশন দিতে চান? (\${owner.shopName})\` : \`Enter custom days for \${owner.shopName}:\`, "30");
                                       if (input) {
                                         const days = parseInt(input.trim(), 10);
                                         if (!isNaN(days) && days > 0) {
                                           grantDays(days, \`কাস্টম (\${days} দিন)\`);
                                         } else {
                                           showToast("সঠিক সংখ্যা বসান!", "error");
                                         }
                                       }
                                     };

                                     return (
                                       <>
                                         {/* 7 Days */}
                                         <button type="button" onClick={() => grantDays(7, 'ডেমো (৭ দিন)')} className="px-2 py-1 bg-[#f3e8ff] hover:bg-purple-200 text-purple-900 text-[10px] font-bold rounded cursor-pointer">
                                           🎁 ৭ দিন
                                         </button>

                                         {/* 15 Days */}
                                         <button type="button" onClick={() => grantDays(15, 'ডেমো (১৫ দিন)')} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-950 text-[10px] font-bold rounded cursor-pointer">
                                           🎁 ১৫ দিন
                                         </button>

                                         {/* 1 Month */}
                                         <button type="button" onClick={() => grantDays(30, 'মান্থলি (১ মাস)')} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[10px] font-bold rounded cursor-pointer">
                                           🚀 ১ মাস
                                         </button>

                                         {/* 6 Months */}
                                         <button type="button" onClick={() => grantDays(180, 'হাফ-ইয়ারলি (৬ মাস)')} className="px-2 py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 text-[10px] font-bold rounded cursor-pointer">
                                           ⚡ ৬ মাস
                                         </button>

                                         {/* 1 Year */}
                                         <button type="button" onClick={() => grantDays(365, 'ইয়ারলি (১ বছর)')} className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded cursor-pointer">
                                           🌟 ১ বছর
                                         </button>

                                         {/* Custom Days */}
                                         <button type="button" onClick={handleCustomDays} className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[10px] font-extrabold rounded cursor-pointer border border-amber-300">
                                           ⚙️ কাস্টম দিন
                                         </button>

                                         {/* Block / Unblock */}
                                         <button type="button" onClick={() => {
                                           const willBlock = !owner.isBlocked;
                                           setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                             ? { ...u, isBlocked: willBlock, status: willBlock ? 'Blocked' : 'Active' } : u));
                                           showToast(willBlock ? \`Blocked \${owner.shopName}\` : \`Unblocked \${owner.shopName}\`, willBlock ? 'error' : 'success');
                                         }} className={\`px-2 py-1 text-[10px] font-bold rounded cursor-pointer \${
                                           owner.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-700'
                                         }\`}>
                                           {owner.isBlocked ? '🔓 Unblock' : '🚫 Block'}
                                         </button>
                                       </>
                                     );
                                   })()}
                                 </div>`;

if (app.includes(oldAppButtons)) {
  app = app.replace(oldAppButtons, newAppButtons);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully updated renewal buttons in App.tsx!');
} else {
  console.log('Old app buttons block not found in App.tsx');
}

// 2. Update AdminPanel.tsx
let ap = fs.readFileSync('src/pos-app/components/AdminPanel.tsx', 'utf8');

const oldApButtons = `<div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                      </div>`;

const newApButtons = `<div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                                handleUpdateSubscription(u.uid || u.id, \`কাস্টম (\${days} দিন)\`, days);
                              }
                            }
                          }}
                          className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] hover:bg-amber-600 transition cursor-pointer border border-amber-600"
                        >
                          ⚙️ কাস্টম দিন
                        </button>
                      </div>`;

if (ap.includes(oldApButtons)) {
  ap = ap.replace(oldApButtons, newApButtons);
  fs.writeFileSync('src/pos-app/components/AdminPanel.tsx', ap, 'utf8');
  console.log('Successfully updated renewal buttons in AdminPanel.tsx!');
} else {
  console.log('Old ap buttons block not found in AdminPanel.tsx');
}
