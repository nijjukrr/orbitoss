import React from 'react';

export function StatusBadge({ status, label, size = 'md' }) {
  const normalized = String(status || 'NOMINAL').toUpperCase();

  let colors = {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#34d399',
    dot: '#10b981'
  };

  if (normalized === 'WARNING') {
    colors = {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#fbbf24',
      dot: '#f59e0b'
    };
  } else if (normalized === 'CRITICAL' || normalized === 'FAILED') {
    colors = {
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.4)',
      text: '#fb7185',
      dot: '#f43f5e'
    };
  } else if (normalized === 'OFFLINE' || normalized === 'MAINTENANCE') {
    colors = {
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.4)',
      text: '#94a3b8',
      dot: '#64748b'
    };
  } else if (normalized === 'REAL' || normalized === 'LIVE') {
    colors = {
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.4)',
      text: '#38bdf8',
      dot: '#06b6d4'
    };
  } else if (normalized === 'SIMULATED') {
    colors = {
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#c084fc',
      dot: '#a855f7'
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
        fontWeight: 600,
        letterSpacing: '0.5px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '7px',
          height: isSmall ? '5px' : '7px',
          borderRadius: '50%',
          background: colors.dot,
          boxShadow: `0 0 8px ${colors.dot}`
        }}
      />
      {label || normalized}
    </span>
  );
}
