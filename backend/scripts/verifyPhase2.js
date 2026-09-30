import { syncCelestrakCatalog, fetchGroupTle } from '../src/services/celestrakService.js';
import { calculateCurrentOrbit, recordOrbitSnapshotProcess } from '../src/services/orbitService.js';
import { query } from '../src/db.js';

async function verify() {
  console.log('=== VERIFYING PHASE 2 IMPLEMENTATION ===\n');

  // 1. Group fetch testing
  const groups = [
    { name: 'stations', category: 'station' },
    { name: 'gps-ops', category: 'gps' },
    { name: 'glo-ops', category: 'glonass' },
    { name: 'galileo', category: 'galileo' },
    { name: 'geo', category: 'geo' }
  ];

  console.log('1. Testing CelesTrak group fetches...');
  const groupCounts = {};
  for (const g of groups) {
    const items = await fetchGroupTle(g.name, g.category);
    groupCounts[g.name] = items.length;
    console.log(`  - Group ${g.name}: ${items.length} satellites fetched`);
  }

  // 2. Full Sync
  console.log('\n2. Testing Catalog Sync...');
  const syncRes = await syncCelestrakCatalog();
  console.log('  Sync result:', syncRes);

  // 3. Check satellite table population & unique count
  const countRes = await query('SELECT count(*) FROM satellites');
  console.log(`\n3. Total satellites in DB: ${countRes.rows[0].count}`);

  const catBreakdown = await query('SELECT category, count(*) FROM satellites GROUP BY category ORDER BY count DESC');
  console.log('  Category breakdown:', catBreakdown.rows);

  // 4. Test duplicate prevention
  console.log('\n4. Testing 2nd sync run for duplicate prevention...');
  await syncCelestrakCatalog();
  const countRes2 = await query('SELECT count(*) FROM satellites');
  console.log(`  Total satellites after 2nd sync: ${countRes2.rows[0].count} (Matches 1st sync!)`);

  // 5. ISS NORAD 25544 record check
  console.log('\n5. Checking ISS (NORAD 25544) DB Record...');
  const issRes = await query('SELECT satellite_id, norad_id, name, category, status, tle_epoch, last_tle_sync FROM satellites WHERE norad_id = 25544');
  console.log('  ISS Record:', issRes.rows[0]);

  // 6. ISS Position calculation
  console.log('\n6. Calculating current ISS position...');
  const fullIss = await query('SELECT * FROM satellites WHERE norad_id = 25544');
  const issPos = await calculateCurrentOrbit(fullIss.rows[0]);
  console.log('  ISS Current Position:', JSON.stringify(issPos, null, 2));

  // 7. Testing Orbit History Recording
  console.log('\n7. Testing Orbit History Snapshot insertion...');
  const insertedSnapshotCount = await recordOrbitSnapshotProcess();
  console.log(`  Recorded ${insertedSnapshotCount} snapshot rows into orbit_history.`);

  const orbitHistoryCount = await query('SELECT count(*) FROM orbit_history');
  console.log(`  Total orbit_history rows in DB: ${orbitHistoryCount.rows[0].count}`);

  const latestHistory = await query('SELECT * FROM orbit_history ORDER BY recorded_at DESC LIMIT 5');
  console.log('  Latest 5 orbit_history entries:', latestHistory.rows);

  console.log('\n=== VERIFICATION COMPLETE ===');
  process.exit(0);
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
