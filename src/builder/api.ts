// src/builder/api.ts

import { graphContext } from '../context.js';
import { generateDecisionPermutations, buildGraphFromPaths } from './buildGraph.js';
import type { GraphBuildingContext, GraphResult } from '../types.js';

export interface BuildGraphOptions {
  /** Maximum number of decisions to explore (default: 10, max permutations = 1024) */
  maxDecisions?: number;
  /** Output file path for Mermaid graph */
  outputFile?: string;
  /** Split camelCase names into words */
  splitNamesByWords?: boolean;
  /** Arguments to pass to the workflow */
  workflowArgs?: unknown[];
  /** Maximum depth for child workflow recursion */
  maxChildDepth?: number;
}

/**
 * Build a workflow graph by running the workflow in mocked-execution mode.
 *
 * @example
 * ```typescript
 * import { buildGraph } from 'temporalio-graphs';
 * import { myWorkflow } from './workflows';
 *
 * const result = await buildGraph(myWorkflow, {
 *   workflowArgs: [{ orderId: '123' }],
 *   outputFile: './workflow.graph',
 * });
 *
 * console.log(result.mermaid);
 * ```
 */
export async function buildGraph<TArgs extends unknown[], TResult>(
  workflow: (...args: TArgs) => Promise<TResult>,
  options: BuildGraphOptions = {}
): Promise<GraphResult> {
  const {
    maxDecisions = 10,
    splitNamesByWords = false,
    workflowArgs = [],
    maxChildDepth = 10,
  } = options;

  // Reset context
  graphContext.reset();

  // Configure graph building mode
  const context: GraphBuildingContext = {
    isBuildingGraph: true,
    splitNamesByWords,
    maxChildDepth,
  };
  graphContext.context = context;

  // Phase 1: Run workflow once to count decisions
  graphContext.decisionPlan = [];
  let decisionCount = 0;

  try {
    await workflow(...(workflowArgs as TArgs));
  } catch {
    // Workflows may throw during graph building - that's expected
  }

  // Count decisions that were encountered (BEFORE savePath resets it)
  decisionCount = graphContext.decisionIndex;
  graphContext.savePath();

  // Phase 2: If we found decisions, explore all permutations
  if (decisionCount > 0) {
    // Limit to maxDecisions to avoid exponential explosion
    const actualDecisions = Math.min(decisionCount, maxDecisions);
    const decisionPlans = generateDecisionPermutations(actualDecisions);

    // Skip the first plan (all true) since we already ran that
    for (let i = 1; i < decisionPlans.length; i++) {
      graphContext.decisionPlan = decisionPlans[i];
      graphContext.decisionIndex = 0;
      graphContext.currentPath = [];

      try {
        await workflow(...(workflowArgs as TArgs));
      } catch {
        // Workflows may throw during graph building - that's expected
      }

      graphContext.savePath();
    }
  }

  const result = buildGraphFromPaths();

  // Reset context
  graphContext.reset();

  return result;
}
