export function teamLabel(team: any): string {
  if (!team) return '';
  if (typeof team === 'string') return team;
  if (typeof team === 'number') return String(team);
  return team.name || team.displayName || team.abbrev || team.id || '';
}

export function teamAbbrev(team: any): string {
  if (!team) return '';
  if (typeof team === 'string') return team;
  return team.abbrev || team.shortName || team.name || '';
}
