# ORBITOPS — Integrated Space Station & Satellite Mission Control

College DBMS project built with **React**, **Express**, and **PostgreSQL**. It uses simulated telemetry only; no real spacecraft or external NASA API is involved.

## Core demo story

1. A simulator inserts low battery telemetry for SAT-03.
2. A PostgreSQL trigger creates a CRITICAL alert automatically.
3. An operator sends `SAFE_MODE` from Command Center.
4. Command status events are recorded and the alert is resolved.

The same alert model also handles station-module oxygen warnings.

## Folder layout

```text
orbitops/
  database/
    schema.sql       # tables, constraints, indexes, views, functions, triggers
    seed.sql         # fictional demonstration data
    queries.sql      # viva-friendly DBMS queries
  backend/           # Express REST API
  docs/
    architecture.md
```

## Database setup

Create an empty database called `orbitops`, then run:

```bash
psql -U postgres -d orbitops -f database/schema.sql
psql -U postgres -d orbitops -f database/seed.sql
psql -U postgres -d orbitops -f database/verify.sql
```

### Easier option: Neon cloud database (no local PostgreSQL)

1. Create a free project at [Neon](https://neon.tech), then use its **Connect** button to copy the PostgreSQL connection string.
2. In `backend`, copy `.env.example` to a new file called `.env`.
3. Set `DATABASE_URL=` to the Neon connection string. Never share this value.
4. Run:

```bash
cd backend
npm install
npm run db:setup
```

This imports the schema, fictional demo data, and verification checks without `psql`.

## Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000`. Main endpoints:

- `GET /api/dashboard` — mission-control cards, resources, alerts and events.
- `GET /api/satellites` and `GET /api/satellites/SAT-03` — fleet + telemetry history.
- `GET /api/alerts?status=OPEN`, `PATCH /api/alerts/:id/resolve` — alert center.
- `POST /api/commands` — transactional command creation.
- `POST /api/commands/:id/advance` — log TRANSMITTED → RECEIVED → EXECUTED.
- `POST /api/simulator/tick` — create a new telemetry point for every satellite.
- `GET /api/station`, `/api/crew`, `/api/experiments`, `/api/ground-stations` — operations pages.

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the Vite address printed in the terminal, usually `http://localhost:5173`.

## Run the full project

Open two terminals after importing the database:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

The frontend uses realistic fallback values when the API/database is unavailable, so the mission-control interface can still be presented. For the actual DBMS demonstration, run both SQL scripts and the backend.

## DBMS viva

See [`docs/viva-guide.md`](docs/viva-guide.md) for a short explanation, demo sequence and likely examiner questions.
Use [`docs/demo-checklist.md`](docs/demo-checklist.md) for your presentation run order.
