/**
 * FireScreen — Main Fire Insurance Premium Calculator screen.
 *
 * Updated with logic from formula.md & user feedback:
 * - KeyboardAvoidingView for Android visibility.
 * - Abbreviations replaced with full terms (Total Sum Insured, Riots, Strikes & Damage).
 * - Default Sum Insured mode is Percentage (true).
 * - Beautiful Trash/Delete button.
 * - Form Reset functionality.
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppInput from "../components/ui/AppInput";
import AppSelect from "../components/ui/AppSelect";
import AppButton from "../components/ui/AppButton";
import AppSlider from "../components/ui/AppSlider";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import { OCCUPANCY_TYPES, RISK_CLASSES } from "../constants/fireInsurance";
import {
  calculatePremium,
  formatCurrency,
  getPremiumRate,
  calculateTSI,
  PremisesEntry,
  PremiumResult,
} from "../utils/fireCalculations";

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function newPremises(): PremisesEntry {
  return {
    id: generateId(),
    riskClass: null,
    occupancyType: null,
    premiumRate: "",
    sumInsured: "",
    isPercentage: true, // DEFAULT: Percentage mode (User request)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PremisesCard — Individual premises occupation block
// ─────────────────────────────────────────────────────────────────────────────
interface PremisesCardProps {
  entry: PremisesEntry;
  index: number;
  totalCount: number;
  tsi: number;
  onUpdate: (id: string, updates: Partial<PremisesEntry>) => void;
  onRemove: (id: string) => void;
}

function PremisesCard({
  entry,
  index,
  totalCount,
  tsi,
  onUpdate,
  onRemove,
}: PremisesCardProps) {
  const handleRiskClassChange = (value: string) => {
    const riskClass = value as PremisesEntry["riskClass"];
    const rate = getPremiumRate(riskClass, entry.occupancyType);
    onUpdate(entry.id, { riskClass, premiumRate: rate > 0 ? rate.toString() : "" });
  };

  const handleOccupancyChange = (value: string) => {
    const occupancyType = value as PremisesEntry["occupancyType"];
    const rate = getPremiumRate(entry.riskClass, occupancyType);
    onUpdate(entry.id, { occupancyType, premiumRate: rate > 0 ? rate.toString() : "" });
  };

  const toggleMode = () => {
    onUpdate(entry.id, { isPercentage: !entry.isPercentage });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <SectionCard
        title={`Premises ${index + 1}`}
        accent
        style={styles.premisesCard}
      >
        {/* Beautiful Remove button */}
        {totalCount > 1 && (
          <Pressable
            style={styles.removeBtnContainer}
            onPress={() => onRemove(entry.id)}
            accessibilityLabel={`Remove Premises ${index + 1}`}
          >
            <View style={styles.removeBtnCircle}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </View>
          </Pressable>
        )}

        {/* Risk Classification */}
        <AppSelect
          label="Risk Classification"
          options={RISK_CLASSES as unknown as { label: string; value: string }[]}
          value={entry.riskClass}
          onChange={handleRiskClassChange}
          placeholder="Select risk class"
        />

        {/* Occupancy Type */}
        <AppSelect
          label="Occupancy Type"
          options={OCCUPANCY_TYPES as unknown as { label: string; value: string }[]}
          value={entry.occupancyType}
          onChange={handleOccupancyChange}
          placeholder="Select occupancy type"
        />

        {/* Premium Rate — Editable */}
        <AppInput
          label="Premium Rate"
          value={entry.premiumRate}
          onChangeText={(v) => onUpdate(entry.id, { premiumRate: v })}
          suffix="%"
          placeholder="0.00"
          hint="Edit manually or select class/occupancy above"
        />

        {/* Sum Insured Mode Toggle */}
        <View style={styles.modeToggleRow}>
          <Typography variant="label">Calculate By:</Typography>
          <View style={styles.modeToggle}>
            <Pressable 
              onPress={toggleMode}
              style={[styles.modeBtn, entry.isPercentage && styles.modeBtnActive]}
            >
              <Typography variant="caption" style={entry.isPercentage ? styles.modeTextActive : styles.modeText}>
                Percentage (%)
              </Typography>
            </Pressable>
            <Pressable 
              onPress={toggleMode}
              style={[styles.modeBtn, !entry.isPercentage && styles.modeBtnActive]}
            >
              <Typography variant="caption" style={!entry.isPercentage ? styles.modeTextActive : styles.modeText}>
                Amount (BDT)
              </Typography>
            </Pressable>
          </View>
        </View>

        {/* Sum Insured */}
        <AppInput
          label={entry.isPercentage ? "Sum Insured Percentage" : "Sum Insured Amount"}
          value={entry.sumInsured}
          onChangeText={(text) => onUpdate(entry.id, { sumInsured: text })}
          prefix={entry.isPercentage ? undefined : "BDT"}
          suffix={entry.isPercentage ? "%" : undefined}
          placeholder={entry.isPercentage ? "100" : "0.00"}
          hint={
            entry.isPercentage 
              ? `Based on Total Sum Insured (BDT ${formatCurrency(tsi)})`
              : `Portion of Total Sum Insured (BDT ${formatCurrency(tsi)})`
          }
        />
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard — Displays results (no shortcuts)
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: PremiumResult }) {
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard
        title="Calculation Result"
        subtitle="Verified against commercial insurance standards"
        style={styles.resultCard}
      >
        <View style={styles.resultIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#F97316" />
        </View>

        <ResultRow label="Total Sum Insured" value={`BDT ${formatCurrency(result.totalSumInsured)}`} />
        
        {/* Detailed breakdown per premises */}
        <View style={styles.breakdownHeader}>
          <Typography variant="caption" style={styles.breakdownLabel}>Breakdown per Premises</Typography>
        </View>
        
        {result.premisesResults.map((pr, idx) => (
          <View key={pr.id} style={styles.premisesResultRow}>
            <View style={styles.premisesResultInfo}>
              <Typography variant="caption" color="#9CA3AF">Premises {idx + 1} ({pr.rate}%)</Typography>
              <Typography variant="caption" color="#4B5563">Value: BDT {formatCurrency(pr.sumInsured)}</Typography>
            </View>
            <Typography variant="body" style={styles.premisesResultValue}>
              BDT {formatCurrency(pr.netPremium)}
            </Typography>
          </View>
        ))}

        <View style={styles.divider} />

        <ResultRow label="Total Net Premium" value={`BDT ${formatCurrency(result.totalNetPremium)}`} />
        <ResultRow label="VAT (15%)" value={`BDT ${formatCurrency(result.vatAmount)}`} />

        <View style={styles.divider} />

        <View style={styles.netPremiumRow}>
          <Typography variant="subheading" style={styles.netLabel}>
            Total Premium Payable
          </Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono">
              BDT {formatCurrency(result.totalPremium)}
            </Typography>
          </Animated.View>
        </View>
      </SectionCard>
    </Animated.View>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Typography variant="body" style={styles.resultLabel}>{label}</Typography>
      <Typography variant="body" style={styles.resultValue}>{value}</Typography>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FireScreen — Main screen component
// ─────────────────────────────────────────────────────────────────────────────
export default function FireScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Form state
  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("10"); // Default 10%
  const [premises, setPremises] = useState<PremisesEntry[]>([newPremises()]);
  const [rsdEnabled, setRsdEnabled] = useState(false);
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Computed Total Sum Insured
  const limitNum = parseFloat(limitAmount) || 0;
  const toleranceNum = parseFloat(bankTolerance) || 0;
  const tsi = calculateTSI(limitNum, toleranceNum);

  const handleUpdatePremises = useCallback(
    (id: string, updates: Partial<PremisesEntry>) => {
      setPremises((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const handleRemovePremises = useCallback((id: string) => {
    setPremises((prev) => prev.filter((p) => p.id !== id));
    setResult(null);
  }, []);

  const handleAddPremises = () => {
    setPremises((prev) => [...prev, newPremises()]);
    setResult(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleReset = () => {
    setLimitAmount("");
    setBankTolerance("10");
    setPremises([newPremises()]);
    setRsdEnabled(false);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCalculate = () => {
    const limitVal = parseFloat(limitAmount) || 0;
    if (limitVal < 100000) {
      Alert.alert("Validation Error", "Limit Amount must be at least 1,0,0,000 BDT (1 Lac).");
      return;
    }

    const incomplete = premises.some(p => !p.premiumRate || !p.sumInsured);
    if (incomplete) {
      Alert.alert("Validation Error", "Please provide Premium Rate and Sum Insured for all premises.");
      return;
    }

    // Validation for Sum Insured totals vs Total Sum Insured
    let totalSumInsured = 0;
    premises.forEach(p => {
      const siVal = parseFloat(p.sumInsured) || 0;
      totalSumInsured += p.isPercentage ? (tsi * (siVal / 100)) : siVal;
    });

    // Check if it matches TSI
    const diff = Math.abs(totalSumInsured - tsi);
    if (diff > 1) {
      Alert.alert(
        "Validation Error", 
        `The total of all premises (BDT ${formatCurrency(totalSumInsured)}) must equal the Total Sum Insured (BDT ${formatCurrency(tsi)}).\n\nPlease adjust the percentages or amounts.`
      );
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calculatePremium(premises, limitNum, toleranceNum, rsdEnabled);
      setResult(res);
      setIsCalculating(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.fireIconBadge}>
                <Ionicons name="flame" size={20} color="#F97316" />
              </View>
              <View>
                <Typography variant="caption" style={styles.headerSubtitle}>
                  INSURP PREMIUM CALCULATOR
                </Typography>
                <Typography variant="heading" style={styles.headerTitle}>
                  Fire Insurance
                </Typography>
              </View>
            </View>
          </View>
          <View style={styles.headerBorder} />
        </Animated.View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Basic Information" accent>
              <AppInput
                label="Limit Amount"
                value={limitAmount}
                onChangeText={(v) => { setLimitAmount(v); setResult(null); }}
                prefix="BDT"
                placeholder="500,000"
                hint="Minimum 1,00,000 BDT"
              />
              <AppInput
                label="Bank Tolerance"
                value={bankTolerance}
                onChangeText={(v) => { setBankTolerance(v); setResult(null); }}
                suffix="%"
                placeholder="10"
                hint={limitNum > 0 ? `Total Sum Insured: BDT ${formatCurrency(tsi)}` : "Percentage added to limit"}
              />
            </SectionCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(350).delay(180)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />
                <Typography variant="subheading">Premises Occupations</Typography>
              </View>
            </View>
          </Animated.View>

          {premises.map((entry, index) => (
            <PremisesCard
              key={entry.id}
              entry={entry}
              index={index}
              totalCount={premises.length}
              tsi={tsi}
              onUpdate={handleUpdatePremises}
              onRemove={handleRemovePremises}
            />
          ))}

          <Animated.View entering={FadeInDown.duration(300).delay(250)}>
            <AppButton
              title="+ Add Another Premises"
              onPress={handleAddPremises}
              variant="secondary"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(350).delay(300)}>
            <SectionCard style={styles.rsdCard}>
              <AppSlider
                value={rsdEnabled}
                onChange={(v) => { setRsdEnabled(v); setResult(null); }}
                label="Riots, Strikes & Damage"
                description="Coverage at 0.13% rate"
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.actionButtons}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Calculate"
                onPress={handleCalculate}
                variant="primary"
                loading={isCalculating}
                icon={<Ionicons name="calculator" size={18} color="#fff" />}
              />
            </View>
            <View style={{ width: 100 }}>
              <AppButton
                title="Reset"
                onPress={handleReset}
                variant="ghost"
                disabled={isCalculating}
              />
            </View>
          </View>

          {result && <ResultCard result={result} />}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D1117" },
  header: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#0D1117" },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  fireIconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  headerSubtitle: { color: "#F97316", letterSpacing: 1.2, fontSize: 10, marginBottom: 2 },
  headerTitle: { fontSize: 22 },
  headerBorder: { height: 1, backgroundColor: "#1F2937", marginHorizontal: -20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: -4, marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F97316" },
  premisesCard: { position: "relative" },
  removeBtnContainer: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  removeBtnCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(239, 68, 68, 0.1)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)" },
  modeToggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#1F2937" },
  modeToggle: { flexDirection: "row", backgroundColor: "#0F172A", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#2D3748", padding: 2 },
  modeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  modeBtnActive: { backgroundColor: "#F97316" },
  modeText: { color: "#9CA3AF" },
  modeTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  rsdCard: { marginTop: 4 },
  actionButtons: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 8, alignItems: "center" },
  resultCard: { borderColor: "rgba(249,115,22,0.3)", backgroundColor: "#1A1F2E", marginTop: 12 },
  resultIcon: { alignSelf: "center", marginBottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(249,115,22,0.12)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)", alignItems: "center", justifyContent: "center" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  resultLabel: { color: "#9CA3AF", flex: 1 },
  resultValue: { color: "#E5E7EB", fontFamily: "Inter_500Medium" },
  breakdownHeader: { marginTop: 12, marginBottom: 6 },
  breakdownLabel: { color: "#F97316", textTransform: "uppercase", letterSpacing: 1, fontSize: 11 },
  premisesResultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: "#1F2937" },
  premisesResultInfo: { flex: 1 },
  premisesResultValue: { color: "#F9FAFB", fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 10 },
  netPremiumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  netLabel: { color: "#F9FAFB" },
  disclaimer: { marginTop: 14, textAlign: "center", color: "#4B5563", lineHeight: 18 },
});
