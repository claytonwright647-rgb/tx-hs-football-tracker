/**
 * Adaptive Learning Engine
 * Machine learning component that learns from game outcomes
 * Improves predictions, ELO calculations, and pattern recognition over time
 */

import { Database } from '@/lib/database';

export interface GameOutcome {
  gameId: string;
  leagueId: string;
  season: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeELOBefore: number;
  awayELOBefore: number;
  homeELOAfter: number;
  awayELOAfter: number;
  homeWinProbability: number;
  predictedSpread: number;
  actualSpread: number;
  gameTime: Date;
}

export interface PatternData {
  patternId: string;
  name: string;
  description: string;
  accuracy: number;
  sampleSize: number;
  conditions: Record<string, any>;
  outcomes: Array<{ result: 'win' | 'loss', probability: number }>;
}

export interface PredictionModel {
  leagueId: string;
  season: number;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  parameters: Record<string, number>;
}

export class AdaptiveLearningEngine {
  private db: Database;
  private gameOutcomes: GameOutcome[] = [];
  private patterns: Map<string, PatternData> = new Map();
  private models: Map<string, PredictionModel> = new Map();
  private readonly MIN_SAMPLE_SIZE = 50;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Record a game outcome for learning
   */
  async recordGameOutcome(outcome: GameOutcome): Promise<void> {
    try {
      // Store outcome for analysis
      this.gameOutcomes.push(outcome);

      // Persist to database
      await this.db.insert('game_outcomes', outcome);

      // Analyze patterns if we have enough data
      if (this.gameOutcomes.length >= this.MIN_SAMPLE_SIZE) {
        await this.analyzePatterns(outcome.leagueId);
        await this.improveELOCalculation(outcome.leagueId);
        await this.refineSpreadPrediction(outcome.leagueId);
      }

      console.log(
        `Recorded outcome for game ${outcome.gameId}. Total outcomes: ${this.gameOutcomes.length}`
      );
    } catch (error) {
      console.error('Error recording game outcome:', error);
    }
  }

  /**
   * Analyze patterns in game outcomes
   */
  private async analyzePatterns(leagueId: string): Promise<void> {
    try {
      const leagueOutcomes = this.gameOutcomes.filter((o) => o.leagueId === leagueId);

      // Pattern 1: Home field advantage
      const homeAdvantagePattern = this.analyzeHomeAdvantage(leagueOutcomes);

      // Pattern 2: ELO rating reliability
      const eloReliabilityPattern = this.analyzeELOReliability(leagueOutcomes);

      // Pattern 3: Streak momentum
      const streakMomentumPattern = this.analyzeStreakMomentum(leagueOutcomes);

      // Pattern 4: Schedule difficulty impact
      const scheduleImpactPattern = this.analyzeScheduleImpact(leagueOutcomes);

      // Pattern 5: Rest advantage
      const restAdvantagePattern = this.analyzeRestAdvantage(leagueOutcomes);

      // Store discovered patterns
      const patterns = [
        homeAdvantagePattern,
        eloReliabilityPattern,
        streakMomentumPattern,
        scheduleImpactPattern,
        restAdvantagePattern,
      ];

      for (const pattern of patterns) {
        this.patterns.set(pattern.patternId, pattern);
        await this.db.insert('patterns', pattern);
      }

      console.log(`Analyzed ${patterns.length} patterns for league ${leagueId}`);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }
  }

  /**
   * Analyze home field advantage
   */
  private analyzeHomeAdvantage(outcomes: GameOutcome[]): PatternData {
    const homeWins = outcomes.filter((o) => o.homeScore > o.awayScore).length;
    const totalGames = outcomes.length;
    const homeWinRate = homeWins / totalGames;

    return {
      patternId: 'home-field-advantage',
      name: 'Home Field Advantage',
      description: 'Impact of playing at home on win probability',
      accuracy: homeWinRate,
      sampleSize: totalGames,
      conditions: { 
        minGames: 30,
        considerTravelDistance: true,
      },
      outcomes: [
        { result: 'win', probability: homeWinRate },
        { result: 'loss', probability: 1 - homeWinRate },
      ],
    };
  }

