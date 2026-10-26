import path from 'path';
import { determineFileRole, normalizePath } from '../analyzer/astParser.js';
import {
  CodebaseIndex,
  DiagnosticWarning,
  FileInfo,
  GraphEdge,
  GraphNode,
  RepoStats,
} from '../types/index.js';

export function buildCodebaseGraph(
  repoName: string,
  branch: string,
  commitSha: string,
  filesMap: Record<string, FileInfo>,
  repoUrl?: string
): CodebaseIndex {
  const allFilePaths = Object.keys(filesMap);
  const edges: GraphEdge[] = [];
  const adjacency: Record<string, string[]> = {};
  const reverseAdjacency: Record<string, string[]> = {};
  const warnings: DiagnosticWarning[] = [];

  for (const fp of allFilePaths) {
    adjacency[fp] = [];
    reverseAdjacency[fp] = [];
  }

  // 1. Resolve imports and build edges
  for (const [sourcePath, fileInfo] of Object.entries(filesMap)) {
    for (const imp of fileInfo.imports) {
      const resolved = resolveImportPath(sourcePath, imp.source, allFilePaths);
      if (resolved) {
        imp.resolvedPath = resolved;
        if (!adjacency[sourcePath].includes(resolved)) {
          adjacency[sourcePath].push(resolved);
        }
        if (!reverseAdjacency[resolved].includes(sourcePath)) {
          reverseAdjacency[resolved].push(sourcePath);
        }

        edges.push({
          id: `${sourcePath}->${resolved}`,
          source: sourcePath,
          target: resolved,
          importedSymbols: imp.specifiers,
        });
      } else if (imp.source.startsWith('.')) {
        warnings.push({
          code: 'UNRESOLVED_RELATIVE_IMPORT',
          message: `Relative import '${imp.source}' from '${sourcePath}' could not be matched.`,
          file: sourcePath,
          line: imp.line,
        });
      }
    }
  }

  // 2. Build GraphNodes
  const nodes: GraphNode[] = allFilePaths.map((fp) => {
    const file = filesMap[fp];
    const baseName = fp.split('/').pop() || fp;
    return {
      id: fp,
      label: baseName,
      path: fp,
      role: determineFileRole(fp, file.isTest, file.extension),
      isTest: file.isTest,
      importsCount: adjacency[fp]?.length || 0,
      importersCount: reverseAdjacency[fp]?.length || 0,
      symbols: file.symbols,
    };
  });

  // 3. Detect Circular Dependencies (Tarjan/DFS cycle detection)
  const cyclesCount = countCycles(adjacency);

  // 4. Compute Languages & Stats
  const stats = computeStats(filesMap, edges.length, cyclesCount);

  return {
    repoName,
    repoUrl,
    branch,
    commitSha,
    analyzedAt: new Date().toISOString(),
    files: filesMap,
    nodes,
    edges,
    adjacency,
    reverseAdjacency,
    stats,
    warnings,
  };
}

export function resolveImportPath(
  currentFile: string,
  importSource: string,
  availablePaths: string[]
): string | undefined {
  if (!importSource.startsWith('.')) {
    // Check if it's an alias like '@/...' or 'src/...'
    const stripped = importSource.replace(/^@\//, 'src/').replace(/^~\//, '');
    const aliasCandidate = matchExtension(stripped, availablePaths);
    if (aliasCandidate) return aliasCandidate;
    return undefined; // external package (e.g. 'express', 'react')
  }

  const currentDir = path.posix.dirname(currentFile);
  const rawTarget = path.posix.normalize(path.posix.join(currentDir, importSource));

  return matchExtension(rawTarget, availablePaths);
}

function matchExtension(target: string, availablePaths: string[]): string | undefined {
  const normalized = normalizePath(target);

  // 1. Exact match (already has extension)
  if (availablePaths.includes(normalized)) return normalized;

  // 1b. TypeScript ESM imports: replace .js with .ts or .tsx
  if (normalized.endsWith('.js')) {
    const tsCandidate = normalized.slice(0, -3) + '.ts';
    if (availablePaths.includes(tsCandidate)) return tsCandidate;
    const tsxCandidate = normalized.slice(0, -3) + '.tsx';
    if (availablePaths.includes(tsxCandidate)) return tsxCandidate;
  }
  if (normalized.endsWith('.jsx')) {
    const tsxCandidate = normalized.slice(0, -4) + '.tsx';
    if (availablePaths.includes(tsxCandidate)) return tsxCandidate;
  }

  // 2. Try common extensions
  const candidates = [
    `${normalized}.ts`,
    `${normalized}.tsx`,
    `${normalized}.js`,
    `${normalized}.jsx`,
    `${normalized}/index.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.js`,
    `${normalized}/index.jsx`,
  ];

  for (const c of candidates) {
    if (availablePaths.includes(c)) return c;
  }

  return undefined;
}

function countCycles(adj: Record<string, string[]>): number {
  const visited: Record<string, number> = {}; // 0: unvisited, 1: visiting, 2: visited
  let cycleCount = 0;

  function dfs(u: string) {
    visited[u] = 1;
    for (const v of adj[u] || []) {
      if (visited[v] === 1) {
        cycleCount++;
      } else if (!visited[v]) {
        dfs(v);
      }
    }
    visited[u] = 2;
  }

  for (const node of Object.keys(adj)) {
    if (!visited[node]) {
      dfs(node);
    }
  }

  return cycleCount;
}

function computeStats(
  filesMap: Record<string, FileInfo>,
  totalDependencies: number,
  cyclesDetected: number
): RepoStats {
  const allFiles = Object.values(filesMap);
  let totalLines = 0;
  let totalSymbols = 0;
  let testSuitesCount = 0;
  const langBytes: Record<string, { count: number; bytes: number }> = {};

  for (const f of allFiles) {
    totalLines += f.content.split('\n').length;
    totalSymbols += f.symbols.length;
    if (f.isTest) testSuitesCount++;

    const ext = f.extension;
    const lang =
      ext === '.ts' || ext === '.tsx'
        ? 'TypeScript'
        : ext === '.js' || ext === '.jsx'
        ? 'JavaScript'
        : ext.replace('.', '').toUpperCase();

    if (!langBytes[lang]) {
      langBytes[lang] = { count: 0, bytes: 0 };
    }
    langBytes[lang].count++;
    langBytes[lang].bytes += f.size;
  }

  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b.bytes, 0) || 1;
  const languages = Object.entries(langBytes)
    .map(([name, data]) => ({
      name,
      percentage: Math.round((data.bytes / totalBytes) * 100),
      fileCount: data.count,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    totalFiles: allFiles.length,
    totalLines,
    totalSymbols,
    totalDependencies,
    testSuitesCount,
    cyclesDetected,
    languages,
  };
}
