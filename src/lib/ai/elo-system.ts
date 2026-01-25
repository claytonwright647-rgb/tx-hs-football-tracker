/**
 * HS Football ELO System
 * Adapted for high school football with fewer games and different dynamics
 */

import { Team } from '../types';

interface HSTeamRating {
  team: Team;
  elo: number;
  wins: number;
  losses: number;
  strength: number; // 0-100 scale
  trend: number; // -10 to +10
  classification: string;
  division?: string;
}

class HSELOSystem {
  private teamRatings: Map<string, number> = new Map();
  private history: Map<string, number[]> = new Map();

  // Base rating for HS teams (higher variance than college)
  private readonly BASE_RATING = 1500;
  // K-factor for HS (higher because fewer games = more volatility per game)
  private readonly K_FACTOR_REGULAR = 48;
  private readonly K_FACTOR_PLAYOFF = 64;

  /**
   * Initialize team rating
   */
  initializeTeam(teamName: string, teamId: string, classification: string): HSTeamRating {
    const rating = this.BASE_RATING;
    this.teamRatings.set(teamId, rating);
    this.history.set(teamId, [rating]);

    return {
      team: { id: teamId, name: teamName, school: '', city: '', mascot: '', district: '', classification } as Team,
      elo: rating,
      wins: 0,
      losses: 0,
      strength: 50,
      trend: 0,
      classification,
    };
  }

  /**
   * Calculate win probability for a matchup
   * HS adjusted: home field +45 points (slightly less than college)
   */
  calculateWinProbability(homeTeamId: string, awayTeamId: string): {
    home: number;
    away: number;
  } {
    const homeRating = this.teamRatings.get(homeTeamId) || this.BASE_RATING;
    const awayRating = this.teamRatings.get(awayTeamId) || this.BASE_RATING;

    // Home field advantage in HS
    const adjustedHome = homeRating + 45;
    const diff = adjustedHome - awayRating;

    // Expected value calculation
    const homeExpected = 1 / (1 + Math.pow(10, -diff / 400));
    const awayExpected = 1 - homeExpected;

    return {
      home: Math.round(homeExpected * 100),
      away: Math.round(awayExpected * 100),
    };
  }

  /**
   * Update ratings after game
   * HS version: Uses higher K-factor due to small sample size
   */
  updateRatings(
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number,
    isPlayoff: boolean = false
  ): { home: number; away: number } {
    const homeRating = this.teamRatings.get(homeTeamId) || this.BASE_RATING;
    const awayRating = this.teamRatings.get(awayTeamId) || this.BASE_RATING;

    // Determine K-factor
    const kFactor = isPlayoff ? this.K_FACTOR_PLAYOFF : this.K_FACTOR_REGULAR;

    // Calculate expected values
    const adjustedHome = homeRating + 45;
    const diff = adjustedHome - awayRating;
    const homeExpected = 1 / (1 + Math.pow(10, -diff / 400));
    const awayExpected = 1 - homeExpected;

    // Determine actual results
    const homeWon = homeScore > awayScore ? 1 : homeScore === awayScore ? 0.5 : 0;
    const awayWon = 1 - homeWon;

    // Calculate score margin modifier (HS games can have higher margins)
    const scoreDiff = Math.abs(homeScore - awayScore);
    const marginMult = Math.min(1 + scoreDiff / 28, 1.5); // Slight bonus for big wins

    // Calculate new ratings
    const newHomeRating = Math.round(homeRating + kFactor * marginMult * (homeWon - homeExpected));
    const newAwayRating = Math.round(awayRating + kFactor * marginMult * (awayWon - awayExpected));

    // Update
    this.teamRatings.set(homeTeamId, newHomeRating);
    this.teamRatings.set(awayTeamId, newAwayRating);

    // Track history
    const homeHistory = this.history.get(homeTeamId) || [];
    const awayHistory = this.history.get(awayTeamId) || [];
    homeHistory.push(newHomeRating);
    awayHistory.push(newAwayRating);
    this.history.set(homeTeamId, homeHistory);
    this.history.set(awayTeamId, awayHistory);

    return {
      home: newHomeRating,
      away: newAwayRating,
    };
  }

  /**
   * Get team strength on 0-100 scale
   */
  getTeamStrength(teamId: string): number {
    const rating = this.teamRatings.get(teamId) || this.BASE_RATING;
    // Normalize to 0-100 scale (1200-1800 maps to 0-100)
    return Math.max(0, Math.min(100, ((rating - 1200) / 600) * 100));
  }

  /**
   * Get trend for a team
   */
  getTrend(teamId: string): number {
    const history = this.history.get(teamId) || [this.BASE_RATING];
    if (history.length < 2) return 0;

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

    const trend = ((recentAvg - olderAvg) / this.BASE_RATING) * 10;
    return Math.round(trend * 10) / 10; // One decimal place
  }

  /**
   * Rank teams
   */
  rankTeams(teamIds: string[]): HSTeamRating[] {
    return teamIds
      .map(id => ({
        id,
        rating: this.teamRatings.get(id) || this.BASE_RATING,
      }))
      .sort((a, b) => b.rating - a.rating)
      .map((item, idx) => ({
        team: { id: item.id, name: `Team ${idx + 1}`, school: '', city: '', mascot: '', district: '', classification: '' } as Team,
        elo: item.rating,
        wins: 0,
        losses: 0,
        strength: this.getTeamStrength(item.id),
        trend: this.getTrend(item.id),
        classification: '',
      }));
  }

  /**
   * Predict playoff winner
   */
  predictPlayoffWinner(teamIds: string[]): string {
    let winnerTeamId = teamIds[0];
    let maxRating = this.teamRatings.get(teamIds[0]) || this.BASE_RATING;

    for (const teamId of teamIds) {
      const rating = this.teamRatings.get(teamId) || this.BASE_RATING;
      if (rating > maxRating) {
        maxRating = rating;
        winnerTeamId = teamId;
      }
    }

    return winnerTeamId;
  }

  /**
   * Get rating for a team
   */
  getTeamRating(teamId: string): number {
    return this.teamRatings.get(teamId) || this.BASE_RATING;
  }

  /**
   * Reset all ratings (for new season)
   */
  resetAllRatings(): void {
    this.teamRatings.clear();
    this.history.clear();
  }
}

export default new HSELOSystem();
