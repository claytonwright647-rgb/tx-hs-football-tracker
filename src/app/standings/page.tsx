'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import { CLASSIFICATIONS } from '@/lib/constants';
import { getCurrentSeasonYear } from '@/lib/seasonIntelligence';

export default function StandingsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const seasonYear = getCurrentSeasonYear();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <SeasonIntelligence />

        <h1 className="text-3xl font-bold text-white">{seasonYear} District Standings</h1>
        <p className="mb-6 mt-1 text-gray-400">
          Official current-season district records, points, and playoff position.
        </p>

        <div className="mb-8 flex flex-wrap gap-2" aria-label="Classification filter">
          {CLASSIFICATIONS.map((classification) => (
            <button
              type="button"
              key={classification.id}
              onClick={() => setSelectedClass(classification.id)}
              aria-pressed={selectedClass === classification.id}
              className={`rounded-lg border px-4 py-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                selectedClass === classification.id
                  ? `${classification.bgColor} ${classification.textColor} ${classification.borderColor} border-2`
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {classification.name}
            </button>
          ))}
        </div>

        <section role="status" className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-gray-900 p-8 text-center shadow-xl">
          <div className="mb-4 text-5xl">🏟️</div>
          <h2 className="text-2xl font-bold text-white">{selectedClass} district standings are pending</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">
            District play has not started for the {seasonYear} season. The tracker will not display an old district table as if it were current.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
            Once official results are available, this page will show overall and district records, points for and against, streaks, and source freshness.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.maxpreps.com/tx/football/standings/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
            >
              Check MaxPreps
            </a>
            <Link href="/scoreboard" className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-semibold text-gray-200 hover:bg-gray-700">
              Open Scoreboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
