import fs from 'fs';

let code = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

if (!code.includes('const Icon = meta.icon')) {
  code = code.replace(
    "const meta = SUB_META[subId] || SUB_META.rep_sales;",
    "const meta = SUB_META[subId] || SUB_META.rep_sales;\n  const Icon = meta.icon;"
  );
  fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', code, 'utf8');
  console.log('Added const Icon = meta.icon successfully!');
} else {
  console.log('const Icon = meta.icon already present!');
}
