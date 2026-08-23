const { execSync } = require('child_process');

try {
  console.log("Checking git...");
  execSync('git status', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Clean production login page without demo buttons"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log("SUCCESSFULLY PUSHED TO GITHUB!");
} catch (e) {
  console.error("Git execution failed:", e.message);
}
