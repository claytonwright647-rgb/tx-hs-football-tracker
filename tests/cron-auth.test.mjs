import assert from 'node:assert/strict'
import test from 'node:test'

import { isAuthorizedCronRequest } from '../src/lib/cron-auth.ts'

test('accepts the existing Vercel cron token during handoff', () => {
  assert.equal(
    isAuthorizedCronRequest('Bearer current-token', {
      CRON_SECRET: 'current-token',
    }),
    true
  )
})

test('accepts the destination-only Cloud Hermes token', () => {
  assert.equal(
    isAuthorizedCronRequest('Bearer destination-token', {
      CRON_SECRET: 'current-token',
      CLOUD_HERMES_CRON_SECRET: 'destination-token',
    }),
    true
  )
})

test('fails closed when tokens are absent or invalid', () => {
  assert.equal(isAuthorizedCronRequest(null, {}), false)
  assert.equal(isAuthorizedCronRequest('Bearer undefined', {}), false)
  assert.equal(
    isAuthorizedCronRequest('Bearer wrong-token', {
      CRON_SECRET: 'current-token',
      CLOUD_HERMES_CRON_SECRET: 'destination-token',
    }),
    false
  )
})
