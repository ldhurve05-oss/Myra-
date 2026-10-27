import React, { useState } from 'react';
import { AssistantStatus, MyraAvatar, SentimentAnalysis, SentimentPattern } from '../types/assistant';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Mic, Sparkles, Heart, Smile, Activity, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface VoiceOrbProps {
  status: AssistantStatus;
  isGfMode: boolean;
  onToggleListening: () => void;
  statusMessage?: string;
  orbColorGradient?: string;
  accentColor?: string;
  voicePersona?: string;
  pauseAnimations?: boolean;
  avatar?: MyraAvatar;
  sentiment?: SentimentAnalysis;
  onSelectSentimentPattern?: (pattern: SentimentPattern) => void;
}

const PRESET_PATTERNS: {
  id: SentimentPattern;
  label: string;
  mood: string;
  icon: string;
  color: string;
  bgActive: string;
  borderActive: string;
}[] = [
  {
    id: 'pink_pulse',
    label: 'Joyful',
    mood: 'joyful',
    icon: '💖',
    color: 'text-pink-400',
    bgActive: 'bg-pink-500/20 text-pink-300 border-pink-400/60',
    borderActive: 'border-pink-500',
  },
  {
    id: 'blue_ripple',
    label: 'Calm',
    mood: 'calm',
    icon: '🌊',
    color: 'text-cyan-400',
    bgActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
    borderActive: 'border-cyan-500',
  },
  {
    id: 'amber_energy',
    label: 'Energetic',
    mood: 'enthusiastic',
    icon: '⚡',
    color: 'text-amber-400',
    bgActive: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
    borderActive: 'border-amber-500',
  },
  {
    id: 'violet_glow',
    label: 'Empathetic',
    mood: 'empathetic',
    icon: '💜',
    color: 'text-violet-400',
    bgActive: 'bg-violet-500/20 text-violet-300 border-violet-400/60',
    borderActive: 'border-violet-500',
  },
  {
    id: 'emerald_wave',
    label: 'Harmonious',
    mood: 'neutral',
    icon: '🍃',
    color: 'text-emerald-400',
    bgActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
    borderActive: 'border-emerald-500',
  },
];

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  status,
  isGfMode,
  onToggleListening,
  statusMessage,
  orbColorGradient,
  accentColor,
  voicePersona = 'cute',
  pauseAnimations = false,
  avatar,
  sentiment,
  onSelectSentimentPattern,
}) => {
  const [showPatternPicker, setShowPatternPicker] = useState(false);

  const isListening = status === 'listening';
  const isThinking = status === 'thinking';
  const isSpeaking = status === 'speaking';

  // Active pattern derived from sentiment prop or GF mode
  const activePattern: SentimentPattern = sentiment?.pattern || (isGfMode ? 'pink_pulse' : 'blue_ripple');
  const currentScore = sentiment?.score ?? (isGfMode ? 0.94 : 0.6);
  const scorePercent = Math.round(currentScore * 100);

  // Dynamic orb gradient responding to sentiment pattern
  const getDynamicGradient = () => {
    if (isGfMode) {
      return 'from-pink-500 via-rose-600 to-purple-800 shadow-pink-500/50 group-hover:shadow-pink-500/70';
    }

    switch (activePattern) {
      case 'pink_pulse':
        return 'from-pink-500 via-rose-600 to-fuchsia-800 shadow-pink-500/50 group-hover:shadow-pink-500/70';
      case 'blue_ripple':
        return orbColorGradient
          ? `${orbColorGradient} shadow-cyan-600/50 group-hover:shadow-cyan-600/70`
          : 'from-cyan-500 via-sky-600 to-indigo-800 shadow-cyan-600/50 group-hover:shadow-cyan-600/70';
      case 'amber_energy':
        return 'from-amber-500 via-orange-600 to-red-800 shadow-amber-500/50 group-hover:shadow-amber-500/70';
      case 'violet_glow':
        return 'from-violet-600 via-purple-700 to-indigo-900 shadow-violet-600/50 group-hover:shadow-violet-600/70';
      case 'emerald_wave':
        return 'from-emerald-500 via-teal-600 to-cyan-800 shadow-emerald-500/50 group-hover:shadow-emerald-500/70';
      default:
        return 'from-violet-600 via-indigo-700 to-cyan-800 shadow-violet-600/50 group-hover:shadow-violet-600/70';
    }
  };

  const getAuraColorClass = () => {
    switch (activePattern) {
      case 'pink_pulse':
        return 'bg-gradient-to-r from-pink-600/40 via-rose-500/50 to-purple-600/40';
      case 'blue_ripple':
        return 'bg-gradient-to-r from-cyan-500/40 via-sky-600/50 to-indigo-600/40';
      case 'amber_energy':
        return 'bg-gradient-to-r from-amber-500/45 via-orange-500/50 to-red-600/40';
      case 'violet_glow':
        return 'bg-gradient-to-r from-purple-500/40 via-violet-600/50 to-fuchsia-600/40';
      case 'emerald_wave':
        return 'bg-gradient-to-r from-emerald-500/40 via-teal-600/50 to-cyan-600/40';
      default:
        return 'bg-gradient-to-r from-cyan-500/30 via-violet-600/40 to-fuchsia-500/30';
    }
  };

  const activePreset = PRESET_PATTERNS.find(p => p.id === activePattern) || PRESET_PATTERNS[1];

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Floating GF Mode Hearts Background */}
      {isGfMode && !pauseAnimations && (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-pink-400 opacity-75"
              style={{
                left: `${30 + (i % 3) * 20 + Math.sin(i) * 15}%`,
                top: `${20 + (i % 2) * 40}%`,
                animation: `float-heart ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
                fontSize: `${14 + (i % 3) * 6}px`,
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      {/* Main Visualizer & Orb Container Frame */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Real-time Dynamic Waveform Canvas Visualizer */}
        <WaveformVisualizer
          status={status}
          sentiment={sentiment}
          isGfMode={isGfMode}
          pauseAnimations={pauseAnimations}
          size={270}
        />

        {/* Ambient background aura glow */}
        <div
          className={`absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${getAuraColorClass()} ${
            isListening && !pauseAnimations
              ? 'scale-125 animate-pulse opacity-90'
              : isSpeaking
              ? 'scale-115 opacity-80'
              : 'scale-100 opacity-60'
          }`}
          style={accentColor ? { filter: `drop-shadow(0 0 25px ${accentColor}80)` } : undefined}
        />

        {/* Rotating Orbital Dashed Ring */}
        <div
          className={`absolute inset-6 rounded-full border border-dashed transition-all duration-1000 pointer-events-none ${
            activePattern === 'pink_pulse'
              ? 'border-pink-300/30'
              : activePattern === 'amber_energy'
              ? 'border-amber-300/30'
              : activePattern === 'emerald_wave'
              ? 'border-emerald-300/30'
              : activePattern === 'violet_glow'
              ? 'border-purple-300/30'
              : 'border-cyan-300/30'
          } ${!pauseAnimations && (isListening || isThinking) ? 'animate-spin' : ''}`}
          style={{ animationDuration: isThinking ? '4s' : '14s' }}
        />

        {/* Interactive Center Orb Button */}
        <button
          onClick={onToggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 cursor-pointer transition-all duration-500 active:scale-95 group focus:outline-none focus:ring-4 ${
            activePattern === 'pink_pulse'
              ? 'focus:ring-pink-400/50'
              : activePattern === 'amber_energy'
              ? 'focus:ring-amber-400/50'
              : activePattern === 'emerald_wave'
              ? 'focus:ring-emerald-400/50'
              : 'focus:ring-cyan-400/50'
          }`}
        >
          {/* Sphere body gradient */}
          <div
            className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-br ${getDynamicGradient()}`}
          >
            {/* Gloss reflection overlay */}
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-white/25 rounded-full blur-xl pointer-events-none" />

            {/* Icon / Avatar in the Orb */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isThinking ? (
                <Sparkles className={`w-10 h-10 text-white ${pauseAnimations ? '' : 'animate-spin'}`} />
              ) : isSpeaking ? (
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-6 bg-white rounded-full ${pauseAnimations ? '' : 'animate-wave-bar'}`}
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className={`w-1.5 h-10 bg-white rounded-full ${pauseAnimations ? '' : 'animate-wave-bar'}`}
                    style={{ animationDelay: '0.3s' }}
                  />
                  <span
                    className={`w-1.5 h-7 bg-white rounded-full ${pauseAnimations ? '' : 'animate-wave-bar'}`}
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className={`w-1.5 h-9 bg-white rounded-full ${pauseAnimations ? '' : 'animate-wave-bar'}`}
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span
                    className={`w-1.5 h-5 bg-white rounded-full ${pauseAnimations ? '' : 'animate-wave-bar'}`}
                    style={{ animationDelay: '0.15s' }}
                  />
                </div>
              ) : isListening ? (
                <div className="flex flex-col items-center">
                  <Mic className={`w-10 h-10 text-white ${pauseAnimations ? '' : 'animate-bounce'}`} />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-pink-100 mt-1">Listening</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {avatar?.iconType === 'image' ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shadow-md group-hover:scale-110 transition-transform">
                      <img src={avatar.iconValue} alt={avatar.name} className="w-full h-full object-cover" />
                    </div>
                  ) : avatar?.iconType === 'emoji' ? (
                    <span className="text-4xl group-hover:scale-110 transition-transform drop-shadow select-none">
                      {avatar.iconValue}
                    </span>
                  ) : isGfMode ? (
                    <Heart className="w-10 h-10 text-white fill-white/80 group-hover:scale-110 transition-transform" />
                  ) : voicePersona === 'cute' ? (
                    <Smile className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                  ) : (
                    <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-[11px] font-bold text-white/95 mt-1 flex items-center gap-1">
                    {avatar?.name ? avatar.name.split(' ')[0] : isGfMode ? 'Myra 💕' : 'Myra AI'}
                  </span>
                </div>
              )}
            </div>

            {/* Inner bottom subtle aura */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </button>
      </div>

      {/* Dynamic Sentiment Waveform & Status Indicator Badges */}
      <div className="mt-2 flex flex-col items-center gap-1.5 w-full max-w-xs">
        {/* Voice Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              isListening
                ? 'bg-rose-500 animate-ping'
                : isThinking
                ? 'bg-amber-400 animate-pulse'
                : isSpeaking
                ? 'bg-emerald-400 animate-pulse'
                : isGfMode
                ? 'bg-pink-500'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-slate-200 truncate max-w-[210px]">
            {statusMessage ||
              (isListening
                ? 'Aap boliye, main sun rahi hu...'
                : isThinking
                ? 'Soch rahi hu...'
                : isSpeaking
                ? 'Myra baat kar rahi hai...'
                : isGfMode
                ? 'Jaan, bolne ke liye tap karein 💕'
                : 'Tap orb ya bole "Hey Myra"')}
          </span>
        </div>

        {/* Sentiment Analysis Score & Pattern Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPatternPicker(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all shadow-sm ${
              activePreset.bgActive
            } hover:brightness-110`}
            title="Waveform Sentiment Visualizer Settings"
          >
            <span className="text-xs">{activePreset.icon}</span>
            <span className="font-medium text-slate-100">
              {sentiment?.label || `${activePreset.label} Waveform (+${scorePercent}%)`}
            </span>
            <span className="opacity-60 ml-0.5">
              {showPatternPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>
        </div>

        {/* Expandable Sentiment Waveform Mode Switcher */}
        {showPatternPicker && (
          <div className="mt-1 p-2 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md w-full animate-in fade-in slide-in-from-top-1 z-20">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                Waveform Sentiment Visualizer
              </span>
              <span className="text-[10px] text-slate-400">Live Reaction</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_PATTERNS.map(preset => {
                const isSelected = activePattern === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (onSelectSentimentPattern) {
                        onSelectSentimentPattern(preset.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border text-left transition ${
                      isSelected
                        ? preset.bgActive
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold leading-tight">{preset.label}</span>
                      <span className="text-[9px] text-slate-400 leading-tight">
                        {preset.id === 'pink_pulse'
                          ? 'Pulse (Joyful)'
                          : preset.id === 'blue_ripple'
                          ? 'Ripple (Calm)'
                          : preset.id === 'amber_energy'
                          ? 'Spikes (Energetic)'
                          : preset.id === 'violet_glow'
                          ? 'Orbital (Empathetic)'
                          : 'Harmonics (Balanced)'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
