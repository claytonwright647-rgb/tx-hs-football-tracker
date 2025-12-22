'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS, SEASON_INFO } from '@/lib/constants';

interface BracketGame {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  venue?: string;
}

// Full playoff bracket data for 2025-2026 season
const bracketData: Record<string, Record<string, BracketGame[][]>> = {
  '6A': {
    'I': [
      // State Semifinals
      [
        { team1: 'North Shore', team2: 'Lake Travis', score1: 28, score2: 21, winner: 'North Shore' },
        { team1: 'Duncanville', team2: 'Allen', score1: 35, score2: 28, winner: 'Duncanville' },
      ],
      // State Championship
      [
        { team1: 'North Shore', team2: 'Duncanville', score1: 10, score2: 7, winner: 'North Shore', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'DeSoto', team2: 'Southlake Carroll', score1: 42, score2: 28, winner: 'DeSoto' },
        { team1: 'C.E. King', team2: 'Vandegrift', score1: 58, score2: 41, winner: 'C.E. King' },
      ],
      [
        { team1: 'DeSoto', team2: 'C.E. King', score1: 55, score2: 27, winner: 'DeSoto', venue: 'AT&T Stadium' },
      ],
    ],
  },
  '5A': {
    'I': [
      [
        { team1: 'Smithson Valley', team2: 'Denton Ryan', score1: 35, score2: 21, winner: 'Smithson Valley' },
        { team1: 'Frisco Lone Star', team2: 'College Station', score1: 28, score2: 14, winner: 'Frisco Lone Star' },
      ],
      [
        { team1: 'Smithson Valley', team2: 'Frisco Lone Star', score1: 28, score2: 6, winner: 'Smithson Valley', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'South Oak Cliff', team2: 'Boerne', score1: 42, score2: 14, winner: 'South Oak Cliff' },
        { team1: 'Richmond Randle', team2: 'Iowa Colony', score1: 35, score2: 21, winner: 'Richmond Randle' },
      ],
      [
        { team1: 'South Oak Cliff', team2: 'Richmond Randle', score1: 35, score2: 19, winner: 'South Oak Cliff', venue: 'AT&T Stadium' },
      ],
    ],
  },
  '4A': {
    'I': [
      [
        { team1: 'Stephenville', team2: 'China Spring', score1: 42, score2: 21, winner: 'Stephenville' },
        { team1: 'Kilgore', team2: 'Celina', score1: 28, score2: 24, winner: 'Kilgore' },
      ],
      [
        { team1: 'Stephenville', team2: 'Kilgore', score1: 35, score2: 21, winner: 'Stephenville', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'Carthage', team2: 'Cuero', score1: 49, score2: 14, winner: 'Carthage' },
        { team1: 'West Orange-Stark', team2: 'Bellville', score1: 35, score2: 28, winner: 'West Orange-Stark' },
      ],
      [
        { team1: 'Carthage', team2: 'West Orange-Stark', score1: 42, score2: 14, winner: 'Carthage', venue: 'AT&T Stadium' },
      ],
    ],
  },
  '3A': {
    'I': [
      [
        { team1: 'Yoakum', team2: 'Columbus', score1: 28, score2: 21, winner: 'Yoakum' },
        { team1: 'Grandview', team2: 'Brock', score1: 35, score2: 28, winner: 'Grandview' },
      ],
      [
        { team1: 'Yoakum', team2: 'Grandview', score1: 24, score2: 21, winner: 'Yoakum', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'Wall', team2: 'Gunter', score1: 35, score2: 21, winner: 'Wall' },
        { team1: 'Newton', team2: 'Franklin', score1: 42, score2: 14, winner: 'Newton' },
      ],
      [
        { team1: 'Wall', team2: 'Newton', score1: 28, score2: 21, winner: 'Wall', venue: 'AT&T Stadium' },
      ],
    ],
  },
  '2A': {
    'I': [
      [
        { team1: 'Hamilton', team2: 'Ganado', score1: 35, score2: 28, winner: 'Hamilton' },
        { team1: 'Joaquin', team2: 'Timpson', score1: 28, score2: 21, winner: 'Joaquin' },
      ],
      [
        { team1: 'Hamilton', team2: 'Joaquin', score1: 42, score2: 28, winner: 'Hamilton', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'Muenster', team2: 'Mart', score1: 35, score2: 14, winner: 'Muenster' },
        { team1: 'Shiner', team2: 'Refugio', score1: 28, score2: 21, winner: 'Shiner' },
      ],
      [
        { team1: 'Muenster', team2: 'Shiner', score1: 35, score2: 28, winner: 'Muenster', venue: 'AT&T Stadium' },
      ],
    ],
  },
  '1A': {
    'I': [
      [
        { team1: 'Gordon', team2: 'Strawn', score1: 72, score2: 36, winner: 'Gordon' },
        { team1: 'Rankin', team2: 'Balmorhea', score1: 64, score2: 42, winner: 'Rankin' },
      ],
      [
        { team1: 'Gordon', team2: 'Rankin', score1: 69, score2: 22, winner: 'Gordon', venue: 'AT&T Stadium' },
      ],
    ],
    'II': [
      [
        { team1: 'Jayton', team2: 'Guthrie', score1: 86, score2: 48, winner: 'Jayton' },
        { team1: 'Richland Springs', team2: 'Cherokee', score1: 72, score2: 52, winner: 'Richland Springs' },
      ],
      [
        { team1: 'Jayton', team2: 'Richland Springs', score1: 94, score2: 52, winner: 'Jayton', venue: 'AT&T Stadium' },
      ],
    ],
  },
};

const roundNames = ['State Semifinals', 'State Championship'];

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
        <h1 className="text-3xl font-bold text-white mb-2">{SEASON_INFO.displayYear} Playoffs</h1>
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
                        className="bg-gray-800/80 rounded-lg border border-gray-700 min-w-[240px] overflow-hidden"
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
                    {champion.titles > 1 && (
                      <div className="text-gray-500 text-xs mt-1">{champion.titles} titles</div>
                    )}
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
