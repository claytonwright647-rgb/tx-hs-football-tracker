import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const config = readFileSync('next.config.ts', 'utf8');

test('all tracker pages receive baseline browser security headers', () => {
  for (const header of [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]) assert.match(config, new RegExp(header));
});

test('production output tracing stays inside the tracker release', () => {
  assert.match(config, /outputFileTracingRoot:\s*process\.cwd\(\)/);
});
