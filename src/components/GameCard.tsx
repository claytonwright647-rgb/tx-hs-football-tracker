'use client';

import { Game } from '@/lib/types';
import { CLASSIFICATIONS } from '@/lib/constants';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const classification = CLASSIFICATIONS.find((c) => c.id === game.classification);
  const isLive = game.status === 'in_progress' || game.status === 'halftime';
  const isFinal = game.status === 'final';

  // Format game time
  const formatGameTime = () => {
    if (isFinal) return 'FINAL';
    if (game.status === 'halftime') return 'HALFTIME';
    if (isLive && game.quarter && game.timeRemaining) {
      return `Q${game.quarter} ${game.timeRemaining}`;
    }
    return game.time;
  };

  // Get winner styling
  const getTeamStyle = (isHome: boolean) => {
    if (!isFinal) return '';
    const teamScore = isHome ? game.homeScore : game.awayScore;
    const oppScore = isHome ? game.awayScore : game.homeScore;
    if (teamScore !== undefined && oppScore !== undefined) {
      return teamScore > oppScore ? 'font-bold' : 'text-gray-500';
    }
    return '';
  };


  return (
    <div
      className={`relative rounded-xl bg-gray-800/80 border ${
        isLive ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-gray-700'
      } overflow-hidden transition-all hover:scale-[1.02] min-w-[300px] max-w-[350px]`}
    >
      {/* Top bar with classification */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 ${
          classification?.bgColor || 'bg-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${classification?.textColor || 'text-gray-300'}`}>
            {game.classification}
            {game.division && `-${game.division}`}
          </span>
          {game.isPlayoff && game.playoffRound && (
            <span className="text-xs text-yellow-400 font-medium">
              {game.playoffRound}
            </span>
          )}
        </div>
        
        {isLive && (
          <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        
        {game.isDistrictGame && !game.isPlayoff && (
          <span className="text-xs text-gray-400">District</span>
        )}
      </div>


      {/* Game content */}
      <div className="p-4 space-y-3">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
              🏈
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-white truncate ${getTeamStyle(false)}`}>
                {game.awayTeam.name}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {game.awayTeam.mascot} • {game.awayTeam.record}
              </p>
            </div>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${getTeamStyle(false)} ${
            isFinal ? '' : 'text-white'
          }`}>
            {game.awayScore ?? '-'}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
              🏈
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-white truncate ${getTeamStyle(true)}`}>
                {game.homeTeam.name}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {game.homeTeam.mascot} • {game.homeTeam.record}
              </p>
            </div>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${getTeamStyle(true)} ${
            isFinal ? '' : 'text-white'
          }`}>
            {game.homeScore ?? '-'}
          </span>
        </div>
      </div>


      {/* Bottom bar - Date, Time and Venue */}
      <div className="px-4 py-2 bg-black/30 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {game.date && (
              <span className="text-gray-400">
                {new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            <span className={`font-semibold ${
              isLive ? 'text-red-400' : isFinal ? 'text-gray-400' : 'text-green-400'
            }`}>
              {formatGameTime()}
            </span>
          </div>
          <span className="text-gray-500 truncate max-w-[150px]">
            📍 {game.venue}
          </span>
        </div>
        {game.broadcast && (
          <div className="mt-1 text-xs text-gray-500">
            📺 {game.broadcast}
          </div>
        )}
      </div>
    </div>
  );
}
