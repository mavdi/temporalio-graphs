// examples/money-transfer/build-graph.ts

import { buildGraph, generateViewerHtml, createMockActivities } from 'temporalio-graphs';
import { MoneyTransferActivities } from './activities.js';
import * as fs from 'fs';

// Create mock activities for graph building
const mockActivitiesInstance = new MoneyTransferActivities();
const activities = createMockActivities<MoneyTransferActivities>({
  activitiesClass: mockActivitiesInstance,
});

// Inline workflow definition using mock activities
async function moneyTransferWorkflow(input: {
  fromAccount: string;
  toAccount: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}): Promise<void> {
  await activities.withdraw(input.fromAccount, input.amount);

  let amount = input.amount;

  if (await activities.needsCurrencyConversion(input.fromCurrency, input.toCurrency)) {
    amount = await activities.convertCurrency(amount, input.fromCurrency, input.toCurrency);
  }

  if (await activities.isTaxIdKnown(input.toAccount)) {
    await activities.notifyTaxAuthority(input.toAccount, amount);
  } else {
    amount = await activities.deductWithholdingTax(amount);
  }

  await activities.deposit(input.toAccount, amount);
}

async function main() {
  const input = {
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
