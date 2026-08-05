# Enhanced Sports Tracking Platform - Implementation Guide

## Overview

This guide covers integrating all the new enhancement features (excluding fantasy, social, and mobile optimization) into your TX HS Football Tracker.

## Architecture

### Component Structure

```
Modal Display Hierarchy:
├── EnhancedGameDetailModal (Main container)
│   ├── Header with Score & Controls
│   ├── Tab Navigation (Overview | Stats | Plays | Alerts)
│   │
│   ├── Overview Tab
│   │   ├── FootballField (existing, enhanced)
│   │   └── GameStatsDisplay (NEW)
│   │
│   ├── Stats Tab
│   │   └── GameStatsDisplay (expanded)
│   │       ├── Momentum indicator
│   │       ├── Win probability chart
│   │       ├── Turnover differential
│   │       ├── Red zone efficiency
│   │       ├── 3rd down conversion rate
│   │       ├── Quarterly scoring progression
│   │       └── Key stats summary
│   │
│   ├── Plays Tab
│   │   └── PlayByPlayLog (NEW)
│   │       ├── Real-time event list
│   │       ├── EPA indicators
│   │       ├── Win probability changes
│   │       └── Critical play flagging
│   │
│   └── Alerts Tab
│       └── GameAlerts (NEW)
│           ├── Injury updates
│           ├── Milestone alerts
│           ├── Upset notifications
│           ├── Turnover alerts
│           └── Critical moment flags
```

### Football Field Enhancement

The existing `FootballField` component has been enhanced to support:

```
FootballField Props:
├── situation (enhanced)
│   ├── momentum direction & score
│   ├── win probability
│   ├── turnover differential
│   ├── red zone status
│   ├── 3rd down conversion rate
│   ├── drive summary
│   └── quarterly scoring
├── homeTeam
└── awayTeam
```

## Integration Steps

### Step 1: Update Your Game Type Definitions

In `src/lib/types.ts`, extend your `Game` interface:

```typescript
import type { GameSituation, EnhancedGameStats, PlayByPlayEvent, GameAlert } from './enhancements';

export interface Game {
  // ... existing fields ...
  
  // NEW FIELDS
  situation?: GameSituation;
  homeStats?: EnhancedGameStats;
  awayStats?: EnhancedGameStats;
  playByPlayEvents?: PlayByPlayEvent[];
  alerts?: GameAlert[];
  weather?: {
    temp: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    condition: string;
  };
}
```

### Step 2: Replace Modal Component

Replace your existing `GameDetailModal.tsx`:

```typescript
// In your page component
import { EnhancedGameDetailModal } from '@/components/EnhancedGameDetailModal';

export default function GamePage() {
  return (
    <EnhancedGameDetailModal
      isOpen={isOpen}
      onClose={onClose}
      game={selectedGame}
      homeStats={gameStats?.home}
      awayStats={gameStats?.away}
      playByPlayEvents={playByPlayEvents}
      alerts={alerts}
      weather={weather}
    />
  );
}
```

### Step 3: Fetch Live Data

Use the `LiveGameManager` to subscribe to real-time updates:

```typescript
import { liveGameManager, fetchGameStats, fetchPlayByPlay, fetchGameAlerts } from '@/lib/liveDataManager';

useEffect(() => {
  if (!gameId || !isLive) return;

  // Subscribe to live updates
  liveGameManager.subscribe({
    gameId,
    onUpdate: (data) => {
      setSituation(data.situation);
      setHomeStats(data.homeStats);
      setAwayStats(data.awayStats);
    },
    onAlerts: (newAlerts) => {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  });

  // Fetch initial data
  Promise.all([
    fetchGameStats(gameId),
    fetchPlayByPlay(gameId),
    fetchGameAlerts(gameId)
  ]).then(([stats, plays, gameAlerts]) => {
    setHomeStats(stats.home);
    setAwayStats(stats.away);
    setPlayByPlayEvents(plays);
    setAlerts(gameAlerts);
  });

  return () => liveGameManager.unsubscribe(gameId);
}, [gameId, isLive]);
```

### Step 4: Display Analytics Views

Add a separate page for team analytics:

```typescript
// pages/teams/[id]/analytics.tsx

import { ELORankings, PowerRankings, PlayoffScenarios, StrengthOfSchedule, SeasonProjection } from '@/components/AnalyticsComponents';
import { fetchELORankings, fetchPowerRankings, fetchPlayoffScenarios, fetchStrengthOfSchedule, fetchSeasonProjection } from '@/lib/liveDataManager';

export default function TeamAnalytics({ teamId, classification }) {
  const [eloRankings, setEloRankings] = useState([]);
  const [powerRankings, setPowerRankings] = useState([]);
  const [playoffScenarios, setPlayoffScenarios] = useState([]);
  const [sos, setSOS] = useState(null);
  const [projection, setProjection] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchELORankings(classification),
      fetchPowerRankings(classification),
      fetchPlayoffScenarios(teamId),
      fetchStrengthOfSchedule(teamId),
      fetchSeasonProjection(teamId)
    ]).then(([elo, power, scenarios, sosData, projectionData]) => {
      setEloRankings(elo);
      setPowerRankings(power);
      setPlayoffScenarios(scenarios);
      setSOS(sosData);
      setProjection(projectionData);
    });
  }, [teamId, classification]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ELORankings teams={eloRankings} />
        <PowerRankings teams={powerRankings} />
      </div>
      
      {sos && <StrengthOfSchedule {...sos} team={teamName} />}
      {projection && <SeasonProjection {...projection} />}
      {playoffScenarios.length > 0 && <PlayoffScenarios scenarios={playoffScenarios} />}
    </div>
  );
}
```

