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
        if (line.includes('15D') || line.includes('Demo 15') || line.includes('Demo')) {
          console.log(`${fullPath} - Line ${idx + 1}: ${line.trim().substring(0, 120)}`);
        }
      });
    }
  }
}

searchInDir('src');
