import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

// Update hotline strip in happyClients map
const oldHotlineStrip = `<div className="bg-[#cc2222] text-white p-2.5 text-center text-[10px] font-bold tracking-wider leading-none">
                হটলাইনঃ 01747-046052 (Fardous Al-Amin)
              </div>`;

const newHotlineStrip = `<div className="bg-[#cc2222] text-white p-2 text-center text-[9.5px] font-bold tracking-wider leading-tight">
                হটলাইনঃ {client.phone || (
                  index === 0 ? "01747-046052 (Fardous Al-Amin)" :
                  index === 1 ? "01819-382910 (করিম মিঞা)" :
                  index === 2 ? "01928-472019 (সাকিব আহমেদ)" :
                  index === 3 ? "01633-918273 (ডাঃ রফিকুল)" :
                  "01552-849201 (তানভীর হোসেন)"
                )}
              </div>`;

if (lp.includes(oldHotlineStrip)) {
  lp = lp.replace(oldHotlineStrip, newHotlineStrip);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully updated hotline strip with unique Bangladeshi phone numbers!');
} else {
  console.log('Old hotline strip not found in LandingPage.tsx');
}
