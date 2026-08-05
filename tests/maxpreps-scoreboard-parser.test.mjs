import assert from 'node:assert/strict';
import test from 'node:test';

import { parseMaxPrepsScoreboard } from '../src/lib/maxpreps.ts';

function contest({
  id = 'game-1',
  state = 'pregame',
  live = '0',
  details = '7:30p',
  awayScore,
  homeScore,
  date = '8-28-2026',
} = {}) {
  const score = (value) => value === undefined ? '' : `<div class="score">${value}</div>`;
  return `
    <li class="c" data-teams="home-id,away-id" data-contest-id="${id}">
      <div class="contest-box-item" data-contest-state="${state}" data-contest-live="${live}">
        <a href="https://www.maxpreps.com/tx/football/game/away-vs-home/${date}/?c=${id}" class="c-c">
          <ul class="teams">
            <li><span data-lazy-image="https://img.example/away.png?x=1&amp;y=2"></span>${score(awayScore)}<div class="name">Away &amp; Co.</div></li>
            <li><span data-lazy-image="https://img.example/home.png"></span>${score(homeScore)}<div class="name">Home</div></li>
          </ul>
          <div class="details">${details}</div>
        </a>
      </div>
    </li>`;
}

test('official scoreboard cards preserve team order, classification, and published Central time', () => {
  const games = parseMaxPrepsScoreboard(contest(), '5A D1', 3);

  assert.equal(games.length, 1);
  assert.deepEqual(games[0], {
    gameId: 'game-1',
    homeTeam: 'Home',
    homeTeamId: 'home-id',
    homeTeamLogo: 'https://img.example/home.png',
    awayTeam: 'Away & Co.',
    awayTeamId: 'away-id',
    awayTeamLogo: 'https://img.example/away.png?x=1&y=2',
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    startTime: '2026-08-28T19:30:00-05:00',
    hasPublishedTime: true,
    venue: '',
    city: '',
    classification: '5A D1',
    week: 3,
    isPlayoff: false,
  });
});

test('final score markers are parsed, while absent scores are never changed to zero', () => {
  const finalGame = parseMaxPrepsScoreboard(contest({ state: 'postgame', details: 'Final', awayScore: 21, homeScore: 35 }), '4A D2');
  const tbaGame = parseMaxPrepsScoreboard(contest({ id: 'game-tba', details: 'TBA', date: '11-6-2026' }), '2A D1');

  assert.equal(finalGame[0].status, 'final');
  assert.equal(finalGame[0].awayScore, 21);
  assert.equal(finalGame[0].homeScore, 35);
  assert.equal(tbaGame[0].startTime, '2026-11-06');
  assert.equal(tbaGame[0].hasPublishedTime, false);
  assert.equal(tbaGame[0].awayScore, null);
  assert.equal(tbaGame[0].homeScore, null);
});

test('midnight source placeholders are not presented as real kickoffs', () => {
  const midnight = parseMaxPrepsScoreboard(contest({ id: 'game-midnight', details: '12:00a', date: '8-13-2026' }), '5A D2');

  assert.equal(midnight[0].startTime, '2026-08-13T00:00:00-05:00');
  assert.equal(midnight[0].hasPublishedTime, false);
});

test('cancelled and postponed games retain distinct official states', () => {
  const cancelled = parseMaxPrepsScoreboard(contest({ id: 'cancelled', state: 'cancelled', details: 'Cancelled' }), '5A D2');
  const postponed = parseMaxPrepsScoreboard(contest({ id: 'postponed', state: 'postponed', details: 'Postponed' }), '5A D2');

  assert.equal(cancelled[0].status, 'cancelled');
  assert.equal(postponed[0].status, 'postponed');
});
