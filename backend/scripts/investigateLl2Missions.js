const baseUrl = 'https://lldev.thespacedevs.com/2.3.0';

async function fetchLl2(endpoint) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`\n==================================================\nFetching: ${url}\n==================================================`);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ORBITOPS-MissionControl/1.0' } });
    if (!res.ok) {
      console.log(`HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    console.log('Count:', data.count);
    console.log('Results length:', data.results?.length);
    if (data.results && data.results.length > 0) {
      console.log('Sample Record Keys:', Object.keys(data.results[0]));
      console.log('Sample Record:\n', JSON.stringify(data.results[0], null, 2).slice(0, 1500));
    }
    return data;
  } catch (err) {
    console.error('Fetch error:', err.message);
    return null;
  }
}

// 1. Check detailed astronaut record
console.log('--- 1. Testing Detailed Astronaut Record (Jessica Meir - ID 573) ---');
await fetchLl2('/astronauts/573/?format=json');

// 2. Check expeditions
console.log('\n--- 2. Testing Expeditions Endpoint ---');
await fetchLl2('/expeditions/?format=json&limit=10');

// 3. Check space stations
console.log('\n--- 3. Testing Space Stations Endpoint ---');
await fetchLl2('/space_stations/?format=json&limit=10');

// 4. Check spacecraft flights
console.log('\n--- 4. Testing Spacecraft Flights Endpoint ---');
await fetchLl2('/spacecraft_flights/?format=json&limit=10');
