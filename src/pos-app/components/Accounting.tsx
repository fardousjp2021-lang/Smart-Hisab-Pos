import { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Users, Truck, DollarSign,
  Plus, Search, Printer, Trash2, Edit3, Filter, X as XIcon, Save,
  FileText, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
} from 'recharts';

// ---------- Types ----------
type ExpenseRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

type IncomeRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

type Sale = any;
type Purchase = any;
type Customer = any;
type Supplier = any;

type TabKey =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'transactions'
  | 'dues'
  | 'reports';

type Props = {
  sales: Sale[];
  purchases: Purchase[];
  expenses: ExpenseRow[];
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>;
  expenseCategories?: string[];
  customers: Customer[];
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  suppliers: Supplier[];
  setSuppliers?: React.Dispatch<React.SetStateAction<any[]>>;
  lang?: 'bn' | 'en';
  showToast?: (msg: string, kind?: 'success' | 'error' | 'info') => void;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  initialSubTab?: string;
};

// ---------- Helpers ----------
const fmt = (n: number) =>
  '৳' + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const toISODate = (d: string | Date) => {
  try { return new Date(d).toISOString().slice(0, 10); } catch { return String(d).slice(0, 10); }
};
const today = () => new Date().toISOString().slice(0, 10);
const monthKey = (d: string | Date) => {
  try { return new Date(d).toISOString().slice(0, 7); } catch { return String(d).slice(0, 7); }
};

const subKeyToTab: Record<string, TabKey> = {
  acc_dashboard: 'dashboard',
  acc_income: 'income',
  acc_expenses: 'expenses',
  expenses_tracker: 'expenses',
  acc_transactions: 'transactions',
  acc_dues: 'dues',
  acc_reports: 'reports',
  payment_accounts: 'dashboard',
};

