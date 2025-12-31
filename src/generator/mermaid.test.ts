// src/generator/mermaid.test.ts

import { describe, it, expect } from 'vitest';
import { generateMermaid } from './mermaid.js';
import type { GraphPath } from '../types.js';

describe('generateMermaid', () => {
  it('generates flowchart for linear path', () => {
    const paths: GraphPath[] = [
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'FetchData', type: 'activity' },
        { id: '3', name: 'ProcessData', type: 'activity' },
        { id: '4', name: 'End', type: 'end' },
      ],
    ];

    const result = generateMermaid(paths);

    expect(result).toContain('flowchart LR');
    expect(result).toContain('s((Start))');
    expect(result).toContain('FetchData');
    expect(result).toContain('ProcessData');
    expect(result).toContain('e((End))');
    expect(result).toContain('-->');
  });

  it('generates diamond nodes for decisions', () => {
    const paths: GraphPath[] = [
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'IsValid', type: 'decision', branch: 'yes' },
        { id: '3', name: 'Process', type: 'activity' },
        { id: '4', name: 'End', type: 'end' },
      ],
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'IsValid', type: 'decision', branch: 'no' },
        { id: '5', name: 'RejectInput', type: 'activity' },
        { id: '4', name: 'End', type: 'end' },
      ],
    ];

    const result = generateMermaid(paths);

    expect(result).toContain('{IsValid}');
    expect(result).toContain('-- yes -->');
    expect(result).toContain('-- no -->');
  });

  it('handles child workflows with subgraph notation', () => {
    const paths: GraphPath[] = [
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'ProcessPayment', type: 'childWorkflow', childWorkflowType: 'paymentWorkflow' },
        { id: '3', name: 'End', type: 'end' },
      ],
    ];

    const result = generateMermaid(paths);

    expect(result).toContain('ProcessPayment');
    expect(result).toContain('[['); // Subprogram shape for child workflows
  });

  it('deduplicates edges from multiple paths', () => {
    const paths: GraphPath[] = [
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'FetchData', type: 'activity' },
        { id: '3', name: 'End', type: 'end' },
      ],
      [
        { id: '1', name: 'Start', type: 'start' },
        { id: '2', name: 'FetchData', type: 'activity' },
        { id: '3', name: 'End', type: 'end' },
      ],
    ];

    const result = generateMermaid(paths);
    const lines = result.split('\n');

    // Count edge lines (lines containing -->)
    const edgeLines = lines.filter((l) => l.includes('-->'));

    // Should have exactly 2 edges: Start->FetchData and FetchData->End
    // Duplicate paths should NOT create duplicate edge lines
    expect(edgeLines).toHaveLength(2);

    // Verify no duplicate lines exist
    const uniqueEdgeLines = [...new Set(edgeLines)];
    expect(uniqueEdgeLines).toHaveLength(edgeLines.length);
  });
});
