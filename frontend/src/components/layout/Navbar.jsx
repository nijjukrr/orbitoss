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
      borderBottom: '1px solid #242424',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Verified System Health Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Server size={13} style={{ color: isBackendOk ? '#ffffff' : '#777777' }} />
          <span style={{ color: '#999999' }}>API:</span>
          <b style={{ color: isBackendOk ? '#ffffff' : '#777777' }}>{isBackendOk ? '● ONLINE' : '○ OFFLINE'}</b>
        </div>

        <span style={{ color: '#3a3a3a' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Database size={13} style={{ color: isDbOk ? '#ffffff' : '#777777' }} />
          <span style={{ color: '#999999' }}>POSTGRESQL:</span>
          <b style={{ color: isDbOk ? '#ffffff' : '#777777' }}>{isDbOk ? '● CONNECTED' : '○ ERROR'}</b>
        </div>

        <span style={{ color: '#3a3a3a' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <Radio size={13} style={{ color: '#ffffff' }} />
          <span style={{ color: '#999999' }}>CELESTRAK:</span>
          <b style={{ color: '#ffffff' }}>◉ {health.celestrak.toUpperCase()}</b>
        </div>

        <span style={{ color: '#3a3a3a' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontFamily: 'monospace', color: '#999999' }}>
          <Clock size={13} style={{ color: '#ffffff' }} />
          <span>{time}</span>
        </div>
      </div>

      {/* Demo Emergency Panel - Monochrome Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#111111',
        border: '1px solid #242424',
        padding: '0.35rem 0.75rem',
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#999999', letterSpacing: '0.5px', fontWeight: 700 }}>
          DBMS TRIGGERS:
        </span>
        <button
          onClick={() => handleTrigger('LOW_BATTERY')}
          disabled={!!loadingType}
          style={{
            background: '#000000',
            border: '1px solid #555555',
            color: '#ffffff',
            padding: '4px 10px',
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
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <Zap size={13} /> {loadingType === 'LOW_BATTERY' ? 'Firing...' : '[ ⚡ LOW BATTERY ]'}
        </button>

        <button
          onClick={() => handleTrigger('LOW_OXYGEN')}
          disabled={!!loadingType}
          style={{
            background: '#000000',
            border: '1px solid #555555',
            color: '#ffffff',
            padding: '4px 10px',
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
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <Wind size={13} /> {loadingType === 'LOW_OXYGEN' ? 'Firing...' : '[ ◌ LOW OXYGEN ]'}
        </button>

        <button
          onClick={() => handleTrigger('HIGH_TEMP')}
          disabled={!!loadingType}
          style={{
            background: '#000000',
            border: '1px solid #555555',
            color: '#ffffff',
            padding: '4px 10px',
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
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <Flame size={13} /> {loadingType === 'HIGH_TEMP' ? 'Firing...' : '[ ▲ HIGH TEMP ]'}
        </button>
      </div>
    </header>
  );
}
