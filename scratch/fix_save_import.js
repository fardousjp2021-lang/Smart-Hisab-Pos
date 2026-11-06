import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

if (!app.slice(0, 1000).includes('Save,')) {
  app = app.replace(
    '  Sparkles,',
    '  Sparkles,\n  Save,'
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully added Save to lucide-react imports in App.tsx!');
} else {
  console.log('Save already imported in App.tsx');
}
