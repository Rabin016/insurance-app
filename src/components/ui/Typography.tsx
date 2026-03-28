/**
 * Typography — Reusable text component with predefined variants.
 * Supports heading, subheading, label, body, caption styles.
 */

import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

// Available text variants
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
  const textStyle = [styles[variant], color ? { color } : null, style];

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
    color: "#F9FAFB",
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 28,
    color: "#F9FAFB",
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 24,
    color: "#E5E7EB",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#D1D5DB",
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
  },
  mono: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 30,
    color: "#F97316",
    letterSpacing: 0.5,
  },
});
