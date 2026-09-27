import * as satellite from 'satellite.js';
import { FALLBACK_TLE_DATA } from './fallbackTle.js';
import { query } from '../db.js';

/**
 * Parses TLE Line 1 to extract the exact TLE Epoch Date.
 * TLE Line 1 format:
 * 1 25544U 98067A   26095.53423984  .00014815  00000+0  26656-3 0  9993
 * Cols 19-20: Epoch Year (YY)
 * Cols 21-32: Epoch Day of Year + fraction (DDD.DDDDDDDD)
 */
export function parseTleEpoch(tleLine1) {
  if (!tleLine1 || !tleLine1.startsWith('1 ')) return null;

  try {
    const epochStr = tleLine1.substring(18, 32).trim();
    const yearDigits = parseInt(epochStr.substring(0, 2), 10);
    const dayFraction = parseFloat(epochStr.substring(2));

    if (isNaN(yearDigits) || isNaN(dayFraction)) return null;

    const fullYear = yearDigits < 50 ? 2000 + yearDigits : 1900 + yearDigits;
    const epochDate = new Date(Date.UTC(fullYear, 0, 1));
    // Add (dayFraction - 1) days to Jan 1st
    epochDate.setTime(epochDate.getTime() + (dayFraction - 1) * 86400 * 1000);

    return epochDate;
  } catch (err) {
    console.error('[orbitService] TLE Epoch parse error:', err);
    return null;
  }
}

/**
 * Computes TLE age statistics (age in hours & days, freshness category, and reliability flag).
 */
export function evaluateTleFreshness(tleLine1, now = new Date()) {
  const epochDate = parseTleEpoch(tleLine1);
  if (!epochDate) {
    return {
      tle_epoch: null,
      tle_age_hours: null,
      tle_age_days: null,
      freshness: 'UNKNOWN',
      reliable: false
    };
  }

  const ageMs = Math.max(0, now.getTime() - epochDate.getTime());
  const ageHours = Number((ageMs / (1000 * 3600)).toFixed(1));
  const ageDays = Number((ageHours / 24).toFixed(1));

  let freshness = 'FRESH';
  let reliable = true;

  if (ageDays > 14) {
    freshness = 'TOO_OLD';
    reliable = false;
  } else if (ageDays > 3) {
    freshness = 'STALE';
    reliable = true; // Usable for demo, but marked stale
  }

  return {
    tle_epoch: epochDate.toISOString(),
    tle_age_hours: ageHours,
    tle_age_days: ageDays,
    freshness,
    reliable
  };
}

/**
 * Validates whether orbital calculation results fall within plausible LEO physical bounds.
 */
export function validateOrbitalSanity(latitude, longitude, altitude_km, velocity_kms) {
  if (latitude == null || longitude == null || altitude_km == null || velocity_kms == null) return false;
  if (isNaN(latitude) || isNaN(longitude) || isNaN(altitude_km) || isNaN(velocity_kms)) return false;

  const validLat = latitude >= -90 && latitude <= 90;
  const validLon = longitude >= -180 && longitude <= 180;
  const validAlt = altitude_km >= 300 && altitude_km <= 1000; // Physical LEO range
  const validVel = velocity_kms >= 6.5 && velocity_kms <= 8.5; // LEO velocity range (~7.6 km/s)

  return validLat && validLon && validAlt && validVel;
}

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
    if (!satrec || satrec.error || isNaN(satrec.inclo)) {
      console.warn('[orbitService] Invalid or malformed TLE lines');
      return null;
    }

    const positionAndVelocity = satellite.propagate(satrec, date);
    if (
      !positionAndVelocity ||
      !positionAndVelocity.position ||
      typeof positionAndVelocity.position === 'boolean' ||
      isNaN(positionAndVelocity.position.x)
    ) {
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
 * Calculates current orbit position for a satellite record with full freshness, source tracking, and sanity verification.
 */
export async function calculateCurrentOrbit(sat) {
  if (sat.orbital_source === 'REAL' && sat.norad_id) {
    let tle1 = sat.tle_line1;
    let tle2 = sat.tle_line2;
    let data_source = sat.tle_line1 ? 'CACHED_TLE' : 'LOCAL_FALLBACK';

    // Fetch fresh TLE if missing or older than 6 hours
    const lastUpdate = sat.tle_updated_at ? new Date(sat.tle_updated_at).getTime() : 0;
    const isStaleInDb = (Date.now() - lastUpdate) > 6 * 60 * 60 * 1000;

    if (!tle1 || !tle2 || isStaleInDb) {
      const freshTle = await fetchTleForNoradId(sat.norad_id);
      if (freshTle) {
        tle1 = freshTle.line1;
        tle2 = freshTle.line2;
        data_source = freshTle.source; // 'CELESTRAK_LIVE' or 'LOCAL_FALLBACK'
        
        // Only update tle_updated_at in DB when retrieved from live source
        if (freshTle.source === 'CELESTRAK_LIVE') {
          await query(
            'UPDATE satellites SET tle_line1=$1, tle_line2=$2, tle_updated_at=now() WHERE satellite_id=$3',
            [tle1, tle2, sat.satellite_id]
          );
        }
      }
    }

    if (tle1 && tle2) {
      const freshnessInfo = evaluateTleFreshness(tle1);
      
      // If TLE age > 14 days, refine data_source label
      if (!freshnessInfo.reliable) {
        data_source = data_source === 'LOCAL_FALLBACK' ? 'STALE_FALLBACK' : 'STALE_CACHED';
      }

      const pos = calculatePositionFromTle(tle1, tle2);
      const isSanityPlausible = pos ? validateOrbitalSanity(pos.latitude, pos.longitude, pos.altitude_km, pos.velocity_kms) : false;
      const isReliable = freshnessInfo.reliable && isSanityPlausible;

      return {
        satellite_id: sat.satellite_id,
        code: sat.code,
        name: sat.name,
        norad_id: sat.norad_id,
        orbital_source: 'REAL',
        data_source,
        tle_epoch: freshnessInfo.tle_epoch,
        tle_age_hours: freshnessInfo.tle_age_hours,
        tle_age_days: freshnessInfo.tle_age_days,
        freshness: freshnessInfo.freshness,
        reliable: isReliable,
        orbitDataAvailable: isReliable && pos !== null,
        latitude: pos ? pos.latitude : 0,
        longitude: pos ? pos.longitude : 0,
        altitude_km: pos ? pos.altitude_km : 408,
        velocity_kms: pos ? pos.velocity_kms : 7.66,
        recorded_at: new Date().toISOString()
      };
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
    orbital_source: 'SIMULATED',
    data_source: 'SIMULATED_ENGINE',
    tle_epoch: null,
    tle_age_hours: null,
    tle_age_days: null,
    freshness: 'SIMULATED',
    reliable: true,
    orbitDataAvailable: true,
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

  if (!orbit.orbitDataAvailable) {
    console.warn(`[orbitService] Skipping orbit snapshot for ${satRecord.code}: TLE is stale/unreliable`);
    return null;
  }

  const inserted = await query(
    `INSERT INTO orbit_history(satellite_id, latitude, longitude, altitude_km, velocity_kms, source)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [satRecord.satellite_id, orbit.latitude, orbit.longitude, orbit.altitude_km, orbit.velocity_kms, orbit.orbital_source]
  );

  return inserted.rows[0];
}
