// MaxPreps Data Fetching Utilities
// MaxPreps is the official UIL partner for Texas HS sports data

const MAXPREPS_BASE_URL = 'https://www.maxpreps.com';
const STATE = 'tx';

// Cache for team logos (team name -> logo URL)
const teamLogoCache: Map<string, string | null> = new Map();

// Extract team ID from MaxPreps URL or data
function extractTeamId(input: string | null): string | null {
  if (!input) return null;
  
  // If it's a URL like "https://www.maxpreps.com/tx/arlington/martin-warriors/football/"
  // Extract the GUID from the URL path
  const urlMatch = input.match(/schools\/([0-9a-f-]{36})\//i);
  if (urlMatch) return urlMatch[1];
  
  // If it's already a GUID
  if (input.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return input;
  }
  
  // If it's the @id field from JSON-LD, try to extract
  const idMatch = input.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (idMatch) return idMatch[1];
  
  return null;
}

// Generate MaxPreps team logo URL from team ID (GUID format)
// MaxPreps uses multiple CDN patterns for images
export function getTeamLogoUrl(teamIdInput: string | null, teamName: string): string | null {
  const teamId = extractTeamId(teamIdInput);
  
  if (!teamId) {
    // Try to get from team name via known mappings
    return getLogoFromKnownTeams(teamName);
  }
  
  // Check cache first
  const cacheKey = teamName.toLowerCase().replace(/\s+/g, '-');
  if (teamLogoCache.has(cacheKey)) {
    return teamLogoCache.get(cacheKey) || null;
  }
  
  // MaxPreps CDN patterns (try multiple)
  // Pattern 1: CloudFront CDN
  const logoUrl = `https://d1nnhebuy1lh6n.cloudfront.net/images/teams/${teamId}.png`;
  
  // Alternative patterns that could be tried:
  // Pattern 2: https://images.maxpreps.com/site_images/logo/${teamId}.png
  // Pattern 3: https://images.maxpreps.com/school_sports/${teamId}/logo.png
  
  teamLogoCache.set(cacheKey, logoUrl);
  return logoUrl;
}

// Known team logos for tracked teams
function getLogoFromKnownTeams(teamName: string): string | null {
  const lowerName = teamName.toLowerCase();
  
  // Martin Warriors (Arlington) - Clay's team!
  if (lowerName.includes('martin') && (lowerName.includes('arlington') || lowerName.includes('warrior'))) {
    return 'https://d1nnhebuy1lh6n.cloudfront.net/images/teams/8e8f9a16-44f0-4dd2-ad39-89c0c7d7e0f5.png';
  }
  
  // Add more known teams as needed
  return null;
}

export interface MaxPrepsGame {
  gameId: string;
  homeTeam: string;
  homeTeamId: string;
  homeTeamLogo?: string | null;
  awayTeam: string;
  awayTeamId: string;
  awayTeamLogo?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'final' | 'postponed';
  startTime: string;
  venue: string;
  city: string;
  classification: string;
  week: number;
  isPlayoff: boolean;
  playoffRound?: string;
}

export interface MaxPrepsTeam {
  teamId: string;
  name: string;
  mascot: string;
  city: string;
  record: string;
  wins: number;
  losses: number;
  ranking: number | null;
  classification: string;
  division?: string;
  district?: string;
  logoUrl?: string;
  maxprepsUrl: string;
}

export interface MaxPrepsPlayer {
  playerId: string;
  name: string;
  position: string;
  grade: string;
  height?: string;
  weight?: number;
  teamName: string;
  teamId: string;
  stats: Record<string, number>;
  collegeCommitment?: {
    school: string;
    date: string;
  };
}

export interface MaxPrepsStatLeader {
  rank: number;
  player: MaxPrepsPlayer;
  statValue: number;
  statName: string;
}

// Classification mapping for MaxPreps URLs
const CLASSIFICATION_MAP: Record<string, string> = {
  '6A': 'class-6a',
  '5A': 'class-5a',
  '4A': 'class-4a',
  '3A': 'class-3a',
  '2A': 'class-2a',
  '1A': 'class-1a',
  '6A D1': 'class-6a-division-1',
  '6A D2': 'class-6a-division-2',
  '5A D1': 'class-5a-division-1',
  '5A D2': 'class-5a-division-2',
};

function getClassificationSlug(classification: string): string | null {
  if (CLASSIFICATION_MAP[classification]) return CLASSIFICATION_MAP[classification];
  const match = classification.match(/^([1-6]A)(?: D([12]))?$/);
  if (!match) return null;
  const base = match[1].toLowerCase();
  return match[2] ? `class-${base}-division-${match[2]}` : `class-${base}`;
}

const DIVISION_MAP: Record<string, string> = {
  'Division I': 'division-1',
  'Division II': 'division-2',
  'D1': 'division-1',
  'D2': 'division-2',
};

// Parse MaxPreps JSON-LD data embedded in HTML
function extractJsonLd(html: string, type: string): unknown[] {
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const results: unknown[] = [];
  let match;

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const item = value as Record<string, unknown>;
    if (item['@type'] === type) results.push(item);
    if (Array.isArray(item['@graph'])) item['@graph'].forEach(visit);
  };
  
  while ((match = regex.exec(html)) !== null) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      // Skip invalid JSON
    }
  }
  
  return results;
}

