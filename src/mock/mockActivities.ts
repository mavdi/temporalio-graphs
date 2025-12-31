// src/mock/mockActivities.ts

import { graphContext } from '../context.js';
import { isDecision, getDecisionMetadata } from '../decorators/decision.js';
import type { GraphNode } from '../types.js';

/**
 * Options for mocking activities during graph building.
 */
export interface MockActivityOptions {
  /** The activities class instance (used to check for @Decision decorators) */
  activitiesClass?: object;
}

/**
 * Creates mock activities for graph building mode.
 *
 * Unlike `proxyActivities` from @temporalio/workflow, this works outside
 * the Temporal runtime and records activity calls as graph nodes.
 *
 * @example
 * ```typescript
 * import { createMockActivities, buildGraph } from 'temporalio-graphs';
 * import { MyActivities } from './activities';
 *
 * // In your graph-building script
 * const activities = createMockActivities<MyActivities>({
 *   activitiesClass: new MyActivities(),
 * });
 * ```
 */
export function createMockActivities<T extends object>(
  options: MockActivityOptions = {}
): T {
  const { activitiesClass } = options;
  let callSeq = 0;

  return new Proxy({} as T, {
    get(_target, prop: string) {
      // Return a function that records the activity call
      return async (..._args: unknown[]): Promise<unknown> => {
        const activityName = prop;
        const seq = callSeq++;

        // Check if this activity is a decision point
        let isDecisionActivity = false;
        let decisionMeta: { positiveLabel?: string; negativeLabel?: string } | undefined;

        if (activitiesClass) {
          // isDecision expects an instance, not the prototype
          if (isDecision(activitiesClass, activityName)) {
            isDecisionActivity = true;
            decisionMeta = getDecisionMetadata(activitiesClass, activityName);
          }
        }

        if (isDecisionActivity) {
          // Get the planned decision value
          const decisionValue = graphContext.getNextDecision();

          const node: GraphNode = {
            id: `decision-${seq}-${Date.now()}`,
            name: activityName,
            type: 'decision',
            branch: decisionValue
              ? (decisionMeta?.positiveLabel || 'yes')
              : (decisionMeta?.negativeLabel || 'no'),
          };

          graphContext.addNode(node);
          return decisionValue;
        } else {
          // Regular activity
          const node: GraphNode = {
            id: `activity-${seq}-${Date.now()}`,
            name: activityName,
            type: 'activity',
          };

          graphContext.addNode(node);
          return undefined;
        }
      };
    },
  });
}
