/**
 * AppInput — Reusable number/text input with theme support.
 * Supports animated focus ring (border glow), error state, and read-only mode.
 * Updated for compact layout and theme-aware surfaces.
 */

import React, { useImperativeHandle, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Typography from "./Typography";
import { useTheme } from "../../context/ThemeContext";

interface AppInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;      // e.g. "BDT"
  suffix?: string;      // e.g. "%"
  labelIcon?: keyof typeof Ionicons.glyphMap; // Icon next to the label
  error?: string;
  hint?: string;
  readOnly?: boolean;   // Auto-filled fields (e.g. premium rate)
  numericOnly?: boolean;
}

const AppInput = React.forwardRef<TextInput, AppInputProps>(({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  labelIcon,
  error,
  hint,
  readOnly = false,
  numericOnly = true,
  placeholder = "0.00",
  ...props
}, ref) => {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<TextInput>(null);

  // Expose internal ref to parent
  useImperativeHandle(ref, () => internalRef.current!);

  // Animated border opacity for focus glow
  const borderGlow = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: error
      ? "#EF4444"
      : borderGlow.value === 1
      ? "#F97316"
      : colors.border,
    shadowOpacity: borderGlow.value * 0.3,
  }));

  const handleFocus = (e: any) => {
    setFocused(true);
    borderGlow.value = withTiming(1, { duration: 200 });
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    borderGlow.value = withTiming(0, { duration: 200 });
    props.onBlur?.(e);
  };

  const handleChange = (text: string) => {
    if (numericOnly) {
      const cleaned = text.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
      onChangeText(sanitized);
    } else {
      onChangeText(text);
    }
  };

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => !readOnly && internalRef.current?.focus()}
      accessibilityLabel={label}
    >
      {/* Label with optional Icon */}
      <View style={styles.labelContainer}>
        {labelIcon && (
          <Ionicons name={labelIcon} size={14} color="#F97316" style={styles.icon} />
        )}
        <Typography variant="label">
          {label}
        </Typography>
      </View>

      {/* Input container with animated border */}
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.input, borderColor: colors.border },
          animatedBorder,
          readOnly && { backgroundColor: isDark ? "#1A1D20" : "#F1F5F9", opacity: 0.8 },
        ]}
      >
        {prefix && (
          <View style={[styles.adornment, { backgroundColor: colors.adornment, borderRightColor: colors.border }]}>
            <Typography variant="label" color="#F97316">
              {prefix}
            </Typography>
          </View>
        )}

        <TextInput
          ref={internalRef}
          style={[
            styles.input, 
            { color: colors.text },
            prefix && styles.inputWithPrefix
          ]}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#4B5563" : "#94A3B8"}
          keyboardType={numericOnly ? "decimal-pad" : "default"}
          editable={!readOnly}
          selectTextOnFocus={!readOnly}
          {...props}
        />

        {suffix && (
          <View style={[styles.adornment, { backgroundColor: colors.adornment, borderLeftWidth: 1, borderLeftColor: colors.border, borderRightWidth: 0 }]}>
            <Typography variant="label" color="#F97316">
              {suffix}
            </Typography>
          </View>
        )}

        {readOnly && (
          <View style={styles.adornment}>
            <Typography variant="caption" color="#F97316">
              AUTO
            </Typography>
          </View>
        )}
      </Animated.View>

      {/* Error / Hint message */}
      {error ? (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      ) : hint ? (
        <Typography variant="caption" style={styles.hintText}>
          {hint}
        </Typography>
      ) : null}
    </Pressable>
  );
});

export default AppInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10, // Compact
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  icon: {
    marginTop: -1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 0,
  },
  adornment: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12, // Compact
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    minHeight: 46,
  },
  inputWithPrefix: {
    paddingLeft: 6,
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 2,
  },
  hintText: {
    color: "#8D9399",
    marginTop: 4,
    marginLeft: 2,
  },
});
