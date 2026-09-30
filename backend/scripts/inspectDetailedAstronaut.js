const baseUrl = 'https://lldev.thespacedevs.com/2.3.0';

async function inspect(url) {
  console.log('Fetching:', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'ORBITOPS-MissionControl/1.0' } });
  const data = await res.json();
  if (data.results) {
    console.log('Sample record keys:', Object.keys(data.results[0]));
    console.log(JSON.stringify(data.results[0], null, 2));
  } else {
    console.log('Record keys:', Object.keys(data));
    console.log(JSON.stringify(data, null, 2));
  }
}

console.log('--- 1. Astronaut Mode Detailed ---');
await inspect(`${baseUrl}/astronauts/573/?mode=detailed&format=json`);

console.log('\n--- 2. Astronaut List Mode Detailed ---');
await inspect(`${baseUrl}/astronauts/?in_space=true&is_human=true&mode=detailed&limit=2&format=json`);
