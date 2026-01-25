/**
 * Schedule Sync Service
 * Synchronizes game schedules from external APIs
 * Detects new games, postponements, cancellations
 * Updates both trackers in real-time
 */

import { EventEmitter } from 'events';
import { Database } from '@/lib/database';
import LeagueScheduleManager, { GameSchedule } from './league-schedule-manager';

export interface ScheduleEvent {
  leagueId: string;
  timestamp: Date;
  eventType: 'game_added' | 'game_postponed' | 'game_cancelled' | 'schedule_updated' | 'season_started' | 'season_ended';
  gameId?: string;
  details: any;
}

export class ScheduleSyncService extends EventEmitter {
  private db: Database;
  private scheduleManager: LeagueScheduleManager;
  private syncIntervals: Map<string, NodeJS.Timer> = new Map();
  private lastSyncTime: Map<string, Date> = new Map();
  private readonly DEFAULT_SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor(db: Database, scheduleManager: LeagueScheduleManager) {
    super();
    this.db = db;
    this.scheduleManager = scheduleManager;
  }

  /**
   * Start syncing schedules for a league
   */
  async startSyncForLeague(leagueId: string, syncInterval?: number): Promise<void> {
    if (this.syncIntervals.has(leagueId)) {
      console.log(`Already syncing schedule for league ${leagueId}`);
      return;
    }

    console.log(`Starting schedule sync for league ${leagueId}`);

    // Initial sync
    await this.syncLeagueSchedule(leagueId);

    // Set up recurring sync
    const interval = setInterval(
      async () => {
        await this.syncLeagueSchedule(leagueId);
      },
      syncInterval || this.DEFAULT_SYNC_INTERVAL
    );

    this.syncIntervals.set(leagueId, interval);
    this.emit('sync:started', { leagueId });
  }

  /**
   * Stop syncing schedules for a league
   */
  stopSyncForLeague(leagueId: string): void {
    const interval = this.syncIntervals.get(leagueId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(leagueId);
      this.lastSyncTime.delete(leagueId);
      this.emit('sync:stopped', { leagueId });
    }
  }

  /**
   * Sync schedules for a specific league
   */
  private async syncLeagueSchedule(leagueId: string): Promise<void> {
    try {
      const currentSeason = new Date().getFullYear();

      // Fetch external schedule
      const externalSchedule = await this.fetchExternalSchedule(leagueId, currentSeason);

      if (!externalSchedule || externalSchedule.length === 0) {
        console.log(`No external schedule found for ${leagueId}`);
        return;
      }

      // Get current schedule from database
      const currentSchedule = await this.db.query('game_schedules', {
        leagueId,
        season: currentSeason,
      });

      // Detect changes
      const changes = await this.detectScheduleChanges(
        currentSchedule,
        externalSchedule,
        leagueId
      );

      if (changes.added.length > 0) {
        console.log(
          `Found ${changes.added.length} new games for ${leagueId}`
        );
        for (const game of changes.added) {
          await this.db.insert('game_schedules', game);
          this.emit('schedule:game_added', {
            leagueId,
            gameId: game.id,
            game,
          });
        }
      }

      if (changes.postponed.length > 0) {
        console.log(
          `Found ${changes.postponed.length} postponed games for ${leagueId}`
        );
        for (const game of changes.postponed) {
          await this.db.update('game_schedules', {
            ...game,
            status: 'postponed',
          });
          this.emit('schedule:game_postponed', {
            leagueId,
            gameId: game.id,
            game,
          });
        }
      }

      if (changes.cancelled.length > 0) {
        console.log(
          `Found ${changes.cancelled.length} cancelled games for ${leagueId}`
        );
        for (const game of changes.cancelled) {
          await this.db.update('game_schedules', {
            ...game,
            status: 'cancelled',
          });
          this.emit('schedule:game_cancelled', {
            leagueId,
            gameId: game.id,
            game,
          });
        }
      }

      this.lastSyncTime.set(leagueId, new Date());
      this.emit('sync:completed', { leagueId, changes });
    } catch (error) {
      console.error(`Error syncing schedule for ${leagueId}:`, error);
      this.emit('sync:error', { leagueId, error });
    }
  }

