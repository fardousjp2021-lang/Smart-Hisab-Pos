import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

console.log('--- LandingPage Demo Login ---');
const match = lp.match(/demoLogin[\s\S]{1,400}/);
if (match) console.log(match[0]);

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');
console.log('--- App Login References ---');
const matchesApp = app.match(/adminEmail|superAdmin|login/gi);
console.log(`Found ${matchesApp ? matchesApp.length : 0} references in App.tsx`);
