// src/interceptor/interceptorFactory.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { graphContext } from '../context.js';
import { createGraphBuildingInterceptors } from './interceptorFactory.js';

describe('createGraphBuildingInterceptors', () => {
  beforeEach(() => {
    graphContext.reset();
  });

  afterEach(() => {
    graphContext.reset();
  });

  it('returns an interceptors function for workflow registration', () => {
    graphContext.context = { isBuildingGraph: true };
    const interceptors = createGraphBuildingInterceptors();

    expect(typeof interceptors).toBe('function');

    const result = interceptors();
    expect(result).toHaveProperty('outbound');
    expect(Array.isArray(result.outbound)).toBe(true);
    expect(result.outbound.length).toBeGreaterThan(0);
  });

  it('returns empty outbound when not building graph', () => {
    graphContext.context = { isBuildingGraph: false };
    const interceptors = createGraphBuildingInterceptors();
    const result = interceptors();

    expect(result.outbound).toEqual([]);
  });
});
