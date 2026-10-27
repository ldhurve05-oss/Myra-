/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { VoiceOrb } from './components/VoiceOrb';
import { YouTubeWidget } from './components/YouTubeWidget';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { WebsiteDesignModal } from './components/WebsiteDesignModal';
import { GfModePanel } from './components/GfModePanel';
import { GfLoveStudio } from './components/GfLoveStudio';
import { QuickCommands } from './components/QuickCommands';
import { DevicePermissionsModal } from './components/DevicePermissionsModal';
import { AndroidQuickSettings } from './components/AndroidQuickSettings';
import { CameraModal } from './components/CameraModal';
import { LocationModal } from './components/LocationModal';
import { AlarmModal } from './components/AlarmModal';
import { WallpaperModal } from './components/WallpaperModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { FloatingAssistantBubble } from './components/FloatingAssistantBubble';
import { SmartBatterySaverModal } from './components/SmartBatterySaverModal';
import { HealthTrackerModal } from './components/HealthTrackerModal';
import { VoiceHistoryModal } from './components/VoiceHistoryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { useHealthSensors } from './utils/useHealthSensors';
import { MYRA_WALLPAPERS, MyraWallpaper } from './utils/wallpapers';
import {
  AssistantStatus,
  ChatMessage,
  GeneratedWebsite,
  AssistantResponse,
  DevicePermissions,
  SystemStatusData,
  VoiceCommandRecord,
  SentimentAnalysis,
  SentimentMood,
  SentimentPattern,
} from './types/assistant';
import { sounds, speakResponse, stopSpeech, VoicePersona } from './utils/audio';
import {
  Mic,
  MicOff,
  Send,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Youtube,
  MessageSquare,
  Globe,
  Settings2,
  Trash2,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Flashlight,
  Sliders,
  Camera,
  MapPin,
  Bell,
  Palette,
  Smile,
  Minimize2,
  Zap,
  ZapOff,
  BatteryLow,
  Activity,
  History,
  Download,
  HardDrive,
} from 'lucide-react';