## Data Flow for Football Field Modal

### Mini Modal (Quick View)
```
Game List View
  ↓
Click Game Card
  ↓
Display Mini Modal
  ├── Score at top
  ├── Small football field (existing)
  └── Quick stats (NEW)
```

### Expanded Modal (Full Detail)
```
Click "Expand" button
  ↓
Show Full Modal with Tabs
  ├── Overview Tab
  │   ├── Large football field
  │   └── Key stats display
  ├── Stats Tab
  │   └── All enhanced stats
  ├── Plays Tab
  │   └── Play-by-play log
  └── Alerts Tab
      └── Game alerts & notifications
```

## Backend Implementation Checklist

- [ ] Create `/api/games/[id]/live` endpoint
- [ ] Create `/api/games/[id]/stats` endpoint  
- [ ] Create `/api/games/[id]/plays` endpoint
- [ ] Create `/api/games/[id]/alerts` endpoint
- [ ] Create `/api/weather` endpoint
- [ ] Create `/api/rankings/elo` endpoint
- [ ] Create `/api/rankings/power` endpoint
- [ ] Create `/api/teams/[id]/strength-of-schedule` endpoint
- [ ] Create `/api/teams/[id]/season-projection` endpoint
- [ ] Create `/api/teams/[id]/playoff-scenarios` endpoint
- [ ] Set up Redis caching for live data
- [ ] Implement WebSocket server for real-time updates
- [ ] Create background jobs for ranking calculations

## Feature Implementation Priority

### Phase 1: Core Real-Time (Weeks 1-2)
1. Game stats display (home/away yards, passing/rushing)
2. Play-by-play log
3. Basic alerts (scores, turnovers)
4. Game alerts display

**Files to implement**:
- API endpoints: `/api/games/[id]/stats`, `/api/games/[id]/plays`
- Component: `GameStatsDisplay`, `PlayByPlayLog`, `GameAlerts`

### Phase 2: Advanced Metrics (Weeks 3-4)
1. Win probability charts
2. Momentum tracking
3. Red zone efficiency
4. 3rd down conversion rates
5. EPA calculations

**Files to implement**:
- Enhanced `situation` object handling
- EPA calculation in `enhancements.ts`
- Advanced display in `GameStatsDisplay`

### Phase 3: Analytics & Predictions (Weeks 5-6)
1. ELO rankings
2. Power rankings
3. Playoff scenarios
4. Strength of schedule
5. Season projections

**Files to implement**:
- API endpoints: `/api/rankings/*`, `/api/teams/[id]/*`
- Components: `AnalyticsComponents.tsx`
- Ranking calculation engine

### Phase 4: Enhancements (Weeks 7-8)
1. Weather integration
2. Injury reports
3. Head-to-head historical data
4. AI predictions
5. Historical archives

**Files to implement**:
- API endpoints: `/api/weather`, `/api/teams/[id]/injuries`
- Weather data integration

## Data Integration with Existing MaxPreps

Your existing MaxPreps integration should be extended to provide enhanced data:

```typescript
// In maxpreps.ts
export async function fetchGameEnhancedData(gameId: string) {
  const basicGame = await fetchGameDetails(gameId);
  
  return {
    // Existing data
    ...basicGame,
    
    // NEW: Situation data
    situation: {
      down: 3,
      distance: 7,
      yardLine: 45,
      possession: basicGame.homeTeam,
      // ... more calculated fields
    },
    
    // NEW: Stats
    homeStats: calculateStats(basicGame.plays, 'home'),
    awayStats: calculateStats(basicGame.plays, 'away'),
    
    // NEW: Play-by-play
    playByPlayEvents: parsePlayByPlay(basicGame.plays),
    
    // NEW: Alerts
    alerts: generateAlerts(basicGame)
  };
}
```

## Testing

Test each component in isolation:

```typescript
// src/__tests__/GameStatsDisplay.test.tsx
import { GameStatsDisplay } from '@/components/GameStatsDisplay';

describe('GameStatsDisplay', () => {
  it('displays momentum indicator', () => {
    // Test
  });
  
  it('shows win probability', () => {
    // Test
  });
});
```

## Performance Considerations

1. **Caching**: Cache frequent requests (rankings, stats)
2. **Lazy Loading**: Load tabs on demand, not all at once
3. **Batch Updates**: Group multiple updates together
4. **Debouncing**: Debounce stat updates during live games
5. **Data Compression**: Compress play-by-play events for transfer

## Deployment

After implementing features:

1. Build and test locally
2. Push to staging environment
3. Run full test suite
4. Deploy to production
5. Monitor performance and error rates

```bash
npm run build
npm run test
# After green CI, deploy the exact commit as an immutable Vultr VPS release.
# Verify https://txhs.wright-sports.org/api/health after the atomic switch.
```

## Documentation

- API documentation in `src/lib/API_ROUTES.ts`
- Component documentation in component files
- Type definitions in `src/lib/enhancements.ts`

## Support & Monitoring

- Set up error tracking (Sentry)
- Monitor API response times
- Track user engagement with new features
- Gather feedback through usage analytics
