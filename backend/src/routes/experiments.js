import { Router } from 'express';
import { query } from '../db.js';
const router = Router();
router.get('/', async (_req, res, next) => {
  try { const result = await query(`SELECT e.*, c.full_name AS lead_researcher, m.name AS module_name, (SELECT count(*) FROM experiment_logs l WHERE l.experiment_id=e.experiment_id) AS log_count FROM experiments e JOIN crew_members c ON c.crew_id=e.lead_crew_id JOIN station_modules m ON m.module_id=e.module_id ORDER BY e.started_on DESC`); res.json(result.rows); } catch (error) { next(error); }
});
export default router;
