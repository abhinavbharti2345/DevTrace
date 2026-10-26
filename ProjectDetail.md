BRO 🔥 Let's lock in the complete vision for DevTrace. We're building something that can feel like a real developer product, not just another AI chatbot wrapped in a dashboard.

This is the consolidated project specification, refined to guarantee exceptional engineering depth, bulletproof reliability, and flawless evaluator experience within our deadline.

[BISO — Your Codebase's Immune System](https://images.openai.com/static-rsc-4/wtOGAq36g_1aovmLjaPksmYG0MKT-82-n9L_0WHxw07Q4VhG7Y420HkNA91rlUK-FZTvzm2f-73pkPd6JwW53TZ2X-zctGegrabisnFjci_vHtel0JxdBARNeS-Yk2j1t8OlYAucSeOFJh2mEoMfxVhXh3XDcLmXwGuqUE2WMfk?purpose=inline)

[bugimmunesystem.com](https://bugimmunesystem.com/?utm_source=chatgpt.com)

# DevTrace

**AI-powered codebase intelligence, dependency graph, and change-impact analysis platform.**

- 🧠 **AI-Assisted & Grounded**: Zero hallucinations; AI only explains verified AST evidence.
- 🐙 **GitHub-Integrated + 1-Click Demo**: Live public repo scanner with rate-limit-proof bundled sample app.
- ⚡ **Lightweight AST Engine**: Sub-second syntactic analysis via TypeScript Compiler API (`ts.createSourceFile`).
- 🕸️ **Interactive Graph Visualizer**: Interactive module relationships and transitive blast radius via React Flow.
- 🛡️ **Deterministic Evaluation**: Pure graph algorithms (BFS, reverse dependency maps, stack-trace frame mapping).

---

## 1. Project Vision & Core Problem

Developers spend hours navigating unfamiliar codebases: hunting through folders, tracing imports, guessing what might break when touching a shared file, figuring out which tests to run, and deciphering cryptic runtime stack traces.

Generic AI coding assistants frequently hallucinate file locations and non-existent functions because they lack a deterministic knowledge graph of the repository.

**DevTrace bridges this gap**: It extracts the exact syntactic AST and module import graph from the codebase first, and uses AI *strictly* as an interpretive layer over that ground-truth data.

### The Five Core Questions DevTrace Answers:
1. **Feature Discovery**: Where is this feature implemented across frontend, backend, and utility modules?
2. **Code Understanding**: How do these specific files and exports connect?
3. **Change Impact (BlastRadius)**: If I modify file $X$, what modules are directly or transitively affected?
4. **Test Selection (TestScout)**: Which test suites specifically cover the affected code paths?
5. **Error Investigation (WhyIsItBroken)**: Given a runtime stack trace, which repo files are responsible and what callers feed into them?

---

## 2. Complete End-to-End User Journey

```text
[ Connect Repo / Load Demo ] 
        ↓
[ Syntactic AST Analysis & Graph Construction (sub-second) ]
        ↓
  ┌───────────────────┬───────────────────┬───────────────────┐
  ↓                   ↓                   ↓                   ↓
[ AI Feature ]     [ Dependency ]      [ BlastRadius ]    [ WhyIsItBroken ]
[ Explorer   ]     [ Graph View ]      [ & TestScout ]    [ Error Lab     ]
  └───────────────────┴───────────────────┴───────────────────┘
        ↓
[ Sync Changes / Commit Tracking / Refresh Analysis ]
```

- **Step 1 — Connect Codebase**: Paste a public GitHub repo URL (e.g. `expressjs/cors` or your own repo) OR click **"Load Demo Codebase (ShopSphere Auth & Cart)"** for instantaneous evaluation with zero API limits.
- **Step 2 — Build Knowledge Index**: The server streams the zipball into memory, filters supported extensions (`.js`, `.jsx`, `.ts`, `.tsx`), parses ASTs, and builds the directed dependency graph.
- **Step 3 — Query a Feature**: Ask *"Where is user authentication and session validation handled?"* The system performs keyword/symbol ranking, grabs the top 5 relevant files with call evidence, and enriches it with grounded AI explanations and citations.
- **Step 4 — Evaluate BlastRadius & Tests**: Select any file (or simulated modified files). DevTrace traverses the reverse dependency graph using BFS to highlight direct vs transitive impact, and ranks test suites by graph proximity.
- **Step 5 — Investigate Runtime Errors**: Paste a stack trace. The Error Lab resolves stack frames against indexed files, extracts lines with code context, and surfaces potential bug triggers and caller paths.
- **Step 6 — Sync Repository**: Click *Sync Repository* to check remote commit SHAs, re-fetch changed files, and refresh all derived graph states seamlessly.

---

## 3. The Five Core Functional Modules

### Module 1 — AI Feature Explorer (Signature Feature)
- **Problem**: Finding code across 200+ files by manual keyword search misses semantic connections and architectural context.
- **Deterministic 2-Stage Pipeline**:
  - **Stage 1 (AST Symbol & Graph Ranking)**: Matches search tokens against file paths, exported symbol names (functions, classes, interfaces), import tokens, and comments. Computes an initial candidate score.
  - **Stage 2 (LLM Enrichment)**: Passes only the top 5 candidate snippets + direct dependency summaries into the Gemini LLM with a strict JSON schema. The model produces file-by-file explanations and source citations.
  - **Stage 3 (Graceful Fallback)**: If the LLM key is absent or quota is exceeded, the UI displays the ranked candidate list with badge *"Ranked via AST Symbol & Graph Analysis"*—the workflow never crashes.
- **UI Deliverables**: Ranked cards with match badges, exported symbol tags, clickable file previews with line numbers, and an *"Inspect in Graph"* action.

### Module 2 — Interactive Dependency Graph
- **Graph Modeling**:
  - Direct graph: $E = (A \to B)$ where file $A$ imports module $B$.
  - Circular dependency detection via Depth-First Search (DFS) with recursion stack tracking.
  - Node categorization: Component (`.jsx`/`.tsx`), Route/Controller, Service/Model, Utility, or Test.
- **UI Deliverables**:
  - Interactive React Flow canvas with custom nodes (badges for file type, import count, export count).
  - Search & filter by directory or file type.
  - Click any node to open file details, direct dependencies, and direct importers.
  - Dynamic visual highlighting for Feature Explorer results or BlastRadius targets.

### Module 3 — BlastRadius: Change Impact Analysis
- **Core Engineering Algorithm**:
  - Construct reverse adjacency list $E_{rev} = (B \to A)$, meaning changes in $B$ can break $A$.
  - Given a target file $T$, execute **Breadth-First Search (BFS)**:
    - **Tier 1 (Direct Impact)**: Immediate callers ($dist = 1$).
    - **Tier 2 (Transitive Impact)**: Downstream dependents ($dist \ge 2$, capped at depth 4 to prevent infinite loops).
  - Calculate **Impact Severity Score**: $\text{Score} = (\text{Direct Count} \times 2) + (\text{Transitive Count}) + (\text{Shared Utilities Weight})$.
- **UI Deliverables**:
  - Interactive file selector or simulated git diff input.
  - Split view of Direct Dependents vs Transitive Dependents.
  - Visual subgraph isolation (dimming unrelated nodes, highlighting affected blast radius).

### Module 4 — TestScout: Test Selection & Priority Matrix
- **Algorithm**:
  - Identifies test files using path heuristics: `*.test.*`, `*.spec.*`, `__tests__/*`.
  - Determines which test files import the changed file directly (Priority: **HIGH**).
  - Determines which test files import any transitive dependents of the changed file (Priority: **MEDIUM**).
  - Flags untested code paths (Priority: **WARNING: No Direct Tests Found**).
- **UI Deliverables**:
  - Ranked test recommendation list with exact import trail explanations (e.g. `authService.test.ts` $\to$ imports `authService.ts`).
  - One-click copy for test command (e.g. `npx vitest run src/services/auth.test.ts`).

### Module 5 — WhyIsItBroken: Error Investigation Lab
- **Workflow**:
  1. User pastes a raw stack trace (Node.js V8 format, browser format, or Python format).
  2. **Regex Frame Parser**: Extracts file path, line number, column, and caller function name.
  3. **Path Normalizer**: Resolves relative/absolute stack frame paths against the repository tree.
  4. **Code Context Extractor**: Retrieves snippet with $\pm 5$ surrounding lines and highlights the error line.
  5. **Caller Traversal**: Queries dependency graph to find what modules import/call this file.
  6. **Hypothesis Generator**: Uses AST call patterns + LLM prompt to propose 2–3 actionable root-cause hypotheses.

---

## 4. Ingestion & Sync Engine

To ensure rock-solid stability and prevent GitHub rate limits:

1. **Dual Ingestion Mode**:
   - **Mode A: 1-Click Bundled Demo Repo ("ShopSphere")**:
     - Pre-bundled in `server/demo-repo/` containing a full-stack TypeScript app (Express API, JWT auth, shopping cart service, React UI components, Vitest test suites).
     - Instantly loads in **< 100ms** with zero internet dependency.
   - **Mode B: Public GitHub Repository**:
     - User inputs `https://github.com/owner/repo` and branch (default: `main`/`master`).
     - Downloads the zipball directly (`api.github.com/repos/{owner}/{repo}/zipball/{branch}`).
     - Unpacks via `adm-zip` in memory or temp dir.
     - Enforces guardrails: Max 150 source files, max 5MB total size, ignores `node_modules`, `.git`, dist, and binaries.
2. **Commit Tracking & Sync Workflow**:
   - Queries GitHub commit API to store the latest commit SHA.
   - User clicks **"Sync Repository"**: Compares latest remote SHA with active analyzed SHA.
   - If changed, triggers rescan and surfaces what files were added, modified, or removed.

---

## 5. Technical Architecture & Tech Stack

A unified **modular monolith** with a TypeScript frontend and backend:

```text
EndTermProject/
├── client/                     # Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── RepoSelector.tsx
│   │   │   ├── FeatureExplorer.tsx
│   │   │   ├── DependencyGraph.tsx   # React Flow canvas
│   │   │   ├── BlastRadiusView.tsx
│   │   │   ├── TestScoutView.tsx
│   │   │   ├── ErrorLabView.tsx
│   │   │   └── CodePreviewModal.tsx
│   │   ├── hooks/              # State & query hooks
│   │   ├── types/              # Graph, AST, and API contract types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── server/                     # Backend API & Analysis Engine
│   ├── src/
│   │   ├── analyzer/
│   │   │   ├── astParser.ts          # ts.createSourceFile AST extractor
│   │   │   └── symbolExtractor.ts    # Functions, classes, exports
│   │   ├── graph/
│   │   │   ├── graphBuilder.ts       # Directed graph + cycle detector
│   │   │   └── impactEngine.ts       # BFS BlastRadius & TestScout logic
│   │   ├── ingestion/
│   │   │   ├── githubFetcher.ts      # Zipball stream downloader & limiter
│   │   │   └── demoRepoLoader.ts     # Instant 1-click sample loader
│   │   ├── services/
│   │   │   ├── aiService.ts          # Gemini LLM grounder + JSON schema
│   │   │   ├── fallbackRanker.ts     # Deterministic keyword/symbol search
│   │   │   └── stackTraceParser.ts   # Regex V8 frame resolver
│   │   ├── routes/                   # Clean REST endpoints
│   │   └── index.ts                  # Express server entry
│   ├── demo-repo/                    # Bundled ShopSphere sample app
│   └── package.json
├── README.md
└── END_TERM_PROJECT_GUIDELINES.md
```

### Proposed Technology Stack

| Layer | Technology | Engineering Justification |
|---|---|---|
| **Frontend Framework** | React 18, Vite, TypeScript | Fast development, modular components, full type safety. |
| **Styling & Theme** | Tailwind CSS + Lucide Icons | Polished dark-mode developer UI, zero CSS bloat. |
| **Graph Visualizer** | React Flow (`@xyflow/react`) | Industry-standard DAG interactive canvas with zoom/pan and custom nodes. |
| **Backend Server** | Node.js, Express, TypeScript | Fast I/O, native JS/TS ecosystem compatibility. |
| **AST Parser** | TypeScript Compiler API (`typescript`) | Syntactic AST traversal via `ts.createSourceFile` (sub-millisecond per file). |
| **Archive Ingestion** | `adm-zip` + `axios` | In-memory zipball extraction without external OS dependencies. |
| **AI Grounding** | `@google/genai` (Gemini 2.5/Flash) | Structured JSON output for grounded explanations. |
| **Testing** | Vitest | Unit tests for AST parser, BFS traversal, and stack trace parsing. |
| **Deployment** | Render / Vercel / Railway | Publicly accessible URL with single-command start. |

---

## 6. REST API Contract

- `POST /api/repo/analyze`: Ingests GitHub URL + branch OR triggers sample repo; returns repo metadata, file tree, and summary.
- `GET /api/repo/demo`: Instantly loads and indexes the bundled ShopSphere sample app.
- `GET /api/graph`: Returns nodes (files, types, sizes) and directed edges (import connections).
- `POST /api/feature-explorer`: Body `{ query }` $\to$ Returns ranked candidate files, AST symbol matches, and AI explanation.
- `POST /api/blast-radius`: Body `{ targetFile, maxDepth }` $\to$ Returns direct dependents, transitive dependents, and severity score.
- `POST /api/test-scout`: Body `{ changedFiles: [] }` $\to$ Returns ranked test recommendations with graph distances.
- `POST /api/error-trace`: Body `{ stackTrace }` $\to$ Returns parsed frames, matched repo files, code context snippets, and hypotheses.
- `POST /api/repo/sync`: Checks remote commit SHA against active commit; returns diff and updates index if modified.

---

## 7. Rubric Alignment & Scoring Strategy

| Rubric Area | Weight | How DevTrace Dominates This Criterion |
|---|---:|---|
| **Problem & Product Understanding** | 10% | Clear developer problem (code comprehension & change fear); solves 5 tangible questions. |
| **Core Product Implementation** | 25% | All 5 modules working end-to-end on both public GitHub repos and 1-click demo app. |
| **Engineering & Application Logic** | 20% | Deterministic AST parsing, BFS reverse impact propagation, cycle detection, stack trace parser. |
| **Architecture & Decisions** | 15% | Clean monorepo, typed API contracts, in-memory graph index, fallback-shielded AI. |
| **UX & Reliability** | 10% | Dark-themed IDE aesthetic, loading/error states, instant demo button, no blank screens. |
| **Code Quality & Git** | 10% | Modular TypeScript, unit tests for core algorithms, meaningful progressive Git commits. |
| **Deployment & Documentation** | 10% | Public deployment, complete README with architecture diagrams, and 3–5 min video demo. |

---

## 8. Explicit Scope & Timeline Strategy (34-Hour Countdown)

### Included in MVP (Must Have & Locked):
- [x] 1-Click Bundled Demo Repo ("ShopSphere") for 100% fail-safe evaluation.
- [x] Public GitHub repository zipball scanner with file count/size caps.
- [x] Syntactic AST analysis (ES imports, CommonJS requires, exported symbols).
- [x] React Flow interactive dependency graph with node filtering and highlight state.
- [x] BlastRadius BFS impact engine (Direct vs Transitive tiers).
- [x] TestScout test priority matrix.
- [x] AI Feature Explorer with 2-stage ranking + graceful fallback.
- [x] WhyIsItBroken stack trace frame parser with code context.
- [x] Repository sync action with commit SHA verification.
- [x] Unit test suite for AST parser and graph traversal.

### Explicitly Deferred to Post-MVP:
- ❌ GitHub OAuth / Private repos (prevents OAuth config overhead).
- ❌ Webhook listeners (manual sync is faster and reliable).
- ❌ Python/Go AST parsing (stay laser-focused on JS/TS/JSX/TSX).
- ❌ Automated test execution in the browser (recommending tests is safer and within scope).

---

## 9. Next Steps

With this consolidated and hardened blueprint:
1. Initialize the monorepo root (`package.json`, `.gitignore`).
2. Build the `server/` backend (AST parser, graph engine, demo repo, API endpoints).
3. Build the `client/` frontend (React Flow graph, Dark IDE UI, Feature Explorer, Error Lab).
4. Run end-to-end testing with both the demo repo and real GitHub repos.
5. Deploy and finalize the README.