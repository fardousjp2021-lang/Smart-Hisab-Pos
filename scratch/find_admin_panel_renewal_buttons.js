import fs from 'fs';

let ap = fs.readFileSync('src/pos-app/components/AdminPanel.tsx', 'utf8');

const lines = ap.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Demo 15D') || line.includes('+1 Month') || line.includes('+1 Year')) {
    console.log(`Line ${idx + 1}: ${line.trim().substring(0, 120)}`);
  }
});
