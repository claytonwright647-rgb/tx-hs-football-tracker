'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheckBig, Clock3, Layers3, Radio } from 'lucide-react';
import { CLASSIFICATIONS } from '@/lib/constants';
import { Game, LiveGame } from '@/lib/types';
import ClassificationCard from './ClassificationCard';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

interface ScoreboardProps {
  selectedClassification?: string;
}

interface GamesApiResponse {
  success: boolean;
  games?: Array<Game | LiveGame>;
  timestamp?: string;
  sourceStatus?: string;
  phase?: string;
  message?: string;
  error?: string;
  requestedDate?: string | null;
  scheduleDate?: string | null;
}

function chicagoToday(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftScheduleDate(date: string, amount: number): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + amount);
  return parsed.toISOString().slice(0, 10);
}

function scheduleDateLabel(date: string | null): string {
  if (!date) return 'Finding the next published slate';
  const parsed = new Date(`${date}T12:00:00-06:00`);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  });
}

export default function Scoreboard({ selectedClassification }: ScoreboardProps) {
  const [games, setGames] = useState<(Game | LiveGame)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(selectedClassification || 'all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedGame, setSelectedGame] = useState<Game | LiveGame | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const [browseDate, setBrowseDate] = useState<string | null>(null);
  const [sourceScheduleDate, setSourceScheduleDate] = useState<string | null>(null);

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = browseDate ? `?date=${encodeURIComponent(browseDate)}` : '';
      const response = await fetch(`/api/games${query}`, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
      }
      
      const data = await response.json() as GamesApiResponse;
      
      if (data.success) {
        setGames(data.games || []);
        setLastUpdated(data.timestamp ? new Date(data.timestamp) : new Date());
        setSourceStatus(data.sourceStatus || 'available');
        setPhase(data.phase || null);
        setSourceMessage(data.message || null);
        setSourceScheduleDate(data.scheduleDate || browseDate);
      } else {
        throw new Error(data.error || 'The games source did not return a usable response');
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load games');
      setGames([]);
      setSourceStatus('request_failed');
      setSourceMessage(null);
    } finally {
      setLoading(false);
    }
  }, [browseDate]);

  // Initial fetch
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Auto-refresh for live games (every 30 seconds)
  useEffect(() => {
    const hasLiveGames = games.some(g => 
      g.status === 'in_progress' || g.status === 'halftime'
    );
    
    if (hasLiveGames) {
      const interval = setInterval(fetchGames, 30000);
      return () => clearInterval(interval);
    }
  }, [games, fetchGames]);

  const handleGameClick = (game: Game | LiveGame) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  const hasClassification = (game: Game | LiveGame, classId: string) =>
    game.classification === classId || Boolean(
      game.sourceClassifications?.some((source) => source === classId || source.startsWith(`${classId} `)),
    );

  // Filter games based on classifications published for either participant.
  const filteredGames = activeFilter === 'all' 
    ? games 
    : games.filter(g => hasClassification(g, activeFilter));

  // Count live games per classification
  const getLiveCount = (classId: string) => 
    games.filter(g => hasClassification(g, classId) &&
      (g.status === 'in_progress' || g.status === 'halftime')).length;

  const getGamesCount = (classId: string) =>
    games.filter(g => hasClassification(g, classId)).length;

  // Total live games count
  const totalLiveGames = games.filter(g => 
    g.status === 'in_progress' || g.status === 'halftime'
  ).length;
  const scheduledGames = games.filter((game) => game.status === 'scheduled').length;
  const finalGames = games.filter((game) => game.status === 'final').length;
  const scrimmageGames = games.filter((game) => game.isScrimmage).length;
  const displayScheduleDate = browseDate || sourceScheduleDate;

  const moveSchedule = (amount: number) => {
    if (!displayScheduleDate) return;
    setBrowseDate(shiftScheduleDate(displayScheduleDate, amount));
  };

  const glanceCards = [
    { label: 'Published', value: games.length, detail: 'Unique sourced games', icon: Layers3, color: 'text-orange-300' },
    { label: scrimmageGames > 0 ? 'Scrimmages' : 'Scheduled', value: scheduledGames, detail: scrimmageGames > 0 ? 'Preseason; records unaffected' : 'Kickoffs ahead', icon: Clock3, color: 'text-blue-300' },
    { label: 'Live now', value: totalLiveGames, detail: totalLiveGames ? 'Games in progress' : 'None in progress', icon: Radio, color: totalLiveGames ? 'text-red-300' : 'text-gray-300' },
    { label: 'Final', value: finalGames, detail: 'Completed games', icon: CircleCheckBig, color: 'text-green-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Live Games Banner */}
      {totalLiveGames > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <span className="text-white font-bold text-lg">
              {totalLiveGames} Live Game{totalLiveGames !== 1 ? 's' : ''} Now!
            </span>
          </div>
          <button 
            onClick={fetchGames}
            className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded text-white text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      <section aria-labelledby="schedule-browser-title" className="overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-gray-900 to-gray-950 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-gray-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl bg-orange-500/15 p-2 text-orange-300"><CalendarDays className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-300">
                {browseDate ? 'Selected game date' : 'Next published slate'}
              </p>
              <h2 id="schedule-browser-title" aria-live="polite" className="truncate text-lg font-black text-white sm:text-xl">
                {scheduleDateLabel(displayScheduleDate)}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">MaxPreps UIL schedule · times shown in Central Time</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => moveSchedule(-1)} disabled={!displayScheduleDate || loading} aria-label="Previous schedule date" className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-200 transition hover:border-orange-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setBrowseDate(chicagoToday())} disabled={loading} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-200 transition hover:border-orange-400 hover:text-white disabled:opacity-40">
              Today
            </button>
            {browseDate && (
              <button type="button" onClick={() => setBrowseDate(null)} disabled={loading} className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-500 disabled:opacity-40">
                Next published
              </button>
            )}
            <button type="button" onClick={() => moveSchedule(1)} disabled={!displayScheduleDate || loading} aria-label="Next schedule date" className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-200 transition hover:border-orange-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-gray-800 md:grid-cols-4">
          {glanceCards.map((item) => (
            <div key={item.label} className="bg-gray-950/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.label}</span>
              </div>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{loading ? '—' : item.value}</p>
              <p className="text-[11px] text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {!loading && scrimmageGames > 0 && (
        <div role="note" className="rounded-xl border border-sky-500/30 bg-sky-950/25 px-4 py-3 text-sm text-sky-100">
          <span className="font-bold">Preseason scrimmages:</span> these matchups are practice evaluations before the regular season begins on August 27. Their results do not count in team records.
        </div>
      )}

      {/* Classification Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CLASSIFICATIONS.map((classification) => (
          <button
            type="button"
            key={classification.id}
            onClick={() => setActiveFilter(
              activeFilter === classification.id ? 'all' : classification.id
            )}
            aria-pressed={activeFilter === classification.id}
            className="cursor-pointer rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <ClassificationCard
              classification={classification}
              gamesThisWeek={getGamesCount(classification.id)}
              liveGames={getLiveCount(classification.id)}
            />
          </button>
        ))}
      </div>


      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Showing:</span>
          <span className="font-semibold text-white">
            {activeFilter === 'all' ? 'All Classifications' : `${activeFilter} Games`}
          </span>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              (Clear)
            </button>
          )}
          {lastUpdated && (
            <span className="text-gray-500 text-xs ml-4">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchGames}
            disabled={loading}
            aria-label="Refresh official games"
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-pressed={viewMode === 'cards'}
            className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>


      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <span className="sr-only">Loading official games</span>
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-xl border border-gray-700 bg-gray-800/70" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-500/50 bg-red-950/30 p-6 text-center">
          <p className="text-lg font-semibold text-red-300">The official games feed could not be reached.</p>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
          <button type="button" onClick={fetchGames} className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">
            Retry official feed
          </button>
        </div>
      ) : filteredGames.length > 0 ? (
        <div className={viewMode === 'cards'
          ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'mx-auto grid max-w-4xl grid-cols-1 gap-3'}>
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>
      ) : (
        <div role="status" className="rounded-xl border border-orange-500/30 bg-orange-950/20 px-6 py-12 text-center">
          <div className="mb-4 text-4xl">🏈</div>
          <p className="text-lg font-semibold text-gray-200">
            {sourceStatus === 'not_scheduled_for_current_phase'
              ? 'Live score polling is paused for the current season phase.'
              : activeFilter === 'all'
                ? 'No officially sourced games are available.'
                : `No officially sourced ${activeFilter} games are available.`}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-400">
            {sourceMessage || 'The tracker will populate this scoreboard when an official source publishes scheduled or live games.'}
          </p>
          {phase && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-orange-300">
              Current phase: {phase.replaceAll('_', ' ')}
            </p>
          )}
        </div>
      )}

      {/* Game Detail Modal */}
      <GameDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        game={selectedGame ? {
          homeTeam: selectedGame.homeTeam.name,
          awayTeam: selectedGame.awayTeam.name,
          homeScore: selectedGame.homeScore,
          awayScore: selectedGame.awayScore,
          homeAbbrev: selectedGame.homeTeam.name.substring(0, 3).toUpperCase(),
          awayAbbrev: selectedGame.awayTeam.name.substring(0, 3).toUpperCase(),
          homeColor: selectedGame.homeTeam.colors?.primary?.replace('#', ''),
          awayColor: selectedGame.awayTeam.colors?.primary?.replace('#', ''),
          status: selectedGame.status === 'in_progress' || selectedGame.status === 'halftime' ? 'in' 
            : selectedGame.status === 'final' ? 'final' : 'scheduled',
          venue: selectedGame.venue,
          date: selectedGame.date,
          time: selectedGame.time,
          hasPublishedTime: selectedGame.hasPublishedTime,
          isScrimmage: selectedGame.isScrimmage,
          classification: selectedGame.sourceClassifications?.join(' · ')
            || `${selectedGame.classification}${selectedGame.division ? `-${selectedGame.division}` : ''}`,
          id: selectedGame.id,
          situation: (selectedGame as LiveGame).situation,
        } : null}
      />
    </div>
  );
}
