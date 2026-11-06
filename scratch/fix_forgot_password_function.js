import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

const fnCode = `  const handleForgotPassword = () => {
    const email = prompt("পাসওয়ার্ড রিসেট করতে আপনার নিবন্ধিত ইমেইল বসান:");
    if (email && email.trim()) {
      alert("📩 পাসওয়ার্ড রিসেট লিংক " + email.trim() + " ইমেইলে সফলভাবে পাঠানো হয়েছে! আপনার জিমেইল ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
    }
  };`;

if (!lp.includes('const handleForgotPassword =')) {
  lp = lp.replace(
    'const handleCopyEmail = (email: string) => {',
    fnCode + '\n\n  const handleCopyEmail = (email: string) => {'
  );
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully placed handleForgotPassword inside LandingPage component scope!');
} else {
  console.log('handleForgotPassword declaration already exists!');
}
