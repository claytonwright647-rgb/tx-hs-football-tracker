'use client';

import { Clock3, MapPin, Radio, Tv } from 'lucide-react';
import { CLASSIFICATIONS } from '@/lib/constants';
import type { Game, LiveGame } from '@/lib/types';

interface GameCardProps {
  game: Game | LiveGame;
  onClick?: () => void;
}

function gameState(game: Game | LiveGame) {
  const live = game.status === 'in_progress' || game.status === 'halftime';
  const final = game.status === 'final';

  if (game.status === 'halftime') return { live, final, label: 'HALFTIME' };
  if (live) {
    const detail = game.quarter && game.timeRemaining
      ? `Q${game.quarter} · ${game.timeRemaining}`
      : 'LIVE';
    return { live, final, label: detail };
  }
  if (final) return { live, final, label: 'FINAL' };
  if (game.status === 'postponed') return { live, final, label: 'POSTPONED' };
  if (game.status === 'cancelled') return { live, final, label: 'CANCELLED' };
  if (game.isScrimmage) return { live, final, label: 'SCRIMMAGE' };
  return { live, final, label: 'SCHEDULED' };
}

function score(value: number | undefined, showScore: boolean) {
  return showScore && typeof value === 'number' ? value : '—';
}

function scheduleLine(game: Game | LiveGame, showScore: boolean) {
  const raw = game.time || game.date;
  const hasPublishedTime = game.hasPublishedTime === true;
  const parsed = raw ? new Date(hasPublishedTime ? raw : `${game.date}T12:00:00-05:00`) : null;
  const formatted = parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: showScore || !hasPublishedTime ? undefined : 'numeric',
        minute: showScore || !hasPublishedTime ? undefined : '2-digit',
        timeZone: 'America/Chicago',
        timeZoneName: showScore || !hasPublishedTime ? undefined : 'short',
      })
    : game.date;
  if (!formatted) return 'Schedule time unavailable';
  return !showScore && !hasPublishedTime ? `${formatted} · Time TBA` : formatted;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const classification = CLASSIFICATIONS.find((item) => item.id === game.classification);
  const classificationLabel = game.sourceClassifications?.join(' · ')
    || `${game.classification}${game.division ? ` ${game.division.replace('Division ', 'D')}` : ''}`;
  const state = gameState(game);
  const showScore = state.live || state.final;
  const situation = (game as LiveGame).situation;
  const possession = situation?.possession;
  const downDistance = situation?.down && situation?.distance
    ? `${situation.down}${situation.down === 1 ? 'st' : situation.down === 2 ? 'nd' : situation.down === 3 ? 'rd' : 'th'} & ${situation.distance}`
    : null;
  const accessibleState = showScore
    ? `${state.label}. ${game.awayTeam.name} ${score(game.awayScore, true)}, ${game.homeTeam.name} ${score(game.homeScore, true)}.`
    : `${state.label}. ${game.awayTeam.name} at ${game.homeTeam.name}. ${scheduleLine(game, false)}.`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-2xl border bg-gray-900 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-orange-950/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-950 ${
        state.live ? 'border-red-500/70 shadow-red-950/30' : 'border-gray-700'
      }`}
      aria-label={`${accessibleState} Open game details.`}
    >
      <div className="flex min-h-11 items-center justify-between border-b border-gray-800 bg-gray-950/70 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-[11px] font-black uppercase tracking-wider ${classification?.bgColor || 'bg-orange-950/40'} ${classification?.textColor || 'text-orange-300'}`}>
            {classificationLabel}
          </span>
          {game.isPlayoff && (
            <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-yellow-300">
              {game.playoffRound || 'Playoffs'}
            </span>
          )}
          {game.isScrimmage && (
            <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-sky-300">
              Preseason
            </span>
          )}
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 text-xs font-black tracking-wide ${state.live ? 'text-red-400' : state.final ? 'text-gray-300' : 'text-orange-300'}`}>
          {state.live && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
          {state.label}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-widest text-gray-500">Away</p>
            <p className="truncate text-lg font-bold text-white">{game.awayTeam.name}</p>
          </div>
          <span className="min-w-10 text-right text-3xl font-black tabular-nums text-white">
            {score(game.awayScore, showScore)}
          </span>
        </div>

        <div className="h-px bg-gray-800" />

        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-widest text-gray-500">Home</p>
            <p className="truncate text-lg font-bold text-white">{game.homeTeam.name}</p>
          </div>
          <span className="min-w-10 text-right text-3xl font-black tabular-nums text-white">
            {score(game.homeScore, showScore)}
          </span>
        </div>

        {state.live && (possession || downDistance || situation?.lastPlay) && (
          <div className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs text-gray-300">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-red-300">
              <span className="flex items-center gap-1"><Radio className="h-3.5 w-3.5" /> Live situation</span>
              {possession && <span>{possession} ball</span>}
              {downDistance && <span>{downDistance}</span>}
            </div>
            {situation?.lastPlay && <p className="mt-1 line-clamp-2 text-gray-400">{situation.lastPlay}</p>}
          </div>
        )}

        {state.live && !(possession || downDistance || situation?.lastPlay) && (
          <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 px-3 py-2 text-xs text-sky-200">
            Live score only — detailed clock, possession, field position, and play-by-play are unavailable from the current source.
          </div>
        )}

        <div className="space-y-1.5 border-t border-gray-800 pt-3 text-xs text-gray-400">
          <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-orange-400" /> {scheduleLine(game, showScore)}</p>
          <p className="flex items-center gap-2"><MapPin className={`h-3.5 w-3.5 ${game.venue || game.city ? 'text-orange-400' : 'text-gray-600'}`} /> <span className="truncate">{game.venue || game.city ? [game.venue, game.city].filter(Boolean).join(' · ') : 'Venue not published by source'}</span></p>
          {game.broadcast && <p className="flex items-center gap-2"><Tv className="h-3.5 w-3.5 text-orange-400" /> {game.broadcast}</p>}
        </div>
      </div>
    </button>
  );
}
