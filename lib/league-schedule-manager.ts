/**
 * League Schedule Manager
 * Handles all league schedules, seasons, and timing logic
 * Supports multiple sports and leagues with adaptive learning
 */

import { Database } from '@/lib/database';

export interface League {
  id: string;
  name: string;
  sport: string; // NFL, MLB, NBA, NHL, CFB, HS Football, etc
  season: number;
  seasonStartDate: Date;
  seasonEndDate: Date;
  offseasonStart: Date;
  offseasonEnd: Date;
  preseasonsStart: Date;
  preseasonsEnd: Date;
  regularSeasonStart: Date;
  regularSeasonEnd: Date;
  playoffsStart: Date;
  playoffsEnd: Date;
  championshipDate: Date;
  numberOfTeams: number;
  gamesPerTeamRegular: number;
  divisions: Division[];
}

export interface Division {
  id: string;
  leagueId: string;
  name: string;
  teams: string[]; // Team IDs
  conference?: string;
}

export interface GameSchedule {
  id: string;
  leagueId: string;
  season: number;
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledTime: Date;
  venue: string;
  gameType: 'regular' | 'playoff' | 'preseason' | 'playoff_play_in' | 'championship';
  weekNumber?: number;
  roundNumber?: number;
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  notes?: string;
}

export interface SeasonPhase {
  phase: 'offseason' | 'preseason' | 'regular_season' | 'playoffs' | 'championship';
  startDate: Date;
  endDate: Date;
  description: string;
  isActive: boolean;
}

export interface TeamStandings {
  teamId: string;
  teamName: string;
  division: string;
  wins: number;
  losses: number;
  ties: number;
  overtimeLosses?: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  winPercentage: number;
  strength: number; // ELO rating
  ranking: number;
  lastUpdated: Date;
}

export class LeagueScheduleManager {
  private db: Database;
  private leagues: Map<string, League> = new Map();
  private schedules: Map<string, GameSchedule[]> = new Map();
  private standings: Map<string, TeamStandings[]> = new Map();

  constructor(db: Database) {
    this.db = db;
    this.initializeLeagues();
  }

