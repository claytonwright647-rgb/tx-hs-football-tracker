/**
 * ELO System Tests
 */

import eloSystem from '../elo-system';

describe('ELO System', () => {
  beforeEach(() => {
    // Reset for each test
    eloSystem.resetAllRatings();
  });

  describe('Team Initialization', () => {
    test('should initialize team with base rating', () => {
      const team = eloSystem.initializeTeam('Warriors', 'team-1', '6A');
      expect(team.elo).toBe(1500);
      expect(team.strength).toBe(50);
      expect(team.wins).toBe(0);
      expect(team.losses).toBe(0);
    });

    test('should track team history', () => {
      eloSystem.initializeTeam('Warriors', 'team-1', '6A');
      const rating = eloSystem.getTeamRating('team-1');
      expect(rating).toBe(1500);
    });
  });

  describe('Win Probability', () => {
    test('should give home team advantage', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const odds = eloSystem.calculateWinProbability('team-a', 'team-b');
      expect(odds.home).toBeGreaterThan(50);
      expect(odds.away).toBeLessThan(50);
    });

    test('should favor stronger team', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      // Boost Team A
      eloSystem.updateRatings('team-a', 'team-b', 28, 14, false);
      eloSystem.updateRatings('team-a', 'team-b', 35, 20, false);

      const odds = eloSystem.calculateWinProbability('team-a', 'team-b');
      expect(odds.home).toBeGreaterThan(65);
    });
  });

  describe('Rating Updates', () => {
    test('should increase winner rating and decrease loser', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const initial = eloSystem.getTeamRating('team-a');
      eloSystem.updateRatings('team-a', 'team-b', 28, 21, false);
      const after = eloSystem.getTeamRating('team-a');

      expect(after).toBeGreaterThan(initial);
    });

    test('should apply higher K-factor in playoffs', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const regularSeasonUpdate = eloSystem.updateRatings('team-a', 'team-b', 28, 21, false);
      eloSystem.resetAllRatings();

      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const playoffUpdate = eloSystem.updateRatings('team-a', 'team-b', 28, 21, true);

      expect(Math.abs(playoffUpdate.home)).toBeGreaterThan(Math.abs(regularSeasonUpdate.home));
    });

    test('should account for score margin', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const closeGame = eloSystem.updateRatings('team-a', 'team-b', 21, 20, false);
      eloSystem.resetAllRatings();

      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      const bigWin = eloSystem.updateRatings('team-a', 'team-b', 42, 7, false);

      expect(Math.abs(bigWin.home)).toBeGreaterThan(Math.abs(closeGame.home));
    });
  });

  describe('Team Strength', () => {
    test('should scale to 0-100 range', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      const strength = eloSystem.getTeamStrength('team-a');
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(100);
    });

    test('should reflect team quality', () => {
      eloSystem.initializeTeam('Strong Team', 'team-strong', '6A');
      eloSystem.initializeTeam('Weak Team', 'team-weak', '6A');

      // Boost strong team
      for (let i = 0; i < 3; i++) {
        eloSystem.updateRatings('team-strong', 'team-weak', 35, 14, false);
      }

      const strongStrength = eloSystem.getTeamStrength('team-strong');
      const weakStrength = eloSystem.getTeamStrength('team-weak');

      expect(strongStrength).toBeGreaterThan(weakStrength);
    });
  });

  describe('Trend Analysis', () => {
    test('should detect improving trend', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      // Win several games
      for (let i = 0; i < 3; i++) {
        eloSystem.updateRatings('team-a', 'team-b', 28, 21, false);
      }

      const trend = eloSystem.getTrend('team-a');
      expect(trend).toBeGreaterThan(0);
    });

    test('should detect declining trend', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');

      // Lose several games
      for (let i = 0; i < 3; i++) {
        eloSystem.updateRatings('team-a', 'team-b', 14, 28, false);
      }

      const trend = eloSystem.getTrend('team-a');
      expect(trend).toBeLessThan(0);
    });
  });

  describe('Rankings', () => {
    test('should rank teams by rating', () => {
      eloSystem.initializeTeam('Team A', 'team-a', '6A');
      eloSystem.initializeTeam('Team B', 'team-b', '6A');
      eloSystem.initializeTeam('Team C', 'team-c', '6A');

      // Boost Team B
      eloSystem.updateRatings('team-b', 'team-a', 28, 21, false);

      const rankings = eloSystem.rankTeams(['team-a', 'team-b', 'team-c']);
      expect(rankings[0].team.id).toBe('team-b');
    });
  });
});
