// examples/fintech-pipeline/workflows.ts

import { proxyActivities } from '@temporalio/workflow';
import { createGraphBuildingInterceptors } from 'temporalio-graphs';
import type { PipelineActivities } from './activities.js';

const activities = proxyActivities<PipelineActivities>({
  startToCloseTimeout: '10m',
});

export const interceptors = createGraphBuildingInterceptors();

export interface PipelineInput {
  date: string;
}

export interface PipelineResult {
  date: string;
  priceSync: { count: number } | null;
  validation: { validated: number } | null;
  aggregations: { channels: number; tickers: number } | null;
  features: { features: number } | null;
  skipped: boolean;
}

export async function dailyPipelineWorkflow(input: PipelineInput): Promise<PipelineResult> {
  const result: PipelineResult = {
    date: input.date,
    priceSync: null,
    validation: null,
    aggregations: null,
    features: null,
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
