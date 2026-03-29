/**
 * FireScreen — Main Fire Insurance Premium Calculator screen.
 *
 * Updated with UI flow and refinements:
 * - Dynamic premises labels (e.g., "Shop 1") in form and results.
 * - Progressive focus flow using Enter/Submit keys.
 * - Reset button repositioned under Calculate.
 * - Final Premium Payable rounded to whole numbers.
 * - Dark theme flash fix already applied via root layout.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import AppSelect, { AppSelectRef } from "../components/ui/AppSelect";
import AppSlider from "../components/ui/AppSlider";
import SectionCard from "../components/ui/SectionCard";
import Typography from "../components/ui/Typography";

import { OCCUPANCY_TYPES, RISK_CLASSES } from "../constants/fireInsurance";
import {
  calculatePremium,
  calculateTSI,
  formatCurrency,
  getPremiumRate,
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
    isPercentage: true,
  };
}

const getLabel = (
  value: string | null,
  options: { label: string; value: string }[],
) => {
  return options.find((o) => o.value === value)?.label || "Premises";
};

// ─────────────────────────────────────────────────────────────────────────────
// PremisesCard
// ─────────────────────────────────────────────────────────────────────────────
interface PremisesCardProps {
  entry: PremisesEntry;
  index: number;
  totalCount: number;
  tsi: number;
  onUpdate: (id: string, updates: Partial<PremisesEntry>) => void;
  onRemove: (id: string) => void;
  // Focus refs
  riskRef: React.RefObject<AppSelectRef>;
  occRef: React.RefObject<AppSelectRef>;
  rateRef: React.RefObject<TextInput>;
  sumRef: React.RefObject<TextInput>;
}

function PremisesCard({
  entry,
  index,
  totalCount,
  tsi,
  onUpdate,
  onRemove,
  riskRef,
  occRef,
  rateRef,
  sumRef,
}: PremisesCardProps) {
  const occupancyLabel = getLabel(entry.occupancyType, OCCUPANCY_TYPES as any);
  const cardTitle = entry.occupancyType
    ? `${occupancyLabel} ${index + 1}`
    : `Premises ${index + 1}`;

  const handleRiskClassChange = (value: string) => {
    const riskClass = value as PremisesEntry["riskClass"];
    const rate = getPremiumRate(riskClass, entry.occupancyType);
    onUpdate(entry.id, {
      riskClass,
      premiumRate: rate > 0 ? rate.toString() : "",
    });
    // Automatically open next select
    setTimeout(() => occRef.current?.open(), 100);
  };

  const handleOccupancyChange = (value: string) => {
    const occupancyType = value as PremisesEntry["occupancyType"];
    const rate = getPremiumRate(entry.riskClass, occupancyType);
    onUpdate(entry.id, {
      occupancyType,
      premiumRate: rate > 0 ? rate.toString() : "",
    });
    // Focus manual rate if empty, else jump to sum insured
    setTimeout(() => {
      if (!rate) {
        rateRef.current?.focus();
      } else {
        sumRef.current?.focus();
      }
    }, 100);
  };

  const toggleMode = () => {
    onUpdate(entry.id, { isPercentage: !entry.isPercentage });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <SectionCard title={cardTitle} accent style={styles.premisesCard}>
        {totalCount > 1 && (
          <Pressable
            style={styles.removeBtnContainer}
            onPress={() => onRemove(entry.id)}
          >
            <View style={styles.removeBtnCircle}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </View>
          </Pressable>
        )}

        <AppSelect
          ref={riskRef}
          label="Risk Classification"
          options={RISK_CLASSES as any}
          value={entry.riskClass}
          onChange={handleRiskClassChange}
          placeholder="Select risk class"
        />

        <AppSelect
          ref={occRef}
          label="Occupancy Type"
          options={OCCUPANCY_TYPES as any}
          value={entry.occupancyType}
          onChange={handleOccupancyChange}
          placeholder="Select occupancy type"
        />

        <AppInput
          ref={rateRef}
          label="Premium Rate"
          value={entry.premiumRate}
          onChangeText={(v) => onUpdate(entry.id, { premiumRate: v })}
          suffix="%"
          placeholder="0.00"
          hint="Edit manually if needed"
          returnKeyType="next"
          onSubmitEditing={() => sumRef.current?.focus()}
        />

        <View style={styles.modeToggleRow}>
          <Typography variant="label">Calculate By:</Typography>
          <View style={styles.modeToggle}>
            <Pressable
              onPress={toggleMode}
              style={[
                styles.modeBtn,
                entry.isPercentage && styles.modeBtnActive,
              ]}
            >
              <Typography
                variant="caption"
                style={
                  entry.isPercentage ? styles.modeTextActive : styles.modeText
                }
              >
                %
              </Typography>
            </Pressable>
            <Pressable
              onPress={toggleMode}
              style={[
                styles.modeBtn,
                !entry.isPercentage && styles.modeBtnActive,
              ]}
            >
              <Typography
                variant="caption"
                style={
                  !entry.isPercentage ? styles.modeTextActive : styles.modeText
                }
              >
                Amount
              </Typography>
            </Pressable>
          </View>
        </View>

        <AppInput
          ref={sumRef}
          label={
            entry.isPercentage ? "Sum Insured Percentage" : "Sum Insured Amount"
          }
          value={entry.sumInsured}
          onChangeText={(text) => onUpdate(entry.id, { sumInsured: text })}
          prefix={entry.isPercentage ? undefined : "BDT"}
          suffix={entry.isPercentage ? "%" : undefined}
          placeholder={entry.isPercentage ? "100" : "0.00"}
          hint={
            entry.isPercentage
              ? `Of Total Sum Insured (BDT ${formatCurrency(tsi)})`
              : "Direct allocation"
          }
          returnKeyType="done"
        />
      </SectionCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({
  result,
  premises,
}: {
  result: PremiumResult;
  premises: PremisesEntry[];
}) {
  const roundedTotal = Math.round(result.totalPremium);

  return (
    <Animated.View entering={SlideInDown.duration(400).springify()}>
      <SectionCard
        title="Calculation Result"
        subtitle="Rounded to nearest BDT"
        style={styles.resultCard}
      >
        <View style={styles.resultIcon}>
          <Ionicons name="receipt-outline" size={28} color="#F97316" />
        </View>

        <ResultRow
          label="Total Sum Insured"
          value={`BDT ${formatCurrency(result.totalSumInsured)}`}
        />

        <View style={styles.breakdownHeader}>
          <Typography variant="caption" style={styles.breakdownLabel}>
            Premium Breakdown
          </Typography>
        </View>

        {result.premisesResults.map((pr, idx) => {
          const occLabel = getLabel(
            premises[idx]?.occupancyType,
            OCCUPANCY_TYPES as any,
          );
          const label = premises[idx]?.occupancyType
            ? `${occLabel} ${idx + 1}`
            : `Premises ${idx + 1}`;

          return (
            <View key={pr.id} style={styles.premisesResultRow}>
              <View style={styles.premisesResultInfo}>
                <Typography variant="caption" color="#9CA3AF">
                  {label} ({pr.rate}%)
                </Typography>
                <Typography variant="caption" color="#4B5563">
                  Value: BDT {formatCurrency(pr.sumInsured)}
                </Typography>
              </View>
              <Typography variant="body" style={styles.premisesResultValue}>
                BDT {formatCurrency(pr.netPremium)}
              </Typography>
            </View>
          );
        })}

        <View style={styles.divider} />
        <ResultRow
          label="Net Premium"
          value={`BDT ${formatCurrency(result.totalNetPremium)}`}
        />
        <ResultRow
          label="VAT (15%)"
          value={`BDT ${formatCurrency(result.vatAmount)}`}
        />
        <View style={styles.divider} />

        <View style={styles.netPremiumRow}>
          <Typography variant="subheading" style={styles.netLabel}>
            Total Amount
          </Typography>
          <Animated.View entering={ZoomIn.duration(400).delay(200)}>
            <Typography
              variant="mono"
              style={{ fontSize: 24, color: "#F97316" }}
            >
              BDT {roundedTotal.toLocaleString("en-BD")}
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
      <Typography variant="body" style={styles.resultLabel}>
        {label}
      </Typography>
      <Typography variant="body" style={styles.resultValue}>
        {value}
      </Typography>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FireScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function FireScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Refs for focus flow
  const limitRef = useRef<TextInput>(null);
  const toleranceRef = useRef<TextInput>(null);
  // Using an object to store refs for premises items dynamically
  const premisesRefs = useRef<
    Record<
      string,
      {
        risk: React.RefObject<AppSelectRef>;
        occ: React.RefObject<AppSelectRef>;
        rate: React.RefObject<TextInput>;
        sum: React.RefObject<TextInput>;
      }
    >
  >({});

  const [limitAmount, setLimitAmount] = useState("");
  const [bankTolerance, setBankTolerance] = useState("10");
  const [premises, setPremises] = useState<PremisesEntry[]>([newPremises()]);
  const [rsdEnabled, setRsdEnabled] = useState(false);
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const limitNum = parseFloat(limitAmount) || 0;
  const toleranceNum = parseFloat(bankTolerance) || 0;
  const tsi = calculateTSI(limitNum, toleranceNum);

  const handleUpdatePremises = useCallback(
    (id: string, updates: Partial<PremisesEntry>) => {
      setPremises((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const handleRemovePremises = useCallback((id: string) => {
    setPremises((prev) => prev.filter((p) => p.id !== id));
    delete premisesRefs.current[id];
    setResult(null);
  }, []);

  const handleAddPremises = () => {
    const p = newPremises();
    setPremises((prev) => [...prev, p]);
    setResult(null);
    // Focus first field of new premises
    setTimeout(() => premisesRefs.current[p.id]?.risk.current?.open(), 300);
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
      Alert.alert("Validation Error", "Limit Amount at least 1,00,000 BDT.");
      return;
    }
    const incomplete = premises.some((p) => !p.premiumRate || !p.sumInsured);
    if (incomplete) {
      Alert.alert("Validation Error", "Please fill all premises fields.");
      return;
    }

    let totalSI = 0;
    premises.forEach((p) => {
      const siVal = parseFloat(p.sumInsured) || 0;
      totalSI += p.isPercentage ? tsi * (siVal / 100) : siVal;
    });

    if (Math.abs(totalSI - tsi) > 1) {
      Alert.alert(
        "Validation Error",
        `Total (${formatCurrency(totalSI)}) must equal Total Sum Insured (${formatCurrency(tsi)}).`,
      );
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = calculatePremium(
        premises,
        limitNum,
        toleranceNum,
        rsdEnabled,
      );
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
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.fireIconBadge}>
                <Ionicons name="flame" size={20} color="#F97316" />
              </View>
              <View>
                <Typography variant="caption" style={styles.headerSubtitle}>
                  PREMIUM CALCULATOR
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
            { paddingBottom: insets.bottom + 60 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(350).delay(100)}>
            <SectionCard title="Basic Information" accent>
              <AppInput
                ref={limitRef}
                label="Limit Amount"
                value={limitAmount}
                onChangeText={(v) => {
                  setLimitAmount(v);
                  setResult(null);
                }}
                prefix="BDT"
                placeholder="500,000"
                hint="Min 1,00,000 BDT"
                returnKeyType="next"
                onSubmitEditing={() => toleranceRef.current?.focus()}
              />
              <AppInput
                ref={toleranceRef}
                label="Bank Tolerance"
                value={bankTolerance}
                onChangeText={(v) => {
                  setBankTolerance(v);
                  setResult(null);
                }}
                suffix="%"
                placeholder="10"
                hint={
                  limitNum > 0
                    ? `Total Sum Insured: BDT ${formatCurrency(tsi)}`
                    : "Added to limit"
                }
                returnKeyType="next"
                onSubmitEditing={() => {
                  const firstP = premises[0];
                  if (firstP)
                    premisesRefs.current[firstP.id]?.risk.current?.open();
                }}
              />
            </SectionCard>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Typography variant="subheading">Premises Occupations</Typography>
            </View>
          </View>

          {premises.map((entry, index) => {
            // Initialize refs for this entry if not exists
            if (!premisesRefs.current[entry.id]) {
              premisesRefs.current[entry.id] = {
                risk: React.createRef<AppSelectRef>(),
                occ: React.createRef<AppSelectRef>(),
                rate: React.createRef<TextInput>(),
                sum: React.createRef<TextInput>(),
              };
            }
            const refs = premisesRefs.current[entry.id]!;

            return (
              <PremisesCard
                key={entry.id}
                entry={entry}
                index={index}
                totalCount={premises.length}
                tsi={tsi}
                onUpdate={handleUpdatePremises}
                onRemove={handleRemovePremises}
                riskRef={refs.risk}
                occRef={refs.occ}
                rateRef={refs.rate}
                sumRef={refs.sum}
              />
            );
          })}

          <AppButton
            title="+ Add Another Premises"
            onPress={handleAddPremises}
            variant="secondary"
          />

          <SectionCard style={styles.rsdCard}>
            <AppSlider
              value={rsdEnabled}
              onChange={(v) => {
                setRsdEnabled(v);
                setResult(null);
              }}
              label="Riots, Strikes & Damage"
              description="Coverage at 0.13% rate"
            />
          </SectionCard>

          <View style={styles.actionButtons}>
            <AppButton
              title="Calculate Premium"
              onPress={handleCalculate}
              variant="primary"
              loading={isCalculating}
              icon={<Ionicons name="calculator" size={18} color="#fff" />}
            />
            <View style={styles.resetButtonWrap}>
              <AppButton
                title="Reset Form"
                onPress={handleReset}
                variant="ghost"
                disabled={isCalculating}
              />
            </View>
          </View>

          {result && <ResultCard result={result} premises={premises} />}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0D1117" },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  headerTitle: { fontSize: 22 },
  headerBorder: {
    height: 1,
    backgroundColor: "#1F2937",
    marginHorizontal: -20,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -4,
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F97316",
  },
  premisesCard: { position: "relative" },
  removeBtnContainer: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  removeBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  modeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2D3748",
    padding: 2,
  },
  modeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  modeBtnActive: { backgroundColor: "#F97316" },
  modeText: { color: "#9CA3AF" },
  modeTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  rsdCard: { marginTop: 4 },
  actionButtons: { gap: 12, marginTop: 8 },
  resetButtonWrap: { marginTop: 4 },
  resultCard: {
    borderColor: "rgba(249,115,22,0.3)",
    backgroundColor: "#1A1F2E",
    marginTop: 12,
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
  resultLabel: { color: "#9CA3AF", flex: 1 },
  resultValue: { color: "#E5E7EB", fontFamily: "Inter_500Medium" },
  breakdownHeader: { marginTop: 12, marginBottom: 6 },
  breakdownLabel: {
    color: "#F97316",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  premisesResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  premisesResultInfo: { flex: 1 },
  premisesResultValue: { color: "#F9FAFB", fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, backgroundColor: "#2D3748", marginVertical: 10 },
  netPremiumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  netLabel: { color: "#F9FAFB" },
});
