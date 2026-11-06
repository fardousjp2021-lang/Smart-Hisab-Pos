import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const lines = app.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('লোগো আপলোড করুন') || line.includes('মেমো ও রসিদে প্রদর্শিত')) {
    console.log(`Line ${idx + 1}: ${line.substring(0, 120)}`);
  }
});
