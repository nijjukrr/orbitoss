import { Router } from 'express';
import { db, query } from '../db.js';
import { calculateCurrentOrbit, recordOrbitSnapshot } from '../services/orbitService.js';

const router = Router();
const allowedCommands = new Set(['SAFE_MODE', 'RESTART_PAYLOAD', 'ORIENTATION_CHANGE', 'REQUEST_TELEMETRY']);

router.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM v_latest_satellite_status ORDER BY code');
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const param = req.params.id.toUpperCase();
    const satellite = await query(
      'SELECT * FROM v_latest_satellite_status WHERE code = $1 OR satellite_id::text = $1',
      [param]
    );
    if (!satellite.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });
    const satId = satellite.rows[0].satellite_id;

    const [history, components, orbitHistory, liveOrbit] = await Promise.all([
      query(`SELECT recorded_at, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct
             FROM satellite_telemetry WHERE satellite_id = $1 ORDER BY recorded_at ASC LIMIT 50`, [satId]),
      query('SELECT name, status FROM satellite_components WHERE satellite_id = $1 ORDER BY name', [satId]),
      query('SELECT recorded_at, latitude, longitude, altitude_km, velocity_kms, source FROM orbit_history WHERE satellite_id = $1 ORDER BY recorded_at DESC LIMIT 30', [satId]),
      calculateCurrentOrbit(satellite.rows[0])
    ]);

    res.json({
      success: true,
      data: {
        satellite: satellite.rows[0],
        telemetry: history.rows,
        components: components.rows,
        orbit: liveOrbit,
        orbitHistory: orbitHistory.rows
      }
    });
  } catch (error) { next(error); }
});

router.get('/:id/orbit', async (req, res, next) => {
  try {
    const param = req.params.id.toUpperCase();
    const sat = await query('SELECT * FROM satellites WHERE code = $1 OR satellite_id::text = $1', [param]);
    if (!sat.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });

    const orbit = await calculateCurrentOrbit(sat.rows[0]);
    res.json({ success: true, data: orbit });
  } catch (error) { next(error); }
});

router.get('/:id/orbit-history', async (req, res, next) => {
  try {
    const param = req.params.id.toUpperCase();
    const sat = await query('SELECT satellite_id FROM satellites WHERE code = $1 OR satellite_id::text = $1', [param]);
    if (!sat.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });

    const orbit = await query(
      `SELECT recorded_at, latitude, longitude, altitude_km, velocity_kms, source
       FROM orbit_history WHERE satellite_id = $1 ORDER BY recorded_at DESC LIMIT 50`,
      [sat.rows[0].satellite_id]
    );
    res.json({ success: true, data: orbit.rows });
  } catch (error) { next(error); }
});

router.get('/:id/telemetry', async (req, res, next) => {
  try {
    const param = req.params.id.toUpperCase();
    const sat = await query('SELECT satellite_id FROM satellites WHERE code = $1 OR satellite_id::text = $1', [param]);
    if (!sat.rowCount) return res.status(404).json({ success: false, error: 'Satellite not found' });
    
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    const telemetry = await query(
      `SELECT recorded_at, altitude_km, velocity_kms, battery_pct, solar_output_kw, temperature_c, signal_pct
       FROM satellite_telemetry WHERE satellite_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
      [sat.rows[0].satellite_id, limit]
    );
    res.json({ success: true, data: telemetry.rows });
  } catch (error) { next(error); }
});

router.post('/:id/commands', async (req, res, next) => {
  const { commandType, parameters = {} } = req.body;
  if (!allowedCommands.has(commandType)) {
    return res.status(400).json({ success: false, error: 'Provide a valid commandType' });
  }

  const param = req.params.id.toUpperCase();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const sat = await client.query('SELECT satellite_id, code FROM satellites WHERE code = $1 OR satellite_id::text = $1', [param]);
    if (!sat.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Satellite not found' });
    }

    const operator = await client.query("SELECT user_id FROM users WHERE email='maya@orbitops.demo'");
    const userId = operator.rowCount ? operator.rows[0].user_id : null;

    const command = await client.query(
      `INSERT INTO commands(satellite_id, created_by, command_type, parameters)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sat.rows[0].satellite_id, userId, commandType, parameters]
    );

    await client.query(
      `INSERT INTO command_logs(command_id, status, note) VALUES ($1, 'CREATED', 'Operator created command via satellite endpoint')`,
      [command.rows[0].command_id]
    );

    await client.query(
      'INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'CREATE_COMMAND', 'COMMAND', command.rows[0].command_id, JSON.stringify({ satelliteCode: sat.rows[0].code, commandType })]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: command.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

export default router;
