/**
 * AppToggle — Theme-aware miniature toggle for binary options.
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
import { useTheme } from "../../context/ThemeContext";

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
    <View style={[styles.wrapper, { borderTopColor: colors.border }]}>
      {label && (
        <Typography variant="label" style={styles.headerLabel}>
          {label}
        </Typography>
      )}
      <View 
        style={[styles.container, { backgroundColor: colors.input, borderColor: colors.border }]}
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
                  isActive ? { color: "#FFFFFF" } : { color: isDark ? "#8D9399" : "#64748B" },
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
    marginVertical: 8, // Compact
    paddingVertical: 6, // Compact
    borderTopWidth: 1,
    gap: 12,
    flexWrap: "wrap",
  },
  headerLabel: {
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.5,
    flex: 1,
  },
  container: {
    flexDirection: "row",
    borderRadius: 8,
    height: 34, // Compact
    padding: 2,
    position: "relative",
    borderWidth: 1,
    flex: 1,
    maxWidth: 160,
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
    fontSize: 11, // Compact
  },
});
