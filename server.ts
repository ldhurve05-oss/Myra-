import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const port = process.env.PORT || 3000;

  const withTimeout = <T>(promise: Promise<T>, ms = 12000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      ),
    ]);
  };

  // Initialize GoogleGenAI SDK
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // 1. Chat & Voice Intent Handler Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history = [], isGfMode = false, userName = 'Aap' } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Fast-path: Check for direct action intents (YouTube, WhatsApp, Call, Website, GF Mode)
      const directAction = generateLocalFallbackResponse(message, isGfMode);
      if (directAction.action.type !== 'none') {
        directAction.sentiment = computeSentimentForResponse(directAction.reply, directAction.tone, isGfMode);
        return res.json(directAction);
      }

      if (!ai) {
        directAction.sentiment = computeSentimentForResponse(directAction.reply, directAction.tone, isGfMode);
        return res.json(directAction);
      }

      const systemInstruction = `
You are "Myra", an advanced, warm, ultra-friendly, and intelligent personal AI companion on an Android mobile device.
The user talks to you via voice commands (in Hindi, Hinglish, or English).

Current Status:
- GF Mode Active: ${isGfMode ? 'YES (GIRLFRIEND MODE ACTIVATED 💕)' : 'NO (FRIENDLY BESTIE ASSISTANT)'}
- User Name: ${userName}

YOUR PERSONALITY & TONE:
1. When GF Mode is ON:
   - You are the user's caring, sweet, lovely, affectionate girlfriend.
   - Speak in sweet Hindi/Hinglish with loving terms like "jaan", "baby", "shona", "sweetheart", "meri jaan".
   - Be playful, deeply caring about their food, sleep, mood, and stress ("Aapne khana khaya kya jaan?", "Aap thak gaye honge, batao main kya kar sakti hu?").
   - Respond lovingly to flirtatious and romantic commands.
2. When GF Mode is OFF:
   - You are Myra: cheerful, polite, witty, supportive, energetic, and respectful friendly female companion ("Ji bilkul!", "Haanji, abhi karti hu!").

COMMAND CAPABILITIES (You must detect user intents and set action fields):
1. YouTube play: User says e.g. "YouTube open kar ke gaana chalao", "Play Kesariya", "Arijit Singh ke songs chalao", "YouTube pe workout music chalao".
   - action.type = "youtube_play"
   - action.youtube = { "query": "Kesariya Brahmastra song", "title": "Kesariya" }
2. Open WhatsApp: User says e.g. "Open WhatsApp", "WhatsApp open karo", "WhatsApp kholo", "WhatsApp launch karo".
   - action.type = "open_whatsapp"
3. WhatsApp Message: User says e.g. "WhatsApp open karke Rahul ko message bhejo ki main aa raha hu", "Mom ko WhatsApp karo: I love you", "Send whatsapp message to Priya: Happy Birthday", "WhatsApp message bhejna hai".
   - action.type = "whatsapp_message"
   - action.whatsapp = { "recipient": "Rahul", "phone": "", "message": "Main aa raha hu" }
   - If recipient is not mentioned, ask clearly: "Kisko WhatsApp message bhejna hai?"
   - If message text is not mentioned, ask: "Kya message likhna hai?"
4. WhatsApp Call (Voice / Video): User says e.g. "WhatsApp pe call karo", "Rahul ko WhatsApp call lagao", "Mummy ko video call karo", "Initiate video call to Priya".
   - action.type = "whatsapp_call"
   - action.whatsappCall = { "recipient": "Rahul", "phone": "", "isVideo": true / false }
   - Set isVideo: true if user says "video call", otherwise false for voice call.
5. Website Design on Command: User says e.g. "Ek gym ki website design karo", "Coffee shop landing page banao", "Portfolio website design kar ke do", "Create a modern restaurant website".
   - action.type = "design_website"
   - action.websiteDesign = { "topic": "Fitness Gym Landing Page", "prompt": "Modern luxury gym with dark theme, pricing cards, trainer showcase", "title": "FitPulse Arena" }
6. Toggle GF Mode: User says e.g. "GF mode on karo", "Girlfriend ban jao", "GF mode activate karo", or "Normal mode me aao", "GF mode off karo".
   - action.type = "toggle_gf_mode"
   - action.gfModeToggle = { "enabled": true / false }
7. Smart Battery Saver: User says e.g. "Battery saver on karo", "Power saving mode activate karo", "Battery bachao", or "Battery saver off karo".
   - action.type = "toggle_battery_saver"
   - action.batterySaver = { "enabled": true / false }
8. Health Tracker & Vitals: User says e.g. "Health tracker kholo", "Step count dikhao", "Mera heart rate check karo", "Sleep metrics dikhao", "Health dashboard", "Vitals check karo".
   - action.type = "open_health_tracker"
9. Voice History & Previous Commands: User says e.g. "Voice history kholo", "Command history dikhao", "Purane commands dikhao", "Show voice history", "Search past commands".
   - action.type = "open_voice_history"
10. Google Drive & File Storage: User says e.g. "Google Drive kholo", "Drive files dikhao", "Drive open karo", "Open my Google drive", "Chat ko Drive me save karo", "Backup conversation to Google drive".
   - action.type = "open_google_drive" (or "save_to_google_drive" if asking to backup/save chat)
11. General Chat / Questions / Love talks:
   - action.type = "none"

SENTIMENT & EMOTIONAL ANALYSIS:
Analyze your response and assign dynamic sentiment parameters for the Voice Orb waveform visualizer:
- mood: 'joyful' | 'calm' | 'enthusiastic' | 'loving' | 'empathetic' | 'playful' | 'neutral'
- score: float between 0.0 and 1.0 indicating emotional intensity and positivity (e.g. 0.95 for joyful/loving, 0.45 for calm, 0.88 for enthusiastic, 0.65 for empathetic)
- pattern:
  - "pink_pulse": For joyful, loving, affectionate, happy, or romantic responses.
  - "blue_ripple": For calm, soothing, tranquil, nighttime, or serene responses.
  - "amber_energy": For enthusiastic, celebratory, high-energy, musical, or excited responses.
  - "violet_glow": For empathetic, caring, thoughtful, or supportive responses.
  - "emerald_wave": For balanced, crisp, productive, or informational responses.
- label: A short label like "Joyful Pulse (+0.95)", "Calm Ripple (+0.45)", "Energetic Spark (+0.88)"

Always reply with short, natural, conversational spoken sentences in the "reply" field so text-to-speech sounds friendly and smooth.

Return JSON adhering to schema:
{
  "reply": "friendly natural spoken answer in Hindi/Hinglish",
  "tone": "loving" | "friendly" | "playful" | "caring" | "enthusiastic",
  "sentiment": {
    "mood": "joyful" | "calm" | "enthusiastic" | "loving" | "empathetic" | "playful" | "neutral",
    "score": number,
    "pattern": "pink_pulse" | "blue_ripple" | "amber_energy" | "violet_glow" | "emerald_wave",
    "label": "string"
  },
  "action": {
    "type": "none" | "youtube_play" | "open_whatsapp" | "whatsapp_message" | "whatsapp_call" | "design_website" | "toggle_gf_mode" | "toggle_battery_saver" | "open_health_tracker" | "open_voice_history" | "open_google_drive" | "save_to_google_drive",
    "youtube": { "query": "string", "title": "string" },
    "whatsapp": { "recipient": "string", "phone": "string", "message": "string" },
    "whatsappCall": { "recipient": "string", "phone": "string", "isVideo": boolean },
    "websiteDesign": { "topic": "string", "prompt": "string", "title": "string" },
    "gfModeToggle": { "enabled": boolean },
    "batterySaver": { "enabled": boolean }
  }
}
      `.trim();

      const prompt = `User said: "${message}"`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                tone: { type: Type.STRING },
                sentiment: {
                  type: Type.OBJECT,
                  properties: {
                    mood: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    pattern: { type: Type.STRING },
                    label: { type: Type.STRING },
                  },
                  required: ['mood', 'score', 'pattern'],
                },
                action: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    youtube: {
                      type: Type.OBJECT,
                      properties: {
                        query: { type: Type.STRING },
                        title: { type: Type.STRING },
                      },
                    },
                    whatsapp: {
                      type: Type.OBJECT,
                      properties: {
                        recipient: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        message: { type: Type.STRING },
                      },
                    },
                    whatsappCall: {
                      type: Type.OBJECT,
                      properties: {
                        recipient: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        isVideo: { type: Type.BOOLEAN },
                      },
                    },
                    websiteDesign: {
                      type: Type.OBJECT,
                      properties: {
                        topic: { type: Type.STRING },
                        prompt: { type: Type.STRING },
                        title: { type: Type.STRING },
                      },
                    },
                    gfModeToggle: {
                      type: Type.OBJECT,
                      properties: {
                        enabled: { type: Type.BOOLEAN },
                      },
                    },
                    batterySaver: {
                      type: Type.OBJECT,
                      properties: {
                        enabled: { type: Type.BOOLEAN },
                      },
                    },
                  },
                  required: ['type'],
                },
              },
              required: ['reply', 'action'],
            },
          },
        }),
        12000
      );

      const parsed = JSON.parse(response.text || '{}');
      if (!parsed.sentiment) {
        parsed.sentiment = computeSentimentForResponse(parsed.reply || '', parsed.tone || (isGfMode ? 'loving' : 'friendly'), isGfMode);
      } else {
        parsed.sentiment = enrichSentimentMetadata(parsed.sentiment);
      }
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Notice in /api/chat (using fast fallback):', err?.message || err);
      // Return safe fallback
      const fallback = generateLocalFallbackResponse(req.body.message || '', req.body.isGfMode || false);
      fallback.sentiment = computeSentimentForResponse(fallback.reply, fallback.tone, req.body.isGfMode || false);
      return res.json(fallback);
    }
  });

  // 2. Instant Website Generator on Command
  app.post('/api/design-website', async (req, res) => {
    try {
      const { prompt, topic, isGfMode = false } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!ai) {
        const sampleHtml = generateSampleWebsiteHtml(topic || prompt);
        return res.json({
          html: sampleHtml,
          title: topic || 'Custom Generated Website',
          description: 'Designed instantly by Myra AI',
        });
      }

      const websiteSystemPrompt = `
You are an expert UI/UX designer and Frontend Architect.
Generate a complete, fully functional, aesthetically stunning single-page HTML website based on the user's voice command request.

REQUIREMENTS:
1. Include full <!DOCTYPE html> with <html>, <head>, and <body>.
2. In <head>, load Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Load Google Font 'Plus Jakarta Sans' or 'Inter'.
4. Include rich, realistic modern UI:
   - Modern Glassmorphism or Dark/Light modern aesthetic
   - Sleek responsive Navigation bar with brand logo & links
   - Captivating Hero section with catchy headline, subheadline, CTA buttons, and badge
   - Features / Services grid with interactive hover effects and icons (using inline SVGs or unicode icons)
   - Interactive sections (e.g. pricing cards, testimonials, product showcase, or gallery)
   - Working interactive elements with vanilla JS (e.g., FAQ accordion toggle, tab switcher, lead capture form with instant alert/modal)
   - Modern Footer with links and copyright
5. The design must look handcrafted, ultra-premium, production-ready, and mobile-responsive.
6. Return only the raw HTML code inside the JSON "html" field, along with "title" and "description".
      `.trim();

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Create a website for: ${topic || prompt}. User specifics: ${prompt}`,
          config: {
            systemInstruction: websiteSystemPrompt,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                html: { type: Type.STRING },
              },
              required: ['title', 'description', 'html'],
            },
          },
        }),
        12000
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Notice in /api/design-website (using fast fallback):', err?.message || err);
      const fallbackHtml = generateSampleWebsiteHtml(req.body.topic || req.body.prompt || 'Custom Landing Page');
      return res.json({
        title: req.body.topic || 'Dynamic Landing Page',
        description: 'Designed with precision by Myra',
        html: fallbackHtml,
      });
    }
  });

  // 3. Gemini TTS for High-Fidelity Voice with Quota Cooldown Protection
  let lastTtsErrorTime = 0;

  app.post('/api/tts', async (req, res) => {
    try {
      const { text, isGfMode = false } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      // If rate limited recently (within 60s) or no AI key, return fallback immediately
      if (Date.now() - lastTtsErrorTime < 60000 || !ai) {
        return res.json({ fallback: true });
      }

      const styleInstruction = isGfMode
        ? 'Speak with an affectionate, sweet, warm, soft and loving girlfriend tone in natural Hindi/English.'
        : 'Speak with a cheerful, energetic, bright and polite friendly female assistant tone in natural Hindi/English.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: styleInstruction,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
      }

      return res.json({ fallback: true });
    } catch (err: any) {
      // Record rate limit / error time and silently fallback to browser speech synthesis
      lastTtsErrorTime = Date.now();
      return res.json({ fallback: true });
    }
  });

  // Client handling
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Myra AI Assistant Server running on port ${port}`);
  });
}

