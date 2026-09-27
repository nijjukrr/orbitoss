import React from 'react';

export function MetricCard({ icon: Icon, label, value, sub, trend, glowColor = '#38bdf8' }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = glowColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 14px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${glowColor}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.15)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: `${glowColor}15`,
          border: `1px solid ${glowColor}30`,
          display: 'grid',
          placeItems: 'center',
          color: glowColor,
          flexShrink: 0
        }}
      >
        {Icon && <Icon size={22} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {label}
        </p>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
          {value}
        </h3>
        {sub && (
          <small style={{ display: 'block', margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
            {sub}
          </small>
        )}
      </div>
    </div>
  );
}
