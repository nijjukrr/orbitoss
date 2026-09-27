import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [station, modules, resources] = await Promise.all([
      query('SELECT * FROM space_stations LIMIT 1'),
      query(`SELECT m.module_id, m.code, m.name, m.module_type, m.status, m.last_maintenance_on,
        t.temperature_c, t.pressure_kpa, t.oxygen_pct, t.co2_pct, t.power_kw
        FROM station_modules m LEFT JOIN LATERAL (
          SELECT * FROM station_telemetry WHERE module_id=m.module_id ORDER BY recorded_at DESC LIMIT 1
        ) t ON true ORDER BY m.code`),
      query('SELECT * FROM v_station_resource_status')
    ]);
    res.json({
      success: true,
      data: {
        station: station.rows[0],
        modules: modules.rows,
        resources: resources.rows
      }
    });
  } catch (error) { next(error); }
});

router.get('/modules', async (_req, res, next) => {
  try {
    const modules = await query(`
      SELECT m.*, t.temperature_c, t.pressure_kpa, t.oxygen_pct, t.co2_pct, t.power_kw, t.recorded_at AS telemetry_time
      FROM station_modules m LEFT JOIN LATERAL (
        SELECT * FROM station_telemetry WHERE module_id=m.module_id ORDER BY recorded_at DESC LIMIT 1
      ) t ON true ORDER BY m.code
    `);
    res.json({ success: true, data: modules.rows });
  } catch (error) { next(error); }
});

router.get('/telemetry', async (_req, res, next) => {
  try {
    const telemetry = await query(`
      SELECT st.*, m.code AS module_code, m.name AS module_name
      FROM station_telemetry st JOIN station_modules m ON m.module_id = st.module_id
      ORDER BY st.recorded_at DESC LIMIT 100
    `);
    res.json({ success: true, data: telemetry.rows });
  } catch (error) { next(error); }
});

export default router;
