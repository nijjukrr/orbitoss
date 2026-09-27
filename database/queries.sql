-- 1. Dashboard aggregate query
SELECT * FROM v_dashboard_summary;

-- 2. Latest satellite values (view + time-series relationship)
SELECT * FROM v_latest_satellite_status ORDER BY code;

-- 3. Join across crew, role, task and module
SELECT c.full_name, cr.title AS crew_role, t.title AS task, t.status, sm.name AS module
FROM crew_tasks t JOIN crew_members c ON c.crew_id=t.crew_id
JOIN crew_roles cr ON cr.crew_role_id=c.crew_role_id
LEFT JOIN station_modules sm ON sm.module_id=t.module_id;

-- 4. Acknowledge open critical alert list
SELECT a.alert_id, a.alert_type, a.message, s.code AS satellite, sm.code AS module
FROM alerts a LEFT JOIN satellites s ON s.satellite_id=a.satellite_id
LEFT JOIN station_modules sm ON sm.module_id=a.module_id
WHERE a.status <> 'RESOLVED' ORDER BY a.created_at DESC;

-- 5. Procedure/function demonstration after a command is created
-- SELECT advance_command('<command UUID>', 'TRANSMITTED', 'Command uplinked from BLR-01');
