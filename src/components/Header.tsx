'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SEASON_INFO, NEXT_SEASON } from '@/lib/constants';
import SearchBar from './SearchBar';
import SeasonCountdown from './SeasonCountdown';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Scoreboard', href: '/scoreboard' },
  { name: 'Standings', href: '/standings' },
  { name: 'Playoffs', href: '/playoffs' },
  { name: 'Rankings', href: '/rankings' },
];

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const pathname = usePathname();

  // Next season kickoff date: August 27, 2026
  const nextSeasonKickoff = new Date('2026-08-27T19:00:00-05:00');

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
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-white to-red-600" />
      
      <div className="relative z-10 container mx-auto px-4 py-4">
        {/* Season Countdown Banner - TOP */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 pb-4 border-b border-gray-800">
          <div className="text-center sm:text-left">
            <span className="text-gray-400 text-sm">
              {SEASON_INFO.displayYear} Season Complete! 🏆
            </span>
          </div>
          <SeasonCountdown 
            targetDate={nextSeasonKickoff} 
            nextSeasonYear={NEXT_SEASON.displayYear} 
          />
        </div>

        {/* Main Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
              🏈
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  TEXAS HS FOOTBALL
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                UIL • TAPPS • {SEASON_INFO.displayYear}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <SearchBar />
            <div className="text-right hidden sm:block">
              <div className="text-gray-400 text-xs">{currentDate}</div>
              <div className="text-white font-mono text-sm">{currentTime}</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white font-semibold text-sm"
            >
              🔄
            </button>
          </div>
        </div>


        {/* Navigation */}
        <nav className="mt-4 flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700 hover:border-gray-600'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <div className="flex-1" />
          
          <a
            href="https://www.wright-sports.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 hover:text-blue-300 transition-colors border border-blue-600/50 hover:border-blue-500 font-medium text-sm"
          >
            ← Pro Sports
          </a>
        </nav>
      </div>
    </header>
  );
}
