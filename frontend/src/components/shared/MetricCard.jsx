import React from 'react';

export function MetricCard({ icon: Icon, label, value, sub }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          background: 'var(--surface-muted)',
          border: '1px solid var(--border)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-primary)',
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}
        </p>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {value}
        </h3>
        {sub && (
          <small style={{ display: 'block', margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            {sub}
          </small>
        )}
      </div>
    </div>
  );
}
