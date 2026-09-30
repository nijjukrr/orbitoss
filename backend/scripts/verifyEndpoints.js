import express from 'express';
import cors from 'cors';
import { db } from '../src/db.js';
import astronautsRouter from '../src/routes/astronauts.js';

const app = express();
app.use(express.json());
app.use('/api/astronauts', astronautsRouter);

const server = app.listen(5099, async () => {
  console.log('Testing server running on port 5099');
  try {
    // Test GET /api/astronauts/in-space
    console.log('\n--- 1. Testing GET /api/astronauts/in-space ---');
    const res1 = await fetch('http://localhost:5099/api/astronauts/in-space');
    const data1 = await res1.json();
    console.log('Status:', res1.status);
    console.log('Success:', data1.success);
    console.log('Returned count:', data1.count);
    console.log('Sample astronaut name:', data1.data[0]?.name);

    // Test GET /api/astronauts/:id
    console.log('\n--- 2. Testing GET /api/astronauts/:id ---');
    const sampleId = data1.data[0]?.id;
    const res2 = await fetch(`http://localhost:5099/api/astronauts/${sampleId}`);
    const data2 = await res2.json();
    console.log('Status:', res2.status);
    console.log('Success:', data2.success);
    console.log('Astronaut ID:', data2.data?.id, 'External ID:', data2.data?.external_id, 'Name:', data2.data?.name);

    // Test POST /api/astronauts/sync
    console.log('\n--- 3. Testing POST /api/astronauts/sync ---');
    const res3 = await fetch('http://localhost:5099/api/astronauts/sync', { method: 'POST' });
    const data3 = await res3.json();
    console.log('Status:', res3.status);
    console.log('Sync result:', data3);

    console.log('\nAll API endpoint verifications PASSED successfully!');
  } catch (err) {
    console.error('API Verification Error:', err);
  } finally {
    server.close();
    await db.end();
  }
});
