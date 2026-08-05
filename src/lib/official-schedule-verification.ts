import type { LiveGame } from './types';

type VerificationEntry = {
  date: string;
  awayTeam: string;
  homeTeam: string;
  time?: string;
  hasPublishedTime?: boolean;
  venue?: string;
  city?: string;
  clearVenue?: boolean;
  verification: NonNullable<LiveGame['scheduleVerification']>;
};

const CHECKED_AT = '2026-08-05';

const entries: VerificationEntry[] = [
  {
    date: '2026-08-13',
    awayTeam: 'Hale Center',
    homeTeam: 'Ropes',
    time: '2026-08-13T17:00:00-05:00',
    hasPublishedTime: true,
    venue: 'Ropes ISD',
    city: '304 Ranch St, Ropesville, TX 79358',
    verification: {
      status: 'confirmed',
      sourceName: 'Ropes ISD calendar',
      sourceUrl: 'https://www.ropesisd.us/parents-students/calendars/~occur-id/533_2026-08-13T22:00:00Z_2026-08-13T23:00:00Z',
      checkedAt: CHECKED_AT,
      note: 'Ropes ISD confirms the August 13 scrimmage at 5:00 PM at 304 Ranch St in Ropesville.',
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Greenville',
    homeTeam: 'Newman Smith',
    hasPublishedTime: false,
    venue: 'Newman Smith',
    city: 'Carrollton, TX',
    verification: {
      status: 'confirmed',
      sourceName: 'Greenville ISD Athletics',
      sourceUrl: 'https://www.greenvilleisdathletics.com/sport/football/boys/?tab=schedules',
      checkedAt: CHECKED_AT,
      note: 'Greenville ISD confirms the Newman Smith site but lists the varsity kickoff as TBA, not 7:00 PM.',
      unconfirmedFields: ['time'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Weatherford',
    homeTeam: 'Haltom',
    hasPublishedTime: false,
    venue: 'Haltom',
    city: 'Haltom City, TX',
    verification: {
      status: 'confirmed',
      sourceName: 'Weatherford ISD Athletics',
      sourceUrl: 'https://www.weatherfordisdkangaroos.com/sport/football/boys/?tab=schedule',
      checkedAt: CHECKED_AT,
      note: 'Weatherford ISD confirms the Haltom site but lists the varsity kickoff as TBA, not 7:00 PM.',
      unconfirmedFields: ['time'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Klondike',
    homeTeam: 'Rankin',
    time: '2026-08-13T18:00:00-05:00',
    hasPublishedTime: true,
    venue: 'Rankin',
    city: 'Rankin, TX',
    verification: {
      status: 'confirmed',
      sourceName: 'Rankin ISD Athletics',
      sourceUrl: 'https://www.reddevilsportsnetwork.com/sport/football/boys/?tab=schedule',
      checkedAt: CHECKED_AT,
      note: 'Rankin ISD confirms the six-man scrimmage at Rankin on August 13 at 6:00 PM.',
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Klein Forest',
    homeTeam: 'Channelview',
    hasPublishedTime: false,
    clearVenue: true,
    verification: {
      status: 'conflict',
      sourceName: 'Conflicting published schedules',
      sourceUrl: 'https://www.maxpreps.com/tx/football/scores/?date=8%2F13%2F2026',
      checkedAt: CHECKED_AT,
      note: 'Published schedules disagree on the kickoff time. The tracker will show TBA until a school confirms it.',
      unconfirmedFields: ['time', 'venue'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Gatesville',
    homeTeam: 'Marble Falls',
    hasPublishedTime: false,
    clearVenue: true,
    verification: {
      status: 'conflict',
      sourceName: 'Conflicting published schedules',
      sourceUrl: 'https://www.maxpreps.com/tx/football/scores/?date=8%2F13%2F2026',
      checkedAt: CHECKED_AT,
      note: 'Published schedule copies disagree on the date and kickoff time. This feed listing remains unconfirmed.',
      unconfirmedFields: ['date', 'time', 'venue'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Lake Creek',
    homeTeam: 'New Caney',
    hasPublishedTime: false,
    clearVenue: true,
    verification: {
      status: 'conflict',
      sourceName: 'Conflicting published schedules',
      sourceUrl: 'https://www.maxpreps.com/tx/football/scores/?date=8%2F13%2F2026',
      checkedAt: CHECKED_AT,
      note: 'Published schedules disagree on whether the kickoff time is confirmed. The tracker will show TBA.',
      unconfirmedFields: ['time', 'venue'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Palmview',
    homeTeam: 'Juarez-Lincoln',
    hasPublishedTime: false,
    clearVenue: true,
    verification: {
      status: 'conflict',
      sourceName: 'Conflicting school and feed listings',
      sourceUrl: 'https://www.maxpreps.com/games/8-13-2026/football-26/juarez-lincoln-vs-palmview.htm?c=6nqJP6_ADk-5giFXPr1WDQ',
      checkedAt: CHECKED_AT,
      note: 'Current listings disagree on the home team, date, time, and venue. Treat this as Palmview vs. Juarez-Lincoln until the schools confirm it.',
      unconfirmedFields: ['date', 'time', 'venue', 'homeAway'],
    },
  },
  {
    date: '2026-08-13',
    awayTeam: 'Venus',
    homeTeam: 'Life Waxahachie',
    hasPublishedTime: false,
    clearVenue: true,
    verification: {
      status: 'conflict',
      sourceName: 'Conflicting published schedules',
      sourceUrl: 'https://www.maxpreps.com/tx/football/scores/?date=8%2F13%2F2026',
      checkedAt: CHECKED_AT,
      note: 'Current sources do not agree that the 5:00 PM kickoff is confirmed. The tracker will show TBA.',
      unconfirmedFields: ['time', 'venue'],
    },
  },
];

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function entryKey(date: string, awayTeam: string, homeTeam: string): string {
  return [date, normalized(awayTeam), normalized(homeTeam)].join('|');
}

const entriesByGame = new Map(entries.map((entry) => [
  entryKey(entry.date, entry.awayTeam, entry.homeTeam),
  entry,
]));

export function applyOfficialScheduleVerification(game: LiveGame): LiveGame {
  const entry = entriesByGame.get(entryKey(game.date, game.awayTeam.name, game.homeTeam.name));
  if (!entry) return game;

  return {
    ...game,
    time: entry.hasPublishedTime ? entry.time : undefined,
    hasPublishedTime: entry.hasPublishedTime,
    venue: entry.clearVenue ? '' : (entry.venue ?? game.venue),
    city: entry.clearVenue ? '' : (entry.city ?? game.city),
    scheduleVerification: { ...entry.verification },
  };
}
