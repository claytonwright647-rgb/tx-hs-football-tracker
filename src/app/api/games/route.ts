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

// Cache for games data
let gamesCache: { games: LiveGame[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache for live updates

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

  const hasPublishedTime = mpGame.startTime.includes('T');

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
    date: mpGame.startTime.split('T')[0],
    time: hasPublishedTime ? mpGame.startTime : undefined,
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
async function fetchAllGames(phase: SeasonPhase): Promise<LiveGame[]> {
  const classifications = getUILClassifications();
  const allGames: LiveGame[] = [];
  
  // Fetch regular season scores for each classification
  const scorePromises = classifications.map(async (classification) => {
    try {
      const games = await fetchScores(classification);
      return games.map(g => convertToLiveGame(g));
    } catch (e) {
      console.error(`Error fetching ${classification} scores:`, e);
      return [];
    }
  });

  // Fetch playoff brackets for each classification
  const playoffPromises = ['playoffs', 'state_championships'].includes(phase)
    ? classifications.map(async (classification) => {
        const [baseClass, div] = classification.split(' ');
        const division = div === 'D1' ? 'Division I' : 'Division II';
        try {
          const games = await fetchPlayoffBracket(baseClass, division);
          return games.map(g => convertToLiveGame({ ...g, classification }));
        } catch (e) {
          console.error(`Error fetching ${classification} playoffs:`, e);
          return [];
        }
      })
    : [];

  const [scoreResults, playoffResults] = await Promise.all([
    Promise.all(scorePromises),
    Promise.all(playoffPromises),
  ]);

  // Combine all games
  scoreResults.forEach(games => allGames.push(...games));
  playoffResults.forEach(games => allGames.push(...games));

  // Remove duplicates by gameId
  const validGames = allGames.filter((game) => game.homeTeam.name && game.awayTeam.name && game.date);
  const uniqueGames = mergeSourceGames(validGames);

  return uniqueGames;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get('classification');
  const status = searchParams.get('status');
  const isPlayoff = searchParams.get('playoff');
  const forceRefresh = searchParams.get('refresh') === 'true';

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
    if (!forceRefresh && gamesCache && Date.now() - gamesCache.timestamp < CACHE_TTL) {
      let games = [...gamesCache.games];
      
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
        timestamp: new Date(gamesCache.timestamp).toISOString(),
        cached: true,
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
    const allGames = await fetchAllGames(phase);
    
    // Update cache
    gamesCache = {
      games: allGames,
      timestamp: Date.now(),
    };

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
      sourceStatus: games.length > 0 ? 'available' : (livePollingActive ? 'current_source_empty' : 'schedule_source_empty'),
      phase,
      message: games.length > 0
        ? undefined
        : livePollingActive
          ? 'The current official source returned no published games for this filter.'
          : 'The current official schedule source returned no published games for this filter.',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch games',
      message: error instanceof Error ? error.message : 'Unknown error',
      games: [],
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
