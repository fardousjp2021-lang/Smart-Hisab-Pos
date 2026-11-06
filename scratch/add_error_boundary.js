import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// Add ComponentErrorBoundary class definition if not present
const boundaryClass = `
class ComponentErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
          <h2 className="text-base font-extrabold flex items-center gap-2">⚠️ রিপোর্ট কেন্দ্র লোড সমস্যা</h2>
          <div className="text-xs font-mono bg-rose-100/80 p-3 rounded-xl overflow-x-auto text-rose-900 border border-rose-200">
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </div>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm transition">
            পুনরায় চেষ্টা করুন (Retry)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
`;

if (!app.includes('class ComponentErrorBoundary')) {
  app = app.replace('// Critical Variables & Bug Fix Rules', boundaryClass + '\n\n// Critical Variables & Bug Fix Rules');
}

// Wrap ReportCenter with ComponentErrorBoundary
app = app.replace(
  `{activeTab === 'reports' && (
              <ReportCenter`,
  `{activeTab === 'reports' && (
              <ComponentErrorBoundary>
                <ReportCenter`
);

app = app.replace(
  `userRole={sessionUser?.role}
              />
            )}`,
  `userRole={sessionUser?.role}
                />
              </ComponentErrorBoundary>
            )}`
);

fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
console.log('Successfully added ComponentErrorBoundary to App.tsx for ReportCenter!');
