// examples/fintech-pipeline/build-graph.ts

import { buildGraph, generateViewerHtml } from 'temporalio-graphs';
import { dailyPipelineWorkflow, type PipelineInput } from './workflows.js';
import * as fs from 'fs';

async function main() {
  const input: PipelineInput = {
    date: '2025-01-02', // Thursday
  };

  console.log('Building workflow graph...');

  const result = await buildGraph(dailyPipelineWorkflow, {
    workflowArgs: [input],
    splitNamesByWords: true,
  });

  // Write Mermaid to file
  fs.writeFileSync('workflow.mermaid', result.mermaid);
  console.log('Mermaid diagram saved to workflow.mermaid');

  // Write interactive HTML viewer
  const html = generateViewerHtml(result.mermaid, 'Daily Pipeline Workflow');
  fs.writeFileSync('workflow.html', html);
  console.log('Interactive viewer saved to workflow.html');

  // Print paths
  console.log('\nExecution paths:');
  result.pathDescriptions.forEach((path, i) => {
    console.log(`  ${i + 1}. ${path}`);
  });
}

main().catch(console.error);
