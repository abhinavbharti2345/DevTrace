import React from 'react';
import { CodebaseIndex } from '../types/index.js';

interface RepoSyncViewProps {
  index: CodebaseIndex;
  onSync: () => Promise<void>;
  onOpenRepoSelector: () => void;
  isSyncing: boolean;
  syncMessage?: string;
}

export const RepoSyncView: React.FC<RepoSyncViewProps> = ({
  index,
  onSync,
  onOpenRepoSelector,
  isSyncing,
  syncMessage,
}) => {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto w-full font-sans">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">
            sync_saved_locally
          </span>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight">
            Repository Management & Upstream Sync
          </h1>
          <span className="font-mono text-[10px] text-secondary bg-secondary-container/20 border border-secondary/30 px-1.5 py-0.5 rounded">
            Commit-Aware AST Cache
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Monitor your active repository, compare remote commit SHAs, and trigger incremental or full AST rescans when upstream code changes.
        </p>
      </div>

      {syncMessage && (
        <div className="p-3 bg-secondary-container/20 border border-secondary/30 text-secondary text-xs rounded flex items-center gap-2 font-mono">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Active Repo Card */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-outline">
              Active Connected Codebase
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-on-surface font-mono">{index.repoName}</span>
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {index.repoUrl ? 'GitHub' : 'Bundled Demo'}
              </span>
            </div>
            {index.repoUrl && (
              <a
                href={index.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1"
              >
                <span>{index.repoUrl}</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 px-4 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 shadow-sm"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isSyncing ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Repository Now'}</span>
            </button>
            <button
              onClick={onOpenRepoSelector}
              className="inline-flex items-center gap-1 bg-surface-container-high hover:bg-surface-bright text-on-surface px-3 py-2 rounded border border-outline-variant text-xs font-medium transition-colors"
            >
              <span>Switch Repo</span>
            </button>
          </div>
        </div>

        {/* Sync Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-surface-container p-3 rounded space-y-1">
            <span className="text-outline uppercase text-[10px]">Tracked Branch</span>
            <div className="text-on-surface font-semibold">{index.branch}</div>
          </div>
          <div className="bg-surface-container p-3 rounded space-y-1">
            <span className="text-outline uppercase text-[10px]">Analyzed Commit SHA</span>
            <div className="text-primary font-semibold">{index.commitSha}</div>
          </div>
          <div className="bg-surface-container p-3 rounded space-y-1">
            <span className="text-outline uppercase text-[10px]">Analysis Timestamp</span>
            <div className="text-on-surface font-semibold">
              {new Date(index.analyzedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Sync Integrity & Security Guarantees */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
          Security & Ingestion Guardrails
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-on-surface-variant font-sans">
          <div className="p-3 bg-surface-container rounded space-y-1 border border-outline-variant/40">
            <div className="font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
              <span>Zero Code Execution</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Source code is parsed purely as text into syntactic ASTs. No package scripts, builds, or dependencies are ever executed.
            </p>
          </div>

          <div className="p-3 bg-surface-container rounded space-y-1 border border-outline-variant/40">
            <div className="font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
              <span>Memory Streaming</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Zipballs are decompressed in memory buffers with strict size limits (max 150 files / 5MB) to protect server resources.
            </p>
          </div>

          <div className="p-3 bg-surface-container rounded space-y-1 border border-outline-variant/40">
            <div className="font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
              <span>Backend Guarded</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All AI model communications and GitHub tokens reside strictly behind the Express API server with zero client exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