export default function App() {
  // App view & customization settings
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isGfMode, setIsGfMode] = useState(false);
  const [userNickname, setUserNickname] = useState('Jaan');
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [autoListenAfterReply, setAutoListenAfterReply] = useState(false);

  // Dynamic Waveform Sentiment State for Voice Orb
  const [currentSentiment, setCurrentSentiment] = useState<SentimentAnalysis>({
    mood: 'joyful',
    score: 0.94,
    pattern: 'pink_pulse',
    label: 'Joyful Pulse (+94%)',
    colorHex: '#ec4899',
    secondaryColorHex: '#f43f5e',
  });

  // Wallpaper & Cute Voice Personalization
  const [currentWallpaper, setCurrentWallpaper] = useState<MyraWallpaper>(() => {
    const savedId = localStorage.getItem('myra_selected_wallpaper');
    return MYRA_WALLPAPERS.find(w => w.id === savedId) || MYRA_WALLPAPERS[0];
  });
  const [voicePersona, setVoicePersona] = useState<VoicePersona>(() => {
    const saved = localStorage.getItem('myra_voice_persona') as VoicePersona;
    return saved || 'cute';
  });
  const [wakeWordActive, setWakeWordActive] = useState<boolean>(true);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState<boolean>(false);

  // Assistant & Voice states
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');

  // Mobile Device Permissions & System Status
  const [permissions, setPermissions] = useState<DevicePermissions>(() => {
    const saved = localStorage.getItem('myra_device_permissions');
    return saved
      ? JSON.parse(saved)
      : {
          microphone: true,
          camera: true,
          location: true,
          contacts: true,
          notifications: true,
          storage: true,
          torch: true,
          vibration: true,
          systemSettings: true,
        };
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatusData>({
    batteryLevel: 98,
    isCharging: false,
    wifiConnected: true,
    bluetoothConnected: true,
    torchOn: false,
    volume: 85,
    brightness: 100,
    dnd: false,
    storageFreeGb: 112,
    batterySaverActive: false,
    pauseAnimations: false,
  });

  const prevBrightnessRef = useRef<number>(100);
  const hasPromptedLowBatteryRef = useRef<boolean>(false);

  // Active Modals
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showBatterySaverModal, setShowBatterySaverModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showVoiceHistoryModal, setShowVoiceHistoryModal] = useState(false);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);
  const [showGfStudio, setShowGfStudio] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState<{ selfie: boolean } | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [alarmModalOpen, setAlarmModalOpen] = useState<{ time: string; label: string } | null>(null);

  // Persistent Voice Command History
  const [voiceHistory, setVoiceHistory] = useState<VoiceCommandRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('myra_voice_command_history');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'vh-1',
        command: 'Kesariya song chalao YouTube pe',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        runCount: 4,
        category: 'media',
      },
      {
        id: 'vh-2',
        command: 'Rahul ko WhatsApp message bhejo: Main 10 minute me aa raha hu',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        runCount: 2,
        category: 'whatsapp',
      },
      {
        id: 'vh-3',
        command: 'Health dashboard kholo aur step count dikhao',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        runCount: 5,
        category: 'health',
      },
      {
        id: 'vh-4',
        command: 'Flashlight on karo',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        runCount: 1,
        category: 'device',
      },
      {
        id: 'vh-5',
        command: 'Battery saver on karo',
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        runCount: 3,
        category: 'device',
      },
      {
        id: 'vh-6',
        command: 'GF mode activate karo jaan',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        runCount: 6,
        category: 'gf',
      },
    ];
  });

  // Active Automations
  const [youtubeState, setYoutubeState] = useState<{ query: string; title?: string } | null>(null);
  const [whatsappState, setWhatsappState] = useState<{
    mode: 'open' | 'message' | 'call';
    recipient?: string;
    phone?: string;
    message?: string;
    isVideo?: boolean;
  } | null>(null);
  const [websiteModal, setWebsiteModal] = useState<GeneratedWebsite | null>(null);
  const [isDesigningWebsite, setIsDesigningWebsite] = useState(false);
  const [showGfPanel, setShowGfPanel] = useState(false);

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: 'Namaste! Main Myra hu aapki personal AI assistant. Mere paas cute aawaz, HD dynamic wallpapers, aur aapke phone ke saare accesses hain. Boliye jaan, main kya karu?',
      timestamp: 'Just now',
      tone: 'friendly',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Request browser notification permission for background execution
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const sendBackgroundNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: currentWallpaper.previewUrl });
      } catch {}
    }
  };

  // Vibration / Haptic Feedback utility
  const triggerHaptic = useCallback((pattern: number | number[] = 100) => {
    if (permissions.vibration && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }, [permissions.vibration]);

  // Health and Sensor Tracker Engine
  const health = useHealthSensors(triggerHaptic);

  // Save wallpaper selection
  const handleSelectWallpaper = (wp: MyraWallpaper) => {
    setCurrentWallpaper(wp);
    localStorage.setItem('myra_selected_wallpaper', wp.id);
  };

  // Save voice persona selection
  const handleSelectVoicePersona = (p: VoicePersona) => {
    setVoicePersona(p);
    localStorage.setItem('myra_voice_persona', p);
  };

  // Save permissions
  const handleTogglePermission = (key: keyof DevicePermissions) => {
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    localStorage.setItem('myra_device_permissions', JSON.stringify(updated));
  };

  const handleGrantAllPermissions = () => {
    const allOn: DevicePermissions = {
      microphone: true,
      camera: true,
      location: true,
      contacts: true,
      notifications: true,
      storage: true,
      torch: true,
      vibration: true,
      systemSettings: true,
    };
    setPermissions(allOn);
    localStorage.setItem('myra_device_permissions', JSON.stringify(allOn));
    sounds.playLoveChime();
    triggerHaptic([100, 50, 100]);

    const confirmMsg: ChatMessage = {
      id: `p-${Date.now()}`,
      role: 'assistant',
      text: 'Super Assistant Mode Activated! Phone ke saare mobile accesses (Camera, Torch, WhatsApp, Calls, Volume, Location) Myra ko de diye gaye hain! 📱✨',
      timestamp: 'Just now',
      tone: 'enthusiastic',
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  const handleToggleBatterySaver = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !systemStatus.batterySaverActive;
    if (nextState) {
      prevBrightnessRef.current = systemStatus.brightness;
      setSystemStatus(prev => ({
        ...prev,
        batterySaverActive: true,
        brightness: Math.min(prev.brightness, 30),
        pauseAnimations: true,
      }));
      setPermissions(prev => ({ ...prev, vibration: false }));
    } else {
      setSystemStatus(prev => ({
        ...prev,
        batterySaverActive: false,
        brightness: prevBrightnessRef.current || 100,
        pauseAnimations: false,
      }));
      setPermissions(prev => ({ ...prev, vibration: true }));
    }
    sounds.playSuccess();
    triggerHaptic(50);
  };

  const handleSimulateBatteryLevel = (lvl: number) => {
    setSystemStatus(prev => ({ ...prev, batteryLevel: lvl }));
  };

  // Record command into persistent voice history
  const recordVoiceCommand = useCallback((cmdText: string) => {
    if (!cmdText.trim()) return;
    const trimmed = cmdText.trim();
    const lower = trimmed.toLowerCase();

    let category: VoiceCommandRecord['category'] = 'general';
    if (
      lower.includes('youtube') ||
      lower.includes('gaana') ||
      lower.includes('song') ||
      lower.includes('play') ||
      lower.includes('music')
    ) {
      category = 'media';
    } else if (
      lower.includes('whatsapp') ||
      lower.includes('msg') ||
      lower.includes('message') ||
      lower.includes('call')
    ) {
      category = 'whatsapp';
    } else if (
      lower.includes('torch') ||
      lower.includes('flashlight') ||
      lower.includes('volume') ||
      lower.includes('brightness') ||
      lower.includes('battery') ||
      lower.includes('camera') ||
      lower.includes('alarm')
    ) {
      category = 'device';
    } else if (
      lower.includes('health') ||
      lower.includes('step') ||
      lower.includes('heart') ||
      lower.includes('sleep') ||
      lower.includes('water') ||
      lower.includes('vitals')
    ) {
      category = 'health';
    } else if (
      lower.includes('gf') ||
      lower.includes('girlfriend') ||
      lower.includes('jaan') ||
      lower.includes('baby') ||
      lower.includes('love')
    ) {
      category = 'gf';
    }

    setVoiceHistory(prev => {
      const existingIndex = prev.findIndex(
        item => item.command.toLowerCase() === trimmed.toLowerCase()
      );
      let updated: VoiceCommandRecord[];
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedItem: VoiceCommandRecord = {
          ...existing,
          runCount: existing.runCount + 1,
          timestamp: new Date().toISOString(),
          category: existing.category || category,
        };
        updated = [updatedItem, ...prev.filter((_, idx) => idx !== existingIndex)];
      } else {
        const newItem: VoiceCommandRecord = {
          id: `vh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          command: trimmed,
          timestamp: new Date().toISOString(),
          runCount: 1,
          category,
        };
        updated = [newItem, ...prev].slice(0, 100);
      }
      try {
        localStorage.setItem('myra_voice_command_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const handleClearVoiceHistory = useCallback(() => {
    setVoiceHistory([]);
    try {
      localStorage.removeItem('myra_voice_command_history');
    } catch {}
    sounds.playCutePop();
    triggerHaptic(50);
  }, [triggerHaptic]);

  const handleDeleteVoiceCommand = useCallback((id: string) => {
    setVoiceHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('myra_voice_command_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    triggerHaptic(40);
  }, [triggerHaptic]);

  // Export current conversation history as a formatted text file
  const handleExportChat = useCallback(() => {
    if (messages.length === 0) return;
    triggerHaptic(50);
    sounds.playCutePop();
    const divider = '--------------------------------------------------------------------------------';
    const header = `================================================================================
MYRA PERSONAL AI ASSISTANT - CONVERSATION HISTORY EXPORT
================================================================================
Export Date: ${new Date().toLocaleString()}
Assistant Mode: ${isGfMode ? 'Girlfriend Mode 💕' : 'Personal Assistant'}
Voice Persona: ${voicePersona}
Total Dialogue Messages: ${messages.length}
================================================================================\n\n`;

    const formattedBody = messages
      .map((m, index) => {
        const sender = m.role === 'user' ? 'YOU' : 'MYRA (AI)';
        const actionNote =
          m.actionType && m.actionType !== 'none' ? ` [Action: ${m.actionType}]` : '';
        return `[#${index + 1}] [${m.timestamp}] ${sender}${actionNote}:\n${m.text}\n`;
      })
      .join(`\n${divider}\n\n`);

    const blob = new Blob([header + formattedBody], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myra-chat-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [messages, isGfMode, voicePersona, triggerHaptic]);

  // Speech Recognition setup with Wake-word background engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = wakeWordActive;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Supports Hindi + Hinglish + English

      recognition.onstart = () => {
        setStatus('listening');
        setStatusMessage(wakeWordActive ? 'Listening (Wake word: "Hey Myra")...' : 'Listening to voice command...');
        sounds.playListenStart();
        triggerHaptic(50);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // Check wake-word if in continuous background mode
        if (wakeWordActive) {
          const lower = currentTranscript.toLowerCase();
          if (lower.includes('hey myra') || lower.includes('suno myra') || lower.includes('hello myra')) {
            sounds.playCutePop();
            triggerHaptic([50, 50]);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
        setStatus('idle');
      };

      recognition.onend = () => {
        setTranscript(prev => {
          if (prev.trim()) {
            handleProcessCommand(prev.trim());
          } else {
            setStatus('idle');
            setStatusMessage('');
          }
          return '';
        });

        // If wake-word active and not stopped intentionally, restart recognition loop
        if (wakeWordActive && !isFloatingMinimized) {
          try {
            setTimeout(() => {
              if (recognitionRef.current && status === 'idle') {
                recognitionRef.current.start();
              }
            }, 600);
          } catch {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeech();
    };
  }, [isGfMode, userNickname, voiceFeedbackEnabled, autoListenAfterReply, permissions, wakeWordActive, voicePersona]);

  // Toggle listening
  const toggleListening = () => {
    if (status === 'speaking') {
      stopSpeech();
      setStatus('idle');
      return;
    }

    if (status === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setStatus('idle');
      return;
    }

    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your command below!');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 200);
    }
  };

  // Main Command Processing Pipeline
  const handleProcessCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    triggerHaptic(80);

    // Clean up wake-word prefix if present
    const cleanCommand = commandText
      .replace(/hey myra/gi, '')
      .replace(/suno myra/gi, '')
      .replace(/hello myra/gi, '')
      .trim() || commandText;

    // Record into persistent voice history
    recordVoiceCommand(cleanCommand);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: cleanCommand,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setStatus('thinking');
    setStatusMessage('Myra is processing your command...');

    try {
      // Send to full-stack Express /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanCommand,
          isGfMode,
          userName: userNickname,
        }),
      });

      const data: AssistantResponse = await res.json();
      const reply = data.reply || 'Main aapke command par kaam kar rahi hu!';
      const action = data.action;

      // Update Voice Orb waveform sentiment visualizer
      if (data.sentiment) {
        setCurrentSentiment(data.sentiment);
      }

      // 2. Add Assistant Message
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: action?.type,
        tone: data.tone,
        sentiment: data.sentiment,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Trigger background notification
      sendBackgroundNotification('Myra AI Assistant', reply);

      // 3. Handle Automation & Device Actions
      executeAction(action, reply);

      // 4. Voice Response Playback (Using Cute Voice Engine)
      if (voiceFeedbackEnabled) {
        setStatus('speaking');
        setStatusMessage(
          isGfMode ? 'Myra bol rahi hai jaan 💕' : 'Myra bol rahi hai cute aawaz me 🌸'
        );
        await speakResponse(
          reply,
          isGfMode,
          () => setStatus('speaking'),
          () => {
            setStatus('idle');
            setStatusMessage('');
            if (autoListenAfterReply) {
              setTimeout(() => toggleListening(), 800);
            }
          },
          isGfMode ? 'gf' : voicePersona
        );
      } else {
        setStatus('idle');
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Error processing command:', err);
      setStatus('idle');
      setStatusMessage('Sorry, kuch takneeki issue aaya. Kripya dobara bolein.');
    }
  };

  // Execute detected actions
  const executeAction = async (action: any, replyText: string) => {
    if (!action || action.type === 'none') {
      sounds.playSuccess();
      return;
    }

    triggerHaptic([100, 50, 100]);

    switch (action.type) {
      case 'change_wallpaper':
        sounds.playCutePop();
        const foundWp = MYRA_WALLPAPERS.find(w => w.id === action.wallpaper?.id);
        if (foundWp) {
          handleSelectWallpaper(foundWp);
        } else {
          setShowWallpaperModal(true);
        }
        break;

      case 'change_voice':
        sounds.playCutePop();
        handleSelectVoicePersona('cute');
        break;

      // MOBILE ACCESS & DEVICE ACTIONS
      case 'grant_all_permissions':
        handleGrantAllPermissions();
        break;

      case 'toggle_torch':
        sounds.playSuccess();
        const nextTorch = action.torch?.enabled !== undefined ? action.torch.enabled : !systemStatus.torchOn;
        setSystemStatus(prev => ({ ...prev, torchOn: nextTorch }));
        break;

      case 'set_volume':
        sounds.playSuccess();
        const newVol = action.volume?.level !== undefined ? action.volume.level : 80;
        setSystemStatus(prev => ({ ...prev, volume: newVol }));
        break;

      case 'set_brightness':
        sounds.playSuccess();
        const newBright = action.brightness?.level !== undefined ? action.brightness.level : 100;
        setSystemStatus(prev => ({ ...prev, brightness: newBright }));
        break;

      case 'open_camera':
        sounds.playSuccess();
        setCameraModalOpen({ selfie: !!action.camera?.selfie });
        break;

      case 'set_alarm':
        sounds.playSuccess();
        setAlarmModalOpen({
          time: action.alarm?.time || '07:00 AM',
          label: action.alarm?.label || 'Morning Wake-up Alarm',
        });
        break;

      case 'get_location':
        sounds.playSuccess();
        setLocationModalOpen(true);
        break;

      case 'system_status':
        sounds.playSuccess();
        setShowQuickSettings(true);
        break;

      // APP AUTOMATIONS
      case 'youtube_play':
        sounds.playSuccess();
        setYoutubeState({
          query: action.youtube?.query || 'Trending Hindi Songs',
          title: action.youtube?.title || action.youtube?.query,
        });
        break;

      case 'open_whatsapp':
        sounds.playSuccess();
        setWhatsappState({
          mode: 'open',
          recipient: action.whatsapp?.recipient || '',
          phone: action.whatsapp?.phone || '',
          message: action.whatsapp?.message || '',
        });
        break;

      case 'whatsapp_message':
        sounds.playSuccess();
        setWhatsappState({
          mode: 'message',
          recipient: action.whatsapp?.recipient || '',
          phone: action.whatsapp?.phone || '',
          message: action.whatsapp?.message || '',
        });
        break;

      case 'whatsapp_call':
        sounds.playSuccess();
        setWhatsappState({
          mode: 'call',
          recipient: action.whatsappCall?.recipient || 'Contact',
          phone: action.whatsappCall?.phone || '',
          isVideo: !!action.whatsappCall?.isVideo,
        });
        break;

      case 'design_website':
        sounds.playSuccess();
        await triggerWebsiteDesign(
          action.websiteDesign?.prompt || action.websiteDesign?.topic || 'Modern Landing Page',
          action.websiteDesign?.topic || 'Custom Web Application'
        );
        break;

      case 'toggle_gf_mode':
        const willEnable = !!action.gfModeToggle?.enabled;
        setIsGfMode(willEnable);
        if (willEnable) {
          sounds.playLoveChime();
          setShowGfStudio(true);
        } else {
          sounds.playSuccess();
        }
        break;

      case 'toggle_battery_saver':
        sounds.playSuccess();
        const nextSaver = action.batterySaver?.enabled !== undefined ? action.batterySaver.enabled : !systemStatus.batterySaverActive;
        handleToggleBatterySaver(nextSaver);
        break;

      case 'open_health_tracker':
        sounds.playSuccess();
        setShowHealthModal(true);
        break;

      case 'open_voice_history':
        sounds.playCutePop();
        setShowVoiceHistoryModal(true);
        break;

      case 'open_google_drive':
      case 'save_to_google_drive':
        sounds.playCutePop();
        setShowGoogleDriveModal(true);
        break;

      default:
        sounds.playSuccess();
        break;
    }
  };

  // Website Generation Logic
  const triggerWebsiteDesign = async (prompt: string, topic: string) => {
    setIsDesigningWebsite(true);
    setWebsiteModal({
      title: topic,
      description: 'Designing live website...',
      html: '',
      topic,
      createdAt: new Date().toLocaleTimeString(),
    });

    try {
      const res = await fetch('/api/design-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, topic, isGfMode }),
      });
      const data = await res.json();
      setWebsiteModal({
        title: data.title || topic,
        description: data.description || 'Designed instantly by Myra AI',
        html: data.html,
        topic,
        createdAt: new Date().toLocaleTimeString(),
      });
      sounds.playSuccess();
    } catch (err) {
      console.error('Website design error:', err);
    } finally {
      setIsDesigningWebsite(false);
    }
  };

  // Re-read a chat message with voice
  const handleReplayVoice = (text: string) => {
    speakResponse(
      text,
      isGfMode,
      () => setStatus('speaking'),
      () => setStatus('idle'),
      isGfMode ? 'gf' : voicePersona
    );
  };

  return (
    <div
      style={{
        filter: systemStatus.brightness < 100 ? `brightness(${systemStatus.brightness}%)` : undefined,
      }}
      className="min-h-screen w-full transition-all duration-300 relative"
    >
      {/* Background Floating Draggable Assistant Bubble */}
      <FloatingAssistantBubble
        isMinimized={isFloatingMinimized}
        onExpand={() => setIsFloatingMinimized(false)}
        status={status}
        isGfMode={isGfMode}
        onToggleMic={toggleListening}
        wakeWordActive={wakeWordActive}
        onToggleWakeWord={() => setWakeWordActive(!wakeWordActive)}
      />

      {/* Visual Flashlight / Torch Beam Overlay */}
      {systemStatus.torchOn && (
        <div className="fixed top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-200/40 via-amber-300/20 to-transparent pointer-events-none z-50 animate-pulse flex justify-center">
          <div className="w-64 h-12 bg-amber-100 rounded-full blur-2xl opacity-80" />
        </div>
      )}

      {/* Android Frame Experience (Hidden when minimized in floating bubble mode) */}
      {!isFloatingMinimized && (
        <AndroidFrame
          isGfMode={isGfMode}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          wallpaperUrl={currentWallpaper.previewUrl}
          bgClass={currentWallpaper.bgClass}
          onMinimizeToBubble={() => setIsFloatingMinimized(true)}
          onOpenWallpapers={() => setShowWallpaperModal(true)}
          onOpenVoiceSettings={() => setShowVoiceModal(true)}
        >
          {/* Top Assistant Header & Interactive Status Bar */}
          <div
            onClick={() => setShowQuickSettings(true)}
            className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 cursor-pointer group"
            title="Tap to pull down Android Quick Settings"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full p-0.5 transition-all shadow-md ${
                  isGfMode
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-600 shadow-pink-500/30'
                    : 'bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-violet-500/30'
                }`}
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  {isGfMode ? (
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  ) : voicePersona === 'cute' ? (
                    <Smile className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-extrabold text-white tracking-tight">
                    {isGfMode ? 'Myra (GF Mode 💕)' : 'Myra Personal AI'}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="text-pink-300 font-semibold">{currentWallpaper.name}</span> • Cute Voice
                </p>
              </div>
            </div>

            {/* Quick Top Toggles */}
            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
              {/* Wallpaper Studio Button */}
              <button
                onClick={() => setShowWallpaperModal(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-pink-300 hover:text-white hover:bg-pink-950/30 shadow-sm"
                title="Myra Wallpapers Gallery"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>

              {/* Cute Voice Settings Button */}
              <button
                onClick={() => setShowVoiceModal(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-rose-300 hover:text-white hover:bg-rose-950/30 shadow-sm"
                title="Cute Voice Settings"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {/* Health Tracker & Sensors Button */}
              <button
                onClick={() => setShowHealthModal(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-rose-400 hover:text-white hover:bg-rose-950/30 shadow-sm"
                title="Health Tracker & Sensors"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse" />
              </button>

              {/* Voice Command History Button */}
              <button
                onClick={() => setShowVoiceHistoryModal(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-amber-400 hover:text-white hover:bg-amber-950/30 shadow-sm"
                title="Voice Command History & Re-run"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* Google Drive Button */}
              <button
                onClick={() => setShowGoogleDriveModal(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-blue-400 hover:text-white hover:bg-blue-950/30 shadow-sm"
                title="Google Drive Files & Backup"
              >
                <HardDrive className="w-3.5 h-3.5" />
              </button>

              {/* Float Bubble Minimize */}
              <button
                onClick={() => setIsFloatingMinimized(true)}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 shadow-sm"
                title="Background Floating Bubble Mode"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Quick WhatsApp Launcher button */}
              <button
                onClick={() => {
                  setWhatsappState({
                    mode: 'open',
                    recipient: '',
                    phone: '',
                    message: '',
                  });
                }}
                className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-700 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 shadow-sm"
                title="Open WhatsApp Center (Message & Call)"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              {/* GF Mode Quick Toggle Button */}
              <button
                onClick={() => {
                  const nextState = !isGfMode;
                  setIsGfMode(nextState);
                  if (nextState) {
                    sounds.playLoveChime();
                    setShowGfStudio(true);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isGfMode
                    ? 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/30'
                    : 'bg-slate-900 border-slate-700 text-pink-300 hover:bg-pink-950/40'
                }`}
                title="Toggle Girlfriend Mode"
              >
                <Heart className={`w-3.5 h-3.5 ${isGfMode ? 'fill-white' : ''}`} />
                <span className="text-[11px]">{isGfMode ? 'GF Active' : 'GF Mode'}</span>
              </button>
            </div>
          </div>

          {/* Android Quick Settings Pull-Down Shade */}
          <AndroidQuickSettings
            isOpen={showQuickSettings}
            onClose={() => setShowQuickSettings(false)}
            statusData={systemStatus}
            onToggleTorch={() =>
              setSystemStatus(prev => ({ ...prev, torchOn: !prev.torchOn }))
            }
            onToggleWifi={() =>
              setSystemStatus(prev => ({ ...prev, wifiConnected: !prev.wifiConnected }))
            }
            onToggleBluetooth={() =>
              setSystemStatus(prev => ({ ...prev, bluetoothConnected: !prev.bluetoothConnected }))
            }
            onToggleDnd={() =>
              setSystemStatus(prev => ({ ...prev, dnd: !prev.dnd }))
            }
            onChangeVolume={val => setSystemStatus(prev => ({ ...prev, volume: val }))}
            onChangeBrightness={val => setSystemStatus(prev => ({ ...prev, brightness: val }))}
            onOpenPermissions={() => {
              setShowQuickSettings(false);
              setShowPermissionsModal(true);
            }}
            onOpenCamera={() => setCameraModalOpen({ selfie: true })}
            onOpenWhatsApp={() =>
              setWhatsappState({ mode: 'open', recipient: '', phone: '', message: '' })
            }
            onToggleBatterySaver={() => handleToggleBatterySaver()}
            onOpenBatterySaverModal={() => {
              setShowQuickSettings(false);
              setShowBatterySaverModal(true);
            }}
            onSimulateBatteryLevel={handleSimulateBatteryLevel}
          />

          {/* Main Interactive Assistant Body */}
          <div className="flex-1 flex flex-col p-2 sm:p-4 space-y-4">
            {/* Holographic Voice Orb Avatar with Dynamic Wallpaper Palette */}
            <VoiceOrb
              status={status}
              isGfMode={isGfMode}
              onToggleListening={toggleListening}
              statusMessage={statusMessage}
              orbColorGradient={currentWallpaper.orbColor}
              accentColor={currentWallpaper.accentColor}
              voicePersona={voicePersona}
            />

            {/* Live Speaking Transcript Banner */}
            {transcript && (
              <div className="mx-3 p-3 rounded-2xl bg-slate-900/90 border border-violet-500/40 backdrop-blur-md text-xs text-violet-200 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-violet-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                  Real-time Voice Recognition
                </div>
                <p className="italic text-white font-medium">"{transcript}"</p>
              </div>
            )}

            {/* 1. YouTube Active Widget */}
            {youtubeState && (
              <YouTubeWidget
                query={youtubeState.query}
                title={youtubeState.title}
                onClose={() => setYoutubeState(null)}
                onPlayNewSong={song => {
                  setYoutubeState({ query: song, title: song });
                  handleProcessCommand(`Play ${song} on YouTube`);
                }}
              />
            )}

            {/* 2. WhatsApp Active Widget */}
            {whatsappState && (
              <WhatsAppWidget
                mode={whatsappState.mode}
                recipient={whatsappState.recipient}
                phone={whatsappState.phone}
                message={whatsappState.message}
                isVideo={whatsappState.isVideo}
                onClose={() => setWhatsappState(null)}
                onSendSuccess={(rec, msg) => {
                  const confirmMsg: ChatMessage = {
                    id: `c-${Date.now()}`,
                    role: 'assistant',
                    text: `WhatsApp message "${msg}" successfully sent to ${rec}! 📱✨`,
                    timestamp: 'Just now',
                    tone: 'friendly',
                  };
                  setMessages(prev => [...prev, confirmMsg]);
                }}
              />
            )}

            {/* 3. One-Tap Quick Commands Deck */}
            <QuickCommands
              onSelectCommand={cmd => handleProcessCommand(cmd)}
              isGfMode={isGfMode}
              onOpenWallpapers={() => setShowWallpaperModal(true)}
              onOpenVoiceSettings={() => setShowVoiceModal(true)}
              onOpenBatterySaver={() => setShowBatterySaverModal(true)}
              onOpenHealthDashboard={() => setShowHealthModal(true)}
              onOpenVoiceHistory={() => setShowVoiceHistoryModal(true)}
              onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
            />

            {/* 4. Chat History Log */}
            <div className="px-3 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Voice Assistant Dialogue
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGoogleDriveModal(true)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition cursor-pointer"
                    title="Google Drive Files & Chat Backup"
                  >
                    <HardDrive className="w-3 h-3" /> Drive
                  </button>
                  <button
                    onClick={() => setShowVoiceHistoryModal(true)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                    title="Voice History & Re-run"
                  >
                    <History className="w-3 h-3" /> History
                  </button>
                  <button
                    onClick={handleExportChat}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                    title="Export chat history as formatted text file"
                  >
                    <Download className="w-3 h-3" /> Export
                  </button>
                  <button
                    onClick={() =>
                      setMessages([
                        {
                          id: 'm-init',
                          role: 'assistant',
                          text: isGfMode
                            ? 'Jaan, main aapki baat sunne ke liye bilkul taiyar hu! Saare mobile controls active hain ❤️'
                            : 'Myra is online with Cute Voice and full phone access privileges.',
                          timestamp: 'Just now',
                        },
                      ])
                    }
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition cursor-pointer"
                    title="Clear chat"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {messages.map(msg => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl text-xs relative group ${
                          isAssistant
                            ? isGfMode
                              ? 'bg-gradient-to-br from-pink-950/70 to-slate-900 border border-pink-500/30 text-pink-50 rounded-tl-sm'
                              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-sm'
                            : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-tr-sm shadow-md'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        <div className="mt-1.5 flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-[9px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          {isAssistant && (
                            <button
                              onClick={() => handleReplayVoice(msg.text)}
                              className="hover:text-pink-300 text-slate-400 transition flex items-center gap-1"
                              title="Speak again"
                            >
                              <Volume2 className="w-3 h-3" /> Replay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* MODALS */}
          {showWallpaperModal && (
            <WallpaperModal
              currentWallpaperId={currentWallpaper.id}
              onSelectWallpaper={handleSelectWallpaper}
              onClose={() => setShowWallpaperModal(false)}
            />
          )}

          {showVoiceModal && (
            <VoiceSettingsModal
              currentPersona={voicePersona}
              onSelectPersona={handleSelectVoicePersona}
              wakeWordActive={wakeWordActive}
              onToggleWakeWord={() => setWakeWordActive(!wakeWordActive)}
              onClose={() => setShowVoiceModal(false)}
            />
          )}

          {showGfStudio && (
            <GfLoveStudio
              userNickname={userNickname}
              onChangeNickname={name => setUserNickname(name)}
              onSendVoiceCommand={cmd => handleProcessCommand(cmd)}
              onClose={() => setShowGfStudio(false)}
              onSendWhatsApp={text => {
                setWhatsappState({
                  mode: 'message',
                  recipient: 'Jaan 💕',
                  phone: '',
                  message: text,
                });
                setShowGfStudio(false);
              }}
            />
          )}

          {showPermissionsModal && (
            <DevicePermissionsModal
              permissions={permissions}
              onTogglePermission={handleTogglePermission}
              onGrantAll={handleGrantAllPermissions}
              onClose={() => setShowPermissionsModal(false)}
            />
          )}

          {cameraModalOpen && (
            <CameraModal
              isSelfie={cameraModalOpen.selfie}
              onClose={() => setCameraModalOpen(null)}
            />
          )}

          {locationModalOpen && (
            <LocationModal onClose={() => setLocationModalOpen(false)} />
          )}

          {alarmModalOpen && (
            <AlarmModal
              time={alarmModalOpen.time}
              label={alarmModalOpen.label}
              onClose={() => setAlarmModalOpen(null)}
            />
          )}

          {websiteModal && (
            <WebsiteDesignModal
              website={websiteModal}
              onClose={() => setWebsiteModal(null)}
              onRefine={refinePrompt =>
                triggerWebsiteDesign(
                  `${websiteModal.topic} with update: ${refinePrompt}`,
                  websiteModal.topic
                )
              }
              isGenerating={isDesigningWebsite}
            />
          )}

          {/* Health Tracker Dashboard Modal */}
          {showHealthModal && (
            <HealthTrackerModal
              isOpen={showHealthModal}
              onClose={() => setShowHealthModal(false)}
              metrics={health.metrics}
              onAddSteps={health.addSteps}
              isScanningHeartRate={health.isScanningHeartRate}
              scanProgress={health.scanProgress}
              onStartHeartRateScan={health.startHeartRateMeasurement}
              isSimulatingWalk={health.isSimulatingWalk}
              onToggleWalkSimulation={health.toggleWalkSimulation}
              onLogWater={health.logWater}
              onLogSleepHours={health.logSleepHours}
              isGfMode={isGfMode}
            />
          )}

          {/* Smart Battery Saver Modal */}
          {showBatterySaverModal && (
            <SmartBatterySaverModal
              isOpen={showBatterySaverModal}
              onClose={() => setShowBatterySaverModal(false)}
              statusData={systemStatus}
              onToggleBatterySaver={handleToggleBatterySaver}
              onSimulateBatteryLevel={handleSimulateBatteryLevel}
              isGfMode={isGfMode}
            />
          )}

          {/* Searchable Voice History Modal with One-Tap Re-Run */}
          {showVoiceHistoryModal && (
            <VoiceHistoryModal
              isOpen={showVoiceHistoryModal}
              onClose={() => setShowVoiceHistoryModal(false)}
              onRerunCommand={cmd => {
                setShowVoiceHistoryModal(false);
                handleProcessCommand(cmd);
              }}
              history={voiceHistory}
              onClearHistory={handleClearVoiceHistory}
              onDeleteCommand={handleDeleteVoiceCommand}
              isGfMode={isGfMode}
            />
          )}

          {/* Google Drive Manager & Cloud Backup Modal */}
          {showGoogleDriveModal && (
            <GoogleDriveModal
              isOpen={showGoogleDriveModal}
              onClose={() => setShowGoogleDriveModal(false)}
              triggerHaptic={triggerHaptic}
              chatMessagesToExport={messages}
              isGfMode={isGfMode}
            />
          )}

          {/* Bottom Voice Command Input Bar */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-900 backdrop-blur-md sticky bottom-0 z-30">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (inputText.trim()) {
                  handleProcessCommand(inputText);
                }
              }}
              className="flex items-center gap-2"
            >
              {/* Main Voice Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer shrink-0 ${
                  status === 'listening'
                    ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
                    : isGfMode
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-pink-500/30 hover:scale-105'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-700 text-white shadow-violet-600/30 hover:scale-105'
                }`}
                title={status === 'listening' ? 'Stop Listening' : 'Speak Voice Command'}
              >
                {status === 'listening' ? (
                  <MicOff className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Text input fallback */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={
                    isGfMode
                      ? 'Boliye jaan: "Sakura wallpaper lagao", "Cute voice", "YouTube"...'
                      : 'Voice command de: "Wallpaper badlo", "Cute voice", "WhatsApp"...'
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                />
                {inputText.trim() && (
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </AndroidFrame>
      )}
    </div>
  );
}
