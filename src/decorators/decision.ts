// src/decorators/decision.ts

import 'reflect-metadata';
import { DECISION_METADATA_KEY, type DecisionMetadata } from '../types.js';

export interface DecisionOptions {
  positiveLabel?: string;
  negativeLabel?: string;
}

/**
 * Decorator to mark an activity as a decision point.
 * Decision activities must return boolean and will trigger
 * branch exploration during graph building.
 *
 * @example
 * ```typescript
 * class MyActivities {
 *   @Decision()
 *   async isHighValue(amount: number): Promise<boolean> {
 *     return amount > 10000;
 *   }
 *
 *   @Decision({ positiveLabel: 'Approved', negativeLabel: 'Rejected' })
 *   async checkApproval(): Promise<boolean> {
 *     return true;
 *   }
 * }
 * ```
 */
export function Decision(options?: DecisionOptions): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const metadata: DecisionMetadata = {
      positiveLabel: options?.positiveLabel ?? 'yes',
      negativeLabel: options?.negativeLabel ?? 'no',
    };

    // Store metadata on the class prototype
    const metadataMap: Map<string | symbol, DecisionMetadata> =
      Reflect.getOwnMetadata(DECISION_METADATA_KEY, target) ?? new Map();

    metadataMap.set(propertyKey, metadata);
    Reflect.defineMetadata(DECISION_METADATA_KEY, metadataMap, target);

    return descriptor;
  };
}

/**
 * Check if a method on an object is marked as a decision
 */
export function isDecision(obj: object, methodName: string): boolean {
  const metadataMap: Map<string, DecisionMetadata> | undefined =
    Reflect.getOwnMetadata(DECISION_METADATA_KEY, Object.getPrototypeOf(obj));
  return metadataMap?.has(methodName) ?? false;
}

/**
 * Get decision metadata for a method
 */
export function getDecisionMetadata(
  obj: object,
  methodName: string
): DecisionMetadata | undefined {
  const metadataMap: Map<string, DecisionMetadata> | undefined =
    Reflect.getOwnMetadata(DECISION_METADATA_KEY, Object.getPrototypeOf(obj));
  return metadataMap?.get(methodName);
}
