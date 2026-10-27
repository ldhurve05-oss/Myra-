import React, { useState, useEffect } from 'react';
import { Bell, Clock, X, Check, Volume2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AlarmModalProps {
  time: string;
  label?: string;
  onClose: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  time,
  label = 'Voice Alarm',
  onClose,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    sounds.playSuccess();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <Bell className="w-4 h-4 fill-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Android Clock & Alarm</h3>
              <p className="text-[10px] text-slate-400">Scheduled by Myra AI</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>

          <span className="text-3xl font-extrabold text-white tracking-wider font-mono mb-1">
            {time}
          </span>
          <p className="text-xs text-slate-300 font-semibold mb-6">
            🔔 {label} • Active Everyday
          </p>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => {
                setIsDismissed(true);
                setTimeout(onClose, 500);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
            >
              Snooze (5 min)
            </button>
            <button
              onClick={() => {
                setIsDismissed(true);
                setTimeout(onClose, 500);
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition"
            >
              Dismiss Alarm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
