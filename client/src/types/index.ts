export type TabType =
  | 'overview'
  | 'feature-explorer'
  | 'dependency-graph'
  | 'blast-radius'
  | 'testscout'
  | 'error-lab'
  | 'repo-sync';

export type FileRole = 'component' | 'route' | 'service' | 'util' | 'test' | 'config' | 'model';

export interface SymbolInfo {
  name: string;
  kind: string;
  line: number;
  isExported: boolean;
}

export interface ImportInfo {
  source: string;
  resolvedPath?: string;
  specifiers: string[];
  isDefault: boolean;
  line: number;
}

export interface FileInfo {
  path: string;
  extension: string;
  size: number;
  isTest: boolean;
  symbols: SymbolInfo[];
  imports: ImportInfo[];
  content: string;
}

export interface GraphNode {
  id: string;
  label: string;
  path: string;
  role: FileRole;
  isTest: boolean;
  importsCount: number;
  importersCount: number;
  symbols: SymbolInfo[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  importedSymbols: string[];
}

export interface DiagnosticWarning {
  code: string;
  message: string;
  file?: string;
  line?: number;
}

export interface RepoStats {
  totalFiles: number;
  totalLines: number;
  totalSymbols: number;
  totalDependencies: number;
  testSuitesCount: number;
  cyclesDetected: number;
  languages: { name: string; percentage: number; fileCount: number }[];
}

export interface CodebaseIndex {
  repoName: string;
  repoUrl?: string;
  branch: string;
  commitSha: string;
  analyzedAt: string;
  files: Record<string, FileInfo>;
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacency: Record<string, string[]>;
  reverseAdjacency: Record<string, string[]>;
  stats: RepoStats;
  warnings: DiagnosticWarning[];
}

export interface CandidateMatch {
  file: string;
  score: number;
  matchedSymbols: string[];
  matchedImports: string[];
  snippet: string;
  line: number;
  relevanceReason: string;
}

export interface FeatureExplorerResult {
  query: string;
  candidateFiles: CandidateMatch[];
  aiExplanation: string;
  isFallback: boolean;
  traversalNodes: string[];
}

export interface TestRecommendation {
  testFile: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  distance: number;
  reason: string;
  testRunCommand: string;
}

export interface BlastRadiusResult {
  targetFile: string;
  directDependents: string[];
  transitiveDependents: string[];
  affectedSubGraphNodes: string[];
  affectedTests: TestRecommendation[];
  impactScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface StackFrameMatch {
  rawLine: string;
  fileName: string;
  resolvedPath?: string;
  line: number;
  column: number;
  functionName?: string;
  snippet?: string;
  snippetStartLine?: number;
  callers?: string[];
}

export interface StackTraceAnalysis {
  rawTrace: string;
  matchedFrames: StackFrameMatch[];
  primaryErrorLocation?: StackFrameMatch;
  hypotheses: string[];
  affectedModules: string[];
  isFallback: boolean;
}
