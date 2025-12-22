# TX HS Football Tracker - Project Summary

## Overview
Standalone Next.js 16 project tracking Texas UIL high school football, built December 22, 2025.

## Links
- **Live Site**: https://tx-hs-football-tracker.vercel.app
- **GitHub**: https://github.com/claytonwright647-rgb/tx-hs-football-tracker
- **Pro Sports Tracker**: https://wright-sports.com (bidirectional link in headers)

## Project Location
`C:\Users\clayt\OneDrive\Documents\Google Scripts\tx-hs-football-tracker`

## Tech Stack
- Next.js 16.1.0 with Turbopack
- TypeScript
- Tailwind CSS
- Deployed on Vercel (auto-deploy on git push)

## Pages
- `/` - Home page with season complete banner, 12 state champions, classification cards
- `/scoreboard` - 2025-2026 State Championships scoreboard
- `/standings` - District standings for all 6 classifications
- `/playoffs` - State semifinal and championship brackets (all 12 divisions)
- `/rankings` - Rankings page (placeholder)
- `/team/[slug]` - Team detail pages (17 powerhouse teams)

## 2025-2026 State Champions (Season Complete Dec 17-20)
| Class | Division | Champion | Score | Opponent |
|-------|----------|----------|-------|----------|
| 6A | I | North Shore | 10-7 | Duncanville |
| 6A | II | DeSoto | 55-27 | C.E. King |
| 5A | I | Smithson Valley | 28-6 | Frisco Lone Star |
| 5A | II | South Oak Cliff | 35-19 | Richmond Randle |
| 4A | I | Stephenville | 35-21 | Kilgore |
| 4A | II | Carthage | 42-14 | West Orange-Stark |
| 3A | I | Yoakum | 24-21 | Grandview |
| 3A | II | Wall | 28-21 | Newton |
| 2A | I | Hamilton | 42-28 | Joaquin |
| 2A | II | Muenster | 35-28 | Shiner |
| 1A | I | Gordon | 69-22 | Rankin |
| 1A | II | Jayton | 94-52 | Richland Springs |

## Key Features
- ✅ All 6 UIL classifications (6A through 1A Six-Man)
- ✅ Color-coded classification cards with unique styling
- ✅ Complete playoff brackets for all 12 divisions
- ✅ Game dates on all cards
- ✅ Champion notes (titles, first-time winners, etc.)
- ✅ Season highlights section (Gordon's Three-Peat, SOC Dynasty, etc.)
- ✅ Six-Man football rules reference
- ✅ Powerhouse teams database
- ✅ Countdown to 2026-27 season kickoff (Aug 27, 2026)

## Season Highlights
- **Gordon's Three-Peat**: Third straight 1A-DI title
- **SOC Dynasty**: South Oak Cliff's 5th straight title game appearance
- **Four First-Time Champions**: Yoakum, Wall, Hamilton, Jayton
- **Carthage Perfection**: 11-0 in state championship games
- **Stephenville's 7th**: Yellow Jackets cement legacy

## Integration with Sports Tracker
- TX HS Football button in Sports Tracker header (wright-sports.com)
- Pro Sports button in TX HS Football header
- Both buttons are orange with external link icons

## Files Structure
```
tx-hs-football-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx (home)
│   │   ├── scoreboard/page.tsx
│   │   ├── standings/page.tsx
│   │   ├── playoffs/page.tsx
│   │   ├── rankings/page.tsx
│   │   └── team/[slug]/page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── GameCard.tsx
│   │   ├── ClassificationCard.tsx
│   │   └── ...
│   └── lib/
│       ├── constants.ts (champions, classifications, powerhouses)
│       └── types.ts
├── CHANGELOG.md
└── README.md
```

## Development Commands
```bash
cd "C:\Users\clayt\OneDrive\Documents\Google Scripts\tx-hs-football-tracker"
npm run dev      # Start development server
npm run build    # Build for production
git push         # Auto-deploys to Vercel
```

---
Last Updated: December 22, 2025
