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
      const row = await query(
        `INSERT INTO satellite_telemetry(satellite_id, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING recorded_at, battery_pct`,
        [sat.satellite_id, 417 + Math.random() * 260, 7.62, battery, 1.5 + Math.random() * 2, 25 + Math.random() * 45, 55 + Math.random() * 40]
      );
      inserted.push({ code: sat.code, ...row.rows[0] });
    }
    res.json({ success: true, data: { message: 'Telemetry tick completed', inserted } });
  } catch (error) { next(error); }
});

router.post('/emergency', async (req, res, next) => {
  try {
    const { type } = req.body;
    if (type === 'LOW_BATTERY') {
      const sat = await query("SELECT satellite_id, code FROM satellites WHERE code = 'SAT-03' OR code = 'ISS-01' LIMIT 1");
      if (!sat.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });
      const row = await query(
        `INSERT INTO satellite_telemetry(satellite_id, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct)
         VALUES ($1, 415.0, 7.66, 12.50, 0.40, 48.0, 62.0) RETURNING *`,
        [sat.rows[0].satellite_id]
      );
      return res.json({ success: true, message: 'Inserted low battery telemetry (12.5%). DB trigger fired.', data: row.rows[0] });
    } else if (type === 'LOW_OXYGEN') {
      const mod = await query("SELECT module_id, code FROM station_modules WHERE code = 'HAB-01' OR code = 'MOD-HAB' LIMIT 1");
      if (!mod.rowCount) return res.status(404).json({ success: false, error: 'Module not found' });
      const row = await query(
        `INSERT INTO station_telemetry(module_id, temperature_c, pressure_kpa, oxygen_pct, co2_pct, power_kw)
         VALUES ($1, 22.5, 98.2, 17.20, 0.85, 3.4) RETURNING *`,
        [mod.rows[0].module_id]
      );
      return res.json({ success: true, message: 'Inserted low oxygen telemetry (17.2%). DB trigger fired.', data: row.rows[0] });
    } else if (type === 'HIGH_TEMP') {
      const sat = await query("SELECT satellite_id, code FROM satellites WHERE code = 'SAT-01' LIMIT 1");
      if (!sat.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });
      const row = await query(
        `INSERT INTO satellite_telemetry(satellite_id, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct)
         VALUES ($1, 550.0, 7.55, 18.50, 2.10, 88.5, 45.0) RETURNING *`,
        [sat.rows[0].satellite_id]
      );
      return res.json({ success: true, message: 'Inserted high temperature & critical battery telemetry (88.5°C). DB trigger fired.', data: row.rows[0] });
    } else {
      return res.status(400).json({ success: false, error: 'Unknown emergency type' });
    }
  } catch (error) { next(error); }
});

export default router;

