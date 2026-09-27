-- Fictional, deterministic data for demonstrations.
INSERT INTO roles(name) VALUES ('ADMIN'), ('MISSION_CONTROLLER'), ('CREW'), ('RESEARCHER'), ('VIEWER');

INSERT INTO users(role_id, full_name, email)
SELECT role_id, 'Maya Raman', 'maya@orbitops.demo' FROM roles WHERE name = 'MISSION_CONTROLLER';

INSERT INTO user_roles(user_id, role_id)
SELECT u.user_id, r.role_id FROM users u CROSS JOIN roles r WHERE u.email = 'maya@orbitops.demo' AND r.name = 'MISSION_CONTROLLER';

INSERT INTO missions(code, name, start_date) VALUES ('OR-26', 'ORBITOPS Horizon Mission', '2026-08-01');

INSERT INTO space_stations(mission_id, name, altitude_km, velocity_kms)
SELECT mission_id, 'Astra Habitat One', 408.00, 7.66 FROM missions WHERE code = 'OR-26';

INSERT INTO crew_roles(title) VALUES ('Commander'), ('Flight Engineer'), ('Mission Specialist'), ('Researcher');

INSERT INTO crew_members(crew_role_id, full_name, nationality, joined_on)
SELECT cr.crew_role_id, v.full_name, v.nationality, '2026-08-01'
FROM (VALUES ('Commander','Alex Carter','USA'),('Flight Engineer','Sarah Chen','Singapore'),('Mission Specialist','Ravi Menon','India'),('Researcher','Elena Ruiz','Spain')) AS v(role_name,full_name,nationality)
JOIN crew_roles cr ON cr.title = v.role_name;

INSERT INTO mission_crew(mission_id, crew_id, assigned_on)
SELECT m.mission_id, c.crew_id, '2026-08-01' FROM missions m CROSS JOIN crew_members c WHERE m.code='OR-26';

INSERT INTO crew_shifts(crew_id, starts_at, ends_at, shift_type)
SELECT c.crew_id, now() - interval '4 hours', now() + interval '4 hours', 'DAY'
FROM crew_members c WHERE c.full_name = 'Alex Carter';

INSERT INTO station_modules(station_id, code, name, module_type, last_maintenance_on)
SELECT st.station_id, v.code, v.name, v.module_type, '2026-09-18'
FROM (VALUES ('HAB-01','Habitat Module','HABITAT'),('SCI-01','Science Lab','LAB'),('CMD-01','Command Hub','CONTROL'),('CUP-01','Cupola','OBSERVATION'),('DOC-01','Docking Port','DOCKING')) v(code,name,module_type)
CROSS JOIN space_stations st;

INSERT INTO resources(station_id,name,unit,current_quantity,capacity)
SELECT station_id, v.name, v.unit, v.quantity, v.capacity FROM space_stations CROSS JOIN
(VALUES ('Oxygen','%',94,100),('Water','L',780,1000),('Power','kWh',860,1000)) v(name,unit,quantity,capacity);

INSERT INTO resource_usage(resource_id, quantity_used, logged_at)
SELECT r.resource_id, 2.5, now() - (i || ' hours')::interval
FROM resources r CROSS JOIN generate_series(1,6) i WHERE r.name = 'Oxygen';

INSERT INTO satellites(mission_id,code,name,purpose,launched_on)
SELECT mission_id, v.code, v.name, v.purpose, '2026-08-03' FROM missions CROSS JOIN
(VALUES ('SAT-01','Aurelia','Earth Observation'),('SAT-02','Relay','Communication'),('SAT-03','Kepler','Research'),('SAT-04','AstraScan','Climate Monitoring')) v(code,name,purpose) WHERE missions.code='OR-26';

INSERT INTO satellite_components(satellite_id,name)
SELECT s.satellite_id, c.name FROM satellites s CROSS JOIN (VALUES ('Power Unit'),('Payload Computer'),('Antenna')) c(name);

INSERT INTO ground_stations(code,city,country,latitude,longitude) VALUES
('BLR-01','Bengaluru','India',12.971,77.594),('MAD-01','Madrid','Spain',40.416,-3.703),('MCM-01','McMurdo','Antarctica',-77.841,166.686);

