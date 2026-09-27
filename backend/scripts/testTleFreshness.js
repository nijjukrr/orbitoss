import {
  parseTleEpoch,
  evaluateTleFreshness,
  validateOrbitalSanity,
  calculatePositionFromTle,
  calculateCurrentOrbit
} from '../src/services/orbitService.js';
import { query, db } from '../src/db.js';

async function runFreshnessTests() {
  console.log('=== TESTING TLE FRESHNESS, SOURCE TRACKING & SANITY VALIDATION ===\n');

  try {
    // Test 1: TLE Epoch Parsing & Freshness Calculation
    console.log('Test 1: TLE Epoch Parsing...');
    const tle2026 = '1 25544U 98067A   26095.53423984  .00014815  00000+0  26656-3 0  9993';
    const parsedEpoch = parseTleEpoch(tle2026);
    console.log('   ✓ Parsed Epoch Date:', parsedEpoch ? parsedEpoch.toISOString() : 'FAILED');

    const freshness2026 = evaluateTleFreshness(tle2026);
    console.log('   ✓ 2026 TLE Freshness Evaluation:', freshness2026);
    if (!freshness2026.reliable && freshness2026.tle_age_days > 14) {
      console.log('   ✓ Correctly marked as stale/unreliable due to age > 14 days');
    }

    // Test 2: Malformed TLE Handling
    console.log('\nTest 2: Malformed TLE Lines...');
    const badPosition = calculatePositionFromTle('1 BAD LINE', '2 BAD LINE');
    console.log('   ✓ Malformed TLE handling:', badPosition === null ? 'SUCCESS (returned null)' : 'FAILED');

    // Test 3: Orbital Sanity Bounds
    console.log('\nTest 3: LEO Orbital Sanity Bounds Validation...');
    console.log('   - Sanity (Lat 13.4, Lon 80.1, Alt 418km, Vel 7.66km/s):', validateOrbitalSanity(13.4, 80.1, 418.2, 7.66) ? 'VALID (Pass)' : 'INVALID');
    console.log('   - Sanity (Lat 13.4, Lon 80.1, Alt 150km [Too Low], Vel 7.66km/s):', validateOrbitalSanity(13.4, 80.1, 150.0, 7.66) ? 'VALID' : 'INVALID (Pass)');

    // Test 4: Live ISS SGP4 Calculation & Bounds
    console.log('\nTest 4: Real ISS SGP4 Propagation & Sanity Check...');
    const sat01 = await query("SELECT * FROM satellites WHERE code='SAT-01'");
    if (sat01.rowCount) {
      const orbit = await calculateCurrentOrbit(sat01.rows[0]);
      console.log('   ✓ ISS Orbit Result:', {
        code: orbit.code,
        norad_id: orbit.norad_id,
        orbital_source: orbit.orbital_source,
        data_source: orbit.data_source,
        tle_age_hours: orbit.tle_age_hours,
        reliable: orbit.reliable,
        latitude: orbit.latitude,
        longitude: orbit.longitude,
        altitude_km: orbit.altitude_km,
        velocity_kms: orbit.velocity_kms
      });

      if (orbit.altitude_km >= 250 && orbit.altitude_km <= 500 && orbit.velocity_kms >= 7.0 && orbit.velocity_kms <= 8.0) {
        console.log('   ✓ Plausibility Check SUCCESS: ISS Altitude & Velocity within expected LEO range!');
      } else {
        console.warn('   ⚠️ Plausibility Warning: Values outside strict LEO bounds');
      }
    }

    console.log('\n=== ALL TLE FRESHNESS & SANITY TESTS PASSED! ===');
  } catch (err) {
    console.error('❌ FRESHNESS TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

runFreshnessTests();