// Generate MaxPreps team URL
export function getMaxPrepsTeamUrl(teamId: string, teamName: string): string {
  const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${MAXPREPS_BASE_URL}/tx/schools/${teamId}/${slug}/football`;
}

/**
 * Fetches scores for a specific week and classification
 */
export async function fetchScores(
  classification: string,
  week?: number
): Promise<MaxPrepsGame[]> {
  const classSlug = getClassificationSlug(classification);
  if (!classSlug) return [];
  let url = `${MAXPREPS_BASE_URL}/${STATE}/football/${classSlug}/scores/`;
  
  if (week) {
    url += `week-${week}/`;
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`MaxPreps fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Extract SportsEvent JSON-LD data
    const events = extractJsonLd(html, 'SportsEvent');
    
    return events.map((eventValue) => {
      const event = eventValue as Record<string, any>;
      const homeTeamId = event.homeTeam?.['@id'] || '';
      const homeTeamName = event.homeTeam?.name || '';
      const awayTeamId = event.awayTeam?.['@id'] || '';
      const awayTeamName = event.awayTeam?.name || '';
      
      return {
        gameId: event['@id'] || `mp-${Date.now()}-${Math.random()}`,
        homeTeam: homeTeamName,
        homeTeamId,
        homeTeamLogo: event.homeTeam?.logo || event.homeTeam?.image?.url || getTeamLogoUrl(homeTeamId, homeTeamName),
        awayTeam: awayTeamName,
        awayTeamId,
        awayTeamLogo: event.awayTeam?.logo || event.awayTeam?.image?.url || getTeamLogoUrl(awayTeamId, awayTeamName),
        homeScore: event.homeTeam?.score ?? null,
        awayScore: event.awayTeam?.score ?? null,
        status: parseEventStatus(event.eventStatus),
        startTime: event.startDate || '',
        venue: event.location?.name || '',
        city: event.location?.address?.addressLocality || '',
        classification,
        week: week || 0,
        isPlayoff: false,
      };
    });
  } catch (error) {
    console.error('MaxPreps fetch error:', error);
    return [];
  }
}

function parseEventStatus(status?: string): MaxPrepsGame['status'] {
  if (!status) return 'scheduled';
  const lower = status.toLowerCase();
  if (lower.includes('progress') || lower.includes('live')) return 'live';
  if (lower.includes('finish') || lower.includes('final') || lower.includes('ended')) return 'final';
  if (lower.includes('postpone') || lower.includes('cancel')) return 'postponed';
  return 'scheduled';
}

/**
 * Fetches rankings for a specific classification
 */
export async function fetchRankings(
  classification: string
): Promise<MaxPrepsTeam[]> {
  const classSlug = getClassificationSlug(classification);
  if (!classSlug) return [];
  const url = `${MAXPREPS_BASE_URL}/${STATE}/football/${classSlug}/rankings/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    
    // Extract team data from Organization JSON-LD
    const orgs = extractJsonLd(html, 'SportsTeam');
    
    return orgs.map((teamValue, index: number) => {
      const team = teamValue as Record<string, any>;
      const record = team.record || '0-0';
      const [wins, losses] = record.split('-').map(Number);
      
      return {
        teamId: team['@id'] || `team-${index}`,
        name: team.name || '',
        mascot: team.alternateName || '',
        city: team.location?.address?.addressLocality || '',
        record,
        wins: wins || 0,
        losses: losses || 0,
        ranking: index + 1,
        classification,
        logoUrl: team.logo,
        maxprepsUrl: team.url || '',
      };
    });
  } catch (error) {
    console.error('MaxPreps rankings error:', error);
    return [];
  }
}

/**
 * Fetches stat leaders for a category
 */
export async function fetchStatLeaders(
  classification: string,
  statCategory: 'passing' | 'rushing' | 'receiving' | 'tackles' | 'sacks'
): Promise<MaxPrepsStatLeader[]> {
  const classSlug = getClassificationSlug(classification);
  if (!classSlug) return [];
  const url = `${MAXPREPS_BASE_URL}/${STATE}/football/${classSlug}/stat-leaders/${statCategory}-yards/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    
    // Parse stat leaders from table structure
    // MaxPreps uses data-reactid or similar for dynamic content
    // For now return empty - would need proper parsing
    console.log(`Fetched stat leaders: ${url}`);
    return [];
  } catch (error) {
    console.error('MaxPreps stat leaders error:', error);
    return [];
  }
}

