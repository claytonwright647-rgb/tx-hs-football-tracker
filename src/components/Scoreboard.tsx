'use client';

import { useState } from 'react';
import { CLASSIFICATIONS } from '@/lib/constants';
import { Game, Classification } from '@/lib/types';
import ClassificationCard from './ClassificationCard';
import GameCard from './GameCard';

// Mock data for demonstration
const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: {
      id: 'duncanville',
      name: 'Duncanville',
      mascot: 'Panthers',
      city: 'Duncanville',
      school: 'Duncanville High School',
      classification: '6A',
      district: '11-6A',
      region: 2,
      record: '14-1',
    },
    awayTeam: {
      id: 'north-shore',
      name: 'North Shore',
      mascot: 'Mustangs',
      city: 'Houston',
      school: 'North Shore Senior High School',
      classification: '6A',
      district: '21-6A',
      region: 3,
      record: '15-0',
    },
    homeScore: 7,
    awayScore: 10,
    status: 'final',
    classification: '6A',
    division: 'I',
    isPlayoff: true,
    playoffRound: 'State Championship',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    date: '12/21/24',
    time: '3:00 PM',
    isDistrictGame: false,
  },
  {
    id: '2',
    homeTeam: {
      id: 'desoto',
      name: 'DeSoto',
      mascot: 'Eagles',
      city: 'DeSoto',
      school: 'DeSoto High School',
      classification: '6A',
      district: '11-6A',
      region: 2,
      record: '15-0',
    },
    awayTeam: {
      id: 'ce-king',
      name: 'C.E. King',
      mascot: 'Panthers',
      city: 'Houston',
      school: 'C.E. King High School',
      classification: '6A',
      district: '21-6A',
      region: 3,
      record: '13-2',
    },
    homeScore: 55,
    awayScore: 27,
    status: 'final',
    classification: '6A',
    division: 'II',
    isPlayoff: true,
    playoffRound: 'State Championship',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    date: '12/21/24',
    time: '7:00 PM',
    isDistrictGame: false,
  },
  {
    id: '3',
    homeTeam: {
      id: 'aledo',
      name: 'Aledo',
      mascot: 'Bearcats',
      city: 'Aledo',
      school: 'Aledo High School',
      classification: '5A',
      district: '3-5A',
      region: 1,
      record: '13-1',
    },
    awayTeam: {
      id: 'south-oak-cliff',
      name: 'South Oak Cliff',
      mascot: 'Golden Bears',
      city: 'Dallas',
      school: 'South Oak Cliff High School',
      classification: '5A',
      district: '6-5A',
      region: 2,
      record: '14-0',
    },
    homeScore: 21,
    awayScore: 28,
    status: 'in_progress',
    quarter: 3,
    timeRemaining: '8:42',
    classification: '5A',
    division: 'II',
    isPlayoff: true,
    playoffRound: 'State Semifinal',
    venue: 'Globe Life Field',
    city: 'Arlington',
    date: '12/21/24',
    time: '2:00 PM',
    isDistrictGame: false,
  },
];

interface ScoreboardProps {
  selectedClassification?: string;
}

export default function Scoreboard({ selectedClassification }: ScoreboardProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Filter games based on classification
  const filteredGames = activeFilter === 'all' 
    ? mockGames 
    : mockGames.filter(g => g.classification === activeFilter);

  // Count live games per classification
  const getLiveCount = (classId: string) => 
    mockGames.filter(g => g.classification === classId && 
      (g.status === 'in_progress' || g.status === 'halftime')).length;

  const getGamesCount = (classId: string) =>
    mockGames.filter(g => g.classification === classId).length;

  return (
    <div className="space-y-6">
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
        </div>
        
        <div className="flex items-center gap-2">
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
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏈</div>
          <p className="text-gray-400 text-lg">No games found for this classification</p>
          <p className="text-gray-500 text-sm mt-2">Check back during the season!</p>
        </div>
      )}
    </div>
  );
}
