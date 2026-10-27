import React, { useState } from 'react';
import { GeneratedWebsite } from '../types/assistant';
import {
  X,
  Code2,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Download,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface WebsiteDesignModalProps {
  website: GeneratedWebsite;
  onClose: () => void;
  onRefine: (refinePrompt: string) => void;
  isGenerating?: boolean;
}

export const WebsiteDesignModal: React.FC<WebsiteDesignModalProps> = ({
  website,
  onClose,
  onRefine,
  isGenerating = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);
  const [refineInput, setRefineInput] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(website.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([website.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website.topic.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const blob = new Blob([website.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineInput.trim() || isGenerating) return;
    onRefine(refineInput);
    setRefineInput('');
  };

  const getContainerWidth = () => {
    if (deviceView === 'mobile') return 'max-w-[375px]';
    if (deviceView === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] max-h-[850px] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {website.title || 'Generated Website'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  Live Preview
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Topic: {website.topic}
              </p>
            </div>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-1.5">
            {/* Viewport Toggles (only in preview) */}
            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 mr-2">
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    deviceView === 'mobile' ? 'bg-slate-800 text-pink-400 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    deviceView === 'tablet' ? 'bg-slate-800 text-pink-400 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    deviceView === 'desktop' ? 'bg-slate-800 text-pink-400 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab switch */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'preview' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'code' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
              </button>
            </div>

            {/* Open full in new tab */}
            <button
              onClick={openInNewTab}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Open full page in browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <RefreshCw className="w-10 h-10 text-pink-500 animate-spin" />
              <h4 className="text-base font-bold text-white">Designing your website on command...</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Myra is writing responsive HTML, crafting Tailwind styles, and generating modern layouts.
              </p>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 bg-slate-950/70">
              <div
                className={`h-full ${getContainerWidth()} rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-white transition-all duration-300`}
              >
                <iframe
                  srcDoc={website.html}
                  title="Website Live Sandbox"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col p-4 bg-slate-950 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <span className="text-slate-400 text-xs font-semibold">index.html ({website.html.length} characters)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .html
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed select-text">
                <code>{website.html}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Refine website bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <form onSubmit={handleRefineSubmit} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={refineInput}
              onChange={e => setRefineInput(e.target.value)}
              placeholder="Refine website command (e.g. 'Add a customer review slider', 'Change colors to gold & black')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
            />
            <button
              type="submit"
              disabled={isGenerating || !refineInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-pink-500/20 disabled:opacity-50 transition active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Refine Design
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
