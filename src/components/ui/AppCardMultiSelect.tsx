/**
 * AppCardMultiSelect — Grid-based card selection for multiple options.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import Typography from "./Typography";

interface MultiSelectCardOption {
  label: string;
  value: string;
  rate?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface AppCardMultiSelectProps {
  label?: string;
  options: readonly MultiSelectCardOption[];
  values: string[];
  onChange: (values: string[]) => void;
  labelIcon?: keyof typeof Ionicons.glyphMap;
}

const AppCardMultiSelect: React.FC<AppCardMultiSelectProps> = ({
  label,
  options,
  values,
  onChange,
  labelIcon,
}) => {
  const { colors, isDark } = useTheme();

  const toggleSelection = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelContainer}>
          {labelIcon && (
            <Ionicons
              name={labelIcon}
              size={14}
              color="#F97316"
              style={styles.icon}
            />
          )}
          <Typography variant="label">{label}</Typography>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isSelected = values.includes(option.value);

          return (
            <SelectableCard
              key={option.value}
              option={option}
              isSelected={isSelected}
              onPress={() => toggleSelection(option.value)}
              colors={colors}
              isDark={isDark}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const SelectableCard = ({
  option,
  isSelected,
  onPress,
  colors,
  isDark,
}: any) => {
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 1 : 0.98) }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected ? 1 : 0),
    transform: [{ scale: withSpring(isSelected ? 1 : 0.5) }],
  }));

  return (
    <Pressable style={styles.cardWrapper} onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: isSelected
              ? isDark
                ? "rgba(249,115,22,0.15)"
                : "rgba(249,115,22,0.08)"
              : colors.input,
            borderColor: isSelected ? "#F97316" : colors.border,
          },
          scale,
        ]}
      >
        <View style={styles.cardHeader}>
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={18}
              color={isSelected ? "#F97316" : isDark ? "#8D9399" : "#64748B"}
            />
          )}
          <Animated.View style={[styles.checkIndicator, indicatorStyle]}>
            <Ionicons name="checkmark-circle" size={16} color="#F97316" />
          </Animated.View>
        </View>

        <Typography
          variant="body"
          numberOfLines={2}
          style={[
            styles.cardLabel,
            isSelected && {
              color: isDark ? "#E2E5E9" : "#1C1F22",
              fontWeight: "700",
            },
          ]}
        >
          {option.label}
        </Typography>

        {option.rate !== undefined && (
          <Typography
            variant="caption"
            style={[
              styles.cardRate,
              {
                color: isSelected ? "#F97316" : isDark ? "#6B7280" : "#94A3B8",
              },
            ]}
          >
            {option.rate}% Rate
          </Typography>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default AppCardMultiSelect;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  icon: {
    marginTop: -1,
  },
  scrollContent: {
    paddingRight: 10, // Extra space at end
  },
  cardWrapper: {
    width: 120, // Fixed width for horizontal scroll
    marginRight: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 100, // Slightly taller for horizontal
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  checkIndicator: {
    position: "absolute",
    right: -4,
    top: -4,
  },
  cardLabel: {
    fontSize: 12, // Compact
    lineHeight: 16,
  },
  cardRate: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
});
