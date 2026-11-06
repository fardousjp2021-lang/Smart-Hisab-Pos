import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const lines = app.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('handleLogoUpload') || line.includes('স্টোর লোগো')) {
    console.log(`Line ${idx + 1}: ${line.substring(0, 100)}`);
  }
});
