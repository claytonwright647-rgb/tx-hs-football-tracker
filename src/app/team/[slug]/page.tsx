import Header from '@/components/Header';
import { POWERHOUSE_TEAMS, CLASSIFICATIONS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Generate static params for powerhouse teams
export function generateStaticParams() {
  return POWERHOUSE_TEAMS.map((team) => ({
    slug: team.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Mock schedule data
const getTeamSchedule = (teamName: string) => [
  { week: 1, opponent: 'Plano East', location: 'Home', result: 'W 42-14' },
  { week: 2, opponent: 'Arlington', location: 'Away', result: 'W 35-21' },
  { week: 3, opponent: 'Euless Trinity', location: 'Home', result: 'W 28-7' },
  { week: 4, opponent: 'Byron Nelson', location: 'Away', result: 'W 49-14' },
  { week: 5, opponent: 'Cedar Hill*', location: 'Home', result: 'W 38-10' },
  { week: 6, opponent: 'Waxahachie*', location: 'Away', result: 'W 45-17' },
  { week: 7, opponent: 'DeSoto*', location: 'Home', result: 'W 21-14' },
  { week: 8, opponent: 'Mansfield*', location: 'Away', result: 'W 52-7' },
  { week: 9, opponent: 'South Grand Prairie*', location: 'Home', result: 'W 42-0' },
  { week: 10, opponent: 'Grand Prairie*', location: 'Away', result: 'W 35-14' },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const teamName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const team = POWERHOUSE_TEAMS.find(
    t => t.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!team) {
    notFound();
  }

  const classInfo = CLASSIFICATIONS.find(c => c.id === team.classification);
  const schedule = getTeamSchedule(team.name);


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className={`rounded-xl ${classInfo?.bgColor} border-2 ${classInfo?.borderColor} p-6 mb-8`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl">
              🏈
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-white">{team.name}</h1>
                <span className={`px-3 py-1 rounded-full ${classInfo?.bgColor} ${classInfo?.textColor} font-bold border ${classInfo?.borderColor}`}>
                  {team.classification}
                </span>
              </div>
              <p className="text-gray-400 text-lg">{team.city}, Texas</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{team.titles}</p>
                  <p className="text-gray-500 text-sm">State Titles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">10-0</p>
                  <p className="text-gray-500 text-sm">Record</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">#1</p>
                  <p className="text-gray-500 text-sm">State Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">2024 Schedule</h2>
            <div className="rounded-xl bg-gray-800/50 border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-gray-700">
                    <th className="px-4 py-3 text-left">Wk</th>
                    <th className="px-4 py-3 text-left">Opponent</th>
                    <th className="px-4 py-3 text-center">Loc</th>
                    <th className="px-4 py-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((game, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50 hover:bg-white/5">
                      <td className="px-4 py-3 text-gray-400">{game.week}</td>
                      <td className="px-4 py-3 text-white">{game.opponent}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{game.location}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        game.result.startsWith('W') ? 'text-green-400' : 'text-red-400'
                      }`}>{game.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-black/20 text-xs text-gray-500">
                * District Game
              </div>
            </div>
          </div>


          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Team Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Classification</span>
                  <span className={`font-semibold ${classInfo?.textColor}`}>{team.classification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Football Type</span>
                  <span className="text-white">{classInfo?.footballType === '6-man' ? 'Six-Man' : '11-Man'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">City</span>
                  <span className="text-white">{team.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">State Titles</span>
                  <span className="text-yellow-400 font-bold">{team.titles}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href={`https://www.maxpreps.com/tx/football/search/?query=${encodeURIComponent(team.name)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="block px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">
                  📊 MaxPreps Profile
                </a>
                <Link href="/standings"
                   className="block px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                  📋 District Standings
                </Link>
                <Link href="/playoffs"
                   className="block px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                  🏆 Playoff Bracket
                </Link>
              </div>
            </div>

            {/* Historical Championships */}
            {team.titles > 0 && (
              <div className="rounded-xl bg-yellow-900/20 border border-yellow-700/30 p-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">🏆 Championship History</h3>
                <p className="text-gray-400 text-sm">
                  {team.name} has won <span className="text-yellow-400 font-bold">{team.titles}</span> state 
                  championship{team.titles > 1 ? 's' : ''}, making them one of the most successful 
                  programs in Texas high school football history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
