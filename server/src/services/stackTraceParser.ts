import { CodebaseIndex, StackFrameMatch, StackTraceAnalysis } from '../types/index.js';

export function parseAndInvestigateStackTrace(
  index: CodebaseIndex,
  rawTrace: string
): StackTraceAnalysis {
  const lines = rawTrace.split('\n');
  const matchedFrames: StackFrameMatch[] = [];
  const affectedModules = new Set<string>();

  // Regex patterns for V8 and Browser stack traces
  // Example 1: at Object.verifyToken (src/auth/jwt.ts:45:12)
  // Example 2: at src/routes/auth.ts:28:9
  // Example 3: Error: Something broke at /app/src/services/cart.ts:50:5
  const v8PatternWithFn = /at\s+([^\s(]+)\s+\((?:.*[\\/])?([^:()]+):(\d+):(\d+)\)/;
  const v8PatternWithoutFn = /at\s+(?:.*[\\/])?([^:()]+):(\d+):(\d+)/;
  const browserPattern = /([^\s@]+)@(?:.*[\\/])?([^:?#]+):(\d+):(\d+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    let fnName: string | undefined;
    let rawFilePath = '';
    let lineNum = 0;
    let colNum = 0;

    const match1 = trimmed.match(v8PatternWithFn);
    if (match1) {
      fnName = match1[1];
      rawFilePath = match1[2];
      lineNum = parseInt(match1[3], 10);
      colNum = parseInt(match1[4], 10);
    } else {
      const match2 = trimmed.match(v8PatternWithoutFn);
      if (match2) {
        rawFilePath = match2[1];
        lineNum = parseInt(match2[2], 10);
        colNum = parseInt(match2[3], 10);
      } else {
        const match3 = trimmed.match(browserPattern);
        if (match3) {
          fnName = match3[1];
          rawFilePath = match3[2];
          lineNum = parseInt(match3[3], 10);
          colNum = parseInt(match3[4], 10);
        }
      }
    }

    if (rawFilePath && lineNum > 0) {
      // Find matching file in our index
      const matchedPath = findMatchingIndexedFile(index, rawFilePath);

      if (matchedPath) {
        const fileInfo = index.files[matchedPath];
        affectedModules.add(matchedPath);

        // Extract snippet (+- 5 lines)
        const fileLines = fileInfo.content.split('\n');
        const startLine = Math.max(1, lineNum - 5);
        const endLine = Math.min(fileLines.length, lineNum + 5);
        const snippetLines = fileLines.slice(startLine - 1, endLine);
        const snippet = snippetLines
          .map((l, idx) => {
            const currLineNum = startLine + idx;
            const prefix = currLineNum === lineNum ? '>> ' : '   ';
            return `${prefix}${currLineNum.toString().padStart(4, ' ')} | ${l}`;
          })
          .join('\n');

        const callers = index.reverseAdjacency[matchedPath] || [];

        matchedFrames.push({
          rawLine: trimmed,
          fileName: rawFilePath,
          resolvedPath: matchedPath,
          line: lineNum,
          column: colNum,
          functionName: fnName,
          snippet,
          snippetStartLine: startLine,
          callers,
        });
      } else {
        matchedFrames.push({
          rawLine: trimmed,
          fileName: rawFilePath,
          line: lineNum,
          column: colNum,
          functionName: fnName,
        });
      }
    }
  }

  // Determine primary error location (first matched frame within repository files)
  const primaryErrorLocation = matchedFrames.find((f) => f.resolvedPath);

  // Generate deterministic hypotheses
  const hypotheses = generateDebuggingHypotheses(rawTrace, primaryErrorLocation, index);

  return {
    rawTrace,
    matchedFrames,
    primaryErrorLocation,
    hypotheses,
    affectedModules: Array.from(affectedModules),
    isFallback: false,
  };
}

function findMatchingIndexedFile(index: CodebaseIndex, rawFileName: string): string | undefined {
  const norm = rawFileName.replace(/\\/g, '/');
  // 1. Exact match
  if (index.files[norm]) return norm;

  // 2. Suffix match (e.g. "src/auth/jwt.ts" matching "auth/jwt.ts" or "jwt.ts")
  for (const indexedPath of Object.keys(index.files)) {
    if (indexedPath.endsWith(norm) || norm.endsWith(indexedPath)) {
      return indexedPath;
    }
    const indexedBase = indexedPath.split('/').pop();
    const rawBase = norm.split('/').pop();
    if (indexedBase && rawBase && indexedBase === rawBase) {
      return indexedPath;
    }
  }

  return undefined;
}

function generateDebuggingHypotheses(
  rawTrace: string,
  primaryLoc: StackFrameMatch | undefined,
  index: CodebaseIndex
): string[] {
  const hypotheses: string[] = [];

  const lower = rawTrace.toLowerCase();
  if (lower.includes('cannot read properties of undefined') || lower.includes('cannot read property')) {
    hypotheses.push(
      `Unchecked property access on undefined/null object. Check if parameter or asynchronous API return value is missing or unawaited.`
    );
  }
  if (lower.includes('typeerror')) {
    hypotheses.push(
      `Type contract violation at runtime. Verify that input types match expected schema arguments.`
    );
  }
  if (lower.includes('jwt') || lower.includes('token') || lower.includes('unauthorized')) {
    hypotheses.push(
      `Authentication or token validation failure. Inspect Authorization header parsing or token expiration logic.`
    );
  }
  if (lower.includes('econnrefused') || lower.includes('fetch failed') || lower.includes('network')) {
    hypotheses.push(
      `Network connectivity or downstream service unreachable. Check environment variable configurations (e.g. database/API host URL).`
    );
  }

  if (primaryLoc && primaryLoc.resolvedPath) {
    const file = index.files[primaryLoc.resolvedPath];
    if (file && primaryLoc.callers && primaryLoc.callers.length > 0) {
      hypotheses.push(
        `File '${primaryLoc.resolvedPath}' is invoked by ${primaryLoc.callers.length} downstream caller(s): ${primaryLoc.callers
          .slice(0, 3)
          .join(', ')}. Review input arguments passed from those callers.`
      );
    }
  }

  if (hypotheses.length === 0) {
    hypotheses.push(
      `Inspect the code context around line ${primaryLoc?.line || 'N/A'} for unexpected state transitions or missing null checks.`
    );
  }

  return hypotheses;
}
