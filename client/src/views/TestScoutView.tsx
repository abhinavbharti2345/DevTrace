import React, { useEffect, useMemo, useState } from 'react';
import { CodebaseIndex, TestRecommendation } from '../types/index.js';

interface TestScoutViewProps {
  index: CodebaseIndex;
  onRunTestScout: (changedFiles: string[]) => Promise<void>;
  recommendations: TestRecommendation[];
  isLoading: boolean;
  onViewFile: (filePath: string) => void;
}

export const TestScoutView: React.FC<TestScoutViewProps> = ({
  index,
  onRunTestScout,
  recommendations,
  isLoading,
  onViewFile,
}) => {
  const allSourceFiles = useMemo(
    () => Object.keys(index.files).filter((f) => !index.files[f].isTest),
    [index.files]
  );

  const testFiles = useMemo(
    () => Object.keys(index.files).filter((f) => index.files[f].isTest),
    [index.files]
  );

  const nodeMap = useMemo(
    () => new Map(index.nodes.map((n) => [n.id, n])),
    [index.nodes]
  );

  const [selectedFiles, setSelectedFiles] = useState<string[]>(allSourceFiles.slice(0, 2));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  // Auto-reset file selection, search, and scan state when repository changes
  useEffect(() => {
    setSelectedFiles(allSourceFiles.slice(0, 2));
    setSearchQuery('');
    setHasScanned(false);
  }, [index.repoName, allSourceFiles]);

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allSourceFiles;
    const query = searchQuery.toLowerCase().trim();
    return allSourceFiles.filter((f) => f.toLowerCase().includes(query));
  }, [allSourceFiles, searchQuery]);

  // Check if all filtered files are currently selected
  const allFilteredSelected =
    filteredFiles.length > 0 && filteredFiles.every((f) => selectedFiles.includes(f));

  // Toggle individual file
  const toggleFile = (f: string) => {
    setSelectedFiles((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  // Select all (or select all matching filtered files if searching)
  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect filtered files
      setSelectedFiles((prev) => prev.filter((f) => !filteredFiles.includes(f)));
    } else {
      // Add all filtered files to selection
      setSelectedFiles((prev) => Array.from(new Set([...prev, ...filteredFiles])));
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const handleRun = () => {
    if (selectedFiles.length > 0) {
      setHasScanned(true);
      onRunTestScout(selectedFiles);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans select-none">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary text-2xl">science</span>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight">
            TestScout: Targeted Test Selection Matrix
          </h1>
          <span className="font-mono text-[10px] text-secondary bg-secondary-container/20 border border-secondary/30 px-1.5 py-0.5 rounded">
            Graph Proximity Ranking
          </span>

          {/* Test Detection Badge */}
          {testFiles.length > 0 ? (
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              🧪 {testFiles.length} Test Suite{testFiles.length > 1 ? 's' : ''} Indexed
            </span>
          ) : (
            <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ⚠️ 0 Test Suites Detected in this Repository
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant">
          Select files you plan to modify. TestScout traverses the module graph to determine exactly which test suites to run, preventing regression failures.
        </p>

        {/* Informational Callout when repository has 0 tests */}
        {testFiles.length === 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">
              info
            </span>
            <div className="space-y-0.5">
              <p className="font-medium text-amber-300">No unit test suites found in this repository</p>
              <p className="text-[11px] text-amber-200/70">
                DevTrace checks for test files matching <code className="font-mono bg-black/40 text-amber-300 px-1 py-0.2 rounded">*.test.*</code>, <code className="font-mono bg-black/40 text-amber-300 px-1 py-0.2 rounded">*.spec.*</code>, <code className="font-mono bg-black/40 text-amber-300 px-1 py-0.2 rounded">__tests__/</code>, or <code className="font-mono bg-black/40 text-amber-300 px-1 py-0.2 rounded">/test/</code>. If this codebase has no unit test suites, TestScout cannot recommend tests to execute.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Changed Files Selector (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 space-y-3.5 shadow-sm">
          {/* Header & Batch Action Controls */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface flex items-center gap-1.5">
                <span>Select Modified Files</span>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.2 rounded-full">
                  {selectedFiles.length} of {allSourceFiles.length}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-[11px] font-mono text-primary hover:text-primary/80 font-medium px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all flex items-center gap-1"
                title={allFilteredSelected ? 'Deselect filtered files' : 'Select all filtered files'}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {allFilteredSelected ? 'deselect' : 'select_all'}
                </span>
                <span>{allFilteredSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              {selectedFiles.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-mono text-outline hover:text-error hover:bg-error-container/20 px-1.5 py-0.5 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Box to find specific files */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files (e.g. auth, modal, service, .ts)..."
              className="w-full bg-surface-container-high border border-outline-variant rounded-lg pl-8 pr-8 py-1.5 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
            <span className="material-symbols-outlined text-[16px] text-outline absolute left-2.5 top-2 pointer-events-none">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-outline hover:text-on-surface p-0.5 rounded"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Files List with check states and role badges */}
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-0.5">
            {filteredFiles.map((f) => {
              const isSelected = selectedFiles.includes(f);
              const node = nodeMap.get(f);
              const fileRole = node?.role || 'file';

              return (
                <div
                  key={f}
                  onClick={() => toggleFile(f)}
                  className={`p-2 rounded-lg font-mono text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-surface-container-high text-primary border border-primary/40 font-medium shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <span
                      className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                        fileRole === 'service'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : fileRole === 'route'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : fileRole === 'model'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {fileRole.slice(0, 4)}
                    </span>
                    <span className="truncate">{f}</span>
                  </div>

                  <span className="material-symbols-outlined text-[18px] shrink-0 text-primary">
                    {isSelected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
              );
            })}

            {filteredFiles.length === 0 && (
              <div className="text-center py-8 text-outline text-xs font-mono space-y-2">
                <span className="material-symbols-outlined text-2xl text-outline/60">search_off</span>
                <p>No files match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:underline text-[11px]"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleRun}
            disabled={isLoading || selectedFiles.length === 0}
            className="w-full bg-primary-container text-on-primary-container hover:brightness-110 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Calculating Test Matrix...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">find_in_page</span>
                <span>Recommend Tests ({selectedFiles.length} files)</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Recommendations (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">
                verified
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                Recommended Test Candidates ({recommendations.length})
              </h2>
            </div>
            <span className="text-[11px] text-outline font-mono">Ranked by Proximity</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.testFile}
                className="p-3 bg-surface-container rounded-lg border border-outline-variant/60 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        rec.priority === 'HIGH'
                          ? 'bg-secondary-container/20 text-secondary border-secondary/40'
                          : 'bg-primary/10 text-primary border-primary/40'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="font-mono text-xs text-on-surface font-semibold truncate">
                      {rec.testFile}
                    </span>
                    <span className="text-[10px] text-outline font-mono bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/40">
                      {rec.distance === 1 ? '1 hop (Direct)' : `${rec.distance} hops`}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewFile(rec.testFile)}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-sans shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">code</span>
                    <span>View Test Suite</span>
                  </button>
                </div>

                <div className="text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="text-[11px] text-outline font-mono">Reason:</span>
                  <span className="font-sans text-[11px]">{rec.reason}</span>
                </div>

                {/* Command snippet */}
                {rec.testRunCommand && (
                  <div className="flex items-center justify-between bg-surface-container-high px-2 py-1 rounded text-[11px] font-mono text-outline">
                    <span>Run: <code className="text-secondary">{rec.testRunCommand}</code></span>
                  </div>
                )}
              </div>
            ))}

            {recommendations.length === 0 && (
              hasScanned ? (
                <div className="text-center py-12 px-6 bg-surface-container/60 border border-outline-variant/60 rounded-xl space-y-2.5">
                  <span className="material-symbols-outlined text-3xl text-amber-400">
                    search_off
                  </span>
                  <h3 className="font-semibold text-on-surface text-sm">
                    No matching test suites found for the selected files
                  </h3>
                  <p className="text-on-surface-variant max-w-md mx-auto text-xs leading-relaxed">
                    {testFiles.length > 0
                      ? `Found ${testFiles.length} total test suite${testFiles.length > 1 ? 's' : ''} in this codebase, but none directly or transitively import the ${selectedFiles.length} selected file${selectedFiles.length > 1 ? 's' : ''}.`
                      : `This repository has 0 indexed unit test files.`}
                  </p>
                  <div className="pt-2 text-[11px] text-on-surface-variant/80 font-mono bg-surface-container-high/60 py-1.5 px-3 rounded-lg inline-block border border-outline-variant/30">
                    💡 Tip: Try selecting core models or shared utilities that are widely exercised across tests.
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-outline font-sans text-xs space-y-1">
                  <span className="material-symbols-outlined text-3xl text-outline/60 mb-2">
                    checklist
                  </span>
                  <p>Select one or more modified files on the left and click "Recommend Tests".</p>
                  <p className="text-[11px] text-outline/70">
                    TestScout will analyze reverse dependency graphs to find test suites that exercise your code.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
