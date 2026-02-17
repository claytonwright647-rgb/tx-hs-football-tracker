// Analytics & Predictions Components
// ELO rankings, win probability, playoff predictions

'use client';

interface ELORankingProps {
  teams: Array<{
    name: string;
    rating: number;
    change?: number;
    wins: number;
    losses: number;
    color?: string;
  }>;
  maxDisplay?: number;
}

export function ELORankings({ teams, maxDisplay = 10 }: ELORankingProps) {
  const sortedTeams = [...teams].sort((a, b) => b.rating - a.rating).slice(0, maxDisplay);

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-bold text-white">ELO RANKINGS</h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {sortedTeams.map((team, idx) => (
          <div key={team.name} className="p-3 hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-gray-500 w-6 text-center">{idx + 1}</span>
                <div className="w-2 h-6 rounded" style={{ backgroundColor: team.color || '#666' }} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white truncate">{team.name}</div>
                  <div className="text-xs text-gray-500">{team.wins}W-{team.losses}L</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">{Math.round(team.rating)}</div>
                {team.change !== undefined && (
                  <div className={`text-xs font-bold ${
                    team.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {team.change > 0 ? '↑' : '↓'} {Math.abs(team.change).toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PowerRankingProps {
  teams: Array<{
    rank: number;
    name: string;
    wins: number;
    losses: number;
    pointDiff: number;
    trend: 'up' | 'down' | 'stable';
    reasoning: string;
    color?: string;
  }>;
}

export function PowerRankings({ teams }: PowerRankingProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-bold text-white">POWER RANKINGS</h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {teams.slice(0, 8).map((team) => (
          <div key={team.name} className="p-3 hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{team.rank}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-6 rounded" style={{ backgroundColor: team.color || '#666' }} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{team.name}</h4>
                    <p className="text-xs text-gray-500">{team.wins}W-{team.losses}L</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    team.trend === 'up' ? 'text-green-400' : 
                    team.trend === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {team.trend === 'up' ? '↑' : team.trend === 'down' ? '↓' : '→'}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400">{team.reasoning}</p>
                
                <div className="mt-1 text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded ${
                    team.pointDiff > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {team.pointDiff > 0 ? '+' : ''}{team.pointDiff} PT DIFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlayoffScenarioProps {
  scenarios: Array<{
    scenario: string;
    probability: number;
    seed?: number;
    description: string;
  }>;
}

export function PlayoffScenarios({ scenarios }: PlayoffScenarioProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-bold text-white">PLAYOFF SCENARIOS</h3>
      </div>
      
      <div className="space-y-2 p-3">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">{scenario.scenario}</h4>
              <div className="text-lg font-bold text-blue-400">
                {Math.round(scenario.probability * 100)}%
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${scenario.probability * 100}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-2">{scenario.description}</p>
            
            {scenario.seed && (
              <div className="mt-2 text-xs">
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  Seed #{scenario.seed}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StrengthOfScheduleProps {
  team: string;
  currentSOS: number;
  remainingSOS: number;
  upcomingOpponents: Array<{
    opponent: string;
    rank: number;
    eloRating: number;
  }>;
}

export function StrengthOfSchedule({ team, currentSOS, remainingSOS, upcomingOpponents }: StrengthOfScheduleProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="text-sm font-bold text-white">{team} - STRENGTH OF SCHEDULE</h3>
      </div>
      
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <div className="text-xs text-gray-400 mb-1">COMPLETED SOS</div>
            <div className="text-2xl font-bold text-blue-400">{currentSOS.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Opponent Win %</div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 text-center">
            <div className="text-xs text-gray-400 mb-1">REMAINING SOS</div>
            <div className="text-2xl font-bold text-orange-400">{remainingSOS.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Projected</div>
          </div>
        </div>
        
        <div>
          <div className="text-xs font-bold text-gray-400 mb-2">UPCOMING OPPONENTS</div>
          <div className="space-y-1">
            {upcomingOpponents.slice(0, 5).map((opp, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded border border-gray-700/50">
                <span className="text-white font-bold">#{opp.rank} {opp.opponent}</span>
                <span className="text-gray-400">ELO: {Math.round(opp.eloRating)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SeasonProjectionProps {
  team: string;
  currentWins: number;
  currentLosses: number;
  projectedWins: number;
  projectedLosses: number;
  pace: string;
  remainingGames: number;
}

export function SeasonProjection({
  team,
  currentWins,
  currentLosses,
  projectedWins,
  projectedLosses,
  pace,
  remainingGames
}: SeasonProjectionProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3">
      <h3 className="text-sm font-bold text-white mb-3">{team} - SEASON PROJECTION</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-400">CURRENT RECORD</div>
            <div className="text-xl font-bold text-white mt-1">
              {currentWins}-{currentLosses}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400">PROJECTED RECORD</div>
            <div className="text-xl font-bold text-green-400 mt-1">
              {projectedWins}-{projectedLosses}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-700/50 text-center">
          <div className="text-xs text-gray-400">WIN PACE</div>
          <div className="text-lg font-bold text-blue-400 mt-1">{pace}</div>
          <div className="text-xs text-gray-500 mt-1">{remainingGames} games remaining</div>
        </div>
      </div>
    </div>
  );
}
