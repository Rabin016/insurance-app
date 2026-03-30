/**
 * Marine Insurance Calculation Utilities
 */

import {
  MARINE_RATE_MATRIX,
  TransportMode,
  WAR_SRCC_RATE,
} from "../constants/marineInsurance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface MarineResult {
  tsiInForeign: number;    // Limit + Tolerance (in Foreign Currency)
  tsiInBDT: number;        // tsiInForeign * Currency Rate
  basePremium: number;     // TSI * Rate%
  warSurcharge: number;    // TSI * WAR%
  netPremium: number;      // basePremium + warSurcharge
  vatAmount: number;       // 15% of netPremium
  totalPremium: number;    // netPremium + vatAmount
  currencyRate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get premium rate for a specific mode/condition
// ─────────────────────────────────────────────────────────────────────────────
export function getMarineRate(
  transportMode: TransportMode,
  conditionValue: string | null
): number {
  if (!conditionValue) return 0;
  return MARINE_RATE_MATRIX[transportMode]?.[conditionValue] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main calculation based on appbuilddata.md and fire consistency
// ─────────────────────────────────────────────────────────────────────────────
export function calculateMarinePremium(
  limitAmount: number,
  bankTolerance: number,
  currencyRate: number,
  premiumRate: number,
  warEnabled: boolean
): MarineResult {
  const tsiForeign = limitAmount * (1 + bankTolerance / 100);
  const tsiBDT = tsiForeign * currencyRate;
  
  const basePremium = tsiBDT * (premiumRate / 100);
  const warSurcharge = warEnabled ? (tsiBDT * (WAR_SRCC_RATE / 100)) : 0;
  
  const netPremium = basePremium + warSurcharge;
  const vatAmount = netPremium * 0.15; // 15% standard VAT
  const totalPremium = netPremium + vatAmount;

  return {
    tsiInForeign: tsiForeign,
    tsiInBDT: tsiBDT,
    basePremium,
    warSurcharge,
    netPremium,
    vatAmount,
    totalPremium,
    currencyRate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers based on Fire logic
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrencyMarine(amount: number): string {
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
