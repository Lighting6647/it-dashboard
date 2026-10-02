import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
XLSX.set_fs(fs);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  '1e630fe2c4c6fecd9f5181b3bd43242407c8efa7e6e7db16204dc447257224db';

const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ||
  crypto.createHash('sha256').update(`it-dashboard:${ADMIN_PASSWORD_HASH}`).digest('hex');
const AUTH_TOKEN_TTL_SECONDS = 8 * 60 * 60;
const ROLE_LEVEL = { viewer: 1, staff: 2, admin: 3 };

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function loadAuthUsers() {
  if (process.env.AUTH_USERS_JSON) {
    try {
      const parsed = JSON.parse(process.env.AUTH_USERS_JSON);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((user) => ({
          username: String(user.username || '').trim().toLocaleLowerCase('en-US'),
          name: String(user.name || user.username || '').trim(),
          role: ROLE_LEVEL[user.role] ? user.role : 'viewer',
          passwordHash: String(user.passwordHash || hashPassword(user.password || ''))
        })).filter((user) => user.username && /^[a-f0-9]{64}$/i.test(user.passwordHash));
      }
    } catch (error) {
      console.error('AUTH_USERS_JSON is invalid:', error.message);
    }
  }
  return [
    { username: 'itadmin', name: 'ผู้ดูแล IT', role: 'admin', passwordHash: ADMIN_PASSWORD_HASH },
    { username: 'staff', name: 'ผู้ใช้งานทั่วไป', role: 'staff', passwordHash: hashPassword(process.env.STAFF_PASSWORD || 'staff2569') },
    { username: 'viewer', name: 'ผู้ดูรายงาน', role: 'viewer', passwordHash: hashPassword(process.env.VIEWER_PASSWORD || 'viewer2569') }
  ];
}

const DEFAULT_AUTH_USERS = loadAuthUsers();

function publicAuthUser(user) {
  return {
    username: user.username,
    name: user.name,
    role: user.role,
    active: user.active !== false
  };
}

function serializeAuthVersion(value) {
  if (!value) return 'default';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

async function findAuthUser(username) {
  const normalized = String(username || '').trim().toLocaleLowerCase('en-US');
  try {
    const result = await pool.query(
      'SELECT username, display_name AS name, role, password_hash AS "passwordHash", active, updated_at AS "authVersion" FROM auth_users WHERE username = $1',
      [normalized]
    );
    return result.rows[0] || null;
  } catch {
    const fallback = DEFAULT_AUTH_USERS.find((entry) => entry.username === normalized);
    return fallback ? { ...fallback, active: true, authVersion: 'default' } : null;
  }
}

function safeEqualHex(left, right) {
  try {
    const leftBuffer = Buffer.from(String(left), 'hex');
    const rightBuffer = Buffer.from(String(right), 'hex');
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
  } catch {
    return false;
  }
}

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function signAuthToken(user) {
  const payload = toBase64Url(JSON.stringify({
    sub: user.username,
    name: user.name,
    role: user.role,
    ver: serializeAuthVersion(user.authVersion),
    exp: Math.floor(Date.now() / 1000) + AUTH_TOKEN_TTL_SECONDS
  }));
  const signature = crypto.createHmac('sha256', AUTH_TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAuthToken(token) {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', AUTH_TOKEN_SECRET).update(payload).digest('base64url');
    const suppliedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!value.exp || value.exp <= Math.floor(Date.now() / 1000) || !ROLE_LEVEL[value.role]) return null;
    return { username: value.sub, name: value.name, role: value.role, authVersion: value.ver || '' };
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') || String(req.query?.token || '');
  const tokenUser = verifyAuthToken(token);
  if (!tokenUser) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  try {
    const currentUser = await findAuthUser(tokenUser.username);
    if (!currentUser || currentUser.active === false) {
      return res.status(401).json({ message: 'บัญชีนี้ถูกปิดการใช้งาน' });
    }
    const currentVersion = serializeAuthVersion(currentUser.authVersion);
    if (tokenUser.authVersion !== currentVersion) {
      return res.status(401).json({ message: 'สิทธิ์หรือรหัสผ่านมีการเปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่' });
    }
    req.user = publicAuthUser(currentUser);
    next();
  } catch (error) {
    next(error);
  }
}


async function sendLineNotify(message) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('message', message);
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: params
    });
    return response.ok;
  } catch (err) {
    console.error('LINE Notify Error:', err.message);
    return false;
  }
}

function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user || ROLE_LEVEL[req.user.role] < ROLE_LEVEL[minimumRole]) {
      return res.status(403).json({ message: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ' });
    }
    next();
  };
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

let windows874ByteLookup;
function getWindows874ByteLookup() {
  if (windows874ByteLookup) return windows874ByteLookup;
  const decoder = new TextDecoder('windows-874');
  windows874ByteLookup = new Map();
  for (let byte = 0; byte <= 255; byte += 1) {
    windows874ByteLookup.set(decoder.decode(Uint8Array.of(byte)), byte);
  }
  return windows874ByteLookup;
}

function thaiMojibakeScore(text) {
  const value = String(text || '');
  const controlCount = (value.match(/[\u0080-\u009f]/g) || []).length;
  const thaiUtf8PrefixCount = (value.match(/\u0e18\u0e30|\u0e40\u0e19/g) || []).length;
  return (controlCount * 4) + thaiUtf8PrefixCount;
}

function repairThaiMojibake(value) {
  if (typeof value !== 'string' || thaiMojibakeScore(value) < 2) return value;
  try {
    const byteLookup = getWindows874ByteLookup();
    const bytes = [];
    for (const character of value) {
      const byte = byteLookup.get(character);
      if (byte === undefined) return value;
      bytes.push(byte);
    }
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    if (!/[\u0e00-\u0e7f]/.test(repaired)) return value;
    return thaiMojibakeScore(repaired) < thaiMojibakeScore(value)
      ? repaired.normalize('NFC')
      : value;
  } catch {
    return value;
  }
}

function repairThaiTextDeep(value) {
  if (typeof value === 'string') return repairThaiMojibake(value);
  if (Array.isArray(value)) return value.map(repairThaiTextDeep);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairThaiTextDeep(item)]));
}

function normalizeAssetStatus(value) {
  const status = String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!status) return 'ใช้งาน';
  if (['พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้'].includes(status)) return 'ว่าง';
  if (['เสีย', 'รอซ่อมแซม'].includes(status)) return 'รอซ่อม';
  return status;
}

