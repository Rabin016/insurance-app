/**
 * AppSegmentedControl — Theme-aware horizontal segmented picker.
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
import { useTheme } from "../../context/ThemeContext";

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
  const { colors, isDark } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth = containerWidth ? (containerWidth - 4) / options.length : 0;

  const activeIndex = options.findIndex((o) => o.value === value);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (activeIndex !== -1 && segmentWidth > 0) {
      translateX.value = withTiming(activeIndex * segmentWidth, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
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
      <View style={styles.header}>
        <CustomShapesIcon />
        <Typography variant="label">
          {label}
        </Typography>
      </View>

      <View 
        style={[styles.container, { backgroundColor: colors.input, borderColor: colors.border }]}
        onLayout={onContainerLayout}
      >
        {activeIndex !== -1 && (
          <Animated.View style={[styles.activePill, animatedStyle]} />
        )}

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
                  isActive ? { color: "#FFFFFF" } : { color: isDark ? "#8D9399" : "#94A3B8" },
                ]}
              >
                {option.subLabel}
              </Typography>
              <Typography
                variant="body"
                style={[
                  styles.label,
                  isActive ? { color: "#E2E5E9" } : { color: isDark ? "#8D9399" : "#334155" },
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
    marginBottom: 12, // Compact
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  container: {
    flexDirection: "row",
    borderRadius: 12,
    height: 58, // Compact
    padding: 2,
    position: "relative",
    borderWidth: 1.5,
    overflow: "hidden",
  },
  activePill: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    backgroundColor: "#F97316",
    borderRadius: 10,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  segment: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  subLabel: {
    fontSize: 8, // Compact
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 14, // Compact
  },
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
