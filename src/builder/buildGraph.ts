// src/builder/buildGraph.ts

import { graphContext } from '../context.js';
import { generateMermaid, generatePathDescriptions } from '../generator/index.js';
import type { GraphResult, GraphEdge, GraphPath } from '../types.js';

/**
 * Generates all permutations of decision outcomes.
 * For n decisions, generates 2^n permutations.
 */
export function generateDecisionPermutations(decisionCount: number): boolean[][] {
  if (decisionCount === 0) {
    return [[]];
  }

  const permutations: boolean[][] = [];
  const total = Math.pow(2, decisionCount);

  for (let i = 0; i < total; i++) {
    const plan: boolean[] = [];
    for (let j = 0; j < decisionCount; j++) {
      // Use inverted bit to get true-first ordering for each position
      plan.push(!Boolean((i >> j) & 1));
    }
    permutations.push(plan);
  }

  return permutations;
}

/**
 * Builds a GraphResult from the paths collected in graphContext.
 */
export function buildGraphFromPaths(): GraphResult {
  const paths = graphContext.allPaths;

  // Add start/end nodes if not present
  const normalizedPaths: GraphPath[] = paths.map((path) => {
    const normalized = [...path];

    if (normalized.length === 0 || normalized[0].type !== 'start') {
      normalized.unshift({ id: 'start', name: 'Start', type: 'start' });
    }

    if (normalized.length === 0 || normalized[normalized.length - 1].type !== 'end') {
      normalized.push({ id: 'end', name: 'End', type: 'end' });
    }

    return normalized;
  });

  // Extract unique edges
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const path of normalizedPaths) {
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i].name;
      const target = path[i + 1].name;
      const label = path[i].type === 'decision' ? path[i].branch : undefined;
      const key = `${source}->${target}:${label || ''}`;

      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source, target, label });
      }
    }
  }

  return {
    paths: normalizedPaths,
    edges,
    mermaid: generateMermaid(normalizedPaths),
    pathDescriptions: generatePathDescriptions(normalizedPaths),
  };
}
