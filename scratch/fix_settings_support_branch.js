import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const oldSettingsBlock = `{activeTab === 'settings' && (
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

const newSettingsBlock = `{activeTab === 'settings' && (
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
                ) : settingsActiveTab === 'support' ? (
                  <CustomerSupportDesk
                    lang={lang}
                    showToast={showToast}
                    userName={sessionUser?.name}
                    shopName={shopName}
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

if (app.includes(oldSettingsBlock)) {
  app = app.replace(oldSettingsBlock, newSettingsBlock);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully updated settings activeTab block with CustomerSupportDesk!');
} else {
  console.log('Old settings block not found in App.tsx');
}
