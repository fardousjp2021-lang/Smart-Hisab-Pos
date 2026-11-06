import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// 1. Add import
if (!app.includes("import { CustomerSupportDesk }")) {
  app = app.replace(
    "import { SiteSettings } from './components/SiteSettings';",
    "import { SiteSettings } from './components/SiteSettings';\nimport { CustomerSupportDesk } from './components/CustomerSupportDesk';"
  );
}

// 2. Update sidebar settings item
const oldSidebarSubItem = `{ subId: 'helpdesk', nameBn: 'সহায়তা ডেস্ক (Helpdesk)', nameEn: 'Support Helpdesk', tab: 'helpdesk', icon: Wrench }`;
const newSidebarSubItem = `{ subId: 'support', nameBn: 'গ্রাহক সহায়তা ডেস্ক', nameEn: 'Customer Support Desk', tab: 'settings', icon: Headphones, action: function() { setSettingsActiveTab('support'); } }`;

if (app.includes(oldSidebarSubItem)) {
  app = app.replace(oldSidebarSubItem, newSidebarSubItem);
}

// 3. Update activeTab === 'settings' render block to support settingsActiveTab === 'support'
const oldRenderSnippet = `{settingsActiveTab === 'system' ? (
                  <SiteSettings`;

const newRenderSnippet = `{settingsActiveTab === 'system' ? (
                  <SiteSettings`;

const supportDeskBlock = `
                {settingsActiveTab === 'support' ? (
                  <CustomerSupportDesk
                    lang={lang}
                    showToast={showToast}
                    userName={sessionUser?.name}
                    shopName={shopName}
                  />
                ) : settingsActiveTab === 'system' ? (`;

if (app.includes("settingsActiveTab === 'system' ? (") && !app.includes("CustomerSupportDesk")) {
  app = app.replace(
    "{settingsActiveTab === 'system' ? (",
    supportDeskBlock
  );

  // Close ternary bracket
  app = app.replace(
    "showToast={showToast}\n                  />\n                )}",
    "showToast={showToast}\n                  />\n                )}\n                )}"
  );
}

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('Successfully integrated CustomerSupportDesk into App.tsx!');
