// examples/fintech-pipeline/activities.ts

import { Decision } from 'temporalio-graphs';

export class PipelineActivities {
  async syncPrices(date: string): Promise<{ count: number }> {
    console.log(`Syncing prices for ${date}`);
    return { count: 100 };
  }

  async validateMentions(date: string): Promise<{ validated: number }> {
    console.log(`Validating mentions for ${date}`);
    return { validated: 50 };
  }

  async buildAggregations(date: string): Promise<{ channels: number; tickers: number }> {
    console.log(`Building aggregations for ${date}`);
    return { channels: 10, tickers: 200 };
  }

  async buildFeatures(date: string): Promise<{ features: number }> {
    console.log(`Building features for ${date}`);
    return { features: 500 };
  }

  @Decision({ positiveLabel: 'weekday', negativeLabel: 'weekend' })
  async isWeekday(date: string): Promise<boolean> {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6;
  }
}
