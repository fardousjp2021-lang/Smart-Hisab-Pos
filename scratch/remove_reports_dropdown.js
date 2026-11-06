import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldReportsConfig = `{
                  id: 'reports',
                  titleBn: "রিপোর্ট সেন্টার",
                  titleEn: "Report Center",
                  icon: BarChart3,
                  isStandalone: false,
                   items: [
                    { subId: 'rep_sales',     nameBn: 'বিক্রয়',        nameEn: 'Sales',        tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_purchase',  nameBn: 'ক্রয়',          nameEn: 'Purchase',     tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_inventory', nameBn: 'ইনভেন্টরি',     nameEn: 'Inventory',    tab: 'reports', icon: BarChart3 },
                    { subId: 'rep_financial', nameBn: 'ফাইন্যান্স',    nameEn: 'Finance',      tab: 'reports', icon: FileText },
                    { subId: 'rep_warranty',  nameBn: 'ওয়ারেন্টি',     nameEn: 'Warranty',     tab: 'reports', icon: FileText },
                    { subId: 'rep_analytics', nameBn: 'অ্যানালিটিক্স',  nameEn: 'Analytics',    tab: 'reports', icon: LineChart },
                    { subId: 'print_doc',     nameBn: 'এক্সপোর্ট ও প্রিন্ট', nameEn: 'Export & Print', tab: 'reports', icon: FileSpreadsheet }
                  ]
                }`;

const newReportsConfig = `{
                  id: 'reports',
                  titleBn: "রিপোর্ট সেন্টার",
                  titleEn: "Report Center",
                  icon: BarChart3,
                  isStandalone: true,
                  tab: 'reports'
                }`;

if (app.includes("id: 'reports'")) {
  app = app.replace(oldReportsConfig, newReportsConfig);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully converted Report Center into a direct standalone sidebar item and deleted all sub-pages from dropdown!');
} else {
  console.log('Could not find id: reports in App.tsx');
}
