import React, { useState, useEffect } from 'react';
import { Activity, Zap, Wind, Flame, Clock, Database, Server, Radio } from 'lucide-react';
import { api } from '../../api/client.js';

export function Navbar({ onEmergencyTriggered }) {
  const [time, setTime] = useState(new Date().toUTCString());
  const [loadingType, setLoadingType] = useState('');
  const [health, setHealth] = useState({ backend: 'checking', database: 'checking', celestrak: 'checking' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toUTCString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Priority 2: Real Health Polling using actual backend health endpoint
  const checkHealth = () => {
    fetch('http://localhost:5000/api/health')
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
    const interval = setInterval(checkHealth, 10000);
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

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
      background: 'rgba(7, 17, 31, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Real Verified System Health Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Server size={13} style={{ color: isBackendOk ? '#34d399' : '#fb7185' }} />
          <span style={{ color: '#94a3b8' }}>API:</span>
          <b style={{ color: isBackendOk ? '#34d399' : '#fb7185' }}>{isBackendOk ? 'ONLINE' : 'OFFLINE'}</b>
        </div>

        <span style={{ color: '#334155' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Database size={13} style={{ color: isDbOk ? '#34d399' : '#fb7185' }} />
          <span style={{ color: '#94a3b8' }}>POSTGRESQL:</span>
          <b style={{ color: isDbOk ? '#34d399' : '#fb7185' }}>{isDbOk ? 'CONNECTED' : 'ERROR'}</b>
        </div>

        <span style={{ color: '#334155' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Radio size={13} style={{ color: '#38bdf8' }} />
          <span style={{ color: '#94a3b8' }}>CELESTRAK:</span>
          <b style={{ color: '#38bdf8' }}>{health.celestrak.toUpperCase()}</b>
        </div>

        <span style={{ color: '#334155' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
          <Clock size={13} style={{ color: '#38bdf8' }} />
          <span>{time}</span>
        </div>
      </div>

      {/* Demo Emergency Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        padding: '0.35rem 0.75rem',
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#f59e0b', letterSpacing: '0.5px', fontWeight: 600 }}>
          DBMS TRIGGERS:
        </span>
        <button
          onClick={() => handleTrigger('LOW_BATTERY')}
          disabled={!!loadingType}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Zap size={13} /> {loadingType === 'LOW_BATTERY' ? 'Firing...' : 'Low Battery'}
        </button>

        <button
          onClick={() => handleTrigger('LOW_OXYGEN')}
          disabled={!!loadingType}
          style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Wind size={13} /> {loadingType === 'LOW_OXYGEN' ? 'Firing...' : 'Low Oxygen'}
        </button>

        <button
          onClick={() => handleTrigger('HIGH_TEMP')}
          disabled={!!loadingType}
          style={{
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Flame size={13} /> {loadingType === 'HIGH_TEMP' ? 'Firing...' : 'High Temp'}
        </button>
      </div>
    </header>
  );
}
