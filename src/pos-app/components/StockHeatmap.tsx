// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Package, AlertTriangle, Grid3X3 } from 'lucide-react';

interface StockHeatmapProps {
  products?: any[];
  sales?: any[];
  lang?: 'bn' | 'en';
}

function getHeatLevel(stock: number, alertQty: number, salesCount: number): { level: number; color: string; label: string; labelBn: string } {
  if (stock <= 0) return { level: 0, color: '#fecdd3', label: 'Out of Stock', labelBn: 'স্টক নেই' };
  if (stock <= alertQty) return { level: 1, color: '#fed7aa', label: 'Low Stock', labelBn: 'স্বল্প স্টক' };
  if (salesCount > 10) return { level: 4, color: '#bbf7d0', label: 'High Sales', labelBn: 'উচ্চ বিক্রয়' };
  if (salesCount > 5) return { level: 3, color: '#d1fae5', label: 'Medium Sales', labelBn: 'মধ্যম বিক্রয়' };
  if (salesCount > 0) return { level: 2, color: '#e0f2fe', label: 'Low Sales', labelBn: 'কম বিক্রয়' };
  return { level: 1.5, color: '#f3f4f6', label: 'No Sales', labelBn: 'কোনো বিক্রয় নেই' };
}

export const StockHeatmap = ({
  products = [],
  sales = [],
  lang = 'bn',
}: StockHeatmapProps) => {
  const isBn = lang === 'bn';

  const data = useMemo(() => {
    const salesByProduct: Record<string, number> = {};
    sales.forEach((s: any) => {
      if (s.productId) salesByProduct[s.productId] = (salesByProduct[s.productId] || 0) + (s.quantity || 1);
    });

    return products.map((p: any) => ({
      ...p,
      salesCount: salesByProduct[p.id] || 0,
      heat: getHeatLevel(p.stock ?? 0, p.alertQty ?? 5, salesByProduct[p.id] || 0),
    })).sort((a, b) => b.salesCount - a.salesCount);
  }, [products, sales]);

  const categoryGroups = useMemo(() => {
    const groups: Record<string, typeof data> = {};
    data.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [data]);

  const stats = useMemo(() => ({
    outOfStock: data.filter(p => p.stock <= 0).length,
    lowStock: data.filter(p => p.stock > 0 && p.stock <= (p.alertQty || 5)).length,
    highSales: data.filter(p => p.salesCount > 10).length,
    totalValue: data.reduce((s, p) => s + ((p.stock || 0) * (p.purchasePrice || 0)), 0),
  }), [data]);

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Grid3X3 size={48} className="mx-auto text-teal-300" />
          <h2 className="text-xl font-bold text-gray-600">{isBn ? 'কোনো পণ্য নেই' : 'No Products'}</h2>
          <p className="text-gray-400 text-sm">{isBn ? 'প্রথমে পণ্য যোগ করুন' : 'Add products first'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 p-4 sm:p-6">
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Grid3X3 size={24} className="text-teal-500" />
            {isBn ? 'স্টক হিটম্যাপ' : 'Stock Heatmap'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isBn ? 'স্টক পরিস্থিতি ও বিক্রয় কার্যক্ষমতার ভিজ্যুয়াল মানচিত্র' : 'Visual map of stock status and sales performance'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isBn ? 'স্টক নেই' : 'Out of Stock', value: stats.outOfStock, color: 'bg-rose-100', text: 'text-rose-600', indicator: '#fecdd3' },
            { label: isBn ? 'স্বল্প স্টক' : 'Low Stock', value: stats.lowStock, color: 'bg-amber-100', text: 'text-amber-600', indicator: '#fed7aa' },
            { label: isBn ? 'উচ্চ বিক্রয়' : 'High Sellers', value: stats.highSales, color: 'bg-emerald-100', text: 'text-emerald-600', indicator: '#bbf7d0' },
            { label: isBn ? 'মোট স্টক মূল্য' : 'Total Stock Value', value: '৳' + Math.round(stats.totalValue).toLocaleString(), color: 'bg-blue-100', text: 'text-blue-600', indicator: '#bfdbfe' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-4 border border-white shadow-sm flex items-center gap-3`}>
              <div className="w-3 h-10 rounded-full" style={{ backgroundColor: s.indicator }} />
              <div>
                <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">{isBn ? 'কালার লেজেন্ড' : 'Color Legend'}</p>
          <div className="flex flex-wrap gap-3">
            {[
              { color: '#fecdd3', label: isBn ? 'স্টক নেই' : 'Out of Stock' },
              { color: '#fed7aa', label: isBn ? 'স্বল্প স্টক' : 'Low Stock' },
              { color: '#f3f4f6', label: isBn ? 'কোনো বিক্রয় নেই' : 'No Sales' },
              { color: '#e0f2fe', label: isBn ? 'কম বিক্রয়' : 'Low Sales' },
              { color: '#d1fae5', label: isBn ? 'মধ্যম বিক্রয়' : 'Med. Sales' },
              { color: '#bbf7d0', label: isBn ? 'উচ্চ বিক্রয়' : 'High Sales' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md border border-gray-200" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Grid by Category */}
        {Object.entries(categoryGroups).map(([cat, items]) => (
          <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Package size={14} className="text-gray-400" />
              {cat}
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{items.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {items.map(p => (
                <div
                  key={p.id}
                  className="rounded-xl p-3 border border-white shadow-sm hover:scale-105 hover:shadow-md transition-all cursor-default relative group"
                  style={{ backgroundColor: p.heat.color }}
                >
                  <p className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">{p.name}</p>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[10px] text-gray-600 font-medium">
                      {isBn ? 'স্টক:' : 'Stock:'} <span className="font-bold">{p.stock ?? 0}</span>
                    </p>
                    <p className="text-[10px] text-gray-600 font-medium">
                      {isBn ? 'বিক্রয়:' : 'Sales:'} <span className="font-bold">{p.salesCount}</span>
                    </p>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-gray-900 text-white text-xs rounded-xl p-2.5 hidden group-hover:block z-20 shadow-xl">
                    <p className="font-bold mb-1">{p.name}</p>
                    <p>ID: {p.id}</p>
                    <p>{isBn ? 'ক্রয় মূল্য:' : 'Purchase:'} ৳{(p.purchasePrice || 0).toLocaleString()}</p>
                    <p>{isBn ? 'বিক্রয় মূল্য:' : 'Selling:'} ৳{(p.sellingPrice || 0).toLocaleString()}</p>
                    <p>{isBn ? 'অ্যালার্ট সীমা:' : 'Alert Qty:'} {p.alertQty || 5}</p>
                    <p className="mt-1 font-semibold">{isBn ? p.heat.labelBn : p.heat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Top Sellers Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-teal-500" />
            {isBn ? 'শীর্ষ ১০ বিক্রীত পণ্য' : 'Top 10 Selling Products'}
          </h2>
          <div className="space-y-2">
            {data.slice(0, 10).filter(p => p.salesCount > 0).map((p, i) => {
              const maxSales = data[0]?.salesCount || 1;
              const pct = Math.round((p.salesCount / maxSales) * 100);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-700 truncate">{p.name}</span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{p.salesCount} {isBn ? 'টি' : 'pcs'}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: p.heat.color === '#f3f4f6' ? '#6ee7b7' : p.heat.color === '#bbf7d0' ? '#10b981' : p.heat.color === '#d1fae5' ? '#34d399' : '#6ee7b7' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {data.filter(p => p.salesCount > 0).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">{isBn ? 'কোনো বিক্রয় রেকর্ড নেই' : 'No sales data'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHeatmap;

