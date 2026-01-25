/**
 * HS Football Playoff Predictor
 * Predicts playoff outcomes based on team strength and historical performance
 */

import { Team, PlayoffBracket } from '../types';
import eloSystem from './elo-system';

interface PlayoffPrediction {
  tournament: string;
  predictedWinner: Team;
  predictions: {
    teamId: string;
    teamName: string;
    winProbability: number;
    strength: number;
    path: string; // "Champion" | "Finals" | "Semifinals" | "Quarterfinals" | etc
  }[];
  keyMatchups: {
    team1: string;
    team2: string;
    winner: string;
    confidence: number; // 0-100
  }[];
}

class HSPlayoffPredictor {
  /**
   * Predict playoff bracket outcomes
   */
  predictBracket(bracket: PlayoffBracket): PlayoffPrediction {
    if (!bracket.rounds || bracket.rounds.length === 0) {
      return {
        tournament: bracket.classification || 'Unknown Tournament',
        predictedWinner: {
          id: '',
          name: 'Unknown',
          school: '',
          city: '',
          mascot: '',
          district: '',
          classification: '',
        },
        predictions: [],
        keyMatchups: [],
      };
    }

    const predictions: PlayoffPrediction['predictions'] = [];
    const keyMatchups: PlayoffPrediction['keyMatchups'] = [];

    // Process all teams in bracket
    const allTeams = this.extractTeamsFromBracket(bracket);

    // Calculate strength for each team
    for (const team of allTeams) {
      const strength = eloSystem.getTeamStrength(team.id);
      predictions.push({
        teamId: team.id,
        teamName: team.name,
        winProbability: this.calculatePlayoffWinProbability(team.id, allTeams),
        strength,
        path: this.predictTeamPath(team.id, bracket),
      });
    }

    // Sort by win probability
    predictions.sort((a, b) => b.winProbability - a.winProbability);

    // Find key matchups
    if (bracket.rounds && bracket.rounds.length > 0) {
      const finalRound = bracket.rounds[bracket.rounds.length - 1];
      if (finalRound && finalRound.games && finalRound.games.length > 0) {
        const finalGame = finalRound.games[0];
        if (finalGame) {
          const team1Id = finalGame.homeTeam.id;
          const team2Id = finalGame.awayTeam.id;

          if (team1Id && team2Id) {
            const winProb = eloSystem.calculateWinProbability(team1Id, team2Id);
            const team1 = allTeams.find(t => t.id === team1Id);
            const team2 = allTeams.find(t => t.id === team2Id);

            if (team1 && team2) {
              keyMatchups.push({
                team1: team1.name,
                team2: team2.name,
                winner: winProb.home > 50 ? team1.name : team2.name,
                confidence: Math.max(winProb.home, winProb.away),
              });
            }
          }
        }
      }
    }

    return {
      tournament: bracket.classification || 'Unknown Tournament',
      predictedWinner: predictions.length > 0 ? { ...allTeams.find(t => t.id === (predictions[0]?.teamId || '')) } || allTeams[0] : allTeams[0],
      predictions,
      keyMatchups,
    };
  }

  /**
   * Extract all teams from bracket
   */
  private extractTeamsFromBracket(bracket: PlayoffBracket): Team[] {
    const teams: Team[] = [];
    const teamIds = new Set<string>();

    if (bracket.rounds) {
      for (const round of bracket.rounds) {
        if (round.games) {
          for (const game of round.games) {
            const team1 = game.homeTeam;
            const team2 = game.awayTeam;
            const team1Id = team1.id;
            const team2Id = team2.id;

            if (team1Id && !teamIds.has(team1Id)) {
              teamIds.add(team1Id);
              teams.push(team1);
            }

            if (team2Id && !teamIds.has(team2Id)) {
              teamIds.add(team2Id);
              teams.push(team2);
            }
          }
        }
      }
    }

    return teams;
  }

