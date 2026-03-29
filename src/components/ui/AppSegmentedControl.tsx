/**
 * AppSegmentedControl — Horizontal segmented picker.
 * 
 * Refined with:
 * - Dynamic layout measurement (onLayout) to prevent screen overflow.
 * - Smooth slide animation (withTiming) without bouncy spring effects.
 * - Dark Navy (#111827) and Orange (#F97316) theme alignment.
 */

import React, { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Typography from "./Typography";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  label: string;
  subLabel?: string;
  value: string;
}

interface AppSegmentedControlProps {
  label: string;
  options: readonly Option[];
  value: string | null;
  onChange: (value: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Icon (Triangle, Square, Circle) in Theme Orange
// ─────────────────────────────────────────────────────────────────────────────
function CustomShapesIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconTop}>
        <Ionicons name="triangle" size={8} color="#F97316" />
      </View>
      <View style={styles.iconBottom}>
        <View style={styles.square} />
        <View style={styles.circle} />
      </View>
    </View>
  );
}

export default function AppSegmentedControl({
  label,
  options,
  value,
  onChange,
}: AppSegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth = containerWidth ? (containerWidth - 4) / options.length : 0;

  // Animation for the highlighter pill
  const activeIndex = options.findIndex((o) => o.value === value);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (activeIndex !== -1 && segmentWidth > 0) {
      translateX.value = withTiming(activeIndex * segmentWidth, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Standard smooth ease
      });
    }
  }, [activeIndex, segmentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
    opacity: segmentWidth > 0 ? 1 : 0,
  }));

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <View style={styles.wrapper}>
      {/* Header with Custom Icon matching AppInput label style */}
      <View style={styles.header}>
        <CustomShapesIcon />
        <Typography variant="label" style={styles.headerText}>
          {label}
        </Typography>
      </View>

      {/* Main Container - Themed to match AppInput/AppSelect trigger */}
      <View 
        style={styles.container}
        onLayout={onContainerLayout}
      >
        {/* Sliding Highlight Pill */}
        {activeIndex !== -1 && (
          <Animated.View style={[styles.activePill, animatedStyle]} />
        )}

        {/* Options */}
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.segment, { width: segmentWidth || "33%" }]}
            >
              <Typography
                variant="caption"
                style={[
                  styles.subLabel,
                  isActive ? styles.textActive : styles.textInactive,
                ]}
              >
                {option.subLabel}
              </Typography>
              <Typography
                variant="body"
                style={[
                  styles.label,
                  isActive ? styles.textActive : styles.textInactive,
                ]}
              >
                {option.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
  },
  headerText: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#F9FAFB", // Light gray/white text
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#111827", // Matches AppInput/Select background
    borderRadius: 12,
    height: 64,
    padding: 2,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#2D3748",
    overflow: "hidden",
  },
  activePill: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    backgroundColor: "#F97316", // Brand Orange for selection
    borderRadius: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  segment: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  subLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  textActive: {
    color: "#FFFFFF",
  },
  textInactive: {
    color: "#6B7280", // Standard muted gray
  },
  // Icon specific styles (Brand Orange)
  iconContainer: {
    width: 20,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  iconTop: {
    marginBottom: 1,
  },
  iconBottom: {
    flexDirection: "row",
    gap: 2,
  },
  square: {
    width: 7,
    height: 7,
    backgroundColor: "#F97316",
    borderRadius: 1,
  },
  circle: {
    width: 7,
    height: 7,
    backgroundColor: "#F97316",
    borderRadius: 4,
  },
});
