import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global React Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('it_dashboard_auth');
      localStorage.removeItem('it_dashboard_data');
      localStorage.removeItem('it_dashboard_assets');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #07081c 0%, #081435 50%, #031229 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚙️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.4rem', color: '#60a5fa' }}>
              ระบบ IT Operations Dashboard
            </h2>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
              เกิดข้อผิดพลาดในการโหลดข้อมูลชั่วคราว กรุณากดปุ่มด้านล่างเพื่อล้างข้อมูลแคชและโหลดหน้าระบบใหม่
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                }}
              >
                🔄 ล้างแคชและโหลดระบบใหม่ (Clear Cache & Reload)
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#cbd5e1',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                รีเฟรชหน้าจอปกติ (Refresh)
              </button>
            </div>
            {this.state.error?.message && (
              <details style={{ marginTop: '20px', textAlign: 'left', color: '#ef4444', fontSize: '0.78rem' }}>
                <summary style={{ cursor: 'pointer', color: '#64748b' }}>ดูรายละเอียดข้อผิดพลาดทางเทคนิค</summary>
                <pre style={{ overflowX: 'auto', marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px' }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </GlobalErrorBoundary>
  </StrictMode>,
)
