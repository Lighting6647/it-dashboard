const splitTags = (value) => String(value || '')
  .split(/[,\n]+/)
  .map((tag) => tag.trim())
  .filter(Boolean);

export const mergeAssetTags = (existing, incoming) => {
  const result = [];
  const seen = new Set();
  [...splitTags(existing), ...splitTags(incoming)].forEach((tag) => {
    const key = tag.toLocaleLowerCase('th-TH');
    if (seen.has(key)) return;
    seen.add(key);
    result.push(tag);
  });
  return result.join(', ');
};

export const buildBulkAssetPatch = (asset, change) => {
  const value = String(change?.value ?? '').trim();
  if (!value) return { ...asset };
  if (change.field === 'additionalEquipment') {
    return { ...asset, additionalEquipment: mergeAssetTags(asset.additionalEquipment, value) };
  }
  const allowedFields = new Set(['itemType', 'position', 'status', 'notes']);
  if (!allowedFields.has(change.field)) return { ...asset };
  return { ...asset, [change.field]: value };
};
