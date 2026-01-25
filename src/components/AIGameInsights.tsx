/**
 * AIGameInsights Component
 * Displays AI-generated insights during/before/after games
 */

'use client';

import React, { useEffect, useState } from 'react';

interface GameInsight {
  title: string;
  description: string;
  type: 'momentum' | 'prediction' | 'matchup' | 'trend';
  confidence?: number;
  icon?: string;
}

interface AIGameInsightsProps {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  gameStatus: 'scheduled' | 'in_progress' | 'final';
  className?: string;
}

/**
 * AI-powered game insights component for HS football
 */
export function AIGameInsights({
  gameId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  gameStatus,
  className = '',
}: AIGameInsightsProps) {
  const [insights, setInsights] = useState<GameInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ai-enhancements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze-game',
            payload: {
              id: gameId,
              homeTeam: { id: homeTeamId, name: homeTeamName },
              awayTeam: { id: awayTeamId, name: awayTeamName },
              status: gameStatus,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch insights');

        const data = await response.json();
        if (data.success && data.data) {
          const analysisInsights: GameInsight[] = [
            ...data.data.insights.map((text: string) => ({
              title: 'Game Analysis',
              description: text,
              type: 'prediction' as const,
              confidence: 75,
            })),
          ];
          setInsights(analysisInsights);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [gameId, gameStatus]);

  if (isLoading) {
    return (
      <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
        <div className="text-gray-400 text-sm">Loading AI insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-slate-800 rounded-lg border border-red-500 ${className}`}>
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      <h3 className="text-sm font-semibold text-white mb-3">AI Insights</h3>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-gray-400 text-sm">No insights available yet</div>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="p-3 bg-slate-700 rounded border-l-2 border-blue-500">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-xs font-semibold text-blue-400">{insight.title}</h4>
                {insight.confidence && (
                  <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                )}
              </div>
              <p className="text-xs text-gray-300">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AIGameInsights;
