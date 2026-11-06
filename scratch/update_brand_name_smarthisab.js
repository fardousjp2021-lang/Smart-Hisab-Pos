import fs from 'fs';

// 1. Update App.tsx default brand state
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

app = app.replace(
  "return localStorage.getItem('saim_platform_brand_name') || 'Nexus';",
  "return localStorage.getItem('saim_platform_brand_name') || 'SmartHisab';"
);
app = app.replace(
  "return localStorage.getItem('saim_platform_brand_badge') || 'ERP';",
  "return localStorage.getItem('saim_platform_brand_badge') || 'POS';"
);

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');

// 2. Update LandingPage.tsx text references to SmartHisab
let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

lp = lp.replace(/ফেরদৌস পস সফটওয়্যার/g, 'স্মার্ট হিসাব পস সফটওয়্যার (SmartHisab)');
lp = lp.replace(/Fardous IT POS-2/g, 'SmartHisab POS');
lp = lp.replace(/FARDOUS IT POS/g, 'SmartHisab POS');
lp = lp.replace(/ফেরদৌস POS/g, 'SmartHisab POS');

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');

console.log('Successfully updated brand name across system to SmartHisab!');
