import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { calculateBlastRadius, recommendTestsForChanges } from './graph/impactEngine.js';
import { loadBundledDemoRepo } from './ingestion/demoRepoLoader.js';
import { fetchAndIndexGitHubRepo } from './ingestion/githubFetcher.js';
import { exploreFeatureWithAI } from './services/aiService.js';
import { parseAndInvestigateStackTrace } from './services/stackTraceParser.js';
import { CodebaseIndex } from './types/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Active in-memory codebase index (seeded with demo repo)
let activeIndex: CodebaseIndex | null = null;

function getOrLoadActiveIndex(): CodebaseIndex {
  if (!activeIndex) {
    console.log('[DevTrace] Seeding initial index with bundled ShopSphere demo repo...');
    activeIndex = loadBundledDemoRepo();
  }
  return activeIndex;
}

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeRepo: activeIndex ? activeIndex.repoName : 'none',
  });
});

// 2. Load bundled Demo Repo
app.get('/api/repo/demo', (_req: Request, res: Response) => {
  try {
    activeIndex = loadBundledDemoRepo();
    console.log(`[DevTrace] Loaded demo repo: ${activeIndex.repoName} (${activeIndex.stats.totalFiles} files)`);
    res.json({ success: true, index: activeIndex });
  } catch (err) {
    console.error('Error loading demo repo:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// 3. Connect and Analyze Public GitHub Repo
app.post('/api/repo/analyze', async (req: Request, res: Response) => {
  try {
    const { repoUrl, branch } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'Missing required field: repoUrl' });
    }

    console.log(`[DevTrace] Analyzing GitHub repository: ${repoUrl} [branch: ${branch || 'main'}]...`);
    activeIndex = await fetchAndIndexGitHubRepo(repoUrl, branch || 'main');
    console.log(`[DevTrace] Successfully indexed ${activeIndex.repoName} with ${activeIndex.stats.totalFiles} files.`);
    res.json({ success: true, index: activeIndex });
  } catch (err) {
    console.error('Failed to analyze repository:', err);
    res.status(400).json({ error: (err as Error).message });
  }
});

// 4. Get Current Active Index
app.get('/api/repo/current', (_req: Request, res: Response) => {
  try {
    const index = getOrLoadActiveIndex();
    res.json({ success: true, index });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. AI Feature Explorer
app.post('/api/feature-explorer', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const index = getOrLoadActiveIndex();
    const result = await exploreFeatureWithAI(index, query);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Feature explorer error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// 6. BlastRadius Change Impact
app.post('/api/blast-radius', (req: Request, res: Response) => {
  try {
    const { targetFile, maxDepth } = req.body;
    if (!targetFile) {
      return res.status(400).json({ error: 'targetFile is required' });
    }
    const index = getOrLoadActiveIndex();
    const result = calculateBlastRadius(index, targetFile, maxDepth || 3);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 7. TestScout Test Selection
app.post('/api/test-scout', (req: Request, res: Response) => {
  try {
    const { changedFiles } = req.body;
    if (!changedFiles || !Array.isArray(changedFiles)) {
      return res.status(400).json({ error: 'changedFiles array is required' });
    }
    const index = getOrLoadActiveIndex();
    const recommendations = recommendTestsForChanges(index, changedFiles);
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 8. WhyIsItBroken Error Lab
app.post('/api/error-trace', (req: Request, res: Response) => {
  try {
    const { stackTrace } = req.body;
    if (!stackTrace) {
      return res.status(400).json({ error: 'stackTrace string is required' });
    }
    const index = getOrLoadActiveIndex();
    const analysis = parseAndInvestigateStackTrace(index, stackTrace);
    res.json({ success: true, ...analysis });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 9. Sync Repository
app.post('/api/repo/sync', async (_req: Request, res: Response) => {
  try {
    const current = getOrLoadActiveIndex();
    if (current.repoUrl) {
      activeIndex = await fetchAndIndexGitHubRepo(current.repoUrl, current.branch);
    } else {
      activeIndex = loadBundledDemoRepo();
    }
    res.json({ success: true, index: activeIndex, message: 'Repository synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 DevTrace Backend Server running at http://localhost:${PORT}`);
});
