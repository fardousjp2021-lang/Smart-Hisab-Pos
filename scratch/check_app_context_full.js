import fs from 'fs';

let ctx = fs.readFileSync('src/pos-app/context/AppContext.tsx', 'utf8');

const loginFuncs = ctx.match(/(const demoLogin =[\s\S]{1,600}|const loginWithEmail =[\s\S]{1,600})/g);
if (loginFuncs) {
  console.log(loginFuncs.join('\n================\n'));
} else {
  console.log('Searching for login implementations...');
  const lines = ctx.split('\n').filter(l => l.includes('Login') || l.includes('admin') || l.includes('Super'));
  console.log(lines.slice(0, 20).join('\n'));
}
