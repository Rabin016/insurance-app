/**
 * Tab Layout — Bottom tab navigator with 4 tabs:
 * Marine | Fire | Motor | About
 * Custom animated tab bar with Reanimated press effects.
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import Typography from "../../components/ui/Typography";
import { useTheme } from "../../context/ThemeContext";

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
  const { colors, isDark } = useTheme();
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
      style={{ flex: 1, alignItems: "center" }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.title}
    >
      <Animated.View style={[{ alignItems: "center", justifyContent: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, gap: 3, position: "relative" }, animStyle]}>
        {/* Active indicator pill */}
        {isFocused && <View style={{ position: "absolute", top: -2, width: 32, height: 3, borderRadius: 2, backgroundColor: "#F97316" }} />}

        {/* Icon */}
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.icon}
          size={22}
          color={isFocused ? "#F97316" : (isDark ? "#8D9399" : "#64748B")}
        />

        {/* Label */}
        <Typography
          variant="caption"
          style={[
            { fontSize: 11, fontFamily: "Inter_500Medium" },
            isFocused ? { color: "#F97316" } : { color: isDark ? "#8D9399" : "#64748B" },
          ]}
        >
          {tab.title}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{ 
        headerShown: false,
        animation: "shift",
      }}
      tabBar={({ state, navigation }) => (
        <View style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "android" ? 12 : 24, // Increased Android padding
          paddingTop: 8,
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.4 : 0.05,
          shadowRadius: 16,
          elevation: 20,
        }}>
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
