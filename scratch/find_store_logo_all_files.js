import fs from 'fs';
import path from 'path';

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchInDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('Store Logo') || line.includes('স্টোর লোগো') || line.includes('লোগো আপলোড')) {
          console.log(`${fullPath} - Line ${idx + 1}: ${line.trim().substring(0, 100)}`);
        }
      });
    }
  }
}

searchInDir('src');
