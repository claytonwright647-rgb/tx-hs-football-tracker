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

  // Determine winner for completed games
  const homeWon = isFinal && (game.homeScore ?? 0) > (game.awayScore ?? 0);
  const awayWon = isFinal && (game.awayScore ?? 0) > (game.homeScore ?? 0);

  // Format game time
  const formatGameTime = () => {
    if (isLive) {
      if (game.status === 'halftime') return 'HALFTIME';
      return `Q${game.quarter} ${game.timeRemaining}`;
    }
    if (isFinal) return 'FINAL';
    return game.time;
  };


  return (
    <div
      className={`relative rounded-xl bg-gray-800/80 border ${
        isLive ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-gray-700'
      } overflow-hidden transition-all hover:border-gray-600 ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-pulse" />
      )}

      {/* Header - Classification and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${classification?.bgColor} ${classification?.textColor}`}
          >
            {game.classification}{game.division ? `-${game.division}` : ''}
          </span>
          {game.isPlayoff && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-600/30 text-yellow-400">
              {game.playoffRound}
            </span>
          )}
          {game.isDistrictGame && !game.isPlayoff && (
            <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-400">
              District
            </span>
          )}
        </div>

        <div className={`text-sm font-bold ${isLive ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
          {formatGameTime()}
        </div>
      </div>


      {/* Teams */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className={`flex items-center justify-between ${awayWon ? 'text-white' : 'text-gray-300'}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
              {game.awayTeam.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold truncate ${awayWon ? 'text-white' : ''}`}>
                {game.awayTeam.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {game.awayTeam.city} • {game.awayTeam.record}
              </p>
            </div>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${awayWon ? 'text-green-400' : ''}`}>
            {isScheduled ? '' : game.awayScore ?? 0}
          </div>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWon ? 'text-white' : 'text-gray-300'}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
              {game.homeTeam.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold truncate ${homeWon ? 'text-white' : ''}`}>
                {game.homeTeam.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {game.homeTeam.city} • {game.homeTeam.record}
              </p>
            </div>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${homeWon ? 'text-green-400' : ''}`}>
            {isScheduled ? '' : game.homeScore ?? 0}
          </div>
        </div>
      </div>


      {/* Footer - Venue and Date */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 truncate">
            <span>📍</span>
            <span className="truncate">{game.venue}</span>
          </div>
          {isScheduled && (
            <div>{game.date}</div>
          )}
          {game.broadcast && (
            <div className="flex items-center gap-1">
              <span>📺</span>
              <span>{game.broadcast}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
