// Texas High School Football Constants

import { Classification } from './types';

export const CLASSIFICATIONS: Classification[] = [
  {
    id: '6A',
    name: '6A',
    fullName: 'Conference 6A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man' as const,
    playoffTeams: 4,
    color: '#1e40af',
    borderColor: 'border-blue-600',
    bgColor: 'bg-blue-900/30',
    textColor: 'text-blue-400',
    glowColor: 'shadow-blue-500/20',
  },
  {
    id: '5A',
    name: '5A',
    fullName: 'Conference 5A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man' as const,
    playoffTeams: 4,
    color: '#7c3aed',
    borderColor: 'border-purple-600',
    bgColor: 'bg-purple-900/30',
    textColor: 'text-purple-400',
    glowColor: 'shadow-purple-500/20',
  },
  {
    id: '4A',
    name: '4A',
    fullName: 'Conference 4A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man' as const,
    playoffTeams: 4,
    color: '#059669',
    borderColor: 'border-emerald-600',
    bgColor: 'bg-emerald-900/30',
    textColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
  },
  {
    id: '3A',
    name: '3A',
    fullName: 'Conference 3A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man' as const,
    playoffTeams: 4,
    color: '#d97706',
    borderColor: 'border-orange-600',
    bgColor: 'bg-orange-900/30',
    textColor: 'text-orange-400',
    glowColor: 'shadow-orange-500/20',
  },
  {
    id: '2A',
    name: '2A',
    fullName: 'Conference 2A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man' as const,
    playoffTeams: 4,
    color: '#dc2626',
    borderColor: 'border-red-600',
    bgColor: 'bg-red-900/30',
    textColor: 'text-red-400',
    glowColor: 'shadow-red-500/20',
  },
  {
    id: '1A',
    name: '1A',
    fullName: 'Conference 1A (Six-Man)',
    divisions: ['Division I', 'Division II'],
    footballType: '6-man' as const,
    playoffTeams: 2,
    color: '#eab308',
    borderColor: 'border-yellow-600',
    bgColor: 'bg-yellow-900/30',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-yellow-500/20',
  },
];

// Season Information - 2025-2026 Season (COMPLETED Dec 20, 2025)
export const SEASON_INFO = {
  year: '2025-2026',
  displayYear: '2025-26',
  status: 'completed', // 'offseason' | 'preseason' | 'regular' | 'playoffs' | 'completed'
  regularSeasonStart: '2025-08-28',
  regularSeasonEnd: '2025-11-08',
  playoffsStart: '2025-11-13',
  stateChampionships: '2025-12-17',
  stateChampionshipsEnd: '2025-12-20',
  championshipVenue: 'AT&T Stadium, Arlington',
};

// NEXT Season - 2026-2027
export const NEXT_SEASON = {
  year: '2026-2027',
  displayYear: '2026-27',
  kickoffDate: '2026-08-27', // Thursday before Labor Day weekend
  fallCampStart: '2026-08-03', // Usually first Monday in August
};


// 2025-2026 State Champions (Season just completed Dec 20, 2025!)
export const CURRENT_CHAMPIONS = [
  { classification: '6A', division: 'I', champion: 'North Shore', runnerUp: 'Duncanville', score: '10-7', titles: 6, note: 'First since 2021' },
  { classification: '6A', division: 'II', champion: 'DeSoto', runnerUp: 'C.E. King', score: '55-27', titles: 2 },
  { classification: '5A', division: 'I', champion: 'Smithson Valley', runnerUp: 'Frisco Lone Star', score: '28-6', titles: 2, note: 'Back-to-back' },
  { classification: '5A', division: 'II', champion: 'South Oak Cliff', runnerUp: 'Richmond Randle', score: '35-19', titles: 3, note: '5th straight title game' },
  { classification: '4A', division: 'I', champion: 'Stephenville', runnerUp: 'Kilgore', score: '', titles: 7 },
  { classification: '4A', division: 'II', champion: 'Carthage', runnerUp: 'West Orange-Stark', score: '', titles: 11, note: 'Perfect in title games' },
  { classification: '3A', division: 'I', champion: 'Yoakum', runnerUp: 'Grandview', score: '', titles: 1, note: 'First title!' },
  { classification: '3A', division: 'II', champion: 'Wall', runnerUp: 'Newton', score: '', titles: 1, note: 'First title!' },
  { classification: '2A', division: 'I', champion: 'Hamilton', runnerUp: 'Joaquin', score: '', titles: 1, note: 'First title!' },
  { classification: '2A', division: 'II', champion: 'Muenster', runnerUp: 'Shiner', score: '', titles: 2, note: 'Back-to-back' },
  { classification: '1A', division: 'I', champion: 'Gordon', runnerUp: 'Rankin', score: '', titles: 3, note: 'THREE-PEAT! 🏆🏆🏆' },
  { classification: '1A', division: 'II', champion: 'Jayton', runnerUp: 'Richland Springs', score: '', titles: 1 },
];

