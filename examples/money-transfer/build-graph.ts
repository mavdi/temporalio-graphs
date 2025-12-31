// examples/money-transfer/build-graph.ts

import { buildGraph, generateViewerHtml } from 'temporalio-graphs';
import { moneyTransferWorkflow, type TransferInput } from './workflows.js';
import * as fs from 'fs';

async function main() {
  const input: TransferInput = {
    fromAccount: 'ACC001',
    toAccount: 'ACC002',
    amount: 1000,
    fromCurrency: 'USD',
    toCurrency: 'EUR',
  };

  console.log('Building workflow graph...');

  const result = await buildGraph(moneyTransferWorkflow, {
    workflowArgs: [input],
    splitNamesByWords: true,
  });

  // Write Mermaid to file
  fs.writeFileSync('workflow.mermaid', result.mermaid);
  console.log('Mermaid diagram saved to workflow.mermaid');

  // Write interactive HTML viewer
  const html = generateViewerHtml(result.mermaid, 'Money Transfer Workflow');
  fs.writeFileSync('workflow.html', html);
  console.log('Interactive viewer saved to workflow.html');

  // Print paths
  console.log('\nExecution paths:');
  result.pathDescriptions.forEach((path, i) => {
    console.log(`  ${i + 1}. ${path}`);
  });
}

main().catch(console.error);
