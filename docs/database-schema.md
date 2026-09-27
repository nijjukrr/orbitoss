# ORBITOPS — Database Schema & Architecture

## Overview
ORBITOPS utilizes a normalized PostgreSQL relational database (3NF) designed for high-concurrency telemetry logging, satellite command uplink processing, space station module monitoring, crew management, and experiment auditing.

---

## Entity Relationship Summary

```
[roles] 1 ─── < user_roles > ─── N [users]
  │                                  │
  └─── 1:N ──────────────────────────┴─── 1:N ─── [commands] ─── 1:N ─── [command_logs]
                                                    │
[missions] 1 ─── 1:N ─── [satellites] ──────────────┴─── 1:N ─── [satellite_telemetry]
   │                         │
   │                         ├─── 1:N ─── [satellite_components]
   │                         ├─── 1:N ─── [orbit_history]
   │                         └─── 1:N ─── [communication_sessions] ─── N:1 ─── [ground_stations]
   │
   └─── 1:N ─── [space_stations] 1 ─── 1:N ─── [station_modules]
                     │                             │
                     ├─── 1:N ─── [resources]      ├─── 1:N ─── [station_telemetry]
                     │              │              ├─── 1:N ─── [crew_tasks]
                     │              └─── 1:N       ├─── 1:N ─── [maintenance_logs]
                     │            [resource_usage] └─── 1:N ─── [experiments] ─── 1:N ─── [experiment_results]
                     │                                                                └─── 1:N ─── [experiment_logs]
                     └─── 1:N ─── [incidents]
```

---

## Detailed Table Dictionary

### 1. AUTH Domain

#### `roles`
Defines operational access roles across the platform.
- `role_id` (UUID, Primary Key)
- `name` (TEXT, Unique, Check: `'ADMIN'`, `'MISSION_CONTROLLER'`, `'CREW'`, `'RESEARCHER'`, `'VIEWER'`)

#### `users`
System operators and crew login accounts.
- `user_id` (UUID, Primary Key)
- `role_id` (UUID, Foreign Key -> `roles.role_id`)
- `full_name` (TEXT, Not Null)
- `email` (TEXT, Unique, Not Null)
- `password_hash` (TEXT, Not Null)
- `created_at` (TIMESTAMPTZ, Default `now()`)

#### `user_roles`
Junction table enabling fine-grained multi-role assignment.
- `user_id` (UUID, Foreign Key -> `users.user_id` ON DELETE CASCADE)
- `role_id` (UUID, Foreign Key -> `roles.role_id` ON DELETE CASCADE)
- Primary Key: `(user_id, role_id)`

---

### 2. MISSIONS & SPACE STATION Domain

#### `missions`
Tracks space missions and mission timelines.
- `mission_id` (UUID, Primary Key)
- `code` (TEXT, Unique, Not Null)
- `name` (TEXT, Not Null)
- `start_date` (DATE, Not Null)
- `end_date` (DATE)
- `status` (ENUM: `operational_status`)

#### `space_stations`
Space habitats deployed on missions.
- `station_id` (UUID, Primary Key)
- `mission_id` (UUID, Foreign Key -> `missions.mission_id`)
- `name` (TEXT, Unique, Not Null)
- `altitude_km` (NUMERIC(7,2), Check `> 0`)
- `velocity_kms` (NUMERIC(5,2), Check `> 0`)
- `status` (ENUM: `operational_status`)

#### `station_modules`
Individual pressurized & lab modules forming the habitat.
- `module_id` (UUID, Primary Key)
- `station_id` (UUID, Foreign Key -> `space_stations.station_id`)
- `code` (TEXT, Unique, Not Null)
- `name` (TEXT, Not Null)
- `module_type` (TEXT, Not Null)
- `status` (ENUM: `operational_status`)
- `last_maintenance_on` (DATE)

#### `station_telemetry`
Environmental sensor readings recorded per station module.
- `station_telemetry_id` (BIGSERIAL, Primary Key)
- `module_id` (UUID, Foreign Key -> `station_modules.module_id`)
- `recorded_at` (TIMESTAMPTZ, Default `now()`)
- `temperature_c` (NUMERIC(5,2))
- `pressure_kpa` (NUMERIC(6,2), Check `> 0`)
- `oxygen_pct` (NUMERIC(5,2), Check `BETWEEN 0 AND 100`)
- `co2_pct` (NUMERIC(5,3), Check `BETWEEN 0 AND 100`)
- `power_kw` (NUMERIC(6,2), Check `>= 0`)

#### `resources` & `resource_usage`
Station consumable inventories (Oxygen, Water, Power) and usage tracking.
- `resources`: `resource_id`, `station_id`, `name`, `unit`, `current_quantity`, `capacity`
- `resource_usage`: `usage_id`, `resource_id`, `quantity_used`, `logged_at`

---

### 3. CREW & RESEARCH Domain

#### `crew_roles`, `crew_members`, `mission_crew`, `crew_shifts`, `crew_tasks`
- Manages astronaut ranks, roster assignment, shift schedules, and priority tasks assigned during critical telemetry events.

#### `experiments`, `experiment_logs`, `experiment_results`
- Scientific payloads, experiment progress tracking, narrative research logs, and numerical yield data.

---

### 4. SATELLITES & COMMUNICATIONS Domain

#### `satellites`, `satellite_components`, `satellite_telemetry`, `orbit_history`
- Satellite metadata, payload component operational health, high-frequency telemetry streams (battery, altitude, velocity, temperature, signal quality), and orbital tracking coordinates.

#### `ground_stations`, `communication_sessions`
- Tracking ground stations across global locations (Bengaluru, Madrid, McMurdo) and active pass sessions.

#### `commands` & `command_logs`
- Transactional satellite uplink commands (`SAFE_MODE`, `RESTART_PAYLOAD`, `ORIENTATION_CHANGE`, `REQUEST_TELEMETRY`) and step audit trails (`CREATED` -> `TRANSMITTED` -> `RECEIVED` -> `EXECUTED`).

---

### 5. MONITORING & AUDIT Domain

#### `alerts`, `incidents`, `audit_logs`
- Automated system alerts generated by PostgreSQL triggers, operational incidents, and user action audit records.

---

## DBMS Features Summary

### Database Views
1. `v_latest_satellite_status`: Uses `DISTINCT ON (satellite_id)` to return the latest telemetry point for each satellite.
2. `v_dashboard_summary`: Aggregates active crew count, active satellite count, unresolved alert counts, and average resource health.
3. `v_unresolved_alerts`: Joins open alerts with satellite and module codes for Mission Control.
4. `v_station_resource_status`: Calculates live resource capacities and percentage remaining.
5. `v_system_events`: Consolidated union timeline across commands, alerts, maintenance, and incidents.

### Triggers & Stored Procedures
1. `trg_satellite_low_battery`: Automatically creates a `CRITICAL` alert and updates satellite status to `CRITICAL` when battery drops below 20%.
2. `trg_module_low_oxygen`: Fires when module oxygen drops below 19%, creates an alert, and auto-assigns an emergency investigation task to an available Flight Engineer.
3. `resolve_alert(p_alert_id, p_user_id)`: Atomic function to resolve alerts, restore nominal status when no open alerts remain, and record an audit log.
4. `advance_command(p_command_id, p_status, p_note)`: Advances command status and writes to `command_logs`.
