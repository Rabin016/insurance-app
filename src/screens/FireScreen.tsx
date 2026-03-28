/**
 * FireScreen — Main Fire Insurance Premium Calculator screen.
 *
 * Features:
 * - Limit Amount & Bank Tolerance inputs
 * - Dynamic Premises Occupations (add/remove multiple)
 * - Auto-fill premium rate from risk class + occupancy type selection
 * - Sum insured validation against cap (LimitAmount × (1 - BankTolerance%))
 * - RSD Coverage toggle
 * - Calculate Premium button
 * - Animated result card with demo values
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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
  getMaxSumInsured,
  PremisesEntry,
  PremiumResult,
} from "../utils/fireCalculations";

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Simple unique ID generator without external deps */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/** Create a fresh empty premises entry */
function newPremises(): PremisesEntry {
  return {
    id: generateId(),
    riskClass: null,
    occupancyType: null,
    premiumRate: 0,
    sumInsured: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PremisesCard — Individual premises occupation block
// ─────────────────────────────────────────────────────────────────────────────
interface PremisesCardProps {
  entry: PremisesEntry;
  index: number;
  totalCount: number;
  sumInsuredCap: number;
  onUpdate: (id: string, updates: Partial<PremisesEntry>) => void;
  onRemove: (id: string) => void;
}

function PremisesCard({
  entry,
  index,
  totalCount,
  sumInsuredCap,
  onUpdate,
  onRemove,
}: PremisesCardProps) {
  const handleRiskClassChange = (value: string) => {
    const riskClass = value as PremisesEntry["riskClass"];
    const rate = getPremiumRate(riskClass, entry.occupancyType);
    onUpdate(entry.id, { riskClass, premiumRate: rate });
  };

  const handleOccupancyChange = (value: string) => {
    const occupancyType = value as PremisesEntry["occupancyType"];
    const rate = getPremiumRate(entry.riskClass, occupancyType);
    onUpdate(entry.id, { occupancyType, premiumRate: rate });
  };

  const rateDisplay = entry.premiumRate > 0 ? entry.premiumRate.toString() : "";

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <SectionCard
        title={`Premises ${index + 1}`}
        accent
        style={styles.premisesCard}
      >
        {/* Remove button (only shown when >1 premises exist) */}
        {totalCount > 1 && (
          <Pressable
            style={styles.removeBtn}
            onPress={() => onRemove(entry.id)}
            accessibilityLabel={`Remove Premises ${index + 1}`}
          >
            <Ionicons name="close-circle" size={22} color="#EF4444" />
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

        {/* Premium Rate — auto filled, read-only */}
        <AppInput
          label="Premium Rate"
          value={rateDisplay}
          onChangeText={() => {}}
          suffix="%"
          readOnly
          placeholder="—"
          hint={
            entry.riskClass && entry.occupancyType
              ? "Auto-filled based on class & occupancy"
              : "Select class & occupancy type first"
          }
        />

        {/* Sum Insured */}
        <AppInput
          label="Sum Insured"
          value={entry.sumInsured}
          onChangeText={(text) => onUpdate(entry.id, { sumInsured: text })}
          prefix="BDT"
          placeholder="0.00"
          hint={
            sumInsuredCap > 0
              ? `Max cap: BDT ${formatCurrency(sumInsuredCap)}`
              : "Enter Limit Amount to see cap"
          }
        />
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard — Animated premium result display (demo values)
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: PremiumResult }) {
  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard
        title="Premium Estimate"
        subtitle="Demo values — formula will be updated later"
        style={styles.resultCard}
      >
        {/* Decorative fire icon */}
        <View style={styles.resultIcon}>
          <Ionicons name="flame" size={28} color="#F97316" />
        </View>

        {/* Result rows */}
        <ResultRow label="Total Sum Insured" value={`BDT ${formatCurrency(result.totalSumInsured)}`} />
        <ResultRow label="Base Premium" value={`BDT ${formatCurrency(result.basePremium)}`} />
        <ResultRow label="RSD Surcharge" value={`BDT ${formatCurrency(result.rsdSurcharge)}`} />
        <ResultRow label="VAT (15% — Demo)" value={`BDT ${formatCurrency(result.vatAmount)}`} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Net Premium — Highlighted */}
        <View style={styles.netPremiumRow}>
          <Typography variant="subheading" style={styles.netLabel}>
            Net Premium
          </Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography variant="mono">
              BDT {formatCurrency(result.netPremium)}
            </Typography>
          </Animated.View>
        </View>

        {/* Disclaimer */}
        <Typography variant="caption" style={styles.disclaimer}>
          This estimate is based on demo calculation logic. Final premium subject to underwriting approval.
        </Typography>
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
// FireScreen — Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function FireScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Form state
  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("");
  const [premises, setPremises] = useState<PremisesEntry[]>([newPremises()]);
  const [rsdEnabled, setRsdEnabled] = useState(false);
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Computed cap for sum insured
  const limitNum = parseFloat(limitAmount) || 0;
  const toleranceNum = parseFloat(bankTolerance) || 0;
  const sumInsuredCap = getMaxSumInsured(limitNum, toleranceNum);

  // Update a specific premises entry
  const handleUpdatePremises = useCallback(
    (id: string, updates: Partial<PremisesEntry>) => {
      setPremises((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  // Remove a premises entry
  const handleRemovePremises = useCallback((id: string) => {
    setPremises((prev) => prev.filter((p) => p.id !== id));
    // Clear result since inputs changed
    setResult(null);
  }, []);

  // Add new premises entry
  const handleAddPremises = () => {
    setPremises((prev) => [...prev, newPremises()]);
    setResult(null);
    // Scroll down after adding
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Validate and calculate premium
  const handleCalculate = () => {
    // Validate: limit amount required
    if (!limitAmount || limitNum <= 0) {
      Alert.alert("Validation", "Please enter a valid Limit Amount.");
      return;
    }

    // Validate: each premises must have class and occupancy
    const incomplete = premises.some(
      (p) => !p.riskClass || !p.occupancyType || !p.sumInsured
    );
    if (incomplete) {
      Alert.alert(
        "Validation",
        "Please complete all Premises Occupation fields (Risk Class, Occupancy Type, Sum Insured)."
      );
      return;
    }

    // Validate: total sum insured vs cap
    const total = premises.reduce(
      (sum, p) => sum + (parseFloat(p.sumInsured) || 0),
      0
    );
    if (sumInsuredCap > 0 && total > sumInsuredCap) {
      Alert.alert(
        "Validation",
        `Total Sum Insured (BDT ${formatCurrency(total)}) exceeds the allowable cap of BDT ${formatCurrency(sumInsuredCap)}.\n\nCap = Limit Amount × (1 - Bank Tolerance%)`
      );
      return;
    }

    // Run calculation
    setIsCalculating(true);
    setTimeout(() => {
      const premiumResult = calculatePremium(premises, rsdEnabled);
      setResult(premiumResult);
      setIsCalculating(false);
      // Scroll to result
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }, 600); // slight delay for UX
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.fireIconBadge}>
              <Ionicons name="flame" size={20} color="#F97316" />
            </View>
            <View>
              <Typography variant="caption" style={styles.headerSubtitle}>
                INSURANCE PREMIUM CALCULATOR
              </Typography>
              <Typography variant="heading" style={styles.headerTitle}>
                Fire Insurance
              </Typography>
            </View>
          </View>
        </View>

        {/* Decorative gradient header line */}
        <View style={styles.headerBorder} />
      </Animated.View>

      {/* ── Scrollable form ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section 1: Policy Limits ── */}
        <Animated.View entering={FadeInDown.duration(350).delay(100)}>
          <SectionCard title="Policy Limits" subtitle="Set the financial boundaries" accent>
            <AppInput
              label="Limit Amount"
              value={limitAmount}
              onChangeText={(v) => {
                setLimitAmount(v);
                setResult(null);
              }}
              prefix="BDT"
              placeholder="0.00"
              hint="Maximum insurable value"
            />
            <AppInput
              label="Bank Tolerance"
              value={bankTolerance}
              onChangeText={(v) => {
                setBankTolerance(v);
                setResult(null);
              }}
              suffix="%"
              placeholder="0.00"
              hint={
                limitNum > 0 && toleranceNum > 0
                  ? `Allowable sum insured cap: BDT ${formatCurrency(sumInsuredCap)}`
                  : "Percentage deducted from Limit Amount"
              }
            />
          </SectionCard>
        </Animated.View>

        {/* ── Section 2: Premises Occupations (dynamic) ── */}
        <Animated.View entering={FadeInDown.duration(350).delay(180)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Typography variant="subheading">Premises Occupations</Typography>
            </View>
            <Typography variant="caption" style={styles.sectionHint}>
              {premises.length} premises added
            </Typography>
          </View>
        </Animated.View>

        {/* Premises cards */}
        {premises.map((entry, index) => (
          <PremisesCard
            key={entry.id}
            entry={entry}
            index={index}
            totalCount={premises.length}
            sumInsuredCap={sumInsuredCap}
            onUpdate={handleUpdatePremises}
            onRemove={handleRemovePremises}
          />
        ))}

        {/* Add Another Premises button */}
        <Animated.View entering={FadeInDown.duration(300).delay(250)}>
          <AppButton
            title="+ Add Another Premises"
            onPress={handleAddPremises}
            variant="secondary"
          />
        </Animated.View>

        {/* ── Section 3: RSD Coverage ── */}
        <Animated.View entering={FadeInDown.duration(350).delay(300)}>
          <SectionCard style={styles.rsdCard}>
            <AppSlider
              value={rsdEnabled}
              onChange={(v) => {
                setRsdEnabled(v);
                setResult(null);
              }}
              label="RSD Coverage"
              description="Riots, Strikes & Damage protection"
            />
          </SectionCard>
        </Animated.View>

        {/* ── Calculate Button ── */}
        <Animated.View entering={FadeInDown.duration(350).delay(380)}>
          <View style={styles.calculateBtnWrap}>
            <AppButton
              title="Calculate Premium"
              onPress={handleCalculate}
              variant="primary"
              loading={isCalculating}
              icon={<Ionicons name="calculator" size={18} color="#fff" />}
            />
          </View>
        </Animated.View>

        {/* ── Result Card ── */}
        {result && <ResultCard result={result} />}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
    backgroundColor: "#0D1117",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fireIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(249,115,22,0.15)",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    color: "#F97316",
    letterSpacing: 1.2,
    fontSize: 10,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerBorder: {
    height: 1,
    backgroundColor: "#1F2937",
    marginHorizontal: -20,
  },
  // Scroll area
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 4,
  },
  // Sections
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  sectionHint: {
    color: "#F97316",
    fontFamily: "Inter_500Medium",
  },
  // Premises
  premisesCard: {
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 2,
  },
  // RSD
  rsdCard: {
    marginTop: 4,
  },
  // Calculate button
  calculateBtnWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  // Result card
  resultCard: {
    borderColor: "rgba(249,115,22,0.3)",
    backgroundColor: "#1A1F2E",
  },
  resultIcon: {
    alignSelf: "center",
    marginBottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(249,115,22,0.12)",
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  resultLabel: {
    color: "#9CA3AF",
    flex: 1,
  },
  resultValue: {
    color: "#E5E7EB",
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#2D3748",
    marginVertical: 10,
  },
  netPremiumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  netLabel: {
    color: "#F9FAFB",
  },
  disclaimer: {
    marginTop: 14,
    textAlign: "center",
    color: "#4B5563",
    lineHeight: 18,
  },
});
