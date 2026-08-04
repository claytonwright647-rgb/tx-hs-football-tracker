import Header from '@/components/Header';
import Scoreboard from '@/components/Scoreboard';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import { getCurrentSeasonYear } from '@/lib/seasonIntelligence';

export default function ScoreboardPage() {
  const seasonYear = getCurrentSeasonYear();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <SeasonIntelligence />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{seasonYear} Scoreboard</h1>
          <p className="mt-1 text-gray-400">
            Officially sourced live, scheduled, and final games. Missing feeds are labeled instead of filled with old results.
          </p>
        </div>

        <Scoreboard />
      </div>
    </main>
  );
}
