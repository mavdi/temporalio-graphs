// src/interceptor/graphInterceptor.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { graphContext } from '../context.js';
import { createGraphInterceptor } from './graphInterceptor.js';

describe('GraphInterceptor', () => {
  beforeEach(() => {
    graphContext.reset();
    graphContext.context = { isBuildingGraph: true };
  });

  afterEach(() => {
    graphContext.reset();
  });

  it('records activity calls as nodes', async () => {
    const interceptor = createGraphInterceptor();
    const mockNext = async () => 'result';

    await interceptor.scheduleActivity(
      {
        activityType: 'processPayment',
        args: [100],
        headers: {},
        options: {},
        seq: 1,
      },
      mockNext
    );

    expect(graphContext.currentPath).toHaveLength(1);
    expect(graphContext.currentPath[0]).toMatchObject({
      name: 'processPayment',
      type: 'activity',
    });
  });

  it('records child workflow calls as nodes', async () => {
    const interceptor = createGraphInterceptor();
    const mockNext = async () => ({ workflowId: 'child-123', result: async () => 'done' });

    await interceptor.startChildWorkflowExecution(
      {
        workflowType: 'processRefundWorkflow',
        args: [],
        headers: {},
        options: {},
        seq: 1,
      },
      mockNext
    );

    expect(graphContext.currentPath).toHaveLength(1);
    expect(graphContext.currentPath[0]).toMatchObject({
      name: 'processRefundWorkflow',
      type: 'childWorkflow',
      childWorkflowType: 'processRefundWorkflow',
    });
  });

  it('returns mocked result for activities during graph building', async () => {
    const interceptor = createGraphInterceptor();
    let nextCalled = false;
    const mockNext = async () => {
      nextCalled = true;
      return 'real-result';
    };

    const result = await interceptor.scheduleActivity(
      {
        activityType: 'fetchData',
        args: [],
        headers: {},
        options: {},
        seq: 1,
      },
      mockNext
    );

    expect(nextCalled).toBe(false); // Activity not actually called
    expect(result).toBeUndefined(); // Mocked result
  });

  it('passes through when not building graph', async () => {
    graphContext.context = { isBuildingGraph: false };
    const interceptor = createGraphInterceptor();
    let nextCalled = false;
    const mockNext = async () => {
      nextCalled = true;
      return 'real-result';
    };

    const result = await interceptor.scheduleActivity(
      {
        activityType: 'fetchData',
        args: [],
        headers: {},
        options: {},
        seq: 1,
      },
      mockNext
    );

    expect(nextCalled).toBe(true);
    expect(result).toBe('real-result');
  });
});
