import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT g.*, s.code AS connected_satellite, cs.signal_pct, cs.started_at, cs.status AS session_status
      FROM ground_stations g
      LEFT JOIN LATERAL (
        SELECT * FROM communication_sessions WHERE ground_station_id=g.ground_station_id ORDER BY started_at DESC LIMIT 1
      ) cs ON true
      LEFT JOIN satellites s ON s.satellite_id=cs.satellite_id
      ORDER BY g.code
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.get('/communications', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT cs.*, g.code AS station_code, g.city, s.code AS satellite_code, s.name AS satellite_name
      FROM communication_sessions cs
      JOIN ground_stations g ON g.ground_station_id = cs.ground_station_id
      JOIN satellites s ON s.satellite_id = cs.satellite_id
      ORDER BY cs.started_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

export default router;
