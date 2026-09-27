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

  const currentLat = liveOrbit?.latitude ?? s.current_latitude ?? null;
  const currentLon = liveOrbit?.longitude ?? s.current_longitude ?? null;
  const currentAlt = liveOrbit?.altitude_km ?? s.current_altitude_km ?? null;
  const currentVel = liveOrbit?.velocity_kms ?? s.current_velocity_kms ?? null;

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Cinematic Top Section using Monochrome NASA Earth Orbit Background */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid #3a3a3a',
        backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.95) 100%), url("/media/nasa/earth-orbit.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        filter: 'grayscale(100%) contrast(110%) brightness(85%)',
        padding: '3rem 2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {/* LEFT COLUMN: ISS / Satellite Identity */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#000000', border: '1px solid #ffffff', color: '#ffffff', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, marginBottom: '12px' }}>
            <Eye size={13} />
            <span>REAL ISS ORBITAL TRACKING · CelesTrak TLE + SGP4 propagation</span>
          </div>

          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            {s.code} — {s.name}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#dadada' }}>
              NORAD ID: <b style={{ color: '#ffffff' }}>{s.norad_id || 25544}</b>
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#dadada' }}>
              Purpose: <b>{s.purpose || 'Space Operations & Tracking'}</b>
            </span>
            <StatusBadge status={orbitalSource} label={orbitalSource === 'REAL' ? '[● REAL]' : '[◇ SIMULATED]'} />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Kinematics Telemetry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          background: '#000000',
          border: '1px solid #3a3a3a',
          padding: '1.25rem',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)'
        }}>
          <div>
            <span style={{ color: '#999999', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>ALTITUDE</span>
            <b style={{ fontSize: '1.4rem', color: '#ffffff' }}>{currentAlt != null ? `${Number(currentAlt).toFixed(1)} km` : 'UNAVAILABLE'}</b>
            <small style={{ color: '#777777', fontSize: '10px', display: 'block' }}>Geodetic Height</small>
          </div>

          <div>
            <span style={{ color: '#999999', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>VELOCITY</span>
            <b style={{ fontSize: '1.4rem', color: '#ffffff' }}>{currentVel != null ? `${Number(currentVel).toFixed(2)} km/s` : 'UNAVAILABLE'}</b>
            <small style={{ color: '#777777', fontSize: '10px', display: 'block' }}>Orbital Speed</small>
          </div>

          <div>
            <span style={{ color: '#999999', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>LATITUDE</span>
            <b style={{ fontSize: '1.2rem', color: '#ffffff' }}>{currentLat != null ? `${Number(currentLat).toFixed(3)}° N` : 'N/A'}</b>
            <small style={{ color: '#777777', fontSize: '10px', display: 'block' }}>Sub-satellite Point</small>
          </div>

          <div>
            <span style={{ color: '#999999', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>LONGITUDE</span>
            <b style={{ fontSize: '1.2rem', color: '#ffffff' }}>{currentLon != null ? `${Number(currentLon).toFixed(3)}° E` : 'N/A'}</b>
            <small style={{ color: '#777777', fontSize: '10px', display: 'block' }}>Sub-satellite Point</small>
          </div>
        </div>
      </div>

      {/* Fleet Navigation Switcher - CSS Grid without native scrollbars in Monochrome */}
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '10px', fontFamily: 'monospace', color: '#999999', letterSpacing: '1.5px' }}>
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
                  border: `1px solid ${isSelected ? '#ffffff' : '#242424'}`,
                  background: isSelected ? '#ffffff' : '#111111',
                  color: isSelected ? '#000000' : '#999999',
                  fontWeight: isSelected ? 900 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 0 20px rgba(255, 255, 255, 0.2)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Orbit size={16} style={{ color: isSelected ? '#000000' : '#777777' }} />
                  <b>{sat.code}</b>
                </span>
                <StatusBadge status={sat.source} size="sm" label={sat.source === 'REAL' ? '[● REAL]' : '[◇ SIM]'} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Orbit Status & Controls Bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '14px',
        background: '#111111',
        border: '1px solid #3a3a3a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <b style={{ display: 'block', fontSize: '0.95rem', color: '#ffffff' }}>
            {orbitalSource === 'REAL'
              ? 'REAL ISS ORBITAL TRACKING (CelesTrak TLE + SGP4 propagation)'
              : 'SYNTHETIC SATELLITE ORBIT SIMULATION'}
          </b>
          <p style={{ margin: '4px 0 0', color: '#dadada', fontSize: '0.75rem', fontFamily: 'monospace' }}>
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
              background: '#000000',
              border: '1px solid #ffffff',
              color: '#ffffff',
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
      <div style={{ background: '#111111', border: '1px solid #3a3a3a', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
        <OrbitMap satellite={s} liveOrbit={liveOrbit} orbitHistory={orbitHistory} groundStations={groundStations} />
      </div>

      {/* Hardware Subsystem Components & Telemetry Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Hardware Components */}
        <div style={{ background: '#111111', border: '1px solid #3a3a3a', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#999999', letterSpacing: '1px' }}>
                HARDWARE SUBSYSTEMS
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Component Health Roster
              </h3>
            </div>
            <Cpu size={20} style={{ color: '#ffffff' }} />
          </div>

          {components.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {components.map((c) => (
                <div key={c.name} style={{ background: '#1c1c1c', border: '1px solid #242424', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{c.name}</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#777777', fontSize: '12px', fontFamily: 'monospace' }}>
              All core satellite hardware components nominal.
            </div>
          )}
        </div>

        {/* Telemetry Chart */}
        <div style={{ background: '#111111', border: '1px solid #3a3a3a', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#999999', letterSpacing: '1px' }}>
                SIMULATED TELEMETRY
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Battery Power History
              </h3>
            </div>
            <Zap size={20} style={{ color: '#ffffff' }} />
          </div>
          <TelemetryChart data={telemetry} dataKey="battery_pct" name="Battery %" stroke="#ffffff" />
        </div>
      </div>
    </div>
  );
}
