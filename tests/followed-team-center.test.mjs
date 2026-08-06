import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync('src/app/api/followed-teams/route.ts', 'utf8');
const center = readFileSync('src/components/FollowedTeamsCenter.tsx', 'utf8');
const home = readFileSync('src/app/page.tsx', 'utf8');
const scoreboard = readFileSync('src/app/scoreboard/page.tsx', 'utf8');

test('followed team center reads the internal verified Wright Sports feed', () => {
  assert.match(route, /sportsOrigin/);
  assert.match(route, /api\/hs-football-data\?section=all/);
  assert.match(route, /No score or game state is being guessed/);
});

test('Martin and Stephenville use full live-style cards without fabricated scores', () => {
  assert.match(center, /Martin Warriors/);
  assert.match(center, /Stephenville Yellow Jackets/);
  assert.match(center, /row\.score \?\? '—'/);
  assert.match(center, /game\.status === 'in'/);
  assert.match(center, /Watch on NFHS/);
  assert.match(center, /data\?\.hasLiveGames \? 30_000 : 300_000/);
});

test('followed cards explain the season road and keep schedule provenance visible', () => {
  assert.match(center, /Season road/);
  assert.match(center, /Game \$\{gameIndex \+ 1\} of \$\{games\.length\}/);
  assert.match(center, /roadAhead = games\.slice\(roadStart, roadStart \+ 3\)/);
  assert.match(center, /District play starts/);
  assert.match(center, /Full team schedule/);
  assert.match(center, /Schedule verified \{centralTimestamp\(team\.lastUpdated\)\}/);
});

test('followed cards explain schedule shape and the current season phase', () => {
  assert.match(center, /Schedule shape/);
  assert.match(center, /\{nonDistrictGames\} non-district · \{districtGames\} district/);
  assert.match(center, /\{homeGames\} home · \{awayGames\} away/);
  assert.match(center, /Current phase/);
  assert.match(center, /Why this phase matters:/);
  assert.match(center, /do not count in the district standings/);
  assert.match(center, /Next three scheduled games/);
});

test('followed teams appear ahead of the statewide scoreboard on both primary views', () => {
  assert.ok(home.indexOf('<FollowedTeamsCenter />') < home.indexOf('<Scoreboard />'));
  assert.ok(scoreboard.indexOf('<FollowedTeamsCenter />') < scoreboard.indexOf('<Scoreboard />'));
  assert.match(home, /Statewide live scores and schedules/);
});
