'use client';

import { useEffect, useState } from 'react';
import {
  getCurrentPhase,
  getPhaseConfig,
  getSeasonStatusMessage,
  getDaysUntil,
  getSeasonConfig,
  SeasonPhase,
} from '@/lib/seasonIntelligence';

interface SeasonStatus {
  phase: SeasonPhase;
  displayName: string;
  description: string;
  statusMessage: string;
  daysUntilSeason: number;
  seasonYear: number;
  showCountdown: boolean;
  countdownTarget?: string;
}

export default function SeasonIntelligence() {
  const [status, setStatus] = useState<SeasonStatus | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>('');

  useEffect(() => {
    // Calculate season status
    const phase = getCurrentPhase();
    const phaseConfig = getPhaseConfig(phase);
    const seasonConfig = getSeasonConfig();
    
    setStatus({
      phase,
      displayName: phaseConfig.displayName,
      description: phaseConfig.description,
      statusMessage: getSeasonStatusMessage(),
      daysUntilSeason: getDaysUntil('season_start'),
      seasonYear: seasonConfig.year,
      showCountdown: phaseConfig.showCountdown,
      countdownTarget: phaseConfig.countdownTarget,
    });
  }, []);

  useEffect(() => {
    if (!status?.showCountdown) return;

    const updateCountdown = () => {
      const seasonConfig = getSeasonConfig();
      const targetDate = new Date(seasonConfig.regularSeasonStart + 'T19:00:00'); // 7 PM kickoff
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntil('Season has started!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeUntil(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeUntil(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntil(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status?.showCountdown]);

  if (!status) return null;

  // Phase-specific styling
  const getPhaseColors = (phase: SeasonPhase) => {
    switch (phase) {
      case 'deep_offseason':
        return 'from-gray-800 to-gray-900 border-gray-600';
      case 'schedule_watch':
        return 'from-blue-900 to-gray-900 border-blue-500';
      case 'preseason':
        return 'from-purple-900 to-gray-900 border-purple-500';
      case 'fall_camp':
        return 'from-yellow-900 to-gray-900 border-yellow-500';
      case 'scrimmages':
        return 'from-orange-900 to-gray-900 border-orange-500';
      case 'regular_season':
        return 'from-green-900 to-gray-900 border-green-500';
      case 'playoffs':
        return 'from-red-900 to-gray-900 border-red-500';
      case 'state_championships':
        return 'from-yellow-600 to-orange-900 border-yellow-400';
      case 'postseason':
        return 'from-gray-700 to-gray-900 border-gray-500';
      default:
        return 'from-gray-800 to-gray-900 border-gray-600';
    }
  };

  const getPhaseIcon = (phase: SeasonPhase) => {
    switch (phase) {
      case 'deep_offseason': return '😴';
      case 'schedule_watch': return '👀';
      case 'preseason': return '📋';
      case 'fall_camp': return '🏃';
      case 'scrimmages': return '🎯';
      case 'regular_season': return '🏈';
      case 'playoffs': return '🏆';
      case 'state_championships': return '🏟️';
      case 'postseason': return '🎉';
      default: return '🏈';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getPhaseColors(status.phase)} border rounded-xl p-4 mb-6`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Phase Info */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getPhaseIcon(status.phase)}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{status.displayName}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/80">
                {status.seasonYear} Season
              </span>
            </div>
            <p className="text-sm text-gray-300">{status.statusMessage}</p>
          </div>
        </div>

        {/* Countdown */}
        {status.showCountdown && status.daysUntilSeason > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Until Kickoff</div>
            <div className="text-2xl font-mono font-bold text-white">{timeUntil}</div>
          </div>
        )}

        {/* Live indicator for active phases */}
        {['regular_season', 'playoffs', 'state_championships'].includes(status.phase) && (
          <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-semibold">Games Active</span>
          </div>
        )}
      </div>

      {/* Phase-specific tips */}
      {status.phase === 'schedule_watch' && (
        <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-xs text-blue-300">
            🔍 <strong>Auto-checking:</strong> Looking for {status.seasonYear} schedules from UIL and ESPN. 
            Schedules typically release in June/July.
          </p>
        </div>
      )}

      {status.phase === 'deep_offseason' && (
        <div className="mt-3 p-2 bg-gray-500/10 rounded-lg border border-gray-500/30">
          <p className="text-xs text-gray-400">
            💤 <strong>Offseason mode:</strong> Showing last season&apos;s results. 
            Auto-checking starts June 1 for {status.seasonYear} schedules.
          </p>
        </div>
      )}
    </div>
  );
}
