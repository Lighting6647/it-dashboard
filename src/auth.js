const AUTH_STORAGE_KEY = 'it_dashboard_auth';

export function getStoredAuth() {
  try {
    const value = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    return value?.token && value?.user ? value : null;
  } catch {
    return null;
  }
}

export function storeAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function authFetch(url, options = {}) {
  const auth = getStoredAuth();
  const headers = new Headers(options.headers || {});
  if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearAuth();
    window.dispatchEvent(new CustomEvent('it-auth-expired'));
  }
  return response;
}

export const ROLE_LABELS = {
  viewer: 'ผู้ดูรายงาน',
  staff: 'ผู้ใช้งานทั่วไป',
  admin: 'ผู้ดูแล IT'
};

export function canEditOperationalData(role) {
  return role === 'staff' || role === 'admin';
}

export function canAdministerSystem(role) {
  return role === 'admin';
}