let storedThaiRepairComplete = false;
let storedThaiRepairPromise;
async function ensureStoredThaiTextIsReadable(queryable) {
  if (storedThaiRepairComplete) return 0;
  if (storedThaiRepairPromise) return storedThaiRepairPromise;
  storedThaiRepairPromise = (async () => {
    let updatedCount = 0;
    const assetRows = await queryable.query('SELECT sn, user_name, position, item_type, notes, details FROM assets');
    for (const row of assetRows.rows) {
      const repaired = repairThaiTextDeep(row);
      if (JSON.stringify(repaired) === JSON.stringify(row)) continue;
      await queryable.query(
        'UPDATE assets SET user_name = $1, position = $2, item_type = $3, notes = $4, details = $5::jsonb WHERE sn = $6',
        [repaired.user_name, repaired.position, repaired.item_type, repaired.notes, JSON.stringify(repaired.details || {}), row.sn]
      );
      updatedCount += 1;
    }

    const ticketRows = await queryable.query('SELECT sn, complainant, issue, cause, responder FROM tickets');
    for (const row of ticketRows.rows) {
      const repaired = repairThaiTextDeep(row);
      if (JSON.stringify(repaired) === JSON.stringify(row)) continue;
      await queryable.query(
        'UPDATE tickets SET complainant = $1, issue = $2, cause = $3, responder = $4 WHERE sn = $5',
        [repaired.complainant, repaired.issue, repaired.cause, repaired.responder, row.sn]
      );
      updatedCount += 1;
    }

    const requestRows = await queryable.query('SELECT id, requester, department, item_type, purpose, reviewer, notes, history FROM asset_requests');
    for (const row of requestRows.rows) {
      const repaired = repairThaiTextDeep(row);
      if (JSON.stringify(repaired) === JSON.stringify(row)) continue;
      await queryable.query(
        'UPDATE asset_requests SET requester = $1, department = $2, item_type = $3, purpose = $4, reviewer = $5, notes = $6, history = $7::jsonb WHERE id = $8',
        [repaired.requester, repaired.department, repaired.item_type, repaired.purpose, repaired.reviewer, repaired.notes, JSON.stringify(repaired.history || []), row.id]
      );
      updatedCount += 1;
    }

    storedThaiRepairComplete = true;
    console.log(`Thai text audit completed. Repaired ${updatedCount} stored records.`);
    return updatedCount;
  })();
  try {
    return await storedThaiRepairPromise;
  } finally {
    if (!storedThaiRepairComplete) storedThaiRepairPromise = undefined;
  }
}

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLocaleLowerCase('en-US');
  const user = await findAuthUser(username);
  const suppliedHash = hashPassword(req.body?.password);
  if (!user || user.active === false || !safeEqualHex(suppliedHash, user.passwordHash)) {
    return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  const publicUser = publicAuthUser(user);
  res.json({ token: signAuthToken(user), user: publicUser, expiresIn: AUTH_TOKEN_TTL_SECONDS });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.use('/api', requireAuth);

app.get('/api/auth/users', requireRole('admin'), asyncRoute(async (_req, res) => {
  const result = await pool.query(`
    SELECT username, display_name AS name, role, active, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM auth_users
    ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'staff' THEN 2 ELSE 3 END, username
  `);
  res.json({ users: result.rows });
}));

app.post('/api/auth/users', requireRole('admin'), asyncRoute(async (req, res) => {
  const username = String(req.body?.username || '').trim().toLocaleLowerCase('en-US');
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'viewer');
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return res.status(400).json({ message: 'User ต้องมี 3-40 ตัว และใช้ a-z, 0-9, จุด ขีดกลาง หรือขีดล่างเท่านั้น' });
  }
  if (!name) return res.status(400).json({ message: 'กรุณาระบุชื่อผู้ใช้งาน' });
  if (password.length < 6) return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  if (!ROLE_LEVEL[role]) return res.status(400).json({ message: 'สิทธิ์ไม่ถูกต้อง' });
  try {
    const result = await pool.query(`
      INSERT INTO auth_users (username, display_name, role, password_hash, active)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING username, display_name AS name, role, active, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [username, name, role, hashPassword(password)]);
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'User นี้มีอยู่แล้ว' });
    throw error;
  }
}));

app.patch('/api/auth/users/:username', requireRole('admin'), asyncRoute(async (req, res) => {
  const username = String(req.params.username || '').trim().toLocaleLowerCase('en-US');
  const existing = await findAuthUser(username);
  if (!existing) return res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้' });
  const name = req.body?.name === undefined ? existing.name : String(req.body.name || '').trim();
  const role = req.body?.role === undefined ? existing.role : String(req.body.role || '');
  const active = req.body?.active === undefined ? existing.active !== false : Boolean(req.body.active);
  const password = req.body?.password === undefined ? '' : String(req.body.password || '');
  if (!name) return res.status(400).json({ message: 'กรุณาระบุชื่อผู้ใช้งาน' });
  if (!ROLE_LEVEL[role]) return res.status(400).json({ message: 'สิทธิ์ไม่ถูกต้อง' });
  if (password && password.length < 6) return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  if (username === req.user.username && (!active || role !== 'admin')) {
    return res.status(400).json({ message: 'ไม่สามารถปิดบัญชีหรือลดสิทธิ์บัญชีที่กำลังใช้งานอยู่' });
  }
  if (existing.role === 'admin' && existing.active !== false && (!active || role !== 'admin')) {
    const admins = await pool.query("SELECT COUNT(*)::integer AS count FROM auth_users WHERE role = 'admin' AND active = TRUE");
    if (admins.rows[0].count <= 1) return res.status(400).json({ message: 'ระบบต้องมี Admin ที่เปิดใช้งานอย่างน้อย 1 บัญชี' });
  }
  const result = await pool.query(`
    UPDATE auth_users
    SET display_name = $1,
        role = $2,
        active = $3,
        password_hash = CASE WHEN $4 = '' THEN password_hash ELSE $5 END,
        updated_at = NOW()
    WHERE username = $6
    RETURNING username, display_name AS name, role, active, created_at AS "createdAt", updated_at AS "updatedAt"
  `, [name, role, active, password, password ? hashPassword(password) : existing.passwordHash, username]);
  res.json({ user: result.rows[0] });
}));

function normalizeDbUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = String(rawUrl).trim();
  const isShortRenderHost = /@dpg-[a-z0-9]+-a(?:[:\/\?#]|$)/i.test(url) && !url.includes('.');
  const isRenderCloud = !!process.env.RENDER || !!process.env.RENDER_SERVICE_ID;

  if (isShortRenderHost && !isRenderCloud) {
    const region = process.env.RENDER_REGION || 'singapore';
    url = url.replace(/@(dpg-[a-z0-9]+-a)([:\/\?#]|$)/i, `@$1.${region}-postgres.render.com$2`);
  }
  return url;
}

const rawDbUrl = process.env.DATABASE_URL || '';
const dbUrl = normalizeDbUrl(rawDbUrl);
const isRenderInternal = dbUrl.includes('@dpg-') && !dbUrl.includes('.');

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: (dbUrl && !isRenderInternal) ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  max: 20
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

app.get('/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time');
    res.json({ status: 'ok', serverTime: result.rows[0].server_time });
  } catch (err) {
    res.status(503).json({ status: 'error', code: err.code || '', message: err.message });
  }
});

function normalizeImageAttachment(data, name) {
  if (!data) return { data: null, name: null };
  const value = String(data);
  if (!/^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/.test(value)) {
    throw new Error('ไฟล์แนบต้องเป็นรูป JPG, PNG, WEBP หรือ GIF เท่านั้น');
  }
  const encoded = value.slice(value.indexOf(',') + 1).replace(/\s/g, '');
  const byteLength = Math.floor((encoded.length * 3) / 4);
  if (byteLength > 5 * 1024 * 1024) {
    throw new Error('ไฟล์แนบมีขนาดเกิน 5 MB');
  }
  return {
    data: value,
    name: String(name || 'attachment').slice(0, 255)
  };
}

function normalizeIdentity(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('th-TH');
}

function getIdentityKeys(value) {
  const raw = String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const keys = new Set([normalizeIdentity(raw)]);
  keys.add(normalizeIdentity(raw.split(/[（(]/, 1)[0]));
  for (const match of raw.matchAll(/[（(]([^()（）]+)[)）]/g)) {
    keys.add(normalizeIdentity(match[1]));
  }
  keys.delete('');
  return keys;
}

function matchesRequesterIdentity(input, requester) {
  const normalizedInput = normalizeIdentity(input);
  return Boolean(normalizedInput) && getIdentityKeys(requester).has(normalizedInput);
}

async function refreshOperationalCounters(client) {
  await client.query(`
    UPDATE monthly_data m
    SET total_assets = (SELECT COUNT(*) FROM assets),
        assets_broken = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) IN ('รอซ่อม', 'รอซ่อมแซม', 'ชำรุด', 'เสีย')),
        assets_lost = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) = 'สูญหาย'),
        assets_vacant = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) IN ('ว่าง', 'พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้')),
        tickets_count = (SELECT COUNT(*) FROM tickets t WHERE t.month_key = m.month_key),
        repair_count = (SELECT COUNT(*) FROM tickets t WHERE t.month_key = m.month_key)
  `);
}

async function reconcileAssetRequestWorkflow(client) {
  await client.query(`
    UPDATE asset_requests
    SET status = 'overdue',
        history = history || jsonb_build_array(jsonb_build_object(
          'status', 'overdue',
          'at', NOW(),
          'by', 'System',
          'note', 'เกินกำหนดคืนอุปกรณ์อัตโนมัติ'
        )),
        updated_at = NOW()
    WHERE status = 'issued'
      AND due_date IS NOT NULL
      AND due_date < CURRENT_DATE
  `);

  // Every in-use asset must have one active workflow record. This also imports
  // legacy/direct registry assignments into the checkout/return audit trail.
  await client.query(`
    INSERT INTO asset_requests (
      requester, department, item_type, purpose, status, assigned_asset_sn,
      reviewer, issue_date, notes, history
    )
    SELECT
      COALESCE(NULLIF(a.user_name, ''), 'ไม่ระบุ'),
      COALESCE(NULLIF(a.position, ''), '-'),
      COALESCE(NULLIF(a.item_type, ''), 'อุปกรณ์ IT'),
      'สร้างรายการใช้งานอัตโนมัติจากทะเบียนทรัพย์สิน',
      'issued',
      a.sn,
      'IT Asset Registry',
      NOW(),
      'ระบบซิงค์ Workflow กับสถานะใช้งานในทะเบียน',
      jsonb_build_array(jsonb_build_object(
        'status', 'issued',
        'at', NOW(),
        'by', 'System',
        'note', 'สร้างรายการใช้งานเพื่อให้ประวัติตรงกับทะเบียนทรัพย์สิน'
      ))
    FROM assets a
    WHERE a.status = 'ใช้งาน'
      AND NOT EXISTS (
        SELECT 1 FROM asset_requests active
        WHERE active.assigned_asset_sn = a.sn
          AND active.status IN ('approved', 'issued', 'overdue', 'return_requested')
      )
    ON CONFLICT DO NOTHING
  `);
}

async function normalizeVacantAssetOwnership(client) {
  await client.query(`
    UPDATE assets
    SET user_name = 'ส่วนกลาง',
        position = '-',
        details = details || jsonb_build_object(
          'status', 'ว่าง',
          'user', 'ส่วนกลาง',
          'position', '-'
        )
    WHERE BTRIM(status) IN ('ว่าง', 'พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้')
      AND (user_name IS DISTINCT FROM 'ส่วนกลาง' OR position IS DISTINCT FROM '-')
  `);
}

async function initDb() {
  try {
    const client = await pool.connect();
    try {
      console.log('Connected to PostgreSQL. Initializing tables...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS monthly_data (
          month_key VARCHAR(50) PRIMARY KEY,
          month_name VARCHAR(255) NOT NULL,
          total_assets INTEGER NOT NULL,
          asset_value NUMERIC(15, 2) NOT NULL,
          assets_expiring INTEGER NOT NULL,
          assets_broken INTEGER NOT NULL,
          assets_lost INTEGER NOT NULL,
          assets_vacant INTEGER NOT NULL,
          tickets_count INTEGER NOT NULL,
          sla_percent NUMERIC(5, 2) NOT NULL,
          response_time INTEGER NOT NULL,
          resolution_time NUMERIC(5, 2) NOT NULL,
          csat NUMERIC(3, 1) NOT NULL,
          total_software INTEGER NOT NULL,
          licenses_in_use NUMERIC(10, 2) NOT NULL,
          licenses_vacant NUMERIC(10, 2) NOT NULL,
          software_cost NUMERIC(12, 2) NOT NULL,
          software_annual_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
          software_expiring INTEGER NOT NULL,
          backup_success NUMERIC(5, 2) NOT NULL,
          security_incidents INTEGER NOT NULL,
          antivirus_coverage NUMERIC(5, 2) NOT NULL,
          mfa_coverage NUMERIC(5, 2) NOT NULL,
          repair_count INTEGER NOT NULL,
          repair_cost NUMERIC(12, 2) NOT NULL,
          top_broken_devices JSONB NOT NULL,
          dept_costs JSONB NOT NULL,
          software_expiring_details JSONB NOT NULL,
          assets_expiring_details JSONB NOT NULL,
          ongoing_projects JSONB NOT NULL,
          vendor_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
          recommendations JSONB NOT NULL
        )
      `);

      await client.query(`
        ALTER TABLE monthly_data
        ADD COLUMN IF NOT EXISTS software_annual_cost NUMERIC(12, 2) NOT NULL DEFAULT 0
      `);
      await client.query(`
        ALTER TABLE monthly_data
        ADD COLUMN IF NOT EXISTS vendor_contracts JSONB NOT NULL DEFAULT '[]'::jsonb
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS monthly_data_snapshots (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          snapshot JSONB NOT NULL
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS auth_users (
          username VARCHAR(40) PRIMARY KEY,
          display_name VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'staff', 'admin')),
          password_hash CHAR(64) NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      for (const user of DEFAULT_AUTH_USERS) {
        await client.query(`
          INSERT INTO auth_users (username, display_name, role, password_hash, active)
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (username) DO NOTHING
        `, [user.username, user.name, user.role, user.passwordHash]);
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS assets (
          sn INTEGER PRIMARY KEY,
          date VARCHAR(50) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          position VARCHAR(255) NOT NULL,
          item_type VARCHAR(255) NOT NULL,
          device_serial VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          details JSONB NOT NULL DEFAULT '{}'::jsonb
        )
      `);
      await client.query(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          sn INTEGER PRIMARY KEY,
          month_key VARCHAR(50) NOT NULL,
          date VARCHAR(50) NOT NULL,
          complainant VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          anydesk VARCHAR(255) NOT NULL,
          issue TEXT NOT NULL,
          cause TEXT NOT NULL,
          duration VARCHAR(50) NOT NULL,
          responder VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          cost NUMERIC(12, 2) NOT NULL,
          asset_sn INTEGER,
          source VARCHAR(50) NOT NULL DEFAULT 'dashboard',
          attachment_data TEXT,
          attachment_name VARCHAR(255)
        )
      `);
      await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'dashboard'`);
      await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS asset_sn INTEGER`);
      await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachment_data TEXT`);
      await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255)`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS asset_requests (
          id SERIAL PRIMARY KEY,
          requester VARCHAR(255) NOT NULL,
          department VARCHAR(255) NOT NULL,
          item_type VARCHAR(255) NOT NULL,
          purpose TEXT NOT NULL,
          requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
          due_date DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          assigned_asset_sn INTEGER,
          reviewer VARCHAR(255),
          issue_date TIMESTAMPTZ,
          return_date TIMESTAMPTZ,
          return_condition VARCHAR(50),
          workflow_type VARCHAR(50) NOT NULL DEFAULT 'checkout',
          notes TEXT,
          history JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS asset_requests_one_active_asset
        ON asset_requests (assigned_asset_sn)
        WHERE assigned_asset_sn IS NOT NULL
          AND status IN ('approved', 'issued', 'overdue', 'return_requested')
      `);

      await ensureStoredThaiTextIsReadable(client);

      await reconcileAssetRequestWorkflow(client);

      // Workflow is authoritative for assets that are reserved or currently issued.
      // Reconcile on every deploy so stale dashboard snapshots cannot leave them behind.
      await client.query(`
        UPDATE assets a
        SET status = CASE WHEN r.status = 'approved' THEN 'จอง' ELSE 'ใช้งาน' END,
            user_name = r.requester,
            position = COALESCE(NULLIF(r.department, ''), '-'),
            details = a.details || jsonb_build_object(
              'status', CASE WHEN r.status = 'approved' THEN 'จอง' ELSE 'ใช้งาน' END,
              'user', r.requester,
              'position', COALESCE(NULLIF(r.department, ''), '-')
            )
        FROM asset_requests r
        WHERE r.assigned_asset_sn = a.sn
          AND r.status IN ('approved', 'issued', 'overdue', 'return_requested')
      `);

      // An active request must never point to a deleted asset. Return a dangling
      // request to the approval queue instead of showing conflicting statuses.
      await client.query(`
        UPDATE asset_requests r
        SET status = 'need_info',
            assigned_asset_sn = NULL,
            history = r.history || jsonb_build_array(jsonb_build_object(
              'status', 'need_info',
              'at', NOW(),
              'by', 'System',
              'note', 'ยกเลิกการจัดสรรอัตโนมัติ เนื่องจากไม่พบอุปกรณ์ในทะเบียน'
            )),
            updated_at = NOW()
        WHERE r.status IN ('approved', 'issued', 'overdue', 'return_requested')
          AND NOT EXISTS (SELECT 1 FROM assets a WHERE a.sn = r.assigned_asset_sn)
      `);
      await client.query(`ALTER TABLE asset_requests ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(50) NOT NULL DEFAULT 'checkout'`);

      await normalizeVacantAssetOwnership(client);

      await refreshOperationalCounters(client);
    sendLineNotify(
      `\n🚨 [แจ้งปัญหา IT ใหม่ #${nextSn}]\n` +
      `👤 ผู้แจ้ง: ${complainant}\n` +
      `💻 อุปกรณ์: ${deviceType} ${assetSerial ? `(${assetSerial})` : ''}\n` +
      `⚠️ อาการ: ${issue}\n` +
      `🎯 ความสำคัญ: ${priority || 'medium'}\n` +
      `📅 วันที่: ${date}`
    ).catch(() => {});
      console.log('Tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn(`WARNING: Failed to connect to PostgreSQL database (DATABASE_URL is ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}). Server will start in offline API fallback mode.`);
    console.error(err);
  }
}

