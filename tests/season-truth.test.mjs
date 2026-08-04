import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { shouldFetchLiveData } from '../src/lib/seasonIntelligence.ts';

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

test('live score polling follows the actual season phase', () => {
  assert.equal(shouldFetchLiveData(new Date('2026-08-04T12:00:00-05:00')), false);
  assert.equal(shouldFetchLiveData(new Date('2026-08-22T12:00:00-05:00')), true);
  assert.equal(shouldFetchLiveData(new Date('2026-09-04T12:00:00-05:00')), true);
});

test('games API labels preseason unavailability and avoids year-round playoff polling', () => {
  const gamesRoute = readFileSync('src/app/api/games/route.ts', 'utf8');

  assert.match(gamesRoute, /sourceStatus:\s*'not_scheduled_for_current_phase'/);
  assert.match(gamesRoute, /if \(!shouldFetchLiveData\(now\)\)/);
  assert.match(gamesRoute, /\['playoffs', 'state_championships'\]\.includes\(phase\)/);
});
