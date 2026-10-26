import { describe, expect, it } from 'vitest';
import { parseSourceFile } from '../analyzer/astParser.js';
import { buildCodebaseGraph } from '../graph/graphBuilder.js';
import { calculateBlastRadius, recommendTestsForChanges } from '../graph/impactEngine.js';
import { loadBundledDemoRepo } from '../ingestion/demoRepoLoader.js';
import { parseAndInvestigateStackTrace } from '../services/stackTraceParser.js';

describe('DevTrace Backend Engines', () => {
  it('parses TypeScript AST, extracting imports and exported symbols', () => {
    const code = `
      import { logInfo } from './logger';
      import express, { Request, Response } from 'express';

      export interface UserPayload {
        id: string;
      }

      export function authenticateUser(token: string): boolean {
        logInfo('Auth triggered');
        return token === 'secret';
      }
    `;

    const parsed = parseSourceFile('src/auth.ts', code);
    expect(parsed.path).toBe('src/auth.ts');
    expect(parsed.symbols.some((s) => s.name === 'authenticateUser' && s.isExported)).toBe(true);
    expect(parsed.symbols.some((s) => s.name === 'UserPayload' && s.kind === 'interface')).toBe(true);
    expect(parsed.imports.some((i) => i.source === './logger')).toBe(true);
  });

  it('builds dependency graph and reverse adjacency correctly', () => {
    const fileA = parseSourceFile('src/a.ts', `import { b } from './b'; export const a = 1;`);
    const fileB = parseSourceFile('src/b.ts', `export const b = 2;`);

    const index = buildCodebaseGraph('test-repo', 'main', 'sha1', {
      'src/a.ts': fileA,
      'src/b.ts': fileB,
    });

    expect(index.nodes.length).toBe(2);
    expect(index.adjacency['src/a.ts']).toContain('src/b.ts');
    expect(index.reverseAdjacency['src/b.ts']).toContain('src/a.ts');
  });

  it('loads bundled ShopSphere demo repo with complete integrity', () => {
    const index = loadBundledDemoRepo();
    expect(index.repoName).toBe('shopsphere-api');
    expect(index.stats.totalFiles).toBeGreaterThan(5);
    expect(index.stats.testSuitesCount).toBeGreaterThan(0);
    expect(index.nodes.some((n) => n.path.includes('auth.service.ts'))).toBe(true);
    expect(index.nodes.some((n) => n.isTest)).toBe(true);
  });

  it('computes BFS BlastRadius correctly when modifying auth service', () => {
    const index = loadBundledDemoRepo();
    const authServicePath = Object.keys(index.files).find((f) => f.includes('auth.service.ts'))!;
    expect(authServicePath).toBeDefined();

    const blast = calculateBlastRadius(index, authServicePath, 3);
    expect(blast.targetFile).toBe(authServicePath);
    expect(blast.directDependents.length).toBeGreaterThan(0);
    expect(blast.affectedTests.length).toBeGreaterThan(0);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(blast.severity);
  });

  it('recommends tests via TestScout for changed files', () => {
    const index = loadBundledDemoRepo();
    const cartServicePath = Object.keys(index.files).find((f) => f.includes('cart.service.ts'))!;
    const recommendations = recommendTestsForChanges(index, [cartServicePath]);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r) => r.testFile.includes('cart.test.ts'))).toBe(true);
    expect(recommendations[0].testRunCommand).toContain('vitest');
  });

  it('parses stack traces and maps project frames with line context', () => {
    const index = loadBundledDemoRepo();
    const trace = `
Error: Invalid JWT format
    at verifyToken (src/utils/jwt.ts:13:13)
    at Object.validateSession (src/services/auth.service.ts:62:10)
    at authMiddleware (src/routes/auth.routes.ts:24:10)
    `;

    const analysis = parseAndInvestigateStackTrace(index, trace);
    expect(analysis.matchedFrames.length).toBeGreaterThan(0);
    expect(analysis.primaryErrorLocation).toBeDefined();
    expect(analysis.primaryErrorLocation?.snippet).toContain('>>');
    expect(analysis.hypotheses.length).toBeGreaterThan(0);
  });
});
