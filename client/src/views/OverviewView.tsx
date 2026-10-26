import React from 'react';
import { CodebaseIndex, TabType } from '../types/index.js';

interface OverviewViewProps {
  index: CodebaseIndex;
  onNavigateTab: (tab: TabType) => void;
  onSelectFile: (filePath: string) => void;
  onRunSemanticQuery: (query: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  index,
  onNavigateTab,
  onSelectFile,
  onRunSemanticQuery,
}) => {
  const { stats, files } = index;
  const fileEntries = Object.entries(files);

  // Sort files by inbound caller count to find hotspots
  const hotspots = [...index.nodes]
    .sort((a, b) => b.importersCount - a.importersCount)
    .slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full font-sans">
      {/* 1. Repository Header Banner */}
      <div className="bg-surface-container-low rounded-lg p-5 border border-outline-variant/60 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">folder</span>
                </span>
                <span className="text-xl font-semibold text-on-surface tracking-tight">
                  {index.repoName}
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                public
              </span>
              {index.repoUrl && (
                <div
                  className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(index.repoUrl || '')}
                  title="Copy GitHub URL"
                >
                  <span className="font-mono text-xs text-outline truncate max-w-xs">
                    {index.repoUrl}
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline">
                    content_copy
                  </span>
                </div>
              )}
            </div>

            {/* Sub-metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  fork_right
                </span>
                <span className="text-on-surface font-mono">{index.branch}</span>
                <span className="font-mono text-outline">(tracked)</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-outline font-mono">HEAD</span>
                <code className="font-mono text-primary bg-surface-container px-1 py-0.2 rounded">
                  {index.commitSha}
                </code>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                <span className="font-mono text-secondary">Analyzed & Healthy</span>
              </div>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('feature-explorer')}
              className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 font-medium text-xs px-3.5 py-2 rounded transition-all active:scale-95 shadow-sm"
            >
              <span>Explore Features</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigateTab('dependency-graph')}
              className="inline-flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium px-3.5 py-2 rounded border border-outline-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
              <span>Open Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Repository Metrics (4 stat cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Source Files */}
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
              Indexed Source Files
            </span>
            <span className="material-symbols-outlined text-[18px] text-outline">
              code_blocks
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl font-semibold text-on-surface tracking-tight">
                {stats.totalFiles}
              </span>
              <span className="font-mono text-xs text-outline">
                {stats.totalLines.toLocaleString()} LOC
              </span>
            </div>
            {/* Language distribution bar */}
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden flex gap-0.5 mb-2">
              {stats.languages.map((l, i) => (
                <div
                  key={l.name}
                  className={`h-full ${
                    i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-tertiary'
                  }`}
                  style={{ width: `${l.percentage}%` }}
                  title={`${l.name}: ${l.percentage}%`}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[11px] text-outline">
              {stats.languages.slice(0, 3).map((l, i) => (
                <span key={l.name} className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-tertiary'
                    }`}
                  />
                  {l.name} {l.percentage}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Metric 2: Discovered Tests */}
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
              Test Suites Discovered
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">
              verified
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-semibold text-on-surface tracking-tight">
                {stats.testSuitesCount}
              </span>
              <span className="font-mono text-xs text-secondary">suites mapped</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Linked via TestScout proximity graph
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                100% Vitest / Unit
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Dependency Edges */}
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
              Dependency Edges
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              account_tree
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-semibold text-on-surface tracking-tight">
                {stats.totalDependencies}
              </span>
              <span className="font-mono text-xs text-primary">directed relationships</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Full static AST symbol closure
            </p>
            <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-outline">
              <span>Symbols: {stats.totalSymbols}</span>
              <span>Nodes: {index.nodes.length}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Architecture Health */}
        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
              Architecture Health
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">
              health_and_safety
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-semibold text-on-surface tracking-tight">
                {stats.cyclesDetected}
              </span>
              <span className="font-mono text-xs text-secondary">cycles detected</span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2.5">
              <span className="flex items-center gap-1.5 text-secondary font-mono text-[11px]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Pure DAG Structure
              </span>
              <span className="font-mono text-[11px] text-outline">Deterministic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Split: File Ledger & Architecture Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 cols (Indexed File Tree) */}
        <div className="lg:col-span-8 space-y-4 min-w-0">
          <div className="bg-surface-container-low rounded-lg border border-outline-variant/50 overflow-hidden">
            <div className="p-3.5 bg-surface-container flex items-center justify-between border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  list_alt
                </span>
                <h2 className="text-sm font-semibold text-on-surface">
                  Indexed Modules & Symbols
                </h2>
              </div>
              <span className="font-mono text-xs text-outline">
                {fileEntries.length} source files
              </span>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-container-high/60 font-mono text-outline uppercase tracking-wider text-[11px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">File Path</th>
                    <th className="py-2.5 px-4 font-medium">Role</th>
                    <th className="py-2.5 px-4 font-medium">Symbols</th>
                    <th className="py-2.5 px-4 font-medium text-right">Imports</th>
                    <th className="py-2.5 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-mono">
                  {fileEntries.map(([filePath, file]) => {
                    const node = index.nodes.find((n) => n.path === filePath);
                    return (
                      <tr
                        key={filePath}
                        className="hover:bg-surface-container transition-colors group cursor-pointer"
                        onClick={() => onSelectFile(filePath)}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                file.isTest ? 'bg-secondary' : 'bg-primary'
                              }`}
                            />
                            <span className="text-on-surface group-hover:text-primary transition-colors">
                              {filePath}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
                              file.isTest
                                ? 'bg-secondary-container/20 text-secondary'
                                : 'bg-surface-container-highest text-on-surface-variant'
                            }`}
                          >
                            {node?.role || 'module'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-on-surface-variant truncate max-w-xs">
                          {file.symbols.length > 0
                            ? file.symbols
                                .slice(0, 2)
                                .map((s) => s.name)
                                .join(', ')
                            : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-outline">
                          {file.imports.length}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectFile(filePath);
                            }}
                            className="text-primary hover:underline font-sans text-xs inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <span className="material-symbols-outlined text-[13px]">
                              open_in_new
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: 4 cols (Hotspots & Semantic Queries) */}
        <div className="lg:col-span-4 space-y-4 min-w-0">
          {/* Hotspots Card */}
          <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">route</span>
                <h3 className="text-sm font-semibold text-on-surface">Core Entrypoints</h3>
              </div>
              <span className="font-mono text-[11px] text-outline">Inbound Gravity</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">
              Modules with the highest dependent caller count across the graph.
            </p>
            <div className="space-y-2 font-mono text-xs">
              {hotspots.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onSelectFile(h.path)}
                  className="p-2.5 bg-surface-container rounded hover:bg-surface-container-high transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-primary group-hover:underline truncate">{h.label}</div>
                    <div className="text-[11px] text-outline font-sans truncate">{h.path}</div>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface bg-surface-container-highest px-1.5 py-0.5 rounded shrink-0 ml-2">
                    {h.importersCount} callers
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Inquiries */}
          <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  auto_awesome
                </span>
                <h3 className="text-sm font-semibold text-on-surface">Semantic Inquiries</h3>
              </div>
              <span className="font-mono text-[10px] text-secondary bg-secondary-container/20 px-1 py-0.2 rounded">
                Grounded
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">
              One-click inquiries against the AST and module graph:
            </p>
            <div className="space-y-2">
              {[
                'Where is user authentication and session validation handled?',
                'Show all modules involved in checkout and payment processing',
                'Where are shopping cart discounts and taxes calculated?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onRunSemanticQuery(q)}
                  className="w-full text-left p-2.5 bg-surface-container hover:bg-surface-container-high rounded transition-colors group flex items-center justify-between text-xs"
                >
                  <span className="text-on-surface group-hover:text-primary transition-colors truncate">
                    {q}
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-outline shrink-0 ml-2">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
