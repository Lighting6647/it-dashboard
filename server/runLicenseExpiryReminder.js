import crypto from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';
import { pathToFileURL } from 'url';

import {
  buildLicenseExpiryMessage,
  findLicensesExpiringInDays,
  sendLarkText,
} from './licenseExpiryReminder.js';

dotenv.config();

function bangkokDateText(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function reminderKey(license) {
  return crypto.createHash('sha256').update([
    license.name,
    license.owner,
    license.registeredEmail,
    license.expiringDate,
  ].map((value) => String(value || '').trim()).join('|')).digest('hex');
}

export async function runLicenseExpiryReminder(pool, { now = new Date() } = {}) {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_delivery_log (
        channel VARCHAR(30) NOT NULL,
        notification_key VARCHAR(128) NOT NULL,
        notification_date DATE NOT NULL,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (channel, notification_key, notification_date)
      )
    `);

    const settingsResult = await client.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'lark_license_webhook'`,
    );
    const webhookUrl = settingsResult.rows[0]?.setting_value || process.env.LARK_LICENSE_WEBHOOK_URL || '';
    if (!webhookUrl) {
      console.log('Lark license reminder skipped: webhook is not configured.');
      return { sent: 0, reason: 'not_configured' };
    }

    const monthResult = await client.query(`
      SELECT month_key, software_expiring_details
      FROM monthly_data
      ORDER BY month_key DESC
      LIMIT 1
    `);
    if (!monthResult.rows.length) {
      console.log('Lark license reminder skipped: no monthly data.');
      return { sent: 0, reason: 'no_monthly_data' };
    }

    const today = bangkokDateText(now);
    const candidates = findLicensesExpiringInDays(
      monthResult.rows[0].software_expiring_details || [],
      today,
      3,
    );
    const unsent = [];
    for (const license of candidates) {
      const key = reminderKey(license);
      const prior = await client.query(`
        SELECT 1 FROM notification_delivery_log
        WHERE channel = 'lark_license_expiry'
          AND notification_key = $1
          AND notification_date = $2::date
      `, [key, today]);
      if (!prior.rows.length) unsent.push({ license, key });
    }

    if (!unsent.length) {
      console.log(`Lark license reminder: no new contracts expiring in 3 days (${today}).`);
      return { sent: 0, reason: 'no_new_expirations' };
    }

    await sendLarkText(webhookUrl, buildLicenseExpiryMessage(unsent.map(({ license }) => license), today, 3));
    for (const { key } of unsent) {
      await client.query(`
        INSERT INTO notification_delivery_log (channel, notification_key, notification_date)
        VALUES ('lark_license_expiry', $1, $2::date)
        ON CONFLICT DO NOTHING
      `, [key, today]);
    }
    console.log(`Lark license reminder sent: ${unsent.length} contract(s).`);
    return { sent: unsent.length, reason: 'sent' };
  } finally {
    client.release();
  }
}

async function runFromCommandLine() {
  const dbUrl = String(process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/i, '');
  if (!dbUrl) throw new Error('ไม่พบ DATABASE_URL');
  const isRenderInternal = dbUrl.includes('@dpg-') && !dbUrl.includes('.');
  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: (dbUrl && !isRenderInternal) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
  });
  try {
    await runLicenseExpiryReminder(pool);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runFromCommandLine().catch((error) => {
    console.error('Lark license reminder failed:', error);
    process.exitCode = 1;
  });
}
