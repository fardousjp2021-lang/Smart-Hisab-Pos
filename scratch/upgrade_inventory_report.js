import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// 1. Add filteredProducts memoization with searchQuery filter
const filteredProductsMemo = `
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (products || []).filter((p: any) => {
      if (!q) return true;
      return (p?.id || '').toLowerCase().includes(q) ||
        (p?.name || p?.title || '').toLowerCase().includes(q) ||
        (p?.sku || p?.code || '').toLowerCase().includes(q) ||
        (p?.category || '').toLowerCase().includes(q);
    });
  }, [products, searchQuery]);
`;

if (!rc.includes('const filteredProducts = useMemo')) {
  rc = rc.replace(
    'const inventoryTotals = useMemo(() => {',
    filteredProductsMemo + '\n  const inventoryTotals = useMemo(() => {'
  );
}

// 2. Update inventoryTotals calculation to use (products || []) for total overview or filteredProducts
rc = rc.replace(
  'const inventoryRows = (products || []).map((p: any) => {',
  'const inventoryRows = (filteredProducts || []).map((p: any) => {'
);

// 3. Update empty condition for rep_inventory
rc = rc.replace(
  "if (subId === 'rep_inventory') return { title: meta[lang], headers: inventoryHeaders, rows: inventoryRows, empty: (products || []).length === 0 };",
  "if (subId === 'rep_inventory') return { title: meta[lang], headers: inventoryHeaders, rows: inventoryRows, empty: (filteredProducts || []).length === 0 };"
);

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('Successfully upgraded Inventory Report with live search filtering and responsive rows!');
