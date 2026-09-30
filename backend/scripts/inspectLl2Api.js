const url = 'https://lldev.thespacedevs.com/2.3.0/astronauts/?in_space=true&is_human=true&mode=normal&limit=100&format=json';

try {
  console.log('Fetching from LL2 Dev API:', url);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ORBITOPS-MissionControl/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Total count:', data.count);
  console.log('Number of results returned:', data.results?.length);
  if (data.results && data.results.length > 0) {
    console.log('Sample Astronaut object keys:', Object.keys(data.results[0]));
    console.log('Sample Astronaut record:', JSON.stringify(data.results[0], null, 2));
  }
} catch (err) {
  console.error('Failed to fetch LL2 API:', err.message);
}
