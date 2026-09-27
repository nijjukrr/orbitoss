import React from 'react';
import { Play, Sparkles, Activity, ShieldCheck, Orbit, Rocket } from 'lucide-react';

export function HeroSection({ onEnterConsole }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      background: 'radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.15) 0%, rgba(3, 7, 18, 0.95) 80%)',
      padding: '3rem 2.5rem',
      marginBottom: '2rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(56, 189, 248, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Background Starfield Effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        opacity: 0.4,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={13} />
            <span>ORBITOPS MISSION CONTROL SYSTEM · OR-26</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', color: '#f8fafc', lineHeight: 1.15 }}>
            Real-Time Spacecraft Tracking &<br />
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DBMS Operations Center
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Synchronized with CelesTrak live TLE feeds, PostgreSQL stored triggers, SGP4 orbital propagators, and live space station environmental monitoring.
          </p>
        </div>

        <button
          onClick={onEnterConsole}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.75rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            border: 'none',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Rocket size={18} /> Launch Station Console
        </button>
      </div>

      {/* Floating Telemetry Chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Orbit size={20} style={{ color: '#38bdf8' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>ORBIT TRACKING</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>CelesTrak ISS Live SGP4</b>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} style={{ color: '#34d399' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>DBMS PROCEDURES</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>ACID Command Engine</b>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={20} style={{ color: '#c084fc' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>TELEMETRY ENGINE</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>Real-time Station Feed</b>
          </div>
        </div>
      </div>
    </div>
  );
}