  /**
   * Calculate probability of winning tournament
   */
  private calculatePlayoffWinProbability(teamId: string, allTeams: Team[]): number {
    const teamStrength = eloSystem.getTeamStrength(teamId);
    const avgStrength = allTeams.reduce((sum, t) => sum + eloSystem.getTeamStrength(t.id), 0) / allTeams.length;

    // Strength advantage
    const strengthFactor = (teamStrength - avgStrength) / 10;

    // Number of rounds adjustment (more rounds = lower probability)
    // Typical HS bracket: 8 teams = 3 rounds, 16 teams = 4 rounds
    const numRounds = Math.ceil(Math.log2(allTeams.length));
    const roundsFactor = 0.85 ** (numRounds - 1);

    // Base probability scaled by strength
    const baseProb = 1 / allTeams.length;
    const adjusted = baseProb * Math.pow(1.15, strengthFactor) * roundsFactor;

    // Normalize to 0-100 scale across all teams
    return Math.min(100, Math.max(5, adjusted * 100));
  }

  /**
   * Predict how far a team will go
   */
  private predictTeamPath(teamId: string, bracket: PlayoffBracket): string {
    const strength = eloSystem.getTeamStrength(teamId);

    // Very strong teams (80+): Champion
    if (strength >= 80) return 'Champion';
    // Strong teams (70-80): Finals
    if (strength >= 70) return 'Finals';
    // Good teams (60-70): Semifinals
    if (strength >= 60) return 'Semifinals';
    // Average teams (50-60): Quarterfinals
    if (strength >= 50) return 'Quarterfinals';
    // Weaker teams: Early exit
    return 'Early Exit';
  }

  /**
   * Predict tournament by classification
   */
  predictByClassification(
    teams: Team[],
    bracket: PlayoffBracket
  ): Map<string, PlayoffPrediction> {
    const byClassification = new Map<string, Team[]>();

    // Group teams by classification
    for (const team of teams) {
      if (!byClassification.has(team.classification)) {
        byClassification.set(team.classification, []);
      }
      byClassification.get(team.classification)!.push(team);
    }

    // Predict for each classification
    const results = new Map<string, PlayoffPrediction>();

    for (const [classification, classTeams] of byClassification) {
      const classificationBracket: PlayoffBracket = {
        ...bracket,
        classification: `${classification} - ${bracket.classification || 'Playoffs'}`,
      };

      const prediction = this.predictBracket(classificationBracket);
      results.set(classification, prediction);
    }

    return results;
  }

  /**
   * Simulate bracket outcome
   */
  simulateBracket(bracket: PlayoffBracket, simulations: number = 1000): Map<string, number> {
    const outcomes = new Map<string, number>();
    const teams = this.extractTeamsFromBracket(bracket);

    for (const team of teams) {
      outcomes.set(team.id, 0);
    }

    for (let i = 0; i < simulations; i++) {
      const winner = this.simulateOneBracket(bracket);
      outcomes.set(winner, (outcomes.get(winner) || 0) + 1);
    }

    // Convert to percentages
    for (const [teamId, count] of outcomes) {
      outcomes.set(teamId, Math.round((count / simulations) * 100));
    }

    return outcomes;
  }

  /**
   * Simulate one bracket outcome
   */
  private simulateOneBracket(bracket: PlayoffBracket): string {
    if (!bracket.rounds || bracket.rounds.length === 0) return '';

    let remainingTeams = this.extractTeamsFromBracket(bracket);

    // Simulate each round
    for (const round of bracket.rounds) {
      if (!round.games || round.games.length === 0) continue;

      const winners: Team[] = [];

      for (const game of round.games) {
        const team1Id = game.homeTeam.id;
        const team2Id = game.awayTeam.id;

        if (!team1Id || !team2Id) continue;

        const winProb = eloSystem.calculateWinProbability(team1Id, team2Id);
        const winner = Math.random() * 100 < winProb.home ? team1Id : team2Id;

        const winningTeam = remainingTeams.find(t => t.id === winner);
        if (winningTeam) winners.push(winningTeam);
      }

      remainingTeams = winners;
    }

    return remainingTeams.length > 0 ? remainingTeams[0].id : '';
  }
}

export default new HSPlayoffPredictor();
