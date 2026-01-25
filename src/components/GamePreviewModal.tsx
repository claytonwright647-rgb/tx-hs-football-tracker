'use client';

import { useState, useEffect } from 'react';
import { 
  X, TrendingUp, Users, AlertTriangle, Trophy, Target, Clock, 
  ChevronRight, Flame, Shield, Activity, Calendar, MapPin,
  BarChart3, Star, Award, Hash, Building
} from 'lucide-react';
import { FootballField } from './fields';

// Types
interface GamePreviewModalProps {
  game: HSGame | null;
  isOpen: boolean;
  onClose: () => void;
  previewData?: HSGamePreviewData | null;
  isLoading?: boolean;
}

export interface HSGame {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbrev?: string;
  awayAbbrev?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogo?: string;
  awayLogo?: string;
  homeRecord?: string;
  awayRecord?: string;
  homeColor?: string;
  awayColor?: string;
  venue?: string;
  date?: string;
  time?: string;
  status?: string;
  classification?: string;
  district?: string;
  isPlayoff?: boolean;
  playoffRound?: string;
  situation?: {
    down?: number;
    distance?: number;
    yardLine?: number;
    yardsToEndzone?: number;
    possession?: string;
    isRedZone?: boolean;
    downDistanceText?: string;
  };
}

export interface HSGamePreviewData {
  // Rankings
  homeRanking?: { state: number; national: number };
  awayRanking?: { state: number; national: number };
  
  // Season Stats
  homeStats: HSTeamStats;
  awayStats: HSTeamStats;
  
  // Head-to-Head
  headToHead?: {
    allTime: { home: number; away: number };
    last5: Array<{ date: string; homeScore: number; awayScore: number; winner: string }>;
  };
  
  // Recent Form
  homeForm?: { last5: Array<{ result: 'W' | 'L'; score: string; opponent: string }>; streak: string };
  awayForm?: { last5: Array<{ result: 'W' | 'L'; score: string; opponent: string }>; streak: string };
  
  // Key Players
  homePlayers?: HSKeyPlayer[];
  awayPlayers?: HSKeyPlayer[];
  
  // Playoff context
  playoffImplications?: string;
}

interface HSTeamStats {
  pointsPerGame: number;
  pointsAllowedPerGame: number;
  rushingYPG?: number;
  passingYPG?: number;
  totalYPG?: number;
  turnoverMargin?: number;
}

interface HSKeyPlayer {
  name: string;
  position: string;
  number?: string;
  stats: Record<string, string | number>;
}

type TabType = 'overview' | 'matchup' | 'stats' | 'players';


// Win Probability Bar
function WinProbabilityBar({ homeProb, awayProb, homeColor, awayColor, homeName, awayName }: {
  homeProb: number;
  awayProb: number;
  homeColor: string;
  awayColor: string;
  homeName: string;
  awayName: string;
}) {
  return (
    <div className="w-full">
      <div className="h-8 rounded-full overflow-hidden flex shadow-inner bg-gray-700">
        <div 
          className="h-full flex items-center justify-start pl-3 transition-all duration-500"
          style={{ width: `${awayProb}%`, backgroundColor: awayColor || '#6366f1' }}
        >
          {awayProb >= 25 && <span className="text-white font-bold text-sm">{awayProb}%</span>}
        </div>
        <div 
          className="h-full flex items-center justify-end pr-3 transition-all duration-500"
          style={{ width: `${homeProb}%`, backgroundColor: homeColor || '#f97316' }}
        >
          {homeProb >= 25 && <span className="text-white font-bold text-sm">{homeProb}%</span>}
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>{awayName} {awayProb < 25 && `(${awayProb}%)`}</span>
        <span>{homeProb < 25 && `(${homeProb}%)`} {homeName}</span>
      </div>
    </div>
  );
}

