// Enhanced Game Data Types & Utilities
// Supports all new features except fantasy, social, and mobile optimization

import { Game, LiveGame } from './types';

export interface GameSituation {
  down?: number;
  distance?: number;
  yardLine?: number;
  yardsToEndzone?: number;
  possession?: string;
  isRedZone?: boolean;
  downDistanceText?: string;
  quarter?: number;
  timeRemaining?: string;
  
  // New Real-Time Features
  turnoverDifferential?: number;
  penaltyCount?: number;
  redZoneAttempts?: {
    team: string;
    attempts: number;
    scores: number;
  }[];
  thirdDownConverts?: {
    team: string;
    converts: number;
    attempts: number;
  }[];
  momentum?: 'home' | 'away' | 'neutral';
  momentumScore?: number; // -100 to +100 scale
  
  // Drive Information
  currentDrive?: {
    startYardLine: number;
    plays: number;
    yardsGained: number;
    timeElapsed: number;
    result?: 'TD' | 'FG' | 'PUNT' | 'INT' | 'FUMBLE' | 'DOWNS';
  };
  
  // Win Probability
  winProbability?: {
    home: number;
    away: number;
  };
  
  // Critical Stats Display
  quarterlyScoring?: {
    quarter: number;
    homeScore: number;
    awayScore: number;
  }[];
}

export interface EnhancedGameStats {
  // Offensive Stats
  passing: {
    yards: number;
    completions: number;
    attempts: number;
    touchdowns: number;
    interceptions: number;
    efficiency?: number; // EPA per play
  };
  rushing: {
    yards: number;
    attempts: number;
    touchdowns: number;
    avgYardsPerAttempt?: number;
  };
  totalOffensiveYards: number;
  
  // Defensive Stats
  tackles: number;
  sacks: number;
  interceptions: number;
  forcedFumbles: number;
  defensiveScore?: number; // Defensive efficiency rating
  
  // Game Efficiency
  redZoneEfficiency?: number; // % of red zone entries resulting in scores
  timeOfPossession?: string;
  turnoverDifferential?: number;
  penaltyYards?: number;
  
  // Advanced Metrics
  scoringByQuarter?: number[];
  speedOfPlay?: number; // seconds per play
  
  // Strength indicators
  strengthOfSchedule?: number;
  pointDifferential?: number;
}

export interface PlayerStats {
  name: string;
  number?: string;
  position: string;
  
  // Passing
  passingYards?: number;
  passingTouchdowns?: number;
  interceptions?: number;
  
  // Rushing
  rushingYards?: number;
  rushingTouchdowns?: number;
  rushingAttempts?: number;
  
  // Receiving
  receptions?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  
  // Defense
  tackles?: number;
  sacks?: number;
  passBreakups?: number;
  defensiveInterceptions?: number;
  forcedFumbles?: number;
  
  // Performance Indicators
  anomalousPerformance?: {
    stat: string;
    value: number;
    zScore: number; // How many standard deviations from average
  }[];
}

export interface InjuryReport {
  playerName: string;
  position: string;
  team: string;
  injuryType: string;
  expectedReturn?: string;
  severity: 'out' | 'questionable' | 'probable' | 'doubtful';
  impact: number; // 1-10 scale, how much it affects game
}

export interface GameAlert {
  id: string;
  type: 'injury' | 'milestone' | 'upset' | 'critical' | 'turnover';
  title: string;
  description: string;
  team?: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  resolved?: boolean;
}

export interface PlayByPlayEvent {
  id: string;
  quarter: number;
  time: string;
  playNumber: number;
  down?: number;
  distance?: number;
  yardLine?: number;
  team: string;
  description: string;
  type: 'pass' | 'rush' | 'penalty' | 'timeout' | 'turnover' | 'score' | 'field_position' | 'defensive_play';
  yards?: number;
  result?: string;
  timestamp?: number;
  isCritical?: boolean; // True Danger moment, turnover, etc.
  
  // EPA (Expected Points Added)
  epa?: number;
  wpChange?: number; // Win probability change
}

export interface GameHeatMap {
  plays: {
    type: 'score' | 'yards' | 'turnover';
    yardLine: number;
    team: string;
    quarter: number;
    weight: number;
  }[];
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number; // percentage
  condition: string;
  impactOnPlay?: string;
}

