import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ORBITOPS React ErrorBoundary caught an error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff9aa7', fontFamily: 'sans-serif', backgroundColor: '#07111f', minHeight: '100vh' }}>
          <h2>ORBITOPS Mission Control - Application Error</h2>
          <p>{this.state.error?.toString()}</p>
          <button style={{ padding: '10px 20px', cursor: 'pointer', background: '#39d5ff', border: 0, borderRadius: '4px', fontWeight: 'bold' }} onClick={() => window.location.reload()}>
            Reload Mission Control
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
