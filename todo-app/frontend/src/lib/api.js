const API_BASE = import.meta.env.VITE_API_BASE || '';

export function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

export function setAuthToken(token) {
  if (!token) localStorage.removeItem('authToken');
  else localStorage.setItem('authToken', token);
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : data.error || 'request_failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

