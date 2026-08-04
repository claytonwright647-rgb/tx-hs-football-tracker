'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Video, ExternalLink } from 'lucide-react';

interface HighlightVideo {
  id: string;
  title: string;
  source: 'youtube' | 'espn' | 'maxpreps' | 'local';
  url: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  uploadedDate?: string;
}

interface GameHighlightsProps {
  gameId: string;
  status: string; // 'final' | 'completed' | 'post'
}

interface HighlightsResponse {
  success: boolean;
  available?: boolean;
  highlights?: HighlightVideo[];
  message?: string;
  error?: string;
}

export default function GameHighlights({ gameId, status }: GameHighlightsProps) {
  const [highlights, setHighlights] = useState<HighlightVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<HighlightVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFinal = status === 'final' || status === 'post' || status === 'completed';

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch highlights from API
      const response = await fetch(`/api/highlights?gameId=${gameId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch highlights');
      }

      const data = await response.json() as HighlightsResponse;
      if (!data.success) {
        throw new Error(data.error || 'The highlights source did not return a usable response');
      }
      setHighlights(data.highlights || []);
      setError(data.available === false ? (data.message || 'Verified highlights are not available for this game.') : null);
    } catch (err) {
      console.error('Error fetching highlights:', err);
      setHighlights([]);
      setError(err instanceof Error ? err.message : 'Verified highlights could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (isFinal) {
      fetchHighlights();
    }
  }, [fetchHighlights, isFinal]);

  if (!isFinal) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Highlights Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <Video className="w-5 h-5 text-orange-500" />
        <h3 className="text-xl font-bold text-white">Game Highlights & Replays</h3>
      </div>

      {error && (
        <div role="status" className="mb-4 rounded-lg border border-amber-700/30 bg-amber-900/20 p-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-400">Loading highlights...</div>
        </div>
      )}

      {!loading && !error && highlights.length === 0 && (
        <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50 text-center">
          <p className="text-gray-400">No verified highlights are available for this game.</p>
        </div>
      )}

      {!loading && highlights.length > 0 && (
        <>
          {/* Video Player */}
          {selectedVideo && (
            <div className="mb-6 p-4 bg-black rounded-lg border border-gray-700">
              <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {selectedVideo.source === 'youtube' ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedVideo.url.replace('watch?v=', 'embed/')}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gray-900">
                    <Play className="w-12 h-12 text-gray-600" />
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      <span>Watch on {selectedVideo.source}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">{selectedVideo.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{selectedVideo.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {selectedVideo.duration && <span>⏱️ {selectedVideo.duration}</span>}
                    {selectedVideo.uploadedDate && <span>📅 {selectedVideo.uploadedDate}</span>}
                  </div>
                </div>
                {selectedVideo.source !== 'youtube' && (
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Highlights Thumbnails Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((highlight) => (
              <button
                key={highlight.id}
                onClick={() => setSelectedVideo(highlight)}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  selectedVideo?.id === highlight.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 hover:border-orange-500/50 bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center overflow-hidden relative">
                  {highlight.thumbnail ? (
                    <img
                      src={highlight.thumbnail}
                      alt={highlight.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Video className="w-12 h-12 text-gray-700" />
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  {/* Duration Badge */}
                  {highlight.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-medium">
                      {highlight.duration}
                    </div>
                  )}
                  {/* Source Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-orange-600/80 rounded text-xs text-white font-medium capitalize">
                    {highlight.source}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h5 className="text-sm font-bold text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {highlight.title}
                  </h5>
                  {highlight.description && (
                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{highlight.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* External Links */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-3">View more highlights on:</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.maxpreps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>MaxPreps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.espn.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>ESPN</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
