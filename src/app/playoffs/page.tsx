'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS, SEASON_INFO, LAST_SEASON } from '@/lib/constants';

interface BracketGame {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  venue?: string;
  date?: string;
}

// Full playoff bracket data for 2026-2027 season
const bracketData: Record<string, Record<string, BracketGame[][]>> = {
  // Brackets will populate in November 2026
};

const roundNames = ['State Semifinals', 'State Championship'];

// Helper to format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function PlayoffsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const [selectedDiv, setSelectedDiv] = useState('I');

  const classInfo = CLASSIFICATIONS.find(c => c.id === selectedClass);
  const bracket = bracketData[selectedClass]?.[selectedDiv] || [];
  const champion = CURRENT_CHAMPIONS.find(
    c => c.classification === selectedClass && c.division === selectedDiv
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">{LAST_SEASON.displayYear} Playoffs</h1>
        <p className="text-gray-400 mb-6">State Championship Brackets</p>

        {/* Classification & Division Selectors */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedClass(c.id); setSelectedDiv('I'); }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedClass === c.id
                  ? `${c.bgColor} ${c.textColor} ${c.borderColor} border-2`
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['I', 'II'].map((div) => (
              <button
                key={div}
                onClick={() => setSelectedDiv(div)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDiv === div
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                  }`}
              >
                Division {div}
              </button>
            ))}
          </div>
        </div>


        {/* Champion Banner */}
        {champion && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <p className="text-yellow-400 text-sm font-semibold">
                  {selectedClass} Division {selectedDiv} State Champion
                </p>
                <h2 className="text-3xl font-black text-white">{champion.champion}</h2>
                <p className="text-gray-400">
                  defeated {champion.runnerUp} {champion.score && `(${champion.score})`}
                </p>
                {champion.note && (
                  <p className="text-yellow-400/80 text-sm mt-1">{champion.note}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bracket Visualization */}
        {bracket.length > 0 ? (
          <div className={`rounded-xl ${classInfo?.bgColor} border-2 ${classInfo?.borderColor} p-6 overflow-x-auto`}>
            <div className="flex gap-8 min-w-max">
              {bracket.map((round, roundIdx) => (
                <div key={roundIdx} className="flex flex-col">
                  <h3 className="text-center text-gray-400 text-sm font-semibold mb-4">
                    {roundNames[roundIdx] || `Round ${roundIdx + 1}`}
                  </h3>
                  <div className="flex flex-col gap-4 justify-around flex-1">
                    {round.map((game, gameIdx) => (
                      <div
                        key={gameIdx}
                        className="bg-gray-800/80 rounded-lg border border-gray-700 min-w-[260px] overflow-hidden"
                      >
                        {/* Date Header */}
                        {game.date && (
                          <div className="px-3 py-1.5 bg-gray-900/50 border-b border-gray-700 text-center">
                            <span className="text-xs text-gray-400">{formatDate(game.date)}</span>
                          </div>
                        )}

                        {/* Team 1 */}
                        <div className={`flex justify-between items-center px-3 py-2 ${game.winner === game.team1 ? 'bg-green-900/30' : ''
                          }`}>
                          <span className={`truncate ${game.winner === game.team1 ? 'text-white font-bold' : 'text-gray-400'}`}>
                            {game.team1}
                          </span>
                          <span className={`font-bold ${game.winner === game.team1 ? 'text-green-400' : 'text-gray-500'}`}>
                            {game.score1 ?? '-'}
                          </span>
                        </div>

                        <div className="border-t border-gray-700" />

                        {/* Team 2 */}
                        <div className={`flex justify-between items-center px-3 py-2 ${game.winner === game.team2 ? 'bg-green-900/30' : ''
                          }`}>
                          <span className={`truncate ${game.winner === game.team2 ? 'text-white font-bold' : 'text-gray-400'}`}>
                            {game.team2}
                          </span>
                          <span className={`font-bold ${game.winner === game.team2 ? 'text-green-400' : 'text-gray-500'}`}>
                            {game.score2 ?? '-'}
                          </span>
                        </div>

                        {game.venue && (
                          <div className="px-3 py-1 bg-black/30 text-xs text-gray-500 text-center">
                            📍 {game.venue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Champion Display */}
              {champion && (
                <div className="flex flex-col justify-center">
                  <h3 className="text-center text-yellow-400 text-sm font-semibold mb-4">Champion</h3>
                  <div className="bg-yellow-600/20 border-2 border-yellow-500 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-yellow-400 font-bold text-lg">{champion.champion}</div>
                    {champion.titles > 1 && (
                      <div className="text-gray-500 text-xs mt-1">{champion.titles} titles</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">2026 Playoffs</p>
            <p className="text-sm">Brackets will be released in November 2026</p>
          </div>
        )}

        {/* Six-Man Note */}
        {selectedClass === '1A' && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
            <p className="text-yellow-400 text-sm">
              <strong>Six-Man Football:</strong> 1A division plays six-man football with modified rules -
              80×40 yard field, 15 yards for first down, 4-point field goals, and high-scoring games are the norm!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
