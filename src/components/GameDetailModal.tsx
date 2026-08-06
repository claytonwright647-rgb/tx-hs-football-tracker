'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FootballField } from './fields';
import GameHighlights from './GameHighlights';

interface GameDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    homeAbbrev?: string;
    awayAbbrev?: string;
    homeColor?: string;
    awayColor?: string;
    status?: string;
    venue?: string;
    date?: string;
    time?: string;
    hasPublishedTime?: boolean;
    isScrimmage?: boolean;
    classification?: string;
    id?: string;
    scheduleVerification?: {
      status: 'confirmed' | 'conflict';
      sourceName: string;
      sourceUrl: string;
      checkedAt: string;
      note: string;
      unconfirmedFields?: Array<'date' | 'time' | 'venue' | 'homeAway'>;
    };
    // Live game situation (when available)
    situation?: {
      down?: number;
      distance?: number;
      yardLine?: number;
      yardsToEndzone?: number;
      possession?: string;
      isRedZone?: boolean;
      downDistanceText?: string;
    };
  } | null;
}

function scheduleLabel(date?: string, time?: string, hasPublishedTime = false): string {
  if (!date) return 'Schedule unavailable';
  const parsed = new Date(hasPublishedTime && time ? time : `${date}T12:00:00-05:00`);
  if (Number.isNaN(parsed.getTime())) return hasPublishedTime ? `${date} · ${time}` : `${date} · Time TBA`;
  const formatted = parsed.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: hasPublishedTime ? 'numeric' : undefined,
    minute: hasPublishedTime ? '2-digit' : undefined,
    timeZone: 'America/Chicago',
    timeZoneName: hasPublishedTime ? 'short' : undefined,
  });
  return hasPublishedTime ? formatted : `${formatted} · Time TBA`;
}

export default function GameDetailModal({ isOpen, onClose, game }: GameDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !game) return null;

  const isLive = ['in', 'live', 'in_progress', 'halftime'].includes(game.status || '');
  const isHalftime = game.status === 'halftime';
  const isFinal = game.status === 'final' || game.status === 'post';
  const isSixMan = /\b1A\b/.test(game.classification || '');
  const fieldLength = isSixMan ? 80 : 100;
  const hasCompleteLiveSituation = isLive
    && Boolean(game.situation?.possession)
    && Number.isInteger(game.situation?.down)
    && Number.isFinite(game.situation?.distance)
    && Number.isFinite(game.situation?.yardsToEndzone)
    && Number(game.situation?.yardsToEndzone) >= 0
    && Number(game.situation?.yardsToEndzone) <= fieldLength;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="game-detail-title" className="relative bg-gray-900 border border-gray-700 w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/20 to-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-orange-600/20 text-orange-500 px-2 py-1 rounded">
              {game.classification || 'TX HS Football'}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {isHalftime ? 'HALFTIME' : 'LIVE'}
              </span>
            )}
            {isFinal && (
              <span className="text-xs text-gray-400">FINAL</span>
            )}
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close game details" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Score Section */}
        <div className="p-6 bg-gray-800/30">
          <h2 id="game-detail-title" className="sr-only">{game.awayTeam} at {game.homeTeam}</h2>
          {/* Venue */}
          <div className="text-center text-sm text-gray-400 mb-4">
            🏟️ {game.venue || 'Venue not published by source'}
          </div>
          
          {/* Teams & Score */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            {/* Away Team */}
            <div className="text-center">
              <div className="text-lg font-bold text-white">{game.awayTeam}</div>
              {game.awayAbbrev && <div className="text-xs text-gray-500">{game.awayAbbrev}</div>}
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-white sm:text-5xl">
                {game.awayScore ?? '-'}
              </span>
              <span className="text-2xl text-gray-600">-</span>
              <span className="text-4xl font-bold text-white sm:text-5xl">
                {game.homeScore ?? '-'}
              </span>
            </div>
            
            {/* Home Team */}
            <div className="text-center">
              <div className="text-lg font-bold text-white">{game.homeTeam}</div>
              {game.homeAbbrev && <div className="text-xs text-gray-500">{game.homeAbbrev}</div>}
            </div>
          </div>

          {/* Game Time/Date for upcoming */}
          {!isLive && !isFinal && game.date && (
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>📅 {scheduleLabel(game.date, game.time, game.hasPublishedTime)}</p>
              {game.isScrimmage && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                  Preseason scrimmage · does not count in the regular-season record
                </p>
              )}
            </div>
          )}
        </div>

        {game.scheduleVerification && (
          <div className={`mx-4 mt-4 rounded-lg border px-4 py-3 text-sm ${game.scheduleVerification.status === 'conflict' ? 'border-amber-500/40 bg-amber-950/25 text-amber-100' : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100'}`}>
            <p className="font-bold">
              {game.scheduleVerification.status === 'conflict' ? '⚠ Schedule details conflict' : '✓ School schedule verified'}
            </p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">{game.scheduleVerification.note}</p>
            <a className="mt-2 inline-block text-xs font-semibold underline underline-offset-2" href={game.scheduleVerification.sourceUrl} target="_blank" rel="noreferrer">
              Source: {game.scheduleVerification.sourceName}
            </a>
          </div>
        )}

        {/* Football Field Visualization */}
        <div className="p-4 border-t border-gray-700">
          {hasCompleteLiveSituation ? (
            <FootballField
              situation={game.situation}
              format={isSixMan ? 'six-man' : 'eleven-man'}
              homeTeam={{
                abbreviation: game.homeAbbrev || 'HOME',
                color: game.homeColor,
                name: game.homeTeam
              }}
              awayTeam={{
                abbreviation: game.awayAbbrev || 'AWAY',
                color: game.awayColor,
                name: game.awayTeam
              }}
            />
          ) : (
            <div className="rounded-lg border border-gray-700 bg-gray-950/60 px-4 py-5 text-center text-sm text-gray-300">
              {isSixMan
                ? 'Six-man field position unavailable — the official source has not published complete possession, down, distance, and 80-yard-field location data.'
                : 'Field position unavailable — the official source has not published complete possession, down, distance, and location data.'}
            </div>
          )}
        </div>

        {/* Game Highlights Section - Only show for completed games */}
        {isFinal && game.id && (
          <div className="p-4 border-t border-gray-700">
            <GameHighlights
              gameId={game.id}
              status={game.status || 'final'}
            />
          </div>
        )}

        {/* Info Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-center text-xs text-gray-500">
            {isLive 
              ? 'Live scores update automatically. Clock, possession, down, distance, and field position appear only when the official source reports them.'
              : isFinal 
                ? 'Game completed' 
                : 'Field position appears only when the official source publishes possession, down, distance, and location.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
