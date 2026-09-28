import React, { useState, useEffect } from 'react';
import { Info, Server, Database, Radio, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal.jsx';

export function AboutModal({ isOpen, onClose }) {
  const [health, setHealth] = useState({ backend: 'checking', database: 'checking', celestrak: 'checking' });

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  if (!isOpen) return null;

  const isBackendOk = health.backend === 'online';
  const isDbOk = health.database === 'connected';
  const isCelestrakOk = health.celestrak === 'live';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ABOUT ORBITOPS">
      <div style={{ display: 'grid', gap: '1.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
        {/* Overview */}
        <div>
          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800 }}>
            Space Mission Operations Database System
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            ORBITOPS is a DBMS-based simulation system for managing integrated satellite and space-station operations, telemetry tracking, crew tasks, research experiments, and ground network communications.
          </p>
        </div>

        {/* Technology Stack */}
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
            System Architecture
          </h5>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <li><strong>Frontend:</strong> React &amp; Vanilla CSS Design System</li>
            <li><strong>Backend API:</strong> Express REST Engine</li>
            <li><strong>Database Management System:</strong> PostgreSQL DBMS (Relational schema, triggers, &amp; stored procedures)</li>
            <li><strong>Orbital Mechanics:</strong> CelesTrak Live TLE Data &amp; satellite.js SGP4 Propagation</li>
          </ul>
        </div>

        {/* Data Classification */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Data Classification &amp; Fidelity
          </h5>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.825rem' }}>
            <div>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                REAL DATA
              </span>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
                International Space Station (ISS) orbital velocity, latitude, longitude, and geodetic altitude generated in real-time via CelesTrak TLE data feeds and SGP4 orbital kinematics.
              </p>
            </div>
            <div>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                SIMULATED DATA
              </span>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
                Mission telemetry, battery levels, station life-support readings, crew schedules, payload experiments, operator commands, alerts, and ground communication sessions.
              </p>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '1rem' }}>
          <h5 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Internal System Status
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>
            <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>API SERVICE</div>
              <b style={{ color: 'var(--text-primary)' }}>{isBackendOk ? '● ONLINE' : '○ OFFLINE'}</b>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>POSTGRESQL</div>
              <b style={{ color: 'var(--text-primary)' }}>{isDbOk ? '■ CONNECTED' : '□ ERROR'}</b>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>CELESTRAK</div>
              <b style={{ color: 'var(--text-primary)' }}>{isCelestrakOk ? '◉ LIVE' : '○ OFFLINE'}</b>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