  /**
   * Initialize all known leagues and their schedules
   */
  private initializeLeagues(): void {
    // NFL
    this.registerLeague({
      id: 'nfl',
      name: 'National Football League',
      sport: 'NFL',
      season: 2025,
      seasonStartDate: new Date('2025-09-04'),
      seasonEndDate: new Date('2026-02-09'),
      offseasonStart: new Date('2026-02-09'),
      offseasonEnd: new Date('2026-04-23'),
      preseasonsStart: new Date('2025-08-01'),
      preseasonsEnd: new Date('2025-09-03'),
      regularSeasonStart: new Date('2025-09-04'),
      regularSeasonEnd: new Date('2026-01-05'),
      playoffsStart: new Date('2026-01-10'),
      playoffsEnd: new Date('2026-02-08'),
      championshipDate: new Date('2026-02-09'),
      numberOfTeams: 32,
      gamesPerTeamRegular: 17,
      divisions: this.getNFLDivisions(),
    });

    // NBA
    this.registerLeague({
      id: 'nba',
      name: 'National Basketball Association',
      sport: 'NBA',
      season: 2025,
      seasonStartDate: new Date('2025-10-24'),
      seasonEndDate: new Date('2026-06-30'),
      offseasonStart: new Date('2026-07-01'),
      offseasonEnd: new Date('2025-10-23'),
      preseasonsStart: new Date('2025-10-01'),
      preseasonsEnd: new Date('2025-10-23'),
      regularSeasonStart: new Date('2025-10-24'),
      regularSeasonEnd: new Date('2026-04-12'),
      playoffsStart: new Date('2026-04-19'),
      playoffsEnd: new Date('2026-06-30'),
      championshipDate: new Date('2026-06-30'),
      numberOfTeams: 30,
      gamesPerTeamRegular: 82,
      divisions: this.getNBADivisions(),
    });

    // MLB
    this.registerLeague({
      id: 'mlb',
      name: 'Major League Baseball',
      sport: 'MLB',
      season: 2025,
      seasonStartDate: new Date('2025-03-27'),
      seasonEndDate: new Date('2025-11-05'),
      offseasonStart: new Date('2025-11-06'),
      offseasonEnd: new Date('2025-03-26'),
      preseasonsStart: new Date('2025-02-27'),
      preseasonsEnd: new Date('2025-03-26'),
      regularSeasonStart: new Date('2025-03-27'),
      regularSeasonEnd: new Date('2025-10-05'),
      playoffsStart: new Date('2025-10-07'),
      playoffsEnd: new Date('2025-11-05'),
      championshipDate: new Date('2025-11-05'),
      numberOfTeams: 30,
      gamesPerTeamRegular: 162,
      divisions: this.getMLBDivisions(),
    });

    // NCAA Football
    this.registerLeague({
      id: 'cfb',
      name: 'College Football',
      sport: 'CFB',
      season: 2025,
      seasonStartDate: new Date('2025-08-28'),
      seasonEndDate: new Date('2026-01-12'),
      offseasonStart: new Date('2026-01-13'),
      offseasonEnd: new Date('2025-08-27'),
      preseasonsStart: new Date('2025-08-28'),
      preseasonsEnd: new Date('2025-09-02'),
      regularSeasonStart: new Date('2025-09-03'),
      regularSeasonEnd: new Date('2025-12-07'),
      playoffsStart: new Date('2025-12-20'),
      playoffsEnd: new Date('2026-01-12'),
      championshipDate: new Date('2026-01-12'),
      numberOfTeams: 134,
      gamesPerTeamRegular: 12,
      divisions: [], // FBS conferences
    });

    // High School Football (Texas)
    this.registerLeague({
      id: 'tx-hs-football',
      name: 'Texas High School Football',
      sport: 'HS Football',
      season: 2025,
      seasonStartDate: new Date('2025-08-28'),
      seasonEndDate: new Date('2025-12-20'),
      offseasonStart: new Date('2025-12-21'),
      offseasonEnd: new Date('2025-08-27'),
      preseasonsStart: new Date('2025-08-07'),
      preseasonsEnd: new Date('2025-08-27'),
      regularSeasonStart: new Date('2025-08-28'),
      regularSeasonEnd: new Date('2025-11-08'),
      playoffsStart: new Date('2025-11-15'),
      playoffsEnd: new Date('2025-12-20'),
      championshipDate: new Date('2025-12-20'),
      numberOfTeams: 1500,
      gamesPerTeamRegular: 10,
      divisions: this.getTexasHSDivisions(),
    });
  }

  /**
   * Register a new league
   */
  registerLeague(league: League): void {
    this.leagues.set(league.id, league);
    this.schedules.set(league.id, []);
    this.standings.set(league.id, []);
  }

  /**
   * Get current season phase for a league
   */
  getCurrentPhase(leagueId: string): SeasonPhase | null {
    const league = this.leagues.get(leagueId);
    if (!league) return null;

    const now = new Date();

    if (now >= league.offseasonStart && now <= league.offseasonEnd) {
      return {
        phase: 'offseason',
        startDate: league.offseasonStart,
        endDate: league.offseasonEnd,
        description: 'Offseason',
        isActive: true,
      };
    }

    if (now >= league.preseasonsStart && now <= league.preseasonsEnd) {
      return {
        phase: 'preseason',
        startDate: league.preseasonsStart,
        endDate: league.preseasonsEnd,
        description: 'Preseason',
        isActive: true,
      };
    }

    if (now >= league.regularSeasonStart && now <= league.regularSeasonEnd) {
      return {
        phase: 'regular_season',
        startDate: league.regularSeasonStart,
        endDate: league.regularSeasonEnd,
        description: 'Regular Season',
        isActive: true,
      };
    }

    if (now >= league.playoffsStart && now <= league.playoffsEnd) {
      return {
        phase: 'playoffs',
        startDate: league.playoffsStart,
        endDate: league.playoffsEnd,
        description: 'Playoffs',
        isActive: true,
      };
    }

    if (
      now.getFullYear() === league.championshipDate.getFullYear() &&
      now.getMonth() === league.championshipDate.getMonth() &&
      now.getDate() === league.championshipDate.getDate()
    ) {
      return {
        phase: 'championship',
        startDate: league.championshipDate,
        endDate: league.championshipDate,
        description: 'Championship',
        isActive: true,
      };
    }

    return null;
  }

