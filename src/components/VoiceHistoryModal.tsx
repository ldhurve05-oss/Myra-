import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Play,
  Copy,
  Check,
  Trash2,
  X,
  History,
  Sparkles,
  TrendingUp,
  Clock,
  Youtube,
  MessageSquare,
  Zap,
  Activity,
  Heart,
  Terminal,
} from 'lucide-react';
import { VoiceCommandRecord } from '../types/assistant';

interface VoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRerunCommand: (command: string) => void;
  history: VoiceCommandRecord[];
  onClearHistory: () => void;
  onDeleteCommand: (id: string) => void;
  isGfMode?: boolean;
}

type CategoryFilter = 'all' | 'media' | 'whatsapp' | 'device' | 'health' | 'gf' | 'general';
type SortOrder = 'recent' | 'frequent';

export const VoiceHistoryModal: React.FC<VoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  onRerunCommand,
  history,
  onClearHistory,
  onDeleteCommand,
  isGfMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const getCategoryIcon = (category: VoiceCommandRecord['category']) => {
    switch (category) {
      case 'media':
        return <Youtube className="w-3 h-3 text-red-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-3 h-3 text-emerald-400" />;
      case 'device':
        return <Zap className="w-3 h-3 text-amber-400" />;
      case 'health':
        return <Activity className="w-3 h-3 text-rose-400" />;
      case 'gf':
        return <Heart className="w-3 h-3 text-pink-400" />;
      default:
        return <Terminal className="w-3 h-3 text-cyan-400" />;
    }
  };

  const getCategoryBadgeClass = (category: VoiceCommandRecord['category']) => {
    switch (category) {
      case 'media':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'whatsapp':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'device':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'health':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'gf':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  // Filter and sort items
  const filteredCommands = useMemo(() => {
    let result = [...history];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.command.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOrder === 'recent') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      result.sort((a, b) => b.runCount - a.runCount);
    }

    return result;
  }, [history, selectedCategory, searchQuery, sortOrder]);

  const categories = [
    { id: 'all', label: 'All', icon: <History className="w-3 h-3" /> },
    { id: 'media', label: 'Music & Songs', icon: <Youtube className="w-3 h-3 text-red-400" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3 text-emerald-400" /> },
    { id: 'device', label: 'Phone Controls', icon: <Zap className="w-3 h-3 text-amber-400" /> },
    { id: 'health', label: 'Health & Sensors', icon: <Activity className="w-3 h-3 text-rose-400" /> },
    { id: 'gf', label: 'GF Mode', icon: <Heart className="w-3 h-3 text-pink-400" /> },
  ];

  const sampleSuggestions = [
    'Kesariya song chalao YouTube pe',
    'WhatsApp message bhejo Rahul ko',
    'Health tracker kholo aur steps dikhao',
    'Flashlight on karo',
    'Battery saver activate karo',
    'GF mode on karo jaan',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isGfMode
            ? 'bg-slate-950/95 border-pink-500/40 shadow-pink-500/10'
            : 'bg-slate-950/95 border-slate-800 shadow-cyan-500/5'
        }`}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl border ${
                isGfMode
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}
            >
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Voice History
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {history.length}
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Search, tap to re-run, or manage previously spoken voice commands
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <div className="relative">
                {confirmClearOpen ? (
                  <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/50 rounded-xl px-2 py-1">
                    <span className="text-[10px] text-red-200 font-medium">Clear all?</span>
                    <button
                      onClick={() => {
                        onClearHistory();
                        setConfirmClearOpen(false);
                      }}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmClearOpen(false)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearOpen(true)}
                    className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/30"
                    title="Clear history log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/30">
          {/* Search Input Field */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search previous voice commands (e.g. YouTube, song, WhatsApp, battery, health)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills & Sort Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer border ${
                      isActive
                        ? isGfMode
                          ? 'bg-pink-600 text-white border-pink-400 shadow-sm'
                          : 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Toggle (Recent vs Most Used) */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[10px]">
              <button
                onClick={() => setSortOrder('recent')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                  sortOrder === 'recent'
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                title="Sort by most recent"
              >
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </button>
              <button
                onClick={() => setSortOrder('frequent')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                  sortOrder === 'frequent'
                    ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                title="Sort by most used"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Frequent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Command List Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 max-h-[50vh]">
          {filteredCommands.length > 0 ? (
            filteredCommands.map(item => {
              const isCopied = copiedId === item.id;
              const formattedTime = new Date(item.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 transition shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </span>

                      {item.runCount > 1 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                          Used {item.runCount}x
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formattedTime}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-white leading-snug break-words">
                      "{item.command}"
                    </p>
                  </div>

                  {/* Actions Deck */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(item.id, item.command)}
                      className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                      title="Copy command to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete Command Button */}
                    <button
                      onClick={() => onDeleteCommand(item.id)}
                      className="p-2 rounded-xl text-xs transition border cursor-pointer bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-red-400 hover:bg-red-950/30"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Single-Tap Re-Run Action Button */}
                    <button
                      onClick={() => onRerunCommand(item.command)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                        isGfMode
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border border-pink-400/50 shadow-pink-500/20'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/50 shadow-cyan-500/20'
                      }`}
                      title="Re-run this command with a single tap"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Re-run</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1">
                {searchQuery ? 'No matching commands found' : 'No voice history recorded yet'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `Try searching for different keywords or clear the search filter.`
                  : `Your spoken voice commands and typed requests will be saved here for one-tap execution.`}
              </p>

              {/* Sample Suggestions to Try */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Try running one of these quick commands:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {sampleSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => onRerunCommand(sug)}
                      className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer info */}
        <div className="p-3 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Single-tap to re-run any command instantly</span>
          </div>
          <span>Showing {filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
};
