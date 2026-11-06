import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const duplicateTitleSnippet = `<h1 className="font-sans font-bold text-lg sm:text-xl text-white tracking-wide truncate">
              {lang === 'bn' ? 'Rony Telecom' : 'Rony Telecom'}
            </h1>`;

if (app.includes(duplicateTitleSnippet)) {
  app = app.replace(duplicateTitleSnippet, '');
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully removed duplicate topbar title from App.tsx!');
} else {
  console.log('Duplicate title snippet not found in App.tsx');
}
