import AdmZip from 'adm-zip';
import axios from 'axios';
import { parseSourceFile } from '../analyzer/astParser.js';
import { buildCodebaseGraph } from '../graph/graphBuilder.js';
import { CodebaseIndex, FileInfo } from '../types/index.js';

export interface GitHubRepoParams {
  owner: string;
  repo: string;
  branch?: string;
}

export function parseGitHubUrl(url: string): GitHubRepoParams {
  const cleanUrl = url.trim().replace(/\.git$/, '');
  const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repository');
  }
  return {
    owner: match[1],
    repo: match[2],
  };
}

export async function fetchAndIndexGitHubRepo(
  repoUrl: string,
  branch = 'main'
): Promise<CodebaseIndex> {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const fullName = `${owner}/${repo}`;

  const headers: Record<string, string> = {
    'User-Agent': 'DevTrace-Analyzer/1.0',
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  // 1. Get latest commit SHA
  let commitSha = 'HEAD';
  try {
    const commitRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
      { headers, timeout: 10000 }
    );
    if (commitRes.data && commitRes.data.sha) {
      commitSha = commitRes.data.sha.slice(0, 7);
    }
  } catch (err) {
    console.warn(`Could not fetch commit SHA for ${fullName}:`, (err as Error).message);
  }

  // 2. Download zipball archive
  const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
  let zipBuffer: Buffer;

  try {
    const zipRes = await axios.get(zipUrl, {
      headers: { ...headers, Accept: 'application/vnd.github.v3.raw' },
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 15 * 1024 * 1024, // 15MB limit
    });
    zipBuffer = Buffer.from(zipRes.data);
  } catch (err) {
    throw new Error(
      `Failed to download repository zipball from GitHub: ${(err as Error).message}. Check branch name or repository visibility.`
    );
  }

  // 3. Extract supported JS/TS files with AdmZip in memory
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  const filesMap: Record<string, FileInfo> = {};

  const MAX_FILES = 150;
  const MAX_BYTES = 5 * 1024 * 1024;
  let totalBytes = 0;

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    // Strips the top-level directory GitHub puts in zipballs (e.g. owner-repo-sha/)
    const fullEntryName = entry.entryName.replace(/\\/g, '/');
    const pathParts = fullEntryName.split('/');
    pathParts.shift(); // remove root prefix
    const relativePath = pathParts.join('/');

    if (!relativePath || relativePath.includes('node_modules/') || relativePath.startsWith('.')) {
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/i.test(relativePath) && !relativePath.endsWith('.d.ts')) {
      if (Object.keys(filesMap).length >= MAX_FILES || totalBytes >= MAX_BYTES) {
        break; // Guardrail against massive repositories
      }

      const content = entry.getData().toString('utf8');
      totalBytes += Buffer.byteLength(content, 'utf8');

      const parsed = parseSourceFile(relativePath, content);
      filesMap[relativePath] = parsed;
    }
  }

  if (Object.keys(filesMap).length === 0) {
    throw new Error(
      `No supported JavaScript/TypeScript source files found in repository branch '${branch}'.`
    );
  }

  return buildCodebaseGraph(fullName, branch, commitSha, filesMap, repoUrl);
}