app.get('/api/db-state', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    await ensureStoredThaiTextIsReadable(pool);
    const monthsResult = await pool.query('SELECT * FROM monthly_data');
    const assetsResult = await pool.query('SELECT * FROM assets ORDER BY sn ASC');
    const ticketsResult = await pool.query('SELECT * FROM tickets ORDER BY sn ASC');

    const dataObj = {};
    monthsResult.rows.forEach(row => {
      dataObj[row.month_key] = {
        monthName: row.month_name,
        totalAssets: Number(row.total_assets),
        assetValue: Number(row.asset_value),
        assetsExpiring: Number(row.assets_expiring),
        assetsBroken: Number(row.assets_broken),
        assetsLost: Number(row.assets_lost),
        assetsVacant: Number(row.assets_vacant),
        ticketsCount: Number(row.tickets_count),
        slaPercent: Number(row.sla_percent),
        responseTime: Number(row.response_time),
        resolutionTime: Number(row.resolution_time),
        csat: Number(row.csat),
        totalSoftware: Number(row.total_software),
        licensesInUse: Number(row.licenses_in_use),
        licensesVacant: Number(row.licenses_vacant),
        softwareCost: Number(row.software_cost),
        softwareAnnualCost: Number(row.software_annual_cost || 0),
        softwareExpiring: Number(row.software_expiring),
        backupSuccess: Number(row.backup_success),
        securityIncidents: Number(row.security_incidents),
        antivirusCoverage: Number(row.antivirus_coverage),
        mfaCoverage: Number(row.mfa_coverage),
        repairCount: Number(row.repair_count),
        repairCost: Number(row.repair_cost),
        topBrokenDevices: row.top_broken_devices || [],
        deptCosts: row.dept_costs || {},
        softwareExpiringDetails: row.software_expiring_details || [],
        assetsExpiringDetails: row.assets_expiring_details || [],
        ongoingProjects: row.ongoing_projects || [],
        vendorContracts: row.vendor_contracts || [],
        recommendations: row.recommendations || [],
        ticketsList: []
      };
    });

    ticketsResult.rows.forEach(row => {
      if (dataObj[row.month_key]) {
        dataObj[row.month_key].ticketsList.push({
          sn: Number(row.sn),
          date: row.date,
          complainant: row.complainant,
          email: row.email,
          anydesk: row.anydesk,
          issue: row.issue,
          cause: row.cause,
          duration: row.duration,
          responder: row.responder,
          status: row.status,
          cost: Number(row.cost),
          assetSn: row.asset_sn === null ? null : Number(row.asset_sn),
          source: row.source,
          hasAttachment: Boolean(row.attachment_data),
          attachmentName: row.attachment_name || ''
        });
      }
    });

    const assetsList = assetsResult.rows.map(row => ({
      ...(row.details || {}),
      sn: Number(row.sn),
      date: row.date,
      user: row.user_name,
      position: row.position,
      itemType: row.item_type,
      deviceSerial: row.device_serial,
      status: normalizeAssetStatus(row.status),
      notes: row.notes || ''
    }));

    res.json({ data: dataObj, assetsList });
  } catch (err) {
    console.error('Error fetching DB state:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/tickets/:sn/attachment', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT attachment_data, attachment_name FROM tickets WHERE sn = $1',
      [Number(req.params.sn)]
    );
    if (result.rowCount === 0 || !result.rows[0].attachment_data) {
      return res.status(404).json({ error: 'ไม่พบรูปแนบ' });
    }

    const match = String(result.rows[0].attachment_data).match(
      /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/
    );
    if (!match) return res.status(415).json({ error: 'รูปแนบไม่ถูกต้อง' });

    const extensionByType = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    const safeFileName = `ticket-${Number(req.params.sn)}.${extensionByType[match[1]] || 'img'}`;
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Content-Type', match[1]);
    res.set('Content-Disposition', `inline; filename="${safeFileName}"`);
    return res.send(Buffer.from(match[2], 'base64'));
  } catch (err) {
    console.error('Error fetching ticket attachment:', err);
    return res.status(500).json({ error: 'ไม่สามารถเปิดรูปแนบได้' });
  }
});

