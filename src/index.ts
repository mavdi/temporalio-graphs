// src/index.ts
import 'reflect-metadata';

export * from './types.js';
export { graphContext } from './context.js';
export {
  Decision,
  isDecision,
  getDecisionMetadata,
  toDecision,
} from './decorators/index.js';
export type { DecisionOptions, ToDecisionOptions } from './decorators/index.js';
export { createGraphInterceptor } from './interceptor/index.js';
export type {
  GraphInterceptor,
  ActivityInput,
  StartChildWorkflowExecutionInput,
} from './interceptor/index.js';

// Will export more as we build:
// export { generateGraph, buildGraph } from './builder/index.js';
