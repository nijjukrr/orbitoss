import React from 'react';

export function StatusBadge({ status, label, size = 'md' }) {
  const normalized = String(status || 'NOMINAL').toUpperCase();

  let styles = {
    bg: 'var(--surface-muted)',
    border: '1px solid var(--border-strong)',
    text: 'var(--text-primary)',
    symbol: '●'
  };

  if (normalized === 'WARNING') {
    styles = {
      bg: 'var(--surface)',
      border: '1px solid var(--border-strong)',
      text: 'var(--text-secondary)',
      symbol: '!'
    };
  } else if (normalized === 'CRITICAL' || normalized === 'FAILED') {
    styles = {
      bg: 'var(--surface-muted)',
      border: '2px solid var(--text-primary)',
      text: 'var(--text-primary)',
      symbol: '⚠'
    };
  } else if (normalized === 'RESOLVED' || normalized === 'COMPLETED') {
    styles = {
      bg: 'var(--surface)',
      border: '1px solid var(--border)',
      text: 'var(--text-muted)',
      symbol: '✓'
    };
  } else if (normalized === 'OFFLINE' || normalized === 'MAINTENANCE') {
    styles = {
      bg: 'var(--surface)',
      border: '1px solid var(--border)',
      text: 'var(--text-muted)',
      symbol: '○'
    };
  } else if (normalized === 'REAL') {
    styles = {
      bg: 'var(--button-primary-bg)',
      border: '1px solid var(--button-primary-bg)',
      text: 'var(--button-primary-text)',
      symbol: '●'
    };
  } else if (normalized === 'SIMULATED') {
    styles = {
      bg: 'var(--surface-muted)',
      border: '1px solid var(--border-strong)',
      text: 'var(--text-secondary)',
      symbol: '◇'
    };
  } else if (normalized === 'LIVE' || normalized === 'CONNECTED') {
    styles = {
      bg: 'var(--surface-muted)',
      border: '1px solid var(--border-strong)',
      text: 'var(--text-primary)',
      symbol: '◉'
    };
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '6px',
        fontSize: isSmall ? '10px' : '11px',
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '0.5px',
        background: styles.bg,
        border: styles.border,
        color: styles.text,
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: isSmall ? '9px' : '11px', fontWeight: 900 }}>{styles.symbol}</span>
      {label || normalized}
    </span>
  );
}
