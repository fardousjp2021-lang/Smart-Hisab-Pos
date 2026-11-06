import fs from 'fs';

let ctx = fs.readFileSync('src/pos-app/context/AppContext.tsx', 'utf8');

console.log('--- AppContext.tsx Auth Logic ---');
const match = ctx.match(/demoLogin[\s\S]{1,600}/);
if (match) console.log(match[0]);
