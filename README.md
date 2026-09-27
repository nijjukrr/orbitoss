# ORBITOPS — Space Station & Satellite Mission Control

ORBITOPS is an integrated **Space Station & Satellite Mission Control System** built for a college DBMS project. It combines real-time ISS orbital mechanics (via SGP4 propagation & CelesTrak TLE integration) with simulated onboard hardware telemetry, PostgreSQL triggers, stored procedures, ACID transactions, and an interactive React dashboard with Leaflet map tracking.

---

## 🚀 PROJECT OVERVIEW

ORBITOPS provides real-time orbital visualization, automated anomaly detection, life support module monitoring, and multi-step spacecraft command transmission.

- **Real ISS Tracking**: Retrieves live TLE data for ISS (NORAD 25544) from CelesTrak, calculates geodetic coordinates via SGP4 propagation, and renders ground tracks on Leaflet dark map tiles.
- **DBMS Automation**: PostgreSQL triggers automatically catch low battery level (<20%) or low habitat oxygen (<19%) to generate `CRITICAL` alerts and update operational states.
- **Command Lifecycle**: Transactional command pipeline tracking `CREATED` → `TRANSMITTED` → `RECEIVED` → `EXECUTED` with audit log generation.

---

## 🏗 ARCHITECTURE

```text
  ┌─────────────────────────────────────────────────────────┐
  │                 CelesTrak / TLE Feed                     │
  └────────────────────────────┬────────────────────────────┘
                               │ TLE Epoch Parsing & Cache
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │         SGP4 Orbital Propagator (orbitService.js)        │
  └────────────────────────────┬────────────────────────────┘
                               │ Lat/Lon/Alt/Vel
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │        PostgreSQL Database (Neon Cloud / Local)         │
  │  - Tables: satellites, orbit_history, alerts, commands  │
  │  - Views: v_latest_satellite_status, v_dashboard_summary│
  │  - Triggers: trg_satellite_low_battery, trg_module_o2   │
  │  - Procedures: advance_command(), resolve_alert()       │
  └────────────────────────────┬────────────────────────────┘
                               │ Express REST API (Port 5000)
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │       React + Vite Mission Control Dashboard (Port 5174)│
  │  - Leaflet Map (Ground track & wraparound handling)     │
  │  - Emergency Demo Triggers & Live Orbit Polling         │
  └─────────────────────────────────────────────────────────┘
```

---

## 🛠 TECH STACK

- **Frontend**: React 18, Vite 6, Leaflet (Dark Map Tiles), Recharts, Vanilla CSS Design Tokens
- **Backend**: Node.js, Express, `satellite.js` (SGP4 Orbital Propagator), `pg` (PostgreSQL Client), `dotenv`
- **Database**: PostgreSQL (Neon Cloud Database / Local PostgreSQL)
- **Data Integration**: CelesTrak REST API (ISS NORAD 25544 TLE Data)

---

## ⚙️ SETUP

### 1. Database Setup

Using Neon Cloud PostgreSQL:

```bash
cd backend
# Add DATABASE_URL to backend/.env
npm run db:setup
```

Or for a local PostgreSQL database:

```bash
psql -U postgres -d orbitops -f database/schema.sql
psql -U postgres -d orbitops -f database/seed.sql
```

To reset the development database at any time:

```bash
npm run db:reset
```

---

### 2. Backend Start

```bash
cd backend
npm install
npm run dev
```

The Express API starts on `http://localhost:5000`.

---

### 3. Frontend Start

```bash
cd frontend
npm install
npm run dev
```

The React Vite dashboard starts on `http://localhost:5174`.

---

## 🛰 REAL ORBITAL DATA VS SIMULATED TELEMETRY

- **REAL ORBITAL DATA**: Used exclusively for ISS (`SAT-01`, NORAD ID 25544). Updated via CelesTrak TLEs and SGP4 math. Position calculations (Latitude, Longitude, Altitude ~420 km, Velocity ~7.67 km/s) represent physical spacecraft motion.
- **SIMULATED TELEMETRY**: Onboard spacecraft environment variables (Battery %, Thermal Temperature °C, Solar Output kW, Signal Quality %) are synthetic parameters designed to demonstrate PostgreSQL trigger logic and telemetry history charts.

---

## 📊 DBMS FEATURES

- **Triggers**:
  - `trg_satellite_low_battery`: Fired on `satellite_telemetry` insert (`battery_pct < 20`).
  - `trg_module_low_oxygen`: Fired on `station_telemetry` insert (`oxygen_pct < 19`).
- **Stored Procedures**:
  - `advance_command(p_command_id, p_status, p_note)`: Transactional state machine.
  - `resolve_alert(p_alert_id, p_user_id)`: Resolves alert, restores nominal status, writes audit log.
- **Views**:
  - `v_latest_satellite_status`, `v_dashboard_summary`, `v_unresolved_alerts`, `v_station_resource_status`, `v_system_events`.

---

## 🎬 DEMO FLOW & VIVA PRESENTATION

See [`docs/demo-script.md`](docs/demo-script.md) for the 5–7 minute presentation sequence designed for DBMS viva evaluations.

---

## 🔍 TROUBLESHOOTING

- **Port Conflict**: Ensure backend is running on `port 5000` and frontend on `port 5174`.
- **Database Connection Error**: Verify `DATABASE_URL` in `backend/.env` has correct SSL settings (`?sslmode=require`).
- **Offline / Stale Orbit Warning**: If CelesTrak is unreachable, the system automatically falls back to cached TLE data with reliability tags without crashing.
