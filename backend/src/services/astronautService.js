import { query } from '../db.js';

/**
 * Service to sync astronaut data from The Space Devs Launch Library 2 (LL2) API
 * into PostgreSQL astronauts table.
 */
export async function syncAstronautsFromLL2() {
  const baseUrl = process.env.LL2_BASE_URL || 'https://lldev.thespacedevs.com';
  const endpoint = `${baseUrl}/2.3.0/astronauts/?in_space=true&is_human=true&mode=normal&limit=100&format=json`;

  console.log(`[AstronautSync] Fetching LL2 data from: ${endpoint}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ORBITOPS-MissionControl/1.0',
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('LL2 API request timed out after 15 seconds');
    }
    throw new Error(`LL2 API network failure: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`LL2 API returned HTTP status ${response.status}: ${errText.slice(0, 200)}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Malformed JSON returned from LL2 API: ${err.message}`);
  }

  const results = data.results;
  if (!Array.isArray(results)) {
    throw new Error('Invalid LL2 response format: results field is missing or not an array');
  }

  let upsertedCount = 0;
  const syncedRecords = [];

  for (const item of results) {
    if (!item.id) continue;

    const externalId = parseInt(item.id, 10);
    const name = item.name || 'Unknown Astronaut';
    const status = typeof item.status === 'object' ? item.status?.name : (item.status || null);
    const agencyId = item.agency?.id || null;
    const agencyName = item.agency?.name || null;
    const agencyAbbrev = item.agency?.abbrev || null;
    const imageUrl = item.image?.image_url || (typeof item.image === 'string' ? item.image : null);
    const thumbnailUrl = item.image?.thumbnail_url || null;
    const inSpace = item.in_space ?? true;
    const timeInSpace = item.time_in_space || null;
    const age = item.age || null;
    
    let nationality = null;
    if (Array.isArray(item.nationality)) {
      nationality = item.nationality
        .map(n => (typeof n === 'string' ? n : (n.name || n.nationality_name || '')))
        .filter(Boolean)
        .join(', ');
    } else if (typeof item.nationality === 'string') {
      nationality = item.nationality;
    }

    const bio = item.bio || null;
    const firstFlight = item.first_flight ? new Date(item.first_flight).toISOString() : null;
    const lastFlight = item.last_flight ? new Date(item.last_flight).toISOString() : null;
    const flightsCount = typeof item.flights_count === 'number' ? item.flights_count : 0;
    const landingsCount = typeof item.landings_count === 'number' ? item.landings_count : 0;
    const spacewalksCount = typeof item.spacewalks_count === 'number' ? item.spacewalks_count : 0;
    const sourceUrl = item.url || item.wiki || null;

    const upsertSql = `
      INSERT INTO astronauts (
        external_id, name, status, agency_id, agency_name, agency_abbrev,
        image_url, thumbnail_url, in_space, time_in_space, age, nationality,
        bio, first_flight, last_flight, flights_count, landings_count,
        spacewalks_count, source_url, last_synced_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, NOW()
      )
      ON CONFLICT (external_id) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        agency_id = EXCLUDED.agency_id,
        agency_name = EXCLUDED.agency_name,
        agency_abbrev = EXCLUDED.agency_abbrev,
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        in_space = EXCLUDED.in_space,
        time_in_space = EXCLUDED.time_in_space,
        age = EXCLUDED.age,
        nationality = EXCLUDED.nationality,
        bio = EXCLUDED.bio,
        first_flight = EXCLUDED.first_flight,
        last_flight = EXCLUDED.last_flight,
        flights_count = EXCLUDED.flights_count,
        landings_count = EXCLUDED.landings_count,
        spacewalks_count = EXCLUDED.spacewalks_count,
        source_url = EXCLUDED.source_url,
        last_synced_at = NOW()
      RETURNING *;
    `;

    const values = [
      externalId, name, status, agencyId, agencyName, agencyAbbrev,
      imageUrl, thumbnailUrl, inSpace, timeInSpace, age, nationality,
      bio, firstFlight, lastFlight, flightsCount, landingsCount,
      spacewalksCount, sourceUrl
    ];

    const res = await query(upsertSql, values);
    if (res.rows.length > 0) {
      upsertedCount++;
      syncedRecords.push(res.rows[0]);
    }
  }

  const now = new Date().toISOString();
  console.log(`[AstronautSync] Successfully upserted ${upsertedCount} astronauts out of ${results.length} received.`);

  return {
    success: true,
    source: 'The Space Devs LL2',
    received: results.length,
    upserted: upsertedCount,
    synced_at: now
  };
}

/**
 * Get all astronauts currently in space ordered by name.
 */
export async function getAstronautsInSpace() {
  const sql = `
    SELECT * FROM astronauts
    WHERE in_space = true
    ORDER BY name ASC;
  `;
  const result = await query(sql);
  return result.rows;
}

/**
 * Get single astronaut by database primary key id or external_id
 */
export async function getAstronautById(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;

  const sql = `
    SELECT * FROM astronauts
    WHERE id = $1 OR external_id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [numId]);
  return result.rows[0] || null;
}
