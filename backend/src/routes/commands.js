import { Router } from 'express';
import { db, query } from '../db.js';

const router = Router();
const allowed = new Set(['SAFE_MODE', 'RESTART_PAYLOAD', 'ORIENTATION_CHANGE', 'REQUEST_TELEMETRY']);

router.post('/', async (req, res, next) => {
  const { satelliteCode, commandType, parameters = {} } = req.body;
  if (!satelliteCode || !allowed.has(commandType)) return res.status(400).json({ message: 'Provide a valid satelliteCode and commandType' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const sat = await client.query('SELECT satellite_id FROM satellites WHERE code = $1', [satelliteCode.toUpperCase()]);
    if (!sat.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Satellite not found' }); }
    const operator = await client.query("SELECT user_id FROM users WHERE email='maya@orbitops.demo'");
    const command = await client.query(`INSERT INTO commands(satellite_id, created_by, command_type, parameters)
      VALUES ($1, $2, $3, $4) RETURNING *`, [sat.rows[0].satellite_id, operator.rows[0].user_id, commandType, parameters]);
    await client.query(`INSERT INTO command_logs(command_id, status, note) VALUES ($1, 'CREATED', 'Operator created command')`, [command.rows[0].command_id]);
    await client.query('INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)', [operator.rows[0].user_id, 'CREATE', 'COMMAND', command.rows[0].command_id, JSON.stringify({ satelliteCode, commandType })]);
    await client.query('COMMIT');
    res.status(201).json(command.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); next(error); }
  finally { client.release(); }
});

router.post('/:id/advance', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['TRANSMITTED', 'RECEIVED', 'EXECUTED', 'FAILED'].includes(status)) return res.status(400).json({ message: 'Invalid command status' });
    await query('SELECT advance_command($1, $2::command_status, $3)', [req.params.id, status, note || null]);
    const updated = await query('SELECT * FROM commands WHERE command_id = $1', [req.params.id]);
    if (!updated.rowCount) return res.status(404).json({ message: 'Command not found' });
    if (status === 'EXECUTED' && updated.rows[0].command_type === 'SAFE_MODE') {
      await query(`UPDATE satellites SET status = 'WARNING' WHERE satellite_id = $1`, [updated.rows[0].satellite_id]);
      await query(`UPDATE alerts SET status = 'RESOLVED', resolved_at = now()
        WHERE satellite_id = $1 AND alert_type = 'LOW_BATTERY' AND status <> 'RESOLVED'`, [updated.rows[0].satellite_id]);
    }
    res.json(updated.rows[0]);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [command, logs] = await Promise.all([query('SELECT * FROM commands WHERE command_id=$1', [req.params.id]), query('SELECT status, note, logged_at FROM command_logs WHERE command_id=$1 ORDER BY logged_at', [req.params.id])]);
    if (!command.rowCount) return res.status(404).json({ message: 'Command not found' });
    res.json({ command: command.rows[0], logs: logs.rows });
  } catch (error) { next(error); }
});

export default router;
