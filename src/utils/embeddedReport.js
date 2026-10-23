export function resolveEmbeddedReportUrl(basePath = '/', reportPath = '') {
  const normalizedBase = `/${String(basePath).replace(/^\/+|\/+$/g, '')}`;
  const normalizedReport = String(reportPath).replace(/^\/+/, '');
  return `${normalizedBase === '/' ? '' : normalizedBase}/${normalizedReport}`;
}
