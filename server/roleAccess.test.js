import test from 'node:test';
import assert from 'node:assert/strict';

import { requireRole } from './roleAccess.js';

function runGuard(actualRole, minimumRole) {
  let statusCode = null;
  let body = null;
  let nextCalled = false;
  const req = actualRole ? { user: { role: actualRole } } : {};
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };

  requireRole(minimumRole)(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, body, nextCalled };
}

test('staff passes operational staff guards', () => {
  assert.deepEqual(runGuard('staff', 'staff'), {
    statusCode: null,
    body: null,
    nextCalled: true,
  });
});

test('staff remains blocked by administrator guards', () => {
  assert.deepEqual(runGuard('staff', 'admin'), {
    statusCode: 403,
    body: { message: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ' },
    nextCalled: false,
  });
});

test('viewer and unauthenticated requests cannot pass staff guards', () => {
  for (const role of ['viewer', null]) {
    assert.equal(runGuard(role, 'staff').statusCode, 403);
    assert.equal(runGuard(role, 'staff').nextCalled, false);
  }
});
