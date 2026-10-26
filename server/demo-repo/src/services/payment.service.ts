import { logError, logInfo } from '../utils/logger.js';

export interface PaymentReceipt {
  transactionId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'declined' | 'failed';
  processedAt: string;
}

export async function processCharge(amount: number, currency = 'USD'): Promise<PaymentReceipt> {
  logInfo(`Processing payment charge: ${amount} ${currency}`);

  if (amount <= 0) {
    logError('Attempted negative charge');
    throw new Error('Payment amount must be greater than zero');
  }

  // Simulated gateway processing
  const txId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    transactionId: txId,
    amount,
    currency,
    status: 'succeeded',
    processedAt: new Date().toISOString(),
  };
}

export async function refundCharge(transactionId: string): Promise<boolean> {
  logInfo(`Initiating refund for transaction: ${transactionId}`);
  return true;
}
