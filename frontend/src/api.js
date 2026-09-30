const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(r) {
  if (!r.ok) {
    let msg = `HTTP ${r.status} ${r.statusText}`;
    try {
      const data = await r.json();
      msg = data.message || data.error || msg;
    } catch {
      // Ignore JSON parse failure
    }
    const error = new Error(msg);
    error.status = r.status;
    throw error;
  }
  return r.json();
}

export const get = async (path) => {
  try {
    const res = await fetch(`${API}${path}`);
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to backend API at ${API}${path}. Verify backend server is running on port 5000.`);
    }
    throw err;
  }
};

export const send = async (path, body) => {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to backend API at ${API}${path}. Verify backend server is running on port 5000.`);
    }
    throw err;
  }
};

export const patch = async (path, body = {}) => {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`Unable to connect to backend API at ${API}${path}. Verify backend server is running on port 5000.`);
    }
    throw err;
  }
};

export const getAstronautsInSpace = () => get('/astronauts/in-space');
export const getAstronautById = (id) => get(`/astronauts/${id}`);
export const syncAstronauts = () => send('/astronauts/sync', {});
