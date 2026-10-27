export type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface MyraAvatar {
  id: string;
  name: string;
  tag: string;
  iconType: 'emoji' | 'image' | 'svg';
  iconValue: string;
  glowColor?: string;
  description?: string;
}

export interface DevicePermissions {
  microphone: boolean;
  camera: boolean;
  location: boolean;
  contacts: boolean;
  notifications: boolean;
  storage: boolean;
  torch: boolean;
  vibration: boolean;
  systemSettings: boolean;
}

export interface ActionPayload {
  type:
    | 'none'
    | 'youtube_play'
    | 'open_whatsapp'
    | 'whatsapp_message'
    | 'whatsapp_call'
    | 'design_website'
    | 'toggle_gf_mode'
    | 'toggle_torch'
    | 'set_volume'
    | 'set_brightness'
    | 'open_camera'
    | 'set_alarm'
    | 'get_location'
    | 'open_dialer'
    | 'send_sms'
    | 'system_status'
    | 'grant_all_permissions'
    | 'change_wallpaper'
    | 'change_voice'
    | 'toggle_battery_saver'
    | 'open_health_tracker'
    | 'log_health'
    | 'open_voice_history'
    | 'open_google_drive'
    | 'save_to_google_drive';
  wallpaper?: {
    id: string;
    name: string;
  };
  voice?: {
    persona: 'cute' | 'gf' | 'friendly' | 'whisper';
  };
  youtube?: {
    query: string;
    title: string;
  };
  whatsapp?: {
    recipient: string;
    phone: string;
    message: string;
  };
  whatsappCall?: {
    recipient: string;
    phone: string;
    isVideo: boolean;
  };
  websiteDesign?: {
    topic: string;
    prompt: string;
    title: string;
  };
  gfModeToggle?: {
    enabled: boolean;
  };
  torch?: {
    enabled: boolean;
  };
  volume?: {
    level: number;
    action?: 'up' | 'down' | 'mute' | 'max';
  };
  brightness?: {
    level: number;
    action?: 'up' | 'down' | 'max' | 'night';
  };
  camera?: {
    selfie?: boolean;
  };
  alarm?: {
    time: string;
    label: string;
  };
  dialer?: {
    phone: string;
    name?: string;
  };
  sms?: {
    recipient: string;
    phone: string;
    message: string;
  };
  batterySaver?: {
    enabled: boolean;
  };
  googleDrive?: {
    action?: 'open' | 'save_chat';
    title?: string;
  };
}

export type SentimentMood =
  | 'joyful'
  | 'calm'
  | 'enthusiastic'
  | 'loving'
  | 'empathetic'
  | 'playful'
  | 'neutral';

export type SentimentPattern =
  | 'pink_pulse'
  | 'blue_ripple'
  | 'amber_energy'
  | 'violet_glow'
  | 'emerald_wave';

export interface SentimentAnalysis {
  mood: SentimentMood;
  score: number; // 0.0 to 1.0 (intensity / positivity)
  pattern: SentimentPattern;
  label?: string;
  colorHex?: string;
  secondaryColorHex?: string;
}

export interface AssistantResponse {
  reply: string;
  tone: 'loving' | 'friendly' | 'playful' | 'caring' | 'enthusiastic';
  action: ActionPayload;
  sentiment?: SentimentAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionType?: string;
  tone?: string;
  sentiment?: SentimentAnalysis;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar: string;
  lastSeen?: string;
}

export interface GeneratedWebsite {
  title: string;
  description: string;
  html: string;
  topic: string;
  createdAt: string;
}

export interface SystemStatusData {
  batteryLevel: number;
  isCharging: boolean;
  wifiConnected: boolean;
  bluetoothConnected: boolean;
  torchOn: boolean;
  volume: number;
  brightness: number;
  dnd: boolean;
  storageFreeGb: number;
  batterySaverActive: boolean;
  pauseAnimations: boolean;
}

export interface StepHourlyData {
  hour: string;
  steps: number;
  activeMin: number;
}

export interface WeeklyStepData {
  day: string;
  steps: number;
  goal: number;
}

export interface SleepDayData {
  day: string;
  deep: number;    // hours
  rem: number;     // hours
  light: number;   // hours
  awake: number;   // hours
  total: number;   // hours
  efficiency: number; // percentage
}

export interface EcgSample {
  time: string;
  bpm: number;
  voltage: number;
}

export interface HealthMetrics {
  steps: {
    current: number;
    goal: number;
    distanceKm: number;
    caloriesKcal: number;
    activeMinutes: number;
    hourly: StepHourlyData[];
    weekly: WeeklyStepData[];
  };
  heartRate: {
    currentBpm: number;
    restingBpm: number;
    minBpm: number;
    maxBpm: number;
    status: 'resting' | 'optimal' | 'elevated' | 'measuring';
    zone: 'Rest' | 'Fat Burn' | 'Cardio' | 'Peak';
    ecgWaveform: EcgSample[];
  };
  sleep: {
    lastNightHours: number;
    qualityScore: number;
    deepHours: number;
    remHours: number;
    lightHours: number;
    awakeHours: number;
    weekly: SleepDayData[];
  };
  hydration: {
    currentMl: number;
    goalMl: number;
  };
  sensors: {
    accelerometerAvailable: boolean;
    motionListening: boolean;
    sensorAccuracy: 'Hardware Pedometer' | 'Device Accelerometer' | 'Simulated Sensor';
  };
}

export interface VoiceCommandRecord {
  id: string;
  command: string;
  timestamp: string;
  runCount: number;
  category: 'media' | 'whatsapp' | 'device' | 'health' | 'gf' | 'general';
}
