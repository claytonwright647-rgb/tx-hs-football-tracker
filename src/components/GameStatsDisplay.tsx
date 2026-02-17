// Enhanced Real-Time Game Stats Display Component
// Shows all live game data in compact format for modal integration

'use client';

import { GameSituation, EnhancedGameStats, InjuryReport } from '@/lib/enhancements';

interface GameStatsDisplayProps {
  situation: GameSituation;
  homeStats: EnhancedGameStats;
  awayStats: EnhancedGameStats;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
}

export function GameStatsDisplay({
  situation,
  homeStats,
  awayStats,
  homeTeam,
  awayTeam,
  homeColor = '#2563eb',
  awayColor = '#dc2626'
}: GameStatsDisplayProps) {
  return (
    <div className="space-y-3">
      {/* Critical Game Situation */}
      {situation.momentumScore !== undefined && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">MOMENTUM</div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm font-bold text-white">{homeTeam}</div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${50 + (situation.momentumScore * 0.5)}%`,
                    backgroundColor: homeColor 
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{awayTeam}</div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-red-500 transition-all duration-300 ml-auto"
                  style={{
                    width: `${50 + ((situation.momentumScore * -1) * 0.5)}%`,
                    backgroundColor: awayColor,
                    marginLeft: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Win Probability Display */}
      {situation.winProbability && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">WIN PROBABILITY</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: homeColor }}>
                {Math.round(situation.winProbability.home * 100)}%
              </div>
              <div className="text-xs text-gray-400">{homeTeam}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: awayColor }}>
                {Math.round(situation.winProbability.away * 100)}%
              </div>
              <div className="text-xs text-gray-400">{awayTeam}</div>
            </div>
          </div>
        </div>
      )}

      {/* Turnover & Penalty Tracker */}
      {(situation.turnoverDifferential !== undefined || situation.penaltyCount) && (
        <div className="grid grid-cols-2 gap-2">
          {situation.turnoverDifferential !== undefined && (
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 text-center">
              <div className="text-xs text-gray-400">TURNOVER DIFF</div>
              <div className={`text-lg font-bold ${
                situation.turnoverDifferential > 0 ? 'text-green-400' : 
                situation.turnoverDifferential < 0 ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {situation.turnoverDifferential > 0 ? '+' : ''}{situation.turnoverDifferential}
              </div>
            </div>
          )}
          {situation.penaltyCount !== undefined && (
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 text-center">
              <div className="text-xs text-gray-400">PENALTIES</div>
              <div className="text-lg font-bold text-yellow-500">{situation.penaltyCount}</div>
            </div>
          )}
        </div>
      )}

      {/* Red Zone Efficiency */}
      {situation.redZoneAttempts && situation.redZoneAttempts.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">RED ZONE EFFICIENCY</div>
          <div className="space-y-2">
            {situation.redZoneAttempts.map((rz, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white">{rz.team}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{rz.scores}/{rz.attempts}</span>
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(rz.scores / rz.attempts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Third Down Conversion Rate */}
      {situation.thirdDownConverts && situation.thirdDownConverts.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">3RD DOWN CONVERSION</div>
          <div className="space-y-2">
            {situation.thirdDownConverts.map((td, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white">{td.team}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{td.converts}/{td.attempts}</span>
                  <span className="text-gray-500 text-xs">
                    ({Math.round((td.converts / td.attempts) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quarterly Scoring Progression */}
      {situation.quarterlyScoring && situation.quarterlyScoring.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">SCORING PROGRESSION</div>
          <div className="space-y-1">
            {situation.quarterlyScoring.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Q{q.quarter}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right w-8 font-bold text-white">{q.homeScore}</div>
                  <span className="text-gray-600">-</span>
                  <div className="text-left w-8 font-bold text-white">{q.awayScore}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offensive Efficiency Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">{homeTeam} YARDS</div>
          <div className="text-lg font-bold text-blue-400">{homeStats.totalOffensiveYards}</div>
          <div className="text-xs text-gray-500">
            {homeStats.passing.yards}P • {homeStats.rushing.yards}R
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">{awayTeam} YARDS</div>
          <div className="text-lg font-bold text-red-400">{awayStats.totalOffensiveYards}</div>
          <div className="text-xs text-gray-500">
            {awayStats.passing.yards}P • {awayStats.rushing.yards}R
          </div>
        </div>
      </div>

      {/* Time of Possession */}
      {(homeStats.timeOfPossession || awayStats.timeOfPossession) && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs font-bold text-gray-400 mb-2">TIME OF POSSESSION</div>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-white font-bold">{homeStats.timeOfPossession || '0:00'}</div>
              <div className="text-xs text-gray-500">{homeTeam}</div>
            </div>
            <div className="w-px h-8 bg-gray-700 mx-2" />
            <div className="text-center flex-1">
              <div className="text-white font-bold">{awayStats.timeOfPossession || '0:00'}</div>
              <div className="text-xs text-gray-500">{awayTeam}</div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Game Stats */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-2">KEY STATS</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500">Sacks:</div>
            <div className="text-white font-bold">{homeStats.sacks} • {awayStats.sacks}</div>
          </div>
          <div>
            <div className="text-gray-500">INT:</div>
            <div className="text-white font-bold">{homeStats.interceptions} • {awayStats.interceptions}</div>
          </div>
          <div>
            <div className="text-gray-500">Penalty Yards:</div>
            <div className="text-white font-bold">{homeStats.penaltyYards || 0} • {awayStats.penaltyYards || 0}</div>
          </div>
          <div>
            <div className="text-gray-500">Tackles:</div>
            <div className="text-white font-bold">{homeStats.tackles} • {awayStats.tackles}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
