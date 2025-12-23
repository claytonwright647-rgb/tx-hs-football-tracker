import { NextResponse } from 'next/server';
import { Game, Team, LiveGame } from '@/lib/types';

// Mock data - will be replaced with actual API calls to MaxPreps/UIL
const mockTeams: { [key: string]: Team } = {
  duncanville: {
    id: 'duncanville',
    name: 'Duncanville',
    mascot: 'Panthers',
    city: 'Duncanville',
    school: 'Duncanville High School',
    classification: '6A',
    division: 'I',
    district: '11-6A',
    region: 2,
    record: '14-1',
  },
  northShore: {
    id: 'north-shore',
    name: 'North Shore',
    mascot: 'Mustangs',
    city: 'Houston',
    school: 'North Shore Senior High School',
    classification: '6A',
    division: 'I',
    district: '21-6A',
    region: 3,
    record: '16-0',
  },
};


const mockGames: LiveGame[] = [
  {
    id: '1',
    homeTeam: mockTeams.duncanville,
    awayTeam: mockTeams.northShore,
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
    time: '2024-12-21T19:00:00',
    broadcast: 'ESPN2',
    isDistrictGame: false,
    lastScorer: 'K. Williams',
    lastScorerTeam: 'away',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get('classification');
  const status = searchParams.get('status');
  const isPlayoff = searchParams.get('playoff');

  let games = [...mockGames];

  // Filter by classification
  if (classification) {
    games = games.filter((g) => g.classification === classification);
  }


  // Filter by status
  if (status) {
    games = games.filter((g) => g.status === status);
  }

  // Filter by playoff
  if (isPlayoff === 'true') {
    games = games.filter((g) => g.isPlayoff);
  }

  return NextResponse.json({
    success: true,
    count: games.length,
    games,
    timestamp: new Date().toISOString(),
  });
}
