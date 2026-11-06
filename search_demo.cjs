const fs = require('fs');
const path = require('path');

function searchDir(dir, term) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, term);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(term)) {
        console.log(`FOUND '${term}' IN: ${fullPath}`);
      }
    }
  }
}

searchDir(path.join(__dirname, 'src', 'pos-app'), 'SummaryCard');
searchDir(path.join(__dirname, 'src', 'pos-app'), 'summaryCard');
