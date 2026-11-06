import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Outer container
app = app.replace(
  '<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl text-left">',
  '<div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">'
);

// 2. Header text colors & border
app = app.replace(
  '<div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">',
  '<div className="flex items-center justify-between border-b border-slate-100 pb-3">'
);

app = app.replace(
  '<span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">Interactive Developer Console</span>',
  '<span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Interactive Developer Console</span>'
);

app = app.replace(
  '<h3 className="text-base font-black text-white mt-0.5">',
  '<h3 className="text-base font-black text-slate-900 mt-0.5">'
);

app = app.replace(
  '<span className="text-[9.5px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full font-bold select-none">',
  '<span className="text-[9.5px] font-mono bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-full font-extrabold select-none">'
);

app = app.replace(
  '<p className="text-xs text-slate-400 mb-4 font-semibold leading-relaxed">',
  '<p className="text-xs text-slate-500 font-medium leading-relaxed">'
);

// 3. Log Terminal Screen (Clean Slate-50 background with dark slate text)
app = app.replace(
  '<div className="bg-[#0b1329] rounded-xl p-4 border border-slate-800/90 font-mono text-[11.5px] leading-relaxed space-y-2 mb-4 h-[160px] overflow-y-auto" style={{ scrollbarWidth: \'none\' }}>',
  '<div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 font-mono text-[11.5px] leading-relaxed space-y-2 h-[160px] overflow-y-auto" style={{ scrollbarWidth: \'none\' }}>'
);

app = app.replace(
  'let textColor = "text-slate-300";',
  'let textColor = "text-slate-700 font-semibold";'
);
app = app.replace(
  'if (isInput) textColor = "text-sky-300 font-bold";',
  'if (isInput) textColor = "text-blue-700 font-extrabold";'
);
app = app.replace(
  'else if (isSuccess) textColor = "text-emerald-400 font-bold";',
  'else if (isSuccess) textColor = "text-emerald-600 font-extrabold";'
);
app = app.replace(
  'else if (isError) textColor = "text-rose-400 font-bold";',
  'else if (isError) textColor = "text-rose-600 font-extrabold";'
);

// 4. Form & Input Bar
app = app.replace(
  '<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs font-bold select-none">',
  '<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-xs font-bold select-none">'
);

app = app.replace(
  'className="w-full bg-[#0b1329] border border-slate-700/80 rounded-xl pl-[160px] pr-3.5 py-3 text-xs font-semibold font-mono text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 placeholder-slate-500 transition"',
  'className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-[160px] pr-3.5 py-3 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-slate-400 transition"'
);

// 5. Shortcuts Area
app = app.replace(
  '<span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2.5">',
  '<span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block mb-2.5">'
);

app = app.replace(
  /className="bg-slate-800\/90 hover:bg-slate-800 border border-slate-700\/80 hover:border-sky-500\/40 text-slate-200 hover:text-white text-\[11px\] font-medium px-3\.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1\.5 shadow-xs"/g,
  'className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"'
);
app = app.replace(
  /className="bg-slate-800\/90 hover:bg-slate-800 border border-slate-700\/80 hover:border-amber-500\/40 text-slate-200 hover:text-white text-\[11px\] font-medium px-3\.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1\.5 shadow-xs"/g,
  'className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"'
);
app = app.replace(
  /className="bg-slate-800\/90 hover:bg-slate-800 border border-slate-700\/80 hover:border-emerald-500\/40 text-slate-200 hover:text-white text-\[11px\] font-medium px-3\.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1\.5 shadow-xs"/g,
  'className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"'
);
app = app.replace(
  /className="bg-slate-800\/90 hover:bg-slate-800 border border-slate-700\/80 hover:border-purple-500\/40 text-slate-200 hover:text-white text-\[11px\] font-medium px-3\.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1\.5 shadow-xs"/g,
  'className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"'
);
app = app.replace(
  /className="bg-slate-800\/90 hover:bg-slate-800 border border-slate-700\/80 hover:border-blue-500\/40 text-slate-200 hover:text-white text-\[11px\] font-medium px-3\.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1\.5 shadow-xs"/g,
  'className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"'
);

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('Successfully redesigned Super Admin Prompt Center into clean white design!');
