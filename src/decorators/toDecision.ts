// src/decorators/toDecision.ts

import { graphContext } from '../context.js';
import type { GraphNode } from '../types.js';

export interface ToDecisionOptions {
  positiveLabel?: string;
  negativeLabel?: string;
}

/**
 * Wrapper for inline boolean conditions to mark them as decision points.
 * During graph building, returns values from the decision plan to explore all branches.
 *
 * @example
 * ```typescript
 * // In a workflow:
 * if (await toDecision(amount > 10000, 'Is High Value?')) {
 *   // high value path
 * } else {
 *   // normal path
 * }
 *
 * // With custom labels:
 * if (await toDecision(isApproved, 'Manager Approval', {
 *   positiveLabel: 'Approved',
 *   negativeLabel: 'Rejected'
 * })) {
 *   // approved path
 * }
 * ```
 */
export async function toDecision(
  condition: boolean | Promise<boolean>,
  label: string,
  options?: ToDecisionOptions
): Promise<boolean> {
  const resolvedCondition = await Promise.resolve(condition);

  if (!graphContext.isBuildingGraph) {
    return resolvedCondition;
  }

  // In graph building mode: use planned decision, not actual value
  const plannedResult = graphContext.getNextDecision();

  const positiveLabel = options?.positiveLabel ?? 'yes';
  const negativeLabel = options?.negativeLabel ?? 'no';

  const node: GraphNode = {
    id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: label,
    type: 'decision',
    branch: plannedResult ? positiveLabel : negativeLabel,
  };

  graphContext.addNode(node);

  return plannedResult;
}
