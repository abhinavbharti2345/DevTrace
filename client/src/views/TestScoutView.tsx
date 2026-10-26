import React, { useState } from 'react';
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
  const allSourceFiles = Object.keys(index.files).filter((f) => !index.files[f].isTest);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    allSourceFiles.slice(0, 2)
  );

  const toggleFile = (f: string) => {
    setSelectedFiles((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleRun = () => {
    if (selectedFiles.length > 0) {
      onRunTestScout(selectedFiles);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-2xl">science</span>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight">
            TestScout: Targeted Test Selection Matrix
          </h1>
          <span className="font-mono text-[10px] text-secondary bg-secondary-container/20 border border-secondary/30 px-1.5 py-0.5 rounded">
            Graph Proximity Ranking
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Select files you plan to modify. TestScout traverses the module graph to determine exactly which test suites to run, preventing regression failures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Changed Files Selector (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
              Select Modified Files ({selectedFiles.length})
            </h2>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-[11px] text-outline hover:text-on-surface font-mono"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-1 max-h-[380px] overflow-y-auto">
            {allSourceFiles.map((f) => {
              const isSelected = selectedFiles.includes(f);
              return (
                <div
                  key={f}
                  onClick={() => toggleFile(f)}
                  className={`p-2 rounded font-mono text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-surface-container-high text-primary border border-primary/40 font-medium'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="truncate max-w-[300px]">{f}</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {isSelected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRun}
            disabled={isLoading || selectedFiles.length === 0}
            className="w-full bg-primary-container text-on-primary-container hover:brightness-110 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
        <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
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
                className="p-3 bg-surface-container rounded border border-outline-variant/60 space-y-2"
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
                  </div>

                  <button
                    onClick={() => onViewFile(rec.testFile)}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-sans shrink-0"
                  >
                    <span>View Test Code</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant font-sans">{rec.reason}</p>

                <div className="flex items-center justify-between gap-2 bg-surface-container-lowest p-2 rounded border border-outline-variant/50">
                  <code className="font-mono text-[11px] text-on-surface truncate">
                    {rec.testRunCommand}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(rec.testRunCommand)}
                    className="text-xs text-outline hover:text-on-surface inline-flex items-center gap-1 font-mono shrink-0 bg-surface-container px-2 py-0.5 rounded border border-outline-variant"
                    title="Copy command"
                  >
                    <span>Copy</span>
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  </button>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <p className="text-xs text-outline py-8 text-center font-sans">
                Select one or more modified files and click "Recommend Tests" to evaluate test coverage.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
