/**
 * Brain AI Dynamic Standings Route - HS Football
 * Handles GET /api/brain-ai/standings/[leagueId]
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;

    // Return mock standings data for HS Football
    const standingsData: Record<string, any> = {
      'hs-football': {
        teams: [
          { name: 'Team A', wins: 10, losses: 1, eloRating: 1650, momentum: 'high', lastGame: 'W 42-28' },
          { name: 'Team B', wins: 9, losses: 2, eloRating: 1600, momentum: 'medium', lastGame: 'W 35-21' },
          { name: 'Team C', wins: 8, losses: 3, eloRating: 1550, momentum: 'low', lastGame: 'L 24-31' },
          { name: 'Team D', wins: 7, losses: 4, eloRating: 1520, momentum: 'medium', lastGame: 'W 28-24' },
          { name: 'Team E', wins: 6, losses: 5, eloRating: 1480, momentum: 'low', lastGame: 'L 17-21' },
        ],
      },
    };

    const standings = standingsData[leagueId.toLowerCase()] || standingsData['hs-football'];

    return NextResponse.json({
      success: true,
      leagueId: leagueId.toLowerCase(),
      timestamp: new Date().toISOString(),
      data: {
        teams: standings.teams,
      },
    });
  } catch (error) {
    console.error('GET /api/brain-ai/standings/[leagueId] error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
