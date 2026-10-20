import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLicenseExpiryMessage,
  findLicensesExpiringInDays,
  isAllowedLarkWebhook,
} from './licenseExpiryReminder.js';

test('findLicensesExpiringInDays returns only contracts expiring exactly three Bangkok calendar days later', () => {
  const licenses = [
    { name: 'Adobe', expiringDate: '2026-10-23', owner: 'Graphic' },
    { name: 'Lark', expiringDate: '2026-10-24', owner: 'Center' },
    { name: 'No date', expiringDate: '-' },
  ];

  assert.deepEqual(
    findLicensesExpiringInDays(licenses, '2026-10-20', 3),
    [licenses[0]],
  );
});

test('findLicensesExpiringInDays accepts Thai Buddhist year dates from imported license data', () => {
  const license = { name: 'Canva', expiringDate: '23/10/2569' };

  assert.deepEqual(
    findLicensesExpiringInDays([license], '2026-10-20', 3),
    [license],
  );
});

test('buildLicenseExpiryMessage includes actionable contract details', () => {
  const message = buildLicenseExpiryMessage([
    {
      name: 'Adobe',
      owner: 'Graphic',
      expiringDate: '2026-10-23',
      monthlyCost: 2423,
      registeredEmail: 'graphic@example.com',
    },
  ], '2026-10-20', 3);

  assert.match(message, /แจ้งเตือนวันหมดสัญญา License ล่วงหน้า 3 วัน/);
  assert.match(message, /Adobe/);
  assert.match(message, /Graphic/);
  assert.match(message, /2,423/);
  assert.match(message, /graphic@example\.com/);
});

test('isAllowedLarkWebhook accepts only official HTTPS Lark bot webhook hosts', () => {
  assert.equal(isAllowedLarkWebhook('https://open.larksuite.com/open-apis/bot/v2/hook/abc'), true);
  assert.equal(isAllowedLarkWebhook('https://open.feishu.cn/open-apis/bot/v2/hook/abc'), true);
  assert.equal(isAllowedLarkWebhook('http://open.larksuite.com/open-apis/bot/v2/hook/abc'), false);
  assert.equal(isAllowedLarkWebhook('https://example.com/open-apis/bot/v2/hook/abc'), false);
});
