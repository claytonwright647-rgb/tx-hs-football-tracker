import assert from 'node:assert/strict';
import test from 'node:test';

import { applyOfficialScheduleVerification } from '../src/lib/official-schedule-verification.ts';

function game(awayTeam, homeTeam, time = '2026-08-13T19:00:00-05:00') {
  return {
    id: `${awayTeam}-${homeTeam}`,
    awayTeam: { name: awayTeam },
    homeTeam: { name: homeTeam },
    date: '2026-08-13',
    time,
    hasPublishedTime: true,
    venue: '',
    city: '',
  };
}

test('school-confirmed schedule facts replace feed placeholders with provenance', () => {
  const ropes = applyOfficialScheduleVerification(game('Hale Center', 'Ropes'));
  assert.equal(ropes.time, '2026-08-13T17:00:00-05:00');
  assert.equal(ropes.venue, 'Ropes ISD');
  assert.equal(ropes.city, '304 Ranch St, Ropesville, TX 79358');
  assert.equal(ropes.scheduleVerification.status, 'confirmed');
  assert.equal(ropes.scheduleVerification.sourceName, 'Ropes ISD calendar');
});

test('school-published TBA overrides an unsupported feed kickoff', () => {
  for (const [away, home] of [['Greenville', 'Newman Smith'], ['Weatherford', 'Haltom']]) {
    const verified = applyOfficialScheduleVerification(game(away, home));
    assert.equal(verified.time, undefined);
    assert.equal(verified.hasPublishedTime, false);
    assert.deepEqual(verified.scheduleVerification.unconfirmedFields, ['time']);
  }
});

test('conflicting schedules are held as TBA instead of choosing a winner', () => {
  const conflict = applyOfficialScheduleVerification(game('Palmview', 'Juarez-Lincoln', '2026-08-13T19:15:00-05:00'));
  assert.equal(conflict.time, undefined);
  assert.equal(conflict.hasPublishedTime, false);
  assert.equal(conflict.venue, '');
  assert.equal(conflict.scheduleVerification.status, 'conflict');
  assert.ok(conflict.scheduleVerification.unconfirmedFields.includes('homeAway'));
});

test('games without a verified registry entry are unchanged', () => {
  const original = game('Unknown Away', 'Unknown Home');
  assert.equal(applyOfficialScheduleVerification(original), original);
});
