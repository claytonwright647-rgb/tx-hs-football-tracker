/**
 * Standings Calculator
 * Calculates and maintains team standings for all leagues
 * Includes ELO ratings, head-to-head records, and tiebreakers
 */

import { Database } from '@/lib/database';

export interface Standing {
  teamId: string;
  teamName: string;
  leagueId: string;
  divisionId?: string;
  wins: number;
  losses: number;
  ties?: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  streak: string; // "W3", "L2"
  eloRating: number;
  schedule: { wins: number; losses: number }; // Strength of schedule
  headToHead?: { wins: number; losses: number }; // Head-to-head record
  rank: number;
  playoffPosition?: number;
  lastUpdated: Date;
}

export interface ELOConfig {
  kFactor: number; // 32 for standard, 16 for less volatile
  baseRating: number; // Usually 1600
}

export class StandingsCalculator {
  private db: Database;
  private eloConfig: ELOConfig;
  private standings: Map<string, Standing> = new Map();

  constructor(db: Database, eloConfig: ELOConfig = { kFactor: 32, baseRating: 1600 }) {
    this.db = db;
    this.eloConfig = eloConfig;
  }

  /**
   * Calculate standings for a league after a game result
   */
  async calculateStandings(leagueId: string, season: number): Promise<Standing[]> {
    try {
      // Fetch all teams in league
      const teams = await this.db.query('teams', {
        leagueId,
        active: true,
      });

      // Fetch all games for season
      const games = await this.db.query('games', {
        leagueId,
        season,
        status: 'final',
      });

      // Initialize standings for all teams
      const standings: Map<string, Standing> = new Map();

      for (const team of teams) {
        standings.set(team.id, {
          teamId: team.id,
          teamName: team.name,
          leagueId,
          divisionId: team.divisionId,
          wins: 0,
          losses: 0,
          ties: 0,
          winPercentage: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifferential: 0,
          streak: 'W0',
          eloRating: this.eloConfig.baseRating,
          schedule: { wins: 0, losses: 0 },
          rank: 0,
          lastUpdated: new Date(),
        });
      }

      // Process each game
      for (const game of games) {
        const homeStanding = standings.get(game.homeTeamId);
        const awayStanding = standings.get(game.awayTeamId);

        if (!homeStanding || !awayStanding) continue;

        const homeScore = game.homeScore;
        const awayScore = game.awayScore;

        // Update records
        if (homeScore > awayScore) {
          homeStanding.wins++;
          awayStanding.losses++;
        } else if (awayScore > homeScore) {
          awayStanding.wins++;
          homeStanding.losses++;
        } else {
          homeStanding.ties = (homeStanding.ties || 0) + 1;
          awayStanding.ties = (awayStanding.ties || 0) + 1;
        }

        // Update points
        homeStanding.pointsFor += homeScore;
        homeStanding.pointsAgainst += awayScore;
        awayStanding.pointsFor += awayScore;
        awayStanding.pointsAgainst += homeScore;

        // Update ELO
        const eloUpdate = this.calculateELOChange(
          homeStanding.eloRating,
          awayStanding.eloRating,
          homeScore,
          awayScore
        );
        homeStanding.eloRating += eloUpdate.home;
        awayStanding.eloRating += eloUpdate.away;
      }

      // Calculate derived stats
      for (const standing of standings.values()) {
        const gamesPlayed = standing.wins + standing.losses + (standing.ties || 0);
        standing.winPercentage = gamesPlayed > 0 ? standing.wins / gamesPlayed : 0;
        standing.pointDifferential = standing.pointsFor - standing.pointsAgainst;
        standing.streak = this.calculateStreak(leagueId, standing.teamId, games);
      }

      // Rank teams (sort by win%, then point differential, then head-to-head)
      const rankedStandings = this.rankStandings(Array.from(standings.values()), leagueId);

      // Cache in standings map
      for (const standing of rankedStandings) {
        this.standings.set(`${leagueId}-${standing.teamId}`, standing);
      }

      // Persist to database
      await this.db.batchUpdate('standings', rankedStandings);

      return rankedStandings;
    } catch (error) {
      console.error(`Error calculating standings for ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Calculate ELO rating change for both teams
   * Formula: New Rating = Old Rating + K * (Actual Score - Expected Score)
   */
  private calculateELOChange(
    homeElo: number,
    awayElo: number,
    homeScore: number,
    awayScore: number
  ): { home: number; away: number } {
    // Expected win probability
    const homeExpected = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
    const awayExpected = 1 / (1 + Math.pow(10, (homeElo - awayElo) / 400));

    // Actual score (1 = win, 0 = loss, 0.5 = tie)
    let homeActual = 0.5;
    let awayActual = 0.5;

    if (homeScore > awayScore) {
      homeActual = 1;
      awayActual = 0;
    } else if (awayScore > homeScore) {
      homeActual = 0;
      awayActual = 1;
    }

    // Calculate change
    const homeChange = this.eloConfig.kFactor * (homeActual - homeExpected);
    const awayChange = this.eloConfig.kFactor * (awayActual - awayExpected);

    return { home: homeChange, away: awayChange };
  }

  /**
   * Calculate win/loss streak
   */
  private calculateStreak(leagueId: string, teamId: string, allGames: any[]): string {
    // Get team's games, sorted by date descending
    const teamGames = allGames
      .filter(
        (g) =>
          (g.homeTeamId === teamId || g.awayTeamId === teamId) && g.status === 'final'
      )
      .sort((a, b) => b.gameTime.getTime() - a.gameTime.getTime())
      .slice(0, 10); // Last 10 games

    let streak = 0;
    let streakType = 'W';

    for (const game of teamGames) {
      const isHomeTeam = game.homeTeamId === teamId;
      const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
      const oppScore = isHomeTeam ? game.awayScore : game.homeScore;

      const gameWon = teamScore > oppScore;
      const currentType = gameWon ? 'W' : 'L';

      if (streak === 0) {
        streakType = currentType;
        streak = 1;
      } else if (currentType === streakType) {
        streak++;
      } else {
        break;
      }
    }

    return `${streakType}${streak}`;
  }

  /**
   * Rank teams by league rules
   * Primary: Win percentage
   * Secondary: Point differential
   * Tertiary: Head-to-head record (if applicable)
   */
  private rankStandings(standings: Standing[], leagueId: string): Standing[] {
    // Group by division if league uses divisions
    const divisions = [...new Set(standings.map((s) => s.divisionId).filter(Boolean))];

    const rankedStandings: Standing[] = [];

    // Rank within divisions first (if applicable)
    if (divisions.length > 0) {
      for (const divisionId of divisions) {
        const divisionTeams = standings.filter((s) => s.divisionId === divisionId);
        const rankedDivision = divisionTeams.sort((a, b) => {
          if (b.winPercentage !== a.winPercentage) {
            return b.winPercentage - a.winPercentage;
          }
          if (b.pointDifferential !== a.pointDifferential) {
            return b.pointDifferential - a.pointDifferential;
          }
          return b.eloRating - a.eloRating;
        });
        rankedStandings.push(...rankedDivision);
      }
    } else {
      // Rank all teams together
      rankedStandings.push(
        ...standings.sort((a, b) => {
          if (b.winPercentage !== a.winPercentage) {
            return b.winPercentage - a.winPercentage;
          }
          if (b.pointDifferential !== a.pointDifferential) {
            return b.pointDifferential - a.pointDifferential;
          }
          return b.eloRating - a.eloRating;
        })
      );
    }

    // Assign ranks
    rankedStandings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    // Assign playoff positions (top 6 teams make playoffs in most leagues)
    rankedStandings.forEach((standing, index) => {
      if (index < 6) {
        standing.playoffPosition = index + 1;
      }
    });

    return rankedStandings;
  }

  /**
   * Get standings for a team
   */
  async getTeamStanding(teamId: string, leagueId: string): Promise<Standing | null> {
    return this.standings.get(`${leagueId}-${teamId}`) || null;
  }

  /**
   * Get all standings for a league
   */
  async getLeagueStandings(leagueId: string): Promise<Standing[]> {
    return Array.from(this.standings.values())
      .filter((s) => s.leagueId === leagueId)
      .sort((a, b) => a.rank - b.rank);
  }

  /**
   * Get standings by division
   */
  async getDivisionStandings(leagueId: string, divisionId: string): Promise<Standing[]> {
    return Array.from(this.standings.values())
      .filter((s) => s.leagueId === leagueId && s.divisionId === divisionId)
      .sort((a, b) => a.rank - b.rank);
  }

  /**
   * Update ELO config (for different leagues or seasons)
   */
  setELOConfig(config: ELOConfig): void {
    this.eloConfig = config;
  }
}

export default StandingsCalculator;
