/**
 * Fire Insurance Calculation Utilities
 */

import {
  OccupancyType,
  PREMIUM_RATE_MATRIX,
  RiskClass,
  RSD_SURCHARGE_RATE,
} from "../constants/fireInsurance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface PremisesEntry {
  id: string;
  riskClass: RiskClass | null;
  occupancyType: OccupancyType | null;
  premiumRate: string; // editable, can be manually overridden
  sumInsured: string;  // can be percentage (0-100) or BDT amount
  isPercentage: boolean; // toggle for SI type
  netPremium?: number; // Result for this individual premises
}

export interface PremiumResult {
  basePremium: number;           // Sum of (sumInsured * (rate / 100))
  rsdSurcharge: number;          // Surcharge (sumInsured * (0.13 / 100))
  totalNetPremium: number;       // basePremium + rsdSurcharge (VAT base)
  discountAmount: number;        // Calculated on totalNetPremium
  discountedNetPremium: number;  // Net Premium after discount
  totalSumInsured: number;       // TSI = Limit + Tolerance
  vatAmount: number;             // 15% of original totalNetPremium
  totalPremium: number;          // discountedNetPremium + vatAmount
  premisesResults: { id: string; netPremium: number; sumInsured: number; rate: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Get premium rate from the matrix (returns as number, e.g. 0.15)
// ─────────────────────────────────────────────────────────────────────────────
export function getPremiumRate(
  riskClass: RiskClass | null,
  occupancyType: OccupancyType | null
): number {
  if (!riskClass || !occupancyType) return 0;
  return PREMIUM_RATE_MATRIX[riskClass]?.[occupancyType] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculate Total Sum Insured (TSI)
// TSI = Limit Amount + Bank Tolerance %
// ─────────────────────────────────────────────────────────────────────────────
export function calculateTSI(
  limitAmount: number,
  bankTolerance: number
): number {
  if (limitAmount <= 0) return 0;
  return limitAmount * (1 + bankTolerance / 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main premium calculation based on formula.md and minorChanges.md
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePremium(
  premises: PremisesEntry[],
  limitAmount: number,
  bankTolerance: number,
  rsdEnabled: boolean,
  discountPercent: number = 0
): PremiumResult {
  const tsi = calculateTSI(limitAmount, bankTolerance);
  let totalNetPremium = 0;
  let basePremiumSum = 0;
  let rsdSurchargeSum = 0;
  
  const premisesResults = premises.map((p) => {
    const inputVal = parseFloat(p.sumInsured) || 0;
    const rateVal = parseFloat(p.premiumRate) || 0;
    const rsdRate = rsdEnabled ? RSD_SURCHARGE_RATE / 100 : 0;
    
    // Premises sum insured based on mode
    const premisesSI = p.isPercentage ? tsi * (inputVal / 100) : inputVal;
    
    // Premises net premium calculation
    // Net Premium = SI * (Rate% + RSD%)
    const premisesNet = premisesSI * (rateVal / 100 + rsdRate);
    
    totalNetPremium += premisesNet;
    basePremiumSum += premisesSI * (rateVal / 100);
    rsdSurchargeSum += premisesSI * rsdRate;

    return {
      id: p.id,
      netPremium: premisesNet,
      sumInsured: premisesSI,
      rate: rateVal,
    };
  });

  // VAT (15% on Original Net Premium)
  const vatAmount = Math.round(totalNetPremium * 0.15);

  // Discount Logic
  const discountAmount = Math.round(totalNetPremium * (discountPercent / 100));
  const discountedNetPremium = totalNetPremium - discountAmount;

  // Final Total: Discounted Net + Original VAT
  const totalPremium = discountedNetPremium + vatAmount;

  return {
    basePremium: basePremiumSum,
    rsdSurcharge: rsdSurchargeSum,
    totalNetPremium,
    discountAmount,
    discountedNetPremium,
    totalSumInsured: tsi,
    vatAmount,
    totalPremium,
    premisesResults,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format individual components for display
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
