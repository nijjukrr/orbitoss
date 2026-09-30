import { Router } from 'express';
import {
  syncAstronautsFromLL2,
  getAstronautsInSpace,
  getAstronautById
} from '../services/astronautService.js';

const router = Router();

/**
 * GET /api/astronauts/in-space
 * Reads astronauts currently in space strictly from PostgreSQL.
 */
router.get('/in-space', async (_req, res, next) => {
  try {
    const astronauts = await getAstronautsInSpace();
    res.json({
      success: true,
      count: astronauts.length,
      data: astronauts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/astronauts/:id
 * Fetches a single astronaut record from PostgreSQL by ID or external_id.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'in-space' || id === 'sync') return next(); // Fallthrough safety if routes match order

    const astronaut = await getAstronautById(id);
    if (!astronaut) {
      return res.status(404).json({
        success: false,
        error: `Astronaut with ID '${id}' not found`
      });
    }

    res.json({
      success: true,
      data: astronaut
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/astronauts/sync
 * Triggers backend sync from LL2 API into PostgreSQL.
 */
router.post('/sync', async (_req, res, next) => {
  try {
    const result = await syncAstronautsFromLL2();
    res.json(result);
  } catch (error) {
    console.error('Error during astronaut sync:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync astronaut data from Space Devs LL2 API'
    });
  }
});

export default router;
