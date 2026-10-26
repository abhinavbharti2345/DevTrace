import React, { useEffect, useState } from 'react';
import { CodeModal } from './components/CodeModal.js';
import { Header } from './components/Header.js';
import { RepoSelectorModal } from './components/RepoSelectorModal.js';
import { Sidebar } from './components/Sidebar.js';
import * as api from './services/api.js';
import {
  BlastRadiusResult,
  CodebaseIndex,
  FeatureExplorerResult,
  StackTraceAnalysis,
  TabType,
  TestRecommendation,
} from './types/index.js';
import { BlastRadiusView } from './views/BlastRadiusView.js';
import { DependencyGraphView } from './views/DependencyGraphView.js';
import { ErrorLabView } from './views/ErrorLabView.js';
import { FeatureExplorerView } from './views/FeatureExplorerView.js';
import { OverviewView } from './views/OverviewView.js';
import { RepoSyncView } from './views/RepoSyncView.js';
import { TestScoutView } from './views/TestScoutView.js';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [index, setIndex] = useState<CodebaseIndex | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | undefined>();
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [repoModalError, setRepoModalError] = useState<string | undefined>();

  // Feature Explorer state
  const [featureResult, setFeatureResult] = useState<FeatureExplorerResult | null>(null);
  const [featureQuery, setFeatureQuery] = useState('');

  // BlastRadius state
  const [blastResult, setBlastResult] = useState<BlastRadiusResult | null>(null);
  const [blastTargetFile, setBlastTargetFile] = useState('');

  // TestScout state
  const [testRecommendations, setTestRecommendations] = useState<TestRecommendation[]>([]);

  // ErrorLab state
  const [errorAnalysis, setErrorAnalysis] = useState<StackTraceAnalysis | null>(null);

  // Graph state
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  // Code inspection modal state
  const [viewingFilePath, setViewingFilePath] = useState<string | null>(null);

  // Load current codebase index on mount
  useEffect(() => {
    async function init() {
      try {
        const data = await api.fetchCurrentIndex();
        setIndex(data);
      } catch (err) {
        console.error('Error fetching initial repository index:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, []);

  // Handlers
  const handleConnectGitHub = async (url: string, branch: string) => {
    setIsActionLoading(true);
    setRepoModalError(undefined);
    try {
      const newIndex = await api.analyzeGitHubRepo(url, branch);
      setIndex(newIndex);
      setIsRepoModalOpen(false);
      setFeatureResult(null);
      setBlastResult(null);
      setTestRecommendations([]);
      setErrorAnalysis(null);
      setHighlightedNodes([]);
      setCurrentTab('overview');
    } catch (err) {
      setRepoModalError((err as Error).message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsActionLoading(true);
    setRepoModalError(undefined);
    try {
      const demoIndex = await api.loadDemoRepo();
      setIndex(demoIndex);
      setIsRepoModalOpen(false);
      setFeatureResult(null);
      setBlastResult(null);
      setTestRecommendations([]);
      setErrorAnalysis(null);
      setHighlightedNodes([]);
      setCurrentTab('overview');
    } catch (err) {
      setRepoModalError((err as Error).message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(undefined);
    try {
      const updated = await api.syncRepo();
      setIndex(updated);
      setSyncMessage('Repository synced and AST indices refreshed.');
    } catch (err) {
      setSyncMessage(`Sync failed: ${(err as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchFeature = async (query: string) => {
    setIsActionLoading(true);
    setFeatureQuery(query);
    try {
      const res = await api.queryFeatureExplorer(query);
      setFeatureResult(res);
    } catch (err) {
      console.error('Feature explorer error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCalculateBlastRadius = async (targetFile: string, maxDepth: number) => {
    setIsActionLoading(true);
    setBlastTargetFile(targetFile);
    try {
      const res = await api.calculateBlastRadius(targetFile, maxDepth);
      setBlastResult(res);
    } catch (err) {
      console.error('BlastRadius error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRunTestScout = async (changedFiles: string[]) => {
    setIsActionLoading(true);
    try {
      const recs = await api.fetchTestRecommendations(changedFiles);
      setTestRecommendations(recs);
    } catch (err) {
      console.error('TestScout error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAnalyzeTrace = async (trace: string) => {
    setIsActionLoading(true);
    try {
      const analysis = await api.analyzeStackTrace(trace);
      setErrorAnalysis(analysis);
    } catch (err) {
      console.error('Error trace error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleInspectInGraph = (filePath: string) => {
    setHighlightedNodes([filePath]);
    setCurrentTab('dependency-graph');
  };

  const handleVisualizeSubGraph = (nodes: string[]) => {
    setHighlightedNodes(nodes);
    setCurrentTab('dependency-graph');
  };

  const handleTriggerBlastRadiusFromNode = (filePath: string) => {
    setBlastTargetFile(filePath);
    handleCalculateBlastRadius(filePath, 3);
    setCurrentTab('blast-radius');
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center font-sans space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold text-on-surface">Initializing DevTrace...</h2>
          <p className="text-xs text-outline">Loading and analyzing codebase AST</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} index={index} />

      {/* Main Content Area (offset by sidebar width 240px / 60) */}
      <div className="pl-60 flex-1 flex flex-col">
        {/* Top Header Bar */}
        <Header
          index={index}
          onSync={handleSync}
          onOpenRepoSelector={() => setIsRepoModalOpen(true)}
          onQuickSearch={() => setCurrentTab('feature-explorer')}
          isSyncing={isSyncing}
        />

        {/* Tab Content Panes */}
        <main className="w-full pt-[52px] bg-surface min-h-[calc(100vh-52px)] flex-1">
          {currentTab === 'overview' && index && (
            <OverviewView
              index={index}
              onNavigateTab={setCurrentTab}
              onSelectFile={(f) => setViewingFilePath(f)}
              onRunSemanticQuery={(q) => {
                handleSearchFeature(q);
                setCurrentTab('feature-explorer');
              }}
            />
          )}

          {currentTab === 'feature-explorer' && (
            <FeatureExplorerView
              onSearch={handleSearchFeature}
              result={featureResult}
              isLoading={isActionLoading}
              onInspectInGraph={handleInspectInGraph}
              onViewFile={(f) => setViewingFilePath(f)}
              initialQuery={featureQuery}
            />
          )}

          {currentTab === 'dependency-graph' && index && (
            <DependencyGraphView
              index={index}
              highlightedNodes={highlightedNodes}
              onSelectFile={(f) => setViewingFilePath(f)}
              onTriggerBlastRadius={handleTriggerBlastRadiusFromNode}
            />
          )}

          {currentTab === 'blast-radius' && index && (
            <BlastRadiusView
              index={index}
              result={blastResult}
              isLoading={isActionLoading}
              onCalculateBlastRadius={handleCalculateBlastRadius}
              onVisualizeInGraph={handleVisualizeSubGraph}
              onViewFile={(f) => setViewingFilePath(f)}
              initialTargetFile={blastTargetFile}
            />
          )}

          {currentTab === 'testscout' && index && (
            <TestScoutView
              index={index}
              onRunTestScout={handleRunTestScout}
              recommendations={testRecommendations}
              isLoading={isActionLoading}
              onViewFile={(f) => setViewingFilePath(f)}
            />
          )}

          {currentTab === 'error-lab' && (
            <ErrorLabView
              onAnalyzeTrace={handleAnalyzeTrace}
              analysis={errorAnalysis}
              isLoading={isActionLoading}
              onViewFile={(f) => setViewingFilePath(f)}
            />
          )}

          {currentTab === 'repo-sync' && index && (
            <RepoSyncView
              index={index}
              onSync={handleSync}
              onOpenRepoSelector={() => setIsRepoModalOpen(true)}
              isSyncing={isSyncing}
              syncMessage={syncMessage}
            />
          )}
        </main>
      </div>

      {/* Repository Selector Modal */}
      <RepoSelectorModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        onConnectGitHub={handleConnectGitHub}
        onLoadDemo={handleLoadDemo}
        isLoading={isActionLoading}
        errorMessage={repoModalError}
      />

      {/* Code Inspection Modal */}
      <CodeModal
        filePath={viewingFilePath}
        fileInfo={viewingFilePath && index ? index.files[viewingFilePath] : null}
        onClose={() => setViewingFilePath(null)}
        onTriggerBlastRadius={handleTriggerBlastRadiusFromNode}
      />
    </div>
  );
};

export default App;

