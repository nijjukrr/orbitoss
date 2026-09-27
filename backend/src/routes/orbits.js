import { Router } from 'express';
import { query } from '../db.js';
import { calculateCurrentOrbit, recordOrbitSnapshot } from '../services/orbitService.js';

const router = Router();

router.post('/update', async (_req, res, next) => {
  try {
    const satellites = await query('SELECT * FROM satellites');
    const updated = [];
    for (const sat of satellites.rows) {
      const snapshot = await recordOrbitSnapshot(sat.satellite_id);
      if (snapshot) {
        updated.push({ code: sat.code, ...snapshot });
      }
    }
    res.json({ success: true, data: { count: updated.length, snapshots: updated } });
  } catch (error) { next(error); }
});

router.get('/live', async (_req, res, next) => {
  try {
    const satellites = await query('SELECT * FROM satellites ORDER BY code');
    const orbits = await Promise.all(satellites.rows.map(s => calculateCurrentOrbit(s)));
    res.json({ success: true, data: orbits });
  } catch (error) { next(error); }
});

export default router;
