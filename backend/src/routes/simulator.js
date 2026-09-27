import { Router } from 'express';
import { query } from '../db.js';

const router = Router();
const bounded = (n, min, max) => Math.max(min, Math.min(max, n));

router.post('/tick', async (_req, res, next) => {
  try {
    const fleet = await query(`SELECT satellite_id, code, COALESCE(battery_pct, 75) AS battery_pct
      FROM v_latest_satellite_status`);
    const inserted = [];
    for (const sat of fleet.rows) {
      const drift = sat.code === 'SAT-03' ? -0.8 : (Math.random() - 0.42) * 2;
      const battery = bounded(Number(sat.battery_pct) + drift, 5, 100);
      const row = await query(`INSERT INTO satellite_telemetry(satellite_id, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING recorded_at, battery_pct`, [sat.satellite_id, 417 + Math.random() * 260, 7.62, battery, 1.5 + Math.random() * 2, 25 + Math.random() * 45, 55 + Math.random() * 40]);
      inserted.push({ code: sat.code, ...row.rows[0] });
    }
    res.json({ message: 'Telemetry tick completed', inserted });
  } catch (error) { next(error); }
});

export default router;
