// src/context.ts

import type { GraphBuildingContext, GraphNode } from './types.js';

/**
 * Global context for graph building - accessed by interceptor and decorators
 */
class GraphContext {
  private _context: GraphBuildingContext | null = null;
  private _currentPath: GraphNode[] = [];
  private _allPaths: GraphNode[][] = [];
  private _decisionIndex = 0;
  private _decisionPlan: boolean[] = [];

  get isBuildingGraph(): boolean {
    return this._context?.isBuildingGraph ?? false;
  }

  get context(): GraphBuildingContext | null {
    return this._context;
  }

  set context(ctx: GraphBuildingContext | null) {
    this._context = ctx;
  }

  get currentPath(): GraphNode[] {
    return this._currentPath;
  }

  set currentPath(path: GraphNode[]) {
    this._currentPath = path;
  }

  get allPaths(): GraphNode[][] {
    return this._allPaths;
  }

  get decisionPlan(): boolean[] {
    return this._decisionPlan;
  }

  get decisionIndex(): number {
    return this._decisionIndex;
  }

  set decisionIndex(index: number) {
    this._decisionIndex = index;
  }

  set decisionPlan(plan: boolean[]) {
    this._decisionPlan = plan;
    this._decisionIndex = 0;
  }

  /**
   * Get next decision result from the plan
   */
  getNextDecision(): boolean {
    const index = this._decisionIndex++;
    if (index >= this._decisionPlan.length) {
      // Default to true if we run out of planned decisions
      return true;
    }
    return this._decisionPlan[index];
  }

  /**
   * Add a node to the current execution path
   */
  addNode(node: GraphNode): void {
    this._currentPath.push(node);
  }

  /**
   * Save current path and reset for next permutation
   */
  savePath(): void {
    if (this._currentPath.length > 0) {
      this._allPaths.push([...this._currentPath]);
    }
    this._currentPath = [];
    this._decisionIndex = 0;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this._context = null;
    this._currentPath = [];
    this._allPaths = [];
    this._decisionIndex = 0;
    this._decisionPlan = [];
  }
}

export const graphContext = new GraphContext();
