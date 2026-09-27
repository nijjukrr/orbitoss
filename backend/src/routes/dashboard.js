import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [summary, station, resources, alerts, events] = await Promise.all([
      query('SELECT * FROM v_dashboard_summary'),
      query('SELECT name, altitude_km, velocity_kms, status FROM space_stations LIMIT 1'),
      query(`SELECT name, unit, current_quantity, capacity,
                   round(current_quantity / capacity * 100, 1) AS percentage
              FROM resources ORDER BY name`),
      query(`SELECT a.alert_id, a.alert_type, a.severity, a.message, a.status, a.created_at,
                   s.code AS satellite_code, m.code AS module_code
              FROM alerts a LEFT JOIN satellites s ON s.satellite_id = a.satellite_id
              LEFT JOIN station_modules m ON m.module_id = a.module_id
              WHERE a.status <> 'RESOLVED' ORDER BY a.created_at DESC LIMIT 6`),
      query(`SELECT 'COMMAND' AS kind, c.command_type AS detail, c.created_at
              FROM commands c
              UNION ALL
              SELECT 'ALERT', a.alert_type, a.created_at FROM alerts a
              ORDER BY created_at DESC LIMIT 8`)
    ]);
    res.json({ summary: summary.rows[0], station: station.rows[0], resources: resources.rows, alerts: alerts.rows, events: events.rows });
  } catch (error) { next(error); }
});

export default router;
