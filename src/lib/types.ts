// Texas High School Football Types

export interface Classification {
  id: string;
  name: string;
  fullName: string;
  divisions: string[];
  footballType: '11-man' | '6-man';
  playoffTeams: number;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowColor: string;
}

export interface Team {
  id: string;
  name: string;
  mascot: string;
  city: string;
  school: string;
  classification: string;
  division?: string;
  district: string;
  region: number;
  record: string;
  districtRecord?: string;
  ranking?: number;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
}


export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
  quarter?: number;
  timeRemaining?: string;
  classification: string;
  division?: string;
  isPlayoff: boolean;
  playoffRound?: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  broadcast?: string;
  isDistrictGame: boolean;
  week?: number;
}

export interface LiveGame extends Game {
  situation?: {
    possession?: string;
    down?: number;
    distance?: number;
    yardLine?: number;
    lastPlay?: string;
  };
}

export interface PlayoffBracket {
  classification: string;
  division: string;
  rounds: PlayoffRound[];
}

export interface PlayoffRound {
  name: string;
  games: Game[];
}


export interface Standing {
  team: Team;
  wins: number;
  losses: number;
  districtWins: number;
  districtLosses: number;
  pointsFor: number;
  pointsAgainst: number;
  streak?: string;
  playoffSeed?: number;
}

export interface District {
  id: string;
  name: string;
  classification: string;
  division: string;
  region: number;
  teams: Team[];
  standings: Standing[];
}

export interface SeasonPhase {
  id: string;
  name: string;
  current: boolean;
  startDate: string;
  endDate: string;
}

export interface WeekInfo {
  weekNumber: number;
  startDate: string;
  endDate: string;
  isPlayoffs: boolean;
  playoffRound?: string;
}
