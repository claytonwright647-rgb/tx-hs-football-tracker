/**
 * ELOStandingsColumn Component
 * Displays team ELO ratings in standings
 */

'use client';

import React, { useEffect, useState } from 'react';

interface TeamRating {
  teamId: string;
  teamName: string;
  elo: number;
  strength: number;
  trend: number;
}

interface ELOStandingsColumnProps {
  teamId: string;
  teamName: string;
  className?: string;
}

/**
 * Display ELO rating for a team in standings
 */
export function ELOStandingsColumn({
  teamId,
  teamName,
  className = '',
}: ELOStandingsColumnProps) {
  const [rating, setRating] = useState<TeamRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch('/api/ai-enhancements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get-team-rating',
            payload: { teamId },
          }),
        });

        const data = await response.json();
        if (data.success) {
          setRating({
            teamId,
            teamName,
            elo: data.data.rating,
            strength: data.data.strength,
            trend: data.data.trend,
          });
        }
      } catch (error) {
        console.error('Error fetching ELO:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [teamId]);

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-yellow-500';
    if (strength >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendArrow = (trend: number) => {
    if (trend > 1) return '📈';
    if (trend < -1) return '📉';
    return '➡️';
  };

  if (isLoading) {
    return <div className={`text-gray-400 text-sm ${className}`}>--</div>;
  }

  if (!rating) {
    return <div className={`text-gray-500 text-sm ${className}`}>N/A</div>;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <div className={`text-sm font-semibold ${getStrengthColor(rating.strength)}`}>
          {rating.strength}
        </div>
        <span className="text-xs text-gray-400">{getTrendArrow(rating.trend)}</span>
      </div>
      <div className="text-xs text-gray-500">ELO {Math.round(rating.elo)}</div>
    </div>
  );
}

export default ELOStandingsColumn;
