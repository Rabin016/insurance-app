/**
 * Tab Layout — Bottom tab navigator with 4 tabs:
 * Marine | Fire | Motor | About
 * Custom animated tab bar with Reanimated press effects.
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import Typography from "../../components/ui/Typography";

// Tab configuration
const TAB_CONFIG = [
  {
    name: "marine",
    title: "Marine",
    icon: "boat-outline" as const,
    activeIcon: "boat" as const,
  },
  {
    name: "fire",
    title: "Fire",
    icon: "flame-outline" as const,
    activeIcon: "flame" as const,
  },
  {
    name: "motor",
    title: "Motor",
    icon: "car-outline" as const,
    activeIcon: "car" as const,
  },
  {
    name: "about",
    title: "About",
    icon: "information-circle-outline" as const,
    activeIcon: "information-circle" as const,
  },
];

// Animated tab button component
function TabButton({
  tab,
  isFocused,
  onPress,
}: {
  tab: typeof TAB_CONFIG[0];
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.title}
    >
      <Animated.View style={[styles.tabInner, animStyle]}>
        {/* Active indicator pill */}
        {isFocused && <View style={styles.activePill} />}

        {/* Icon */}
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.icon}
          size={22}
          color={isFocused ? "#F97316" : "#4B5563"}
        />

        {/* Label */}
        <Typography
          variant="caption"
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {tab.title}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ 
        headerShown: false,
        animation: "shift", // or "slide_from_right" / "fade"
      }}
      tabBar={({ state, navigation }) => (
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab, index) => {
            const isFocused = state.index === index;
            return (
              <TabButton
                key={tab.name}
                tab={tab}
                isFocused={isFocused}
                onPress={() => navigation.navigate(tab.name)}
              />
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="marine" options={{ title: "Marine" }} />
      <Tabs.Screen name="fire" options={{ title: "Fire" }} />
      <Tabs.Screen name="motor" options={{ title: "Motor" }} />
      <Tabs.Screen name="about" options={{ title: "About" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingBottom: Platform.OS === "android" ? 8 : 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 3,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: -2,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#F97316",
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  tabLabelActive: {
    color: "#F97316",
  },
  tabLabelInactive: {
    color: "#4B5563",
  },
});
