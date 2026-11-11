import { FeeBreakdown } from '../types';

/**
 * Statutory Nigerian Exchange (NGX) Transaction Fee Calculator
 * Incorporates exact official rates:
 * - SEC (Securities & Exchange Commission): 0.30%
 * - CSCS (Central Securities Clearing System): 0.35%
 * - Brokerage Commission: 0.70%
 * - Stamp Duty: 0.075%
 * - VAT on Broker Commission: 7.5% of 0.70% (~0.0525%)
 * Total statutory friction: ~1.4775%
 */
export function calculateNGXTransactionFee(orderTotal: number): FeeBreakdown {
  if (orderTotal <= 0) {
    return {
      secFee: 0,
      cscsFee: 0,
      brokerFee: 0,
      stampDuty: 0,
      vatFee: 0,
      totalFee: 0,
      totalRatePct: 1.4775,
    };
  }

  const SEC_RATE = 0.003;       // 0.30%
  const CSCS_RATE = 0.0035;     // 0.35%
  const BROKER_RATE = 0.007;    // 0.70%
  const STAMP_DUTY_RATE = 0.00075; // 0.075%
  const VAT_RATE = 0.075;       // 7.5% applied on broker commission

  const secFee = Number((orderTotal * SEC_RATE).toFixed(2));
  const cscsFee = Number((orderTotal * CSCS_RATE).toFixed(2));
  const brokerFee = Number((orderTotal * BROKER_RATE).toFixed(2));
  const stampDuty = Number((orderTotal * STAMP_DUTY_RATE).toFixed(2));
  const vatFee = Number((brokerFee * VAT_RATE).toFixed(2));

  const totalFee = Number((secFee + cscsFee + brokerFee + stampDuty + vatFee).toFixed(2));
  const totalRatePct = Number(((totalFee / orderTotal) * 100).toFixed(4));

  return {
    secFee,
    cscsFee,
    brokerFee,
    stampDuty,
    vatFee,
    totalFee,
    totalRatePct,
  };
}

/**
 * Formats a currency amount into Nigerian Naira string
 */
export function formatNaira(amount: number, compact: boolean = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `₦${(amount / 1_000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦');
}
