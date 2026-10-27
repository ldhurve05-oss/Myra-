// Audio utilities for sound chimes and Text-to-Speech

export type VoicePersona = 'cute' | 'gf' | 'friendly' | 'whisper' | 'bestie';

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Chime when listening starts
  playListenStart() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // Chime when action finishes
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.1); // B5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch {}
  }

  // Cute Pop / Giggles chime
  playCutePop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [784, 988, 1175, 1568]; // G5, B5, D6, G6 (playful cheerful sparkle)
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch {}
  }

  // Sweet chime for GF mode
  playLoveChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C (major chord)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.07, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  // Iconic UPI Soundbox Speaker Chime (Paytm / PhonePe speaker chime)
  playSoundboxChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Realistic dual/triple resonant soundbox beep (bright, cheerful payment chime)
      const tones = [
        { freq: 1046.5, time: now, dur: 0.12, vol: 0.14 },       // High C6
        { freq: 1318.5, time: now + 0.11, dur: 0.14, vol: 0.16 }, // E6
        { freq: 1567.98, time: now + 0.23, dur: 0.38, vol: 0.18 }, // G6
      ];

      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, t.time);

        gain.gain.setValueAtTime(t.vol, t.time);
        gain.gain.exponentialRampToValueAtTime(0.001, t.time + t.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t.time);
        osc.stop(t.time + t.dur);
      });
    } catch {}
  }
}

export const sounds = new SoundEffects();

let currentAudio: HTMLAudioElement | null = null;

export async function speakResponse(
  text: string,
  isGfMode: boolean,
  onStart?: () => void,
  onEnd?: () => void,
  voicePersona: VoicePersona = 'cute'
): Promise<void> {
  // Cancel previous speech
  stopSpeech();

  // Use client-side TTS directly: instant 0ms latency, zero quota limits, tuned cute voice!
  fallbackBrowserTTS(text, isGfMode, voicePersona, onStart, onEnd);
}

// Play UPI Soundbox chime followed by payment announcement (e.g., "Paytm par 69 rupaye prapt hue")
export function playSoundboxAnnouncement(
  amount: number | string = 69,
  provider: 'Paytm' | 'PhonePe' | 'Google Pay' = 'Paytm',
  onStart?: () => void,
  onEnd?: () => void
): void {
  sounds.playSoundboxChime();

  setTimeout(() => {
    const text = `${provider} par ${amount} rupaye prapt hue! Dhanyawaad.`;
    speakResponse(text, false, onStart, onEnd, 'cute');
  }, 450);
}

function fallbackBrowserTTS(
  text: string,
  isGfMode: boolean,
  voicePersona: VoicePersona,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onStart?.();
    setTimeout(() => onEnd?.(), 2000);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  // Pick female voice (prefer Hindi or Indian English or soft Google voice)
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice =
    voices.find(
      v =>
        (v.name.includes('Hindi') || v.lang.startsWith('hi')) &&
        (v.name.includes('Female') ||
          v.name.includes('Google') ||
          v.name.includes('Kalpana') ||
          v.name.includes('Lekha'))
    ) ||
    voices.find(v => v.lang === 'hi-IN') ||
    voices.find(
      v =>
        (v.lang === 'en-IN' || v.name.includes('India')) &&
        (v.name.includes('Female') ||
          v.name.includes('Neerja') ||
          v.name.includes('Heera') ||
          v.name.includes('Google'))
    ) ||
    voices.find(
      v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('victoria')
    ) ||
    voices[0];

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  // Tuning the voice characteristics for personas
  if (voicePersona === 'cute') {
    utterance.pitch = 1.32; // Sweet, charming, high-spirited, cute anime / kawaii cadence
    utterance.rate = 1.02;
  } else if (voicePersona === 'bestie') {
    utterance.pitch = 1.22; // Warm, supportive, uplifting sisterly companion
    utterance.rate = 1.0;
  } else if (voicePersona === 'gf' || isGfMode) {
    utterance.pitch = 1.18; // Sweet, affectionate, warm girlfriend
    utterance.rate = 0.95;
  } else if (voicePersona === 'whisper') {
    utterance.pitch = 1.25;
    utterance.rate = 0.9;
  } else {
    utterance.pitch = 1.08;
    utterance.rate = 1.0;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