export function Accounting(props: Props) {
  const {
    sales, purchases, expenses, setExpenses, expenseCategories = [],
    customers, suppliers, lang = 'en', showToast, shopName = 'Shop',
    shopAddress = '', shopPhone = '', initialSubTab,
  } = props;

  const t = (bn: string, en: string) => (lang === 'bn' ? bn : en);

  // ---------- Local income (parallel to expenses; in-memory) ----------
  const [incomes, setIncomes] = useState<IncomeRow[]>(() => {
    try {
      const raw = localStorage.getItem('roni_incomes');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
  });
  useEffect(() => {
    try { localStorage.setItem('roni_incomes', JSON.stringify(incomes)); } catch { /* ignore */ }
  }, [incomes]);

  // ---------- Active tab ----------
  const [tab, setTab] = useState<TabKey>(
    (initialSubTab && subKeyToTab[initialSubTab]) || 'dashboard'
  );
  useEffect(() => {
    if (initialSubTab && subKeyToTab[initialSubTab]) {
      setTab(subKeyToTab[initialSubTab]);
    }
  }, [initialSubTab]);

  // ---------- Derived numbers ----------
  const salesIncomeToday = useMemo(
    () => sales.filter(s => toISODate(s.date || '') === today())
      .reduce((a, s) => a + (Number(s.totalPrice ?? s.totalAmount) || 0), 0),
    [sales]
  );
  const otherIncomeToday = useMemo(
    () => incomes.filter(i => toISODate(i.date) === today())
      .reduce((a, i) => a + Number(i.amount || 0), 0),
    [incomes]
  );
  const incomeToday = salesIncomeToday + otherIncomeToday;

  const expenseToday = useMemo(
    () => expenses.filter(e => toISODate(e.date) === today())
      .reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses]
  );

  const totalSalesRevenue = useMemo(
    () => sales.reduce((a, s) => a + (Number(s.totalPrice ?? s.totalAmount) || 0), 0),
    [sales]
  );
  const totalOtherIncome = useMemo(
    () => incomes.reduce((a, i) => a + Number(i.amount || 0), 0),
    [incomes]
  );
  const totalExpense = useMemo(
    () => expenses.reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses]
  );
  const totalPurchases = useMemo(
    () => purchases.reduce((a, p) => a + Number(p.total || 0), 0),
    [purchases]
  );

  const totalReceivable = useMemo(
    () => customers.reduce((a, c) => a + Number(c.dueAmount || 0), 0),
    [customers]
  );
  const totalPayable = useMemo(
    () => suppliers.reduce((a, s) => a + Number(s.dueAmount || 0), 0),
    [suppliers]
  );

  const cashBalance = totalSalesRevenue + totalOtherIncome - totalExpense - totalPurchases;
  const netProfit = totalSalesRevenue + totalOtherIncome - totalExpense - totalPurchases;

  // Charts
  const dailyChart = useMemo(() => {
    const rows: Record<string, { date: string; income: number; expense: number }> = {};
    const push = (d: string, k: 'income' | 'expense', v: number) => {
      const key = toISODate(d);
      rows[key] = rows[key] || { date: key, income: 0, expense: 0 };
      rows[key][k] += v;
    };
    sales.forEach(s => push(s.date || today(), 'income', Number(s.totalPrice ?? s.totalAmount) || 0));
    incomes.forEach(i => push(i.date, 'income', Number(i.amount || 0)));
    expenses.forEach(e => push(e.date, 'expense', Number(e.amount || 0)));
    purchases.forEach(p => push(p.date, 'expense', Number(p.total || 0)));
    return Object.values(rows)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [sales, incomes, expenses, purchases]);

  const monthlyChart = useMemo(() => {
    const rows: Record<string, { month: string; income: number; expense: number }> = {};
    const push = (d: string, k: 'income' | 'expense', v: number) => {
      const key = monthKey(d);
      rows[key] = rows[key] || { month: key, income: 0, expense: 0 };
      rows[key][k] += v;
    };
    sales.forEach(s => push(s.date || today(), 'income', Number(s.totalPrice ?? s.totalAmount) || 0));
    incomes.forEach(i => push(i.date, 'income', Number(i.amount || 0)));
    expenses.forEach(e => push(e.date, 'expense', Number(e.amount || 0)));
    purchases.forEach(p => push(p.date, 'expense', Number(p.total || 0)));
    return Object.values(rows).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [sales, incomes, expenses, purchases]);

  // ---------- Print ----------
  const printBlock = (title: string, html: string) => {
    const w = window.open('', '_blank', 'width=900,height=750');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${title} — ${shopName || 'রনি টেলিকম'}</title>
      <style>
        @media print {
          body { padding: 16px !important; }
          .no-print { display: none !important; }
        }
        body {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 36px;
          color: #0f172a;
          background: #ffffff;
          max-width: 800px;
          margin: 0 auto;
        }
        .header-container {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 2px solid #008d44;
          margin-bottom: 24px;
        }
        .shop-title {
          font-size: 26px;
          font-weight: 900;
          color: #008d44;
          letter-spacing: -0.5px;
          margin: 0 0 6px 0;
        }
        .shop-address {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .report-badge {
          display: inline-block;
          background: #f0fdf4;
          color: #008d44;
          border: 1px solid #bbf7d0;
          font-size: 13px;
          font-weight: 800;
          padding: 4px 18px;
          border-radius: 9999px;
          margin: 4px 0;
        }
        .report-date {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-top: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-size: 13px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          text-align: left;
        }
        th {
          background: #f8fafc;
          color: #1e293b;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .right {
          text-align: right;
          font-family: monospace;
          font-weight: 700;
        }
        .muted {
          color: #64748b;
          font-size: 12px;
        }
        .totals {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 2px solid #e2e8f0;
          font-size: 14px;
          text-align: right;
          font-weight: 800;
        }
        .totals div { margin: 4px 0; }
        .footer-note {
          margin-top: 36px;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
        }
      </style></head><body>
      <div class="header-container">
        <h1 class="shop-title">${shopName || 'রনি টেলিকম'}</h1>
        <div class="shop-address">${shopAddress || ''} ${shopPhone ? ' · 📱 ' + shopPhone : ''}</div>
        <div class="report-badge">📄 ${title}</div>
        <div class="report-date">🕒 প্রিন্টের তারিখ ও সময়: ${new Date().toLocaleString()}</div>
      </div>
      ${html}
      <div class="footer-note">রনি টেলিকম পস সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে জেনারেট করা ডক্‌যুমেন্ট।</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => { try { w.print(); } catch { /* ignore */ } }, 250);
  };

  // ---------- Sub-views ----------
  const tabs: { key: TabKey; labelBn: string; labelEn: string; icon: any }[] = [
    { key: 'dashboard',    labelBn: 'ড্যাশবোর্ড',      labelEn: 'Dashboard',    icon: BarChart3 },
    { key: 'income',       labelBn: 'আয়',              labelEn: 'Income',       icon: TrendingUp },
    { key: 'expenses',     labelBn: 'খরচ',             labelEn: 'Expenses',     icon: TrendingDown },
    { key: 'transactions', labelBn: 'লেনদেন',          labelEn: 'Transactions', icon: FileText },
    { key: 'dues',         labelBn: 'বাকি ব্যবস্থাপনা', labelEn: 'Due Management', icon: Wallet },
    { key: 'reports',      labelBn: 'রিপোর্ট',         labelEn: 'Reports',      icon: FileText },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
            {t('অ্যাকাউন্টিং ব্যবস্থাপনা', 'Accounting Management')}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 truncate">
            {t('আয়, খরচ, বাকি ও রিপোর্ট এক জায়গায়', 'Income, expenses, dues and reports in one place')}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
          {tabs.map(tb => {
            const Icon = tb.icon;
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={
                  'flex items-center gap-1.5 whitespace-nowrap px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors ' +
                  (active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300')
                }
              >
                <Icon size={16} />
                {t(tb.labelBn, tb.labelEn)}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'dashboard' && (
        <DashboardTab
          incomeToday={incomeToday}
          expenseToday={expenseToday}
          cashBalance={cashBalance}
          totalReceivable={totalReceivable}
          totalPayable={totalPayable}
          netProfit={netProfit}
          dailyChart={dailyChart}
          monthlyChart={monthlyChart}
          t={t}
        />
      )}

      {tab === 'income' && (
        <IncomeTab
          incomes={incomes}
          setIncomes={setIncomes}
          sales={sales}
          t={t}
          showToast={showToast}
        />
      )}

      {tab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          setExpenses={setExpenses}
          categories={expenseCategories}
          t={t}
          showToast={showToast}
        />
      )}

      {tab === 'transactions' && (
        <TransactionsTab
          sales={sales}
          purchases={purchases}
          expenses={expenses}
          incomes={incomes}
          t={t}
          printBlock={printBlock}
        />
      )}

      {tab === 'dues' && (
        <DuesTab
          customers={customers}
          suppliers={suppliers}
          setCustomers={props.setCustomers}
          setSuppliers={props.setSuppliers}
          t={t}
          showToast={showToast}
        />
      )}

      {tab === 'reports' && (
        <ReportsTab
          sales={sales}
          purchases={purchases}
          expenses={expenses}
          incomes={incomes}
          customers={customers}
          suppliers={suppliers}
          t={t}
          printBlock={printBlock}
        />
      )}
    </div>
  );
}

// ---------- Card ----------
function StatCard(props: {
  label: string;
  value: string;
  hint?: string;
  icon: any;
  tone?: 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'violet';
}) {
  const { label, value, hint, icon: Icon, tone = 'blue' } = props;
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <div className={'rounded-xl border p-4 ' + tones[tone]}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</div>
        <Icon size={18} className="opacity-70" />
      </div>
      <div className="mt-2 text-lg md:text-2xl font-bold">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] opacity-70">{hint}</div> : null}
    </div>
  );
}

// ---------- Dashboard ----------
function DashboardTab(p: {
  incomeToday: number; expenseToday: number; cashBalance: number;
  totalReceivable: number; totalPayable: number; netProfit: number;
  dailyChart: any[]; monthlyChart: any[];
  t: (bn: string, en: string) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label={p.t("আজকের আয়", "Today's income")} value={fmt(p.incomeToday)} icon={TrendingUp} tone="green" />
        <StatCard label={p.t("আজকের খরচ", "Today's expenses")} value={fmt(p.expenseToday)} icon={TrendingDown} tone="red" />
        <StatCard label={p.t("ক্যাশ ব্যালেন্স", "Cash balance")} value={fmt(p.cashBalance)} icon={Wallet} tone="blue" />
        <StatCard label={p.t("মোট পাওনা", "Total receivable")} value={fmt(p.totalReceivable)} icon={Users} tone="amber" />
        <StatCard label={p.t("সাপ্লায়ার বাকি", "Total payable")} value={fmt(p.totalPayable)} icon={Truck} tone="violet" />
        <StatCard label={p.t("নীট মুনাফা", "Net profit")} value={fmt(p.netProfit)} icon={DollarSign} tone={p.netProfit >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800 mb-3">
            {p.t('দৈনিক আয় বনাম খরচ (১৪ দিন)', 'Daily income vs expenses (14d)')}
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={p.dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" name={p.t('আয়', 'Income')} fill="#10b981" />
                <Bar dataKey="expense" name={p.t('খরচ', 'Expense')} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800 mb-3">
            {p.t('মাসিক ট্রেন্ড', 'Monthly trends')}
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={p.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="income" name={p.t('আয়', 'Income')} stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" name={p.t('খরচ', 'Expense')} stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Income ----------
function IncomeTab(p: {
  incomes: IncomeRow[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeRow[]>>;
  sales: Sale[];
  t: (bn: string, en: string) => string;
  showToast?: (m: string, k?: any) => void;
}) {
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editing, setEditing] = useState<IncomeRow | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return p.incomes
      .filter(i =>
        !q ||
        (i.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(q.toLowerCase())
      )
      .filter(i => !from || i.date >= from)
      .filter(i => !to || i.date <= to)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [p.incomes, q, from, to]);

  const salesIncomeSummary = useMemo(() => {
    const total = p.sales.reduce((a, s) => a + (Number(s.totalPrice ?? s.totalAmount) || 0), 0);
    return { count: p.sales.length, total };
  }, [p.sales]);

  const totalOther = filtered.reduce((a, i) => a + Number(i.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={p.t('বিক্রয় থেকে আয়', 'Sales revenue')} value={fmt(salesIncomeSummary.total)} hint={`${salesIncomeSummary.count} ${p.t('বিক্রয়', 'sales')}`} icon={TrendingUp} tone="green" />
        <StatCard label={p.t('অন্যান্য আয়', 'Other income')} value={fmt(totalOther)} icon={ArrowUpRight} tone="blue" />
        <StatCard label={p.t('মোট আয়', 'Total income')} value={fmt(salesIncomeSummary.total + totalOther)} icon={DollarSign} tone="violet" />
      </div>

      <Toolbar
        onAdd={() => { setEditing(null); setOpen(true); }}
        q={q} setQ={setQ}
        from={from} setFrom={setFrom} to={to} setTo={setTo}
        addLabel={p.t('নতুন আয়', 'Add income')}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2 text-left">{p.t('তারিখ', 'Date')}</th>
              <th className="p-2 text-left">{p.t('শিরোনাম', 'Title')}</th>
              <th className="p-2 text-left">{p.t('বিভাগ', 'Category')}</th>
              <th className="p-2 text-right">{p.t('পরিমাণ', 'Amount')}</th>
              <th className="p-2 text-right">{p.t('কার্যক্রম', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">{p.t('কোনো এন্ট্রি নেই', 'No entries')}</td></tr>
            )}
            {filtered.map(row => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-2">{row.date}</td>
                <td className="p-2 font-medium text-slate-800">{row.title}</td>
                <td className="p-2 text-slate-600">{row.category}</td>
                <td className="p-2 text-right text-emerald-700 font-semibold">{fmt(row.amount)}</td>
                <td className="p-2 text-right">
                  <button className="p-1 text-slate-500 hover:text-blue-600" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 size={14} /></button>
                  <button className="p-1 text-slate-500 hover:text-rose-600" onClick={() => {
                    if (confirm(p.t('মুছবেন?', 'Delete this entry?'))) {
                      p.setIncomes(prev => prev.filter(x => x.id !== row.id));
                      p.showToast && p.showToast(p.t('মুছে ফেলা হয়েছে', 'Deleted'), 'success');
                    }
                  }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <IncomeExpenseModal
          title={editing ? p.t('আয় সম্পাদনা', 'Edit income') : p.t('নতুন আয়', 'Add income')}
          initial={editing}
          categories={['Sales', 'Service', 'Rent', 'Interest', 'Other']}
          onClose={() => setOpen(false)}
          onSave={(row) => {
            if (editing) {
              p.setIncomes(prev => prev.map(x => x.id === editing.id ? { ...editing, ...row } : x));
            } else {
              const id = 'INC-' + Date.now().toString(36).toUpperCase();
              p.setIncomes(prev => [{ id, ...row }, ...prev]);
            }
            setOpen(false);
            p.showToast && p.showToast(p.t('সংরক্ষণ হয়েছে', 'Saved'), 'success');
          }}
          t={p.t}
        />
      )}
    </div>
  );
}

// ---------- Expenses ----------
function ExpensesTab(p: {
  expenses: ExpenseRow[];
  setExpenses: React.Dispatch<React.SetStateAction<any[]>>;
  categories: string[];
  t: (bn: string, en: string) => string;
  showToast?: (m: string, k?: any) => void;
}) {
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [cat, setCat] = useState('');
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return p.expenses
      .filter(e =>
        !q ||
        (e.title || '').toLowerCase().includes(q.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(q.toLowerCase())
      )
      .filter(e => !cat || e.category === cat)
      .filter(e => !from || e.date >= from)
      .filter(e => !to || e.date <= to)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [p.expenses, q, cat, from, to]);

  const total = filtered.reduce((a, e) => a + Number(e.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={p.t('মোট এন্ট্রি', 'Total entries')} value={String(filtered.length)} icon={FileText} tone="slate" />
        <StatCard label={p.t('মোট খরচ', 'Total expenses')} value={fmt(total)} icon={TrendingDown} tone="red" />
        <StatCard label={p.t('বিভাগ', 'Categories')} value={String(p.categories.length)} icon={Filter} tone="blue" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Toolbar
          onAdd={() => { setEditing(null); setOpen(true); }}
          q={q} setQ={setQ}
          from={from} setFrom={setFrom} to={to} setTo={setTo}
          addLabel={p.t('নতুন খরচ', 'Add expense')}
        />
        <select value={cat} onChange={e => setCat(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
          <option value="">{p.t('সব বিভাগ', 'All categories')}</option>
          {p.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2 text-left">{p.t('তারিখ', 'Date')}</th>
              <th className="p-2 text-left">{p.t('শিরোনাম', 'Title')}</th>
              <th className="p-2 text-left">{p.t('বিভাগ', 'Category')}</th>
              <th className="p-2 text-right">{p.t('পরিমাণ', 'Amount')}</th>
              <th className="p-2 text-right">{p.t('কার্যক্রম', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-400">{p.t('কোনো খরচ নেই', 'No expenses')}</td></tr>
            )}
            {filtered.map(row => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-2">{row.date}</td>
                <td className="p-2 font-medium text-slate-800">{row.title}</td>
                <td className="p-2 text-slate-600">{row.category}</td>
                <td className="p-2 text-right text-rose-700 font-semibold">{fmt(row.amount)}</td>
                <td className="p-2 text-right">
                  <button className="p-1 text-slate-500 hover:text-blue-600" onClick={() => { setEditing(row); setOpen(true); }}><Edit3 size={14} /></button>
                  <button className="p-1 text-slate-500 hover:text-rose-600" onClick={() => {
                    if (confirm(p.t('মুছবেন?', 'Delete this entry?'))) {
                      p.setExpenses(prev => prev.filter((x: any) => x.id !== row.id));
                      p.showToast && p.showToast(p.t('মুছে ফেলা হয়েছে', 'Deleted'), 'success');
                    }
                  }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <IncomeExpenseModal
          title={editing ? p.t('খরচ সম্পাদনা', 'Edit expense') : p.t('নতুন খরচ', 'Add expense')}
          initial={editing}
          categories={p.categories.length ? p.categories : ['General', 'Rent & Bills', 'Salaries', 'Travel', 'Utility', 'Other']}
          onClose={() => setOpen(false)}
          onSave={(row) => {
            if (editing) {
              p.setExpenses(prev => prev.map((x: any) => x.id === editing.id ? { ...editing, ...row } : x));
            } else {
              const id = 'EXP-' + Date.now().toString(36).toUpperCase();
              p.setExpenses(prev => [{ id, ...row }, ...prev]);
            }
            setOpen(false);
            p.showToast && p.showToast(p.t('সংরক্ষণ হয়েছে', 'Saved'), 'success');
          }}
          t={p.t}
        />
      )}
    </div>
  );
}

// ---------- Transactions ----------
function TransactionsTab(p: {
  sales: Sale[]; purchases: Purchase[]; expenses: ExpenseRow[]; incomes: IncomeRow[];
  t: (bn: string, en: string) => string;
  printBlock: (title: string, html: string) => void;
}) {
  const [type, setType] = useState<'all' | 'income' | 'sale' | 'expense' | 'purchase'>('all');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const rows = useMemo(() => {
    const all: any[] = [];
    p.sales.forEach(s => all.push({
      id: s.id, ref: s.id, date: toISODate(s.date || today()),
      type: 'sale', party: s.customerName || '-', amount: Number(s.totalPrice ?? s.totalAmount) || 0, sign: +1,
    }));
    p.incomes.forEach(i => all.push({
      id: i.id, ref: i.id, date: i.date, type: 'income', party: i.title, amount: Number(i.amount || 0), sign: +1,
    }));
    p.expenses.forEach(e => all.push({
      id: e.id, ref: e.id, date: e.date, type: 'expense', party: e.title, amount: Number(e.amount || 0), sign: -1,
    }));
    p.purchases.forEach(pu => all.push({
      id: pu.id, ref: pu.id, date: toISODate(pu.date || today()), type: 'purchase',
      party: pu.supplier || '-', amount: Number(pu.total || 0), sign: -1,
    }));
    return all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [p.sales, p.purchases, p.expenses, p.incomes]);

  const filtered = useMemo(() => {
    return rows
      .filter(r => type === 'all' || r.type === type)
      .filter(r => !q ||
        (r.ref || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.party || '').toLowerCase().includes(q.toLowerCase()))
      .filter(r => !from || r.date >= from)
      .filter(r => !to || r.date <= to);
  }, [rows, type, q, from, to]);

  const totalIn = filtered.filter(r => r.sign > 0).reduce((a, r) => a + r.amount, 0);
  const totalOut = filtered.filter(r => r.sign < 0).reduce((a, r) => a + r.amount, 0);

  const exportCsv = () => {
    const header = ['Date', 'Ref', 'Type', 'Party', 'In', 'Out'];
    const lines = [header.join(',')];
    filtered.forEach(r => {
      lines.push([
        r.date, r.ref, r.type, (r.party || '').replace(/,/g, ' '),
        r.sign > 0 ? r.amount : '', r.sign < 0 ? r.amount : '',
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transactions.csv';
    a.click();
  };

  const printIt = () => {
    const rowsHtml = filtered.map(r => `<tr>
      <td>${r.date}</td><td>${r.ref}</td><td>${r.type}</td><td>${r.party}</td>
      <td class="right">${r.sign > 0 ? fmt(r.amount) : ''}</td>
      <td class="right">${r.sign < 0 ? fmt(r.amount) : ''}</td>
    </tr>`).join('');
    p.printBlock('Transactions', `
      <table><thead><tr>
        <th>Date</th><th>Ref</th><th>Type</th><th>Party</th><th class="right">In</th><th class="right">Out</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      <div class="totals">
        <div><b>Total in:</b> ${fmt(totalIn)}</div>
        <div><b>Total out:</b> ${fmt(totalOut)}</div>
        <div><b>Net:</b> ${fmt(totalIn - totalOut)}</div>
      </div>`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={p.t('মোট আসা', 'Total in')} value={fmt(totalIn)} icon={ArrowUpRight} tone="green" />
        <StatCard label={p.t('মোট যাওয়া', 'Total out')} value={fmt(totalOut)} icon={ArrowDownRight} tone="red" />
        <StatCard label={p.t('নীট', 'Net')} value={fmt(totalIn - totalOut)} icon={DollarSign} tone={(totalIn - totalOut) >= 0 ? 'green' : 'red'} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={p.t('রেফারেন্স বা পার্টি...', 'Reference or party...')}
            className="pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-sm w-56" />
        </div>
        <select value={type} onChange={e => setType(e.target.value as any)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
          <option value="all">{p.t('সব ধরন', 'All types')}</option>
          <option value="sale">{p.t('বিক্রয়', 'Sale')}</option>
          <option value="income">{p.t('আয়', 'Income')}</option>
          <option value="expense">{p.t('খরচ', 'Expense')}</option>
          <option value="purchase">{p.t('ক্রয়', 'Purchase')}</option>
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
        <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
          <FileText size={14} /> {p.t('CSV', 'CSV')}
        </button>
        <button onClick={printIt} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
          <Printer size={14} /> {p.t('প্রিন্ট', 'Print')}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2 text-left">{p.t('তারিখ', 'Date')}</th>
              <th className="p-2 text-left">{p.t('রেফ.', 'Ref')}</th>
              <th className="p-2 text-left">{p.t('ধরন', 'Type')}</th>
              <th className="p-2 text-left">{p.t('পার্টি', 'Party')}</th>
              <th className="p-2 text-right">{p.t('আসা', 'In')}</th>
              <th className="p-2 text-right">{p.t('যাওয়া', 'Out')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">{p.t('কোনো লেনদেন নেই', 'No transactions')}</td></tr>}
            {filtered.map(r => (
              <tr key={r.type + r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-2">{r.date}</td>
                <td className="p-2 font-mono text-xs">{r.ref}</td>
                <td className="p-2 capitalize"><span className={
                  'inline-block px-2 py-0.5 rounded-full text-xs ' +
                  (r.sign > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
                }>{r.type}</span></td>
                <td className="p-2">{r.party}</td>
                <td className="p-2 text-right text-emerald-700">{r.sign > 0 ? fmt(r.amount) : ''}</td>
                <td className="p-2 text-right text-rose-700">{r.sign < 0 ? fmt(r.amount) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Dues ----------
function DuesTab(p: {
  customers: Customer[]; suppliers: Supplier[];
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  setSuppliers?: React.Dispatch<React.SetStateAction<any[]>>;
  t: (bn: string, en: string) => string;
  showToast?: (m: string, k?: any) => void;
}) {
  const [sub, setSub] = useState<'customer' | 'supplier'>('customer');
  const [q, setQ] = useState('');
  const [onlyDue, setOnlyDue] = useState(true);
  const [payFor, setPayFor] = useState<{ kind: 'customer' | 'supplier'; row: any } | null>(null);

  const list = sub === 'customer' ? p.customers : p.suppliers;
  const filtered = useMemo(() => {
    return list
      .filter((r: any) =>
        !q ||
        (r.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (r.phone || '').toLowerCase().includes(q.toLowerCase()))
      .filter((r: any) => !onlyDue || Number(r.dueAmount || 0) > 0)
      .sort((a: any, b: any) => Number(b.dueAmount || 0) - Number(a.dueAmount || 0));
  }, [list, q, onlyDue]);

  const total = filtered.reduce((a: number, r: any) => a + Number(r.dueAmount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setSub('customer')}
            className={'px-3 py-1.5 text-sm rounded-md ' + (sub === 'customer' ? 'bg-blue-600 text-white' : 'text-slate-600')}
          >
            <Users size={14} className="inline mr-1" /> {p.t('গ্রাহক বাকি', 'Customer dues')}
          </button>
          <button
            onClick={() => setSub('supplier')}
            className={'px-3 py-1.5 text-sm rounded-md ' + (sub === 'supplier' ? 'bg-blue-600 text-white' : 'text-slate-600')}
          >
            <Truck size={14} className="inline mr-1" /> {p.t('সরবরাহকারী বাকি', 'Supplier dues')}
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={p.t('নাম বা ফোন...', 'Name or phone...')}
            className="pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-sm w-56" />
        </div>
        <label className="text-sm text-slate-600 inline-flex items-center gap-1">
          <input type="checkbox" checked={onlyDue} onChange={e => setOnlyDue(e.target.checked)} />
          {p.t('শুধু বাকিসহ', 'Only with due')}
        </label>
        <div className="ml-auto text-sm text-slate-600">
          {p.t('মোট', 'Total')}: <span className="font-semibold">{fmt(total)}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-2 text-left">{p.t('নাম', 'Name')}</th>
              <th className="p-2 text-left">{p.t('ফোন', 'Phone')}</th>
              <th className="p-2 text-right">{sub === 'customer' ? p.t('পাওনা', 'Receivable') : p.t('বাকি', 'Payable')}</th>
              <th className="p-2 text-right">{p.t('কার্যক্রম', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400">{p.t('কোনো এন্ট্রি নেই', 'No entries')}</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-2 font-medium text-slate-800">{r.name || '-'}</td>
                <td className="p-2 text-slate-600">{r.phone || '-'}</td>
                <td className="p-2 text-right font-semibold {sub === 'customer' ? 'text-amber-700' : 'text-violet-700'}">
                  <span className={sub === 'customer' ? 'text-amber-700' : 'text-violet-700'}>{fmt(r.dueAmount || 0)}</span>
                </td>
                <td className="p-2 text-right">
                  <button
                    className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    onClick={() => setPayFor({ kind: sub, row: r })}
                  >
                    {sub === 'customer' ? p.t('পেমেন্ট নিন', 'Receive payment') : p.t('পেমেন্ট দিন', 'Pay supplier')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payFor && (
        <PayModal
          kind={payFor.kind}
          row={payFor.row}
          onClose={() => setPayFor(null)}
          onSubmit={(amount) => {
            const setter = payFor.kind === 'customer' ? p.setCustomers : p.setSuppliers;
            if (setter) {
              setter((prev: any[]) => prev.map((x: any) => x.id === payFor.row.id
                ? {
                    ...x,
                    dueAmount: Math.max(0, Number(x.dueAmount || 0) - amount),
                    paymentHistory: [
                      { at: new Date().toISOString(), amount, kind: payFor.kind === 'customer' ? 'received' : 'paid' },
                      ...(x.paymentHistory || []),
                    ],
                  }
                : x));
            }
            p.showToast && p.showToast(p.t('পেমেন্ট নথিভুক্ত হয়েছে', 'Payment recorded'), 'success');
            setPayFor(null);
          }}
          t={p.t}
        />
      )}
    </div>
  );
}

function PayModal(p: { kind: 'customer' | 'supplier'; row: any; onClose: () => void; onSubmit: (n: number) => void; t: (bn: string, en: string) => string; }) {
  const [amount, setAmount] = useState<number>(Number(p.row.dueAmount || 0));
  const history = (p.row.paymentHistory || []) as { at: string; amount: number; kind: string }[];
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={p.onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{p.kind === 'customer' ? p.t('পেমেন্ট গ্রহণ', 'Receive payment') : p.t('সরবরাহকারী পেমেন্ট', 'Pay supplier')}</h3>
          <button onClick={p.onClose} className="p-1 text-slate-500 hover:text-slate-800"><XIcon size={16} /></button>
        </div>
        <div className="text-sm text-slate-600 mb-2">{p.row.name} · {p.t('বাকি', 'Due')}: <b>{fmt(p.row.dueAmount || 0)}</b></div>
        <label className="block text-xs text-slate-500 mb-1">{p.t('পরিমাণ', 'Amount')}</label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />

        {history.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600 mb-1">{p.t('পেমেন্ট ইতিহাস', 'Payment history')}</div>
            <div className="max-h-32 overflow-y-auto text-xs">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-500">{new Date(h.at).toLocaleString()}</span>
                  <span className="font-medium">{fmt(h.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={p.onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">{p.t('বাতিল', 'Cancel')}</button>
          <button
            onClick={() => { if (amount > 0) p.onSubmit(amount); }}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Save size={14} /> {p.t('সংরক্ষণ', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Reports ----------
function ReportsTab(p: {
  sales: Sale[]; purchases: Purchase[]; expenses: ExpenseRow[]; incomes: IncomeRow[];
  customers: Customer[]; suppliers: Supplier[];
  t: (bn: string, en: string) => string;
  printBlock: (title: string, html: string) => void;
}) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const within = (d: string) => (!from || d >= from) && (!to || d <= to);

  const totals = useMemo(() => {
    const salesIn = p.sales
      .filter(s => within(toISODate(s.date || today())))
      .reduce((a, s) => a + (Number(s.totalPrice ?? s.totalAmount) || 0), 0);
    const otherIn = p.incomes.filter(i => within(i.date)).reduce((a, i) => a + Number(i.amount || 0), 0);
    const expOut = p.expenses.filter(e => within(e.date)).reduce((a, e) => a + Number(e.amount || 0), 0);
    const purOut = p.purchases
      .filter(pu => within(toISODate(pu.date || today())))
      .reduce((a, pu) => a + Number(pu.total || 0), 0);
    return {
      salesIn, otherIn, expOut, purOut,
      totalIn: salesIn + otherIn,
      totalOut: expOut + purOut,
      net: (salesIn + otherIn) - (expOut + purOut),
    };
  }, [p.sales, p.purchases, p.expenses, p.incomes, from, to]);

  const receivable = p.customers.reduce((a: number, c: any) => a + Number(c.dueAmount || 0), 0);
  const payable = p.suppliers.reduce((a: number, s: any) => a + Number(s.dueAmount || 0), 0);

  const reports = [
    {
      key: 'pl',
      title: p.t('লাভ ও ক্ষতি', 'Profit & loss'),
      run: () => p.printBlock('Profit & Loss', `
        <table><tbody>
          <tr><th>Sales revenue</th><td class="right">${fmt(totals.salesIn)}</td></tr>
          <tr><th>Other income</th><td class="right">${fmt(totals.otherIn)}</td></tr>
          <tr><th>Total income</th><td class="right"><b>${fmt(totals.totalIn)}</b></td></tr>
          <tr><th>Purchases</th><td class="right">${fmt(totals.purOut)}</td></tr>
          <tr><th>Expenses</th><td class="right">${fmt(totals.expOut)}</td></tr>
          <tr><th>Total outflow</th><td class="right"><b>${fmt(totals.totalOut)}</b></td></tr>
          <tr><th>Net profit</th><td class="right"><b>${fmt(totals.net)}</b></td></tr>
        </tbody></table>`),
    },
    {
      key: 'income',
      title: p.t('আয় রিপোর্ট', 'Income report'),
      run: () => {
        const rows = [
          ...p.sales.filter(s => within(toISODate(s.date || today()))).map(s => ({
            date: toISODate(s.date || today()), ref: s.id, cat: 'Sale',
            amt: Number(s.totalPrice ?? s.totalAmount) || 0,
          })),
          ...p.incomes.filter(i => within(i.date)).map(i => ({
            date: i.date, ref: i.id, cat: i.category, amt: Number(i.amount || 0),
          })),
        ].sort((a, b) => b.date.localeCompare(a.date));
        const html = rows.map(r => `<tr><td>${r.date}</td><td>${r.ref}</td><td>${r.cat}</td><td class="right">${fmt(r.amt)}</td></tr>`).join('');
        p.printBlock('Income Report', `
          <table><thead><tr><th>Date</th><th>Ref</th><th>Category</th><th class="right">Amount</th></tr></thead>
          <tbody>${html}</tbody></table>
          <div class="totals"><div><b>Total: ${fmt(rows.reduce((a, r) => a + r.amt, 0))}</b></div></div>`);
      },
    },
    {
      key: 'expense',
      title: p.t('খরচ রিপোর্ট', 'Expense report'),
      run: () => {
        const rows = p.expenses.filter(e => within(e.date))
          .sort((a, b) => b.date.localeCompare(a.date));
        const html = rows.map(r => `<tr><td>${r.date}</td><td>${r.id}</td><td>${r.category}</td><td>${r.title}</td><td class="right">${fmt(r.amount)}</td></tr>`).join('');
        p.printBlock('Expense Report', `
          <table><thead><tr><th>Date</th><th>Ref</th><th>Category</th><th>Title</th><th class="right">Amount</th></tr></thead>
          <tbody>${html}</tbody></table>
          <div class="totals"><div><b>Total: ${fmt(rows.reduce((a, r) => a + Number(r.amount || 0), 0))}</b></div></div>`);
      },
    },
    {
      key: 'due',
      title: p.t('বাকি রিপোর্ট', 'Due report'),
      run: () => {
        const custRows = p.customers.filter((c: any) => Number(c.dueAmount || 0) > 0)
          .map((c: any) => `<tr><td>Customer</td><td>${c.name || '-'}</td><td>${c.phone || ''}</td><td class="right">${fmt(c.dueAmount || 0)}</td></tr>`).join('');
        const supRows = p.suppliers.filter((s: any) => Number(s.dueAmount || 0) > 0)
          .map((s: any) => `<tr><td>Supplier</td><td>${s.name || '-'}</td><td>${s.phone || ''}</td><td class="right">${fmt(s.dueAmount || 0)}</td></tr>`).join('');
        p.printBlock('Due Report', `
          <table><thead><tr><th>Type</th><th>Name</th><th>Phone</th><th class="right">Due</th></tr></thead>
          <tbody>${custRows}${supRows}</tbody></table>
          <div class="totals">
            <div><b>Total receivable:</b> ${fmt(receivable)}</div>
            <div><b>Total payable:</b> ${fmt(payable)}</div>
          </div>`);
      },
    },
    {
      key: 'cash',
      title: p.t('ক্যাশ ফ্লো সারাংশ', 'Cash flow summary'),
      run: () => p.printBlock('Cash Flow Summary', `
        <table><tbody>
          <tr><th>Cash in (sales + income)</th><td class="right">${fmt(totals.totalIn)}</td></tr>
          <tr><th>Cash out (expenses + purchases)</th><td class="right">${fmt(totals.totalOut)}</td></tr>
          <tr><th>Net cash flow</th><td class="right"><b>${fmt(totals.net)}</b></td></tr>
        </tbody></table>`),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-600">{p.t('তারিখ', 'From')}</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
        <label className="text-sm text-slate-600">{p.t('তারিখ', 'To')}</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label={p.t('মোট আয়', 'Total income')} value={fmt(totals.totalIn)} icon={TrendingUp} tone="green" />
        <StatCard label={p.t('মোট খরচ', 'Total outflow')} value={fmt(totals.totalOut)} icon={TrendingDown} tone="red" />
        <StatCard label={p.t('নীট', 'Net')} value={fmt(totals.net)} icon={DollarSign} tone={totals.net >= 0 ? 'green' : 'red'} />
        <StatCard label={p.t('পাওনা', 'Receivable')} value={fmt(receivable)} icon={Users} tone="amber" />
        <StatCard label={p.t('সাপ্লায়ার বাকি', 'Payable')} value={fmt(payable)} icon={Truck} tone="violet" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(r => (
          <div key={r.key} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">{r.title}</div>
              <div className="text-xs text-slate-500">{p.t('তারিখ ফিল্টার প্রযোজ্য', 'Date filter applies')}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={r.run} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs text-white hover:bg-blue-700">
                <Printer size={12} /> {p.t('প্রিন্ট', 'Print')}
              </button>
              <button onClick={r.run} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs hover:bg-slate-50">
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Shared bits ----------
function Toolbar(props: {
  onAdd: () => void;
  q: string; setQ: (v: string) => void;
  from: string; setFrom: (v: string) => void;
  to: string; setTo: (v: string) => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={props.onAdd} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
        <Plus size={14} /> {props.addLabel}
      </button>
      <div className="relative">
        <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
        <input value={props.q} onChange={e => props.setQ(e.target.value)} placeholder="Search..."
          className="pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-sm w-56" />
      </div>
      <input type="date" value={props.from} onChange={e => props.setFrom(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      <input type="date" value={props.to} onChange={e => props.setTo(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
    </div>
  );
}

function IncomeExpenseModal(props: {
  title: string;
  initial: (IncomeRow | ExpenseRow) | null;
  categories: string[];
  onClose: () => void;
  onSave: (row: Omit<IncomeRow, 'id'>) => void;
  t: (bn: string, en: string) => string;
}) {
  const init = props.initial;
  const [title, setTitle] = useState(init?.title || '');
  const [category, setCategory] = useState(init?.category || (props.categories[0] || 'General'));
  const [amount, setAmount] = useState<number>(Number(init?.amount || 0));
  const [date, setDate] = useState(init?.date || today());
  const [note, setNote] = useState(init?.note || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={props.onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{props.title}</h3>
          <button onClick={props.onClose} className="p-1 text-slate-500 hover:text-slate-800"><XIcon size={16} /></button>
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">{props.t('শিরোনাম', 'Title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{props.t('বিভাগ', 'Category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                {props.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{props.t('তারিখ', 'Date')}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{props.t('পরিমাণ', 'Amount')}</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{props.t('নোট', 'Note')}</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={props.onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">{props.t('বাতিল', 'Cancel')}</button>
          <button
            onClick={() => {
              if (!title.trim() || amount <= 0) return;
              props.onSave({ title: title.trim(), category, amount, date, note });
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Save size={14} /> {props.t('সংরক্ষণ', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Accounting;
