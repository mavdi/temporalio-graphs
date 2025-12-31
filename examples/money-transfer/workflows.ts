// examples/money-transfer/workflows.ts

import { proxyActivities } from '@temporalio/workflow';
import { createGraphBuildingInterceptors } from 'temporalio-graphs';
import type { MoneyTransferActivities } from './activities.js';

const activities = proxyActivities<MoneyTransferActivities>({
  startToCloseTimeout: '5m',
});

export const interceptors = createGraphBuildingInterceptors();

export interface TransferInput {
  fromAccount: string;
  toAccount: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export async function moneyTransferWorkflow(input: TransferInput): Promise<void> {
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
