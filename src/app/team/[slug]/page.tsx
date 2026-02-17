import Header from '@/components/Header';
import { POWERHOUSE_TEAMS, CLASSIFICATIONS } from '@/lib/constants';
import { firecrawlClient } from '@/lib/firecrawl';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Generate static params for powerhouse teams
export function generateStaticParams() {
  return POWERHOUSE_TEAMS.map((team) => ({
    slug: team.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;

  const team = POWERHOUSE_TEAMS.find(
    t => t.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!team) {
    notFound();
  }

  const classInfo = CLASSIFICATIONS.find(c => c.id === team.classification);

  // --- Firecrawl Integration (Real Data) ---
  const teamUrlName = team.name.toLowerCase().replace(/\s+/g, '-');
  const maxPrepsUrl = `https://www.maxpreps.com/tx/arlington/${teamUrlName}-warriors/football/schedule/`;

  // Real Extraction Attempt
  const extraction = await firecrawlClient.extract<any[]>(maxPrepsUrl, {
    prompt: `Extract the 2026 football schedule for ${team.name}.`,
    schema: {}
  });

  const schedule = extraction.success && extraction.data ? extraction.data : [];
  const error = extraction.error;

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
                  <p className="text-2xl font-bold text-green-400">0-0</p>
                  <p className="text-gray-500 text-sm">2026 Record</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">#--</p>
                  <p className="text-gray-500 text-sm">State Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">2026 Season Schedule</h2>

            {schedule.length > 0 ? (
              <div className="rounded-xl bg-gray-800/50 border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-700">
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Opponent</th>
                      <th className="px-4 py-3 text-center">Loc</th>
                      <th className="px-4 py-3 text-right">Time/Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((game, idx) => (
                      <tr key={idx} className="border-b border-gray-700/50 hover:bg-white/5">
                        <td className="px-4 py-3 text-gray-400">{game.date}</td>
                        <td className="px-4 py-3 text-white">
                          {game.opponent}
                          {game.isDistrict && <span className="ml-2 text-xs text-blue-400 bg-blue-900/30 px-1 rounded">Dist</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">{game.venue}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-300">{game.time || game.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-gray-800/30 border border-gray-700 text-center text-gray-400">
                <p className="mb-2 text-xl">📅 Data Unavailable</p>
                <p className="text-sm mb-4">
                  {error === 'Missing API Key'
                    ? 'System is ready but awaiting data connection.'
                    : 'No 2026 schedule data found.'}
                </p>
                {error === 'Missing API Key' && (
                  <div className="inline-block px-4 py-2 bg-red-900/20 border border-red-800 text-red-400 text-xs rounded">
                    Missing FIRECRAWL_API_KEY
                  </div>
                )}
              </div>
            )}

            {schedule.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>Data source: MaxPreps (Via Firecrawl)</span>
              </div>
            )}
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