export interface VegasData {
  spread: number;
  spreadFavorite: string;
  overUnder: number;
  moneyline: {
    home: number;
    away: number;
  };
  implied_probability: {
    home: number;
    away: number;
  };
}

// Calculation Functions

export function calculateMomentum(
  previousScore: { home: number; away: number },
  currentScore: { home: number; away: number },
  quarter: number
): { direction: 'home' | 'away' | 'neutral'; score: number } {
  const scoreDiff = currentScore.home - currentScore.away;
  const prevDiff = previousScore.home - previousScore.away;
  
  // If spread increased for leading team, they have momentum
  const momentumChange = scoreDiff - prevDiff;
  
  if (momentumChange > 10) return { direction: 'home', score: Math.min(momentumChange, 100) };
  if (momentumChange < -10) return { direction: 'away', score: Math.min(Math.abs(momentumChange), 100) };
  
  return { direction: 'neutral', score: 0 };
}

export function calculateWinProbability(
  situation: GameSituation,
  homeScore: number,
  awayScore: number,
  // Historical win probabilities based on game state
): { home: number; away: number } {
  // Simplified model - in production use full logistic regression
  const scoreDiff = homeScore - awayScore;
  const timeRemaining = situation.timeRemaining ? parseInt(situation.timeRemaining) : 0;
  
  // More time + lead = higher win probability
  const baseProb = 0.5 + (scoreDiff * 0.02);
  const timeAdjustment = timeRemaining > 0 ? (600 - timeRemaining) / 600 : 1;
  
  let homeProb = Math.min(0.95, Math.max(0.05, baseProb + (timeAdjustment * 0.1)));
  
  return {
    home: homeProb,
    away: 1 - homeProb
  };
}

export function calculateRedZoneEfficiency(stats: EnhancedGameStats): number {
  if (!stats.redZoneEfficiency) return 0;
  return stats.redZoneEfficiency;
}

export function identifyAnomalousPerformance(
  playerStats: PlayerStats,
  leagueAverages: Record<string, any>
): { stat: string; value: number; zScore: number }[] {
  const anomalies: { stat: string; value: number; zScore: number }[] = [];
  
  // Check each stat against league average
  if (playerStats.passingYards && leagueAverages.passingYardsAvg) {
    const zScore = (playerStats.passingYards - leagueAverages.passingYardsAvg) / 
                   leagueAverages.passingYardsStdDev;
    if (Math.abs(zScore) > 2) {
      anomalies.push({ stat: 'passing_yards', value: playerStats.passingYards, zScore });
    }
  }
  
  return anomalies;
}

export function calculateEPA(
  down: number,
  distance: number,
  yardLine: number,
  play: PlayByPlayEvent
): number {
  // Simplified EPA calculation
  // In production, use pre-calculated EPA table from historical data
  
  const expectedPointsMap: Record<number, number> = {
    99: 7, // Goal line
    90: 6.4,
    80: 5.5,
    70: 4.8,
    60: 4.2,
    50: 3.0,
    40: 1.8,
    30: 0.9,
    20: 0.2,
    10: 0,
  };
  
  // Find closest yard line in map
  let expectedPoints = 3;
  for (const [yardKey, points] of Object.entries(expectedPointsMap)) {
    if (parseInt(yardKey) <= yardLine) {
      expectedPoints = points;
      break;
    }
  }
  
  return (play.yards || 0) * 0.1 - expectedPoints * 0.01;
}

export function generateDriveSummary(drive: GameSituation['currentDrive']): string {
  if (!drive) return '';
  
  const result = drive.result || 'INCOMPLETE';
  const yards = drive.yardsGained;
  const plays = drive.plays;
  
  return `${plays} play${plays !== 1 ? 's' : ''}, ${yards} yard${yards !== 1 ? 's' : ''} - ${result}`;
}

export function calculateStrengthOfSchedule(
  teamWins: number,
  opponentRecord: number[]
): number {
  // Calculate average opponent win percentage
  const avgOpponentWinPct = opponentRecord.reduce((a, b) => a + b, 0) / opponentRecord.length;
  
  // Strength of schedule is opponent win percentage
  return Math.round(avgOpponentWinPct * 100) / 100;
}
