/**
 * Fire Insurance Constants
 * Premium rate matrix and selection options
 */

// ─────────────────────────────────────────────────────────────────────────────
// Risk Classification Options
// ─────────────────────────────────────────────────────────────────────────────
export const RISK_CLASSES = [
  { label: "Class I", value: "CLASS_I" },
  { label: "Class II", value: "CLASS_II" },
  { label: "Class III", value: "CLASS_III" },
] as const;

export type RiskClass = (typeof RISK_CLASSES)[number]["value"];

// ─────────────────────────────────────────────────────────────────────────────
// Occupancy Type Options
// ─────────────────────────────────────────────────────────────────────────────
export const OCCUPANCY_TYPES = [
  { label: "Shop", value: "SHOP" },
  { label: "Godown", value: "GODOWN" },
  { label: "Shop (Mofussil)", value: "SHOP_MOFUSSIL" },
  { label: "Godown (Mofussil)", value: "GODOWN_MOFUSSIL" },
] as const;

export type OccupancyType = (typeof OCCUPANCY_TYPES)[number]["value"];

// ─────────────────────────────────────────────────────────────────────────────
// Premium Rate Matrix (in percentage, e.g. 0.15 means 0.15%)
// Rate[riskClass][occupancyType]
// ─────────────────────────────────────────────────────────────────────────────
export const PREMIUM_RATE_MATRIX: Record<RiskClass, Record<OccupancyType, number>> = {
  CLASS_I: {
    SHOP:           0.15,
    GODOWN:         0.11,
    SHOP_MOFUSSIL:  0.18,
    GODOWN_MOFUSSIL: 0.13,
  },
  CLASS_II: {
    SHOP:           0.17,
    GODOWN:         0.13,
    SHOP_MOFUSSIL:  0.26,
    GODOWN_MOFUSSIL: 0.21,
  },
  CLASS_III: {
    SHOP:           0.26,
    GODOWN:         0.21,
    SHOP_MOFUSSIL:  0.43,
    GODOWN_MOFUSSIL: 0.30,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// RSD (Riots, Strikes & Damage) surcharge rate (%)
// ─────────────────────────────────────────────────────────────────────────────
export const RSD_SURCHARGE_RATE = 0.075; // 0.075% of sum insured
