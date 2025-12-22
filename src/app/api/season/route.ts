// Season Intelligence API - Returns current phase and what actions to take
import { NextResponse } from 'next/server';
import {
  getCurrentPhase,
  getPhaseConfig,
  getSeasonConfig,
  getDaysUntil,
  getSeasonStatusMessage,
  shouldFetchLiveData,
  shouldFetchSchedules,
  getDataSourcesToQuery,
  getRefreshInterval,
  getCurrentSeasonYear,
} from '@/lib/seasonIntelligence';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const phase = getCurrentPhase();
    const phaseConfig = getPhaseConfig(phase);
    const seasonConfig = getSeasonConfig();
    const seasonYear = getCurrentSeasonYear();
    
    // Determine what data needs to be fetched
    const dataSources = getDataSourcesToQuery();
    
    // Calculate countdowns
    const countdowns = {
      scheduleRelease: getDaysUntil('schedule_release'),
      seasonStart: getDaysUntil('season_start'),
      nextSeason: getDaysUntil('next_season'),
    };

    const response = {
      success: true,
      timestamp: now.toISOString(),
      
      // Current state
      currentPhase: phase,
      phaseDisplayName: phaseConfig.displayName,
      phaseDescription: phaseConfig.description,
      statusMessage: getSeasonStatusMessage(),
      
      // Season info
      seasonYear,
      seasonConfig: {
        regularSeasonStart: seasonConfig.regularSeasonStart,
        playoffsStart: seasonConfig.playoffsStart,
        stateChampionships: seasonConfig.stateChampionships,
        seasonEnd: seasonConfig.seasonEnd,
      },
      
      // What to do
      actions: {
        shouldFetchSchedules: shouldFetchSchedules(),
        shouldFetchLiveData: shouldFetchLiveData(),
        dataSourcesToQuery: dataSources,
        refreshIntervalMs: getRefreshInterval(),
        refreshIntervalMinutes: phaseConfig.refreshInterval,
      },
      
      // UI hints
      ui: {
        showCountdown: phaseConfig.showCountdown,
        countdownTarget: phaseConfig.countdownTarget,
        showLiveScores: phaseConfig.showLiveScores,
        showSchedule: phaseConfig.showSchedule,
        primaryAction: phaseConfig.primaryAction,
      },
      
      // Countdowns
      countdowns,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Season intelligence error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get season intelligence' },
      { status: 500 }
    );
  }
}