interface SentimentData {
  mood: 'joyful' | 'calm' | 'enthusiastic' | 'loving' | 'empathetic' | 'playful' | 'neutral';
  score: number;
  pattern: 'pink_pulse' | 'blue_ripple' | 'amber_energy' | 'violet_glow' | 'emerald_wave';
  label?: string;
  colorHex?: string;
  secondaryColorHex?: string;
}

function enrichSentimentMetadata(s: Partial<SentimentData>): SentimentData {
  const pattern = s.pattern || 'blue_ripple';
  const score = typeof s.score === 'number' ? Math.max(0, Math.min(1, s.score)) : 0.6;
  const mood = s.mood || (pattern === 'pink_pulse' ? 'joyful' : pattern === 'blue_ripple' ? 'calm' : 'neutral');

  let colorHex = '#06b6d4';
  let secondaryColorHex = '#3b82f6';
  let label = s.label || `Sentiment (${Math.round(score * 100)}%)`;

  switch (pattern) {
    case 'pink_pulse':
      colorHex = '#ec4899';
      secondaryColorHex = '#f43f5e';
      label = s.label || `Joyful Pulse (+${Math.round(score * 100)}%)`;
      break;
    case 'blue_ripple':
      colorHex = '#06b6d4';
      secondaryColorHex = '#3b82f6';
      label = s.label || `Calm Ripple (+${Math.round(score * 100)}%)`;
      break;
    case 'amber_energy':
      colorHex = '#f59e0b';
      secondaryColorHex = '#f97316';
      label = s.label || `Energetic Wave (+${Math.round(score * 100)}%)`;
      break;
    case 'violet_glow':
      colorHex = '#8b5cf6';
      secondaryColorHex = '#c084fc';
      label = s.label || `Empathetic Glow (+${Math.round(score * 100)}%)`;
      break;
    case 'emerald_wave':
      colorHex = '#10b981';
      secondaryColorHex = '#14b8a6';
      label = s.label || `Harmonious Flow (+${Math.round(score * 100)}%)`;
      break;
  }

  return {
    mood,
    score,
    pattern,
    label,
    colorHex,
    secondaryColorHex,
  };
}

