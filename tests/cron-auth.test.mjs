import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { isAuthorizedCronRequest } from '../src/lib/cron-auth.ts'

test('accepts the primary cron secret during credential transition', () => {
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

test('accepts the protected systemd credential used by the VPS service', () => {
  const credentialsDirectory = mkdtempSync(join(tmpdir(), 'tx-hs-cron-'))

  try {
    writeFileSync(join(credentialsDirectory, 'cron-secret'), 'vps-secret\n', {
      mode: 0o600,
    })

    assert.equal(
      isAuthorizedCronRequest('Bearer vps-secret', { CREDENTIALS_DIRECTORY: credentialsDirectory }),
      true
    )
  } finally {
    rmSync(credentialsDirectory, { recursive: true, force: true })
  }
})
