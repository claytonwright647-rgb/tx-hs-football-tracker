import assert from 'node:assert/strict';
import test from 'node:test';

import { parseMaxPrepsScoreboard } from '../src/lib/maxpreps.ts';
import {
  lastKnownGoodSlate,
  normalizeOfficialProviderStatus,
  rememberOfficialSlate,
} from '../src/lib/official-game-replay.ts';

function providerCard({ state, live, details, awayScore, homeScore }) {
  const score = (value) => value === undefined ? '' : `<div class="score">${value}</div>`;
  return `
    <li class="c" data-teams="home-id,away-id" data-contest-id="replay-game">
      <div class="contest-box-item" data-contest-state="${state}" data-contest-live="${live}">
        <a href="https://www.maxpreps.com/tx/football/game/away-vs-home/9-4-2026/?c=replay-game">
          <ul class="teams">
            <li>${score(awayScore)}<div class="name">Away</div></li>
            <li>${score(homeScore)}<div class="name">Home</div></li>
          </ul>
          <div class="details">${details}</div>
        </a>
      </div>
    </li>`;
}

test('provider-shaped replay advances scheduled to live to supported halftime to final', () => {
  const frames = [
    { state: 'pregame', live: '0', details: '7:30p', status: 'scheduled', awayScore: undefined, homeScore: undefined },
    { state: 'inprogress', live: '1', details: 'Q1', status: 'in_progress', awayScore: 7, homeScore: 0 },
    { state: 'inprogress', live: '1', details: 'Halftime', status: 'halftime', awayScore: 14, homeScore: 14 },
    { state: 'postgame', live: '0', details: 'Final', status: 'final', awayScore: 21, homeScore: 28 },
  ];

  const cache = new Map();
  frames.forEach((frame, index) => {
    const [providerGame] = parseMaxPrepsScoreboard(providerCard(frame), '6A', 1);
    assert.ok(providerGame, `provider frame ${index + 1} should parse`);
    const normalized = {
      ...providerGame,
      status: normalizeOfficialProviderStatus(providerGame.status),
    };
    rememberOfficialSlate(cache, '2026-09-04', [normalized], 1_000 + index);

    const remembered = lastKnownGoodSlate(cache, '2026-09-04');
    assert.equal(remembered.games[0].status, frame.status);
    assert.equal(remembered.games[0].awayScore, frame.awayScore ?? null);
    assert.equal(remembered.games[0].homeScore, frame.homeScore ?? null);
  });
});

test('a subsequent provider failure retains the verified final snapshot', async () => {
  const cache = new Map();
  const [finalGame] = parseMaxPrepsScoreboard(providerCard({
    state: 'postgame',
    live: '0',
    details: 'Final',
    awayScore: 21,
    homeScore: 28,
  }), '6A', 1);
  rememberOfficialSlate(cache, '2026-09-04', [finalGame], 5_000);

  await assert.rejects(async () => {
    throw new Error('provider unavailable');
  }, /provider unavailable/);

  const fallback = lastKnownGoodSlate(cache, '2026-09-04');
  assert.ok(fallback);
  assert.equal(fallback.timestamp, 5_000);
  assert.equal(fallback.games[0].status, 'final');
  assert.equal(fallback.games[0].awayScore, 21);
  assert.equal(fallback.games[0].homeScore, 28);
});

test('last-known-good reads are copies and cannot erase the retained slate', () => {
  const cache = new Map();
  rememberOfficialSlate(cache, 'date', [{ id: 'game' }], 10);
  const firstRead = lastKnownGoodSlate(cache, 'date');
  firstRead.games.length = 0;

  assert.equal(lastKnownGoodSlate(cache, 'date').games.length, 1);
});
