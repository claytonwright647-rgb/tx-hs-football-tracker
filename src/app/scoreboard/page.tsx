'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import { CLASSIFICATIONS } from '@/lib/constants';
import { Game } from '@/lib/types';

// Mock games data - comprehensive set
const allGames: Game[] = [
  // 6A Games
  {
    id: '6a-1',
    homeTeam: { id: 'duncanville', name: 'Duncanville', mascot: 'Panthers', city: 'Duncanville', school: 'Duncanville HS', classification: '6A', district: '11-6A', region: 2, record: '15-1' },
    awayTeam: { id: 'north-shore', name: 'North Shore', mascot: 'Mustangs', city: 'Houston', school: 'North Shore HS', classification: '6A', district: '21-6A', region: 3, record: '16-0' },
    homeScore: 7, awayScore: 10, status: 'final', classification: '6A', division: 'I', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-21', time: '7:00 PM', isDistrictGame: false,
  },
  {
    id: '6a-2',
    homeTeam: { id: 'ce-king', name: 'C.E. King', mascot: 'Panthers', city: 'Houston', school: 'C.E. King HS', classification: '6A', district: '21-6A', region: 3, record: '14-2' },
    awayTeam: { id: 'desoto', name: 'DeSoto', mascot: 'Eagles', city: 'DeSoto', school: 'DeSoto HS', classification: '6A', district: '11-6A', region: 2, record: '15-1' },
    homeScore: 27, awayScore: 55, status: 'final', classification: '6A', division: 'II', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-21', time: '3:00 PM', isDistrictGame: false,
  },
  // 5A Games
  {
    id: '5a-1',
    homeTeam: { id: 'aledo', name: 'Aledo', mascot: 'Bearcats', city: 'Aledo', school: 'Aledo HS', classification: '5A', district: '3-5A', region: 1, record: '14-0' },
    awayTeam: { id: 'soc', name: 'South Oak Cliff', mascot: 'Golden Bears', city: 'Dallas', school: 'South Oak Cliff HS', classification: '5A', district: '6-5A', region: 2, record: '13-2' },
    homeScore: 21, awayScore: 35, status: 'final', classification: '5A', division: 'II', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-20', time: '7:00 PM', isDistrictGame: false,
  },
  // 4A Games
  {
    id: '4a-1',
    homeTeam: { id: 'kilgore', name: 'Kilgore', mascot: 'Bulldogs', city: 'Kilgore', school: 'Kilgore HS', classification: '4A', district: '9-4A', region: 2, record: '13-2' },
    awayTeam: { id: 'stephenville', name: 'Stephenville', mascot: 'Yellow Jackets', city: 'Stephenville', school: 'Stephenville HS', classification: '4A', district: '5-4A', region: 1, record: '15-0' },
    homeScore: 21, awayScore: 35, status: 'final', classification: '4A', division: 'I', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-20', time: '3:00 PM', isDistrictGame: false,
  },
  {
    id: '4a-2',
    homeTeam: { id: 'brock', name: 'Brock', mascot: 'Eagles', city: 'Brock', school: 'Brock HS', classification: '4A', district: '6-4A', region: 1, record: '14-1' },
    awayTeam: { id: 'carthage', name: 'Carthage', mascot: 'Bulldogs', city: 'Carthage', school: 'Carthage HS', classification: '4A', district: '10-4A', region: 2, record: '14-1' },
    homeScore: 14, awayScore: 35, status: 'final', classification: '4A', division: 'II', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-19', time: '7:00 PM', isDistrictGame: false,
  },
  // 1A Six-Man Games
  {
    id: '1a-1',
    homeTeam: { id: 'rankin', name: 'Rankin', mascot: 'Red Devils', city: 'Rankin', school: 'Rankin HS', classification: '1A', district: '7-1A', region: 1, record: '12-2' },
    awayTeam: { id: 'gordon', name: 'Gordon', mascot: 'Longhorns', city: 'Gordon', school: 'Gordon HS', classification: '1A', district: '14-1A', region: 2, record: '14-0' },
    homeScore: 22, awayScore: 69, status: 'final', classification: '1A', division: 'I', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-18', time: '11:00 AM', isDistrictGame: false,
  },
  {
    id: '1a-2',
    homeTeam: { id: 'richland-springs', name: 'Richland Springs', mascot: 'Coyotes', city: 'Richland Springs', school: 'Richland Springs HS', classification: '1A', district: '15-1A', region: 2, record: '11-3' },
    awayTeam: { id: 'jayton', name: 'Jayton', mascot: 'Jaybirds', city: 'Jayton', school: 'Jayton HS', classification: '1A', district: '8-1A', region: 1, record: '13-1' },
    homeScore: 42, awayScore: 52, status: 'final', classification: '1A', division: 'II', isPlayoff: true, playoffRound: 'State Championship',
    venue: 'AT&T Stadium', city: 'Arlington', date: '2024-12-18', time: '2:00 PM', isDistrictGame: false,
  },
];

type FilterType = 'all' | 'live' | 'final' | 'upcoming';

export default function ScoreboardPage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [games, setGames] = useState<Game[]>(allGames);

  // Filter games
  useEffect(() => {
    let filtered = [...allGames];
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(g => g.classification === selectedClass);
    }
    
    if (statusFilter === 'live') {
      filtered = filtered.filter(g => g.status === 'in_progress' || g.status === 'halftime');
    } else if (statusFilter === 'final') {
      filtered = filtered.filter(g => g.status === 'final');
    } else if (statusFilter === 'upcoming') {
      filtered = filtered.filter(g => g.status === 'scheduled');
    }
    
    setGames(filtered);
  }, [selectedClass, statusFilter]);

  const liveCount = allGames.filter(g => g.status === 'in_progress' || g.status === 'halftime').length;


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Scoreboard</h1>
            <p className="text-gray-400">State Championship Week</p>
          </div>
          {liveCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/30 border border-red-500 rounded-lg">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold">{liveCount} LIVE</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Classification Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedClass === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              All Classes
            </button>
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedClass === c.id
                    ? `${c.bgColor} ${c.textColor} ${c.borderColor} border-2`
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 ml-auto">
            {(['all', 'live', 'final', 'upcoming'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  statusFilter === filter
                    ? filter === 'live' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {filter === 'live' ? '🔴 Live' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>


        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏈</div>
            <p className="text-gray-400 text-xl">No games match your filters</p>
            <p className="text-gray-500 mt-2">Try adjusting your classification or status filter</p>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex flex-wrap gap-8 justify-center text-center">
            <div>
              <p className="text-3xl font-bold text-white">{allGames.length}</p>
              <p className="text-gray-400 text-sm">Total Games</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{liveCount}</p>
              <p className="text-gray-400 text-sm">Live Now</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">
                {allGames.filter(g => g.status === 'final').length}
              </p>
              <p className="text-gray-400 text-sm">Final</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">
                {allGames.filter(g => g.status === 'scheduled').length}
              </p>
              <p className="text-gray-400 text-sm">Upcoming</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
