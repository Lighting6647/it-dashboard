import test from 'node:test';
import assert from 'node:assert/strict';

import { reconcileDeviceMonitorCoverage } from './deviceMonitorMetrics.js';

test('separates returned inventory from assigned assets missing in Device Monitor', () => {
  const assets = [
    { status: 'ใช้งาน', deviceSerial: 'NB-001' },
    { status: 'ใช้งาน', deviceSerial: '-' },
    { status: 'ชำรุด', deviceSerial: 'PC-002' },
    { status: 'สูญหาย', deviceSerial: 'IP-003' },
    { status: 'ว่าง', deviceSerial: 'NB-004' }
  ];
  const monitored = [{ deviceNumber: 'nb-001' }];

  assert.deepEqual(reconcileDeviceMonitorCoverage(assets, monitored), {
    assignedCount: 2,
    monitoredCount: 1,
    missingAssignedCount: 1,
    excludedByStatusCount: 2,
    notTrackedCount: 3,
    returnedCount: 1,
    missingAssignedAssets: [{ status: 'ใช้งาน', deviceSerial: '-' }]
  });
});

test('normalizes punctuation and casing when matching device serials', () => {
  const assets = [{ status: 'ใช้งาน', deviceSerial: 'MacBook Air-029' }];
  const monitored = [{ deviceNumber: 'macbookair029' }];

  assert.equal(reconcileDeviceMonitorCoverage(assets, monitored).missingAssignedCount, 0);
});
