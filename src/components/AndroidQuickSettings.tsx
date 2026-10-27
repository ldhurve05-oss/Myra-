import React from 'react';
import {
  Flashlight,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Bluetooth,
  ShieldCheck,
  Camera,
  MessageSquare,
  MapPin,
  BatteryCharging,
  X,
  ChevronUp,
  Settings,
  Vibrate,
  Zap,
  ZapOff,
} from 'lucide-react';
import { SystemStatusData } from '../types/assistant';

interface AndroidQuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: SystemStatusData;
  onToggleTorch: () => void;
  onToggleWifi: () => void;
  onToggleBluetooth: () => void;
  onToggleDnd: () => void;
  onChangeVolume: (val: number) => void;
  onChangeBrightness: (val: number) => void;
  onOpenPermissions: () => void;
  onOpenCamera: () => void;
  onOpenWhatsApp: () => void;
  onToggleBatterySaver: () => void;
  onOpenBatterySaverModal: () => void;
  onSimulateBatteryLevel?: (val: number) => void;
}

export const AndroidQuickSettings: React.FC<AndroidQuickSettingsProps> = ({
  isOpen,
  onClose,
  statusData,
  onToggleTorch,
  onToggleWifi,
  onToggleBluetooth,
  onToggleDnd,
  onChangeVolume,
  onChangeBrightness,
  onOpenPermissions,
  onOpenCamera,
  onOpenWhatsApp,
  onToggleBatterySaver,
  onOpenBatterySaverModal,
  onSimulateBatteryLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl text-white flex flex-col animate-in slide-in-from-top-6 duration-300 overflow-y-auto">
      {/* Top Handle / Status */}
      <div className="pt-3 px-6 pb-2 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <span>Android Quick Controls</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPermissions}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1"
            title="App Permissions"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[10px]">Access</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Sliders: Brightness & Volume */}
        <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
          {/* Brightness Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Screen Brightness
              </span>
              <span className="font-mono text-white text-[11px]">{statusData.brightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={statusData.brightness}
              onChange={e => onChangeBrightness(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                {statusData.volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                )}{' '}
                Media Volume
              </span>
              <span className="font-mono text-white text-[11px]">{statusData.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={statusData.volume}
              onChange={e => onChangeVolume(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Tile Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Torch */}
          <button
            onClick={onToggleTorch}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.torchOn
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flashlight className={`w-5 h-5 ${statusData.torchOn ? 'fill-amber-300' : ''}`} />
            <span className="text-[10px] font-bold">Torch</span>
          </button>

          {/* Wi-Fi */}
          <button
            onClick={onToggleWifi}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.wifiConnected
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {statusData.wifiConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            <span className="text-[10px] font-bold">Wi-Fi</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={onToggleBluetooth}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.bluetoothConnected
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Bluetooth className="w-5 h-5" />
            <span className="text-[10px] font-bold">Bluetooth</span>
          </button>

          {/* DND */}
          <button
            onClick={onToggleDnd}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.dnd
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-[10px] font-bold">DND</span>
          </button>

          {/* Camera */}
          <button
            onClick={() => {
              onClose();
              onOpenCamera();
            }}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-pink-400" />
            <span className="text-[10px] font-bold">Camera</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              onClose();
              onOpenWhatsApp();
            }}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </button>

          {/* Battery Saver Tile */}
          <button
            onClick={onToggleBatterySaver}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.batterySaverActive
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : statusData.batteryLevel <= 20
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Smart Battery Saver"
          >
            {statusData.batterySaverActive ? (
              <Zap className="w-5 h-5 fill-emerald-300" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
            <span className="text-[10px] font-bold">
              {statusData.batterySaverActive ? 'Saver ON' : 'Saver OFF'}
            </span>
          </button>

          {/* Battery Level Modal Launcher */}
          <button
            onClick={() => {
              onClose();
              onOpenBatterySaverModal();
            }}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              statusData.batteryLevel <= 20
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Open Smart Battery Saver Manager"
          >
            <BatteryCharging className={`w-5 h-5 ${statusData.batteryLevel <= 20 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-[10px] font-bold">{statusData.batteryLevel}%</span>
          </button>
        </div>

        {/* Battery Level Simulator & Protection Status */}
        {onSimulateBatteryLevel && (
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Battery Level Simulator
              </span>
              <span className="font-mono text-[11px] text-amber-300">{statusData.batteryLevel}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={statusData.batteryLevel}
              onChange={e => onSimulateBatteryLevel(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Drag &lt;20% to trigger low-battery dialog</span>
              <button
                onClick={() => onSimulateBatteryLevel(15)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Trigger 15% (Low)
              </button>
            </div>
          </div>
        )}

        {/* Live Notification Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-[11px]">Myra Assistant Service</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {statusData.batterySaverActive ? 'Power Saver Profile Active' : 'Full Access Active'}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-tight">
            {statusData.batterySaverActive
              ? 'Smart Battery Saver is saving power: screen brightness dimmed, haptics paused, and visual animations frozen.'
              : 'Full Mobile Phone Access is Active. You can control torch, volume, WhatsApp, calling, and camera directly via voice!'}
          </p>
        </div>
      </div>
    </div>
  );
};
