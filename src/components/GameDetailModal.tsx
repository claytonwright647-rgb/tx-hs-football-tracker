'use client';

import { X } from 'lucide-react';
import { FootballField } from './fields';

interface GameDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    homeAbbrev?: string;
    awayAbbrev?: string;
    homeColor?: string;
    awayColor?: string;
    status?: string;
    venue?: string;
    date?: string;
    time?: string;
    classification?: string;
    // Live game situation (when available)
    situation?: {
      down?: number;
      distance?: number;
      yardLine?: number;
      yardsToEndzone?: number;
      possession?: string;
      isRedZone?: boolean;
      downDistanceText?: string;
    };
  } | null;
}

export default function GameDetailModal({ isOpen, onClose, game }: GameDetailModalProps) {
  if (!isOpen || !game) return null;

  const isLive = game.status === 'in' || game.status === 'live';
  const isFinal = game.status === 'final' || game.status === 'post';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/20 to-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-orange-600/20 text-orange-500 px-2 py-1 rounded">
              {game.classification || 'TX HS Football'}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {isFinal && (
              <span className="text-xs text-gray-400">FINAL</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Score Section */}
        <div className="p-6 bg-gray-800/30">
          {/* Venue */}
          {game.venue && (
            <div className="text-center text-sm text-gray-400 mb-4">
              🏟️ {game.venue}
            </div>
          )}
          
          {/* Teams & Score */}
          <div className="flex items-center justify-center gap-8">
            {/* Away Team */}
            <div className="text-center">
              <div className="text-lg font-bold text-white">{game.awayTeam}</div>
              <div className="text-xs text-gray-500">{game.awayAbbrev}</div>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-white">
                {game.awayScore ?? '-'}
              </span>
              <span className="text-2xl text-gray-600">-</span>
              <span className="text-5xl font-bold text-white">
                {game.homeScore ?? '-'}
              </span>
            </div>
            
            {/* Home Team */}
            <div className="text-center">
              <div className="text-lg font-bold text-white">{game.homeTeam}</div>
              <div className="text-xs text-gray-500">{game.homeAbbrev}</div>
            </div>
          </div>

          {/* Game Time/Date for upcoming */}
          {!isLive && !isFinal && game.date && (
            <div className="text-center mt-4 text-sm text-gray-400">
              📅 {game.date} {game.time && `• ${game.time}`}
            </div>
          )}
        </div>

        {/* Football Field Visualization */}
        <div className="p-4 border-t border-gray-700">
          <FootballField
            situation={game.situation}
            homeTeam={{
              abbreviation: game.homeAbbrev || game.homeTeam.substring(0, 3).toUpperCase(),
              color: game.homeColor,
              name: game.homeTeam
            }}
            awayTeam={{
              abbreviation: game.awayAbbrev || game.awayTeam.substring(0, 3).toUpperCase(),
              color: game.awayColor,
              name: game.awayTeam
            }}
          />
        </div>

        {/* Info Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-center text-xs text-gray-500">
            {isLive 
              ? 'Live game data updates automatically' 
              : isFinal 
                ? 'Game completed' 
                : 'Field visualization will show live data when game starts'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
