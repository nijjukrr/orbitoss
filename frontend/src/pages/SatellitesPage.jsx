import React, { useState, useEffect } from 'react';
import { Orbit, Compass, RefreshCw, Cpu, Activity, Zap, Shield, AlertTriangle, Terminal } from 'lucide-react';
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

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Fleet Navigation Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {satellitesList.map((sat) => {
          const isSelected = sat.code === code;
          return (
            <button
              key={sat.code}
              onClick={() => onSelectSatellite && onSelectSatellite(sat.code)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)'}`,
                background: isSelected ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.3), rgba(6, 182, 212, 0.15))' : 'rgba(15, 23, 42, 0.7)',
                color: isSelected ? '#38bdf8' : '#94a3b8',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none'
              }}
            >
              <Orbit size={16} /> {sat.code} ({sat.name})
              <StatusBadge status={sat.source} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Header & Source Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
            <span>NORAD ID: {s.norad_id || 25544}</span> · <span>{s.purpose || 'Satellite Operations'}</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {s.code} — {s.name}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleManualOrbitRefresh}
            disabled={orbitRefreshing}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} style={{ animation: orbitRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {orbitRefreshing ? 'Refreshing SGP4...' : `Refresh Orbit (${lastRefreshTime})`}
          </button>
          <StatusBadge status={orbitalSource} />
        </div>
      </div>

      {/* Data Source & Reliability Banner */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        background: orbitalSource === 'REAL' ? (reliable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)') : 'rgba(30, 41, 59, 0.5)',
        border: `1px solid ${orbitalSource === 'REAL' ? (reliable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)') : 'rgba(56, 189, 248, 0.2)'}`,
        color: orbitalSource === 'REAL' ? (reliable ? '#34d399' : '#fb7185') : '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem'
      }}>
        <div>
          <b style={{ display: 'block', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
            {orbitalSource === 'REAL'
              ? (reliable ? 'REAL ORBITAL DATA (SGP4 MATH PROPAGATOR)' : 'OFFLINE / STALE TLE ORBIT DATA')
              : 'SYNTHETIC DEMO SATELLITE ORBIT'}
          </b>
          <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {orbitalSource === 'REAL'
              ? `Source: ${dataSource === 'CELESTRAK_LIVE' ? 'CelesTrak Live' : dataSource} | TLE Age: ${tleAgeHours} hours | SGP4 Kinematics`
              : 'Numerical orbit generated for DBMS demonstration.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <StatusBadge status={dataSource} label={`SOURCE: ${dataSource.replace('_', ' ')}`} size="sm" />
          <span style={{ fontSize: '9px', fontFamily: 'monospace', padding: '3px 8px', borderRadius: '4px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#94a3b8' }}>
            TELEMETRY: SIMULATED
          </span>
        </div>
      </div>

      {/* Real-time Position Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricCard icon={Compass} label="Latitude" value={`${liveOrbit?.latitude ?? s.current_latitude ?? 0}° N`} sub="SGP4 Geodetic Lat" glowColor="#38bdf8" />
        <MetricCard icon={Compass} label="Longitude" value={`${liveOrbit?.longitude ?? s.current_longitude ?? 0}° E`} sub="SGP4 Geodetic Lon" glowColor="#06b6d4" />
        <MetricCard icon={Orbit} label="Altitude" value={`${liveOrbit?.altitude_km ?? s.current_altitude_km ?? 408} km`} sub="Geodetic Height" glowColor="#34d399" />
        <MetricCard icon={Activity} label="Velocity" value={`${liveOrbit?.velocity_kms ?? s.current_velocity_kms ?? 7.66} km/s`} sub="Orbital Velocity" glowColor="#c084fc" />
      </div>

      {/* Ground Track Map */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
        <OrbitMap satellite={s} liveOrbit={liveOrbit} orbitHistory={orbitHistory} groundStations={groundStations} />
      </div>

      {/* Hardware Subsystem Components & Telemetry Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Hardware Components */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '1.5rem', borderRadius: '16px' }}>
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
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '1.5rem', borderRadius: '16px' }}>
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
