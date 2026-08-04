'use client';

import { useEffect, useState } from 'react';

interface SeasonCountdownProps {
  targetDate: Date;
  nextSeasonYear: string;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-black leading-none tabular-nums text-white sm:text-2xl">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  );
}

export default function SeasonCountdown({ targetDate, nextSeasonYear }: SeasonCountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const initialFrame = window.requestAnimationFrame(update);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearInterval(timer);
    };
  }, []);

  if (now === null) return null;

  const difference = targetDate.getTime() - now;
  if (difference <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500 bg-green-600/30 px-3 py-2">
        <span className="text-sm font-bold text-green-400">🏈 {nextSeasonYear} Season Live!</span>
      </div>
    );
  }

  const timeLeft = {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  return (
    <div className="rounded-lg border border-orange-500/50 bg-gradient-to-r from-orange-900/50 to-red-900/50 px-3 py-2">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🏈</span>
          <span className="whitespace-nowrap text-xs font-bold text-orange-400 sm:text-sm">{nextSeasonYear} KICKOFF</span>
        </div>
        <div className="flex items-center gap-2">
          <TimeBlock value={timeLeft.days} label="days" />
          <span className="text-lg font-bold text-orange-400">:</span>
          <TimeBlock value={timeLeft.hours} label="hrs" />
          <span className="text-lg font-bold text-orange-400">:</span>
          <TimeBlock value={timeLeft.minutes} label="min" />
          <span className="text-lg font-bold text-orange-400">:</span>
          <TimeBlock value={timeLeft.seconds} label="sec" />
        </div>
      </div>
    </div>
  );
}
