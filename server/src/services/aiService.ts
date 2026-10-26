import { GoogleGenerativeAI } from '@google/generative-ai';
import { CandidateMatch, CodebaseIndex, FeatureExplorerResult } from '../types/index.js';

export async function exploreFeatureWithAI(
  index: CodebaseIndex,
  query: string
): Promise<FeatureExplorerResult> {
  // Stage 1: Deterministic AST & Graph Candidate Ranking
  const candidates = rankCandidatesForQuery(index, query);
  const topCandidates = candidates.slice(0, 5);
  const traversalNodes = topCandidates.map((c) => c.file);

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    // Stage 3 Fallback: Pure deterministic explanation
    const fallbackExplanation = buildDeterministicExplanation(query, topCandidates, index);
    return {
      query,
      candidateFiles: topCandidates,
      aiExplanation: fallbackExplanation,
      isFallback: true,
      traversalNodes,
    };
  }

  // Stage 2: Grounded LLM Enrichment
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextPayload = topCandidates.map((c) => {
      const file = index.files[c.file];
      return {
        path: c.file,
        matchedSymbols: c.matchedSymbols,
        exportedSymbols: file.symbols.filter((s) => s.isExported).map((s) => `${s.kind} ${s.name}`),
        directImports: file.imports.map((i) => i.source),
        directImporters: index.reverseAdjacency[c.file] || [],
        snippetSample: c.snippet,
      };
    });

    const prompt = `You are DevTrace Codebase Intelligence, an expert developer assistant.
Analyze the following user query about the indexed repository:
Query: "${query}"

Here are the top ranked files discovered deterministically from the codebase AST and dependency graph:
${JSON.stringify(contextPayload, null, 2)}

Provide an authoritative, grounded architectural explanation:
1. Explain how these files work together to fulfill or relate to the feature.
2. Specifically cite file paths and functions/classes discovered in the evidence.
3. Do NOT invent any files or functions not present in the evidence.
4. Keep the explanation concise (2 to 3 paragraphs max) in crisp markdown.`;

    const result = await model.generateContent(prompt);
    const aiExplanation = result.response.text();

    return {
      query,
      candidateFiles: topCandidates,
      aiExplanation,
      isFallback: false,
      traversalNodes,
    };
  } catch (error) {
    console.warn('AI call failed, using deterministic fallback:', error);
    const fallbackExplanation = buildDeterministicExplanation(query, topCandidates, index);
    return {
      query,
      candidateFiles: topCandidates,
      aiExplanation: fallbackExplanation,
      isFallback: true,
      traversalNodes,
    };
  }
}

export function rankCandidatesForQuery(index: CodebaseIndex, query: string): CandidateMatch[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const results: CandidateMatch[] = [];

  for (const [filePath, file] of Object.entries(index.files)) {
    let score = 0;
    const matchedSymbols: string[] = [];
    const matchedImports: string[] = [];
    const pathLower = filePath.toLowerCase();

    // 1. Path Match
    for (const token of tokens) {
      if (pathLower.includes(token)) {
        score += 8;
      }
    }

    // 2. Symbol Name Match
    for (const sym of file.symbols) {
      const symLower = sym.name.toLowerCase();
      for (const token of tokens) {
        if (symLower.includes(token)) {
          score += sym.isExported ? 12 : 6;
          if (!matchedSymbols.includes(sym.name)) {
            matchedSymbols.push(`${sym.kind} ${sym.name}`);
          }
        }
      }
    }

    // 3. Import Source Match
    for (const imp of file.imports) {
      const impLower = imp.source.toLowerCase();
      for (const token of tokens) {
        if (impLower.includes(token)) {
          score += 4;
          if (!matchedImports.includes(imp.source)) {
            matchedImports.push(imp.source);
          }
        }
      }
    }

    // 4. Content Occurrences
    const contentLower = file.content.toLowerCase();
    for (const token of tokens) {
      const count = (contentLower.match(new RegExp(`\\b${token}`, 'g')) || []).length;
      score += Math.min(count * 2, 10);
    }

    // 5. Graph Gravity (central modules get a slight boost)
    const importersCount = index.reverseAdjacency[filePath]?.length || 0;
    score += Math.min(importersCount, 5);

    if (score > 0) {
      // Find a representative snippet
      const lines = file.content.split('\n');
      let snippetLine = 1;
      let snippet = '';

      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        if (tokens.some((t) => lineText.toLowerCase().includes(t))) {
          snippetLine = i + 1;
          const start = Math.max(0, i - 2);
          const end = Math.min(lines.length, i + 3);
          snippet = lines
            .slice(start, end)
            .map((l, idx) => `${(start + idx + 1).toString().padStart(3, ' ')} | ${l}`)
            .join('\n');
          break;
        }
      }

      if (!snippet && lines.length > 0) {
        snippet = lines
          .slice(0, 5)
          .map((l, idx) => `${(idx + 1).toString().padStart(3, ' ')} | ${l}`)
          .join('\n');
      }

      const relevanceReason =
        matchedSymbols.length > 0
          ? `Defines matching symbol(s): ${matchedSymbols.slice(0, 2).join(', ')}`
          : matchedImports.length > 0
          ? `Imports matching dependencies: ${matchedImports.slice(0, 2).join(', ')}`
          : `High token frequency and structural gravity in the module graph`;

      results.push({
        file: filePath,
        score,
        matchedSymbols,
        matchedImports,
        snippet,
        line: snippetLine,
        relevanceReason,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function buildDeterministicExplanation(
  query: string,
  topCandidates: CandidateMatch[],
  index: CodebaseIndex
): string {
  if (topCandidates.length === 0) {
    return `No direct AST or symbol matches found for query **"${query}"**. Try searching for common architectural keywords like *auth*, *cart*, *service*, *router*, or *db*.`;
  }

  let text = `### AST & Graph Analysis for "${query}"\n\n`;
  text += `Based on syntactic AST parsing and static dependency traversal, **${topCandidates.length} candidate modules** implement or connect directly to this feature:\n\n`;

  for (const c of topCandidates) {
    const file = index.files[c.file];
    const importers = index.reverseAdjacency[c.file] || [];
    text += `- **\`${c.file}\`**: ${c.relevanceReason}. `;
    if (importers.length > 0) {
      text += `Connected to downstream modules: ${importers.slice(0, 3).map((i) => `\`${i}\``).join(', ')}.\n`;
    } else {
      text += `Operates as an entrypoint or top-level component.\n`;
    }
  }

  text += `\n*Note: Grounded via deterministic AST symbol matching and reverse dependency graph analysis.*`;
  return text;
}
