/**
 * Motor Insurance Constants
 * Premium calculation fixed rates and option lists.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Carrying Capacity Options (Used with AppSegmentedControl)
// ─────────────────────────────────────────────────────────────────────────────
export const CAPACITY_OPTIONS = [
  { label: "1500cc - 1800cc", subLabel: "STANDARD", value: "C1500_1800" },
  { label: "1900cc+", subLabel: "PREMIUM", value: "C1900_PLUS" },
] as const;

export type CapacityClass = (typeof CAPACITY_OPTIONS)[number]["value"];

// Basic premium rate based on capacity class
export const CAPACITY_RATES: Record<CapacityClass, number> = {
  C1500_1800: 2873,
  C1900_PLUS: 2925,
};

// ─────────────────────────────────────────────────────────────────────────────
// Less on FIV (Exclusion Perils)
// These represent the percentage deducted from the Gross Own Damage
// ─────────────────────────────────────────────────────────────────────────────
export const EXCLUSION_PERILS_OPTIONS = [
  { label: "Flood & Cyclone", value: "FLOOD_CYCLONE", rate: 0.25, icon: "water-outline" },
  { label: "Earthquake", value: "EARTHQUAKE", rate: 0.25, icon: "pulse-outline" },
  { label: "R&SD", value: "RSD", rate: 0.50, icon: "warning-outline" },
] as const;

export type ExclusionPeril = (typeof EXCLUSION_PERILS_OPTIONS)[number]["value"];

// ─────────────────────────────────────────────────────────────────────────────
// Fixed Calculation Constants
// ─────────────────────────────────────────────────────────────────────────────
export const MOTOR_CONSTANTS = {
  FIV_RATE_PERCENT: 2.65, // 2.65%
  LIABILITY_PREMIUM: 1250, // Fixed BDT amount
  PAID_DRIVER: 150, // Fixed BDT amount
  PASSENGER_RATE: 225, // BDT per passenger (Seating Capacity - 1)
};
