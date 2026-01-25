/**
 * Brain AI API Routes
 * Shared API endpoints for both sports trackers
 * Handles game tracking, standings, predictions, and system control
 */

import { NextRequest, NextResponse } from 'next/server';
import { BrainAI, createBrainAI } from '@/lib';

let brainAI: BrainAI | null = null;

/**
 * Initialize Brain AI on first request
 */
async function initializeBrainAI(db: any) {
  if (!brainAI) {
    console.log('Initializing Brain AI system...');
    brainAI = await createBrainAI(db, {
      autoFixCode: true,
      autoDeployOnSuccess: true,
      predictiveMode: 'moderate',
      learningEnabled: true,
      realTimeUpdates: true,
    });
  }
  return brainAI;
}

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

    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);

    switch (action) {
      case 'status':
        // GET /api/brain-ai/status
        const status = await ai.getStatus();
        return NextResponse.json({ success: true, data: status });

      case 'live-games':
        // GET /api/brain-ai/live-games
        const liveGames = ai.getAllLiveGames();
        return NextResponse.json({ success: true, data: liveGames });

      case 'upcoming-games':
        // GET /api/brain-ai/upcoming-games?hours=48
        const hours = parseInt(searchParams.get('hours') || '48');
        const games = await ai.getUpcomingGames(hours);
        return NextResponse.json({ success: true, data: games });

      case 'high-momentum-games':
        // GET /api/brain-ai/high-momentum-games
        const momentumGames = ai.getHighMomentumGames();
        return NextResponse.json({ success: true, data: momentumGames });

      case 'close-games':
        // GET /api/brain-ai/close-games
        const closeGames = ai.getCloseGames();
        return NextResponse.json({ success: true, data: closeGames });

      case 'patterns':
        // GET /api/brain-ai/patterns
        const patterns = ai.getPatterns();
        return NextResponse.json({ success: true, data: patterns });

      case 'predictions':
        // GET /api/brain-ai/predictions?homeELO=1600&awayELO=1550&leagueId=nfl
        const homeELO = parseFloat(searchParams.get('homeELO') || '1600');
        const awayELO = parseFloat(searchParams.get('awayELO') || '1600');
        const leagueId = searchParams.get('leagueId') || 'nfl';
        const prediction = await ai.predictGameOutcome(homeELO, awayELO, leagueId);
        return NextResponse.json({ success: true, data: prediction });

      case 'standings':
        // GET /api/brain-ai/standings/:leagueId
        const standingsLeague = parts[5];
        if (!standingsLeague) {
          return NextResponse.json({ success: false, error: 'League ID required' }, { status: 400 });
        }
        const standings = await ai.getLeagueStandings(standingsLeague);
        return NextResponse.json({ success: true, data: standings });

      case 'game-state':
        // GET /api/brain-ai/game-state/:gameId
        const gameId = parts[5];
        if (!gameId) {
          return NextResponse.json({ success: false, error: 'Game ID required' }, { status: 400 });
        }
        const gameState = ai.getGameState(gameId);
        if (!gameState) {
          return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: gameState });

      case 'metrics':
        // GET /api/brain-ai/metrics/:leagueId
        const metricsLeague = parts[5];
        if (!metricsLeague) {
          return NextResponse.json({ success: false, error: 'League ID required' }, { status: 400 });
        }
        const metrics = await ai.getImprovementMetrics(metricsLeague);
        return NextResponse.json({ success: true, data: metrics });

      case 'phase':
        // GET /api/brain-ai/phase/:leagueId
        const phaseLeague = parts[5];
        if (!phaseLeague) {
          return NextResponse.json({ success: false, error: 'League ID required' }, { status: 400 });
        }
        const phase = ai.getCurrentPhase(phaseLeague);
        return NextResponse.json({
          success: true,
          data: {
            leagueId: phaseLeague,
            phase,
          },
        });

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 404 });
    }
  } catch (error) {
    console.error('GET /api/brain-ai error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
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

    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);

    switch (action) {
      case 'track-game':
        // POST /api/brain-ai/track-game
        const { gameId, leagueId } = await req.json();
        await ai.trackGame(gameId, leagueId);
        return NextResponse.json({
          success: true,
          message: `Now tracking game ${gameId}`,
          gameId,
        });

      case 'sync':
        // POST /api/brain-ai/sync
        await ai.syncAllSchedules();
        return NextResponse.json({
          success: true,
          message: 'Schedule sync completed',
        });

      case 'pause':
        // POST /api/brain-ai/pause
        ai.pause();
        return NextResponse.json({
          success: true,
          message: 'Brain AI system paused',
        });

      case 'resume':
        // POST /api/brain-ai/resume
        ai.resume();
        return NextResponse.json({
          success: true,
          message: 'Brain AI system resumed',
        });

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 404 });
    }
  } catch (error) {
    console.error('POST /api/brain-ai error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
