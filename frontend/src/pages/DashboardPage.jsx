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
  CheckCircle2,
  Radio,
  Clock
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

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const summary = data?.summary || { active_crew: 4, active_satellites: 4, unresolved_alerts: 1, resource_health_pct: 86 };
  const station = data?.station || { name: 'Astra Habitat One', altitude_km: 408, velocity_kms: 7.66, status: 'NOMINAL' };
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const events = Array.isArray(data?.events) ? data.events : [];

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Hero Banner */}
      <HeroSection onEnterConsole={() => onSelectTab && onSelectTab('Station')} />

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={Users} label="Active Crew" value={summary.active_crew ?? 0} sub="On Horizon Mission" glowColor="#38bdf8" />
        <MetricCard icon={Orbit} label="Satellites" value={summary.active_satellites ?? 0} sub="Network Online" glowColor="#34d399" />
        <MetricCard icon={AlertTriangle} label="Open Alerts" value={summary.unresolved_alerts ?? 0} sub="Requires Attention" glowColor="#fbbf24" />
        <MetricCard icon={Compass} label="Station Orbit" value={`${station.altitude_km ?? 408} km`} sub={`${station.velocity_kms ?? 7.66} km/s velocity`} glowColor="#c084fc" />
      </div>

      {/* Station Resource & Priority Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Resource Health */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
                LIFE SUPPORT & RESOURCES
              </p>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Station Environment Status
              </h3>
            </div>
            <StatusBadge status={station.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {resources.map((r) => {
              const pct = Math.min(100, Math.max(0, Number(r.percentage || 0)));
              return (
                <div key={r.name} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{r.name}</span>
                    <b style={{ color: '#38bdf8' }}>{pct}%</b>
                  </div>
                  <div style={{ height: '6px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 'inherit' }} />
                  </div>
                  <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', marginTop: '6px', display: 'block' }}>
                    {r.current_quantity} {r.unit}
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Alerts */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Priority Alerts
            </h3>
            <button
              onClick={() => onSelectTab && onSelectTab('Alerts')}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {alerts.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {alerts.slice(0, 3).map((a) => (
                <div key={a.alert_id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.85rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={18} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <b style={{ fontSize: '12px', color: '#f8fafc' }}>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                      <StatusBadge status={a.severity} size="sm" />
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{a.message}</p>
                    <small style={{ fontSize: '9px', fontFamily: 'monospace', color: '#38bdf8', display: 'block', marginTop: '4px' }}>
                      {a.satellite_code || a.module_code || 'SYSTEM'}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
              No unresolved alerts in PostgreSQL database.
            </div>
          )}
        </div>
      </div>

      {/* Satellite Fleet Grid Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.6))',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1px' }}>
              SATELLITE NETWORK
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Fleet Status & Data Sources
            </h3>
          </div>
          <button
            onClick={() => onSelectSatellite('SAT-01')}
            style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Open ISS Track (SAT-01) <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { code: 'SAT-01', name: 'ISS / Aurelia', purpose: 'Real ISS Orbit & Earth Observation', battery_pct: 91, status: 'NOMINAL', orbital_source: 'REAL' },
            { code: 'SAT-02', name: 'AstraRelay-1', purpose: 'Communication Relay', battery_pct: 73, status: 'NOMINAL', orbital_source: 'SIMULATED' },
            { code: 'SAT-03', name: 'DeepSpace-3', purpose: 'Deep Space Research', battery_pct: 18, status: 'CRITICAL', orbital_source: 'SIMULATED' },
            { code: 'SAT-04', name: 'EcoWatch-4', purpose: 'Climate Monitoring', battery_pct: 88, status: 'NOMINAL', orbital_source: 'SIMULATED' }
          ].map((s) => (
            <div
              key={s.code}
              onClick={() => onSelectSatellite(s.code)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                  ◉ {s.code}
                </span>
                <StatusBadge status={s.orbital_source} size="sm" />
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {s.name}
              </h4>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>
                {s.purpose}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: '#94a3b8' }}>Battery: <b style={{ color: s.battery_pct < 20 ? '#fb7185' : '#f8fafc' }}>{s.battery_pct}%</b></span>
                <StatusBadge status={s.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
