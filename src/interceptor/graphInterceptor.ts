// src/interceptor/graphInterceptor.ts

import { graphContext } from '../context.js';
import type { GraphNode } from '../types.js';

/**
 * Minimal interface for activity input (compatible with Temporal's ActivityInput)
 */
export interface ActivityInput {
  activityType: string;
  args: unknown[];
  headers: Record<string, unknown>;
  options: Record<string, unknown>;
  seq: number;
}

/**
 * Minimal interface for child workflow input (compatible with Temporal's StartChildWorkflowExecutionInput)
 */
export interface StartChildWorkflowExecutionInput {
  workflowType: string;
  args: unknown[];
  headers: Record<string, unknown>;
  options: Record<string, unknown>;
  seq: number;
}

/**
 * Next function type for interceptor chain
 */
export type Next<T> = (input: T) => Promise<unknown>;

/**
 * Graph interceptor interface - subset of WorkflowOutboundCallsInterceptor
 */
export interface GraphInterceptor {
  scheduleActivity(
    input: ActivityInput,
    next: Next<ActivityInput>
  ): Promise<unknown>;

  startChildWorkflowExecution(
    input: StartChildWorkflowExecutionInput,
    next: Next<StartChildWorkflowExecutionInput>
  ): Promise<unknown>;
}

/**
 * Creates a workflow outbound interceptor that captures activity and
 * child workflow calls for graph building.
 */
export function createGraphInterceptor(): GraphInterceptor {
  return {
    async scheduleActivity(
      input: ActivityInput,
      next: Next<ActivityInput>
    ): Promise<unknown> {
      if (!graphContext.isBuildingGraph) {
        return next(input);
      }

      // Record the activity as a node
      const node: GraphNode = {
        id: `activity-${input.seq}-${Date.now()}`,
        name: input.activityType,
        type: 'activity',
      };

      graphContext.addNode(node);

      // Return mocked result (undefined) - don't actually execute
      return undefined;
    },

    async startChildWorkflowExecution(
      input: StartChildWorkflowExecutionInput,
      next: Next<StartChildWorkflowExecutionInput>
    ): Promise<unknown> {
      if (!graphContext.isBuildingGraph) {
        return next(input);
      }

      // Record the child workflow as a node
      const node: GraphNode = {
        id: `child-${input.seq}-${Date.now()}`,
        name: input.workflowType,
        type: 'childWorkflow',
        childWorkflowType: input.workflowType,
      };

      graphContext.addNode(node);

      // Return mocked child workflow handle
      return {
        workflowId: `mocked-${input.workflowType}`,
        result: async () => undefined,
        signal: async () => undefined,
      };
    },
  };
}
