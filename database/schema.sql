-- ORBITOPS PostgreSQL schema. Run this file before seed.sql.
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE operational_status AS ENUM ('NOMINAL', 'WARNING', 'CRITICAL', 'OFFLINE', 'MAINTENANCE');
CREATE TYPE alert_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE command_status AS ENUM ('CREATED', 'TRANSMITTED', 'RECEIVED', 'EXECUTED', 'FAILED');

-- AUTH
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('ADMIN', 'MISSION_CONTROLLER', 'CREW', 'RESEARCHER', 'VIEWER'))
);

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(role_id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT 'demo-only-not-a-real-password',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- MISSIONS & STATIONS
CREATE TABLE missions (
  mission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status operational_status NOT NULL DEFAULT 'NOMINAL'
);

CREATE TABLE space_stations (
  station_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(mission_id),
  name TEXT UNIQUE NOT NULL,
  altitude_km NUMERIC(7,2) NOT NULL CHECK (altitude_km > 0),
  velocity_kms NUMERIC(5,2) NOT NULL CHECK (velocity_kms > 0),
  status operational_status NOT NULL DEFAULT 'NOMINAL'
);

-- CREW
CREATE TABLE crew_roles (
  crew_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL
);

CREATE TABLE crew_members (
  crew_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_role_id UUID NOT NULL REFERENCES crew_roles(crew_role_id),
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  status operational_status NOT NULL DEFAULT 'NOMINAL',
  joined_on DATE NOT NULL
);

CREATE TABLE astronauts (
  id SERIAL PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  agency_id INTEGER,
  agency_name TEXT,
  agency_abbrev TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  in_space BOOLEAN DEFAULT false,
  time_in_space TEXT,
  age INTEGER,
  nationality TEXT,
  bio TEXT,
  first_flight TIMESTAMPTZ,
  last_flight TIMESTAMPTZ,
  flights_count INTEGER,
  landings_count INTEGER,
  spacewalks_count INTEGER,
  source_url TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mission_crew (
  mission_id UUID REFERENCES missions(mission_id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crew_members(crew_id) ON DELETE CASCADE,
  assigned_on DATE NOT NULL,
  PRIMARY KEY (mission_id, crew_id)
);

CREATE TABLE crew_shifts (
  shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crew_members(crew_id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at),
  shift_type TEXT NOT NULL CHECK (shift_type IN ('DAY', 'NIGHT', 'EMERGENCY'))
);

-- STATION MODULES & RESOURCES
CREATE TABLE station_modules (
  module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES space_stations(station_id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  module_type TEXT NOT NULL,
  status operational_status NOT NULL DEFAULT 'NOMINAL',
  last_maintenance_on DATE
);

CREATE TABLE station_telemetry (
  station_telemetry_id BIGSERIAL PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES station_modules(module_id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature_c NUMERIC(5,2) NOT NULL,
  pressure_kpa NUMERIC(6,2) NOT NULL CHECK (pressure_kpa > 0),
  oxygen_pct NUMERIC(5,2) NOT NULL CHECK (oxygen_pct BETWEEN 0 AND 100),
  co2_pct NUMERIC(5,3) NOT NULL CHECK (co2_pct BETWEEN 0 AND 100),
  power_kw NUMERIC(6,2) NOT NULL CHECK (power_kw >= 0)
);

CREATE TABLE resources (
  resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES space_stations(station_id),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_quantity NUMERIC(10,2) NOT NULL CHECK (current_quantity >= 0),
  capacity NUMERIC(10,2) NOT NULL CHECK (capacity > 0 AND current_quantity <= capacity),
  UNIQUE (station_id, name)
);

CREATE TABLE resource_usage (
  usage_id BIGSERIAL PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
  quantity_used NUMERIC(10,2) NOT NULL CHECK (quantity_used >= 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crew_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crew_members(crew_id),
  module_id UUID REFERENCES station_modules(module_id),
  title TEXT NOT NULL,
  priority alert_severity NOT NULL DEFAULT 'INFO',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED')),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE maintenance_logs (
  maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES station_modules(module_id),
  performed_by UUID REFERENCES crew_members(crew_id),
  details TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status operational_status NOT NULL DEFAULT 'MAINTENANCE'
);

-- RESEARCH
CREATE TABLE experiments (
  experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  lead_crew_id UUID NOT NULL REFERENCES crew_members(crew_id),
  module_id UUID NOT NULL REFERENCES station_modules(module_id),
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  status operational_status NOT NULL DEFAULT 'NOMINAL',
  started_on DATE NOT NULL,
  ended_on DATE
);

CREATE TABLE experiment_logs (
  experiment_log_id BIGSERIAL PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES experiments(experiment_id) ON DELETE CASCADE,
  logged_by UUID REFERENCES crew_members(crew_id),
  note TEXT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE experiment_results (
  result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(experiment_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SATELLITES & REAL ORBITAL TRACKING
CREATE TABLE satellites (
  satellite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(mission_id),
  code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  purpose TEXT,
  status operational_status NOT NULL DEFAULT 'NOMINAL',
  launched_on DATE,
  norad_id INT UNIQUE,
  tle_line1 TEXT,
  tle_line2 TEXT,
  tle_epoch TIMESTAMPTZ,
  tle_source TEXT DEFAULT 'CELESTRAK',
  last_tle_sync TIMESTAMPTZ,
  tle_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  orbital_source TEXT NOT NULL DEFAULT 'SIMULATED' CHECK (orbital_source IN ('REAL', 'SIMULATED'))
);

CREATE TABLE satellite_components (
  component_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID NOT NULL REFERENCES satellites(satellite_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status operational_status NOT NULL DEFAULT 'NOMINAL',
  UNIQUE (satellite_id, name)
);

CREATE TABLE satellite_telemetry (
  satellite_telemetry_id BIGSERIAL PRIMARY KEY,
  satellite_id UUID NOT NULL REFERENCES satellites(satellite_id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  altitude_km NUMERIC(7,2) NOT NULL CHECK (altitude_km > 0),
  velocity_kms NUMERIC(5,2) NOT NULL CHECK (velocity_kms > 0),
  battery_pct NUMERIC(5,2) NOT NULL CHECK (battery_pct BETWEEN 0 AND 100),
  solar_output_kw NUMERIC(6,2) NOT NULL CHECK (solar_output_kw >= 0),
  temperature_c NUMERIC(5,2) NOT NULL,
  signal_pct NUMERIC(5,2) NOT NULL CHECK (signal_pct BETWEEN 0 AND 100)
);

CREATE TABLE orbit_history (
  orbit_id BIGSERIAL PRIMARY KEY,
  satellite_id UUID NOT NULL REFERENCES satellites(satellite_id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude NUMERIC(7,3) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(7,3) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  altitude_km NUMERIC(7,2) NOT NULL DEFAULT 408.00 CHECK (altitude_km > 0),
  velocity_kms NUMERIC(5,2) NOT NULL DEFAULT 7.66 CHECK (velocity_kms > 0),
  source TEXT NOT NULL DEFAULT 'SIMULATED' CHECK (source IN ('REAL', 'SIMULATED'))
);

-- MAINTENANCE & INCIDENTS
CREATE TABLE incidents (
  incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES space_stations(station_id),
  satellite_id UUID REFERENCES satellites(satellite_id),
  title TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'WARNING',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CHECK ((station_id IS NOT NULL)::int + (satellite_id IS NOT NULL)::int = 1)
);

-- GROUND STATIONS & COMMUNICATIONS
CREATE TABLE ground_stations (
  ground_station_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude NUMERIC(7,3) NOT NULL,
  longitude NUMERIC(7,3) NOT NULL,
  status operational_status NOT NULL DEFAULT 'NOMINAL'
);

CREATE TABLE communication_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_station_id UUID NOT NULL REFERENCES ground_stations(ground_station_id),
  satellite_id UUID NOT NULL REFERENCES satellites(satellite_id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  signal_pct NUMERIC(5,2) NOT NULL CHECK (signal_pct BETWEEN 0 AND 100),
  status operational_status NOT NULL DEFAULT 'NOMINAL'
);

CREATE TABLE commands (
  command_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID NOT NULL REFERENCES satellites(satellite_id),
  created_by UUID REFERENCES users(user_id),
  command_type TEXT NOT NULL CHECK (command_type IN ('SAFE_MODE', 'RESTART_PAYLOAD', 'ORIENTATION_CHANGE', 'REQUEST_TELEMETRY')),
  parameters JSONB NOT NULL DEFAULT '{}',
  status command_status NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE command_logs (
  command_log_id BIGSERIAL PRIMARY KEY,
  command_id UUID NOT NULL REFERENCES commands(command_id) ON DELETE CASCADE,
  status command_status NOT NULL,
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID REFERENCES satellites(satellite_id),
  module_id UUID REFERENCES station_modules(module_id),
  alert_type TEXT NOT NULL,
  severity alert_severity NOT NULL,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CHECK ((satellite_id IS NOT NULL)::int + (module_id IS NOT NULL)::int = 1)
);

CREATE TABLE audit_logs (
  audit_id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_satellite_telemetry_sat_time ON satellite_telemetry(satellite_id, recorded_at DESC);
CREATE INDEX idx_station_telemetry_module_time ON station_telemetry(module_id, recorded_at DESC);
CREATE INDEX idx_alerts_open ON alerts(status, severity, created_at DESC) WHERE status <> 'RESOLVED';
CREATE INDEX idx_commands_satellite_time ON commands(satellite_id, created_at DESC);
CREATE INDEX idx_orbit_history_sat_time ON orbit_history(satellite_id, recorded_at DESC);
CREATE INDEX idx_resource_usage_time ON resource_usage(resource_id, logged_at DESC);
CREATE INDEX idx_incidents_status ON incidents(severity, status);

-- VIEWS
CREATE VIEW v_latest_satellite_status AS
SELECT DISTINCT ON (s.satellite_id) s.satellite_id, s.code, s.name, s.purpose, s.status,
       s.norad_id, s.orbital_source, s.tle_updated_at,
       t.altitude_km, t.velocity_kms, t.battery_pct, t.temperature_c, t.signal_pct, t.recorded_at,
       oh.latitude AS current_latitude, oh.longitude AS current_longitude,
       oh.altitude_km AS current_altitude_km, oh.velocity_kms AS current_velocity_kms,
       oh.source AS orbit_source
FROM satellites s
LEFT JOIN satellite_telemetry t ON t.satellite_id = s.satellite_id
LEFT JOIN LATERAL (
  SELECT * FROM orbit_history WHERE satellite_id = s.satellite_id ORDER BY recorded_at DESC LIMIT 1
) oh ON true
ORDER BY s.satellite_id, t.recorded_at DESC;

CREATE VIEW v_dashboard_summary AS
SELECT
  (SELECT count(*) FROM crew_members WHERE status = 'NOMINAL') AS active_crew,
  (SELECT count(*) FROM satellites WHERE status <> 'OFFLINE') AS active_satellites,
  (SELECT count(*) FROM alerts WHERE status <> 'RESOLVED') AS unresolved_alerts,
  (SELECT round(avg(current_quantity / capacity * 100), 1) FROM resources) AS resource_health_pct;

CREATE VIEW v_unresolved_alerts AS
SELECT a.alert_id, a.alert_type, a.severity, a.message, a.status, a.created_at,
       s.code AS satellite_code, m.code AS module_code
FROM alerts a
LEFT JOIN satellites s ON s.satellite_id = a.satellite_id
LEFT JOIN station_modules m ON m.module_id = a.module_id
WHERE a.status <> 'RESOLVED'
ORDER BY a.created_at DESC;

CREATE VIEW v_station_resource_status AS
SELECT resource_id, station_id, name, unit, current_quantity, capacity,
       round(current_quantity / capacity * 100, 1) AS percentage
FROM resources
ORDER BY name;

CREATE VIEW v_system_events AS
SELECT 'COMMAND' AS event_type, command_type AS title, created_at FROM commands
UNION ALL
SELECT 'ALERT', alert_type, created_at FROM alerts
UNION ALL
SELECT 'MAINTENANCE', details, performed_at FROM maintenance_logs
UNION ALL
SELECT 'INCIDENT', title, reported_at FROM incidents
ORDER BY created_at DESC;

-- FUNCTIONS & TRIGGERS
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

CREATE OR REPLACE FUNCTION create_module_oxygen_alert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  assigned_engineer UUID;
BEGIN
  IF NEW.oxygen_pct < 19 AND NOT EXISTS (
    SELECT 1 FROM alerts WHERE module_id = NEW.module_id
      AND alert_type = 'LOW_OXYGEN' AND status <> 'RESOLVED'
  ) THEN
    INSERT INTO alerts(module_id, alert_type, severity, message)
    VALUES (NEW.module_id, 'LOW_OXYGEN', 'CRITICAL',
      format('Oxygen below safe level: %s%%', NEW.oxygen_pct));
    UPDATE station_modules SET status = 'CRITICAL' WHERE module_id = NEW.module_id;
    SELECT c.crew_id INTO assigned_engineer
    FROM crew_members c JOIN crew_roles r ON r.crew_role_id = c.crew_role_id
    WHERE r.title = 'Flight Engineer' AND c.status = 'NOMINAL'
    ORDER BY c.joined_on LIMIT 1;
    IF assigned_engineer IS NOT NULL THEN
      INSERT INTO crew_tasks(crew_id, module_id, title, priority, due_at)
      VALUES (assigned_engineer, NEW.module_id, 'Investigate critical oxygen level', 'CRITICAL', now() + interval '30 minutes');
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_satellite_low_battery AFTER INSERT ON satellite_telemetry
FOR EACH ROW EXECUTE FUNCTION create_satellite_battery_alert();

CREATE TRIGGER trg_module_low_oxygen AFTER INSERT ON station_telemetry
FOR EACH ROW EXECUTE FUNCTION create_module_oxygen_alert();

CREATE OR REPLACE FUNCTION advance_command(p_command_id UUID, p_status command_status, p_note TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE commands SET status = p_status WHERE command_id = p_command_id;
  INSERT INTO command_logs(command_id, status, note) VALUES (p_command_id, p_status, p_note);
END; $$;

CREATE OR REPLACE FUNCTION resolve_alert(p_alert_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_sat_id UUID;
  v_mod_id UUID;
BEGIN
  UPDATE alerts SET status = 'RESOLVED', resolved_at = now()
  WHERE alert_id = p_alert_id RETURNING satellite_id, module_id INTO v_sat_id, v_mod_id;
  
  IF v_sat_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM alerts WHERE satellite_id = v_sat_id AND status <> 'RESOLVED'
  ) THEN
    UPDATE satellites SET status = 'NOMINAL' WHERE satellite_id = v_sat_id;
  END IF;

  IF v_mod_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM alerts WHERE module_id = v_mod_id AND status <> 'RESOLVED'
  ) THEN
    UPDATE station_modules SET status = 'NOMINAL' WHERE module_id = v_mod_id;
  END IF;

  IF p_user_id IS NOT NULL THEN
    INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, 'RESOLVE_ALERT', 'ALERT', p_alert_id, '{}');
  END IF;
END; $$;
