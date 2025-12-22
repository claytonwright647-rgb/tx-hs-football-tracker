// Season Intelligence System for TX HS Football Tracker
// Knows when to look for schedules, when season starts/stops, and what phase we're in

export interface SeasonConfig {
  year: number;
  // Key dates
  scheduleReleaseStart: string;  // When UIL typically releases schedules (June)
  fallCampStart: string;         // When teams can start practice (August)
  scrimmagesStart: string;       // Week before season
  regularSeasonStart: string;    // First games
  regularSeasonEnd: string;      // Last regular season week
  playoffsStart: string;         // Bi-district round
  stateChampionships: string;    // Finals week at AT&T Stadium
  seasonEnd: string;             // After state championships
  // Data fetching windows
  startLookingForSchedules: string;  // When to start checking for schedule data
  startLookingForScores: string;     // When to start checking for live scores
}

export type SeasonPhase = 
  | 'deep_offseason'      // Jan-May: Nothing happening
  | 'schedule_watch'      // June: Start looking for schedules
  | 'preseason'           // July: Schedules available, previews
  | 'fall_camp'           // Early August: Practice begins
  | 'scrimmages'          // Late August: Tune-up games
  | 'regular_season'      // Sept-Nov: Weekly games
  | 'playoffs'            // Nov-Dec: Elimination rounds
  | 'state_championships' // Mid-Dec: Finals at AT&T
  | 'postseason'          // Late Dec: Wrap-up, awards

// Season configurations for multiple years
export const SEASON_CONFIGS: Record<number, SeasonConfig> = {
  2025: {
    year: 2025,
    scheduleReleaseStart: '2025-06-01',
    fallCampStart: '2025-08-04',
    scrimmagesStart: '2025-08-21',
    regularSeasonStart: '2025-08-28',
    regularSeasonEnd: '2025-11-08',
    playoffsStart: '2025-11-13',
    stateChampionships: '2025-12-17',
    seasonEnd: '2025-12-20',
    startLookingForSchedules: '2025-06-01',
    startLookingForScores: '2025-08-21',
  },
  2026: {
    year: 2026,
    scheduleReleaseStart: '2026-06-01',
    fallCampStart: '2026-08-03',
    scrimmagesStart: '2026-08-20',
    regularSeasonStart: '2026-08-27',
    regularSeasonEnd: '2026-11-07',
    playoffsStart: '2026-11-12',
    stateChampionships: '2026-12-16',
    seasonEnd: '2026-12-19',
    startLookingForSchedules: '2026-06-01',
    startLookingForScores: '2026-08-20',
  },
};

export function getCurrentSeasonYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  
  // If we're in Jan-May, we're in the offseason of the previous year's season
  // If we're in June+, we're looking at this year's upcoming season
  return month < 5 ? year - 1 : year;
}

export function getSeasonConfig(year?: number): SeasonConfig {
  const targetYear = year || getCurrentSeasonYear();
  
  // If we have a config for this year, use it
  if (SEASON_CONFIGS[targetYear]) {
    return SEASON_CONFIGS[targetYear];
  }
  
  // Otherwise, generate one based on patterns (UIL follows similar schedule each year)
  return generateSeasonConfig(targetYear);
}

function generateSeasonConfig(year: number): SeasonConfig {
  // UIL typically follows these patterns:
  // - Schedules release: June
  // - Fall camp: First Monday of August
  // - Regular season: Last weekend of August
  // - Playoffs: Mid-November
  // - State: Third week of December
  
  return {
    year,
    scheduleReleaseStart: `${year}-06-01`,
    fallCampStart: `${year}-08-04`,
    scrimmagesStart: `${year}-08-21`,
    regularSeasonStart: `${year}-08-28`,
    regularSeasonEnd: `${year}-11-08`,
    playoffsStart: `${year}-11-13`,
    stateChampionships: `${year}-12-17`,
    seasonEnd: `${year}-12-20`,
    startLookingForSchedules: `${year}-06-01`,
    startLookingForScores: `${year}-08-21`,
  };
}

