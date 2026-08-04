import { NextResponse } from 'next/server';
import { getCurrentPhase, getCurrentSeasonYear, getPhaseConfig } from '@/lib/seasonIntelligence';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const classification = searchParams.get('classification') || '6A';
  const phase = getCurrentPhase();

  return NextResponse.json({
    success: true,
    available: false,
    standings: null,
    meta: {
      district,
      classification,
      seasonYear: getCurrentSeasonYear(),
      phase,
      timestamp: new Date().toISOString(),
      sourceStatus: 'not_published_for_current_season',
      message: `${classification} district standings are not published during ${getPhaseConfig(phase).displayName}.`,
    },
  });
}
