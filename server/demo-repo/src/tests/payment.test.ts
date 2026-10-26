import { processCharge, refundCharge } from '../services/payment.service.js';

export async function runPaymentTests(): Promise<boolean> {
  const receipt = await processCharge(150.0);
  if (receipt.status !== 'succeeded') {
    throw new Error('Payment charge should succeed');
  }

  const refunded = await refundCharge(receipt.transactionId);
  if (!refunded) {
    throw new Error('Refund failed');
  }

  return true;
}
