import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { get, patch, send } from './api.js';
import OrbitMap from './OrbitMap.jsx';

const tabs = ['Dashboard', 'Station', 'Crew', 'Experiments', 'Satellites', 'Ground Stations', 'Command Center', 'Alerts'];
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

function Dashboard({ dashboard, selectSatellite }) {
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
        <button className="ghost">● Systems nominal</button>
      </div>

      <section className="metrics">
        <Metric icon="♟" label="ACTIVE CREW" value={summary?.active_crew ?? 0} sub="On current mission" />
        <Metric icon="◉" label="SATELLITES" value={summary?.active_satellites ?? 0} sub="Network online" />
        <Metric icon="⚠" label="OPEN ALERTS" value={summary?.unresolved_alerts ?? 0} sub="Needs attention" />
        <Metric icon="⌁" label="ORBITAL ALTITUDE" value={`${station?.altitude_km ?? 408} km`} sub={`${station?.velocity_kms ?? 7.66} km/s velocity`} />
      </section>

      <section className="layout two-one">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ASTRA HABITAT ONE</p>
              <h3>Station resource health</h3>
            </div>
            <span className={statusClass(station?.status)}>{station?.status || 'NOMINAL'}</span>
          </div>
          <div className="resources">
            {resources.map((r) => <Resource key={r.name || Math.random()} resource={r} />)}
          </div>
          <div className="station-map">
            <span className="module">SCIENCE<br/>LAB</span>
            <span className="hub">COMMAND<br/>HUB</span>
            <span className="module">HABITAT<br/>MODULE</span>
            <span className="module bottom">DOCKING PORT</span>
          </div>
        </div>

        <div className="panel alerts">
          <div className="panel-header">
            <h3>Priority alerts</h3>
            <button className="link">View all</button>
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
            <h3>Fleet status</h3>
          </div>
          <button className="link" onClick={() => selectSatellite('SAT-01')}>Open SAT-01 (ISS) →</button>
        </div>
        <SatelliteMiniGrid selectSatellite={selectSatellite} />
      </section>
    </main>
  );
}

