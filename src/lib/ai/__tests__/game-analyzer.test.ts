/**
 * Game Analyzer Tests
 */

import gameAnalyzer from '../game-analyzer';
import type { Game, LiveGame } from '../../types';

describe('Game Analyzer', () => {
  const mockTeam1 = {
    id: 'team-1',
    name: 'Warriors',
    school: 'Lincoln High',
    city: 'Austin',
    mascot: 'Warriors',
    district: '25-6A',
    classification: '6A',
  };

  const mockTeam2 = {
    id: 'team-2',
    name: 'Eagles',
    school: 'Jefferson High',
    city: 'Austin',
    mascot: 'Eagles',
    district: '25-6A',
    classification: '6A',
  };

  describe('Game Analysis', () => {
    test('should analyze scheduled game', () => {
      const game: Game = {
        id: 'game-1',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        status: 'scheduled',
        classification: '6A',
        isPlayoff: false,
        venue: 'Memorial Stadium',
        city: 'Austin',
        date: '2024-01-20',
        time: '7:00 PM',
        isDistrictGame: true,
      };

      const analysis = gameAnalyzer.analyzeGame(game);
      expect(analysis.momentum).toBe(0);
      expect(analysis.gameControl).toBe('balanced');
      expect(analysis.insights).toBeDefined();
      expect(Array.isArray(analysis.insights)).toBe(true);
    });

    test('should detect home team momentum', () => {
      const game: LiveGame = {
        id: 'game-1',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        homeScore: 28,
        awayScore: 7,
        status: 'in_progress',
        quarter: 3,
        classification: '6A',
        isPlayoff: false,
        venue: 'Memorial Stadium',
        city: 'Austin',
        date: '2024-01-20',
        time: '7:00 PM',
        isDistrictGame: true,
      };

      const analysis = gameAnalyzer.analyzeGame(game);
      expect(analysis.momentum).toBeGreaterThan(0);
      expect(analysis.gameControl).toBe('home');
    });

    test('should detect away team momentum', () => {
      const game: LiveGame = {
        id: 'game-1',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        homeScore: 7,
        awayScore: 28,
        status: 'in_progress',
        quarter: 2,
        classification: '6A',
        isPlayoff: false,
        venue: 'Memorial Stadium',
        city: 'Austin',
        date: '2024-01-20',
        time: '7:00 PM',
        isDistrictGame: true,
      };

      const analysis = gameAnalyzer.analyzeGame(game);
      expect(analysis.momentum).toBeLessThan(0);
      expect(analysis.gameControl).toBe('away');
    });

    test('should identify balanced game', () => {
      const game: LiveGame = {
        id: 'game-1',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        homeScore: 21,
        awayScore: 21,
        status: 'in_progress',
        quarter: 3,
        classification: '6A',
        isPlayoff: false,
        venue: 'Memorial Stadium',
        city: 'Austin',
        date: '2024-01-20',
        time: '7:00 PM',
        isDistrictGame: true,
      };

      const analysis = gameAnalyzer.analyzeGame(game);
      expect(analysis.momentum).toBeCloseTo(0, 1);
      expect(analysis.gameControl).toBe('balanced');
    });
  });

  describe('Matchup History', () => {
    test('should record matchup results', () => {
      gameAnalyzer.recordMatchup('team-1', 'team-2', 28, 21);
      gameAnalyzer.recordMatchup('team-1', 'team-2', 35, 14);

      const history = gameAnalyzer.getMatchupHistory('team-1', 'team-2');
      expect(history).not.toBeNull();
      expect(history?.homeWins).toBe(2);
      expect(history?.awayWins).toBe(0);
    });

    test('should track away team wins', () => {
      gameAnalyzer.recordMatchup('team-1', 'team-2', 14, 28);
      const history = gameAnalyzer.getMatchupHistory('team-1', 'team-2');
      expect(history?.awayWins).toBe(1);
    });

    test('should track ties', () => {
      gameAnalyzer.recordMatchup('team-1', 'team-2', 21, 21);
      const history = gameAnalyzer.getMatchupHistory('team-1', 'team-2');
      expect(history?.ties).toBe(1);
    });
  });

  describe('Key Stats Generation', () => {
    test('should generate score stats', () => {
      const game: LiveGame = {
        id: 'game-1',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        homeScore: 28,
        awayScore: 21,
        status: 'in_progress',
        quarter: 3,
        classification: '6A',
        isPlayoff: false,
        venue: 'Memorial Stadium',
        city: 'Austin',
        date: '2024-01-20',
        time: '7:00 PM',
        isDistrictGame: true,
      };

      const analysis = gameAnalyzer.analyzeGame(game);
      const scoreStats = analysis.keyStats.find((s) => s.label === 'Score');
      expect(scoreStats).toBeDefined();
      expect(scoreStats?.value).toContain('28');
      expect(scoreStats?.advantage).toBe('home');
    });
  });
});
