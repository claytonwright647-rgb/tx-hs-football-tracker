type CronSecretName = 'CRON_SECRET' | 'CLOUD_HERMES_CRON_SECRET'
type CronEnvironment = Readonly<Partial<Record<CronSecretName, string>>>

export function isAuthorizedCronRequest(
  authorization: string | null,
  environment: CronEnvironment = process.env as CronEnvironment
) {
  if (!authorization) return false

  const acceptedSecrets = [
    environment.CRON_SECRET,
    environment.CLOUD_HERMES_CRON_SECRET,
  ].filter((secret): secret is string => Boolean(secret))

  return acceptedSecrets.some((secret) => authorization === `Bearer ${secret}`)
}
