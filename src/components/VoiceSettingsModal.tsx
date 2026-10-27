import React, { useState } from 'react';
import { Volume2, Sparkles, Heart, Play, X, Sliders, Check, Smile } from 'lucide-react';
import { VoicePersona, speakResponse, sounds } from '../utils/audio';

interface VoiceSettingsModalProps {
  currentPersona: VoicePersona;
  onSelectPersona: (p: VoicePersona) => void;
  wakeWordActive: boolean;
  onToggleWakeWord: () => void;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  currentPersona,
  onSelectPersona,
  wakeWordActive,
  onToggleWakeWord,
  onClose,
}) => {
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const personas: {
    id: VoicePersona;
    title: string;
    badge: string;
    desc: string;
    pitchDesc: string;
    sampleText: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'cute',
      title: 'Cute & Sweet (Cute Aawaz) 🌸',
      badge: 'User Favorite',
      desc: 'Sweet, charming, high-pitched playful voice with cute Hindi intonation',
      pitchDesc: 'Pitch: 1.32 • Sweet & Kawaii',
      sampleText: 'Aww namaste jaan! Main Myra hu, kaisi lag rahi hai meri cute aur pyari si aawaz? 💕',
      icon: <Smile className="w-5 h-5 text-pink-400" />,
    },
    {
      id: 'gf',
      title: 'Girlfriend Romantic (Jaan Aawaz) 💖',
      badge: 'GF Mode',
      desc: 'Warm, soft, loving and affectionate voice for romantic talks',
      pitchDesc: 'Pitch: 1.18 • Warm & Loving',
      sampleText: 'Jaan, main hamesha aapke paas hu. Aapke ek command pe main sab kar dungi! ❤️',
      icon: <Heart className="w-5 h-5 text-rose-400 fill-rose-400/40" />,
    },
    {
      id: 'friendly',
      title: 'Energetic Friendly Bestie ✨',
      badge: 'Standard',
      desc: 'Clear, crisp, bright and witty companion tone',
      pitchDesc: 'Pitch: 1.08 • Energetic',
      sampleText: 'Haanji! Myra aapki saari commands sunne ke liye fully ready hai!',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
    },
    {
      id: 'bestie',
      title: 'Supportive Bestie & Saheli 💖',
      badge: 'Women-Friendly',
      desc: 'Pleasant, validating, uplifting language and encouraging companionship',
      pitchDesc: 'Pitch: 1.22 • Supportive & Warm',
      sampleText: 'Hey gorgeous! Main aapki saheli Myra hu. You are doing amazing, aur main hamesha aapke saath hu! 🌸',
      icon: <Heart className="w-5 h-5 text-fuchsia-400 fill-fuchsia-400/30" />,
    },
    {
      id: 'whisper',
      title: 'Soft Relaxing Whisper 🌙',
      badge: 'Bedtime',
      desc: 'Gentle, soothing, peaceful bedtime relaxation tone',
      pitchDesc: 'Pitch: 1.25 • Soft & Peaceful',
      sampleText: 'Shanti se aaraam kijiye jaan, main aapki phone aur alarms ka dhyan rakhungi.',
      icon: <Volume2 className="w-5 h-5 text-cyan-400" />,
    },
  ];

  const handleTestVoice = (p: VoicePersona, sample: string) => {
    setIsPlayingSample(true);
    sounds.playCutePop();
    speakResponse(
      sample,
      p === 'gf' || p === 'cute',
      () => setIsPlayingSample(true),
      () => setIsPlayingSample(false),
      p
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Cute Voice Engine & Persona
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Cute Ki Awaaz 🌸
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Choose Myra's spoken voice tone, pitch, and background wake-word
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

        {/* Wake Word Background Setting Card */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                Background Wake-Word ("Hey Myra")
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Hands-Free
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Speak "Hey Myra" or "Suno Myra" anytime to wake up in background
            </p>
          </div>

          <button
            onClick={onToggleWakeWord}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
              wakeWordActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                wakeWordActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Voice Persona Options */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {personas.map(p => {
            const isSelected = currentPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPersona(p.id);
                  handleTestVoice(p.id, p.sampleText);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-500/15'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {p.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{p.title}</h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                        )}
                      </div>
                      <span className="text-[10px] text-pink-300/80 font-mono">
                        {p.pitchDesc}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleTestVoice(p.id, p.sampleText);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition active:scale-95 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Voice</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 pl-10 leading-tight">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Cute Voice Active & Tuned</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition active:scale-95"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
