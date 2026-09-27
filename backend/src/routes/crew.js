import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT c.crew_id, c.full_name, c.nationality, c.status, c.joined_on, cr.title AS role,
      count(t.task_id) FILTER (WHERE t.status <> 'COMPLETED') AS open_tasks,
      count(t.task_id) FILTER (WHERE t.status = 'COMPLETED') AS completed_tasks
      FROM crew_members c JOIN crew_roles cr ON cr.crew_role_id=c.crew_role_id
      LEFT JOIN crew_tasks t ON t.crew_id=c.crew_id GROUP BY c.crew_id, cr.title ORDER BY cr.title
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.get('/tasks', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT t.*, c.full_name AS assignee, m.name AS module_name
      FROM crew_tasks t JOIN crew_members c ON c.crew_id=t.crew_id
      LEFT JOIN station_modules m ON m.module_id=t.module_id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const { crewId, moduleId, title, priority = 'INFO', dueAt } = req.body;
    if (!crewId || !title) return res.status(400).json({ success: false, error: 'crewId and title required' });
    const result = await query(`
      INSERT INTO crew_tasks(crew_id, module_id, title, priority, due_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [crewId, moduleId || null, title, priority, dueAt || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
});

export default router;
