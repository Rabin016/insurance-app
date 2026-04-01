/**
 * AppSlider — Theme-aware toggle slider for binary on/off options.
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
import { useTheme } from "../../context/ThemeContext";

interface AppSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  showProtectionIcon?: boolean; 
}

function ProtectionIcon() {
  const { isDark } = useTheme();
  return (
    <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)" }]}>
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
  const { colors, isDark } = useTheme();
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
      [isDark ? "#3A3F45" : "#E2E8F0", "#F97316"]
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
          <Typography variant="subheading">
            {label}
          </Typography>
          {description && (
            <Typography variant="caption">
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
    paddingVertical: 6, // Compact
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
    gap: 1, // Compact
  },
  iconCircle: {
    width: 38,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
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
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: "center",
    flexShrink: 0,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
