// Texas High School Football Constants

export const CLASSIFICATIONS = [
  {
    id: '6A',
    name: '6A',
    fullName: 'Conference 6A',
    divisions: ['Division I', 'Division II'],
    footballType: '11-man',
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
    footballType: '11-man',
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
    footballType: '11-man',
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
    footballType: '11-man',
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
    footballType: '11-man',
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
    footballType: '6-man',
    playoffTeams: 2,
    color: '#eab308',
    borderColor: 'border-yellow-600',
    bgColor: 'bg-yellow-900/30',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-yellow-500/20',
  },
];


// Private School Organizations
export const PRIVATE_LEAGUES = [
  {
    id: 'TAPPS',
    name: 'TAPPS',
    fullName: 'Texas Association of Private & Parochial Schools',
    divisions: ['Division I', 'Division II', 'Division III', 'Division IV', '6-Man'],
    color: '#6366f1',
    borderColor: 'border-indigo-600',
    bgColor: 'bg-indigo-900/30',
    textColor: 'text-indigo-400',
  },
];

// Season Information
export const SEASON_INFO = {
  year: '2025-2026',
  regularSeasonStart: '2025-08-28',
  regularSeasonEnd: '2025-11-08',
  playoffsStart: '2025-11-13',
  stateChampionships: '2025-12-17', // 6-man start
  stateChampionshipsEnd: '2025-12-20', // 6A finals
  championshipVenue: 'AT&T Stadium, Arlington',
};

// Playoff Rounds
export const PLAYOFF_ROUNDS = [
  { id: 'bi-district', name: 'Bi-District', shortName: 'Bi-Dist' },
  { id: 'area', name: 'Area', shortName: 'Area' },
  { id: 'regional-qf', name: 'Regional Quarterfinals', shortName: 'Reg QF' },
  { id: 'regional-sf', name: 'Regional Semifinals', shortName: 'Reg SF' },
  { id: 'regional-final', name: 'Regional Finals', shortName: 'Reg Final' },
  { id: 'state-sf', name: 'State Semifinals', shortName: 'State SF' },
  { id: 'state-final', name: 'State Championship', shortName: 'State' },
];


// Texas Regions
export const REGIONS = [
  { id: 1, name: 'Region I', area: 'West Texas / Panhandle' },
  { id: 2, name: 'Region II', area: 'North Texas / DFW' },
  { id: 3, name: 'Region III', area: 'Houston / Gulf Coast' },
  { id: 4, name: 'Region IV', area: 'South Texas / San Antonio' },
];

// Notable Powerhouse Programs (for highlighting)
export const POWERHOUSE_TEAMS = [
  // 6A Powers
  { name: 'Duncanville', city: 'Duncanville', classification: '6A', titles: 4 },
  { name: 'North Shore', city: 'Houston', classification: '6A', titles: 6 },
  { name: 'Southlake Carroll', city: 'Southlake', classification: '6A', titles: 8 },
  { name: 'Katy', city: 'Katy', classification: '6A', titles: 9 },
  { name: 'Allen', city: 'Allen', classification: '6A', titles: 5 },
  { name: 'DeSoto', city: 'DeSoto', classification: '6A', titles: 4 },
  { name: 'Lake Travis', city: 'Austin', classification: '6A', titles: 6 },
  // 5A Powers
  { name: 'Aledo', city: 'Aledo', classification: '5A', titles: 12 },
  { name: 'South Oak Cliff', city: 'Dallas', classification: '5A', titles: 3 },
  { name: 'Highland Park', city: 'Dallas', classification: '5A', titles: 4 },
  // 4A Powers  
  { name: 'Carthage', city: 'Carthage', classification: '4A', titles: 11 },
  { name: 'Celina', city: 'Celina', classification: '4A', titles: 8 },
  { name: 'Stephenville', city: 'Stephenville', classification: '4A', titles: 7 },
  // Smaller Classification Powers
  { name: 'Mart', city: 'Mart', classification: '2A', titles: 8 },
  { name: 'Refugio', city: 'Refugio', classification: '2A', titles: 5 },
];


// 2024-2025 State Champions (Just completed!)
export const CURRENT_CHAMPIONS = [
  { classification: '6A', division: 'I', champion: 'North Shore', runnerUp: 'Duncanville', score: '10-7' },
  { classification: '6A', division: 'II', champion: 'DeSoto', runnerUp: 'C.E. King', score: '55-27' },
  { classification: '5A', division: 'I', champion: 'Smithson Valley', runnerUp: 'Lone Star', score: '' },
  { classification: '5A', division: 'II', champion: 'South Oak Cliff', runnerUp: 'Randle', score: '35-19' },
  { classification: '4A', division: 'I', champion: 'Stephenville', runnerUp: 'Kilgore', score: '' },
  { classification: '4A', division: 'II', champion: 'Carthage', runnerUp: 'Brock', score: '' },
  { classification: '3A', division: 'I', champion: 'Columbus', runnerUp: 'Gunter', score: '' },
  { classification: '3A', division: 'II', champion: 'Gunter', runnerUp: 'Newton', score: '' },
  { classification: '2A', division: 'I', champion: 'Ganado', runnerUp: 'Hamilton', score: '' },
  { classification: '2A', division: 'II', champion: 'Muenster', runnerUp: 'Shiner', score: '' },
  { classification: '1A', division: 'I', champion: 'Gordon', runnerUp: 'Rankin', score: '69-22' },
  { classification: '1A', division: 'II', champion: 'Jayton', runnerUp: 'Richland Springs', score: '' },
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
  mercyRule: 45, // Game ends if 45+ point lead at half or during 2nd half
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
