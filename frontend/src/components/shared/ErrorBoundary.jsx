import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ORBITOPS Interface ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '600px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          color: '#f8fafc',
          textAlign: 'center'
        }}>
          <div>
            <AlertTriangle size={48} style={{ color: '#f43f5e', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Interface Rendering Exception
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred inside the UI layer.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} /> Reload Mission Control
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
