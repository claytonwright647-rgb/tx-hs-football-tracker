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
        setError(null);
        
        const payload = {
          id: gameId,
          homeTeam: { id: homeTeamId, name: homeTeamName },
          awayTeam: { id: awayTeamId, name: awayTeamName },
          status: gameStatus,
          homeScore: 0,
          awayScore: 0,
        };

        const response = await fetch('/api/ai-enhancements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze-game',
            payload,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API response error:', response.status, errorText);
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          const analysisData = data.data;
          const analysisInsights: GameInsight[] = [];

          // Add momentum insight
          if (analysisData.momentum !== undefined) {
            const momentumText = analysisData.momentum > 0 
              ? `${homeTeamName} has momentum (${Math.round(analysisData.momentum)}%)`
              : analysisData.momentum < 0
              ? `${awayTeamName} has momentum (${Math.round(Math.abs(analysisData.momentum))}%)`
              : 'Game is evenly matched';
            
            analysisInsights.push({
              title: 'Momentum',
              description: momentumText,
              type: 'momentum',
              confidence: 80,
            });
          }

          // Add prediction insights
          if (analysisData.predictions) {
            const homePred = (analysisData.predictions.homeWinProbability || 0) * 100;
            analysisInsights.push({
              title: 'Win Prediction',
              description: `${homeTeamName}: ${Math.round(homePred)}% | ${awayTeamName}: ${Math.round(100 - homePred)}%`,
              type: 'prediction',
              confidence: 75,
            });
          }

          // Add game control insight
          if (analysisData.gameControl) {
            const controlText = analysisData.gameControl === 'home' 
              ? `${homeTeamName} controlling the game`
              : analysisData.gameControl === 'away'
              ? `${awayTeamName} controlling the game`
              : 'Game control is evenly split';
            
            analysisInsights.push({
              title: 'Game Control',
              description: controlText,
              type: 'momentum',
              confidence: 70,
            });
          }

          // Add key moments
          if (analysisData.keyMoments && Array.isArray(analysisData.keyMoments)) {
            analysisData.keyMoments.forEach((moment: string) => {
              analysisInsights.push({
                title: 'Key Moment',
                description: moment,
                type: 'trend',
                confidence: 65,
              });
            });
          }

          // Add other insights
          if (analysisData.insights && Array.isArray(analysisData.insights)) {
            analysisData.insights.forEach((text: string) => {
              analysisInsights.push({
                title: 'Analysis',
                description: text,
                type: 'prediction',
                confidence: 75,
              });
            });
          }

          setInsights(analysisInsights.slice(0, 5)); // Limit to 5 insights
        } else {
          setError(data.error || 'Failed to load insights');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error loading insights';
        console.error('AIGameInsights error:', message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId && homeTeamId && awayTeamId) {
      fetchInsights();
    }
  }, [gameId, gameStatus, homeTeamId, awayTeamId, homeTeamName, awayTeamName]);

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
