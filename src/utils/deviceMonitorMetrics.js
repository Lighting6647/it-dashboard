const normalizeSerial = (value) => String(value || '')
  .trim()
  .toLocaleLowerCase('en-US')
  .replace(/[^a-z0-9ก-๙]/g, '');

const normalizeStatus = (value) => String(value || '')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .trim();

export function reconcileDeviceMonitorCoverage(assets = [], monitoredDevices = []) {
  const monitoredSerials = new Set(
    monitoredDevices.map((device) => normalizeSerial(device.deviceNumber)).filter(Boolean)
  );
  const assignedAssets = assets.filter((asset) => normalizeStatus(asset.status) === 'ใช้งาน');
  const missingAssignedAssets = assignedAssets.filter((asset) => {
    const serial = normalizeSerial(asset.deviceSerial);
    return !serial || !monitoredSerials.has(serial);
  });
  const excludedByStatusCount = assets.filter((asset) =>
    ['ชำรุด', 'รอซ่อม', 'สูญหาย'].includes(normalizeStatus(asset.status))
  ).length;
  const returnedCount = assets.filter((asset) =>
    ['ว่าง', 'พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้'].includes(normalizeStatus(asset.status))
  ).length;

  return {
    assignedCount: assignedAssets.length,
    monitoredCount: monitoredDevices.length,
    missingAssignedCount: missingAssignedAssets.length,
    excludedByStatusCount,
    notTrackedCount: excludedByStatusCount + missingAssignedAssets.length,
    returnedCount,
    missingAssignedAssets
  };
}
