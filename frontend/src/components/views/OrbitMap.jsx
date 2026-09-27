import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function OrbitMap({ satellite, liveOrbit, orbitHistory = [], groundStations = [] }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const trackRef = useRef(null);
  const stationGroupRef = useRef(null);

  const hasPosition = liveOrbit?.latitude != null && liveOrbit?.longitude != null;
  const lat = hasPosition ? Number(liveOrbit.latitude) : (satellite?.current_latitude != null ? Number(satellite.current_latitude) : null);
  const lon = hasPosition ? Number(liveOrbit.longitude) : (satellite?.current_longitude != null ? Number(satellite.current_longitude) : null);
  const alt = liveOrbit?.altitude_km ?? satellite?.current_altitude_km ?? null;
  const vel = liveOrbit?.velocity_kms ?? satellite?.current_velocity_kms ?? null;
  const source = liveOrbit?.source || satellite?.orbital_source || 'SIMULATED';
  const noradId = liveOrbit?.norad_id || satellite?.norad_id;

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const initialLat = lat != null ? lat : 20;
    const initialLon = lon != null ? lon : 0;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLon],
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

    stationGroupRef.current = L.layerGroup().addTo(map);
    leafletMap.current = map;

    // Observe theme changes
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newUrl = currentTheme === 'light'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(newUrl);
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observer.disconnect();
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Satellite Marker & Track
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    if (lat != null && lon != null) {
      map.panTo([lat, lon], { animate: true, duration: 1 });

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const outerColor = isLight ? '#000000' : '#ffffff';
      const innerColor = isLight ? '#ffffff' : '#000000';

      // Satellite Icon: High-contrast monochrome circle with contrasting center core
      const satIcon = L.divIcon({
        className: 'custom-sat-icon',
        html: `<div style="
          width: 26px;
          height: 26px;
          background: ${outerColor};
          border: 2px solid ${outerColor};
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
          display: grid;
          place-items: center;
        ">
          <div style="width: 10px; height: 10px; background: ${innerColor}; border-radius: 50%;"></div>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const popupContent = `
        <div style="font-family: monospace; color: #000000; font-size: 11px;">
          <b style="font-size: 13px; color: #000000;">${satellite?.code || 'SAT'} - ${satellite?.name || 'Satellite'}</b><br/>
          <span>Source: <strong>${source} ${noradId ? `(NORAD ${noradId})` : ''}</strong></span><br/>
          <span>Position: <strong>${lat.toFixed(3)}° N, ${lon.toFixed(3)}° E</strong></span><br/>
          <span>Altitude: <strong>${alt != null ? Number(alt).toFixed(1) + ' km' : 'UNAVAILABLE'}</strong></span><br/>
          <span>Velocity: <strong>${vel != null ? Number(vel).toFixed(2) + ' km/s' : 'UNAVAILABLE'}</strong></span>
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
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Ground Track Polyline with Longitude Wraparound Handling
    if (trackRef.current) {
      map.removeLayer(trackRef.current);
    }

    if (lat != null && lon != null && orbitHistory && orbitHistory.length > 0) {
      const latLons = orbitHistory
        .map(p => [Number(p.latitude), Number(p.longitude)])
        .filter(p => !isNaN(p[0]) && !isNaN(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180);
      
      latLons.unshift([lat, lon]);

      const segments = [];
      let currentSegment = [latLons[0]];

      for (let i = 1; i < latLons.length; i++) {
        const prevLon = latLons[i - 1][1];
        const currLon = latLons[i][1];
        if (Math.abs(currLon - prevLon) > 180) {
          if (currentSegment.length > 0) segments.push(currentSegment);
          currentSegment = [latLons[i]];
        } else {
          currentSegment.push(latLons[i]);
        }
      }
      if (currentSegment.length > 0) segments.push(currentSegment);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const lineColor = isLight ? (source === 'REAL' ? '#000000' : '#555555') : (source === 'REAL' ? '#ffffff' : '#777777');

      trackRef.current = L.polyline(segments, {
        color: lineColor,
        weight: 2,
        opacity: 0.9,
        dashArray: source === 'REAL' ? 'none' : '6, 6'
      }).addTo(map);
    }
  }, [lat, lon, alt, vel, source, orbitHistory]);

  // Render Ground Stations: Monochrome Square / Ring Icons
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !stationGroupRef.current) return;

    stationGroupRef.current.clearLayers();

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = isLight ? '#ffffff' : '#000000';
    const fg = isLight ? '#000000' : '#ffffff';

    const stationIcon = L.divIcon({
      className: 'custom-station-icon',
      html: `<div style="
        width: 22px;
        height: 22px;
        background: ${bg};
        border: 2px solid ${fg};
        border-radius: 4px;
        display: grid;
        place-items: center;
        color: ${fg};
        font-size: 11px;
        font-weight: bold;
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
            <div style="font-family: monospace; color: #000000; font-size: 11px;">
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
          <h3 style={{ color: 'var(--text-primary)' }}>Live Orbital Visualization</h3>
        </div>
        <span className={`orbit-source-badge ${source.toLowerCase()}`}>
          ● {source === 'REAL' ? `REAL TRACKED ISS (NORAD ${noradId || 25544})` : 'SIMULATED MISSION ORBIT'}
        </span>
      </div>
      <div ref={mapRef} className="orbit-map-container" />
    </div>
  );
}
