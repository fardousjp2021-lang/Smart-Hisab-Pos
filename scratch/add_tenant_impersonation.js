import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const targetLine = `<p className="text-[10px] text-slate-400">👤 {owner.name} ({owner.phone || owner.email})</p>`;

const replacementLine = `<p className="text-[10px] text-slate-400">👤 {owner.name} ({owner.phone || owner.email})</p>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     if (owner.shopName) {
                                       setShopName(owner.shopName);
                                       if (owner.phone) setShopPhone(owner.phone);
                                       showToast(\`দোকানদার "\${owner.shopName}" এর পোর্টালে সুইচ করা হয়েছে! এখন আপনি স্টক ও প্রোডাক্ট সেটআপ করতে পারবেন।\`, 'success');
                                     }
                                   }}
                                   className="mt-1.5 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-[9.5px] hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                                 >
                                   <span>🔑 দোকান পোর্টালে প্রবেশ (প্রোডাক্ট এন্ট্রি)</span>
                                 </button>`;

if (app.includes(targetLine)) {
  app = app.replace(targetLine, replacementLine);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully added Tenant Impersonation button to Super Admin Panel in App.tsx!');
} else {
  console.log('Target line not found in App.tsx');
}
