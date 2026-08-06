'use client';

import { useEffect, useState } from 'react';

interface HeroCountdownProps {
  targetDate: string;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4 backdrop-blur-sm">
      <span className="block text-3xl font-bold tabular-nums text-white">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  );
}

export default function HeroCountdown({ targetDate }: HeroCountdownProps) {
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

  const difference = new Date(targetDate).getTime() - now;
  if (difference <= 0) {
    return <div className="py-4 text-center text-2xl font-bold text-green-400">🏈 Season Has Started!</div>;
  }

  const timeLeft = {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  return (
    <div className="mx-auto mb-8 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
      <CountdownBlock value={timeLeft.days} label="Days" />
      <CountdownBlock value={timeLeft.hours} label="Hours" />
      <CountdownBlock value={timeLeft.minutes} label="Mins" />
      <CountdownBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
