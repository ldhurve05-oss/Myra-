import React, { useState } from 'react';
import { Play, Pause, ExternalLink, X, Music, Volume2, Sparkles, Youtube } from 'lucide-react';

interface YouTubeWidgetProps {
  query: string;
  title?: string;
  onClose: () => void;
  onPlayNewSong: (songQuery: string) => void;
}

export const YouTubeWidget: React.FC<YouTubeWidgetProps> = ({
  query,
  title,
  onClose,
  onPlayNewSong,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const displayTitle = title || query || 'Bollywood Melodies';
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  // Safe embed search query
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
    query
  )}&autoplay=1`;

  const quickSongs = [
    'Kesariya Brahmastra',
    'Chaleya Jawan',
    'Tum Hi Ho Arijit',
    'Apna Bana Le Bhediya',
    'Heeriye Jasleen',
  ];

  return (
    <div className="w-full my-3 px-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-red-950/40 border border-red-500/30 p-3.5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Youtube className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">YouTube Music Player</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                Auto-playing: {displayTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-600/80 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
              title="Open in YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video / Music Embed View */}
        {!isMinimized && (
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video w-full shadow-inner relative group">
            <iframe
              src={embedUrl}
              title={`YouTube video player - ${query}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Controls & Quick songs */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
          <div className="flex items-center gap-2">
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition active:scale-95"
            >
              <Youtube className="w-3 h-3 fill-white" />
              Open YouTube App
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
            >
              {isMinimized ? 'Expand Video' : 'Mini Player'}
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
            <span>Volume 80%</span>
          </div>
        </div>

        {/* Quick Songs Shelf */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] no-scrollbar">
          <span className="text-slate-500 font-medium whitespace-nowrap">Play Next:</span>
          {quickSongs.map(song => (
            <button
              key={song}
              onClick={() => onPlayNewSong(song)}
              className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-red-500/20 hover:border-red-500/40 border border-slate-700/60 text-slate-300 hover:text-white transition whitespace-nowrap active:scale-95"
            >
              🎵 {song}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
