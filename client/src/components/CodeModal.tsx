import React from 'react';
import { FileInfo } from '../types/index.js';

interface CodeModalProps {
  filePath: string | null;
  fileInfo: FileInfo | null;
  onClose: () => void;
  onTriggerBlastRadius: (filePath: string) => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  filePath,
  fileInfo,
  onClose,
  onTriggerBlastRadius,
}) => {
  if (!filePath || !fileInfo) return null;

  const lines = fileInfo.content.split('\n');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-surface-container-low border border-outline-variant rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 px-5 bg-surface-container border-b border-outline-variant flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-primary">description</span>
            <span className="font-mono text-sm font-semibold text-on-surface truncate">
              {filePath}
            </span>
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container-highest text-outline">
              {lines.length} lines • {Math.round(fileInfo.size / 1024)} KB
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerBlastRadius(filePath)}
              className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 px-3 py-1.5 rounded text-xs font-medium transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">difference</span>
              <span>BlastRadius</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Symbols Bar */}
        {fileInfo.symbols.length > 0 && (
          <div className="px-5 py-2 bg-surface-container-high/50 border-b border-outline-variant flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-[10px]">
            <span className="text-outline uppercase">Symbols:</span>
            {fileInfo.symbols.map((s) => (
              <span
                key={s.name}
                className="px-1.5 py-0.5 rounded bg-surface-container text-tertiary border border-outline-variant truncate"
              >
                {s.kind} {s.name} (L{s.line})
              </span>
            ))}
          </div>
        )}

        {/* Code Content View with line numbers */}
        <div className="flex-1 overflow-auto p-4 bg-surface-container-lowest font-mono text-xs text-on-surface-variant leading-5">
          <div className="min-w-full">
            {lines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-surface-container/50">
                <span className="w-12 text-right pr-4 text-outline select-none opacity-50 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-on-surface whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
