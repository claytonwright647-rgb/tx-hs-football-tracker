'use client';

import { Classification } from '@/lib/types';
import { CURRENT_CHAMPIONS } from '@/lib/constants';

interface ClassificationCardProps {
  classification: Classification;
  gamesThisWeek?: number;
  liveGames?: number;
}

export default function ClassificationCard({
  classification,
  gamesThisWeek = 0,
  liveGames = 0,
}: ClassificationCardProps) {
  // Get current champions for this classification
  const champions = CURRENT_CHAMPIONS.filter(
    (c) => c.classification === classification.id
  );

  return (
    <div
      className={`relative rounded-xl ${classification.bgColor} ${classification.borderColor} border-2 p-4 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${classification.glowColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏈</span>
          <div>
            <h3 className={`text-xl font-bold ${classification.textColor}`}>
              {classification.name}
            </h3>
            <p className="text-gray-400 text-xs">
              {classification.footballType === '6-man' ? 'Six-Man' : '11-Man'}
            </p>
          </div>
        </div>
        
        {liveGames > 0 && (
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
            {liveGames} LIVE
          </span>
        )}
      </div>


      {/* Divisions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {classification.divisions.map((div) => {
          const champ = champions.find((c) => c.division === div.split(' ')[1]);
          return (
            <div key={div} className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs">{div}</p>
              {champ && (
                <p className="text-white text-sm font-semibold truncate">
                  🏆 {champ.champion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          This Week: <span className="text-white font-semibold">{gamesThisWeek}</span>
        </span>
        <button className={`${classification.textColor} hover:underline font-semibold`}>
          View All →
        </button>
      </div>
    </div>
  );
}
