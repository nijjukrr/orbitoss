import { readFile } from 'node:fs/promises';
import { db } from '../src/db.js';

const sqlFiles = [
  new URL('../../database/schema.sql', import.meta.url),
  new URL('../../database/seed.sql', import.meta.url),
  new URL('../../database/verify.sql', import.meta.url)
];

try {
  for (const file of sqlFiles) {
    const sql = await readFile(file, 'utf8');
    console.log(`Running ${file.pathname.split('/').pop()}...`);
    await db.query(sql);
  }
  console.log('\nORBITOPS database is ready. You can now run: npm run dev');
} catch (error) {
  console.error('\nDatabase setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
