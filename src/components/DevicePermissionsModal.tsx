import React from 'react';
import {
  ShieldCheck,
  Mic,
  Camera,
  MapPin,
  Users,
  Bell,
  Volume2,
  Sun,
  Vibrate,
  Flashlight,
  Check,
  X,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { DevicePermissions } from '../types/assistant';

interface DevicePermissionsModalProps {
  permissions: DevicePermissions;
  onTogglePermission: (key: keyof DevicePermissions) => void;
  onGrantAll: () => void;
  onClose: () => void;
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  permissions,
  onTogglePermission,
  onGrantAll,
  onClose,
}) => {
  const permissionItems = [
    {
      key: 'microphone' as keyof DevicePermissions,
      title: 'Microphone & Voice Engine',
      desc: 'Hands-free voice recognition & conversational voice input',
      icon: <Mic className="w-4 h-4 text-violet-400" />,
    },
    {
      key: 'camera' as keyof DevicePermissions,
      title: 'Camera & Video Calls',
      desc: 'Take instant selfies, photos, and WhatsApp video calling',
      icon: <Camera className="w-4 h-4 text-pink-400" />,
    },
    {
      key: 'torch' as keyof DevicePermissions,
      title: 'Flashlight / Torch Hardware',
      desc: 'Turn phone flashlight on and off on command',
      icon: <Flashlight className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'contacts' as keyof DevicePermissions,
      title: 'Contacts & Phone Dialer',
      desc: 'Access contacts to send WhatsApp messages and voice calls',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'systemSettings' as keyof DevicePermissions,
      title: 'Volume & Brightness Settings',
      desc: 'Control device volume, mute, display brightness, and night mode',
      icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'location' as keyof DevicePermissions,
      title: 'GPS & Live Location',
      desc: 'Pinpoint device coordinates and navigation on Google Maps',
      icon: <MapPin className="w-4 h-4 text-rose-400" />,
    },
    {
      key: 'notifications' as keyof DevicePermissions,
      title: 'Alarms & Reminders',
      desc: 'Set alarms, wake-up timers, and urgent reminders',
      icon: <Bell className="w-4 h-4 text-yellow-400" />,
    },
    {
      key: 'vibration' as keyof DevicePermissions,
      title: 'Haptic Feedback & Vibration',
      desc: 'Physical vibration confirmation on command execution',
      icon: <Vibrate className="w-4 h-4 text-indigo-400" />,
    },
  ];

  const allGranted = Object.values(permissions).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">Mobile Access & Permissions</h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {allGranted ? '100% Granted' : 'Super Assistant Mode'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Myra controls your mobile device seamlessly on voice commands
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

        {/* Action Button: Grant All */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold text-slate-200">
              One-Command Phone Control
            </span>
          </div>

          <button
            onClick={onGrantAll}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grant All Access</span>
          </button>
        </div>

        {/* Permissions List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {permissionItems.map(item => {
            const isGranted = permissions[item.key];
            return (
              <div
                key={item.key}
                onClick={() => onTogglePermission(item.key)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isGranted
                    ? 'bg-slate-950/70 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-slate-950/30 border-slate-800 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isGranted ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900/40'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {item.title}
                      {isGranted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    isGranted ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                      isGranted ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>All Android hardware privileges linked</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
