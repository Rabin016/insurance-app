import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Typography from "./Typography";
import { useTheme } from "../../context/ThemeContext";

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export default function ScreenHeader({ title, subtitle, iconName }: ScreenHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.iconBadge, 
            { 
              backgroundColor: isDark ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.1)", 
              borderColor: isDark ? "rgba(249,115,22,0.3)" : "rgba(249,115,22,0.2)" 
            }
          ]}>
            <Ionicons name={iconName} size={20} color="#F97316" />
          </View>
          <View>
            <Typography variant="caption" color="#F97316" style={{ letterSpacing: 1.2, fontWeight: "700" }}>
              {subtitle}
            </Typography>
            <Typography variant="heading">
              {title}
            </Typography>
          </View>
        </View>
      </View>
      <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 8 
  },
  headerContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingBottom: 12 
  },
  headerLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  iconBadge: { 
    width: 38, 
    height: 38, 
    borderRadius: 10, 
    borderWidth: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerBorder: { 
    height: 1.5, 
    marginHorizontal: -20 
  },
});
