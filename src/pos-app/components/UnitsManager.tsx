// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Scale, Plus, Trash2, Edit2, Check, X, AlertCircle, Search,
  Tag, Package, ChevronDown, ChevronRight, RefreshCw, Layers
} from 'lucide-react';

interface UnitsManagerProps {
  lang?: 'bn' | 'en';
  products?: any[];
  unitCategories?: string[];
  unitsByCategory?: Record<string, string[]>;
  setUnitsByCategory?: (updater: any) => void;
  productToUnitCats?: Record<string, string[]>;
  showToast?: (msg: string, type?: string) => void;
}

const DEFAULT_UNIT_CATEGORIES = ['General', 'Weight', 'Liquid', 'Length', 'Fiber & Cable', 'Hardware', 'Grocery', 'Pharmacy', 'Telecom', 'Garments', 'Custom'];

const DEFAULT_UNITS_BY_CATEGORY: Record<string, string[]> = {
  'General': ['Piece', 'Box', 'Carton', 'Set', 'Packet', 'Bag', 'Pair', 'Dozen', 'Bundle', 'Pcs'],
  'Weight': ['mg', 'g', 'kg', 'ton'],
  'Liquid': ['ml', 'liter', 'gallon', 'Ltr'],
  'Length': ['mm', 'cm', 'meter', 'kilometer', 'inch', 'foot', 'yard'],
  'Fiber & Cable': ['feet', 'roll', 'spool', 'core'],
  'Hardware': ['rod', 'pipe', 'sheet', 'sack', 'drum'],
  'Grocery': ['bottle', 'jar', 'tray', 'sachet'],
  'Pharmacy': ['tablet', 'strip', 'vial', 'capsule', 'injection'],
  'Telecom': ['device', 'accessory', 'sim', 'port'],
  'Garments': ['roll', 'yard', 'bundle'],
  'Custom': [],
};

