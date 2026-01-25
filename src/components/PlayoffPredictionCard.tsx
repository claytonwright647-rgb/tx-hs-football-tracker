/**
 * PlayoffPredictionCard Component
 * Shows AI predictions for playoff outcomes
 */

'use client';

import React, { useEffect, useState } from 'react';

interface PlayoffPrediction {
  teamId: string;
  teamName: string;
  winProbability: number;
  strength: number;
  path: string;
}

interface PlayoffPredictionCardProps {
  bracketData: any;
  classification: string;
  className?: string;
}

/**
 * Display playoff predictions using AI
 */
export function PlayoffPredictionCard({
  bracketData,
  classification,
  className = '',
}: PlayoffPredictionCardProps) {
  const [predictions, setPredictions] = useState<PlayoffPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/ai-enhancements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'predict-bracket',
            payload: bracketData,
          }),
        });

        const data = await response.json();
        if (data.success && data.data.predictions) {
          setPredictions(data.data.predictions.slice(0, 5)); // Top 5 teams
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [bracketData]);

  const pathColors: Record<string, string> = {
    Champion: 'bg-yellow-600',
    Finals: 'bg-orange-600',
    Semifinals: 'bg-blue-600',
    Quarterfinals: 'bg-purple-600',
    'Early Exit': 'bg-gray-600',
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
        <div className="text-gray-400">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">Playoff Predictions ({classification})</h3>

      <div className="space-y-2">
        {predictions.map((pred, idx) => (
          <div key={pred.teamId} className="flex items-center justify-between p-2 bg-slate-700 rounded">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{idx + 1}. {pred.teamName}</div>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded text-white ${pathColors[pred.path] || pathColors['Early Exit']}`}>
                  {pred.path}
                </span>
                <span className="text-xs text-gray-400">Strength: {pred.strength}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">{pred.winProbability}%</div>
              <div className="text-xs text-gray-400">to win</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayoffPredictionCard;
