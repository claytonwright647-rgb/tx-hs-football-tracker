import Header from '@/components/Header';
import ClassificationCard from '@/components/ClassificationCard';
import GameCard from '@/components/GameCard';
import { CLASSIFICATIONS } from '@/lib/constants';
import { Game, Team } from '@/lib/types';

// Mock data for demonstration - will be replaced with API calls
const mockTeams: { [key: string]: Team } = {
  duncanville: {
    id: 'duncanville',
    name: 'Duncanville',
    mascot: 'Panthers',
    city: 'Duncanville',
    school: 'Duncanville High School',
    classification: '6A',
    division: 'I',
    district: '11-6A',
    region: 2,
    record: '14-1',
  },
  northShore: {
    id: 'north-shore',
    name: 'North Shore',
    mascot: 'Mustangs',
    city: 'Houston',
    school: 'North Shore Senior High School',
    classification: '6A',
    division: 'I',
    district: '21-6A',
    region: 3,
    record: '16-0',
  },
  desoto: {
    id: 'desoto',
    name: 'DeSoto',
    mascot: 'Eagles',
    city: 'DeSoto',
    school: 'DeSoto High School',
    classification: '6A',
    division: 'II',
    district: '11-6A',
    region: 2,
    record: '15-1',
  },
  ceKing: {
    id: 'ce-king',
    name: 'C.E. King',
    mascot: 'Panthers',
    city: 'Houston',
    school: 'C.E. King High School',
    classification: '6A',
    division: 'II',
    district: '21-6A',
    region: 3,
    record: '13-3',
  },
  aledo: {
    id: 'aledo',
    name: 'Aledo',
    mascot: 'Bearcats',
    city: 'Aledo',
    school: 'Aledo High School',
    classification: '5A',
    division: 'I',
    district: '3-5A',
    region: 1,
    record: '14-0',
  },
  southOakCliff: {
    id: 'south-oak-cliff',
    name: 'South Oak Cliff',
    mascot: 'Golden Bears',
    city: 'Dallas',
    school: 'South Oak Cliff High School',
    classification: '5A',
    division: 'II',
    district: '6-5A',
    region: 2,
    record: '14-2',
  },
};


const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: mockTeams.duncanville,
    awayTeam: mockTeams.northShore,
    homeScore: 7,
    awayScore: 10,
    status: 'final',
    classification: '6A',
    division: 'I',
    isPlayoff: true,
    playoffRound: 'State Championship',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    date: '2024-12-21',
    time: '2024-12-21T19:00:00',
    broadcast: 'ESPN2',
    isDistrictGame: false,
  },
  {
    id: '2',
    homeTeam: mockTeams.desoto,
    awayTeam: mockTeams.ceKing,
    homeScore: 55,
    awayScore: 27,
    status: 'final',
    classification: '6A',
    division: 'II',
    isPlayoff: true,
    playoffRound: 'State Championship',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    date: '2024-12-21',
    time: '2024-12-21T15:00:00',
    broadcast: 'ESPN',
    isDistrictGame: false,
  },
  {
    id: '3',
    homeTeam: mockTeams.aledo,
    awayTeam: mockTeams.southOakCliff,
    homeScore: 28,
    awayScore: 21,
    status: 'in_progress',
    quarter: 3,
    timeRemaining: '5:42',
    classification: '5A',
    division: 'I',
    isPlayoff: true,
    playoffRound: 'State Semifinals',
    venue: 'Globe Life Field',
    city: 'Arlington',
    date: '2024-12-14',
    time: '2024-12-14T19:00:00',
    broadcast: 'Bally Sports',
    isDistrictGame: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Season Status Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-red-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-orange-400">
                🏆 2024-2025 State Championships Complete!
              </h2>
              <p className="text-gray-400">
                Congratulations to all 12 state champions! 2025-2026 season begins August 2025.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-600/30 text-green-400 rounded-full text-sm font-semibold">
                🎄 Offseason
              </span>
            </div>
          </div>
        </div>

        {/* Classification Cards Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>UIL Classifications</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {CLASSIFICATIONS.map((classification) => (
              <ClassificationCard
                key={classification.id}
                classification={classification}
                gamesThisWeek={Math.floor(Math.random() * 50) + 10}
                liveGames={classification.id === '5A' ? 1 : 0}
              />
            ))}
          </div>
        </section>

        {/* Recent/Featured Games */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🏈</span>
            <span>State Championship Results</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Powerhouse Programs */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Texas Powerhouse Programs</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'Aledo', titles: 12, class: '5A' },
              { name: 'Carthage', titles: 11, class: '4A' },
              { name: 'Katy', titles: 9, class: '6A' },
              { name: 'Southlake Carroll', titles: 8, class: '6A' },
              { name: 'Celina', titles: 8, class: '4A' },
              { name: 'Mart', titles: 8, class: '2A' },
            ].map((team) => (
              <div
                key={team.name}
                className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700 hover:border-orange-500/50 transition-colors"
              >
                <div className="text-lg font-bold text-white">{team.name}</div>
                <div className="text-orange-400 font-semibold">
                  🏆 {team.titles} Titles
                </div>
                <div className="text-gray-500 text-sm">{team.class}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Six-Man Football Info */}
        <section className="mb-10">
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🏈</span>
              <span>Six-Man Football (1A)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">Field Size</div>
                <div className="text-white font-semibold">80 × 40 yards</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">First Down</div>
                <div className="text-white font-semibold">15 yards</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">Field Goal</div>
                <div className="text-white font-semibold">4 points</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">Mercy Rule</div>
                <div className="text-white font-semibold">45+ at half</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-800">
          <p>Texas High School Football Tracker • UIL • TAPPS</p>
          <p className="mt-1">Data sources: MaxPreps, UIL, Dave Campbell&apos;s Texas Football</p>
          <p className="mt-2">
            <a href="https://www.wright-sports.com" className="text-blue-400 hover:underline">
              ← Back to Pro Sports Tracker
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
