/**
 * Real-time Game Tracker
 * Monitors all games in real-time across all leagues
 * Detects status changes, score updates, injuries, etc
 */

import { EventEmitter } from 'events';
import LeagueScheduleManager, { GameSchedule, TeamStandings } from './league-schedule-manager';
import { Database } from '@/lib/database';

export interface GameEvent {
  gameId: string;
  leagueId: string;
  timestamp: Date;
  eventType: 'game_start' | 'score_update' | 'injury' | 'timeout' | 'quarter_end' | 'game_end' | 'status_change';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  details: any;
  quarter?: number;
  timeRemaining?: string;
}

export interface LiveGame {
  gameId: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'final';
  quarter?: number;
  timeRemaining?: string;
  lastUpdate: Date;
  events: GameEvent[];
  momentum: {
    homeTeam: number;
    awayTeam: number;
  };
}

export class RealTimeGameTracker extends EventEmitter {
  private db: Database;
  private scheduleManager: LeagueScheduleManager;
  private liveGames: Map<string, LiveGame> = new Map();
  private trackingIntervals: Map<string, NodeJS.Timer> = new Map();
  private readonly UPDATE_INTERVAL = 10000; // 10 seconds

  constructor(db: Database, scheduleManager: LeagueScheduleManager) {
    super();
    this.db = db;
    this.scheduleManager = scheduleManager;
  }

  /**
   * Start monitoring a game
   */
  async startGameMonitoring(gameId: string, leagueId: string): Promise<void> {
    if (this.trackingIntervals.has(gameId)) {
      console.log(`Already tracking game ${gameId}`);
      return;
    }

    console.log(`Starting to track game ${gameId} for league ${leagueId}`);

    // Initial fetch
    await this.updateGameStatus(gameId, leagueId);

    // Set up interval for updates
    const interval = setInterval(async () => {
      await this.updateGameStatus(gameId, leagueId);
    }, this.UPDATE_INTERVAL);

    this.trackingIntervals.set(gameId, interval);
    this.emit('game:tracking_started', { gameId, leagueId });
  }

