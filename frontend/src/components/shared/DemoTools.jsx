import React, { useState } from 'react';
import { Terminal, Zap, Wind, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../api/client.js';

export function DemoTools({ onEmergencyTriggered }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState('');

  const handleTrigger = async (type) => {
    setLoadingType(type);
    try {
      const res = await api.triggerEmergency(type);
      if (onEmergencyTriggered) onEmergencyTriggered(res.message || 'Trigger executed successfully');
    } catch (err) {
      alert(`Emergency trigger failed: ${err.message}`);
    } finally {
      setLoadingType('');
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Terminal size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            DBMS DEMO TOOLS &amp; SIMULATION CONTROL
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content Body */}
      {isOpen && (
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-muted)',
          display: 'grid',
          gap: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Simulate telemetry threshold anomalies to fire PostgreSQL automated triggers and insert system alert records:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => handleTrigger('LOW_BATTERY')}
              disabled={!!loadingType}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--page-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <Zap size={14} />
              <span>{loadingType === 'LOW_BATTERY' ? 'FIRING TRIGGER...' : 'SIMULATE LOW BATTERY'}</span>
            </button>

            <button
              onClick={() => handleTrigger('LOW_OXYGEN')}
              disabled={!!loadingType}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--page-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <Wind size={14} />
              <span>{loadingType === 'LOW_OXYGEN' ? 'FIRING TRIGGER...' : 'SIMULATE LOW OXYGEN'}</span>
            </button>

            <button
              onClick={() => handleTrigger('HIGH_TEMP')}
              disabled={!!loadingType}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--page-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <Flame size={14} />
              <span>{loadingType === 'HIGH_TEMP' ? 'FIRING TRIGGER...' : 'SIMULATE HIGH TEMPERATURE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
