// src/mock/__tests__/mockActivities.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockActivities } from '../mockActivities.js';
import { graphContext } from '../../context.js';
import { Decision } from '../../decorators/decision.js';

describe('createMockActivities', () => {
  beforeEach(() => {
    graphContext.reset();
    graphContext.context = { isBuildingGraph: true, splitNamesByWords: false, maxChildDepth: 10 };
    graphContext.decisionPlan = [true, false];
  });

  it('should record activity calls as nodes', async () => {
    interface TestActivities {
      doSomething(x: number): Promise<void>;
    }

    const activities = createMockActivities<TestActivities>();
    await activities.doSomething(42);

    expect(graphContext.currentPath.length).toBe(1);
    expect(graphContext.currentPath[0].name).toBe('doSomething');
    expect(graphContext.currentPath[0].type).toBe('activity');
  });

  it('should handle decision activities with decorator', async () => {
    class MyActivities {
      @Decision({ positiveLabel: 'yes', negativeLabel: 'no' })
      async isValid(): Promise<boolean> {
        return true;
      }
    }

    interface TestActivities {
      isValid(): Promise<boolean>;
    }

    const instance = new MyActivities();
    const activities = createMockActivities<TestActivities>({
      activitiesClass: instance,
    });

    const result = await activities.isValid();

    expect(result).toBe(true); // First decision from plan is true
    expect(graphContext.currentPath.length).toBe(1);
    expect(graphContext.currentPath[0].type).toBe('decision');
    expect(graphContext.currentPath[0].branch).toBe('yes');
  });

  it('should consume decisions in order', async () => {
    class MyActivities {
      @Decision()
      async check1(): Promise<boolean> {
        return true;
      }

      @Decision()
      async check2(): Promise<boolean> {
        return true;
      }
    }

    interface TestActivities {
      check1(): Promise<boolean>;
      check2(): Promise<boolean>;
    }

    const instance = new MyActivities();
    const activities = createMockActivities<TestActivities>({
      activitiesClass: instance,
    });

    const r1 = await activities.check1(); // Gets true from plan
    const r2 = await activities.check2(); // Gets false from plan

    expect(r1).toBe(true);
    expect(r2).toBe(false);
  });

  it('should use custom labels for decisions', async () => {
    class MyActivities {
      @Decision({ positiveLabel: 'approved', negativeLabel: 'rejected' })
      async checkApproval(): Promise<boolean> {
        return true;
      }
    }

    interface TestActivities {
      checkApproval(): Promise<boolean>;
    }

    // Reset decision plan to start with false
    graphContext.decisionPlan = [false];

    const instance = new MyActivities();
    const activities = createMockActivities<TestActivities>({
      activitiesClass: instance,
    });

    const result = await activities.checkApproval();

    expect(result).toBe(false);
    expect(graphContext.currentPath[0].branch).toBe('rejected');
  });

  it('should record multiple activity calls in sequence', async () => {
    interface TestActivities {
      step1(): Promise<void>;
      step2(): Promise<void>;
      step3(): Promise<void>;
    }

    const activities = createMockActivities<TestActivities>();
    await activities.step1();
    await activities.step2();
    await activities.step3();

    expect(graphContext.currentPath.length).toBe(3);
    expect(graphContext.currentPath[0].name).toBe('step1');
    expect(graphContext.currentPath[1].name).toBe('step2');
    expect(graphContext.currentPath[2].name).toBe('step3');
  });

  it('should work without activitiesClass option', async () => {
    interface TestActivities {
      someActivity(): Promise<string>;
    }

    const activities = createMockActivities<TestActivities>();
    const result = await activities.someActivity();

    expect(result).toBeUndefined();
    expect(graphContext.currentPath.length).toBe(1);
    expect(graphContext.currentPath[0].type).toBe('activity');
  });
});
