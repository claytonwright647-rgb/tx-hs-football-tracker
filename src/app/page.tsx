import Header from '@/components/Header';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import HeroCountdown from '@/components/HeroCountdown';
import Scoreboard from '@/components/Scoreboard';
import { SEASON_INFO } from '@/lib/constants';
import { getCurrentPhase, getPhaseConfig } from '@/lib/seasonIntelligence';

export default function Home() {
  const currentPhase = getPhaseConfig(getCurrentPhase());
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
              <span className="text-blue-300 text-xs font-semibold tracking-wider uppercase">{currentPhase.displayName}</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
              TEXAS HS FOOTBALL
            </h2>
            <p className="text-xl text-blue-200 font-medium mb-8">
              The road to the 2026 State Championships begins now.
            </p>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Regular season begins in</p>
            <HeroCountdown targetDate={`${SEASON_INFO.regularSeasonStart}T19:00:00-05:00`} />

            <p className="text-gray-400 text-sm">
              First preseason scrimmages: <span className="font-bold text-sky-200">Thursday, August 13</span>. Regular-season kickoff begins <span className="text-white font-bold">{new Date(`${SEASON_INFO.regularSeasonStart}T12:00:00-05:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Chicago' })}</span>.
            </p>
          </div>
        </div>

        <section className="mb-10" aria-labelledby="games-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Official game center</p>
              <h2 id="games-heading" className="text-3xl font-black text-white">Live scores and schedules</h2>
            </div>
            <a href="/scoreboard" className="text-sm font-semibold text-orange-300 hover:text-orange-200">Open full scoreboard →</a>
          </div>
          <Scoreboard />
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
              are worth 4 points, and there&apos;s a 45-point mercy rule. It&apos;s fast-paced, high-scoring Texas football
              at its finest!
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-2">
            Schedule and score data: MaxPreps UIL feed. Season dates and rules: UIL.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://wright-sports.org"
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