/**
 * Fetches playoff bracket data
 */
export async function fetchPlayoffBracket(
  classification: string,
  division: string
): Promise<MaxPrepsGame[]> {
  const classSlug = getClassificationSlug(classification);
  if (!classSlug) return [];
  const divSlug = DIVISION_MAP[division] || 'division-1';
  const url = `${MAXPREPS_BASE_URL}/${STATE}/football/${classSlug}/${divSlug}/playoffs/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const events = extractJsonLd(html, 'SportsEvent');
    
    return events.map((eventValue) => {
      const event = eventValue as Record<string, any>;
      const homeTeamId = event.homeTeam?.['@id'] || '';
      const homeTeamName = event.homeTeam?.name || '';
      const awayTeamId = event.awayTeam?.['@id'] || '';
      const awayTeamName = event.awayTeam?.name || '';
      
      return {
        gameId: event['@id'] || `playoff-${Date.now()}-${Math.random()}`,
        homeTeam: homeTeamName,
        homeTeamId,
        homeTeamLogo: event.homeTeam?.logo || event.homeTeam?.image?.url || getTeamLogoUrl(homeTeamId, homeTeamName),
        awayTeam: awayTeamName,
        awayTeamId,
        awayTeamLogo: event.awayTeam?.logo || event.awayTeam?.image?.url || getTeamLogoUrl(awayTeamId, awayTeamName),
        homeScore: event.homeTeam?.score ?? null,
        awayScore: event.awayTeam?.score ?? null,
        status: parseEventStatus(event.eventStatus),
        startTime: event.startDate || '',
        venue: event.location?.name || '',
        city: event.location?.address?.addressLocality || '',
        classification,
        week: 0,
        isPlayoff: true,
        playoffRound: parsePlayoffRound(event.name || ''),
      };
    });
  } catch (error) {
    console.error('MaxPreps playoffs error:', error);
    return [];
  }
}

function parsePlayoffRound(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('final') || lower.includes('championship')) return 'State Championship';
  if (lower.includes('semifinal')) return 'State Semifinal';
  if (lower.includes('quarterfinal')) return 'State Quarterfinal';
  if (lower.includes('region')) return 'Regional';
  if (lower.includes('area')) return 'Area';
  if (lower.includes('bi-district')) return 'Bi-District';
  return 'Playoff';
}

/**
 * Fetches team schedule
 */
export async function fetchTeamSchedule(teamId: string): Promise<MaxPrepsGame[]> {
  const url = `${MAXPREPS_BASE_URL}/schools/${teamId}/football/schedule`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const events = extractJsonLd(html, 'SportsEvent');
    
    return events.map((eventValue) => {
      const event = eventValue as Record<string, any>;
      return {
      gameId: event['@id'] || `game-${Date.now()}-${Math.random()}`,
      homeTeam: event.homeTeam?.name || '',
      homeTeamId: event.homeTeam?.['@id'] || '',
      awayTeam: event.awayTeam?.name || '',
      awayTeamId: event.awayTeam?.['@id'] || '',
      homeScore: event.homeTeam?.score ?? null,
      awayScore: event.awayTeam?.score ?? null,
      status: parseEventStatus(event.eventStatus),
      startTime: event.startDate || '',
      venue: event.location?.name || '',
      city: event.location?.address?.addressLocality || '',
      classification: '',
      week: 0,
      isPlayoff: false,
      };
    });
  } catch (error) {
    console.error('MaxPreps schedule error:', error);
    return [];
  }
}

/**
 * Get all Texas UIL classifications
 */
export function getUILClassifications(): string[] {
  return ['6A D1', '6A D2', '5A D1', '5A D2', '4A D1', '4A D2', '3A D1', '3A D2', '2A D1', '2A D2', '1A D1', '1A D2'];
}

/**
 * Get playoff rounds in order
 */
export function getPlayoffRounds(): string[] {
  return ['Bi-District', 'Area', 'Regional', 'State Quarterfinal', 'State Semifinal', 'State Championship'];
}
