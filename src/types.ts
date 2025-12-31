// src/types.ts

/**
 * Configuration for graph building mode
 */
export interface GraphBuildingContext {
  /** Whether graph building mode is active */
  isBuildingGraph: boolean;
  /** Exit worker after graph is built */
  exitAfterBuildingGraph?: boolean;
  /** Output file path for generated graph */
  graphOutputFile?: string;
  /** Split camelCase activity names into words */
  splitNamesByWords?: boolean;
  /** Output only Mermaid syntax (no paths) */
  mermaidOnly?: boolean;
  /** Maximum depth for child workflow recursion (default: 10) */
  maxChildDepth?: number;
}

/**
 * Represents a single node in the workflow graph
 */
export interface GraphNode {
  id: string;
  name: string;
  type: 'activity' | 'decision' | 'childWorkflow' | 'start' | 'end';
  /** For decisions: the branch taken (yes/no) */
  branch?: string;
  /** For child workflows: the child workflow type */
  childWorkflowType?: string;
}

/**
 * Represents an edge between two nodes
 */
export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

/**
 * A complete execution path through the workflow
 */
export type GraphPath = GraphNode[];

/**
 * Result of graph generation
 */
export interface GraphResult {
  /** All captured execution paths */
  paths: GraphPath[];
  /** Unique edges in the graph */
  edges: GraphEdge[];
  /** Mermaid syntax output */
  mermaid: string;
  /** Human-readable path descriptions */
  pathDescriptions: string[];
}

/**
 * Metadata stored on decision-marked activities
 */
export interface DecisionMetadata {
  positiveLabel?: string;
  negativeLabel?: string;
}

/**
 * Symbol key for storing decision metadata */
export const DECISION_METADATA_KEY = Symbol('temporalio-graphs:decision');
