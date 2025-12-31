import { NextResponse } from 'next/server';
import { Game, Team, LiveGame } from '@/lib/types';
import { fetchScores, fetchPlayoffBracket, getUILClassifications, MaxPrepsGame } from '@/lib/maxpreps';

// Cache for games data
let gamesCache: { games: LiveGame[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache for live updates

// Convert MaxPreps game to our LiveGame format
function convertToLiveGame(mpGame: MaxPrepsGame): LiveGame {
  const homeTeam: Team = {
    id: mpGame.homeTeamId || mpGame.homeTeam.toLowerCase().replace(/\s+/g, '-'),
    name: mpGame.homeTeam,
    mascot: '',
    city: mpGame.city || '',
    school: mpGame.homeTeam,
    classification: mpGame.classification,
    district: '',
    record: '',
  };

  const awayTeam: Team = {
    id: mpGame.awayTeamId || mpGame.awayTeam.toLowerCase().replace(/\s+/g, '-'),
    name: mpGame.awayTeam,
    mascot: '',
    city: '',
    school: mpGame.awayTeam,
    classification: mpGame.classification,
    district: '',
    record: '',
  };

  // Map MaxPreps status to our status
  let status: LiveGame['status'] = 'scheduled';
  if (mpGame.status === 'live') status = 'in_progress';
  else if (mpGame.status === 'final') status = 'final';
  else if (mpGame.status === 'postponed') status = 'postponed';

  return {
    id: mpGame.gameId,
    homeTeam,
    awayTeam,
    homeScore: mpGame.homeScore || 0,
    awayScore: mpGame.awayScore || 0,
    status,
    classification: mpGame.classification,
    isPlayoff: mpGame.isPlayoff,
    playoffRound: mpGame.playoffRound,
    venue: mpGame.venue,
    city: mpGame.city,
    date: mpGame.startTime.split('T')[0],
    time: mpGame.startTime,
    isDistrictGame: !mpGame.isPlayoff,
    week: mpGame.week,
  };
}

// Fetch all games across classifications
async function fetchAllGames(): Promise<LiveGame[]> {
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
  const playoffPromises = classifications.map(async (classification) => {
    const [baseClass, div] = classification.split(' ');
    const division = div === 'D1' ? 'Division I' : 'Division II';
    try {
      const games = await fetchPlayoffBracket(baseClass, division);
      return games.map(g => convertToLiveGame({ ...g, classification }));
    } catch (e) {
      console.error(`Error fetching ${classification} playoffs:`, e);
      return [];
    }
  });

  const [scoreResults, playoffResults] = await Promise.all([
    Promise.all(scorePromises),
    Promise.all(playoffPromises),
  ]);

  // Combine all games
  scoreResults.forEach(games => allGames.push(...games));
  playoffResults.forEach(games => allGames.push(...games));

  // Remove duplicates by gameId
  const uniqueGames = Array.from(
    new Map(allGames.map(g => [g.id, g])).values()
  );

  return uniqueGames;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get('classification');
  const status = searchParams.get('status');
  const isPlayoff = searchParams.get('playoff');
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    // Check cache
    if (!forceRefresh && gamesCache && Date.now() - gamesCache.timestamp < CACHE_TTL) {
      let games = [...gamesCache.games];
      
      // Apply filters
      if (classification) {
        games = games.filter((g) => g.classification === classification);
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
      });
    }

    // Fetch fresh data
    const allGames = await fetchAllGames();
    
    // Update cache
    gamesCache = {
      games: allGames,
      timestamp: Date.now(),
    };

    let games = [...allGames];

    // Apply filters
    if (classification) {
      games = games.filter((g) => g.classification === classification);
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
