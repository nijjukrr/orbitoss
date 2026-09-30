import React, { useState, useEffect } from 'react';
import { getAstronautsInSpace } from '../../api.js';
import { Users, Satellite, Radio, Compass, ArrowRight, Clock, UserCheck, Shield } from 'lucide-react';

function formatLastSynced(dateString) {
  if (!dateString) return 'Not yet synced';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
}

export function MissionControlDashboard({ onNavigate }) {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCrew() {
      try {
        setLoading(true);
        const res = await getAstronautsInSpace();
        if (res.success && Array.isArray(res.data)) {
          setCrew(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard crew card:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCrew();
  }, []);

  const previewCrew = crew.slice(0, 3);
  const remainingCount = Math.max(0, crew.length - 3);
  const lastSynced = crew.length > 0 ? crew[0].last_synced_at : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        color: '#ffffff',
        fontFamily: 'Manrope, system-ui, sans-serif',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Background Ambient Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(30, 60, 90, 0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '1280px', width: '100%', position: 'relative', zIndex: 1 }}>
        
        {/* Main Mission Control Header */}
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', borderBottom: '1px solid #1e1e1e', paddingBottom: '1.5rem' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '11px',
                  fontFamily: 'DM Mono, monospace',
                  letterSpacing: '2px',
                  color: '#00ff88',
                  marginBottom: '0.75rem'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                ORBITOPS MISSION CONTROL SYSTEM
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  letterSpacing: '6px',
                  textTransform: 'uppercase',
                  margin: 0,
                  color: '#ffffff',
                  lineHeight: 1.1
                }}
              >
                ORBIT<span style={{ color: '#666666' }}>OPS</span>
              </h1>
            </div>

            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#777777', textAlign: 'right' }}>
              <div>SYSTEM STATUS: <span style={{ color: '#00ff88', fontWeight: 600 }}>NOMINAL</span></div>
              <div style={{ marginTop: '4px' }}>POSTGRESQL DB · THE SPACE DEVS LL2</div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
          
          {/* Card 1: CREW IN SPACE (Active Left Component) */}
          <div
            style={{
              background: 'rgba(15, 15, 15, 0.85)',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => onNavigate('/crew')}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#444444';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              {/* Card Title Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.25)', borderRadius: '8px', color: '#00ff88' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#ffffff' }}>
                      CREW IN SPACE
                    </h2>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#777777' }}>
                      CURRENT IN-ORBIT ASTRONAUTS
                    </span>
                  </div>
                </div>

                {/* Active Count Badge */}
                <div style={{ padding: '6px 12px', background: 'rgba(0, 255, 136, 0.12)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '20px', color: '#00ff88', fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 700 }}>
                  {crew.length} ACTIVE
                </div>
              </div>

              {/* Last Synced Time */}
              {lastSynced && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#888888', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #222222' }}>
                  <Clock size={12} />
                  <span>Last synced: {formatLastSynced(lastSynced)}</span>
                </div>
              )}

              {/* Astronaut Preview List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                {loading ? (
                  <div style={{ color: '#666666', fontFamily: 'DM Mono, monospace', fontSize: '12px', padding: '1rem 0' }}>
                    Loading crew records...
                  </div>
                ) : crew.length === 0 ? (
                  <div style={{ color: '#777777', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                    No crew members loaded.
                  </div>
                ) : (
                  <>
                    {previewCrew.map((ast) => {
                      const imgSrc = ast.thumbnail_url || ast.image_url;
                      return (
                        <div
                          key={ast.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid #222222',
                            borderRadius: '10px',
                            padding: '8px 12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={ast.name}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #444444' }}
                              />
                            ) : (
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888888' }}>
                                <UserCheck size={18} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{ast.name}</div>
                              <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#777777' }}>
                                {ast.agency_abbrev || ast.agency_name || 'N/A'} · {ast.nationality || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#00ff88', background: 'rgba(0, 255, 136, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                            IN SPACE
                          </span>
                        </div>
                      );
                    })}

                    {remainingCount > 0 && (
                      <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#888888', textAlign: 'center', paddingTop: '4px' }}>
                        +{remainingCount} more astronaut{remainingCount > 1 ? 's' : ''} in orbit
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Link */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #222222',
                color: '#ffffff',
                fontFamily: 'DM Mono, monospace',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              <span>VIEW CREW</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: SATELLITES (Placeholder) */}
          <div
            style={{
              background: 'rgba(12, 12, 12, 0.6)',
              border: '1px dashed #222222',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.75
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#666666' }}>
                    <Satellite size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#888888' }}>
                      SATELLITES
                    </h2>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#555555' }}>
                      ORBITAL TELEMETRY
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#666666', border: '1px solid #333333', padding: '4px 8px', borderRadius: '4px' }}>
                  PHASE 2
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#666666', fontFamily: 'DM Mono, monospace', lineHeight: 1.6, margin: '1.5rem 0' }}>
                Real-time satellite tracking, TLE propagation, and orbital path visualization module scheduled for Phase 2 integration.
              </p>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444444' }}>
              STATUS: FEATURE LOCKED
            </div>
          </div>

          {/* Card 3: SPACE STATIONS (Placeholder) */}
          <div
            style={{
              background: 'rgba(12, 12, 12, 0.6)',
              border: '1px dashed #222222',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.75
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#666666' }}>
                    <Radio size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#888888' }}>
                      SPACE STATIONS
                    </h2>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#555555' }}>
                      HABITAT & LIFE SUPPORT
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#666666', border: '1px solid #333333', padding: '4px 8px', borderRadius: '4px' }}>
                  PHASE 3
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#666666', fontFamily: 'DM Mono, monospace', lineHeight: 1.6, margin: '1.5rem 0' }}>
                ISS & Tiangong module telemetry, environmental ECLSS logs, and power status monitoring module scheduled for Phase 3.
              </p>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444444' }}>
              STATUS: FEATURE LOCKED
            </div>
          </div>

          {/* Card 4: MISSIONS (Placeholder) */}
          <div
            style={{
              background: 'rgba(12, 12, 12, 0.6)',
              border: '1px dashed #222222',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.75
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#666666' }}>
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#888888' }}>
                      MISSIONS
                    </h2>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#555555' }}>
                      EXPEDITIONS & FLIGHTS
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#666666', border: '1px solid #333333', padding: '4px 8px', borderRadius: '4px' }}>
                  PHASE 4
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#666666', fontFamily: 'DM Mono, monospace', lineHeight: 1.6, margin: '1.5rem 0' }}>
                Expedition manifests, launch schedules, and mission lifecycle management system scheduled for Phase 4.
              </p>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444444' }}>
              STATUS: FEATURE LOCKED
            </div>
          </div>

        </div>

        {/* Footer Data Source Attribution Label */}
        <footer
          style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: '1px solid #1a1a1a',
            textAlign: 'center',
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: '#666666',
            letterSpacing: '1px'
          }}
        >
          Crew data source: <strong style={{ color: '#a0a0a0' }}>The Space Devs — Launch Library 2</strong>
        </footer>
      </div>
    </div>
  );
}
