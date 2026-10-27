import { HealthMetrics, StepHourlyData, WeeklyStepData, SleepDayData, EcgSample } from '../types/assistant';

const STORAGE_KEY = 'myra_health_metrics_v1';

export const INITIAL_HOURLY_STEPS: StepHourlyData[] = [
  { hour: '6 AM', steps: 120, activeMin: 5 },
  { hour: '8 AM', steps: 1420, activeMin: 22 },
  { hour: '10 AM', steps: 890, activeMin: 14 },
  { hour: '12 PM', steps: 1650, activeMin: 25 },
  { hour: '2 PM', steps: 940, activeMin: 15 },
  { hour: '4 PM', steps: 1120, activeMin: 18 },
  { hour: '6 PM', steps: 1850, activeMin: 28 },
  { hour: '8 PM', steps: 820, activeMin: 12 },
];

export const INITIAL_WEEKLY_STEPS: WeeklyStepData[] = [
  { day: 'Mon', steps: 8420, goal: 10000 },
  { day: 'Tue', steps: 10150, goal: 10000 },
  { day: 'Wed', steps: 7890, goal: 10000 },
  { day: 'Thu', steps: 11200, goal: 10000 },
  { day: 'Fri', steps: 9450, goal: 10000 },
  { day: 'Sat', steps: 12400, goal: 10000 },
  { day: 'Sun (Today)', steps: 8810, goal: 10000 },
];

export const INITIAL_WEEKLY_SLEEP: SleepDayData[] = [
  { day: 'Mon', deep: 1.8, rem: 1.9, light: 3.5, awake: 0.5, total: 7.2, efficiency: 88 },
  { day: 'Tue', deep: 2.1, rem: 2.0, light: 3.8, awake: 0.3, total: 7.9, efficiency: 93 },
  { day: 'Wed', deep: 1.5, rem: 1.6, light: 3.2, awake: 0.8, total: 6.3, efficiency: 79 },
  { day: 'Thu', deep: 2.3, rem: 2.1, light: 3.6, awake: 0.4, total: 8.0, efficiency: 94 },
  { day: 'Fri', deep: 1.9, rem: 1.8, light: 3.4, awake: 0.5, total: 7.1, efficiency: 86 },
  { day: 'Sat', deep: 2.4, rem: 2.3, light: 4.1, awake: 0.4, total: 8.8, efficiency: 95 },
  { day: 'Sun (Last Night)', deep: 2.2, rem: 1.9, light: 3.5, awake: 0.4, total: 7.6, efficiency: 91 },
];

export const INITIAL_ECG_WAVEFORM: EcgSample[] = [
  { time: '0s', bpm: 72, voltage: 0.1 },
  { time: '1s', bpm: 72, voltage: 0.12 },
  { time: '2s', bpm: 73, voltage: 0.85 }, // R-peak
  { time: '3s', bpm: 73, voltage: -0.3 }, // S-wave
  { time: '4s', bpm: 72, voltage: 0.25 }, // T-wave
  { time: '5s', bpm: 71, voltage: 0.1 },
  { time: '6s', bpm: 72, voltage: 0.12 },
  { time: '7s', bpm: 73, voltage: 0.9 }, // R-peak
  { time: '8s', bpm: 73, voltage: -0.28 },
  { time: '9s', bpm: 72, voltage: 0.24 },
  { time: '10s', bpm: 72, voltage: 0.1 },
  { time: '11s', bpm: 72, voltage: 0.88 },
  { time: '12s', bpm: 74, voltage: 0.15 },
];

export const DEFAULT_HEALTH_METRICS: HealthMetrics = {
  steps: {
    current: 8810,
    goal: 10000,
    distanceKm: 6.87,
    caloriesKcal: 352,
    activeMinutes: 64,
    hourly: INITIAL_HOURLY_STEPS,
    weekly: INITIAL_WEEKLY_STEPS,
  },
  heartRate: {
    currentBpm: 72,
    restingBpm: 64,
    minBpm: 58,
    maxBpm: 126,
    status: 'optimal',
    zone: 'Rest',
    ecgWaveform: INITIAL_ECG_WAVEFORM,
  },
  sleep: {
    lastNightHours: 7.6,
    qualityScore: 91,
    deepHours: 2.2,
    remHours: 1.9,
    lightHours: 3.5,
    awakeHours: 0.4,
    weekly: INITIAL_WEEKLY_SLEEP,
  },
  hydration: {
    currentMl: 2250,
    goalMl: 3000,
  },
  sensors: {
    accelerometerAvailable: false,
    motionListening: false,
    sensorAccuracy: 'Device Accelerometer',
  },
};

export function loadStoredHealthMetrics(): HealthMetrics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all top-level keys exist
      return {
        ...DEFAULT_HEALTH_METRICS,
        ...parsed,
        steps: { ...DEFAULT_HEALTH_METRICS.steps, ...parsed.steps },
        heartRate: { ...DEFAULT_HEALTH_METRICS.heartRate, ...parsed.heartRate },
        sleep: { ...DEFAULT_HEALTH_METRICS.sleep, ...parsed.sleep },
        hydration: { ...DEFAULT_HEALTH_METRICS.hydration, ...parsed.hydration },
        sensors: { ...DEFAULT_HEALTH_METRICS.sensors, ...parsed.sensors },
      };
    }
  } catch (e) {
    console.warn('Failed to load health metrics from storage:', e);
  }
  return DEFAULT_HEALTH_METRICS;
}

export function saveHealthMetrics(metrics: HealthMetrics) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch (e) {
    console.warn('Failed to save health metrics to storage:', e);
  }
}
