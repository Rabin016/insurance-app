/**
 * AppSelect — Theme-aware reusable dropdown selector.
 * Opens a bottom-sheet style modal with a FlatList of options.
 * Updated for compact layout and theme scalability.
 */

import React, { useImperativeHandle, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
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

export interface SelectOption {
  label: string;
  value: string;
}

export interface AppSelectRef {
  open: () => void;
  close: () => void;
}

interface AppSelectProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  labelIcon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  error?: string;
}

const AppSelect = React.forwardRef<AppSelectRef, AppSelectProps>(({
  label,
  options,
  value,
  onChange,
  labelIcon,
  placeholder = "Select option",
  error,
}, ref) => {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  const arrowRotation = useSharedValue(0);
  const sheetTranslateY = useSharedValue(400);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const openSheet = () => {
    setVisible(true);
    arrowRotation.value = withTiming(180, { duration: 250 });
    sheetTranslateY.value = withTiming(0, { duration: 300 });
  };

  const closeSheet = () => {
    arrowRotation.value = withTiming(0, { duration: 250 });
    sheetTranslateY.value = withTiming(400, { duration: 250 });
    setTimeout(() => setVisible(false), 260);
  };

  useImperativeHandle(ref, () => ({
    open: openSheet,
    close: closeSheet,
  }));

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    closeSheet();
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View style={styles.wrapper}>
      {/* Label Container */}
      <View style={styles.labelContainer}>
        {labelIcon && (
          <Ionicons name={labelIcon} size={14} color="#F97316" style={styles.icon} />
        )}
        <Typography variant="label">
          {label}
        </Typography>
      </View>

      {/* Trigger button */}
      <Pressable
        style={[
          styles.trigger, 
          { backgroundColor: colors.input, borderColor: colors.border },
          error ? { borderColor: "#EF4444" } : null
        ]}
        onPress={openSheet}
      >
        <Typography
          variant="body"
          style={[styles.triggerText, !selectedLabel && { color: isDark ? "#4B5563" : "#94A3B8" }]}
        >
          {selectedLabel ?? placeholder}
        </Typography>
        <Animated.View style={arrowStyle}>
          <Ionicons name="chevron-down" size={18} color={isDark ? "#8D9399" : "#64748B"} />
        </Animated.View>
      </Pressable>

      {/* Error text */}
      {error && (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      )}

      {/* Bottom-sheet modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={closeSheet} />
        <Animated.View style={[styles.sheet, { backgroundColor: colors.card }, sheetStyle]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Typography variant="subheading" style={styles.sheetTitle}>
            {label}
          </Typography>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && { backgroundColor: "rgba(249,115,22,0.12)" }]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Typography
                    variant="body"
                    style={isSelected ? styles.optionTextSelected : null}
                  >
                    {item.label}
                  </Typography>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#F97316" />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          />
        </Animated.View>
      </Modal>
    </View>
  );
});

export default AppSelect;

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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 12, // Compact
    minHeight: 46,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: "60%",
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12, // Compact
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionTextSelected: {
    color: "#F97316",
    fontFamily: "Inter_600SemiBold",
  },
  separator: {
    height: 1,
    marginHorizontal: 4,
    opacity: 0.5,
  },
});
