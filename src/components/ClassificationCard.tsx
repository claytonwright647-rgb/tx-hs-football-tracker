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

      {/* Division Champions */}
      <div className="space-y-2">
        {champions.map((champ) => (
          <div
            key={`${champ.classification}-${champ.division}`}
            className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🏆</span>
              <span className="text-white text-sm font-medium">D{champ.division}</span>
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
          <span className="text-gray-400 text-sm">{gamesThisWeek} games this week</span>
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
