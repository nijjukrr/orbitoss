import * as satellite from 'satellite.js';
import { FALLBACK_TLE_DATA } from './fallbackTle.js';
import { query } from '../db.js';

/**
 * Fetches Two-Line Element (TLE) set for a given NORAD Catalog Number.
 * Tries CelesTrak public API first, falls back to local cached TLE data if offline.
 */
export async function fetchTleForNoradId(noradId) {
  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=tle`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const line1 = lines.find(l => l.startsWith('1 '));
        const line2 = lines.find(l => l.startsWith('2 '));
        if (line1 && line2) {
          return { line1, line2, source: 'CELESTRAK_LIVE' };
        }
      }
    }
  } catch (err) {
    console.warn(`[orbitService] CelesTrak fetch failed for NORAD ${noradId}, using fallback:`, err.message);
  }

  // Fallback to local offline TLE
  const fallback = FALLBACK_TLE_DATA[noradId];
  if (fallback) {
    return { line1: fallback.line1, line2: fallback.line2, source: 'LOCAL_FALLBACK' };
  }

  return null;
}

/**
 * Calculates current real latitude, longitude, altitude, and velocity using satellite.js SGP4 propagator.
 */
export function calculatePositionFromTle(tleLine1, tleLine2, date = new Date()) {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const latitude = satellite.degreesLat(positionGd.latitude);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const altitude_km = positionGd.height;

    let velocity_kms = 7.66;
    if (velocityEci) {
      velocity_kms = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);
    }

    return {
      latitude: Number(latitude.toFixed(3)),
      longitude: Number(longitude.toFixed(3)),
      altitude_km: Number(altitude_km.toFixed(2)),
      velocity_kms: Number(velocity_kms.toFixed(2))
    };
  } catch (err) {
    console.error('[orbitService] SGP4 calculation error:', err);
    return null;
  }
}

/**
 * Calculates current orbit position for a satellite record (real or simulated).
 */
export async function calculateCurrentOrbit(sat) {
  if (sat.orbital_source === 'REAL' && sat.norad_id) {
    let tle1 = sat.tle_line1;
    let tle2 = sat.tle_line2;

    // Fetch fresh TLE if missing or older than 6 hours
    const lastUpdate = sat.tle_updated_at ? new Date(sat.tle_updated_at).getTime() : 0;
    const isStale = (Date.now() - lastUpdate) > 6 * 60 * 60 * 1000;

    if (!tle1 || !tle2 || isStale) {
      const freshTle = await fetchTleForNoradId(sat.norad_id);
      if (freshTle) {
        tle1 = freshTle.line1;
        tle2 = freshTle.line2;
        await query(
          'UPDATE satellites SET tle_line1=$1, tle_line2=$2, tle_updated_at=now() WHERE satellite_id=$3',
          [tle1, tle2, sat.satellite_id]
        );
      }
    }

    if (tle1 && tle2) {
      const pos = calculatePositionFromTle(tle1, tle2);
      if (pos) {
        return {
          satellite_id: sat.satellite_id,
          code: sat.code,
          name: sat.name,
          norad_id: sat.norad_id,
          source: 'REAL',
          ...pos,
          recorded_at: new Date().toISOString()
        };
      }
    }
  }

  // Simulated orbital calculation (for fictional satellites)
  const t = Date.now() / 1000;
  const speed = sat.code === 'SAT-02' ? 0.002 : sat.code === 'SAT-03' ? 0.0015 : 0.0018;
  const offset = (sat.code.charCodeAt(5) || 1) * 35;
  const lat = Math.sin(t * speed + offset) * 51.6;
  const lon = ((t * speed * 20 + offset * 5) % 360) - 180;
  const alt = 408 + Math.cos(t * speed) * 12;
  const vel = 7.66 + Math.sin(t * speed) * 0.05;

  return {
    satellite_id: sat.satellite_id,
    code: sat.code,
    name: sat.name,
    norad_id: sat.norad_id || null,
    source: 'SIMULATED',
    latitude: Number(lat.toFixed(3)),
    longitude: Number(lon.toFixed(3)),
    altitude_km: Number(alt.toFixed(2)),
    velocity_kms: Number(vel.toFixed(2)),
    recorded_at: new Date().toISOString()
  };
}

/**
 * Calculates and inserts an orbit snapshot into orbit_history in PostgreSQL.
 */
export async function recordOrbitSnapshot(satId) {
  const sat = await query('SELECT * FROM satellites WHERE satellite_id = $1 OR code = $1', [satId]);
  if (!sat.rowCount) return null;

  const satRecord = sat.rows[0];
  const orbit = await calculateCurrentOrbit(satRecord);

  const inserted = await query(
    `INSERT INTO orbit_history(satellite_id, latitude, longitude, altitude_km, velocity_kms, source)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [satRecord.satellite_id, orbit.latitude, orbit.longitude, orbit.altitude_km, orbit.velocity_kms, orbit.source]
  );

  return inserted.rows[0];
}
