import { NextResponse } from 'next/server';

// This will eventually fetch from MaxPreps, UIL, etc.
// For now, returning structured mock data

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get('classification');
  const week = searchParams.get('week');
  const status = searchParams.get('status'); // 'live', 'final', 'scheduled'

  // Mock response structure
  const games = [
    {
      id: '1',
      homeTeam: {
        id: 'duncanville',
        name: 'Duncanville',
        mascot: 'Panthers',
        city: 'Duncanville',
        classification: '6A',
        district: '11-6A',
        region: 2,
        record: '14-1',
      },
      awayTeam: {
        id: 'north-shore',
        name: 'North Shore',
        mascot: 'Mustangs',
        city: 'Houston',
        classification: '6A',
        district: '21-6A',
        region: 3,
        record: '15-0',
      },
      homeScore: 7,
      awayScore: 10,
      status: 'final',
      classification: '6A',
      division: 'I',
      isPlayoff: true,
      playoffRound: 'State Championship',
      venue: 'AT&T Stadium',
      city: 'Arlington',
      date: '2024-12-21',
      time: '15:00',
      broadcast: 'ABC',
      isDistrictGame: false,
    },
  ];


  // Filter by classification if provided
  let filteredGames = games;
  if (classification) {
    filteredGames = filteredGames.filter(g => g.classification === classification);
  }
  if (status) {
    filteredGames = filteredGames.filter(g => g.status === status);
  }

  return NextResponse.json({
    success: true,
    count: filteredGames.length,
    games: filteredGames,
    meta: {
      week: week || 'playoffs',
      classification: classification || 'all',
      timestamp: new Date().toISOString(),
    },
  });
}
