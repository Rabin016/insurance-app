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
  premiumRate: number; // auto-filled from matrix, e.g. 0.15 (%)
  sumInsured: string;  // BDT amount as string (user input)
}

export interface PremiumResult {
  basePremium: number;        // Sum of (sumInsured × premiumRate%) for all premises
  rsdSurcharge: number;       // RSD surcharge if enabled
  totalPremium: number;       // basePremium + rsdSurcharge
  totalSumInsured: number;    // Total BDT across all premises
  vatAmount: number;          // Placeholder VAT (demo)
  netPremium: number;         // totalPremium + vatAmount (demo)
}

// ─────────────────────────────────────────────────────────────────────────────
// Get premium rate from the matrix
// Returns the rate as a percentage number (e.g. 0.15)
// ─────────────────────────────────────────────────────────────────────────────
export function getPremiumRate(
  riskClass: RiskClass | null,
  occupancyType: OccupancyType | null
): number {
  if (!riskClass || !occupancyType) return 0;
  return PREMIUM_RATE_MATRIX[riskClass]?.[occupancyType] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculate the maximum allowed total sum insured across all premises
// = limitAmount × (1 - bankTolerance / 100)
// ─────────────────────────────────────────────────────────────────────────────
export function getMaxSumInsured(
  limitAmount: number,
  bankTolerance: number
): number {
  if (limitAmount <= 0) return 0;
  return limitAmount * (1 - bankTolerance / 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Validate that total sum insured across all premises does not exceed cap
// ─────────────────────────────────────────────────────────────────────────────
export function validateSumInsured(
  premises: PremisesEntry[],
  limitAmount: number,
  bankTolerance: number
): { valid: boolean; message: string; cap: number; total: number } {
  const cap = getMaxSumInsured(limitAmount, bankTolerance);
  const total = premises.reduce(
    (sum, p) => sum + (parseFloat(p.sumInsured) || 0),
    0
  );

  if (total > cap && cap > 0) {
    return {
      valid: false,
      message: `Total sum insured (BDT ${formatCurrency(total)}) exceeds cap of BDT ${formatCurrency(cap)}`,
      cap,
      total,
    };
  }
  return { valid: true, message: "", cap, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main premium calculation
// Formula will be updated once the user provides the exact formula.
// Currently uses: Premium = SumInsured × (premiumRate / 100)
//                 RSD = SumInsured × (0.075 / 100) if enabled
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePremium(
  premises: PremisesEntry[],
  rsdEnabled: boolean
): PremiumResult {
  let basePremium = 0;
  let totalSumInsured = 0;

  for (const p of premises) {
    const si = parseFloat(p.sumInsured) || 0;
    totalSumInsured += si;
    basePremium += si * (p.premiumRate / 100);
  }

  const rsdSurcharge = rsdEnabled
    ? totalSumInsured * (RSD_SURCHARGE_RATE / 100)
    : 0;

  const totalPremium = basePremium + rsdSurcharge;

  // Demo VAT at 15% — will be updated with real formula later
  const vatAmount = totalPremium * 0.15;
  const netPremium = totalPremium + vatAmount;

  return {
    basePremium,
    rsdSurcharge,
    totalPremium,
    totalSumInsured,
    vatAmount,
    netPremium,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format a number as BDT currency string
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
