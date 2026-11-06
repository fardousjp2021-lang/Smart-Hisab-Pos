import fs from 'fs';

// 1. Update App.tsx props passed to ReportCenter
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

app = app.replace(
  `sales={sales as any}
                products={products as any}
                userRole={sessionUser?.role}`,
  `sales={sales as any}
                products={products as any}
                purchases={purchases as any}
                expenses={expenses as any}
                userRole={sessionUser?.role}`
);

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('App.tsx updated with purchases and expenses props for ReportCenter!');

// 2. Update ReportCenter.tsx Props & prop destructuring
let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

if (!rc.includes('purchases?: any[];')) {
  rc = rc.replace(
    'sales?: any[];\n  products?: any[];',
    'sales?: any[];\n  products?: any[];\n  purchases?: any[];\n  expenses?: any[];'
  );
}

rc = rc.replace(
  `sales: propSales, products: propProducts,`,
  `sales: propSales, products: propProducts, purchases: propPurchases, expenses: propExpenses,`
);

rc = rc.replace(
  `const {
    purchases,
    purchaseReturns,
    expenses,
    loading: ledgersLoading,
    error: ledgerError,
  } = useLiveLedgers(true);`,
  `const {
    purchases: livePurchases,
    purchaseReturns,
    expenses: liveExpenses,
    loading: ledgersLoading,
    error: ledgerError,
  } = useLiveLedgers(true);
  const purchases = (propPurchases && propPurchases.length > 0) ? propPurchases : (livePurchases || []);
  const expenses = (propExpenses && propExpenses.length > 0) ? propExpenses : (liveExpenses || []);`
);

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('ReportCenter.tsx updated with purchases and expenses prop fallbacks!');
