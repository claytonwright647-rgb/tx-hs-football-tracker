'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { CLASSIFICATIONS } from '@/lib/constants';

// Mock standings data - Final 2025-2026 standings
const mockStandings: Record<string, Record<string, Array<{
  rank: number; team: string; record: string; districtRecord: string; pf: number; pa: number; streak: string;
}>>> = {
  '6A': {
    'District 11-6A': [
      { rank: 1, team: 'Duncanville', record: '12-1', districtRecord: '8-0', pf: 485, pa: 142, streak: 'W8' },
      { rank: 2, team: 'DeSoto', record: '12-3', districtRecord: '7-1', pf: 412, pa: 178, streak: 'W4' },
      { rank: 3, team: 'Cedar Hill', record: '7-4', districtRecord: '5-3', pf: 298, pa: 245, streak: 'L1' },
      { rank: 4, team: 'Waxahachie', record: '5-6', districtRecord: '4-4', pf: 256, pa: 287, streak: 'L2' },
    ],
    'District 21-6A': [
      { rank: 1, team: 'North Shore', record: '13-2', districtRecord: '8-0', pf: 512, pa: 98, streak: 'W5' },
      { rank: 2, team: 'C.E. King', record: '13-2', districtRecord: '6-2', pf: 456, pa: 189, streak: 'W8' },
      { rank: 3, team: 'Summer Creek', record: '8-4', districtRecord: '5-3', pf: 312, pa: 234, streak: 'L1' },
      { rank: 4, team: 'Beaumont West Brook', record: '6-5', districtRecord: '4-4', pf: 267, pa: 256, streak: 'W1' },
    ],
  },
  '5A': {
    'District 3-5A DI': [
      { rank: 1, team: 'Smithson Valley', record: '15-1', districtRecord: '6-0', pf: 534, pa: 156, streak: 'W12' },
      { rank: 2, team: 'Lone Star', record: '13-2', districtRecord: '5-1', pf: 445, pa: 178, streak: 'L1' },
      { rank: 3, team: 'Denton Ryan', record: '9-3', districtRecord: '4-2', pf: 356, pa: 198, streak: 'W2' },
      { rank: 4, team: 'Grapevine', record: '7-4', districtRecord: '3-3', pf: 289, pa: 245, streak: 'L1' },
    ],
    'District 6-5A DII': [
      { rank: 1, team: 'South Oak Cliff', record: '14-1', districtRecord: '6-0', pf: 498, pa: 134, streak: 'W10' },
      { rank: 2, team: 'Randle', record: '15-1', districtRecord: '5-1', pf: 467, pa: 156, streak: 'L1' },
      { rank: 3, team: 'Kimball', record: '8-3', districtRecord: '4-2', pf: 312, pa: 189, streak: 'W1' },
      { rank: 4, team: 'Seagoville', record: '6-5', districtRecord: '3-3', pf: 245, pa: 267, streak: 'L2' },
    ],
  },
  '4A': {
    'District 5-4A DI': [
      { rank: 1, team: 'Stephenville', record: '15-0', districtRecord: '5-0', pf: 567, pa: 134, streak: 'W15' },
      { rank: 2, team: 'Brownwood', record: '9-3', districtRecord: '4-1', pf: 378, pa: 198, streak: 'L1' },
      { rank: 3, team: 'Glen Rose', record: '7-4', districtRecord: '3-2', pf: 289, pa: 234, streak: 'W2' },
      { rank: 4, team: 'Gatesville', record: '5-6', districtRecord: '2-3', pf: 212, pa: 267, streak: 'L1' },
    ],
    'District 9-4A DI': [
      { rank: 1, team: 'Kilgore', record: '14-1', districtRecord: '5-0', pf: 489, pa: 156, streak: 'L1' },
      { rank: 2, team: 'Henderson', record: '10-2', districtRecord: '4-1', pf: 398, pa: 189, streak: 'W3' },
      { rank: 3, team: 'Chapel Hill', record: '8-4', districtRecord: '3-2', pf: 312, pa: 212, streak: 'L1' },
      { rank: 4, team: 'Palestine', record: '6-5', districtRecord: '2-3', pf: 245, pa: 278, streak: 'W1' },
    ],
    'District 10-4A DII': [
      { rank: 1, team: 'Carthage', record: '15-0', districtRecord: '5-0', pf: 612, pa: 89, streak: 'W15' },
      { rank: 2, team: 'West Orange-Stark', record: '13-2', districtRecord: '4-1', pf: 456, pa: 156, streak: 'L1' },
      { rank: 3, team: 'Jasper', record: '8-4', districtRecord: '3-2', pf: 334, pa: 198, streak: 'L1' },
      { rank: 4, team: 'Silsbee', record: '7-4', districtRecord: '2-3', pf: 289, pa: 234, streak: 'W2' },
    ],
  },
  '3A': {
    'District 13-3A DI': [
      { rank: 1, team: 'Yoakum', record: '13-2', districtRecord: '5-0', pf: 445, pa: 178, streak: 'W8' },
      { rank: 2, team: 'Grandview', record: '13-2', districtRecord: '4-1', pf: 423, pa: 167, streak: 'L1' },
      { rank: 3, team: 'Lorena', record: '9-3', districtRecord: '3-2', pf: 334, pa: 198, streak: 'L1' },
      { rank: 4, team: 'McGregor', record: '7-4', districtRecord: '2-3', pf: 267, pa: 234, streak: 'W1' },
    ],
    'District 7-3A DII': [
      { rank: 1, team: 'Wall', record: '15-0', districtRecord: '4-0', pf: 512, pa: 98, streak: 'W15' },
      { rank: 2, team: 'Sonora', record: '10-2', districtRecord: '3-1', pf: 389, pa: 156, streak: 'L1' },
      { rank: 3, team: 'Brady', record: '7-4', districtRecord: '2-2', pf: 278, pa: 198, streak: 'W2' },
      { rank: 4, team: 'Reagan County', record: '5-6', districtRecord: '1-3', pf: 198, pa: 267, streak: 'L2' },
    ],
    'District 11-3A DII': [
      { rank: 1, team: 'Newton', record: '14-1', districtRecord: '4-0', pf: 489, pa: 112, streak: 'L1' },
      { rank: 2, team: 'Anahuac', record: '10-2', districtRecord: '3-1', pf: 378, pa: 167, streak: 'W4' },
      { rank: 3, team: 'Kirbyville', record: '8-4', districtRecord: '2-2', pf: 289, pa: 198, streak: 'L1' },
      { rank: 4, team: 'Kountze', record: '6-5', districtRecord: '1-3', pf: 212, pa: 234, streak: 'W1' },
    ],
  },
  '2A': {
    'District 12-2A DI': [
      { rank: 1, team: 'Hamilton', record: '13-2', districtRecord: '5-0', pf: 412, pa: 145, streak: 'W9' },
      { rank: 2, team: 'Crawford', record: '11-2', districtRecord: '4-1', pf: 378, pa: 167, streak: 'L1' },
      { rank: 3, team: 'Bosqueville', record: '8-3', districtRecord: '3-2', pf: 289, pa: 198, streak: 'W2' },
      { rank: 4, team: 'Moody', record: '6-5', districtRecord: '2-3', pf: 212, pa: 234, streak: 'L1' },
    ],
    'District 14-2A DI': [
      { rank: 1, team: 'Joaquin', record: '11-4', districtRecord: '4-0', pf: 389, pa: 156, streak: 'L1' },
      { rank: 2, team: 'Tenaha', record: '10-2', districtRecord: '3-1', pf: 356, pa: 145, streak: 'W5' },
      { rank: 3, team: 'Shelbyville', record: '8-4', districtRecord: '2-2', pf: 278, pa: 189, streak: 'L1' },
      { rank: 4, team: 'Garrison', record: '5-6', districtRecord: '1-3', pf: 198, pa: 234, streak: 'L2' },
    ],
    'District 8-2A DII': [
      { rank: 1, team: 'Muenster', record: '13-2', districtRecord: '4-0', pf: 445, pa: 112, streak: 'W10' },
      { rank: 2, team: 'Shiner', record: '15-1', districtRecord: '3-1', pf: 512, pa: 134, streak: 'L1' },
      { rank: 3, team: 'Lindsay', record: '9-3', districtRecord: '2-2', pf: 334, pa: 178, streak: 'W1' },
      { rank: 4, team: 'Era', record: '7-4', districtRecord: '1-3', pf: 267, pa: 212, streak: 'L1' },
    ],
  },
  '1A': {
    'District 7-1A DI (Six-Man)': [
      { rank: 1, team: 'Rankin', record: '12-2', districtRecord: '4-0', pf: 756, pa: 234, streak: 'L1' },
      { rank: 2, team: 'Grandfalls-Royalty', record: '10-2', districtRecord: '3-1', pf: 645, pa: 289, streak: 'W4' },
      { rank: 3, team: 'Sanderson', record: '7-4', districtRecord: '2-2', pf: 512, pa: 345, streak: 'L2' },
      { rank: 4, team: 'Fort Davis', record: '5-6', districtRecord: '1-3', pf: 389, pa: 412, streak: 'W1' },
    ],
    'District 14-1A DI (Six-Man)': [
      { rank: 1, team: 'Gordon', record: '14-0', districtRecord: '4-0', pf: 845, pa: 156, streak: 'W14' },
      { rank: 2, team: 'Strawn', record: '11-2', districtRecord: '3-1', pf: 678, pa: 234, streak: 'L1' },
      { rank: 3, team: 'Moran', record: '8-4', districtRecord: '2-2', pf: 534, pa: 312, streak: 'W2' },
      { rank: 4, team: 'Lueders-Avoca', record: '5-6', districtRecord: '1-3', pf: 389, pa: 423, streak: 'L1' },
    ],
    'District 8-1A DII (Six-Man)': [
      { rank: 1, team: 'Jayton', record: '14-0', districtRecord: '4-0', pf: 912, pa: 178, streak: 'W14' },
      { rank: 2, team: 'Guthrie', record: '10-3', districtRecord: '3-1', pf: 723, pa: 267, streak: 'L1' },
      { rank: 3, team: 'Patton Springs', record: '7-5', districtRecord: '2-2', pf: 556, pa: 345, streak: 'W1' },
      { rank: 4, team: 'Spur', record: '4-7', districtRecord: '1-3', pf: 367, pa: 489, streak: 'L3' },
    ],
    'District 15-1A DII (Six-Man)': [
      { rank: 1, team: 'Richland Springs', record: '12-1', districtRecord: '4-0', pf: 834, pa: 189, streak: 'L1' },
      { rank: 2, team: 'Cherokee', record: '9-3', districtRecord: '3-1', pf: 612, pa: 267, streak: 'W3' },
      { rank: 3, team: 'Mullin', record: '6-5', districtRecord: '2-2', pf: 445, pa: 378, streak: 'L2' },
      { rank: 4, team: 'Zephyr', record: '4-7', districtRecord: '1-3', pf: 312, pa: 456, streak: 'L1' },
    ],
  },
};


export default function StandingsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const classInfo = CLASSIFICATIONS.find(c => c.id === selectedClass);
  const standings = mockStandings[selectedClass] || {};

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">District Standings</h1>
        <p className="text-gray-400 mb-6">Final 2025-2026 Regular Season</p>
        
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
                Top 4 teams qualified for playoffs • Green = advanced, Yellow = eliminated in playoffs
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
