import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const intelligence = readFileSync('src/lib/seasonIntelligence.ts', 'utf8');
const header = readFileSync('src/components/Header.tsx', 'utf8');
const home = readFileSync('src/app/page.tsx', 'utf8');

test('August presentation comes from the shared season phase instead of an offseason label', () => {
  assert.match(intelligence, /getSeasonConfig\(getCurrentSeasonYear\(now\)\)/);
  assert.match(header, /getPhaseConfig\(getCurrentPhase\(\)\)/);
  assert.match(home, /\{currentPhase\.displayName\}/);
  assert.doesNotMatch(home, />Offseason Mode</);
});

test('public navigation uses the VPS domains', () => {
  assert.match(header, /https:\/\/wright-sports\.org/);
  assert.doesNotMatch(header, /wright-sports\.com/);
  assert.doesNotMatch(home, /wright-sports\.com/);
});
