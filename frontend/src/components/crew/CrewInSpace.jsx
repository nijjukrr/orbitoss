import React, { useState, useEffect } from 'react';
import { getAstronautsInSpace, syncAstronauts } from '../../api.js';
import { RefreshCw, UserCheck, Activity, ExternalLink, Clock } from 'lucide-react';

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

export function CrewInSpace() {
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
      console.error('Error fetching crew in space:', err);
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
        
        {/* Header Block */}
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '11px',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '3px',
              color: '#a0a0a0',
              marginBottom: '1rem'
            }}
          >
            <Activity size={12} color="#00ff88" />
            MISSION OPERATIONS
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0',
              color: '#ffffff',
              lineHeight: 1.1
            }}
          >
            ORBIT<span style={{ color: '#666666' }}>OPS</span>
          </h1>

          <h2
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)',
              fontWeight: 600,
              letterSpacing: '3px',
              color: '#e0e0e0',
              margin: 0,
              fontFamily: 'DM Mono, monospace'
            }}
          >
            Crew Currently In Space
          </h2>
        </header>

        {/* Sync Controls & Info Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            background: 'rgba(15, 15, 15, 0.8)',
            border: '1px solid #222222',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2.5rem'
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
                ACTIVE IN-ORBIT CREW: <strong style={{ color: '#ffffff' }}>{crew.length}</strong>
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
            FETCHING CREW TELEMETRY FROM DATABASE...
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
              No astronaut records currently stored in space.
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
          /* Astronaut Cards Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '4rem'
            }}
          >
            {crew.map((astronaut) => {
              const hasImage = (astronaut.image_url || astronaut.thumbnail_url) && !imgErrors[astronaut.id];
              const imgSrc = astronaut.thumbnail_url || astronaut.image_url;

              return (
                <div
                  key={astronaut.id}
                  style={{
                    background: 'rgba(18, 18, 18, 0.75)',
                    border: '1px solid #282828',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#555555';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#282828';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
                  }}
                >
                  {/* Image Header Container */}
                  <div
                    style={{
                      height: '240px',
                      width: '100%',
                      position: 'relative',
                      backgroundColor: '#111111',
                      overflow: 'hidden',
                      borderBottom: '1px solid #222222'
                    }}
                  >
                    {hasImage ? (
                      <img
                        src={imgSrc}
                        alt={astronaut.name}
                        onError={() => handleImageError(astronaut.id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)',
                          color: '#444444'
                        }}
                      >
                        <UserCheck size={64} strokeWidth={1.2} />
                        <span
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '11px',
                            color: '#666666',
                            marginTop: '8px',
                            letterSpacing: '1px'
                          }}
                        >
                          NO IMAGE AVAILABLE
                        </span>
                      </div>
                    )}

                    {/* Badge: Currently in Space */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        border: '1px solid rgba(0, 255, 136, 0.4)',
                        color: '#00ff88',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontFamily: 'DM Mono, monospace',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#00ff88',
                          boxShadow: '0 0 6px #00ff88'
                        }}
                      />
                      IN SPACE
                    </div>

                    {/* Agency Abbrev Badge */}
                    {astronaut.agency_abbrev && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          background: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'DM Mono, monospace',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {astronaut.agency_abbrev}
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {astronaut.name}
                    </h3>

                    {/* Details Table List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '13px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Agency:</span>
                        <span style={{ color: '#dddddd', textAlign: 'right', fontWeight: 500 }}>
                          {astronaut.agency_name || astronaut.agency_abbrev || 'N/A'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Nationality:</span>
                        <span style={{ color: '#dddddd', textAlign: 'right', fontWeight: 500 }}>
                          {astronaut.nationality || 'N/A'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Status:</span>
                        <span style={{ color: '#00ff88', fontWeight: 600 }}>
                          {astronaut.status || 'Active'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Time in Space:</span>
                        <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>
                          {formatDuration(astronaut.time_in_space)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #222222', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Flights:</span>
                        <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>
                          {astronaut.flights_count ?? 0}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                        <span style={{ color: '#777777', fontFamily: 'DM Mono, monospace' }}>Spacewalks:</span>
                        <span style={{ color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>
                          {astronaut.spacewalks_count ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Link out if source_url exists */}
                    {astronaut.source_url && (
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #222222' }}>
                        <a
                          href={astronaut.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#888888',
                            fontSize: '11px',
                            fontFamily: 'DM Mono, monospace',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                        >
                          <span>LL2 Astronaut Record</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
