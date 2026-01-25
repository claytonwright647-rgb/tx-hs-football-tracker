/**
 * Game State Monitor
 * Tracks real-time game state across all leagues
 * Monitors score changes, player events, injuries, momentum shifts
 * Updates UI in real-time via WebSocket
 */

import { EventEmitter } from 'events';
import { Database } from '@/lib/database';
import RealTimeGameTracker, { LiveGame, GameEvent } from './realtime-game-tracker';

export interface GameState {
  gameId: string;
  leagueId: string;
  timestamp: Date;
  score: {
    home: number;
    away: number;
    differential: number;
  };
  quarter?: number;
  timeRemaining?: string;
  possession?: 'home' | 'away';
  momentum: {
    home: number;
    away: number;
    trend: 'home_gaining' | 'away_gaining' | 'neutral';
  };
  injuries: Array<{
    playerId: string;
    playerName: string;
    team: 'home' | 'away';
    severity: 'minor' | 'moderate' | 'severe' | 'out';
    description: string;
  }>;
  stats: {
    homeTeamStats: Record<string, number>;
    awayTeamStats: Record<string, number>;
  };
  predictions: {
    homeWinProbability: number;
    awayWinProbability: number;
    expectedFinalScore: string;
  };
}

export class GameStateMonitor extends EventEmitter {
  private db: Database;
  private gameTracker: RealTimeGameTracker;
  private gameStates: Map<string, GameState> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timer> = new Map();
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  constructor(db: Database, gameTracker: RealTimeGameTracker) {
    super();
    this.db = db;
    this.gameTracker = gameTracker;

    // Listen for game tracker events
    this.gameTracker.on('game:score_update', (event) => this.handleScoreUpdate(event));
    this.gameTracker.on('game:status_change', (event) => this.handleStatusChange(event));
  }

  /**
   * Start monitoring game state
   */
  async startMonitoringGame(gameId: string, leagueId: string): Promise<void> {
    if (this.monitoringIntervals.has(gameId)) {
      console.log(`Already monitoring game state for ${gameId}`);
      return;
    }

    console.log(`Starting game state monitoring for ${gameId}`);

    // Initial state update
    await this.updateGameState(gameId);

    // Set up polling interval
    const interval = setInterval(async () => {
      await this.updateGameState(gameId);
    }, this.POLL_INTERVAL);

    this.monitoringIntervals.set(gameId, interval);
    this.emit('monitor:started', { gameId });
  }

