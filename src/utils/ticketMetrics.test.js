import test from 'node:test';
import assert from 'node:assert/strict';

import { countPendingTicketClosures } from './ticketMetrics.js';

test('counts only tickets that are waiting for IT to close', () => {
  const tickets = [
    { status: 'กำลังดำเนินการ' },
    { status: 'เสร็จสิ้น' },
    { status: 'กำลังดำเนินการ' },
    { status: 'จ่ายเงินแล้ว' },
    { status: '' },
  ];

  assert.equal(countPendingTicketClosures(tickets), 2);
});

test('returns zero when the ticket list is unavailable', () => {
  assert.equal(countPendingTicketClosures(), 0);
});
