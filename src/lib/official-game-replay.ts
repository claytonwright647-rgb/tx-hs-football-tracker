export type OfficialProviderGameStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'final'
  | 'postponed'
  | 'cancelled';

export type TrackerGameStatus =
  | 'scheduled'
  | 'in_progress'
  | 'halftime'
  | 'final'
  | 'postponed'
  | 'cancelled';

export interface CachedOfficialSlate<Game> {
  games: Game[];
  timestamp: number;
}

export function normalizeOfficialProviderStatus(status: OfficialProviderGameStatus): TrackerGameStatus {
  if (status === 'live') return 'in_progress';
  return status;
}

export function rememberOfficialSlate<Game>(
  cache: Map<string, CachedOfficialSlate<Game>>,
  key: string,
  games: Game[],
  timestamp = Date.now(),
): CachedOfficialSlate<Game> {
  const snapshot = { games: [...games], timestamp };
  cache.set(key, snapshot);
  return snapshot;
}

export function lastKnownGoodSlate<Game>(
  cache: Map<string, CachedOfficialSlate<Game>>,
  key: string,
): CachedOfficialSlate<Game> | undefined {
  const snapshot = cache.get(key);
  if (!snapshot) return undefined;
  return { games: [...snapshot.games], timestamp: snapshot.timestamp };
}
