import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldFontSnippet = `className={\`font-black text-white leading-tight tracking-wide break-words drop-shadow-sm \${
                      storeFontSize === 'sm' ? 'text-base' :
                      storeFontSize === 'lg' ? 'text-xl' :
                      storeFontSize === 'xl' ? 'text-2xl' : 'text-lg sm:text-xl'
                    }\`}`;

const newFontSnippet = `className={\`font-black text-white leading-tight tracking-tight break-words drop-shadow-md \${
                      storeFontSize === 'sm' ? 'text-lg font-extrabold' :
                      storeFontSize === 'lg' ? 'text-2xl font-black' :
                      storeFontSize === 'xl' ? 'text-3xl font-black' : 'text-xl sm:text-2xl font-black'
                    }\`}`;

if (app.includes(oldFontSnippet)) {
  app = app.replace(oldFontSnippet, newFontSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully updated store name font size matching 2nd reference image perfectly!');
} else {
  console.log('Old font snippet not found in App.tsx');
}
