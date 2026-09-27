import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const state = req.query.status || 'OPEN';
    const result = await query(
      `SELECT a.*, s.code AS satellite_code, m.code AS module_code
       FROM alerts a
       LEFT JOIN satellites s ON s.satellite_id=a.satellite_id
       LEFT JOIN station_modules m ON m.module_id=a.module_id
       WHERE ($1 = 'ALL' OR a.status::text = $1)
       ORDER BY a.created_at DESC`,
      [state]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const alertCheck = await query('SELECT * FROM alerts WHERE alert_id = $1', [req.params.id]);
    if (!alertCheck.rowCount) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    const operator = await query("SELECT user_id FROM users WHERE email='maya@orbitops.demo'");
    const userId = operator.rowCount ? operator.rows[0].user_id : null;

    await query('SELECT resolve_alert($1, $2)', [req.params.id, userId]);

    const updated = await query('SELECT * FROM alerts WHERE alert_id = $1', [req.params.id]);
    res.json({ success: true, data: updated.rows[0] });
  } catch (error) { next(error); }
});

export default router;
