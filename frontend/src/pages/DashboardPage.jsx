import React, { useState, useEffect } from 'react';
import {
  Users,
  Orbit,
  AlertTriangle,
  Compass,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  Building2,
  FlaskConical,
  Eye
} from 'lucide-react';
import { api } from '../api/client.js';
import { HeroSection } from '../components/layout/HeroSection.jsx';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import OrbitMap from '../components/views/OrbitMap.jsx';

export function DashboardPage({ onSelectSatellite, onSelectTab }) {
  const [data, setData] = useState(null);
  const [sat01Orbit, setSat01Orbit] = useState(null);
  const [orbitSourceState, setOrbitSourceState] = useState('LIVE');
  const [lastOrbitUpdate, setLastOrbitUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, orbitRes] = await Promise.all([
        api.getDashboard(),
        api.getSatelliteOrbit('SAT-01').catch(() => null)
      ]);
      setData(dashRes);
      if (orbitRes) {
        setSat01Orbit(orbitRes);
        setOrbitSourceState('LIVE');
        setLastOrbitUpdate(new Date().toLocaleTimeString());
      } else {
        setOrbitSourceState('UNAVAILABLE');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Poll SAT-01 orbit every 20s to stay strictly synchronized with SatellitesPage
  useEffect(() => {
    const timer = setInterval(() => {
      api.getSatelliteOrbit('SAT-01')
        .then((res) => {
          if (res) {
            setSat01Orbit(res);
            setOrbitSourceState('LIVE');
            setLastOrbitUpdate(new Date().toLocaleTimeString());
          }
        })
        .catch(() => setOrbitSourceState('CACHED'));
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <LoadingSkeleton height="180px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const summary = data?.summary || { active_crew: 4, active_satellites: 4, unresolved_alerts: 1, resource_health_pct: 86 };
  const station = data?.station || { name: 'Astra Habitat One', altitude_km: 408, velocity_kms: 7.66, status: 'NOMINAL' };
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

  const currentSat01Alt = sat01Orbit?.altitude_km ?? station.altitude_km ?? 408;
  const currentSat01Vel = sat01Orbit?.velocity_kms ?? station.velocity_kms ?? 7.66;

  return (
    <div style={{ display: 'grid', gap: '3.5rem' }}>
      {/* SECTION 1: FULLSCREEN HERO WITH SYNCHRONIZED SAT-01 LIVE ALTITUDE */}
      <HeroSection onEnterConsole={() => onSelectTab && onSelectTab('Station')} liveAltitude={currentSat01Alt} />

      {/* SECTION 2: LIVE MISSION KPI METRICS */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px' }}>
            SECTION 01 · SYSTEM METRICS
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Live Operations Overview
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <MetricCard icon={Users} label="Active Crew" value={summary.active_crew ?? 0} sub="On Horizon Mission" glowColor="#38bdf8" />
          <MetricCard icon={Orbit} label="Satellites" value={summary.active_satellites ?? 0} sub="Network Online" glowColor="#34d399" />
          <MetricCard icon={AlertTriangle} label="Open Alerts" value={summary.unresolved_alerts ?? 0} sub="Requires Action" glowColor="#fbbf24" />
          <MetricCard icon={Compass} label="ISS Orbit Altitude" value={`${Number(currentSat01Alt).toFixed(1)} km`} sub={`${Number(currentSat01Vel).toFixed(2)} km/s velocity`} glowColor="#c084fc" />
        </div>
      </div>

      {/* SECTION 3: LIVE ISS ORBIT TRACKING WITH SYNCHRONIZED API ORBIT DATA */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.55) 0%, rgba(3, 7, 18, 0.9) 100%), url("/media/nasa/earth-orbit.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px', marginBottom: '6px' }}>
              <span>SECTION 02 · REAL ORBITAL TRACKING</span> · 
              <span>STATUS: <b style={{ color: orbitSourceState === 'LIVE' ? '#34d399' : '#fbbf24' }}>{orbitSourceState}</b> {lastOrbitUpdate ? `(${lastOrbitUpdate})` : ''}</span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              International Space Station Trajectory
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={sat01Orbit?.source || 'REAL'} label="SGP4 CALCULATED" />
            <button
              onClick={() => onSelectSatellite('SAT-01')}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)'
              }}
            >
              Full Satellite Track <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Orbit Map View using actual live SAT-01 orbit API response */}
        <OrbitMap
          satellite={{ code: 'SAT-01', name: 'ISS / Aurelia', orbital_source: 'REAL', norad_id: 25544 }}
          liveOrbit={sat01Orbit || { latitude: 49.214, longitude: -136.612, altitude_km: currentSat01Alt, velocity_kms: currentSat01Vel, source: 'REAL' }}
        />
      </div>

      {/* SECTION 4: ASTRA HABITAT ONE SIMULATED STATION OPERATIONS */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.6) 0%, rgba(3, 7, 18, 0.9) 100%), url("/media/nasa/iss-exterior.jpg")',
        backgroundPosition: 'center 30%',
        backgroundSize: 'cover',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px', marginBottom: '6px' }}>
              <span>SECTION 03 · SIMULATED STATION OPERATIONS</span>
            </div>
            <h2 style={{ margin: '4px 0 4px', fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Astra Habitat One Life Support
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 1.5rem' }}>
              NASA ISS imagery used for educational visual reference. Station telemetry is simulated.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {resources.map((r) => {
                const pct = Math.min(100, Math.max(0, Number(r.percentage || 0)));
                return (
                  <div key={r.name} style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.25rem', borderRadius: '14px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>{r.name}</span>
                      <b style={{ color: '#38bdf8' }}>{pct}%</b>
                    </div>
                    <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 'inherit' }} />
                    </div>
                    <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', marginTop: '8px', display: 'block' }}>
                      {r.current_quantity} {r.unit}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Alerts Side Card */}
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
                Priority Alerts
              </h3>
              <button
                onClick={() => onSelectTab && onSelectTab('Alerts')}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                All Alerts <ArrowRight size={14} />
              </button>
            </div>

            {alerts.length ? (
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {alerts.slice(0, 3).map((a) => (
                  <div key={a.alert_id} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '0.85rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <b style={{ fontSize: '11px', color: '#ffffff' }}>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                        <StatusBadge status={a.severity} size="sm" />
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1' }}>{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                No unresolved alerts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: CUPOLA EARTH OBSERVATION BANNER */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.4) 0%, rgba(3, 7, 18, 0.9) 100%), url("/media/nasa/station-cupola.jpg")',
        backgroundPosition: 'center 20%',
        backgroundSize: 'cover',
        padding: '4rem 3rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '380px'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px', marginBottom: '8px' }}>
            <Eye size={14} />
            <span>SECTION 04 · CUPOLA OBSERVATION MODULE</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Earth Orbital View From Cupola
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Astronaut observation platform overlooking low Earth orbit at an altitude of {Number(currentSat01Alt).toFixed(1)} kilometers.
          </p>
        </div>
      </div>
    </div>
  );
}
