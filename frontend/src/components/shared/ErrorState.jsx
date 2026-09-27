import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function ErrorState({ title = 'Telemetry Link Unavailable', message, onRetry }) {
  return (
    <div style={{
      padding: '2.5rem 1.5rem',
      borderRadius: '16px',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(244, 63, 94, 0.25)',
      textAlign: 'center',
      color: '#cbd5e1',
      maxWidth: '500px',
      margin: '2rem auto'
    }}>
      <WifiOff size={40} style={{ color: '#f43f5e', marginBottom: '1rem' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 1.5rem', fontFamily: 'monospace' }}>
        {message || 'Could not connect to Express API on http://localhost:5000.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '8px',
            color: '#38bdf8',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      )}
    </div>
  );
}
