import { syncAstronautsFromLL2, getAstronautsInSpace } from '../src/services/astronautService.js';
import { db } from '../src/db.js';

try {
  console.log('--- Step 1: Initial Sync ---');
  const res1 = await syncAstronautsFromLL2();
  console.log('Sync 1 result:', res1);

  console.log('--- Step 2: Fetching from DB ---');
  const crew = await getAstronautsInSpace();
  console.log(`Found ${crew.length} astronauts in space in PostgreSQL:`);
  console.log(crew.map(c => `- ${c.name} (${c.agency_abbrev || c.agency_name || 'N/A'}, ${c.nationality || 'N/A'})`));

  console.log('--- Step 3: Second Sync (Deduplication Check) ---');
  const res2 = await syncAstronautsFromLL2();
  console.log('Sync 2 result:', res2);

  const countRes = await db.query('SELECT count(*) FROM astronauts');
  console.log('Total astronauts in table after 2 syncs:', countRes.rows[0].count);

  console.log('--- Sample Record from OUR database ---');
  console.log(JSON.stringify(crew[0], null, 2));

} catch (err) {
  console.error('Sync Test Failed:', err);
} finally {
  await db.end();
}