// Playoff Rounds
export const PLAYOFF_ROUNDS = [
  { id: 'bi-district', name: 'Bi-District', shortName: 'Bi-Dist', week: 1 },
  { id: 'area', name: 'Area', shortName: 'Area', week: 2 },
  { id: 'regional-qf', name: 'Regional Quarterfinals', shortName: 'Reg QF', week: 3 },
  { id: 'regional-sf', name: 'Regional Semifinals', shortName: 'Reg SF', week: 4 },
  { id: 'regional-final', name: 'Regional Finals', shortName: 'Reg Final', week: 5 },
  { id: 'state-sf', name: 'State Semifinals', shortName: 'State SF', week: 6 },
  { id: 'state-final', name: 'State Championship', shortName: 'State', week: 7 },
];

// Texas Regions
export const REGIONS = [
  { id: 1, name: 'Region I', area: 'West Texas / Panhandle' },
  { id: 2, name: 'Region II', area: 'North Texas / DFW' },
  { id: 3, name: 'Region III', area: 'Houston / Gulf Coast' },
  { id: 4, name: 'Region IV', area: 'South Texas / San Antonio' },
];


// Notable Powerhouse Programs (updated with 2025-26 results)
export const POWERHOUSE_TEAMS = [
  // 6A Powers
  { name: 'North Shore', city: 'Houston', classification: '6A', titles: 6, note: '2025 Champ' },
  { name: 'Duncanville', city: 'Duncanville', classification: '6A', titles: 4 },
  { name: 'DeSoto', city: 'DeSoto', classification: '6A', titles: 2, note: '2025 6A-DII Champ' },
  { name: 'Southlake Carroll', city: 'Southlake', classification: '6A', titles: 8 },
  { name: 'Katy', city: 'Katy', classification: '6A', titles: 9 },
  { name: 'Allen', city: 'Allen', classification: '6A', titles: 5 },
  { name: 'Lake Travis', city: 'Austin', classification: '6A', titles: 6 },
  // 5A Powers
  { name: 'Aledo', city: 'Aledo', classification: '5A', titles: 12 },
  { name: 'South Oak Cliff', city: 'Dallas', classification: '5A', titles: 3, note: '2025 Champ, Dynasty' },
  { name: 'Smithson Valley', city: 'Spring Branch', classification: '5A', titles: 2, note: '2025 Champ, Back-to-back' },
  { name: 'Highland Park', city: 'Dallas', classification: '5A', titles: 4 },
  // 4A Powers  
  { name: 'Carthage', city: 'Carthage', classification: '4A', titles: 11, note: '2025 Champ, Perfect in finals' },
  { name: 'Stephenville', city: 'Stephenville', classification: '4A', titles: 7, note: '2025 Champ' },
  { name: 'Celina', city: 'Celina', classification: '4A', titles: 8 },
  // Smaller Classification Powers
  { name: 'Mart', city: 'Mart', classification: '2A', titles: 8 },
  { name: 'Refugio', city: 'Refugio', classification: '2A', titles: 5 },
  { name: 'Gordon', city: 'Gordon', classification: '1A', titles: 3, note: '2025 Champ, THREE-PEAT!' },
];

// Six-Man Football Specific Rules
export const SIX_MAN_RULES = {
  fieldSize: '80 x 40 yards',
  centerLine: '40-yard line',
  players: 6,
  yardsForFirstDown: 15,
  fieldGoalPoints: 4,
  patKick: 2,
  patRunPass: 1,
  mercyRule: 45,
  allPlayersEligible: true,
};

// Game Status Types
export const GAME_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  HALFTIME: 'halftime',
  FINAL: 'final',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled',
};
