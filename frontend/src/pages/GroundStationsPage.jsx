import React, { useState, useEffect, useRef } from 'react';
import { Radio, Signal, MapPin, Globe, Compass, Activity } from 'lucide-react';
import L from 'leaflet';
import { api } from '../api/client.js';
import { MetricCard } from '../components/shared/MetricCard.jsx';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';

function GroundStationWorldMap({ stations = [], communications = [] }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false
    });

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const tileUrl = isLight
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }).addTo(map);

    leafletMap.current = map;

    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newUrl = currentTheme === 'light'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      if (tileLayerRef.current) tileLayerRef.current.setUrl(newUrl);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observer.disconnect();
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Markers & Links
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    const stationCoords = {
      'BLR-01': [12.971, 77.594, 'Bengaluru, India'],
      'MAD-01': [40.416, -3.703, 'Madrid, Spain'],
      'MCM-01': [-77.841, 166.686, 'McMurdo, Antarctica']
    };

    const satCoords = {
      'SAT-01': [49.2, -136.6, 'ISS / Aurelia'],
      'SAT-02': [15.4, 65.2, 'AstraRelay-1'],
      'SAT-03': [-28.1, -48.5, 'DeepSpace-3'],
      'SAT-04': [62.8, 120.4, 'EcoWatch-4']
    };

    const stationIcon = L.divIcon({
      className: 'custom-gs-icon',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: ${isLight ? '#ffffff' : '#000000'};
        border: 2px solid ${isLight ? '#000000' : '#ffffff'};
        border-radius: 4px;
        display: grid;
        place-items: center;
        color: ${isLight ? '#000000' : '#ffffff'};
        font-size: 11px;
        font-weight: bold;
      ">📡</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const satIcon = L.divIcon({
      className: 'custom-sat-downlink-icon',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: ${isLight ? '#000000' : '#ffffff'};
        border: 2px solid ${isLight ? '#000000' : '#ffffff'};
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: ${isLight ? '#ffffff' : '#000000'};
        font-size: 11px;
        font-weight: bold;
      ">🛰</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    stations.forEach((st) => {
      const coords = stationCoords[st.code] || [Number(st.latitude) || 0, Number(st.longitude) || 0, st.city];
      L.marker([coords[0], coords[1]], { icon: stationIcon })
        .bindPopup(`
          <div style="font-family: monospace; color: #000000; font-size: 11px;">
            <b style="font-size: 13px; color: #000000;">📡 GROUND STATION ${st.code}</b><br/>
            <span>Location: <strong>${st.city}, ${st.country}</strong></span><br/>
            <span>Signal Strength: <strong>${st.signal_pct ?? 94}%</strong></span>
          </div>
        `)
        .addTo(map);
    });

    const links = [
      { sat: 'SAT-01', station: 'MAD-01', color: isLight ? '#000000' : '#ffffff' },
      { sat: 'SAT-02', station: 'BLR-01', color: isLight ? '#555555' : '#999999' }
    ];

    links.forEach(link => {
      const st = stationCoords[link.station];
      const sat = satCoords[link.sat];
      if (st && sat) {
        L.marker([sat[0], sat[1]], { icon: satIcon })
          .bindPopup(`<div style="font-family: monospace; color: #000000; font-size: 11px;"><b>🛰 ${sat[2]}</b></div>`)
          .addTo(map);

        L.polyline([[st[0], st[1]], [sat[0], sat[1]]], {
          color: link.color,
          weight: 2,
          dashArray: '6, 6',
          opacity: 0.9
        }).addTo(map);
      }
    });

  }, [stations, communications]);

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ background: 'var(--surface-muted)', padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>GLOBAL DOWNLINK TRAJECTORY MAP</span>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Active Ground Station Downlink Links</h4>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '11px', fontFamily: 'monospace' }}>
          <span style={{ color: 'var(--text-primary)' }}>● SAT-01 ↔ MAD-01 (ACTIVE)</span>
          <span style={{ color: 'var(--text-secondary)' }}>● SAT-02 ↔ BLR-01 (ACTIVE)</span>
        </div>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '360px', background: 'var(--surface)' }} />
    </div>
  );
}

export function GroundStationsPage() {
  const [stations, setStations] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroundStationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stRes, commsRes] = await Promise.all([
        api.getGroundStations(),
        api.getCommunications().catch(() => [])
      ]);
      setStations(stRes || []);
      setCommunications(commsRes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroundStationData();
  }, []);

  if (loading) return <LoadingSkeleton height="160px" count={4} />;
  if (error) return <ErrorState title="GROUND NETWORK DATA UNAVAILABLE" message={error} onRetry={fetchGroundStationData} />;

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            <span>GLOBAL GROUND STATION NETWORK</span> · <span>DEEP SPACE TELEMETRY LINK</span>
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Ground Communication Terminals
          </h1>
        </div>
        <StatusBadge status="NOMINAL" label="NETWORK ONLINE" />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <MetricCard icon={Radio} label="Ground Stations" value={stations.length} sub="Worldwide Network" />
        <MetricCard icon={Signal} label="Avg Signal Strength" value="92.4%" sub="Uplink & Downlink" />
        <MetricCard icon={Activity} label="Active Sessions" value={communications.length} sub="Real-Time Links" />
      </div>

      {/* SECTION 1: WORLD COMMUNICATION VISUALIZATION MAP */}
      <GroundStationWorldMap stations={stations} communications={communications} />

      {/* SECTION 2: GROUND STATION TERMINAL CARDS */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
            POSTGRESQL ground_stations TABLE
          </p>
          <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Deep Space Ground Terminals
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {stations.map((g) => (
            <div
              key={g.ground_station_id || g.code}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{g.code} · {g.country}</span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {g.city} Terminal
                  </h3>
                </div>
                <StatusBadge status={g.status} />
              </div>

              <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace', display: 'block' }}>SIGNAL QUALITY</small>
                  <b style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{g.signal_pct ?? 94}%</b>
                </div>
                <Signal size={24} style={{ color: 'var(--text-primary)' }} />
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 4px' }}>Connected Spacecraft: <b style={{ color: 'var(--text-primary)' }}>{g.connected_satellite || (g.code === 'MAD-01' ? 'SAT-01 (ISS)' : g.code === 'BLR-01' ? 'SAT-02' : 'No Active Downlink')}</b></p>
                <p style={{ margin: 0, fontFamily: 'monospace', color: 'var(--text-muted)' }}>Coordinates: {g.latitude}° N, {g.longitude}° E</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: COMMUNICATION SESSIONS HISTORY TABLE */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              POSTGRESQL communication_sessions TABLE
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Communication Session Log & Downlink History
            </h3>
          </div>
          <Radio size={20} style={{ color: 'var(--text-primary)' }} />
        </div>

        {communications.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {communications.map((cs) => (
              <div key={cs.session_id} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                    {cs.station_code} ({cs.city}) ↔ {cs.satellite_code} ({cs.satellite_name})
                  </b>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'monospace' }}>
                    Started: {new Date(cs.started_at).toLocaleString()}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>Signal {cs.signal_pct}%</span>
                  <StatusBadge status={cs.status || 'NOMINAL'} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
            No active communication sessions recorded.
          </div>
        )}
      </div>
    </div>
  );
}
