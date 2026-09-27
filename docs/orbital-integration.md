# ORBITOPS — Real Satellite Orbital Data Integration (Phase 3)

## Architecture Overview

ORBITOPS integrates real-world satellite orbital tracking while preserving PostgreSQL as the centralized database system. The React frontend never queries external satellite services directly. All orbital data passes through the Node.js/Express backend service, is calculated via `satellite.js`, persisted to PostgreSQL, and served via standard REST endpoints.

```text
+------------------------------------+
|  External Orbital Data Source      |
|  (CelesTrak TLE API / Local Cache) |
+------------------------------------+
                  │
                  ▼
+------------------------------------+
|  Express Backend Orbit Service     |
|  (backend/src/services/orbitService.js)|
+------------------------------------+
                  │
                  ▼
+------------------------------------+
|  satellite.js SGP4 Propagator      |
|  (Latitude, Longitude, Altitude,   |
|   Orbital Velocity Calculations)   |
+------------------------------------+
                  │
                  ▼
+------------------------------------+
|  PostgreSQL Database               |
|  (satellites, orbit_history, views)|
+------------------------------------+
                  │
                  ▼
+------------------------------------+
|  ORBITOPS REST API                 |
|  (GET /api/satellites/:id/orbit)   |
+------------------------------------+
                  │
                  ▼
+------------------------------------+
|  React Mission Control Client      |
|  (Leaflet Dark Earth Map & Track)  |
+------------------------------------+
```

---

## 1. Orbital Calculation & satellite.js

### Two-Line Element (TLE) Format
Satellites tracked in real-time use TLE data (Standard 2-line ephemeris format).
Example for **ISS (NORAD ID 25544)**:
```text
1 25544U 98067A   24095.53423984  .00014815  00000+0  26656-3 0  9993
2 25544  51.6416 295.4211 0004526 102.5857 325.2635 15.49755734447387
```

### SGP4 Propagation Algorithm
The backend calculates exact position vectors using `satellite.js`:
1. Parse TLE into satellite record: `satellite.twoline2satrec(tle1, tle2)`
2. Propagate ECI coordinates: `satellite.propagate(satrec, targetDate)`
3. Convert ECI to Geodetic coordinates (Latitude, Longitude, Height): `satellite.eciToGeodetic(positionEci, gmst)`
4. Compute scalar velocity: `sqrt(vx² + vy² + vz²)`

---

## 2. Database Schema Integration

- **`satellites` Table**:
  - `norad_id`: NORAD catalog ID (e.g., `25544` for ISS)
  - `tle_line1`, `tle_line2`: Active TLE lines
  - `tle_updated_at`: Timestamp of last TLE fetch
  - `orbital_source`: `'REAL'` or `'SIMULATED'`

- **`orbit_history` Table**:
  - Stores historical ground track coordinates (`latitude`, `longitude`, `altitude_km`, `velocity_kms`, `recorded_at`, `source`).

---

## 3. Real vs. Simulated Data Categorization

To maintain strict scientific transparency during college demonstrations:

| Category | Real Data Source | Simulated Data Source |
| :--- | :--- | :--- |
| **Real (Tracked)** | Latitude, Longitude, Altitude, Orbital Velocity (SGP4 propagated from real ISS NORAD 25544 TLE) | N/A |
| **Simulated (Demo)** | N/A | Spacecraft battery %, Solar output kW, Module oxygen/CO2, Commands, Maintenance incidents |

*Note: Simulated spacecraft health telemetry is never labeled as official NASA/ISS telemetry.*

---

## 4. Fallback & Network Fault Tolerance

If internet connectivity is unavailable or CelesTrak is unreachable:
1. `orbitService` catches the network timeout.
2. The service automatically switches to `FALLBACK_TLE_DATA` stored locally in `backend/src/services/fallbackTle.js`.
3. `satellite.js` continues calculating accurate real orbital positions offline without throwing errors or breaking Mission Control.

---

## 5. API Endpoints

- `GET /api/satellites/:id/orbit`: Returns live calculated real/simulated position.
- `GET /api/satellites/:id/orbit-history`: Returns historical ground track coordinates.
- `POST /api/orbits/update`: Forces a TLE update and saves a position snapshot to `orbit_history` in PostgreSQL.
