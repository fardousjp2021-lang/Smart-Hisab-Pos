import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

const superAdminBrandCardJsx = `
                {/* Super Admin White-Label Platform Branding Settings Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">
                        {lang === 'bn' ? 'ওয়েবসাইট ও প্ল্যাটফর্ম ব্রান্ডিং সেটিংস (Platform Branding)' : 'Platform Branding Settings'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === 'bn' ? 'সবার ওপরের বারে প্রদর্শিত প্ল্যাটফর্ম নাম ও গোল্ডেন ব্যাজ এডিটর' : 'Edit topbar platform name and golden badge text'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'প্ল্যাটফর্ম নাম (Platform Name)' : 'Platform Name'}
                      </label>
                      <input
                        type="text"
                        value={editingPlatformBrandName}
                        onChange={(e) => setEditingPlatformBrandName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                        placeholder="Nexus"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'গোল্ডেন ব্যাজ টেক্সট (Golden Badge Text)' : 'Golden Badge Text'}
                      </label>
                      <input
                        type="text"
                        value={editingPlatformBrandBadge}
                        onChange={(e) => setEditingPlatformBrandBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                        placeholder="ERP"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPlatformBrandName(editingPlatformBrandName);
                      setPlatformBrandBadge(editingPlatformBrandBadge);
                      localStorage.setItem('saim_platform_brand_name', editingPlatformBrandName);
                      localStorage.setItem('saim_platform_brand_badge', editingPlatformBrandBadge);
                      showToast(
                        lang === 'bn' ? 'প্ল্যাটফর্ম ব্র্যান্ডিং সফলভাবে আপডেট করা হয়েছে!' : 'Platform branding updated successfully!',
                        'success'
                      );
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ব্র্যান্ড সেটিংস সেভ করুন' : 'Save Platform Brand'}</span>
                  </button>
                </div>
`;

if (!app.includes('Super Admin White-Label Platform Branding Settings Card')) {
  app = app.replace(
    '<div className="grid grid-cols-1 md:grid-cols-3 gap-6">',
    superAdminBrandCardJsx + '\n\n                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">'
  );
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully inserted Super Admin Platform Branding Control Card into App.tsx!');
} else {
  console.log('Brand Settings Card already present!');
}
