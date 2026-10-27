# ⚡ DevTrace — Codebase Intelligence & BlastRadius Platform

> **Deterministic AST static analysis meets zero-hallucination AI.**  
> Map architectures, simulate change impact before deployment, pinpoint regression tests, and explore codebases in natural language.

---

<div align="center">

[![Live Frontend Deployment](https://img.shields.io/badge/Vercel-Live%20App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dev-trace-nine.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Render-API%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://dev-trace-api-m0zb.onrender.com/api/health)
[![Vitest Unit Tests](https://img.shields.io/badge/Vitest-6%20Passed-55b685?style=for-the-badge&logo=vitest&logoColor=white)](file:///server/src/tests/server.test.ts)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Grounded%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

**[🌐 Live Deployed Application](https://dev-trace-nine.vercel.app)** • **[🚀 Backend Health Endpoint](https://dev-trace-api-m0zb.onrender.com/api/health)** • **[📂 GitHub Repository](https://github.com/abhinavbharti2345/DevTrace)**

</div>

---

## 🧭 Evaluator Quick-Start (3-Minute Live Tour)

If you are evaluating this project, you can test every workflow immediately without any local setup:

1. **Open the live application:** [https://dev-trace-nine.vercel.app](https://dev-trace-nine.vercel.app)
2. **Observe Bundled Codebase:** DevTrace immediately loads the full **ShopSphere (`shopsphere-api`)** repository (12 modules, 490+ indexed symbols).
3. **Explore Architecture (Tab 2):** Click **AI Feature Explorer** and select *"Where is authentication and session validation handled?"*. Notice the green **Gemini Grounded** badge citing verified line numbers from `src/routes/auth.routes.ts` and `src/services/auth.service.ts`.
4. **Inspect Dependency DAG (Tab 3):** Open **Dependency Graph**. Filter by `Route`, `Service`, or `Model`. Drag nodes and view the live telemetry drawer.
5. **Simulate Blast Radius (Tab 4):** Open **BlastRadius Impact**, select `src/services/auth.service.ts`, and click **Calculate Blast Radius**. Observe Tier 1 and Tier 2 downstream ripple effects with high-risk scoring.
6. **Targeted Test Selection (Tab 5):** Open **TestScout Matrix**, select `src/utils/jwt.ts`, and click **Recommend Tests**. Witness reverse-graph proximity ranking identifying `src/tests/auth.test.ts`.
7. **Analyze Real GitHub Repos (Tab 7 or Header):** Click **Change Repo**, paste any public TypeScript/JavaScript GitHub URL, and watch DevTrace stream, parse ASTs, and construct the live dependency graph.

---

## 1. Problem Statement

Modern software development moves fast, but developer onboarding and refactoring remain painfully slow:

| The Pain Point | Why It Happens | The Real Cost |
|---|---|---|
| **Architectural Blindness** | Features span dozens of controllers, models, and helper files. | Engineers spend hours grepping through directories just to understand how a single feature works. |
| **Hidden Blast Radius** | Modifying a shared utility or database model silently breaks dependent consumers 3 tiers downstream. | High-severity production outages from unforeseen side-effects. |
| **Untargeted Test Regressions** | Full CI/CD suites take 20–45 minutes to execute. | Developers either skip tests or waste hours running irrelevant suites for small 2-line edits. |
| **Cryptic Stack Traces** | Runtime error logs only display the symptom line, omitting inbound caller context. | Engineers spend days guessing how invalid inputs entered the call chain. |
| **AI Hallucinations** | Standard LLM assistants invent non-existent file paths and imaginary function signatures. | False advice that breaks builds and degrades trust. |

---

## 2. The DevTrace Solution: Deterministic Static Analysis + Grounded AI

DevTrace eliminates guesswork by combining **deterministic Abstract Syntax Tree (AST) parsing** with **strictly grounded LLM code interpretation**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DEVTRACE ENGINE                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌───────────────────────────────────┐             ┌───────────────────────────────────┐
│     Deterministic Static Core     │             │        Grounded AI Core           │
├───────────────────────────────────┤             ├───────────────────────────────────┤
│ • TypeScript Compiler AST Parser  │             │ • Google Gemini (3.5 / 3.8 Flash) │
│ • Directed Dependency DAG ($V, E$)│             │ • Multi-Stage AST Prompt Injection│
│ • Reverse BFS BlastRadius Scoring │             │ • Zero-Hallucination Guardrails   │
│ • Cycle Detection & Centrality    │             │ • Automatic Offline Fallback Mode │
└───────────────────────────────────┘             └───────────────────────────────────┘
```

1. **Zero Hallucination Guarantee:** The LLM is never allowed to guess. Every explanation is strictly grounded in syntactic evidence extracted by the TypeScript Compiler API.
2. **Deterministic Resiliency:** If network latency or API rate limits occur, DevTrace automatically falls back to its offline deterministic AST engine. All core features remain 100% functional.
3. **Zero Arbitrary Execution:** DevTrace parses code purely as passive syntactic text data. No repository scripts or arbitrary packages are ever executed on the host.

---

## 3. Core Modules & Key Features

### 🌟 Module 1: AI Feature Explorer
- Natural language query interface (e.g. *"How does payment processing interact with cart checkout?"*).
- **2-Stage Grounded Pipeline**:
  - **Stage 1 (AST Evidence Retrieval):** Scores codebase nodes using token frequency, symbol signatures, and module graph gravity.
  - **Stage 2 (Architectural Rationale):** Feeds verified AST code snippets into Google Gemini (`gemini-3.5-flash`), producing a structured architectural breakdown citing real files, routes, and line numbers.
  - **Stage 3 (Automatic Fallback):** If API keys are absent, dynamically analyzes file relationships to return a structured static explanation.
- Clickable source code previews and 1-click *"Inspect in Graph"* shortcuts.

### 🕸️ Module 2: Interactive Dependency Graph
- Interactive visual DAG powered by **React Flow (`@xyflow/react`)** with custom nodes and edge routing.
- **Architectural Role Filtering:** Filter nodes by role (**Routes, Services, Models, Utilities, Tests, Components**).
- **Non-Destructive Spotlight Dimming:** Dim unrelated nodes without removing them from layout, preserving spatial memory.
- **Node Inspector Drawer:** View direct imports, reverse callers, and all exported symbols.

### 💥 Module 3: BlastRadius Change-Impact Engine
- Evaluates the systemic ripple effect before modifying any codebase file.
- **Multi-Tier BFS Reverse Traversal ($O(V + E)$):**
  - **Tier 1 (Direct Dependents):** Immediate callers ($dist = 1$).
  - **Tier 2 (Transitive Dependents):** Downstream callers ($dist \ge 2$).
- Computes an **Impact Severity Risk Score** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Subgraph visual isolation with one-click canvas centering.

### 🎯 Module 4: TestScout Targeted Test Selection
- Traverses reverse module dependencies to recommend the minimal, high-confidence test suites to execute.
- **Test Detection Status Badge:** Live indicator showing `🧪 X Test Suites Indexed` or `⚠️ 0 Test Suites Detected`.
- **Convention-Aware Heuristic:** Matches root module names (e.g., automatically links `src/services/auth.service.ts` to `src/tests/auth.test.ts`).
- **1-Click Execution Command:** Generates executable CLI commands (e.g., `npx vitest run src/tests/auth.test.ts`).
- **Batch Actions & Real-Time Search:** Easily filter and select modified files across large codebases.

### 🩺 Module 5: WhyIsItBroken Error Lab
- Ingests messy runtime stack traces from Node.js, V8, and browser consoles.
- Normalizes paths against indexed repository files and maps project frames to exact source lines.
- Extracts offending code snippets with $\pm 5$ lines of context and highlights the failing line (`>>`).
- Identifies inbound callers and suggests actionable, rule-based debugging hypotheses.

### 🔄 Module 6: Live GitHub Scanner & Sync
- Ingests public GitHub repositories via zipball streaming with strict memory caps (max 150 files / 5MB).
- Extracts commit SHAs (`a84f91e`) for version tracking and staleness detection.
- Includes a **1-Click Bundled ShopSphere Demo** for instant out-of-the-box exploration.

---

## 4. Technical Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19 SPA)                     │
│   • Vite Bundler             • React Flow (@xyflow/react)              │
│   • Tailwind CSS (Stitch)    • Axios Normalized API Client             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP /api JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       SERVER LAYER (Express + Node.js)                 │
│   • REST Endpoints           • In-Memory CodebaseIndex Cache           │
│   • CORS Guardrails          • dotenv Dynamic Reload                   │
└───────────┬───────────────────────┬──────────────────────┬─────────────┘
            │                       │                      │
            ▼                       ▼                      ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│  Ingestion Engine     │ │ AST Parser Core   │ │ Graph & Impact Engine  │
│  • Adm-Zip Streamer   │ │ • ts.SourceFile   │ │ • BFS Blast Radius     │
│  • GitHub API Proxy   │ │ • Symbol Visitor  │ │ • Reverse Adjacency    │
│  • Demo Repo Loader   │ │ • Import Resolver │ │ • TestScout Matrix     │
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI INTELLIGENCE LAYER                    │
│   • Model Cascade: gemini-3.5-flash ➔ gemini-3.8-flash                 │
│   • Strict AST Evidence Grounding Prompt Template                      │
│   • Zero-Hallucination Output Verification                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack & Engineering Decisions

| Layer | Technology | Engineering Rationale |
|---|---|---|
| **Frontend Framework** | **React 19** + **Vite 6** | Modern concurrent rendering, instant Hot Module Replacement (HMR), lightweight client bundle. |
| **Type Safety** | **TypeScript 5.7** | Unified end-to-end contracts between client and backend via shared interface models. |
| **Interactive Graph** | **React Flow (`@xyflow/react`)** + **D3-Force** | GPU-accelerated interactive canvas, customizable node templates, and smooth pan/zoom physics. |
| **Styling & UI** | **Tailwind CSS** + **Material Symbols** | Ultra-dense developer IDE dark aesthetic (`#0B0F19`) inspired by Google Stitch. |
| **Backend API** | **Node.js** + **Express** | Asynchronous, non-blocking I/O ideal for streaming ZIP archives and AST compilation. |
| **Static Code Analysis**| **TypeScript Compiler API** | Industry-standard `ts.createSourceFile` AST parser, extracting imports, call chains, and symbols without compiling binaries. |
| **Archive Ingestion** | **Adm-Zip** + **Axios** | In-memory zipball buffer decompression with strict 150-file / 5MB safety caps. |
| **AI Interpretation** | **Google Gemini (`@google/generative-ai`)** | Fast, high-reasoning inference (`gemini-3.5-flash`) grounded on verified AST code snippets. |
| **Automated Testing** | **Vitest 3** | Fast ESM-native test runner validating graph algorithms, cycle detection, and parser accuracy. |
| **Deployment** | **Vercel** (Frontend) + **Render** (Backend) | Globally distributed CDN edge network with containerized Node.js API hosting. |

---

## 6. Automated Testing & Verification

DevTrace features a complete automated test suite verifying AST extraction, graph connectivity, BFS impact algorithms, and stack trace parsing:

```bash
npm run test --workspace=server
```

### Test Coverage Highlights:
- ✅ **AST Symbol & Import Extraction:** Verifies that TypeScript imports, named specifiers, and exported functions/interfaces are accurately captured.
- ✅ **Graph Connectivity & Reverse Adjacency:** Confirms that directed edges between callers and callees are bidirectional and cycle-safe.
- ✅ **BFS BlastRadius Calculation:** Tests multi-tier ripple traversal starting from `src/services/auth.service.ts` to downstream routes.
- ✅ **TestScout Selection:** Validates that modified modules correctly flag corresponding test suites by graph proximity.
- ✅ **Error Trace Mapping:** Confirms that raw stack traces map to source files with line highlighting.

---

## 7. Local Development Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Tested on Node `v22` and `v24`)
- **npm**: `v9.0.0` or higher

### Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhinavbharti2345/DevTrace.git
   cd DevTrace
   ```

2. **Install all workspace dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   GITHUB_TOKEN=your_optional_github_token_here
   ```
   > *Note: If no API key is provided, DevTrace automatically activates its built-in deterministic AST ranking engine. All workflows remain 100% functional!*

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   - **Frontend UI:** `http://localhost:5173/`
   - **Backend API:** `http://localhost:3001/`

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 8. Repository Layout

```text
DevTrace/
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── public/                 # Static assets (Custom Bluish 'D' SVG Favicon)
│   ├── src/
│   │   ├── components/         # Header, Sidebar, CodeModal, RepoSelectorModal, DemoWelcomeModal
│   │   ├── views/              # Overview, FeatureExplorer, DependencyGraph, BlastRadius, TestScout, ErrorLab, RepoSync
│   │   ├── services/           # api.ts (Axios client with smart VITE_API_URL normalization)
│   │   ├── types/              # TypeScript models (CodebaseIndex, BlastRadiusResult, etc.)
│   │   ├── App.tsx             # Root Application state & view orchestrator
│   │   └── main.tsx            # Vite entrypoint
│   ├── vercel.json             # Vercel SPA routing rewrite rules
│   └── package.json
├── server/                     # Backend API & AST Analysis Engine (Node.js + Express)
│   ├── src/
│   │   ├── analyzer/           # astParser.ts (TypeScript Compiler API AST extractor)
│   │   ├── graph/              # graphBuilder.ts & impactEngine.ts (BFS BlastRadius)
│   │   ├── ingestion/          # githubFetcher.ts & demoRepoLoader.ts (Zipball scanner)
│   │   ├── services/           # aiService.ts (Gemini cascade) & stackTraceParser.ts
│   │   ├── tests/              # server.test.ts (Automated Vitest test suite)
│   │   └── index.ts            # Express server routes & static asset fallback
│   ├── demo-repo/              # Bundled ShopSphere E-Commerce & Auth Codebase
│   ├── .env.example            # Backend environment template
│   └── package.json
├── package.json                # Root monorepo orchestration (npm workspaces)
└── README.md                   # Comprehensive technical documentation
```

---

## 9. Security & Reliability Guardrails

- **Zero Arbitrary Code Execution:** Code is analyzed strictly as passive text data through AST visitors. No user-supplied scripts or npm packages are ever executed.
- **Resource Limits:** GitHub zipball streaming enforces strict caps (maximum 150 source files, 5MB uncompressed limit) to prevent memory exhaustion.
- **Zero Exposed Secrets:** API keys and GitHub tokens remain exclusively on the Express backend; zero secrets are ever transmitted to the frontend bundle.
- **Deterministic Resilience:** If the Google Gemini API experiences rate limits, network timeouts, or missing keys, DevTrace falls back to its deterministic AST ranking engine.

---

## 10. License

This project is licensed under the [MIT License](LICENSE).
