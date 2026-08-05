import { NextResponse } from 'next/server';
import { Team, LiveGame } from '@/lib/types';
import { fetchScores, fetchPlayoffBracket, getUILClassifications, MaxPrepsGame } from '@/lib/maxpreps';
import {
  getCurrentPhase,
  getPhaseConfig,
  shouldFetchLiveData,
  shouldFetchSchedules,
  type SeasonPhase,
} from '@/lib/seasonIntelligence';
import { SEASON_INFO } from '@/lib/constants';

// Cache each browsed date independently so navigating the schedule cannot
// serve a different day's games from the one-minute live cache.
const gamesCache = new Map<string, { games: LiveGame[]; timestamp: number }>();
const SCHEDULE_CACHE_TTL = 60 * 1000;
const LIVE_CACHE_TTL = 30 * 1000;

function isValidScheduleDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

// Convert MaxPreps game to our LiveGame format
function convertToLiveGame(mpGame: MaxPrepsGame): LiveGame {
  const [baseClassification, divisionCode] = mpGame.classification.split(' ');
  const division = divisionCode === 'D1'
    ? 'Division I'
    : divisionCode === 'D2'
      ? 'Division II'
      : undefined;
  const homeTeam: Team = {
    id: mpGame.homeTeamId || mpGame.homeTeam.toLowerCase().replace(/\s+/g, '-'),
    name: mpGame.homeTeam,
    mascot: '',
    city: mpGame.city || '',
    school: mpGame.homeTeam,
    classification: '',
    district: '',
    record: '',
    logo: mpGame.homeTeamLogo || undefined,
  };

  const awayTeam: Team = {
    id: mpGame.awayTeamId || mpGame.awayTeam.toLowerCase().replace(/\s+/g, '-'),
    name: mpGame.awayTeam,
    mascot: '',
    city: '',
    school: mpGame.awayTeam,
    classification: '',
    district: '',
    record: '',
    logo: mpGame.awayTeamLogo || undefined,
  };

  // Map MaxPreps status to our status
  let status: LiveGame['status'] = 'scheduled';
  if (mpGame.status === 'live') status = 'in_progress';
  else if (mpGame.status === 'final') status = 'final';
  else if (mpGame.status === 'postponed') status = 'postponed';
  else if (mpGame.status === 'cancelled') status = 'cancelled';

  const hasPublishedTime = mpGame.hasPublishedTime;
  const date = mpGame.startTime.split('T')[0];
  const isScrimmage = !mpGame.isPlayoff && date < SEASON_INFO.regularSeasonStart;

  return {
    id: mpGame.gameId,
    homeTeam,
    awayTeam,
    homeScore: mpGame.homeScore ?? undefined,
    awayScore: mpGame.awayScore ?? undefined,
    status,
    classification: baseClassification,
    division,
    sourceClassifications: [mpGame.classification],
    isPlayoff: mpGame.isPlayoff,
    playoffRound: mpGame.playoffRound,
    venue: mpGame.venue,
    city: mpGame.city,
    date,
    time: hasPublishedTime ? mpGame.startTime : undefined,
    hasPublishedTime,
    isScrimmage,
    week: mpGame.week,
  };
}

function mergeSourceGames(games: LiveGame[]): LiveGame[] {
  const gamesById = new Map<string, LiveGame>();
  const statusPriority: Record<LiveGame['status'], number> = {
    scheduled: 0,
    postponed: 1,
    cancelled: 1,
    in_progress: 2,
    halftime: 2,
    final: 3,
  };

  for (const game of games) {
    const current = gamesById.get(game.id);
    if (!current) {
      gamesById.set(game.id, game);
      continue;
    }

    const sourceClassifications = Array.from(new Set([
      ...(current.sourceClassifications || []),
      ...(game.sourceClassifications || []),
    ]));
    if (statusPriority[game.status] > statusPriority[current.status]) {
      gamesById.set(game.id, { ...game, sourceClassifications });
    } else {
      current.sourceClassifications = sourceClassifications;
    }
  }

  return Array.from(gamesById.values());
}

function matchesClassification(game: LiveGame, classification: string): boolean {
  return game.classification === classification || Boolean(
    game.sourceClassifications?.some((source) => source === classification || source.startsWith(`${classification} `)),
  );
}

// Fetch all games across classifications
interface OfficialGamesResult {
  games: LiveGame[];
  failedSources: number;
  sourceCount: number;
}

