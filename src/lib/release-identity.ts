import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const RELEASE_SHA_UNAVAILABLE = 'unavailable';

const RELEASE_SHA_PATTERN = /^[0-9a-f]{40}$/i;

export function validReleaseSha(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return RELEASE_SHA_PATTERN.test(normalized) ? normalized.toLowerCase() : null;
}

export function releaseShaFromReceipt(receipt: unknown): string | null {
  if (typeof receipt !== 'string') return null;
  const commitLine = receipt
    .split(/\r?\n/)
    .find((line) => line.trim().toLowerCase().startsWith('commit='));
  return validReleaseSha(commitLine?.slice(commitLine.indexOf('=') + 1));
}

export function resolveReleaseSha({
  environment = {},
  receipt,
}: {
  environment?: Record<string, string | undefined>;
  receipt?: string | null;
} = {}): string {
  for (const candidate of [
    environment.RELEASE_SHA,
    environment.GIT_SHA,
    environment.COMMIT_SHA,
  ]) {
    const sha = validReleaseSha(candidate);
    if (sha) return sha;
  }

  return releaseShaFromReceipt(receipt) || RELEASE_SHA_UNAVAILABLE;
}

export function deployedReleaseSha(): string {
  let receipt: string | null = null;
  try {
    receipt = readFileSync(resolve(process.cwd(), 'DEPLOYMENT_RECEIPT.txt'), 'utf8');
  } catch {
    // Local development and incomplete releases may not have a deployment receipt.
  }

  return resolveReleaseSha({ environment: process.env, receipt });
}