app.post('/api/tickets', requireRole('staff'), async (req, res) => {
  const { name, department, date, deviceType, issue, priority, assetSerial, email, anydesk, attachmentData, attachmentName } = req.body || {};
  if (!name || !department || !date || !deviceType || !issue) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลแจ้งปัญหาให้ครบถ้วน' });
  }

  const monthKey = String(date).slice(0, 7);
  let client;
  try {
    client = await pool.connect();

    await client.query('BEGIN');

    // A request form can be opened directly before the dashboard has created
    // its monthly snapshot. Tickets do not have a foreign key to monthly_data,
    // so keep the request as the authoritative record and let /api/sync-all
    // attach it to the month when the dashboard synchronizes later.

    // await client.query('SELECT pg_advisory_xact_lock(42001)');
    const snResult = await client.query('SELECT COALESCE(MAX(sn), 0) + 1 AS next_sn FROM tickets');
    const nextSn = Number(snResult.rows[0].next_sn);
    const complainant = `${String(name).trim()} (${String(department).trim()})`;
    const ticketIssue = `[${String(deviceType).trim()}] [${priority || 'medium'}] ${String(issue).trim()}`;
    const attachment = normalizeImageAttachment(attachmentData, attachmentName);

    await client.query(`
      INSERT INTO tickets (
        sn, month_key, date, complainant, email, anydesk, issue, cause,
        duration, responder, status, cost, source, attachment_data, attachment_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, '-', '-', '-', 'กำลังดำเนินการ', 0, 'request_form', $8, $9)
    `, [nextSn, monthKey, date, complainant, email || '-', anydesk || '-', ticketIssue, attachment.data, attachment.name]);

    let linkedAssetSn = null;
    if (String(assetSerial || '').trim()) {
      const assetResult = await client.query(
        'SELECT sn, details FROM assets WHERE LOWER(device_serial) = LOWER($1) FOR UPDATE',
        [String(assetSerial).trim()]
      );
      if (assetResult.rowCount === 0) {
        const assetError = new Error(`ไม่พบหมายเลขเครื่อง ${String(assetSerial).trim()} ในทะเบียนทรัพย์สิน`);
        assetError.statusCode = 400;
        throw assetError;
      }
      linkedAssetSn = Number(assetResult.rows[0].sn);
      await client.query('UPDATE tickets SET asset_sn = $1 WHERE sn = $2', [linkedAssetSn, nextSn]);
      await client.query(`
        UPDATE assets
        SET status = 'รอซ่อม',
            details = details || jsonb_build_object('status', 'รอซ่อม')
        WHERE sn = $1
      `, [linkedAssetSn]);

      const activeRequests = await client.query(`
        SELECT id, history FROM asset_requests
        WHERE assigned_asset_sn = $1 AND status IN ('approved', 'issued', 'overdue', 'return_requested')
        FOR UPDATE
      `, [linkedAssetSn]);
      for (const request of activeRequests.rows) {
        const event = {
          status: 'returned',
          at: new Date().toISOString(),
          by: String(name).trim(),
          note: `ส่งเครื่องเข้าซ่อมจากใบแจ้งปัญหา #${nextSn}`
        };
        await client.query(`
          UPDATE asset_requests
          SET status = 'returned',
              return_date = NOW(),
              return_condition = 'ชำรุด',
              history = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify([...(request.history || []), event]), request.id]);
      }
    }

    await refreshOperationalCounters(client);

    await client.query('COMMIT');
    if (typeof ticket !== 'undefined') {
      sendLineNotify(
        `\n✅ [ปิดใบงาน IT #${sn}]\n` +
        `👤 ผู้แจ้ง: ${ticket.complainant || '-'}\n` +
        `🛠️ ผู้ดำเนินการ: ${responder}\n` +
        `⏱️ เวลาที่ใช้: ${duration || '-'}\n` +
        `💰 ค่าใช้จ่าย: ${Number(cost || 0) > 0 ? Number(cost).toLocaleString() + ' บาท' : 'ไม่มี'}\n` +
        `📌 สถานะ: ${status}`
      ).catch(() => {});
    }
    res.status(201).json({ success: true, sn: nextSn, monthKey, linkedAssetSn });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (rbErr) { console.error('RB Err:', rbErr.message); }
    }
    const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    if (statusCode >= 500) console.error('Error creating IT request ticket:', err);
    else console.warn('Rejected IT request ticket:', err.message);
    res.status(statusCode).json({ error: statusCode >= 500 ? 'สร้างใบแจ้งปัญหาไม่สำเร็จ' : err.message });
  } finally {
    if (client) {
      try { client.release(); } catch (closeError) { console.error('Failed to close database client:', closeError); }
    }
  }
});

