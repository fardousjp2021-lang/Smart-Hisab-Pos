import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

if (!lp.includes("import { AiBusinessAssistant }")) {
  lp = lp.replace(
    "import { \n  Sparkles,",
    "import { AiBusinessAssistant } from './AiBusinessAssistant';\nimport { \n  Sparkles,"
  );
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully added AiBusinessAssistant import to LandingPage.tsx!');
} else {
  console.log('AiBusinessAssistant import already exists in LandingPage.tsx');
}
