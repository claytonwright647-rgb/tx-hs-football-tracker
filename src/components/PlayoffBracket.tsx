'use client';

import { useState } from 'react';
import { CLASSIFICATIONS, PLAYOFF_ROUNDS } from '@/lib/constants';

interface BracketGame {
  id: string;
  team1: { name: string; seed?: number; score?: number };
  team2: { name: string; seed?: number; score?: number };
  winner?: string;
  status: 'upcoming' | 'live' | 'final';
}

interface PlayoffBracketProps {
  classification: string;
  division: string;
}

// Mock playoff data
const mockBracketData: Record<string, BracketGame[][]> = {
  '6A-I': [
    // State Semifinals
    [
      { id: '1', team1: { name: 'North Shore', seed: 1, score: 35 }, team2: { name: 'Westlake', seed: 4, score: 14 }, winner: 'North Shore', status: 'final' },
      { id: '2', team1: { name: 'Duncanville', seed: 2, score: 28 }, team2: { name: 'Allen', seed: 3, score: 21 }, winner: 'Duncanville', status: 'final' },
    ],
    // State Championship
    [
      { id: '3', team1: { name: 'North Shore', seed: 1, score: 10 }, team2: { name: 'Duncanville', seed: 2, score: 7 }, winner: 'North Shore', status: 'final' },
    ],
  ],
};


export default function PlayoffBracket({ classification, division }: PlayoffBracketProps) {
  const classInfo = CLASSIFICATIONS.find(c => c.id === classification);
  const bracketKey = `${classification}-${division}`;
  const bracketData = mockBracketData[bracketKey] || [];

  const renderGame = (game: BracketGame) => {
    const isLive = game.status === 'live';
    const isFinal = game.status === 'final';
    
    return (
      <div
        key={game.id}
        className={`rounded-lg border ${isLive ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-gray-700'} bg-gray-800/80 p-3 min-w-[200px]`}
      >
        {/* Team 1 */}
        <div className={`flex justify-between items-center py-1 ${game.winner === game.team1.name ? 'text-white font-semibold' : 'text-gray-400'}`}>
          <div className="flex items-center gap-2">
            {game.team1.seed && <span className="text-xs text-gray-500">#{game.team1.seed}</span>}
            <span className="truncate">{game.team1.name}</span>
          </div>
          <span className={`font-bold ${game.winner === game.team1.name ? 'text-green-400' : ''}`}>
            {game.team1.score ?? '-'}
          </span>
        </div>
        
        <div className="border-t border-gray-700 my-1" />
        
        {/* Team 2 */}
        <div className={`flex justify-between items-center py-1 ${game.winner === game.team2.name ? 'text-white font-semibold' : 'text-gray-400'}`}>
          <div className="flex items-center gap-2">
            {game.team2.seed && <span className="text-xs text-gray-500">#{game.team2.seed}</span>}
            <span className="truncate">{game.team2.name}</span>
          </div>
          <span className={`font-bold ${game.winner === game.team2.name ? 'text-green-400' : ''}`}>
            {game.team2.score ?? '-'}
          </span>
        </div>

        {/* Status */}
        <div className={`text-xs text-center mt-2 ${isLive ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
          {isLive ? '🔴 LIVE' : isFinal ? 'FINAL' : 'Upcoming'}
        </div>
      </div>
    );
  };


  return (
    <div className={`rounded-xl ${classInfo?.bgColor} ${classInfo?.borderColor} border-2 p-6`}>
      <h3 className={`text-xl font-bold ${classInfo?.textColor} mb-4`}>
        {classification} Division {division} Playoffs
      </h3>

      {bracketData.length > 0 ? (
        <div className="flex gap-8 overflow-x-auto pb-4">
          {bracketData.map((round, roundIndex) => (
            <div key={roundIndex} className="flex flex-col gap-4">
              <h4 className="text-gray-400 text-sm font-semibold text-center">
                {roundIndex === bracketData.length - 1 ? 'Championship' : `Round ${roundIndex + 1}`}
              </h4>
              <div className="flex flex-col gap-4 justify-center" style={{ minHeight: round.length > 1 ? '200px' : 'auto' }}>
                {round.map((game) => renderGame(game))}
              </div>
            </div>
          ))}
          
          {/* Champion */}
          {bracketData[bracketData.length - 1]?.[0]?.winner && (
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-gray-400 text-sm font-semibold mb-2">🏆 Champion</h4>
              <div className="bg-yellow-600/30 border-2 border-yellow-500 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-yellow-400 font-bold text-lg">
                  {bracketData[bracketData.length - 1][0].winner}
                </div>
                <div className="text-gray-400 text-sm">State Champions</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Bracket data coming soon</p>
        </div>
      )}
    </div>
  );
}