function SatelliteMiniGrid({ selectSatellite }) {
  const [satellites, setSatellites] = useState([]);
  const defaultSats = [
    { code: 'SAT-01', purpose: 'Real ISS Orbit & Earth Observation', battery_pct: 91, status: 'NOMINAL', orbital_source: 'REAL' },
    { code: 'SAT-02', purpose: 'Communication Relay', battery_pct: 73, status: 'NOMINAL', orbital_source: 'SIMULATED' },
    { code: 'SAT-03', purpose: 'Deep Space Research', battery_pct: 18, status: 'CRITICAL', orbital_source: 'SIMULATED' },
    { code: 'SAT-04', purpose: 'Climate Monitoring', battery_pct: 88, status: 'NOMINAL', orbital_source: 'SIMULATED' }
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
          <span>◉ {s.code} {s.orbital_source === 'REAL' ? '· REAL ISS' : ''}</span>
          <b>{s.purpose}</b>
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

  // Fetch Satellite & Ground Station details
  useEffect(() => {
    setData(null);
    setLiveOrbit(null);
    setError('');

    get(`/satellites/${code}`)
      .then(res => {
        setData(res);
        if (res?.orbit) setLiveOrbit(res.orbit);
      })
      .catch(() => setError('Connect the PostgreSQL backend to show live telemetry & orbits.'));

    get('/ground-stations')
      .then(setGroundStations)
      .catch(() => {});
  }, [code]);

  // Periodic Orbit Refresh (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      get(`/satellites/${code}/orbit`)
        .then(setLiveOrbit)
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [code]);

  if (!data || !data.satellite) {
    return (
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow">SATELLITE MISSION CONTROL</p>
            <h1>{code} telemetry & live tracking</h1>
          </div>
        </div>
        <div className="panel loading">{error || 'Loading orbital telemetry…'}</div>
      </main>
    );
  }

  const s = data.satellite;
  const telemetry = Array.isArray(data.telemetry) ? data.telemetry : [];
  const orbitHistory = Array.isArray(data.orbitHistory) ? data.orbitHistory : [];
  
  const orbitalSource = liveOrbit?.orbital_source || s.orbital_source || 'SIMULATED';
  const dataSource = liveOrbit?.data_source || 'CACHED_TLE';
  const reliable = liveOrbit?.reliable !== false;
  const tleAgeHours = liveOrbit?.tle_age_hours != null ? liveOrbit.tle_age_hours : '4';

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">{s.purpose || 'Satellite Telemetry & Orbit Tracking'}</p>
          <h1>{s.code} — {s.name}</h1>
        </div>
        <span className={`orbit-source-badge ${orbitalSource.toLowerCase()}`}>
          ● {orbitalSource === 'REAL' ? `REAL TRACKED ISS (NORAD ${s.norad_id || 25544})` : 'SIMULATED ORBIT'}
        </span>
      </div>

      {/* Freshness & Reliability Status Banner */}
      {orbitalSource === 'REAL' && (
        <div className="orbit-status-banner" style={{
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '22px',
          fontSize: '12px',
          background: reliable ? '#0a3d2e' : '#43212a',
          border: `1px solid ${reliable ? '#1db980' : '#ff8c9a'}`,
          color: reliable ? '#4df2b8' : '#ff9aa7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
              {reliable ? 'REAL ORBITAL DATA' : 'OFFLINE / STALE ORBIT DATA'}
            </strong>
            <p style={{ margin: '4px 0 0', color: '#dcefff', fontSize: '11px' }}>
              {reliable
                ? `Source: ${dataSource === 'CELESTRAK_LIVE' ? 'CelesTrak' : 'Cached TLE'} (TLE age: ${tleAgeHours}h)`
                : 'Cached / Stale TLE (Live position unavailable or unverified)'}
            </p>
          </div>
          <span className={`status ${reliable ? 'nominal' : 'critical'}`}>
            {reliable ? 'LIVE ORBIT' : 'UNRELIABLE / STALE'}
          </span>
        </div>
      )}

      {/* Real Orbital Position Cards */}
      <div style={{ marginBottom: '10px' }}>
        <p className="eyebrow">REAL-TIME ORBIT POSITION ({orbitalSource} SGP4 CALCULATED)</p>
      </div>
      <section className="metrics">
        <Metric icon="◒" label="LATITUDE" value={`${liveOrbit?.latitude ?? s.current_latitude ?? 0}° N`} sub="SGP4 Orbital Propagator" />
        <Metric icon="🌐" label="LONGITUDE" value={`${liveOrbit?.longitude ?? s.current_longitude ?? 0}° E`} sub="Ground Track Coordinates" />
        <Metric icon="⌁" label="ALTITUDE" value={`${liveOrbit?.altitude_km ?? s.current_altitude_km ?? 408} km`} sub="Geodetic Height" />
        <Metric icon="≫" label="ORBITAL VELOCITY" value={`${liveOrbit?.velocity_kms ?? s.current_velocity_kms ?? 7.66} km/s`} sub="Spacecraft Speed" />
      </section>

      {/* Interactive World Map & Ground Track */}
      <section className="panel" style={{ padding: '20px', marginBottom: '16px' }}>
        <OrbitMap satellite={s} liveOrbit={liveOrbit} orbitHistory={orbitHistory} groundStations={groundStations} />
      </section>

      {/* Simulated Telemetry Cards */}
      <div style={{ marginBottom: '10px' }}>
        <p className="eyebrow">SIMULATED SPACECRAFT TELEMETRY & HEALTH</p>
      </div>
      <section className="metrics">
        <Metric icon="▣" label="BATTERY LEVEL" value={s.battery_pct != null ? `${s.battery_pct}%` : 'N/A'} sub="Simulated Battery" />
        <Metric icon="☀" label="SIGNAL QUALITY" value={s.signal_pct != null ? `${s.signal_pct}%` : 'N/A'} sub="Simulated Signal" />
        <Metric icon="♨" label="TEMPERATURE" value={s.temperature_c != null ? `${s.temperature_c}°C` : 'N/A'} sub="Thermal Health" />
        <Metric icon="◈" label="STATUS" value={s.status || 'NOMINAL'} sub="Operational Roster" />
      </section>

      {/* Battery History Chart */}
      <section className="panel chart">
        <div className="panel-header">
          <h3>Simulated Battery telemetry history</h3>
          <span>Last {telemetry.length} readings</span>
        </div>
        {telemetry.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="battery" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#33d6ff" stopOpacity=".5"/>
                  <stop offset="1" stopColor="#33d6ff" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#203351" strokeDasharray="4 4"/>
              <XAxis dataKey="recorded_at" tickFormatter={(v) => v ? new Date(v).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}/>
              <YAxis/>
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

function CommandCenter() {
  const [satelliteCode, setSatelliteCode] = useState('SAT-03');
  const [commandType, setCommandType] = useState('SAFE_MODE');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function createCommand() {
    try {
      setError('');
      const command = await send('/commands', { satelliteCode, commandType });
      setResult(command);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">UPLINK OPERATIONS</p>
          <h1>Command Center</h1>
        </div>
      </div>
      <section className="panel command">
        <div>
          <label>Target satellite</label>
          <select value={satelliteCode} onChange={e => setSatelliteCode(e.target.value)}>
            <option>SAT-01</option>
            <option>SAT-02</option>
            <option>SAT-03</option>
            <option>SAT-04</option>
          </select>
        </div>
        <div>
          <label>Command</label>
          <select value={commandType} onChange={e => setCommandType(e.target.value)}>
            {['SAFE_MODE','RESTART_PAYLOAD','ORIENTATION_CHANGE','REQUEST_TELEMETRY'].map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <button className="primary" onClick={createCommand}>Transmit command →</button>
        {result && <div className="success">Command {result.command_id?.slice(0, 8)} created. Status: CREATED</div>}
        {error && <div className="error">{error}</div>}
      </section>
      <section className="panel">
        <h3>Command lifecycle</h3>
        <div className="timeline">
          <span>1<br/><small>Created</small></span>
          <i/>
          <span>2<br/><small>Transmitted</small></span>
          <i/>
          <span>3<br/><small>Received</small></span>
          <i/>
          <span>4<br/><small>Executed</small></span>
        </div>
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

function Station() {
  return (
    <DataPage title="Station Operations" eyebrow="ASTRA HABITAT ONE" path="/station">
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
                <article className="panel module-card" key={m.module_id || Math.random()}>
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
                  <small>Maintenance: {m.last_maintenance_on || 'Not recorded'}</small>
                </article>
              ))}
            </section>
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

function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    get('/alerts?status=ALL')
      .then(res => setAlerts(Array.isArray(res) ? res : []))
      .catch(e => setError(e.message));
  };

  useEffect(load, []);

  const resolve = async (id) => {
    try {
      await patch(`/alerts/${id}/resolve`);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const list = Array.isArray(alerts) ? alerts : [];

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">CENTRALIZED MONITORING</p>
          <h1>Alert Center</h1>
        </div>
      </div>
      {error ? (
        <section className="panel loading">Start the database/backend to view alerts.</section>
      ) : !alerts ? (
        <section className="panel loading">Loading alerts…</section>
      ) : (
        <section className="panel alert-table">
          {list.map(a => (
            <div className="alert-row" key={a.alert_id || Math.random()}>
              <span className={statusClass(a.severity)}>{a.severity || 'INFO'}</span>
              <div>
                <b>{(a.alert_type || 'ALERT').replace('_', ' ')}</b>
                <p>{a.message}</p>
                <small>{a.satellite_code || a.module_code} · {a.created_at ? new Date(a.created_at).toLocaleString() : ''}</small>
              </div>
              <span className={statusClass(a.status)}>{a.status}</span>
              {a.status !== 'RESOLVED' && (
                <button className="ghost" onClick={() => resolve(a.alert_id)}>Resolve</button>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState('Dashboard');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    get('/dashboard')
      .then(data => setDashboard(data || fallback))
      .catch(() => setDashboard(fallback));
  }, []);

  const openSatellite = (code) => setTab(`Satellite:${code}`);

  let content = tab === 'Dashboard' ? <Dashboard dashboard={dashboard} selectSatellite={openSatellite} />
    : tab.startsWith('Satellite:') ? <SatelliteDetail code={tab.split(':')[1]} />
    : tab === 'Station' ? <Station />
    : tab === 'Crew' ? <Crew />
    : tab === 'Experiments' ? <Experiments />
    : tab === 'Ground Stations' ? <GroundStations />
    : tab === 'Alerts' ? <Alerts />
    : tab === 'Command Center' ? <CommandCenter />
    : <SatelliteDetail code="SAT-01" />;

  return (
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
          <span>● LIVE SIMULATION</span>
          <p>OR-26 · Horizon Mission</p>
          <button onClick={() => get('/simulator/tick').then(() => get('/dashboard').then(setDashboard)).catch(() => {})}>
            ↻ Simulate tick
          </button>
        </header>
        {content}
      </div>
    </div>
  );
}
