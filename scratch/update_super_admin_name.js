import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Fardous Roni')) {
        content = content.replace(/Fardous Roni/g, 'Fardous Alamin');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

replaceInDir('src');
console.log('Finished updating Super Admin name to Fardous Alamin!');
