import axios from 'axios';
import {
  BlastRadiusResult,
  CodebaseIndex,
  FeatureExplorerResult,
  StackTraceAnalysis,
  TestRecommendation,
} from '../types/index.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000,
});

export async function fetchCurrentIndex(): Promise<CodebaseIndex> {
  const res = await api.get<{ success: boolean; index: CodebaseIndex }>('/repo/current');
  return res.data.index;
}

export async function loadDemoRepo(): Promise<CodebaseIndex> {
  const res = await api.get<{ success: boolean; index: CodebaseIndex }>('/repo/demo');
  return res.data.index;
}

export async function analyzeGitHubRepo(repoUrl: string, branch = 'main'): Promise<CodebaseIndex> {
  const res = await api.post<{ success: boolean; index: CodebaseIndex }>('/repo/analyze', {
    repoUrl,
    branch,
  });
  return res.data.index;
}

export async function queryFeatureExplorer(query: string): Promise<FeatureExplorerResult> {
  const res = await api.post<FeatureExplorerResult & { success: boolean }>('/feature-explorer', {
    query,
  });
  return res.data;
}

export async function calculateBlastRadius(
  targetFile: string,
  maxDepth = 3
): Promise<BlastRadiusResult> {
  const res = await api.post<BlastRadiusResult & { success: boolean }>('/blast-radius', {
    targetFile,
    maxDepth,
  });
  return res.data;
}

export async function fetchTestRecommendations(
  changedFiles: string[]
): Promise<TestRecommendation[]> {
  const res = await api.post<{ success: boolean; recommendations: TestRecommendation[] }>(
    '/test-scout',
    {
      changedFiles,
    }
  );
  return res.data.recommendations;
}

export async function analyzeStackTrace(stackTrace: string): Promise<StackTraceAnalysis> {
  const res = await api.post<StackTraceAnalysis & { success: boolean }>('/error-trace', {
    stackTrace,
  });
  return res.data;
}

export async function syncRepo(): Promise<CodebaseIndex> {
  const res = await api.post<{ success: boolean; index: CodebaseIndex; message: string }>(
    '/repo/sync'
  );
  return res.data.index;
}
