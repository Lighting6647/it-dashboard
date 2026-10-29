const AUTH_STORAGE_KEY = 'it_dashboard_auth';
const OFFLINE_USERS_STORAGE_KEY = 'it_dashboard_offline_users';

const DEFAULT_OFFLINE_USERS = [
  {
    username: 'itadmin',
    name: 'ผู้ดูแล IT',
    role: 'admin',
    active: true,
    passwordHash: '1e630fe2c4c6fecd9f5181b3bd43242407c8efa7e6e7db16204dc447257224db'
  },
  {
    username: 'staff',
    name: 'ผู้ใช้งานทั่วไป',
    role: 'staff',
    active: true,
    passwordHash: '4cfe481f78b27edf3d768f12bcbd44350ad8deaa69ad71478b2827c9e8534499'
  },
  {
    username: 'viewer',
    name: 'ผู้ดูรายงาน',
    role: 'viewer',
    active: true,
    passwordHash: '2c31d343eeb21b7419795d248ee4b986830576e27b544f6968b889b0848885bd'
  },
  {
    username: 'demo_guest',
    name: 'ผู้เข้าชมเดโม (Demo Guest)',
    role: 'admin',
    active: true,
    passwordHash: '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea'
  }
];

export async function sha256Hex(text) {
  const value = String(text || '');
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return '';
}

export function getOfflineUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(OFFLINE_USERS_STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length > 0) {
      const merged = new Map(DEFAULT_OFFLINE_USERS.map((u) => [u.username, u]));
      for (const user of saved) {
        if (user?.username) merged.set(user.username, { ...merged.get(user.username), ...user });
      }
      return Array.from(merged.values());
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_OFFLINE_USERS;
}

export function saveOfflineUsers(users) {
  try {
    localStorage.setItem(OFFLINE_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

export async function verifyOfflineCredentials(username, password) {
  const normalized = String(username || '').trim().toLowerCase();
  const users = getOfflineUsers();
  const matched = users.find((entry) => entry.username === normalized);
  if (!matched || matched.active === false) return null;
  const suppliedHash = await sha256Hex(password);
  if (!suppliedHash || suppliedHash !== matched.passwordHash) return null;
  return {
    token: `offline-token-${matched.username}`,
    user: {
      username: matched.username,
      name: matched.name,
      role: matched.role,
      active: matched.active !== false
    }
  };
}

export function isOfflineToken(token) {
  const value = String(token || '');
  return value.startsWith('offline-token-') || value.startsWith('demo-token-');
}

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
  if (response.status === 401 && !isOfflineToken(auth?.token)) {
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