  /**
   * Load schedule for a league from database or API
   */
  async loadSchedule(leagueId: string, season: number): Promise<GameSchedule[]> {
    try {
      // Try to load from database first
      const cachedSchedule = await this.db.query(
        `SELECT * FROM schedules WHERE leagueId = ? AND season = ?`,
        [leagueId, season]
      );

      if (cachedSchedule.length > 0) {
        return cachedSchedule as GameSchedule[];
      }

      // If not in database, fetch from external source based on league
      let schedule: GameSchedule[] = [];
      switch (leagueId) {
        case 'nfl':
          schedule = await this.fetchNFLSchedule(season);
          break;
        case 'nba':
          schedule = await this.fetchNBASchedule(season);
          break;
        case 'mlb':
          schedule = await this.fetchMLBSchedule(season);
          break;
        case 'cfb':
          schedule = await this.fetchCFBSchedule(season);
          break;
        case 'tx-hs-football':
          schedule = await this.fetchTexasHSSchedule(season);
          break;
      }

      // Cache in database
      for (const game of schedule) {
        await this.db.insert('schedules', game);
      }

      this.schedules.set(leagueId, schedule);
      return schedule;
    } catch (error) {
      console.error(`Error loading schedule for ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Update standings after a game
   */
  async updateStandings(leagueId: string, gameResult: GameSchedule): Promise<void> {
    try {
      const standings = this.standings.get(leagueId) || [];

      // Update home team
      const homeTeam = standings.find((s) => s.teamId === gameResult.homeTeamId);
      if (homeTeam && gameResult.homeScore !== undefined && gameResult.awayScore !== undefined) {
        homeTeam.pointsFor += gameResult.homeScore;
        homeTeam.pointsAgainst += gameResult.awayScore;
        homeTeam.pointDifferential = homeTeam.pointsFor - homeTeam.pointsAgainst;

        if (gameResult.homeScore > gameResult.awayScore) {
          homeTeam.wins++;
        } else if (gameResult.homeScore < gameResult.awayScore) {
          homeTeam.losses++;
        } else {
          homeTeam.ties++;
        }

        homeTeam.winPercentage =
          (homeTeam.wins + homeTeam.ties * 0.5) /
          (homeTeam.wins + homeTeam.losses + homeTeam.ties);
        homeTeam.lastUpdated = new Date();
      }

      // Update away team
      const awayTeam = standings.find((s) => s.teamId === gameResult.awayTeamId);
      if (awayTeam && gameResult.homeScore !== undefined && gameResult.awayScore !== undefined) {
        awayTeam.pointsFor += gameResult.awayScore;
        awayTeam.pointsAgainst += gameResult.homeScore;
        awayTeam.pointDifferential = awayTeam.pointsFor - awayTeam.pointsAgainst;

        if (gameResult.awayScore > gameResult.homeScore) {
          awayTeam.wins++;
        } else if (gameResult.awayScore < gameResult.homeScore) {
          awayTeam.losses++;
        } else {
          awayTeam.ties++;
        }

        awayTeam.winPercentage =
          (awayTeam.wins + awayTeam.ties * 0.5) /
          (awayTeam.wins + awayTeam.losses + awayTeam.ties);
        awayTeam.lastUpdated = new Date();
      }

      // Recalculate rankings
      this.recalculateRankings(leagueId);

      // Save to database
      await this.db.update('standings', standings);
    } catch (error) {
      console.error(`Error updating standings for ${leagueId}:`, error);
    }
  }

  /**
   * Recalculate team rankings
   */
  private recalculateRankings(leagueId: string): void {
    const standings = this.standings.get(leagueId) || [];
    standings.sort((a, b) => {
      if (a.winPercentage !== b.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      return b.pointDifferential - a.pointDifferential;
    });

    standings.forEach((team, index) => {
      team.ranking = index + 1;
    });
  }

  /**
   * Get all upcoming games across all leagues
   */
  async getUpcomingGames(hoursAhead: number = 24): Promise<GameSchedule[]> {
    const upcomingGames: GameSchedule[] = [];
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    for (const leagueId of this.leagues.keys()) {
      const league = this.leagues.get(leagueId)!;
      const schedule = await this.loadSchedule(leagueId, league.season);

      const upcoming = schedule.filter(
        (game) => game.scheduledTime >= now && game.scheduledTime <= futureTime && game.status === 'scheduled'
      );

      upcomingGames.push(...upcoming);
    }

    return upcomingGames.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Get active games across all leagues
   */
  async getActiveGames(): Promise<GameSchedule[]> {
    const activeGames: GameSchedule[] = [];

    for (const leagueId of this.leagues.keys()) {
      const league = this.leagues.get(leagueId)!;
      const schedule = await this.loadSchedule(leagueId, league.season);
      const active = schedule.filter((game) => game.status === 'live');
      activeGames.push(...active);
    }

    return activeGames;
  }

  /**
   * External API Fetchers (implement actual API calls)
   */
  private async fetchNFLSchedule(season: number): Promise<GameSchedule[]> {
    // Implementation: Fetch from ESPN API, NFL API, or TheSportsDB
    return [];
  }

  private async fetchNBASchedule(season: number): Promise<GameSchedule[]> {
    return [];
  }

  private async fetchMLBSchedule(season: number): Promise<GameSchedule[]> {
    return [];
  }

  private async fetchCFBSchedule(season: number): Promise<GameSchedule[]> {
    return [];
  }

  private async fetchTexasHSSchedule(season: number): Promise<GameSchedule[]> {
    return [];
  }

  /**
   * Division definitions
   */
  private getNFLDivisions(): Division[] {
    return [
      { id: 'afc-east', leagueId: 'nfl', name: 'AFC East', conference: 'AFC', teams: ['ne', 'ny-j', 'buf', 'mia'] },
      { id: 'afc-north', leagueId: 'nfl', name: 'AFC North', conference: 'AFC', teams: ['pit', 'cle', 'bal', 'cin'] },
      { id: 'afc-south', leagueId: 'nfl', name: 'AFC South', conference: 'AFC', teams: ['ind', 'hou', 'jax', 'ten'] },
      { id: 'afc-west', leagueId: 'nfl', name: 'AFC West', conference: 'AFC', teams: ['den', 'kc', 'lar', 'lv'] },
      { id: 'nfc-east', leagueId: 'nfl', name: 'NFC East', conference: 'NFC', teams: ['wsh', 'dal', 'phi', 'nyg'] },
      { id: 'nfc-north', leagueId: 'nfl', name: 'NFC North', conference: 'NFC', teams: ['chi', 'gb', 'det', 'min'] },
      { id: 'nfc-south', leagueId: 'nfl', name: 'NFC South', conference: 'NFC', teams: ['no', 'mia', 'caro', 'atl'] },
      { id: 'nfc-west', leagueId: 'nfl', name: 'NFC West', conference: 'NFC', teams: ['sea', 'sf', 'la', 'ari'] },
    ];
  }

  private getNBADivisions(): Division[] {
    return [];
  }

  private getMLBDivisions(): Division[] {
    return [];
  }

  private getTexasHSDivisions(): Division[] {
    return [
      { id: 'tx-6a-1', leagueId: 'tx-hs-football', name: 'Class 6A Region 1', teams: [] },
      { id: 'tx-6a-2', leagueId: 'tx-hs-football', name: 'Class 6A Region 2', teams: [] },
      { id: 'tx-6a-3', leagueId: 'tx-hs-football', name: 'Class 6A Region 3', teams: [] },
      { id: 'tx-6a-4', leagueId: 'tx-hs-football', name: 'Class 6A Region 4', teams: [] },
    ];
  }
}

export default LeagueScheduleManager;