  /**
   * Stop monitoring game state
   */
  stopMonitoringGame(gameId: string): void {
    const interval = this.monitoringIntervals.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(gameId);
      this.gameStates.delete(gameId);
      this.emit('monitor:stopped', { gameId });
    }
  }

  /**
   * Update complete game state
   */
  private async updateGameState(gameId: string): Promise<void> {
    try {
      const liveGame = this.gameTracker.getLiveGame(gameId);
      if (!liveGame) return;

      // Fetch detailed game data
      const gameData = await this.fetchDetailedGameData(gameId, liveGame.leagueId);

      // Create comprehensive game state
      const gameState: GameState = {
        gameId,
        leagueId: liveGame.leagueId,
        timestamp: new Date(),
        score: {
          home: liveGame.homeScore,
          away: liveGame.awayScore,
          differential: liveGame.homeScore - liveGame.awayScore,
        },
        quarter: liveGame.quarter,
        timeRemaining: liveGame.timeRemaining,
        possession: this.determinePossession(gameData),
        momentum: this.calculateMomentumDetailed(liveGame, gameData),
        injuries: await this.fetchInjuryReport(gameId, liveGame.leagueId),
        stats: {
          homeTeamStats: gameData?.homeTeamStats || {},
          awayTeamStats: gameData?.awayTeamStats || {},
        },
        predictions: await this.calculateGamePredictions(liveGame),
      };

      // Compare with previous state and emit changes
      const previousState = this.gameStates.get(gameId);
      this.detectStateChanges(previousState, gameState);

      // Update state
      this.gameStates.set(gameId, gameState);

      // Persist to database
      await this.db.update('game_states', gameState);

      this.emit('state:updated', { gameId, state: gameState });
    } catch (error) {
      console.error(`Error updating game state for ${gameId}:`, error);
    }
  }

  /**
   * Fetch detailed game data from external sources
   */
  private async fetchDetailedGameData(
    gameId: string,
    leagueId: string
  ): Promise<any> {
    try {
      // This would call external APIs based on league
      // For now, returning structure
      return {
        homeTeamStats: {
          passingYards: 0,
          rushingYards: 0,
          turnovers: 0,
          timeOfPossession: 0,
        },
        awayTeamStats: {
          passingYards: 0,
          rushingYards: 0,
          turnovers: 0,
          timeOfPossession: 0,
        },
        recentScoring: [],
      };
    } catch (error) {
      console.error(`Error fetching detailed game data for ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Determine current possession
   */
  private determinePossession(gameData: any): 'home' | 'away' | undefined {
    // Implementation would parse game data to determine who has the ball
    return undefined;
  }

  /**
   * Calculate detailed momentum metrics
   */
  private calculateMomentumDetailed(
    liveGame: LiveGame,
    gameData: any
  ): GameState['momentum'] {
    const homeTeamMomentum = liveGame.momentum.homeTeam;
    const awayTeamMomentum = liveGame.momentum.awayTeam;

    let trend: 'home_gaining' | 'away_gaining' | 'neutral' = 'neutral';
    if (homeTeamMomentum > awayTeamMomentum + 10) {
      trend = 'home_gaining';
    } else if (awayTeamMomentum > homeTeamMomentum + 10) {
      trend = 'away_gaining';
    }

    return {
      home: homeTeamMomentum,
      away: awayTeamMomentum,
      trend,
    };
  }

  /**
   * Fetch injury report for game
   */
  private async fetchInjuryReport(
    gameId: string,
    leagueId: string
  ): Promise<GameState['injuries']> {
    try {
      const injuries = await this.db.query('injuries', { gameId });
      return injuries.map((inj: any) => ({
        playerId: inj.playerId,
        playerName: inj.playerName,
        team: inj.team,
        severity: inj.severity,
        description: inj.description,
      }));
    } catch (error) {
      console.error(`Error fetching injury report for ${gameId}:`, error);
      return [];
    }
  }

  /**
   * Calculate real-time game predictions
   */
  private async calculateGamePredictions(liveGame: LiveGame): Promise<GameState['predictions']> {
    try {
      // Get current score and time remaining
      const scoreDifferential = liveGame.homeScore - liveGame.awayScore;
      const quarterRemaining = (4 - (liveGame.quarter || 1)) || 1;

      // Simple prediction: extrapolate current trend
      const homeTeamAvgPerQuarter = liveGame.homeScore / (liveGame.quarter || 1);
      const awayTeamAvgPerQuarter = liveGame.awayScore / (liveGame.quarter || 1);

      const projectedHomeScore = liveGame.homeScore + homeTeamAvgPerQuarter * quarterRemaining;
      const projectedAwayScore = liveGame.awayScore + awayTeamAvgPerQuarter * quarterRemaining;

      const totalPoints = projectedHomeScore + projectedAwayScore;

      // Win probability based on projection
      let homeWinProbability = 0.5;
      if (projectedHomeScore > projectedAwayScore) {
        homeWinProbability = 0.6 + Math.min(0.4, Math.abs(projectedHomeScore - projectedAwayScore) / 50);
      } else if (projectedAwayScore > projectedHomeScore) {
        homeWinProbability = 0.4 - Math.min(0.4, Math.abs(projectedHomeScore - projectedAwayScore) / 50);
      }

      return {
        homeWinProbability: Math.max(0, Math.min(1, homeWinProbability)),
        awayWinProbability: Math.max(0, Math.min(1, 1 - homeWinProbability)),
        expectedFinalScore: `${Math.round(projectedHomeScore)}-${Math.round(projectedAwayScore)}`,
      };
    } catch (error) {
      console.error('Error calculating game predictions:', error);
      return {
        homeWinProbability: 0.5,
        awayWinProbability: 0.5,
        expectedFinalScore: 'Unknown',
      };
    }
  }

  /**
   * Detect state changes from previous to current
   */
  private detectStateChanges(previousState: GameState | undefined, currentState: GameState): void {
    if (!previousState) return;

    // Score change
    if (
      previousState.score.home !== currentState.score.home ||
      previousState.score.away !== currentState.score.away
    ) {
      this.emit('state:score_change', {
        gameId: currentState.gameId,
        previousScore: previousState.score,
        currentScore: currentState.score,
      });
    }

    // Momentum shift
    if (previousState.momentum.trend !== currentState.momentum.trend) {
      this.emit('state:momentum_shift', {
        gameId: currentState.gameId,
        previousTrend: previousState.momentum.trend,
        currentTrend: currentState.momentum.trend,
      });
    }

    // Injury update
    if (previousState.injuries.length !== currentState.injuries.length) {
      this.emit('state:injury_update', {
        gameId: currentState.gameId,
        injuries: currentState.injuries,
      });
    }

    // Win probability swing
    const probSwing = Math.abs(
      previousState.predictions.homeWinProbability - currentState.predictions.homeWinProbability
    );
    if (probSwing > 0.1) {
      this.emit('state:probability_swing', {
        gameId: currentState.gameId,
        previousProb: previousState.predictions.homeWinProbability,
        currentProb: currentState.predictions.homeWinProbability,
      });
    }
  }

  /**
   * Handle score update from game tracker
   */
  private handleScoreUpdate(event: GameEvent): void {
    this.emit('tracker:score_update', event);
  }

  /**
   * Handle status change from game tracker
   */
  private handleStatusChange(event: GameEvent): void {
    this.emit('tracker:status_change', event);
  }

  /**
   * Get current game state
   */
  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  /**
   * Get all active game states
   */
  getAllGameStates(): GameState[] {
    return Array.from(this.gameStates.values());
  }

  /**
   * Get game states for league
   */
  getGameStatesForLeague(leagueId: string): GameState[] {
    return Array.from(this.gameStates.values()).filter((state) => state.leagueId === leagueId);
  }

  /**
   * Get high-momentum games (great games to watch)
   */
  getHighMomentumGames(): GameState[] {
    return Array.from(this.gameStates.values())
      .filter((state) => Math.abs(state.momentum.home - state.momentum.away) > 30)
      .sort((a, b) => Math.abs(b.momentum.home - b.momentum.away) - Math.abs(a.momentum.home - a.momentum.away));
  }

  /**
   * Get close games
   */
  getCloseGames(): GameState[] {
    return Array.from(this.gameStates.values())
      .filter((state) => Math.abs(state.score.differential) <= 7)
      .sort((a, b) => Math.abs(a.score.differential) - Math.abs(b.score.differential));
  }
}

export default GameStateMonitor;