INSERT INTO communication_sessions(ground_station_id,satellite_id,started_at,signal_pct,status)
SELECT g.ground_station_id, s.satellite_id, now() - interval '12 minutes', 92, 'NOMINAL'
FROM ground_stations g JOIN satellites s ON s.code='SAT-02' WHERE g.code='BLR-01';

INSERT INTO communication_sessions(ground_station_id,satellite_id,started_at,signal_pct,status)
SELECT g.ground_station_id, s.satellite_id, now() - interval '31 minutes', 78, 'NOMINAL'
FROM ground_stations g JOIN satellites s ON s.code='SAT-01' WHERE g.code='MAD-01';

INSERT INTO satellite_telemetry(satellite_id,recorded_at,altitude_km,velocity_kms,battery_pct,solar_output_kw,temperature_c,signal_pct)
SELECT s.satellite_id, now() - (i || ' hours')::interval, 520 + i*.03, 7.62, 96-i*3, 2.8, 32+i, 92-i*2
FROM satellites s CROSS JOIN generate_series(0,12) i WHERE s.code='SAT-01';

INSERT INTO satellite_telemetry(satellite_id,recorded_at,altitude_km,velocity_kms,battery_pct,solar_output_kw,temperature_c,signal_pct)
SELECT s.satellite_id, now() - (i || ' hours')::interval, 417 + i*.02, 7.62, 18+i*.2, 1.82, 68.4, 64
FROM satellites s CROSS JOIN generate_series(0,12) i WHERE s.code='SAT-03';

INSERT INTO orbit_history(satellite_id, recorded_at, latitude, longitude)
SELECT s.satellite_id, now() - (i || ' minutes')::interval, 12.5 + i*0.1, 77.2 + i*0.2
FROM satellites s CROSS JOIN generate_series(0,10) i WHERE s.code='SAT-01';

INSERT INTO station_telemetry(module_id,recorded_at,temperature_c,pressure_kpa,oxygen_pct,co2_pct,power_kw)
SELECT module_id, now() - (i || ' hours')::interval, 23.8, 101.2, 20.9, .04, 12.4
FROM station_modules CROSS JOIN generate_series(0,12) i WHERE code='HAB-01';

INSERT INTO experiments(code,title,lead_crew_id,module_id,progress_pct,started_on)
SELECT 'EXP-024','Plant Growth in Microgravity',c.crew_id,sm.module_id,72,'2026-09-12'
FROM crew_members c JOIN station_modules sm ON sm.code='SCI-01' WHERE c.full_name='Sarah Chen';

INSERT INTO experiment_logs(experiment_id, logged_by, note, logged_at)
SELECT e.experiment_id, c.crew_id, 'Germination rate reached 85% in chamber A.', now() - interval '2 days'
FROM experiments e JOIN crew_members c ON c.full_name='Sarah Chen' WHERE e.code='EXP-024';

INSERT INTO experiment_results(experiment_id, metric_name, metric_value, unit, recorded_at)
SELECT e.experiment_id, 'Biomass Yield', 4.250, 'g/cm3', now() - interval '1 day'
FROM experiments e WHERE e.code='EXP-024';

INSERT INTO crew_tasks(crew_id,module_id,title,priority,status,due_at)
SELECT c.crew_id, sm.module_id, 'Inspect thermal regulator', 'WARNING', 'IN_PROGRESS', now() + interval '4 hours'
FROM crew_members c JOIN station_modules sm ON sm.code='HAB-01' WHERE c.full_name='Ravi Menon';

INSERT INTO maintenance_logs(module_id, performed_by, details, status)
SELECT sm.module_id, c.crew_id, 'Replaced air filter pack in Habitat Module', 'NOMINAL'
FROM station_modules sm JOIN crew_members c ON c.full_name='Alex Carter' WHERE sm.code='HAB-01';

INSERT INTO incidents(station_id, title, severity, status)
SELECT st.station_id, 'Micro-meteoroid sensor anomaly flagged', 'WARNING', 'OPEN'
FROM space_stations st WHERE st.name='Astra Habitat One';

-- Low telemetry value intentionally fires trigger creating SAT-03 low-battery alert.
INSERT INTO satellite_telemetry(satellite_id,altitude_km,velocity_kms,battery_pct,solar_output_kw,temperature_c,signal_pct)
SELECT satellite_id,417.42,7.62,18,1.82,68.4,64 FROM satellites WHERE code='SAT-03';
