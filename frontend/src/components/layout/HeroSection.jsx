import React from 'react';
import { Rocket, Sparkles, Orbit, ShieldCheck, Activity, ChevronDown } from 'lucide-react';

export function HeroSection({ onEnterConsole, liveAltitude }) {
  const displayAltitude = liveAltitude ? `${Number(liveAltitude).toFixed(1)} km` : '420.2 km';

  return (
    <section style={{
      minHeight: '85vh',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.35) 0%, rgba(3, 7, 18, 0.55) 50%, rgba(3, 7, 18, 0.85) 100%), url("/media/nasa/iss-hero.jpg")',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      padding: '4rem 3.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8), inset 0 0 80px rgba(0, 0, 0, 0.6)',
      marginBottom: '3rem'
    }}>
      {/* Top Mission Tag */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '30px',
          background: 'rgba(3, 7, 18, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: '#38bdf8',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '1.5px',
          backdropFilter: 'blur(8px)'
        }}>
          <Sparkles size={14} />
          <span>ORBITOPS MISSION CONTROL · REAL ISS ORBITAL TRACKING (CelesTrak TLE + SGP4)</span>
        </div>
      </div>

      {/* SpaceX-Style Fullscreen Bold Typography */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '950px', margin: '2rem 0' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(3rem, 6.5vw, 5rem)',
          fontWeight: 900,
          letterSpacing: '-2px',
          color: '#ffffff',
          lineHeight: 1.02,
          textTransform: 'uppercase',
          textShadow: '0 10px 30px rgba(0,0,0,0.9)'
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
          color: '#cbd5e1',
          fontSize: '1.2rem',
          maxWidth: '680px',
          marginTop: '1.5rem',
          lineHeight: 1.6,
          fontWeight: 500,
          textShadow: '0 2px 10px rgba(0,0,0,0.9)'
        }}>
          Real-time ISS orbital mechanics, SGP4 kinematics, CelesTrak live TLE feeds, PostgreSQL stored triggers, and space station habitat telemetry.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={onEnterConsole}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '1.25rem 2.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 15px 35px rgba(2, 132, 199, 0.5)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Rocket size={20} /> Enter Mission Control
          </button>

          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', background: 'rgba(3, 7, 18, 0.75)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            ORBITAL POSITION: REAL | MISSION TELEMETRY: SIMULATED
          </span>
        </div>
      </div>

      {/* Floating Telemetry Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        background: 'rgba(3, 7, 18, 0.8)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        padding: '1.25rem 1.75rem',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Orbit size={24} style={{ color: '#38bdf8' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>REAL ISS ORBIT</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>SGP4 Kinematics (NORAD 25544)</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={24} style={{ color: '#34d399' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>DATABASE ENGINE</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>PostgreSQL Neon Cloud DB</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Activity size={24} style={{ color: '#c084fc' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>ORBIT ALTITUDE</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>{displayAltitude} Geodetic ISS</b>
          </div>
        </div>
      </div>
    </section>
  );
}
