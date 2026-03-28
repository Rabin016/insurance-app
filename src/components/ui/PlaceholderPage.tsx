/**
 * PlaceholderPage — Reusable stub screen for pages not yet implemented.
 * Shows an icon, title, and a friendly "coming soon" message.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "./Typography";

interface PlaceholderPageProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export default function PlaceholderPage({
  icon = "construct-outline",
  title,
  message = "I will instruct you later.",
}: PlaceholderPageProps) {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={52} color="#F97316" />
      </View>

      {/* Title */}
      <Typography variant="heading" style={styles.title}>
        {title}
      </Typography>

      {/* Message */}
      <Typography variant="body" style={styles.message}>
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
  },
});
