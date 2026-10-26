import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSourceFile } from '../analyzer/astParser.js';
import { buildCodebaseGraph } from '../graph/graphBuilder.js';
import { CodebaseIndex, FileInfo } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadBundledDemoRepo(): CodebaseIndex {
  // Locate demo-repo directory (relative to built dist or src)
  let demoDir = path.resolve(__dirname, '../../demo-repo');
  if (!fs.existsSync(demoDir)) {
    demoDir = path.resolve(__dirname, '../demo-repo');
  }

  const filesMap: Record<string, FileInfo> = {};

  function scanDir(currentPath: string, relativePrefix = '') {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

      const fullPath = path.join(currentPath, entry.name);
      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        scanDir(fullPath, relPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = parseSourceFile(relPath, content);
        filesMap[relPath] = parsed;
      }
    }
  }

  scanDir(demoDir);

  return buildCodebaseGraph(
    'shopsphere-api',
    'main',
    'a84f91e',
    filesMap,
    'https://github.com/shopsphere/shopsphere-api'
  );
}
