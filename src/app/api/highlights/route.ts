import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const gameId = request.nextUrl.searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json(
      { success: false, error: 'gameId parameter is required' },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    available: false,
    gameId,
    highlights: [],
    sourceStatus: 'not_configured',
    message: 'No verified highlights provider is configured. The tracker will not substitute demo or unrelated videos.',
    timestamp: new Date().toISOString(),
  });
}
