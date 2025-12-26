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


// Main Modal Component
export default function GamePreviewModal({ 
  game, 
  isOpen, 
  onClose, 
  previewData,
  isLoading = false 
}: GamePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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
              possession={game.situation.possession || ''}
              yardLine={game.situation.yardLine}
              yardsToEndzone={game.situation.yardsToEndzone}
              down={game.situation.down}
              distance={game.situation.distance}
              isRedZone={game.situation.isRedZone}
              homeTeam={game.homeAbbrev || game.homeTeam}
              awayTeam={game.awayAbbrev || game.awayTeam}
              homeColor={game.homeColor}
              awayColor={game.awayColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
