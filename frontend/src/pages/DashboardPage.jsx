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
import { DemoTools } from '../components/shared/DemoTools.jsx';
import OrbitMap from '../components/views/OrbitMap.jsx';

export function DashboardPage({ onSelectSatellite, onSelectTab, onEmergencyTriggered }) {
  const [data, setData] = useState(null);
  const [sat01Orbit, setSat01Orbit] = useState(null);
  const [orbitSourceState, setOrbitSourceState] = useState('CHECKING');
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
      if (orbitRes && orbitRes.latitude != null) {
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

  // Poll SAT-01 orbit every 20s. If polling fails, keep last known orbit and label CACHED
  useEffect(() => {
    const timer = setInterval(() => {
      api.getSatelliteOrbit('SAT-01')
        .then((res) => {
          if (res && res.latitude != null) {
            setSat01Orbit(res);
            setOrbitSourceState('LIVE');
            setLastOrbitUpdate(new Date().toLocaleTimeString());
          } else if (sat01Orbit) {
            setOrbitSourceState('STALE');
          } else {
            setOrbitSourceState('UNAVAILABLE');
          }
        })
        .catch(() => {
          if (sat01Orbit) {
            setOrbitSourceState('CACHED');
          } else {
            setOrbitSourceState('UNAVAILABLE');
          }
        });
    }, 20000);
    return () => clearInterval(timer);
  }, [sat01Orbit]);

  if (loading) return <LoadingSkeleton height="180px" count={4} />;
  if (error) return <ErrorState title="MISSION DATA UNAVAILABLE" message={error} onRetry={fetchDashboard} />;

  const summary = data?.summary || { active_crew: 4, active_satellites: 4, unresolved_alerts: 1, resource_health_pct: 86 };
  const station = data?.station || { name: 'Astra Habitat One', status: 'NOMINAL' };
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

  const currentSat01Alt = sat01Orbit?.altitude_km ?? null;
  const currentSat01Vel = sat01Orbit?.velocity_kms ?? null;

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      {/* SECTION 1: MONOCHROME ISS HERO */}
      <HeroSection onEnterConsole={() => onSelectTab && onSelectTab('Station')} liveAltitude={currentSat01Alt} />

      {/* SECTION 2: DEMO TOOLS COLLAPSED CONTROLS */}
      <DemoTools onEmergencyTriggered={onEmergencyTriggered} />

      {/* SECTION 3: LIVE MISSION KPI METRICS */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px' }}>
            SECTION 01 · SYSTEM METRICS
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Live Operations Overview
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <MetricCard icon={Users} label="Active Crew" value={summary.active_crew ?? 0} sub="On Horizon Mission" />
          <MetricCard icon={Orbit} label="Satellites" value={summary.active_satellites ?? 0} sub="Network Online" />
          <MetricCard icon={AlertTriangle} label="Open Alerts" value={summary.unresolved_alerts ?? 0} sub="Requires Action" />
          <MetricCard icon={Compass} label="ISS Orbit Altitude" value={currentSat01Alt != null ? `${Number(currentSat01Alt).toFixed(1)} km` : 'UNAVAILABLE'} sub={currentSat01Vel != null ? `${Number(currentSat01Vel).toFixed(2)} km/s velocity` : 'Awaiting Telemetry'} />
        </div>
      </div>

      {/* SECTION 3: REAL ORBITAL TRACKING */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '2rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>
              <span>SECTION 02 · REAL ORBITAL TRACKING</span> · 
              <span>STATUS: <b style={{ color: 'var(--text-primary)' }}>{orbitSourceState}</b> {lastOrbitUpdate ? `(${lastOrbitUpdate})` : ''}</span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              International Space Station Trajectory
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={sat01Orbit ? (sat01Orbit.source || 'REAL') : 'UNAVAILABLE'} label={sat01Orbit ? 'SGP4 CALCULATED' : 'ORBIT UNAVAILABLE'} />
            <button
              onClick={() => onSelectSatellite('SAT-01')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                background: 'var(--button-primary-bg)',
                border: '1px solid var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              Full Satellite Track <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Orbit Map View using actual live SAT-01 orbit API response */}
        <OrbitMap
          satellite={{ code: 'SAT-01', name: 'ISS / Aurelia', orbital_source: sat01Orbit ? 'REAL' : 'UNAVAILABLE', norad_id: 25544 }}
          liveOrbit={sat01Orbit}
        />
      </div>

      {/* SECTION 4: ASTRA HABITAT ONE SIMULATED STATION OPERATIONS */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '2rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>
              <span>SECTION 03 · SIMULATED STATION OPERATIONS</span>
            </div>
            <h2 style={{ margin: '4px 0 4px', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Astra Habitat One Life Support
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 1.5rem' }}>
              NASA ISS imagery used for educational visual reference. Station telemetry is simulated.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {resources.map((r) => {
                const pct = Math.min(100, Math.max(0, Number(r.percentage || 0)));
                return (
                  <div key={r.name} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{r.name}</span>
                      <b style={{ color: 'var(--text-primary)' }}>{pct}%</b>
                    </div>
                    <div style={{ height: '8px', borderRadius: '10px', background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--text-primary)', borderRadius: 'inherit' }} />
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', marginTop: '8px', display: 'block' }}>
                      {r.current_quantity} {r.unit}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Alerts Side Card */}
          <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                Priority Alerts
              </h3>
              <button
                onClick={() => onSelectTab && onSelectTab('Alerts')}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                All Alerts <ArrowRight size={14} />
              </button>
            </div>

            {alerts.length ? (
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {alerts.slice(0, 3).map((a) => (
                  <div key={a.alert_id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <b style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                        <StatusBadge status={a.severity} size="sm" />
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
                No unresolved alerts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: CUPOLA EARTH OBSERVATION BANNER */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%), url("/media/nasa/station-cupola.jpg")',
        backgroundPosition: 'center 20%',
        backgroundSize: 'cover',
        filter: 'var(--img-filter)',
        padding: '3.5rem 2.5rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '340px'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#dadada', letterSpacing: '2px', marginBottom: '8px' }}>
            <Eye size={14} />
            <span>SECTION 04 · CUPOLA OBSERVATION MODULE</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Earth Orbital View From Cupola
          </h2>
          <p style={{ color: '#dadada', fontSize: '0.95rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Astronaut observation platform overlooking low Earth orbit at an altitude of {currentSat01Alt != null ? `${Number(currentSat01Alt).toFixed(1)} kilometers` : 'UNAVAILABLE'}.
          </p>
        </div>
      </div>
    </div>
  );
}