export function getCurrentPhase(date?: Date): SeasonPhase {
  const now = date || new Date();
  const config = getSeasonConfig();
  
  const toDate = (str: string) => new Date(str + 'T00:00:00');
  
  // Check phases in order
  if (now < toDate(config.startLookingForSchedules)) {
    return 'deep_offseason';
  }
  if (now < toDate(config.fallCampStart)) {
    // June-July: Looking for schedules
    return now < toDate(`${config.year}-07-15`) ? 'schedule_watch' : 'preseason';
  }
  if (now < toDate(config.scrimmagesStart)) {
    return 'fall_camp';
  }
  if (now < toDate(config.regularSeasonStart)) {
    return 'scrimmages';
  }
  if (now < toDate(config.playoffsStart)) {
    return 'regular_season';
  }
  if (now < toDate(config.stateChampionships)) {
    return 'playoffs';
  }
  if (now <= toDate(config.seasonEnd)) {
    return 'state_championships';
  }
  
  // After season ends, we're in postseason/offseason
  const nextYear = config.year + 1;
  const nextScheduleStart = `${nextYear}-06-01`;
  if (now < toDate(nextScheduleStart)) {
    return 'postseason';
  }
  
  return 'deep_offseason';
}


export interface PhaseConfig {
  phase: SeasonPhase;
  displayName: string;
  description: string;
  // What data to fetch
  fetchSchedules: boolean;
  fetchScores: boolean;
  fetchRankings: boolean;
  fetchStandings: boolean;
  // How often to check for updates (in minutes)
  refreshInterval: number;
  // UI hints
  showCountdown: boolean;
  countdownTarget?: string;
  showLiveScores: boolean;
  showSchedule: boolean;
  primaryAction: string;
}

export const PHASE_CONFIGS: Record<SeasonPhase, PhaseConfig> = {
  deep_offseason: {
    phase: 'deep_offseason',
    displayName: 'Offseason',
    description: 'Waiting for the new season',
    fetchSchedules: false,
    fetchScores: false,
    fetchRankings: false,
    fetchStandings: false,
    refreshInterval: 1440, // Once per day
    showCountdown: true,
    countdownTarget: 'schedule_release',
    showLiveScores: false,
    showSchedule: false,
    primaryAction: 'View last season results',
  },
  schedule_watch: {
    phase: 'schedule_watch',
    displayName: 'Schedule Watch',
    description: 'Looking for 2025 schedules...',
    fetchSchedules: true,
    fetchScores: false,
    fetchRankings: true,
    fetchStandings: false,
    refreshInterval: 360, // Every 6 hours
    showCountdown: true,
    countdownTarget: 'season_start',
    showLiveScores: false,
    showSchedule: true,
    primaryAction: 'Check for new schedules',
  },
  preseason: {
    phase: 'preseason',
    displayName: 'Preseason',
    description: 'Schedules released! Season preview mode',
    fetchSchedules: true,
    fetchScores: false,
    fetchRankings: true,
    fetchStandings: false,
    refreshInterval: 180, // Every 3 hours
    showCountdown: true,
    countdownTarget: 'season_start',
    showLiveScores: false,
    showSchedule: true,
    primaryAction: 'View full schedules',
  },
  fall_camp: {
    phase: 'fall_camp',
    displayName: 'Fall Camp',
    description: 'Teams are practicing! Season starts soon',
    fetchSchedules: true,
    fetchScores: false,
    fetchRankings: true,
    fetchStandings: false,
    refreshInterval: 120, // Every 2 hours
    showCountdown: true,
    countdownTarget: 'first_game',
    showLiveScores: false,
    showSchedule: true,
    primaryAction: 'View Week 1 schedule',
  },
  scrimmages: {
    phase: 'scrimmages',
    displayName: 'Scrimmages',
    description: 'Tune-up games this week!',
    fetchSchedules: true,
    fetchScores: true,
    fetchRankings: true,
    fetchStandings: false,
    refreshInterval: 30, // Every 30 min
    showCountdown: true,
    countdownTarget: 'first_game',
    showLiveScores: true,
    showSchedule: true,
    primaryAction: 'View scrimmage results',
  },
  regular_season: {
    phase: 'regular_season',
    displayName: 'Regular Season',
    description: 'Friday Night Lights! 🏈',
    fetchSchedules: true,
    fetchScores: true,
    fetchRankings: true,
    fetchStandings: true,
    refreshInterval: 1, // Every minute during games
    showCountdown: false,
    showLiveScores: true,
    showSchedule: true,
    primaryAction: 'View live scores',
  },
  playoffs: {
    phase: 'playoffs',
    displayName: 'Playoffs',
    description: 'Win or go home! 🏆',
    fetchSchedules: true,
    fetchScores: true,
    fetchRankings: true,
    fetchStandings: false,
    refreshInterval: 1,
    showCountdown: false,
    showLiveScores: true,
    showSchedule: true,
    primaryAction: 'View playoff bracket',
  },
  state_championships: {
    phase: 'state_championships',
    displayName: 'State Championships',
    description: 'Finals at AT&T Stadium! 🏟️',
    fetchSchedules: true,
    fetchScores: true,
    fetchRankings: false,
    fetchStandings: false,
    refreshInterval: 1,
    showCountdown: false,
    showLiveScores: true,
    showSchedule: true,
    primaryAction: 'Watch state finals',
  },
  postseason: {
    phase: 'postseason',
    displayName: 'Season Complete',
    description: 'Another great season in the books!',
    fetchSchedules: false,
    fetchScores: false,
    fetchRankings: false,
    fetchStandings: false,
    refreshInterval: 1440,
    showCountdown: true,
    countdownTarget: 'next_season',
    showLiveScores: false,
    showSchedule: false,
    primaryAction: 'View final results',
  },
};

