/**
 * Brain AI API Routes for HS Football Tracker
 * Simplified mock API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Main GET handler
 */
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      system: 'active',
      leagueId: 'hs-football',
      timestamp: new Date().toISOString(),
      message: 'Brain AI system is running for HS Football',
    });
  } catch (error) {
    console.error('GET /api/brain-ai error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Main POST handler
 */
export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Brain AI POST request received',
    });
  } catch (error) {
    console.error('POST /api/brain-ai error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

