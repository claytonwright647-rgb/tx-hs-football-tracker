# 🏈 Texas High School Football Tracker

Live scores, standings, playoffs, and rankings for **Texas High School Football**.

## 🌐 Live Site
**https://tx-hs-football-tracker.vercel.app**

## ✨ Features

### Current
- 📊 **Classification Cards** - Track all UIL classes (6A → 1A Six-Man)
- 🎮 **Game Cards** - Live scores, final results, upcoming games
- 🏆 **Playoff Tracking** - State championship brackets
- ⭐ **Powerhouse Programs** - Historic title counts
- 📱 **Responsive Design** - Works on desktop and mobile

### Planned
- 🔴 **Live Updates** - Real-time score updates during games
- 📈 **Standings** - District standings with playoff positioning
- 🏅 **Rankings** - State and regional rankings
- 📊 **Stats** - Team and player statistics
- 🔔 **Notifications** - Score alerts for favorite teams
- 📧 **Email Digests** - Weekly game summaries


## 📚 Texas HS Football Overview

### UIL Classifications (2024-2026)
| Class | Enrollment | Football Type | Divisions |
|-------|-----------|---------------|-----------|
| 6A | 2,200+ | 11-man | DI, DII |
| 5A | 1,300-2,199 | 11-man | DI, DII |
| 4A | 545-1,299 | 11-man | DI, DII |
| 3A | 250-544 | 11-man | DI, DII |
| 2A | 105-249 | 11-man | DI, DII |
| 1A | ≤104 | **Six-Man** | DI, DII |

### Six-Man Football (Unique to Texas 1A)
- **Field:** 80 × 40 yards (no 50-yard line)
- **First Down:** 15 yards (not 10)
- **Field Goal:** 4 points (not 3)
- **Mercy Rule:** 45+ point lead at half = game over
- **All Players Eligible:** Everyone can catch passes

### Championship Venue
🏟️ **AT&T Stadium, Arlington** - All state championship games


## 📊 Data Sources
- **MaxPreps** - UIL official partner, scores/schedules/stats
- **UIL** - Official brackets, alignments, rules
- **Dave Campbell's Texas Football** - Rankings, predictions

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Hosting:** Vercel
- **Data:** API routes with caching

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   └── page.tsx      # Main scoreboard page
├── components/       # React components
│   ├── Header.tsx
│   ├── ClassificationCard.tsx
│   └── GameCard.tsx
└── lib/              # Utilities and constants
    ├── constants.ts  # Classifications, teams, etc.
    ├── types.ts      # TypeScript interfaces
    └── maxpreps.ts   # Data fetching utilities
```

## 🔗 Related
- [Pro Sports Tracker](https://www.wright-sports.com) - NFL, NBA, NHL, MLB, College

---
*Built with ❤️ for Texas Football*
