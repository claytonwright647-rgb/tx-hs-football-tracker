import Header from '@/components/Header';
import ClassificationCard from '@/components/ClassificationCard';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS, SEASON_INFO, NEXT_SEASON } from '@/lib/constants';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Season Intelligence Banner */}
        <SeasonIntelligence />

        {/* Season Complete Banner */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 border border-yellow-600/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <span className="text-4xl">🏆</span>
                <h2 className="text-2xl md:text-3xl font-black text-yellow-400">
                  {SEASON_INFO.displayYear} Season Complete!
                </h2>
              </div>
              <p className="text-gray-400">
                State Championships concluded December 17-20, 2025 at {SEASON_INFO.championshipVenue}
              </p>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-xs text-gray-400">State Champs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">1,400+</p>
                <p className="text-xs text-gray-400">Schools</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">4</p>
                <p className="text-xs text-gray-400">First-Time Champs</p>
              </div>
            </div>
          </div>
        </div>


        {/* 2025-2026 State Champions - HERO SECTION */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👑</span>
            <span>{SEASON_INFO.displayYear} State Champions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CURRENT_CHAMPIONS.map((champ) => (
              <div
                key={`${champ.classification}-${champ.division}`}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-yellow-600/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 text-xl">🏆</span>
                  <span className="text-sm font-bold text-gray-400">
                    {champ.classification} D{champ.division}
                  </span>
                </div>
                <p className="text-white font-bold text-lg">{champ.champion}</p>
                <p className="text-gray-500 text-sm">
                  def. {champ.runnerUp} {champ.score && `(${champ.score})`}
                </p>
                {champ.note && (
                  <p className="text-yellow-400/80 text-xs mt-1 font-medium">{champ.note}</p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                  <span className="text-gray-500 text-xs">
                    {new Date(champ.date + 'T00:00:00').toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {champ.titles > 1 && (
                    <span className="text-gray-600 text-xs">{champ.titles} titles</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

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


        {/* Season Highlights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Season Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/30">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-white font-bold mb-1">Gordon's Three-Peat</h3>
              <p className="text-gray-400 text-sm">Gordon HS won their third straight 1A-DI Six-Man title, months after a tornado destroyed their facilities.</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-700/30">
              <div className="text-3xl mb-2">👑</div>
              <h3 className="text-white font-bold mb-1">SOC Dynasty</h3>
              <p className="text-gray-400 text-sm">South Oak Cliff reached their 5th straight title game, winning 3 championships. Coach Jason Todd made history.</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-700/30">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="text-white font-bold mb-1">Four First-Timers</h3>
              <p className="text-gray-400 text-sm">Yoakum, Wall, Hamilton, and Jayton all won their first state championships in program history.</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700/30">
              <div className="text-3xl mb-2">🏟️</div>
              <h3 className="text-white font-bold mb-1">North Shore vs Duncanville III</h3>
              <p className="text-gray-400 text-sm">North Shore edged Duncanville 10-7 in another classic 6A-DI showdown at AT&T Stadium.</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-700/30">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-white font-bold mb-1">Carthage Perfection</h3>
              <p className="text-gray-400 text-sm">Carthage remains undefeated in state championship games, adding their 11th title under legendary coach Scott Surratt.</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-700/30">
              <div className="text-3xl mb-2">🐝</div>
              <h3 className="text-white font-bold mb-1">Stephenville's 7th</h3>
              <p className="text-gray-400 text-sm">The Yellow Jackets captured their 7th state title, cementing their place among Texas football royalty.</p>
            </div>
          </div>
        </section>


        {/* Info Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">About UIL Football</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The University Interscholastic League (UIL) is the governing body for public school athletics in Texas. 
              With over 1,400 member schools competing across 6 classifications, Texas high school football is one of 
              the largest and most competitive in the nation. The season runs from late August through mid-December, 
              culminating in state championship games at AT&T Stadium in Arlington.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Six-Man Football</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Six-man football is played by smaller schools in rural Texas. The game features a smaller field 
              (80×40 yards), 15 yards for a first down, and all players are eligible receivers. Field goals 
              are worth 4 points, and there's a 45-point mercy rule. It's fast-paced, high-scoring Texas football 
              at its finest!
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-2">
            Data sourced from UIL, MaxPreps, and Dave Campbell's Texas Football
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://www.wright-sports.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Pro Sports Tracker →
            </a>
            <span className="text-gray-700">|</span>
            <a 
              href="https://www.uiltexas.org/football" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              UIL Football
            </a>
            <span className="text-gray-700">|</span>
            <a 
              href="https://www.maxpreps.com/tx/football/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              MaxPreps Texas
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
