import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// Replace toggleTheme variable reference with inline function or defined const
if (app.includes("toggleTheme={toggleTheme || (() => {})}") || app.includes("toggleTheme={toggleTheme}")) {
  app = app.replace(
    "toggleTheme={toggleTheme || (() => {})}",
    "toggleTheme={function() {}}"
  );
  app = app.replace(
    "toggleTheme={toggleTheme}",
    "toggleTheme={function() {}}"
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully fixed toggleTheme ReferenceError in App.tsx!');
} else {
  console.log('toggleTheme snippet not found or already fixed');
}
