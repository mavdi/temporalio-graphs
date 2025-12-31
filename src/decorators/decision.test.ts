// src/decorators/decision.test.ts

import { describe, it, expect } from 'vitest';
import { Decision, getDecisionMetadata, isDecision } from './decision.js';

describe('Decision decorator', () => {
  it('marks a function as a decision', () => {
    class TestActivities {
      @Decision()
      async isHighValue(amount: number): Promise<boolean> {
        return amount > 1000;
      }
    }

    const activities = new TestActivities();
    expect(isDecision(activities, 'isHighValue')).toBe(true);
  });

  it('stores custom labels', () => {
    class TestActivities {
      @Decision({ positiveLabel: 'Approved', negativeLabel: 'Rejected' })
      async checkApproval(): Promise<boolean> {
        return true;
      }
    }

    const activities = new TestActivities();
    const metadata = getDecisionMetadata(activities, 'checkApproval');
    expect(metadata?.positiveLabel).toBe('Approved');
    expect(metadata?.negativeLabel).toBe('Rejected');
  });

  it('uses yes/no as default labels', () => {
    class TestActivities {
      @Decision()
      async shouldProceed(): Promise<boolean> {
        return true;
      }
    }

    const activities = new TestActivities();
    const metadata = getDecisionMetadata(activities, 'shouldProceed');
    expect(metadata?.positiveLabel).toBe('yes');
    expect(metadata?.negativeLabel).toBe('no');
  });
});