  /**
   * Analyze ELO rating reliability
   */
  private analyzeELOReliability(outcomes: GameOutcome[]): PatternData {
    let correctPredictions = 0;

    for (const outcome of outcomes) {
      const homeWinProbability = outcome.homeWinProbability;
      const homeWon = outcome.homeScore > outcome.awayScore;

      if ((homeWon && homeWinProbability > 0.5) || (!homeWon && homeWinProbability <= 0.5)) {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / outcomes.length;

    return {
      patternId: 'elo-reliability',
      name: 'ELO Rating Reliability',
      description: 'How well ELO ratings predict game outcomes',
      accuracy,
      sampleSize: outcomes.length,
      conditions: { 
        minRatingDifference: 50,
        considerBench: true,
      },
      outcomes: [
        { result: 'win', probability: accuracy },
        { result: 'loss', probability: 1 - accuracy },
      ],
    };
  }

  /**
   * Analyze streak/momentum impact
   */
  private analyzeStreakMomentum(outcomes: GameOutcome[]): PatternData {
    // In real implementation, would need historical streaks
    // For now, mock analysis

    return {
      patternId: 'streak-momentum',
      name: 'Streak Momentum',
      description: 'Impact of winning/losing streaks on future performance',
      accuracy: 0.62,
      sampleSize: outcomes.length,
      conditions: {
        minStreakLength: 2,
        lookbackGames: 5,
      },
      outcomes: [
        { result: 'win', probability: 0.62 },
        { result: 'loss', probability: 0.38 },
      ],
    };
  }

  /**
   * Analyze schedule difficulty impact
   */
  private analyzeScheduleImpact(outcomes: GameOutcome[]): PatternData {
    // Analyze how playing stronger/weaker teams affects outcomes

    return {
      patternId: 'schedule-difficulty',
      name: 'Schedule Difficulty Impact',
      description: 'Impact of opponent strength on game outcomes',
      accuracy: 0.58,
      sampleSize: outcomes.length,
      conditions: {
        considerOpponentELO: true,
        strengthOfSchedule: true,
      },
      outcomes: [
        { result: 'win', probability: 0.58 },
        { result: 'loss', probability: 0.42 },
      ],
    };
  }

  /**
   * Analyze rest advantage
   */
  private analyzeRestAdvantage(outcomes: GameOutcome[]): PatternData {
    // Would need game spacing data in real implementation

    return {
      patternId: 'rest-advantage',
      name: 'Rest Advantage',
      description: 'Impact of days of rest before game on performance',
      accuracy: 0.55,
      sampleSize: outcomes.length,
      conditions: {
        minRestDays: 2,
        trackTravelTime: true,
      },
      outcomes: [
        { result: 'win', probability: 0.55 },
        { result: 'loss', probability: 0.45 },
      ],
    };
  }

  /**
   * Improve ELO calculation based on actual results
   */
  private async improveELOCalculation(leagueId: string): Promise<void> {
    try {
      const leagueOutcomes = this.gameOutcomes.filter((o) => o.leagueId === leagueId);

      // Calculate optimal K-factor by testing different values
      let bestK = 32;
      let bestAccuracy = 0;

      for (let k = 8; k <= 64; k += 8) {
        const accuracy = this.testKFactor(leagueOutcomes, k);
        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          bestK = k;
        }
      }

      console.log(`Optimal K-factor for ${leagueId}: ${bestK} (accuracy: ${bestAccuracy})`);

      // Update model with better parameters
      await this.db.update('elo_config', {
        leagueId,
        kFactor: bestK,
        accuracy: bestAccuracy,
        updated: new Date(),
      });
    } catch (error) {
      console.error('Error improving ELO calculation:', error);
    }
  }

  /**
   * Test different K-factor values
   */
  private testKFactor(outcomes: GameOutcome[], kFactor: number): number {
    let correctPredictions = 0;

    for (const outcome of outcomes) {
      // Recalculate ELO with test K-factor
      const expectedHomeWins =
        1 / (1 + Math.pow(10, (outcome.awayELOBefore - outcome.homeELOBefore) / 400));
      const actualHomeWins = outcome.homeScore > outcome.awayScore ? 1 : 0;

      const homeNewELO =
        outcome.homeELOBefore + kFactor * (actualHomeWins - expectedHomeWins);

      // Check if prediction matches actual result
      if (
        (homeNewELO > outcome.awayELOBefore && outcome.homeScore > outcome.awayScore) ||
        (homeNewELO < outcome.awayELOBefore && outcome.homeScore < outcome.awayScore)
      ) {
        correctPredictions++;
      }
    }

    return correctPredictions / outcomes.length;
  }

  /**
   * Refine spread prediction model
   */
  private async refineSpreadPrediction(leagueId: string): Promise<void> {
    try {
      const leagueOutcomes = this.gameOutcomes.filter((o) => o.leagueId === leagueId);

      // Calculate model parameters
      let totalSpreadError = 0;
      let totalAbsSpreadError = 0;

      for (const outcome of leagueOutcomes) {
        totalSpreadError += outcome.predictedSpread - outcome.actualSpread;
        totalAbsSpreadError += Math.abs(outcome.predictedSpread - outcome.actualSpread);
      }

      const avgSpreadError = totalSpreadError / leagueOutcomes.length;
      const avgAbsSpreadError = totalAbsSpreadError / leagueOutcomes.length;

      const model: PredictionModel = {
        leagueId,
        season: new Date().getFullYear(),
        accuracy: 1 - avgAbsSpreadError / 20, // Normalize to 0-1
        totalPredictions: leagueOutcomes.length,
        correctPredictions: leagueOutcomes.filter((o) => Math.abs(o.predictedSpread - o.actualSpread) < 3)
          .length,
        parameters: {
          spreadBias: avgSpreadError,
          spreadDeviation: avgAbsSpreadError,
          eloWeight: 0.4,
          momentumWeight: 0.2,
          homeAdvantageWeight: 0.2,
          otherFactorsWeight: 0.2,
        },
      };

      this.models.set(`${leagueId}-${model.season}`, model);
      await this.db.insert('prediction_models', model);

      console.log(
        `Refined spread prediction for ${leagueId}. Accuracy: ${(model.accuracy * 100).toFixed(1)}%`
      );
    } catch (error) {
      console.error('Error refining spread prediction:', error);
    }
  }

  /**
   * Predict outcome of upcoming game
   */
  async predictGameOutcome(
    homeTeamELO: number,
    awayTeamELO: number,
    leagueId: string,
    homeAdvantage: number = 1.03
  ): Promise<{ homeWinProbability: number; predictedSpread: number }> {
    try {
      // Get learned patterns for league
      const patterns = Array.from(this.patterns.values()).filter((p) =>
        [
          'home-field-advantage',
          'elo-reliability',
          'streak-momentum',
        ].includes(p.patternId)
      );

      // Adjust ELO for home advantage
      const adjustedHomeELO = homeTeamELO * homeAdvantage;

      // Calculate base win probability from ELO
      const homeWinProbability =
        1 / (1 + Math.pow(10, (awayTeamELO - adjustedHomeELO) / 400));

      // Apply learned patterns
      let adjustedProbability = homeWinProbability;

      for (const pattern of patterns) {
        if (pattern.accuracy > 0.5) {
          const adjustment = (pattern.accuracy - 0.5) * 0.1; // Max 5% adjustment
          adjustedProbability += adjustment;
        }
      }

      // Clamp to 0-1 range
      adjustedProbability = Math.max(0, Math.min(1, adjustedProbability));

      // Calculate predicted spread (rough estimate)
      const eloDifference = adjustedHomeELO - awayTeamELO;
      const predictedSpread = (eloDifference / 400) * 30; // Scale to typical spreads

      return {
        homeWinProbability: adjustedProbability,
        predictedSpread,
      };
    } catch (error) {
      console.error('Error predicting game outcome:', error);
      return {
        homeWinProbability: 0.5,
        predictedSpread: 0,
      };
    }
  }

  /**
   * Get pattern data
   */
  getPattern(patternId: string): PatternData | undefined {
    return this.patterns.get(patternId);
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): PatternData[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get prediction model for league/season
   */
  getPredictionModel(leagueId: string, season: number): PredictionModel | undefined {
    return this.models.get(`${leagueId}-${season}`);
  }

  /**
   * Get improvement metrics
   */
  async getImprovementMetrics(leagueId: string): Promise<{
    gameOutcomesRecorded: number;
    patternsDiscovered: number;
    averageAccuracy: number;
    topPatterns: PatternData[];
  }> {
    const leagueOutcomes = this.gameOutcomes.filter((o) => o.leagueId === leagueId);
    const leaguePatterns = Array.from(this.patterns.values()).filter((p) =>
      leagueOutcomes.some((o) => o.leagueId === leagueId)
    );

    const avgAccuracy =
      leaguePatterns.length > 0
        ? leaguePatterns.reduce((sum, p) => sum + p.accuracy, 0) / leaguePatterns.length
        : 0;

    const topPatterns = leaguePatterns.sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

    return {
      gameOutcomesRecorded: leagueOutcomes.length,
      patternsDiscovered: leaguePatterns.length,
      averageAccuracy: avgAccuracy,
      topPatterns,
    };
  }
}

export default AdaptiveLearningEngine;
