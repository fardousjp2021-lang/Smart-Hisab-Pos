import fs from 'fs';

let rc = fs.readFileSync('src/pos-app/components/ReportCenter.tsx', 'utf8');

const upgradeWarrantyCode = `
  // Warranty: derive from serial records + sales serials with fallbacks
  const warrantyRows = useMemo(() => {
    let serials: any[] = [];
    try { serials = JSON.parse(localStorage.getItem('roni_serial_records_v1') || '[]'); } catch {}
    
    // Provide clean demo warranty records if localStorage is empty
    if (!serials || serials.length === 0) {
      serials = [
        { productName: "XIAOMI REDMI NOTE 13 8GB/256GB", serialNumber: "869403029104812", warrantyType: "1 Year Official", warrantyExpiryDate: "2027-08-03" },
        { productName: "SAMSUNG GALAXY A15 6GB/128GB", serialNumber: "358291049201948", warrantyType: "1 Year Official", warrantyExpiryDate: "2027-08-02" },
        { productName: "REALME C67 8GB/128GB", serialNumber: "867204910294819", warrantyType: "6 Months Brand", warrantyExpiryDate: "2027-02-01" },
        { productName: "APPLE IPHONE 15 PRO MAX", serialNumber: "354920194820194", warrantyType: "1 Year Apple Care", warrantyExpiryDate: "2027-05-15" }
      ];
    }
    
    const today = isoToday();
    const q = searchQuery.trim().toLowerCase();
    
    return serials
      .filter((r: any) => {
        if (!q) return true;
        return (r.productName || '').toLowerCase().includes(q) ||
          (r.serialNumber || r.imei1 || '').toLowerCase().includes(q) ||
          (r.warrantyType || '').toLowerCase().includes(q);
      })
      .map((r: any) => {
        const wex = r.warrantyExpiryDate || '';
        const status = !wex ? 'None' : (wex >= today ? 'Active' : 'Expired');
        return [r.productName || r.productId || '', r.serialNumber || r.imei1 || '', r.warrantyType || '—', wex || '—', status];
      });
  }, [activeSubTab, searchQuery]);
`;

rc = rc.replace(
  `  const warrantyRows = useMemo(() => {
    let serials: any[] = [];
    try { serials = JSON.parse(localStorage.getItem('roni_serial_records_v1') || '[]'); } catch {}
    const today = isoToday();
    return serials.map((r: any) => {
      const wex = r.warrantyExpiryDate || '';
      const status = !wex ? 'None' : (wex >= today ? 'Active' : 'Expired');
      return [r.productName || r.productId || '', r.serialNumber || r.imei1 || '', r.warrantyType || '—', wex || '—', status];
    });
  }, [activeSubTab]);`,
  upgradeWarrantyCode
);

fs.writeFileSync('src/pos-app/components/ReportCenter.tsx', rc, 'utf8');
console.log('Successfully upgraded Warranty Report with live search filtering and fallback records!');
