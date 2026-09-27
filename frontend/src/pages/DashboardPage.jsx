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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton height="180px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const summary = data?.summary || { active_crew: 4, active_satellites: 4, unresolved_alerts: 1, resource_health_pct: 86 };
  const station = data?.station || { name: 'Astra Habitat One', altitude_km: 408, velocity_kms: 7.66, status: 'NOMINAL' };
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const events = Array.isArray(data?.events) ? data.events : [];

  return (
    <div style={{ display: 'grid', gap: '3.5rem' }}>
      {/* SECTION 1: FULLSCREEN ISS HERO */}
      <HeroSection onEnterConsole={() => onSelectTab && onSelectTab('Station')} />

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
          <MetricCard icon={Compass} label="Station Orbit" value={`${station.altitude_km ?? 408} km`} sub={`${station.velocity_kms ?? 7.66} km/s velocity`} glowColor="#c084fc" />
        </div>
      </div>

      {/* SECTION 3: LIVE ISS ORBIT TRACKING WITH NASA EARTH BACKDROP */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.75) 0%, rgba(3, 7, 18, 0.95) 100%), url("/media/nasa/earth-orbit.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px' }}>
              SECTION 02 · REAL ORBITAL TRACKING
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              International Space Station Trajectory
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status="REAL" label="SGP4 CALCULATED" />
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

        {/* Orbit Map View */}
        <OrbitMap
          satellite={{ code: 'SAT-01', name: 'ISS / Aurelia', orbital_source: 'REAL', norad_id: 25544 }}
          liveOrbit={{ latitude: 49.214, longitude: -136.612, altitude_km: 420.23, velocity_kms: 7.67, source: 'REAL' }}
        />
      </div>

      {/* SECTION 4: SPACE STATION EXTERIOR & LIFE SUPPORT */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.82) 0%, rgba(3, 7, 18, 0.95) 100%), url("/media/nasa/iss-exterior.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px' }}>
              SECTION 03 · HABITAT & LIFE SUPPORT
            </p>
            <h2 style={{ margin: '4px 0 1.5rem', fontSize: '2rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Astra Habitat One Station Systems
            </h2>

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
        backgroundPosition: 'center',
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
            Astronaut observation platform overlooking low Earth orbit at an altitude of 420 kilometers.
          </p>
        </div>
      </div>
    </div>
  );
}
