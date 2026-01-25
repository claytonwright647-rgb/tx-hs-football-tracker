/**
 * Brain AI API Routes
 * Shared API endpoints for both sports trackers
 * Handles game tracking, standings, predictions, and system control
 */

import { NextRequest, NextResponse } from 'next/server';
import { BrainAI, createBrainAI } from '@/lib/brain-ai';

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
 * POST /api/brain-ai/track-game
 * Start tracking a game in real-time
 */
export async function trackGame(req: NextRequest) {
  try {
    const { gameId, leagueId } = await req.json();
    const db = (global as any).__db_instance;

    const ai = await initializeBrainAI(db);
    await ai.trackGame(gameId, leagueId);

    return NextResponse.json({
      success: true,
      message: `Now tracking game ${gameId}`,
      gameId,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/game-state/:gameId
 * Get current game state
 */
export async function getGameState(req: NextRequest, { params }: any) {
  try {
    const { gameId } = params;
    const db = (global as any).__db_instance;

    const ai = await initializeBrainAI(db);
    const gameState = ai.getGameState(gameId);

    if (!gameState) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: gameState });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/live-games
 * Get all live games
 */
export async function getLiveGames(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const liveGames = ai.getAllLiveGames();

    return NextResponse.json({ success: true, data: liveGames });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/standings/:leagueId
 * Get standings for a league
 */
export async function getStandings(req: NextRequest, { params }: any) {
  try {
    const { leagueId } = params;
    const db = (global as any).__db_instance;

    const ai = await initializeBrainAI(db);
    const standings = await ai.getLeagueStandings(leagueId);

    return NextResponse.json({ success: true, data: standings });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/predictions?homeELO=1600&awayELO=1550&leagueId=nfl
 * Predict game outcome
 */
export async function getPrediction(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const homeELO = parseFloat(searchParams.get('homeELO') || '1600');
    const awayELO = parseFloat(searchParams.get('awayELO') || '1600');
    const leagueId = searchParams.get('leagueId') || 'nfl';

    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const prediction = await ai.predictGameOutcome(homeELO, awayELO, leagueId);

    return NextResponse.json({ success: true, data: prediction });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/upcoming-games?hours=48
 * Get upcoming games
 */
export async function getUpcomingGames(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '48');

    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const games = await ai.getUpcomingGames(hours);

    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/high-momentum-games
 * Get games with high momentum (exciting games)
 */
export async function getHighMomentumGames(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const games = ai.getHighMomentumGames();

    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/close-games
 * Get close games (competitive games)
 */
export async function getCloseGames(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const games = ai.getCloseGames();

    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/patterns
 * Get discovered patterns from learning engine
 */
export async function getPatterns(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const patterns = ai.getPatterns();

    return NextResponse.json({ success: true, data: patterns });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/metrics/:leagueId
 * Get improvement metrics for a league
 */
export async function getMetrics(req: NextRequest, { params }: any) {
  try {
    const { leagueId } = params;
    const db = (global as any).__db_instance;

    const ai = await initializeBrainAI(db);
    const metrics = await ai.getImprovementMetrics(leagueId);

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/phase/:leagueId
 * Get current season phase for a league
 */
export async function getSeasonPhase(req: NextRequest, { params }: any) {
  try {
    const { leagueId } = params;
    const db = (global as any).__db_instance;

    const ai = await initializeBrainAI(db);
    const phase = ai.getCurrentPhase(leagueId);

    return NextResponse.json({
      success: true,
      data: {
        leagueId,
        phase,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/brain-ai/status
 * Get system status
 */
export async function getSystemStatus(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    const status = await ai.getStatus();

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/brain-ai/sync
 * Manually sync all schedules
 */
export async function syncSchedules(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    await ai.syncAllSchedules();

    return NextResponse.json({
      success: true,
      message: 'Schedule sync completed',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/brain-ai/pause
 * Pause autonomous operation
 */
export async function pauseSystem(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    ai.pause();

    return NextResponse.json({
      success: true,
      message: 'Brain AI system paused',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/brain-ai/resume
 * Resume autonomous operation
 */
export async function resumeSystem(req: NextRequest) {
  try {
    const db = (global as any).__db_instance;
    const ai = await initializeBrainAI(db);
    ai.resume();

    return NextResponse.json({
      success: true,
      message: 'Brain AI system resumed',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
