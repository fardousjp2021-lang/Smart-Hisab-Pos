import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldReportsConfig = `{
                  id: 'reports',
                  titleBn: "রিপোর্ট সেন্টার",
                  titleEn: "Report Center",
                  icon: BarChart3,
                  isStandalone: true,
                  tab: 'reports'
                }`;

const newReportsConfig = `{
                  id: 'reports',
                  titleBn: "রিপোর্ট সেন্টার",
                  titleEn: "Report Center",
                  icon: BarChart3,
                  isStandalone: false,
                  items: [
                    { subId: 'rep_sales', nameBn: 'বিক্রয়', nameEn: 'Sales', tab: 'reports', icon: TrendingUp }
                  ]
                }`;

if (app.includes("id: 'reports'")) {
  app = app.replace(oldReportsConfig, newReportsConfig);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully added Sales (বিক্রয়) sub-page inside Report Center dropdown menu!');
} else {
  console.log('Could not find id: reports in App.tsx');
}
