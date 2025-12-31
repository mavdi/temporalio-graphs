// src/generator/mermaid.ts

import type { GraphPath, GraphNode } from '../types.js';

interface MermaidOptions {
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  splitNamesByWords?: boolean;
}

/**
 * Generates Mermaid flowchart syntax from workflow execution paths.
 */
export function generateMermaid(
  paths: GraphPath[],
  options: MermaidOptions = {}
): string {
  const { direction = 'LR', splitNamesByWords = false } = options;

  const lines: string[] = [`flowchart ${direction}`];
  const edges = new Set<string>();
  const nodeDefinitions = new Map<string, string>();

  for (const path of paths) {
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      const nodeName = splitNamesByWords ? splitCamelCase(node.name) : node.name;

      // Define node shape based on type
      if (!nodeDefinitions.has(node.name)) {
        nodeDefinitions.set(node.name, getNodeDefinition(node, nodeName));
      }

      // Create edge to next node
      if (i < path.length - 1) {
        const nextNode = path[i + 1];
        const edgeLabel = node.type === 'decision' ? ` -- ${node.branch} ` : ' ';
        const edgeKey = `${node.name}${edgeLabel}${nextNode.name}`;

        if (!edges.has(edgeKey)) {
          edges.add(edgeKey);
          const nextNodeName = splitNamesByWords
            ? splitCamelCase(nextNode.name)
            : nextNode.name;
          const nextNodeDef = getNodeReference(nextNode, nextNodeName);

          if (node.type === 'decision') {
            lines.push(
              `${getNodeReference(node, nodeName)} -- ${node.branch} --> ${nextNodeDef}`
            );
          } else {
            lines.push(`${getNodeReference(node, nodeName)} --> ${nextNodeDef}`);
          }
        }
      }
    }
  }

  return lines.join('\n');
}

function getNodeDefinition(node: GraphNode, displayName: string): string {
  switch (node.type) {
    case 'start':
      return 's((Start))';
    case 'end':
      return 'e((End))';
    case 'decision':
      return `${sanitizeName(node.name)}{${displayName}}`;
    case 'childWorkflow':
      return `${sanitizeName(node.name)}[[${displayName}]]`;
    case 'activity':
    default:
      return `${sanitizeName(node.name)}[${displayName}]`;
  }
}

function getNodeReference(node: GraphNode, displayName: string): string {
  switch (node.type) {
    case 'start':
      return 's((Start))';
    case 'end':
      return 'e((End))';
    case 'decision':
      return `${sanitizeName(node.name)}{${displayName}}`;
    case 'childWorkflow':
      return `${sanitizeName(node.name)}[[${displayName}]]`;
    case 'activity':
    default:
      return sanitizeName(node.name);
  }
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

function splitCamelCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Generates human-readable path descriptions.
 */
export function generatePathDescriptions(paths: GraphPath[]): string[] {
  return paths.map((path) =>
    path.map((node) => {
      if (node.type === 'decision') {
        return `${node.name}:${node.branch}`;
      }
      return node.name;
    }).join(' > ')
  );
}
