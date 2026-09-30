import { db } from '../src/db.js';

try {
  const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('Existing tables in database:');
  console.log(res.rows.map(r => r.table_name));
} catch (err) {
  console.error('Database connection error:', err);
} finally {
  await db.end();
}
