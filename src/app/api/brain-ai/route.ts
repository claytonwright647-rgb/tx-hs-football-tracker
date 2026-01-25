/**
 * Brain AI API Routes for HS Football Tracker
 * Proxies to main Brain AI system at wright-sports.com
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Main GET handler - Fetch Brain AI state
 */
export async function GET(req: NextRequest) {
  try {
    // Proxy to main dashboard Brain AI
    const response = await fetch('https://www.wright-sports.com/api/ai-brain', {
      headers: {
        'x-hs-football-context': 'true',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch brain state');
    }

    const data = await response.json();
    
    // Add HS Football context
    if (data.state) {
      data.state.context = 'tx-hs-football';
      data.state.currentTracker = 'Texas HS Football';
    }

    return NextResponse.json({
      success: true,
      system: 'active',
      leagueId: 'hs-football',
      timestamp: new Date().toISOString(),
      message: 'Brain AI system is running for HS Football',
      ...data
    });
  } catch (error) {
    console.error('GET /api/brain-ai error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: 'Brain AI offline - using local mode'
      },
      { status: 200 } // Return 200 to not break the UI
    );
  }
}

/**
 * Main POST handler - Send requests to Brain AI
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Add HS Football context to all requests
    const enhancedBody = {
      ...body,
      context: 'tx-hs-football',
      trackerInfo: {
        name: 'Texas HS Football Tracker',
        primaryTeam: 'James Martin HS Warriors',
        district: 'District 3-6A',
        classification: 'UIL 6A',
        location: 'Arlington, Texas'
      }
    };

    // If it's a chat message, add HS Football context
    if (body.action === 'chat' && body.message) {
      enhancedBody.message = `[HS Football Tracker] ${body.message}`;
    }

    // Proxy POST requests to main dashboard
    const response = await fetch('https://www.wright-sports.com/api/ai-brain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hs-football-context': 'true',
      },
      body: JSON.stringify(enhancedBody)
    });

    if (!response.ok) {
      throw new Error('Failed to communicate with AI Brain');
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('POST /api/brain-ai error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        response: '❌ I\'m having trouble connecting to the main AI Brain. Please try again.'
      },
      { status: 200 } // Return 200 to not break the UI
    );
  }
}
