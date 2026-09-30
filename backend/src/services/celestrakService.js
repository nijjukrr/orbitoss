import { query } from '../db.js';
import { parseTleEpoch } from './orbitService.js';

export const CELESTRAK_GROUPS = [
  { group: 'stations', category: 'station' },
  { group: 'gps-ops', category: 'gps' },
  { group: 'glo-ops', category: 'glonass' },
  { group: 'galileo', category: 'galileo' },
  { group: 'geo', category: 'geo' }
];

/**
 * Parses raw TLE text into structured satellite objects.
 * Format:
 * Name
 * 1 XXXXX ...
 * 2 XXXXX ...
 */
export function parseTleContent(tleText, category) {
  if (!tleText) return [];

  const rawLines = tleText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const satellites = [];

  let i = 0;
  while (i < rawLines.length) {
    const currentLine = rawLines[i];
    
    if (currentLine.startsWith('1 ') && i + 1 < rawLines.length && rawLines[i + 1].startsWith('2 ')) {
      const line1 = currentLine;
      const line2 = rawLines[i + 1];
      
      let name = 'UNKNOWN SATELLITE';
      if (i > 0 && !rawLines[i - 1].startsWith('1 ') && !rawLines[i - 1].startsWith('2 ')) {
        name = rawLines[i - 1];
      }

      const noradStr = line1.substring(2, 7).trim();
      const noradId = parseInt(noradStr, 10);

      if (!isNaN(noradId) && noradId > 0) {
        const epoch = parseTleEpoch(line1);
        satellites.push({
          norad_id: noradId,
          name: name,
          category: category,
          tle_line1: line1,
          tle_line2: line2,
          tle_epoch: epoch ? epoch.toISOString() : null,
          tle_source: 'CELESTRAK'
        });
      }

      i += 2;
    } else {
      i++;
    }
  }

  return satellites;
}

/**
 * Fetches TLE data for a specific CelesTrak group.
 */
export async function fetchGroupTle(group, category) {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[celestrakService] HTTP ${response.status} fetching group ${group}`);
      return [];
    }

    const text = await response.text();
    return parseTleContent(text, category);
  } catch (err) {
    console.error(`[celestrakService] Failed to fetch CelesTrak group ${group}:`, err.message);
    return [];
  }
}

/**
 * Upserts a batch of satellite records efficiently.
 */
async function upsertBatch(satellitesBatch) {
  if (!satellitesBatch || satellitesBatch.length === 0) return 0;

  const valueRows = [];
  const queryParams = [];

  satellitesBatch.forEach((sat, idx) => {
    const baseIdx = idx * 7;
    valueRows.push(
      `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, 'NOMINAL', $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7}, NOW(), 'REAL', NOW())`
    );
    queryParams.push(
      sat.norad_id,
      sat.name,
      sat.category,
      sat.tle_line1,
      sat.tle_line2,
      sat.tle_epoch,
      sat.tle_source
    );
  });

  const sql = `
    INSERT INTO satellites (
      norad_id, name, category, status, tle_line1, tle_line2, tle_epoch, tle_source, last_tle_sync, orbital_source, updated_at
    ) VALUES ${valueRows.join(', ')}
    ON CONFLICT (norad_id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      tle_line1 = EXCLUDED.tle_line1,
      tle_line2 = EXCLUDED.tle_line2,
      tle_epoch = EXCLUDED.tle_epoch,
      tle_source = EXCLUDED.tle_source,
      last_tle_sync = NOW(),
      orbital_source = 'REAL',
      updated_at = NOW()
  `;

  const res = await query(sql, queryParams);
  return res.rowCount || satellitesBatch.length;
}

/**
 * Syncs all configured CelesTrak satellite groups to PostgreSQL.
 * Fetches groups concurrently, deduplicates by NORAD ID, and UPSERTs in fast batches.
 */
export async function syncCelestrakCatalog() {
  const startTime = new Date();
  
  // 1. Fetch all CelesTrak groups concurrently
  const fetchResults = await Promise.all(
    CELESTRAK_GROUPS.map(item => fetchGroupTle(item.group, item.category))
  );

  let totalReceived = 0;
  const uniqueMap = new Map();

  fetchResults.forEach(parsed => {
    totalReceived += parsed.length;
    for (const sat of parsed) {
      if (!uniqueMap.has(sat.norad_id)) {
        uniqueMap.set(sat.norad_id, sat);
      }
    }
  });

  const uniqueSats = Array.from(uniqueMap.values());
  let upsertedCount = 0;

  // 2. Batch upsert in chunks of 50 items
  const BATCH_SIZE = 50;
  for (let i = 0; i < uniqueSats.length; i += BATCH_SIZE) {
    const batch = uniqueSats.slice(i, i + BATCH_SIZE);
    try {
      const count = await upsertBatch(batch);
      upsertedCount += count;
    } catch (err) {
      console.error(`[celestrakService] Error in batch upsert (${i} - ${i + batch.length}):`, err.message);
      // Fallback: try individual inserts if batch fails
      for (const sat of batch) {
        try {
          await upsertBatch([sat]);
          upsertedCount++;
        } catch (singleErr) {
          console.error(`[celestrakService] Single upsert failed for NORAD ${sat.norad_id}:`, singleErr.message);
        }
      }
    }
  }

  return {
    success: true,
    groups: CELESTRAK_GROUPS.length,
    received: totalReceived,
    unique: uniqueSats.length,
    upserted: upsertedCount,
    synced_at: startTime.toISOString()
  };
}
