import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Add import
if (!app.includes("import { StoreSettings }")) {
  app = app.replace(
    "import SyncStatusPanel from './components/SyncStatusPanel';",
    "import SyncStatusPanel from './components/SyncStatusPanel';\nimport { StoreSettings } from './components/StoreSettings';"
  );
}

// 2. Add render block for activeTab === 'settings'
const settingsRenderBlock = `
            {activeTab === 'settings' && (
              <ComponentErrorBoundary>
                <StoreSettings
                  lang={lang}
                  shopName={shopName}
                  setShopName={setShopName}
                  shopAddress={shopAddress}
                  setShopAddress={setShopAddress}
                  shopPhone={shopPhone}
                  setShopPhone={setShopPhone}
                  storeCode={storeCode}
                  setStoreCode={setStoreCode}
                  storeEmail={storeEmail}
                  setStoreEmail={setStoreEmail}
                  gstNumber={gstNumber}
                  setGstNumber={setGstNumber}
                  taxNumber={taxNumber}
                  setTaxNumber={setTaxNumber}
                  storeWebsite={storeWebsite}
                  setStoreWebsite={setStoreWebsite}
                  bankDetails={bankDetails}
                  setBankDetails={setBankDetails}
                  storeCountry={storeCountry}
                  setStoreCountry={setStoreCountry}
                  storeCity={storeCity}
                  setStoreCity={setStoreCity}
                  logoPreview={logoPreview}
                  setLogoPreview={setLogoPreview}
                  showToast={showToast}
                />
              </ComponentErrorBoundary>
            )}
`;

if (!app.includes("<StoreSettings")) {
  app = app.replace(
    "{activeTab === 'reports' && (",
    settingsRenderBlock + "\n            {activeTab === 'reports' && ("
  );
}

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('Successfully integrated StoreSettings into App.tsx!');
