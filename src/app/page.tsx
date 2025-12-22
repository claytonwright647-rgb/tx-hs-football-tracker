import Header from '@/components/Header';
import ClassificationCard from '@/components/ClassificationCard';
import GameCard from '@/components/GameCard';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS, SEASON_INFO } from '@/lib/constants';
import { Game, Team } from '@/lib/types';

// Mock data for demonstration
const mockTeams: Record<string, Team> = {
  northShore: {
    id: 'north-shore',
    name: 'North Shore',
    mascot: 'Mustangs',
    city: 'Houston',
    school: 'North Shore Senior High',
    classification: '6A',
    division: 'I',
    district: '21-6A',
    region: 3,
    record: '16-0',
  },
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
    record: '15-1',
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
    district: '3-5A-I',
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
    district: '6-5A-II',
    region: 2,
    record: '13-2',
  },
};

const mockGames: Game[] = [
  {
    id: 'game-1',
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
    time: '7:00 PM',
    broadcast: 'KFDA / Bally Sports',
    isDistrictGame: false,
  },
  {
    id: 'game-2',
    homeTeam: mockTeams.ceKing,
    awayTeam: mockTeams.desoto,
    homeScore: 27,
    awayScore: 55,
    status: 'final',
    classification: '6A',
    division: 'II',
    isPlayoff: true,
    playoffRound: 'State Championship',
    venue: 'AT&T Stadium',
    city: 'Arlington',
    date: '2024-12-21',
    time: '3:00 PM',
    broadcast: 'Bally Sports',
    isDistrictGame: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Season Status Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-600/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-orange-400">
                🏆 2024-2025 Season Complete!
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                State Championships concluded at {SEASON_INFO.championshipVenue}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-gray-400">State Champs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">1,400+</p>
                <p className="text-xs text-gray-400">Schools</p>
              </div>
            </div>
          </div>
        </div>


        {/* Classification Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏈</span>
            <span>UIL Classifications</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CLASSIFICATIONS.map((classification) => (
              <ClassificationCard
                key={classification.id}
                classification={classification}
                gamesThisWeek={0}
                liveGames={0}
              />
            ))}
          </div>
        </section>

        {/* Recent State Championship Games */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>Recent State Championships</span>
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {mockGames.map((game) => (
              <div key={game.id} className="snap-start">
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </section>


        {/* 2024-2025 State Champions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👑</span>
            <span>2024-2025 State Champions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CURRENT_CHAMPIONS.map((champ) => (
              <div
                key={`${champ.classification}-${champ.division}`}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-yellow-600/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 text-lg">🏆</span>
                  <span className="text-sm font-bold text-gray-400">
                    {champ.classification} D{champ.division}
                  </span>
                </div>
                <p className="text-white font-bold text-lg">{champ.champion}</p>
                <p className="text-gray-500 text-sm">
                  def. {champ.runnerUp} {champ.score && `(${champ.score})`}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* Info Section */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About UIL */}
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📋</span> About UIL Football
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• <strong className="text-white">1,400+</strong> public schools compete</li>
              <li>• <strong className="text-white">6 classifications</strong> (6A largest → 1A smallest)</li>
              <li>• <strong className="text-white">1A plays Six-Man</strong> football (unique rules)</li>
              <li>• <strong className="text-white">12 state champions</strong> crowned annually</li>
              <li>• Championships held at <strong className="text-white">AT&T Stadium</strong></li>
            </ul>
          </div>

          {/* Six-Man Football */}
          <div className="p-6 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>⚡</span> Six-Man Football
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• <strong className="text-yellow-300">80×40 yard</strong> field</li>
              <li>• <strong className="text-yellow-300">15 yards</strong> for first down</li>
              <li>• Field goal = <strong className="text-yellow-300">4 points</strong></li>
              <li>• ALL players eligible as receivers</li>
              <li>• <strong className="text-yellow-300">45-point mercy rule</strong> at halftime</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Texas High School Football Tracker • Data from MaxPreps & UIL
          </p>
          <p className="text-gray-600 text-xs mt-2">
            A companion to{' '}
            <a
              href="https://www.wright-sports.com"
              className="text-blue-400 hover:text-blue-300"
            >
              Wright Sports Dashboard
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
