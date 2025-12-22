// Cron Job: Intelligent Data Fetcher
// Runs periodically and fetches data based on current season phase
import { NextResponse } from 'next/server';
import {
  getCurrentPhase,
  getPhaseConfig,
  shouldFetchLiveData,
  shouldFetchSchedules,
  getSeasonConfig,
  SeasonPhase,
} from '@/lib/seasonIntelligence';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 second timeout for cron

// ESPN API endpoints for Texas HS Football
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football';
const ESPN_HS_SCOREBOARD = `${ESPN_BASE}/high-school/scoreboard`;

interface FetchResult {
  source: string;
  success: boolean;
  recordsFound: number;
  error?: string;
}

async function fetchESPNSchedules(state: string = 'texas'): Promise<FetchResult> {
  try {
    // ESPN high school football endpoint
    const url = `${ESPN_HS_SCOREBOARD}?state=${state}&limit=100`;
    const res = await fetch(url, { 
      next: { revalidate: 0 },
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      return { source: 'ESPN Schedules', success: false, recordsFound: 0, error: `HTTP ${res.status}` };
    }
    
    const data = await res.json();
    const events = data.events || [];
    
    // TODO: Store in database/cache
    console.log(`[CRON] Fetched ${events.length} games from ESPN`);
    
    return { source: 'ESPN Schedules', success: true, recordsFound: events.length };
  } catch (error) {
    return { source: 'ESPN Schedules', success: false, recordsFound: 0, error: String(error) };
  }
}

async function fetchESPNLiveScores(): Promise<FetchResult> {
  try {
    const url = `${ESPN_HS_SCOREBOARD}?state=texas&limit=100`;
    const res = await fetch(url, { 
      next: { revalidate: 0 },
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      return { source: 'ESPN Live Scores', success: false, recordsFound: 0, error: `HTTP ${res.status}` };
    }
    
    const data = await res.json();
    const liveGames = (data.events || []).filter((e: any) => 
      e.status?.type?.state === 'in'
    );
    
    console.log(`[CRON] Found ${liveGames.length} live games`);
    
    return { source: 'ESPN Live Scores', success: true, recordsFound: liveGames.length };
  } catch (error) {
    return { source: 'ESPN Live Scores', success: false, recordsFound: 0, error: String(error) };
  }
}

// Determine what to fetch based on phase
function getTasksForPhase(phase: SeasonPhase): string[] {
  const tasks: string[] = [];
  
  switch (phase) {
    case 'deep_offseason':
      // Nothing to fetch, just check status
      tasks.push('status_check');
      break;
      
    case 'schedule_watch':
      // Start looking for schedules
      tasks.push('fetch_schedules');
      tasks.push('check_uil_releases');
      break;
      
    case 'preseason':
    case 'fall_camp':
      // Schedules should be available
      tasks.push('fetch_schedules');
      tasks.push('fetch_rankings');
      break;
      
    case 'scrimmages':
      // Some games happening
      tasks.push('fetch_schedules');
      tasks.push('fetch_scores');
      break;
      
    case 'regular_season':
    case 'playoffs':
    case 'state_championships':
      // Full game mode
      tasks.push('fetch_schedules');
      tasks.push('fetch_live_scores');
      tasks.push('fetch_standings');
      break;
      
    case 'postseason':
      // Archive results
      tasks.push('archive_results');
      break;
  }
  
  return tasks;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Skip auth check if no secret configured (for testing)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const phase = getCurrentPhase();
    const phaseConfig = getPhaseConfig(phase);
    const seasonConfig = getSeasonConfig();
    const tasks = getTasksForPhase(phase);
    
    console.log(`[CRON] Running for phase: ${phase}, tasks: ${tasks.join(', ')}`);
    
    const results: FetchResult[] = [];
    
    // Execute tasks based on phase
    for (const task of tasks) {
      switch (task) {
        case 'fetch_schedules':
          if (shouldFetchSchedules()) {
            results.push(await fetchESPNSchedules());
          }
          break;
          
        case 'fetch_live_scores':
        case 'fetch_scores':
          if (shouldFetchLiveData()) {
            results.push(await fetchESPNLiveScores());
          }
          break;
          
        case 'status_check':
          results.push({ source: 'Status Check', success: true, recordsFound: 0 });
          break;
          
        case 'check_uil_releases':
          // TODO: Implement UIL schedule checking
          results.push({ source: 'UIL Check', success: true, recordsFound: 0 });
          break;
          
        case 'fetch_rankings':
          // TODO: Implement rankings fetch from MaxPreps
          results.push({ source: 'Rankings', success: true, recordsFound: 0 });
          break;
          
        case 'fetch_standings':
          // TODO: Implement standings fetch
          results.push({ source: 'Standings', success: true, recordsFound: 0 });
          break;
          
        case 'archive_results':
          // TODO: Archive season results
          results.push({ source: 'Archive', success: true, recordsFound: 0 });
          break;
      }
    }
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      phase,
      phaseDisplayName: phaseConfig.displayName,
      seasonYear: seasonConfig.year,
      tasksExecuted: tasks,
      results,
      durationMs: duration,
      nextRunRecommended: `${phaseConfig.refreshInterval} minutes`,
    });
    
  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error), durationMs: Date.now() - startTime },
      { status: 500 }
    );
  }
}
