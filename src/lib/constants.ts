// Texas High School Football Constants

import { Classification, Team } from './types';

// My Followed Teams - Track these teams specifically
export const FOLLOWED_TEAMS: Team[] = [
  {
    id: 'martin-arlington',
    name: 'Martin',
    slug: 'martin-arlington',
    mascot: 'Warriors',
    city: 'Arlington',
    // school: 'James Martin High School', // Removed
    classification: '6A',
    division: 'Division II',
    district: '8-6A',
    // region: 1, // Removed
    record: '4-6',
    districtRecord: '3-4',
    colors: {
      primary: '#CC0000',     // Red
      secondary: '#000000',   // Black
    },
  },
];

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

// Season Information - 2026-2027 Season (UPCOMING)
export const SEASON_INFO = {
  year: '2026-2027',
  displayYear: '2026-27',
  status: 'offseason', // 'offseason' | 'preseason' | 'regular' | 'playoffs' | 'completed'
  regularSeasonStart: '2026-08-27',
  regularSeasonEnd: '2026-11-07',
  playoffsStart: '2026-11-12',
  stateChampionships: '2026-12-16',
  stateChampionshipsEnd: '2026-12-19',
  championshipVenue: 'AT&T Stadium, Arlington',
};

// Last completed season
export const LAST_SEASON = {
  year: '2025-2026',
  displayYear: '2025-26',
};

// NEXT / Upcoming Season
export const NEXT_SEASON = {
  year: '2026-2027',
  displayYear: '2026-27',
  kickoffDate: '2026-08-27',
  fallCampStart: '2026-08-03',
};


// 2025-2026 State Champions (Allocated for History)
export const CURRENT_CHAMPIONS: any[] = [];

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


// Notable Powerhouse Programs
export const POWERHOUSE_TEAMS = [
  // 6A Powers
  { name: 'Duncanville', city: 'Duncanville', classification: '6A', titles: 3, note: 'Reigning 6A-DI Champ' },
  { name: 'North Shore', city: 'Houston', classification: '6A', titles: 6, note: '6A-DI Finalist' },
  { name: 'DeSoto', city: 'DeSoto', classification: '6A', titles: 3, note: 'Reigning 6A-DII Champ' },
  { name: 'Westlake', city: 'Austin', classification: '6A', titles: 3, note: 'Consistent Contender' },
  { name: 'Katy', city: 'Katy', classification: '6A', titles: 9, note: 'Historic Powerhouse' },
  { name: 'Southlake Carroll', city: 'Southlake', classification: '6A', titles: 8, note: 'Dragon Dynasty' },
  { name: 'Martin', city: 'Arlington', classification: '6A', titles: 0, note: 'Arlington Powerhouse' },
  { name: 'Lake Travis', city: 'Austin', classification: '6A', titles: 6 },
  // 5A Powers
  { name: 'Aledo', city: 'Aledo', classification: '5A', titles: 12 },
  { name: 'South Oak Cliff', city: 'Dallas', classification: '5A', titles: 3, note: 'Reigning 5A-DII Champ' },
  { name: 'Smithson Valley', city: 'Spring Branch', classification: '5A', titles: 2, note: 'Reigning 5A-DI Champ' },
  { name: 'Highland Park', city: 'Dallas', classification: '5A', titles: 4 },
  // 4A Powers  
  { name: 'Carthage', city: 'Carthage', classification: '4A', titles: 11, note: 'Reigning 4A-DII Champ' },
  { name: 'Stephenville', city: 'Stephenville', classification: '4A', titles: 7, note: 'Reigning 4A-DI Champ' },
  { name: 'Celina', city: 'Celina', classification: '4A', titles: 8 },
  // Smaller Classification Powers
  { name: 'Mart', city: 'Mart', classification: '2A', titles: 8 },
  { name: 'Refugio', city: 'Refugio', classification: '2A', titles: 5 },
  { name: 'Gordon', city: 'Gordon', classification: '1A', titles: 3, note: 'Reigning 1A-DI Champ' },
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
