

// Enhanced GameCard with all enhancements
import React, { useEffect, useState } from 'react';
import { firecrawlSearch } from '@/lib/firecrawl';
import { calculateConfidenceScore } from '@/lib/confidenceScore';
import { MapPin, Tv } from 'lucide-react';
import { CLASSIFICATIONS } from '@/lib/constants';
import type { Game, LiveGame } from '@/lib/types';

interface GameCardProps {
  game: Game | LiveGame;
  onClick?: () => void;
}

function isLiveGame(game: Game | LiveGame): game is LiveGame {
  return 'lastScorer' in game || 'situation' in game;
}

export default function GameCard({ game, onClick }: GameCardProps) {

  const [confidence, setConfidence] = useState<number | null>(null);
  const [websiteData, setWebsiteData] = useState<any>(null);
  function isPlaceholderTeam(name: string) {
    const placeholders = [
      'Team Stars', 'Team Stripes', 'World', 'TBD', 'Team USA', 'Team World', 'All-Stars', 'All Star', 'All-Star', 'Rising Stars', 'Celebrity', 'G League', 'NBA G League', 'Skills Challenge', '3-Point', 'Slam Dunk', 'Team', 'Unknown', 'Exhibition'
    ];
    return placeholders.some(ph => name.toLowerCase().includes(ph.toLowerCase()));
  }

  // Filter: do not render if either team is a placeholder
  if (isPlaceholderTeam(game.homeTeam.name) || isPlaceholderTeam(game.awayTeam.name)) {
    return null;
  }
  const [mismatches, setMismatches] = useState<string[]>([]);
  const [injuryInfo, setInjuryInfo] = useState<string | null>(null);
  const [playByPlay, setPlayByPlay] = useState<string[]>([]);
  const [odds, setOdds] = useState<{ line: string, homeProb: number, awayProb: number } | null>(null);
  const [sentiment, setSentiment] = useState<{ score: number, summary: string } | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [teamForm, setTeamForm] = useState<{ home: string[], away: string[] } | null>(null);
  const [standingsImpact, setStandingsImpact] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<{ home: string[], away: string[] } | null>(null);
  const [attendance, setAttendance] = useState<string | null>(null);
  const [broadcastInfo, setBroadcastInfo] = useState<string | null>(null);
  const [polls, setPolls] = useState<string[]>([]);
  const [injuryAlerts, setInjuryAlerts] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamForm() {
      // Query Firecrawl for recent team form (last 5 games)
      const homeFormQuery = `${game.homeTeam.name} last 5 games results ${game.date}`;
      const awayFormQuery = `${game.awayTeam.name} last 5 games results ${game.date}`;
      const homeResult = await firecrawlSearch(homeFormQuery, 1);
      const awayResult = await firecrawlSearch(awayFormQuery, 1);
      const parseForm = (markdown: string) => markdown.split('\n').filter((l: string) => /win|loss|draw|score|result/i.test(l)).slice(0, 5);
      setTeamForm({
        home: homeResult.success && homeResult.data && homeResult.data.length > 0 ? parseForm(homeResult.data[0].markdown || '') : [],
        away: awayResult.success && awayResult.data && awayResult.data.length > 0 ? parseForm(awayResult.data[0].markdown || '') : []
      });
    }
    async function fetchStandingsImpact() {
      // Query Firecrawl for standings impact
      const impactQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} standings impact ${game.date}`;
      const impactResult = await firecrawlSearch(impactQuery, 1);
      if (impactResult.success && impactResult.data && impactResult.data.length > 0) {
        const impactMarkdown = impactResult.data[0].markdown || '';
        // Extract summary line
        const summary = impactMarkdown.split('\n').find((l: string) => /impact|standings|playoff|seed|rank/i.test(l));
        setStandingsImpact(summary || null);
      } else {
        setStandingsImpact(null);
      }
    }
    async function fetchSentiment() {
      // Query Firecrawl for fan sentiment
      const sentimentQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} fan sentiment social media ${game.date}`;
      const sentimentResult = await firecrawlSearch(sentimentQuery, 1);
      if (sentimentResult.success && sentimentResult.data && sentimentResult.data.length > 0) {
        const sentimentMarkdown = sentimentResult.data[0].markdown || '';
        // Simple sentiment scoring: count positive/negative words
        const posWords = ['win', 'great', 'awesome', 'love', 'excited', 'happy', 'dominate', 'lead'];
        const negWords = ['lose', 'bad', 'hate', 'sad', 'worried', 'injury', 'struggle', 'behind'];
        let pos = 0, neg = 0;
        sentimentMarkdown.split('\n').forEach((line: string) => {
          posWords.forEach(w => { if (line.toLowerCase().includes(w)) pos++; });
          negWords.forEach(w => { if (line.toLowerCase().includes(w)) neg++; });
        });
        const score = pos + neg > 0 ? Math.round((pos / (pos + neg)) * 100) : 50;
        setSentiment({ score, summary: `Positive: ${pos}, Negative: ${neg}` });
      } else {
        setSentiment(null);
      }
    }
    async function fetchHighlights() {
      // Query Firecrawl for highlight video links
      const highlightQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} video highlights ${game.date}`;
      const highlightResult = await firecrawlSearch(highlightQuery, 1);
      if (highlightResult.success && highlightResult.data && highlightResult.data.length > 0) {
        const highlightMarkdown = highlightResult.data[0].markdown || '';
        // Extract URLs from markdown
        const links = highlightMarkdown.match(/https?:\/\/[^\s]+/g) || [];
        setHighlights(links.slice(0, 3));
      } else {
        setHighlights([]);
      }
    }
    async function fetchOdds() {
      // Query Firecrawl for sportsbook odds
      const oddsQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} odds sportsbook ${game.date}`;
      const oddsResult = await firecrawlSearch(oddsQuery, 1);
      if (oddsResult.success && oddsResult.data && oddsResult.data.length > 0) {
        const oddsMarkdown = oddsResult.data[0].markdown || '';
        // Example: parse lines like "SEA -7.5 (-110) NE +7.5 (+110)"
        const lineMatch = oddsMarkdown.match(/([A-Z]{2,})\s*([+-]?\d+\.?\d*)\s*\(([-+]?\d+)\).*([A-Z]{2,})\s*([+-]?\d+\.?\d*)\s*\(([-+]?\d+)\)/);
        if (lineMatch) {
          // Parse implied probabilities from American odds
          function impliedProb(odds: number) {
            return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
          }
          const homeProb = impliedProb(parseInt(lineMatch[3], 10));
          const awayProb = impliedProb(parseInt(lineMatch[6], 10));
          setOdds({ line: lineMatch[0], homeProb: Math.round(homeProb * 100), awayProb: Math.round(awayProb * 100) });
        } else {
          setOdds(null);
        }
      } else {
        setOdds(null);
      }
    }
    async function checkConfidence() {
      // Query Firecrawl for relevant sports data
      const query = `${game.homeTeam.name} vs ${game.awayTeam.name} score ${game.date}`;
      const result = await firecrawlSearch(query, 1);
      if (result.success && result.data && result.data.length > 0) {
        // Example: parse scores from markdown (simple demo)
        const markdown = result.data[0].markdown || '';
        // TODO: Replace with robust parsing for all fields
        const scoreMatch = markdown.match(/(\d+)\s*-\s*(\d+)/);
        let fcData: any = {};
        if (scoreMatch) {
          fcData = {
            homeScore: parseInt(scoreMatch[2], 10),
            awayScore: parseInt(scoreMatch[1], 10),
            // Add more fields as parsed
          };
        }
        setWebsiteData(fcData);
        const { score, mismatches } = calculateConfidenceScore(game, fcData);
        setConfidence(score);
        setMismatches(mismatches);
      } else {
        setConfidence(null);
        setMismatches([]);
      }
    }
    async function fetchInjuryInfo() {
      // Query Firecrawl for injury updates
      const injuryQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} injury report ${game.date}`;
      const injuryResult = await firecrawlSearch(injuryQuery, 1);
      if (injuryResult.success && injuryResult.data && injuryResult.data.length > 0) {
        // Simple extraction: look for 'injury' or 'out' in markdown
        const injuryMarkdown = injuryResult.data[0].markdown || '';
        const injuryLines = injuryMarkdown.split('\n').filter((line: string) => /injury|out|questionable|probable|doubtful/i.test(line));
        setInjuryInfo(injuryLines.length > 0 ? injuryLines.join(' | ') : null);
      } else {
        setInjuryInfo(null);
      }
    }
    async function fetchPlayByPlay() {
      // Query Firecrawl for play-by-play commentary
      const pbpQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} play by play ${game.date}`;
      const pbpResult = await firecrawlSearch(pbpQuery, 1);
      if (pbpResult.success && pbpResult.data && pbpResult.data.length > 0) {
        const pbpMarkdown = pbpResult.data[0].markdown || '';
        // Extract lines that look like play-by-play (e.g., time stamps, quarters, or key events)
        const pbpLines = pbpMarkdown.split('\n').map((l: string) => l.trim()).filter((line: string) => line && (/\d{1,2}:[0-5]\d|Q\d|1st|2nd|3rd|4th|Touchdown|Field Goal|Interception|Fumble|Kickoff|Drive|scored|turnover/i.test(line)));
        setPlayByPlay(pbpLines.slice(0, 6)); // show up to 6 recent lines
      } else {
        setPlayByPlay([]);
      }
    }

    checkConfidence();
    fetchInjuryInfo();
    fetchPlayByPlay();
    fetchOdds();
    fetchSentiment();
    fetchHighlights();
    fetchTeamForm();
    fetchStandingsImpact();
    async function fetchPlayerStats() {
      // Query Firecrawl for player stats
      const homeStatsQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} top player stats ${game.date}`;
      const awayStatsQuery = `${game.awayTeam.name} vs ${game.homeTeam.name} top player stats ${game.date}`;
      const homeResult = await firecrawlSearch(homeStatsQuery, 1);
      const awayResult = await firecrawlSearch(awayStatsQuery, 1);
      const parseStats = (markdown: string) => markdown.split('\n').filter((l: string) => /stat|score|td|yard|run|pass|catch|tackle|int|sack|fg|xp/i.test(l)).slice(0, 5);
      setPlayerStats({
        home: homeResult.success && homeResult.data && homeResult.data.length > 0 ? parseStats(homeResult.data[0].markdown || '') : [],
        away: awayResult.success && awayResult.data && awayResult.data.length > 0 ? parseStats(awayResult.data[0].markdown || '') : []
      });
    }
    async function fetchAttendance() {
      // Query Firecrawl for attendance
      const attendanceQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} attendance ${game.date}`;
      const attendanceResult = await firecrawlSearch(attendanceQuery, 1);
      if (attendanceResult.success && attendanceResult.data && attendanceResult.data.length > 0) {
        const attendanceMarkdown = attendanceResult.data[0].markdown || '';
        // Extract attendance number or summary
        const match = attendanceMarkdown.match(/\b(\d{4,6})\b/);
        setAttendance(match ? `Attendance: ${match[1]}` : attendanceMarkdown.split('\n')[0]);
      } else {
        setAttendance(null);
      }
    }
    fetchPlayerStats();
    fetchAttendance();
    async function fetchBroadcastInfo() {
      // Query Firecrawl for broadcast info
      const broadcastQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} broadcast info ${game.date}`;
      const broadcastResult = await firecrawlSearch(broadcastQuery, 1);
      if (broadcastResult.success && broadcastResult.data && broadcastResult.data.length > 0) {
        const broadcastMarkdown = broadcastResult.data[0].markdown || '';
        setBroadcastInfo(broadcastMarkdown.split('\n')[0]);
      } else {
        setBroadcastInfo(null);
      }
    }
    async function fetchPolls() {
      // Query Firecrawl for fan polls
      const pollQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} fan poll ${game.date}`;
      const pollResult = await firecrawlSearch(pollQuery, 1);
      if (pollResult.success && pollResult.data && pollResult.data.length > 0) {
        const pollMarkdown = pollResult.data[0].markdown || '';
        setPolls(pollMarkdown.split('\n').filter((l: string) => /poll|vote|question/i.test(l)).slice(0, 3));
      } else {
        setPolls([]);
      }
    }
    async function fetchInjuryAlerts() {
      // Query Firecrawl for injury alerts
      const alertQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} injury alert ${game.date}`;
      const alertResult = await firecrawlSearch(alertQuery, 1);
      if (alertResult.success && alertResult.data && alertResult.data.length > 0) {
        const alertMarkdown = alertResult.data[0].markdown || '';
        setInjuryAlerts(alertMarkdown.split('\n').filter((l: string) => /alert|injury|out|update/i.test(l)).slice(0, 3));
      } else {
        setInjuryAlerts([]);
      }
    }
    async function fetchPhotos() {
      // Query Firecrawl for game photos
      const photoQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} game photos ${game.date}`;
      const photoResult = await firecrawlSearch(photoQuery, 1);
      if (photoResult.success && photoResult.data && photoResult.data.length > 0) {
        const photoMarkdown = photoResult.data[0].markdown || '';
        const links = photoMarkdown.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif)/gi) || [];
        setPhotos(links.slice(0, 3));
      } else {
        setPhotos([]);
      }
    }
    async function fetchAiInsights() {
      // Query Firecrawl for AI insights
      const aiQuery = `${game.homeTeam.name} vs ${game.awayTeam.name} ai insights ${game.date}`;
      const aiResult = await firecrawlSearch(aiQuery, 1);
      if (aiResult.success && aiResult.data && aiResult.data.length > 0) {
        const aiMarkdown = aiResult.data[0].markdown || '';
        setAiInsights(aiMarkdown.split('\n')[0]);
      } else {
        setAiInsights(null);
      }
    }
    fetchBroadcastInfo();
    fetchPolls();
    fetchInjuryAlerts();
    fetchPhotos();
    fetchAiInsights();
  }, [game]);
  const classification = CLASSIFICATIONS.find((c) => c.id === game.classification);
  const isLive = game.status === 'in_progress' || game.status === 'halftime';
  const isFinal = game.status === 'final';
  const isUpcoming = !isLive && !isFinal;

  // Format game time
  const formatGameTime = () => {
    if (isFinal) return 'FINAL';
    if (game.status === 'halftime') return 'HALFTIME';
    if (isLive && (game as LiveGame).quarter && (game as LiveGame).timeRemaining) {
      return `Q${(game as LiveGame).quarter} ${(game as LiveGame).timeRemaining}`;
    }
    return game.time;
  };

  // Example enhancements: venue, TV, weather, odds, quick actions, etc.
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 mb-2">
        {classification && (
          <span className="text-xs font-bold bg-orange-600/20 text-orange-500 px-2 py-1 rounded">
            {classification.name}
          </span>
        )}
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
          </span>
        )}
        {isFinal && <span className="text-xs text-gray-400">FINAL</span>}
      </div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-lg font-bold text-white">
          {game.awayTeam.name} <span className="text-gray-400">@</span> {game.homeTeam.name}
        </div>
        <div className="flex gap-2 items-center">
          {confidence !== null && confidence < 95 && websiteData ? (
            <>
              <span className="font-bold text-red-400 text-xl">{websiteData.awayScore ?? game.awayScore}</span>
              <span className="text-gray-500">-</span>
              <span className="font-bold text-red-400 text-xl">{websiteData.homeScore ?? game.homeScore}</span>
            </>
          ) : (
            <>
              <span className="font-bold text-white text-xl">{game.awayScore}</span>
              <span className="text-gray-500">-</span>
              <span className="font-bold text-white text-xl">{game.homeScore}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
        <span>{game.date}</span>
        <span>&bull;</span>
        <span>{formatGameTime()}</span>
        {game.venue && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{game.venue}</span>
        )}
        {/* Example: TV info */}
        {typeof (game as any).tv === 'string' && (game as any).tv && (
          <span className="flex items-center gap-1"><Tv className="w-3 h-3" />{(game as any).tv}</span>
        )}
      </div>
      {/* Confidence Badge UI */}
      {confidence !== null && (
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${confidence >= 95 ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>Confidence: {confidence}%</span>
          {confidence < 95 && mismatches.length > 0 && (
            <span className="text-xs text-red-300">Mismatched fields: {mismatches.join(', ')}</span>
          )}
        </div>
      )}
      {/* Injury Updates Enhancement */}
      {injuryInfo && (
        <div className="mt-2 text-xs text-orange-400 font-semibold">Injury Update: {injuryInfo}</div>
      )}
      {/* Odds & Betting Lines Enhancement */}
      {odds && (
        <div className="mt-2 text-xs text-purple-300 font-semibold">
          <div>Bookmaker Odds: {odds.line}</div>
          <div>Implied Win Probability: <span className="text-green-400">{game.homeTeam.name}: {odds.homeProb}%</span> <span className="text-red-400">{game.awayTeam.name}: {odds.awayProb}%</span></div>
        </div>
      )}

      {/* Team Form Enhancement */}
      {teamForm && (teamForm.home.length > 0 || teamForm.away.length > 0) && (
        <div className="mt-2 text-xs text-cyan-300 font-semibold">
          <div>Recent Form</div>
          <div className="flex gap-4">
            <div><span className="font-bold">{game.homeTeam.name}:</span> {teamForm.home.join(' | ')}</div>
            <div><span className="font-bold">{game.awayTeam.name}:</span> {teamForm.away.join(' | ')}</div>
          </div>
        </div>
      )}

      {/* Player Stats Enhancement */}
      {playerStats && (playerStats.home.length > 0 || playerStats.away.length > 0) && (
        <div className="mt-2 text-xs text-indigo-300 font-semibold">
          <div>Top Player Stats</div>
          <div className="flex gap-4">
            <div><span className="font-bold">{game.homeTeam.name}:</span> {playerStats.home.join(' | ')}</div>
            <div><span className="font-bold">{game.awayTeam.name}:</span> {playerStats.away.join(' | ')}</div>
          </div>
        </div>
      )}

      {/* Attendance Enhancement */}
      {attendance && (
        <div className="mt-2 text-xs text-teal-300 font-semibold">
          <div>{attendance}</div>
        </div>
      )}

      {/* Broadcast Info Enhancement */}
      {broadcastInfo && (
        <div className="mt-2 text-xs text-blue-400 font-semibold">
          <div>Broadcast Info: {broadcastInfo}</div>
        </div>
      )}

      {/* Fan Polls Enhancement */}
      {polls && polls.length > 0 && (
        <div className="mt-2 text-xs text-pink-400 font-semibold">
          <div>Fan Polls</div>
          <ul className="list-disc ml-4">
            {polls.map((poll, idx) => (
              <li key={idx}>{poll}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Injury Alerts Enhancement */}
      {injuryAlerts && injuryAlerts.length > 0 && (
        <div className="mt-2 text-xs text-orange-300 font-semibold">
          <div>Injury Alerts</div>
          <ul className="list-disc ml-4">
            {injuryAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Game Photos Enhancement */}
      {photos && photos.length > 0 && (
        <div className="mt-2 text-xs text-yellow-400 font-semibold">
          <div>Game Photos</div>
          <div className="flex gap-2 mt-1">
            {photos.map((url, idx) => (
              <img key={url} src={url} alt={`Game Photo ${idx + 1}`} className="rounded h-16 w-24 object-cover border border-gray-700" />
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Enhancement */}
      {aiInsights && (
        <div className="mt-2 text-xs text-green-400 font-semibold">
          <div>AI Insights: {aiInsights}</div>
        </div>
      )}

      {/* Standings Impact Enhancement */}
      {standingsImpact && (
        <div className="mt-2 text-xs text-lime-300 font-semibold">
          <div>Standings Impact</div>
          <div>{standingsImpact}</div>
        </div>
      )}

      {/* Fan Sentiment Bar */}
      {sentiment && (
        <div className="mt-2 text-xs text-pink-300 font-semibold">
          <div>Fan Sentiment</div>
          <div className="sentiment-bar" style={{ width: '100%', height: 16, background: '#eee', borderRadius: 8 }}>
            <div style={{ width: `${sentiment.score}%`, height: '100%', background: sentiment.score > 60 ? '#4caf50' : sentiment.score < 40 ? '#f44336' : '#ffeb3b', borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{sentiment.summary} (Score: {sentiment.score}%)</div>
        </div>
      )}

      {/* Highlight Video Links */}
      {highlights && highlights.length > 0 && (
        <div className="mt-2 text-xs text-yellow-300 font-semibold">
          <div>Video Highlights</div>
          <ul className="list-disc ml-4">
            {highlights.map((url, idx) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">Highlight {idx + 1}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Live Play-by-Play Commentary */}
      {playByPlay && playByPlay.length > 0 && (
        <div className="mt-2 text-xs text-blue-300 font-mono">
          <div className="font-semibold text-blue-400 mb-1">Live Play-by-Play</div>
          <ul className="list-disc ml-4">
            {playByPlay.map((line, idx) => (
              <li key={idx} className="truncate">{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
