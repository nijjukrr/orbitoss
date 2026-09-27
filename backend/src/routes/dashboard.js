import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [summary, station, resources, alerts, events] = await Promise.all([
      query('SELECT * FROM v_dashboard_summary'),
      query('SELECT name, altitude_km, velocity_kms, status FROM space_stations LIMIT 1'),
      query('SELECT * FROM v_station_resource_status'),
      query('SELECT * FROM v_unresolved_alerts LIMIT 6'),
      query('SELECT * FROM v_system_events LIMIT 8')
    ]);
    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        station: station.rows[0],
        resources: resources.rows,
        alerts: alerts.rows,
        events: events.rows
      }
    });
  } catch (error) { next(error); }
});

export default router;
