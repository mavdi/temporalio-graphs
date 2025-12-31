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
export {
  createGraphInterceptor,
  createGraphBuildingInterceptors,
} from './interceptor/index.js';
export type {
  GraphInterceptor,
  ActivityInput,
  StartChildWorkflowExecutionInput,
  WorkflowInterceptors,
  WorkflowInterceptorsFactory,
} from './interceptor/index.js';
export { generateMermaid, generatePathDescriptions } from './generator/index.js';
export {
  generateDecisionPermutations,
  buildGraphFromPaths,
  buildGraph,
} from './builder/index.js';
export type { BuildGraphOptions } from './builder/index.js';
