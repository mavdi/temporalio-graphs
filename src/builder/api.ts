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
export async function buildGraph(
  workflow: (...args: unknown[]) => Promise<unknown>,
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

  // For now, run with a single decision plan
  // Full permutation support requires counting decisions first
  // This is a simplified version - we'll enhance in later tasks
  const decisionPlans = generateDecisionPermutations(0);

  for (const plan of decisionPlans) {
    graphContext.decisionPlan = plan;

    try {
      await workflow(...workflowArgs);
    } catch (error) {
      // Workflows may throw during graph building - that's expected
      // We capture the path up to the error
    }

    graphContext.savePath();
  }

  const result = buildGraphFromPaths();

  // Reset context
  graphContext.reset();

  return result;
}
