import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldQuickAddSnippet = `                  <div 
                    className="absolute left-0 mt-2 w-52 rounded-lg bg-[rgb(1,12,45)] border border-[rgb(12,45,140)] shadow-2xl py-1 z-50 text-white text-xs"
                  >
                    <div className="px-3 py-1.5 text-[10px] text-white/50 font-bold uppercase tracking-wider border-b border-white/5">
                      {lang === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}
                    </div>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddProductOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[rgb(12,45,140)] text-left cursor-pointer"
                    >
                      <Package className="h-3.5 w-3.5 text-[#FFB200]" />
                      <span>{lang === 'bn' ? 'আইটেম যোগ করুন' : 'Add Item/Product'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddCustomerOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[rgb(12,45,140)] text-left cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-[#FFB200]" />
                      <span>{lang === 'bn' ? 'গ্রাহক যোগ করুন' : 'Add Customer'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddEmployeeOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[rgb(12,45,140)] text-left cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5 text-[#FFB200]" />
                      <span>{lang === 'bn' ? 'স্টাফ যোগ করুন' : 'Add Staff'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddQuotationOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[rgb(12,45,140)] text-left cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#FFB200]" />
                      <span>{lang === 'bn' ? 'কোটেশন যোগ করুন' : 'New Quotation'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setActiveTab('pos'); setActiveSubTab('pos'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-[rgb(12,45,140)] text-left cursor-pointer border-t border-white/10"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-[#FFB200]" />
                      <span>{lang === 'bn' ? 'পিওএস (POS)' : 'Open POS Screen'}</span>
                    </button>
                  </div>`;

const newQuickAddSnippet = `                  <div 
                    className="absolute left-0 mt-2 w-60 rounded-xl bg-[rgb(1,12,45)] border border-blue-500/40 shadow-2xl py-1.5 z-50 text-white font-sans text-xs"
                  >
                    <div className="px-4 py-2 text-[11px] text-amber-400 font-extrabold uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}</span>
                      <span className="text-[9.5px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black">FAST</span>
                    </div>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddProductOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-extrabold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <Package className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-extrabold tracking-wide">{lang === 'bn' ? 'আইটেম যোগ করুন' : 'Add Item/Product'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddCustomerOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-extrabold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <UserPlus className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-extrabold tracking-wide">{lang === 'bn' ? 'গ্রাহক যোগ করুন' : 'Add Customer'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddEmployeeOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-extrabold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <Users className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-extrabold tracking-wide">{lang === 'bn' ? 'স্টাফ যোগ করুন' : 'Add Staff'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setIsAddQuotationOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-extrabold text-[13.5px] text-white hover:text-amber-300"
                    >
                      <FileText className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-extrabold tracking-wide">{lang === 'bn' ? 'কোটেশন যোগ করুন' : 'New Quotation'}</span>
                    </button>
                    <button
                      onClick={function() { setIsQuickAddOpen(false); setActiveTab('pos'); setActiveSubTab('pos'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-600/30 text-left cursor-pointer transition font-extrabold text-[13.5px] text-white hover:text-amber-300 border-t border-white/10 mt-1"
                    >
                      <ShoppingCart className="h-4 w-4 text-[#FFB200] shrink-0 stroke-[2.5px]" />
                      <span className="font-extrabold tracking-wide">{lang === 'bn' ? 'পিওএস (POS)' : 'Open POS Screen'}</span>
                    </button>
                  </div>`;

if (app.includes(oldQuickAddSnippet)) {
  app = app.replace(oldQuickAddSnippet, newQuickAddSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully upgraded Quick Add Dropdown Menu fonts to bold, crisp, high-contrast sidebar style!');
} else {
  console.log('Old quick add snippet not found in App.tsx');
}
