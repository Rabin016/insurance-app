/**
 * Marine Insurance Constants
 * Premium rate matrix based on Transport Mode and Condition of Cover.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Transport Modes (Sea, Air, Land)
// ─────────────────────────────────────────────────────────────────────────────
export const TRANSPORT_MODES = [
  { label: "Sea", value: "SEA", subLabel: "VESSEL" },
  { label: "Air", value: "AIR", subLabel: "FLIGHT" },
  { label: "Land", value: "LAND", subLabel: "ROAD" },
] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number]["value"];

// ─────────────────────────────────────────────────────────────────────────────
// Condition Options per Mode
// ─────────────────────────────────────────────────────────────────────────────
export const MARINE_CONDITIONS: Record<TransportMode, { label: string; value: string }[]> = {
  SEA: [
    { label: "ICC (B)", value: "ICC_B" },
    { label: "ICC (C)", value: "ICC_C" },
  ],
  AIR: [
    { label: "Air Risk Only", value: "AIR_RISK" },
    { label: "Air ND Only", value: "AIR_ND" },
    { label: "Air TPND Only", value: "AIR_TPND" },
    { label: "Air All Risk", value: "AIR_ALL" },
  ],
  LAND: [
    { label: "Risk Only", value: "RISK_ONLY" },
    { label: "All Risk", value: "ALL_RISK" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Premium Rate Matrix (in percentage, e.g. 0.45 means 0.45%)
// ─────────────────────────────────────────────────────────────────────────────
export const MARINE_RATE_MATRIX: Record<TransportMode, Record<string, number>> = {
  SEA: {
    ICC_B: 0.45,
    ICC_C: 0.30,
  },
  AIR: {
    AIR_RISK: 0.22,
    AIR_ND: 0.43,
    AIR_TPND: 0.65,
    AIR_ALL: 0.86,
  },
  LAND: {
    RISK_ONLY: 0.43,
    ALL_RISK: 0.83,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Currency Options
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENCY_OPTIONS = [
  { label: "US Dollar ($)", value: "USD" },
  { label: "Pound Sterling (£)", value: "GBP" },
  { label: "Euro (€)", value: "EUR" },
] as const;

export type CurrencyType = (typeof CURRENCY_OPTIONS)[number]["value"];

// ─────────────────────────────────────────────────────────────────────────────
// War & SRCC
// ─────────────────────────────────────────────────────────────────────────────
export const WAR_SRCC_RATE = 0.05; // Standard 0.05%
