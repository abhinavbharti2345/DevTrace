# DevTrace — AI-Powered Codebase Intelligence & BlastRadius Platform

[![Vitest Unit Tests](https://img.shields.io/badge/tests-6%20passed-55b685.svg?style=flat-square)](file:///c:/CS/CS%20Projects/Web-Projects/EndTermProject/server/src/tests/server.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-7895b2.svg?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square)](https://react.dev/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12-ff0072.svg?style=flat-square)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

DevTrace is an engineering-first codebase comprehension and change-impact analysis platform. It parses source code into a deterministic Abstract Syntax Tree (AST) and directed dependency graph, answering critical architectural questions before code changes break production.

---

## 1. Problem Statement
When developers onboard to an unfamiliar codebase or make modifications to a shared utility/service, they face high cognitive friction:
1. **Unclear Feature Boundaries**: Locating which components, route handlers, and database queries work together across dozens of files requires manual grep searches.
2. **Hidden Downstream Impact**: Changing one function signature or database schema can silently break dependent modules 3 tiers away.
3. **Uncertain Test Scope**: Running an entire enterprise test suite takes 20+ minutes, yet developers don't know the exact minimal subset of tests covering their modifications.
4. **Cryptic Runtime Errors**: Stack traces point to a symptom line but fail to reveal the inbound caller sequence that triggered the invalid state.
5. **AI Hallucinations**: Generic AI coding assistants invent non-existent file paths and phantom functions because they lack a deterministic knowledge graph.

## 2. Target Users
- **Software Engineers & Full-Stack Developers**: Onboarding onto complex repositories or refactoring critical systems.
- **Tech Leads & Code Reviewers**: Assessing the true blast radius of pull requests before merging.
- **QA & Automation Engineers**: Running targeted test suites with high precision instead of blind regression runs.

## 3. Solution
DevTrace replaces guesswork with **deterministic static analysis and grounded AI**:
- Parses JavaScript & TypeScript source files into syntactic ASTs using the TypeScript Compiler API.
- Builds a directed dependency graph with cycle detection and reverse adjacency tracking.
- Uses AI *strictly as an interpreter* over verified AST evidence, ensuring zero hallucinations.
- Features an instantaneous **1-Click Bundled Demo Codebase ("ShopSphere")** and a **Live Public GitHub Zipball Scanner**.

---

## 4. Key Workflows & Features

### 🌟 Module 1: AI Feature Explorer
- Natural language query interface (e.g., *"Where is user authentication and session validation handled?"*).
- **2-Stage Grounded Pipeline**:
  - *Stage 1*: Deterministic AST keyword, symbol, and graph centrality scoring to identify the top candidate files.
  - *Stage 2*: LLM architectural rationale citing verified files and functions with source code line numbers.
  - *Stage 3 (Fallback)*: Automatic graceful fallback to deterministic AST rankings if API keys are missing.
- Clickable source previews and *"Inspect in Graph"* one-click jumps.

### 🕸️ Module 2: Interactive Dependency Graph
- Interactive visual DAG powered by **React Flow** with custom nodes.
- Filter nodes by architectural role: **Routes, Services, Utilities, Models, Tests, Components**.
- Side inspector drawer displaying direct imports, downstream callers, and exported symbols.
- Visual highlighting for search results and blast radius paths.

### 💥 Module 3: BlastRadius Change-Impact Engine
- Evaluates the systemic impact of modifying any repository file.
- **BFS Reverse Graph Traversal**:
  - **Tier 1 (Direct Dependents)**: Immediate callers ($dist = 1$).
  - **Tier 2 (Transitive Dependents)**: Downstream callers ($dist \ge 2$).
- Computes an **Impact Severity Risk Score** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Subgraph isolation to highlight affected dependencies.

### 🎯 Module 4: TestScout Test Selection Matrix
- Targeted test selection using reverse graph proximity heuristics.
- Ranks test suites into **HIGH Priority** (direct tests of modified files) and **MEDIUM Priority** (tests of transitive callers).
- Generates 1-click executable CLI commands: `npx vitest run src/tests/auth.test.ts`.

### 🩺 Module 5: WhyIsItBroken Error Lab
- Normalizes V8 and browser runtime stack traces against indexed repository paths.
- Extracts offending code snippets with $\pm 5$ surrounding lines and highlights the active line (`>>`).
- Identifies inbound callers and suggests actionable, rule-based debugging hypotheses.

### 🔄 Module 6: Repository Management & Sync
- Ingests public GitHub repositories via zipball streaming with strict memory caps (max 150 files / 5MB).
- Stores and tracks commit SHAs (`a84f91e`), allowing instant refresh and staleness detection.
- Includes a **1-Click Bundled ShopSphere Demo** for instantaneous evaluation with zero API setup.

---

## 5. Technical Architecture

```text
                                 ┌─────────────────────────┐
                                 │   Browser UI (React 19) │
                                 │  React Flow, Tailwind   │
                                 └────────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                 ┌─────────────────────────┐
                                 │  Express API (Node.js)  │
                                 │  Port 3001              │
                                 └────────────┬────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
         │ Ingestion Engine   │    │ Static AST Parser  │    │ Graph & Impact     │
         │ GitHub Zip Stream  │    │ ts.createSourceFile│    │ BFS Traversal      │
         │ Bundled Demo Loader│    │ Symbol Extractor   │    │ Cycle Detector     │
         └────────────────────┘    └────────────────────┘    └────────────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │ In-Memory CodebaseIndex │
                                 │ Files, Nodes, Edges,    │
                                 │ Adjacency, RevAdjacency │
                                 └────────────┬────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │ Grounded AI Service     │
                                 │ Gemini 1.5 Flash +      │
                                 │ Deterministic Fallback  │
                                 └─────────────────────────┘
```

---

## 6. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19, Vite, TypeScript | Modular components, fast HMR, type safety |
| **Styling** | Tailwind CSS, Stitch Design System | High-density developer IDE dark theme (`#111417`) |
| **Graph Visualization** | React Flow (`@xyflow/react`) | Industry-standard interactive canvas for DAGs |
| **Backend** | Node.js, Express, TypeScript | High-performance asynchronous file processing |
| **AST Analysis** | TypeScript Compiler API | Fast syntactic AST traversal (`ts.createSourceFile`) |
| **Archive Ingestion**| `adm-zip`, `axios` | In-memory zipball decompression with file count limits |
| **AI Grounding** | `@google/generative-ai` | Concise, grounded architectural explanations |
| **Testing** | Vitest | Automated unit testing of AST and graph algorithms |

---

## 7. Local Setup & Running

### Prerequisites
- Node.js `v18.0.0` or higher (Tested on Node `v24.13.0`)
- npm `v9.0.0` or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/DevTrace.git
   cd DevTrace
   ```

2. **Install all workspace dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure Gemini API Key:**
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > *Note: If no API key is provided, DevTrace automatically activates its built-in deterministic AST ranking engine. All workflows remain 100% functional!*

4. **Start the application in Development Mode:**
   ```bash
   npm run dev
   ```
   - Frontend UI: `http://localhost:5173/`
   - Backend API: `http://localhost:3001/`

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 8. Running Automated Tests

DevTrace includes a comprehensive automated test suite testing AST parsing, graph construction, BFS traversal, and error stack trace mapping:

```bash
npm run test --workspace=server
```

**Test Coverage Summary:**
- ✅ `parses TypeScript AST, extracting imports and exported symbols`
- ✅ `builds dependency graph and reverse adjacency correctly`
- ✅ `loads bundled ShopSphere demo repo with complete integrity`
- ✅ `computes BFS BlastRadius correctly when modifying auth service`
- ✅ `recommends tests via TestScout for changed files`
- ✅ `parses stack traces and maps project frames with line context`

---

## 9. Security & Reliability Guardrails
- **Zero Code Execution**: Source code is parsed strictly as passive text data. No repository scripts or arbitrary packages are ever executed.
- **Resource Limits**: Zipball ingestion caps processing at 150 source files and 5MB total size.
- **Zero Exposed Secrets**: All AI requests and GitHub tokens are kept on the Express backend; no credentials are ever transmitted to the frontend.
- **Deterministic Resilience**: If network timeouts or LLM rate limits occur, DevTrace falls back to deterministic AST evidence rather than throwing errors.

---

## 10. Project Structure

```text
EndTermProject/
├── client/                     # Frontend SPA (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Sidebar, Header, CodeModal, RepoSelectorModal
│   │   ├── views/              # Overview, FeatureExplorer, DependencyGraph, BlastRadius, TestScout, ErrorLab, RepoSync
│   │   ├── services/           # api.ts (Axios wrapper)
│   │   ├── types/              # Client TypeScript contracts
│   │   ├── App.tsx             # Root Application state & view switcher
│   │   └── main.tsx            # Entrypoint
│   ├── index.html              # HTML with Inter & JetBrains Mono fonts
│   └── package.json
├── server/                     # Backend API & AST Analysis Engine
│   ├── src/
│   │   ├── analyzer/           # astParser.ts (ts.createSourceFile)
│   │   ├── graph/              # graphBuilder.ts & impactEngine.ts (BFS BlastRadius)
│   │   ├── ingestion/          # githubFetcher.ts & demoRepoLoader.ts
│   │   ├── services/           # aiService.ts (Gemini) & stackTraceParser.ts
│   │   ├── tests/              # server.test.ts (Vitest test suite)
│   │   └── index.ts            # Express server routes
│   ├── demo-repo/              # Bundled ShopSphere E-Commerce & Auth Codebase
│   ├── vitest.config.ts
│   └── package.json
├── ProjectDetail.md            # Consolidated product blueprint & technical specification
├── END_TERM_PROJECT_GUIDELINES.md # Official assignment evaluation guidelines
└── package.json                # Monorepo orchestration
```
