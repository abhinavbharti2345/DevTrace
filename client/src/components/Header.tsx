import React from 'react';
import { CodebaseIndex } from '../types/index.js';

interface HeaderProps {
  index: CodebaseIndex | null;
  onSync: () => void;
  onOpenRepoSelector: () => void;
  onQuickSearch: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  index,
  onSync,
  onOpenRepoSelector,
  onQuickSearch,
  isSyncing,
}) => {
  return (
    <header className="fixed top-0 left-60 right-0 h-[52px] bg-surface-container-low border-b border-outline-variant z-40 flex items-center justify-between px-4 font-sans select-none">
      {/* Left: Repo title, branch, commit */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenRepoSelector}
          className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest px-2.5 py-1 rounded border border-outline-variant transition-colors"
          title="Switch Repository"
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            folder_open
          </span>
          <span className="font-mono text-xs text-on-surface font-medium truncate max-w-[200px]">
            {index ? index.repoName : 'Loading repository...'}
          </span>
          <span className="material-symbols-outlined text-[14px] text-outline">expand_more</span>
        </button>

        <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded border border-outline-variant">
          <span className="material-symbols-outlined text-[15px] text-secondary">fork_right</span>
          <span className="font-mono text-xs text-on-surface">{index?.branch || 'main'}</span>
        </div>

        {index?.commitSha && (
          <div className="hidden xl:flex items-center gap-1 font-mono text-xs text-on-surface-variant bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant">
            <span className="text-outline">commit</span>
            <span className="text-primary">{index.commitSha}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
          <span>Synced</span>
        </div>
      </div>

      {/* Right: Quick Search, Sync Action, Load Demo */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onQuickSearch}
          className="flex items-center gap-2 bg-surface-container-highest/80 hover:bg-surface-container-highest border border-outline-variant px-3 py-1 rounded w-60 lg:w-72 text-on-surface-variant text-left transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-outline">search</span>
          <span className="text-xs text-outline flex-1 truncate">Ask AI or search symbols...</span>
          <kbd className="font-mono text-[10px] bg-surface-container-high text-on-surface-variant px-1 rounded border border-outline-variant">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant border border-outline-variant px-3 py-1 rounded transition-colors text-xs font-medium"
        >
          <span
            className={`material-symbols-outlined text-[16px] text-primary ${
              isSyncing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>

        <button
          onClick={onOpenRepoSelector}
          className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 px-3 py-1 rounded transition-all text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[15px]">add_link</span>
          <span>Change Repo</span>
        </button>
      </div>
    </header>
  );
};
