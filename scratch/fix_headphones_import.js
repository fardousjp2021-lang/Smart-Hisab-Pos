import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

if (!app.includes('Headphones')) {
  app = app.replace(
    '  LineChart,',
    '  LineChart,\n  Headphones,'
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully added Headphones to lucide-react imports in App.tsx!');
} else {
  // If Headphones is used but not in imports list at top
  const importBlock = app.slice(0, 1000);
  if (!importBlock.includes('Headphones')) {
    app = app.replace(
      '  LineChart,',
      '  LineChart,\n  Headphones,'
    );
    fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
    console.log('Successfully added Headphones to lucide-react imports in App.tsx!');
  } else {
    console.log('Headphones already imported in App.tsx!');
  }
}
