import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Trash2, Edit3, ShoppingCart, BarChart3, Search, X } from 'lucide-react';

const STORAGE_KEY = 'roni_combo_products_v1';
const USAGE_KEY = 'roni_combo_usage_v1';

export interface ComboItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // snapshot of selling price at time of combo creation
}

export interface Combo {
  id: string;
  name: string;
  description?: string;
  items: ComboItem[];
  bundlePrice: number;
  createdAt: string;
  updatedAt: string;
}

interface ComboUsage {
  comboId: string;
  count: number;
  totalRevenue: number;
  lastUsed?: string;
}

const DEFAULT_COMBOS: Combo[] = [
  {
    id: "combo_telecom_01",
    name: "স্মার্টফোন গিগা প্যাক (Xiaomi Note 13 + Charger + Glass)",
    description: "Xiaomi Redmi Note 13 এর সাথে ১৮W ফাস্ট চার্জার এবং ৯D কার্ভড গ্লাস প্রটেক্টর কম্বো অফার",
    items: [
      { productId: "p1", productName: "Xiaomi Redmi Note 13 8GB/128GB", quantity: 1, unitPrice: 19500 },
      { productId: "p2", productName: "18W Extreme Quick Charger", quantity: 1, unitPrice: 1200 },
      { productId: "p3", productName: "9D Curved Tempered Glass", quantity: 1, unitPrice: 400 }
    ],
    bundlePrice: 19000,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "combo_telecom_02",
    name: "অডিও ও ক্যাবল সুপার কম্বো (TWS Earbuds + Type-C Cable)",
    description: "Soundcore TWS ইয়ারবাডস এবং টাইপ-সি ফাস্ট চার্জিং নাইলন ক্যাবল বান্ডেল অফার",
    items: [
      { productId: "p4", productName: "Soundcore Life P2 TWS Earbuds", quantity: 1, unitPrice: 2800 },
      { productId: "p5", productName: "Braided Nylon Type-C Fast Cable 1m", quantity: 1, unitPrice: 450 }
    ],
    bundlePrice: 2850,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  }
];

const DEFAULT_USAGE: Record<string, ComboUsage> = {
  "combo_telecom_01": { comboId: "combo_telecom_01", count: 8, totalRevenue: 152000, lastUsed: "2026-08-02T12:00:00.000Z" },
  "combo_telecom_02": { comboId: "combo_telecom_02", count: 14, totalRevenue: 39900, lastUsed: "2026-08-02T14:30:00.000Z" }
};

function loadCombos(): Combo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMBOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COMBOS;
  } catch { return DEFAULT_COMBOS; }
}
function saveCombos(list: Combo[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}
function loadUsage(): Record<string, ComboUsage> {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return DEFAULT_USAGE;
    const parsed = JSON.parse(raw);
    return parsed && Object.keys(parsed).length > 0 ? parsed : DEFAULT_USAGE;
  } catch { return DEFAULT_USAGE; }
}
function saveUsage(u: Record<string, ComboUsage>) {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(u)); } catch {}
}

export function recordComboUsage(comboId: string, revenue: number) {
  const u = loadUsage();
  const cur = u[comboId] || { comboId, count: 0, totalRevenue: 0 };
  cur.count += 1;
  cur.totalRevenue += revenue;
  cur.lastUsed = new Date().toISOString();
  u[comboId] = cur;
  saveUsage(u);
}

interface Props {
  lang: 'bn' | 'en';
  products: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSellCombo?: (combo: Combo) => void;
}

