import React from 'react';

export function MetricCard({ icon: Icon, label, value, sub }) {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #242424',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#ffffff';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#242424';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: '#1c1c1c',
          border: '1px solid #3a3a3a',
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={22} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: '10px', fontFamily: 'monospace', color: '#999999', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}
        </p>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          {value}
        </h3>
        {sub && (
          <small style={{ display: 'block', margin: '4px 0 0', fontSize: '11px', color: '#777777' }}>
            {sub}
          </small>
        )}
      </div>
    </div>
  );
}
