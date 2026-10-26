import React, { useState } from 'react';

interface RepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectGitHub: (url: string, branch: string) => Promise<void>;
  onLoadDemo: () => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
}

export const RepoSelectorModal: React.FC<RepoSelectorModalProps> = ({
  isOpen,
  onClose,
  onConnectGitHub,
  onLoadDemo,
  isLoading,
  errorMessage,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onConnectGitHub(repoUrl.trim(), branch.trim() || 'main');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-surface-container-low border border-outline-variant rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-outline hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
            <h2 className="text-lg font-semibold text-on-surface">Connect Repository</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Analyze a public GitHub codebase or test with the bundled full-stack demo repository.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded bg-error-container/20 border border-error/30 text-error text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
              error_outline
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Bundled Demo Option (Featured) */}
        <div className="bg-surface-container rounded-lg p-4 border border-secondary/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-secondary">
                1-Click Curated Codebase (Recommended)
              </h3>
            </div>
            <span className="font-mono text-[10px] bg-secondary-container/20 text-secondary px-1.5 py-0.5 rounded border border-secondary/30">
              Zero Rate Limits
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Instant evaluation on <strong>ShopSphere</strong>: Full-stack TypeScript app with JWT Auth, Shopping Cart, Payment Gateway, and Vitest test suites.
          </p>
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isLoading}
            className="w-full bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant hover:border-secondary/60 text-xs font-medium py-2 rounded transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              play_circle
            </span>
            <span>Load Bundled ShopSphere Demo</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-outline-variant" />
          <span className="flex-shrink mx-3 text-outline text-[11px] font-mono uppercase">
            Or Scan GitHub Repository
          </span>
          <div className="flex-grow border-t border-outline-variant" />
        </div>

        {/* Public GitHub Repo Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-mono text-outline uppercase tracking-wider">
              GitHub Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/expressjs/cors"
              className="w-full bg-surface-container-high border border-outline-variant rounded px-3 py-2 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-outline uppercase tracking-wider">
              Branch (Optional)
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full bg-surface-container-high border border-outline-variant rounded px-3 py-2 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !repoUrl.trim()}
            className="w-full bg-primary-container text-on-primary-container hover:brightness-110 py-2.5 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Cloning & Parsing AST...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Scan and Index Repository</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
