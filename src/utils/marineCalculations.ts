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
  marinePremium: number;   // TSI * Marine Rate% (Rounded)
  warSurcharge: number;    // TSI * WAR% (Rounded)
  netPremium: number;      // marinePremium + warSurcharge
  vatAmount: number;       // 15% of netPremium (Rounded)
  stampDuty: number;       // SI-based (Rounded)
  totalPremium: number;    // netPremium + vatAmount + stampDuty
  currencyRate: number;
  marineRate: number;      // For display
  warRate: number;         // For display (if enabled)
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
// Main calculation based on PDF Cover Notes logic
// ─────────────────────────────────────────────────────────────────────────────
export function calculateMarinePremium(
  limitAmount: number,
  bankTolerance: number,
  currencyRate: number,
  premiumRate: number,
  warEnabled: boolean
): MarineResult {
  // 1. Total Sum Insured (TSI)
  const tsiForeign = limitAmount * (1 + bankTolerance / 100);
  const tsiBDT = tsiForeign * currencyRate;
  
  // 2. Core Premiums (Rounded each independently per PDF Examples)
  const marinePremium = Math.round(tsiBDT * (premiumRate / 100));
  const warRateActual = warEnabled ? WAR_SRCC_RATE : 0;
  const warSurcharge = Math.round(tsiBDT * (warRateActual / 100));
  
  // 3. Net Premium
  const netPremium = marinePremium + warSurcharge;
  
  // 4. VAT (15% Rounded per PDF Examples)
  const vatAmount = Math.round(netPremium * 0.15);
  
  // 5. Stamp Duty Calculation
  // Derived Pattern: (Math.ceil(SI / 1,00,000) * 10) + 10
  const stampDutyLimit = 100000;
  const stampDuty = (Math.ceil(tsiBDT / stampDutyLimit) * 10) + 10;

  // 6. Final Total
  const totalPremium = netPremium + vatAmount + stampDuty;

  return {
    tsiInForeign: tsiForeign,
    tsiInBDT: tsiBDT,
    marinePremium,
    warSurcharge,
    netPremium,
    vatAmount,
    stampDuty,
    totalPremium,
    currencyRate,
    marineRate: premiumRate,
    warRate: warRateActual,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers based on Fire logic
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrencyMarine(amount: number): string {
  // Use Bangladesh standard (no decimals if rounded or optional)
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format specifically for the whole number sums seen in the PDFs
 */
export function formatWholeCurrency(amount: number): string {
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