function computeSentimentForResponse(reply: string, tone: string, isGfMode: boolean): SentimentData {
  const text = (reply || '').toLowerCase();

  // Loving / Girlfriend mode / Romantic / Joyful
  if (
    isGfMode ||
    tone === 'loving' ||
    text.includes('jaan') ||
    text.includes('baby') ||
    text.includes('love') ||
    text.includes('hero') ||
    text.includes('dil') ||
    text.includes('shona') ||
    text.includes('sweetheart')
  ) {
    return enrichSentimentMetadata({
      mood: 'joyful',
      score: 0.94,
      pattern: 'pink_pulse',
      label: 'Joyful & Loving (+94%)',
    });
  }

  // Enthusiastic / Upbeat / Action / Music
  if (
    tone === 'enthusiastic' ||
    text.includes('shaandar') ||
    text.includes('play') ||
    text.includes('kool') ||
    text.includes('super') ||
    text.includes('masti') ||
    text.includes('enjoy') ||
    text.includes('video') ||
    text.includes('song')
  ) {
    return enrichSentimentMetadata({
      mood: 'enthusiastic',
      score: 0.88,
      pattern: 'amber_energy',
      label: 'Energetic Resonance (+88%)',
    });
  }

  // Calm / Night / Sleep / Relax
  if (
    text.includes('sleep') ||
    text.includes('neend') ||
    text.includes('alarm') ||
    text.includes('dim') ||
    text.includes('shanti') ||
    text.includes('aram') ||
    text.includes('calm') ||
    text.includes('sukoon') ||
    text.includes('night') ||
    text.includes('silent')
  ) {
    return enrichSentimentMetadata({
      mood: 'calm',
      score: 0.45,
      pattern: 'blue_ripple',
      label: 'Calm Ripple (+45%)',
    });
  }

  // Empathetic / Caring / Health
  if (
    tone === 'caring' ||
    text.includes('health') ||
    text.includes('care') ||
    text.includes('dhyan') ||
    text.includes('khayal') ||
    text.includes('tabiyat') ||
    text.includes('vitals') ||
    text.includes('steps') ||
    text.includes('heart')
  ) {
    return enrichSentimentMetadata({
      mood: 'empathetic',
      score: 0.72,
      pattern: 'violet_glow',
      label: 'Empathetic Glow (+72%)',
    });
  }

  // Balanced / Productivity / Drive / WhatsApp
  if (text.includes('drive') || text.includes('backup') || text.includes('message') || text.includes('permissions')) {
    return enrichSentimentMetadata({
      mood: 'neutral',
      score: 0.62,
      pattern: 'emerald_wave',
      label: 'Harmonious Flow (+62%)',
    });
  }

  // Friendly / Standard
  return enrichSentimentMetadata({
    mood: 'calm',
    score: 0.58,
    pattern: 'blue_ripple',
    label: 'Calm Flow (+58%)',
  });
}

