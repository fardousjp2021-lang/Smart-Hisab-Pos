import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const matchAdmin = app.match(/showAdminPanel[\s\S]{1,500}/);
if (matchAdmin) console.log(matchAdmin[0]);

const matchPrompt = app.match(/সুপার এডমিন কন্ট্রোল প্রম্পট সেন্টার[\s\S]{1,500}/);
if (matchPrompt) console.log(matchPrompt[0]);