export function ComboManager({ lang, products, showToast, onSellCombo }: Props) {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [usage, setUsage] = useState<Record<string, ComboUsage>>({});
  const [view, setView] = useState<'list' | 'report'>('list');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);

  useEffect(() => {
    setCombos(loadCombos());
    setUsage(loadUsage());
  }, []);

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  const persist = (next: Combo[]) => {
    setCombos(next);
    saveCombos(next);
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Combo) => { setEditing(c); setModalOpen(true); };

  const handleSave = (c: Combo) => {
    const exists = combos.some(x => x.id === c.id);
    const next = exists ? combos.map(x => x.id === c.id ? c : x) : [...combos, c];
    persist(next);
    setModalOpen(false);
    showToast(exists ? t('কম্বো আপডেট হয়েছে', 'Combo updated') : t('কম্বো তৈরি হয়েছে', 'Combo created'), 'success');
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('মুছে ফেলবেন?', 'Delete this combo?'))) return;
    persist(combos.filter(c => c.id !== id));
    showToast(t('মুছে ফেলা হয়েছে', 'Deleted'), 'success');
  };

  const filtered = combos.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStats = useMemo(() => {
    const list: ComboUsage[] = Object.values(usage);
    let totalSavingsGen = 0;
    combos.forEach(c => {
      const orig = c.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const sav = Math.max(0, orig - c.bundlePrice);
      const cnt = usage[c.id]?.count || 0;
      totalSavingsGen += sav * cnt;
    });

    return {
      totalCombos: combos.length,
      totalSold: list.reduce((s, u) => s + (u.count || 0), 0),
      totalRevenue: list.reduce((s, u) => s + (u.totalRevenue || 0), 0),
      totalSavings: totalSavingsGen,
    };
  }, [combos, usage]);

  return (
    <div className="w-full space-y-6 animate-fade-in text-left">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl shrink-0">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 dark:text-white text-lg sm:text-xl tracking-tight">
              {t('কম্বো / বান্ডেল প্রোডাক্ট', 'Combo / Bundled Products')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              {t('একাধিক পণ্য একসাথে ডিসকাউন্টে প্যাকেজ আকারে বিক্রি করুন', 'Package and sell multiple products together at a discount')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-100 dark:bg-slate-900 text-xs font-bold">
            <button 
              onClick={() => setView('list')} 
              className={`px-3 py-1.5 rounded-lg transition ${view === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {t('📋 তালিকা', '📋 List')}
            </button>
            <button 
              onClick={() => setView('report')} 
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${view === 'report' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t('📊 রিপোর্ট', '📊 Report')}
            </button>
          </div>

          <button 
            onClick={openCreate} 
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t('নতুন কম্বো', 'New Combo')}
          </button>
        </div>
      </div>

      {/* Top 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-400/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider block">{t('মোট সক্রিয় কম্বো', 'Active Combos')}</span>
            <span className="text-2xl sm:text-3xl font-black mt-1 block">{totalStats.totalCombos} {t('টি', 'Packs')}</span>
          </div>
          <span className="text-3xl bg-white/20 p-2.5 rounded-2xl">📦</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-400/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider block">{t('মোট বান্ডেল বিক্রি', 'Total Sold')}</span>
            <span className="text-2xl sm:text-3xl font-black mt-1 block">{totalStats.totalSold} {t('টি', 'Units')}</span>
          </div>
          <span className="text-3xl bg-white/20 p-2.5 rounded-2xl">🛍️</span>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-400/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider block">{t('মোট বান্ডেল আয়', 'Total Revenue')}</span>
            <span className="text-2xl sm:text-3xl font-black mt-1 block">৳{totalStats.totalRevenue.toLocaleString()}</span>
          </div>
          <span className="text-3xl bg-white/20 p-2.5 rounded-2xl">💰</span>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={t('কম্বো প্যাকেজ দিয়ে খুঁজুন...', 'Search combo packs...')} 
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs" 
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-4xl block mb-2">🎁</span>
                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">{t('কোনো কম্বো প্যাকেজ পাওয়া যায়নি', 'No combo packages found')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('উপরে "নতুন কম্বো" বাটনে চেপে অফার তৈরি করুন', 'Click "New Combo" above to create bundle offers')}</p>
              </div>
            )}
            {filtered.map(c => {
              const sumOriginal = c.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
              const savings = sumOriginal - c.bundlePrice;
              const stats = usage[c.id];
              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between transition hover:border-indigo-300 dark:hover:border-indigo-800">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 inline-block mb-1.5">
                          🔥 HOT DEAL
                        </span>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{c.name}</h3>
                        {c.description && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{c.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-indigo-600 dark:text-indigo-400 text-xl">৳{c.bundlePrice.toLocaleString()}</div>
                        {savings > 0 && (
                          <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mt-1">
                            {t('সাশ্রয়', 'Saves')} ৳{savings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items List inside Combo */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 my-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        📦 {t('প্যাকেজের অন্তর্ভুক্ত আইটেম:', 'Package Includes:')}
                      </span>
                      {c.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center font-bold">
                          <span>• {i.productName} × {i.quantity}</span>
                          <span className="text-slate-400 font-semibold">৳{(i.unitPrice * i.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {stats && (
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mb-3 flex justify-between items-center">
                        <span>{t('মোট বিক্রি:', 'Total Sold:')} <strong className="text-slate-800 dark:text-white">{stats.count} {t('বার', 'times')}</strong></span>
                        <span>{t('আয়:', 'Revenue:')} <strong className="text-emerald-600 dark:text-emerald-400">৳{stats.totalRevenue.toLocaleString()}</strong></span>
                      </div>
                    )}

                    {/* Permanently Visible Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {onSellCombo && (
                        <button 
                          onClick={() => onSellCombo(c)} 
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> {t('বিক্রি করুন', 'Sell Combo')}
                        </button>
                      )}
                      <button 
                        onClick={() => openEdit(c)} 
                        className="px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> {t('এডিট', 'Edit')}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">{t('কম্বো নাম', 'Combo Name')}</th>
                  <th className="px-4 py-3 text-right">{t('বান্ডেল দাম', 'Bundle Price')}</th>
                  <th className="px-4 py-3 text-right">{t('মোট বিক্রি', 'Sold Count')}</th>
                  <th className="px-4 py-3 text-right">{t('মোট আয়', 'Total Revenue')}</th>
                  <th className="px-4 py-3 text-left">{t('সর্বশেষ বিক্রি', 'Last Sold')}</th>
                  <th className="px-4 py-3 text-center">{t('অ্যাকশন', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {combos.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">{t('কোনো ডেটা পাওয়া যায়নি', 'No data found')}</td></tr>
                )}
                {combos.map(c => {
                  const s = usage[c.id];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-extrabold text-slate-800 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400">৳{c.bundlePrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-extrabold">{s?.count || 0}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">৳{(s?.totalRevenue || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500 font-bold">{s?.lastUsed ? new Date(s.lastUsed).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {onSellCombo && (
                          <button 
                            onClick={() => onSellCombo(c)} 
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            🛒 {t('বিক্রি', 'Sell')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <ComboEditor
          lang={lang}
          products={products}
          initial={editing}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const map: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <div className={`bg-gradient-to-br ${map[color]} text-white rounded-xl p-4 shadow-sm`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function ComboEditor({
  lang, products, initial, onSave, onClose,
}: {
  lang: 'bn' | 'en';
  products: any[];
  initial: Combo | null;
  onSave: (c: Combo) => void;
  onClose: () => void;
}) {
  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [items, setItems] = useState<ComboItem[]>(initial?.items || []);
  const [bundlePrice, setBundlePrice] = useState<number>(initial?.bundlePrice || 0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const sumOriginal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const customerSavings = Math.max(0, sumOriginal - bundlePrice);

  const addProduct = (p: any) => {
    if (items.some(i => i.productId === p.id)) return;
    const unitPrice = Number(p.sellingPrice || p.price || 0);
    setItems([...items, { productId: p.id, productName: p.name || 'Unnamed', quantity: 1, unitPrice }]);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const updateQty = (id: string, q: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, quantity: Math.max(1, q) } : i));
  };
  const removeItem = (id: string) => setItems(items.filter(i => i.productId !== id));

  const submit = () => {
    if (!name.trim()) return alert(t('কম্বো নাম দিন', 'Enter combo name'));
    if (items.length === 0) return alert(t('কমপক্ষে একটি পণ্য যোগ করুন', 'Add at least one product'));
    if (bundlePrice <= 0) return alert(t('বান্ডেল মূল্য দিন', 'Enter bundle price'));
    const now = new Date().toISOString();
    const combo: Combo = {
      id: initial?.id || `combo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      description: description.trim(),
      items,
      bundlePrice,
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    };
    onSave(combo);
  };

  const filteredProducts = products.filter(p =>
    !pickerSearch || (p.name || '').toLowerCase().includes(pickerSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(pickerSearch.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150 text-left" onClick={e => e.stopPropagation()}>
        {/* Landscape Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl p-1.5 bg-white/20 rounded-xl">📦</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                {initial ? t('কম্বো প্যাকেজ এডিটর', 'Edit Combo Pack') : t('নতুন কম্বো প্যাকেজ তৈরি করুন', 'Create New Combo Pack')}
              </h2>
              <p className="text-white/80 text-xs font-semibold">
                {t('একাধিক পণ্য বান্ডেল করে বিশেষ ছাড়ের অফার দিন', 'Bundle products to offer exclusive customer discounts')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wide Landscape Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
          
          {/* Top Full-Width Section: Basic Info & Description */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-left">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800/80 pb-2">
              📋 {t('১. প্যাকেজের তথ্য ও বিস্তারিত বিবরণ', '1. Package Information & Detailed Description')}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Combo Name Field */}
              <label className="md:col-span-12 block text-xs font-extrabold text-slate-700 dark:text-slate-200 space-y-1">
                <span>{t('কম্বো প্যাকেজের নাম', 'Combo Package Name')} *</span>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder={t('যেমন: স্মার্টফোন গিগা প্যাক (Xiaomi Note 13 + Charger + Glass)', 'e.g. Smartphone Gigapack')}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </label>

              {/* Full-Width Multi-line Textarea for Long Offer Description */}
              <label className="md:col-span-12 block text-xs font-extrabold text-slate-700 dark:text-slate-200 space-y-1">
                <span className="flex items-center justify-between">
                  <span>{t('অফার বিবরণ / বিস্তারিত ট্যাগলাইন', 'Description / Offer Details & Terms')}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{t('(ফুল-উইডথ বিস্তারিত টেক্সট বক্স)', '(Full-width Multi-line Box)')}</span>
                </span>
                <textarea 
                  rows={3}
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder={t('এখানে কম্বো অফারের বিস্তারিত বিবরণ, পণ্যের বৈচিত্র্য ও ওয়ারেন্টির শর্তাবলী লিখুন...', 'Write detailed bundle description, items list, warranty notes & terms...')}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y leading-relaxed" 
                />
              </label>
            </div>
          </div>

          {/* Bottom Balanced 2-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Price Input & Savings Summary */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  💳 {t('২. বান্ডেল অফার বিক্রয়মূল্য', '2. Bundle Offer Price')}
                </span>

                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 space-y-1">
                  <span>{t('বান্ডেল অফার বিক্রয়মূল্য (৳)', 'Bundle Offer Price (৳)')} *</span>
                  <input 
                    type="number" 
                    min={0} 
                    value={bundlePrice || ''} 
                    onChange={e => setBundlePrice(Number(e.target.value))} 
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-indigo-300 dark:border-indigo-800 rounded-xl text-lg font-black bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </label>
              </div>

              {/* Real-time Savings Calculation Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-2.5 text-xs">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">
                  💰 {t('মূল্য হিসাব ও গ্রাহক সাশ্রয় সমীকরণ', 'Price & Customer Savings Summary')}
                </span>
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-300 font-bold">{t('পণ্যসমূহের আসল মোট দাম:', 'Original Items Total:')}</span>
                  <span className="font-mono font-extrabold text-slate-200">৳{sumOriginal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('বান্ডেল অফার মূল্য:', 'Bundle Offer Price:')}</span>
                  <span className="font-mono font-black text-indigo-400 text-sm">৳{bundlePrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-emerald-400 font-black">
                  <span className="flex items-center gap-1">🎁 {t('গ্রাহকের মোট সাশ্রয়:', 'Customer Savings:')}</span>
                  <span className="font-mono text-base text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                    ৳{customerSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Bundled Products List */}
            <div className="md:col-span-7 space-y-3 text-left border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">
                    📦 {t('৩. প্যাকেজে অন্তর্ভুক্ত পণ্যসমূহ', '3. Bundled Products List')} ({items.length})
                  </span>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {t('প্যাকেজের অন্তর্ভুক্ত প্রোডাক্ট যোগ করুন ও পরিমাণ ঠিক করুন', 'Add items included in this bundle and set quantities')}
                  </p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setPickerOpen(true)} 
                  className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('পণ্য যোগ করুন', 'Add Product')}
                </button>
              </div>

              {/* Items List Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                {items.length === 0 && (
                  <div className="text-center text-slate-400 text-xs py-10">
                    <span className="text-3xl block mb-1">🛒</span>
                    <p className="font-bold">{t('কোনো পণ্য যুক্ত করা হয়নি', 'No products added yet')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('উপরে "পণ্য যোগ করুন" বাটনে চাপুন', 'Click "Add Product" button above')}</p>
                  </div>
                )}
                {items.map(i => (
                  <div key={i.productId} className="flex items-center justify-between gap-3 px-4 py-3 text-xs bg-white dark:bg-slate-900">
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-800 dark:text-white truncate">{i.productName}</div>
                      <div className="text-slate-400 text-[11px] font-semibold">৳{i.unitPrice.toLocaleString()} {t('প্রতি পিস', 'each')}</div>
                    </div>

                    {/* Quantity Selector Counter */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button 
                        type="button" 
                        onClick={() => updateQty(i.productId, i.quantity - 1)}
                        className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-extrabold text-xs">{i.quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => updateQty(i.productId, i.quantity + 1)}
                        className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-24 text-right font-black text-slate-800 dark:text-white text-xs">
                      ৳{(i.unitPrice * i.quantity).toLocaleString()}
                    </div>

                    <button 
                      type="button"
                      onClick={() => removeItem(i.productId)} 
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {t('বাতিল', 'Cancel')}
          </button>
          <button 
            type="button"
            onClick={submit} 
            className="px-6 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            ✓ {t('কম্বো প্যাকেজ সেভ করুন', 'Save Combo Pack')}
          </button>
        </div>

        {/* Product Selector Sub-Modal */}
        {pickerOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3" onClick={() => setPickerOpen(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[75vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">🔍 {t('পণ্য নির্বাচন করুন', 'Select Product')}</span>
                <button onClick={() => setPickerOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <input 
                  autoFocus 
                  value={pickerSearch} 
                  onChange={e => setPickerSearch(e.target.value)} 
                  placeholder={t('পণ্যের নাম বা SKU দিয়ে খুঁজুন...', 'Search product name or SKU...')} 
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none" 
                />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1">
                {filteredProducts.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addProduct(p)} 
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl text-xs transition flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-white">{p.name}</div>
                      <div className="text-slate-400 text-[10px] font-semibold">{p.sku ? `SKU: ${p.sku}` : 'Standard Product'}</div>
                    </div>
                    <div className="font-black text-indigo-600 dark:text-indigo-400">
                      ৳{Number(p.sellingPrice || p.price || 0).toLocaleString()}
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && <div className="text-center text-slate-400 text-xs py-8 font-semibold">{t('কিছু পাওয়া যায়নি', 'Nothing found')}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
