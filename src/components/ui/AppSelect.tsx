/**
 * AppSelect — Reusable dropdown selector.
 * Opens a bottom-sheet style modal with a FlatList of options.
 * Updated with labelIcon and forwardRef.
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
  placeholder = "Select an option",
  error,
}, ref) => {
  const [visible, setVisible] = useState(false);

  const arrowRotation = useSharedValue(0);
  const sheetTranslateY = useSharedValue(300);

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
    sheetTranslateY.value = withTiming(300, { duration: 250 });
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
      {/* Label with optional Icon */}
      <View style={styles.labelContainer}>
        {labelIcon && (
          <Ionicons name={labelIcon} size={14} color="#F97316" style={styles.icon} />
        )}
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      </View>

      {/* Trigger button */}
      <Pressable
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Typography
          variant="body"
          style={[styles.triggerText, !selectedLabel && styles.placeholder]}
        >
          {selectedLabel ?? placeholder}
        </Typography>
        <Animated.View style={arrowStyle}>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
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
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
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
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Typography
                    variant="body"
                    style={isSelected ? styles.optionTextSelected : styles.optionText}
                  >
                    {item.label}
                  </Typography>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#F97316" />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animated.View>
      </Modal>
    </View>
  );
});

export default AppSelect;

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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2D3748",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 50,
  },
  triggerError: {
    borderColor: "#EF4444",
  },
  triggerText: {
    color: "#F9FAFB",
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  placeholder: {
    color: "#4B5563",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: "60%",
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#374151",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    marginBottom: 16,
    color: "#F9FAFB",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: "rgba(249,115,22,0.1)",
    paddingHorizontal: 12,
  },
  optionText: {
    color: "#D1D5DB",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#F97316",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#1F2937",
    marginHorizontal: 4,
  },
});
