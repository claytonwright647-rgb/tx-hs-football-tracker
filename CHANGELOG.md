# Changelog - Texas HS Football Tracker

## [0.6.0] - 2025-12-26 - GamePreviewModal 📊

### Added
- **Clickable Game Preview Modal** for upcoming games
  - Click any upcoming game card to open full preview
  - 4-tab interface: Overview, Matchup, Stats, Players
  - Win probability bar with team colors
  - Recent form (W/L dots for last 5 games)
  - Side-by-side stat comparison bars
  - Key player stats for each team
  
- **Tab Details:**
  - **Overview** - Win probability, game time, venue, recent form
  - **Matchup** - Head-to-head history, current streak
  - **Stats** - PPG, YPG, defensive stats with visual bars
  - **Players** - Top performers with season stats

- **Files Added:**
  - `src/components/GamePreviewModal.tsx` (355 lines)
  - Uses FootballField component for live games

---

## [0.5.1] - 2025-12-23 - Last Scorer Display ⚡

### Added
- **Last Scorer on Game Cards**
  - Shows "Last Score: TEAM ⚡ Player Name" on live game cards
  - Shows "Final Score: TEAM ⚡ Player Name" on completed game cards
  - Team name color-coded (blue for home, orange for away)

### Changed
- Updated `LiveGame` type to include `lastScorer` and `lastScorerTeam` fields
- GameCard component now displays lastScorer when available
- Mock game data includes example lastScorer

---

## [0.5.0] - 2025-12-22 - Season Intelligence System 🧠

### Added
- **Season Intelligence Engine** (src/lib/seasonIntelligence.ts)
  - Knows the full UIL football calendar: schedules, fall camp, scrimmages, regular season, playoffs, state championships
  - Auto-detects current phase based on date
  - Determines what data to fetch and when
  - Calculates countdowns to key events
  - Configurable for multiple years (2025, 2026+)

- **Season Phases Supported**
  | Phase | When | What It Does |
  |-------|------|--------------|
  | deep_offseason | Jan-May | Shows last season results |
  | schedule_watch | June | Starts checking UIL/ESPN for schedules |
  | preseason | July | Schedules available, season preview |
  | fall_camp | Early Aug | Practice begins, countdown to kickoff |
  | scrimmages | Late Aug | Tune-up games, light score fetching |
  | regular_season | Sept-Nov | Full game mode, live scores every minute |
  | playoffs | Nov-Dec | Bracket tracking, elimination rounds |
  | state_championships | Mid-Dec | Finals at AT&T Stadium |
  | postseason | Late Dec | Archive results, wait for next year |

- **Cron Job System** (/api/cron)
  - Runs every 6 hours (configurable per phase)
  - Intelligently fetches only what's needed for current phase
  - ESPN Texas HS Football API integration
  - Ready for UIL and MaxPreps data sources

- **Season Status API** (/api/season)
  - Returns current phase, countdowns, and UI hints
  - Used by frontend components for display

- **SeasonIntelligence UI Component** (src/components/SeasonIntelligence.tsx)
  - Displays current phase with icon and countdown
  - Phase-specific colors and messaging
  - Live ticker countdown to next event
  - Shows "Games Active" indicator during season

- **Vercel Cron Configuration** (vercel.json)
  - Cron job runs every 6 hours
  - Auto-adjusts behavior based on season phase

### Technical Details
- Phase detection uses date comparisons against SeasonConfig
- Refresh intervals: 1 min during games, 6 hours in offseason
- Data sources: ESPN HS Football API, UIL (planned), MaxPreps (planned)
- Cron job secured with optional CRON_SECRET env var

### What This Means
The tracker now "knows" it's December 2025 (postseason), so it:
- Shows "Season Complete" status
- Displays countdown to 2026 schedules (June 1)
- Doesn't waste API calls on live scores
- Will auto-activate in June 2025 when schedule watch begins

---

## [0.4.0] - 2025-12-22 - Football Field Visualization

### Added
- **FootballField Component** (src/components/fields/FootballField.tsx)
  - Visual football field with all 5-yard lines numbered (5, 10, 15...50)
  - End zones with team colors and abbreviations
  - Red zone shading (20 yards from each goal line)
  - Hash marks across field
  - Live game support: ball position, line of scrimmage (cyan), first down marker (yellow)
  - Red zone indicator with pulsing badge

- **GameDetailModal Component** (src/components/GameDetailModal.tsx)
  - Modal popup when clicking on game cards
  - Shows score, teams, venue, date/time
  - Integrates FootballField visualization
  - Live game status indicator
  - Supports upcoming, live, and final game states

- **Smart Auto-Detection**
  - GameCards are now clickable - opens detail modal with football field
  - Automatically detects live games via status field
  - Shows live situation (down, distance, yard line, possession) when available
  - Shows default field position for scheduled/final games
  - Mock live game with situation data for testing

- **New Dependencies**
  - lucide-react: Icons for modal UI

### Technical Details
- GameCard accepts onClick prop, triggers modal open
- Scoreboard manages modal state (selectedGame, isModalOpen)
- LiveGame type (extends Game) includes situation object
- Situation data: possession, down, distance, yardLine, lastPlay

