import React, { useState } from 'react';
import { StackTraceAnalysis } from '../types/index.js';

interface ErrorLabViewProps {
  onAnalyzeTrace: (trace: string) => Promise<void>;
  analysis: StackTraceAnalysis | null;
  isLoading: boolean;
  onViewFile: (filePath: string) => void;
}

export const ErrorLabView: React.FC<ErrorLabViewProps> = ({
  onAnalyzeTrace,
  analysis,
  isLoading,
  onViewFile,
}) => {
  const [traceInput, setTraceInput] = useState('');

  const sampleTraces = [
    {
      label: 'JWT Token Error',
      trace: `Error: Invalid JWT format
    at verifyToken (src/utils/jwt.ts:13:13)
    at Object.validateSession (src/services/auth.service.ts:62:10)
    at authMiddleware (src/routes/auth.routes.ts:24:10)`,
    },
    {
      label: 'Cart Calculation Error',
      trace: `TypeError: Cannot read properties of undefined (reading 'price')
    at recalculateCart (src/services/cart.service.ts:58:45)
    at Object.addItemToCart (src/services/cart.service.ts:51:3)
    at handleAddToCart (src/routes/cart.routes.ts:14:10)`,
    },
  ];

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (traceInput.trim()) {
      onAnalyzeTrace(traceInput.trim());
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-2xl">bug_report</span>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight">
            WhyIsItBroken: Error Investigation Lab
          </h1>
          <span className="font-mono text-[10px] text-error bg-error-container/20 border border-error/30 px-1.5 py-0.5 rounded">
            Stack Frame AST Normalizer
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Paste a runtime stack trace. DevTrace resolves stack frames to indexed repository files, extracts the offending line context, and maps caller modules to diagnose root causes.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-5 space-y-3 shadow-sm">
        <form onSubmit={handleRun} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-outline uppercase tracking-wider">
              Runtime Stack Trace / Error Payload
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-outline font-mono">Load Sample:</span>
              {sampleTraces.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setTraceInput(s.trace);
                    onAnalyzeTrace(s.trace);
                  }}
                  className="text-[11px] text-primary hover:underline bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-mono"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={traceInput}
            onChange={(e) => setTraceInput(e.target.value)}
            rows={5}
            placeholder="Paste your Error stack trace here (e.g. at Object.verifyToken (src/utils/jwt.ts:13:13)..."
            className="w-full bg-surface-container-high border border-outline-variant rounded p-3 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors resize-y leading-5"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !traceInput.trim()}
              className="bg-primary-container text-on-primary-container hover:brightness-110 px-5 py-2 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Investigating Trace...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
                  <span>Investigate Error</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Primary Location & Hypotheses */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Location Card (6 cols) */}
            <div className="lg:col-span-6 bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">
                    error_outline
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                    Primary Origin Location
                  </h3>
                </div>
                {analysis.primaryErrorLocation && (
                  <button
                    onClick={() =>
                      analysis.primaryErrorLocation?.resolvedPath &&
                      onViewFile(analysis.primaryErrorLocation.resolvedPath)
                    }
                    className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1"
                  >
                    <span>Inspect File</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </button>
                )}
              </div>

              {analysis.primaryErrorLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-error font-semibold">
                      {analysis.primaryErrorLocation.resolvedPath}
                    </span>
                    <span className="text-outline">
                      line {analysis.primaryErrorLocation.line}:
                      {analysis.primaryErrorLocation.column}
                    </span>
                  </div>

                  {analysis.primaryErrorLocation.snippet && (
                    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded p-3 overflow-x-auto">
                      <pre className="font-mono text-[11px] text-on-surface-variant leading-5 whitespace-pre">
                        {analysis.primaryErrorLocation.snippet}
                      </pre>
                    </div>
                  )}

                  {analysis.primaryErrorLocation.callers && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono uppercase text-outline">
                        Inbound Callers in Repository:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {analysis.primaryErrorLocation.callers.map((c) => (
                          <span
                            key={c}
                            className="font-mono text-[10px] text-primary bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-outline py-4 font-sans">
                  No internal repository frames matched in the provided stack trace.
                </p>
              )}
            </div>

            {/* Hypotheses Card (6 cols) */}
            <div className="lg:col-span-6 bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">
                    lightbulb
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                    Debugging Hypotheses ({analysis.hypotheses.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-tertiary">AST Pattern Analysis</span>
              </div>

              <div className="space-y-2.5">
                {analysis.hypotheses.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-surface-container rounded border border-outline-variant/40 flex items-start gap-2.5 text-xs text-on-surface leading-relaxed"
                  >
                    <span className="font-mono text-[11px] text-tertiary font-bold shrink-0 mt-0.5">
                      #{i + 1}
                    </span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Parsed Frames Table */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-on-surface">
                All Extracted Stack Frames ({analysis.matchedFrames.length})
              </h3>
              <span className="text-[11px] text-outline font-mono">Matched vs External</span>
            </div>

            <div className="space-y-2">
              {analysis.matchedFrames.map((frame, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-surface-container rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        frame.resolvedPath ? 'bg-secondary' : 'bg-outline'
                      }`}
                    />
                    <span className="text-on-surface font-medium truncate">
                      {frame.functionName || 'anonymous'}
                    </span>
                    <span className="text-outline truncate">
                      ({frame.resolvedPath || frame.fileName}:{frame.line})
                    </span>
                  </div>

                  {frame.resolvedPath && (
                    <button
                      onClick={() => frame.resolvedPath && onViewFile(frame.resolvedPath)}
                      className="text-xs text-primary hover:underline shrink-0 font-sans inline-flex items-center gap-1"
                    >
                      <span>Jump to Line {frame.line}</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </button>
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
