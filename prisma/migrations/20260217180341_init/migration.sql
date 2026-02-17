-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mascot" TEXT,
    "city" TEXT NOT NULL,
    "school" TEXT,
    "classification" TEXT NOT NULL,
    "division" TEXT,
    "district" TEXT NOT NULL,
    "logo" TEXT,
    "colors" TEXT,
    "maxpreps_url" TEXT,
    "last_scraped" DATETIME
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "venue" TEXT,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "home_team_id" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_team_id" TEXT NOT NULL,
    "away_score" INTEGER,
    "is_district" BOOLEAN NOT NULL DEFAULT false,
    "is_playoff" BOOLEAN NOT NULL DEFAULT false,
    "playoff_round" TEXT,
    CONSTRAINT "games_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "games_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_maxpreps_url_key" ON "teams"("maxpreps_url");
