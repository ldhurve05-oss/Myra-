import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Phone,
  Video,
  PhoneOff,
  X,
  MessageSquare,
  CheckCheck,
  User,
  ExternalLink,
  Plus,
  Search,
  Mic,
  Camera,
  Volume2,
  VolumeX,
  Sparkles,
  UserPlus,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Contact } from '../types/assistant';
import { DEFAULT_CONTACTS } from '../utils/contacts';

interface WhatsAppWidgetProps {
  mode: 'open' | 'message' | 'call';
  recipient?: string;
  phone?: string;
  message?: string;
  isVideo?: boolean;
  onClose: () => void;
  onSendSuccess?: (recipient: string, message: string) => void;
  onStartCall?: (recipient: string, isVideo: boolean) => void;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  mode: initialMode,
  recipient: initialRecipient = '',
  phone: initialPhone = '',
  message: initialMessage = '',
  isVideo: initialIsVideo = false,
  onClose,
  onSendSuccess,
  onStartCall,
}) => {
  // Navigation / Action Mode
  const [activeTab, setActiveTab] = useState<'open' | 'message' | 'call'>(
    initialMode === 'open' ? 'open' : initialMode === 'call' ? 'call' : 'message'
  );

  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('myra_whatsapp_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('+91');
  const [newContactRelation, setNewContactRelation] = useState('Friend');

  // Selected Contact & Message
  const [selectedContact, setSelectedContact] = useState<Contact>(() => {
    if (initialRecipient) {
      const found = contacts.find(
        c => c.name.toLowerCase() === initialRecipient.toLowerCase()
      );
      if (found) return found;
      return {
        id: 'temp',
        name: initialRecipient,
        relation: 'Contact',
        phone: initialPhone || '+919876543210',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
    }
    return contacts[0];
  });

  const [messageText, setMessageText] = useState(initialMessage || '');
  const [sentNotice, setSentNotice] = useState(false);

  // Calling States
  const [isCalling, setIsCalling] = useState(initialMode === 'call');
  const [isVideoCall, setIsVideoCall] = useState(initialIsVideo);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');

  // Video stream ref for real WhatsApp video call simulation
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick message presets
  const messagePresets = [
    'Main 10 minute me aa raha hu.',
    'Kaha ho aap? Call karo please.',
    'Ghar pahunch gaya hu, sab theek hai! 👍',
    'Happy Birthday! Have a wonderful day ahead! 🎂🎉',
    'Emergency hai, urgent phone uthao.',
    'Dinner ready hai, jaldi aa jao! 🍲',
  ];

  // Save contacts
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newC: Contact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      relation: newContactRelation || 'Friend',
      phone: newContactPhone.trim() || '+919876543210',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      lastSeen: 'Online',
    };

    const updated = [newC, ...contacts];
    setContacts(updated);
    localStorage.setItem('myra_whatsapp_contacts', JSON.stringify(updated));
    setSelectedContact(newC);
    setShowAddContact(false);
    setNewContactName('');
    setNewContactPhone('+91');
  };

  // Switch contact
  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
  };

  // Clean phone number for WhatsApp wa.me links
  const cleanPhone = (selectedContact?.phone || '').replace(/[^0-9]/g, '');

  // 1. Direct Open WhatsApp
  const handleOpenWhatsApp = () => {
    // Opens official WhatsApp Web or App
    window.open('https://web.whatsapp.com', '_blank');
  };

  // 2. Direct Send WhatsApp Message
  const handleSendWhatsAppMessage = () => {
    if (!messageText.trim()) return;

    const phoneParam = cleanPhone ? cleanPhone : '';
    const encodedText = encodeURIComponent(messageText);

    // Deep link supports both mobile WhatsApp app and WhatsApp web
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(url, '_blank');
    setSentNotice(true);
    onSendSuccess?.(selectedContact.name, messageText);

    setTimeout(() => {
      setSentNotice(false);
      onClose();
    }, 2200);
  };

  // 3. Initiate Voice or Video Call
  const handleStartCall = (videoMode: boolean) => {
    setIsVideoCall(videoMode);
    setIsCalling(true);
    setCallStatus('ringing');
    setCallDuration(0);
    onStartCall?.(selectedContact.name, videoMode);

    // Ring for 3 seconds then connect
    setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
  };

  // Trigger real WhatsApp Call Launcher
  const handleLaunchWhatsAppDirectCall = () => {
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
          `Hey ${selectedContact.name}, calling you on WhatsApp!`
        )}`
      : 'https://web.whatsapp.com';
    window.open(url, '_blank');
  };

  // Camera handling for Video Call
  useEffect(() => {
    if (isCalling && isVideoCall && !isCameraOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then(stream => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.log('Camera permission optional for simulation:', err);
          });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCalling, isVideoCall, isCameraOff]);

  // Call timer duration
  useEffect(() => {
    let interval: any;
    if (isCalling && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling, callStatus]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.relation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full my-3 px-2 sm:px-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col">
        {/* Top ambient green glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-wide">WhatsApp Center</h3>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> End-to-End
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Direct integration: Open, Send Message, or Call
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct Open WhatsApp button */}
            <button
              onClick={handleOpenWhatsApp}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition active:scale-95"
              title="Launch official WhatsApp"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open App</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mode Tabs (when not in call) */}
        {!isCalling && (
          <div className="px-4 pt-2.5 pb-1 flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/40">
            <button
              onClick={() => setActiveTab('message')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'message'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>

            <button
              onClick={() => setActiveTab('call')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'call'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Voice / Video Call</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${
                activeTab === 'open'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
              title="Launch WhatsApp Web/App directly"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launch Web</span>
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div className="p-4">
          {/* 1. CALLING SCREEN */}
          {isCalling ? (
            <div className="relative py-4 flex flex-col items-center justify-center text-center">
              {/* If Video Call: Live camera viewfinder or simulated avatar screen */}
              {isVideoCall ? (
                <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/60 shadow-2xl mb-4 group">
                  {/* Camera feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${
                      isCameraOff ? 'hidden' : 'block'
                    }`}
                  />

                  {/* Fallback avatar overlay when camera off */}
                  {isCameraOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 mb-2"
                      />
                      <span className="text-xs text-slate-400">Camera Paused</span>
                    </div>
                  )}

                  {/* Small PIP remote preview */}
                  <div className="absolute top-2 right-2 w-16 h-20 rounded-xl overflow-hidden border border-emerald-400/80 shadow-lg bg-slate-900">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                      {selectedContact.name}
                    </div>
                  </div>

                  {/* Call status banner on video */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-emerald-300 font-semibold border border-emerald-500/30">
                    {callStatus === 'connected' ? `Live • ${formatTimer(callDuration)}` : 'Calling...'}
                  </div>
                </div>
              ) : (
                /* Voice Call Avatar */
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500/60 p-1 relative">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-full h-full rounded-full object-cover shadow-inner"
                    />
                    {callStatus === 'connected' && (
                      <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/40 animate-ping" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-slate-900 shadow">
                    <Phone className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Contact Info & Call Status */}
              <h4 className="text-base font-extrabold text-white mb-0.5">
                {selectedContact.name}
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                {selectedContact.relation} • {selectedContact.phone}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
                <span
                  className={`w-2 h-2 rounded-full ${
                    callStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span>
                  {callStatus === 'connected'
                    ? `WhatsApp ${isVideoCall ? 'Video' : 'Voice'} Call • ${formatTimer(callDuration)}`
                    : 'Ringing on WhatsApp...'}
                </span>
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-3.5">
                {/* Mute button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full text-xs font-medium transition active:scale-95 cursor-pointer ${
                    isMuted
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Video camera flip/pause (in video mode) */}
                {isVideoCall && (
                  <button
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`p-3 rounded-full text-xs font-medium transition active:scale-95 cursor-pointer ${
                      isCameraOff
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                    title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}

                {/* Direct Launch WhatsApp Call */}
                <button
                  onClick={handleLaunchWhatsAppDirectCall}
                  className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/40 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open WhatsApp
                </button>

                {/* End Call button */}
                <button
                  onClick={() => {
                    setIsCalling(false);
                    setCallStatus('ended');
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach(t => t.stop());
                      streamRef.current = null;
                    }
                  }}
                  className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition active:scale-95 cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* 2. CONTACT SELECTOR + MESSAGE / CALL WORKFLOW */
            <div className="space-y-4">
              {/* CLEAR PROMPT 1: Contact Selection Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <label className="text-xs font-bold text-slate-200">
                      Select Contact
                    </label>
                  </div>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{showAddContact ? 'Cancel' : 'New Contact'}</span>
                  </button>
                </div>

                {/* Add New Contact Drawer */}
                {showAddContact && (
                  <form
                    onSubmit={handleAddContact}
                    className="p-3 mb-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2 animate-in fade-in"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Add Custom WhatsApp Contact
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Contact Name (e.g. Papa, Amit)"
                        value={newContactName}
                        onChange={e => setNewContactName(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Phone Number (+91...)"
                        value={newContactPhone}
                        onChange={e => setNewContactPhone(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={newContactRelation}
                        onChange={e => setNewContactRelation(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                      >
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Work">Work</option>
                        <option value="Love 💕">Love 💕</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                )}

                {/* Contact Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                  {filteredContacts.map(c => {
                    const isSelected = selectedContact.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectContact(c)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition whitespace-nowrap cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-950" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold leading-tight">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.relation}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION MODE 1: SEND MESSAGE */}
              {activeTab === 'message' && (
                <div>
                  {/* CLEAR PROMPT 2: Message Content Prompt */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        2
                      </span>
                      <label className="text-xs font-bold text-slate-200">
                        Message Content for {selectedContact.name}
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {messageText.length} chars
                    </span>
                  </div>

                  {/* Simulated WhatsApp Bubble Editor */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 relative shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-slate-200">
                          To: {selectedContact.name} ({selectedContact.phone})
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono">WhatsApp Web / App</span>
                    </div>

                    <textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      rows={3}
                      placeholder={`Type or speak message to ${selectedContact.name}...`}
                      className="w-full bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                    />

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Ready to deliver</span>
                      </div>
                      <button
                        onClick={() => setMessageText('')}
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Quick message suggestions chips */}
                  <div className="mt-2.5">
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">
                      Quick Voice Message Templates:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {messagePresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMessageText(preset)}
                          className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          "{preset}"
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send Action Trigger */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartCall(false)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Instead</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendWhatsAppMessage}
                      disabled={!messageText.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {sentNotice
                          ? 'Opening WhatsApp...'
                          : `Send Message to ${selectedContact.name}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION MODE 2: VOICE OR VIDEO CALL */}
              {activeTab === 'call' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{selectedContact.name}</h4>
                        <p className="text-[11px] text-slate-400">{selectedContact.phone}</p>
                        <span className="text-[10px] text-emerald-400">Available on WhatsApp</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Voice Call */}
                      <button
                        onClick={() => handleStartCall(false)}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Voice Call</span>
                      </button>

                      {/* Video Call */}
                      <button
                        onClick={() => handleStartCall(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/30 transition active:scale-95 cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Video Call</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct WhatsApp Call deep-link launcher banner */}
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Direct connection with {selectedContact.name}</span>
                    </div>
                    <button
                      onClick={handleLaunchWhatsAppDirectCall}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open WhatsApp App
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
