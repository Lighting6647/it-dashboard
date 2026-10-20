const DAY_MS = 24 * 60 * 60 * 1000;

function parseCalendarDate(value) {
  const text = String(value || '').trim();
  if (!text || text === '-') return null;

  let year;
  let month;
  let day;
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [, year, month, day] = match.map(Number);
  } else {
    match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!match) return null;
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  }

  if (year >= 2400) year -= 543;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) return null;
  return parsed;
}

export function findLicensesExpiringInDays(licenses, today, daysAhead = 3) {
  const baseDate = parseCalendarDate(today);
  if (!baseDate || !Array.isArray(licenses)) return [];
  const targetTime = baseDate.getTime() + (Number(daysAhead) * DAY_MS);
  return licenses.filter((license) => parseCalendarDate(license?.expiringDate)?.getTime() === targetTime);
}

function formatBaht(value) {
  const amount = Number(value || 0);
  return `฿${Number.isFinite(amount) ? amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}`;
}

export function buildLicenseExpiryMessage(licenses, today, daysAhead = 3) {
  const lines = [
    `🔔 แจ้งเตือนวันหมดสัญญา License ล่วงหน้า ${daysAhead} วัน`,
    `วันที่ตรวจสอบ: ${today}`,
    '',
  ];
  licenses.forEach((license, index) => {
    lines.push(`${index + 1}. ${license.name || 'ไม่ระบุชื่อโปรแกรม'}`);
    lines.push(`• Owner/แผนก: ${license.owner || '-'}`);
    lines.push(`• วันหมดสัญญา: ${license.expiringDate || '-'}`);
    lines.push(`• ราคา: ${formatBaht(license.monthlyCost ?? license.price)}`);
    lines.push(`• อีเมลสมัคร: ${license.registeredEmail || '-'}`);
    if (index < licenses.length - 1) lines.push('');
  });
  lines.push('', 'กรุณาตรวจสอบและดำเนินการต่ออายุสัญญา');
  return lines.join('\n');
}

export function isAllowedLarkWebhook(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:'
      && ['open.larksuite.com', 'open.feishu.cn'].includes(url.hostname)
      && url.pathname.startsWith('/open-apis/bot/v2/hook/');
  } catch {
    return false;
  }
}

export async function sendLarkText(webhookUrl, text, fetchImpl = fetch) {
  if (!isAllowedLarkWebhook(webhookUrl)) throw new Error('Lark Webhook URL ไม่ถูกต้อง');
  const response = await fetchImpl(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg_type: 'text', content: { text } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data.code !== undefined && Number(data.code) !== 0)) {
    throw new Error(data.msg || data.message || `Lark ตอบกลับ HTTP ${response.status}`);
  }
  return data;
}
