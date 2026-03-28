/**
 * SectionCard — Glassmorphism-style card wrapper.
 * Used to group related form fields visually.
 */

import React from "react";
import {
  View,
  ViewProps,
  StyleSheet,
} from "react-native";
import Typography from "./Typography";

interface SectionCardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: boolean; // Orange left border accent
}

export default function SectionCard({
  title,
  subtitle,
  children,
  accent = false,
  style,
  ...props
}: SectionCardProps) {
  return (
    <View style={[styles.card, accent && styles.accentBorder, style]} {...props}>
      {/* Card header with title & subtitle */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Typography variant="subheading">{title}</Typography>
          )}
          {subtitle && (
            <Typography variant="caption" style={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D3748",
    padding: 16,
    marginBottom: 12,
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accentBorder: {
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
  },
  header: {
    marginBottom: 14,
    gap: 4,
  },
  subtitle: {
    marginTop: 2,
  },
});
