import fs from 'fs';

// 1. Update App.tsx to pass sales and products to ReportCenter
let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

app = app.replace(
  `<ReportCenter
                lang={lang}
                activeSubTab={activeSubTab || 'rep_sales'}
                customers={customers as any}
                suppliers={suppliers as any}

                userRole={sessionUser?.role}
              />`,
  `<ReportCenter
                lang={lang}
                activeSubTab={activeSubTab || 'rep_sales'}
                customers={customers as any}
                suppliers={suppliers as any}
                sales={sales as any}
                products={products as any}
                userRole={sessionUser?.role}
              />`
);

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('App.tsx updated with sales and products props for ReportCenter!');

// 2. Update ReportCenter.tsx props interface and context consumption
let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

// Update Props interface
rc = rc.replace(
  `interface Props {
  lang: Lang;
  activeSubTab: string;
  customers: any[];
  suppliers: any[];
  userRole?: string;
}`,
  `interface Props {
  lang: Lang;
  activeSubTab: string;
  customers: any[];
  suppliers: any[];
  userRole?: string;
  sales?: any[];
  products?: any[];
}`
);

// Update destructuring & safe context fallback
rc = rc.replace(
  `export const ReportCenter: React.FC<Props> = ({
  lang, activeSubTab, customers, suppliers, userRole,
}) => {
  const { sales, products, stockMovements, loadingData } = useApp() as any;`,
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
console.log('ReportCenter.tsx updated with bulletproof prop & context fallbacks!');
