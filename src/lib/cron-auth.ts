import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type CronSecretName = 'CRON_SECRET' | 'CLOUD_HERMES_CRON_SECRET'
type CronEnvironment = Readonly<
  Partial<Record<CronSecretName | 'CREDENTIALS_DIRECTORY', string>>
>

function readSystemdCredential(environment: CronEnvironment): string | undefined {
  const credentialsDirectory = environment.CREDENTIALS_DIRECTORY
  if (!credentialsDirectory) return undefined

  try {
    return readFileSync(join(credentialsDirectory, 'cron-secret'), 'utf8').trim() || undefined
  } catch {
    return undefined
  }
}

export function isAuthorizedCronRequest(
  authorization: string | null,
  environment: CronEnvironment = process.env as CronEnvironment
) {
  if (!authorization) return false

  const acceptedSecrets = [
    environment.CRON_SECRET,
    environment.CLOUD_HERMES_CRON_SECRET,
    readSystemdCredential(environment),
  ].filter((secret): secret is string => Boolean(secret))

  return acceptedSecrets.some((secret) => authorization === `Bearer ${secret}`)
}
