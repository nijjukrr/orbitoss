import React from 'react';
import { Rocket, Sparkles, Orbit, ShieldCheck, Activity } from 'lucide-react';

export function HeroSection({ onEnterConsole, liveAltitude }) {
  const displayAltitude = liveAltitude != null && !isNaN(Number(liveAltitude))
    ? `${Number(liveAltitude).toFixed(1)} km Geodetic ISS`
    : 'UNAVAILABLE';

  return (
    <section style={{
      minHeight: '85vh',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid #3a3a3a',
      backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0.95) 100%), url("/media/nasa/iss-hero.jpg")',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      filter: 'grayscale(100%) contrast(110%) brightness(85%)',
      padding: '4rem 3.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95)',
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
          background: '#000000',
          border: '1px solid #ffffff',
          color: '#ffffff',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '1.5px'
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
          textShadow: '0 10px 30px rgba(0,0,0,0.95)'
        }}>
          Space Operations<br />
          <span style={{ color: '#dadada' }}>
            Command System
          </span>
        </h1>

        <p style={{
          color: '#dadada',
          fontSize: '1.2rem',
          maxWidth: '680px',
          marginTop: '1.5rem',
          lineHeight: 1.6,
          fontWeight: 500,
          textShadow: '0 2px 10px rgba(0,0,0,0.95)'
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
              background: '#ffffff',
              border: '1px solid #ffffff',
              color: '#000000',
              fontSize: '1.05rem',
              fontWeight: 900,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 15px 35px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#000000';
            }}
          >
            <Rocket size={20} /> Enter Mission Control
          </button>

          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ffffff', background: '#000000', padding: '10px 16px', borderRadius: '10px', border: '1px solid #555555' }}>
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
        background: '#000000',
        border: '1px solid #3a3a3a',
        padding: '1.25rem 1.75rem',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Orbit size={24} style={{ color: '#ffffff' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#999999', fontFamily: 'monospace' }}>REAL ISS ORBIT</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>SGP4 Kinematics (NORAD 25544)</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={24} style={{ color: '#ffffff' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#999999', fontFamily: 'monospace' }}>DATABASE ENGINE</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>PostgreSQL Neon Cloud DB</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Activity size={24} style={{ color: '#ffffff' }} />
          <div>
            <small style={{ display: 'block', fontSize: '10px', color: '#999999', fontFamily: 'monospace' }}>ORBIT ALTITUDE</small>
            <b style={{ fontSize: '14px', color: '#ffffff' }}>{displayAltitude}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
