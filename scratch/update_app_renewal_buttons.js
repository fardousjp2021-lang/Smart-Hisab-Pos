import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const targetStr = `<div className="flex justify-end gap-1.5 flex-wrap">
                                  {/* Demo Grant */}`;

const lines = app.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* Demo Grant */')) {
    startIdx = i - 1; // start at <div className="flex justify-end gap-1.5 flex-wrap">
  }
  if (startIdx !== -1 && lines[i].includes('{owner.isBlocked ? \'🔓 Unblock\' : \'🚫 Block\'}')) {
    endIdx = i + 3; // end after closing </div>
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newChunk = `                                <div className="flex justify-end gap-1.5 flex-wrap">
                                  {/* 7 Days Demo */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 7);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ডেমো (৭ দিন)', isDemoMode: true, isBlocked: false, status: 'Active' } : u));
                                    showToast(\`"7 Days Demo" granted for \${owner.shopName}\`, 'success');
                                  }} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-[10px] font-bold rounded cursor-pointer">
                                    🎁 ৭ দিন
                                  </button>

                                  {/* 15 Days Demo */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 15);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ডেমো (১৫ দিন)', isDemoMode: true, isBlocked: false, status: 'Active' } : u));
                                    showToast(\`"15 Days Demo" granted for \${owner.shopName}\`, 'success');
                                  }} className="px-2 py-1 bg-purple-200 hover:bg-purple-300 text-purple-950 text-[10px] font-bold rounded cursor-pointer">
                                    🎁 ১৫ দিন
                                  </button>

                                  {/* 1 Month */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 30);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'মান্থলি (১ মাস)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(\`Renewed 1 Month for \${owner.shopName}\`, 'success');
                                  }} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    🚀 ১ মাস
                                  </button>

                                  {/* 6 Months */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setDate(nextDate.getDate() + 180);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'হাফ-ইয়ারলি (৬ মাস)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(\`Renewed 6 Months for \${owner.shopName}\`, 'success');
                                  }} className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    ⚡ ৬ মাস
                                  </button>

                                  {/* 1 Year */}
                                  <button type="button" onClick={() => {
                                    const nextDate = new Date();
                                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                                    const expiryStr = nextDate.toISOString().split('T')[0];
                                    setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                      ? { ...u, subscriptionExpiry: expiryStr, planType: 'ইয়ারলি (১ বছর)', isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                    showToast(\`Renewed 1 Year for \${owner.shopName}\`, 'success');
                                  }} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-2xs">
                                    🌟 ১ বছর
                                  </button>

                                  {/* Custom Days */}
                                  <button type="button" onClick={() => {
                                    const input = prompt(\`কাস্টম কত দিনের সাবস্ক্রিপশন দিতে চান? (\${owner.shopName})\`, "30");
                                    if (input) {
                                      const days = parseInt(input.trim(), 10);
                                      if (!isNaN(days) && days > 0) {
                                        const nextDate = new Date();
                                        nextDate.setDate(nextDate.getDate() + days);
                                        const expiryStr = nextDate.toISOString().split('T')[0];
                                        setSystemEmployees(prev => prev.map(u => (u.shopName === owner.shopName || u.id === owner.id)
                                          ? { ...u, subscriptionExpiry: expiryStr, planType: \`কাস্টম (\${days} দিন)\`, isDemoMode: false, isBlocked: false, status: 'Active' } : u));
                                        showToast(\`Granted \${days} Days for \${owner.shopName}\`, 'success');
                                      } else {
                                        showToast("সঠিক সংখ্যা বসান!", "error");
                                      }
                                    }
                                  }} className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold rounded cursor-pointer shadow-2xs border border-amber-600">
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
                                </div>`;

  lines.splice(startIdx, endIdx - startIdx, newChunk);
  fs.writeFileSync('src/pos-app/App.tsx', lines.join('\n'), 'utf8');
  console.log('Successfully updated renewal buttons in App.tsx!');
} else {
  console.log(`Could not find startIdx: ${startIdx}, endIdx: ${endIdx}`);
}