const CATEGORY_COLORS: Record<string, string> = {
  'General':      { bg: 'bg-blue-50',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  'Weight':       { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  'Liquid':       { bg: 'bg-cyan-50',   text: 'text-cyan-600',   badge: 'bg-cyan-100 text-cyan-700',   dot: 'bg-cyan-400' },
  'Length':       { bg: 'bg-green-50',  text: 'text-green-600',  badge: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  'Fiber & Cable':{ bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  'Hardware':     { bg: 'bg-stone-50',  text: 'text-stone-600',  badge: 'bg-stone-100 text-stone-700', dot: 'bg-stone-400' },
  'Grocery':      { bg: 'bg-lime-50',   text: 'text-lime-700',   badge: 'bg-lime-100 text-lime-700',   dot: 'bg-lime-400' },
  'Pharmacy':     { bg: 'bg-rose-50',   text: 'text-rose-600',   badge: 'bg-rose-100 text-rose-700',   dot: 'bg-rose-400' },
  'Telecom':      { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  'Garments':     { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  'Custom':       { bg: 'bg-gray-50',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400' },
};

const getColor = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS['Custom'];

export const UnitsManager = ({
  lang = 'bn',
  products = [],
  unitCategories = DEFAULT_UNIT_CATEGORIES,
  unitsByCategory: externalUBC,
  setUnitsByCategory: externalSetUBC,
  productToUnitCats = {},
  showToast: externalToast,
}: UnitsManagerProps) => {
  const isBn = lang === 'bn';

  // Use internal state if no external state passed in
  const [internalUBC, setInternalUBC] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('roni_units_by_category');
      if (saved) return { ...DEFAULT_UNITS_BY_CATEGORY, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_UNITS_BY_CATEGORY };
  });

  const unitsByCategory = externalUBC ?? internalUBC;
  const setUBC = (updater: any) => {
    const fn = externalSetUBC ?? setInternalUBC;
    fn(updater);
    // Persist internally too
    if (!externalSetUBC) {
      setTimeout(() => {
        try { localStorage.setItem('roni_units_by_category', JSON.stringify(typeof updater === 'function' ? updater(internalUBC) : updater)); } catch {}
      }, 0);
    }
  };

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (externalToast) { externalToast(msg, type); return; }
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(unitCategories));
  const [editingUnit, setEditingUnit] = useState<{ cat: string; unit: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingCat, setAddingCat] = useState<string | null>(null);
  const [newUnitValue, setNewUnitValue] = useState('');
  const [deletingUnit, setDeletingUnit] = useState<{ cat: string; unit: string } | null>(null);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const addUnit = (cat: string) => {
    const val = newUnitValue.trim();
    if (!val) { showToast(isBn ? 'একক নাম খালি রাখা যাবে না' : 'Unit name cannot be empty', 'error'); return; }
    const existing = unitsByCategory[cat] || [];
    if (existing.map(u => u.toLowerCase()).includes(val.toLowerCase())) {
      showToast(isBn ? 'এই একক ইতিমধ্যে আছে' : 'Unit already exists', 'error'); return;
    }
    setUBC((prev: any) => ({ ...prev, [cat]: [...(prev[cat] || []), val] }));
    showToast(isBn ? `"${val}" যোগ হয়েছে` : `"${val}" added`);
    setNewUnitValue('');
    setAddingCat(null);
  };

  const saveEdit = () => {
    if (!editingUnit) return;
    const val = editValue.trim();
    if (!val) { showToast(isBn ? 'একক নাম খালি রাখা যাবে না' : 'Cannot be empty', 'error'); return; }
    setUBC((prev: any) => ({
      ...prev,
      [editingUnit.cat]: (prev[editingUnit.cat] || []).map((u: string) => u === editingUnit.unit ? val : u)
    }));
    showToast(isBn ? 'আপডেট হয়েছে' : 'Updated');
    setEditingUnit(null);
  };

  const deleteUnit = () => {
    if (!deletingUnit) return;
    setUBC((prev: any) => ({
      ...prev,
      [deletingUnit.cat]: (prev[deletingUnit.cat] || []).filter((u: string) => u !== deletingUnit.unit)
    }));
    showToast(isBn ? 'মুছে ফেলা হয়েছে' : 'Deleted');
    setDeletingUnit(null);
  };

  // Filtered categories & units
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return unitsByCategory;
    const result: Record<string, string[]> = {};
    unitCategories.forEach(cat => {
      const units = (unitsByCategory[cat] || []).filter(u => u.toLowerCase().includes(q) || cat.toLowerCase().includes(q));
      if (units.length > 0 || cat.toLowerCase().includes(q)) result[cat] = units;
    });
    return result;
  }, [unitsByCategory, search, unitCategories]);

  const totalUnits = unitCategories.reduce((s, c) => s + (unitsByCategory[c] || []).length, 0);

  // Products using each unit
  const unitUsageMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p: any) => {
      if (p.unit) map[p.unit] = (map[p.unit] || 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 sm:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
              <Scale size={24} className="text-indigo-500" />
              {isBn ? 'একক ব্যবস্থাপনা' : 'Units Manager'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isBn ? `মোট ${totalUnits}টি একক — ${unitCategories.length}টি ক্যাটাগরিতে সংগঠিত` : `${totalUnits} units across ${unitCategories.length} categories`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setExpandedCats(new Set(unitCategories)); }}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={12} /> {isBn ? 'সব খুলুন' : 'Expand All'}
            </button>
            <button
              onClick={() => { setAddingCat('Custom'); setExpandedCats(prev => new Set([...prev, 'Custom'])); }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus size={16} /> {isBn ? 'নতুন একক' : 'Add Unit'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: isBn ? 'মোট একক' : 'Total Units', value: totalUnits, icon: Tag, color: 'from-indigo-400 to-purple-500' },
            { label: isBn ? 'মোট ক্যাটাগরি' : 'Categories', value: unitCategories.length, icon: Layers, color: 'from-teal-400 to-emerald-500' },
            { label: isBn ? 'ব্যবহৃত একক' : 'Units in Use', value: Object.keys(unitUsageMap).length, icon: Package, color: 'from-amber-400 to-orange-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isBn ? 'একক বা ক্যাটাগরি খুঁজুন...' : 'Search units or categories...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {unitCategories.map(cat => {
            const units = (filtered[cat] || []);
            const allUnits = unitsByCategory[cat] || [];
            const isExpanded = expandedCats.has(cat);
            const color = getColor(cat);
            if (search && !(cat in filtered)) return null;

            return (
              <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCat(cat)}
                  className={`w-full flex items-center justify-between px-5 py-4 ${color.bg} hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                    <span className={`font-bold text-sm ${color.text}`}>{cat}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color.badge}`}>
                      {allUnits.length} {isBn ? 'টি একক' : 'units'}
                    </span>
                    {allUnits.some(u => unitUsageMap[u]) && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                        {isBn ? 'ব্যবহৃত' : 'In Use'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingCat(cat); setExpandedCats(prev => new Set([...prev, cat])); }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${color.text} hover:bg-white/60 transition-colors`}
                    >
                      <Plus size={11} /> {isBn ? 'যোগ' : 'Add'}
                    </button>
                    {isExpanded ? <ChevronDown size={16} className={color.text} /> : <ChevronRight size={16} className={color.text} />}
                  </div>
                </button>

                {/* Units List */}
                {isExpanded && (
                  <div className="p-4">
                    {/* Add new unit inline */}
                    {addingCat === cat && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-50 rounded-xl border border-indigo-200">
                        <input
                          autoFocus
                          type="text"
                          value={newUnitValue}
                          onChange={e => setNewUnitValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addUnit(cat); if (e.key === 'Escape') { setAddingCat(null); setNewUnitValue(''); } }}
                          placeholder={isBn ? 'নতুন এককের নাম লিখুন...' : 'New unit name...'}
                          className="flex-1 px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                        <button onClick={() => addUnit(cat)} className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => { setAddingCat(null); setNewUnitValue(''); }} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {units.length === 0 && !addingCat && (
                      <p className="text-center text-gray-400 text-xs py-4">
                        {isBn ? 'এই ক্যাটাগরিতে কোনো একক নেই' : 'No units in this category'}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {units.map(unit => (
                        <div key={unit} className="group relative">
                          {editingUnit?.cat === cat && editingUnit?.unit === unit ? (
                            <div className="flex items-center gap-1">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingUnit(null); }}
                                className="px-2 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 w-24"
                              />
                              <button onClick={saveEdit} className="p-1 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                                <Check size={11} />
                              </button>
                              <button onClick={() => setEditingUnit(null)} className="p-1 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${color.badge} border border-transparent hover:border-gray-200 transition-all`}>
                              <span>{unit}</span>
                              {unitUsageMap[unit] > 0 && (
                                <span className="px-1 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold">
                                  {unitUsageMap[unit]}
                                </span>
                              )}
                              <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                <button
                                  onClick={() => { setEditingUnit({ cat, unit }); setEditValue(unit); }}
                                  className="p-0.5 hover:text-amber-600 text-gray-400 transition-colors"
                                  title={isBn ? 'সম্পাদনা' : 'Edit'}
                                >
                                  <Edit2 size={10} />
                                </button>
                                <button
                                  onClick={() => setDeletingUnit({ cat, unit })}
                                  className="p-0.5 hover:text-rose-600 text-gray-400 transition-colors"
                                  title={isBn ? 'মুছুন' : 'Delete'}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Confirm Popup */}
        {deletingUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingUnit(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                <Trash2 size={20} className="text-rose-500" />
              </div>
              <p className="text-gray-700 text-sm font-medium">
                {isBn ? `"${deletingUnit.unit}" এককটি মুছতে চান?` : `Delete unit "${deletingUnit.unit}"?`}
              </p>
              {unitUsageMap[deletingUnit.unit] > 0 && (
                <p className="text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
                  ⚠️ {isBn ? `${unitUsageMap[deletingUnit.unit]}টি পণ্য এই একক ব্যবহার করছে` : `${unitUsageMap[deletingUnit.unit]} products use this unit`}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setDeletingUnit(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button onClick={deleteUnit} className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors">
                  {isBn ? 'মুছুন' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitsManager;
