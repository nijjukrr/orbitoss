import { db } from '../src/db.js';

const sql = `
CREATE TABLE IF NOT EXISTS astronauts (
  id SERIAL PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  agency_id INTEGER,
  agency_name TEXT,
  agency_abbrev TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  in_space BOOLEAN DEFAULT false,
  time_in_space TEXT,
  age INTEGER,
  nationality TEXT,
  bio TEXT,
  first_flight TIMESTAMPTZ,
  last_flight TIMESTAMPTZ,
  flights_count INTEGER,
  landings_count INTEGER,
  spacewalks_count INTEGER,
  source_url TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);
`;

try {
  await db.query(sql);
  console.log('Successfully created astronauts table in PostgreSQL.');
} catch (err) {
  console.error('Error creating astronauts table:', err);
} finally {
  await db.end();
}
