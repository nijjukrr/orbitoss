import { db } from '../src/db.js';

const sql = `
CREATE TABLE IF NOT EXISTS crew_assignments (
  id SERIAL PRIMARY KEY,
  astronaut_id INTEGER REFERENCES astronauts(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(mission_id) ON DELETE SET NULL,
  space_station_id UUID REFERENCES space_stations(station_id) ON DELETE SET NULL,
  spacecraft_id UUID REFERENCES satellites(satellite_id) ON DELETE SET NULL,
  role TEXT,
  assignment_status TEXT DEFAULT 'ACTIVE',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  source TEXT DEFAULT 'The Space Devs LL2',
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);
`;

try {
  await db.query(sql);
  console.log('Successfully created crew_assignments table in PostgreSQL.');
} catch (err) {
  console.error('Error creating crew_assignments table:', err);
} finally {
  await db.end();
}
