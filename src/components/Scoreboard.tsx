'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/games', { cache: 'no-store' });
      
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
  }, []);

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
          classification: selectedGame.sourceClassifications?.join(' · ')
            || `${selectedGame.classification}${selectedGame.division ? `-${selectedGame.division}` : ''}`,
          id: selectedGame.id,
          situation: (selectedGame as LiveGame).situation,
        } : null}
      />
    </div>
  );
}
