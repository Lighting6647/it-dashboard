import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBulkAssetPatch, mergeAssetTags } from './assetBulkEdit.js';

test('mergeAssetTags appends new tags without duplicating existing tags', () => {
  assert.equal(mergeAssetTags('Mouse, Keyboard', 'keyboard, ADT'), 'Mouse, Keyboard, ADT');
});

test('buildBulkAssetPatch preserves untouched fields and applies the selected bulk change', () => {
  const asset = {
    user: 'ผู้ใช้เดิม', position: 'Admin', itemType: 'Notebook', additionalEquipment: 'Mouse',
    deviceSerial: 'NB-001', status: 'ใช้งาน', notes: 'เดิม'
  };

  assert.deepEqual(buildBulkAssetPatch(asset, { field: 'additionalEquipment', value: 'Keyboard' }), {
    ...asset,
    additionalEquipment: 'Mouse, Keyboard'
  });
  assert.deepEqual(buildBulkAssetPatch(asset, { field: 'status', value: 'รอซ่อม' }), {
    ...asset,
    status: 'รอซ่อม'
  });
});
