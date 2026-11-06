import fs from 'fs';

// 1. Upgrade ReportCenter.tsx
let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// Default preset to 'all' instead of 'month'
rc = rc.replace("useState<'today' | 'week' | 'days15' | 'month' | 'custom'>('month')", "useState<'today' | 'week' | 'days15' | 'month' | 'all' | 'custom'>('all')");
rc = rc.replace("useState<'today' | 'week' | 'days15' | 'month' | 'custom'>('all')", "useState<'today' | 'week' | 'days15' | 'month' | 'all' | 'custom'>('all')");

// Add 'all' preset handling in useEffect
if (!rc.includes("preset === 'all'")) {
  rc = rc.replace(
    "else if (preset === 'month') { setStartDate(firstOfMonth()); setEndDate(iso(today)); }",
    "else if (preset === 'month') { setStartDate(firstOfMonth()); setEndDate(iso(today)); }\n    else if (preset === 'all') { setStartDate('2020-01-01'); setEndDate(iso(today)); }"
  );
}

// Update inRange function to handle 'all' preset and multi-field date extraction
rc = rc.replace(
  `const inRange = (d: string) => {
    if (!d) return false;
    const s = String(d).slice(0, 10);
    return s >= startDate && s <= endDate;
  };`,
  `const inRange = (d: any) => {
    if (preset === 'all') return true;
    if (!d) return true; // default to true if date missing so data isn't hidden
    const s = String(d).slice(0, 10);
    return s >= startDate && s <= endDate;
  };`
);

// Update preset buttons list to include 'all'
rc = rc.replace(
  "(['today', 'week', 'days15', 'month', 'custom'] as const)",
  "(['today', 'week', 'days15', 'month', 'all', 'custom'] as const)"
);

// Add 'all' button title in preset renderer
if (!rc.includes("p === 'all'")) {
  rc = rc.replace(
    "{p === 'month' && tt(lang, 'এই মাস', 'This Month')}",
    "{p === 'month' && tt(lang, 'এই মাস', 'This Month')}\n              {p === 'all' && tt(lang, 'সব সময়', 'All Time')}"
  );
}

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('ReportCenter.tsx updated with All Time preset!');

// 2. Upgrade App.tsx initialSales to include August 2026 sales records
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

if (!app.includes('SL580')) {
  const newSales = `const initialSales: Sale[] = [
  { id: "SL580", date: "2026-08-03", dueDate: "2026-08-03", productId: "IT020027", productName: "XIAOMI REDMI NOTE 13 8GB/256GB", unitPrice: 18500.00, quantity: 1, totalPrice: 18500.00, purchasePriceAtTime: 15500.00, customerName: "Jahidul Islam", phone: "01712345678", referenceNo: "POS-801", paidAmount: 18500.00, paymentStatus: "PAID", createdBy: "admin" },
  { id: "SL579", date: "2026-08-02", dueDate: "2026-08-02", productId: "IT020026", productName: "SAMSUNG GALAXY A15 6GB/128GB", unitPrice: 22000.00, quantity: 1, totalPrice: 22000.00, purchasePriceAtTime: 18000.00, customerName: "Farhana Yeasmin", phone: "01923456789", referenceNo: "POS-802", paidAmount: 20000.00, paymentStatus: "PARTIAL", due: 2000.00, createdBy: "admin" },
  { id: "SL578", date: "2026-08-01", dueDate: "2026-08-01", productId: "IT020025", productName: "REALME C67 8GB/128GB", unitPrice: 16500.00, quantity: 2, totalPrice: 33000.00, purchasePriceAtTime: 14000.00, customerName: "Mizanur Shuvo", phone: "01845678901", referenceNo: "POS-803", paidAmount: 33000.00, paymentStatus: "PAID", createdBy: "admin" },`;
  
  app = app.replace("const initialSales: Sale[] = [", newSales);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('App.tsx updated with August 2026 sales records!');
}
