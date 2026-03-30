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
  tsiInForeign: number;      // Limit + Tolerance (in Foreign Currency)
  tsiInBDT: number;          // tsiInForeign * Currency Rate
  marinePremium: number;     // TSI * Marine Rate% (Rounded)
  warSurcharge: number;      // TSI * WAR% (Rounded)
  netPremium: number;        // marinePremium + warSurcharge (VAT Base)
  discountAmount: number;    // Calculated on netPremium
  discountedNetPremium: number; // Net Premium after discount
  vatAmount: number;         // 15% of original netPremium (Rounded)
  stampDuty: number;         // SI-based or fixed 50 for Land/Air
  totalPremium: number;      // discountedNetPremium + vatAmount + stampDuty
  currencyRate: number;
  marineRate: number;        // For display
  warRate: number;           // For display (if enabled)
  discountPercent: number;   // For display
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
// Main calculation based on PDF Cover Notes logic and minorChanges.md
// ─────────────────────────────────────────────────────────────────────────────
export function calculateMarinePremium(
  limitAmount: number,
  bankTolerance: number,
  currencyRate: number,
  premiumRate: number,
  warEnabled: boolean,
  transportMode: TransportMode,
  discountPercent: number = 0
): MarineResult {
  // 1. Total Sum Insured (TSI)
  const tsiForeign = limitAmount * (1 + bankTolerance / 100);
  const tsiBDT = tsiForeign * currencyRate;
  
  // 2. Core Premiums (Rounded each independently per PDF Examples)
  const marinePremium = Math.round(tsiBDT * (premiumRate / 100));
  const warRateActual = warEnabled ? WAR_SRCC_RATE : 0;
  const warSurcharge = Math.round(tsiBDT * (warRateActual / 100));
  
  // 3. Net Premium (VAT is calculated on this original amount)
  const netPremium = marinePremium + warSurcharge;
  
  // 4. VAT (15% on Original Net Premium)
  const vatAmount = Math.round(netPremium * 0.15);
  
  // 5. Discount Logic (Reduces the Net Premium payable)
  const discountAmount = Math.round(netPremium * (discountPercent / 100));
  const discountedNetPremium = netPremium - discountAmount;
  
  // 6. Stamp Duty Calculation
  // Fix: For Land and Air, stamp duty is always 50 Taka.
  let stampDuty = 0;
  if (transportMode === "LAND" || transportMode === "AIR") {
    stampDuty = 50;
  } else {
    const stampDutyLimit = 100000;
    stampDuty = (Math.ceil(tsiBDT / stampDutyLimit) * 10) + 10;
  }

  // 7. Final Total
  const totalPremium = discountedNetPremium + vatAmount + stampDuty;

  return {
    tsiInForeign: tsiForeign,
    tsiInBDT: tsiBDT,
    marinePremium,
    warSurcharge,
    netPremium,
    discountAmount,
    discountedNetPremium,
    vatAmount,
    stampDuty,
    totalPremium,
    currencyRate,
    marineRate: premiumRate,
    warRate: warRateActual,
    discountPercent,
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
