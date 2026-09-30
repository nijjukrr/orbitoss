import { Router } from 'express';
import { query } from '../db.js';
import { syncCelestrakCatalog } from '../services/celestrakService.js';
import { calculateCurrentOrbit, recordOrbitSnapshotProcess } from '../services/orbitService.js';

const router = Router();

/**
 * Helper to resolve satellite by ID, NORAD ID, or Code.
 */
async function findSatellite(param) {
  if (!param) return null;

  // Check if integer (norad_id)
  const isInt = /^\d+$/.test(param);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);

  let res;
  if (isInt) {
    res = await query('SELECT * FROM satellites WHERE norad_id = $1 OR code = $1', [parseInt(param, 10)]);
  } else if (isUuid) {
    res = await query('SELECT * FROM satellites WHERE satellite_id = $1', [param]);
  } else {
    res = await query('SELECT * FROM satellites WHERE code = $1 OR UPPER(name) = $2', [param.toUpperCase(), param.toUpperCase()]);
  }

  return res.rowCount ? res.rows[0] : null;
}

/**
 * POST /api/satellites/sync
 * Syncs configured CelesTrak satellite groups into PostgreSQL.
 */
router.post('/sync', async (_req, res, next) => {
  try {
    const result = await syncCelestrakCatalog();
    // Run an immediate orbit snapshot after sync to record orbit history
    await recordOrbitSnapshotProcess();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellites
 * List satellites with optional ?category= and ?search= filters.
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let sql = 'SELECT satellite_id, satellite_id AS id, norad_id, name, category, status, last_tle_sync, tle_epoch, tle_line1, tle_line2, created_at, updated_at FROM satellites WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category.toLowerCase());
      sql += ` AND LOWER(category) = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR norad_id::text ILIKE $${params.length})`;
    }

    sql += ' ORDER BY CASE WHEN category = \'station\' THEN 1 WHEN norad_id = 25544 THEN 2 ELSE 3 END, name ASC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellites/:id
 * Retrieve basic satellite details.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sat = await findSatellite(req.params.id);
    if (!sat) {
      return res.status(404).json({ success: false, error: 'Satellite not found' });
    }

    res.json({
      success: true,
      data: {
        ...sat,
        id: sat.satellite_id
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellites/:id/position
 * Calculates current real-time satellite position using satellite.js SGP4 propagation.
 */
router.get('/:id/position', async (req, res, next) => {
  try {
    const sat = await findSatellite(req.params.id);
    if (!sat) {
      return res.status(404).json({ success: false, error: 'Satellite not found' });
    }

    const position = await calculateCurrentOrbit(sat);
    res.json(position);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellites/:id/orbit (Alias for position)
 */
router.get('/:id/orbit', async (req, res, next) => {
  try {
    const sat = await findSatellite(req.params.id);
    if (!sat) {
      return res.status(404).json({ success: false, error: 'Satellite not found' });
    }

    const position = await calculateCurrentOrbit(sat);
    res.json({ success: true, data: position });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/satellites/:id/orbit-history
 * Returns historical position snapshots for the requested satellite.
 * Optional query parameter ?hours=1|6|24 (Default: 6)
 */
router.get('/:id/orbit-history', async (req, res, next) => {
  try {
    const sat = await findSatellite(req.params.id);
    if (!sat) {
      return res.status(404).json({ success: false, error: 'Satellite not found' });
    }

    const hours = Math.max(1, Math.min(168, parseInt(req.query.hours || '6', 10)));

    const result = await query(
      `SELECT recorded_at, latitude, longitude, altitude_km, velocity_kms, velocity_kms AS velocity_km_s, source
       FROM orbit_history 
       WHERE satellite_id = $1 AND recorded_at >= NOW() - ($2 || ' hours')::INTERVAL 
       ORDER BY recorded_at ASC`,
      [sat.satellite_id, hours]
    );

    res.json({
      success: true,
      satellite_id: sat.satellite_id,
      norad_id: sat.norad_id,
      hours: hours,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
