import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldSnippet = `<span className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 uppercase tracking-widest shadow-md border border-amber-300/80 leading-none">
                {platformBrandBadge || 'ERP'}
              </span>`;

const newSnippet = `<span className="px-2 py-0.5 rounded-md text-xs font-black bg-[#FFB200] text-[#010c2d] uppercase tracking-widest shadow-sm leading-none">
                {platformBrandBadge || 'ERP'}
              </span>`;

if (app.includes(oldSnippet)) {
  app = app.replace(oldSnippet, newSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully updated ERP badge to clean solid #FFB200 background with ultra-sharp text!');
} else {
  console.log('Old snippet not found in App.tsx');
}
