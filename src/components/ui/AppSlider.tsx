/**
 * AppSlider — Toggle slider for binary on/off options (e.g., RSD Coverage).
 * 
 * Refined with:
 * - Brand-consistent Fire Insurance theme for RSD icon circles.
 * - Smooth slide (withTiming).
 */

import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Typography from "./Typography";

interface AppSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  showProtectionIcon?: boolean; 
}

// ─────────────────────────────────────────────────────────────────────────────
// Shield with Heart Icon - Updated to Brand Yellowish/Orange Theme
// ─────────────────────────────────────────────────────────────────────────────
function ProtectionIcon() {
  return (
    <View style={styles.iconCircle}>
      <View style={styles.shieldWrapper}>
        <Ionicons name="shield" size={18} color="#F97316" />
        <View style={styles.heartWrapper}>
          <Ionicons name="heart" size={8} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}

export default function AppSlider({
  value,
  onChange,
  label,
  description,
  showProtectionIcon = false,
}: AppSliderProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value]);

  const handleToggle = () => {
    onChange(!value);
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 24 }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#374151", "#F97316"]
    ),
  }));

  return (
    <Pressable
      style={styles.container}
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <View style={styles.leftSection}>
        {showProtectionIcon && <ProtectionIcon />}
        <View style={styles.textContent}>
          <Typography variant="subheading" style={styles.label}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" style={styles.description}>
              {description}
            </Typography>
          )}
        </View>
      </View>

      {/* Toggle track */}
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: "#F3F4F6",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    color: "#9CA3AF",
    lineHeight: 16,
    fontSize: 12,
  },
  // Icon Styles - Now matching Fire Insurance Logo theme (Yellowish/Orange)
  iconCircle: {
    width: 40,
    height: 48,
    borderRadius: 12, // Matches Fire logo borderRadius
    backgroundColor: "rgba(249,115,22,0.15)", // Translucent orange
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)", // Translucent orange border
  },
  shieldWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heartWrapper: {
    position: "absolute",
    top: 4,
    zIndex: 2,
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
    flexShrink: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
