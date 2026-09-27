# ORBITOPS architecture and ER design

## Architecture

```mermaid
flowchart TB
  UI[React mission-control UI] --> API[Express REST API]
  API --> DB[(PostgreSQL)]
  SIM[Telemetry simulator] --> API
  DB --> TRG[Triggers & functions]
  TRG --> ALERT[Alerts / tasks / audit trail]
```

## Core relationships

```mermaid
erDiagram
  MISSIONS ||--o{ MISSION_CREW : includes
  CREW_MEMBERS ||--o{ MISSION_CREW : assigned_to
  CREW_MEMBERS ||--o{ CREW_TASKS : owns
  SPACE_STATIONS ||--o{ STATION_MODULES : contains
  STATION_MODULES ||--o{ STATION_TELEMETRY : reports
  STATION_MODULES ||--o{ MAINTENANCE_LOGS : receives
  CREW_MEMBERS ||--o{ EXPERIMENTS : leads
  SATELLITES ||--o{ SATELLITE_TELEMETRY : reports
  SATELLITES ||--o{ ORBIT_HISTORY : has
  SATELLITES ||--o{ COMMANDS : receives
  GROUND_STATIONS ||--o{ COMMUNICATION_SESSIONS : hosts
  SATELLITES ||--o{ COMMUNICATION_SESSIONS : connects
  COMMANDS ||--o{ COMMAND_LOGS : records
  ALERTS }o--|| SATELLITES : may_target
  ALERTS }o--|| STATION_MODULES : may_target
```

## Design choices

- `alerts` can point to either a satellite or a station module. A check constraint prevents both targets at once.
- Raw telemetry is kept separate from the latest operational summary; views calculate the dashboard summary.
- Mission-to-crew is many-to-many through `mission_crew`.
- Command state changes are immutable rows in `command_logs`.
- The trigger only creates one open alert per target/type, avoiding alert spam.

## Build phases

1. **Database core** — schema, seed records, trigger-driven alerts, useful views.
2. **Backend** — REST endpoints, transaction for command creation and deterministic telemetry simulator.
3. **Frontend** — Dashboard, Station, Crew, Experiments, Satellites, Ground Stations, Command Center and Alerts.
4. **Demo polish** — role login, responsive layout, test script, screenshots, viva explanation.
