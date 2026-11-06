import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldBrandSnippet = `<div className="flex items-center gap-1.5 font-sans font-black text-lg text-white tracking-wide select-none ml-1">
              <span>{platformBrandName || 'Nexus'}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase shadow-sm">
                {platformBrandBadge || 'ERP'}
              </span>
            </div>`;

const newBrandSnippet = `<div className="flex items-center gap-2 font-sans font-black text-xl sm:text-2xl text-white tracking-wider select-none ml-1 drop-shadow-sm">
              <span>{platformBrandName || 'Nexus'}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 uppercase tracking-widest shadow-md border border-amber-300/80 leading-none">
                {platformBrandBadge || 'ERP'}
              </span>
            </div>`;

if (app.includes(oldBrandSnippet)) {
  app = app.replace(oldBrandSnippet, newBrandSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully upgraded Brand Text & Golden Badge visibility for crystal-clear readability from a distance!');
} else {
  console.log('Could not find old brand snippet in App.tsx');
}
