import React, { useState, useEffect } from 'react';
import { Radio, Signal, MapPin, Globe, Compass, Activity } from 'lucide-react';
import { api } from '../api/client.js';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';

export function GroundStationsPage() {
  const [stations, setStations] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroundStationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stRes, commsRes] = await Promise.all([
        api.getGroundStations(),
        api.getCommunications().catch(() => [])
      ]);
      setStations(stRes || []);
      setCommunications(commsRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroundStationData();
  }, []);

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchGroundStationData} />;

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
            <span>GLOBAL GROUND STATION NETWORK</span> · <span>DEEP SPACE TELEMETRY LINK</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            Ground Communication Terminals
          </h1>
        </div>
        <StatusBadge status="NOMINAL" label="NETWORK ONLINE" />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={Radio} label="Ground Stations" value={stations.length} sub="Worldwide Network" glowColor="#38bdf8" />
        <MetricCard icon={Signal} label="Avg Signal Strength" value="92.4%" sub="Uplink & Downlink" glowColor="#34d399" />
        <MetricCard icon={Activity} label="Active Sessions" value={communications.length} sub="Real-Time Links" glowColor="#c084fc" />
      </div>

      {/* Ground Station Cards Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {stations.map((g) => (
          <div
            key={g.ground_station_id || g.code}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              borderRadius: '16px',
              padding: '1.5rem',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{g.code} · {g.country}</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  {g.city} Terminal
                </h3>
              </div>
              <StatusBadge status={g.status} />
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>SIGNAL QUALITY</small>
                <b style={{ fontSize: '1.3rem', color: '#38bdf8' }}>{g.signal_pct ?? 94}%</b>
              </div>
              <Signal size={24} style={{ color: '#38bdf8' }} />
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              <p style={{ margin: '0 0 4px' }}>Connected Spacecraft: <b style={{ color: '#f8fafc' }}>{g.connected_satellite || 'No Active Downlink'}</b></p>
              <p style={{ margin: 0, fontFamily: 'monospace', color: '#64748b' }}>Coordinates: {g.latitude}° N, {g.longitude}° E</p>
            </div>
          </div>
        ))}
      </div>

      {/* Communication Sessions Log Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
              POSTGRESQL communication_sessions TABLE
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Active Communication Downlink History
            </h3>
          </div>
          <Radio size={20} style={{ color: '#38bdf8' }} />
        </div>

        {communications.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {communications.map((cs) => (
              <div key={cs.session_id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ fontSize: '0.95rem', color: '#f8fafc', display: 'block' }}>
                    {cs.station_code} ({cs.city}) ↔ {cs.satellite_code} ({cs.satellite_name})
                  </b>
                  <small style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                    Started: {new Date(cs.started_at).toLocaleString()}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>Signal {cs.signal_pct}%</span>
                  <StatusBadge status={cs.status || 'NOMINAL'} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
            No active communication sessions recorded.
          </div>
        )}
      </div>
    </div>
  );
}
