import React, { useState } from 'react';
import { FeatureExplorerResult } from '../types/index.js';

interface FeatureExplorerViewProps {
  onSearch: (query: string) => Promise<void>;
  result: FeatureExplorerResult | null;
  isLoading: boolean;
  onInspectInGraph: (filePath: string) => void;
  onViewFile: (filePath: string) => void;
  initialQuery?: string;
}

export const FeatureExplorerView: React.FC<FeatureExplorerViewProps> = ({
  onSearch,
  result,
  isLoading,
  onInspectInGraph,
  onViewFile,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const sampleQueries = [
    'Where is user authentication and session validation handled?',
    'Show all files involved in cart checkout and payments',
    'Which modules handle password hashing and JWT token signing?',
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">auto_awesome</span>
            <h1 className="text-xl font-semibold text-on-surface tracking-tight">
              AI Feature Explorer
            </h1>
            <span className="font-mono text-[10px] text-secondary bg-secondary-container/20 border border-secondary/30 px-1.5 py-0.5 rounded">
              2-Stage AST Grounded
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Describe a feature in natural language. DevTrace identifies candidate files via AST symbol matching and explains how they connect.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-outline absolute left-3 top-3 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find all files involved in user authentication and token verification..."
              className="w-full bg-surface-container-high border border-outline-variant rounded pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-primary-container text-on-primary-container hover:brightness-110 px-5 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Searching AST...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>Trace Feature</span>
              </>
            )}
          </button>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-outline font-mono">Suggested:</span>
          {sampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                onSearch(q);
              }}
              className="text-xs text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant px-2.5 py-1 rounded transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {result && (
        <div className="space-y-6">
          {/* AI Grounded Explanation Card */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">
                  psychology
                </span>
                <h2 className="text-sm font-semibold text-on-surface">Architectural Rationale</h2>
              </div>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                  result.isFallback
                    ? 'text-tertiary bg-tertiary-container/20 border-tertiary/30'
                    : 'text-secondary bg-secondary-container/20 border-secondary/30'
                }`}
              >
                {result.isFallback ? 'Deterministic AST Grounding' : 'Gemini Grounded'}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-on-surface-variant leading-relaxed whitespace-pre-line font-sans">
              {result.aiExplanation}
            </div>
          </div>

          {/* Ranked Candidate Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
                Discovered Candidate Files ({result.candidateFiles.length})
              </h3>
              <span className="text-xs text-outline font-mono">Ranked by AST Evidence</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.candidateFiles.map((c, idx) => (
                <div
                  key={c.file}
                  className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 hover:border-primary/50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-primary font-semibold bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-sm text-on-surface font-semibold truncate">
                        {c.file}
                      </span>
                      <span className="text-xs text-outline font-mono">line {c.line}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onInspectInGraph(c.file)}
                        className="inline-flex items-center gap-1 text-xs text-on-surface bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded border border-outline-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          hub
                        </span>
                        <span>Inspect in Graph</span>
                      </button>
                      <button
                        onClick={() => onViewFile(c.file)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-on-surface bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded border border-outline-variant transition-colors"
                      >
                        <span>View Source</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </button>
                    </div>
                  </div>

                  {/* Badges / Relevance */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-medium">
                      {c.relevanceReason}
                    </span>
                    {c.matchedSymbols.map((sym) => (
                      <span
                        key={sym}
                        className="font-mono text-[10px] text-tertiary bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>

                  {/* Code snippet */}
                  {c.snippet && (
                    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded p-3 overflow-x-auto">
                      <pre className="font-mono text-[11px] text-on-surface-variant leading-5 whitespace-pre">
                        {c.snippet}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
