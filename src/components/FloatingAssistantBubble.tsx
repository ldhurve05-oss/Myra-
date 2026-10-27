import React, { useState } from 'react';
import { Mic, Heart, Sparkles, X, Maximize2, Volume2, ShieldCheck } from 'lucide-react';
import { AssistantStatus, MyraAvatar } from '../types/assistant';

interface FloatingAssistantBubbleProps {
  isMinimized: boolean;
  onExpand: () => void;
  status: AssistantStatus;
  isGfMode: boolean;
  onToggleMic: () => void;
  wakeWordActive: boolean;
  onToggleWakeWord: () => void;
  avatar?: MyraAvatar;
}

export const FloatingAssistantBubble: React.FC<FloatingAssistantBubbleProps> = ({
  isMinimized,
  onExpand,
  status,
  isGfMode,
  onToggleMic,
  wakeWordActive,
  onToggleWakeWord,
  avatar,
}) => {
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!isMinimized) return null;

  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x)),
      y: Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      className="select-none animate-in fade-in zoom-in-75 duration-300"
    >
      <div className="relative group flex items-center gap-2">
        {/* Main Floating Bubble Button */}
        <button
          onClick={onExpand}
          onMouseDown={handleMouseDown}
          className={`relative w-16 h-16 rounded-full p-1 transition-all duration-300 shadow-2xl active:scale-95 cursor-grab active:cursor-grabbing flex items-center justify-center ${
            isGfMode
              ? 'bg-gradient-to-tr from-pink-500 via-rose-600 to-purple-700 shadow-pink-500/50 hover:shadow-pink-500/80 ring-2 ring-pink-400/80'
              : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-700 shadow-violet-600/50 hover:shadow-violet-600/80 ring-2 ring-violet-400/80'
          }`}
          title="Myra Background Assistant (Click to expand)"
        >
          {/* Pulsing Outer Ring */}
          {(isListening || isSpeaking) && (
            <span
              className={`absolute inset-0 rounded-full border-2 ${
                isGfMode ? 'border-pink-300 animate-ping' : 'border-cyan-300 animate-ping'
              }`}
            />
          )}

          {/* Background Running Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 shadow animate-pulse" />

          {/* Icon */}
          <div className="flex flex-col items-center justify-center">
            {avatar?.iconType === 'image' ? (
              <img
                src={avatar.iconValue}
                alt={avatar.name}
                className="w-8 h-8 rounded-full object-cover border border-white/60 shadow-sm"
              />
            ) : avatar?.iconType === 'emoji' ? (
              <span className="text-2xl drop-shadow select-none">{avatar.iconValue}</span>
            ) : isGfMode ? (
              <Heart className="w-7 h-7 text-white fill-white animate-pulse" />
            ) : (
              <Sparkles className="w-7 h-7 text-white" />
            )}
            <span className="text-[9px] font-black uppercase text-white tracking-widest mt-0.5">
              Myra
            </span>
          </div>
        </button>

        {/* Hover Mini Controls Menu */}
        <div className="hidden group-hover:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-left-2">
          {/* Quick Mic Speak Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleMic();
            }}
            className={`p-2 rounded-xl text-xs font-bold transition shadow ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isListening ? 'Stop Mic' : 'Speak Voice Command'}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Wake Word Indicator */}
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleWakeWord();
            }}
            className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition border ${
              wakeWordActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Continuous background wake-word listening"
          >
            "Hey Myra"
          </button>

          {/* Expand Full App */}
          <button
            onClick={e => {
              e.stopPropagation();
              onExpand();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition"
            title="Open Fullscreen Assistant"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