async function fetchAllGames(phase: SeasonPhase, requestedDate?: string): Promise<OfficialGamesResult> {
  const classifications = getUILClassifications();
  const allGames: LiveGame[] = [];
  
  // Fetch regular season scores for each classification
  const scorePromises = classifications.map(async (classification) => {
    try {
      const games = await fetchScores(classification, undefined, requestedDate);
      return { ok: true as const, games: games.map(g => convertToLiveGame(g)) };
    } catch (e) {
      console.error(`Error fetching ${classification} scores:`, e);
      return { ok: false as const, games: [] as LiveGame[] };
    }
  });

  // Fetch playoff brackets for each classification
  const playoffPromises = ['playoffs', 'state_championships'].includes(phase)
    ? classifications.map(async (classification) => {
        const [baseClass, div] = classification.split(' ');
        const division = div === 'D1' ? 'Division I' : 'Division II';
        try {
          const games = await fetchPlayoffBracket(baseClass, division);
          return { ok: true as const, games: games.map(g => convertToLiveGame({ ...g, classification })) };
        } catch (e) {
          console.error(`Error fetching ${classification} playoffs:`, e);
          return { ok: false as const, games: [] as LiveGame[] };
        }
      })
    : [];

  const [scoreResults, playoffResults] = await Promise.all([
    Promise.all(scorePromises),
    Promise.all(playoffPromises),
  ]);

  // Combine all games
  const sourceResults = [...scoreResults, ...playoffResults];
  sourceResults.forEach(result => allGames.push(...result.games));
  const failedSources = sourceResults.filter(result => !result.ok).length;
  if (sourceResults.length > 0 && failedSources === sourceResults.length) {
    throw new Error('Every official scoreboard request failed');
  }

  // Remove duplicates by gameId
  const validGames = allGames.filter((game) => game.homeTeam.name && game.awayTeam.name && game.date);
  const uniqueGames = mergeSourceGames(validGames).sort((first, second) => {
    const firstTime = new Date(first.time || `${first.date}T12:00:00-06:00`).getTime();
    const secondTime = new Date(second.time || `${second.date}T12:00:00-06:00`).getTime();
    return firstTime - secondTime || first.awayTeam.name.localeCompare(second.awayTeam.name);
  });

  return { games: uniqueGames, failedSources, sourceCount: sourceResults.length };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get('classification');
  const status = searchParams.get('status');
  const isPlayoff = searchParams.get('playoff');
  const forceRefresh = searchParams.get('refresh') === 'true';
  const dateParam = searchParams.get('date');

  if (dateParam && !isValidScheduleDate(dateParam)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid schedule date',
      message: 'Use a real calendar date in YYYY-MM-DD format.',
      games: [],
    }, { status: 400 });
  }

  const requestedDate = dateParam || undefined;
  const cacheKey = requestedDate || 'next-published';
  const lastKnownGood = gamesCache.get(cacheKey);

  try {
    const now = new Date();
    const phase = getCurrentPhase(now);
    const livePollingActive = shouldFetchLiveData(now);
    const schedulePollingActive = shouldFetchSchedules(now);

    if (!livePollingActive && !schedulePollingActive) {
      return NextResponse.json({
        success: true,
        count: 0,
        games: [],
        timestamp: now.toISOString(),
        cached: false,
        sourceStatus: 'not_scheduled_for_current_phase',
        phase,
        message: `Game and schedule polling is not scheduled during ${getPhaseConfig(phase).displayName}.`,
      });
    }

    // Check cache
    const cachedResult = lastKnownGood;
    const cachedSlateIsLive = cachedResult?.games.some(game => game.status === 'in_progress' || game.status === 'halftime') === true;
    const cacheTtl = cachedSlateIsLive ? LIVE_CACHE_TTL : SCHEDULE_CACHE_TTL;
    if (!forceRefresh && cachedResult && Date.now() - cachedResult.timestamp < cacheTtl) {
      let games = [...cachedResult.games];
      
      // Apply filters
      if (classification) {
        games = games.filter((g) => matchesClassification(g, classification));
      }
      if (status) {
        games = games.filter((g) => g.status === status);
      }
      if (isPlayoff === 'true') {
        games = games.filter((g) => g.isPlayoff);
      }

      return NextResponse.json({
        success: true,
        count: games.length,
        games,
        timestamp: new Date(cachedResult.timestamp).toISOString(),
        cached: true,
        requestedDate: requestedDate || null,
        scheduleDate: games[0]?.date || requestedDate || null,
        sourceStatus: games.length > 0 ? 'available' : (livePollingActive ? 'current_source_empty' : 'schedule_source_empty'),
        phase,
        message: games.length > 0
          ? undefined
          : livePollingActive
            ? 'The current official source returned no published games for this filter.'
            : 'The current official schedule source returned no published games for this filter.',
      });
    }

    // Fetch fresh data
    const officialResult = await fetchAllGames(phase, requestedDate);
    const allGames = officialResult.games;
    
    // Update cache
    gamesCache.set(cacheKey, {
      games: allGames,
      timestamp: Date.now(),
    });

    let games = [...allGames];

    // Apply filters
    if (classification) {
      games = games.filter((g) => matchesClassification(g, classification));
    }
    if (status) {
      games = games.filter((g) => g.status === status);
    }
    if (isPlayoff === 'true') {
      games = games.filter((g) => g.isPlayoff);
    }

    return NextResponse.json({
      success: true,
      count: games.length,
      games,
      timestamp: new Date().toISOString(),
      cached: false,
      requestedDate: requestedDate || null,
      scheduleDate: games[0]?.date || requestedDate || null,
      sourceStatus: officialResult.failedSources > 0
        ? 'available_partial'
        : games.length > 0
          ? 'available'
          : (livePollingActive ? 'current_source_empty' : 'schedule_source_empty'),
      phase,
      message: officialResult.failedSources > 0
        ? `${officialResult.failedSources} of ${officialResult.sourceCount} official classification requests failed; showing the verified games that were returned.`
        : games.length > 0
          ? undefined
        : livePollingActive
          ? 'The current official source returned no published games for this filter.'
          : 'The current official schedule source returned no published games for this filter.',
    });
  } catch (error) {
    console.error('API Error:', error);
    if (lastKnownGood?.games.length) {
      let games = [...lastKnownGood.games];
      if (classification) games = games.filter((game) => matchesClassification(game, classification));
      if (status) games = games.filter((game) => game.status === status);
      if (isPlayoff === 'true') games = games.filter((game) => game.isPlayoff);

      return NextResponse.json({
        success: true,
        count: games.length,
        games,
        timestamp: new Date(lastKnownGood.timestamp).toISOString(),
        checkedAt: new Date().toISOString(),
        cached: true,
        stale: true,
        requestedDate: requestedDate || null,
        scheduleDate: games[0]?.date || requestedDate || null,
        sourceStatus: 'stale_last_known_good',
        phase: getCurrentPhase(new Date()),
        message: 'The official source could not be refreshed. Showing the last verified slate while the tracker retries.',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch games',
      message: 'The official source could not be reached and no previously verified slate is available.',
      games: [],
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
