/**
 * Brain AI Dynamic Standings Route - HS Football
 * Returns only sourced current-season standings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPhase, getCurrentSeasonYear } from '@/lib/seasonIntelligence';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> },
) {
  const { leagueId } = await params;
  const normalizedLeagueId = leagueId.toLowerCase();

  return NextResponse.json({
    success: true,
    available: false,
    leagueId: normalizedLeagueId,
    timestamp: new Date().toISOString(),
    data: { teams: [] },
    meta: {
      seasonYear: getCurrentSeasonYear(),
      phase: getCurrentPhase(),
      sourceStatus: 'not_published_for_current_season',
      message: 'Verified current-season standings are not published. AI standings are disabled until official records are available.',
    },
  });
}
