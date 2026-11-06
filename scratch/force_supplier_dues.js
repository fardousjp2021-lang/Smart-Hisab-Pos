import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const supplierDuesCode = `

  // Supplier-wise dues (live purchases within range)
  const supplierDues = useMemo(() => {
    const map = new Map<string, { supplier: string; total: number; paid: number; due: number }>();
    for (const p of (filteredPurchases || [])) {
      const key = p.supplier || p.supplierName || 'Unknown Supplier';
      const tot = Number(p.total || p.totalAmount || 0);
      const paidAmt = Number(p.paid || p.paidAmount || 0);
      const dueAmt = Number(p.due || p.dueAmount || Math.max(0, tot - paidAmt));
      const row = map.get(key) || { supplier: key, total: 0, paid: 0, due: 0 };
      row.total += tot;
      row.paid += paidAmt;
      row.due += dueAmt;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => b.due - a.due);
  }, [filteredPurchases]);
`;

if (!rc.includes('const supplierDues = useMemo')) {
  rc = rc.replace(
    'const inventoryTotals = useMemo',
    supplierDuesCode + '\n  const inventoryTotals = useMemo'
  );
  fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
  console.log('Force inserted supplierDues right before inventoryTotals!');
}
