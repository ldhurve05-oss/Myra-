import React, { useState } from 'react';
import { Image, Check, Sparkles, X, Palette } from 'lucide-react';
import { MYRA_WALLPAPERS, MyraWallpaper } from '../utils/wallpapers';
import { sounds } from '../utils/audio';

interface WallpaperModalProps {
  currentWallpaperId: string;
  onSelectWallpaper: (wp: MyraWallpaper) => void;
  onClose: () => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  currentWallpaperId,
  onSelectWallpaper,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Wallpapers' },
    { id: 'romantic', label: 'Romantic 💕' },
    { id: 'cyberpunk', label: 'Cyberpunk 🌌' },
    { id: 'amoled', label: 'AMOLED 💎' },
    { id: 'cosmic', label: 'Cosmic 🔮' },
  ];

  const filtered =
    selectedCategory === 'all'
      ? MYRA_WALLPAPERS
      : MYRA_WALLPAPERS.filter(w => w.category === selectedCategory);

  const handlePick = (wp: MyraWallpaper) => {
    sounds.playCutePop();
    onSelectWallpaper(wp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Myra Dynamic Wallpapers
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {MYRA_WALLPAPERS.length} Wallpapers
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Choose aesthetic backgrounds & matching neon orb themes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-3 flex-1">
          {filtered.map(wp => {
            const isSelected = currentWallpaperId === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => handlePick(wp)}
                className={`relative rounded-2xl overflow-hidden aspect-[9/16] border-2 cursor-pointer transition-all duration-300 group shadow-lg ${
                  isSelected
                    ? 'border-pink-500 ring-2 ring-pink-500/50 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <img
                  src={wp.previewUrl}
                  alt={wp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg animate-in zoom-in-50">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Name & Accent Color Bar */}
                <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {wp.name}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: wp.accentColor }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tap any wallpaper to apply live</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
