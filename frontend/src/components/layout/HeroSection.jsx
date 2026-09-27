import React from 'react';
import { Rocket, Sparkles, Orbit, ShieldCheck, Activity, ChevronDown } from 'lucide-react';

export function HeroSection({ onEnterConsole }) {
  return (
    <section style={{
      minHeight: '85vh',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      background: 'radial-gradient(circle at 50% 25%, rgba(14, 165, 233, 0.18) 0%, rgba(3, 7, 18, 0.98) 75%)',
      padding: '4rem 3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(56, 189, 248, 0.08)',
      marginBottom: '3rem'
    }}>
      {/* Background Orbital Line Accents */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 0)',
        backgroundSize: '28px 28px',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* Top Mission Chip */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>
          <Sparkles size={14} />
          <span>ORBITOPS MISSION OR-26 · LIVE SPACE OPERATIONS</span>
        </div>
      </div>

      {/* Huge SpaceX-Style Hero Typography */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '2rem 0' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          color: '#f8fafc',
          lineHeight: 1.05,
          textTransform: 'uppercase'
        }}>
          Space Operations<br />
          <span style={{
            background: 'linear-gradient(90deg, #38bdf8, #818cf8, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Command System
          </span>
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1.15rem',
          maxWidth: '680px',
          marginTop: '1.25rem',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Integrated real-time ISS orbital mechanics, SGP4 propagators, CelesTrak TLE feeds, PostgreSQL stored procedures, and live space station environmental telemetry.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={onEnterConsole}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.1rem 2.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.25s ease'
            }}
          >
            <Rocket size={20} /> Enter Mission Control
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Floating Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        paddingTop: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Orbit size={24} style={{ color: '#38bdf8' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>ORBIT MECHANICS</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>SGP4 Propagator (2026 TLE)</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={24} style={{ color: '#34d399' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>DATABASE CORE</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>PostgreSQL Neon Cloud</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Activity size={24} style={{ color: '#c084fc' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>LIVE ALTITUDE</small>
            <b style={{ fontSize: '13px', color: '#f8fafc' }}>~420 km Geodetic ISS</b>
          </div>
        </div>
      </div>
    </section>
  );
}
