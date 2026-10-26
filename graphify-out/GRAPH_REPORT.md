# Graph Report - EndTermProject  (2026-10-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 358 nodes · 570 edges · 18 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `048e0a1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- client/src/types/index.ts
- server/src/types/index.ts
- cart.service.ts
- server/package.json
- dependencies
- compilerOptions
- client/package.json
- compilerOptions
- demo-repo/package.json
- compilerOptions
- devDependencies
- package.json
- client/tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `CodebaseIndex` - 17 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 15 edges
4. `react` - 14 edges
5. `logInfo()` - 13 edges
6. `compilerOptions` - 12 edges
7. `parseSourceFile()` - 10 edges
8. `buildCodebaseGraph()` - 10 edges
9. `addItemToCart()` - 9 edges
10. `logError()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `HeaderProps` --references--> `CodebaseIndex`  [EXTRACTED]
  client/src/components/Header.tsx → client/src/types/index.ts
- `DependencyGraphViewProps` --references--> `CodebaseIndex`  [EXTRACTED]
  client/src/views/DependencyGraphView.tsx → client/src/types/index.ts
- `RepoSyncViewProps` --references--> `CodebaseIndex`  [EXTRACTED]
  client/src/views/RepoSyncView.tsx → client/src/types/index.ts
- `FeatureExplorerViewProps` --references--> `FeatureExplorerResult`  [EXTRACTED]
  client/src/views/FeatureExplorerView.tsx → client/src/types/index.ts
- `ErrorLabViewProps` --references--> `StackTraceAnalysis`  [EXTRACTED]
  client/src/views/ErrorLabView.tsx → client/src/types/index.ts

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "client/src/types/index.ts"
Cohesion: 0.05
Nodes (34): App(), CodeModalProps, HeaderProps, RepoSelectorModalProps, SidebarProps, api, BlastRadiusResult, CandidateMatch (+26 more)

### Community 1 - "server/src/types/index.ts"
Cohesion: 0.08
Nodes (46): determineFileRole(), hasExportModifier(), isTestFile(), normalizePath(), parseSourceFile(), getLine(), visit(), buildCodebaseGraph() (+38 more)

### Community 2 - "cart.service.ts"
Cohesion: 0.11
Nodes (36): startDemoServer(), Cart, CartItem, Product, AuthSession, User, authMiddleware(), handleLoginRequest() (+28 more)

### Community 3 - "server/package.json"
Cohesion: 0.08
Nodes (24): @types/node, @types/node, description, devDependencies, tsx, @types/adm-zip, @types/cors, @types/express (+16 more)

### Community 4 - "dependencies"
Cohesion: 0.08
Nodes (23): adm-zip, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, typescript, cors (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 6 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, axios, lucide-react, react, react-dom, @xyflow/react, axios, name (+11 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 8 - "demo-repo/package.json"
Cohesion: 0.12
Nodes (15): bcryptjs, jsonwebtoken, dependencies, bcryptjs, express, jsonwebtoken, description, devDependencies (+7 more)

### Community 9 - "compilerOptions"
Cohesion: 0.12
Nodes (15): ES2022, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+7 more)

### Community 10 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, vite (+7 more)

### Community 11 - "package.json"
Cohesion: 0.13
Nodes (14): concurrently, description, devDependencies, concurrently, name, private, scripts, build (+6 more)

## Knowledge Gaps
- **128 isolated node(s):** `RepoSelectorModalProps`, `CandidateMatch`, `DiagnosticWarning`, `GraphEdge`, `ImportInfo` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 154 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `typescript` connect `dependencies` to `demo-repo/package.json`, `server/src/types/index.ts`?**
  _High betweenness centrality (0.291) - this node is a cross-community bridge._
- **Why does `plugins` connect `dependencies` to `client/src/types/index.ts`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `react` connect `client/src/types/index.ts` to `dependencies`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **What connects `RepoSelectorModalProps`, `CandidateMatch`, `DiagnosticWarning` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `client/src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052429667519181586 - nodes in this community are weakly interconnected._
- **Should `server/src/types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08395989974937343 - nodes in this community are weakly interconnected._
- **Should `cart.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11346938775510204 - nodes in this community are weakly interconnected._