### Notes
- 2025 season starts August 28-30, 2025
- Field visualization will show live data when games are in progress
- Infrastructure ready - when ESPN API provides situation data, it auto-displays

---

## [0.3.0] - 2025-12-22 - Cross-Site Navigation

### Added
- **Sports Dashboard Integration**
  - TX HS Football button added to main Sports Tracker (wright-sports.com)
  - Button appears in header next to Refresh button
  - Orange styling with 🏈 emoji, opens in new tab
  - Bidirectional linking: Pro Sports ↔ TX HS Football

---

## [0.2.0] - 2025-12-22 - Dates & Complete Scores

### Added
- **Game Dates on All Cards**
  - GameCard component shows date with game status (e.g., "Dec 20, 2025 FINAL")
  - Scoreboard page displays full championship dates
  - Playoffs page bracket games show dates above matchups
  - Home page champion cards show date at bottom

- **Complete 2025-26 Scores**
  - All 12 state championship scores added:
    * 6A-DI: North Shore 10-7 Duncanville (Dec 20)
    * 6A-DII: DeSoto 55-27 C.E. King (Dec 20)
    * 5A-DI: Smithson Valley 28-6 Frisco Lone Star (Dec 19)
    * 5A-DII: South Oak Cliff 35-19 Richmond Randle (Dec 20)
    * 4A-DI: Stephenville 35-21 Kilgore (Dec 19)
    * 4A-DII: Carthage 42-14 West Orange-Stark (Dec 19)
    * 3A-DI: Yoakum 24-21 Grandview (Dec 18)
    * 3A-DII: Wall 28-21 Newton (Dec 18)
    * 2A-DI: Hamilton 42-28 Joaquin (Dec 17)
    * 2A-DII: Muenster 35-28 Shiner (Dec 18)
    * 1A-DI: Gordon 69-22 Rankin - Six-Man (Dec 17)
    * 1A-DII: Jayton 94-52 Richland Springs - Six-Man (Dec 17)

- **Champion Notes**
  - Stephenville: "7th state title"
  - Jayton: "First title!" (first-time champion)
  - DeSoto: "2nd state title"
  - Yoakum, Wall, Hamilton: "First title!" (all first-timers)
  - Gordon: "THREE-PEAT! 🏆🏆🏆"

### Fixed
- Playoffs page year: "2024-2025 Playoffs" → "2025-26 Playoffs"
- Full bracket data for ALL 6 classifications (was only 6A/5A)
- Scoreboard subtitle updated to "2025-2026 State Championships"

---

## [0.1.0] - 2025-12-22 - Initial Release

### Added
- **Project Setup**
  - Next.js 16 with TypeScript and Tailwind CSS
  - Separate GitHub repo (claytonwright647-rgb/tx-hs-football-tracker)
  - Deployed to Vercel at https://tx-hs-football-tracker.vercel.app
  - Completely isolated from main sports-dashboard project

- **Landing Page**
  - Header with Texas flag-inspired accent bar
  - Real-time clock (CST timezone)
  - Navigation tabs (Scoreboard, Standings, Playoffs, Rankings, Stats)
  - Link back to Pro Sports Tracker (wright-sports.com)

- **Classification Cards**
  - All 6 UIL classifications (6A through 1A Six-Man)
  - Color-coded cards with unique styling per class
  - Current champions display (2025-2026 season)
  - Live game indicator with pulse animation
  - Games this week counter

- **Game Cards**
  - Classification and division badges
  - Playoff round indicator with trophy icon
  - District game indicator
  - Live status with quarter and time remaining
  - Team names with records
  - Score display (winner highlighted)
  - Venue and broadcast information
  - Responsive hover effects

- **Standings Page**
  - All 6 classifications with mock district data
  - Team rankings with overall/district records
  - Points for/against, streak tracking
  - Playoff qualification indicators

- **Playoffs Page**
  - State semifinals and championship brackets
  - All divisions for all 6 classifications
  - Champion banners with notes
  - Six-Man football info section

- **Rankings & Stats Pages**
  - Placeholder structures for future data

- **Data Layer**
  - TypeScript interfaces for all data types
  - Constants file with classifications, playoff rounds, regions
  - 2025-2026 state champions data (all 12 champions)
  - Powerhouse programs database (updated with 2025 champs)
  - Six-man football rules reference
  - API route structure (/api/games, /api/standings)

- **Season Highlights Section**
  - Gordon's Three-Peat story
  - SOC Dynasty (5th straight title game)
  - Four First-Time Champions
  - North Shore vs Duncanville III
  - Carthage's perfection in finals
  - Stephenville's 7th title

### Technical
- CST timezone standardization (America/Chicago)
- Dark theme with orange/yellow Texas accents
- Custom scrollbar styling
- Smooth hover animations
- Responsive grid layouts

---

## Links
- **Live Site**: https://tx-hs-football-tracker.vercel.app
- **GitHub**: https://github.com/claytonwright647-rgb/tx-hs-football-tracker
- **Pro Sports Tracker**: https://wright-sports.com
