import test from 'node:test';
import assert from 'node:assert/strict';

import { canAdministerSystem, canEditOperationalData } from './auth.js';

test('staff can edit operational records without receiving system administration rights', () => {
  assert.equal(canEditOperationalData('staff'), true);
  assert.equal(canAdministerSystem('staff'), false);
});

test('admin can edit operational records and administer the system', () => {
  assert.equal(canEditOperationalData('admin'), true);
  assert.equal(canAdministerSystem('admin'), true);
});

test('viewer and unknown roles cannot edit records or administer the system', () => {
  for (const role of ['viewer', '', undefined, 'unknown']) {
    assert.equal(canEditOperationalData(role), false);
    assert.equal(canAdministerSystem(role), false);
  }
});
