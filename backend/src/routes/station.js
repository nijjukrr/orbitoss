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
      query('SELECT name, unit, current_quantity, capacity, round(current_quantity/capacity*100,1) AS percentage FROM resources ORDER BY name')
    ]);
    res.json({ station: station.rows[0], modules: modules.rows, resources: resources.rows });
  } catch (error) { next(error); }
});
export default router;
