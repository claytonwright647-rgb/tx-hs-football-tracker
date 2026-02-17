// Real-Time Update Manager for Live Game Data
// Handles WebSocket connections and live data updates

export interface LiveDataSubscription {
  gameId: string;
  onUpdate: (data: any) => void;
  onAlerts: (alerts: any[]) => void;
}

export class LiveGameManager {
  private subscriptions = new Map<string, LiveDataSubscription>();
  private wsConnections = new Map<string, WebSocket>();

  /**
   * Subscribe to real-time game updates
   * In production, connect to actual WebSocket server
   */
  subscribe(subscription: LiveDataSubscription) {
    this.subscriptions.set(subscription.gameId, subscription);
    
    // In production, establish WebSocket connection
    // For now, polling fallback
    this.startPolling(subscription.gameId);
  }

  unsubscribe(gameId: string) {
    this.subscriptions.delete(gameId);
    
    const ws = this.wsConnections.get(gameId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(gameId);
    }
  }

  private startPolling(gameId: string) {
    // Fallback polling interval - in production use WebSocket
    const pollInterval = setInterval(async () => {
      const sub = this.subscriptions.get(gameId);
      if (!sub) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const response = await fetch(`/api/games/${gameId}/live`);
        if (response.ok) {
          const data = await response.json();
          sub.onUpdate(data);
        }
      } catch (error) {
        console.error('Error polling game data:', error);
      }
    }, 5000); // Poll every 5 seconds
  }
}

// Singleton instance
export const liveGameManager = new LiveGameManager();

/**
 * Fetch real-time game statistics
 */
export async function fetchGameStats(gameId: string) {
  try {
    const response = await fetch(`/api/games/${gameId}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return null;
  }
}

/**
 * Fetch play-by-play events
 */
export async function fetchPlayByPlay(gameId: string) {
  try {
    const response = await fetch(`/api/games/${gameId}/plays`);
    if (!response.ok) throw new Error('Failed to fetch plays');
    return await response.json();
  } catch (error) {
    console.error('Error fetching play-by-play:', error);
    return [];
  }
}

/**
 * Fetch current game alerts
 */
export async function fetchGameAlerts(gameId: string) {
  try {
    const response = await fetch(`/api/games/${gameId}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Fetch weather data for game location
 */
export async function fetchWeatherData(venue: string, city: string) {
  try {
    const response = await fetch(`/api/weather?venue=${venue}&city=${city}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Fetch ELO rankings for classification/division
 */
export async function fetchELORankings(classification: string, division?: string) {
  try {
    const params = new URLSearchParams({ classification });
    if (division) params.append('division', division);
    
    const response = await fetch(`/api/rankings/elo?${params}`);
    if (!response.ok) throw new Error('Failed to fetch ELO rankings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ELO rankings:', error);
    return [];
  }
}

/**
 * Fetch power rankings
 */
export async function fetchPowerRankings(classification: string) {
  try {
    const response = await fetch(`/api/rankings/power?classification=${classification}`);
    if (!response.ok) throw new Error('Failed to fetch power rankings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching power rankings:', error);
    return [];
  }
}

/**
 * Fetch playoff scenarios for a team
 */
export async function fetchPlayoffScenarios(teamId: string) {
  try {
    const response = await fetch(`/api/teams/${teamId}/playoff-scenarios`);
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    return await response.json();
  } catch (error) {
    console.error('Error fetching playoff scenarios:', error);
    return [];
  }
}

/**
 * Fetch strength of schedule
 */
export async function fetchStrengthOfSchedule(teamId: string) {
  try {
    const response = await fetch(`/api/teams/${teamId}/strength-of-schedule`);
    if (!response.ok) throw new Error('Failed to fetch SOS');
    return await response.json();
  } catch (error) {
    console.error('Error fetching SOS:', error);
    return null;
  }
}

/**
 * Fetch season win projections
 */
export async function fetchSeasonProjection(teamId: string) {
  try {
    const response = await fetch(`/api/teams/${teamId}/season-projection`);
    if (!response.ok) throw new Error('Failed to fetch projection');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projection:', error);
    return null;
  }
}

/**
 * Fetch injury reports for team
 */
export async function fetchInjuryReports(teamId: string) {
  try {
    const response = await fetch(`/api/teams/${teamId}/injuries`);
    if (!response.ok) throw new Error('Failed to fetch injury reports');
    return await response.json();
  } catch (error) {
    console.error('Error fetching injury reports:', error);
    return [];
  }
}

/**
 * Generate AI game prediction
 */
export async function generateGamePrediction(gameId: string) {
  try {
    const response = await fetch(`/api/games/${gameId}/prediction`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to generate prediction');
    return await response.json();
  } catch (error) {
    console.error('Error generating prediction:', error);
    return null;
  }
}

/**
 * Fetch head-to-head historical data
 */
export async function fetchHeadToHead(teamA: string, teamB: string) {
  try {
    const response = await fetch(`/api/matchups?teamA=${teamA}&teamB=${teamB}`);
    if (!response.ok) throw new Error('Failed to fetch H2H data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching H2H data:', error);
    return null;
  }
}

/**
 * Create a notification subscription for game alerts
 */
export async function subscribeToAlerts(gameId: string, preferences: {
  injuries?: boolean;
  milestones?: boolean;
  scores?: boolean;
  upsets?: boolean;
}) {
  try {
    const response = await fetch(`/api/alerts/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, preferences })
    });
    if (!response.ok) throw new Error('Failed to subscribe');
    return await response.json();
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    return null;
  }
}