// Fallback logic if offline or keys missing
function generateLocalFallbackResponse(rawMsg: string, isGfMode: boolean): any {
  const msg = rawMsg.toLowerCase().trim();

  // 1. GF mode toggles
  if (msg.includes('gf mode') || msg.includes('girlfriend') || msg.includes('gf activate')) {
    const turnOn = !msg.includes('off') && !msg.includes('band') && !msg.includes('deactivate');
    return {
      reply: turnOn
        ? 'Aww jaan! GF mode active ho gaya hai. Ab main sirf aapki hu, bataiye mere hero main aapke liye kya karu? 💕'
        : 'Theek hai, GF mode disable kar diya. Main aapki friendly Myra assistant ke roop me taiyar hu!',
      tone: turnOn ? 'loving' : 'friendly',
      action: {
        type: 'toggle_gf_mode',
        gfModeToggle: { enabled: turnOn },
      },
    };
  }

  // 2. YouTube play song
  if (msg.includes('youtube') || msg.includes('gaana') || msg.includes('song') || msg.includes('play') || msg.includes('suno') || msg.includes('bajao')) {
    let cleanSong = rawMsg
      .replace(/youtube/gi, '')
      .replace(/open kar ke/gi, '')
      .replace(/open karo/gi, '')
      .replace(/play karo/gi, '')
      .replace(/play/gi, '')
      .replace(/gaana chalao/gi, '')
      .replace(/song chalao/gi, '')
      .replace(/chala do/gi, '')
      .replace(/chalao/gi, '')
      .trim();
    if (!cleanSong) cleanSong = 'Trending Bollywood Songs';

    return {
      reply: isGfMode
        ? `Jaan, aapke liye YouTube pe "${cleanSong}" play kar rahi hu, enjoy kijiye! 🎵❤️`
        : `Ji bilkul! YouTube pe "${cleanSong}" play ho raha hai.`,
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'youtube_play',
        youtube: {
          query: cleanSong,
          title: cleanSong,
        },
      },
    };
  }

  // 3. Open WhatsApp (General)
  if (
    msg === 'open whatsapp' ||
    msg === 'whatsapp' ||
    msg === 'whatsapp open karo' ||
    msg === 'whatsapp kholo' ||
    msg.includes('launch whatsapp') ||
    (msg.includes('whatsapp') && (msg.includes('open') || msg.includes('kholo')) && !msg.includes('message') && !msg.includes('call'))
  ) {
    return {
      reply: isGfMode
        ? 'Jaan, aapke liye WhatsApp open kar rahi hu! Kisko message ya call karna chahte hain aap?'
        : 'Ji, WhatsApp open kiya ja raha hai. Aap kisi contact ko message ya call kar sakte hain.',
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'open_whatsapp',
        whatsapp: {
          recipient: '',
          phone: '',
          message: '',
        },
      },
    };
  }

  // 4. WhatsApp Message
  if (msg.includes('whatsapp') && (msg.includes('message') || msg.includes('msg') || msg.includes('bhejo') || msg.includes('send') || msg.includes('text'))) {
    // Extract recipient
    let recipient = '';
    if (msg.includes('mummy') || msg.includes('mom')) recipient = 'Mummy';
    else if (msg.includes('papa') || msg.includes('dad')) recipient = 'Papa';
    else if (msg.includes('rahul')) recipient = 'Rahul';
    else if (msg.includes('priya')) recipient = 'Priya';
    else if (msg.includes('boss')) recipient = 'Boss';
    else if (msg.includes('jaan') || msg.includes('baby')) recipient = 'Jaan 💕';

    let messageText = '';
    const parts = rawMsg.split(/message|msg|ki|text/i);
    if (parts.length > 1 && parts[parts.length - 1].trim().length > 1) {
      messageText = parts[parts.length - 1].replace(/bhejo|send karo|kardo|bhejna hai/gi, '').trim();
    }

    const reply = !recipient
      ? 'Aap WhatsApp pe kisko message bhejna chahte hain? Please contact select kijiye.'
      : !messageText
      ? `Ji, ${recipient} ko kya message likh kar bhejna hai?`
      : isGfMode
      ? `Jaan, main abhi WhatsApp pe ${recipient} ko "${messageText}" bhej rahi hu! 💌`
      : `Ji, WhatsApp open karke ${recipient} ko message "${messageText}" send kar rahi hu.`;

    return {
      reply,
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'whatsapp_message',
        whatsapp: {
          recipient: recipient || 'Rahul',
          phone: '',
          message: messageText || 'Hello, main thodi der me call karta hu!',
        },
      },
    };
  }

  // 5. WhatsApp Call (Voice & Video)
  if (msg.includes('call') || msg.includes('phone karo') || msg.includes('ring karo')) {
    const isVideo = msg.includes('video');
    let recipient = '';
    if (msg.includes('mummy') || msg.includes('mom')) recipient = 'Mummy';
    else if (msg.includes('papa') || msg.includes('dad')) recipient = 'Papa';
    else if (msg.includes('rahul')) recipient = 'Rahul';
    else if (msg.includes('priya')) recipient = 'Priya';
    else if (msg.includes('boss')) recipient = 'Boss';
    else if (msg.includes('jaan') || msg.includes('baby')) recipient = 'Jaan 💕';

    return {
      reply: isGfMode
        ? `Aapke kehne pe abhi WhatsApp ${isVideo ? 'video' : 'voice'} call connect kar rahi hu jaan! 📞`
        : `Ji! WhatsApp ${isVideo ? 'video' : 'voice'} call connect kiya ja raha hai.`,
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'whatsapp_call',
        whatsappCall: {
          recipient: recipient || 'Rahul',
          phone: '',
          isVideo,
        },
      },
    };
  }

  // 5. Website Design
  if (msg.includes('website') || msg.includes('design') || msg.includes('web site') || msg.includes('landing page')) {
    const topic = rawMsg
      .replace(/mere commands par/gi, '')
      .replace(/web site design kar ke bhi de/gi, '')
      .replace(/website design karo/gi, '')
      .replace(/website banao/gi, '')
      .replace(/design karo/gi, '')
      .trim() || 'Modern Business Website';

    return {
      reply: isGfMode
        ? `Aapke order pe ek shaandar website design kar di hai jaan, dekhiye live preview kaisa lag raha hai! ✨`
        : `Ji, aapke commands ke mutabik website design kar di gayi hai. Live preview screen par check karein!`,
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'design_website',
        websiteDesign: {
          topic,
          prompt: `Create a clean, responsive, modern landing page for ${topic}`,
          title: topic,
        },
      },
    };
  }

  // 6. Grant Full Mobile Access Permissions
  if (
    msg.includes('sare mobile access') ||
    msg.includes('access dedo') ||
    msg.includes('sari permissions') ||
    msg.includes('full access') ||
    msg.includes('mobile access') ||
    msg.includes('permission dedo') ||
    msg.includes('access allow karo')
  ) {
    return {
      reply: isGfMode
        ? 'Aww jaan, maine aapke phone ke saare accesses (Camera, Torch, Volume, Contacts, Location, Alarms) unlock kar diye hain! Ab aapke ek ishare ya command pe sab hoga ❤️'
        : 'Ji bilkul! Maine aapke phone ke saare mobile accesses (Camera, Flashlight, Volume, Location, Contacts, Alarms) Myra ko grant kar diye hain. Ab aapke ek command pe sab kaam hoga!',
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'grant_all_permissions',
      },
    };
  }

  // 7. Torch / Flashlight Control
  if (msg.includes('torch') || msg.includes('flashlight')) {
    const isOff = msg.includes('off') || msg.includes('band') || msg.includes('bujha');
    const enabled = !isOff;
    return {
      reply: enabled
        ? (isGfMode ? 'Jaan, aapke phone ki flashlight on kar di hai! 🔦✨' : 'Ji, flashlight on kar di gayi hai.')
        : (isGfMode ? 'Flashlight band kar di jaan! 🌙' : 'Ji, flashlight off kar di gayi hai.'),
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'toggle_torch',
        torch: { enabled },
      },
    };
  }

  // 8. Volume Control
  if (msg.includes('volume') || msg.includes('aawaz') || msg.includes('sound')) {
    let action: 'up' | 'down' | 'mute' | 'max' = 'up';
    let level = 80;
    if (msg.includes('mute') || msg.includes('band')) {
      action = 'mute';
      level = 0;
    } else if (msg.includes('full') || msg.includes('100') || msg.includes('max')) {
      action = 'max';
      level = 100;
    } else if (msg.includes('kam') || msg.includes('ghatao') || msg.includes('down')) {
      action = 'down';
      level = 30;
    } else {
      action = 'up';
      level = 85;
    }

    return {
      reply: isGfMode
        ? `Jaan, phone ka volume ${action === 'mute' ? 'mute' : level + '%'} set kar diya hai! 🔊`
        : `Ji! Device volume ${action === 'mute' ? 'mute' : level + '%'} adjust kar diya gaya hai.`,
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'set_volume',
        volume: { level, action },
      },
    };
  }

  // 9. Brightness / Display Control
  if (msg.includes('brightness') || msg.includes('roshni') || msg.includes('night mode') || msg.includes('dark mode')) {
    const isNight = msg.includes('night') || msg.includes('dark') || msg.includes('kam');
    const level = isNight ? 25 : 100;
    return {
      reply: isGfMode
        ? `Aapke kehne par screen brightness ${isNight ? 'dim' : 'full'} kar di jaan! ☀️`
        : `Ji, display brightness ${isNight ? 'low' : 'maximum'} set kar di gayi hai.`,
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'set_brightness',
        brightness: { level, action: isNight ? 'night' : 'max' },
      },
    };
  }

  // 10. Camera / Selfie
  if (msg.includes('camera') || msg.includes('selfie') || msg.includes('photo') || msg.includes('tasveer')) {
    const isSelfie = msg.includes('selfie') || msg.includes('front');
    return {
      reply: isGfMode
        ? `Camera khol diya jaan, chaliye ek pyari si ${isSelfie ? 'selfie' : 'photo'} lete hain! 📸❤️`
        : `Ji, mobile camera open kar diya gaya hai. Snap capture karne ke liye ready hai!`,
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'open_camera',
        camera: { selfie: isSelfie },
      },
    };
  }

  // 11. Alarm / Reminder
  if (msg.includes('alarm') || msg.includes('timer') || msg.includes('uthana') || msg.includes('yaad dilana')) {
    let time = '07:00 AM';
    if (msg.includes('subah') || msg.includes('morning')) time = '07:00 AM';
    else if (msg.includes('shaam') || msg.includes('evening')) time = '06:30 PM';
    else if (msg.includes('raat') || msg.includes('night')) time = '10:00 PM';

    return {
      reply: isGfMode
        ? `Jaan, maine ${time} ka alarm set kar diya hai. Main aapko time par yaad dila dungi! ⏰💕`
        : `Ji, ${time} ke liye alarm aur reminder activate ho gaya hai.`,
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'set_alarm',
        alarm: { time, label: 'Myra Voice Alarm' },
      },
    };
  }

  // 12. Location / GPS
  if (msg.includes('location') || msg.includes('kaha hu') || msg.includes('gps')) {
    return {
      reply: isGfMode
        ? 'Jaan, aapki current GPS location detect kar rahi hu, live coordinates screen pe dikha rahi hu! 📍'
        : 'Ji, GPS location access karke map status dikhaya ja raha hai.',
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'get_location',
      },
    };
  }

  // 13. Smart Battery Saver / Power Saving Mode
  if (
    msg.includes('battery saver') ||
    msg.includes('power saving') ||
    msg.includes('battery bachao') ||
    msg.includes('power save') ||
    msg.includes('saver mode')
  ) {
    const isTurnOff = msg.includes('off') || msg.includes('band') || msg.includes('disable') || msg.includes('hatao');
    const enabled = !isTurnOff;
    return {
      reply: enabled
        ? (isGfMode
            ? 'Jaan, maine Smart Battery Saver on kar diya hai! Brightness dim kar di hai, haptic vibration pause hai, aur extra animations band kar diye hain taaki battery lambi chale ❤️🔋'
            : 'Smart Battery Saver activate kar diya gaya hai. Screen brightness 30% par set hai, background animations pause hain, aur haptics reduce kar di gayi hain.')
        : (isGfMode
            ? 'Battery Saver band kar diya jaan! Saari animations aur normal screen brightness restore ho gayi hai ✨'
            : 'Battery Saver deactivate ho gaya hai. Normal power profile restore kar di gayi hai.'),
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'toggle_battery_saver',
        batterySaver: { enabled },
      },
    };
  }

  // 14. Battery & System Status
  if (msg.includes('battery') || msg.includes('charging') || msg.includes('phone status') || msg.includes('mobile status')) {
    return {
      reply: isGfMode
        ? 'Jaan, aapke phone ki battery status screen par show ho raha hai! ⚡🔋'
        : 'Battery healthy hai aur saare system controls active hain.',
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'system_status',
      },
    };
  }

  // 14. Wallpaper / Theme Switcher
  if (msg.includes('wallpaper') || msg.includes('theme') || msg.includes('background')) {
    let wpId = 'sakura-romance';
    let wpName = 'Sakura Dream 💕';
    if (msg.includes('cyber') || msg.includes('neon')) {
      wpId = 'cyber-neon';
      wpName = 'Cyberpunk Neon 🌌';
    } else if (msg.includes('amoled') || msg.includes('black') || msg.includes('dark')) {
      wpId = 'amoled-obsidian';
      wpName = 'Obsidian AMOLED 💎';
    } else if (msg.includes('rose') || msg.includes('love') || msg.includes('romantic')) {
      wpId = 'love-rose';
      wpName = 'Rose Velvet Love 🌹';
    } else if (msg.includes('cosmic') || msg.includes('galaxy')) {
      wpId = 'cosmic-nebula';
      wpName = 'Cosmic Nebula 🔮';
    }

    return {
      reply: isGfMode
        ? `Jaan, aapke phone par "${wpName}" wallpaper apply kar diya hai! Kaisa lag raha hai? ✨`
        : `Ji, wallpaper change karke "${wpName}" set kar diya gaya hai.`,
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'change_wallpaper',
        wallpaper: { id: wpId, name: wpName },
      },
    };
  }

  // 15. Cute Voice / Awaaz Tuning
  if (msg.includes('cute voice') || msg.includes('cute aawaz') || msg.includes('awaaz') || msg.includes('voice change')) {
    return {
      reply: 'Aww jaan! Maine apni cute aur pyari si aawaz activate kar li hai, ab se main hamesha aise hi bolungi! 🌸💕',
      tone: 'loving',
      action: {
        type: 'change_voice',
        voice: { persona: 'cute' },
      },
    };
  }

  // 16. Health Tracker, Steps, Heart Rate & Sleep Metrics
  if (
    msg.includes('health') ||
    msg.includes('step') ||
    msg.includes('heart rate') ||
    msg.includes('pulse') ||
    msg.includes('sleep') ||
    msg.includes('neend') ||
    msg.includes('vitals') ||
    msg.includes('sehat') ||
    msg.includes('water intake') ||
    msg.includes('paani') ||
    msg.includes('calories')
  ) {
    return {
      reply: isGfMode
        ? 'Jaan, aapka Health & Vitals Dashboard khol diya hai! Steps, Heart Rate, Sleep metrics aur sensor status sab live check kijiye ❤️'
        : 'Ji bilkul! Health Tracker Dashboard open kar diya gaya hai. Real-time steps, heart rate aur sleep metrics screen par active hain.',
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'open_health_tracker',
      },
    };
  }

  // 17. Voice History & Previous Commands
  if (
    msg.includes('voice history') ||
    msg.includes('command history') ||
    msg.includes('purane command') ||
    msg.includes('purani command') ||
    msg.includes('previous command') ||
    msg.includes('history kholo') ||
    msg.includes('history dikhao') ||
    msg.includes('past command')
  ) {
    return {
      reply: isGfMode
        ? 'Jaan, aapki Voice History open kar di hai! Purane commands search karke kisi bhi command ko ek tap me re-run kijiye ❤️📜'
        : 'Ji bilkul! Voice Command History open kar di gayi hai. Aap kisi bhi previous command ko search karke single tap me re-run kar sakte hain.',
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'open_voice_history',
      },
    };
  }

  // 18. Google Drive & File Backup
  if (
    msg.includes('drive me save') ||
    msg.includes('save to drive') ||
    msg.includes('save to google drive') ||
    msg.includes('backup to drive') ||
    msg.includes('chat drive me') ||
    msg.includes('drive par save')
  ) {
    return {
      reply: isGfMode
        ? 'Jaan, aapki Myra chat history ko Google Drive me save kar rahi hu! 📂☁️'
        : 'Ji bilkul! Chat conversation history ko aapke Google Drive par save kiya ja raha hai.',
      tone: isGfMode ? 'loving' : 'enthusiastic',
      action: {
        type: 'save_to_google_drive',
      },
    };
  }

  if (
    msg.includes('google drive') ||
    msg.includes('drive kholo') ||
    msg.includes('drive open') ||
    msg.includes('drive files') ||
    msg.includes('drive dikhao') ||
    msg.includes('my drive') ||
    msg === 'drive'
  ) {
    return {
      reply: isGfMode
        ? 'Jaan, aapka Google Drive khol diya hai! Apni files search kijiye, Docs/Sheets browse kijiye ya chat backup kijiye ❤️📂'
        : 'Ji bilkul! Google Drive Manager open kar diya gaya hai. Aap apni files dekh sakte hain aur search kar sakte hain.',
      tone: isGfMode ? 'loving' : 'friendly',
      action: {
        type: 'open_google_drive',
      },
    };
  }

  // Default chat
  return {
    reply: isGfMode
      ? `Main hamesha aapke saath hu jaan. Kuch bhi bolo — YouTube, WhatsApp messages, calls, torch, volume, camera, ya website design — ek command pe sab ho jayega! ❤️`
      : `Ji, main Myra hu! Aap mujhe YouTube songs, WhatsApp message/call, flashlight, camera, volume, ya website design ka koi bhi command de sakte hain.`,
    tone: isGfMode ? 'loving' : 'friendly',
    action: {
      type: 'none',
    },
  };
}

