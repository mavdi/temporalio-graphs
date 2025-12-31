// src/interceptor/interceptorFactory.ts

import { graphContext } from '../context.js';
import { createGraphInterceptor, type GraphInterceptor } from './graphInterceptor.js';

/**
 * Result of calling the interceptors factory function.
 * Contains the outbound interceptors to apply to workflows.
 */
export interface WorkflowInterceptors {
  outbound: GraphInterceptor[];
}

/**
 * Factory function type for creating workflow interceptors.
 * This is compatible with Temporal's WorkflowInterceptorsFactory type.
 */
export type WorkflowInterceptorsFactory = () => WorkflowInterceptors;

/**
 * Creates an interceptors factory function to be exported from your workflows file.
 *
 * @example
 * ```typescript
 * // In your workflows/index.ts:
 * import { createGraphBuildingInterceptors } from 'temporalio-graphs';
 *
 * export const interceptors = createGraphBuildingInterceptors();
 *
 * // Export your workflows...
 * export async function myWorkflow() { ... }
 * ```
 */
export function createGraphBuildingInterceptors(): WorkflowInterceptorsFactory {
  return () => {
    if (!graphContext.isBuildingGraph) {
      return { outbound: [] };
    }

    return {
      outbound: [createGraphInterceptor()],
    };
  };
}