  /**
   * Detect changes between current and external schedule
   */
  private async detectScheduleChanges(
    currentSchedule: GameSchedule[],
    externalSchedule: GameSchedule[],
    leagueId: string
  ): Promise<{
    added: GameSchedule[];
    postponed: GameSchedule[];
    cancelled: GameSchedule[];
  }> {
    const changes = {
      added: [] as GameSchedule[],
      postponed: [] as GameSchedule[],
      cancelled: [] as GameSchedule[],
    };

    // Build map of current games by external ID
    const currentGamesMap = new Map(
      currentSchedule.map((g) => [g.gameId || g.id, g])
    );

    // Find added games
    for (const extGame of externalSchedule) {
      const gameId = extGame.gameId || extGame.id;
      if (!currentGamesMap.has(gameId)) {
        changes.added.push(extGame);
      }
    }

    // Find postponed/cancelled games
    for (const [gameId, currentGame] of currentGamesMap) {
      const extGame = externalSchedule.find((g) => (g.gameId || g.id) === gameId);

      if (!extGame) {
        // Game not in external schedule anymore
        if (
          currentGame.status !== 'final' &&
          currentGame.status !== 'cancelled'
        ) {
          changes.cancelled.push(currentGame);
        }
      } else if (
        extGame.status === 'postponed' &&
        currentGame.status !== 'postponed'
      ) {
        changes.postponed.push(extGame);
      }
    }

    return changes;
  }

  /**
   * Fetch external schedule from league API
   */
  private async fetchExternalSchedule(
    leagueId: string,
    season: number
  ): Promise<GameSchedule[]> {
    try {
      switch (leagueId) {
        case 'nfl':
          return await this.fetchNFLSchedule(season);
        case 'nba':
          return await this.fetchNBASchedule(season);
        case 'mlb':
          return await this.fetchMLBSchedule(season);
        case 'cfb':
          return await this.fetchCFBSchedule(season);
        case 'tx-hs-football':
          return await this.fetchTexasHSSchedule(season);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching external schedule for ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * External schedule fetchers
   */
  private async fetchNFLSchedule(season: number): Promise<GameSchedule[]> {
    // Implementation would call ESPN API or NFL official API
    // Example structure:
    // const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule`);
    // const data = await response.json();
    // return data.events.map(event => ({ ... }));
    return [];
  }

  private async fetchNBASchedule(season: number): Promise<GameSchedule[]> {
    // Implementation would call ESPN API or NBA official API
    return [];
  }

  private async fetchMLBSchedule(season: number): Promise<GameSchedule[]> {
    // Implementation would call ESPN API or MLB official API
    return [];
  }

  private async fetchCFBSchedule(season: number): Promise<GameSchedule[]> {
    // Implementation would call ESPN API or cfb-data.com API
    return [];
  }

  private async fetchTexasHSSchedule(season: number): Promise<GameSchedule[]> {
    // Implementation would call MaxPreps API
    return [];
  }

  /**
   * Manually trigger sync for all leagues
   */
  async syncAllLeagues(): Promise<void> {
    const leagues = ['nfl', 'nba', 'mlb', 'cfb', 'tx-hs-football'];

    console.log('Syncing schedules for all leagues...');

    for (const leagueId of leagues) {
      await this.syncLeagueSchedule(leagueId);
    }
  }

  /**
   * Get sync status for a league
   */
  getSyncStatus(leagueId: string): {
    isSyncing: boolean;
    lastSyncTime: Date | null;
    nextSyncTime: Date | null;
  } {
    const isSyncing = this.syncIntervals.has(leagueId);
    const lastSync = this.lastSyncTime.get(leagueId) || null;
    let nextSync = null;

    if (isSyncing && lastSync) {
      nextSync = new Date(lastSync.getTime() + this.DEFAULT_SYNC_INTERVAL);
    }

    return {
      isSyncing,
      lastSyncTime: lastSync,
      nextSyncTime: nextSync,
    };
  }

  /**
   * Get all sync statuses
   */
  getAllSyncStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};
    const leagues = ['nfl', 'nba', 'mlb', 'cfb', 'tx-hs-football'];

    for (const leagueId of leagues) {
      statuses[leagueId] = this.getSyncStatus(leagueId);
    }

    return statuses;
  }

  /**
   * Handle season transition (offseason to preseason, etc)
   */
  async handleSeasonTransition(leagueId: string): Promise<void> {
    try {
      const currentPhase = this.scheduleManager.getCurrentPhase(leagueId);

      console.log(
        `League ${leagueId} entering phase: ${currentPhase}`
      );

      this.emit('season:phase_changed', { leagueId, phase: currentPhase });

      // Trigger full schedule sync on phase change
      await this.syncLeagueSchedule(leagueId);
    } catch (error) {
      console.error(`Error handling season transition for ${leagueId}:`, error);
    }
  }
}

export default ScheduleSyncService;
