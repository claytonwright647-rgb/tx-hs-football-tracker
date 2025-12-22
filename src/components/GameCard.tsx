'use client';

import { Game } from '@/lib/types';
import { CLASSIFICATIONS } from '@/lib/constants';

interface GameCardProps {
  game: Game;
  compact?: boolean;
}

export default function GameCard({ game, compact = false }: GameCardProps) {
  const classification = CLASSIFICATIONS.find((c) => c.id === game.classification);
  const isLive = game.status === 'in_progress' || game.status === 'halftime';
  const isFinal = game.status === 'final';
  const isScheduled = game.status === 'scheduled';

  // Determine winner
  const homeWins = isFinal && (game.homeScore ?? 0) > (game.awayScore ?? 0);
  const awayWins = isFinal && (game.awayScore ?? 0) > (game.homeScore ?? 0);

  // Format game time
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      });
    } catch {
      return timeStr;
    }
  };


  return (
    <div
      className={`relative rounded-xl bg-gray-800/80 border ${
        isLive
          ? 'border-red-500 shadow-lg shadow-red-500/20'
          : classification?.borderColor || 'border-gray-700'
      } overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl`}
    >
      {/* Top Badge Row */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {/* Classification Badge */}
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              classification?.bgColor || 'bg-gray-700'
            } ${classification?.textColor || 'text-gray-300'}`}
          >
            {game.classification}
            {game.division && `-${game.division}`}
          </span>
          
          {/* Playoff Badge */}
          {game.isPlayoff && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-600/30 text-yellow-400">
              🏆 {game.playoffRound}
            </span>
          )}
          
          {/* District Badge */}
          {game.isDistrictGame && !game.isPlayoff && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-600/30 text-purple-400">
              District
            </span>
          )}
        </div>


        {/* Status Indicator */}
        <div>
          {isLive && (
            <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {game.status === 'halftime' ? 'HALF' : `Q${game.quarter}`}
              {game.timeRemaining && ` • ${game.timeRemaining}`}
            </span>
          )}
          {isFinal && (
            <span className="text-gray-400 text-xs font-semibold">FINAL</span>
          )}
          {isScheduled && (
            <span className="text-gray-400 text-xs">
              {formatTime(game.time)} CST
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-3 space-y-2">
        {/* Away Team */}
        <div className={`flex items-center justify-between ${awayWins ? 'text-white' : 'text-gray-400'}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl">🏈</span>
            <div className="min-w-0 flex-1">
              <div className={`font-bold truncate ${awayWins ? 'text-white' : ''}`}>
                {game.awayTeam.name}
              </div>
              <div className="text-xs text-gray-500">{game.awayTeam.record}</div>
            </div>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${awayWins ? 'text-white' : ''}`}>
            {game.awayScore ?? '-'}
          </div>
        </div>


        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWins ? 'text-white' : 'text-gray-400'}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl">🏠</span>
            <div className="min-w-0 flex-1">
              <div className={`font-bold truncate ${homeWins ? 'text-white' : ''}`}>
                {game.homeTeam.name}
              </div>
              <div className="text-xs text-gray-500">{game.homeTeam.record}</div>
            </div>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${homeWins ? 'text-white' : ''}`}>
            {game.homeScore ?? '-'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-black/30 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <div className="truncate">
          📍 {game.venue}, {game.city}
        </div>
        {game.broadcast && (
          <div className="flex-shrink-0 ml-2">
            📺 {game.broadcast}
          </div>
        )}
      </div>
    </div>
  );
}
