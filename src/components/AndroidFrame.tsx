import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Smartphone,
  Maximize2,
  Sparkles,
  Volume2,
  Heart,
  Minimize2,
  Palette,
  Smile,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isGfMode: boolean;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  wallpaperUrl?: string;
  bgClass?: string;
  onMinimizeToBubble?: () => void;
  onOpenWallpapers?: () => void;
  onOpenVoiceSettings?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isGfMode,
  isPhoneFrame,
  onToggleFrame,
  wallpaperUrl,
  bgClass = 'bg-slate-950',
  onMinimizeToBubble,
  onOpenWallpapers,
  onOpenVoiceSettings,
}) => {
  const [timeStr, setTimeStr] = useState('10:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Background ambient lighting with wallpaper blend */}
      {wallpaperUrl ? (
        <div
          className="fixed inset-0 pointer-events-none bg-cover bg-center opacity-30 transition-all duration-1000 blur-sm scale-105"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
        />
      ) : (
        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${
            isGfMode
              ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(236,72,153,0.22),rgba(15,23,42,0.95))]'
              : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.22),rgba(15,23,42,0.95))]'
          }`}
        />
      )}

      {/* Frame Mode Switcher & Background Bubble Floating Tools */}
      <header className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 flex items-center gap-2">
        {onOpenWallpapers && (
          <button
            onClick={onOpenWallpapers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 text-pink-300 hover:text-white shadow-lg transition active:scale-95 cursor-pointer"
            title="Myra Wallpapers"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Wallpapers</span>
          </button>
        )}

        {onOpenVoiceSettings && (
          <button
            onClick={onOpenVoiceSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 text-rose-300 hover:text-white shadow-lg transition active:scale-95 cursor-pointer"
            title="Cute Voice Settings"
          >
            <Smile className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Cute Voice</span>
          </button>
        )}

        {onMinimizeToBubble && (
          <button
            onClick={onMinimizeToBubble}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 text-emerald-300 hover:text-white shadow-lg transition active:scale-95 cursor-pointer"
            title="Minimize to Background Floating Bubble"
          >
            <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Float Bubble</span>
          </button>
        )}

        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white shadow-lg transition active:scale-95 cursor-pointer"
          title={isPhoneFrame ? 'Switch to Fullscreen View' : 'Switch to Android Phone View'}
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Android Frame</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container: Either Phone Frame or Fluid Full Container */}
      <div
        style={
          wallpaperUrl
            ? {
                backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.88), rgba(10, 15, 30, 0.94)), url(${wallpaperUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
        className={`w-full relative transition-all duration-500 ${bgClass} ${
          isPhoneFrame
            ? 'max-w-[420px] h-[92vh] max-h-[880px] rounded-[44px] border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(236,72,153,0.15)] flex flex-col overflow-hidden ring-1 ring-slate-700/50'
            : 'max-w-4xl min-h-screen sm:min-h-[90vh] rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col backdrop-blur-md overflow-hidden'
        }`}
      >
        {/* Android Top Bezel / Status Bar */}
        <div className="relative z-30 pt-2 px-6 pb-2 flex items-center justify-between text-xs text-slate-400 font-medium select-none bg-slate-950/70 backdrop-blur-md border-b border-slate-900/80">
          {/* Time & App Name */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{timeStr}</span>
            <span className="text-[10px] text-pink-400/80 flex items-center gap-0.5 font-bold">
              <Sparkles className="w-2.5 h-2.5" /> Myra AI
            </span>
          </div>

          {/* Android Punch Hole Camera */}
          {isPhoneFrame && (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-cyan-500/20" />
              </div>
            </div>
          )}

          {/* Android Status Icons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-wider text-slate-400 font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content Area with custom scroll */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>

        {/* Android Bottom Navigation Pill */}
        <div className="relative z-20 py-2.5 flex items-center justify-center select-none bg-slate-950/80 border-t border-slate-900">
          <div
            onClick={onMinimizeToBubble}
            className="w-32 h-1.5 rounded-full bg-slate-600/70 hover:bg-pink-500 transition cursor-pointer"
            title="Swipe up to minimize to floating bubble"
          />
        </div>
      </div>
    </div>
  );
};
