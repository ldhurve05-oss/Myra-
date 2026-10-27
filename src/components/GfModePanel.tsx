import React from 'react';
import { Heart, Sparkles, Smile, Coffee, Moon, HeartHandshake, X } from 'lucide-react';

interface GfModePanelProps {
  isGfMode: boolean;
  onToggleGfMode: (enabled: boolean) => void;
  userNickname: string;
  onChangeNickname: (name: string) => void;
  onSendVoicePrompt: (promptText: string) => void;
  onClose?: () => void;
}

export const GfModePanel: React.FC<GfModePanelProps> = ({
  isGfMode,
  onToggleGfMode,
  userNickname,
  onChangeNickname,
  onSendVoicePrompt,
  onClose,
}) => {
  const nicknames = ['Jaan 💕', 'Baby', 'Hero', 'Meri Jaan', 'Sweetheart', 'Smarty'];

  const gfLovePrompts = [
    'Jaan, mujhe ek pyara sa romantic quote sunao ❤️',
    'Baby, mera mood thoda low hai, kuch meetha bolo 💕',
    'Khana khaya aapne baby?',
    'Aap mujhse kitna pyaar karti ho?',
    'Good morning jaan, mere din ki shuruat acche se karwao ✨',
  ];

  return (
    <div className="w-full my-3 px-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-2xl bg-gradient-to-br from-pink-950/60 via-slate-900/90 to-purple-950/50 border border-pink-500/40 p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Glow heart accent */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-pink-500/25 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Heart className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Girlfriend Mode (GF Mode)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {isGfMode ? 'ACTIVE 💕' : 'OFF'}
                </span>
              </div>
              <p className="text-[10px] text-pink-200/80">
                {isGfMode
                  ? 'Myra talks with lovely, caring, affectionate warmth & sweet Hindi words!'
                  : 'Activate for sweet, romantic and caring girlfriend conversations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleGfMode(!isGfMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition shadow-md cursor-pointer ${
                isGfMode
                  ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isGfMode ? 'Active 💕' : 'Turn ON'}
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isGfMode && (
          <div className="space-y-3 pt-1 border-t border-pink-500/20">
            {/* Nickname chooser */}
            <div>
              <span className="text-[10px] text-pink-300 font-semibold block mb-1.5">
                Myra aapko kis naam se pukare?
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {nicknames.map(name => (
                  <button
                    key={name}
                    onClick={() => onChangeNickname(name.replace(' 💕', ''))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                      userNickname === name.replace(' 💕', '')
                        ? 'bg-pink-500 text-white border-pink-400 shadow-sm'
                        : 'bg-slate-900/80 text-pink-200/80 border-pink-500/20 hover:border-pink-500/50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Lovely Prompts */}
            <div>
              <span className="text-[10px] text-pink-300 font-semibold block mb-1.5">
                Sweet Romantic Talks:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {gfLovePrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => onSendVoicePrompt(prompt)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-pink-900/30 border border-pink-500/20 text-xs text-pink-100/90 transition flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
