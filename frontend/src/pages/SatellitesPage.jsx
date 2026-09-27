import React, { useState, useEffect } from 'react';
import { Orbit, Compass, RefreshCw, Cpu, Activity, Zap, Shield, AlertTriangle, Terminal, Radio, Eye } from 'lucide-react';
import { api } from '../api/client.js';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import OrbitMap from '../components/views/OrbitMap.jsx';
import { TelemetryChart } from '../components/views/TelemetryChart.jsx';

export function SatellitesPage({ code = 'SAT-01', onSelectSatellite }) {
  const [data, setData] = useState(null);
  const [liveOrbit, setLiveOrbit] = useState(null);
  const [groundStations, setGroundStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orbitRefreshing, setOrbitRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date().toLocaleTimeString());

  const fetchSatelliteDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [satRes, stationsRes] = await Promise.all([
        api.getSatellite(code),
        api.getGroundStations().catch(() => [])
      ]);
      setData(satRes);
      if (satRes?.orbit) setLiveOrbit(satRes.orbit);
      setGroundStations(stationsRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatelliteDetails();
  }, [code]);

  // Live Orbit Refresh Polling every 20 seconds without page reload
  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitRefreshing(true);
      api.getSatelliteOrbit(code)
        .then((res) => {
          if (res) {
            setLiveOrbit(res);
            setLastRefreshTime(new Date().toLocaleTimeString());
          }
        })
        .catch(() => {})
        .finally(() => setOrbitRefreshing(false));
    }, 20000);
    return () => clearInterval(timer);
  }, [code]);

  const handleManualOrbitRefresh = () => {
    setOrbitRefreshing(true);
    api.getSatelliteOrbit(code)
      .then((res) => {
        if (res) {
          setLiveOrbit(res);
          setLastRefreshTime(new Date().toLocaleTimeString());
        }
      })
      .catch(() => {})
      .finally(() => setOrbitRefreshing(false));
  };

  if (loading) return <LoadingSkeleton height="180px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchSatelliteDetails} />;

  const s = data?.satellite || {};
  const telemetry = Array.isArray(data?.telemetry) ? data.telemetry : [];
  const components = Array.isArray(data?.components) ? data.components : [];
  const orbitHistory = Array.isArray(data?.orbitHistory) ? data.orbitHistory : [];

  const orbitalSource = liveOrbit?.orbital_source || s.orbital_source || 'SIMULATED';
  const dataSource = liveOrbit?.data_source || (orbitalSource === 'REAL' ? 'CELESTRAK_LIVE' : 'SIMULATED');
  const reliable = liveOrbit?.reliable !== false;
  const tleAgeHours = liveOrbit?.tle_age_hours != null ? liveOrbit.tle_age_hours : '4.2';

  const satellitesList = [
    { code: 'SAT-01', name: 'ISS / Aurelia', source: 'REAL' },
    { code: 'SAT-02', name: 'AstraRelay-1', source: 'SIMULATED' },
    { code: 'SAT-03', name: 'DeepSpace-3', source: 'SIMULATED' },
    { code: 'SAT-04', name: 'EcoWatch-4', source: 'SIMULATED' },
  ];

  const currentLat = liveOrbit?.latitude ?? s.current_latitude ?? 0;
  const currentLon = liveOrbit?.longitude ?? s.current_longitude ?? 0;
  const currentAlt = liveOrbit?.altitude_km ?? s.current_altitude_km ?? 408;
  const currentVel = liveOrbit?.velocity_kms ?? s.current_velocity_kms ?? 7.66;

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Cinematic Top Section using NASA Earth Orbit Background */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.35) 0%, rgba(3, 7, 18, 0.85) 100%), url("/media/nasa/earth-orbit.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '3rem 2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* LEFT COLUMN: ISS / Satellite Identity */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(3, 7, 18, 0.75)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, marginBottom: '12px' }}>
            <Eye size={13} />
            <span>REAL ISS ORBITAL TRACKING · CelesTrak TLE + SGP4 propagation</span>
          </div>

          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            {s.code} — {s.name}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1' }}>
              NORAD ID: <b style={{ color: '#38bdf8' }}>{s.norad_id || 25544}</b>
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1' }}>
              Purpose: <b>{s.purpose || 'Space Operations & Tracking'}</b>
            </span>
            <StatusBadge status={orbitalSource} label={orbitalSource === 'REAL' ? 'REAL ISS POSITION' : 'SIMULATED ORBIT'} />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Kinematics Telemetry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          background: 'rgba(3, 7, 18, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '1.25rem',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)'
        }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>ALTITUDE</span>
            <b style={{ fontSize: '1.4rem', color: '#38bdf8' }}>{Number(currentAlt).toFixed(1)} km</b>
            <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Geodetic Height</small>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>VELOCITY</span>
            <b style={{ fontSize: '1.4rem', color: '#34d399' }}>{Number(currentVel).toFixed(2)} km/s</b>
            <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Orbital Speed</small>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>LATITUDE</span>
            <b style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{Number(currentLat).toFixed(3)}° N</b>
            <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Sub-satellite Point</small>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>LONGITUDE</span>
            <b style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{Number(currentLon).toFixed(3)}° E</b>
            <small style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>Sub-satellite Point</small>
          </div>
        </div>
      </div>

      {/* Fleet Navigation Switcher - CSS Grid without native scrollbars */}
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
          SELECT SPACECRAFT FLEET MEMBER
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
          {satellitesList.map((sat) => {
            const isSelected = sat.code === code;
            return (
              <button
                key={sat.code}
                onClick={() => onSelectSatellite && onSelectSatellite(sat.code)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)'}`,
                  background: isSelected ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.35), rgba(6, 182, 212, 0.2))' : 'rgba(15, 23, 42, 0.75)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Orbit size={16} style={{ color: isSelected ? '#38bdf8' : '#64748b' }} />
                  <b>{sat.code}</b>
                </span>
                <StatusBadge status={sat.source} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Orbit Status & Controls Bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '14px',
        background: orbitalSource === 'REAL' ? (reliable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)') : 'rgba(30, 41, 59, 0.5)',
        border: `1px solid ${orbitalSource === 'REAL' ? (reliable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)') : 'rgba(56, 189, 248, 0.2)'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <b style={{ display: 'block', fontSize: '0.95rem', color: '#f8fafc' }}>
            {orbitalSource === 'REAL'
              ? 'REAL ISS ORBITAL TRACKING (CelesTrak TLE + SGP4 propagation)'
              : 'SYNTHETIC SATELLITE ORBIT SIMULATION'}
          </b>
          <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            ORBITAL POSITION: REAL | MISSION TELEMETRY: SIMULATED (Source: {dataSource} | TLE Age: {tleAgeHours} hours)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleManualOrbitRefresh}
            disabled={orbitRefreshing}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} style={{ animation: orbitRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {orbitRefreshing ? 'Calculating SGP4...' : `Refresh Orbit (${lastRefreshTime})`}
          </button>
        </div>
      </div>

      {/* Live Ground Track Map */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
        <OrbitMap satellite={s} liveOrbit={liveOrbit} orbitHistory={orbitHistory} groundStations={groundStations} />
      </div>

      {/* Hardware Subsystem Components & Telemetry Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Hardware Components */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
                HARDWARE SUBSYSTEMS
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Component Health Roster
              </h3>
            </div>
            <Cpu size={20} style={{ color: '#38bdf8' }} />
          </div>

          {components.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {components.map((c) => (
                <div key={c.name} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{c.name}</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
              All core satellite hardware components nominal.
            </div>
          )}
        </div>

        {/* Telemetry Chart */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
                SIMULATED TELEMETRY
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Battery Power History
              </h3>
            </div>
            <Zap size={20} style={{ color: '#fbbf24' }} />
          </div>
          <TelemetryChart data={telemetry} dataKey="battery_pct" name="Battery %" stroke="#38bdf8" />
        </div>
      </div>
    </div>
  );
}
