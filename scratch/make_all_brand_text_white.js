import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldSnippet = `<div className="flex items-center gap-1 font-sans font-black text-xl sm:text-2xl select-none ml-1 tracking-tight">
              <span className="text-white font-black">{platformBrandName || 'Nexus'}</span>
              <span className="text-[#FFB200] font-black uppercase tracking-wider ml-0.5">
                {platformBrandBadge || 'ERP'}
              </span>
            </div>`;

const newSnippet = `<div className="flex items-center gap-1.5 font-sans font-black text-xl sm:text-2xl text-white select-none ml-1 tracking-wide">
              <span>{platformBrandName || 'Nexus'}</span>
              <span className="uppercase">{platformBrandBadge || 'ERP'}</span>
            </div>`;

if (app.includes(oldSnippet)) {
  app = app.replace(oldSnippet, newSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully updated platform brand text color to pure crisp white!');
} else {
  console.log('Old snippet not found in App.tsx');
}