// Stat Comparison Bar
function StatBar({ label, homeValue, awayValue, higherIsBetter = true }: {
  label: string;
  homeValue: number;
  awayValue: number;
  higherIsBetter?: boolean;
}) {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  const awayPercent = (awayValue / total) * 100;
  const homeWins = higherIsBetter ? homeValue > awayValue : homeValue < awayValue;
  const awayWins = higherIsBetter ? awayValue > homeValue : awayValue < homeValue;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={awayWins ? 'text-green-400 font-bold' : 'text-gray-400'}>{awayValue.toFixed(1)}</span>
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={homeWins ? 'text-green-400 font-bold' : 'text-gray-400'}>{homeValue.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex bg-gray-700">
        <div className={`h-full ${awayWins ? 'bg-green-500' : 'bg-gray-500'}`} style={{ width: `${awayPercent}%` }} />
        <div className={`h-full ${homeWins ? 'bg-green-500' : 'bg-gray-500'}`} style={{ width: `${homePercent}%` }} />
      </div>
    </div>
  );
}

// Form Dots
function FormDots({ form }: { form: { last5: Array<{ result: 'W' | 'L'; score: string; opponent: string }>; streak: string } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {form.last5.map((game, idx) => (
          <div 
            key={idx}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              game.result === 'W' ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={`${game.result} ${game.score} vs ${game.opponent}`}
          >
            {game.result}
          </div>
        ))}
      </div>
      <span className={`text-xs font-semibold ${form.streak.startsWith('W') ? 'text-green-400' : 'text-red-400'}`}>
        {form.streak}
      </span>
    </div>
  );
}


// ========== TAB COMPONENTS ==========

