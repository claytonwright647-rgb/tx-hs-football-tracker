import { NextRequest, NextResponse } from 'next/server';
import { Game, LiveGame, PlayoffBracket } from '@/lib/types';
import eloSystem from '@/lib/ai/elo-system';
import gameAnalyzer from '@/lib/ai/game-analyzer';
import playoffPredictor from '@/lib/ai/playoff-predictor';

/**
 * HS Football AI Enhancements API
 * Provides AI-driven insights for Texas high school football
 */

export async function POST(request: NextRequest) {
  try {
    const { action, payload } = await request.json();

    switch (action) {
      case 'analyze-game': {
        const game = payload as LiveGame | Game;
        const analysis = gameAnalyzer.analyzeGame(game);
        return NextResponse.json({ success: true, data: analysis });
      }

      case 'get-team-rating': {
        const { teamId } = payload;
        const rating = eloSystem.getTeamRating(teamId);
        const strength = eloSystem.getTeamStrength(teamId);
        const trend = eloSystem.getTrend(teamId);
        return NextResponse.json({
          success: true,
          data: { rating, strength, trend },
        });
      }

      case 'calculate-win-probability': {
        const { homeTeamId, awayTeamId } = payload;
        const probabilities = eloSystem.calculateWinProbability(homeTeamId, awayTeamId);
        return NextResponse.json({ success: true, data: probabilities });
      }

      case 'update-game-result': {
        const { homeTeamId, awayTeamId, homeScore, awayScore, isPlayoff } = payload;
        const newRatings = eloSystem.updateRatings(homeTeamId, awayTeamId, homeScore, awayScore, isPlayoff);
        gameAnalyzer.recordMatchup(homeTeamId, awayTeamId, homeScore, awayScore);
        return NextResponse.json({ success: true, data: newRatings });
      }

      case 'predict-bracket': {
        const bracket = payload as PlayoffBracket;
        const prediction = playoffPredictor.predictBracket(bracket);
        return NextResponse.json({ success: true, data: prediction });
      }

      case 'simulate-bracket': {
        const bracket = payload as PlayoffBracket;
        const simulations = payload.simulations || 1000;
        const outcomes = playoffPredictor.simulateBracket(bracket, simulations);
        const outcomesArray = Array.from(outcomes.entries()).map(([teamId, percentage]) => ({
          teamId,
          percentage,
        }));
        return NextResponse.json({ success: true, data: outcomesArray });
      }

      case 'get-matchup-history': {
        const { homeTeamId, awayTeamId } = payload;
        const history = gameAnalyzer.getMatchupHistory(homeTeamId, awayTeamId);
        return NextResponse.json({ success: true, data: history });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('HS AI API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'HS Football AI Enhancements API',
    endpoints: [
      'POST /api/ai-enhancements with action: analyze-game',
      'POST /api/ai-enhancements with action: get-team-rating',
      'POST /api/ai-enhancements with action: calculate-win-probability',
      'POST /api/ai-enhancements with action: update-game-result',
      'POST /api/ai-enhancements with action: predict-bracket',
      'POST /api/ai-enhancements with action: simulate-bracket',
      'POST /api/ai-enhancements with action: get-matchup-history',
    ],
  });
}
