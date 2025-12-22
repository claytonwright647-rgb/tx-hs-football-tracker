import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const classification = searchParams.get('classification');

  // Mock standings data
  const standings = {
    district: '11-6A',
    classification: '6A',
    division: 'I',
    region: 2,
    teams: [
      {
        rank: 1,
        team: { name: 'Duncanville', mascot: 'Panthers', city: 'Duncanville' },
        overall: { wins: 14, losses: 1 },
        district: { wins: 7, losses: 0 },
        pointsFor: 485,
        pointsAgainst: 142,
        streak: 'W10',
        playoffSeed: 1,
      },
      {
        rank: 2,
        team: { name: 'DeSoto', mascot: 'Eagles', city: 'DeSoto' },
        overall: { wins: 13, losses: 2 },
        district: { wins: 6, losses: 1 },
        pointsFor: 512,
        pointsAgainst: 198,
        streak: 'W5',
        playoffSeed: 2,
      },
    ],
  };

  return NextResponse.json({
    success: true,
    standings,
    meta: {
      district: district || standings.district,
      timestamp: new Date().toISOString(),
    },
  });
}
