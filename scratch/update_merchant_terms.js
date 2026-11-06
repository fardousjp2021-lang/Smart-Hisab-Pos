import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

lp = lp.replace(/মার্চেন্ট লগইন/g, 'ব্যবসায়ী সাইন-ইন');
lp = lp.replace(/নতুন মার্চেন্ট রেজিস্ট্রেশন/g, 'নতুন দোকানদার রেজিস্ট্রেশন');
lp = lp.replace(/মার্চেন্টের নাম/g, 'স্বত্বাধিকারীর নাম');
lp = lp.replace(/মার্চেন্ট ড্যাশবোর্ড/g, 'দোকানদার ড্যাশবোর্ড');

fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
console.log('Successfully updated merchant terms to modern, customer-friendly Bengali terms!');
