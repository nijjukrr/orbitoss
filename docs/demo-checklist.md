# ORBITOPS final demo checklist

## Before the presentation

1. Create PostgreSQL database `orbitops`.
2. Run `schema.sql`, `seed.sql`, then `verify.sql`. It should finish without an exception.
3. Put the PostgreSQL URL in `backend/.env`.
4. Start backend and frontend in separate terminals.
5. Open the dashboard, then keep `SAT-03` and Command Center ready in separate browser tabs.

## Five-minute demo order

1. **Dashboard (30 sec):** Show populated resource bars, station orbit values, active crew, fleet and trigger-created critical alert.
2. **Station (40 sec):** Open a station module and explain that each telemetry record is historical, not overwritten.
3. **Satellite telemetry (45 sec):** Open SAT-03. Explain `satellite_telemetry` and `v_latest_satellite_status`.
4. **Trigger (45 sec):** Use `POST /api/simulator/tick`, then show alerts. Battery under 20% is handled by the database trigger.
5. **Command Center (60 sec):** Create `SAFE_MODE`; then advance it from CREATED → TRANSMITTED → RECEIVED → EXECUTED. Explain that all lifecycle entries are saved in `command_logs`.
6. **Alerts (30 sec):** Resolve the alert after the response. Open the Alert Center to show the history.
7. **Viva finish (30 sec):** Mention normalized tables, FKs, check constraints, indexes, views, trigger, function, and transaction.

## Useful API commands

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/simulator/tick

# Use the command_id returned by POST /api/commands
Invoke-RestMethod -Method Post -ContentType 'application/json' `
  -Body '{"status":"TRANSMITTED","note":"Uplink from Bengaluru"}' `
  http://localhost:5000/api/commands/PUT_COMMAND_ID_HERE/advance
```
