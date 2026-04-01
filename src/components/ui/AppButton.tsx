/**
 * AppButton — Theme-aware button component.
 * Supports primary (orange), secondary, and ghost variants.
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Typography from "./Typography";
import { useTheme } from "../../context/ThemeContext";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
}: AppButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Determine styles based on variant and theme
  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "#F97316",
          text: "#FFFFFF",
          border: "transparent",
        };
      case "secondary":
        return {
          bg: isDark ? "#1F2937" : "#E2E8F0",
          text: colors.text,
          border: "transparent",
        };
      case "ghost":
        return {
          bg: "transparent",
          text: "#F97316",
          border: colors.border,
        };
    }
  };

  const { bg, text, border } = getButtonStyles();

  return (
    <AnimatedPressable
      style={[
        styles.button,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === "ghost" ? 1 : 0 },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
          <Typography
            variant="subheading"
            style={[styles.text, { color: text }]}
          >
            {title}
          </Typography>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52, // Slightly more compact but still touch-friendly
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  icon: {
    marginRight: 8,
  },
});
