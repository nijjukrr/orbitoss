import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const state = req.query.status || 'OPEN';
    const result = await query(`SELECT a.*, s.code AS satellite_code, m.code AS module_code
      FROM alerts a LEFT JOIN satellites s ON s.satellite_id=a.satellite_id
      LEFT JOIN station_modules m ON m.module_id=a.module_id
      WHERE ($1 = 'ALL' OR a.status::text = $1) ORDER BY a.created_at DESC`, [state]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const result = await query(`UPDATE alerts SET status = 'RESOLVED', resolved_at = now()
      WHERE alert_id = $1 AND status <> 'RESOLVED' RETURNING *`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Open alert not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

export default router;
