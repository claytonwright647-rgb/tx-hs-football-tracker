**Project State Document**

**Purpose:**
The Texas High School Football Tracker is a web application designed to provide live scores, standings, playoffs, and rankings for high school football teams in Texas.

**Stack:**

* Framework: Next.js 16 (App Router)
* Styling: Tailwind CSS
* Language: TypeScript
* Hosting: Vercel
* Data: API routes with caching

**How to Run:**
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

**Environment Variables (Names only):**

* None specified in the repo content.

**Deployment Flow:**

1. Develop and test changes locally
2. Build the application using `npm run build`
3. Deploy to Vercel using the `vercel` command

**Key Folders:**
```
src/
app/              # Next.js App Router pages
components/       # React components
lib/              # Utilities and constants
public/           # Static assets
```

**TODOs Found:**

* Implement live updates during games
* Add standings with playoff positioning
* Create state and regional rankings
* Develop team and player statistics
* Implement score alerts for favorite teams
* Send weekly game summaries via email

This project is still in development, and these TODOs are intended to guide future development efforts.