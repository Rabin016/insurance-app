import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, Share, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../../components/ui/AppButton";
import AppSegmentedControl from "../../components/ui/AppSegmentedControl";
import SectionCard from "../../components/ui/SectionCard";
import Typography from "../../components/ui/Typography";
import { useTheme } from "../../context/ThemeContext";

export default function AboutScreen() {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const handleGithubPress = () => {
    Linking.openURL("https://github.com/rabin016");
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Check out this amazing Insurance Premium Calculator app! 🚀",
        url: "https://github.com/rabin016/insurance-app",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const themeOptions = [
    { label: "Light", value: "light", subLabel: "Mode" },
    { label: "System", value: "system", subLabel: "Auto" },
    { label: "Dark", value: "dark", subLabel: "Mode" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          entering={FadeInUp.duration(600).springify()}
          style={styles.header}
        >
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: isDark ? "#1F2937" : "#E2E8F0" },
            ]}
          >
            <Ionicons name="calculator" size={40} color="#F97316" />
          </View>
          <Typography variant="display" style={styles.title}>
            Insurance Calculator
          </Typography>
          <Typography variant="caption" style={styles.version}>
            Version 2.1.0 (Stable)
          </Typography>
        </Animated.View>

        {/* Theme Settings */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionCard
            title="Appearance"
            subtitle="Customize your visual experience"
          >
            <AppSegmentedControl
              label="Theme Mode"
              options={themeOptions}
              value={themeMode}
              onChange={(val) => setThemeMode(val as any)}
            />
          </SectionCard>
        </Animated.View>

        {/* Developer Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionCard title="Developer" subtitle="Crafted with ❤️ by Rabin">
            <View style={styles.devProfile}>
              <View style={[styles.avatar, { borderColor: colors.border }]}>
                <Ionicons
                  name="person"
                  size={32}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.devMeta}>
                <Typography variant="subheading">Rabin016</Typography>
                <Typography variant="caption">Full Stack Developer</Typography>
              </View>
            </View>
            <AppButton
              title="GitHub Profile"
              onPress={handleGithubPress}
              variant="secondary"
              icon={
                <Ionicons name="logo-github" size={18} color={colors.text} />
              }
            />
          </SectionCard>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <SectionCard title="About Insurance Calculator" accent>
            <Typography variant="body" style={styles.description}>
              InsurP is a professional-grade insurance premium calculator
              designed for Marine, Fire, and Motor transport. Built for accuracy
              and speed within the Bangladesh insurance sector.
            </Typography>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Typography variant="subheading" color="#F97316">
                  3+
                </Typography>
                <Typography variant="caption">Modules</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Typography variant="subheading" color="#F97316">
                  100%
                </Typography>
                <Typography variant="caption">Offline</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Typography variant="subheading" color="#F97316">
                  BD
                </Typography>
                <Typography variant="caption">Standards</Typography>
              </View>
            </View>
          </SectionCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <AppButton
            title="Share with Colleagues"
            onPress={handleShareApp}
            variant="ghost"
            style={styles.shareBtn}
            icon={
              <Ionicons name="share-social-outline" size={18} color="#F97316" />
            }
          />
        </Animated.View>

        <View style={styles.footer}>
          <Typography variant="caption" style={styles.copyright}>
            © 2026 InsurP. All rights reserved.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  version: {
    opacity: 0.7,
  },
  devProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  devMeta: {
    gap: 2,
  },
  description: {
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(156, 163, 175, 0.1)",
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  shareBtn: {
    marginTop: 10,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  copyright: {
    opacity: 0.5,
  },
});
