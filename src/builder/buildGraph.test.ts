// src/builder/buildGraph.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { graphContext } from '../context.js';
import { buildGraphFromPaths, generateDecisionPermutations } from './buildGraph.js';

describe('generateDecisionPermutations', () => {
  it('returns single empty plan for zero decisions', () => {
    const plans = generateDecisionPermutations(0);
    expect(plans).toEqual([[]]);
  });

  it('returns 2 plans for 1 decision', () => {
    const plans = generateDecisionPermutations(1);
    expect(plans).toEqual([[true], [false]]);
  });

  it('returns 4 plans for 2 decisions', () => {
    const plans = generateDecisionPermutations(2);
    expect(plans).toHaveLength(4);
    expect(plans).toContainEqual([true, true]);
    expect(plans).toContainEqual([true, false]);
    expect(plans).toContainEqual([false, true]);
    expect(plans).toContainEqual([false, false]);
  });

  it('returns 8 plans for 3 decisions', () => {
    const plans = generateDecisionPermutations(3);
    expect(plans).toHaveLength(8);
  });
});

describe('buildGraphFromPaths', () => {
  beforeEach(() => {
    graphContext.reset();
  });

  afterEach(() => {
    graphContext.reset();
  });

  it('builds graph result from collected paths', () => {
    // Simulate collected paths
    graphContext.context = { isBuildingGraph: true };

    // Manually add paths (simulating what interceptor would do)
    graphContext.addNode({ id: '1', name: 'Start', type: 'start' });
    graphContext.addNode({ id: '2', name: 'FetchData', type: 'activity' });
    graphContext.addNode({ id: '3', name: 'End', type: 'end' });
    graphContext.savePath();

    const result = buildGraphFromPaths();

    expect(result.paths).toHaveLength(1);
    expect(result.mermaid).toContain('flowchart');
    expect(result.pathDescriptions).toHaveLength(1);
    expect(result.pathDescriptions[0]).toContain('FetchData');
  });
});
