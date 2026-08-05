import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const home = read('src/app/page.tsx');
const scoreboardPage = read('src/app/scoreboard/page.tsx');
const scoreboard = read('src/components/Scoreboard.tsx');
const gameCard = read('src/components/GameCard.tsx');
const rankings = read('src/app/rankings/page.tsx');
const standings = read('src/app/standings/page.tsx');
const standingsApi = read('src/app/api/standings/route.ts');
const playoffs = read('src/app/playoffs/page.tsx');
const playoffBracket = read('src/components/PlayoffBracket.tsx');
const highlights = read('src/components/GameHighlights.tsx');
const highlightsApi = read('src/app/api/highlights/route.ts');
const aiStandingsApi = read('src/app/api/brain-ai/standings/[leagueId]/route.ts');
const footballField = read('src/components/fields/FootballField.tsx');
const gameDetailModal = read('src/components/GameDetailModal.tsx');
const gamesApi = read('src/app/api/games/route.ts');
const maxpreps = read('src/lib/maxpreps.ts');
const aiStatusButton = read('src/components/AIStatusButton.tsx');
const brainApi = read('src/app/api/brain-ai/route.ts');
const eloColumn = read('src/components/ELOStandingsColumn.tsx');
const teamPage = read('src/app/team/[slug]/page.tsx');

