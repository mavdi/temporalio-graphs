// examples/fintech-pipeline/build-graph.ts

import { buildGraph, generateViewerHtml, createMockActivities } from 'temporalio-graphs';
import { PipelineActivities } from './activities.js';
import * as fs from 'fs';

// Create mock activities for graph building
const mockActivitiesInstance = new PipelineActivities();
const activities = createMockActivities<PipelineActivities>({
  activitiesClass: mockActivitiesInstance,
});

// Inline workflow definition using mock activities
async function dailyPipelineWorkflow(input: { date: string }): Promise<{
  date: string;
  priceSync: { count: number } | null;
  validation: { validated: number } | null;
  aggregations: { channels: number; tickers: number } | null;
  features: { features: number } | null;
  skipped: boolean;
}> {
  const result = {
    date: input.date,
    priceSync: null as { count: number } | null,
    validation: null as { validated: number } | null,
    aggregations: null as { channels: number; tickers: number } | null,
    features: null as { features: number } | null,
    skipped: false,
  };

  // Skip weekends
  if (!(await activities.isWeekday(input.date))) {
    result.skipped = true;
    return result;
  }

  // Phase 1: Sync prices
  result.priceSync = await activities.syncPrices(input.date);

  // Phase 2: Validate mentions
  result.validation = await activities.validateMentions(input.date);

  // Phase 3: Build aggregations
  result.aggregations = await activities.buildAggregations(input.date);

  // Phase 4: Build features
  result.features = await activities.buildFeatures(input.date);

  return result;
}

async function main() {
  const input = {
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
