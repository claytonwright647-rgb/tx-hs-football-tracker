/**
 * Brain AI Integration
 * Main entry point for Brain AI system
 * Provides unified API for both sports trackers
 */

import BrainAIController from './brain-ai-controller';
import LeagueScheduleManager from './league-schedule-manager';
import RealTimeGameTracker from './realtime-game-tracker';
import StandingsCalculator from './standings-calculator';
import AdaptiveLearningEngine from './adaptive-learning-engine';
import ScheduleSyncService from './schedule-sync-service';
import GameStateMonitor from './game-state-monitor';

export interface BrainAIAPI {
  // System control
  initialize(): Promise<void>;
  pause(): void;
  resume(): void;
  getStatus(): Promise<any>;

  // Game tracking
  trackGame(gameId: string, leagueId: string): Promise<void>;
  stopTrackingGame(gameId: string): void;
  getLiveGame(gameId: string): any;
  getAllLiveGames(): any[];

  // Standings and predictions
  getTeamStanding(teamId: string, leagueId: string): Promise<any>;
  getLeagueStandings(leagueId: string): Promise<any>;
  getDivisionStandings(leagueId: string, divisionId: string): Promise<any>;
  predictGameOutcome(homeELO: number, awayELO: number, leagueId: string): Promise<any>;

  // Game state monitoring
  getGameState(gameId: string): any;
  getHighMomentumGames(): any[];
  getCloseGames(): any[];

  // Learning and insights
  getPatterns(): any[];
  getImprovementMetrics(leagueId: string): Promise<any>;

  // Schedule management
  getUpcomingGames(hoursAhead: number): Promise<any[]>;
  getCurrentPhase(leagueId: string): string;
  syncAllSchedules(): Promise<void>;
}

export class BrainAI implements BrainAIAPI {
  private controller: BrainAIController;

  constructor(controller: BrainAIController) {
    this.controller = controller;
  }

  /**
   * Initialize the Brain AI system
   */
  async initialize(): Promise<void> {
    await this.controller.initialize();
  }

  /**
   * Pause autonomous operation
   */
  pause(): void {
    this.controller.pause();
  }

  /**
   * Resume autonomous operation
   */
  resume(): void {
    this.controller.resume();
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    return await this.controller.getSystemStatus();
  }

  /**
   * Start tracking a game
   */
  async trackGame(gameId: string, leagueId: string): Promise<void> {
    const subsystems = this.controller.getSubsystems();
    await subsystems.gameTracker.startGameMonitoring(gameId, leagueId);
    await subsystems.gameStateMonitor.startMonitoringGame(gameId, leagueId);
  }

  /**
   * Stop tracking a game
   */
  stopTrackingGame(gameId: string): void {
    const subsystems = this.controller.getSubsystems();
    subsystems.gameTracker.stopGameMonitoring(gameId);
    subsystems.gameStateMonitor.stopMonitoringGame(gameId);
  }

  /**
   * Get live game data
   */
  getLiveGame(gameId: string): any {
    const subsystems = this.controller.getSubsystems();
    return subsystems.gameTracker.getLiveGame(gameId);
  }

  /**
   * Get all live games
   */
  getAllLiveGames(): any[] {
    const subsystems = this.controller.getSubsystems();
    return subsystems.gameTracker.getAllLiveGames();
  }

  /**
   * Get team standing
   */
  async getTeamStanding(teamId: string, leagueId: string): Promise<any> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.standingsCalculator.getTeamStanding(teamId, leagueId);
  }

  /**
   * Get league standings
   */
  async getLeagueStandings(leagueId: string): Promise<any> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.standingsCalculator.getLeagueStandings(leagueId);
  }

  /**
   * Get division standings
   */
  async getDivisionStandings(leagueId: string, divisionId: string): Promise<any> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.standingsCalculator.getDivisionStandings(leagueId, divisionId);
  }

  /**
   * Predict game outcome
   */
  async predictGameOutcome(homeELO: number, awayELO: number, leagueId: string): Promise<any> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.learningEngine.predictGameOutcome(homeELO, awayELO, leagueId);
  }

  /**
   * Get game state
   */
  getGameState(gameId: string): any {
    const subsystems = this.controller.getSubsystems();
    return subsystems.gameStateMonitor.getGameState(gameId);
  }

  /**
   * Get high momentum games
   */
  getHighMomentumGames(): any[] {
    const subsystems = this.controller.getSubsystems();
    return subsystems.gameStateMonitor.getHighMomentumGames();
  }

  /**
   * Get close games
   */
  getCloseGames(): any[] {
    const subsystems = this.controller.getSubsystems();
    return subsystems.gameStateMonitor.getCloseGames();
  }

  /**
   * Get discovered patterns
   */
  getPatterns(): any[] {
    const subsystems = this.controller.getSubsystems();
    return subsystems.learningEngine.getAllPatterns();
  }

  /**
   * Get improvement metrics
   */
  async getImprovementMetrics(leagueId: string): Promise<any> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.learningEngine.getImprovementMetrics(leagueId);
  }

  /**
   * Get upcoming games
   */
  async getUpcomingGames(hoursAhead: number = 48): Promise<any[]> {
    const subsystems = this.controller.getSubsystems();
    return await subsystems.scheduleManager.getUpcomingGames(hoursAhead);
  }

  /**
   * Get current season phase
   */
  getCurrentPhase(leagueId: string): string {
    const subsystems = this.controller.getSubsystems();
    return subsystems.scheduleManager.getCurrentPhase(leagueId);
  }

  /**
   * Manually sync all schedules
   */
  async syncAllSchedules(): Promise<void> {
    const subsystems = this.controller.getSubsystems();
    await subsystems.syncService.syncAllLeagues();
  }
}

/**
 * Factory function to create and initialize Brain AI
 */
export async function createBrainAI(db: any, config?: any): Promise<BrainAI> {
  const controller = new BrainAIController(db, config);
  await controller.initialize();
  return new BrainAI(controller);
}

export {
  BrainAIController,
  LeagueScheduleManager,
  RealTimeGameTracker,
  StandingsCalculator,
  AdaptiveLearningEngine,
  ScheduleSyncService,
  GameStateMonitor,
};

export default BrainAI;
