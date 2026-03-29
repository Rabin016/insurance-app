/**
 * AppInput — Reusable number/text input with prefix & suffix symbols.
 * Supports animated focus ring (border glow), error state, and read-only mode.
 * Updated with labelIcon and forwardRef.
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
  placeholder = "0",
  ...props
}, ref) => {
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
      : "#2D3748",
    shadowOpacity: borderGlow.value * 0.35,
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
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      </View>

      {/* Input container with animated border */}
      <Animated.View
        style={[
          styles.container,
          animatedBorder,
          readOnly && styles.readOnly,
        ]}
      >
        {prefix && (
          <View style={styles.adornment}>
            <Typography variant="label" style={styles.adornmentText}>
              {prefix}
            </Typography>
          </View>
        )}

        <TextInput
          ref={internalRef}
          style={[styles.input, prefix && styles.inputWithPrefix]}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          keyboardType={numericOnly ? "decimal-pad" : "default"}
          editable={!readOnly}
          selectTextOnFocus={!readOnly}
          {...props}
        />

        {suffix && (
          <View style={styles.adornment}>
            <Typography variant="label" style={styles.adornmentText}>
              {suffix}
            </Typography>
          </View>
        )}

        {readOnly && (
          <View style={styles.adornment}>
            <Typography variant="caption" style={{ color: "#F97316" }}>
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
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  icon: {
    marginTop: -1,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2D3748",
    overflow: "hidden",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 0,
  },
  readOnly: {
    backgroundColor: "#0F172A",
    opacity: 0.85,
  },
  adornment: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#2D3748",
  },
  adornmentText: {
    color: "#F97316",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#F9FAFB",
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    minHeight: 50,
  },
  inputWithPrefix: {
    paddingLeft: 8,
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 2,
  },
  hintText: {
    color: "#6B7280",
    marginTop: 4,
    marginLeft: 2,
  },
});
