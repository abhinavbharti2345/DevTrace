import React from 'react';
import { CodebaseIndex, TabType } from '../types/index.js';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  index: CodebaseIndex | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, index }) => {
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: 'space_dashboard' },
    {
      id: 'feature-explorer',
      label: 'AI Feature Explorer',
      icon: 'auto_awesome',
      badge: 'NEW',
      badgeColor: 'text-secondary bg-secondary-container/20 border-secondary/30',
    },
    { id: 'dependency-graph', label: 'Dependency Graph', icon: 'hub' },
    { id: 'blast-radius', label: 'BlastRadius Impact', icon: 'difference' },
    { id: 'testscout', label: 'TestScout Matrix', icon: 'science' },
    {
      id: 'error-lab',
      label: 'WhyIsItBroken Lab',
      icon: 'bug_report',
      badge: 'ERR',
      badgeColor: 'text-error bg-error-container/30 border-error/30',
    },
    { id: 'repo-sync', label: 'Repository & Sync', icon: 'sync_saved_locally' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between select-none font-sans">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-[52px] px-4 flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <span className="font-semibold text-base text-on-surface tracking-tight">
              DevTrace
            </span>
          </div>
          <span className="font-mono text-[11px] text-primary bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant">
            v2.4
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between px-4 py-2 text-left transition-colors text-[13px] ${
                  isActive
                    ? 'bg-surface-container-high text-on-surface border-l-2 border-primary font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      item.id === 'feature-explorer' ? 'text-tertiary' : ''
                    } ${isActive ? 'text-primary' : ''}`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer telemetry */}
      <div className="p-3.5 border-t border-outline-variant bg-surface-container-lowest/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] font-medium text-on-surface">Index Synced</span>
          </div>
          <span className="font-mono text-[11px] text-secondary">
            {index?.stats.cyclesDetected === 0 ? '0 cycles' : `${index?.stats.cyclesDetected} cycles`}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-outline">
          <span className="text-[11px]">Indexed symbols</span>
          <span className="text-on-surface font-mono">
            {index ? index.stats.totalSymbols.toLocaleString() : '...'}
          </span>
        </div>
      </div>
    </aside>
  );
};
