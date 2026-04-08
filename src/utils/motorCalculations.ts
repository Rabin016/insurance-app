/**
 * Motor Insurance Calculation Utilities
 */

import {
  CapacityClass,
  CAPACITY_RATES,
  ExclusionPeril,
  EXCLUSION_PERILS_OPTIONS,
  MOTOR_CONSTANTS,
} from "../constants/motorInsurance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface MotorResult {
  basicPremium: number;
  fivAmount: number;
  grossOwnDamage: number;

  exclusionPercent: number;
  exclusionAmount: number;
  
  ownDamagePremium: number;
  
  ncbPercent: number;
  ncbAmount: number;
  
  subTotalOwnDamage: number; // OD Premium after NCB

  liabilityPremium: number;
  passengerAmount: number;
  passengerCount: number;
  paidDriverAmount: number;

  totalNetPremium: number; // Before discount, base for VAT
  
  discountPercent: number;
  discountAmount: number;
  discountedNetPremium: number;

  vatAmount: number; // 15% on original totalNetPremium
  totalPremium: number; // Final amount
}

// ─────────────────────────────────────────────────────────────────────────────
// Format individual components for display
// ─────────────────────────────────────────────────────────────────────────────
export function formatCurrencyMotor(amount: number): string {
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Premium Calculation
// ─────────────────────────────────────────────────────────────────────────────
export function calculateMotorPremium(
  fiv: number,
  capacity: CapacityClass,
  seatingCapacity: number,
  selectedExclusions: ExclusionPeril[],
  ncbPercent: number = 0,
  discountPercent: number = 0
): MotorResult {
  // 1. Basic Premium based on capacity segment
  const basicPremium = CAPACITY_RATES[capacity] || 0;

  // 2. Plus: 2.65% on FIV
  const fivAmount = Math.round(fiv * (MOTOR_CONSTANTS.FIV_RATE_PERCENT / 100));

  // Gross Own Damage
  const grossOwnDamage = basicPremium + fivAmount;

  // 3. Less: Exclusion of Special Perils on FIV
  let exclusionPercent = 0;
  selectedExclusions.forEach((excl) => {
    const matched = EXCLUSION_PERILS_OPTIONS.find((opt) => opt.value === excl);
    if (matched) {
      exclusionPercent += matched.rate;
    }
  });
  const exclusionAmount = Math.round(fiv * (exclusionPercent / 100));

  // Own Damage Premium Before NCB
  const ownDamagePremium = grossOwnDamage - exclusionAmount;

  // 4. Less: NCB % on Own Damage Premium
  const ncbAmount = Math.round(ownDamagePremium * (ncbPercent / 100));

  // Sub Total (Net Own Damage)
  const subTotalOwnDamage = ownDamagePremium - ncbAmount;

  // 5. Liability & Passenger & Driver Components
  const liabilityPremium = MOTOR_CONSTANTS.LIABILITY_PREMIUM;
  const passengerCount = Math.max(0, seatingCapacity - 1); // Exclude driver
  const passengerAmount = passengerCount * MOTOR_CONSTANTS.PASSENGER_RATE;
  const paidDriverAmount = MOTOR_CONSTANTS.PAID_DRIVER;

  // Net Premium before discount (Tax Base)
  const totalNetPremium = subTotalOwnDamage + liabilityPremium + passengerAmount + paidDriverAmount;

  // 6. VAT 15% (calculated on Original Net Premium)
  // We use Math.round to match insurance rounding exactly
  const vatAmount = Math.round(totalNetPremium * 0.15);

  // 7. Discount Logic (reduces final payable, but doesn't reduce VAT)
  const discountAmount = Math.round(totalNetPremium * (discountPercent / 100));
  const discountedNetPremium = totalNetPremium - discountAmount;

  // 8. Gross / Final Premium
  const totalPremium = discountedNetPremium + vatAmount;

  return {
    basicPremium,
    fivAmount,
    grossOwnDamage,
    exclusionPercent,
    exclusionAmount,
    ownDamagePremium,
    ncbPercent,
    ncbAmount,
    subTotalOwnDamage,
    liabilityPremium,
    passengerAmount,
    passengerCount,
    paidDriverAmount,
    totalNetPremium,
    discountPercent,
    discountAmount,
    discountedNetPremium,
    vatAmount,
    totalPremium,
  };
}
