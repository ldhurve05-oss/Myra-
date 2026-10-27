import React, { useState } from 'react';
import {
  X,
  Activity,
  Footprints,
  Heart,
  Moon,
  Droplets,
  Flame,
  Gauge,
  Radio,
  Play,
  Pause,
  Plus,
  Minus,
  Sparkles,
  Award,
  TrendingUp,
  RefreshCw,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { HealthMetrics } from '../types/assistant';

interface HealthTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: HealthMetrics;
  onAddSteps: (count: number) => void;
  isScanningHeartRate: boolean;
  scanProgress: number;
  onStartHeartRateScan: () => void;
  isSimulatingWalk: boolean;
  onToggleWalkSimulation: () => void;
  onLogWater: (ml: number) => void;
  onLogSleepHours: (hours: number) => void;
  isGfMode: boolean;
}

export const HealthTrackerModal: React.FC<HealthTrackerModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onAddSteps,
  isScanningHeartRate,
  scanProgress,
  onStartHeartRateScan,
  isSimulatingWalk,
  onToggleWalkSimulation,
  onLogWater,
  onLogSleepHours,
  isGfMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'heart' | 'sleep' | 'hydration'>('overview');

  if (!isOpen) return null;

  const stepPercentage = Math.min(100, Math.round((metrics.steps.current / metrics.steps.goal) * 100));
  const waterPercentage = Math.min(100, Math.round((metrics.hydration.currentMl / metrics.hydration.goalMl) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/50">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Myra Health & Vitals
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Live Sensors
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time steps, optical pulse & sleep analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Hardware Sensor Status Banner */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              {metrics.sensors.sensorAccuracy} Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleWalkSimulation}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                isSimulatingWalk
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isSimulatingWalk ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              {isSimulatingWalk ? 'Walking...' : 'Test Walk'}
            </button>

            <button
              onClick={() => onAddSteps(50)}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-0.5 cursor-pointer"
              title="Add 50 test steps"
            >
              <Plus className="w-2.5 h-2.5 text-cyan-400" /> 50 Steps
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-3 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Steps & Motion
          </button>
          <button
            onClick={() => setActiveTab('heart')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'heart'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Heart Rate
          </button>
          <button
            onClick={() => setActiveTab('sleep')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sleep'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Sleep Analysis
          </button>
          <button
            onClick={() => setActiveTab('hydration')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hydration'
                ? 'border-blue-500 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Water
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Myra Companion Health Insight Card */}
              <div className={`p-3.5 rounded-2xl border ${
                isGfMode
                  ? 'bg-gradient-to-r from-pink-950/50 to-slate-900 border-pink-500/30 text-pink-100'
                  : 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/30 text-rose-100'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                    {isGfMode ? "Myra's Caring Health Tip 💕" : "Myra's Daily Health Briefing"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">
                  {isGfMode
                    ? `Jaan, aapne aaj ${metrics.steps.current.toLocaleString()} steps chal liye hain (${stepPercentage}% of goal)! Heart rate ${metrics.heartRate.currentBpm} BPM ekdum healthy hai. Paani peete rahiye aur apna khayal rakhiye! ❤️`
                    : `Great work! Today you've logged ${metrics.steps.current.toLocaleString()} steps and burned ${metrics.steps.caloriesKcal} kcal. Your resting heart rate is optimal at ${metrics.heartRate.restingBpm} BPM.`}
                </p>
              </div>

              {/* 4 Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Steps Tile */}
                <div
                  onClick={() => setActiveTab('steps')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Daily Steps</span>
                    <Footprints className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-xl font-black text-white">
                    {metrics.steps.current.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Goal: {metrics.steps.goal.toLocaleString()}</span>
                    <span className="text-cyan-400 font-bold">{stepPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stepPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Heart Rate Tile */}
                <div
                  onClick={() => setActiveTab('heart')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Heart Rate</span>
                    <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white">{metrics.heartRate.currentBpm}</span>
                    <span className="text-xs text-rose-400 font-semibold">BPM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Resting: {metrics.heartRate.restingBpm}</span>
                    <span className="text-emerald-400 font-bold capitalize">{metrics.heartRate.status}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (metrics.heartRate.currentBpm / 140) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sleep Tile */}
                <div
                  onClick={() => setActiveTab('sleep')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Sleep Last Night</span>
                    <Moon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white">{metrics.sleep.lastNightHours}</span>
                    <span className="text-xs text-indigo-400 font-semibold">hrs</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Deep: {metrics.sleep.deepHours}h</span>
                    <span className="text-indigo-400 font-bold">{metrics.sleep.qualityScore}% Score</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (metrics.sleep.lastNightHours / 8) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Water Tile */}
                <div
                  onClick={() => setActiveTab('hydration')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Hydration</span>
                    <Droplets className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-white">{(metrics.hydration.currentMl / 1000).toFixed(1)}</span>
                    <span className="text-xs text-blue-400 font-semibold">/ {(metrics.hydration.goalMl / 1000).toFixed(1)} L</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{Math.round(metrics.hydration.currentMl / 250)} glasses</span>
                    <span className="text-blue-400 font-bold">{waterPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${waterPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hourly Activity Quick Preview Chart */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">Today's Step Distribution</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-semibold">
                    {metrics.steps.distanceKm} km • {metrics.steps.caloriesKcal} kcal
                  </span>
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.steps.hourly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="steps" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                        {metrics.steps.hourly.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === metrics.steps.hourly.length - 1 ? '#38bdf8' : '#0891b2'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEPS & MOTION */}
          {activeTab === 'steps' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Step Stats Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 to-slate-950 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                      Current Steps
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {metrics.steps.current.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Target Goal</span>
                    <div className="text-base font-bold text-slate-200">
                      {metrics.steps.goal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/80">
                    <div className="text-[10px] text-slate-400">Distance</div>
                    <div className="text-sm font-bold text-cyan-300">{metrics.steps.distanceKm} km</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80">
                    <div className="text-[10px] text-slate-400">Burned</div>
                    <div className="text-sm font-bold text-amber-300">{metrics.steps.caloriesKcal} kcal</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80">
                    <div className="text-[10px] text-slate-400">Active Time</div>
                    <div className="text-sm font-bold text-emerald-300">{metrics.steps.activeMinutes} min</div>
                  </div>
                </div>
              </div>

              {/* 7-Day Steps Trend Recharts AreaChart */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Past 7 Days History</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Daily Goal: 10,000</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.steps.weekly} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                      />
                      <ReferenceLine y={10000} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#10b981', fontSize: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="steps"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorSteps)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Manual & Sensor Simulation Actions */}
              <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Motion Sensor Testing</div>
                  <div className="text-[10px] text-slate-400">Shake phone or tap to simulate physical steps</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAddSteps(10)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => onAddSteps(100)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                  >
                    +100
                  </button>
                  <button
                    onClick={() => onAddSteps(500)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                  >
                    +500
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEART RATE */}
          {activeTab === 'heart' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Live Heart Rate Pulse Display */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/50 via-slate-950 to-slate-950 border border-rose-500/30 text-center relative overflow-hidden">
                <div className="flex justify-center mb-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isScanningHeartRate ? 'bg-rose-500/30 border-2 border-rose-400 animate-ping' : 'bg-rose-500/20 border border-rose-500/40'
                  }`}>
                    <Heart className={`w-8 h-8 text-rose-500 fill-rose-500 ${isScanningHeartRate ? 'scale-125' : 'animate-pulse'}`} />
                  </div>
                </div>

                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black text-white">{metrics.heartRate.currentBpm}</span>
                  <span className="text-sm font-bold text-rose-400">BPM</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 capitalize font-medium">
                  {isScanningHeartRate ? 'Scanning optical PPG pulse...' : `Heart Rate: ${metrics.heartRate.status} (${metrics.heartRate.zone})`}
                </p>

                {/* Scan Progress Bar */}
                {isScanningHeartRate && (
                  <div className="mt-4 max-w-xs mx-auto">
                    <div className="flex justify-between text-[10px] text-rose-300 mb-1">
                      <span>Analyzing pulse wave</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Scan Trigger Button */}
                <div className="mt-4">
                  <button
                    onClick={onStartHeartRateScan}
                    disabled={isScanningHeartRate}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                      isScanningHeartRate
                        ? 'bg-rose-900/60 text-rose-300 cursor-not-allowed border border-rose-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50 active:scale-95'
                    }`}
                  >
                    {isScanningHeartRate ? 'Measuring (Keep Still)...' : 'Scan Live Pulse (Optical Sensor)'}
                  </button>
                </div>
              </div>

              {/* Live ECG Waveform Chart with Recharts */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-200">Live ECG Waveform Monitor</span>
                  </div>
                  <span className="text-[10px] text-slate-400">50mm/s Lead II</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.heartRate.ecgWaveform} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[-0.5, 1.2]} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="voltage"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#f43f5e' }}
                        activeDot={{ r: 5, fill: '#fda4af' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heart Zones Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Resting</div>
                  <div className="text-sm font-bold text-emerald-400">{metrics.heartRate.restingBpm} BPM</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Minimum</div>
                  <div className="text-sm font-bold text-cyan-400">{metrics.heartRate.minBpm} BPM</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Peak</div>
                  <div className="text-sm font-bold text-rose-400">{metrics.heartRate.maxBpm} BPM</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLEEP ANALYTICS */}
          {activeTab === 'sleep' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Sleep Score Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold">
                      Sleep Quality
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {metrics.sleep.qualityScore}%
                    </div>
                    <span className="text-xs text-indigo-300">Deep Restorative Sleep</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Duration</span>
                    <div className="text-2xl font-bold text-white">
                      {metrics.sleep.lastNightHours} hrs
                    </div>
                  </div>
                </div>

                {/* Sleep Stages Breakdown */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                    <span className="text-indigo-400 block font-semibold">Deep</span>
                    <span className="text-xs font-bold text-white">{metrics.sleep.deepHours}h</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20">
                    <span className="text-purple-400 block font-semibold">REM</span>
                    <span className="text-xs font-bold text-white">{metrics.sleep.remHours}h</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/20">
                    <span className="text-blue-400 block font-semibold">Light</span>
                    <span className="text-xs font-bold text-white">{metrics.sleep.lightHours}h</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/20">
                    <span className="text-amber-400 block font-semibold">Awake</span>
                    <span className="text-xs font-bold text-white">{metrics.sleep.awakeHours}h</span>
                  </div>
                </div>
              </div>

              {/* Stacked BarChart for 7 Nights Sleep Composition with Recharts */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">7-Day Sleep Stage Composition</span>
                  <span className="text-[10px] text-slate-400">Deep • REM • Light</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.sleep.weekly} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="deep" stackId="a" fill="#6366f1" name="Deep (hrs)" />
                      <Bar dataKey="rem" stackId="a" fill="#a855f7" name="REM (hrs)" />
                      <Bar dataKey="light" stackId="a" fill="#38bdf8" name="Light (hrs)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Log Sleep Hours */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Log Today's Sleep</div>
                  <div className="text-[10px] text-slate-400">Update recorded duration with one tap</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[6.5, 7.5, 8.0, 9.0].map(hrs => (
                    <button
                      key={hrs}
                      onClick={() => onLogSleepHours(hrs)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        metrics.sleep.lastNightHours === hrs
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {hrs}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HYDRATION */}
          {activeTab === 'hydration' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Water Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/50 to-slate-950 border border-blue-500/30 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto mb-2">
                  <Droplets className="w-8 h-8" />
                </div>
                <div className="text-3xl font-black text-white">
                  {(metrics.hydration.currentMl / 1000).toFixed(2)} L
                </div>
                <div className="text-xs text-blue-300 font-medium mt-0.5">
                  Goal: {(metrics.hydration.goalMl / 1000).toFixed(1)} L ({waterPercentage}%)
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${waterPercentage}%` }}
                  />
                </div>
              </div>

              {/* Quick Water Logging Actions */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Quick Log Hydration</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onLogWater(250)}
                    className="p-3 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                    <span>+1 Glass (250 ml)</span>
                  </button>
                  <button
                    onClick={() => onLogWater(500)}
                    className="p-3 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <span>+1 Bottle (500 ml)</span>
                  </button>
                  <button
                    onClick={() => onLogWater(-250)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    <Minus className="w-4 h-4 text-slate-400" />
                    <span>-250 ml (Undo)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Health Storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
