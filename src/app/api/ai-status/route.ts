/**
 * AI Status API for HS Football Tracker
 * Proxies to main Brain AI system and adds HS Football context
 */

import { NextResponse } from 'next/server';
import { sportsOrigin } from '@/lib/trackerOrigins';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    // Fetch status from main dashboard Brain AI
    const mainDashboardStatus = await fetch(`${sportsOrigin}/api/ai-status`, {
      headers: {
        'x-hs-football-context': 'true',
      },
      next: { revalidate: 0 }
    });

    if (!mainDashboardStatus.ok) {
      throw new Error('Failed to fetch from main dashboard');
    }

    const statusData = await mainDashboardStatus.json();

    // Add HS Football specific context
    const hsFootballStatus = {
      ...statusData,
      context: 'tx-hs-football',
      trackerName: 'Texas HS Football Tracker',
      primaryTeam: 'James Martin HS Warriors',
      specialFeatures: [
        'UIL 6A tracking',
        'District 3-6A standings',
        'MaxPreps integration',
        'Arlington ISD focus',
        'Playoff bracket tracking'
      ],
      aiExpertise: [
        ...(statusData.aiExpertise || []),
        'Texas UIL Football',
        'High School Playoffs',
        'District Tiebreakers',
        'MaxPreps Data'
      ]
    };

    return NextResponse.json(hsFootballStatus);
  } catch (error) {
    console.error('AI Status error:', error);
    
    // Return fallback status
    return NextResponse.json({
      status: 'unknown',
      statusEmoji: '❓',
      statusColor: 'gray',
      lastCheckFormatted: 'Unknown',
      timeAgo: '?',
      nextCheckFormatted: 'Unknown',
      message: 'Unable to connect to AI Brain',
      context: 'tx-hs-football',
      trackerName: 'Texas HS Football Tracker',
      suggestions: [],
      aiExpertise: ['Texas HS Football', 'UIL Tracking'],
      yourTeams: ['James Martin HS Warriors']
    });
  }
}
