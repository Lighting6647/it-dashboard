import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, Save, ShieldCheck, UserPlus, Users, X } from 'lucide-react';
import { authFetch, getOfflineUsers, ROLE_LABELS, saveOfflineUsers, sha256Hex } from '../auth';
import './UserAccessManager.css';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
const EMPTY_USER = { username: '', name: '', password: '', role: 'viewer' };

export default function UserAccessManager({ currentUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState(null);

  const applyUserList = useCallback((list) => {
    setUsers(list);
    setDrafts(Object.fromEntries(list.map((user) => [user.username, { ...user, password: '' }])));
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await authFetch(`${API_BASE}/api/auth/users`, { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(payload.users)) {
        applyUserList(payload.users);
        return;
      }
      applyUserList(getOfflineUsers());
    } catch {
      applyUserList(getOfflineUsers());
    } finally {
      setLoading(false);
    }
  }, [applyUserList]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const updateDraft = (username, field, value) => {
    setDrafts((previous) => ({
      ...previous,
      [username]: { ...previous[username], [field]: value }
    }));
  };

  const saveUser = async (username) => {
    const draft = drafts[username];
    setSaving(username);
    setMessage(null);
    try {
      let savedViaApi = false;
      try {
        const response = await authFetch(`${API_BASE}/api/auth/users/${encodeURIComponent(username)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: draft.name, role: draft.role, active: draft.active, password: draft.password || undefined })
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          savedViaApi = true;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 404 && payload.message) {
          throw new Error(payload.message);
        }
      } catch (apiErr) {
        if (apiErr.message && !apiErr.message.includes('Failed to fetch')) throw apiErr;
      }

      if (!savedViaApi) {
        const currentOffline = getOfflineUsers();
        const passwordHash = draft.password ? await sha256Hex(draft.password) : undefined;
        const updatedOffline = currentOffline.map((user) =>
          user.username === username
            ? {
                ...user,
                name: draft.name,
                role: draft.role,
                active: draft.active !== false,
                ...(passwordHash ? { passwordHash } : {})
              }
            : user
        );
        saveOfflineUsers(updatedOffline);
      }

      setMessage({ type: 'success', text: `บันทึกสิทธิ์ของ ${username} แล้ว` });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving('');
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setSaving('new');
    setMessage(null);
    try {
      let createdViaApi = false;
      try {
        const response = await authFetch(`${API_BASE}/api/auth/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          createdViaApi = true;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 404 && payload.message) {
          throw new Error(payload.message);
        }
      } catch (apiErr) {
        if (apiErr.message && !apiErr.message.includes('Failed to fetch')) throw apiErr;
      }

      if (!createdViaApi) {
        const currentOffline = getOfflineUsers();
        const normalizedUsername = String(newUser.username || '').trim().toLowerCase();
        if (currentOffline.some((u) => u.username === normalizedUsername)) {
          throw new Error('User นี้มีอยู่แล้ว');
        }
        const passwordHash = await sha256Hex(newUser.password);
        saveOfflineUsers([
          ...currentOffline,
          {
            username: normalizedUsername,
            name: String(newUser.name || '').trim(),
            role: newUser.role || 'viewer',
            active: true,
            passwordHash
          }
        ]);
      }

      setNewUser(EMPTY_USER);
      setMessage({ type: 'success', text: 'เพิ่มบัญชีผู้ใช้งานแล้ว' });
      await loadUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="modal-overlay active user-access-overlay">
      <div className="modal large user-access-modal" role="dialog" aria-modal="true" aria-labelledby="user-access-title">
        <div className="modal-header">
          <h3 id="user-access-title"><Users size={21} /> จัดการสิทธิ์ผู้ใช้งาน</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="ปิด"><X size={22} /></button>
        </div>
        <div className="modal-body user-access-body">
          <section className="user-access-create">
            <div className="user-access-heading">
              <div><UserPlus size={20} /><span><strong>เพิ่มบัญชีใหม่</strong><small>กำหนด User, Password และสิทธิ์เริ่มต้น</small></span></div>
            </div>
            <form className="user-access-create-grid" onSubmit={createUser}>
              <label>User<input required value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })} placeholder="เช่น somchai" /></label>
              <label>ชื่อผู้ใช้งาน<input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="ชื่อ-นามสกุล" /></label>
              <label>Password<input required minLength={6} type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="อย่างน้อย 6 ตัว" /></label>
              <label>สิทธิ์<select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option value="viewer">ผู้ดูรายงาน</option><option value="staff">ผู้ใช้งานทั่วไป</option><option value="admin">ผู้ดูแลระบบ</option></select></label>
              <button type="submit" disabled={saving === 'new'}><UserPlus size={17} /> {saving === 'new' ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}</button>
            </form>
          </section>

          {message && <div className={`user-access-message ${message.type}`}>{message.text}</div>}

          <section className="user-access-list">
            <div className="user-access-heading">
              <div><ShieldCheck size={20} /><span><strong>บัญชีและสิทธิ์การเข้าถึง</strong><small>เว้นช่องรหัสผ่านว่าง หากไม่ต้องการเปลี่ยน</small></span></div>
              <span>{users.length} บัญชี</span>
            </div>
            {loading ? <div className="user-access-empty">กำลังโหลดข้อมูล...</div> : users.map((user) => {
              const draft = drafts[user.username] || { ...user, password: '' };
              const isSelf = user.username === currentUser?.username;
              return (
                <div className={`user-access-row ${draft.active ? '' : 'inactive'}`} key={user.username}>
                  <div className="user-access-identity"><strong>{user.username}</strong><small>{isSelf ? 'บัญชีที่กำลังใช้งาน' : (draft.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน')}</small></div>
                  <label>ชื่อ<input value={draft.name || ''} onChange={(e) => updateDraft(user.username, 'name', e.target.value)} /></label>
                  <label>สิทธิ์<select value={draft.role} disabled={isSelf} onChange={(e) => updateDraft(user.username, 'role', e.target.value)}><option value="viewer">{ROLE_LABELS.viewer}</option><option value="staff">{ROLE_LABELS.staff}</option><option value="admin">{ROLE_LABELS.admin}</option></select></label>
                  <label><span><KeyRound size={13} /> รหัสผ่านใหม่</span><input type="password" minLength={6} value={draft.password || ''} onChange={(e) => updateDraft(user.username, 'password', e.target.value)} placeholder="ไม่เปลี่ยน" /></label>
                  <label className="user-access-active"><input type="checkbox" checked={draft.active !== false} disabled={isSelf} onChange={(e) => updateDraft(user.username, 'active', e.target.checked)} /><span>เปิดใช้งาน</span></label>
                  <button type="button" onClick={() => saveUser(user.username)} disabled={saving === user.username}><Save size={16} /> {saving === user.username ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
