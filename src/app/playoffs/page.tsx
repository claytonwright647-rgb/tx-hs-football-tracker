'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PlayoffBracket from '@/components/PlayoffBracket';
import SeasonIntelligence from '@/components/SeasonIntelligence';
import { CLASSIFICATIONS } from '@/lib/constants';
import { getCurrentSeasonYear } from '@/lib/seasonIntelligence';

export default function PlayoffsPage() {
  const [selectedClass, setSelectedClass] = useState('6A');
  const [selectedDivision, setSelectedDivision] = useState('I');
  const seasonYear = getCurrentSeasonYear();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <SeasonIntelligence />
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Official postseason center</p>
        <h1 className="mt-1 text-3xl font-black text-white">{seasonYear} Texas Playoffs</h1>
        <p className="mt-2 text-gray-400">Current-season UIL brackets appear here after official publication.</p>

        <div className="my-8 flex flex-wrap gap-4" aria-label="Bracket filters">
          <div className="flex flex-wrap gap-2">
            {CLASSIFICATIONS.map((classification) => (
              <button key={classification.id} type="button" aria-pressed={selectedClass === classification.id} onClick={() => setSelectedClass(classification.id)} className={`rounded-lg border px-4 py-2 font-bold transition ${selectedClass === classification.id ? `${classification.bgColor} ${classification.textColor} ${classification.borderColor}` : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {classification.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['I', 'II'].map((division) => (
              <button key={division} type="button" aria-pressed={selectedDivision === division} onClick={() => setSelectedDivision(division)} className={`rounded-lg border px-4 py-2 font-bold transition ${selectedDivision === division ? 'border-orange-400 bg-orange-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                Division {division}
              </button>
            ))}
          </div>
        </div>

        <PlayoffBracket classification={selectedClass} division={selectedDivision} />
      </div>
    </main>
  );
}
