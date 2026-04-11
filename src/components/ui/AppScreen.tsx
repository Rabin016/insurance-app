import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
  ScrollViewProps
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

interface AppScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollRef?: React.Ref<ScrollView>;
  scrollContentStyle?: ScrollViewProps["contentContainerStyle"];
}

export default function AppScreen({
  children,
  scrollRef,
  scrollContentStyle,
  style,
  ...props
}: AppScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View 
        style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }, style]} 
        {...props}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }, scrollContentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// Separate out the header part if users want to place a fixed header above the ScrollView
export function AppScreenWithHeader({
  header,
  children,
  scrollRef,
  scrollContentStyle,
  style,
  ...props
}: AppScreenProps & { header: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View 
        style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }, style]} 
        {...props}
      >
        {header}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }, scrollContentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 10 },
});
