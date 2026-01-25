/**
 * Brain AI Standings Route for HS Football Tracker
 * Handles GET /api/brain-ai/standings/[leagueId]
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId?: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.leagueId || 'hs-football';

    // Return mock standings data for HS Football teams
    return NextResponse.json({
      success: true,
      leagueId,
      timestamp: new Date().toISOString(),
      data: {
        teams: [
          {
            name: 'Team A',
            wins: 10,
            losses: 1,
            eloRating: 1650,
            momentum: 'high',
            lastGame: 'W 42-28',
            trend: 'up',
          },
          {
            name: 'Team B',
            wins: 9,
            losses: 2,
            eloRating: 1600,
            momentum: 'medium',
            lastGame: 'W 35-21',
            trend: 'up',
          },
          {
            name: 'Team C',
            wins: 8,
            losses: 3,
            eloRating: 1550,
            momentum: 'low',
            lastGame: 'L 24-31',
            trend: 'down',
          },
          {
            name: 'Team D',
            wins: 7,
            losses: 4,
            eloRating: 1520,
            momentum: 'medium',
            lastGame: 'W 28-24',
            trend: 'stable',
          },
          {
            name: 'Team E',
            wins: 6,
            losses: 5,
            eloRating: 1480,
            momentum: 'low',
            lastGame: 'L 17-21',
            trend: 'down',
          },
        ],
      },
    });
  } catch (error) {
    console.error('GET /api/brain-ai/standings error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

