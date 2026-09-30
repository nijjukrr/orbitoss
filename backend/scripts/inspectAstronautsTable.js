import { db } from '../src/db.js';

try {
  const res = await db.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'astronauts'
    ORDER BY ordinal_position;
  `);
  console.log('Astronauts table columns:');
  console.table(res.rows);
} catch (err) {
  console.error('Error:', err);
} finally {
  await db.end();
}
