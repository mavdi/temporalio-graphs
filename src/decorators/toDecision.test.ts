// src/decorators/toDecision.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toDecision } from './toDecision.js';
import { graphContext } from '../context.js';

describe('toDecision wrapper', () => {
  beforeEach(() => {
    graphContext.reset();
  });

  afterEach(() => {
    graphContext.reset();
  });

  it('returns the boolean value when not building graph', async () => {
    const result = await toDecision(true, 'Test Decision');
    expect(result).toBe(true);

    const result2 = await toDecision(false, 'Test Decision');
    expect(result2).toBe(false);
  });

  it('returns value from decision plan when building graph', async () => {
    graphContext.context = { isBuildingGraph: true };
    graphContext.decisionPlan = [true, false, true];

    const result1 = await toDecision(false, 'Decision 1');
    expect(result1).toBe(true); // From plan, not actual value

    const result2 = await toDecision(true, 'Decision 2');
    expect(result2).toBe(false); // From plan

    const result3 = await toDecision(false, 'Decision 3');
    expect(result3).toBe(true); // From plan
  });

  it('adds decision node to current path when building graph', async () => {
    graphContext.context = { isBuildingGraph: true };
    graphContext.decisionPlan = [true];

    await toDecision(false, 'Is Valid?');

    expect(graphContext.currentPath).toHaveLength(1);
    expect(graphContext.currentPath[0]).toMatchObject({
      name: 'Is Valid?',
      type: 'decision',
      branch: 'yes',
    });
  });

  it('uses custom labels for branches', async () => {
    graphContext.context = { isBuildingGraph: true };
    graphContext.decisionPlan = [false];

    await toDecision(true, 'Approval Check', {
      positiveLabel: 'Approved',
      negativeLabel: 'Rejected',
    });

    expect(graphContext.currentPath[0].branch).toBe('Rejected');
  });
});
