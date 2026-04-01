/**
 * SectionCard — Theme-aware card wrapper.
 * Used to group related form fields visually.
 * Reduced padding for a more compact layout as requested.
 */

import React from "react";
import {
  View,
  ViewProps,
  StyleSheet,
} from "react-native";
import Typography from "./Typography";
import { useTheme } from "../../context/ThemeContext";

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
  const { colors, isDark } = useTheme();

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          shadowOpacity: isDark ? 0.3 : 0.1,
        },
        accent && styles.accentBorder, 
        style
      ]} 
      {...props}
    >
      {/* Card header with title & subtitle */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Typography variant="subheading">{title}</Typography>
          )}
          {subtitle && (
            <Typography variant="caption">
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
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14, // Slightly reduced for compact layout
    marginBottom: 10, // Slightly reduced
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  accentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#F97316",
  },
  header: {
    marginBottom: 12,
    gap: 2,
  },
});
