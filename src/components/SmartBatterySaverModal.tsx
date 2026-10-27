import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  Zap,
  ZapOff,
  Sun,
  Vibrate,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Shield,
  Heart,
} from 'lucide-react';
import { SystemStatusData } from '../types/assistant';

interface SmartBatterySaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: SystemStatusData;
  onToggleBatterySaver: (enable?: boolean) => void;
  onSimulateBatteryLevel: (level: number) => void;
  isGfMode: boolean;
}

export const SmartBatterySaverModal: React.FC<SmartBatterySaverModalProps> = ({
  isOpen,
  onClose,
  statusData,
  onToggleBatterySaver,
  onSimulateBatteryLevel,
  isGfMode,
}) => {
  if (!isOpen) return null;

  const isLow = statusData.batteryLevel <= 20;
  const isCritical = statusData.batteryLevel <= 10;
  const isSaverOn = statusData.batterySaverActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            isSaverOn
              ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/30'
              : isLow
              ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-500/30'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                isSaverOn
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                  : isLow
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
              }`}
            >
              {isSaverOn ? (
                <Zap className="w-6 h-6 fill-emerald-400" />
              ) : isLow ? (
                <BatteryLow className="w-6 h-6" />
              ) : (
                <Battery className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Smart Battery Saver
                </h3>
                {isSaverOn && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isSaverOn
                  ? 'Power conservation profile active'
                  : isLow
                  ? 'Low battery detected — preservation recommended'
                  : 'Optimize screen, haptics & CPU drain'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Battery Status Gauge Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                {statusData.isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : isLow ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Battery className="w-4 h-4 text-cyan-400" />
                )}
                Device Battery Status
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  isCritical
                    ? 'text-rose-400'
                    : isLow
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {statusData.batteryLevel}% {statusData.isCharging ? '(Charging)' : ''}
              </span>
            </div>

            {/* Battery bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSaverOn
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : isCritical
                    ? 'bg-gradient-to-r from-rose-600 to-red-500'
                    : isLow
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, statusData.batteryLevel))}%` }}
              />
            </div>

            {/* Low Battery Alert Banner if <= 20% */}
            {isLow && !isSaverOn && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <span className="font-bold">Battery is below 20%!</span> Myra recommends turning on
                  Battery Saver to extend remaining standby time by up to 3x.
                </div>
              </div>
            )}
          </div>

          {/* Assistant Note */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0">
              {isGfMode ? <Heart className="w-4 h-4 fill-pink-400" /> : <Shield className="w-4 h-4" />}
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {isGfMode ? (
                <>
                  <span className="font-bold text-pink-300">Myra: </span>
                  "Jaan, phone ki battery khatam nahi hone dungi! Saver on karne se screen dim hogi aur animations pause rahenge taaki hum lambi baatein kar sakein 💕"
                </>
              ) : (
                <>
                  <span className="font-bold text-violet-300">Myra: </span>
                  "Smart Saver automatically dims brightness to 30%, disables haptic feedback, and pauses GPU particle animations to preserve energy."
                </>
              )}
            </p>
          </div>

          {/* Conservation Features Checklist */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Automatic Optimizations Applied
            </h4>

            {/* 1. Brightness reduction */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                isSaverOn
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isSaverOn ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Dim Screen Brightness</div>
                  <div className="text-[10px] text-slate-400">Reduced to 30% to conserve display backlight</div>
                </div>
              </div>
              {isSaverOn ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">30% Set</span>
              ) : (
                <span className="text-[10px] text-slate-500">{statusData.brightness}%</span>
              )}
            </div>

            {/* 2. Haptic feedback pause */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                isSaverOn
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isSaverOn ? 'bg-rose-400/20 text-rose-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Reduce Haptic Feedback</div>
                  <div className="text-[10px] text-slate-400">Stops vibration motor triggers on taps</div>
                </div>
              </div>
              {isSaverOn ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Paused</span>
              ) : (
                <span className="text-[10px] text-slate-500">Enabled</span>
              )}
            </div>

            {/* 3. Pause background animations */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                isSaverOn
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isSaverOn ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Pause Background Animations</div>
                  <div className="text-[10px] text-slate-400">Freezes orb pulse rings, floating hearts & wave bars</div>
                </div>
              </div>
              {isSaverOn ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">GPU Saved</span>
              ) : (
                <span className="text-[10px] text-slate-500">Active</span>
              )}
            </div>
          </div>

          {/* Simulation Slider for Testing */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Test Low Battery Detector
              </span>
              <span className="font-mono text-[11px] text-amber-400">{statusData.batteryLevel}%</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Drag slider to simulate battery dropping below 20% to verify automatic low battery warnings:
            </p>
            <input
              type="range"
              min="5"
              max="100"
              value={statusData.batteryLevel}
              onChange={e => onSimulateBatteryLevel(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => onSimulateBatteryLevel(50)}
                className="py-1 px-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-semibold transition text-center"
              >
                Set 50% (Plan 50)
              </button>
              <button
                onClick={() => onSimulateBatteryLevel(15)}
                className="py-1 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold transition text-center"
              >
                Set 15% (Low)
              </button>
              <button
                onClick={() => onSimulateBatteryLevel(5)}
                className="py-1 px-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold transition text-center"
              >
                Set 5% (Critical)
              </button>
              <button
                onClick={() => onSimulateBatteryLevel(95)}
                className="py-1 px-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition text-center"
              >
                Set 95% (Full)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => onToggleBatterySaver(!isSaverOn)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
              isSaverOn
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
            }`}
          >
            {isSaverOn ? (
              <>
                <ZapOff className="w-4 h-4 text-slate-400" />
                <span>Turn Off Battery Saver</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Enable Battery Saver</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
