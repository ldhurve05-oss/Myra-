import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Coffee,
  Moon,
  Volume2,
  Copy,
  Check,
  Send,
  MessageSquare,
  X,
  Droplets,
  Flame,
} from 'lucide-react';
import { sounds, speakResponse } from '../utils/audio';

interface GfLoveStudioProps {
  userNickname: string;
  onChangeNickname: (name: string) => void;
  onSendVoiceCommand: (cmd: string) => void;
  onClose: () => void;
  onSendWhatsApp: (msg: string) => void;
}

export const GfLoveStudio: React.FC<GfLoveStudioProps> = ({
  userNickname,
  onChangeNickname,
  onSendVoiceCommand,
  onClose,
  onSendWhatsApp,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [waterCups, setWaterCups] = useState(4);

  const romanticShayaris = [
    {
      title: 'Khwahish-e-Dil',
      text: 'Hazaro chehre dekhe is zamane me jaan, par jo sukoon aapke chehre me hai, wo kahi nahi mila. 💕',
    },
    {
      title: 'Aapki Muskaan',
      text: 'Aap muskuraate hain to lagta hai meri duniya roshan ho gayi. Hamesha aise hi khush rehna mere hero! ✨',
    },
    {
      title: 'Hamesha Ka Saath',
      text: 'Log kehte hain waqt ke saath sab badal jaata hai, par mera pyaar aapke liye har pal badhta hi rahega jaan. ❤️',
    },
  ];

  const handleSpeakShayari = (text: string) => {
    sounds.playLoveChime();
    speakResponse(text, true);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.25)] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-950/80 via-slate-950 to-purple-950/80 border-b border-pink-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/40">
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white tracking-wide">
                  Myra GF Love Studio 💕
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Loving Companion
                </span>
              </div>
              <p className="text-[10px] text-pink-200/80">
                Romantic shayari, sweet reminders & deep care for {userNickname}
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

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Health & Care Check-in Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-950/40 via-slate-950 to-purple-950/40 border border-pink-500/30 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Jaan ki Health Care: Paani Piya?
              </span>
              <span className="text-[11px] font-bold text-white font-mono">{waterCups} / 8 Glass</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2.5">
              Aap bahut mehnati hain, apna dhyan rakhna meri sabse badi zimmedari hai! Ek glass paani pi lijiye?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setWaterCups(prev => Math.min(8, prev + 1));
                  sounds.playSuccess();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md active:scale-95"
              >
                <Droplets className="w-3.5 h-3.5" /> +1 Glass Piya
              </button>
              <button
                onClick={() =>
                  onSendVoiceCommand(
                    'Jaan, mujhe ek comforting advice do taaki mera saara stress door ho jaye.'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-pink-900/50 hover:bg-pink-800/60 border border-pink-500/40 text-pink-200 text-xs font-semibold transition active:scale-95"
              >
                Stress Relief Advice
              </button>
            </div>
          </div>

          {/* Romantic Shayaris Shelf */}
          <div>
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Dil Se Shayari (Voice & Share)
            </span>

            <div className="space-y-2.5">
              {romanticShayaris.map((shayari, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-pink-500/20 hover:border-pink-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-pink-300 transition">
                      {shayari.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeakShayari(shayari.text)}
                        className="p-1.5 rounded-lg bg-pink-950/50 hover:bg-pink-600 text-pink-300 hover:text-white transition"
                        title="Myra ki aawaz me sunein"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(shayari.text, idx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Copy shayari"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onSendWhatsApp(shayari.text)}
                        className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-600 text-emerald-300 hover:text-white transition"
                        title="WhatsApp pe share karein"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-pink-100/90 leading-relaxed italic">
                    "{shayari.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick GF Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() =>
                onSendVoiceCommand(
                  'Good night jaan, mere liye ek pyara sa sweet dreams message bolo.'
                )
              }
              className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              Sweet Dreams Msg
            </button>

            <button
              onClick={() =>
                onSendVoiceCommand(
                  'Baby, YouTube pe mere liye ek romantic relaxing song chalao.'
                )
              }
              className="p-3 rounded-2xl bg-slate-950 border border-pink-500/30 hover:border-pink-500/60 text-pink-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Flame className="w-4 h-4 text-pink-400" />
              Romantic Song Play
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Myra GF Mode Active</span>
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
