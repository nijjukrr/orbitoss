import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { get, patch, send } from './api.js';
import OrbitMap from './OrbitMap.jsx';

const tabs = ['Dashboard', 'Station', 'Crew', 'Experiments', 'Satellites', 'Ground Stations', 'Command Center', 'Alerts'];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ORBITOPS ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="panel" style={{ margin: '40px', padding: '30px', background: '#3d141e', color: '#ff798d', border: '1px solid #822234' }}>
          <h2>⚠ Application Interface Exception</h2>
          <p style={{ color: '#ffb5c0', fontSize: '13px', margin: '10px 0 20px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button className="primary" onClick={() => window.location.reload()}>Reload Mission Control</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const fallback = {
  summary: { active_crew: 4, active_satellites: 4, unresolved_alerts: 1, resource_health_pct: 86 },
  station: { name: 'Astra Habitat One', altitude_km: 408, velocity_kms: 7.66, status: 'NOMINAL' },
  resources: [
    { name: 'Oxygen', percentage: 94, current_quantity: 94, unit: '%' },
    { name: 'Water', percentage: 78, current_quantity: 780, unit: 'L' },
    { name: 'Power', percentage: 86, current_quantity: 860, unit: 'kWh' }
  ],
  alerts: [
    { alert_id: 'demo', alert_type: 'LOW_BATTERY', severity: 'CRITICAL', message: 'Battery critically low: 18%', satellite_code: 'SAT-03' }
  ],
  events: []
};

const statusClass = (value) => `status ${String(value || 'NOMINAL').toLowerCase()}`;

function Metric({ icon, label, value, sub }) {
  return (
    <article className="metric">
      <span className="metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        {sub && <small>{sub}</small>}
      </div>
    </article>
  );
}

function Resource({ resource }) {
  const pct = Math.min(100, Math.max(0, Number(resource?.percentage ?? 0)));
  return (
    <div className="resource">
      <div>
        <span>{resource?.name || 'Resource'}</span>
        <b>{pct}%</b>
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      <small>{resource?.current_quantity ?? 'Simulated'} {resource?.unit || ''}</small>
    </div>
  );
}

function EmergencyPanel({ onTrigger }) {
  const [loading, setLoading] = useState('');

  const triggerEmergency = async (type) => {
    setLoading(type);
    try {
      const res = await send('/simulator/emergency', { type });
      if (onTrigger) onTrigger(res.message);
    } catch (e) {
      alert(`Emergency trigger failed: ${e.message}`);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="demo-emergency-bar">
      <label>DEMO TRIGGERS (DBMS TRIGGERS):</label>
      <button className="btn-emergency battery" disabled={!!loading} onClick={() => triggerEmergency('LOW_BATTERY')}>
        ⚡ {loading === 'LOW_BATTERY' ? 'Firing...' : 'Low Battery'}
      </button>
      <button className="btn-emergency oxygen" disabled={!!loading} onClick={() => triggerEmergency('LOW_OXYGEN')}>
        🫁 {loading === 'LOW_OXYGEN' ? 'Firing...' : 'Low Oxygen'}
      </button>
      <button className="btn-emergency temp" disabled={!!loading} onClick={() => triggerEmergency('HIGH_TEMP')}>
        🔥 {loading === 'HIGH_TEMP' ? 'Firing...' : 'High Temp'}
      </button>
    </div>
  );
}

function Dashboard({ dashboard, selectSatellite, onSelectTab }) {
  const d = dashboard || fallback;
  const summary = d?.summary || fallback.summary;
  const station = d?.station || fallback.station;
  const resources = Array.isArray(d?.resources) && d.resources.length ? d.resources : fallback.resources;
  const alerts = Array.isArray(d?.alerts) ? d.alerts : fallback.alerts;

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">LIVE MISSION OVERVIEW</p>
          <h1>Space Operations Command Center</h1>
        </div>
        <button className="ghost">● PostgreSQL Backend Synchronized</button>
      </div>

      <section className="metrics">
        <Metric icon="♟" label="ACTIVE CREW" value={summary?.active_crew ?? 0} sub="On current mission" />
        <Metric icon="◉" label="SATELLITES" value={summary?.active_satellites ?? 0} sub="Network online" />
        <Metric icon="⚠" label="OPEN ALERTS" value={summary?.unresolved_alerts ?? 0} sub="Requires action" />
        <Metric icon="⌁" label="ORBITAL ALTITUDE" value={`${station?.altitude_km ?? 408} km`} sub={`${station?.velocity_kms ?? 7.66} km/s velocity`} />
      </section>

      <section className="layout two-one">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ASTRA HABITAT ONE</p>
              <h3>Station Resource & Life Support Health</h3>
            </div>
            <span className={statusClass(station?.status)}>{station?.status || 'NOMINAL'}</span>
          </div>
          <div className="resources">
            {resources.map((r) => <Resource key={r.name || Math.random()} resource={r} />)}
          </div>
          <div className="station-map">
            <span className="module" style={{ cursor: 'pointer' }} onClick={() => onSelectTab && onSelectTab('Station')}>SCIENCE<br/>LAB</span>
            <span className="hub" style={{ cursor: 'pointer' }} onClick={() => onSelectTab && onSelectTab('Station')}>COMMAND<br/>HUB</span>
            <span className="module" style={{ cursor: 'pointer' }} onClick={() => onSelectTab && onSelectTab('Station')}>HABITAT<br/>MODULE</span>
            <span className="module bottom" style={{ cursor: 'pointer' }} onClick={() => onSelectTab && onSelectTab('Station')}>DOCKING PORT</span>
          </div>
        </div>

        <div className="panel alerts">
          <div className="panel-header">
            <h3>Priority System Alerts</h3>
            <button className="link" onClick={() => onSelectTab && onSelectTab('Alerts')}>View all →</button>
          </div>
          {alerts.length ? alerts.map(a => (
            <div className="alert" key={a.alert_id || Math.random()}>
              <span className="alert-dot">!</span>
              <div>
                <b>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                <p>{a.message || 'Alert triggered'}</p>
                <small>{a.satellite_code || a.module_code || 'System'}</small>
              </div>
              <span className={statusClass(a.severity)}>{a.severity || 'INFO'}</span>
            </div>
          )) : <p className="empty">No unresolved alerts.</p>}
        </div>
      </section>

      <section className="panel fleet">
        <div className="panel-header">
          <div>
            <p className="eyebrow">SATELLITE NETWORK</p>
            <h3>Fleet Status & Orbital Modes</h3>
          </div>
          <button className="link" onClick={() => selectSatellite('SAT-01')}>Open ISS (SAT-01) →</button>
        </div>
        <SatelliteMiniGrid selectSatellite={selectSatellite} />
      </section>
    </main>
  );
}

function SatelliteMiniGrid({ selectSatellite }) {
  const [satellites, setSatellites] = useState([]);
  const defaultSats = [
    { code: 'SAT-01', name: 'International Space Station', purpose: 'Real ISS Orbit & Earth Observation', battery_pct: 91, status: 'NOMINAL', orbital_source: 'REAL' },
    { code: 'SAT-02', name: 'AstraRelay-1', purpose: 'Communication Relay', battery_pct: 73, status: 'NOMINAL', orbital_source: 'SIMULATED' },
    { code: 'SAT-03', name: 'DeepSpace-3', purpose: 'Deep Space Research', battery_pct: 18, status: 'CRITICAL', orbital_source: 'SIMULATED' },
    { code: 'SAT-04', name: 'EcoWatch-4', purpose: 'Climate Monitoring', battery_pct: 88, status: 'NOMINAL', orbital_source: 'SIMULATED' }
  ];

  useEffect(() => {
    get('/satellites')
      .then(res => setSatellites(Array.isArray(res) ? res : defaultSats))
      .catch(() => setSatellites(defaultSats));
  }, []);

  const satList = Array.isArray(satellites) && satellites.length ? satellites : defaultSats;

  return (
    <div className="sat-grid">
      {satList.map(s => (
        <button className="sat-card" key={s.code} onClick={() => selectSatellite(s.code)}>
          <span>◉ {s.code} {s.orbital_source === 'REAL' ? '· REAL ISS' : '· SIMULATED'}</span>
          <b>{s.name || s.purpose}</b>
          <p>Battery <strong>{s.battery_pct != null ? `${s.battery_pct}%` : 'N/A'}</strong></p>
          <em className={statusClass(s.status)}>{s.status || 'NOMINAL'}</em>
        </button>
      ))}
    </div>
  );
}

function SatelliteDetail({ code }) {
  const [data, setData] = useState(null);
  const [liveOrbit, setLiveOrbit] = useState(null);
  const [groundStations, setGroundStations] = useState([]);
  const [error, setError] = useState('');
  const [orbitLoading, setOrbitLoading] = useState(false);
  const [lastOrbitRefresh, setLastOrbitRefresh] = useState(new Date().toLocaleTimeString());

  const fetchSatelliteData = () => {
    get(`/satellites/${code}`)
      .then(res => {
        setData(res);
        if (res?.orbit) setLiveOrbit(res.orbit);
      })
      .catch(() => setError('Connect the PostgreSQL backend to show live telemetry & orbits.'));

    get('/ground-stations')
      .then(setGroundStations)
      .catch(() => {});
  };

  useEffect(() => {
    setData(null);
    setLiveOrbit(null);
    setError('');
    fetchSatelliteData();
  }, [code]);

  // Priority 1: Live Orbit Refresh every 20 seconds without reloading page or hiding data
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitLoading(true);
      get(`/satellites/${code}/orbit`)
        .then(res => {
          if (res) {
            setLiveOrbit(res);
            setLastOrbitRefresh(new Date().toLocaleTimeString());
          }
        })
        .catch(() => {})
        .finally(() => setOrbitLoading(false));
    }, 20000);
    return () => clearInterval(interval);
  }, [code]);

  const manualOrbitRefresh = () => {
    setOrbitLoading(true);
    get(`/satellites/${code}/orbit`)
      .then(res => {
        if (res) {
          setLiveOrbit(res);
          setLastOrbitRefresh(new Date().toLocaleTimeString());
        }
      })
      .catch(() => {})
      .finally(() => setOrbitLoading(false));
  };

  if (!data || !data.satellite) {
    return (
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow">SATELLITE MISSION CONTROL</p>
            <h1>{code} Telemetry & Orbit Tracking</h1>
          </div>
        </div>
        <div className="panel loading">{error || 'Loading orbital telemetry…'}</div>
      </main>
    );
  }

  const s = data.satellite;
  const telemetry = Array.isArray(data.telemetry) ? data.telemetry : [];
  const components = Array.isArray(data.components) ? data.components : [];
  const orbitHistory = Array.isArray(data.orbitHistory) ? data.orbitHistory : [];
  
  const orbitalSource = liveOrbit?.orbital_source || s.orbital_source || 'SIMULATED';
  const dataSource = liveOrbit?.data_source || (orbitalSource === 'REAL' ? 'CELESTRAK_LIVE' : 'SIMULATED');
  const reliable = liveOrbit?.reliable !== false;
  const tleAgeHours = liveOrbit?.tle_age_hours != null ? liveOrbit.tle_age_hours : '4.2';

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">{s.purpose || 'Satellite Telemetry & Orbit Tracking'}</p>
          <h1>{s.code} — {s.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="ghost" onClick={manualOrbitRefresh} disabled={orbitLoading}>
            {orbitLoading ? '↻ Refreshing orbit…' : `↻ Refresh Orbit (Last: ${lastOrbitRefresh})`}
          </button>
          <span className={`orbit-source-badge ${orbitalSource.toLowerCase()}`}>
            ● {orbitalSource === 'REAL' ? `REAL TRACKED ISS (NORAD ${s.norad_id || 25544})` : 'SIMULATED MISSION ORBIT'}
          </span>
        </div>
      </div>

      {/* Priority 3: Real vs Simulated Labeling & Freshness Banner */}
      <div className="orbit-status-banner" style={{
        padding: '14px 18px',
        borderRadius: '8px',
        marginBottom: '22px',
        fontSize: '12px',
        background: orbitalSource === 'REAL' ? (reliable ? '#0a3d2e' : '#43212a') : '#13273e',
        border: `1px solid ${orbitalSource === 'REAL' ? (reliable ? '#1db980' : '#ff8c9a') : '#294f7c'}`,
        color: orbitalSource === 'REAL' ? (reliable ? '#4df2b8' : '#ff9aa7') : '#86b3e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <strong style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
            {orbitalSource === 'REAL' 
              ? (reliable ? 'REAL ORBITAL DATA (SGP4 PROPAGATION)' : 'OFFLINE / STALE ORBIT DATA') 
              : 'SIMULATED DEMO SATELLITE'}
          </strong>
          <p style={{ margin: '4px 0 0', color: '#dcefff', fontSize: '11px' }}>
            {orbitalSource === 'REAL'
              ? `Data Source: ${dataSource === 'CELESTRAK_LIVE' ? 'CelesTrak Live' : dataSource} | TLE Age: ${tleAgeHours}h | SGP4 Math Verified`
              : 'Synthetic numerical orbit for DBMS demonstration.'}
          </p>
          <span className="disclaimer-tag">TELEMETRY: SIMULATED (Fictional onboard readings for DBMS demo)</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`status ${orbitalSource === 'REAL' ? 'nominal' : 'warning'}`}>
            ORBIT: {orbitalSource}
          </span>
          <span className={`status ${reliable ? 'nominal' : 'critical'}`}>
            SOURCE: {dataSource.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Real-time Orbit Position Metrics */}
      <div style={{ marginBottom: '10px' }}>
        <p className="eyebrow">LIVE ORBITAL POSITION ({orbitalSource} SGP4 PROPAGATOR)</p>
      </div>
      <section className="metrics">
        <Metric icon="◒" label="LATITUDE" value={`${liveOrbit?.latitude ?? s.current_latitude ?? 0}° N`} sub="Current Latitude" />
        <Metric icon="🌐" label="LONGITUDE" value={`${liveOrbit?.longitude ?? s.current_longitude ?? 0}° E`} sub="Current Longitude" />
        <Metric icon="⌁" label="ALTITUDE" value={`${liveOrbit?.altitude_km ?? s.current_altitude_km ?? 408} km`} sub="Geodetic Altitude" />
        <Metric icon="≫" label="VELOCITY" value={`${liveOrbit?.velocity_kms ?? s.current_velocity_kms ?? 7.66} km/s`} sub="Orbital Speed" />
      </section>

      {/* Ground Track Map */}
      <section className="panel" style={{ padding: '20px', marginBottom: '16px' }}>
        <OrbitMap satellite={s} liveOrbit={liveOrbit} orbitHistory={orbitHistory} groundStations={groundStations} />
      </section>

      {/* Priority 5: Satellite Components & Simulated Health */}
      <section className="layout two-one" style={{ marginBottom: '16px' }}>
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div>
              <p className="eyebrow">HARDWARE MONITORING</p>
              <h3>Subsystem Component Status</h3>
            </div>
            <span className="disclaimer-tag">POSTGRESQL TABLE: satellite_components</span>
          </div>
          {components.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {components.map(c => (
                <div key={c.name} style={{ background: '#091728', border: '1px solid #1c3858', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{c.name}</span>
                  <span className={statusClass(c.status)}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">All core components nominal.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <div>
              <p className="eyebrow">SIMULATED TELEMETRY</p>
              <h3>Onboard Environment</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Battery Charge</span>
              <b>{s.battery_pct != null ? `${s.battery_pct}%` : '85%'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thermal Temp</span>
              <b>{s.temperature_c != null ? `${s.temperature_c}°C` : '24°C'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Signal Strength</span>
              <b>{s.signal_pct != null ? `${s.signal_pct}%` : '92%'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Operational Roster</span>
              <span className={statusClass(s.status)}>{s.status || 'NOMINAL'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Battery History Chart */}
      <section className="panel chart">
        <div className="panel-header">
          <div>
            <p className="eyebrow">TELEMETRY TRENDS</p>
            <h3>Battery & Power Output History</h3>
          </div>
          <span>Last {telemetry.length} readings</span>
        </div>
        {telemetry.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="battery" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#33d6ff" stopOpacity=".5"/>
                  <stop offset="1" stopColor="#33d6ff" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#203351" strokeDasharray="4 4"/>
              <XAxis dataKey="recorded_at" tickFormatter={(v) => v ? new Date(v).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}/>
              <YAxis domain={[0, 100]}/>
              <Tooltip/>
              <Area type="monotone" dataKey="battery_pct" stroke="#33d6ff" fill="url(#battery)" strokeWidth={3}/>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty" style={{ padding: '40px 0' }}>No telemetry history recorded yet.</div>
        )}
      </section>
    </main>
  );
}

// Priority 6: Command Center Visual Lifecycle
function CommandCenter() {
  const [satelliteCode, setSatelliteCode] = useState('SAT-03');
  const [commandType, setCommandType] = useState('SAFE_MODE');
  const [commandsList, setCommandsList] = useState([]);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState(false);

  const fetchCommands = () => {
    get('/satellites/SAT-03/telemetry') // fallback query if needed
      .catch(() => {});
  };

  async function createCommand() {
    try {
      setError('');
      setResult(null);
      const command = await send('/commands', { satelliteCode, commandType });
      setResult(command);
      fetchCommandDetails(command.command_id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function fetchCommandDetails(cmdId) {
    try {
      const res = await get(`/commands/${cmdId}`);
      if (res?.data) setSelectedCommand(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function advanceStatus(cmdId, nextStatus) {
    setAdvancing(true);
    try {
      await send(`/commands/${cmdId}/advance`, { status: nextStatus, note: `Operator manually advanced status to ${nextStatus}` });
      await fetchCommandDetails(cmdId);
    } catch (e) {
      setError(`Advance failed: ${e.message}`);
    } finally {
      setAdvancing(false);
    }
  }

  const currentStatus = selectedCommand?.command?.status || result?.status || 'CREATED';
  const logs = selectedCommand?.logs || [];
  const statusOrder = ['CREATED', 'TRANSMITTED', 'RECEIVED', 'EXECUTED'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">UPLINK OPERATIONS & DBMS TRANSACTIONS</p>
          <h1>Command Center & Lifecycle Tracker</h1>
        </div>
      </div>

      <section className="panel command">
        <div>
          <label>Target Satellite</label>
          <select value={satelliteCode} onChange={e => setSatelliteCode(e.target.value)}>
            <option value="SAT-01">SAT-01 (ISS)</option>
            <option value="SAT-02">SAT-02 (AstraRelay)</option>
            <option value="SAT-03">SAT-03 (DeepSpace)</option>
            <option value="SAT-04">SAT-04 (EcoWatch)</option>
          </select>
        </div>
        <div>
          <label>Command Type</label>
          <select value={commandType} onChange={e => setCommandType(e.target.value)}>
            {['SAFE_MODE','RESTART_PAYLOAD','ORIENTATION_CHANGE','REQUEST_TELEMETRY'].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <button className="primary" onClick={createCommand}>Transmit Command →</button>

        {result && <div className="success">Command created (ID: {result.command_id?.slice(0, 8)}). Status: <b>{result.status}</b></div>}
        {error && <div className="error">{error}</div>}
      </section>

      {/* Visual Stepper Lifecycle */}
      <section className="panel" style={{ marginTop: '16px' }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">COMMAND EXECUTION LIFECYCLE (POSTGRESQL TRANSACTION LOGS)</p>
            <h3>Visual Lifecycle Status: <span style={{ color: '#39d5ff' }}>{currentStatus}</span></h3>
          </div>
          {selectedCommand?.command?.command_id && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentStatus === 'CREATED' && (
                <button className="ghost" disabled={advancing} onClick={() => advanceStatus(selectedCommand.command.command_id, 'TRANSMITTED')}>
                  ➡ Advance to TRANSMITTED
                </button>
              )}
              {currentStatus === 'TRANSMITTED' && (
                <button className="ghost" disabled={advancing} onClick={() => advanceStatus(selectedCommand.command.command_id, 'RECEIVED')}>
                  ➡ Advance to RECEIVED
                </button>
              )}
              {currentStatus === 'RECEIVED' && (
                <button className="primary" disabled={advancing} onClick={() => advanceStatus(selectedCommand.command.command_id, 'EXECUTED')}>
                  ✔ Execute Command
                </button>
              )}
            </div>
          )}
        </div>

        <div className="stepper-bar">
          <div className="stepper-line" />
          {statusOrder.map((st, idx) => {
            const isCompleted = currentIndex >= idx;
            const isActive = currentIndex === idx;
            return (
              <div className={`stepper-step ${isActive ? 'active' : isCompleted ? 'completed' : ''}`} key={st}>
                <div className="stepper-circle">{isCompleted ? '✓' : idx + 1}</div>
                <b style={{ fontSize: '12px' }}>{st}</b>
                <small style={{ color: '#7a96b0', fontSize: '9px' }}>Step {idx + 1}</small>
              </div>
            );
          })}
        </div>

        {/* Command Log Trail */}
        {logs.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #1e3858', paddingTop: '15px' }}>
            <p className="eyebrow">AUDIT LOG TRAIL (command_logs table)</p>
            <div style={{ display: 'grid', gap: '8px' }}>
              {logs.map(log => (
                <div key={log.logged_at} style={{ background: '#091728', padding: '8px 12px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>Status: <b>{log.status}</b> — {log.note || 'Status updated'}</span>
                  <span style={{ color: '#708ea8', fontFamily: 'DM Mono' }}>{new Date(log.logged_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function DataPage({ title, eyebrow, path, children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    get(path).then(setData).catch(e => setError(e.message));
  }, [path]);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      {error ? (
        <section className="panel loading">Start the database/backend to show live records.</section>
      ) : !data ? (
        <section className="panel loading">Loading operational data…</section>
      ) : (
        children(data, setData)
      )}
    </main>
  );
}

// Priority 9: Station Visualization with Clickable Module Layout & Inspector Drawer
function Station() {
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <DataPage title="Station Operations & Module Layout" eyebrow="ASTRA HABITAT ONE" path="/station">
      {data => {
        const station = data?.station || {};
        const modules = Array.isArray(data?.modules) ? data.modules : [];
        const resources = Array.isArray(data?.resources) ? data.resources : [];
        const avgResourcePct = resources.length
          ? (resources.reduce((a, r) => a + Number(r.percentage || 0), 0) / resources.length).toFixed(1)
          : '0';

        return (
          <>
            <section className="metrics">
              <Metric icon="⌁" label="ORBITAL ALTITUDE" value={`${station.altitude_km ?? 408} km`} />
              <Metric icon="≫" label="VELOCITY" value={`${station.velocity_kms ?? 7.66} km/s`} />
              <Metric icon="▦" label="STATION MODULES" value={modules.length} />
              <Metric icon="◌" label="RESOURCE HEALTH" value={`${avgResourcePct}%`} />
            </section>

            <section className="module-grid">
              {modules.map(m => (
                <article
                  className="panel module-card"
                  key={m.module_id || Math.random()}
                  style={{ cursor: 'pointer', transition: 'border-color 0.2s ease' }}
                  onClick={() => setSelectedModule(m)}
                >
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{m.code} · {m.module_type}</p>
                      <h3>{m.name}</h3>
                    </div>
                    <span className={statusClass(m.status)}>{m.status}</span>
                  </div>
                  <div className="readings">
                    <span>Temp <b>{m.temperature_c}°C</b></span>
                    <span>Pressure <b>{m.pressure_kpa} kPa</b></span>
                    <span>O₂ <b>{m.oxygen_pct}%</b></span>
                    <span>CO₂ <b>{m.co2_pct}%</b></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small>Maintenance: {m.last_maintenance_on || 'Not recorded'}</small>
                    <span className="link">Inspect →</span>
                  </div>
                </article>
              ))}
            </section>

            {/* Clickable Module Inspector Modal */}
            {selectedModule && (
              <div className="modal-overlay" onClick={() => setSelectedModule(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="panel-header" style={{ marginBottom: '16px' }}>
                    <div>
                      <p className="eyebrow">{selectedModule.code} MODULE INSPECTOR</p>
                      <h2>{selectedModule.name}</h2>
                    </div>
                    <button className="ghost" onClick={() => setSelectedModule(null)}>✕ Close</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '20px 0' }}>
                    <div style={{ background: '#09182a', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#7795b3', fontFamily: 'DM Mono' }}>TEMPERATURE</span>
                      <h3 style={{ marginTop: '4px' }}>{selectedModule.temperature_c}°C</h3>
                    </div>
                    <div style={{ background: '#09182a', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#7795b3', fontFamily: 'DM Mono' }}>ATMOSPHERIC PRESSURE</span>
                      <h3 style={{ marginTop: '4px' }}>{selectedModule.pressure_kpa} kPa</h3>
                    </div>
                    <div style={{ background: '#09182a', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#7795b3', fontFamily: 'DM Mono' }}>OXYGEN LEVEL</span>
                      <h3 style={{ marginTop: '4px', color: selectedModule.oxygen_pct < 19 ? '#ff768b' : '#5df0a4' }}>
                        {selectedModule.oxygen_pct}%
                      </h3>
                    </div>
                    <div style={{ background: '#09182a', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#7795b3', fontFamily: 'DM Mono' }}>CO2 CONCENTRATION</span>
                      <h3 style={{ marginTop: '4px' }}>{selectedModule.co2_pct}%</h3>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#88a3bc', marginBottom: '20px' }}>
                    <p style={{ margin: '4px 0' }}>Module Type: <b>{selectedModule.module_type}</b></p>
                    <p style={{ margin: '4px 0' }}>Power Consumption: <b>{selectedModule.power_kw} kW</b></p>
                    <p style={{ margin: '4px 0' }}>Last Maintenance: <b>{selectedModule.last_maintenance_on || 'Nominal'}</b></p>
                  </div>

                  <button className="primary" style={{ width: '100%' }} onClick={() => setSelectedModule(null)}>
                    Close Inspector
                  </button>
                </div>
              </div>
            )}
          </>
        );
      }}
    </DataPage>
  );
}

function Crew() {
  return (
    <DataPage title="Crew & Task Management" eyebrow="HORIZON MISSION · OR-26" path="/crew">
      {data => {
        const list = Array.isArray(data) ? data : [];
        return (
          <section className="crew-grid">
            {list.map(c => (
              <article className="panel crew-card" key={c.crew_id || Math.random()}>
                <span className="avatar">
                  {(c.full_name || 'C M').split(' ').map(x => x[0]).join('')}
                </span>
                <div>
                  <p className="eyebrow">{c.role || 'Crew Member'}</p>
                  <h3>{c.full_name}</h3>
                  <p>{c.nationality}</p>
                </div>
                <span className={statusClass(c.status)}>ACTIVE</span>
                <div className="crew-stats">
                  <span><b>{c.open_tasks ?? 0}</b> Open tasks</span>
                  <span><b>{c.completed_tasks ?? 0}</b> Completed</span>
                </div>
              </article>
            ))}
          </section>
        );
      }}
    </DataPage>
  );
}

function Experiments() {
  return (
    <DataPage title="Experiment Control" eyebrow="SCIENCE & RESEARCH" path="/experiments">
      {data => {
        const list = Array.isArray(data) ? data : [];
        return (
          <section className="experiment-grid">
            {list.map(e => (
              <article className="panel experiment" key={e.experiment_id || Math.random()}>
                <p className="eyebrow">{e.code} · {e.module_name}</p>
                <h3>{e.title}</h3>
                <p>Lead researcher: <b>{e.lead_researcher}</b></p>
                <div className="bar"><i style={{ width: `${e.progress_pct || 0}%` }} /></div>
                <div className="panel-header">
                  <span>{e.progress_pct}% complete</span>
                  <span className={statusClass(e.status)}>{e.status}</span>
                </div>
                <small>Started {e.started_on} · {e.log_count ?? 0} logs</small>
              </article>
            ))}
          </section>
        );
      }}
    </DataPage>
  );
}

function GroundStations() {
  return (
    <DataPage title="Ground Station Network" eyebrow="COMMUNICATION OPERATIONS" path="/ground-stations">
      {data => {
        const list = Array.isArray(data) ? data : [];
        return (
          <section className="ground-grid">
            {list.map(g => (
              <article className="panel ground" key={g.ground_station_id || Math.random()}>
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{g.code} · {g.country}</p>
                    <h3>{g.city}</h3>
                  </div>
                  <span className={statusClass(g.status)}>ONLINE</span>
                </div>
                <div className="signal">◒ <b>{g.signal_pct ?? '—'}%</b><span> signal quality</span></div>
                <p>Connected satellite <strong>{g.connected_satellite || 'No active session'}</strong></p>
                <small>{g.latitude}, {g.longitude}</small>
              </article>
            ))}
          </section>
        );
      }}
    </DataPage>
  );
}

// Priority 8: Alert Resolution using stored procedure resolve_alert
function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const load = () => {
    get('/alerts?status=ALL')
      .then(res => setAlerts(Array.isArray(res) ? res : []))
      .catch(e => setError(e.message));
  };

  useEffect(load, []);

  const resolveAlert = async (id) => {
    setResolvingId(id);
    try {
      await patch(`/alerts/${id}/resolve`);
      load();
    } catch (e) {
      alert(`Alert resolution failed: ${e.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const list = Array.isArray(alerts) ? alerts : [];

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">CENTRALIZED MONITORING & STORED PROCEDURES</p>
          <h1>Alert Center</h1>
        </div>
      </div>
      {error ? (
        <section className="panel loading">Start the database/backend to view alerts.</section>
      ) : !alerts ? (
        <section className="panel loading">Loading alerts…</section>
      ) : (
        <section className="panel alert-table">
          {list.length > 0 ? list.map(a => (
            <div className="alert-row" key={a.alert_id || Math.random()}>
              <span className={statusClass(a.severity)}>{a.severity || 'INFO'}</span>
              <div>
                <b>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                <p>{a.message}</p>
                <small>{a.satellite_code || a.module_code} · {a.created_at ? new Date(a.created_at).toLocaleString() : ''}</small>
              </div>
              <span className={statusClass(a.status)}>{a.status}</span>
              {a.status !== 'RESOLVED' ? (
                <button
                  className="primary"
                  style={{ padding: '6px 14px', fontSize: '11px' }}
                  disabled={resolvingId === a.alert_id}
                  onClick={() => resolveAlert(a.alert_id)}
                >
                  {resolvingId === a.alert_id ? 'Resolving procedure…' : '✔ Resolve Alert'}
                </button>
              ) : (
                <small style={{ color: '#5df0a4' }}>RESOLVED IN DB</small>
              )}
            </div>
          )) : (
            <div className="empty" style={{ padding: '40px' }}>No alerts recorded in database.</div>
          )}
        </section>
      )}
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState('Dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboardData = () => {
    get('/dashboard')
      .then(data => setDashboard(data || fallback))
      .catch(() => setDashboard(fallback));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openSatellite = (code) => setTab(`Satellite:${code}`);

  const handleEmergencyTriggered = (msg) => {
    setToastMessage(`⚡ ${msg}`);
    setTimeout(() => setToastMessage(''), 5000);
    fetchDashboardData();
  };

  let content = tab === 'Dashboard' ? <Dashboard dashboard={dashboard} selectSatellite={openSatellite} onSelectTab={setTab} />
    : tab.startsWith('Satellite:') ? <SatelliteDetail code={tab.split(':')[1]} />
    : tab === 'Satellites' ? <SatelliteDetail code="SAT-01" />
    : tab === 'Station' ? <Station />
    : tab === 'Crew' ? <Crew />
    : tab === 'Experiments' ? <Experiments />
    : tab === 'Ground Stations' ? <GroundStations />
    : tab === 'Alerts' ? <Alerts />
    : tab === 'Command Center' ? <CommandCenter />
    : <SatelliteDetail code="SAT-01" />;

  return (
    <ErrorBoundary>
      <div className="app">
        <aside>
          <div className="brand">
            <span>◈</span>
            <div>ORBIT<span>OPS</span><small>MISSION CONTROL</small></div>
          </div>
          <nav>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
                {t === 'Dashboard' ? '◫' : t === 'Satellites' ? '◉' : t === 'Alerts' ? '⚠' : '◇'} {t}
              </button>
            ))}
          </nav>
          <div className="operator">
            <span>MR</span>
            <div><b>Maya Raman</b><small>Mission Controller</small></div>
          </div>
        </aside>

        <div className="content">
          <header>
            <span>● LIVE SYSTEM</span>
            <p>OR-26 · Horizon Mission Control</p>
            <EmergencyPanel onTrigger={handleEmergencyTriggered} />
          </header>

          {toastMessage && (
            <div style={{
              background: '#391823',
              color: '#ff9aa7',
              borderBottom: '1px solid #852233',
              padding: '10px 38px',
              fontSize: '12px',
              fontFamily: 'DM Mono',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{toastMessage}</span>
              <button className="ghost" style={{ color: '#ff9aa7' }} onClick={() => setToastMessage('')}>✕</button>
            </div>
          )}

          {content}
        </div>
      </div>
    </ErrorBoundary>
  );
}
