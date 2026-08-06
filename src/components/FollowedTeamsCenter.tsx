'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, ExternalLink, Radio, ShieldCheck, Tv } from 'lucide-react';

type FollowedGame = {
  date: string;
  opponent: string;
  homeAway: 'home' | 'away';
  result?: 'W' | 'L' | 'T';
  score?: { home: number; away: number };
  isDistrict?: boolean;
  sourceUrl?: string;
  watchUrl?: string;
  status?: 'pre' | 'in' | 'post';
  statusDetail?: string;
};

type FollowedTeam = {
  name: string;
  overallRecord: string;
  games: FollowedGame[];
  sourceUrl?: string;
};

type FollowedTeamsResponse = {
  success: boolean;
  teams: FollowedTeam[];
  hasLiveGames: boolean;
  message?: string;
};

const teamContext: Record<string, { short: string; className: string; district: string; accent: string }> = {
  'Martin Warriors': { short: 'MART', className: '6A', district: 'Region I · District 3', accent: 'border-red-500/40 from-red-950/45' },
  'Stephenville Yellow Jackets': { short: 'STPH', className: '4A Division I', district: 'District 12', accent: 'border-yellow-500/40 from-yellow-950/35' },
};

function focusGame(games: FollowedGame[]): FollowedGame | undefined {
  return games.find((game) => game.status === 'in')
    || games.find((game) => game.status !== 'post' && !game.result)
    || [...games].reverse().find((game) => game.status === 'post' || Boolean(game.result));
}

function teamScore(game: FollowedGame): number | undefined {
  return game.score ? (game.homeAway === 'home' ? game.score.home : game.score.away) : undefined;
}

function rivalScore(game: FollowedGame): number | undefined {
  return game.score ? (game.homeAway === 'home' ? game.score.away : game.score.home) : undefined;
}

function FollowedTeamCard({ team }: { team: FollowedTeam }) {
  const context = teamContext[team.name] || { short: team.name.slice(0, 4).toUpperCase(), className: 'UIL', district: 'District pending', accent: 'border-gray-700 from-gray-900' };
  const game = focusGame(team.games || []);
  const live = game?.status === 'in';
  const final = game?.status === 'post' || Boolean(game?.result);
  const mine = game ? teamScore(game) : undefined;
  const theirs = game ? rivalScore(game) : undefined;
  const rows = game
    ? game.homeAway === 'home'
      ? [{ name: game.opponent, short: game.opponent.slice(0, 4).toUpperCase(), score: theirs, side: 'Away' }, { name: team.name, short: context.short, score: mine, side: 'Home' }]
      : [{ name: team.name, short: context.short, score: mine, side: 'Away' }, { name: game.opponent, short: game.opponent.slice(0, 4).toUpperCase(), score: theirs, side: 'Home' }]
    : [];

  return <article className={`overflow-hidden rounded-2xl border bg-gradient-to-br ${context.accent} to-gray-950 shadow-xl`}>
    <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div><div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider"><span className="text-orange-300">My team</span><span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-gray-200">{context.className}</span>{game?.isDistrict && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">District</span>}</div><h3 className="mt-1 text-lg font-black text-white">{team.name}</h3><p className="text-xs text-gray-400">{context.district}</p></div>
      <div className="text-right"><p className="text-[9px] font-bold uppercase text-gray-500">Record</p><p className="text-xl font-black text-white">{team.overallRecord || '0-0'}</p></div>
    </header>

    {game ? <>
      <div className="flex items-center justify-between bg-black/20 px-4 py-2.5 text-xs"><span className="flex items-center gap-1.5 text-gray-300"><CalendarDays className="h-4 w-4 text-orange-300" />{game.date} CT</span><span className={`rounded-md px-2 py-1 font-black ${live ? 'bg-red-500 text-white' : final ? 'bg-gray-700 text-gray-100' : 'bg-blue-500/15 text-blue-200'}`}>{live ? '● LIVE' : final ? 'FINAL' : 'NEXT GAME'}</span></div>
      <div className="space-y-2 p-4">
        {rows.map((row) => <div key={`${row.side}-${row.name}`} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-3"><span className="flex h-9 items-center justify-center rounded-lg bg-white/5 text-[11px] font-black text-white">{row.short}</span><div className="min-w-0"><p className="truncate font-bold text-white">{row.name}</p><p className="text-[10px] font-semibold uppercase text-gray-500">{row.side}</p></div><span className="text-3xl font-black tabular-nums text-white" aria-label={row.score === undefined ? 'Score unavailable' : `${row.score} points`}>{row.score ?? '—'}</span></div>)}
      </div>
      <div className="mx-4 mb-3 rounded-xl border border-white/10 bg-gray-950/60 px-3 py-2.5 text-xs text-gray-300">
        {live ? <p className="flex items-start gap-2 text-red-100"><Radio className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />{game.statusDetail || 'Live status verified by MaxPreps'}{game.score ? '' : ' · Score has not been reported.'}</p> : final ? <p>{game.result ? `${game.result} · ` : ''}Final result reported by MaxPreps.</p> : <p><strong className="text-white">What’s next:</strong> {team.name} {game.homeAway === 'away' ? 'travel to' : 'host'} {game.opponent}.</p>}
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 text-xs font-bold">{game.sourceUrl && <a href={game.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-blue-200">Game details <ExternalLink className="h-3.5 w-3.5" /></a>}{game.watchUrl ? <a href={game.watchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-200">Watch on NFHS <Tv className="h-3.5 w-3.5" /></a> : <span className="px-1 py-2 font-normal text-gray-500">Verified stream not listed yet</span>}</footer>
    </> : <div className="p-6 text-center text-sm text-gray-400">No verified game is published for this team.</div>}
  </article>;
}

export default function FollowedTeamsCenter() {
  const [data, setData] = useState<FollowedTeamsResponse | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/followed-teams', { cache: 'no-store' });
      if (!response.ok) throw new Error('followed teams unavailable');
      setData(await response.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), data?.hasLiveGames ? 30_000 : 300_000);
    return () => window.clearInterval(interval);
  }, [data?.hasLiveGames, load]);

  if (!data && !error) return <div className="mb-8 h-72 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/70" />;
  if (!data || error) return <section className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"><h2 className="font-black text-white">My Texas Teams</h2><p className="mt-2 text-sm text-amber-100">Martin and Stephenville could not be verified right now. No score or game state is being guessed.</p></section>;

  return <section className="mb-10" aria-labelledby="followed-teams-title">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-300"><ShieldCheck className="h-4 w-4" />Verified team center</p><h2 id="followed-teams-title" className="mt-1 text-2xl font-black text-white">Martin & Stephenville</h2><p className="mt-1 text-sm text-gray-400">Your teams first; the statewide scoreboard follows below.</p></div>{data.hasLiveGames && <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white animate-pulse">LIVE NOW</span>}</div>
    <div className="grid gap-4 lg:grid-cols-2">{data.teams.map((team) => <FollowedTeamCard key={team.name} team={team} />)}</div>
  </section>;
}
