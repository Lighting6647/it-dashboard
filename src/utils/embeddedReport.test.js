import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmbeddedReportUrl } from './embeddedReport.js';

test('resolves the printer report inside the deployed application base path', () => {
  assert.equal(
    resolveEmbeddedReportUrl('/dashboard/', 'reports/printer-usage.html'),
    '/dashboard/reports/printer-usage.html'
  );
});

test('normalizes duplicate and missing path separators', () => {
  assert.equal(
    resolveEmbeddedReportUrl('/', '/reports/printer-usage.html'),
    '/reports/printer-usage.html'
  );
});
