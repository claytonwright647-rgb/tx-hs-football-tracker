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

      {/* Divisions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {classification.divisions.map((division) => {
          const champ = champions.find((c) => c.division === division.split(' ')[1]);
          return (
            <div
              key={division}
              className="bg-black/30 rounded-lg p-2 text-center"
            >
              <div className="text-gray-400 text-xs">{division}</div>
              {champ && (
                <div className="text-white text-sm font-semibold truncate">
                  🏆 {champ.champion}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="flex justify-between text-sm">
        <div className="text-gray-400">
          <span className="text-white font-semibold">{gamesThisWeek}</span> games this week
        </div>
        <button className={`${classification.textColor} hover:underline font-semibold`}>
          View All →
        </button>
      </div>
    </div>
  );
}

      {/* Division Champions */}
      <div className="space-y-2">
        {champions.map((champ) => (
          <div
            key={`${champ.classification}-${champ.division}`}
            className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🏆</span>
              <span className="text-white text-sm font-medium">
                D{champ.division}
              </span>
            </div>
            <span className="text-gray-300 text-sm truncate max-w-[120px]">
              {champ.champion}
            </span>
          </div>
        ))}
      </div>

      {/* Games This Week */}
      {gamesThisWeek > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-gray-400 text-sm">
            {gamesThisWeek} games this week
          </span>
        </div>
      )}

      {/* Decorative element */}
      <div
        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10"
        style={{ backgroundColor: classification.color }}
      />
    </div>
  );
}
