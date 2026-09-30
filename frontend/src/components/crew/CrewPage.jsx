import React, { useState, useEffect } from 'react';
import { getAstronautsInSpace, syncAstronauts } from '../../api.js';
import { RefreshCw, UserCheck, ArrowLeft, Clock, Shield, Activity } from 'lucide-react';

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

function formatLastSynced(dateString) {
  if (!dateString) return null;
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

export function CrewPage({ onNavigate }) {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const loadCrewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAstronautsInSpace();
      if (res.success && Array.isArray(res.data)) {
        setCrew(res.data);
        if (res.data.length > 0 && res.data[0].last_synced_at) {
          setLastSyncedTime(res.data[0].last_synced_at);
        }
      } else {
        throw new Error('Failed to parse crew data response');
      }
    } catch (err) {
      console.error('Error fetching crew page data:', err);
      setError(err.message || 'Unable to load crew data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrewData();
  }, []);

  const handleManualSync = async () => {
    if (syncing) return;
    try {
      setSyncing(true);
      setSyncNotice(null);
      setError(null);
      const result = await syncAstronauts();
      if (result.success) {
        setSyncNotice(`Synced ${result.upserted} records from ${result.source}`);
        if (result.synced_at) {
          setLastSyncedTime(result.synced_at);
        }
        await loadCrewData();
      } else {
        throw new Error(result.message || result.error || 'Sync request failed');
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
      setError(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  const handleImageError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

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
      {/* Background Subtle Ambient Grid */}
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
        
        {/* Navigation Breadcrumb Bar */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => onNavigate('/')}
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
            <span>BACK TO DASHBOARD</span>
          </button>

          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#666666', letterSpacing: '1px' }}>
            ORBITOPS / MISSION OPERATIONS / CREW
          </div>
        </div>

        {/* Page Title Block */}
        <header style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
              color: '#ffffff'
            }}
          >
            ACTIVE CREW MANIFEST
          </h1>
          <p style={{ margin: 0, fontSize: '14px', fontFamily: 'DM Mono, monospace', color: '#888888' }}>
            Personnel currently aboard orbital space stations and spacecraft
          </p>
        </header>

        {/* Sync Controls & Metadata Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(15, 15, 15, 0.85)',
            border: '1px solid #222222',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 10px #00ff88'
                }}
              />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#cccccc' }}>
                CREW IN SPACE: <strong style={{ color: '#ffffff' }}>{crew.length}</strong>
              </span>
            </div>

            {lastSyncedTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888888', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
                <Clock size={12} />
                <span>Last synced: {formatLastSynced(lastSyncedTime)}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            style={{
              background: syncing ? '#151515' : '#000000',
              border: '1px solid #444444',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '6px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!syncing) {
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.background = '#1a1a1a';
              }
            }}
            onMouseLeave={(e) => {
              if (!syncing) {
                e.currentTarget.style.borderColor = '#444444';
                e.currentTarget.style.background = '#000000';
              }
            }}
          >
            <RefreshCw size={14} className={syncing ? 'spin-icon' : ''} />
            <span>{syncing ? 'SYNCING LL2...' : 'SYNC DATA'}</span>
          </button>
        </div>

        {/* Notices */}
        {syncNotice && (
          <div
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
              padding: '10px 16px',
              borderRadius: '8px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            ✓ {syncNotice}
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              color: '#ff6666',
              padding: '10px 16px',
              borderRadius: '8px',
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              fontFamily: 'DM Mono, monospace',
              color: '#777777',
              letterSpacing: '2px'
            }}
          >
            FETCHING CREW RECORDS FROM DATABASE...
          </div>
        ) : crew.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: '#0d0d0d',
              border: '1px dashed #333333',
              borderRadius: '12px',
              color: '#888888'
            }}
          >
            <p style={{ fontFamily: 'DM Mono, monospace', marginBottom: '1rem' }}>
              No astronaut records found in database.
            </p>
            <button
              onClick={handleManualSync}
              style={{
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              RUN INITIAL SYNC FROM LL2
            </button>
          </div>
        ) : (
          /* Clean Table Layout */
          <div
            style={{
              background: 'rgba(15, 15, 15, 0.9)',
              border: '1px solid #222222',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '3rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #222222', color: '#888888', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 16px', width: '70px' }}>PHOTO</th>
                    <th style={{ padding: '14px 16px' }}>NAME</th>
                    <th style={{ padding: '14px 16px' }}>AGENCY</th>
                    <th style={{ padding: '14px 16px' }}>NATIONALITY</th>
                    <th style={{ padding: '14px 16px' }}>ACTIVE MISSION</th>
                    <th style={{ padding: '14px 16px' }}>LOCATION / VEHICLE</th>
                    <th style={{ padding: '14px 16px' }}>STATUS</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>TIME IN SPACE</th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((ast) => {
                    const hasImage = (ast.image_url || ast.thumbnail_url) && !imgErrors[ast.id];
                    const imgSrc = ast.thumbnail_url || ast.image_url;

                    return (
                      <tr
                        key={ast.id}
                        onClick={() => onNavigate(`/crew/${ast.id}`)}
                        style={{
                          borderBottom: '1px solid #1a1a1a',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* PHOTO */}
                        <td style={{ padding: '12px 16px' }}>
                          {hasImage ? (
                            <img
                              src={imgSrc}
                              alt={ast.name}
                              onError={() => handleImageError(ast.id)}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333333' }}
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666666' }}>
                              <UserCheck size={20} />
                            </div>
                          )}
                        </td>

                        {/* NAME */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                            {ast.name}
                          </div>
                        </td>

                        {/* AGENCY */}
                        <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#cccccc' }}>
                          {ast.agency_abbrev ? (
                            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #333333' }}>
                              {ast.agency_abbrev}
                            </span>
                          ) : (
                            ast.agency_name || 'N/A'
                          )}
                        </td>

                        {/* NATIONALITY */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#cccccc' }}>
                          {ast.nationality || 'N/A'}
                        </td>

                        {/* ACTIVE MISSION */}
                        <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                          <span style={{ color: '#666666', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '4px', border: '1px border #222222' }}>
                            Not linked
                          </span>
                        </td>

                        {/* LOCATION / VEHICLE */}
                        <td style={{ padding: '12px 16px', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                          <span style={{ color: '#666666', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '4px', border: '1px border #222222' }}>
                            Not linked
                          </span>
                        </td>

                        {/* STATUS */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(0, 255, 136, 0.1)',
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              color: '#00ff88',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontFamily: 'DM Mono, monospace',
                              fontWeight: 600
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                            IN SPACE
                          </span>
                        </td>

                        {/* TIME IN SPACE */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#ffffff' }}>
                          {formatDuration(ast.time_in_space)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Data Source Label */}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
