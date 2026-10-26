import React, { useState } from 'react';
import { BlastRadiusResult, CodebaseIndex } from '../types/index.js';

interface BlastRadiusViewProps {
  index: CodebaseIndex;
  result: BlastRadiusResult | null;
  isLoading: boolean;
  onCalculateBlastRadius: (targetFile: string, maxDepth: number) => Promise<void>;
  onVisualizeInGraph: (nodes: string[]) => void;
  onViewFile: (filePath: string) => void;
  initialTargetFile?: string;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({
  index,
  result,
  isLoading,
  onCalculateBlastRadius,
  onVisualizeInGraph,
  onViewFile,
  initialTargetFile = '',
}) => {
  const allFiles = Object.keys(index.files);
  const [selectedFile, setSelectedFile] = useState(initialTargetFile || allFiles[0] || '');
  const [maxDepth, setMaxDepth] = useState(3);

  const handleRun = () => {
    if (selectedFile) {
      onCalculateBlastRadius(selectedFile, maxDepth);
    }
  };

  const severityColor: Record<string, { bg: string; text: string; border: string }> = {
    LOW: {
      bg: 'bg-secondary-container/20',
      text: 'text-secondary',
      border: 'border-secondary/40',
    },
    MEDIUM: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/40',
    },
    HIGH: {
      bg: 'bg-tertiary/10',
      text: 'text-tertiary',
      border: 'border-tertiary/40',
    },
    CRITICAL: {
      bg: 'bg-error-container/30',
      text: 'text-error',
      border: 'border-error/40',
    },
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans">
      {/* Header & Target Selector */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">difference</span>
            <h1 className="text-xl font-semibold text-on-surface tracking-tight">
              BlastRadius: Change Impact Analysis
            </h1>
            <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded">
              BFS Reverse Graph Traversal
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Simulate modifying a file to calculate downstream callers, transitive dependencies, and affected test suites before making changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-8 space-y-1">
            <label className="text-xs font-mono text-outline uppercase tracking-wider">
              Select Target File to Modify
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {allFiles.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-mono text-outline uppercase tracking-wider">
              BFS Max Depth ({maxDepth})
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleRun}
              disabled={isLoading || !selectedFile}
              className="w-full bg-primary-container text-on-primary-container hover:brightness-110 px-4 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Traversing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Calculate Impact</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                Impact Severity
              </span>
              <div className="my-2">
                <span
                  className={`text-lg font-bold font-mono px-2.5 py-1 rounded border ${
                    severityColor[result.severity]?.border
                  } ${severityColor[result.severity]?.bg} ${severityColor[result.severity]?.text}`}
                >
                  {result.severity} RISK
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Score: {result.impactScore} points
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                Direct Dependents (Tier 1)
              </span>
              <div className="text-2xl font-bold font-mono text-primary my-1">
                {result.directDependents.length}
              </div>
              <span className="text-[11px] text-outline font-sans">Immediate callers affected</span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                Transitive Dependents (Tier 2+)
              </span>
              <div className="text-2xl font-bold font-mono text-tertiary my-1">
                {result.transitiveDependents.length}
              </div>
              <span className="text-[11px] text-outline font-sans">
                Downstream reachable callers
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
                Test Suites Affected
              </span>
              <div className="text-2xl font-bold font-mono text-secondary my-1">
                {result.affectedTests.length}
              </div>
              <button
                onClick={() => onVisualizeInGraph(result.affectedSubGraphNodes)}
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Highlight in Graph</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Breakdown Split: Direct vs Transitive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Dependents */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                    Tier 1: Direct Dependents ({result.directDependents.length})
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-primary">Distance = 1</span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {result.directDependents.map((dep) => (
                  <div
                    key={dep}
                    onClick={() => onViewFile(dep)}
                    className="p-2 bg-surface-container hover:bg-surface-container-high rounded font-mono text-xs text-on-surface flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <span className="group-hover:text-primary transition-colors truncate">
                      {dep}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-outline">
                      open_in_new
                    </span>
                  </div>
                ))}
                {result.directDependents.length === 0 && (
                  <p className="text-xs text-outline py-4 text-center font-sans">
                    No modules import this file directly.
                  </p>
                )}
              </div>
            </div>

            {/* Transitive Dependents */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                    Tier 2: Transitive Dependents ({result.transitiveDependents.length})
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-tertiary">Distance ≥ 2</span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {result.transitiveDependents.map((dep) => (
                  <div
                    key={dep}
                    onClick={() => onViewFile(dep)}
                    className="p-2 bg-surface-container hover:bg-surface-container-high rounded font-mono text-xs text-on-surface flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <span className="group-hover:text-tertiary transition-colors truncate">
                      {dep}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-outline">
                      open_in_new
                    </span>
                  </div>
                ))}
                {result.transitiveDependents.length === 0 && (
                  <p className="text-xs text-outline py-4 text-center font-sans">
                    No downstream transitive dependents discovered.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Recommendations */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  science
                </span>
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                  Recommended Test Suites ({result.affectedTests.length})
                </h3>
              </div>
              <span className="text-xs text-outline font-mono">TestScout Proximity Algorithm</span>
            </div>

            <div className="space-y-2">
              {result.affectedTests.map((test) => (
                <div
                  key={test.testFile}
                  className="p-3 bg-surface-container rounded border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          test.priority === 'HIGH'
                            ? 'bg-secondary-container/20 text-secondary border-secondary/40'
                            : 'bg-primary/10 text-primary border-primary/40'
                        }`}
                      >
                        {test.priority} PRIORITY
                      </span>
                      <span className="font-mono text-xs text-on-surface font-semibold truncate">
                        {test.testFile}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-sans">{test.reason}</p>
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(test.testRunCommand)}
                    className="inline-flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono text-xs px-2.5 py-1.5 rounded border border-outline-variant transition-colors shrink-0"
                    title="Copy command"
                  >
                    <span>{test.testRunCommand}</span>
                    <span className="material-symbols-outlined text-[13px] text-outline">
                      content_copy
                    </span>
                  </button>
                </div>
              ))}
              {result.affectedTests.length === 0 && (
                <p className="text-xs text-outline py-3 text-center font-sans">
                  No automated test suites mapped for this file path.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
