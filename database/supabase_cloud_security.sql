ALTER FUNCTION orbitops.create_module_oxygen_alert() SET search_path = orbitops, pg_temp;
ALTER FUNCTION orbitops.create_satellite_battery_alert() SET search_path = orbitops, pg_temp;
ALTER FUNCTION orbitops.advance_command(uuid, orbitops.command_status, text) SET search_path = orbitops, pg_temp;
ALTER FUNCTION orbitops.resolve_alert(uuid, uuid) SET search_path = orbitops, pg_temp;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
