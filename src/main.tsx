import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './pos-app/context/AppContext.tsx';
import './index.css';

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global React Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#0f172a', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#f43f5e', fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>⚠️ NexusERP সিস্টেম লোডিং নোটিশ</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
              অ্যাপ্লিকেশনের লোকাল স্টেট বা ক্যাশ আপডেট হচ্ছে। সমস্যা সমাধানের জন্য নিচের বাটনটিতে ক্লিক করুন।
            </p>
            <pre style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', color: '#fb7185', fontSize: '11px', overflowX: 'auto' }}>
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}
            >
              🔄 লোকাল ডাটা রিসেট ও রিফ্রেশ দিন (Reset & Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </GlobalErrorBoundary>
    </StrictMode>
  );
}
