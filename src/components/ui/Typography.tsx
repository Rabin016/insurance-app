/**
 * Typography — Reusable text component with predefined variants.
 * Supports heading, subheading, label, body, caption styles.
 * Theme-aware colors.
 */

import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export type TypographyVariant =
  | "display"     // Large hero text
  | "heading"     // Section headings
  | "subheading"  // Sub-section titles
  | "label"       // Field labels
  | "body"        // Body copy
  | "caption"     // Small helper text
  | "mono";       // Monospace values (amounts)

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

export default function Typography({
  variant = "body",
  color,
  style,
  children,
  ...props
}: TypographyProps) {
  const { colors } = useTheme();

  // Map variant to theme colors
  const getThemeColor = (v: TypographyVariant) => {
    switch (v) {
      case "display":
      case "heading":
        return colors.text;
      case "subheading":
        return colors.text;
      case "label":
        return colors.textSecondary;
      case "body":
        return colors.textSecondary;
      case "caption":
        return colors.textMuted;
      case "mono":
        return "#F97316"; // Brand orange stays fixed
      default:
        return colors.text;
    }
  };

  const textStyle = [
    styles[variant],
    { color: color || getThemeColor(variant) },
    style
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
});