// Overview Tab - Quick summary
function OverviewTab({ game, data }: { game: HSGame; data?: HSGamePreviewData | null }) {
  return (
    <div className="space-y-4">
      {/* Quick Preview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Points Per Game</h4>
          <StatBar 
            label="PPG" 
            homeValue={data?.homeStats?.pointsPerGame || 0} 
            awayValue={data?.awayStats?.pointsPerGame || 0} 
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Points Allowed</h4>
          <StatBar 
            label="PA/G" 
            homeValue={data?.homeStats?.pointsAllowedPerGame || 0} 
            awayValue={data?.awayStats?.pointsAllowedPerGame || 0}
            higherIsBetter={false}
          />
        </div>
      </div>
      
      {/* Recent Form */}
      {(data?.homeForm || data?.awayForm) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-3">Recent Form</h4>
          <div className="space-y-3">
            {data?.awayForm && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{game.awayAbbrev || game.awayTeam}</span>
                <FormDots form={data.awayForm} />
              </div>
            )}
            {data?.homeForm && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{game.homeAbbrev || game.homeTeam}</span>
                <FormDots form={data.homeForm} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Playoff Implications */}
      {data?.playoffImplications && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Trophy className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">Playoff Implications</h4>
              <p className="text-sm text-gray-300">{data.playoffImplications}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Matchup Tab - Head-to-head comparison
function MatchupTab({ game, data }: { game: HSGame; data?: HSGamePreviewData | null }) {
  return (
    <div className="space-y-4">
      {/* Head to Head */}
      {data?.headToHead && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> All-Time Series
          </h4>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{data.headToHead.allTime.away}</div>
              <div className="text-sm text-gray-400">{game.awayAbbrev || game.awayTeam}</div>
            </div>
            <div className="text-gray-500">-</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{data.headToHead.allTime.home}</div>
              <div className="text-sm text-gray-400">{game.homeAbbrev || game.homeTeam}</div>
            </div>
          </div>
        </div>
      )}

      {/* Win Probability Estimate */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm text-gray-400 mb-3">Win Probability (Estimated)</h4>
        <WinProbabilityBar 
          homeProb={55} 
          awayProb={45}
          homeColor={game.homeColor || '#f97316'}
          awayColor={game.awayColor || '#6366f1'}
          homeName={game.homeAbbrev || game.homeTeam}
          awayName={game.awayAbbrev || game.awayTeam}
        />
      </div>

      {/* Last 5 Meetings */}
      {data?.headToHead?.last5 && data.headToHead.last5.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-3">Last 5 Meetings</h4>
          <div className="space-y-2">
            {data.headToHead.last5.map((meeting, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{meeting.date}</span>
                <span className={`font-semibold ${meeting.winner === game.homeTeam ? 'text-orange-400' : 'text-indigo-400'}`}>
                  {meeting.homeScore} - {meeting.awayScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Tab - Detailed statistics
function StatsTab({ game, data }: { game: HSGame; data?: HSGamePreviewData | null }) {
  const homeStats = data?.homeStats;
  const awayStats = data?.awayStats;

  return (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <h4 className="text-sm text-gray-400 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Offensive Stats
        </h4>
        <StatBar label="Points/Game" homeValue={homeStats?.pointsPerGame || 0} awayValue={awayStats?.pointsPerGame || 0} />
        <StatBar label="Total Yards/Game" homeValue={homeStats?.totalYPG || 0} awayValue={awayStats?.totalYPG || 0} />
        <StatBar label="Rush Yards/Game" homeValue={homeStats?.rushingYPG || 0} awayValue={awayStats?.rushingYPG || 0} />
        <StatBar label="Pass Yards/Game" homeValue={homeStats?.passingYPG || 0} awayValue={awayStats?.passingYPG || 0} />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <h4 className="text-sm text-gray-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Defensive Stats
        </h4>
        <StatBar label="Pts Allowed/Game" homeValue={homeStats?.pointsAllowedPerGame || 0} awayValue={awayStats?.pointsAllowedPerGame || 0} higherIsBetter={false} />
        <StatBar label="Turnover Margin" homeValue={homeStats?.turnoverMargin || 0} awayValue={awayStats?.turnoverMargin || 0} />
      </div>
    </div>
  );
}

// Players Tab - Key players
function PlayersTab({ game, data }: { game: HSGame; data?: HSGamePreviewData | null }) {
  const renderPlayerCard = (player: HSKeyPlayer, teamColor: string) => (
    <div key={player.name} className="bg-gray-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        {player.number && (
          <span className="text-xs bg-gray-600 px-2 py-0.5 rounded font-mono">#{player.number}</span>
        )}
        <span className="font-semibold text-white">{player.name}</span>
        <span className="text-xs text-gray-400">{player.position}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(player.stats).map(([key, value]) => (
          <span key={key} className="bg-gray-600/50 px-2 py-1 rounded">
            <span className="text-gray-400">{key}: </span>
            <span className="text-white font-semibold">{value}</span>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Away Team Players */}
      <div>
        <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" /> {game.awayAbbrev || game.awayTeam} Key Players
        </h4>
        <div className="space-y-2">
          {data?.awayPlayers?.map(player => renderPlayerCard(player, game.awayColor || '#6366f1'))}
          {(!data?.awayPlayers || data.awayPlayers.length === 0) && (
            <p className="text-sm text-gray-500">No player data available</p>
          )}
        </div>
      </div>

      {/* Home Team Players */}
      <div>
        <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" /> {game.homeAbbrev || game.homeTeam} Key Players
        </h4>
        <div className="space-y-2">
          {data?.homePlayers?.map(player => renderPlayerCard(player, game.homeColor || '#f97316'))}
          {(!data?.homePlayers || data.homePlayers.length === 0) && (
            <p className="text-sm text-gray-500">No player data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Modal Component
export default function GamePreviewModal({ 
  game, 
  isOpen, 
  onClose, 
  previewData,
  isLoading = false 
}: GamePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [brainAIPrediction, setBrainAIPrediction] = useState<{ homeWinProb: number; awayWinProb: number } | null>(null);
  const [brainAILoading, setBrainAILoading] = useState(false);

  // Fetch Brain AI predictions when modal opens
  useEffect(() => {
    if (!isOpen || !game || brainAIPrediction) return;

    const fetchBrainAIPredictions = async () => {
      setBrainAILoading(true);
      try {
        // Calculate ELO from record
        const homeWins = game.homeRecord ? parseInt(game.homeRecord.split('-')[0]) : 0;
        const awayWins = game.awayRecord ? parseInt(game.awayRecord.split('-')[0]) : 0;
        const homeELO = 1500 + (homeWins * 15);
        const awayELO = 1500 + (awayWins * 15);

        const res = await fetch(
          `/api/brain-ai/predictions?homeELO=${homeELO}&awayELO=${awayELO}&leagueId=hs-football`
        );
        
        if (res.ok) {
          const predData = await res.json();
          if (predData.success && predData.data) {
            setBrainAIPrediction({
              homeWinProb: Math.round(predData.data.homeWinProbability * 100),
              awayWinProb: Math.round(predData.data.awayWinProbability * 100),
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch Brain AI predictions:', err);
      } finally {
        setBrainAILoading(false);
      }
    };

    fetchBrainAIPredictions();
  }, [isOpen, game, brainAIPrediction]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab('overview');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !game) return null;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'matchup', label: 'Matchup', icon: Users },
    { id: 'stats', label: 'Stats', icon: Activity },
    { id: 'players', label: 'Players', icon: Star },
  ];

  const isLive = game.status === 'in' || game.status === 'live';
  const isFinal = game.status === 'final' || game.status === 'post';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[95vh] rounded-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/20 via-gray-900 to-orange-600/20 p-4 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Teams Display */}
              <div className="flex items-center justify-center gap-6 mb-3">
                {/* Away Team */}
                <div className="text-center">
                  {game.awayLogo && (
                    <img src={game.awayLogo} alt={game.awayTeam} className="w-14 h-14 mx-auto mb-1" />
                  )}
                  <div className="text-lg font-bold text-white">{game.awayAbbrev || game.awayTeam}</div>
                  <div className="text-xs text-gray-400">{game.awayRecord}</div>
                  {previewData?.awayRanking && (
                    <div className="text-xs text-yellow-400">#{previewData.awayRanking.state} TX</div>
                  )}
                </div>

                {/* Score/VS */}
                <div className="text-center">
                  {isLive || isFinal ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{game.awayScore}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-2xl font-bold text-white">{game.homeScore}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">VS</span>
                  )}
                  {isLive && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-500 text-xs font-semibold">LIVE</span>
                    </div>
                  )}
                  {isFinal && <span className="text-gray-500 text-xs">FINAL</span>}
                </div>

                {/* Home Team */}
                <div className="text-center">
                  {game.homeLogo && (
                    <img src={game.homeLogo} alt={game.homeTeam} className="w-14 h-14 mx-auto mb-1" />
                  )}
                  <div className="text-lg font-bold text-white">{game.homeAbbrev || game.homeTeam}</div>
                  <div className="text-xs text-gray-400">{game.homeRecord}</div>
                  {previewData?.homeRanking && (
                    <div className="text-xs text-yellow-400">#{previewData.homeRanking.state} TX</div>
                  )}
                </div>
              </div>

              {/* Game Info */}
              <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
                {game.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{game.date}</span>}
                {game.time && <span>{game.time}</span>}
                {game.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{game.venue}</span>}
                {game.classification && (
                  <span className="flex items-center gap-1 text-orange-400">
                    <Building className="w-3 h-3" />UIL {game.classification}
                  </span>
                )}
              </div>

              {/* Brain AI Prediction Badge */}
              {brainAIPrediction && !isLive && !isFinal && (
                <div className="mt-3 bg-purple-900/40 border border-purple-500/50 rounded-lg px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-300 text-xs">
                    <span>🧠</span>
                    <span>Brain AI: {brainAIPrediction.homeWinProb}% vs {brainAIPrediction.awayWinProb}%</span>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 bg-gray-800/50 px-2">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab game={game} data={previewData} />}
              {activeTab === 'matchup' && <MatchupTab game={game} data={previewData} />}
              {activeTab === 'stats' && <StatsTab game={game} data={previewData} />}
              {activeTab === 'players' && <PlayersTab game={game} data={previewData} />}
            </>
          )}
        </div>

        {/* Football Field for Live Games */}
        {isLive && game.situation && (
          <div className="border-t border-gray-700 p-4 bg-gray-800/50">
            <FootballField
              situation={{
                possession: game.situation.possession || '',
                yardLine: game.situation.yardLine,
                yardsToEndzone: game.situation.yardsToEndzone,
                down: game.situation.down,
                distance: game.situation.distance,
                isRedZone: game.situation.isRedZone,
                downDistanceText: game.situation.downDistanceText,
              }}
              homeTeam={{ abbreviation: game.homeAbbrev || game.homeTeam, color: game.homeColor }}
              awayTeam={{ abbreviation: game.awayAbbrev || game.awayTeam, color: game.awayColor }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
