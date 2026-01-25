/**
 * Brain AI Hook
 * Fetches and manages Brain AI data for the sports tracker
 */

import { useState, useEffect } from 'react';

export interface BrainAIData {
  standings: any[];
  upcomingGames: any[];
  momentumGames: any[];
  closeGames: any[];
  patterns: any[];
  systemStatus: any;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage Brain AI data
 * Automatically polls for real-time updates every 30 seconds
 */
export function useBrainAI(leagueId: string = 'hs-football'): BrainAIData {
  const [data, setData] = useState<BrainAIData>({
    standings: [],
    upcomingGames: [],
    momentumGames: [],
    closeGames: [],
    patterns: [],
    systemStatus: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchBrainAIData = async () => {
      try {
        // Fetch all Brain AI data in parallel
        const [
          standingsRes,
          gamesRes,
          momentumRes,
          closeRes,
          patternsRes,
          statusRes,
        ] = await Promise.all([
          fetch(`/api/brain-ai/standings/${leagueId}`),
          fetch(`/api/brain-ai/upcoming-games?hours=48`),
          fetch(`/api/brain-ai/high-momentum-games`),
          fetch(`/api/brain-ai/close-games`),
          fetch(`/api/brain-ai/patterns`),
          fetch(`/api/brain-ai/status`),
        ]);

        const [standings, games, momentum, close, patterns, status] =
          await Promise.all([
            standingsRes.json(),
            gamesRes.json(),
            momentumRes.json(),
            closeRes.json(),
            patternsRes.json(),
            statusRes.json(),
          ]);

        setData({
          standings: standings.data || standings || [],
          upcomingGames: games.data || games || [],
          momentumGames: momentum.data || momentum || [],
          closeGames: close.data || close || [],
          patterns: patterns.data || patterns || [],
          systemStatus: status.data || status || {},
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Brain AI data fetch failed:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch Brain AI data',
        }));
      }
    };

    // Initial fetch
    fetchBrainAIData();

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchBrainAIData, 30000);

    return () => clearInterval(interval);
  }, [leagueId]);

  return data;
}

/**
 * Hook to fetch game predictions
 */
export function useBrainAIPredictions(homeELO: number, awayELO: number, leagueId: string = 'hs-football') {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!homeELO || !awayELO) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/brain-ai/predictions?homeELO=${homeELO}&awayELO=${awayELO}&leagueId=${leagueId}`
        );
        const data = await response.json();
        setPrediction(data.data || data);
      } catch (error) {
        console.error('Prediction fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [homeELO, awayELO, leagueId]);

  return { prediction, loading };
}

/**
 * Hook to get high momentum games
 */
export function useBrainAIMomentumGames() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/brain-ai/high-momentum-games');
        const data = await response.json();
        setGames(data.data || data || []);
      } catch (error) {
        console.error('Momentum games fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  return { games, loading };
}