  /**
   * Stop monitoring a game
   */
  stopGameMonitoring(gameId: string): void {
    const interval = this.trackingIntervals.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.trackingIntervals.delete(gameId);
      this.liveGames.delete(gameId);
      this.emit('game:tracking_stopped', { gameId });
    }
  }

  /**
   * Update game status from external sources
   */
  private async updateGameStatus(gameId: string, leagueId: string): Promise<void> {
    try {
      const gameData = await this.fetchGameData(gameId, leagueId);

      if (!gameData) return;

      const currentGame = this.liveGames.get(gameId);

      // Create or update live game
      const liveGame: LiveGame = {
        gameId,
        leagueId,
        homeTeamId: gameData.homeTeamId,
        awayTeamId: gameData.awayTeamId,
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        status: gameData.status,
        quarter: gameData.quarter,
        timeRemaining: gameData.timeRemaining,
        lastUpdate: new Date(),
        events: currentGame?.events || [],
        momentum: this.calculateMomentum(gameData),
      };

      // Detect changes and emit events
      if (currentGame) {
        if (gameData.homeScore !== currentGame.homeScore || gameData.awayScore !== currentGame.awayScore) {
          const event: GameEvent = {
            gameId,
            leagueId,
            timestamp: new Date(),
            eventType: 'score_update',
            homeTeamId: gameData.homeTeamId,
            awayTeamId: gameData.awayTeamId,
            homeScore: gameData.homeScore,
            awayScore: gameData.awayScore,
            details: {
              previousHomeScore: currentGame.homeScore,
              previousAwayScore: currentGame.awayScore,
            },
          };
          liveGame.events.push(event);
          this.emit('game:score_update', event);
        }

        if (gameData.status !== currentGame.status) {
          const event: GameEvent = {
            gameId,
            leagueId,
            timestamp: new Date(),
            eventType: 'status_change',
            homeTeamId: gameData.homeTeamId,
            awayTeamId: gameData.awayTeamId,
            homeScore: gameData.homeScore,
            awayScore: gameData.awayScore,
            details: {
              previousStatus: currentGame.status,
              newStatus: gameData.status,
            },
          };
          liveGame.events.push(event);
          this.emit('game:status_change', event);

          // If game ended, update standings
          if (gameData.status === 'final') {
            await this.scheduleManager.updateStandings(leagueId, {
              id: gameId,
              leagueId,
              season: new Date().getFullYear(),
              gameId,
              homeTeamId: gameData.homeTeamId,
              awayTeamId: gameData.awayTeamId,
              scheduledTime: new Date(),
              venue: '',
              gameType: 'regular',
              status: 'final',
              homeScore: gameData.homeScore,
              awayScore: gameData.awayScore,
            });

            this.stopGameMonitoring(gameId);
          }
        }
      }

      this.liveGames.set(gameId, liveGame);
      await this.db.update('live_games', liveGame);
    } catch (error) {
      console.error(`Error updating game status for ${gameId}:`, error);
    }
  }

  /**
   * Calculate momentum based on recent scoring
   */
  private calculateMomentum(gameData: any): { homeTeam: number; awayTeam: number } {
    // Momentum calculation based on:
    // - Recent scoring (who scored last)
    // - Score trend
    // - Possession changes
    // Returns -100 to +100 scale

    const homeMomentum = Math.random() * 100 - 50; // Placeholder
    const awayMomentum = Math.random() * 100 - 50; // Placeholder

    return { homeTeam: homeMomentum, awayTeam: awayMomentum };
  }

  /**
   * Fetch game data from external sources
   */
  private async fetchGameData(gameId: string, leagueId: string): Promise<any> {
    try {
      switch (leagueId) {
        case 'nfl':
          return await this.fetchNFLGameData(gameId);
        case 'nba':
          return await this.fetchNBAGameData(gameId);
        case 'mlb':
          return await this.fetchMLBGameData(gameId);
        case 'cfb':
          return await this.fetchCFBGameData(gameId);
        case 'tx-hs-football':
          return await this.fetchHSGameData(gameId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching game data for ${gameId}:`, error);
      return null;
    }
  }

  /**
   * External API fetchers
   */
  private async fetchNFLGameData(gameId: string): Promise<any> {
    // Implement ESPN API call
    return null;
  }

  private async fetchNBAGameData(gameId: string): Promise<any> {
    // Implement ESPN API call
    return null;
  }

  private async fetchMLBGameData(gameId: string): Promise<any> {
    // Implement ESPN API call
    return null;
  }

  private async fetchCFBGameData(gameId: string): Promise<any> {
    // Implement ESPN API call
    return null;
  }

  private async fetchHSGameData(gameId: string): Promise<any> {
    // Implement MaxPreps API call
    return null;
  }

  /**
   * Get live game by ID
   */
  getLiveGame(gameId: string): LiveGame | undefined {
    return this.liveGames.get(gameId);
  }

  /**
   * Get all live games
   */
  getAllLiveGames(): LiveGame[] {
    return Array.from(this.liveGames.values());
  }

  /**
   * Get live games for a specific league
   */
  getLiveGamesForLeague(leagueId: string): LiveGame[] {
    return Array.from(this.liveGames.values()).filter((game) => game.leagueId === leagueId);
  }

  /**
   * Monitor all upcoming games in next N hours
   */
  async monitorUpcomingGames(hoursAhead: number = 48): Promise<void> {
    const upcomingGames = await this.scheduleManager.getUpcomingGames(hoursAhead);

    console.log(`Monitoring ${upcomingGames.length} upcoming games`);

    for (const game of upcomingGames) {
      // Start monitoring when game is within 30 minutes
      const timeUntilGame = game.scheduledTime.getTime() - Date.now();
      if (timeUntilGame > 0 && timeUntilGame < 30 * 60 * 1000) {
        await this.startGameMonitoring(game.id, game.leagueId);
      }
    }
  }
}

export default RealTimeGameTracker;
