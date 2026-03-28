/**
 * AppSlider — Toggle slider for binary on/off options (e.g., RSD Coverage).
 * Uses react-native-reanimated for smooth 60fps spring animation.
 */

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Typography from "./Typography";

interface AppSliderProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

export default function AppSlider({
  value,
  onChange,
  label,
  description,
}: AppSliderProps) {
  // 0 = off, 1 = on
  const progress = useSharedValue(value ? 1 : 0);

  const handleToggle = () => {
    const next = !value;
    progress.value = withSpring(next ? 1 : 0, {
      damping: 18,
      stiffness: 300,
    });
    onChange(next);
  };

  // Thumb translation animation (moves from left to right)
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: progress.value * 24, // Track moves 24px
      },
    ],
  }));

  // Track background color animation (grey → orange)
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
      {/* Text content */}
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

      {/* Toggle track */}
      <Animated.View style={[styles.track, trackStyle]}>
        {/* Animated thumb */}
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
    paddingVertical: 6,
    gap: 16,
  },
  textContent: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: "#E5E7EB",
    fontSize: 15,
  },
  description: {
    color: "#6B7280",
    lineHeight: 18,
  },
  // Track: pill-shaped background
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
    flexShrink: 0,
  },
  // Thumb: white circle that slides
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
