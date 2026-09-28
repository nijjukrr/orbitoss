import React, { useState, useEffect } from 'react';
import { Activity, Zap, Wind, Flame, Clock, Database, Server, Radio, Sun, Moon } from 'lucide-react';
import { api } from '../../api/client.js';

export function Navbar({ onEmergencyTriggered, theme = 'dark', onToggleTheme }) {
  const [time, setTime] = useState(new Date().toUTCString());
  const [loadingType, setLoadingType] = useState('');
  const [health, setHealth] = useState({ backend: 'checking', database: 'checking', celestrak: 'checking' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toUTCString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkHealth = () => {
    const healthUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/health';
    fetch(healthUrl)
      .then((r) => r.json())
      .then((data) => {
        setHealth({
          backend: data.backend || 'online',
          database: data.database || 'connected',
          celestrak: data.celestrak || 'live'
        });
      })
      .catch(() => {
        setHealth({
          backend: 'offline',
          database: 'error',
          celestrak: 'offline'
        });
      });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async (type) => {
    setLoadingType(type);
    try {
      const res = await api.triggerEmergency(type);
      if (onEmergencyTriggered) onEmergencyTriggered(res.message);
    } catch (err) {
      alert(`Emergency trigger failed: ${err.message}`);
    } finally {
      setLoadingType('');
    }
  };

  const isBackendOk = health.backend === 'online';
  const isDbOk = health.database === 'connected';
  const isCelestrakOk = health.celestrak === 'live';

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.25s ease'
    }}>
      {/* Verified System Health Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Server size={13} style={{ color: 'var(--text-primary)' }} />
          <b style={{ color: 'var(--text-primary)' }}>{isBackendOk ? '● API ONLINE' : '○ API OFFLINE'}</b>
        </div>

        <span style={{ color: 'var(--border)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Database size={13} style={{ color: 'var(--text-primary)' }} />
          <b style={{ color: 'var(--text-primary)' }}>{isDbOk ? '■ POSTGRESQL CONNECTED' : '□ POSTGRESQL ERROR'}</b>
        </div>

        <span style={{ color: 'var(--border)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Radio size={13} style={{ color: 'var(--text-primary)' }} />
          <b style={{ color: 'var(--text-primary)' }}>{isCelestrakOk ? '◉ CELESTRAK LIVE' : '○ CELESTRAK OFFLINE'}</b>
        </div>

        <span style={{ color: 'var(--border)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          <Clock size={13} style={{ color: 'var(--text-primary)' }} />
          <span>{time}</span>
        </div>
      </div>

      {/* Right Controls: DBMS Triggers & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Demo Emergency Panel - Monochrome Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--surface-muted)',
          border: '1px solid var(--border)',
          padding: '0.35rem 0.6rem',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 700 }}>
            DBMS:
          </span>
          <button
            onClick={() => handleTrigger('LOW_BATTERY')}
            disabled={!!loadingType}
            aria-label="Trigger Low Battery emergency alert"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
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
            <Zap size={12} /> {loadingType === 'LOW_BATTERY' ? 'Firing...' : '[ ⚡ BATTERY ]'}
          </button>

          <button
            onClick={() => handleTrigger('LOW_OXYGEN')}
            disabled={!!loadingType}
            aria-label="Trigger Low Oxygen emergency alert"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
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
            <Wind size={12} /> {loadingType === 'LOW_OXYGEN' ? 'Firing...' : '[ ◌ OXYGEN ]'}
          </button>

          <button
            onClick={() => handleTrigger('HIGH_TEMP')}
            disabled={!!loadingType}
            aria-label="Trigger High Temp emergency alert"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
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
            <Flame size={12} /> {loadingType === 'HIGH_TEMP' ? 'Firing...' : '[ ▲ TEMP ]'}
          </button>
        </div>

        {/* Light/Dark Theme Switcher */}
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'DM Mono, monospace',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
        </button>
      </div>
    </header>
  );
}
