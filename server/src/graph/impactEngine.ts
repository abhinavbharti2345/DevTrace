import { BlastRadiusResult, CodebaseIndex, TestRecommendation } from '../types/index.js';

export function calculateBlastRadius(
  index: CodebaseIndex,
  targetFile: string,
  maxDepth = 3
): BlastRadiusResult {
  const directDependents: string[] = [];
  const transitiveDependents: string[] = [];
  const visited = new Set<string>();
  const distanceMap: Record<string, number> = {};

  visited.add(targetFile);
  distanceMap[targetFile] = 0;

  // BFS Queue: [filePath, depth]
  const queue: Array<{ file: string; depth: number }> = [{ file: targetFile, depth: 0 }];

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;

    const importers = index.reverseAdjacency[file] || [];
    for (const importer of importers) {
      if (!visited.has(importer)) {
        visited.add(importer);
        const nextDepth = depth + 1;
        distanceMap[importer] = nextDepth;

        if (nextDepth === 1) {
          directDependents.push(importer);
        } else {
          transitiveDependents.push(importer);
        }

        queue.push({ file: importer, depth: nextDepth });
      }
    }
  }

  // Find affected tests
  const affectedTests = findAffectedTests(index, [targetFile], distanceMap);

  // Compute Impact Severity Score
  // Score formula: (Direct * 3) + (Transitive * 1.5) + (AffectedTests * 1)
  const impactScore = Math.round(
    directDependents.length * 3 + transitiveDependents.length * 1.5 + affectedTests.length
  );

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (impactScore > 25 || directDependents.length >= 8) {
    severity = 'CRITICAL';
  } else if (impactScore >= 12 || directDependents.length >= 4) {
    severity = 'HIGH';
  } else if (impactScore >= 4 || directDependents.length >= 1) {
    severity = 'MEDIUM';
  }

  const affectedSubGraphNodes = Array.from(visited);

  return {
    targetFile,
    directDependents,
    transitiveDependents,
    affectedSubGraphNodes,
    affectedTests,
    impactScore,
    severity,
  };
}

export function recommendTestsForChanges(
  index: CodebaseIndex,
  changedFiles: string[]
): TestRecommendation[] {
  const distanceMap: Record<string, number> = {};
  const visited = new Set<string>();

  for (const changed of changedFiles) {
    visited.add(changed);
    distanceMap[changed] = 0;

    const queue: Array<{ file: string; depth: number }> = [{ file: changed, depth: 0 }];
    while (queue.length > 0) {
      const { file, depth } = queue.shift()!;
      if (depth >= 3) continue;

      const importers = index.reverseAdjacency[file] || [];
      for (const imp of importers) {
        if (!visited.has(imp)) {
          visited.add(imp);
          const nextDepth = depth + 1;
          distanceMap[imp] = nextDepth;
          queue.push({ file: imp, depth: nextDepth });
        }
      }
    }
  }

  return findAffectedTests(index, changedFiles, distanceMap);
}

function findAffectedTests(
  index: CodebaseIndex,
  originFiles: string[],
  distanceMap: Record<string, number>
): TestRecommendation[] {
  const recommendations: TestRecommendation[] = [];
  const testFiles = Object.values(index.files).filter((f) => f.isTest);

  for (const t of testFiles) {
    const testPath = t.path;
    const distance = distanceMap[testPath];

    if (distance !== undefined && distance > 0) {
      // Test is reachable in the reverse graph!
      const priority = distance === 1 ? 'HIGH' : distance === 2 ? 'MEDIUM' : 'LOW';
      const reason =
        distance === 1
          ? `Directly tests or imports modified module(s)`
          : `Imports a module affected by the change (Graph distance: ${distance})`;

      recommendations.push({
        testFile: testPath,
        priority,
        distance,
        reason,
        testRunCommand: `npx vitest run ${testPath}`,
      });
    } else {
      // Heuristic: check if test file name matches the origin file
      for (const origin of originFiles) {
        const originBase = origin.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
        const cleanedBase = originBase.replace(/\.(service|controller|route|routes|model|util|helper|component)$/i, '');
        if (
          (originBase && testPath.includes(originBase)) ||
          (cleanedBase && cleanedBase.length > 2 && testPath.includes(cleanedBase))
        ) {
          recommendations.push({
            testFile: testPath,
            priority: 'HIGH',
            distance: 1,
            reason: `Matches filename convention for '${origin}'`,
            testRunCommand: `npx vitest run ${testPath}`,
          });
          break;
        }
      }
    }
  }

  // Deduplicate and sort by priority (HIGH first), then distance
  const seen = new Set<string>();
  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  return recommendations
    .filter((r) => {
      if (seen.has(r.testFile)) return false;
      seen.add(r.testFile);
      return true;
    })
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.distance - b.distance);
}
