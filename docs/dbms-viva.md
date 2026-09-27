# ORBITOPS — DBMS Viva Preparation Guide

This guide details all Database Management System (DBMS) concepts implemented in **ORBITOPS Mission Control**, complete with exact SQL implementations, architectural reasoning, and expected viva examiner questions & answers.

---

## 1. Relational Normalization (3NF)

ORBITOPS strictly adheres to **Third Normal Form (3NF)** to eliminate redundancy and anomaly types (Insertion, Update, Deletion anomalies).

### First Normal Form (1NF)
- **Rules**: Atomic columns, unique row identification, no repeating groups.
- **ORBITOPS Implementation**: Telemetry values (`temperature_c`, `pressure_kpa`, `battery_pct`) are atomic scalar values. JSON parameters are restricted to unstructured payload metadata.

### Second Normal Form (2NF)
- **Rules**: Must be in 1NF, and all non-key attributes must depend on the *entire* primary key (no partial functional dependencies).
- **ORBITOPS Implementation**: In composite key table `mission_crew(mission_id, crew_id)`, `assigned_on` depends on the combination of both `mission_id` and `crew_id`. Ranks and titles are moved to separate entities (`crew_roles`, `roles`).

### Third Normal Form (3NF)
- **Rules**: Must be in 2NF, and no transitive dependencies (non-key attribute depending on another non-key attribute).
- **ORBITOPS Implementation**: Instead of storing `crew_role_title` directly inside `crew_members`, we store `crew_role_id` referencing `crew_roles(crew_role_id)`. Updating a role title requires changing a single row in `crew_roles`.

---

## 2. SQL Joins Implemented

### A. INNER JOIN
Retrieves crew members with their designated ranks:
```sql
SELECT c.full_name, cr.title
FROM crew_members c
JOIN crew_roles cr ON cr.crew_role_id = c.crew_role_id;
```

### B. LEFT JOIN
Retrieves all satellites, including those with no telemetry logged yet:
```sql
SELECT s.code, s.name, t.battery_pct
FROM satellites s
LEFT JOIN satellite_telemetry t ON t.satellite_id = s.satellite_id;
```

### C. LATERAL JOIN
Retrieves the most recent communication session per ground station efficiently:
```sql
SELECT g.code, g.city, cs.signal_pct, cs.started_at
FROM ground_stations g
LEFT JOIN LATERAL (
  SELECT * FROM communication_sessions
  WHERE ground_station_id = g.ground_station_id
  ORDER BY started_at DESC LIMIT 1
) cs ON true;
```

---

## 3. Database Triggers

Triggers enforce business rules automatically inside PostgreSQL without relying on application code.

### Trigger 1: Low Battery Alert (`trg_satellite_low_battery`)
- **Event**: `AFTER INSERT ON satellite_telemetry`
- **Logic**: When telemetry is inserted with `battery_pct < 20`, checks if an open alert exists. If not, inserts a `CRITICAL` alert into `alerts` and updates `satellites.status = 'CRITICAL'`.

```sql
CREATE OR REPLACE FUNCTION create_satellite_battery_alert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.battery_pct < 20 AND NOT EXISTS (
    SELECT 1 FROM alerts WHERE satellite_id = NEW.satellite_id
      AND alert_type = 'LOW_BATTERY' AND status <> 'RESOLVED'
  ) THEN
    INSERT INTO alerts(satellite_id, alert_type, severity, message)
    VALUES (NEW.satellite_id, 'LOW_BATTERY', 'CRITICAL',
      format('Battery critically low: %s%%', NEW.battery_pct));
    UPDATE satellites SET status = 'CRITICAL' WHERE satellite_id = NEW.satellite_id;
  END IF;
  RETURN NEW;
END; $$;
```

### Trigger 2: Emergency Crew Task Assignment (`trg_module_low_oxygen`)
- **Event**: `AFTER INSERT ON station_telemetry`
- **Logic**: When oxygen levels fall below 19%, creates an alert and automatically queries `crew_members` for the first available `Flight Engineer`, assigning them a high-priority task.

---

## 4. PostgreSQL Views

Views encapsulate complex multi-table queries for Mission Control dashboards.

1. **`v_latest_satellite_status`**: Uses `DISTINCT ON (satellite_id)` to extract current position and battery level for each satellite.
2. **`v_dashboard_summary`**: Computes single-row summary indicators for active crew, fleet size, unresolved alerts, and resource health.
3. **`v_unresolved_alerts`**: Filtered view showing active alerts (`status <> 'RESOLVED'`) sorted by severity and timestamp.
4. **`v_system_events`**: Consolidated UNION view across commands, alerts, maintenance, and incidents.

---

## 5. Indexes & Performance Optimization

To handle high-frequency telemetry inserts without degrading read latency:

- **Composite Timestamp Index**:
  `CREATE INDEX idx_satellite_telemetry_sat_time ON satellite_telemetry(satellite_id, recorded_at DESC);`
- **Partial Index**:
  `CREATE INDEX idx_alerts_open ON alerts(status, severity, created_at DESC) WHERE status <> 'RESOLVED';`
  *(Indexes only open alerts, keeping index size small and searches fast).*

---

## 6. Transactions & ACID Properties

Multi-step operations use explicit transactions (`BEGIN` ... `COMMIT` / `ROLLBACK`).

### Satellite Command Creation Transaction:
```javascript
const client = await db.connect();
try {
  await client.query('BEGIN');
  // 1. Insert command into commands table
  const command = await client.query('INSERT INTO commands(...) VALUES (...) RETURNING *');
  // 2. Insert initial log entry
  await client.query('INSERT INTO command_logs(...) VALUES (...)');
  // 3. Log audit event
  await client.query('INSERT INTO audit_logs(...) VALUES (...)');
  await client.query('COMMIT'); // Atomic Commit
} catch (error) {
  await client.query('ROLLBACK'); // Rollback on any failure
  throw error;
} finally {
  client.release();
}
```

### ACID Breakdown:
- **Atomicity**: Either all 3 tables (`commands`, `command_logs`, `audit_logs`) are updated, or none are.
- **Consistency**: Foreign keys guarantee `satellite_id` and `user_id` exist.
- **Isolation**: PostgreSQL MVCC prevents dirty reads from concurrent connections.
- **Durability**: Committed data is safely stored in PostgreSQL WAL files on disk.

---

## 7. Stored Procedures & Functions

### `resolve_alert(p_alert_id UUID, p_user_id UUID)`
- Atomically resolves an alert.
- Checks if any remaining open alerts exist for the target satellite/module.
- Restores operational status to `NOMINAL` when all alerts are cleared.
- Records audit trails.

---

## 8. Common Examiner Viva Questions & Answers

**Q1: What is the difference between a View and a Table?**  
*Answer*: A table physically stores data on disk. A view is a virtual table representing the result of a stored SQL query. In ORBITOPS, `v_latest_satellite_status` is a view that computes the latest telemetry dynamically.

**Q2: Why did you use PostgreSQL triggers instead of handling alerts in Node.js?**  
*Answer*: Database triggers execute atomically at the database layer regardless of which API endpoint or background worker inserts telemetry, guaranteeing data integrity and preventing missed alerts even if external applications bypass Node.js.

**Q3: Explain how your schema achieves 3NF.**  
*Answer*: Non-key attributes depend strictly on the primary key. Ranks are separated into `crew_roles`, space stations into `space_stations`, and resources into `resources`, removing all transitive dependencies.

**Q4: What happens if a command creation fails mid-way?**  
*Answer*: The Express backend issues a `ROLLBACK` command inside the `catch` block, restoring the database to its exact state prior to `BEGIN`.
