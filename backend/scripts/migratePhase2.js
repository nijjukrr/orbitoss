import { query } from '../src/db.js';

async function migrate() {
  console.log('[Migration] Starting Phase 2 DB Schema update...');

  try {
    // 1. Relax constraints on existing columns in `satellites` if needed for imported CelesTrak sats
    await query(`ALTER TABLE satellites ALTER COLUMN mission_id DROP NOT NULL;`);
    await query(`ALTER TABLE satellites ALTER COLUMN purpose DROP NOT NULL;`);
    await query(`ALTER TABLE satellites ALTER COLUMN launched_on DROP NOT NULL;`);
    await query(`ALTER TABLE satellites ALTER COLUMN code DROP NOT NULL;`);

    // 2. Add new columns to `satellites` table if they do not exist
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS category TEXT;`);
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS tle_epoch TIMESTAMPTZ;`);
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS tle_source TEXT DEFAULT 'CELESTRAK';`);
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS last_tle_sync TIMESTAMPTZ;`);
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();`);
    await query(`ALTER TABLE satellites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();`);

    // 3. Add UNIQUE constraint on norad_id if not present
    // First update any existing null norad_ids if necessary or check existing constraint
    const checkConstraint = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'satellites' AND constraint_type = 'UNIQUE' AND constraint_name = 'satellites_norad_id_key'
    `);

    if (!checkConstraint.rowCount) {
      await query(`ALTER TABLE satellites ADD CONSTRAINT satellites_norad_id_key UNIQUE (norad_id);`);
      console.log('[Migration] Added UNIQUE constraint on satellites.norad_id');
    }

    // 4. Update existing ISS record (norad_id 25544) to category='station'
    await query(`UPDATE satellites SET category = 'station' WHERE norad_id = 25544;`);

    // 5. Check orbit_history index
    await query(`CREATE INDEX IF NOT EXISTS idx_orbit_history_sat_rec ON orbit_history(satellite_id, recorded_at DESC);`);

    console.log('[Migration] Phase 2 DB Schema migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Migration] Migration failed:', err);
    process.exit(1);
  }
}

migrate();
