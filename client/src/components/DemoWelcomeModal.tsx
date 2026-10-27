import React, { useState } from 'react';

interface DemoWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRepoSelector: () => void;
  onConnectGitHub?: (url: string, branch: string) => Promise<void>;
  isLoading?: boolean;
}

export const DemoWelcomeModal: React.FC<DemoWelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenRepoSelector,
  onConnectGitHub,
  isLoading,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');
  const [showDirectInput, setShowDirectInput] = useState(false);

  if (!isOpen) return null;

  const handleQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim() && onConnectGitHub) {
      onConnectGitHub(repoInput.trim(), branchInput.trim() || 'main');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans select-none animate-fade-in">
      <div className="bg-[#10141d] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Ambient background glow accents */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Dismiss"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header with Demo Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wide bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            PREVIEW MODE — BUNDLED DEMO
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Welcome to DevTrace</span>
            <span className="text-xs font-mono font-normal text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
              v2.4
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            You are currently exploring the bundled{' '}
            <strong className="text-white">ShopSphere (<code className="text-cyan-300 font-mono text-xs">shopsphere-api</code>)</strong>{' '}
            codebase. This allows you to immediately test AST analysis, graph traversal, and AI feature tracing without waiting.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-cyan-400 text-[18px] shrink-0 mt-0.5">
              schema
            </span>
            <div>
              <strong className="text-slate-100">Interactive Architecture Graph:</strong> 12 TypeScript modules, 490+ indexed symbols, and caller/dependency links.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0 mt-0.5">
              psychology
            </span>
            <div>
              <strong className="text-slate-100">Gemini Grounded AI Explorer:</strong> Query features in plain English with verified AST source citations.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">
              hub
            </span>
            <div>
              <strong className="text-slate-100">BlastRadius Impact Engine:</strong> Calculate downstream ripple effects before editing code.
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-xs text-cyan-200/90 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-cyan-400 text-[18px] shrink-0">
            help_outline
          </span>
          <span>
            To analyze your own code, simply connect any public GitHub repository URL!
          </span>
        </div>

        {showDirectInput ? (
          <form onSubmit={handleQuickConnect} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Public GitHub Repository URL</label>
              <input
                type="url"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="https://github.com/facebook/react or owner/repo"
                required
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>{isLoading ? 'Scanning Codebase...' : 'Scan & Analyze Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDirectInput(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-2"
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenRepoSelector();
              }}
              className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30"
            >
              <span className="material-symbols-outlined text-[18px]">add_link</span>
              <span>Analyze My Repository</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs py-2.5 px-4 rounded-xl border border-white/10 transition-colors"
            >
              Explore Demo First
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
