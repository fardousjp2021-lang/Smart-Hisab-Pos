import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Fix settings menu items actions
const oldSubItems = `{ subId: 'store', nameBn: 'Store', nameEn: 'Store', tab: 'settings', icon: Briefcase, action: function() { setSettingsActiveTab('store'); } },
                    { subId: 'system', nameBn: 'Site Settings', nameEn: 'Site Settings', tab: 'settings', icon: Shield, action: function() { setSettingsActiveTab('system'); } },
                    { subId: 'support', nameBn: 'গ্রাহক সহায়তা ডেস্ক', nameEn: 'Customer Support Desk', tab: 'settings', icon: Headphones, action: function() { setSettingsActiveTab('support'); } }`;

const newSubItems = `{ subId: 'store', nameBn: 'স্টোর (Store)', nameEn: 'Store Settings', tab: 'settings', icon: Briefcase, action: function() { setSettingsActiveTab('store'); setActiveSubTab('store'); } },
                    { subId: 'system', nameBn: 'সাইট সেটিং (Site Settings)', nameEn: 'Site Settings', tab: 'settings', icon: Shield, action: function() { setSettingsActiveTab('system'); setActiveSubTab('system'); } },
                    { subId: 'support', nameBn: 'গ্রাহক সহায়তা ডেস্ক', nameEn: 'Customer Support Desk', tab: 'settings', icon: Headphones, action: function() { setSettingsActiveTab('support'); setActiveSubTab('support'); } }`;

if (app.includes(oldSubItems)) {
  app = app.replace(oldSubItems, newSubItems);
}

// 2. Fix activeTab === 'settings' render block to check both activeSubTab and settingsActiveTab
const oldSettingsRenderBlock = `{activeTab === 'settings' && (
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
                  <StoreSettings`;

const newSettingsRenderBlock = `{(activeTab === 'settings' || activeTab === 'helpdesk') && (
              <ComponentErrorBoundary>
                {(activeSubTab === 'system' || settingsActiveTab === 'system') ? (
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
                ) : (activeSubTab === 'support' || activeSubTab === 'helpdesk' || settingsActiveTab === 'support' || activeTab === 'helpdesk') ? (
                  <CustomerSupportDesk
                    lang={lang}
                    showToast={showToast}
                    userName={sessionUser?.name}
                    shopName={shopName}
                  />
                ) : (
                  <StoreSettings`;

if (app.includes(oldSettingsRenderBlock)) {
  app = app.replace(oldSettingsRenderBlock, newSettingsRenderBlock);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully fixed settings routing and blank screen issue in App.tsx!');
} else {
  console.log('Could not find old settings render block in App.tsx');
}
