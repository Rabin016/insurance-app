/**
 * AppMultiSelect — Theme-aware reusable multi-selector.
 * Opens a bottom-sheet style modal with a FlatList of options.
 * Allows multiple selections simultaneously.
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

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface AppMultiSelectRef {
  open: () => void;
  close: () => void;
}

interface AppMultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  labelIcon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  error?: string;
}

const AppMultiSelect = React.forwardRef<AppMultiSelectRef, AppMultiSelectProps>(({
  label,
  options,
  values,
  onChange,
  labelIcon,
  placeholder = "Select options",
  error,
}, ref) => {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  const arrowRotation = useSharedValue(0);
  const sheetTranslateY = useSharedValue(500);

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
    sheetTranslateY.value = withTiming(500, { duration: 250 });
    setTimeout(() => setVisible(false), 260);
  };

  useImperativeHandle(ref, () => ({
    open: openSheet,
    close: closeSheet,
  }));

  const toggleSelect = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  // Helper to format the trigger text based on selected values
  const getSelectedText = () => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return options.find(o => o.value === values[0])?.label || placeholder;
    }
    return `${values.length} selections`;
  };

  const hasSelection = values.length > 0;

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
          style={[styles.triggerText, !hasSelection && { color: isDark ? "#4B5563" : "#94A3B8" }]}
        >
          {getSelectedText()}
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
          
          <View style={styles.sheetHeader}>
            <Typography variant="subheading" style={styles.sheetTitle}>
              {label}
            </Typography>
            <TouchableOpacity onPress={closeSheet}>
              <Typography variant="body" color="#F97316" style={{ fontWeight: "600" }}>
                Done
              </Typography>
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = values.includes(item.value);
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && { backgroundColor: "rgba(249,115,22,0.12)" }]}
                  onPress={() => toggleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Typography
                    variant="body"
                    style={isSelected ? styles.optionTextSelected : null}
                  >
                    {item.label}
                  </Typography>
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={isSelected ? "#F97316" : (isDark ? "#4B5563" : "#94A3B8")} 
                  />
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

export default AppMultiSelect;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
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
    paddingVertical: 12,
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
    maxHeight: "70%",
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    textAlign: "left",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
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