app.patch('/api/tickets/:sn/close', requireRole('admin'), async (req, res) => {
  const sn = Number(req.params.sn);
  const { responder, duration, cause, status, cost } = req.body || {};
  if (!Number.isInteger(sn) || sn <= 0 || !String(responder || '').trim()) {
    return res.status(400).json({ error: 'กรุณาระบุใบงานและชื่อผู้ดำเนินงานให้ถูกต้อง' });
  }
  if (!['เสร็จสิ้น', 'จ่ายเงินแล้ว'].includes(status)) {
    return res.status(400).json({ error: 'สถานะปิดงานไม่ถูกต้อง' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const ticketResult = await client.query('SELECT * FROM tickets WHERE sn = $1 FOR UPDATE', [sn]);
    if (ticketResult.rowCount === 0) throw new Error('ไม่พบใบงานที่ต้องการปิด');
    const ticket = ticketResult.rows[0];
    if (ticket.status !== 'กำลังดำเนินการ') throw new Error('ใบงานนี้ถูกปิดหรืออัปเดตไปแล้ว');

    await client.query(`
      UPDATE tickets
      SET responder = $1,
          duration = $2,
          cause = $3,
          status = $4,
          cost = $5
      WHERE sn = $6
    `, [
      String(responder).trim(),
      duration || '00:30',
      cause || '-',
      status,
      Number(cost) || 0,
      sn
    ]);

    if (ticket.asset_sn) {
      await client.query(`
        UPDATE assets
        SET status = 'ว่าง',
            user_name = 'ส่วนกลาง',
            details = details || jsonb_build_object('status', 'ว่าง', 'user', 'ส่วนกลาง')
        WHERE sn = $1 AND status = 'รอซ่อม'
      `, [ticket.asset_sn]);
    }

    await refreshOperationalCounters(client);
    await client.query('COMMIT');
    res.json({ success: true, sn, status, assetSn: ticket.asset_sn ? Number(ticket.asset_sn) : null });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error closing ticket:', err);
    res.status(err.message.startsWith('ไม่พบ') ? 404 : 400).json({ error: err.message || 'ปิดงานไม่สำเร็จ' });
  } finally {
    if (client) client.release();
  }
});

app.patch('/api/assets/:sn', requireRole('admin'), async (req, res) => {
  const sn = Number(req.params.sn);
  const {
    user, position, itemType, additionalEquipment, deviceSerial, status, notes,
    submittedOn, respondent, date, softwareApp, registeredEmail,
    additionalSerial, returnDueDate, auditDate, purchaseDate, productionYear,
    warrantyExpiry, cost, marketModel, marketPrice, priceAvailability,
    priceSourceUrl, priceCheckedAt
  } = req.body || {};
  if (!Number.isInteger(sn) || sn <= 0 || !itemType || !status) {
    return res.status(400).json({ error: 'ข้อมูลทรัพย์สินไม่ถูกต้อง' });
  }
  const normalizedStatus = normalizeAssetStatus(status);
  const normalizedUser = normalizedStatus === 'ว่าง' ? 'ส่วนกลาง' : (user || 'ส่วนกลาง');
  const normalizedPosition = normalizedStatus === 'ว่าง' ? '-' : (position || '-');

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const assetResult = await client.query('SELECT * FROM assets WHERE sn = $1 FOR UPDATE', [sn]);
    if (assetResult.rowCount === 0) throw new Error('ไม่พบทรัพย์สินที่ต้องการแก้ไข');

    const optionalDetails = Object.fromEntries(Object.entries({
      submittedOn,
      respondent,
      date,
      softwareApp,
      registeredEmail,
      additionalSerial,
      returnDueDate,
      auditDate,
      purchaseDate,
      productionYear,
      warrantyExpiry,
      cost,
      marketModel,
      marketPrice: marketPrice === undefined ? undefined : Number(marketPrice) || 0,
      priceAvailability,
      priceSourceUrl,
      priceCheckedAt
    }).filter(([, value]) => value !== undefined));
    const details = {
      ...(assetResult.rows[0].details || {}),
      user: normalizedUser,
      position: normalizedPosition,
      itemType,
      additionalEquipment: additionalEquipment || '',
      deviceSerial: deviceSerial || '-',
      status: normalizedStatus,
      notes: notes || '',
      ...optionalDetails
    };
    const updatedAssetResult = await client.query(`
      UPDATE assets
      SET date = $1, user_name = $2, position = $3, item_type = $4, device_serial = $5,
          status = $6, notes = $7, details = $8
      WHERE sn = $9
      RETURNING *
    `, [
      date === undefined ? (assetResult.rows[0].date || '') : date,
      normalizedUser,
      normalizedPosition,
      itemType,
      deviceSerial || '-',
      normalizedStatus,
      notes || '',
      JSON.stringify(details),
      sn
    ]);

    // The checkout workflow is authoritative for the assignee during full
    // snapshot synchronization. Keep its identity fields in step with a
    // direct registry edit so the next sync cannot restore stale values.
    if (['ใช้งาน', 'จอง'].includes(normalizedStatus)) {
      await client.query(`
        UPDATE asset_requests
        SET requester = $1,
            department = $2,
            item_type = $3,
            updated_at = NOW()
        WHERE assigned_asset_sn = $4
          AND status IN ('approved', 'issued', 'overdue', 'return_requested')
      `, [
        user || 'ส่วนกลาง',
        position || '-',
        itemType,
        sn
      ]);
    }

    if (['ว่าง', 'รอซ่อม', 'ชำรุด', 'สูญหาย'].includes(normalizedStatus)) {
      const activeRequests = await client.query(`
        SELECT id, history FROM asset_requests
        WHERE assigned_asset_sn = $1 AND status IN ('approved', 'issued', 'overdue', 'return_requested')
        FOR UPDATE
      `, [sn]);
      for (const request of activeRequests.rows) {
        const event = {
          status: 'returned',
          at: new Date().toISOString(),
          by: 'IT Asset Registry',
          note: `เปลี่ยนสถานะทรัพย์สินเป็น ${normalizedStatus} จากหน้าทะเบียน`
        };
        await client.query(`
          UPDATE asset_requests
          SET status = 'returned',
              return_date = NOW(),
              return_condition = $1,
              history = $2,
              updated_at = NOW()
          WHERE id = $3
        `, [
          ['รอซ่อม', 'ชำรุด'].includes(normalizedStatus) ? 'ชำรุด' : normalizedStatus === 'สูญหาย' ? 'สูญหาย' : 'ปกติ',
          JSON.stringify([...(request.history || []), event]),
          request.id
        ]);
      }
    }

    await reconcileAssetRequestWorkflow(client);

    await client.query(`
      UPDATE monthly_data
      SET total_assets = (SELECT COUNT(*) FROM assets),
          assets_broken = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) IN ('รอซ่อม', 'รอซ่อมแซม', 'ชำรุด', 'เสีย')),
          assets_lost = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) = 'สูญหาย'),
          assets_vacant = (SELECT COUNT(*) FROM assets WHERE BTRIM(status) IN ('ว่าง', 'พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้'))
    `);

    await client.query('COMMIT');
    const updatedRow = updatedAssetResult.rows[0];
    res.json({
      success: true,
      sn,
      status: normalizedStatus,
      asset: {
        ...(updatedRow.details || {}),
        sn: Number(updatedRow.sn),
        date: updatedRow.date,
        user: updatedRow.user_name,
        position: updatedRow.position,
        itemType: updatedRow.item_type,
        deviceSerial: updatedRow.device_serial,
        status: updatedRow.status,
        notes: updatedRow.notes || ''
      }
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error updating asset directly:', err);
    res.status(err.message.startsWith('ไม่พบ') ? 404 : 500).json({ error: err.message || 'แก้ไขทรัพย์สินไม่สำเร็จ' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/asset-requests', async (_req, res) => {
  try {
    await ensureStoredThaiTextIsReadable(pool);
    await reconcileAssetRequestWorkflow(pool);
    const result = await pool.query(`
      SELECT r.*, a.device_serial, a.item_type AS assigned_item_type
      FROM asset_requests r
      LEFT JOIN assets a ON a.sn = r.assigned_asset_sn
      ORDER BY r.created_at DESC, r.id DESC
    `);
    res.json(repairThaiTextDeep(result.rows.map(row => ({
      ...row,
      id: Number(row.id),
      assigned_asset_sn: row.assigned_asset_sn === null ? null : Number(row.assigned_asset_sn)
    }))));
  } catch (err) {
    console.error('Error fetching asset requests:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/asset-requests', requireRole('staff'), async (req, res) => {
  const { requester, department, itemType, purpose, requestedDate, dueDate, notes, workflowType } = req.body;
  const normalizedWorkflowType = ['checkout', 'replacement', 'resignation'].includes(workflowType) ? workflowType : '';
  if (!requester || !department || !itemType || !purpose || !requestedDate || !normalizedWorkflowType) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลคำขอให้ครบ' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return res.status(400).json({ error: 'รูปแบบวันที่เบิกต้องเป็น YYYY-MM-DD' });
  }
  const requestedItems = Array.from(new Set(String(itemType)
    .split(/[,;\n]+/)
    .map(value => value.trim())
    .filter(Boolean)));
  if (requestedItems.length === 0) {
    return res.status(400).json({ error: 'กรุณาระบุหมายเลขหรือประเภทอุปกรณ์อย่างน้อย 1 รายการ' });
  }
  if (requestedItems.length > 50) {
    return res.status(400).json({ error: 'สามารถส่งคำขอได้ไม่เกิน 50 เครื่องต่อครั้ง' });
  }
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const created = [];
    for (const item of requestedItems) {
      const event = {
        status: 'pending',
        at: new Date().toISOString(),
        by: requester,
        note: requestedItems.length > 1 ? `ส่งคำขอเบิกแบบหลายเครื่อง (${requestedItems.length} รายการ)` : 'ส่งคำขอเบิกอุปกรณ์'
      };
      const result = await client.query(`
        INSERT INTO asset_requests (requester, department, item_type, purpose, requested_date, due_date, notes, workflow_type, history)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [requester, department, item, purpose, requestedDate, dueDate || null, notes || '', normalizedWorkflowType, JSON.stringify([event])]);
      created.push(result.rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json({
      ...created[0],
      id: created[0].id,
      ids: created.map(row => Number(row.id)),
      count: created.length,
      requests: created
    });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (rbErr) { console.error('Rollback failed:', rbErr.message); }
    }
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Read-only integrity summary used to detect ticket months that were detached
// from monthly_data by an older full-snapshot synchronization.
app.get('/api/data-integrity/months', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const result = await pool.query(`
      SELECT
        t.month_key,
        COUNT(*)::integer AS ticket_count,
        COUNT(*) FILTER (WHERE t.source = 'request_form')::integer AS request_form_count,
        (m.month_key IS NOT NULL) AS has_month_record
      FROM tickets t
      LEFT JOIN monthly_data m ON m.month_key = t.month_key
      GROUP BY t.month_key, m.month_key
      ORDER BY t.month_key
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error checking month integrity:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/asset-requests/:id', requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { requester, department, itemType, purpose, dueDate, notes } = req.body;
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'เลขที่คำขอไม่ถูกต้อง' });
  }
  if (![requester, department, itemType, purpose].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลคำขอที่จำเป็นให้ครบ' });
  }
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(400).json({ error: 'รูปแบบกำหนดคืนต้องเป็น YYYY-MM-DD' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const current = await client.query('SELECT history, status, assigned_asset_sn FROM asset_requests WHERE id = $1 FOR UPDATE', [id]);
    if (current.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'ไม่พบคำขอ' });
    }
    const event = {
      status: 'edited',
      at: new Date().toISOString(),
      by: requester.trim(),
      note: 'แก้ไขรายละเอียดคำขอ'
    };
    const history = [...(current.rows[0].history || []), event];
    const result = await client.query(`
      UPDATE asset_requests
      SET requester = $1,
          department = $2,
          item_type = $3,
          purpose = $4,
          due_date = $5,
          notes = $6,
          history = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      requester.trim(),
      department.trim(),
      itemType.trim(),
      purpose.trim(),
      dueDate || null,
      typeof notes === 'string' ? notes.trim() : '',
      JSON.stringify(history),
      id
    ]);
    if (current.rows[0].assigned_asset_sn && ['approved', 'issued', 'overdue', 'return_requested'].includes(current.rows[0].status)) {
      await client.query(`
        UPDATE assets
        SET user_name = $1::text,
            position = $2::text,
            details = details || jsonb_build_object('user', $1::text, 'position', $2::text)
        WHERE sn = $3
      `, [requester.trim(), department.trim(), current.rows[0].assigned_asset_sn]);
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error editing asset request:', err);
    res.status(500).json({ error: 'แก้ไขคำขอไม่สำเร็จ' });
  } finally {
    if (client) client.release();
  }
});

app.patch('/api/asset-requests/:id/action', requireRole('staff'), async (req, res) => {
  const id = Number(req.params.id);
  const { action, reviewer, assetSn, condition, note, requesterIdentity, workflowType } = req.body;
  const normalizedWorkflowType = ['checkout', 'replacement', 'resignation'].includes(workflowType) ? workflowType : null;
  const allowedActions = ['approve', 'reject', 'issue', 'request_return', 'return'];
  if (!Number.isInteger(id) || !allowedActions.includes(action)) {
    return res.status(400).json({ error: 'คำสั่งไม่ถูกต้อง' });
  }
  if (action !== 'request_return' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'เฉพาะผู้ดูแล IT เท่านั้นที่ดำเนินการขั้นตอนนี้ได้' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const requestResult = await client.query('SELECT * FROM asset_requests WHERE id = $1 FOR UPDATE', [id]);
    if (requestResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'ไม่พบคำขอ' });
    }
    const request = requestResult.rows[0];
    let nextStatus;
    let assignedSn = request.assigned_asset_sn;
    let assetStatus = null;

    if (action === 'approve') {
      if (request.status !== 'pending' && request.status !== 'need_info') throw new Error('คำขอนี้ไม่อยู่ในสถานะรออนุมัติ');
      assignedSn = Number(assetSn);
      const assetResult = await client.query('SELECT * FROM assets WHERE sn = $1 FOR UPDATE', [assignedSn]);
      if (assetResult.rowCount === 0) throw new Error('ไม่พบอุปกรณ์ที่เลือก');
      if (normalizeAssetStatus(assetResult.rows[0].status) !== 'ว่าง') throw new Error('อุปกรณ์นี้ไม่ว่างหรือถูกจองแล้ว');
      nextStatus = 'approved';
      assetStatus = 'จอง';
    } else if (action === 'reject') {
      if (request.status !== 'pending' && request.status !== 'need_info') throw new Error('คำขอนี้ไม่สามารถปฏิเสธได้');
      nextStatus = 'rejected';
    } else if (action === 'issue') {
      if (request.status !== 'approved') throw new Error('ต้องอนุมัติคำขอก่อนส่งมอบ');
      nextStatus = 'issued';
      assetStatus = 'ใช้งาน';
    } else if (action === 'request_return') {
      if (request.status !== 'issued' && request.status !== 'overdue') throw new Error('รายการนี้ไม่อยู่ในสถานะที่แจ้งขอคืนได้');
      if (!matchesRequesterIdentity(requesterIdentity, request.requester)) {
        throw new Error('ชื่อผู้คืนไม่ตรงกับผู้เบิกอุปกรณ์');
      }
      nextStatus = 'return_requested';
    } else {
      if (request.status !== 'return_requested') throw new Error('ผู้ใช้งานยังไม่ได้แจ้งขอคืนอุปกรณ์');
      if (!['ปกติ', 'ชำรุด', 'สูญหาย'].includes(condition)) throw new Error('กรุณาระบุสภาพอุปกรณ์ที่รับคืน');
      nextStatus = 'returned';
      assetStatus = condition === 'ชำรุด' ? 'รอซ่อม' : condition === 'สูญหาย' ? 'สูญหาย' : 'ว่าง';
    }

    // For return requests without assigned asset, find the asset by matching requester + item_type
    if (action === 'return' && assetStatus && !assignedSn) {
      let matchResult;
      const requesterName = String(request.requester).trim();
      const firstWord = requesterName.split(' ')[0]; // take just the first name for fuzzy match
      const reqItemType = String(request.item_type || '').trim();

      // First try: exact match by requester name + item_type
      matchResult = await client.query(
        `SELECT sn FROM assets WHERE user_name ILIKE $1 AND item_type ILIKE $2 AND status = 'ใช้งาน' LIMIT 1`,
        [`%${requesterName}%`, `%${reqItemType}%`]
      );

      // Second try: match by first name only + item_type
      if (!matchResult || matchResult.rowCount === 0) {
        matchResult = await client.query(
          `SELECT sn FROM assets WHERE user_name ILIKE $1 AND item_type ILIKE $2 AND status = 'ใช้งาน' LIMIT 1`,
          [`%${firstWord}%`, `%${reqItemType}%`]
        );
      }

      // Third try: match by first name only
      if (!matchResult || matchResult.rowCount === 0) {
        matchResult = await client.query(
          `SELECT sn FROM assets WHERE user_name ILIKE $1 AND status = 'ใช้งาน' LIMIT 1`,
          [`%${firstWord}%`]
        );
      }

      if (matchResult && matchResult.rowCount > 0) {
        assignedSn = matchResult.rows[0].sn;
      }
    }

    if (assetStatus && assignedSn) {
      await client.query(`
        UPDATE assets
        SET status = $1::text,
            user_name = CASE WHEN $1::text = 'ว่าง' THEN 'ส่วนกลาง' ELSE $2::text END,
            position = CASE WHEN $1::text = 'ว่าง' THEN '-' ELSE position END,
            details = details || jsonb_build_object(
              'status', $1::text,
              'user', CASE WHEN $1::text = 'ว่าง' THEN 'ส่วนกลาง' ELSE $2::text END,
              'position', CASE WHEN $1::text = 'ว่าง' THEN '-' ELSE position END
            )
        WHERE sn = $3
      `, [assetStatus, request.requester, assignedSn]);
    }

    if (action === 'return' && condition === 'ชำรุด' && assignedSn) {
      const monthResult = await client.query(`
        SELECT month_key
        FROM monthly_data
        ORDER BY (month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM')) DESC, month_key DESC
        LIMIT 1
      `);
      if (monthResult.rowCount > 0) {
        const repairMonthKey = monthResult.rows[0].month_key;
        // await client.query('SELECT pg_advisory_xact_lock(42001)');
        const snResult = await client.query('SELECT COALESCE(MAX(sn), 0) + 1 AS next_sn FROM tickets');
        const nextTicketSn = Number(snResult.rows[0].next_sn);
        const assetResult = await client.query('SELECT device_serial, item_type FROM assets WHERE sn = $1', [assignedSn]);
        const asset = assetResult.rows[0] || {};
        await client.query(`
          INSERT INTO tickets (
            sn, month_key, date, complainant, email, anydesk, issue, cause,
            duration, responder, status, cost, asset_sn, source
          ) VALUES ($1, $2, TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'), $3, '-', '-', $4, '-',
                    '-', $5, 'กำลังดำเนินการ', 0, $6, 'asset_workflow')
        `, [
          nextTicketSn,
          repairMonthKey,
          `${request.requester} (${request.department})`,
          `[${asset.item_type || request.item_type}] เครื่อง ${asset.device_serial || assignedSn} ชำรุดจากการรับคืน`,
          reviewer || 'IT',
          assignedSn
        ]);
      }
    }

    const event = { status: nextStatus, at: new Date().toISOString(), by: reviewer || request.requester, note: note || '' };
    const updated = await client.query(`
      UPDATE asset_requests
      SET status = $1::text,
          assigned_asset_sn = $2,
          reviewer = COALESCE($3, reviewer),
          issue_date = CASE WHEN $1::text = 'issued' THEN NOW() ELSE issue_date END,
          return_date = CASE WHEN $1::text = 'returned' THEN NOW() ELSE return_date END,
          return_condition = CASE WHEN $1::text = 'returned' THEN $4::text ELSE return_condition END,
          notes = CASE WHEN $5 <> '' THEN CONCAT_WS(E'\n', NULLIF(notes, ''), $5) ELSE notes END,
          history = history || $6::jsonb,
          workflow_type = COALESCE($8, workflow_type),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [nextStatus, assignedSn, reviewer || null, condition || null, note || '', JSON.stringify([event]), id, normalizedWorkflowType]);
    await refreshOperationalCounters(client);
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (rbErr) { console.error('Rollback failed:', rbErr.message); }
    }
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/clinic-data', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'Update', 'fern-clinic-customer-report.xls');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (err) {
    console.error('Error reading clinic data:', err);
    res.status(500).json({ error: 'Failed to read clinic data' });
  }
});

app.get('/api/inventory-data', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'Update', 'Inventory_Inventory_Results.xlsx');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Inventory file not found' });
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const formatDate = (value) => {
      if (!value) return '';
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    };
    res.json(repairThaiTextDeep(rows.map((row, i) => ({
      sn: row['Nember'] || i + 1,
      submittedOn: formatDate(row['Submitted on']),
      respondent: row['Respondents'],
      date: formatDate(row['วันที่เบิกใช้งาน']),
      user: row['บุคคลเบิกใช้อุปกรณ์'] || 'ส่วนกลาง/ไม่ระบุ',
      position: row['ตำแหน่ง'] || '-',
      itemType: row['รายการอุปกรณ์หลัก'] || 'อุปกรณ์เสริม/อื่นๆ',
      additionalEquipment: row['อุปกรณ์เพิ่มเติมที่ต้องการเบิก'],
      softwareApp: row['ซอต์ฟแวร์/ App'],
      registeredEmail: row['เมลที่ลงทะเบียน'],
      deviceSerial: row['หมายเลขอุปกรณ์ (เช่น  Ipad 016)'] || '-',
      additionalSerial: row['หมายเลขอุปกรณ์ เพิ่มเติม  (เช่น  สาย อะเเดปเตอร์ ipad-011))'],
      returnDueDate: formatDate(row['กำหนดคืนอุปกรณ์']),
      status: normalizeAssetStatus(row['สถานะ']),
      notes: row['หมายเหตุ'],
      inspectionDate: formatDate(row['วันที่ตรวจสอบ']),
      purchaseDate: formatDate(row['วันที่ซื้อ']),
      productionYear: row['ปีที่ผลิต'] || row['ปีผลิต'] || '',
      warrantyEndDate: formatDate(row['วันหมดประกัน']),
      expense: Number(row['ค่าใช้จ่าย']) || 0
    }))));
  } catch (err) {
    console.error('Error reading inventory data:', err);
    res.status(500).json({ error: 'Failed to read inventory data' });
  }
});

app.post('/api/sync-all', requireRole('admin'), async (req, res) => {
  const { data, assetsList } = req.body;
  if (!data || !assetsList) {
    return res.status(400).json({ error: 'Missing data or assetsList' });
  }

  let client;
  try {
    const finiteNumber = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const integerNumber = (value, fallback = 0) => Math.trunc(finiteNumber(value, fallback));

    client = await pool.connect();
    await client.query('BEGIN');
    // Serialize full snapshots and only replace the months explicitly included
    // in this payload. Older browsers must never delete newer month records.
    // await client.query('SELECT pg_advisory_xact_lock(42002)');
    await client.query(`
      INSERT INTO monthly_data_snapshots (snapshot)
      SELECT COALESCE(jsonb_agg(to_jsonb(month_row) ORDER BY month_row.month_key), '[]'::jsonb)
      FROM monthly_data month_row
    `);
    await client.query(`
      DELETE FROM monthly_data_snapshots
      WHERE id NOT IN (
        SELECT id FROM monthly_data_snapshots ORDER BY id DESC LIMIT 50
      )
    `);

    // Keep assets assigned to active requests even if an older browser snapshot
    // does not contain them. This prevents dangling issue/return workflows.
    await client.query(`
      CREATE TEMP TABLE preserved_workflow_assets ON COMMIT DROP AS
      SELECT a.*
      FROM assets a
      JOIN asset_requests r ON r.assigned_asset_sn = a.sn
      WHERE r.status IN ('approved', 'issued', 'overdue', 'return_requested')
    `);

    // Keep workflow-controlled status/user authoritative when a browser sends an
    // older full asset snapshot during automatic synchronization.
    await client.query('DELETE FROM assets');
    await client.query(`
      INSERT INTO assets (sn, date, user_name, position, item_type, device_serial, status, notes, details)
      SELECT
        COALESCE(NULLIF(asset_row.item->>'sn', '')::integer, asset_row.ordinality::integer),
        COALESCE(asset_row.item->>'date', ''),
        COALESCE(assignment.requester, NULLIF(asset_row.item->>'user', ''), 'ส่วนกลาง'),
        COALESCE(NULLIF(asset_row.item->>'position', ''), '-'),
        COALESCE(asset_row.item->>'itemType', ''),
        COALESCE(NULLIF(asset_row.item->>'deviceSerial', ''), '-'),
        COALESCE(
          CASE WHEN assignment.status = 'approved' THEN 'จอง'
               WHEN assignment.status IN ('issued', 'overdue', 'return_requested') THEN 'ใช้งาน'
          END,
          NULLIF(asset_row.item->>'status', ''),
          'ใช้งาน'
        ),
        COALESCE(asset_row.item->>'notes', ''),
        asset_row.item || jsonb_build_object(
          'user', COALESCE(assignment.requester, NULLIF(asset_row.item->>'user', ''), 'ส่วนกลาง'),
          'status', COALESCE(
            CASE WHEN assignment.status = 'approved' THEN 'จอง'
                 WHEN assignment.status IN ('issued', 'overdue', 'return_requested') THEN 'ใช้งาน'
            END,
            NULLIF(asset_row.item->>'status', ''),
            'ใช้งาน'
          )
        )
      FROM jsonb_array_elements($1::jsonb) WITH ORDINALITY AS asset_row(item, ordinality)
      LEFT JOIN asset_requests assignment
        ON assignment.assigned_asset_sn = COALESCE(NULLIF(asset_row.item->>'sn', '')::integer, asset_row.ordinality::integer)
       AND assignment.status IN ('approved', 'issued', 'overdue', 'return_requested')
    `, [JSON.stringify(assetsList)]);

    await client.query(`
      INSERT INTO assets (sn, date, user_name, position, item_type, device_serial, status, notes, details)
      SELECT sn, date, user_name, position, item_type, device_serial, status, notes, details
      FROM preserved_workflow_assets preserved
      WHERE NOT EXISTS (SELECT 1 FROM assets current_asset WHERE current_asset.sn = preserved.sn)
    `);

    const ticketPayload = [];
    for (const [monthKey, monthData] of Object.entries(data)) {
      await client.query('DELETE FROM monthly_data WHERE month_key = $1', [monthKey]);
      // API-created tickets remain authoritative. Dashboard tickets are replaced
      // only for the same month, preserving records from newer/unseen months.
      await client.query(
        `DELETE FROM tickets WHERE source = 'dashboard' AND month_key = $1`,
        [monthKey]
      );
      await client.query(`
        INSERT INTO monthly_data (
          month_key, month_name, total_assets, asset_value, assets_expiring, assets_broken, assets_lost, assets_vacant,
          tickets_count, sla_percent, response_time, resolution_time, csat, total_software, licenses_in_use, licenses_vacant,
          software_cost, software_annual_cost, software_expiring, backup_success, security_incidents, antivirus_coverage, mfa_coverage,
          repair_count, repair_cost, top_broken_devices, dept_costs, software_expiring_details, assets_expiring_details,
          ongoing_projects, vendor_contracts, recommendations
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
      `, [
        monthKey,
        monthData.monthName,
        integerNumber(monthData.totalAssets),
        finiteNumber(monthData.assetValue),
        integerNumber(monthData.assetsExpiring),
        integerNumber(monthData.assetsBroken),
        integerNumber(monthData.assetsLost),
        integerNumber(monthData.assetsVacant),
        integerNumber(monthData.ticketsCount),
        finiteNumber(monthData.slaPercent),
        integerNumber(monthData.responseTime),
        finiteNumber(monthData.resolutionTime),
        finiteNumber(monthData.csat),
        integerNumber(monthData.totalSoftware),
        finiteNumber(monthData.licensesInUse),
        finiteNumber(monthData.licensesVacant),
        finiteNumber(monthData.softwareCost),
        finiteNumber(monthData.softwareAnnualCost),
        integerNumber(monthData.softwareExpiring),
        finiteNumber(monthData.backupSuccess),
        integerNumber(monthData.securityIncidents),
        finiteNumber(monthData.antivirusCoverage),
        finiteNumber(monthData.mfaCoverage),
        integerNumber(monthData.repairCount),
        finiteNumber(monthData.repairCost),
        JSON.stringify(monthData.topBrokenDevices || []),
        JSON.stringify(monthData.deptCosts || {}),
        JSON.stringify(monthData.softwareExpiringDetails || []),
        JSON.stringify(monthData.assetsExpiringDetails || []),
        JSON.stringify(monthData.ongoingProjects || []),
        JSON.stringify(monthData.vendorContracts || []),
        JSON.stringify(monthData.recommendations || [])
      ]);

      const ticketsList = monthData.ticketsList || [];
      for (const ticket of ticketsList) {
        const ticketSn = Number(ticket.sn);
        if (!Number.isInteger(ticketSn) || ticketSn <= 0) continue;
        ticketPayload.push({
          sn: ticketSn,
          monthKey,
          date: ticket.date || '',
          complainant: ticket.complainant || 'ไม่ระบุชื่อ',
          email: ticket.email || '-',
          anydesk: ticket.anydesk || '-',
          issue: ticket.issue || '',
          cause: ticket.cause || '-',
          duration: ticket.duration || '-',
          responder: ticket.responder || '-',
          status: ticket.status || 'กำลังดำเนินการ',
          cost: finiteNumber(ticket.cost),
          source: ticket.source === 'request_form' ? 'request_form' : 'dashboard',
          attachmentData: ticket.attachmentData || null,
          attachmentName: ticket.attachmentName || null
        });
      }
    }

    if (ticketPayload.length > 0) {
      await client.query(`
        INSERT INTO tickets (
          sn, month_key, date, complainant, email, anydesk, issue, cause,
          duration, responder, status, cost, source, attachment_data, attachment_name
        )
        SELECT
          (ticket.item->>'sn')::integer,
          ticket.item->>'monthKey',
          COALESCE(ticket.item->>'date', ''),
          COALESCE(NULLIF(ticket.item->>'complainant', ''), 'ไม่ระบุชื่อ'),
          COALESCE(NULLIF(ticket.item->>'email', ''), '-'),
          COALESCE(NULLIF(ticket.item->>'anydesk', ''), '-'),
          COALESCE(ticket.item->>'issue', ''),
          COALESCE(NULLIF(ticket.item->>'cause', ''), '-'),
          COALESCE(NULLIF(ticket.item->>'duration', ''), '-'),
          COALESCE(NULLIF(ticket.item->>'responder', ''), '-'),
          COALESCE(NULLIF(ticket.item->>'status', ''), 'กำลังดำเนินการ'),
          COALESCE((ticket.item->>'cost')::numeric, 0),
          COALESCE(NULLIF(ticket.item->>'source', ''), 'dashboard'),
          NULLIF(ticket.item->>'attachmentData', ''),
          NULLIF(ticket.item->>'attachmentName', '')
        FROM jsonb_array_elements($1::jsonb) AS ticket(item)
        ON CONFLICT (sn) DO UPDATE SET
          month_key = EXCLUDED.month_key,
          date = EXCLUDED.date,
          complainant = EXCLUDED.complainant,
          email = EXCLUDED.email,
          anydesk = EXCLUDED.anydesk,
          issue = EXCLUDED.issue,
          cause = EXCLUDED.cause,
          duration = EXCLUDED.duration,
          responder = EXCLUDED.responder,
          status = EXCLUDED.status,
          cost = EXCLUDED.cost,
          source = CASE WHEN tickets.source = 'request_form' THEN tickets.source ELSE EXCLUDED.source END,
          attachment_data = COALESCE(EXCLUDED.attachment_data, tickets.attachment_data),
          attachment_name = COALESCE(EXCLUDED.attachment_name, tickets.attachment_name)
      `, [JSON.stringify(ticketPayload)]);
    }

    await reconcileAssetRequestWorkflow(client);
    await normalizeVacantAssetOwnership(client);

    // Preserve the values entered in the full dashboard editor. Operational
    // workflow endpoints recalculate their own counters when a ticket or asset
    // request changes; recalculating here would immediately overwrite a manual
    // dashboard update after it was saved.

    await client.query('COMMIT');
    res.json({ success: true, message: 'All state synchronized successfully' });
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error syncing all state:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
});
app.post('/api/reset-database', requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      TRUNCATE TABLE 
        monthly_data_snapshots,
        asset_requests,
        assets,
        tickets,
        monthly_data
      RESTART IDENTITY CASCADE;
    `);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Database has been completely wiped.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend Server is running on port ${PORT}`);
  });
});

app.post('/api/test-line-notify', requireRole('admin'), async (req, res) => {
  const token = req.body?.token || process.env.LINE_NOTIFY_TOKEN;
  if (!token) {
    return res.status(400).json({ error: 'ไม่พบ LINE Notify Token (กรุณาระบุ Token ในการทดสอบ)' });
  }
  try {
    const params = new URLSearchParams();
    params.append('message', '\n🔔 [ทดสอบการเชื่อมต่อ LINE Notify]\nระบบ FERN AESTHETIQUE IT Operations เชื่อมต่อสำเร็จ!');
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: params
    });
    if (response.ok) {
      return res.json({ success: true, message: 'ส่งข้อความทดสอบเข้า LINE Notify สำเร็จ' });
    }
    const data = await response.json().catch(() => ({}));
    return res.status(400).json({ error: data.message || 'ส่งข้อความไม่สำเร็จ Token อาจไม่ถูกต้อง' });
  } catch (err) {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE Notify: ' + err.message });
  }
});
