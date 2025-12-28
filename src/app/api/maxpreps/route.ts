import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchScores, 
  fetchRankings, 
  fetchPlayoffBracket, 
  fetchStatLeaders,
  fetchTeamSchedule,
  getUILClassifications,
  getPlayoffRounds
} from '@/lib/maxpreps';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'rankings';
  const classification = searchParams.get('class') || '6A';
  const division = searchParams.get('division') || 'Division I';
  const week = searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined;
  const teamId = searchParams.get('teamId');
  const statCategory = searchParams.get('stat') as 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks' | null;

  try {
    switch (action) {
      case 'rankings': {
        const rankings = await fetchRankings(classification);
        return NextResponse.json({
          action: 'rankings',
          classification,
          rankings,
          count: rankings.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      case 'scores': {
        const scores = await fetchScores(classification, week);
        return NextResponse.json({
          action: 'scores',
          classification,
          week,
          games: scores,
          count: scores.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      case 'playoffs': {
        const bracket = await fetchPlayoffBracket(classification, division);
        return NextResponse.json({
          action: 'playoffs',
          classification,
          division,
          rounds: getPlayoffRounds(),
          games: bracket,
          count: bracket.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      case 'leaders': {
        if (!statCategory) {
          return NextResponse.json({
            error: 'stat parameter required (passing, rushing, receiving, tackles, sacks)',
          }, { status: 400 });
        }
        const leaders = await fetchStatLeaders(classification, statCategory);
        return NextResponse.json({
          action: 'leaders',
          classification,
          statCategory,
          leaders,
          count: leaders.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      case 'schedule': {
        if (!teamId) {
          return NextResponse.json({
            error: 'teamId parameter required',
          }, { status: 400 });
        }
        const schedule = await fetchTeamSchedule(teamId);
        return NextResponse.json({
          action: 'schedule',
          teamId,
          games: schedule,
          count: schedule.length,
          lastUpdated: new Date().toISOString()
        });
      }
      
      case 'classifications': {
        return NextResponse.json({
          action: 'classifications',
          classifications: getUILClassifications(),
          playoffRounds: getPlayoffRounds()
        });
      }
      
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: rankings, scores, playoffs, leaders, schedule, classifications'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('MaxPreps API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch MaxPreps data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
