const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, config);
    if (!res.ok) {
      let errMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        errMsg = body.error || body.message || errMsg;
      } catch {
        // Fallback to text
      }
      throw new Error(errMsg);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API] Request failed for ${path}:`, err.message);
    throw err;
  }
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getSatellites: () => request('/satellites'),
  getSatellite: (id) => request(`/satellites/${id}`),
  getSatelliteOrbit: (id) => request(`/satellites/${id}/orbit`),
  getSatelliteOrbitHistory: (id) => request(`/satellites/${id}/orbit-history`),
  getSatelliteTelemetry: (id, limit = 50) => request(`/satellites/${id}/telemetry?limit=${limit}`),
  getStation: () => request('/station'),
  getStationModules: () => request('/station/modules'),
  getStationTelemetry: () => request('/station/telemetry'),
  getCrew: () => request('/crew'),
  getCrewTasks: () => request('/crew/tasks'),
  createCrewTask: (task) => request('/crew/tasks', { method: 'POST', body: JSON.stringify(task) }),
  getExperiments: () => request('/experiments'),
  getExperiment: (id) => request(`/experiments/${id}`),
  getGroundStations: () => request('/ground-stations'),
  getCommunications: () => request('/ground-stations/communications'),
  getAlerts: (status = 'ALL') => request(`/alerts?status=${status}`),
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: 'PATCH' }),
  createCommand: (cmd) => request('/commands', { method: 'POST', body: JSON.stringify(cmd) }),
  getCommand: (id) => request(`/commands/${id}`),
  advanceCommand: (id, status, note) => request(`/commands/${id}/advance`, { method: 'POST', body: JSON.stringify({ status, note }) }),
  triggerEmergency: (type) => request('/simulator/emergency', { method: 'POST', body: JSON.stringify({ type }) }),
  triggerSimulatorTick: () => request('/simulator/tick', { method: 'POST' }),
};
