// src/index.ts
import 'reflect-metadata';

export * from './types.js';
export { graphContext } from './context.js';
export { Decision, isDecision, getDecisionMetadata } from './decorators/index.js';
export type { DecisionOptions } from './decorators/index.js';

// Will export more as we build:
// export { GraphBuilder } from './interceptor/index.js';
// export { toDecision } from './decorators/index.js';
// export { generateGraph, buildGraph } from './builder/index.js';
