import React, { useState, useEffect } from 'react';
import { getAstronautById } from '../../api.js';
import { ArrowLeft, UserCheck, Calendar, Rocket, Award, ExternalLink, Shield, Globe } from 'lucide-react';

function formatDuration(isoString) {
  if (!isoString) return 'N/A';
  if (!isoString.startsWith('P')) return isoString;

  const match = isoString.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
  if (!match) return isoString;

  const days = match[1] ? `${match[1]}d ` : '';
  const hours = match[2] ? `${match[2]}h ` : '';
  const mins = match[3] ? `${match[3]}m` : '';
  const formatted = `${days}${hours}${mins}`.trim();
  return formatted || isoString;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function AstronautProfile({ id, onNavigate }) {
  const [astronaut, setAstronaut] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadAstronaut() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAstronautById(id);
        if (res.success && res.data) {
          setAstronaut(res.data);
        } else {
          throw new Error(`Astronaut record #${id} not found`);
        }
      } catch (err) {
        console.error('Failed to load astronaut profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAstronaut();
    }
  }, [id]);

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

      <div style={{ maxWidth: '1100px', width: '100%', position: 'relative', zIndex: 1 }}>
        
        {/* Navigation Breadcrumb Bar */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => onNavigate('/crew')}
            style={{
              background: 'transparent',
              border: '1px solid #333333',
              color: '#cccccc',
              padding: '8px 16px',
              borderRadius: '6px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333333';
              e.currentTarget.style.color = '#cccccc';
            }}
          >
            <ArrowLeft size={14} />
            <span>BACK TO CREW MANIFEST</span>
          </button>

          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#666666', letterSpacing: '1px' }}>
            ORBITOPS / CREW / #{id}
          </div>
        </div>

        {/* Loading & Error States */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: 'DM Mono, monospace', color: '#777777' }}>
            LOADING ASTRONAUT PROFILE #{id}...
          </div>
        ) : error || !astronaut ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#0d0d0d', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '12px', color: '#ff6666' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px' }}>⚠ {error || 'Astronaut record not found'}</p>
            <button
              onClick={() => onNavigate('/crew')}
              style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '8px 20px', borderRadius: '6px', fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}
            >
              RETURN TO CREW MANIFEST
            </button>
          </div>
        ) : (
          /* Profile Content Container */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
            
            {/* Left Column: Image & Quick Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Astronaut Image Card */}
              <div
                style={{
                  background: 'rgba(18, 18, 18, 0.8)',
                  border: '1px solid #282828',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div style={{ height: '400px', width: '100%', position: 'relative', background: '#111111' }}>
                  {(astronaut.image_url || astronaut.thumbnail_url) && !imgError ? (
                    <img
                      src={astronaut.image_url || astronaut.thumbnail_url}
                      alt={astronaut.name}
                      onError={() => setImgError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555555' }}>
                      <UserCheck size={80} strokeWidth={1.2} />
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#666666', marginTop: '10px' }}>NO IMAGE AVAILABLE</span>
                    </div>
                  )}

                  {/* Status Badge Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(0, 255, 136, 0.4)',
                      color: '#00ff88',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontFamily: 'DM Mono, monospace',
                      fontWeight: 600,
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                    IN SPACE
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div style={{ padding: '1.25rem', borderTop: '1px solid #222222', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '8px', border: '1px solid #222222' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#777777' }}>FLIGHTS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{astronaut.flights_count ?? 0}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '8px', border: '1px solid #222222' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#777777' }}>SPACEWALKS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{astronaut.spacewalks_count ?? 0}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 4px', borderRadius: '8px', border: '1px solid #222222' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#777777' }}>LANDINGS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{astronaut.landings_count ?? 0}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Full Profile Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Name & Agency Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {astronaut.agency_abbrev && (
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid #333333', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 700 }}>
                      {astronaut.agency_abbrev}
                    </span>
                  )}
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#888888' }}>
                    {astronaut.nationality || 'Unspecified Nationality'}
                  </span>
                </div>

                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '1px', lineHeight: 1.1 }}>
                  {astronaut.name}
                </h1>
              </div>

              {/* Verified Mission & Vehicle Card */}
              <div
                style={{
                  background: 'rgba(15, 15, 15, 0.85)',
                  border: '1px solid #252525',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ACTIVE MISSION
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: '#666666', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block', border: '1px border #222222' }}>
                    Not linked
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>
                    SPACECRAFT / STATION
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: '#666666', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block', border: '1px border #222222' }}>
                    Not linked
                  </div>
                </div>
              </div>

              {/* Data Table Properties */}
              <div style={{ background: 'rgba(15, 15, 15, 0.85)', border: '1px solid #222222', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '6px' }}>
                  <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Agency Name:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{astronaut.agency_name || astronaut.agency_abbrev || 'N/A'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '6px' }}>
                  <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Status:</span>
                  <span style={{ color: '#00ff88', fontWeight: 600 }}>{astronaut.status || 'Active'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '6px' }}>
                  <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Cumulative Time in Space:</span>
                  <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>{formatDuration(astronaut.time_in_space)}</span>
                </div>

                {astronaut.age && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '6px' }}>
                    <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Age:</span>
                    <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>{astronaut.age} years old</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '6px' }}>
                  <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>First Orbital Flight:</span>
                  <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>{formatDate(astronaut.first_flight)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                  <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Latest Flight Date:</span>
                  <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>{formatDate(astronaut.last_flight)}</span>
                </div>
              </div>

              {/* Bio Section */}
              {astronaut.bio && (
                <div style={{ background: 'rgba(15, 15, 15, 0.85)', border: '1px solid #222222', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '13px', fontFamily: 'DM Mono, monospace', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    BIOGRAPHY
                  </h3>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#cccccc', lineHeight: 1.7 }}>
                    {astronaut.bio}
                  </p>
                </div>
              )}

              {/* Source Link */}
              {astronaut.source_url && (
                <div>
                  <a
                    href={astronaut.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#888888',
                      fontSize: '12px',
                      fontFamily: 'DM Mono, monospace',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    <span>Verified LL2 Data Record</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Footer Attribution */}
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
