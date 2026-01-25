/**
 * HS Football Game Analyzer
 * Analyzes game situations and provides AI-driven insights
 */

import { Game, LiveGame } from '../types';
import eloSystem from './elo-system';

interface GameAnalysis {
  momentum: number; // -100 to +100, home team perspective
  gameControl: string; // 'home' | 'away' | 'balanced'
  keyMoments: string[];
  predictions: {
    homeWinProbability: number;
    awayWinProbability: number;
  };
  insights: string[];
  keyStats: {
    label: string;
    value: string;
    advantage: string; // 'home' | 'away' | 'balanced'
  }[];
}

interface HistoricalMatchup {
  homeTeamId: string;
  awayTeamId: string;
  homeWins: number;
  awayWins: number;
  ties: number;
}

class HSGameAnalyzer {
  private matchupHistory: Map<string, HistoricalMatchup> = new Map();

  /**
   * Analyze live game
   */
  analyzeGame(game: LiveGame | Game): GameAnalysis {
    const homeTeamId = game.homeTeam.id;
    const awayTeamId = game.awayTeam.id;

    // Get ELO predictions
    const winProbs = eloSystem.calculateWinProbability(homeTeamId, awayTeamId);

    // Calculate momentum based on current score
    const scoreDiff = (game.homeScore || 0) - (game.awayScore || 0);
    const maxScore = Math.max(game.homeScore || 0, game.awayScore || 0, 1);
    let momentum = 0;
    if (maxScore > 0) {
      momentum = (scoreDiff / maxScore) * 100;
      momentum = Math.max(-100, Math.min(100, momentum)); // Clamp to [-100, 100]
    }

    // Determine game control
    let gameControl = 'balanced';
    if (momentum > 15) gameControl = 'home';
    if (momentum < -15) gameControl = 'away';

    // Generate insights
    const insights = this.generateInsights(game, winProbs, momentum);
    const keyMoments = this.extractKeyMoments(game);
    const keyStats = this.generateKeyStats(game);

    return {
      momentum,
      gameControl,
      keyMoments,
      predictions: {
        homeWinProbability: winProbs.home,
        awayWinProbability: winProbs.away,
      },
      insights,
      keyStats,
    };
  }

  /**
   * Generate AI insights about game situation
   */
  private generateInsights(game: LiveGame | Game, winProbs: { home: number; away: number }, momentum: number): string[] {
    const insights: string[] = [];

    // Preseason insights
    if (game.status === 'scheduled') {
      const homeStrength = eloSystem.getTeamStrength(game.homeTeam.id);
      const awayStrength = eloSystem.getTeamStrength(game.awayTeam.id);

      if (Math.abs(homeStrength - awayStrength) > 15) {
        const stronger = homeStrength > awayStrength ? 'home' : 'away';
        insights.push(
          `${stronger === 'home' ? game.homeTeam.name : game.awayTeam.name} favored by strength ratings`
        );
      } else {
        insights.push('This is a closely matched rivalry game');
      }

      insights.push(`${game.homeTeam.name} at ${winProbs.home}% to win at home`);
    }

    // Live game insights
    if (game.status === 'in_progress' || game.status === 'halftime') {
      const quarter = game.quarter || 1;

      if (quarter === 1 || quarter === 2) {
        insights.push('Early game - plenty of time for shifts in momentum');
      } else if (quarter === 3) {
        insights.push('Third quarter is critical - team momentum shifts often determine final result');
      } else if (quarter === 4) {
        insights.push('Fourth quarter execution will decide this game');
      }

      if (momentum > 20) {
        insights.push(`${game.homeTeam.name} has strong momentum`);
      } else if (momentum < -20) {
        insights.push(`${game.awayTeam.name} has the momentum advantage`);
      } else {
        insights.push('Game remains competitive throughout');
      }

      // Win probability adjusted for situation
      const adjustedProb = this.adjustWinProbability(winProbs.home, game.quarter || 1, momentum);
      insights.push(`Current win probability: ${adjustedProb}% for ${game.homeTeam.name}`);
    }

    // Postgame insights
    if (game.status === 'final') {
      const winner = (game.homeScore || 0) > (game.awayScore || 0) ? game.homeTeam.name : game.awayTeam.name;
      const margin = Math.abs((game.homeScore || 0) - (game.awayScore || 0));
      insights.push(`${winner} wins ${game.homeScore}-${game.awayScore}`);

      if (game.isPlayoff) {
        insights.push(`${winner} advances to next round`);
      }
    }

    return insights.slice(0, 3); // Top 3 insights
  }

  /**
   * Extract key moments from live game
   */
  private extractKeyMoments(game: LiveGame | Game): string[] {
    const moments: string[] = [];

    if ('situation' in game && game.situation) {
      if (game.lastScorer) {
        moments.push(`Last score: ${game.lastScorer}`);
      }

      if (game.situation.down && game.situation.distance && game.situation.down <= 2) {
        moments.push('Red zone opportunity developing');
      }
    }

    return moments;
  }

  /**
   * Generate key statistical insights
   */
  private generateKeyStats(
    game: LiveGame | Game
  ): { label: string; value: string; advantage: string }[] {
    const stats: { label: string; value: string; advantage: string }[] = [];

    // Score
    stats.push({
      label: 'Score',
      value: `${game.homeScore} - ${game.awayScore}`,
      advantage: (game.homeScore || 0) > (game.awayScore || 0) ? 'home' : 'away',
    });

    // Venue (HS advantage for home team is significant)
    if (game.venue) {
      stats.push({
        label: 'Venue',
        value: `${game.venue} - ${game.city}`,
        advantage: 'home',
      });
    }

    return stats;
  }

  /**
   * Adjust win probability based on game situation
   */
  private adjustWinProbability(baseProb: number, quarter: number, momentum: number): number {
    let adjusted = baseProb;

    // Quarter adjustments
    const quarterWeights = {
      1: 0.8, // Early - less predictive
      2: 0.9,
      3: 0.95, // Most predictive
      4: 1.1, // Late - more predictive
    };

    const weight = quarterWeights[quarter as keyof typeof quarterWeights] || 1;
    adjusted = adjusted * weight;

    // Momentum adjustment
    const momentumFactor = momentum > 0 ? 1 + Math.min(momentum / 500, 0.1) : 1 - Math.min(Math.abs(momentum) / 500, 0.1);

    adjusted = adjusted * momentumFactor;

    return Math.max(20, Math.min(80, Math.round(adjusted)));
  }

  /**
   * Record historical matchup result
   */
  recordMatchup(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number): void {
    const key = `${homeTeamId}-${awayTeamId}`;
    const current = this.matchupHistory.get(key) || {
      homeTeamId,
      awayTeamId,
      homeWins: 0,
      awayWins: 0,
      ties: 0,
    };

    if (homeScore > awayScore) {
      current.homeWins++;
    } else if (awayScore > homeScore) {
      current.awayWins++;
    } else {
      current.ties++;
    }

    this.matchupHistory.set(key, current);
  }

  /**
   * Get historical matchup data
   */
  getMatchupHistory(homeTeamId: string, awayTeamId: string): HistoricalMatchup | null {
    const key = `${homeTeamId}-${awayTeamId}`;
    return this.matchupHistory.get(key) || null;
  }
}

export default new HSGameAnalyzer();
