// Play-by-Play Event Log Component
// Shows real-time game events with timestamps and impact indicators

'use client';

import { PlayByPlayEvent } from '@/lib/enhancements';

interface PlayByPlayLogProps {
  events: PlayByPlayEvent[];
  maxDisplay?: number;
}

export function PlayByPlayLog({ events, maxDisplay = 8 }: PlayByPlayLogProps) {
  const recentEvents = events.slice(-maxDisplay).reverse();

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-bold text-white">Play-by-Play</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-700">
        {recentEvents.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No plays yet</div>
        ) : (
          recentEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 transition-colors ${
                event.isCritical
                  ? 'bg-orange-500/10 border-l-2 border-orange-500'
                  : 'bg-gray-800/20'
              }`}
            >
              {/* Time and down/distance */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{event.time}</span>
                  {event.down && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-bold">
                      {event.down === 1 ? '1st' : event.down === 2 ? '2nd' : event.down === 3 ? '3rd' : '4th'} & {event.distance}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Q{event.quarter}</span>
              </div>

              {/* Play description */}
              <p className="text-xs text-white leading-relaxed mb-1">{event.description}</p>

              {/* Result and impact */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {event.yards !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      event.yards > 0
                        ? 'bg-green-500/20 text-green-400'
                        : event.yards < 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {event.yards > 0 ? '+' : ''}{event.yards} yds
                    </span>
                  )}
                  
                  {event.type === 'turnover' && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      🔄 TURNOVER
                    </span>
                  )}
                  
                  {event.type === 'score' && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                      🏈 SCORE
                    </span>
                  )}
                  
                  {event.type === 'penalty' && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">
                      ⚠️ PENALTY
                    </span>
                  )}
                </div>

                {event.wpChange !== undefined && (
                  <span className={`text-xs font-bold ${
                    event.wpChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    WP {event.wpChange > 0 ? '+' : ''}{Math.round(event.wpChange * 100)}%
                  </span>
                )}
              </div>

              {/* EPA Display */}
              {event.epa !== undefined && (
                <div className="mt-1">
                  <span className={`text-xs font-mono ${
                    event.epa > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    EPA: {event.epa > 0 ? '+' : ''}{event.epa.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
