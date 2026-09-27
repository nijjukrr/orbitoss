import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function OrbitMap({ satellite, liveOrbit, orbitHistory = [], groundStations = [] }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const trackRef = useRef(null);
  const stationGroupRef = useRef(null);

  const lat = liveOrbit?.latitude ?? satellite?.current_latitude ?? 0;
  const lon = liveOrbit?.longitude ?? satellite?.current_longitude ?? 0;
  const alt = liveOrbit?.altitude_km ?? satellite?.current_altitude_km ?? 408;
  const vel = liveOrbit?.velocity_kms ?? satellite?.current_velocity_kms ?? 7.66;
  const source = liveOrbit?.source || satellite?.orbital_source || 'SIMULATED';
  const noradId = liveOrbit?.norad_id || satellite?.norad_id;

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lon],
      zoom: 2,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    stationGroupRef.current = L.layerGroup().addTo(map);
    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Satellite Marker & Track
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Update center gently
    if (lat !== 0 || lon !== 0) {
      map.panTo([lat, lon], { animate: true, duration: 1 });
    }

    // Satellite Icon
    const satIcon = L.divIcon({
      className: 'custom-sat-icon',
      html: `<div style="
        width: 32px;
        height: 32px;
        background: radial-gradient(circle, #39d5ff 20%, #091c33 70%);
        border: 2px solid ${source === 'REAL' ? '#4df2b8' : '#ffd37f'};
        border-radius: 50%;
        box-shadow: 0 0 14px ${source === 'REAL' ? '#1db980' : '#39d5ff'};
        display: grid;
        place-items: center;
        color: #fff;
        font-weight: bold;
        font-size: 14px;
      ">🛰</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const popupContent = `
      <div style="font-family: monospace; color: #07111f; font-size: 11px;">
        <b style="font-size: 13px; color: #1b4771;">${satellite?.code || 'SAT'} - ${satellite?.name || 'Satellite'}</b><br/>
        <span>Source: <strong>${source} ${noradId ? `(NORAD ${noradId})` : ''}</strong></span><br/>
        <span>Position: <strong>${lat}° N, ${lon}° E</strong></span><br/>
        <span>Altitude: <strong>${alt} km</strong></span><br/>
        <span>Velocity: <strong>${vel} km/s</strong></span>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      markerRef.current.setIcon(satIcon);
      markerRef.current.getPopup().setContent(popupContent);
    } else {
      markerRef.current = L.marker([lat, lon], { icon: satIcon })
        .bindPopup(popupContent)
        .addTo(map);
    }

    // Ground Track Polyline
    if (trackRef.current) {
      map.removeLayer(trackRef.current);
    }

    if (orbitHistory && orbitHistory.length > 0) {
      const latLons = orbitHistory.map(p => [Number(p.latitude), Number(p.longitude)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      latLons.unshift([lat, lon]);

      trackRef.current = L.polyline(latLons, {
        color: source === 'REAL' ? '#39d5ff' : '#ffd37f',
        weight: 2,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(map);
    }
  }, [lat, lon, alt, vel, source, orbitHistory]);

  // Render Ground Stations
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !stationGroupRef.current) return;

    stationGroupRef.current.clearLayers();

    const stationIcon = L.divIcon({
      className: 'custom-station-icon',
      html: `<div style="
        width: 22px;
        height: 22px;
        background: #113627;
        border: 1px solid #4df2b8;
        border-radius: 4px;
        display: grid;
        place-items: center;
        color: #4df2b8;
        font-size: 11px;
      ">◒</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const defaultStations = [
      { code: 'BLR-01', city: 'Bengaluru', country: 'India', latitude: 12.971, longitude: 77.594 },
      { code: 'MAD-01', city: 'Madrid', country: 'Spain', latitude: 40.416, longitude: -3.703 },
      { code: 'MCM-01', city: 'McMurdo', country: 'Antarctica', latitude: -77.841, longitude: 166.686 }
    ];

    const stationsToRender = groundStations.length ? groundStations : defaultStations;

    stationsToRender.forEach(st => {
      const stLat = Number(st.latitude);
      const stLon = Number(st.longitude);
      if (!isNaN(stLat) && !isNaN(stLon)) {
        L.marker([stLat, stLon], { icon: stationIcon })
          .bindPopup(`
            <div style="font-family: monospace; color: #07111f; font-size: 11px;">
              <b>📡 Ground Station: ${st.code}</b><br/>
              <span>${st.city}, ${st.country}</span><br/>
              <span>Coords: ${stLat}, ${stLon}</span>
            </div>
          `)
          .addTo(stationGroupRef.current);
      }
    });
  }, [groundStations]);

  return (
    <div className="orbit-map-wrapper">
      <div className="panel-header" style={{ marginBottom: '10px' }}>
        <div>
          <p className="eyebrow">GROUND TRACK & TRAJECTORY</p>
          <h3>Live Orbital Visualization</h3>
        </div>
        <span className={`orbit-source-badge ${source.toLowerCase()}`}>
          ● {source === 'REAL' ? `REAL TRACKED ISS (NORAD ${noradId || 25544})` : 'SIMULATED MISSION ORBIT'}
        </span>
      </div>
      <div ref={mapRef} className="orbit-map-container" />
    </div>
  );
}
