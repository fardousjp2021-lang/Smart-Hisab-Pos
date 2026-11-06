import fs from 'fs';

let text = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const map = {
  'Total Revenue': 'মোট বিক্রয় (Total Revenue)',
  'invoices total': 'টি ইনভয়েস সম্পাদন',
  'Total Profit': 'মোট আনুমানিক লাভ (Profit)',
  'Net profit after COGS': 'ক্রয় মূল্য বাদ দিয়ে নিট লাভ',
  'Items Sold': 'বিক্রিত মোট আইটেম (Items Sold)',
  'Total quantity sold': 'মোট পরিমাপ সংখ্যা',
  'Customer Due': 'কাস্টমার বকেয়া (Customer Due)',
  'Uncollected due amount': 'সংগৃহীত না হওয়া বকেয়া',
  'Total Purchase': 'মোট ক্রয় (Total Purchase)',
  'purchase POs': 'টি ক্রয় চালান',
  'Paid Amount': 'পরিশোধিত অর্থ (Paid Amount)',
  'Paid in cash/bank': 'নগদ/ব্যাংকে পরিশোধিত',
  'Supplier Due': 'সাপ্লায়ার বাকি (Supplier Due)',
  'Remaining payable': 'মহাজনদের কাছে বাকি',
  'Purchased Qty': 'ক্রয়কৃত মোট আইটেম (Purchased Qty)',
  'Total quantity received': 'সংগৃহীত মালামালের সংখ্যা',
  'Total Product Types': 'মোট প্রোডাক্ট টাইপ',
  'Unique products in catalog': 'নিবন্ধিত অনন্য পণ্য',
  'Stock Valuation': 'স্টকের মোট মূল্য (Stock Value)',
  'Low Stock Alert': 'কম স্টক অ্যালার্ট (Low Stock)',
  'Items below minimum stock': 'সীমার চেয়ে কম মালামাল',
  'Out of Stock': 'স্টক আউট (Out of Stock)',
  'Products currently out of stock': 'শূন্য স্টকের পণ্য',
  'Total Sales Revenue': 'মোট বিক্রয় আয় (Revenue)',
  'Gross sales proceeds': 'বিক্রি থেকে মোট প্রাপ্তি',
  'Gross Profit': 'গ্রস প্রফিট (Gross Profit)',
  'Revenue minus COGS': 'বিক্রি মাইনাস মালের কেনা দাম',
  'Total Expenses': 'দোকানের খরচ (Total Expenses)',
  'Operating expense sum': 'পরিচালন ও বিবিধ খরচ',
  'Net Profit': 'প্রকৃত নিট লাভ (Net Profit)',
  'Final bottom-line net profit': 'সব খরচ বাদ দিয়ে চূড়ান্ত লাভ',
  'Total Registered Serials': 'নিবন্ধিত সিরিয়াল / IMEI',
  'Total tracked units': 'ট্র্যাককৃত পণ্যের মোট রেকর্ড',
  'Active Warranty': 'সক্রিয় ওয়ারেন্টি (Active Warranty)',
  'Under valid coverage': 'মেয়াদ এখনো বহাল আছে',
  'Expired Warranty': 'মেয়াদোত্তীর্ণ (Expired Warranty)',
  'Coverage period elapsed': 'ওয়ারেন্টির মেয়াদ শেষ হয়েছে',
  'Today': 'আজ',
  'This Week': 'এই সপ্তাহ',
  '15 Days': '১৫ দিন',
  'This Month': 'এই মাস',
  'Custom': 'কাস্টম',
  'Print': 'প্রিন্ট',
  'Main Report': 'মূল রিপোর্ট',
  'Customer Due Ledger': 'কাস্টমার বকেয়া খাতা',
  'Supplier Due Ledger': 'সাপ্লায়ার বাকি খাতা',
  'Period': 'সময়সীমা',
  'Online': 'অনলাইন',
  'Offline - cached data': 'অফলাইন — ক্যাশ ডেটা',
  'rows': 'টি রেকর্ড',
  'total': 'মোট'
};

text = text.replace(/tt\(lang,\s*'[^']*?',\s*('[^']*?')\)/g, (match, en) => {
  const key = en.slice(1, -1);
  const bn = map[key];
  if (bn) {
    return `tt(lang, '${bn}', ${en})`;
  }
  return match;
});

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', text, 'utf8');
console.log('Restored all Bengali strings cleanly!');
