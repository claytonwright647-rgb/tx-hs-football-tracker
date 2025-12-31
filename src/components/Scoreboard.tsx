'use client';

import { useState, useEffect, useCallback } from 'react';
import { CLASSIFICATIONS } from '@/lib/constants';
import { Game, Classification, LiveGame } from '@/lib/types';
import ClassificationCard from './ClassificationCard';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

interface ScoreboardProps {
  selectedClassification?: string;
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

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/games', { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.games) {
        setGames(data.games);
        setLastUpdated(new Date(data.timestamp));
      } else {
        setGames([]);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Failed to load games');
      setGames([]);
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

  // Filter games based on classification
  const filteredGames = activeFilter === 'all' 
    ? games 
    : games.filter(g => g.classification === activeFilter);

  // Count live games per classification
  const getLiveCount = (classId: string) => 
    games.filter(g => g.classification === classId && 
      (g.status === 'in_progress' || g.status === 'halftime')).length;

  const getGamesCount = (classId: string) =>
    games.filter(g => g.classification === classId).length;

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
          <div
            key={classification.id}
            onClick={() => setActiveFilter(
              activeFilter === classification.id ? 'all' : classification.id
            )}
            className="cursor-pointer"
          >
            <ClassificationCard
              classification={classification}
              gamesThisWeek={getGamesCount(classification.id)}
              liveGames={getLiveCount(classification.id)}
            />
          </div>
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
            onClick={fetchGames}
            disabled={loading}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>


      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onClick={() => handleGameClick(game)}
          />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏈</div>
          <p className="text-gray-400 text-lg">No games found for this classification</p>
          <p className="text-gray-500 text-sm mt-2">Check back during the season!</p>
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
          classification: `${selectedGame.classification}${selectedGame.division ? `-${selectedGame.division}` : ''}`,
          situation: (selectedGame as any).situation,
        } : null}
      />
    </div>
  );
}
