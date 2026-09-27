const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(r) {
  if (!r.ok) {
    let msg = 'Request failed';
    try {
      const data = await r.json();
      msg = data.message || msg;
    } catch {
      msg = r.statusText || msg;
    }
    throw new Error(msg);
  }
  return r.json();
}

export const get = (path) => fetch(`${API}${path}`).then(handleResponse);
export const send = (path, body) => fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse);
export const patch = (path, body = {}) => fetch(`${API}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse);

