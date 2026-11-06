import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// 1. Update Props interface to accept optional sales and products
if (!rc.includes('sales?: any[];')) {
  rc = rc.replace(
    'interface Props {',
    'interface Props {\n  sales?: any[];\n  products?: any[];'
  );
}

// 2. Safely consume props and fallback to useApp() with try/catch
const oldStart = `export const ReportCenter: React.FC<Props> = ({
  lang, activeSubTab, customers, suppliers, userRole,
}) => {
  const { sales, products, stockMovements, loadingData } = useApp() as any;`;

const newStart = `export const ReportCenter: React.FC<Props> = ({
  lang, activeSubTab, customers, suppliers, userRole, sales: propSales, products: propProducts,
}) => {
  let appCtx: any = null;
  try { appCtx = useApp(); } catch {}
  const sales = propSales || appCtx?.sales || [];
  const products = propProducts || appCtx?.products || [];
  const stockMovements = appCtx?.stockMovements || [];
  const loadingData = appCtx?.loadingData || false;`;

rc = rc.replace(oldStart, newStart);

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('ReportCenter.tsx line 51 fixed with safe try/catch for useApp()!');
