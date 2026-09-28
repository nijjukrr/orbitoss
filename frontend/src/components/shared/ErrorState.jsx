import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function ErrorState({ title = 'MISSION DATA UNAVAILABLE', message, onRetry }) {
  return (
    <div style={{
      padding: '2.5rem 1.5rem',
      borderRadius: '12px',
      background: 'var(--surface-muted, #161616)',
      border: '1px solid var(--border-strong, #555555)',
      textAlign: 'center',
      color: 'var(--text-muted, #777777)',
      maxWidth: '500px',
      margin: '2rem auto'
    }}>
      <WifiOff size={40} style={{ color: 'var(--text-primary, #ffffff)', marginBottom: '1rem' }} />
      <h3 style={{
        fontSize: '1.15rem',
        fontWeight: 800,
        margin: '0 0 0.5rem',
        color: 'var(--text-primary, #ffffff)',
        letterSpacing: '1px',
        fontFamily: 'DM Mono, monospace'
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #bdbdbd)', margin: '0 0 1.5rem', fontFamily: 'monospace' }}>
        {message || 'Backend service could not be reached.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: 'var(--button-primary-bg, #ffffff)',
            border: '1px solid var(--button-primary-bg, #ffffff)',
            borderRadius: '6px',
            color: 'var(--button-primary-text, #000000)',
            fontSize: '0.85rem',
            fontWeight: 800,
            fontFamily: 'DM Mono, monospace',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={14} /> RETRY CONNECTION
        </button>
      )}
    </div>
  );
}

