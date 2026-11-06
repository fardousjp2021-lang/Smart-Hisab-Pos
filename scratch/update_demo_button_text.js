import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// Replace button texts
lp = lp.replace(
  '<span>Free Lifetime (আজীবন ফ্রি ব্যবহার করুন)</span>',
  '<span>ডেমো ব্যবহার করুন</span>'
);

lp = lp.replace(
  '<span>আজীবন ফ্রি ব্যবহার করুন</span>',
  '<span>ডেমো ব্যবহার করুন</span>'
);

lp = lp.replace(
  '⚡ আজীবন ফ্রি ট্রায়াল',
  '⚡ ফ্রি ডেমো ট্রায়াল'
);

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully updated button text to "ডেমো ব্যবহার করুন"!');