test('home and scoreboard routes render the canonical live scoreboard', () => {
  assert.match(home, /<Scoreboard\s*\/>/);
  assert.match(scoreboardPage, /<Scoreboard\s*\/>/);
  assert.doesNotMatch(scoreboardPage, /const allGames|Final Results/);
  assert.match(scoreboard, /fetch\(`\/api\/games\$\{query\}`/);
  assert.match(scoreboard, /not_scheduled_for_current_phase/);
  assert.match(scoreboard, /role="alert"/);
  assert.match(scoreboard, /aria-pressed=/);
});

test('scoreboard browses real source dates with independent caches and measured glance counts', () => {
  assert.match(scoreboard, /Next published slate/);
  assert.match(scoreboard, /Previous schedule date/);
  assert.match(scoreboard, /Next schedule date/);
  assert.match(scoreboard, /MaxPreps UIL schedule/);
  assert.match(scoreboard, /scheduledGames/);
  assert.match(scoreboard, /finalGames/);
  assert.match(gamesApi, /const gamesCache = new Map/);
  assert.match(gamesApi, /isValidScheduleDate/);
  assert.match(gamesApi, /cacheKey = requestedDate \|\| 'next-published'/);
  assert.match(gamesApi, /fetchScores\(classification, undefined, requestedDate\)/);
  assert.match(maxpreps, /url\.searchParams\.set\('date'/);
});

test('game cards use sourced game state without dormant enrichment lookups', () => {
  assert.match(gameCard, /game\.status === 'in_progress'/);
  assert.match(gameCard, /situation\?\.lastPlay/);
  assert.match(gameCard, /game\.broadcast/);
  assert.match(gameCard, /aria-label=/);
  assert.doesNotMatch(gameCard, /firecrawlSearch|calculateConfidenceScore|Bookmaker Odds|Fan Sentiment/);
});

test('current rankings, standings, and playoffs do not substitute fabricated records', () => {
  for (const source of [rankings, standings, standingsApi, playoffs, playoffBracket, aiStandingsApi]) {
    assert.doesNotMatch(source, /mockRankings|mockStandings|mockBracketData|Team A|Duncanville.*DeSoto/s);
  }
  assert.match(rankings, /not published/i);
  assert.match(standings, /not started|pending/i);
  assert.match(standingsApi, /available: false/);
  assert.match(playoffBracket, /bracket not published/i);
  assert.match(aiStandingsApi, /teams: \[\]/);
});

test('missing highlight providers produce a truthful unavailable state', () => {
  assert.match(highlightsApi, /available: false/);
  assert.match(highlightsApi, /will not substitute demo or unrelated videos/);
  assert.match(highlights, /setHighlights\(\[\]\)/);
  assert.doesNotMatch(highlights + highlightsApi, /dQw4w9WgXcQ|generateMockHighlights|via\.placeholder\.com/);
});

test('missing live field position never creates a midfield ball marker', () => {
  assert.match(footballField, /no complete official live situation/);
  assert.match(footballField, /Number\.isFinite\(yardsToEndzone\)/);
  assert.match(footballField, /possessionSide &&/);
  assert.doesNotMatch(footballField, /distance = situation\?\.distance \|\| 10/);
  assert.doesNotMatch(footballField, /yardLine = situation\?\.yardLine \|\| 50/);
  assert.doesNotMatch(footballField, /Show default ball at 50|left-1\/2.*opacity-30/);
  assert.match(footballField, /\{hasLiveData && <div className="flex justify-center/);
});

test('score-only live cards explain which detailed facts the source does not provide', () => {
  assert.match(gameCard, /Live score only — detailed clock, possession, field position, and play-by-play are unavailable/);
});

test('official source outages preserve last-known-good games instead of becoming an empty slate', () => {
  assert.match(maxpreps, /AbortSignal\.timeout\(15_000\)/);
  assert.match(maxpreps, /throw new Error\(`MaxPreps scoreboard returned HTTP/);
  assert.doesNotMatch(maxpreps, /MaxPreps fetch failed:[\s\S]{0,160}return \[\]/);
  assert.match(gamesApi, /Every official scoreboard request failed/);
  assert.match(gamesApi, /sourceStatus: 'stale_last_known_good'/);
  assert.match(gamesApi, /last verified slate while the tracker retries/);
  assert.match(scoreboard, /sourceStatus === 'stale_last_known_good'/);
});

test('today browsing keeps polling and uses live-source cache timing', () => {
  assert.match(scoreboard, /browseDate !== chicagoToday\(\)/);
  assert.match(gamesApi, /const LIVE_CACHE_TTL = 30 \* 1000/);
  assert.match(maxpreps, /requestedDate !== chicagoDateKey\(\) \? 300 : 30/);
});

test('game details format published kickoffs in Central time instead of exposing raw timestamps', () => {
  assert.match(gameDetailModal, /scheduleLabel\(game\.date, game\.time, game\.hasPublishedTime\)/);
  assert.match(gameDetailModal, /timeZone: 'America\/Chicago'/);
  assert.match(gameDetailModal, /Time TBA/);
  assert.doesNotMatch(gameDetailModal, /\{game\.time && `• \$\{game\.time\}`\}/);
});

test('preseason scrimmages and unknown kickoff times are labeled truthfully', () => {
  assert.match(gamesApi, /date < SEASON_INFO\.regularSeasonStart/);
  assert.match(gamesApi, /hasPublishedTime = mpGame\.hasPublishedTime/);
  assert.match(gameCard, /label: 'SCRIMMAGE'/);
  assert.match(gameCard, /game\.hasPublishedTime === true/);
  assert.match(scoreboard, /Preseason scrimmages:/);
  assert.match(scoreboard, /do not count in team records/);
  assert.doesNotMatch(gameCard, /Boolean\(game\.time\?\.includes\('T'\)\)/);
});

test('presentation labels disclose source, venue, six-man, and live-data limitations', () => {
  assert.match(home, /Schedule and score data: MaxPreps UIL feed\. Season dates and rules: UIL\./);
  assert.doesNotMatch(home, /Data sourced from UIL, MaxPreps, and Dave Campbell/);
  assert.match(gameCard, /Venue not published by source/);
  assert.match(gameDetailModal, /Live scores update automatically/);
  assert.match(gameDetailModal, /Six-man field visualization is unavailable/);
  assert.match(gameDetailModal, /closeButtonRef/);
  assert.match(gameDetailModal, /previousFocusRef/);
  assert.match(gameDetailModal, /dialogRef/);
  assert.match(gameDetailModal, /document\.body\.style\.overflow = 'hidden'/);
  assert.doesNotMatch(scoreboard, /substring\(0, 3\)\.toUpperCase/);
});

test('team pages use the direct official feed and contain no Firecrawl dependency', () => {
  assert.match(teamPage, /direct MaxPreps UIL feed/);
  assert.match(teamPage, /href="\/scoreboard"/);
  assert.doesNotMatch(teamPage, /Firecrawl|FIRECRAWL_API_KEY|firecrawlClient/);
});

test('official feed games normalize into working filters without fabricated scores', () => {
  assert.match(gamesApi, /const \[baseClassification, divisionCode\]/);
  assert.match(gamesApi, /classification: baseClassification/);
  assert.match(gamesApi, /sourceClassifications: \[mpGame\.classification\]/);
  assert.match(gamesApi, /mergeSourceGames/);
  assert.match(gamesApi, /matchesClassification/);
  assert.match(gamesApi, /homeScore: mpGame\.homeScore \?\? undefined/);
  assert.match(gamesApi, /schedule_source_empty/);
  assert.match(maxpreps, /item\['@graph'\]/);
  assert.match(maxpreps, /function getClassificationSlug/);
  assert.match(maxpreps, /return match\[2\] \? `class-\$\{base\}-division-\$\{match\[2\]\}`/);
  assert.match(maxpreps, /SCOREBOARD_DIVISIONS/);
  assert.match(maxpreps, /statedivisionid/);
  assert.match(maxpreps, /parseMaxPrepsScoreboard/);
  assert.doesNotMatch(maxpreps, /football\/\$\{classSlug\}\/scores/);
  assert.doesNotMatch(maxpreps, /CLASSIFICATION_MAP\[classification\] \|\| 'class-6a'/);
});

test('optional AI checks run on demand and never claim an unmeasured system is active', () => {
  assert.doesNotMatch(aiStatusButton, /setInterval\(fetchStatus/);
  assert.match(aiStatusButton, /void fetchStatus\(\)/);
  assert.doesNotMatch(brainApi, /system: 'active'/);
  assert.match(brainApi, /system: data\.state \? 'available' : 'not_measured'/);
  assert.match(eloColumn, /\[teamId, teamName\]/);
});
