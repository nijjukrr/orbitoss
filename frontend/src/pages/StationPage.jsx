import React, { useState, useEffect } from 'react';
import { Building2, Compass, Activity, Zap, Layers, RefreshCw, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { api } from '../api/client.js';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import { Modal } from '../components/shared/Modal.jsx';
import { StationSchematic } from '../components/views/StationSchematic.jsx';

export function StationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchStationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStation();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
  }, []);

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState message={error} onRetry={fetchStationData} />;

  const station = data?.station || { name: 'Astra Habitat One', altitude_km: 408, velocity_kms: 7.66, status: 'NOMINAL' };
  const modules = Array.isArray(data?.modules) ? data.modules : [];
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const avgResourcePct = resources.length
    ? (resources.reduce((a, r) => a + Number(r.percentage || 0), 0) / resources.length).toFixed(1)
    : '86.0';

  return (
    <div style={{ display: 'grid', gap: '3rem' }}>
      {/* Hero Header */}
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '2.5rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '8px' }}>
              <Eye size={14} />
              <span>ASTRA HABITAT ONE · SIMULATED STATION OPERATIONS</span>
            </div>
            <h1 style={{ margin: '4px 0 4px', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Station Systems & Habitat Modules
            </h1>
            <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              NASA ISS imagery used for educational visual reference. Telemetry is simulated.
            </p>
          </div>
          <StatusBadge status="SIMULATED" label="SIMULATED HABITAT" />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={Compass} label="Orbital Altitude" value={`${station.altitude_km ?? 408} km`} sub="Geodetic Orbit" />
        <MetricCard icon={Activity} label="Orbital Velocity" value={`${station.velocity_kms ?? 7.66} km/s`} sub="Speed relative to Earth" />
        <MetricCard icon={Building2} label="Station Modules" value={modules.length} sub="All Online & Nominals" />
        <MetricCard icon={Zap} label="Resource Health" value={`${avgResourcePct}%`} sub="Life Support Health" />
      </div>

      {/* Graphical Interactive Station Schematic */}
      <StationSchematic modules={modules} onSelectModule={setSelectedModule} />

      {/* Module Cards Grid */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
            POSTGRESQL station_telemetry TABLE (SIMULATED HABITAT DATA)
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Module Status & Atmospheric Readings
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {modules.map((m) => (
            <div
              key={m.module_id || m.code}
              onClick={() => setSelectedModule(m)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--card-shadow)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{m.code} · {m.module_type}</span>
                <StatusBadge status={m.status} size="sm" />
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.name}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', background: 'var(--surface-muted)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>TEMP</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{m.temperature_c != null ? m.temperature_c : '--'}°C</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>PRESSURE</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{m.pressure_kpa != null ? m.pressure_kpa : '--'} kPa</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>OXYGEN</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{m.oxygen_pct != null ? m.oxygen_pct : '--'}%</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', display: 'block' }}>CO2</span>
                  <b style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{m.co2_pct != null ? m.co2_pct : '--'}%</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Maintenance: {m.last_maintenance_on ? new Date(m.last_maintenance_on).toLocaleDateString() : 'Nominal'}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Inspect Module →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Inspector Modal */}
      {selectedModule && (
        <Modal isOpen={!!selectedModule} onClose={() => setSelectedModule(null)} title={`${selectedModule.code} — ${selectedModule.name} Details`}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Type: {selectedModule.module_type}</span>
              <StatusBadge status={selectedModule.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '8px' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>TEMPERATURE</small>
                <b style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedModule.temperature_c}°C</b>
              </div>
              <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '8px' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>PRESSURE</small>
                <b style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedModule.pressure_kpa} kPa</b>
              </div>
              <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '8px' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>OXYGEN LEVEL</small>
                <b style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedModule.oxygen_pct}%</b>
              </div>
              <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '8px' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>CO2 CONCENTRATION</small>
                <b style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedModule.co2_pct}%</b>
              </div>
            </div>

            <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 6px' }}>Power Draw: <b style={{ color: 'var(--text-primary)' }}>{selectedModule.power_kw ?? 4.8} kW</b></p>
              <p style={{ margin: '0 0 6px' }}>Last Maintenance Inspection: <b>{selectedModule.last_maintenance_on ? new Date(selectedModule.last_maintenance_on).toLocaleDateString() : 'Not recorded'}</b></p>
              <p style={{ margin: 0 }}>Telemetry Source: <b style={{ color: 'var(--text-primary)' }}>PostgreSQL station_telemetry</b></p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
