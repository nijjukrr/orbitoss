# ORBITOPS DBMS viva guide

## 30-second project explanation

ORBITOPS is a simulated mission-control platform that centrally manages a space station and a satellite fleet. It stores crew, station modules, resources, experiments, satellite telemetry, ground-station communications, commands and alerts. PostgreSQL is used for relationships, dashboards, automatic alerts, histories and command workflows—not only CRUD screens.

## Strong demo sequence

1. Open the Dashboard and point out crew, satellite, resource and alert summaries.
2. Open **SAT-03**; show its battery history and critical state.
3. Explain that inserting low battery telemetry below 20% invokes `trg_satellite_low_battery`.
4. Show the resulting alert in Alert Center.
5. Create a `SAFE_MODE` command in Command Center.
6. Advance it through `TRANSMITTED`, `RECEIVED`, and `EXECUTED`; each change is an immutable `command_logs` row.
7. Resolve the alert after the command succeeds.

## DBMS concepts used

| Concept | ORBITOPS implementation |
| --- | --- |
| Primary / foreign keys | UUID PKs and FK relationships across mission, crew, modules, telemetry and commands |
| 3NF | Repeated values such as roles, satellite components and telemetry are separated into their own tables |
| One-to-many | One satellite has many telemetry and orbit-history records |
| Many-to-many | `mission_crew` connects missions and crew members |
| Constraints | `CHECK` rules enforce valid ranges, enum state and exactly one alert target |
| Indexes | Time-series indexes speed up latest telemetry queries; partial index speeds up unresolved-alert lookup |
| Views | `v_latest_satellite_status` and `v_dashboard_summary` serve the dashboard |
| Trigger | Low battery / oxygen telemetry automatically creates a critical alert |
| Stored function | `advance_command()` updates a command and adds its history log |
| Transaction | API command creation inserts the command, first log and audit record atomically |
| Joins / aggregates | Dashboard and `queries.sql` combine mission, telemetry, crew, task and alert data |

## Likely questions

**Why did you separate telemetry from satellites?**  A satellite has many readings over time. Keeping telemetry in a time-series table avoids overwriting history and supports charts.

**Why use a trigger?**  A low-battery alert must be created even when telemetry comes from a simulator, import job or another API. The rule belongs close to the data.

**Why a command log when commands already have a status?**  `commands.status` shows the latest state; `command_logs` preserves every previous state with its time and note.

**What happens if command creation fails halfway?**  The API transaction rolls back, so it cannot leave a command without its first log/audit entry.
