'use client';

import { useState, useEffect } from 'react';
import { SEASON_INFO } from '@/lib/constants';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Chicago',
      };
      setCurrentTime(now.toLocaleTimeString('en-US', timeOptions) + ' CST');
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent" />
      
      {/* Texas flag inspired accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-white to-red-600" />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Top row - Logo and Title */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo placeholder */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
              🏈
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg"
                      style={{ textShadow: '0 0 40px rgba(251, 146, 60, 0.5)' }}>
                  TEXAS HS FOOTBALL
                </span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                UIL • TAPPS • {SEASON_INFO.year} Season
              </p>
            </div>
          </div>


          {/* Time and Refresh */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-400 text-sm">{currentDate}</div>
              <div className="text-white font-mono">{currentTime}</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white font-semibold"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {['Scoreboard', 'Standings', 'Playoffs', 'Rankings', 'Stats'].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors border border-gray-700 hover:border-gray-600"
            >
              {tab}
            </button>
          ))}
          <a
            href="https://www.wright-sports.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 hover:text-blue-300 transition-colors border border-blue-600/50 hover:border-blue-500"
          >
            ← Pro Sports Tracker
          </a>
        </nav>
      </div>
    </header>
  );
}
