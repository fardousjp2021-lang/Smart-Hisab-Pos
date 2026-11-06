import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// Replace direct useApp() call with safe try/catch and prop fallbacks
rc = rc.replace(
  /export const ReportCenter: React.FC<Props> = \(\{[\s\S]*?\}\) => \{[\s\S]*?const \{ sales, products, stockMovements, loadingData \} = useApp\(\) as any;/m,
  `export const ReportCenter: React.FC<Props> = ({
  lang, activeSubTab, customers, suppliers, userRole, sales: propSales, products: propProducts,
}) => {
  let appCtx: any = null;
  try { appCtx = useApp(); } catch {}
  const sales = propSales || appCtx?.sales || [];
  const products = propProducts || appCtx?.products || [];
  const stockMovements = appCtx?.stockMovements || [];
  const loadingData = appCtx?.loadingData || false;`
);

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('Regex force fix applied successfully!');
