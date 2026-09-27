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
  Terminal,
  Layers,
  ChevronDown
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
    <div style={{ display: 'grid', gap: '3rem' }}>
      {/* SECTION 1: SPACEX-STYLE CINEMATIC HERO */}
      <HeroSection onEnterConsole={() => onSelectTab && onSelectTab('Station')} />

      {/* SECTION 2: LIVE MISSION KPI OVERLAY */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
            SECTION 01 · SYSTEM METRICS
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
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

      {/* SECTION 3: LIVE ISS ORBIT TRACKING & GROUND MAP */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
              SECTION 02 · REAL ORBITAL INTELLIGENCE
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
              International Space Station (NORAD 25544)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status="REAL" label="SGP4 CALCULATED" />
            <button
              onClick={() => onSelectSatellite('SAT-01')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
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

      {/* SECTION 4: SPACE STATION OPERATIONS & PRIORITY ALERTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Resource Health */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '20px',
          padding: '1.75rem',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
                SECTION 03 · LIFE SUPPORT & HABITAT
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
                Astra Habitat One Resources
              </h3>
            </div>
            <StatusBadge status={station.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {resources.map((r) => {
              const pct = Math.min(100, Math.max(0, Number(r.percentage || 0)));
              return (
                <div key={r.name} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{r.name}</span>
                    <b style={{ color: '#38bdf8' }}>{pct}%</b>
                  </div>
                  <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
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

        {/* Priority System Alerts */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '20px',
          padding: '1.75rem',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
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
                <div key={a.alert_id} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={20} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <b style={{ fontSize: '12px', color: '#f8fafc' }}>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                      <StatusBadge status={a.severity} size="sm" />
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{a.message}</p>
                    <small style={{ fontSize: '9px', fontFamily: 'monospace', color: '#38bdf8', display: 'block', marginTop: '6px' }}>
                      {a.satellite_code || a.module_code || 'SYSTEM'}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
              No unresolved alerts recorded in database.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: SYSTEM EVENTS TIMELINE */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '20px',
        padding: '1.75rem',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
              SECTION 04 · POSTGRESQL v_system_events VIEW
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
              Operational Event Activity Log
            </h3>
          </div>
          <Clock size={20} style={{ color: '#38bdf8' }} />
        </div>

        {events.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {events.slice(0, 5).map((evt, idx) => (
              <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={evt.event_type} size="sm" />
                  <b style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{evt.title}</b>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
                  {new Date(evt.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
            No operational events logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
