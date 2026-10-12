import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : undefined
});

export async function query(text, values) {
  return db.query(text, values);
}
