import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

if (!app.slice(0, 1000).includes('Sparkles')) {
  app = app.replace(
    '  Headphones,',
    '  Headphones,\n  Sparkles,'
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully added Sparkles to lucide-react imports in App.tsx!');
} else {
  console.log('Sparkles already imported in App.tsx');
}
