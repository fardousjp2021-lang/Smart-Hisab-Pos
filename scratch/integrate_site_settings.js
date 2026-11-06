import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Add import
if (!app.includes("import { SiteSettings }")) {
  app = app.replace(
    "import { StoreSettings } from './components/StoreSettings';",
    "import { StoreSettings } from './components/StoreSettings';\nimport { SiteSettings } from './components/SiteSettings';"
  );
}

// 2. Exact match for render block
const oldRenderSnippet = `{activeTab === 'settings' && (
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
                  storeFontSize={storeFontSize}
                  setStoreFontSize={setStoreFontSize}
                  setLogoPreview={setLogoPreview}
                  showToast={showToast}
                />
              </ComponentErrorBoundary>
            )}`;

const newRenderSnippet = `{activeTab === 'settings' && (
              <ComponentErrorBoundary>
                {settingsActiveTab === 'system' ? (
                  <SiteSettings
                    lang={lang}
                    sysTimezone={sysTimezone}
                    setSysTimezone={setSysTimezone}
                    sysDateFormat={sysDateFormat}
                    setSysDateFormat={setSysDateFormat}
                    sysTimeFormat={sysTimeFormat}
                    setSysTimeFormat={setSysTimeFormat}
                    sysCurrency={sysCurrency}
                    setSysCurrency={setSysCurrency}
                    sysCurrencyPlacement={sysCurrencyPlacement}
                    setSysCurrencyPlacement={setSysCurrencyPlacement}
                    sysDecimals={sysDecimals}
                    setSysDecimals={setSysDecimals}
                    sysDecimalsQty={sysDecimalsQty}
                    setSysDecimalsQty={setSysDecimalsQty}
                    sysLanguage={sysLanguage}
                    setSysLanguage={setSysLanguage}
                    sysEnableRoundOff={sysEnableRoundOff}
                    setSysEnableRoundOff={setSysEnableRoundOff}
                    showToast={showToast}
                  />
                ) : (
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
                    storeFontSize={storeFontSize}
                    setStoreFontSize={setStoreFontSize}
                    setLogoPreview={setLogoPreview}
                    showToast={showToast}
                  />
                )}
              </ComponentErrorBoundary>
            )}`;

if (app.includes(oldRenderSnippet)) {
  app = app.replace(oldRenderSnippet, newRenderSnippet);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully integrated SiteSettings into App.tsx!');
} else {
  console.log('Old render snippet not found in App.tsx');
}
