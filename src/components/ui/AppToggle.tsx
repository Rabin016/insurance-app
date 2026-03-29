/**
 * AppToggle — Miniature horizontal toggle for binary options (e.g. % vs Amount).
 * Smooth timing-based animation (non-bouncy).
 * Refined for horizontal overflow fix.
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

interface Option {
  label: string;
  value: any;
}

interface AppToggleProps {
  options: readonly Option[];
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

export default function AppToggle({
  options,
  value,
  onChange,
  label,
}: AppToggleProps) {
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
      {label && (
        <Typography variant="label" style={styles.headerLabel}>
          {label}
        </Typography>
      )}
      <View 
        style={styles.container}
        onLayout={onContainerLayout}
      >
        {/* Sliding Indicator */}
        {activeIndex !== -1 && (
          <Animated.View style={[styles.activePill, animatedStyle]} />
        )}

        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.segment, { width: segmentWidth || "50%" }]}
            >
              <Typography
                variant="caption"
                style={[
                  styles.text,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    gap: 12,
    flexWrap: "wrap", // Added wrap just in case
  },
  headerLabel: {
    color: "#6B7280",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.5,
    flex: 1, // Allow label to take available space
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    height: 36,
    padding: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#2D3748",
    flex: 1, // Dynamic width based on space
    maxWidth: 160, // Limit growth for a toggle
    flexShrink: 0,
  },
  activePill: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    backgroundColor: "#F97316",
    borderRadius: 6,
  },
  segment: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  textActive: {
    color: "#FFFFFF",
  },
  textInactive: {
    color: "#9CA3AF",
  },
});
