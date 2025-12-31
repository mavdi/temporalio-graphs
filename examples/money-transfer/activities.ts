// examples/money-transfer/activities.ts

import { Decision } from 'temporalio-graphs';

export class MoneyTransferActivities {
  async withdraw(accountId: string, amount: number): Promise<void> {
    console.log(`Withdrawing ${amount} from ${accountId}`);
  }

  async deposit(accountId: string, amount: number): Promise<void> {
    console.log(`Depositing ${amount} to ${accountId}`);
  }

  @Decision({ positiveLabel: 'yes', negativeLabel: 'no' })
  async needsCurrencyConversion(
    fromCurrency: string,
    toCurrency: string
  ): Promise<boolean> {
    return fromCurrency !== toCurrency;
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
    return amount * 1.1; // Mock conversion rate
  }

  @Decision({ positiveLabel: 'known', negativeLabel: 'unknown' })
  async isTaxIdKnown(accountId: string): Promise<boolean> {
    return accountId.startsWith('TAX');
  }

  async notifyTaxAuthority(accountId: string, amount: number): Promise<void> {
    console.log(`Notifying tax authority for ${accountId}: ${amount}`);
  }

  async deductWithholdingTax(amount: number): Promise<number> {
    console.log(`Deducting 30% withholding tax from ${amount}`);
    return amount * 0.7;
  }
}
