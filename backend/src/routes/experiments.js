import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT e.*, c.full_name AS lead_researcher, m.name AS module_name,
             (SELECT count(*) FROM experiment_logs l WHERE l.experiment_id=e.experiment_id) AS log_count
      FROM experiments e
      JOIN crew_members c ON c.crew_id=e.lead_crew_id
      JOIN station_modules m ON m.module_id=e.module_id
      ORDER BY e.started_on DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [exp, logs, results] = await Promise.all([
      query(`
        SELECT e.*, c.full_name AS lead_researcher, m.name AS module_name
        FROM experiments e
        JOIN crew_members c ON c.crew_id=e.lead_crew_id
        JOIN station_modules m ON m.module_id=e.module_id
        WHERE e.experiment_id = $1 OR e.code = $1
      `, [req.params.id]),
      query('SELECT * FROM experiment_logs WHERE experiment_id = $1 ORDER BY logged_at DESC', [req.params.id]),
      query('SELECT * FROM experiment_results WHERE experiment_id = $1 ORDER BY recorded_at DESC', [req.params.id])
    ]);
    if (!exp.rowCount) return res.status(404).json({ success: false, error: 'Experiment not found' });
    res.json({
      success: true,
      data: {
        experiment: exp.rows[0],
        logs: logs.rows,
        results: results.rows
      }
    });
  } catch (error) { next(error); }
});

export default router;
