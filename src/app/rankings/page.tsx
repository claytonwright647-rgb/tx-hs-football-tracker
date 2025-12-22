'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS } from '@/lib/constants';

// Mock state rankings data
const mockRankings: Record<string, Array<{
  rank: number;
  team: string;
  city: string;
  record: string;
  points: number;
  prevRank: number;
}>> = {
  '6A': [
    { rank: 1, team: 'North Shore', city: 'Houston', record: '16-0', points: 500, prevRank: 1 },
    { rank: 2, team: 'Duncanville', city: 'Duncanville', record: '15-1', points: 485, prevRank: 2 },
    { rank: 3, team: 'DeSoto', city: 'DeSoto', record: '15-1', points: 470, prevRank: 3 },
    { rank: 4, team: 'Westlake', city: 'Austin', record: '14-2', points: 455, prevRank: 4 },
    { rank: 5, team: 'Southlake Carroll', city: 'Southlake', record: '13-2', points: 440, prevRank: 6 },
    { rank: 6, team: 'Allen', city: 'Allen', record: '12-2', points: 425, prevRank: 5 },
    { rank: 7, team: 'Katy', city: 'Katy', record: '11-2', points: 410, prevRank: 8 },
    { rank: 8, team: 'C.E. King', city: 'Houston', record: '14-2', points: 395, prevRank: 7 },
    { rank: 9, team: 'Lake Travis', city: 'Austin', record: '11-3', points: 380, prevRank: 10 },
    { rank: 10, team: 'Atascocita', city: 'Humble', record: '10-3', points: 365, prevRank: 9 },
  ],
  '5A': [
    { rank: 1, team: 'Aledo', city: 'Aledo', record: '14-0', points: 500, prevRank: 1 },
    { rank: 2, team: 'South Oak Cliff', city: 'Dallas', record: '13-1', points: 485, prevRank: 2 },
    { rank: 3, team: 'Smithson Valley', city: 'Spring Branch', record: '13-1', points: 470, prevRank: 3 },
    { rank: 4, team: 'Lone Star', city: 'Frisco', record: '12-2', points: 455, prevRank: 4 },
    { rank: 5, team: 'Highland Park', city: 'Dallas', record: '11-2', points: 440, prevRank: 5 },
  ],
  '4A': [
    { rank: 1, team: 'Stephenville', city: 'Stephenville', record: '15-0', points: 500, prevRank: 1 },
    { rank: 2, team: 'Carthage', city: 'Carthage', record: '14-1', points: 485, prevRank: 2 },
    { rank: 3, team: 'China Spring', city: 'Waco', record: '13-1', points: 470, prevRank: 3 },
    { rank: 4, team: 'Celina', city: 'Celina', record: '12-2', points: 455, prevRank: 5 },
    { rank: 5, team: 'Kilgore', city: 'Kilgore', record: '12-2', points: 440, prevRank: 4 },
  ],
};


export default function RankingsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const classInfo = CLASSIFICATIONS.find(c => c.id === selectedClass);
  const rankings = mockRankings[selectedClass] || [];

  const getRankChange = (current: number, prev: number) => {
    if (current < prev) return { icon: '▲', color: 'text-green-400', change: prev - current };
    if (current > prev) return { icon: '▼', color: 'text-red-400', change: current - prev };
    return { icon: '–', color: 'text-gray-500', change: 0 };
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">State Rankings</h1>
        <p className="text-gray-400 mb-6">Dave Campbell's Texas Football / MaxPreps</p>
        
        {/* Classification Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
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

        {/* Rankings Table */}
        <div className={`rounded-xl ${classInfo?.bgColor} border-2 ${classInfo?.borderColor} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="px-4 py-3 text-left w-16">Rank</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Record</th>
                  <th className="px-4 py-3 text-center">Points</th>
                  <th className="px-4 py-3 text-center w-20">Chg</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((team) => {
                  const change = getRankChange(team.rank, team.prevRank);
                  return (
                    <tr key={team.team} className="border-b border-gray-700/50 hover:bg-white/5">
                      <td className="px-4 py-4">
                        <span className={`text-2xl font-black ${classInfo?.textColor}`}>
                          {team.rank}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-bold text-lg">{team.team}</p>
                        <p className="text-gray-500 text-sm">{team.city}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-white font-semibold">{team.record}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-400">{team.points}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold ${change.color}`}>
                          {change.icon} {change.change > 0 ? change.change : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Rankings not available for {selectedClass}</p>
          </div>
        )}
      </div>
    </main>
  );
}
