import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM v_latest_satellite_status ORDER BY code');
    res.json(result.rows);
  } catch (error) { next(error); }
});

router.get('/:code', async (req, res, next) => {
  try {
    const satellite = await query('SELECT * FROM v_latest_satellite_status WHERE code = $1', [req.params.code.toUpperCase()]);
    if (!satellite.rowCount) return res.status(404).json({ message: 'Satellite not found' });
    const [history, components, orbit] = await Promise.all([
      query(`SELECT recorded_at, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct
             FROM satellite_telemetry WHERE satellite_id = $1 ORDER BY recorded_at ASC LIMIT 50`, [satellite.rows[0].satellite_id]),
      query('SELECT name, status FROM satellite_components WHERE satellite_id = $1 ORDER BY name', [satellite.rows[0].satellite_id]),
      query('SELECT recorded_at, latitude, longitude FROM orbit_history WHERE satellite_id = $1 ORDER BY recorded_at DESC LIMIT 20', [satellite.rows[0].satellite_id])
    ]);
    res.json({ satellite: satellite.rows[0], telemetry: history.rows, components: components.rows, orbit: orbit.rows });
  } catch (error) { next(error); }
});

export default router;
