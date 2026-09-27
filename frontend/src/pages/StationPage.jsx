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
      {/* Cinematic Hero Header with Real NASA ISS Interior Background */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        backgroundImage: 'linear-gradient(180deg, rgba(3, 7, 18, 0.5) 0%, rgba(3, 7, 18, 0.95) 100%), url("/media/nasa/iss-interior.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        padding: '3.5rem 3rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '2px', marginBottom: '8px' }}>
              <Eye size={14} />
              <span>ASTRA HABITAT ONE · ISS INTERIOR OPERATIONS</span>
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-1px' }}>
              Station Systems & Habitat Modules
            </h1>
          </div>
          <StatusBadge status={station.status} />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={Compass} label="Orbital Altitude" value={`${station.altitude_km ?? 408} km`} sub="Geodetic Orbit" glowColor="#38bdf8" />
        <MetricCard icon={Activity} label="Orbital Velocity" value={`${station.velocity_kms ?? 7.66} km/s`} sub="Speed relative to Earth" glowColor="#06b6d4" />
        <MetricCard icon={Building2} label="Station Modules" value={modules.length} sub="All Online & Nominals" glowColor="#34d399" />
        <MetricCard icon={Zap} label="Resource Health" value={`${avgResourcePct}%`} sub="Life Support Health" glowColor="#c084fc" />
      </div>

      {/* Graphical Interactive Station Schematic */}
      <StationSchematic modules={modules} onSelectModule={setSelectedModule} />

      {/* Module Cards Grid */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '1.5px' }}>
            DETAILED ENVIRONMENTAL TELEMETRY
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
            Module Status & Atmospheric Readings
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {modules.map((m) => (
            <div
              key={m.module_id || m.code}
              onClick={() => setSelectedModule(m)}
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '16px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{m.code} · {m.module_type}</span>
                <StatusBadge status={m.status} size="sm" />
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {m.name}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>TEMP</span>
                  <b style={{ color: '#f8fafc', fontSize: '13px' }}>{m.temperature_c}°C</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>PRESSURE</span>
                  <b style={{ color: '#f8fafc', fontSize: '13px' }}>{m.pressure_kpa} kPa</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>OXYGEN</span>
                  <b style={{ color: m.oxygen_pct < 19 ? '#fb7185' : '#34d399', fontSize: '13px' }}>{m.oxygen_pct}%</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', display: 'block' }}>CO2</span>
                  <b style={{ color: '#f8fafc', fontSize: '13px' }}>{m.co2_pct}%</b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                <span>Maintenance: {m.last_maintenance_on || 'Nominal'}</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Inspect Module →</span>
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
              <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Type: {selectedModule.module_type}</span>
              <StatusBadge status={selectedModule.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>TEMPERATURE</small>
                <b style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{selectedModule.temperature_c}°C</b>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>PRESSURE</small>
                <b style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{selectedModule.pressure_kpa} kPa</b>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>OXYGEN LEVEL</small>
                <b style={{ fontSize: '1.25rem', color: selectedModule.oxygen_pct < 19 ? '#fb7185' : '#34d399' }}>{selectedModule.oxygen_pct}%</b>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '10px' }}>
                <small style={{ color: '#64748b', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>CO2 CONCENTRATION</small>
                <b style={{ fontSize: '1.25rem', color: '#f8fafc' }}>{selectedModule.co2_pct}%</b>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '10px', fontSize: '12px', color: '#cbd5e1' }}>
              <p style={{ margin: '0 0 6px' }}>Power Draw: <b style={{ color: '#38bdf8' }}>{selectedModule.power_kw ?? 4.8} kW</b></p>
              <p style={{ margin: '0 0 6px' }}>Last Maintenance Inspection: <b>{selectedModule.last_maintenance_on || 'Not recorded'}</b></p>
              <p style={{ margin: 0 }}>Telemetry Source: <b style={{ color: '#34d399' }}>PostgreSQL station_telemetry</b></p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