export function getPhaseConfig(phase?: SeasonPhase): PhaseConfig {
  const currentPhase = phase || getCurrentPhase();
  return PHASE_CONFIGS[currentPhase];
}

// Calculate days until a target event
export function getDaysUntil(target: 'schedule_release' | 'season_start' | 'first_game' | 'next_season'): number {
  const now = new Date();
  const config = getSeasonConfig();
  
  let targetDate: Date;
  
  switch (target) {
    case 'schedule_release':
      targetDate = new Date(config.scheduleReleaseStart + 'T00:00:00');
      break;
    case 'season_start':
    case 'first_game':
      targetDate = new Date(config.regularSeasonStart + 'T00:00:00');
      break;
    case 'next_season':
      const nextYear = config.year + 1;
      targetDate = new Date(`${nextYear}-08-28T00:00:00`);
      break;
    default:
      targetDate = new Date(config.regularSeasonStart + 'T00:00:00');
  }
  
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Determine what data sources to query based on current phase
export function getDataSourcesToQuery(): {
  espnSchedules: boolean;
  espnScores: boolean;
  maxPrepsRankings: boolean;
  uilResults: boolean;
} {
  const phaseConfig = getPhaseConfig();
  
  return {
    espnSchedules: phaseConfig.fetchSchedules,
    espnScores: phaseConfig.fetchScores,
    maxPrepsRankings: phaseConfig.fetchRankings,
    uilResults: phaseConfig.fetchStandings,
  };
}

// Get the appropriate refresh interval in milliseconds
export function getRefreshInterval(): number {
  const phaseConfig = getPhaseConfig();
  return phaseConfig.refreshInterval * 60 * 1000;
}

// Check if we should be actively fetching live game data
export function shouldFetchLiveData(): boolean {
  const phase = getCurrentPhase();
  return ['scrimmages', 'regular_season', 'playoffs', 'state_championships'].includes(phase);
}

// Check if we should be looking for schedule updates
export function shouldFetchSchedules(): boolean {
  const phase = getCurrentPhase();
  return ['schedule_watch', 'preseason', 'fall_camp', 'scrimmages', 'regular_season', 'playoffs', 'state_championships'].includes(phase);
}

// Get status message for the current phase
export function getSeasonStatusMessage(): string {
  const phase = getCurrentPhase();
  const config = getPhaseConfig(phase);
  const seasonConfig = getSeasonConfig();
  
  switch (phase) {
    case 'deep_offseason': {
      const days = getDaysUntil('schedule_release');
      return `${config.description} Schedules typically release in ${days} days.`;
    }
    case 'schedule_watch':
      return `${config.description} Checking UIL and ESPN for ${seasonConfig.year} schedules.`;
    case 'preseason': {
      const days = getDaysUntil('season_start');
      return `${config.description} ${days} days until kickoff!`;
    }
    case 'fall_camp': {
      const days = getDaysUntil('first_game');
      return `${config.description} First games in ${days} days!`;
    }
    case 'scrimmages':
      return config.description;
    case 'regular_season':
      return config.description;
    case 'playoffs':
      return config.description;
    case 'state_championships':
      return config.description;
    case 'postseason':
      return `${seasonConfig.year} ${config.description}`;
    default:
      return config.description;
  }
}
