import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './pos-app/context/AppContext.tsx';
import './index.css';

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  props: { children: React.ReactNode };
  state: { hasError: boolean; error: any } = { hasError: false, error: null };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
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
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                style={{ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🔄 সাধারণ রিফ্রেশ দিন (Reload)
              </button>
              <button
                onClick={() => {
                  try {
                    const keysToKeep = ['saim_auth_user', 'firebase:authUser', 'smart_pos_', 'saim_store_'];
                    const preserved: Record<string, string> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && keysToKeep.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                        preserved[key] = localStorage.getItem(key) || '';
                      }
                    }
                    localStorage.clear();
                    Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
                  } catch (e) {
                    console.error("Cache clear error:", e);
                  }
                  window.location.reload();
                }}
                style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🧹 ক্যাশ পরিষ্কার করে রিলোড দিন
              </button>
            </div>
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
