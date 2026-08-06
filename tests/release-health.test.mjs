import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  RELEASE_SHA_UNAVAILABLE,
  releaseShaFromReceipt,
  resolveReleaseSha,
  validReleaseSha,
} from '../src/lib/release-identity.ts';

test('release identity accepts exact deployment SHAs and rejects descriptive, shortened, or malformed values', () => {
  assert.equal(validReleaseSha('ABCDEF1234567890ABCDEF1234567890ABCDEF12'), 'abcdef1234567890abcdef1234567890abcdef12');
  assert.equal(validReleaseSha('abcdef1'), null);
  assert.equal(validReleaseSha('main'), null);
  assert.equal(validReleaseSha('unknown'), null);
  assert.equal(validReleaseSha('1234'), null);
});

test('release identity prefers a valid runtime SHA and can read the deployment receipt', () => {
  const receipt = 'commit=f2bff5c9560ce2ced4b80c1b5cfb0a04591a0af2\ndeployed_at=2026-08-05T00:00:00Z\n';
  assert.equal(releaseShaFromReceipt(receipt), 'f2bff5c9560ce2ced4b80c1b5cfb0a04591a0af2');
  assert.equal(resolveReleaseSha({
    environment: { RELEASE_SHA: '383deb9bcd70cdf8ae22fc3fec6f3c1f7dd187c7' },
    receipt,
  }), '383deb9bcd70cdf8ae22fc3fec6f3c1f7dd187c7');
});

test('release identity reports unavailable instead of inventing a local or deployment SHA', () => {
  assert.equal(resolveReleaseSha({ environment: {}, receipt: null }), RELEASE_SHA_UNAVAILABLE);
  assert.equal(resolveReleaseSha({ environment: { RELEASE_SHA: 'development' }, receipt: 'commit=missing' }), RELEASE_SHA_UNAVAILABLE);
});

test('health endpoint exposes the same truthful release field on success and database failure', () => {
  const health = readFileSync('src/app/api/health/route.ts', 'utf8');
  assert.match(health, /const releaseSha = deployedReleaseSha\(\)/);
  assert.equal((health.match(/releaseSha,/g) || []).length, 2);
  assert.match(health, /database: 'connected'/);
  assert.match(health, /database: 'unavailable'/);
});
