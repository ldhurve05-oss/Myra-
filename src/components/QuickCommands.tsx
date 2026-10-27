import React from 'react';
import {
  Youtube,
  MessageSquare,
  Phone,
  Globe,
  Heart,
  Sparkles,
  Flame,
  Video,
  ExternalLink,
  Palette,
  Smile,
  Flashlight,
  Zap,
  Activity,
  History,
  HardDrive,
} from 'lucide-react';

interface QuickCommandsProps {
  onSelectCommand: (command: string) => void;
  isGfMode: boolean;
  onOpenWallpapers?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenBatterySaver?: () => void;
  onOpenHealthDashboard?: () => void;
  onOpenVoiceHistory?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const QuickCommands: React.FC<QuickCommandsProps> = ({
  onSelectCommand,
  isGfMode,
  onOpenWallpapers,
  onOpenVoiceSettings,
  onOpenBatterySaver,
  onOpenHealthDashboard,
  onOpenVoiceHistory,
  onOpenGoogleDrive,
}) => {
  const commands = [
    {
      label: 'Google Drive 📂',
      hindi: 'Google Drive kholo aur files browse karo',
      icon: <HardDrive className="w-3.5 h-3.5 text-blue-400" />,
      color: 'hover:border-blue-500/50 hover:bg-blue-500/10',
      action: onOpenGoogleDrive,
    },
    {
      label: 'Voice History 📜',
      hindi: 'Voice history kholo / purane commands search & re-run karo',
      icon: <History className="w-3.5 h-3.5 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10',
      action: onOpenVoiceHistory,
    },
    {
      label: 'Health Tracker 💖',
      hindi: 'Health dashboard kholo / Step count dikhao',
      icon: <Activity className="w-3.5 h-3.5 text-rose-400" />,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10',
      action: onOpenHealthDashboard,
    },
    {
      label: 'Battery Saver 🔋',
      hindi: 'Battery saver on karo',
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
      action: onOpenBatterySaver,
    },
    {
      label: 'Cute Voice Mode 🌸',
      hindi: 'Cute voice me baat karo',
      icon: <Smile className="w-3.5 h-3.5 text-pink-400" />,
      color: 'hover:border-pink-500/50 hover:bg-pink-500/10',
      action: onOpenVoiceSettings,
    },
    {
      label: 'Myra Wallpapers 🎨',
      hindi: 'Sakura wallpaper lagao',
      icon: <Palette className="w-3.5 h-3.5 text-purple-400" />,
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10',
      action: onOpenWallpapers,
    },
    {
      label: 'Open WhatsApp',
      hindi: 'Open WhatsApp',
      icon: <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    },
    {
      label: 'WhatsApp Message',
      hindi: 'Rahul ko WhatsApp message bhejo: Main 10 minute me aa raha hu',
      icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    },
    {
      label: 'WhatsApp Video Call',
      hindi: 'Mummy ko WhatsApp pe video call karo',
      icon: <Video className="w-3.5 h-3.5 text-teal-400" />,
      color: 'hover:border-teal-500/50 hover:bg-teal-500/10',
    },
    {
      label: 'Torch / Flashlight 🔦',
      hindi: 'Flashlight on karo',
      icon: <Flashlight className="w-3.5 h-3.5 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10',
    },
    {
      label: 'Play Song on YouTube',
      hindi: 'YouTube pe Kesariya gaana chalao',
      icon: <Youtube className="w-3.5 h-3.5 text-red-400" />,
      color: 'hover:border-red-500/50 hover:bg-red-500/10',
    },
    {
      label: 'Design a Website',
      hindi: 'Mere liye ek luxury gym ki website design karo',
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10',
    },
    {
      label: isGfMode ? 'Turn Off GF Mode' : 'Activate GF Mode 💕',
      hindi: isGfMode ? 'Normal mode me aao' : 'GF mode active karo jaan ban jao',
      icon: <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />,
      color: 'hover:border-pink-500/50 hover:bg-pink-500/10',
    },
    {
      label: 'Sweet Love Talk',
      hindi: 'Myra, aap mere bare me kya sochti ho?',
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-400" />,
      color: 'hover:border-violet-500/50 hover:bg-violet-500/10',
    },
  ];

  return (
    <div className="w-full px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-amber-400" />
          One-Tap Voice Commands & Shortcuts
        </span>
        <span className="text-[10px] text-slate-500">Instant Execution</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {commands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (cmd.action) {
                cmd.action();
              } else {
                onSelectCommand(cmd.hindi);
              }
            }}
            className={`text-left p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${cmd.color} transition-all duration-200 active:scale-95 group flex flex-col justify-between cursor-pointer`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {cmd.icon}
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                {cmd.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1 italic group-hover:text-slate-300">
              "{cmd.hindi}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