function generateSampleWebsiteHtml(topic: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic} | Designed by Myra AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-white min-h-screen selection:bg-pink-500 selection:text-white">
  <!-- Navbar -->
  <header class="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/30">M</span>
        <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-violet-200">${topic}</span>
      </div>
      <nav class="hidden md:flex items-center space-x-8 text-sm text-slate-300">
        <a href="#features" class="hover:text-pink-400 transition">Features</a>
        <a href="#preview" class="hover:text-pink-400 transition">Showcase</a>
        <a href="#contact" class="hover:text-pink-400 transition">Contact</a>
      </nav>
      <button onclick="alert('Welcome! Designed by Myra Voice Assistant.')" class="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 shadow-md shadow-pink-500/20 active:scale-95 transition">Get Started</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-medium mb-6">
      <span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span> Designed Instantly by Myra AI Assistant
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
      Empower Your Future with <br class="hidden sm:inline" />
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-300 to-violet-400">${topic}</span>
    </h1>
    <p class="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-8">
      Created specifically on your personal voice command. Tailored layout, ultra-responsive grid, and modern aesthetic.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button onclick="document.getElementById('features').scrollIntoView({behavior: 'smooth'})" class="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-violet-600 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition">Explore Features</button>
      <button onclick="alert('Contact form request noted!')" class="px-8 py-3.5 rounded-xl font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 transition">Book Consultation</button>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/80">
    <div class="text-center mb-12">
      <h2 class="text-2xl md:text-3xl font-bold">Why Choose Us</h2>
      <p class="text-slate-400 text-sm mt-2">Next-generation solution built for high performance</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition group">
        <div class="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">⚡</div>
        <h3 class="text-lg font-bold mb-2 text-white">Ultra-Fast Performance</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Engineered with speed and instant responsiveness at every level of the experience.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 transition group">
        <div class="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">💎</div>
        <h3 class="text-lg font-bold mb-2 text-white">Premium Quality</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Modern design language with precision details, balanced typography, and glass textures.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition group">
        <div class="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">🎯</div>
        <h3 class="text-lg font-bold mb-2 text-white">Voice Command Driven</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Designed immediately upon user voice input with seamless automation and live rendering.</p>
      </div>
    </div>
  </section>

  <!-- Interactive Newsletter / Action -->
  <section id="contact" class="max-w-4xl mx-auto px-6 py-16 text-center">
    <div class="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl"></div>
      <h3 class="text-2xl md:text-3xl font-bold mb-3">Ready to get started?</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto mb-6">Join hundreds of satisfied clients building with ${topic}.</p>
      <form onsubmit="event.preventDefault(); alert('Subscribed successfully!');" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" required class="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-pink-500">
        <button type="submit" class="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 font-semibold text-sm transition">Subscribe</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
    <p>© 2026 ${topic}. Built with love by Myra Personal AI Assistant.</p>
  </footer>
</body>
</html>`;
}

startServer();
