/**
 * Theme Definitions — Light and Dark modes.
 * 
 * Dark mode palette extracted from Fantech WK895 "GO POP" product image:
 * - Background: Deep Anthracite (~#1C1F22) — keyboard base shadow
 * - Card: Charcoal Graphite (~#25292E) — keyboard body surface
 * - Input: Dark Well (~#1A1D20) — key cavity depth
 * - Border: Graphite Edge (~#3A3F45) — key borders/separators
 * - Text: Silver Key Label (~#E2E5E9) — key characters
 * - Secondary text: Muted Key Label (~#8D9399) — secondary key labels
 * - Adornment: Darker Key Surface (~#2E3238) — function key row
 * 
 * Primary Orange (#F97316) is preserved — matches the scroll wheel & accent keys.
 */

export const COLORS = {
  primary: "#F97316", // Brand Orange — matches keyboard scroll wheel accent
  
  dark: {
    background: "#1C1F22",   // Deep Anthracite — keyboard base
    card: "#25292E",          // Charcoal Graphite — keyboard body surface
    cardSecondary: "#2E3238", // Function key row — slightly darker card variant
    border: "#3A3F45",        // Graphite Edge — key borders
    text: "#E2E5E9",          // Silver Key Label — bright, clean key text
    textSecondary: "#8D9399", // Muted Key Label — secondary key labels
    textMuted: "#5C6370",     // Deep Muted — disabled/placeholder text
    input: "#1A1D20",         // Dark Key Cavity — input well depth
    inputBorder: "#3A3F45",   // Same as border
    adornment: "#2E3238",     // Function key surface — adornment background
  },
  
  light: {
    background: "#F0F2F5",
    card: "#FFFFFF",
    cardSecondary: "#F8FAFC",
    border: "#E2E8F0",
    text: "#1E293B",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    input: "#FFFFFF",
    inputBorder: "#E2E8F0",
    adornment: "#F1F5F9",
  },
};

export type ThemeType = "light" | "dark";

export const getThemeColors = (mode: ThemeType) => {
  return mode === "dark" ? COLORS.dark : COLORS.light;
};
