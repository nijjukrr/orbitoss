import React from 'react';

export function StatusBadge({ status, label, size = 'md' }) {
  const normalized = String(status || 'NOMINAL').toUpperCase();

  let styles = {
    bg: '#161616',
    border: '1px solid #3a3a3a',
    text: '#ffffff',
    symbol: '●'
  };

  if (normalized === 'WARNING') {
    styles = {
      bg: '#111111',
      border: '1px solid #777777',
      text: '#dadada',
      symbol: '!'
    };
  } else if (normalized === 'CRITICAL' || normalized === 'FAILED') {
    styles = {
      bg: '#1c1c1c',
      border: '2px solid #ffffff',
      text: '#ffffff',
      symbol: '⚠'
    };
  } else if (normalized === 'RESOLVED' || normalized === 'COMPLETED') {
    styles = {
      bg: '#0a0a0a',
      border: '1px solid #3a3a3a',
      text: '#999999',
      symbol: '✓'
    };
  } else if (normalized === 'OFFLINE' || normalized === 'MAINTENANCE') {
    styles = {
      bg: '#0a0a0a',
      border: '1px solid #242424',
      text: '#777777',
      symbol: '○'
    };
  } else if (normalized === 'REAL') {
    styles = {
      bg: '#ffffff',
      border: '1px solid #ffffff',
      text: '#000000',
      symbol: '●'
    };
  } else if (normalized === 'SIMULATED') {
    styles = {
      bg: '#161616',
      border: '1px solid #555555',
      text: '#dadada',
      symbol: '◇'
    };
  } else if (normalized === 'LIVE' || normalized === 'CONNECTED') {
    styles = {
      bg: '#1c1c1c',
      border: '1px solid #999999',
      text: '#ffffff',
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
