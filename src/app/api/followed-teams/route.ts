import { NextResponse } from 'next/server';
import { sportsOrigin } from '@/lib/trackerOrigins';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(`${sportsOrigin}/api/hs-football-data?section=all`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    const payload = await response.json();

    if (!response.ok || !Array.isArray(payload?.teams)) {
      throw new Error(`Followed-team source returned HTTP ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      source: 'MaxPreps / UIL scoreboard via Wright Sports',
      teams: payload.teams,
      hasLiveGames: payload.hasLiveGames === true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Followed Texas teams source failed:', error);
    return NextResponse.json({
      success: false,
      status: 'unavailable',
      teams: [],
      hasLiveGames: false,
      message: 'Martin and Stephenville data could not be verified. No score or game state is being guessed.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
