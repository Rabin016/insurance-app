/**
 * AppButton — Reusable animated button component.
 * Variants: primary (orange fill), secondary (outline), ghost (transparent).
 * Press animation uses react-native-reanimated for smooth 60fps scale effect.
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: AppButtonProps) {
  // Shared value for press animation
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        {/* Loading spinner */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#fff" : "#F97316"}
          />
        ) : (
          <>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.label, styles[`${variant}Text` as keyof typeof styles] as any]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  fullWidth: {
    width: "100%",
  },
  // Primary — solid orange fill
  primary: {
    backgroundColor: "#F97316",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  // Secondary — outlined
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#F97316",
  },
  secondaryText: {
    color: "#F97316",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  // Ghost — no background, no border
  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: "#9CA3AF",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  // Danger — red tint
  danger: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  dangerText: {
    color: "#EF4444",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    textAlign: "center",
  },
  iconWrap: {
    marginRight: 4,
  },
});
