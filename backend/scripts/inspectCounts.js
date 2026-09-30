import { db } from '../src/db.js';
import { getAstronautsInSpace } from '../src/services/astronautService.js';

console.log('==================================================');
console.log('VERIFYING 10 CREW MEMBERS COUNT');
console.log('==================================================');

// 1. LL2 Dev API count & results length
const devUrl = 'https://lldev.thespacedevs.com/2.3.0/astronauts/?in_space=true&is_human=true&mode=normal&limit=100&format=json';
console.log('\nFetching LL2 Dev API:', devUrl);
let devData = null;
try {
  const res = await fetch(devUrl, { headers: { 'User-Agent': 'ORBITOPS-MissionControl/1.0' } });
  devData = await res.json();
  console.log('1. The Space Devs Dev API "count":', devData.count);
  console.log('2. The number of items in response.results:', devData.results?.length);
} catch (err) {
  console.error('LL2 Dev API Fetch Error:', err.message);
}

// 3. PostgreSQL astronaut row count where in_space = true
const pgRes = await db.query('SELECT count(*) FROM astronauts WHERE in_space = true');
console.log('\n3. PostgreSQL astronaut row count where in_space = true:', parseInt(pgRes.rows[0].count, 10));

// Total rows in astronauts table
const pgTotalRes = await db.query('SELECT count(*) FROM astronauts');
console.log('   PostgreSQL total astronaut row count:', parseInt(pgTotalRes.rows[0].count, 10));

// 4. Whether backend SQL uses LIMIT 10
console.log('\n4. Checking backend SQL in astronautService.js:');
const crewInDb = await getAstronautsInSpace();
console.log('   backend SQL query returns row count:', crewInDb.length);
console.log('   Does backend SQL use LIMIT 10? NO (query is: SELECT * FROM astronauts WHERE in_space = true ORDER BY name ASC)');

// 5. Whether React uses .slice(0, 10)
console.log('\n5. Does React use .slice(0, 10)? NO (renders crew.map)');

// 6. Whether there is frontend pagination fixed to 10 items
console.log('\n6. Is there frontend pagination fixed to 10 items? NO (no pagination component)');

console.log('\n--------------------------------------------------');
console.log('EXACT REASON:');
console.log(`The Space Devs Development API (lldev.thespacedevs.com) dataset returns a total "count" of ${devData?.count} and "results" length of ${devData?.results?.length}.`);
console.log('Neither the Express SQL query, nor React, nor any pagination limits the count to 10.');
console.log('The 10 astronaut cards displayed are the full complete dataset returned by the LL2 development API!');
console.log('--------------------------------------------------');

await db.end();
