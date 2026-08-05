'use client';

// Football Field Visualization for Texas HS Football
// Shows live game situation with ball position, down & distance, yard lines

interface FootballFieldProps {
  situation?: {
    down?: number;
    distance?: number;
    yardLine?: number;
    yardsToEndzone?: number;
    possession?: string;
    possessionLogo?: string;
    isRedZone?: boolean;
    downDistanceText?: string;
    possessionText?: string;
    lastPlayText?: string;
    lastPlayType?: string;
  };
  homeTeam?: { abbreviation: string; color?: string; name?: string };
  awayTeam?: { abbreviation: string; color?: string; name?: string };
  format?: 'eleven-man' | 'six-man';
}

export function FootballField({ situation, homeTeam, awayTeam, format = 'eleven-man' }: FootballFieldProps) {
  const fieldLength = format === 'six-man' ? 80 : 100;
  const standardFirstDownDistance = format === 'six-man' ? 15 : 10;
  const down = Number(situation?.down);
  const distance = Number(situation?.distance);
  const yardsToEndzone = Number(situation?.yardsToEndzone);
  const possession = situation?.possession?.trim() || '';
  const possessionKey = possession.toLowerCase();
  const isTeamMatch = (team?: FootballFieldProps['homeTeam']) => Boolean(team && [team.abbreviation, team.name]
    .filter(Boolean)
    .some((label) => String(label).trim().toLowerCase() === possessionKey));
  const possessionSide = isTeamMatch(homeTeam) ? 'home' : isTeamMatch(awayTeam) ? 'away' : null;
  const hasLiveData = Boolean(
    possessionSide &&
    Number.isInteger(down) && down >= 1 && down <= 4 &&
    Number.isFinite(distance) && distance >= 0 && distance <= fieldLength &&
    Number.isFinite(yardsToEndzone) && yardsToEndzone >= 0 && yardsToEndzone <= fieldLength
  );
  const isRedZone = hasLiveData && (situation?.isRedZone === true || yardsToEndzone <= 20);
  
  // Calculate ball position on the field (0-100%)
  // Official yards-to-end-zone is scaled against the applicable 100- or 80-yard field.
  const yardsToPercent = (yards: number) => (yards / fieldLength) * 100;
  const ballPositionPercent = possessionSide === 'away'
    ? 100 - yardsToPercent(yardsToEndzone)
    : yardsToPercent(yardsToEndzone);
  
  // First down marker position
  const firstDownPercent = possessionSide === 'away'
    ? Math.min(ballPositionPercent + yardsToPercent(distance), 100)
    : Math.max(ballPositionPercent - yardsToPercent(distance), 0);
  const yardLines = Array.from(
    { length: (fieldLength / 5) - 1 },
    (_, index) => (index + 1) * 5
  );

  return (
    <div className="w-full">
      {/* Current Situation Header */}
      <div className="text-center mb-3 bg-gray-800 rounded-lg p-3">
        {hasLiveData ? (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {situation?.possessionLogo && (
              <img src={situation.possessionLogo} alt="" className="w-8 h-8 object-contain" />
            )}
            <div>
              <div className="text-xl font-bold text-orange-500">
                {situation?.downDistanceText || `${down === 1 ? '1st' : down === 2 ? '2nd' : down === 3 ? '3rd' : '4th'} & ${distance}`}
              </div>
              <div className="text-sm text-gray-400">
                {possession} • {yardsToEndzone} yards to end zone
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                {format === 'six-man'
                  ? `Six-man · ${fieldLength}-yard field · ${standardFirstDownDistance} yards for a first down`
                  : 'Eleven-man · 100-yard field'}
              </div>
            </div>
            {isRedZone && (
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔴 RED ZONE
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">Field position unavailable — no complete official live situation</span>
        )}
      </div>
      
      {/* Field Container */}
      <div className="relative w-full h-32 bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
        {/* End Zones */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[10%] flex items-center justify-center"
          style={{ backgroundColor: awayTeam?.color ? `#${awayTeam.color}` : '#dc2626' }}
        >
          <span className="text-white text-xs font-bold tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            {awayTeam?.abbreviation || 'AWAY'}
          </span>
        </div>
        <div 
          className="absolute right-0 top-0 bottom-0 w-[10%] flex items-center justify-center"
          style={{ backgroundColor: homeTeam?.color ? `#${homeTeam.color}` : '#2563eb' }}
        >
          <span className="text-white text-xs font-bold tracking-wider" style={{ writingMode: 'vertical-rl' }}>
            {homeTeam?.abbreviation || 'HOME'}
          </span>
        </div>
        
        {/* Playing Field (80% of width between end zones) */}
        <div className="absolute left-[10%] right-[10%] top-0 bottom-0">
          {/* Yard lines - every 5 yards with numbers */}
          {yardLines.map((yard) => {
            const leftPercent = yardsToPercent(yard);
            const midfield = fieldLength / 2;
            const displayYard = yard <= midfield ? yard : fieldLength - yard;
            
            return (
              <div key={yard} className="absolute top-0 bottom-0" style={{ left: `${leftPercent}%` }}>
                <div className="w-0.5 h-full bg-white/50" />
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-white/80 font-bold">
                  {displayYard}
                </span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/80 font-bold">
                  {displayYard}
                </span>
              </div>
            );
          })}
          
          {/* Hash marks */}
          <div className="absolute left-0 right-0 top-[30%] h-px bg-white/30" />
          <div className="absolute left-0 right-0 top-[70%] h-px bg-white/30" />
          
          {/* Red Zone Shading */}
          <div className="absolute top-0 bottom-0 left-0 bg-red-500/15" style={{ width: '20%' }} />
          <div className="absolute top-0 bottom-0 right-0 bg-red-500/15" style={{ width: '20%' }} />
          
          {hasLiveData && (
            <>
              {/* First Down Marker (Yellow) */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 shadow-lg"
                style={{ 
                  left: `${Math.max(0, Math.min(100, firstDownPercent))}%`,
                  boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)'
                }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[8px] font-bold px-1 rounded-b">
                  1ST
                </div>
              </div>
              
              {/* Line of Scrimmage (Blue) */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400"
                style={{ 
                  left: `${Math.max(0, Math.min(100, ballPositionPercent))}%`,
                  boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                }}
              />
              
              {/* Football with possession indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                style={{ left: `${Math.max(5, Math.min(95, ballPositionPercent))}%` }}
              >
                <div className="text-2xl drop-shadow-lg">🏈</div>
                <span className="text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded font-bold mt-0.5 whitespace-nowrap">
                  {possession}
                </span>
              </div>
            </>
          )}

        </div>
      </div>
      
      {/* Legend */}
      {hasLiveData && <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-1 bg-cyan-400 rounded" /> Line of Scrimmage
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1 bg-yellow-400 rounded" /> First Down
        </span>
        <span className="flex items-center gap-1">
          🏈 Ball Position
        </span>
      </div>}
    </div>
  );
}
