'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS } from '@/lib/constants';

// Mock standings data
const mockStandings = {
  '6A': {
    'District 11-6A': [
      { rank: 1, team: 'Duncanville', record: '10-0', districtRecord: '8-0', pf: 485, pa: 142, streak: 'W10' },
      { rank: 2, team: 'DeSoto', record: '9-1', districtRecord: '7-1', pf: 412, pa: 178, streak: 'W5' },
      { rank: 3, team: 'Cedar Hill', record: '7-3', districtRecord: '5-3', pf: 298, pa: 245, streak: 'L1' },
      { rank: 4, team: 'Waxahachie', record: '5-5', districtRecord: '4-4', pf: 256, pa: 287, streak: 'W2' },
    ],
    'District 21-6A': [
      { rank: 1, team: 'North Shore', record: '10-0', districtRecord: '8-0', pf: 512, pa: 98, streak: 'W10' },
      { rank: 2, team: 'C.E. King', record: '8-2', districtRecord: '6-2', pf: 378, pa: 189, streak: 'W3' },
      { rank: 3, team: 'Beaumont West Brook', record: '6-4', districtRecord: '4-4', pf: 267, pa: 234, streak: 'L2' },
      { rank: 4, team: 'Beaumont United', record: '4-6', districtRecord: '3-5', pf: 198, pa: 312, streak: 'L1' },
    ],
  },
  '5A': {
    'District 3-5A DI': [
      { rank: 1, team: 'Aledo', record: '10-0', districtRecord: '6-0', pf: 534, pa: 112, streak: 'W10' },
      { rank: 2, team: 'Burleson', record: '7-3', districtRecord: '4-2', pf: 312, pa: 198, streak: 'W1' },
      { rank: 3, team: 'Granbury', record: '5-5', districtRecord: '3-3', pf: 245, pa: 267, streak: 'L2' },
    ],
  },
};

export default function StandingsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const classInfo = CLASSIFICATIONS.find(c => c.id === selectedClass);
  const standings = mockStandings[selectedClass as keyof typeof mockStandings] || {};

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">District Standings</h1>
        
        {/* Classification Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
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


        {/* District Tables */}
        <div className="space-y-8">
          {Object.entries(standings).map(([district, teams]) => (
            <div key={district} className={`rounded-xl ${classInfo?.bgColor} border-2 ${classInfo?.borderColor} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className={`text-xl font-bold ${classInfo?.textColor}`}>{district}</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-700">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-center">Overall</th>
                      <th className="px-4 py-3 text-center">District</th>
                      <th className="px-4 py-3 text-center">PF</th>
                      <th className="px-4 py-3 text-center">PA</th>
                      <th className="px-4 py-3 text-center">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={team.team} className={`border-b border-gray-700/50 hover:bg-white/5 ${idx < 4 ? '' : 'opacity-60'}`}>
                        <td className="px-4 py-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx < 2 ? 'bg-green-600 text-white' : idx < 4 ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {team.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white font-semibold">{team.team}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-white">{team.record}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{team.districtRecord}</td>
                        <td className="px-4 py-3 text-center text-green-400">{team.pf}</td>
                        <td className="px-4 py-3 text-center text-red-400">{team.pa}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            team.streak.startsWith('W') ? 'bg-green-600/30 text-green-400' : 'bg-red-600/30 text-red-400'
                          }`}>
                            {team.streak}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-4 py-2 bg-black/20 text-xs text-gray-500">
                Top 4 teams qualify for playoffs • Green = clinched, Yellow = in contention
              </div>
            </div>
          ))}
        </div>

        {Object.keys(standings).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No standings available for {selectedClass}</p>
          </div>
        )}
      </div>
    </main>
  );
}
