'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HeroCountdownProps {
  targetDate: string; // ISO date string e.g. '2026-08-27T19:00:00-05:00'
}

export default function HeroCountdown({ targetDate }: HeroCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);

    const calculate = (): TimeLeft | null => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return null;
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-center text-green-400 font-bold text-2xl py-4">
        🏈 Season Has Started!
      </div>
    );
  }

  const Block = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700 backdrop-blur-sm">
      <span className="block text-3xl font-bold text-white tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
      <Block value={timeLeft.days} label="Days" />
      <Block value={timeLeft.hours} label="Hours" />
      <Block value={timeLeft.minutes} label="Mins" />
      <Block value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
