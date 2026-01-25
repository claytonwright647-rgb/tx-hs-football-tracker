/**
 * Brain AI API Routes for HS Football Tracker
 * Handles game tracking, standings, predictions for high school football
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Simulated Brain AI data for HS Football
 * In production, this would connect to the actual Brain AI system
 */
const mockStandings = {
  success: true,
  leagueId: 'hs-football',
  data: {
    teams: [
      {
        name: 'Team A',
        wins: 10,
        losses: 1,
        eloRating: 1650,
        momentum: 'high',
        lastGame: 'W 42-28',
      },
      {
        name: 'Team B',
        wins: 9,
        losses: 2,
        eloRating: 1600,
        momentum: 'medium',
        lastGame: 'W 35-21',
      },
      {
        name: 'Team C',
        wins: 8,
        losses: 3,
        eloRating: 1550,
        momentum: 'low',
        lastGame: 'L 24-31',
      },
    ],
    timestamp: new Date().toISOString(),
  },
};

const mockPredictions = {
  success: true,
  data: {
    homeWinProbability: 0.65,
    awayWinProbability: 0.35,
    expectedPointSpread: 12.5,
    confidence: 0.87,
  },
};

const mockMomentumGames = {
  success: true,
  data: [
    {
      gameId: 'game-1',
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeELO: 1650,
      awayELO: 1600,
      momentum: 'high',
      startTime: new Date().toISOString(),
    },
    {
      gameId: 'game-2',
      homeTeam: 'Team C',
      awayTeam: 'Team D',
      homeELO: 1550,
      awayELO: 1520,
      momentum: 'medium',
      startTime: new Date(Date.now() + 86400000).toISOString(),
    },
  ],
};

/**
 * Main GET handler - routes to appropriate function based on query params
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Extract the action from pathname: /api/brain-ai/[action]
    const parts = pathname.split('/');
    const action = parts[4]; // Index 4 is the action after /api/brain-ai/

    switch (action) {
      case 'status':
        // GET /api/brain-ai/status
        return NextResponse.json({
          success: true,
          data: {
            system: 'active',
            leagueId: 'hs-football',
            lastUpdate: new Date().toISOString(),
          },
        });

      case 'standings':
        // GET /api/brain-ai/standings/hs-football
        return NextResponse.json(mockStandings);

      case 'predictions':
        // GET /api/brain-ai/predictions?homeELO=1600&awayELO=1550
        const homeELO = parseFloat(searchParams.get('homeELO') || '1600');
        const awayELO = parseFloat(searchParams.get('awayELO') || '1550');
        
        // Simple ELO-based prediction
        const expectedDiff = homeELO - awayELO;
        const homeWinProb = 1 / (1 + Math.pow(10, -expectedDiff / 400));
        
        return NextResponse.json({
          success: true,
          data: {
            homeELO,
            awayELO,
            homeWinProbability: Math.round(homeWinProb * 100) / 100,
            awayWinProbability: Math.round((1 - homeWinProb) * 100) / 100,
            expectedPointSpread: (expectedDiff / 25).toFixed(1),
            confidence: 0.87,
          },
        });

      case 'high-momentum-games':
        // GET /api/brain-ai/high-momentum-games
        return NextResponse.json(mockMomentumGames);

      case 'metrics':
        // GET /api/brain-ai/metrics/hs-football
        return NextResponse.json({
          success: true,
          data: {
            gamesTracked: 156,
            accuracyRate: 0.78,
            totalPredictions: 234,
            averageConfidence: 0.85,
          },
        });

      case 'phase':
        // GET /api/brain-ai/phase/hs-football
        return NextResponse.json({
          success: true,
          data: {
            leagueId: 'hs-football',
            phase: 'regular-season',
            weekNumber: 8,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('GET /api/brain-ai error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Main POST handler - routes to appropriate function based on path
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Extract the action from pathname: /api/brain-ai/[action]
    const parts = pathname.split('/');
    const action = parts[4]; // Index 4 is the action after /api/brain-ai/

    switch (action) {
      case 'track-game':
        // POST /api/brain-ai/track-game
        const { gameId, leagueId } = await req.json();
        return NextResponse.json({
          success: true,
          message: `Now tracking game ${gameId}`,
          gameId,
        });

      case 'sync':
        // POST /api/brain-ai/sync
        return NextResponse.json({
          success: true,
          message: 'Schedule sync completed',
        });

      case 'pause':
        // POST /api/brain-ai/pause
        return NextResponse.json({
          success: true,
          message: 'Brain AI system paused',
        });

      case 'resume':
        // POST /api/brain-ai/resume
        return NextResponse.json({
          success: true,
          message: 'Brain AI system resumed',
        });

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('POST /api/brain-ai error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
