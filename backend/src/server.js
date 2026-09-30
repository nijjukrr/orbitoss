// ORBITOPS Express Server
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { query } from './db.js';
import dashboard from './routes/dashboard.js';
import satellites from './routes/satellites.js';
import alerts from './routes/alerts.js';
import commands from './routes/commands.js';
import simulator from './routes/simulator.js';
import station from './routes/station.js';
import crew from './routes/crew.js';
import experiments from './routes/experiments.js';
import groundStations from './routes/groundStations.js';
import orbits from './routes/orbits.js';
import astronauts from './routes/astronauts.js';
import { recordOrbitSnapshotProcess } from './services/orbitService.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const dbTest = await query('SELECT 1 AS ok');
    if (dbTest.rowCount) dbStatus = 'connected';
  } catch (err) {
    console.error('Health DB check failed:', err);
    dbStatus = 'error';
  }

  res.json({
    success: true,
    service: 'orbitops-api',
    status: 'ok',
    backend: 'online',
    database: dbStatus,
    orbitService: 'live',
    celestrak: 'live'
  });
});

app.use('/api/dashboard', dashboard);
app.use('/api/satellites', satellites);
app.use('/api/alerts', alerts);
app.use('/api/commands', commands);
app.use('/api/simulator', simulator);
app.use('/api/station', station);
app.use('/api/crew', crew);
app.use('/api/experiments', experiments);
app.use('/api/ground-stations', groundStations);
app.use('/api/orbits', orbits);
app.use('/api/astronauts', astronauts);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, error: error.message || 'Internal server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`ORBITOPS API listening on http://localhost:${port}`);
  
  // Set up 5-minute periodic orbit snapshot background timer
  setInterval(async () => {
    try {
      const count = await recordOrbitSnapshotProcess();
      console.log(`[OrbitSnapshotProcess] Recorded ${count} orbit snapshots at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('[OrbitSnapshotProcess] Error:', err);
    }
  }, 5 * 60 * 1000);
});
