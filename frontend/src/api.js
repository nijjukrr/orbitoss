const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const get = (path) => fetch(`${API}${path}`).then(async (r) => { if (!r.ok) throw new Error((await r.json()).message || 'Request failed'); return r.json(); });
export const send = (path, body) => fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).message || 'Request failed'); return r.json(); });
export const patch = (path, body = {}) => fetch(`${API}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).message || 'Request failed'); return r.json(); });
