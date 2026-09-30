import * as satellite from 'satellite.js';
import { query } from '../db.js';

/**
 * Parses TLE Line 1 to extract the exact TLE Epoch Date.
 * Format:
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
    epochDate.setTime(epochDate.getTime() + (dayFraction - 1) * 86400 * 1000);

    return epochDate;
  } catch (err) {
    console.error('[orbitService] TLE Epoch parse error:', err);
    return null;
  }
}

/**
 * Evaluates TLE freshness based on prompt criteria:
 * <= 3 days: FRESH
 * > 3 days and <= 14 days: STALE
 * > 14 days: UNRELIABLE
 */
export function evaluateTleFreshness(tleLine1, now = new Date()) {
  const epochDate = parseTleEpoch(tleLine1);
  if (!epochDate) {
    return {
      tle_epoch: null,
      tle_age_hours: null,
      tle_age_days: null,
      freshness: 'UNRELIABLE',
      reliable: false
    };
  }

  const ageMs = Math.max(0, now.getTime() - epochDate.getTime());
  const ageHours = Number((ageMs / (1000 * 3600)).toFixed(1));
  const ageDays = Number((ageHours / 24).toFixed(1));

  let freshness = 'FRESH';
  let reliable = true;

  if (ageDays > 14) {
    freshness = 'UNRELIABLE';
    reliable = false;
  } else if (ageDays > 3) {
    freshness = 'STALE';
    reliable = true;
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
 * Validates whether orbital calculation results fall within plausible physical bounds.
 * Accommodates LEO, MEO, and GEO orbits.
 */
export function validateOrbitalSanity(latitude, longitude, altitude_km, velocity_kms) {
  if (latitude == null || longitude == null || altitude_km == null || velocity_kms == null) return false;
  if (isNaN(latitude) || isNaN(longitude) || isNaN(altitude_km) || isNaN(velocity_kms)) return false;

  const validLat = latitude >= -90 && latitude <= 90;
  const validLon = longitude >= -180 && longitude <= 180;
  const validAlt = altitude_km >= 100 && altitude_km <= 50000;
  const validVel = velocity_kms >= 0.5 && velocity_kms <= 12.0;

  return validLat && validLon && validAlt && validVel;
}

/**
 * Calculates current real latitude, longitude, altitude, and velocity using satellite.js SGP4 propagator.
 */
export function calculatePositionFromTle(tleLine1, tleLine2, date = new Date()) {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    if (!satrec || satrec.error) {
      return null;
    }

    const positionAndVelocity = satellite.propagate(satrec, date);
    if (
      !positionAndVelocity ||
      !positionAndVelocity.position ||
      typeof positionAndVelocity.position === 'boolean'
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

    let velocity_kms = 0;
    if (velocityEci && !isNaN(velocityEci.x)) {
      velocity_kms = Math.sqrt(velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2);
    }

    if (isNaN(latitude) || isNaN(longitude) || isNaN(altitude_km) || isNaN(velocity_kms)) {
      return null;
    }

    return {
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
      altitude_km: Number(altitude_km.toFixed(1)),
      velocity_kms: Number(velocity_kms.toFixed(2)),
      velocity_km_s: Number(velocity_kms.toFixed(2))
    };
  } catch (err) {
    console.error('[orbitService] SGP4 calculation error:', err);
    return null;
  }
}

/**
 * Calculates current orbit position for a satellite database record.
 */
export async function calculateCurrentOrbit(sat, timestamp = new Date()) {
  if (sat && sat.tle_line1 && sat.tle_line2) {
    const freshnessInfo = evaluateTleFreshness(sat.tle_line1, timestamp);
    const pos = calculatePositionFromTle(sat.tle_line1, sat.tle_line2, timestamp);
    const isSanityPlausible = pos ? validateOrbitalSanity(pos.latitude, pos.longitude, pos.altitude_km, pos.velocity_kms) : false;
    const isReliable = freshnessInfo.reliable && isSanityPlausible;

    if (pos && isSanityPlausible) {
      return {
        satellite_id: sat.satellite_id || sat.id,
        norad_id: sat.norad_id,
        name: sat.name,
        category: sat.category,
        latitude: pos.latitude,
        longitude: pos.longitude,
        altitude_km: pos.altitude_km,
        velocity_km_s: pos.velocity_km_s,
        velocity_kms: pos.velocity_kms,
        timestamp: timestamp.toISOString(),
        tle_epoch: freshnessInfo.tle_epoch,
        freshness: freshnessInfo.freshness,
        reliable: isReliable,
        source: 'CelesTrak TLE + SGP4'
      };
    }
  }

  return {
    satellite_id: sat ? (sat.satellite_id || sat.id) : null,
    norad_id: sat ? sat.norad_id : null,
    name: sat ? sat.name : 'Unknown',
    category: sat ? sat.category : null,
    latitude: null,
    longitude: null,
    altitude_km: null,
    velocity_km_s: null,
    velocity_kms: null,
    timestamp: timestamp.toISOString(),
    freshness: 'UNAVAILABLE',
    reliable: false,
    source: 'SGP4 Propagation Failed'
  };
}

/**
 * Background Snapshot Process:
 * Takes position snapshots ONLY for tracked/demo satellites (ISS + max 4 demo station satellites)
 * every 5 minutes and writes to orbit_history.
 * Also enforces a 7-day retention policy to prevent database bloat.
 */
export async function recordOrbitSnapshotProcess() {
  try {
    // 1. Select tracked set: ISS (NORAD 25544) + maximum 4 additional demo satellites
    const satsResult = await query(`
      (SELECT * FROM satellites WHERE norad_id = 25544 LIMIT 1)
      UNION ALL
      (SELECT * FROM satellites WHERE (norad_id IS NULL OR norad_id <> 25544) AND category = 'station' AND tle_line1 IS NOT NULL ORDER BY norad_id LIMIT 4)
    `);

    if (satsResult.rowCount > 0) {
      const now = new Date();
      const rowsToInsert = [];
      const params = [];

      let paramIdx = 1;
      for (const sat of satsResult.rows) {
        const pos = await calculateCurrentOrbit(sat, now);
        if (pos && pos.latitude !== null) {
          rowsToInsert.push(
            `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, 'REAL')`
          );
          params.push(sat.satellite_id, pos.latitude, pos.longitude, pos.altitude_km, pos.velocity_kms, now.toISOString());
          paramIdx += 6;
        }
      }

      if (rowsToInsert.length > 0) {
        const sql = `
          INSERT INTO orbit_history (satellite_id, latitude, longitude, altitude_km, velocity_kms, recorded_at, source)
          VALUES ${rowsToInsert.join(', ')}
        `;
        await query(sql, params);
      }
    }

    // 2. Retention Policy Cleanup: Delete orbit_history entries older than 7 days
    await query(`DELETE FROM orbit_history WHERE recorded_at < NOW() - INTERVAL '7 days'`);

    return satsResult.rowCount;
  } catch (err) {
    console.error('[orbitService] Snapshot process error:', err.message);
    return 0;
  }
}
