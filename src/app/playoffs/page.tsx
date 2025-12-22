'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS } from '@/lib/constants';

interface BracketGame {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  venue?: string;
}

// Full playoff bracket data for 6A-DI (2024-2025)
const bracketData: Record<string, Record<string, BracketGame[][]>> = {
  '6A': {
    'I': [
      // Regional Finals (4 games)
      [
        { team1: 'North Shore', team2: 'Atascocita', score1: 42, score2: 21, winner: 'North Shore' },
        { team1: 'C.E. King', team2: 'Summer Creek', score1: 28, score2: 35, winner: 'Summer Creek' },
        { team1: 'Duncanville', team2: 'Southlake Carroll', score1: 35, score2: 28, winner: 'Duncanville' },
        { team1: 'Allen', team2: 'Westlake', score1: 21, score2: 28, winner: 'Westlake' },
      ],
      // State Semifinals (2 games)
      [
        { team1: 'North Shore', team2: 'Summer Creek', score1: 42, score2: 14, winner: 'North Shore' },
        { team1: 'Duncanville', team2: 'Westlake', score1: 35, score2: 21, winner: 'Duncanville' },
      ],
      // State Championship (1 game)
      [
        { team1: 'North Shore', team2: 'Duncanville', score1: 10, score2: 7, winner: 'North Shore', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'DeSoto', team2: 'South Grand Prairie', score1: 45, score2: 14, winner: 'DeSoto' },
        { team1: 'Vandegrift', team2: 'Westwood', score1: 28, score2: 21, winner: 'Vandegrift' },
        { team1: 'C.E. King', team2: 'Pearland', score1: 35, score2: 28, winner: 'C.E. King' },
        { team1: 'Jersey Village', team2: 'Cy-Fair', score1: 21, score2: 14, winner: 'Jersey Village' },
      ],
      [
        { team1: 'DeSoto', team2: 'Vandegrift', score1: 42, score2: 21, winner: 'DeSoto' },
        { team1: 'C.E. King', team2: 'Jersey Village', score1: 38, score2: 14, winner: 'C.E. King' },
      ],
      [
        { team1: 'DeSoto', team2: 'C.E. King', score1: 55, score2: 27, winner: 'DeSoto', venue: 'AT&T Stadium' },
      ],
    ],
  },
};

const roundNames = ['Regional Finals', 'State Semifinals', 'State Championship'];


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
        <h1 className="text-3xl font-bold text-white mb-2">2024-2025 Playoffs</h1>
        <p className="text-gray-400 mb-6">State Championship Brackets</p>
        
        {/* Classification & Division Selectors */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedClass(c.id); setSelectedDiv('I'); }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedClass === c.id
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
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedDiv === div
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
                        className="bg-gray-800/80 rounded-lg border border-gray-700 min-w-[220px] overflow-hidden"
                      >
                        {/* Team 1 */}
                        <div className={`flex justify-between items-center px-3 py-2 ${
                          game.winner === game.team1 ? 'bg-green-900/30' : ''
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
                        <div className={`flex justify-between items-center px-3 py-2 ${
                          game.winner === game.team2 ? 'bg-green-900/30' : ''
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
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Bracket data not available for {selectedClass} Division {selectedDiv}</p>
          </div>
        )}
      </div>
    </main>
  );
}
