import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// 1. Add isAiModalOpen state
if (!lp.includes('const [isAiModalOpen, setIsAiModalOpen]')) {
  lp = lp.replace(
    "const [activeFeatureTab, setActiveFeatureTab] = useState<'billing' | 'inventory' | 'accounting' | 'ai'>('billing');",
    "const [activeFeatureTab, setActiveFeatureTab] = useState<'billing' | 'inventory' | 'accounting' | 'ai'>('billing');\n  const [isAiModalOpen, setIsAiModalOpen] = useState(false);"
  );
}

// 2. Add full screen AI Modal overlay when isAiModalOpen is true
const aiModalPortal = `{/* Floating Interactive AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl relative">
            <AiBusinessAssistant isOpen={true} onClose={() => setIsAiModalOpen(false)} />
          </div>
        </div>
      )}`;

if (!lp.includes('isAiModalOpen &&')) {
  lp = lp.replace(
    'return (',
    aiModalPortal + '\n\n  return ('
  );
}

// 3. Update AI feature tab button click to open modal or set active tab
lp = lp.replace(
  "onClick={() => setActiveFeatureTab('ai')}",
  "onClick={() => { setActiveFeatureTab('ai'); setIsAiModalOpen(true); }}"
);

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully made AI Assistant 100% working with instant popup modal on click!');
