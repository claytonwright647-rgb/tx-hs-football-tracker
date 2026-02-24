import Header from '@/components/Header';
import ClassificationCard from '@/components/ClassificationCard';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import HeroCountdown from '@/components/HeroCountdown';
import { CLASSIFICATIONS, CURRENT_CHAMPIONS, SEASON_INFO, NEXT_SEASON } from '@/lib/constants';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Season Intelligence Banner */}
        <SeasonIntelligence />

        {/* 2026 Season Kickoff Hero */}
        <div className="mb-8 p-8 rounded-xl bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-indigo-900/40 border border-blue-700/30 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-blue-300 text-xs font-semibold tracking-wider uppercase">Offseason Mode</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
              TEXAS HS FOOTBALL
            </h1>
            <p className="text-xl text-blue-200 font-medium mb-8">
              The road to the 2026 State Championships begins now.
            </p>

            <HeroCountdown targetDate={`${SEASON_INFO.regularSeasonStart}T19:00:00-05:00`} />

            <p className="text-gray-400 text-sm">
              Kickoff set for <span className="text-white font-bold">{new Date(SEASON_INFO.regularSeasonStart).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span> across the Lone Star State.
            </p>
          </div>
        </div>



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
