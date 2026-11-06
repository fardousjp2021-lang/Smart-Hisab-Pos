import fs from 'fs';

let code = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// 1. Add supplierDues calculation right after customerDues
const supplierDuesCode = `
  // Supplier-wise dues (live purchases within range)
  const supplierDues = useMemo(() => {
    const map = new Map<string, { supplier: string; total: number; paid: number; due: number }>();
    for (const p of filteredPurchases) {
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

if (!code.includes('const supplierDues = useMemo')) {
  code = code.replace(
    'return Array.from(map.values()).sort((a, b) => b.due - a.due);\n  }, [filteredSales]);',
    'return Array.from(map.values()).sort((a, b) => b.due - a.due);\n  }, [filteredSales]);\n' + supplierDuesCode
  );
  console.log('Added supplierDues calculation successfully!');
}

// 2. Add useEffect to reset viewLedgerMode to 'main' whenever activeSubTab changes
if (!code.includes('setViewLedgerMode(\'main\')')) {
  code = code.replace(
    'const [viewLedgerMode, setViewLedgerMode] = useState<\'main\' | \'customer_dues\' | \'supplier_dues\'>(\'main\');',
    'const [viewLedgerMode, setViewLedgerMode] = useState<\'main\' | \'customer_dues\' | \'supplier_dues\'>(\'main\');\n\n  useEffect(() => {\n    setViewLedgerMode(\'main\');\n  }, [activeSubTab]);'
  );
  console.log('Added activeSubTab reset for viewLedgerMode successfully!');
}

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', code, 'utf8');
console.log('All audit fixes applied successfully!');
