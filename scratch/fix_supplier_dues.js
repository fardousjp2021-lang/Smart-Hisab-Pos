import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const supplierDuesMemo = `
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
    'return Array.from(map.values()).sort((a, b) => b.due - a.due);\n  }, [filteredSales]);',
    'return Array.from(map.values()).sort((a, b) => b.due - a.due);\n  }, [filteredSales]);\n' + supplierDuesMemo
  );
  fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
  console.log('Successfully inserted supplierDues definition into ReportCenter.tsx!');
} else {
  console.log('supplierDues is already defined!');
}
