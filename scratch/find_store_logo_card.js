import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const lines = app.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('স্টোর লোগো') || line.includes('Store Logo')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
