-- ORBITOPS post-install verification. Run after schema.sql and seed.sql.
DO $$
DECLARE
  fleet_count INT;
  open_alert_count INT;
  dashboard_rows INT;
BEGIN
  SELECT count(*) INTO fleet_count FROM satellites;
  IF fleet_count < 4 THEN RAISE EXCEPTION 'Expected at least 4 seeded satellites, got %', fleet_count; END IF;
  SELECT count(*) INTO open_alert_count FROM alerts WHERE status = 'OPEN';
  IF open_alert_count < 1 THEN RAISE EXCEPTION 'Expected trigger-created open alert'; END IF;
  SELECT count(*) INTO dashboard_rows FROM v_dashboard_summary;
  IF dashboard_rows <> 1 THEN RAISE EXCEPTION 'Dashboard summary view is invalid'; END IF;
END $$;

-- Show trigger, views, joins and indexes for a viva/demo.
SELECT 'seed + trigger check' AS test, code, battery_pct, status
FROM v_latest_satellite_status WHERE code = 'SAT-03';
SELECT 'dashboard view check' AS test, * FROM v_dashboard_summary;
SELECT 'open alert check' AS test, alert_type, severity, status, message FROM alerts WHERE status <> 'RESOLVED';
SELECT 'index check' AS test, indexname FROM pg_indexes WHERE tablename IN ('satellite_telemetry', 'station_telemetry', 'alerts', 'commands');
