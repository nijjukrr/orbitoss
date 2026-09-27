# ORBITOPS — 5–7 Minute DBMS Viva Demonstration Script

This document outlines the step-by-step presentation sequence for demonstrating **ORBITOPS Mission Control** in a Database Management Systems (DBMS) project evaluation or viva.

---

## 🕒 Presentation Timeline & Demo Flow

### 1. Introduction & Architecture (0:00 – 1:00)
- **Goal**: Present project scope, PostgreSQL core, real SGP4 orbital mechanics, and clean architecture.
- **Actions**:
  1. Open application on `http://localhost:5174`.
  2. Explain architecture:
     ```
     CelesTrak API / Fallback TLE
                 ↓
      SGP4 Propagator (satellite.js)
                 ↓
         PostgreSQL Database (Neon Cloud / Local)
                 ↓
       Express REST API (port 5000)
                 ↓
      React Mission Control UI (port 5174)
     ```
  3. Highlight key DBMS concepts implemented: Relational Schema, Indexes, Views, Stored Functions, PostgreSQL Triggers, Audit Logs, and ACID Transactions.

---

### 2. Live Dashboard & Database Views (1:00 – 2:00)
- **Goal**: Demonstrate database views and real-time mission overview.
- **Actions**:
  1. Click **Dashboard** tab. Point out:
     - Active Crew (`SELECT count(*) FROM crew_members`)
     - Active Satellites count
     - Open Alerts count (`v_unresolved_alerts` view)
     - Station resource health percentage (`v_station_resource_status` view)
  2. Show Fleet Status grid showing satellite operational modes (`SAT-01 ISS` is tracked using **REAL SGP4 orbital mechanics**).

---

### 3. Real Orbital Tracking & Longitude Wraparound (2:00 – 3:15)
- **Goal**: Demonstrate CelesTrak TLE integration, SGP4 math, and map ground track.
- **Actions**:
  1. Click **Satellites** tab or **Open SAT-01 (ISS)** card.
  2. Point out:
     - **ORBIT STATUS BADGE**: `REAL TRACKED ISS (NORAD 25544)`
     - **DATA FRESHNESS**: `REAL ORBITAL DATA (SGP4 PROPAGATION)` with CelesTrak source label and TLE age.
     - **SEPARATION**: `REAL` SGP4 math coordinates (Latitude ~49°N, Altitude ~420 km, Velocity ~7.67 km/s) vs **SIMULATED** onboard environment telemetry.
  3. Inspect the Leaflet World Map:
     - Observe real-time position marker and polyline ground track.
     - Note antimeridian split algorithm preventing lines from wrapping horizontally across the map at $\pm 180^\circ$.
     - Observe auto-orbit refresh polling every 20s without reloading the page.

---

### 4. Station Visualization & Module Layout (3:15 – 4:00)
- **Goal**: Showcase habitat environmental telemetry stored per module.
- **Actions**:
  1. Click **Station** tab.
  2. Click on the **HABITAT MODULE (`MOD-HAB`)** card to open the **Module Inspector Modal**.
  3. Explain table design: `station_modules` and `station_telemetry` linked via foreign key `module_id`.
  4. View atmospheric pressure, oxygen %, CO2 %, power kW, and last maintenance timestamp.

---

### 5. PostgreSQL Triggers & Demo Emergency Simulation (4:00 – 5:00)
- **Goal**: Demonstrate automated DB triggers generating critical alerts upon telemetry threshold violations.
- **Actions**:
  1. In the top navigation header, click the demo trigger button **⚡ Low Battery**.
  2. Explain what happens under the hood:
     - `POST /api/simulator/emergency` inserts a record into `satellite_telemetry` with `battery_pct = 12.5%`.
     - PostgreSQL trigger `trg_satellite_low_battery` fires automatically.
     - Trigger inserts a `CRITICAL` alert into `alerts` table and updates `satellites.status = 'CRITICAL'`.
  3. Show the immediate red alert banner popping up on the UI!

---

### 6. Transactional Command Center & Stored Procedures (5:00 – 6:15)
- **Goal**: Demonstrate multi-step command state transitions inside PostgreSQL transactions and stored procedures.
- **Actions**:
  1. Click **Command Center** tab.
  2. Select target satellite `SAT-03` and command `SAFE_MODE`, then click **Transmit Command**.
  3. Show command created with ID and initial state `CREATED`.
  4. Click **Advance to TRANSMITTED**, **Advance to RECEIVED**, and **Execute Command**.
  5. Explain procedure call: `SELECT advance_command(id, status, note)` updating both `commands` and inserting audit history into `command_logs`.
  6. Show how executing `SAFE_MODE` automatically changes satellite status and prepares alert resolution.

---

### 7. Alert Resolution Procedure & Audit Trail (6:15 – 7:00)
- **Goal**: Demonstrate stored procedure `resolve_alert(alert_id, user_id)`.
- **Actions**:
  1. Click **Alerts** tab.
  2. Click **✔ Resolve Alert** on the open low battery alert.
  3. Explain stored procedure execution:
     - `alerts.status` updated to `RESOLVED` with `resolved_at = NOW()`.
     - Checks if satellite has any remaining open alerts; if none, restores `satellites.status = 'NOMINAL'`.
     - Inserts structured JSON entry into `audit_logs`.

---

## 🎯 Viva Q&A Quick Reference

1. **How do you calculate real ISS position?**
   - We fetch Two-Line Element (TLE) data for NORAD ID 25544 from CelesTrak. We parse the epoch using `parseTleEpoch()` and feed lines 1 & 2 into `satellite.js` SGP4 propagator. We convert ECI coordinates (x, y, z) into geodetic Latitude, Longitude, and Altitude.

2. **How does PostgreSQL handle real vs simulated data?**
   - Spacecraft positions store `orbital_source = 'REAL'` vs `'SIMULATED'` and `data_source = 'CELESTRAK_LIVE'`. Telemetry table clearly isolates synthetic hardware telemetry from real orbital mechanics.

3. **Where are PostgreSQL triggers used?**
   - `trg_satellite_low_battery` on `satellite_telemetry` (fires on `battery_pct < 20`).
   - `trg_module_low_oxygen` on `station_telemetry` (fires on `oxygen_pct < 19`).

4. **What database views exist?**
   - `v_latest_satellite_status`, `v_dashboard_summary`, `v_unresolved_alerts`, `v_station_resource_status`, `v_system_events`.
