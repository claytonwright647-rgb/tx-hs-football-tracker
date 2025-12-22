'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SeasonCountdownProps {
  targetDate: Date;
  nextSeasonYear: string;
}

export default function SeasonCountdown({ targetDate, nextSeasonYear }: SeasonCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return null; // Season has started
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  // Season has started
  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-600/30 border border-green-500 rounded-lg">
        <span className="text-green-400 font-bold text-sm">🏈 {nextSeasonYear} Season Live!</span>
      </div>
    );
  }


  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-xl sm:text-2xl font-black text-white tabular-nums leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/50 rounded-lg px-3 py-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🏈</span>
          <span className="text-orange-400 font-bold text-xs sm:text-sm whitespace-nowrap">
            {nextSeasonYear} KICKOFF
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <TimeBlock value={timeLeft.days} label="days" />
          <span className="text-orange-400 font-bold text-lg">:</span>
          <TimeBlock value={timeLeft.hours} label="hrs" />
          <span className="text-orange-400 font-bold text-lg">:</span>
          <TimeBlock value={timeLeft.minutes} label="min" />
          <span className="text-orange-400 font-bold text-lg">:</span>
          <TimeBlock value={timeLeft.seconds} label="sec" />
        </div>
      </div>
    </div>
  );
}
